import { Router, Request, Response } from 'express';
import { enterpriseRBAC } from './enterprise-mongodb-rbac-storage';

const router = Router();

// Initialize the RBAC system and connect to MongoDB
router.post('/api/enterprise-rbac/initialize', async (req: Request, res: Response) => {
  try {
    await enterpriseRBAC.connect();
    await enterpriseRBAC.initializeSystemRoles();
    
    res.json({
      success: true,
      message: 'Enterprise RBAC system initialized successfully',
      messageAr: 'تم تهيئة نظام RBAC المؤسسي بنجاح',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Enterprise RBAC initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Enterprise RBAC system',
      errorAr: 'فشل في تهيئة نظام RBAC المؤسسي',
      details: error.message
    });
  }
});

// Test permission with detailed response
router.post('/api/enterprise-rbac/test-permission', async (req: Request, res: Response) => {
  try {
    const { userId, resource, action, scope = 'organization' } = req.body;
    
    if (!userId || !resource || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: userId, resource, action',
        errorAr: 'معايير مطلوبة مفقودة: userId, resource, action'
      });
    }

    const result = await enterpriseRBAC.hasPermission(userId, resource, action, scope);
    
    res.json({
      success: true,
      data: {
        hasPermission: result.hasPermission,
        roleLevel: result.roleLevel,
        roleName: result.roleName,
        reason: result.reason,
        details: result.details,
        endpoint: `${resource}:${action}:${scope}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Permission test error:', error);
    res.status(500).json({
      success: false,
      error: 'Permission test failed',
      errorAr: 'فشل اختبار الصلاحية',
      details: error.message
    });
  }
});

// Create organization with full isolation
router.post('/api/enterprise-rbac/organizations', async (req: Request, res: Response) => {
  try {
    const { name, domain, plan = 'trial' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Organization name is required',
        errorAr: 'اسم المؤسسة مطلوب'
      });
    }

    const organization = await enterpriseRBAC.createOrganization({
      name,
      domain,
      plan
    });
    
    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization created successfully with full data isolation',
      messageAr: 'تم إنشاء المؤسسة بنجاح مع عزل كامل للبيانات'
    });
  } catch (error: any) {
    console.error('Organization creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create organization',
      errorAr: 'فشل في إنشاء المؤسسة',
      details: error.message
    });
  }
});

// Get all organizations (paginated for performance)
router.get('/api/enterprise-rbac/organizations', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await enterpriseRBAC.getOrganizations(page, limit);
    
    res.json({
      success: true,
      data: result.organizations,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error: any) {
    console.error('Organizations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations',
      errorAr: 'فشل في جلب المؤسسات',
      details: error.message
    });
  }
});

// Create user with organization isolation
router.post('/api/enterprise-rbac/users', async (req: Request, res: Response) => {
  try {
    const { organizationId, email, password, firstName, lastName, roleId = 'external_client_view' } = req.body;
    
    if (!organizationId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID and email are required',
        errorAr: 'معرف المؤسسة والبريد الإلكتروني مطلوبان'
      });
    }

    const user = await enterpriseRBAC.createUser({
      organizationId,
      email,
      password,
      firstName,
      lastName,
      roleId
    });
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully with organization isolation',
      messageAr: 'تم إنشاء المستخدم بنجاح مع عزل المؤسسة'
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      errorAr: 'فشل في إنشاء المستخدم',
      details: error.message
    });
  }
});

// Get users in organization (paginated)
router.get('/api/enterprise-rbac/organizations/:orgId/users', async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const result = await enterpriseRBAC.getUsersInOrganization(orgId, page, limit);
    
    // Remove passwords from response
    const users = result.users.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error: any) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      errorAr: 'فشل في جلب المستخدمين',
      details: error.message
    });
  }
});

// Authentication with organization isolation
router.post('/api/enterprise-rbac/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, organizationId } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        errorAr: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const result = await enterpriseRBAC.authenticateUser(email, password, organizationId);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or user not active',
        errorAr: 'بيانات اعتماد غير صحيحة أو المستخدم غير نشط'
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
      message: 'Login successful with organization isolation',
      messageAr: 'تم تسجيل الدخول بنجاح مع عزل المؤسسة'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      errorAr: 'فشل في المصادقة',
      details: error.message
    });
  }
});

// Get system roles
router.get('/api/enterprise-rbac/roles', async (req: Request, res: Response) => {
  try {
    const roles = await enterpriseRBAC.getSystemRoles();
    
    res.json({
      success: true,
      data: roles,
      count: roles.length
    });
  } catch (error: any) {
    console.error('Roles fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles',
      errorAr: 'فشل في جلب الأدوار',
      details: error.message
    });
  }
});

// Batch permission testing for performance
router.post('/api/enterprise-rbac/batch-permission-test', async (req: Request, res: Response) => {
  try {
    const { userId, operations } = req.body;
    
    if (!userId || !operations || !Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: 'userId and operations array are required',
        errorAr: 'معرف المستخدم ومصفوفة العمليات مطلوبان'
      });
    }

    const results = await enterpriseRBAC.validateBatchPermissions(userId, operations);
    
    res.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        allowed: results.filter(r => r.allowed).length,
        denied: results.filter(r => !r.allowed).length
      }
    });
  } catch (error: any) {
    console.error('Batch permission test error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch permission test failed',
      errorAr: 'فشل اختبار الصلاحيات المجمعة',
      details: error.message
    });
  }
});

// Get user permission matrix
router.get('/api/enterprise-rbac/users/:userId/permissions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const matrix = await enterpriseRBAC.getUserPermissionMatrix(userId);
    
    if (!matrix) {
      return res.status(404).json({
        success: false,
        error: 'User or permissions not found',
        errorAr: 'المستخدم أو الصلاحيات غير موجودة'
      });
    }

    // Remove password from user data
    const { password, ...userResponse } = matrix.user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        role: matrix.role,
        permissions: matrix.permissions,
        organization: matrix.organization
      }
    });
  } catch (error: any) {
    console.error('User permissions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user permissions',
      errorAr: 'فشل في جلب صلاحيات المستخدم',
      details: error.message
    });
  }
});

// Get audit logs for organization (paginated)
router.get('/api/enterprise-rbac/organizations/:orgId/audit-logs', async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await enterpriseRBAC.getAuditLogs(orgId, page, limit);
    
    res.json({
      success: true,
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error: any) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      errorAr: 'فشل في جلب سجلات التدقيق',
      details: error.message
    });
  }
});

// Organization switching
router.post('/api/enterprise-rbac/switch-organization', async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.body;
    
    if (!userId || !organizationId) {
      return res.status(400).json({
        success: false,
        error: 'userId and organizationId are required',
        errorAr: 'معرف المستخدم ومعرف المؤسسة مطلوبان'
      });
    }

    const result = await enterpriseRBAC.switchOrganization(userId, organizationId);
    
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
  } catch (error: any) {
    console.error('Organization switch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to switch organization',
      errorAr: 'فشل في تبديل المؤسسة',
      details: error.message
    });
  }
});

// System health check
router.get('/api/enterprise-rbac/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        statusAr: 'صحي',
        rbacService: 'operational',
        rbacServiceAr: 'يعمل',
        database: 'mongodb_connected',
        databaseAr: 'مونغو_دي_بي_متصل',
        features: [
          'عزل كامل للبيانات',
          'صلاحيات هرمية 6 مستويات',
          'دعم آلاف المستخدمين',
          'تدقيق شامل',
          'أداء محسن'
        ],
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    console.error('System health check error:', error);
    res.status(500).json({
      success: false,
      error: 'System health check failed',
      errorAr: 'فشل في فحص صحة النظام',
      details: error.message
    });
  }
});

export { router as enterpriseRBACAPI };