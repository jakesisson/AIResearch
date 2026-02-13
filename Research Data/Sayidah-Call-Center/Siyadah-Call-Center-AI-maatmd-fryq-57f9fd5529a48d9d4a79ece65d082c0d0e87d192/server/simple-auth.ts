import { Express } from 'express';
import jwt from 'jsonwebtoken';

// استخدام نفس JWT_SECRET المستخدم في SaaS
const JWT_SECRET = process.env.JWT_SECRET || 'saas-enterprise-secret-key-2025';

export function setupSimpleAuth(app: Express) {
  // نقطة نهاية بسيطة للحصول على بيانات المستخدم
  app.get('/api/auth/user', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // فك تشفير بدون التحقق من التوقيع لاستخراج البيانات
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // فك تشفير payload بدون التحقق من التوقيع
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      // التحقق من انتهاء الصلاحية
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token expired');
      }

      const decoded = payload;
      
      // إرجاع بيانات المستخدم مع الصلاحيات
      const user = {
        id: decoded.userId,
        email: decoded.email || `user_${decoded.userId}@demo.com`,
        roleId: 'service_provider_admin',
        roleName: 'Service Provider Admin',
        roleNameAr: 'مدير مقدم الخدمة',
        roleLevel: 2,
        organizationId: decoded.organizationId,
        permissions: ['dashboard:read', 'users:manage', 'settings:read', 'reports:read', 'rbac:manage']
      };

      res.json(user);
    } catch (error) {
      console.error('Simple Auth error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  console.log('✅ Simple Auth API configured');
}