// Extension to the existing storage interface for RBAC functionality
import { User, NewUser, Organization, UserSession, RBACAdvanced } from '../shared/rbac-schema';

export interface RBACStorage {
  // User Management
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<void>;
  deleteUser(id: number): Promise<void>;
  getTotalUsers(): Promise<number>;
  getActiveUsers(): Promise<number>;
  getUsersByRole(): Promise<Record<string, number>>;

  // Session Management
  createSession(session: Omit<UserSession, 'createdAt'>): Promise<void>;
  getSessionByToken(token: string): Promise<UserSession | null>;
  updateSession(sessionId: string, updates: Partial<UserSession>): Promise<void>;
  deactivateSession(token: string): Promise<boolean>;
  getActiveSessions(): Promise<number>;
  getTotalSessions(): Promise<number>;
  cleanupExpiredSessions(): Promise<number>;

  // Permission Management
  getUserSpecificPermissions(userId: number): Promise<Array<{ permissionName: string; granted: boolean }>>;
  grantUserPermission(userId: number, permissionName: string, grantedBy: number, reason?: string, expiresAt?: Date): Promise<void>;
  revokeUserPermission(userId: number, permissionName: string, revokedBy: number, reason?: string): Promise<void>;

  // Audit Logging
  createAuditLog(log: Omit<RBACAdvanced, 'id' | 'createdAt'>): Promise<void>;
  getRecentAuditLogs(hours: number): Promise<RBACAdvanced[]>;
  getAuditLogsByUser(userId: number, limit?: number): Promise<RBACAdvanced[]>;

  // Organization Management
  getOrganizationById(id: number): Promise<Organization | null>;
  getUsersByOrganization(organizationId: number): Promise<User[]>;
}

// In-memory implementation for development
export class MemoryRBACStorage implements RBACStorage {
  private users: Map<number, User> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private userPermissions: Map<string, { permissionName: string; granted: boolean; grantedBy: number; reason?: string }> = new Map();
  private auditLogs: RBACAdvanced[] = [];
  private organizations: Map<number, Organization> = new Map();
  private nextUserId = 1;
  private nextAuditId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default system admin
    const defaultAdmin: User = {
      id: 1,
      email: 'admin@siyadah.ai',
      password: '$2b$12$LQv3c1yqBWVHxkd0LQ1u/eBLDZjBAzFD4M2I6M7ZIzDRJq6RzP.VC', // password: admin123
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SYSTEM_SUPER_ADMIN',
      organizationId: 1,
      departmentId: null,
      supervisorId: null,
      isActive: true,
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      accountLocked: false,
      lockoutUntil: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      apiKeyHash: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      updatedBy: null
    };

    this.users.set(1, defaultAdmin);
    this.nextUserId = 2;

    // Create default organization
    const defaultOrg: Organization = {
      id: 1,
      name: 'Siyadah AI',
      slug: 'siyadah-ai',
      type: 'SERVICE_PROVIDER',
      parentOrganizationId: null,
      billingTier: 'ENTERPRISE',
      maxUsers: 1000,
      maxAgents: 100,
      features: ['ALL_FEATURES'],
      settings: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.organizations.set(1, defaultOrg);
  }

  // User Management
  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.nextUserId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
      this.users.set(id, user);
    }
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getTotalUsers(): Promise<number> {
    return this.users.size;
  }

  async getActiveUsers(): Promise<number> {
    return Array.from(this.users.values()).filter(user => user.isActive).length;
  }

  async getUsersByRole(): Promise<Record<string, number>> {
    const roleCount: Record<string, number> = {};
    for (const user of this.users.values()) {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    }
    return roleCount;
  }

  // Session Management
  async createSession(session: Omit<UserSession, 'createdAt'>): Promise<void> {
    const fullSession: UserSession = {
      ...session,
      createdAt: new Date()
    };
    this.sessions.set(session.token, fullSession);
  }

  async getSessionByToken(token: string): Promise<UserSession | null> {
    return this.sessions.get(token) || null;
  }

  async updateSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.id === sessionId) {
        Object.assign(session, updates);
        this.sessions.set(token, session);
        break;
      }
    }
  }

  async deactivateSession(token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (session) {
      session.isActive = false;
      this.sessions.set(token, session);
      return true;
    }
    return false;
  }

  async getActiveSessions(): Promise<number> {
    return Array.from(this.sessions.values()).filter(session => 
      session.isActive && new Date() < session.expiresAt
    ).length;
  }

  async getTotalSessions(): Promise<number> {
    return this.sessions.size;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Permission Management
  async getUserSpecificPermissions(userId: number): Promise<Array<{ permissionName: string; granted: boolean }>> {
    const permissions: Array<{ permissionName: string; granted: boolean }> = [];
    
    for (const [key, perm] of this.userPermissions.entries()) {
      if (key.startsWith(`${userId}:`)) {
        permissions.push({
          permissionName: perm.permissionName,
          granted: perm.granted
        });
      }
    }
    
    return permissions;
  }

  async grantUserPermission(userId: number, permissionName: string, grantedBy: number, reason?: string, expiresAt?: Date): Promise<void> {
    const key = `${userId}:${permissionName}`;
    this.userPermissions.set(key, {
      permissionName,
      granted: true,
      grantedBy,
      reason
    });
  }

  async revokeUserPermission(userId: number, permissionName: string, revokedBy: number, reason?: string): Promise<void> {
    const key = `${userId}:${permissionName}`;
    this.userPermissions.set(key, {
      permissionName,
      granted: false,
      grantedBy: revokedBy,
      reason
    });
  }

  // Audit Logging
  async createAuditLog(log: Omit<RBACAdvanced, 'id' | 'createdAt'>): Promise<void> {
    const auditLog: RBACAdvanced = {
      ...log,
      id: this.nextAuditId++,
      createdAt: new Date()
    };
    
    this.auditLogs.push(auditLog);
    
    // Keep only last 10000 logs to prevent memory issues
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-5000);
    }
  }

  async getRecentAuditLogs(hours: number): Promise<RBACAdvanced[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.auditLogs.filter(log => log.createdAt > cutoff);
  }

  async getAuditLogsByUser(userId: number, limit: number = 100): Promise<RBACAdvanced[]> {
    return this.auditLogs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  // Organization Management
  async getOrganizationById(id: number): Promise<Organization | null> {
    return this.organizations.get(id) || null;
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.organizationId === organizationId);
  }
}

// Export singleton instance
export const rbacStorage = new MemoryRBACStorage();