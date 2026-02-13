import { db } from './db';
import { 
  organizations, 
  systemRoles, 
  permissions, 
  rolePermissions, 
  enterpriseUsers, 
  auditLogs,
  dataBoundaries,
  type Organization,
  type SystemRole,
  type Permission,
  type EnterpriseUser,
  type InsertOrganization,
  type InsertEnterpriseUser,
  type InsertAuditLog
} from '@shared/enterprise-rbac-schema';
import { eq, and, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class EnterpriseRBAC {
  private static instance: EnterpriseRBAC;
  private permissionCache = new Map<string, Permission[]>();
  private roleCache = new Map<string, SystemRole>();

  static getInstance(): EnterpriseRBAC {
    if (!EnterpriseRBAC.instance) {
      EnterpriseRBAC.instance = new EnterpriseRBAC();
    }
    return EnterpriseRBAC.instance;
  }

  // Organization Management
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [org] = await db.insert(organizations).values({
      ...orgData,
      id: orgId,
    }).returning();

    await this.createDataBoundary(org.id, 'organization', org.id, 'private');
    await this.logAudit(org.id, null, 'create', 'organization', org.id);
    
    return org;
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
    return org || null;
  }

  // User Management with Organization Isolation
  async createUser(userData: InsertEnterpriseUser): Promise<EnterpriseUser> {
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : null;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db.insert(enterpriseUsers).values({
      ...userData,
      id: userId,
      password: hashedPassword,
    }).returning();

    await this.createDataBoundary(userData.organizationId, 'user', user.id, 'private');
    await this.logAudit(userData.organizationId, user.id, 'create', 'user', user.id);
    
    return user;
  }

  async getUsersInOrganization(orgId: string): Promise<EnterpriseUser[]> {
    return await db.select().from(enterpriseUsers).where(eq(enterpriseUsers.organizationId, orgId));
  }

  async authenticateUser(email: string, password: string, orgId?: string): Promise<{ user: EnterpriseUser; token: string } | null> {
    const query = orgId 
      ? and(eq(enterpriseUsers.email, email), eq(enterpriseUsers.organizationId, orgId))
      : eq(enterpriseUsers.email, email);
    
    const [user] = await db.select().from(enterpriseUsers).where(query);
    
    if (!user || !user.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organizationId, 
        roleId: user.roleId 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    await this.logAudit(user.organizationId, user.id, 'login', 'authentication', user.id);
    
    return { user, token };
  }

  // Permission System
  async initializeSystemRoles(): Promise<void> {
    const defaultRoles = [
      {
        id: 'system_super_admin',
        name: 'System Super Admin',
        nameAr: 'مدير النظام الأعلى',
        level: 6,
        description: 'Full system access across all organizations',
        descriptionAr: 'وصول كامل للنظام عبر جميع المؤسسات',
        isSystemRole: true,
        permissions: ['*:*:global']
      },
      {
        id: 'service_provider_admin',
        name: 'Service Provider Admin',
        nameAr: 'مدير مقدم الخدمة',
        level: 5,
        description: 'Manage multiple client organizations',
        descriptionAr: 'إدارة مؤسسات العملاء المتعددة',
        isSystemRole: false,
        permissions: ['organizations:*:global', 'users:*:organization', 'billing:*:organization']
      },
      {
        id: 'client_account_manager',
        name: 'Client Account Manager',
        nameAr: 'مدير حساب العميل',
        level: 4,
        description: 'Manage organization and team members',
        descriptionAr: 'إدارة المؤسسة وأعضاء الفريق',
        isSystemRole: false,
        permissions: ['users:*:organization', 'settings:*:organization', 'data:read:organization']
      },
      {
        id: 'supervisor',
        name: 'Supervisor',
        nameAr: 'المشرف',
        level: 3,
        description: 'Supervise team and access reports',
        descriptionAr: 'الإشراف على الفريق والوصول للتقارير',
        isSystemRole: false,
        permissions: ['users:read:organization', 'reports:read:organization', 'data:read:organization']
      },
      {
        id: 'agent_employee',
        name: 'Agent/Employee',
        nameAr: 'الوكيل/الموظف',
        level: 2,
        description: 'Basic operational access',
        descriptionAr: 'وصول تشغيلي أساسي',
        isSystemRole: false,
        permissions: ['data:read:own', 'tasks:*:own']
      },
      {
        id: 'external_client_view',
        name: 'External Client View',
        nameAr: 'عرض العميل الخارجي',
        level: 1,
        description: 'Read-only access to own data',
        descriptionAr: 'وصول للقراءة فقط للبيانات الخاصة',
        isSystemRole: false,
        permissions: ['data:read:own']
      }
    ];

    for (const role of defaultRoles) {
      await db.insert(systemRoles).values(role).onConflictDoNothing();
    }

    // Clear cache
    this.roleCache.clear();
    this.permissionCache.clear();
  }

  async hasPermission(userId: string, resource: string, action: string, scope: string = 'organization'): Promise<boolean> {
    try {
      const [user] = await db.select().from(enterpriseUsers).where(eq(enterpriseUsers.id, userId));
      if (!user) return false;

      // Get role from cache or database
      let role = this.roleCache.get(user.roleId);
      if (!role) {
        const [roleData] = await db.select().from(systemRoles).where(eq(systemRoles.id, user.roleId));
        if (!roleData) return false;
        role = roleData;
        this.roleCache.set(user.roleId, role);
      }

      // System super admin has all permissions
      if (role.id === 'system_super_admin') return true;

      const permissions = role.permissions as string[];
      
      // Check exact permission match
      const exactPermission = `${resource}:${action}:${scope}`;
      if (permissions.includes(exactPermission)) return true;

      // Check wildcard permissions
      const wildcardChecks = [
        `${resource}:*:${scope}`,
        `${resource}:${action}:*`,
        `*:${action}:${scope}`,
        `*:*:${scope}`,
        `${resource}:*:*`,
        `*:*:*`
      ];

      return wildcardChecks.some(pattern => permissions.includes(pattern));
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Data Isolation
  async createDataBoundary(orgId: string, resourceType: string, resourceId: string, accessLevel: string): Promise<void> {
    await db.insert(dataBoundaries).values({
      id: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: orgId,
      resourceType,
      resourceId,
      accessLevel,
    }).onConflictDoNothing();
  }

  async enforceDataBoundary(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    const [user] = await db.select().from(enterpriseUsers).where(eq(enterpriseUsers.id, userId));
    if (!user) return false;

    // System super admin bypasses boundaries
    if (user.roleId === 'system_super_admin') return true;

    const [boundary] = await db.select()
      .from(dataBoundaries)
      .where(and(
        eq(dataBoundaries.organizationId, user.organizationId),
        eq(dataBoundaries.resourceType, resourceType),
        eq(dataBoundaries.resourceId, resourceId)
      ));

    return !!boundary;
  }

  // Audit Logging
  async logAudit(orgId: string, userId: string | null, action: string, resource: string, resourceId?: string, metadata?: any): Promise<void> {
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: orgId,
      userId,
      action,
      resource,
      resourceId,
      metadata: metadata || {},
    });
  }

  // Batch Operations for Scale
  async validateBatchPermissions(userId: string, operations: Array<{resource: string, action: string, scope?: string}>): Promise<Array<{operation: any, allowed: boolean}>> {
    const results = [];
    
    for (const op of operations) {
      const allowed = await this.hasPermission(userId, op.resource, op.action, op.scope || 'organization');
      results.push({ operation: op, allowed });
    }
    
    return results;
  }

  // Organization Switching for Multi-tenant Users
  async switchOrganization(userId: string, targetOrgId: string): Promise<{ success: boolean, token?: string }> {
    // Check if user has access to target organization
    const [user] = await db.select().from(enterpriseUsers)
      .where(and(
        eq(enterpriseUsers.id, userId),
        eq(enterpriseUsers.organizationId, targetOrgId)
      ));

    if (!user) {
      return { success: false };
    }

    // Generate new token with updated org context
    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: targetOrgId, 
        roleId: user.roleId 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    await this.logAudit(targetOrgId, userId, 'switch_organization', 'authentication', targetOrgId);

    return { success: true, token };
  }

  // Performance: Get all user permissions at once
  async getUserPermissionMatrix(userId: string): Promise<{
    user: EnterpriseUser,
    role: SystemRole,
    permissions: string[],
    organization: Organization
  } | null> {
    const [user] = await db.select().from(enterpriseUsers).where(eq(enterpriseUsers.id, userId));
    if (!user) return null;

    const [role] = await db.select().from(systemRoles).where(eq(systemRoles.id, user.roleId));
    if (!role) return null;

    const [organization] = await db.select().from(organizations).where(eq(organizations.id, user.organizationId));
    if (!organization) return null;

    return {
      user,
      role,
      permissions: role.permissions as string[],
      organization
    };
  }
}

// Singleton instance
export const rbacService = EnterpriseRBAC.getInstance();