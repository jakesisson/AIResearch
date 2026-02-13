import { pgTable, text, varchar, timestamp, integer, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations table for multi-tenancy
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).unique(),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull().default("free"),
  maxUsers: integer("max_users").notNull().default(5),
  maxStorage: integer("max_storage_gb").notNull().default(1),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_org_domain").on(table.domain),
  index("idx_org_subscription").on(table.subscriptionTier),
]);

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("SAR"),
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
  maxUsers: integer("max_users").notNull(),
  maxStorage: integer("max_storage_gb").notNull(),
  features: jsonb("features").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 20 }).notNull(), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialEnd: timestamp("trial_end"),
  canceledAt: timestamp("canceled_at"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_sub_org").on(table.organizationId),
  index("idx_sub_status").on(table.status),
]);

// Billing invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("SAR"),
  status: varchar("status", { length: 20 }).notNull(), // draft, open, paid, void
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  downloadUrl: text("download_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_invoice_org").on(table.organizationId),
  index("idx_invoice_status").on(table.status),
]);

// Usage tracking
export const usageMetrics = pgTable("usage_metrics", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // api_calls, storage_used, users_active
  value: integer("value").notNull(),
  date: timestamp("date").notNull(),
  metadata: jsonb("metadata").default({}),
}, (table) => [
  index("idx_usage_org_date").on(table.organizationId, table.date),
  index("idx_usage_type").on(table.metricType),
]);

// SLA monitoring
export const slaMetrics = pgTable("sla_metrics", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").references(() => organizations.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // uptime, response_time, error_rate
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  threshold: decimal("threshold", { precision: 10, scale: 4 }),
  status: varchar("status", { length: 20 }).notNull(), // ok, warning, critical
}, (table) => [
  index("idx_sla_org_time").on(table.organizationId, table.timestamp),
  index("idx_sla_type").on(table.metricType),
]);

// API rate limiting
export const apiRateLimits = pgTable("api_rate_limits", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestCount: integer("request_count").notNull().default(0),
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  limit: integer("limit").notNull(),
}, (table) => [
  index("idx_rate_limit_org").on(table.organizationId),
  index("idx_rate_limit_window").on(table.windowStart, table.windowEnd),
]);

// Enhanced users table with organization support
export const saasUsers = pgTable("saas_users", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_org").on(table.organizationId),
  index("idx_user_email").on(table.email),
]);

// Type definitions
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type InsertUsageMetric = typeof usageMetrics.$inferInsert;
export type SLAMetric = typeof slaMetrics.$inferSelect;
export type InsertSLAMetric = typeof slaMetrics.$inferInsert;
export type SaasUser = typeof saasUsers.$inferSelect;
export type InsertSaasUser = typeof saasUsers.$inferInsert;

// Validation schemas
export const createOrganizationSchema = createInsertSchema(organizations);
export const createSubscriptionSchema = createInsertSchema(subscriptions);
export const createUserSchema = createInsertSchema(saasUsers);
export const createPlanSchema = createInsertSchema(subscriptionPlans);

// API request schemas
export const signupSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  domain: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  planId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePlanSchema = z.object({
  planId: z.string(),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePlanRequest = z.infer<typeof changePlanSchema>;