import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { 
  users, 
  organizations, 
  permissions, 
  rolePermissions, 
  userPermissions,
  userSessions,
  rbacAuditLog,
  roleHierarchy,
  RoleType,
  User,
  NewUser,
  defaultPermissions,
  defaultRolePermissions
} from '../shared/rbac-schema';
import { RBACBridge } from './rbac-bridge';

export interface AuthenticatedRequest extends Request {
  user?: User;
  permissions?: string[];
  organization?: any;
}

export class RBACService {
  private jwtSecret: string;
  private sessionTimeout: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'siyadah-ai-rbac-secret-key-change-in-production';
  }

  // Authentication Methods
  async authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const user = await RBACBridge.getUserByEmail(email);
      if (!user) {
        await this.logAuditEvent('FAILED_LOGIN', 'users', email, { reason: 'User not found' });
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      if (user.accountLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
        return { success: false, error: 'الحساب مقفل مؤقتاً، يرجى المحاولة لاحقاً' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await this.handleFailedLogin(user.id);
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      // Reset failed login attempts on successful login
      await RBACBridge.updateUser(user.id, { 
        lastLogin: new Date()
      });

      const token = this.generateToken(user);
      await this.createSession(user.id, token);
      
      await this.logAuditEvent('USER_LOGIN', 'users', user.id.toString(), { email });

      return { success: true, user, token };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'خطأ في النظام' };
    }
  }

  async handleFailedLogin(userId: number): Promise<void> {
    const user = await RBACBridge.getUserById(userId);
    if (!user) return;

    const attempts = (user.failedLoginAttempts || 0) + 1;
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      const lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await RBACBridge.updateUser(userId, {
        accountLocked: true
      });
      await this.logAuditEvent('ACCOUNT_LOCKED', 'users', userId.toString(), { attempts });
    }
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Session Management
  async createSession(userId: number, token: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + this.sessionTimeout);
    
    await RBACBridge.createSession({
      id: sessionId,
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
      isActive: true
    });
  }

  async validateSession(token: string): Promise<User | null> {
    const session = await RBACBridge.getSessionByToken(token);
    if (!session || !session.isActive || new Date() > session.expiresAt) {
      return null;
    }

    const user = await RBACBridge.getUserById(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    // Update last activity
    await RBACBridge.updateSession(session.id, { lastActivity: new Date() });
    
    return user;
  }

  async invalidateSession(token: string): Promise<boolean> {
    return await RBACBridge.deactivateSession(token);
  }

  // Authorization Methods
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await RBACBridge.getUserById(userId);
    if (!user) return [];

    const rolePermissions = await this.getRolePermissions(user.role);
    const userSpecificPermissions = await RBACBridge.getUserSpecificPermissions(userId);
    
    // Combine role permissions with user-specific overrides
    const allPermissions = new Set(rolePermissions);
    
    userSpecificPermissions.forEach((perm: any) => {
      if (perm.granted) {
        allPermissions.add(perm.permissionName);
      } else {
        allPermissions.delete(perm.permissionName);
      }
    });

    return Array.from(allPermissions);
  }

  async getRolePermissions(role: RoleType): Promise<string[]> {
    if (role === 'SYSTEM_SUPER_ADMIN') {
      return defaultPermissions.map(p => p.name);
    }
    
    return [...(defaultRolePermissions[role] || [])];
  }

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permission);
  }

  async hasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(perm => userPermissions.includes(perm));
  }

  async canAccessResource(userId: number, resource: string, action: string): Promise<boolean> {
    const permission = `${resource}:${action}`;
    return await this.hasPermission(userId, permission);
  }

  // Role Hierarchy Methods
  canManageRole(currentUserRole: RoleType, targetRole: RoleType): boolean {
    const currentLevel = roleHierarchy[currentUserRole]?.level || 0;
    const targetLevel = roleHierarchy[targetRole]?.level || 0;
    return currentLevel > targetLevel;
  }

  isHigherRole(role1: RoleType, role2: RoleType): boolean {
    const level1 = roleHierarchy[role1]?.level || 0;
    const level2 = roleHierarchy[role2]?.level || 0;
    return level1 > level2;
  }

  // User Management
  async createUser(userData: NewUser, createdBy: number): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const existingUser = await RBACBridge.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await RBACBridge.createUser({
        ...userData,
        password: hashedPassword
      });

      await this.logAuditEvent('USER_CREATED', 'users', user.id.toString(), { 
        email: user.email, 
        role: user.role 
      }, createdBy);

      return { success: true, user };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'خطأ في إنشاء المستخدم' };
    }
  }

  async updateUserRole(userId: number, newRole: RoleType, updatedBy: number): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await RBACBridge.getUserById(userId);
      if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
      }

      const updater = await RBACBridge.getUserById(updatedBy);
      if (!updater || !this.canManageRole(updater.role, newRole)) {
        return { success: false, error: 'ليس لديك صلاحية لتعيين هذا الدور' };
      }

      await RBACBridge.updateUser(userId, { role: newRole });
      
      await this.logAuditEvent('ROLE_CHANGED', 'users', userId.toString(), {
        oldRole: user.role,
        newRole
      }, updatedBy);

      return { success: true };
    } catch (error) {
      console.error('Update user role error:', error);
      return { success: false, error: 'خطأ في تحديث دور المستخدم' };
    }
  }

  // Permission Management
  async grantUserPermission(userId: number, permissionName: string, grantedBy: number, reason?: string, expiresAt?: Date): Promise<boolean> {
    try {
      await RBACBridge.grantUserPermission(userId, permissionName, grantedBy, reason);
      
      await this.logAuditEvent('PERMISSION_GRANTED', 'user_permissions', userId.toString(), {
        permission: permissionName,
        reason,
        expiresAt
      }, grantedBy);

      return true;
    } catch (error) {
      console.error('Grant permission error:', error);
      return false;
    }
  }

  async revokeUserPermission(userId: number, permissionName: string, revokedBy: number, reason?: string): Promise<boolean> {
    try {
      await RBACBridge.revokeUserPermission(userId, permissionName, revokedBy, reason);
      
      await this.logAuditEvent('PERMISSION_REVOKED', 'user_permissions', userId.toString(), {
        permission: permissionName,
        reason
      }, revokedBy);

      return true;
    } catch (error) {
      console.error('Revoke permission error:', error);
      return false;
    }
  }

  // Audit Logging
  async logAuditEvent(action: string, resource: string, resourceId: string, details: any, userId?: number): Promise<void> {
    try {
      await RBACBridge.createAuditLog({
        userId,
        action,
        resource,
        resourceId,
        newValue: details,
        createdBy: userId
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Middleware Functions
  authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    try {
      const user = await this.validateSession(token);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }

      req.user = user;
      req.permissions = await this.getUserPermissions(user.id);
      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(403).json({ success: false, error: 'Token verification failed' });
    }
  };

  requirePermission = (permission: string | string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const permissions = Array.isArray(permission) ? permission : [permission];
      const hasPermission = await this.hasAnyPermission(req.user.id, permissions);

      if (!hasPermission) {
        await this.logAuditEvent('ACCESS_DENIED', 'permissions', permission.toString(), {
          userId: req.user.id,
          requiredPermissions: permissions
        });
        return res.status(403).json({ 
          success: false, 
          error: 'ليس لديك صلاحية للوصول إلى هذا المورد',
          requiredPermissions: permissions
        });
      }

      next();
    };
  };

  requireRole = (roles: RoleType | RoleType[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          error: 'ليس لديك الدور المطلوب للوصول إلى هذا المورد',
          requiredRoles: allowedRoles
        });
      }

      next();
    };
  };

  // Organization Management
  async canAccessOrganization(userId: number, organizationId: number): Promise<boolean> {
    const user = await RBACBridge.getUserById(userId);
    if (!user) return false;

    // System admins can access all organizations
    if (user.role === 'SYSTEM_SUPER_ADMIN') return true;

    // Service provider admins can access client organizations
    if (user.role === 'SERVICE_PROVIDER_ADMIN') return true;

    // Users can access their own organization
    return user.organizationId === organizationId;
  }

  // Security Features
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await RBACBridge.getUserById(userId);
      if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await RBACBridge.updateUser(userId, { password: hashedPassword });
      
      await this.logAuditEvent('PASSWORD_CHANGED', 'users', userId.toString(), {}, userId);

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'خطأ في تغيير كلمة المرور' };
    }
  }

  async enableTwoFactor(userId: number): Promise<{ success: boolean; secret?: string; error?: string }> {
    try {
      // In a real implementation, you would generate a TOTP secret
      const secret = `SIYADAH${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
      
      await RBACBridge.updateUser(userId, { 
        twoFactorEnabled: true, 
        twoFactorSecret: secret 
      });
      
      await this.logAuditEvent('TWO_FACTOR_ENABLED', 'users', userId.toString(), {}, userId);

      return { success: true, secret };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      return { success: false, error: 'خطأ في تفعيل المصادقة الثنائية' };
    }
  }

  // System Health and Monitoring
  async getSystemHealthMetrics(): Promise<any> {
    const totalUsers = await RBACBridge.getTotalUsers();
    const activeUsers = await RBACBridge.getActiveUsers();
    const activeSessions = await RBACBridge.getActiveSessions();
    const recentAuditLogs = await RBACBridge.getRecentAuditLogs(24); // Last 24 hours
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: await RBACBridge.getUsersByRole()
      },
      sessions: {
        active: activeSessions,
        total: await RBACBridge.getTotalSessions()
      },
      security: {
        recentEvents: recentAuditLogs.length,
        criticalEvents: recentAuditLogs.filter((log: any) => 
          ['ACCOUNT_LOCKED', 'PERMISSION_DENIED', 'FAILED_LOGIN'].includes(log.action)
        ).length
      }
    };
  }
}

export const rbacService = new RBACService();