/**
 * Enterprise SaaS Services - Multi-tenant Architecture
 * Implements global SaaS standards with full scalability
 */

import { db } from './db';
import { 
  organizations, subscriptions, subscriptionPlans, invoices, 
  usageMetrics, slaMetrics, saasUsers, apiRateLimits,
  type Organization, type Subscription, type SaasUser, type SubscriptionPlan,
  type InsertOrganization, type InsertSubscription, type InsertSaasUser
} from '../shared/saas-schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-secret-key-change-in-production';

export class SaasService {
  // Organization Management
  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [organization] = await db.insert(organizations).values({
      ...data,
      id: orgId,
    }).returning();

    // Create default subscription (trial)
    await this.createTrialSubscription(orgId);
    
    return organization;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async updateOrganizationLimits(orgId: string, maxUsers: number, maxStorage: number): Promise<void> {
    await db.update(organizations)
      .set({ maxUsers, maxStorage, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));
  }

  // User Management with Multi-tenancy
  async createUser(userData: InsertSaasUser, organizationId: string): Promise<SaasUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check organization user limits
    const org = await this.getOrganization(organizationId);
    if (!org) throw new Error('Organization not found');

    const userCount = await this.getOrganizationUserCount(organizationId);
    if (userCount >= org.maxUsers) {
      throw new Error('Organization user limit exceeded');
    }

    const [user] = await db.insert(saasUsers).values({
      ...userData,
      id: userId,
      organizationId,
      password: hashedPassword,
    }).returning();

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: SaasUser; token: string; organization: Organization } | null> {
    const [user] = await db.select().from(saasUsers).where(eq(saasUsers.email, email));
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const organization = await this.getOrganization(user.organizationId);
    if (!organization) return null;

    // Update last login
    await db.update(saasUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(saasUsers.id, user.id));

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token, organization };
  }

  async getOrganizationUsers(organizationId: string): Promise<SaasUser[]> {
    return await db.select().from(saasUsers).where(eq(saasUsers.organizationId, organizationId));
  }

  async getOrganizationUserCount(organizationId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(saasUsers)
      .where(eq(saasUsers.organizationId, organizationId));
    return result[0]?.count || 0;
  }

  // Subscription Management
  async createTrialSubscription(organizationId: string): Promise<Subscription> {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trialPlan = await this.getTrialPlan();
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const [subscription] = await db.insert(subscriptions).values({
      id: subId,
      organizationId,
      planId: trialPlan.id,
      status: 'trialing',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      trialEnd,
    }).returning();

    return subscription;
  }

  async getOrganizationSubscription(organizationId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async upgradePlan(organizationId: string, planId: string): Promise<Subscription> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const currentSub = await this.getOrganizationSubscription(organizationId);
    if (!currentSub) throw new Error('No active subscription found');

    // Update subscription
    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1); // Monthly billing

    const [updatedSub] = await db.update(subscriptions)
      .set({
        planId,
        status: 'active',
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        trialEnd: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, currentSub.id))
      .returning();

    // Update organization limits
    await this.updateOrganizationLimits(organizationId, plan.maxUsers, plan.maxStorage);

    return updatedSub;
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription) throw new Error('No active subscription found');

    await db.update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  // Plans Management
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
    return plan;
  }

  async getTrialPlan(): Promise<SubscriptionPlan> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, 'trial'));
    if (!plan) {
      // Create trial plan if doesn't exist
      const trialPlanId = 'plan_trial';
      const [newPlan] = await db.insert(subscriptionPlans).values({
        id: trialPlanId,
        name: 'trial',
        displayName: 'Free Trial',
        description: '14-day free trial with full features',
        price: '0.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 5,
        maxStorage: 1,
        features: ['AI Agents', 'Basic Analytics', 'Email Support'],
      }).returning();
      return newPlan;
    }
    return plan;
  }

  // Usage Tracking
  async trackUsage(organizationId: string, metricType: string, value: number, metadata?: any): Promise<void> {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(usageMetrics).values({
      id: metricId,
      organizationId,
      metricType,
      value,
      date: new Date(),
      metadata: metadata || {},
    });
  }

  async getUsageMetrics(organizationId: string, metricType: string, startDate: Date, endDate: Date) {
    return await db.select()
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.organizationId, organizationId),
          eq(usageMetrics.metricType, metricType),
          gte(usageMetrics.date, startDate),
          lte(usageMetrics.date, endDate)
        )
      )
      .orderBy(desc(usageMetrics.date));
  }

  // Rate Limiting
  async checkRateLimit(organizationId: string, endpoint: string, limit: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (60 * 1000)); // 1-minute window

    // Get or create rate limit record
    let [rateLimitRecord] = await db.select()
      .from(apiRateLimits)
      .where(
        and(
          eq(apiRateLimits.organizationId, organizationId),
          eq(apiRateLimits.endpoint, endpoint),
          gte(apiRateLimits.windowStart, windowStart)
        )
      );

    if (!rateLimitRecord) {
      // Create new rate limit record
      const limitId = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(apiRateLimits).values({
        id: limitId,
        organizationId,
        endpoint,
        requestCount: 1,
        windowStart: now,
        windowEnd: new Date(now.getTime() + (60 * 1000)),
        limit,
      });
      return true;
    }

    if (rateLimitRecord.requestCount >= limit) {
      return false; // Rate limit exceeded
    }

    // Increment request count
    await db.update(apiRateLimits)
      .set({ requestCount: rateLimitRecord.requestCount + 1 })
      .where(eq(apiRateLimits.id, rateLimitRecord.id));

    return true;
  }

  // SLA Monitoring
  async recordSLAMetric(organizationId: string, metricType: string, value: number, threshold?: number): Promise<void> {
    const metricId = `sla_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let status = 'ok';
    if (threshold) {
      if (metricType === 'response_time' && value > threshold) status = 'warning';
      if (metricType === 'error_rate' && value > threshold) status = 'critical';
      if (metricType === 'uptime' && value < threshold) status = 'critical';
    }

    await db.insert(slaMetrics).values({
      id: metricId,
      organizationId,
      metricType,
      value: value.toString(),
      timestamp: new Date(),
      threshold: threshold?.toString(),
      status,
    });
  }

  async getSLAMetrics(organizationId: string, metricType: string, hours: number = 24) {
    const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return await db.select()
      .from(slaMetrics)
      .where(
        and(
          eq(slaMetrics.organizationId, organizationId),
          eq(slaMetrics.metricType, metricType),
          gte(slaMetrics.timestamp, startTime)
        )
      )
      .orderBy(desc(slaMetrics.timestamp));
  }

  // Analytics Dashboard
  async getOrganizationAnalytics(organizationId: string) {
    const [users, subscription, usageToday] = await Promise.all([
      this.getOrganizationUserCount(organizationId),
      this.getOrganizationSubscription(organizationId),
      this.getTodayUsage(organizationId),
    ]);

    const plan = subscription ? await this.getPlan(subscription.planId) : null;

    return {
      users: {
        active: users,
        limit: plan?.maxUsers || 0,
        percentage: plan ? Math.round((users / plan.maxUsers) * 100) : 0,
      },
      subscription: {
        status: subscription?.status || 'none',
        plan: plan?.displayName || 'No Plan',
        renewsAt: subscription?.currentPeriodEnd || null,
      },
      usage: usageToday,
      limits: {
        storage: plan?.maxStorage || 0,
        users: plan?.maxUsers || 0,
      },
    };
  }

  private async getTodayUsage(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usage = await db.select()
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.organizationId, organizationId),
          gte(usageMetrics.date, today),
          lte(usageMetrics.date, tomorrow)
        )
      );

    return usage.reduce((acc, metric) => {
      acc[metric.metricType] = (acc[metric.metricType] || 0) + metric.value;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const saasService = new SaasService();