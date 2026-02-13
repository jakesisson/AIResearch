import { Router, Request, Response } from 'express';
import { rbacService } from './enterprise-rbac-service';
import { 
  authenticateToken, 
  requirePermission, 
  enforceOrganizationBoundary,
  secureOrgEndpoint,
  secureUserEndpoint,
  secureAdminEndpoint,
  auditLog,
  type AuthenticatedRequest
} from './enterprise-rbac-middleware';

const router = Router();

// Initialize RBAC System
router.post('/rbac/initialize', async (req: Request, res: Response) => {
  try {
    await rbacService.initializeSystemRoles();
    res.json({
      success: true,
      message: 'RBAC system initialized successfully',
      messageAr: 'تم تهيئة نظام RBAC بنجاح'
    });
  } catch (error) {
    console.error('RBAC initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize RBAC system',
      errorAr: 'فشل في تهيئة نظام RBAC'
    });
  }
});

// Organization Management Routes
router.post('/organizations', 
  authenticateToken,
  requirePermission('organizations', 'create', 'global'),
  auditLog('create', 'organization'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organization = await rbacService.createOrganization(req.body);
      res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully',
        messageAr: 'تم إنشاء المؤسسة بنجاح'
      });
    } catch (error) {
      console.error('Organization creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create organization',
        errorAr: 'فشل في إنشاء المؤسسة'
      });
    }
  }
);

router.get('/organizations/:orgId',
  ...secureOrgEndpoint,
  requirePermission('organizations', 'read', 'organization'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organization = await rbacService.getOrganization(req.params.orgId);
      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found',
          errorAr: 'المؤسسة غير موجودة'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Organization fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch organization',
        errorAr: 'فشل في جلب المؤسسة'
      });
    }
  }
);

// User Management Routes
router.post('/users',
  ...secureOrgEndpoint,
  requirePermission('users', 'create', 'organization'),
  auditLog('create', 'user'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData = {
        ...req.body,
        organizationId: req.user!.organizationId
      };
      
      const user = await rbacService.createUser(userData);
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'User created successfully',
        messageAr: 'تم إنشاء المستخدم بنجاح'
      });
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
        errorAr: 'فشل في إنشاء المستخدم'
      });
    }
  }
);

router.get('/users',
  ...secureOrgEndpoint,
  requirePermission('users', 'read', 'organization'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await rbacService.getUsersInOrganization(req.user!.organizationId);
      
      // Remove passwords from response
      const usersResponse = users.map(({ password, ...user }) => user);
      
      res.json({
        success: true,
        data: usersResponse,
        count: usersResponse.length
      });
    } catch (error) {
      console.error('Users fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        errorAr: 'فشل في جلب المستخدمين'
      });
    }
  }
);

// Authentication Routes
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, organizationId } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        errorAr: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const result = await rbacService.authenticateUser(email, password, organizationId);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        errorAr: 'بيانات اعتماد غير صحيحة'
      });
    }

    const { user, token } = result;
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
        expiresIn: '24h'
      },
      message: 'Login successful',
      messageAr: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      errorAr: 'فشل في المصادقة'
    });
  }
});

router.post('/auth/switch-organization',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { organizationId } = req.body;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID is required',
          errorAr: 'معرف المؤسسة مطلوب'
        });
      }

      const result = await rbacService.switchOrganization(req.user!.userId, organizationId);
      
      if (!result.success) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to organization',
          errorAr: 'رفض الوصول للمؤسسة'
        });
      }

      res.json({
        success: true,
        data: { token: result.token },
        message: 'Organization switched successfully',
        messageAr: 'تم تبديل المؤسسة بنجاح'
      });
    } catch (error) {
      console.error('Organization switch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to switch organization',
        errorAr: 'فشل في تبديل المؤسسة'
      });
    }
  }
);

// Permission Testing Routes
router.post('/rbac/test-permission',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resource, action, scope = 'organization', targetUserId } = req.body;
      
      const userId = targetUserId || req.user!.userId;
      const hasPermission = await rbacService.hasPermission(userId, resource, action, scope);
      
      // Get user details for response
      const userMatrix = await rbacService.getUserPermissionMatrix(userId);
      
      res.json({
        success: true,
        hasPermission,
        roleLevel: userMatrix?.role.level || 0,
        roleName: userMatrix?.role.nameAr || 'غير محدد',
        reason: hasPermission ? 'مسموح بالوصول' : 'رفض الوصول',
        details: {
          endpoint: `${resource}:${action}:${scope}`,
          userRole: userMatrix?.role.name,
          organization: userMatrix?.organization.name
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Permission test error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission test failed',
        errorAr: 'فشل اختبار الصلاحية'
      });
    }
  }
);

router.get('/rbac/user-permissions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const matrix = await rbacService.getUserPermissionMatrix(req.user!.userId);
      
      if (!matrix) {
        return res.status(404).json({
          success: false,
          error: 'User permissions not found',
          errorAr: 'صلاحيات المستخدم غير موجودة'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: matrix.user.id,
            email: matrix.user.email,
            firstName: matrix.user.firstName,
            lastName: matrix.user.lastName
          },
          role: {
            id: matrix.role.id,
            name: matrix.role.name,
            nameAr: matrix.role.nameAr,
            level: matrix.role.level,
            description: matrix.role.description,
            descriptionAr: matrix.role.descriptionAr
          },
          permissions: matrix.permissions,
          organization: {
            id: matrix.organization.id,
            name: matrix.organization.name,
            plan: matrix.organization.plan
          }
        }
      });
    } catch (error) {
      console.error('User permissions fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user permissions',
        errorAr: 'فشل في جلب صلاحيات المستخدم'
      });
    }
  }
);

router.post('/rbac/batch-permission-test',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { operations, targetUserId } = req.body;
      
      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({
          success: false,
          error: 'Operations array is required',
          errorAr: 'مصفوفة العمليات مطلوبة'
        });
      }

      const userId = targetUserId || req.user!.userId;
      const results = await rbacService.validateBatchPermissions(userId, operations);
      
      res.json({
        success: true,
        data: results,
        summary: {
          total: results.length,
          allowed: results.filter(r => r.allowed).length,
          denied: results.filter(r => !r.allowed).length
        }
      });
    } catch (error) {
      console.error('Batch permission test error:', error);
      res.status(500).json({
        success: false,
        error: 'Batch permission test failed',
        errorAr: 'فشل اختبار الصلاحيات المجمعة'
      });
    }
  }
);

// System Monitoring Routes
router.get('/rbac/audit-logs',
  ...secureAdminEndpoint,
  requirePermission('audit', 'read', 'organization'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // This would be implemented with proper pagination and filtering
      res.json({
        success: true,
        message: 'Audit logs endpoint - implementation pending',
        messageAr: 'نقطة وصول سجلات التدقيق - التنفيذ قيد الانتظار'
      });
    } catch (error) {
      console.error('Audit logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs',
        errorAr: 'فشل في جلب سجلات التدقيق'
      });
    }
  }
);

router.get('/rbac/system-health',
  authenticateToken,
  requirePermission('system', 'read', 'global'),
  async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          statusAr: 'صحي',
          rbacService: 'operational',
          rbacServiceAr: 'يعمل',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('System health check error:', error);
      res.status(500).json({
        success: false,
        error: 'System health check failed',
        errorAr: 'فشل في فحص صحة النظام'
      });
    }
  }
);

export { router as enterpriseRBACRoutes };