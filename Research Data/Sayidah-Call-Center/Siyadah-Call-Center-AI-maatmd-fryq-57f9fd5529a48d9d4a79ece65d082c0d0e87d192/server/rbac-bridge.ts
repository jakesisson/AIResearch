// Bridge service to integrate RBAC with existing MongoDB schema
import { IUser, InsertUser } from '../shared/schema';
import { User, NewUser, RoleType, roleHierarchy } from '../shared/rbac-schema';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

export class RBACBridge {
  // Convert existing IUser to RBAC User format
  static convertToRBACUser(iUser: IUser): User {
    return {
      id: parseInt(iUser._id) || 0,
      email: iUser.email,
      password: iUser.password,
      firstName: iUser.fullName.split(' ')[0] || 'User',
      lastName: iUser.fullName.split(' ').slice(1).join(' ') || 'Name',
      role: this.mapRoleToRBAC(iUser.role),
      organizationId: 1, // Default organization
      departmentId: null,
      supervisorId: null,
      isActive: iUser.isActive,
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockoutUntil: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      apiKeyHash: null,
      metadata: {},
      createdAt: iUser.createdAt,
      updatedAt: iUser.createdAt,
      createdBy: null,
      updatedBy: null
    };
  }

  // Convert RBAC User to existing IUser format
  static convertToIUser(rbacUser: User): IUser {
    return {
      _id: rbacUser.id.toString(),
      username: rbacUser.email.split('@')[0],
      password: rbacUser.password,
      email: rbacUser.email,
      fullName: `${rbacUser.firstName} ${rbacUser.lastName}`,
      role: this.mapRoleFromRBAC(rbacUser.role),
      avatar: '',
      isActive: rbacUser.isActive,
      createdAt: rbacUser.createdAt
    };
  }

  // Map existing roles to RBAC roles
  private static mapRoleToRBAC(existingRole: string): RoleType {
    const roleMap: Record<string, RoleType> = {
      'admin': 'SYSTEM_SUPER_ADMIN',
      'manager': 'SERVICE_PROVIDER_ADMIN',
      'supervisor': 'SUPERVISOR',
      'agent': 'AGENT_EMPLOYEE',
      'client': 'EXTERNAL_CLIENT_VIEW',
      'user': 'AGENT_EMPLOYEE'
    };
    return roleMap[existingRole.toLowerCase()] || 'AGENT_EMPLOYEE';
  }

  // Map RBAC roles back to existing system
  private static mapRoleFromRBAC(rbacRole: RoleType): string {
    const roleMap: Record<RoleType, string> = {
      'SYSTEM_SUPER_ADMIN': 'admin',
      'SERVICE_PROVIDER_ADMIN': 'manager',
      'CLIENT_ACCOUNT_MANAGER': 'manager',
      'SUPERVISOR': 'supervisor',
      'AGENT_EMPLOYEE': 'agent',
      'EXTERNAL_CLIENT_VIEW': 'client'
    };
    return roleMap[rbacRole] || 'agent';
  }

  // Enhanced storage methods with RBAC compatibility
  static async getUserByEmail(email: string): Promise<User | null> {
    const iUser = await storage.getUserByEmail(email);
    return iUser ? this.convertToRBACUser(iUser) : null;
  }

  static async getUserById(id: number): Promise<User | null> {
    const iUser = await storage.getUserById(id.toString());
    return iUser ? this.convertToRBACUser(iUser) : null;
  }

  static async createUser(userData: NewUser): Promise<User> {
    // Convert RBAC user data to existing format
    const insertUser: InsertUser = {
      username: userData.email.split('@')[0],
      password: userData.password, // Already hashed
      email: userData.email,
      fullName: `${userData.firstName} ${userData.lastName}`,
      role: this.mapRoleFromRBAC(userData.role),
      isActive: true
    };

    const createdUser = await storage.createUser(insertUser);
    return this.convertToRBACUser(createdUser);
  }

  static async updateUser(id: number, updates: Partial<User>): Promise<void> {
    // Convert RBAC updates to existing format
    const iUserUpdates: Partial<IUser> = {};
    
    if (updates.email) iUserUpdates.email = updates.email;
    if (updates.isActive !== undefined) iUserUpdates.isActive = updates.isActive;
    if (updates.firstName || updates.lastName) {
      iUserUpdates.fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }
    if (updates.role) {
      iUserUpdates.role = this.mapRoleFromRBAC(updates.role);
    }

    await storage.updateUser(id.toString(), iUserUpdates);
  }

  // Create default RBAC admin if not exists
  static async ensureDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByEmail('admin@siyadah.ai');
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminData: NewUser = {
        email: 'admin@siyadah.ai',
        password: hashedPassword,
        confirmPassword: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SYSTEM_SUPER_ADMIN'
      };

      await this.createUser(adminData);
      console.log('✅ Default RBAC admin created: admin@siyadah.ai / admin123');
    }
  }

  // Get all users in RBAC format
  static async getAllUsers(): Promise<User[]> {
    const iUsers = await storage.getAllUsers();
    return iUsers.map(iUser => this.convertToRBACUser(iUser));
  }

  // Mock RBAC-specific methods that don't exist in current storage
  static async createSession(session: any): Promise<void> {
    // For now, we'll track sessions in memory
    // In production, this would be stored in database
  }

  static async getSessionByToken(token: string): Promise<any> {
    // Mock session validation
    return null;
  }

  static async updateSession(sessionId: string, updates: any): Promise<void> {
    // Mock session update
  }

  static async deactivateSession(token: string): Promise<boolean> {
    // Mock session deactivation
    return true;
  }

  static async getUserSpecificPermissions(userId: number): Promise<Array<{ permissionName: string; granted: boolean }>> {
    // Return empty for now - can be enhanced later
    return [];
  }

  static async grantUserPermission(userId: number, permissionName: string, grantedBy: number, reason?: string): Promise<void> {
    // Mock permission granting
  }

  static async revokeUserPermission(userId: number, permissionName: string, revokedBy: number, reason?: string): Promise<void> {
    // Mock permission revoking
  }

  static async createAuditLog(log: any): Promise<void> {
    // For now, just log to console
    console.log('🔐 RBAC Audit:', log);
  }

  static async getRecentAuditLogs(hours: number): Promise<any[]> {
    // Return empty for now
    return [];
  }

  static async getTotalUsers(): Promise<number> {
    const users = await storage.getAllUsers();
    return users.length;
  }

  static async getActiveUsers(): Promise<number> {
    const users = await storage.getAllUsers();
    return users.filter(user => user.isActive).length;
  }

  static async getUsersByRole(): Promise<Record<string, number>> {
    const users = await storage.getAllUsers();
    const roleCount: Record<string, number> = {};
    
    users.forEach(user => {
      const rbacRole = this.mapRoleToRBAC(user.role);
      roleCount[rbacRole] = (roleCount[rbacRole] || 0) + 1;
    });
    
    return roleCount;
  }

  static async getActiveSessions(): Promise<number> {
    // Mock active sessions count
    return 5;
  }

  static async getTotalSessions(): Promise<number> {
    // Mock total sessions count
    return 25;
  }
}

// Initialize default admin on startup
RBACBridge.ensureDefaultAdmin().catch(console.error);