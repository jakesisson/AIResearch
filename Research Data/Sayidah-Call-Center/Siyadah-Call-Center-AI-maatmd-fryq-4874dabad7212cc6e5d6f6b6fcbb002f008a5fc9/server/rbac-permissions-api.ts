import { Router } from 'express';
import { storage } from './mongodb-storage';

const router = Router();

// RBAC Role Definitions with Permissions
const RBAC_ROLES = {
  1: {
    id: '1',
    name: 'system_super_admin',
    nameAr: 'مدير النظام الرئيسي',
    level: 1,
    permissions: [
      { resource: 'system', action: 'manage', scope: 'global' },
      { resource: 'organizations', action: 'manage', scope: 'global' },
      { resource: 'users', action: 'manage', scope: 'global' },
      { resource: 'billing', action: 'manage', scope: 'global' },
      { resource: 'analytics', action: 'read', scope: 'global' },
      { resource: 'settings', action: 'manage', scope: 'global' },
      { resource: 'ai_agents', action: 'manage', scope: 'global' },
      { resource: 'reports', action: 'read', scope: 'global' }
    ]
  },
  2: {
    id: '2',
    name: 'service_provider_admin',
    nameAr: 'مدير مقدم الخدمة',
    level: 2,
    permissions: [
      { resource: 'organizations', action: 'read', scope: 'organization' },
      { resource: 'users', action: 'manage', scope: 'organization' },
      { resource: 'analytics', action: 'read', scope: 'organization' },
      { resource: 'settings', action: 'manage', scope: 'organization' },
      { resource: 'ai_agents', action: 'manage', scope: 'organization' },
      { resource: 'reports', action: 'read', scope: 'organization' },
      { resource: 'billing', action: 'read', scope: 'organization' }
    ]
  },
  3: {
    id: '3',
    name: 'client_account_manager',
    nameAr: 'مدير حساب العميل',
    level: 3,
    permissions: [
      { resource: 'users', action: 'read', scope: 'organization' },
      { resource: 'analytics', action: 'read', scope: 'organization' },
      { resource: 'settings', action: 'read', scope: 'organization' },
      { resource: 'ai_agents', action: 'read', scope: 'organization' },
      { resource: 'reports', action: 'read', scope: 'organization' },
      { resource: 'financial', action: 'read', scope: 'organization' },
      { resource: 'integrations', action: 'manage', scope: 'organization' }
    ]
  },
  4: {
    id: '4',
    name: 'supervisor',
    nameAr: 'مشرف',
    level: 4,
    permissions: [
      { resource: 'analytics', action: 'read', scope: 'team' },
      { resource: 'reports', action: 'read', scope: 'team' },
      { resource: 'ai_agents', action: 'read', scope: 'team' },
      { resource: 'whatsapp', action: 'use', scope: 'team' },
      { resource: 'voice', action: 'use', scope: 'team' },
      { resource: 'email', action: 'use', scope: 'team' }
    ]
  },
  5: {
    id: '5',
    name: 'agent_employee',
    nameAr: 'وكيل/موظف',
    level: 5,
    permissions: [
      { resource: 'whatsapp', action: 'use', scope: 'self' },
      { resource: 'voice', action: 'use', scope: 'self' },
      { resource: 'email', action: 'use', scope: 'self' },
      { resource: 'analytics', action: 'read', scope: 'self' }
    ]
  },
  6: {
    id: '6',
    name: 'external_client_view',
    nameAr: 'عميل خارجي - عرض',
    level: 6,
    permissions: [
      { resource: 'analytics', action: 'read', scope: 'self' }
    ]
  }
};

// Get user permissions by user ID
router.get('/user-permissions', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // For demo accounts, determine role based on email
    let roleLevel = 6; // Default to lowest level
    let roleName = 'external_client_view';
    
    if (typeof userId === 'string') {
      if (userId.includes('admin')) {
        if (userId.includes('demo')) {
          roleLevel = 2; // Service Provider Admin
          roleName = 'service_provider_admin';
        } else if (userId.includes('startup')) {
          roleLevel = 3; // Client Account Manager
          roleName = 'client_account_manager';
        } else if (userId.includes('enterprise')) {
          roleLevel = 2; // Service Provider Admin
          roleName = 'service_provider_admin';
        } else if (userId.includes('siyadah')) {
          roleLevel = 1; // System Super Admin
          roleName = 'system_super_admin';
        }
      }
    }

    const role = RBAC_ROLES[roleLevel as keyof typeof RBAC_ROLES];
    
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    res.json({
      success: true,
      userId,
      roleId: role.id,
      roleName: role.name,
      roleNameAr: role.nameAr,
      level: role.level,
      permissions: role.permissions,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user permissions',
      error: error.message 
    });
  }
});

// Get all roles matrix
router.get('/roles-matrix', async (req, res) => {
  try {
    res.json({
      success: true,
      roles: Object.values(RBAC_ROLES),
      total: Object.keys(RBAC_ROLES).length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching roles matrix:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch roles matrix',
      error: error.message 
    });
  }
});

// Test specific permission
router.post('/test-permission', async (req, res) => {
  try {
    const { userId, resource, action } = req.body;
    
    if (!userId || !resource || !action) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, resource, and action are required' 
      });
    }

    // Get user role based on userId (fixed mapping logic)
    let roleLevel = 6; // Default to lowest level
    if (typeof userId === 'string') {
      if (userId.includes('admin')) {
        if (userId.includes('demo')) {
          roleLevel = 2; // Service Provider Admin
        } else if (userId.includes('startup')) {
          roleLevel = 3; // Client Account Manager
        } else if (userId.includes('enterprise')) {
          roleLevel = 2; // Service Provider Admin
        } else if (userId.includes('siyadah')) {
          roleLevel = 1; // System Super Admin
        }
      }
    }

    const role = RBAC_ROLES[roleLevel as keyof typeof RBAC_ROLES];
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    const hasPermission = role.permissions.some(perm => 
      perm.resource === resource && perm.action === action
    );

    res.json({
      success: true,
      userId,
      resource,
      action,
      hasPermission,
      roleLevel,
      roleName: role.nameAr,
      roleId: role.id,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing permission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to test permission',
      error: error.message 
    });
  }
});

// Comprehensive audit of all permissions
router.get('/permission-audit', async (req, res) => {
  try {
    const audit = {
      totalRoles: Object.keys(RBAC_ROLES).length,
      roles: Object.values(RBAC_ROLES).map(role => ({
        ...role,
        permissionCount: role.permissions.length,
        resources: Array.from(new Set(role.permissions.map(p => p.resource))),
        actions: Array.from(new Set(role.permissions.map(p => p.action))),
        scopes: Array.from(new Set(role.permissions.map(p => p.scope)))
      })),
      permissionSummary: {
        totalPermissions: Object.values(RBAC_ROLES).reduce((sum, role) => sum + role.permissions.length, 0),
        uniqueResources: Array.from(new Set(Object.values(RBAC_ROLES).flatMap(role => role.permissions.map(p => p.resource)))),
        uniqueActions: Array.from(new Set(Object.values(RBAC_ROLES).flatMap(role => role.permissions.map(p => p.action)))),
        uniqueScopes: Array.from(new Set(Object.values(RBAC_ROLES).flatMap(role => role.permissions.map(p => p.scope))))
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      audit,
      message: 'تدقيق شامل لنظام الصلاحيات'
    });

  } catch (error: any) {
    console.error('Error generating permission audit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate permission audit',
      error: error.message 
    });
  }
});

// Batch permission testing
router.post('/batch-test', async (req, res) => {
  try {
    const { userId, tests } = req.body;
    
    if (!userId || !tests || !Array.isArray(tests)) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and tests array are required' 
      });
    }

    // Get user role
    let roleLevel = 6;
    if (typeof userId === 'string') {
      if (userId.includes('admin')) {
        if (userId.includes('demo')) roleLevel = 2;
        else if (userId.includes('startup')) roleLevel = 3;
        else if (userId.includes('enterprise')) roleLevel = 2;
        else if (userId.includes('siyadah')) roleLevel = 1;
      }
    }

    const role = RBAC_ROLES[roleLevel as keyof typeof RBAC_ROLES];
    
    const results = tests.map((test: any) => {
      const hasPermission = role?.permissions.some(perm => 
        perm.resource === test.resource && perm.action === test.action
      ) || false;

      return {
        resource: test.resource,
        action: test.action,
        hasPermission,
        status: hasPermission ? 'مسموح' : 'مرفوض'
      };
    });

    const summary = {
      total: results.length,
      allowed: results.filter(r => r.hasPermission).length,
      denied: results.filter(r => !r.hasPermission).length
    };

    res.json({
      success: true,
      userId,
      roleLevel,
      roleName: role?.nameAr || 'غير محدد',
      results,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in batch permission test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to execute batch permission test',
      error: error.message 
    });
  }
});

export default router;