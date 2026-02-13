import { pgTable, text, timestamp, boolean, integer, jsonb, serial, unique, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Global SaaS Standard Role Definitions
export const roleHierarchy = {
  SYSTEM_SUPER_ADMIN: {
    level: 100,
    name: 'System Super Admin',
    description: 'Full backend access, system settings, billing, platform configurations'
  },
  SERVICE_PROVIDER_ADMIN: {
    level: 90,
    name: 'Service Provider Admin',
    description: 'Manage client accounts, assign roles, view usage statistics, billing control'
  },
  CLIENT_ACCOUNT_MANAGER: {
    level: 80,
    name: 'Client Account Manager',
    description: 'Control team users, access logs, company-specific dashboards'
  },
  SUPERVISOR: {
    level: 70,
    name: 'Supervisor',
    description: 'Oversee agents, review logs, monitor performance, assign tasks'
  },
  AGENT_EMPLOYEE: {
    level: 60,
    name: 'Agent/Employee',
    description: 'Limited access to assigned modules only'
  },
  EXTERNAL_CLIENT_VIEW: {
    level: 50,
    name: 'External Client View',
    description: 'Read-only dashboard access for performance and analytics'
  }
} as const;

export type RoleType = keyof typeof roleHierarchy;

// Users table with RBAC support
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').$type<RoleType>().notNull().default('AGENT_EMPLOYEE'),
  organizationId: integer('organization_id'),
  departmentId: integer('department_id'),
  supervisorId: integer('supervisor_id'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLocked: boolean('account_locked').default(false),
  lockoutUntil: timestamp('lockout_until'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  apiKeyHash: text('api_key_hash'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  orgIdx: index('users_organization_idx').on(table.organizationId),
  activeIdx: index('users_active_idx').on(table.isActive)
}));

// Organizations/Companies
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  type: text('type').notNull().default('CLIENT'), // CLIENT, SERVICE_PROVIDER, SYSTEM
  parentOrganizationId: integer('parent_organization_id'),
  billingTier: text('billing_tier').default('BASIC'), // BASIC, PREMIUM, ENTERPRISE
  maxUsers: integer('max_users').default(10),
  maxAgents: integer('max_agents').default(3),
  features: jsonb('features').$type<string[]>().default([]),
  settings: jsonb('settings').$type<Record<string, any>>().default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Departments within organizations
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  organizationId: integer('organization_id').notNull(),
  managerId: integer('manager_id'),
  description: text('description'),
  settings: jsonb('settings').$type<Record<string, any>>().default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Permissions system
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  resource: text('resource').notNull(), // e.g., 'opportunities', 'ai_agents', 'settings'
  action: text('action').notNull(), // e.g., 'create', 'read', 'update', 'delete', 'execute'
  conditions: jsonb('conditions').$type<Record<string, any>>().default({}),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'CORE', 'ADMIN', 'BILLING'
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  resourceActionIdx: unique('resource_action_unique').on(table.resource, table.action),
  categoryIdx: index('permissions_category_idx').on(table.category)
}));

// Role-Permission mappings
export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  role: text('role').$type<RoleType>().notNull(),
  permissionId: integer('permission_id').notNull(),
  granted: boolean('granted').default(true),
  conditions: jsonb('conditions').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by')
}, (table) => ({
  rolePermissionIdx: unique('role_permission_unique').on(table.role, table.permissionId)
}));

// User-specific permission overrides
export const userPermissions = pgTable('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  permissionId: integer('permission_id').notNull(),
  granted: boolean('granted').notNull(),
  reason: text('reason'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by')
}, (table) => ({
  userPermissionIdx: unique('user_permission_unique').on(table.userId, table.permissionId)
}));

// Audit log for RBAC changes
export const rbacAuditLog = pgTable('rbac_audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  action: text('action').notNull(), // e.g., 'USER_CREATED', 'ROLE_CHANGED', 'PERMISSION_GRANTED'
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by')
}, (table) => ({
  userIdx: index('audit_log_user_idx').on(table.userId),
  actionIdx: index('audit_log_action_idx').on(table.action),
  createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt)
}));

// User sessions for session management
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token').unique().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActivity: timestamp('last_activity').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
  tokenIdx: index('sessions_token_idx').on(table.token),
  activeIdx: index('sessions_active_idx').on(table.isActive)
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  failedLoginAttempts: true,
  accountLocked: true,
  lockoutUntil: true
}).extend({
  confirmPassword: z.string().min(8),
  role: z.enum(['SYSTEM_SUPER_ADMIN', 'SERVICE_PROVIDER_ADMIN', 'CLIENT_ACCOUNT_MANAGER', 'SUPERVISOR', 'AGENT_EMPLOYEE', 'EXTERNAL_CLIENT_VIEW'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = z.infer<typeof insertOrganizationSchema>;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserPermission = typeof userPermissions.$inferSelect;
export type RBACAdvanced = typeof rbacAuditLog.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;

// Permission categories and definitions
export const permissionCategories = {
  CORE: 'Core Business Operations',
  ADMIN: 'Administrative Functions',
  BILLING: 'Billing and Subscription Management',
  SECURITY: 'Security and Access Control',
  ANALYTICS: 'Reports and Analytics',
  INTEGRATIONS: 'External Integrations',
  VOICE: 'Voice and Communication',
  AI: 'AI and Automation Features'
} as const;

// Default permissions by category
export const defaultPermissions = [
  // Core Business Operations
  { name: 'opportunities:read', resource: 'opportunities', action: 'read', category: 'CORE' },
  { name: 'opportunities:create', resource: 'opportunities', action: 'create', category: 'CORE' },
  { name: 'opportunities:update', resource: 'opportunities', action: 'update', category: 'CORE' },
  { name: 'opportunities:delete', resource: 'opportunities', action: 'delete', category: 'CORE' },
  
  // AI Agents
  { name: 'ai_agents:read', resource: 'ai_agents', action: 'read', category: 'AI' },
  { name: 'ai_agents:execute', resource: 'ai_agents', action: 'execute', category: 'AI' },
  { name: 'ai_agents:configure', resource: 'ai_agents', action: 'configure', category: 'AI' },
  
  // Voice and Communication
  { name: 'voice:make_calls', resource: 'voice', action: 'execute', category: 'VOICE' },
  { name: 'whatsapp:send_messages', resource: 'whatsapp', action: 'execute', category: 'VOICE' },
  
  // Administrative
  { name: 'users:read', resource: 'users', action: 'read', category: 'ADMIN' },
  { name: 'users:create', resource: 'users', action: 'create', category: 'ADMIN' },
  { name: 'users:update', resource: 'users', action: 'update', category: 'ADMIN' },
  { name: 'users:delete', resource: 'users', action: 'delete', category: 'ADMIN' },
  
  // Settings
  { name: 'settings:read', resource: 'settings', action: 'read', category: 'ADMIN' },
  { name: 'settings:update', resource: 'settings', action: 'update', category: 'ADMIN' },
  { name: 'settings:api_keys', resource: 'settings', action: 'manage_keys', category: 'SECURITY' },
  
  // Analytics
  { name: 'analytics:read', resource: 'analytics', action: 'read', category: 'ANALYTICS' },
  { name: 'reports:generate', resource: 'reports', action: 'generate', category: 'ANALYTICS' },
  
  // Billing
  { name: 'billing:read', resource: 'billing', action: 'read', category: 'BILLING' },
  { name: 'billing:manage', resource: 'billing', action: 'manage', category: 'BILLING' },
  
  // Security
  { name: 'security:audit_logs', resource: 'security', action: 'read', category: 'SECURITY' },
  { name: 'security:manage', resource: 'security', action: 'manage', category: 'SECURITY' }
] as const;

// Default role-permission mappings
export const defaultRolePermissions = {
  SYSTEM_SUPER_ADMIN: 'ALL', // Gets all permissions
  SERVICE_PROVIDER_ADMIN: [
    'opportunities:read', 'opportunities:create', 'opportunities:update',
    'ai_agents:read', 'ai_agents:execute', 'ai_agents:configure',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'settings:read', 'settings:update', 'settings:api_keys',
    'analytics:read', 'reports:generate',
    'billing:read', 'billing:manage',
    'security:audit_logs', 'security:manage',
    'voice:make_calls', 'whatsapp:send_messages'
  ],
  CLIENT_ACCOUNT_MANAGER: [
    'opportunities:read', 'opportunities:create', 'opportunities:update',
    'ai_agents:read', 'ai_agents:execute',
    'users:read', 'users:create', 'users:update',
    'settings:read', 'analytics:read', 'reports:generate',
    'voice:make_calls', 'whatsapp:send_messages'
  ],
  SUPERVISOR: [
    'opportunities:read', 'opportunities:create', 'opportunities:update',
    'ai_agents:read', 'ai_agents:execute',
    'users:read', 'analytics:read', 'reports:generate',
    'voice:make_calls', 'whatsapp:send_messages'
  ],
  AGENT_EMPLOYEE: [
    'opportunities:read', 'opportunities:create',
    'ai_agents:read', 'ai_agents:execute',
    'voice:make_calls', 'whatsapp:send_messages'
  ],
  EXTERNAL_CLIENT_VIEW: [
    'opportunities:read', 'analytics:read', 'reports:generate'
  ]
} as const;