import { Express } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-enterprise-secret-key-2025';

export function setupAuthAPI(app: Express) {
  // Endpoint to get current user with permissions
  app.get('/api/auth/user', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Extract user data from SaaS token
      const userId = decoded.userId || decoded.id;
      const orgId = decoded.organizationId || decoded.org;
      const role = decoded.role || 'user';
      
      // Get organization and user details from database
      const { enterpriseSaasSystem } = await import('./saas-enterprise');
      let userEmail = decoded.email;
      
      // If no email in token, try to get from database
      if (!userEmail && userId) {
        try {
          const dbUser = await enterpriseSaasSystem.getUserById(userId);
          userEmail = dbUser?.email || `user_${userId}@example.com`;
        } catch (error) {
          userEmail = `user_${userId}@example.com`;
        }
      }
      
      // Map role to RBAC levels and permissions
      const getRoleData = (role: string) => {
        const roleMapping = {
          'organization_admin': {
            roleId: 'service_provider_admin',
            roleName: 'Service Provider Admin',
            roleNameAr: 'مدير مقدم الخدمة',
            roleLevel: 2,
            permissions: ['dashboard:read', 'users:manage', 'settings:read', 'reports:read', 'rbac:manage']
          },
          'admin': {
            roleId: 'system_super_admin',
            roleName: 'System Super Admin',
            roleNameAr: 'مدير النظام الرئيسي',
            roleLevel: 1,
            permissions: ['*:*']
          },
          'user': {
            roleId: 'client_account_manager',
            roleName: 'Client Account Manager',
            roleNameAr: 'مدير حساب العميل',
            roleLevel: 3,
            permissions: ['dashboard:read', 'settings:read']
          }
        };

        return roleMapping[role as keyof typeof roleMapping] || roleMapping['user'];
      };

      const roleData = getRoleData(role);
      
      const user = {
        id: userId,
        email: userEmail,
        ...roleData,
        organizationId: orgId
      };
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  console.log('✅ Auth API configured successfully');
}