import { Router, Request, Response } from 'express';
import { rbacService, AuthenticatedRequest } from '../rbac-service';
import { insertUserSchema, roleHierarchy, RoleType } from '../../shared/rbac-schema';
import { z } from 'zod';

const router = Router();

// Authentication endpoints
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const result = await rbacService.authenticateUser(email, password);
    
    if (result.success) {
      res.json({
        success: true,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          firstName: result.user!.firstName,
          lastName: result.user!.lastName,
          role: result.user!.role,
          organizationId: result.user!.organizationId
        },
        token: result.token,
        permissions: await rbacService.getUserPermissions(result.user!.id)
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في النظام'
    });
  }
});

router.post('/auth/logout', rbacService.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      await rbacService.invalidateSession(token);
    }
    
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تسجيل الخروج'
    });
  }
});

// User management endpoints
router.get('/users', 
  rbacService.authenticateToken, 
  rbacService.requirePermission('users:read'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Implementation depends on your storage layer
      res.json({
        success: true,
        users: [], // Fetch from storage
        total: 0
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب بيانات المستخدمين'
      });
    }
  }
);

const createUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'الاسم الأول مطلوب'),
  lastName: z.string().min(1, 'الاسم الأخير مطلوب'),
  role: z.enum(['SYSTEM_SUPER_ADMIN', 'SERVICE_PROVIDER_ADMIN', 'CLIENT_ACCOUNT_MANAGER', 'SUPERVISOR', 'AGENT_EMPLOYEE', 'EXTERNAL_CLIENT_VIEW']),
  organizationId: z.number().optional(),
  departmentId: z.number().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتان",
  path: ["confirmPassword"]
});

router.post('/users',
  rbacService.authenticateToken,
  rbacService.requirePermission('users:create'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      
      // Check if current user can create users with this role
      if (!rbacService.canManageRole(req.user!.role, validatedData.role)) {
        return res.status(403).json({
          success: false,
          error: 'ليس لديك صلاحية لإنشاء مستخدم بهذا الدور'
        });
      }

      const result = await rbacService.createUser(validatedData, req.user!.id);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          user: {
            id: result.user!.id,
            email: result.user!.email,
            firstName: result.user!.firstName,
            lastName: result.user!.lastName,
            role: result.user!.role,
            organizationId: result.user!.organizationId,
            isActive: result.user!.isActive
          }
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صحيحة',
          details: error.errors
        });
      } else {
        console.error('Create user error:', error);
        res.status(500).json({
          success: false,
          error: 'خطأ في إنشاء المستخدم'
        });
      }
    }
  }
);

router.put('/users/:id/role',
  rbacService.authenticateToken,
  rbacService.requirePermission('users:update'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!Object.keys(roleHierarchy).includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'دور غير صحيح'
        });
      }

      const result = await rbacService.updateUserRole(userId, role as RoleType, req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تحديث دور المستخدم'
      });
    }
  }
);

// Permission management endpoints
router.get('/permissions/my',
  rbacService.authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const permissions = await rbacService.getUserPermissions(req.user!.id);
      res.json({
        success: true,
        permissions,
        role: req.user!.role,
        roleInfo: roleHierarchy[req.user!.role]
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب الصلاحيات'
      });
    }
  }
);

router.post('/permissions/grant',
  rbacService.authenticateToken,
  rbacService.requireRole(['SYSTEM_SUPER_ADMIN', 'SERVICE_PROVIDER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId, permission, reason, expiresAt } = req.body;
      
      const success = await rbacService.grantUserPermission(
        userId, 
        permission, 
        req.user!.id, 
        reason,
        expiresAt ? new Date(expiresAt) : undefined
      );
      
      res.json({
        success,
        message: success ? 'تم منح الصلاحية بنجاح' : 'خطأ في منح الصلاحية'
      });
    } catch (error) {
      console.error('Grant permission error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في منح الصلاحية'
      });
    }
  }
);

router.post('/permissions/revoke',
  rbacService.authenticateToken,
  rbacService.requireRole(['SYSTEM_SUPER_ADMIN', 'SERVICE_PROVIDER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId, permission, reason } = req.body;
      
      const success = await rbacService.revokeUserPermission(userId, permission, req.user!.id, reason);
      
      res.json({
        success,
        message: success ? 'تم سحب الصلاحية بنجاح' : 'خطأ في سحب الصلاحية'
      });
    } catch (error) {
      console.error('Revoke permission error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في سحب الصلاحية'
      });
    }
  }
);

// Security endpoints
router.post('/auth/change-password',
  rbacService.authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const result = await rbacService.changePassword(req.user!.id, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تغيير كلمة المرور'
      });
    }
  }
);

router.post('/auth/enable-2fa',
  rbacService.authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await rbacService.enableTwoFactor(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تفعيل المصادقة الثنائية'
      });
    }
  }
);

// System administration endpoints
router.get('/admin/health',
  rbacService.authenticateToken,
  rbacService.requireRole(['SYSTEM_SUPER_ADMIN', 'SERVICE_PROVIDER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = await rbacService.getSystemHealthMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error('Get health metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب إحصائيات النظام'
      });
    }
  }
);

// Role information endpoint
router.get('/roles',
  rbacService.authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const currentUserLevel = roleHierarchy[req.user!.role]?.level || 0;
      
      // Only show roles that the current user can manage
      const availableRoles = Object.entries(roleHierarchy)
        .filter(([_, roleInfo]) => roleInfo.level < currentUserLevel)
        .reduce((acc, [roleKey, roleInfo]) => {
          acc[roleKey] = roleInfo;
          return acc;
        }, {} as typeof roleHierarchy);
      
      res.json({
        success: true,
        roles: availableRoles,
        currentRole: {
          key: req.user!.role,
          info: roleHierarchy[req.user!.role]
        }
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب الأدوار'
      });
    }
  }
);

export default router;