import { MongoClient, Db, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB-based Enterprise RBAC for thousands of users with complete data isolation
export interface Organization {
  _id: string;
  name: string;
  domain?: string;
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemRole {
  _id: string;
  name: string;
  nameAr: string;
  level: number;
  description?: string;
  descriptionAr?: string;
  isSystemRole: boolean;
  permissions: string[];
  createdAt: Date;
}

export interface EnterpriseUser {
  _id: string;
  organizationId: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  _id: string;
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface DataBoundary {
  _id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  accessLevel: 'public' | 'private' | 'restricted';
  createdAt: Date;
}

export class EnterpriseMongoRBAC {
  private static instance: EnterpriseMongoRBAC;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private permissionCache = new Map<string, string[]>();
  private roleCache = new Map<string, SystemRole>();

  static getInstance(): EnterpriseMongoRBAC {
    if (!EnterpriseMongoRBAC.instance) {
      EnterpriseMongoRBAC.instance = new EnterpriseMongoRBAC();
    }
    return EnterpriseMongoRBAC.instance;
  }

  async connect(): Promise<void> {
    if (this.client) return;

    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(mongoUrl);
    await this.client.connect();
    this.db = this.client.db('siyadah_enterprise_rbac');
    
    // Create indexes for performance with thousands of users
    await this.createIndexes();
    console.log('🔐 Enterprise MongoDB RBAC connected and indexed');
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    // Organization indexes
    await this.db.collection('organizations').createIndex({ domain: 1 }, { unique: true, sparse: true });
    await this.db.collection('organizations').createIndex({ plan: 1 });
    await this.db.collection('organizations').createIndex({ isActive: 1 });

    // User indexes - critical for performance with thousands of users
    await this.db.collection('users').createIndex({ organizationId: 1, email: 1 }, { unique: true });
    await this.db.collection('users').createIndex({ organizationId: 1 });
    await this.db.collection('users').createIndex({ email: 1 });
    await this.db.collection('users').createIndex({ roleId: 1 });
    await this.db.collection('users').createIndex({ isActive: 1 });
    await this.db.collection('users').createIndex({ lastLogin: 1 });

    // Role indexes
    await this.db.collection('roles').createIndex({ level: 1 }, { unique: true });
    await this.db.collection('roles').createIndex({ isSystemRole: 1 });

    // Audit log indexes - essential for compliance and performance
    await this.db.collection('audit_logs').createIndex({ organizationId: 1, createdAt: -1 });
    await this.db.collection('audit_logs').createIndex({ userId: 1, createdAt: -1 });
    await this.db.collection('audit_logs').createIndex({ action: 1 });
    await this.db.collection('audit_logs').createIndex({ resource: 1 });
    await this.db.collection('audit_logs').createIndex({ createdAt: -1 });

    // Data boundary indexes - critical for isolation
    await this.db.collection('data_boundaries').createIndex({ organizationId: 1, resourceType: 1, resourceId: 1 }, { unique: true });
    await this.db.collection('data_boundaries').createIndex({ organizationId: 1 });
    await this.db.collection('data_boundaries').createIndex({ resourceType: 1 });
  }

  // Organization Management
  async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    if (!this.db) throw new Error('Database not connected');

    const organization: Organization = {
      _id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: orgData.name || '',
      domain: orgData.domain,
      plan: orgData.plan || 'trial',
      isActive: orgData.isActive !== false,
      settings: orgData.settings || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.collection('organizations').insertOne(organization);
    await this.createDataBoundary(organization._id, 'organization', organization._id, 'private');
    await this.logAudit(organization._id, null, 'create', 'organization', organization._id);
    
    return organization;
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    if (!this.db) throw new Error('Database not connected');
    return await this.db.collection<Organization>('organizations').findOne({ _id: orgId });
  }

  async getOrganizations(page: number = 1, limit: number = 50): Promise<{ organizations: Organization[], total: number }> {
    if (!this.db) throw new Error('Database not connected');
    
    const skip = (page - 1) * limit;
    const organizations = await this.db.collection<Organization>('organizations')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await this.db.collection('organizations').countDocuments({});
    return { organizations, total };
  }

  // User Management with Complete Organization Isolation
  async createUser(userData: Partial<EnterpriseUser>): Promise<EnterpriseUser> {
    if (!this.db) throw new Error('Database not connected');
    if (!userData.organizationId) throw new Error('Organization ID is required');

    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : undefined;
    
    const user: EnterpriseUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: userData.organizationId,
      email: userData.email || '',
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roleId: userData.roleId || 'external_client_view',
      isActive: userData.isActive !== false,
      metadata: userData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure email is unique within organization
    const existingUser = await this.db.collection('users').findOne({
      organizationId: userData.organizationId,
      email: userData.email
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists in organization');
    }

    await this.db.collection('users').insertOne(user);
    await this.createDataBoundary(userData.organizationId, 'user', user._id, 'private');
    await this.logAudit(userData.organizationId, user._id, 'create', 'user', user._id);
    
    return user;
  }

  async getUsersInOrganization(orgId: string, page: number = 1, limit: number = 100): Promise<{ users: EnterpriseUser[], total: number }> {
    if (!this.db) throw new Error('Database not connected');
    
    const skip = (page - 1) * limit;
    const users = await this.db.collection<EnterpriseUser>('users')
      .find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await this.db.collection('users').countDocuments({ organizationId: orgId });
    return { users, total };
  }

  async authenticateUser(email: string, password: string, orgId?: string): Promise<{ user: EnterpriseUser; token: string } | null> {
    if (!this.db) throw new Error('Database not connected');
    
    const query: any = { email, isActive: true };
    if (orgId) query.organizationId = orgId;
    
    const user = await this.db.collection<EnterpriseUser>('users').findOne(query);
    
    if (!user || !user.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // Update last login
    await this.db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    const token = jwt.sign(
      { 
        userId: user._id, 
        organizationId: user.organizationId, 
        roleId: user.roleId 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    await this.logAudit(user.organizationId, user._id, 'login', 'authentication', user._id);
    
    return { user, token };
  }

  // Initialize System Roles
  async initializeSystemRoles(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const defaultRoles: SystemRole[] = [
      {
        _id: 'system_super_admin',
        name: 'System Super Admin',
        nameAr: 'مدير النظام الأعلى',
        level: 6,
        description: 'Full system access across all organizations',
        descriptionAr: 'وصول كامل للنظام عبر جميع المؤسسات',
        isSystemRole: true,
        permissions: ['*:*:global'],
        createdAt: new Date()
      },
      {
        _id: 'service_provider_admin',
        name: 'Service Provider Admin',
        nameAr: 'مدير مقدم الخدمة',
        level: 5,
        description: 'Manage multiple client organizations',
        descriptionAr: 'إدارة مؤسسات العملاء المتعددة',
        isSystemRole: false,
        permissions: ['organizations:*:global', 'users:*:organization', 'billing:*:organization'],
        createdAt: new Date()
      },
      {
        _id: 'client_account_manager',
        name: 'Client Account Manager',
        nameAr: 'مدير حساب العميل',
        level: 4,
        description: 'Manage organization and team members',
        descriptionAr: 'إدارة المؤسسة وأعضاء الفريق',
        isSystemRole: false,
        permissions: ['users:*:organization', 'settings:*:organization', 'data:read:organization'],
        createdAt: new Date()
      },
      {
        _id: 'supervisor',
        name: 'Supervisor',
        nameAr: 'المشرف',
        level: 3,
        description: 'Supervise team and access reports',
        descriptionAr: 'الإشراف على الفريق والوصول للتقارير',
        isSystemRole: false,
        permissions: ['users:read:organization', 'reports:read:organization', 'data:read:organization'],
        createdAt: new Date()
      },
      {
        _id: 'agent_employee',
        name: 'Agent/Employee',
        nameAr: 'الوكيل/الموظف',
        level: 2,
        description: 'Basic operational access',
        descriptionAr: 'وصول تشغيلي أساسي',
        isSystemRole: false,
        permissions: ['data:read:own', 'tasks:*:own'],
        createdAt: new Date()
      },
      {
        _id: 'external_client_view',
        name: 'External Client View',
        nameAr: 'عرض العميل الخارجي',
        level: 1,
        description: 'Read-only access to own data',
        descriptionAr: 'وصول للقراءة فقط للبيانات الخاصة',
        isSystemRole: false,
        permissions: ['data:read:own'],
        createdAt: new Date()
      }
    ];

    for (const role of defaultRoles) {
      await this.db.collection('roles').replaceOne(
        { _id: role._id },
        role,
        { upsert: true }
      );
    }

    // Clear cache after initialization
    this.roleCache.clear();
    this.permissionCache.clear();
  }

  async getSystemRoles(): Promise<SystemRole[]> {
    if (!this.db) throw new Error('Database not connected');
    return await this.db.collection<SystemRole>('roles').find({}).sort({ level: -1 }).toArray();
  }

  // Permission System - Optimized for thousands of users
  async hasPermission(userId: string, resource: string, action: string, scope: string = 'organization'): Promise<{
    hasPermission: boolean;
    roleLevel: number;
    roleName: string;
    reason: string;
    details: any;
  }> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const user = await this.db.collection<EnterpriseUser>('users').findOne({ _id: userId });
      if (!user) {
        return {
          hasPermission: false,
          roleLevel: 0,
          roleName: 'غير موجود',
          reason: 'المستخدم غير موجود',
          details: {}
        };
      }

      // Get role from cache or database
      let role = this.roleCache.get(user.roleId);
      if (!role) {
        role = await this.db.collection<SystemRole>('roles').findOne({ _id: user.roleId });
        if (!role) {
          return {
            hasPermission: false,
            roleLevel: 0,
            roleName: 'دور غير صالح',
            reason: 'الدور غير موجود',
            details: {}
          };
        }
        this.roleCache.set(user.roleId, role);
      }

      // System super admin has all permissions
      if (role._id === 'system_super_admin') {
        return {
          hasPermission: true,
          roleLevel: role.level,
          roleName: role.nameAr,
          reason: 'مدير النظام الأعلى - وصول كامل',
          details: { endpoint: `${resource}:${action}:${scope}` }
        };
      }

      const permissions = role.permissions;
      
      // Check exact permission match
      const exactPermission = `${resource}:${action}:${scope}`;
      if (permissions.includes(exactPermission)) {
        return {
          hasPermission: true,
          roleLevel: role.level,
          roleName: role.nameAr,
          reason: 'صلاحية مباشرة',
          details: { endpoint: exactPermission, permission: exactPermission }
        };
      }

      // Check wildcard permissions
      const wildcardChecks = [
        `${resource}:*:${scope}`,
        `${resource}:${action}:*`,
        `*:${action}:${scope}`,
        `*:*:${scope}`,
        `${resource}:*:*`,
        `*:*:*`
      ];

      for (const pattern of wildcardChecks) {
        if (permissions.includes(pattern)) {
          return {
            hasPermission: true,
            roleLevel: role.level,
            roleName: role.nameAr,
            reason: 'صلاحية بنمط البدل',
            details: { endpoint: exactPermission, permission: pattern }
          };
        }
      }

      return {
        hasPermission: false,
        roleLevel: role.level,
        roleName: role.nameAr,
        reason: 'لا توجد صلاحية مطابقة',
        details: { 
          endpoint: exactPermission, 
          userPermissions: permissions.slice(0, 5),
          totalPermissions: permissions.length
        }
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        hasPermission: false,
        roleLevel: 0,
        roleName: 'خطأ',
        reason: 'خطأ في فحص الصلاحية',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Data Isolation - Critical for SaaS with thousands of organizations
  async createDataBoundary(orgId: string, resourceType: string, resourceId: string, accessLevel: 'public' | 'private' | 'restricted'): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const boundary: DataBoundary = {
      _id: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: orgId,
      resourceType,
      resourceId,
      accessLevel,
      createdAt: new Date()
    };

    await this.db.collection('data_boundaries').replaceOne(
      { organizationId: orgId, resourceType, resourceId },
      boundary,
      { upsert: true }
    );
  }

  async enforceDataBoundary(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');

    const user = await this.db.collection<EnterpriseUser>('users').findOne({ _id: userId });
    if (!user) return false;

    // System super admin bypasses boundaries
    if (user.roleId === 'system_super_admin') return true;

    const boundary = await this.db.collection<DataBoundary>('data_boundaries').findOne({
      organizationId: user.organizationId,
      resourceType,
      resourceId
    });

    return !!boundary;
  }

  // Audit Logging - Essential for compliance
  async logAudit(orgId: string, userId: string | null, action: string, resource: string, resourceId?: string, metadata?: any): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const auditLog: AuditLog = {
      _id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: orgId,
      userId,
      action,
      resource,
      resourceId,
      metadata: metadata || {},
      createdAt: new Date()
    };

    await this.db.collection('audit_logs').insertOne(auditLog);
  }

  async getAuditLogs(orgId: string, page: number = 1, limit: number = 50): Promise<{ logs: AuditLog[], total: number }> {
    if (!this.db) throw new Error('Database not connected');
    
    const skip = (page - 1) * limit;
    const logs = await this.db.collection<AuditLog>('audit_logs')
      .find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await this.db.collection('audit_logs').countDocuments({ organizationId: orgId });
    return { logs, total };
  }

  // Performance: Batch operations for scale
  async validateBatchPermissions(userId: string, operations: Array<{resource: string, action: string, scope?: string}>): Promise<Array<{operation: any, allowed: boolean, details: any}>> {
    const results = [];
    
    for (const op of operations) {
      const result = await this.hasPermission(userId, op.resource, op.action, op.scope || 'organization');
      results.push({ 
        operation: op, 
        allowed: result.hasPermission,
        details: result
      });
    }
    
    return results;
  }

  // Organization switching for multi-tenant users
  async switchOrganization(userId: string, targetOrgId: string): Promise<{ success: boolean, token?: string }> {
    if (!this.db) throw new Error('Database not connected');

    const user = await this.db.collection<EnterpriseUser>('users').findOne({
      _id: userId,
      organizationId: targetOrgId,
      isActive: true
    });

    if (!user) {
      return { success: false };
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        organizationId: targetOrgId, 
        roleId: user.roleId 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    await this.logAudit(targetOrgId, userId, 'switch_organization', 'authentication', targetOrgId);

    return { success: true, token };
  }

  // Get complete user permission matrix for UI
  async getUserPermissionMatrix(userId: string): Promise<{
    user: EnterpriseUser,
    role: SystemRole,
    permissions: string[],
    organization: Organization
  } | null> {
    if (!this.db) throw new Error('Database not connected');

    const user = await this.db.collection<EnterpriseUser>('users').findOne({ _id: userId });
    if (!user) return null;

    const role = await this.db.collection<SystemRole>('roles').findOne({ _id: user.roleId });
    if (!role) return null;

    const organization = await this.db.collection<Organization>('organizations').findOne({ _id: user.organizationId });
    if (!organization) return null;

    return {
      user,
      role,
      permissions: role.permissions,
      organization
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

// Singleton instance
export const enterpriseRBAC = EnterpriseMongoRBAC.getInstance();