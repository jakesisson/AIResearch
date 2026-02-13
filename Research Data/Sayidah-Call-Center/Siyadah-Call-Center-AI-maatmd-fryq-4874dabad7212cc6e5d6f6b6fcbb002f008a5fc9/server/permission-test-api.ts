/**
 * Permission Testing API - User Experience Testing System
 * Tests all permission levels and user roles comprehensively
 */

import type { Express, Request, Response } from 'express';

interface PermissionRule {
  roleId: string;
  roleName: string;
  level: number;
  permissions: {
    [endpoint: string]: {
      [method: string]: boolean;
    };
  };
}

// Complete permission matrix for all roles
const permissionMatrix: PermissionRule[] = [
  {
    roleId: 'system_super_admin',
    roleName: 'مدير النظام الأعلى',
    level: 6,
    permissions: {
      '/api/rbac/users': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true },
      '/api/rbac/users/:id': { 'GET': true, 'PUT': true, 'DELETE': true },
      '/api/rbac/roles': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true },
      '/api/analytics': { 'GET': true, 'POST': true },
      '/api/settings': { 'GET': true, 'PUT': true, 'DELETE': true },
      '/api/system': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true },
      '/api/billing': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/clients': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true },
      '/api/support': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/finance': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/admin': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true },
      '/api/internal': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': true }
    }
  },
  {
    roleId: 'service_provider_admin',
    roleName: 'مدير مقدم الخدمة',
    level: 5,
    permissions: {
      '/api/clients': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': false },
      '/api/billing': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/support': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/analytics': { 'GET': true, 'POST': false },
      '/api/settings': { 'GET': true, 'PUT': false, 'DELETE': false },
      '/api/system': { 'GET': true, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/rbac/users': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': false },
      '/api/finance': { 'GET': true, 'POST': false, 'PUT': false },
      '/api/admin': { 'GET': true, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/internal': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false }
    }
  },
  {
    roleId: 'client_account_manager',
    roleName: 'مدير حساب العميل',
    level: 4,
    permissions: {
      '/api/team': { 'GET': true, 'POST': true, 'PUT': true, 'DELETE': false },
      '/api/reports': { 'GET': true, 'POST': false },
      '/api/account/settings': { 'GET': true, 'PUT': true },
      '/api/analytics': { 'GET': true, 'POST': false },
      '/api/accounts': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/clients': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/billing': { 'GET': true, 'POST': false, 'PUT': false },
      '/api/support': { 'GET': true, 'POST': true, 'PUT': false },
      '/api/finance': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/admin': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/system': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/internal': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false }
    }
  },
  {
    roleId: 'supervisor',
    roleName: 'المشرف',
    level: 3,
    permissions: {
      '/api/team/performance': { 'GET': true, 'POST': false },
      '/api/tasks': { 'GET': true, 'POST': true, 'PUT': true },
      '/api/requests/approve': { 'PUT': true, 'POST': true },
      '/api/reports': { 'GET': true, 'POST': false },
      '/api/analytics': { 'GET': true, 'POST': false },
      '/api/finance': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/users/:id': { 'DELETE': false },
      '/api/billing': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/clients': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/admin': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/system': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/internal': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false }
    }
  },
  {
    roleId: 'agent_employee',
    roleName: 'الموظف',
    level: 2,
    permissions: {
      '/api/my-tasks': { 'GET': true, 'POST': false },
      '/api/tasks/:id/status': { 'PUT': true },
      '/api/timesheet': { 'POST': true, 'GET': true },
      '/api/profile': { 'GET': true, 'PUT': true },
      '/api/support/ticket': { 'POST': true, 'GET': true },
      '/api/admin': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/finance': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/billing': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/clients': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/team/performance': { 'GET': false, 'POST': false },
      '/api/analytics': { 'GET': false, 'POST': false },
      '/api/system': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/internal': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false }
    }
  },
  {
    roleId: 'external_client_view',
    roleName: 'العميل الخارجي',
    level: 1,
    permissions: {
      '/api/client/data': { 'GET': true, 'POST': false },
      '/api/client/reports': { 'GET': true, 'POST': false },
      '/api/support/ticket': { 'POST': true, 'GET': true },
      '/api/client/invoices': { 'GET': true, 'POST': false },
      '/api/internal': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/admin': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/finance': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/billing': { 'GET': false, 'POST': false, 'PUT': false },
      '/api/clients': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/team': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/analytics': { 'GET': false, 'POST': false },
      '/api/system': { 'GET': false, 'POST': false, 'PUT': false, 'DELETE': false },
      '/api/my-tasks': { 'GET': false, 'POST': false }
    }
  }
];

// Enhanced permission checking with context awareness
function checkPermission(roleId: string, endpoint: string, method: string): {
  hasPermission: boolean;
  reason: string;
  roleLevel: number;
  roleName: string;
  details: any;
} {
  const role = permissionMatrix.find(r => r.roleId === roleId);
  
  if (!role) {
    return {
      hasPermission: false,
      reason: 'دور غير معروف',
      roleLevel: 0,
      roleName: 'غير محدد',
      details: { error: 'Role not found in permission matrix' }
    };
  }

  // Normalize endpoint for pattern matching
  const normalizedEndpoint = endpoint.replace(/\/:[^\/]+/g, '/:id');
  const permission = role.permissions[normalizedEndpoint];
  
  if (!permission) {
    return {
      hasPermission: false,
      reason: 'المسار غير مدعوم لهذا الدور',
      roleLevel: role.level,
      roleName: role.roleName,
      details: { 
        endpoint: normalizedEndpoint,
        availableEndpoints: Object.keys(role.permissions)
      }
    };
  }

  const hasMethodPermission = permission[method] === true;
  
  return {
    hasPermission: hasMethodPermission,
    reason: hasMethodPermission 
      ? 'مسموح بالوصول' 
      : 'غير مسموح بهذا الإجراء لهذا الدور',
    roleLevel: role.level,
    roleName: role.roleName,
    details: {
      endpoint: normalizedEndpoint,
      method,
      allowedMethods: Object.keys(permission).filter(m => permission[m]),
      deniedMethods: Object.keys(permission).filter(m => !permission[m])
    }
  };
}

// Generate comprehensive test report
function generateTestReport() {
  const report: any = {
    totalRoles: permissionMatrix.length,
    roles: [],
    permissionCoverage: {},
    securityAnalysis: {
      highRiskPermissions: [],
      wellProtectedEndpoints: [],
      roleHierarchy: []
    }
  };

  // Analyze each role
  permissionMatrix.forEach(role => {
    const roleAnalysis = {
      roleId: role.roleId,
      roleName: role.roleName,
      level: role.level,
      totalEndpoints: Object.keys(role.permissions).length,
      allowedActions: 0,
      deniedActions: 0,
      criticalPermissions: [],
      limitations: []
    };

    Object.entries(role.permissions).forEach(([endpoint, methods]) => {
      Object.entries(methods).forEach(([method, allowed]) => {
        if (allowed) {
          roleAnalysis.allowedActions++;
          // Check for critical permissions
          if (method === 'DELETE' || endpoint.includes('/admin') || endpoint.includes('/system')) {
            roleAnalysis.criticalPermissions.push(`${method} ${endpoint}`);
          }
        } else {
          roleAnalysis.deniedActions++;
          roleAnalysis.limitations.push(`${method} ${endpoint}`);
        }
      });
    });

    report.roles.push(roleAnalysis);
  });

  // Security analysis
  const allEndpoints = new Set<string>();
  permissionMatrix.forEach(role => {
    Object.keys(role.permissions).forEach(endpoint => allEndpoints.add(endpoint));
  });

  allEndpoints.forEach(endpoint => {
    const accessibleByRoles = permissionMatrix.filter(role => 
      role.permissions[endpoint] && 
      Object.values(role.permissions[endpoint]).some(allowed => allowed)
    ).length;

    if (accessibleByRoles === 1) {
      report.securityAnalysis.wellProtectedEndpoints.push(endpoint);
    } else if (accessibleByRoles > 4) {
      report.securityAnalysis.highRiskPermissions.push({
        endpoint,
        accessibleByRoles,
        roles: permissionMatrix
          .filter(role => role.permissions[endpoint])
          .map(role => role.roleName)
      });
    }
  });

  report.securityAnalysis.roleHierarchy = permissionMatrix
    .sort((a, b) => b.level - a.level)
    .map(role => ({
      level: role.level,
      roleName: role.roleName,
      permissionCount: Object.values(role.permissions)
        .flatMap(methods => Object.values(methods))
        .filter(allowed => allowed).length
    }));

  return report;
}

export function setupPermissionTestApi(app: Express) {
  console.log('🔐 Setting up Permission Testing API...');

  // Test specific permission - FIXED to accept userId
  app.post('/api/rbac/test-permission', (req: Request, res: Response) => {
    try {
      const { userId, resource, action } = req.body;

      if (!userId || !resource || !action) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: userId, resource, action'
        });
      }

      // Convert userId to roleId based on user type
      let roleId = 'external_client_view'; // Default lowest role
      if (typeof userId === 'string') {
        if (userId.includes('admin')) {
          if (userId.includes('demo')) {
            roleId = 'service_provider_admin';
          } else if (userId.includes('siyadah')) {
            roleId = 'system_super_admin';
          } else {
            roleId = 'service_provider_admin';
          }
        } else if (userId.includes('manager')) {
          roleId = 'client_account_manager';
        } else if (userId.includes('supervisor')) {
          roleId = 'supervisor';
        } else if (userId.includes('agent') || userId.includes('employee')) {
          roleId = 'agent_employee';
        }
      }

      const result = checkPermission(roleId, resource, action);

      res.json({
        success: true,
        userId,
        roleId,
        hasPermission: result.hasPermission,
        roleLevel: result.roleLevel,
        roleName: result.roleName,
        reason: result.reason,
        details: result.details,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Permission test error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في اختبار الصلاحية',
        details: error.message
      });
    }
  });

  // Get all roles and their permissions
  app.get('/api/rbac/roles-matrix', (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          roles: permissionMatrix.map(role => ({
            roleId: role.roleId,
            roleName: role.roleName,
            level: role.level,
            permissionCount: Object.values(role.permissions)
              .flatMap(methods => Object.values(methods))
              .filter(allowed => allowed).length
          })),
          totalRoles: permissionMatrix.length,
          totalEndpoints: new Set(permissionMatrix.flatMap(role => Object.keys(role.permissions))).size
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب مصفوفة الصلاحيات'
      });
    }
  });

  // Run comprehensive permission audit
  app.get('/api/rbac/permission-audit', (req: Request, res: Response) => {
    try {
      const report = generateTestReport();

      res.json({
        success: true,
        data: report,
        generatedAt: new Date().toISOString(),
        auditVersion: '1.0'
      });
    } catch (error: any) {
      console.error('Permission audit error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تدقيق الصلاحيات'
      });
    }
  });

  // Batch permission testing
  app.post('/api/rbac/batch-test', (req: Request, res: Response) => {
    try {
      const { tests } = req.body;

      if (!Array.isArray(tests)) {
        return res.status(400).json({
          success: false,
          error: 'Tests must be an array'
        });
      }

      const results = tests.map((test: any, index: number) => {
        try {
          const result = checkPermission(test.roleId, test.resource, test.action);
          return {
            testId: test.id || index,
            ...result,
            input: test
          };
        } catch (error: any) {
          return {
            testId: test.id || index,
            hasPermission: false,
            reason: 'خطأ في الاختبار',
            error: error.message,
            input: test,
            roleLevel: 0,
            roleName: 'خطأ'
          };
        }
      });

      const summary = {
        total: results.length,
        passed: results.filter(r => r.hasPermission).length,
        failed: results.filter(r => !r.hasPermission).length,
        errors: results.filter(r => r.error).length
      };

      res.json({
        success: true,
        data: {
          results,
          summary
        },
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Batch permission test error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في الاختبار المتعدد'
      });
    }
  });

  // Get role-specific permissions
  app.get('/api/rbac/role/:roleId/permissions', (req: Request, res: Response) => {
    try {
      const { roleId } = req.params;
      const role = permissionMatrix.find(r => r.roleId === roleId);

      if (!role) {
        return res.status(404).json({
          success: false,
          error: 'الدور غير موجود'
        });
      }

      const formattedPermissions = Object.entries(role.permissions).map(([endpoint, methods]) => ({
        endpoint,
        methods: Object.entries(methods).map(([method, allowed]) => ({
          method,
          allowed,
          description: `${method} ${endpoint}`
        }))
      }));

      res.json({
        success: true,
        data: {
          roleId: role.roleId,
          roleName: role.roleName,
          level: role.level,
          permissions: formattedPermissions,
          summary: {
            totalEndpoints: Object.keys(role.permissions).length,
            allowedActions: Object.values(role.permissions)
              .flatMap(methods => Object.values(methods))
              .filter(allowed => allowed).length,
            deniedActions: Object.values(role.permissions)
              .flatMap(methods => Object.values(methods))
              .filter(allowed => !allowed).length
          }
        }
      });

    } catch (error: any) {
      console.error('Role permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب صلاحيات الدور'
      });
    }
  });

  console.log('✅ Permission Testing API configured successfully');
  console.log('📊 Available endpoints:');
  console.log('   POST /api/rbac/test-permission - Test specific permission');
  console.log('   GET  /api/rbac/roles-matrix - Get all roles matrix');
  console.log('   GET  /api/rbac/permission-audit - Comprehensive audit');
  console.log('   POST /api/rbac/batch-test - Batch permission testing');
  console.log('   GET  /api/rbac/role/:roleId/permissions - Role permissions');
}