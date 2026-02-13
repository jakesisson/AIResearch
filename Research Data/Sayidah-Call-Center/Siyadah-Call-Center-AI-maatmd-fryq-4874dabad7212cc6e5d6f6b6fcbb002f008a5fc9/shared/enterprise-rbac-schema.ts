import { pgTable, text, varchar, timestamp, jsonb, boolean, integer, index, unique } from "drizzle-orm/pg-core";

// Organizations - Multi-tenant isolation
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  domain: varchar("domain").unique(),
  plan: varchar("plan").notNull().default("trial"), // trial, starter, professional, enterprise
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_org_domain").on(table.domain),
  index("idx_org_plan").on(table.plan)
]);

// Global System Roles with clear hierarchy
export const systemRoles = pgTable("system_roles", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar").notNull(),
  level: integer("level").notNull(), // 1-6 hierarchy
  description: text("description"),
  descriptionAr: text("description_ar"),
  isSystemRole: boolean("is_system_role").default(false),
  permissions: jsonb("permissions").default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_role_level").on(table.level),
  unique("unique_role_level").on(table.level)
]);

// Permissions with clear resource mapping
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey(),
  resource: varchar("resource").notNull(), // e.g., "users", "organizations", "billing"
  action: varchar("action").notNull(), // create, read, update, delete, manage
  scope: varchar("scope").notNull(), // global, organization, own
  description: text("description"),
  descriptionAr: text("description_ar"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_permission_resource").on(table.resource),
  index("idx_permission_action").on(table.action),
  unique("unique_permission").on(table.resource, table.action, table.scope)
]);

// Role-Permission mapping for fine-grained control
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey(),
  roleId: varchar("role_id").notNull().references(() => systemRoles.id),
  permissionId: varchar("permission_id").notNull().references(() => permissions.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_role_permission").on(table.roleId, table.permissionId)
]);

// Users with organization isolation
export const enterpriseUsers = pgTable("enterprise_users", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  email: varchar("email").notNull(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  roleId: varchar("role_id").notNull().references(() => systemRoles.id),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_org").on(table.organizationId),
  index("idx_user_email").on(table.email),
  index("idx_user_role").on(table.roleId),
  unique("unique_user_email_org").on(table.email, table.organizationId)
]);

// API Keys for system access with scope control
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").references(() => enterpriseUsers.id),
  name: varchar("name").notNull(),
  keyHash: varchar("key_hash").notNull(),
  scopes: jsonb("scopes").default([]),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_api_key_org").on(table.organizationId),
  index("idx_api_key_hash").on(table.keyHash)
]);

// Audit logs for compliance and security
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").references(() => enterpriseUsers.id),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata").default({}),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_org").on(table.organizationId),
  index("idx_audit_user").on(table.userId),
  index("idx_audit_action").on(table.action),
  index("idx_audit_created").on(table.createdAt)
]);

// Data isolation boundaries for multi-tenant security
export const dataBoundaries = pgTable("data_boundaries", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  resourceType: varchar("resource_type").notNull(),
  resourceId: varchar("resource_id").notNull(),
  accessLevel: varchar("access_level").notNull(), // public, private, restricted
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_boundary_org").on(table.organizationId),
  index("idx_boundary_resource").on(table.resourceType, table.resourceId),
  unique("unique_resource_boundary").on(table.organizationId, table.resourceType, table.resourceId)
]);

// TypeScript types
export type Organization = typeof organizations.$inferSelect;
export type SystemRole = typeof systemRoles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type EnterpriseUser = typeof enterpriseUsers.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type DataBoundary = typeof dataBoundaries.$inferSelect;

// Insert types
export type InsertOrganization = typeof organizations.$inferInsert;
export type InsertSystemRole = typeof systemRoles.$inferInsert;
export type InsertPermission = typeof permissions.$inferInsert;
export type InsertEnterpriseUser = typeof enterpriseUsers.$inferInsert;
export type InsertApiKey = typeof apiKeys.$inferInsert;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type InsertDataBoundary = typeof dataBoundaries.$inferInsert;