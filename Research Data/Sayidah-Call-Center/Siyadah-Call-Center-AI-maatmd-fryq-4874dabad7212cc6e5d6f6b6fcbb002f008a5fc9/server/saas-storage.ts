/**
 * SaaS Storage Implementation - MongoDB-based Multi-tenant Platform
 * Professional implementation with complete data isolation
 */

import { mongodb } from './mongodb';
import { 
  type Organization, type Subscription, type SaasUser, type SubscriptionPlan,
  type InsertOrganization, type InsertSubscription, type InsertSaasUser
} from '../shared/saas-schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-secret-key-change-in-production';

export class SaasStorageService {
  // Organization Management
  async createOrganization(data: Omit<InsertOrganization, 'id'>): Promise<Organization> {
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const organization: Organization = {
      _id: orgId,
      id: orgId,
      name: data.name,
      domain: data.domain || null,
      subscriptionTier: data.subscriptionTier || 'trial',
      maxUsers: data.maxUsers || 5,
      maxStorage: data.maxStorage || 1,
      settings: data.settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('saas_organizations').insertOne(organization);
    
    // Create default trial subscription
    await this.createTrialSubscription(orgId);
    
    return organization;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const org = await db.collection('saas_organizations').findOne({ id });
    return org as Organization | undefined;
  }

  async updateOrganizationLimits(orgId: string, maxUsers: number, maxStorage: number): Promise<void> {
    await db.collection('saas_organizations').updateOne(
      { id: orgId },
      { 
        $set: { 
          maxUsers, 
          maxStorage, 
          updatedAt: new Date() 
        } 
      }
    );
  }

  // User Management with Multi-tenancy
  async createUser(userData: Omit<InsertSaasUser, 'id' | 'organizationId'>, organizationId: string): Promise<SaasUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check organization user limits
    const org = await this.getOrganization(organizationId);
    if (!org) throw new Error('Organization not found');

    const userCount = await this.getOrganizationUserCount(organizationId);
    if (userCount >= org.maxUsers) {
      throw new Error('Organization user limit exceeded');
    }

    const user: SaasUser = {
      _id: userId,
      id: userId,
      organizationId,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || 'user',
      isActive: userData.isActive !== false,
      lastLoginAt: null,
      emailVerifiedAt: null,
      twoFactorEnabled: false,
      profileImageUrl: userData.profileImageUrl || null,
      preferences: userData.preferences || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('saas_users').insertOne(user);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: SaasUser; token: string; organization: Organization } | null> {
    const user = await db.collection('saas_users').findOne({ email }) as SaasUser | null;
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const organization = await this.getOrganization(user.organizationId);
    if (!organization) return null;

    // Update last login
    await db.collection('saas_users').updateOne(
      { id: user.id },
      { $set: { lastLoginAt: new Date() } }
    );

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token, organization };
  }

  async getOrganizationUsers(organizationId: string): Promise<SaasUser[]> {
    const users = await db.collection('saas_users')
      .find({ organizationId })
      .toArray();
    return users as SaasUser[];
  }

  async getOrganizationUserCount(organizationId: string): Promise<number> {
    return await db.collection('saas_users').countDocuments({ organizationId });
  }

  // Subscription Management
  async createTrialSubscription(organizationId: string): Promise<Subscription> {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trialPlan = await this.getTrialPlan();
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const subscription: Subscription = {
      _id: subId,
      id: subId,
      organizationId,
      planId: trialPlan.id,
      status: 'trialing',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      trialEnd,
      canceledAt: null,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('saas_subscriptions').insertOne(subscription);
    return subscription;
  }

  async getOrganizationSubscription(organizationId: string): Promise<Subscription | undefined> {
    const subscription = await db.collection('saas_subscriptions')
      .findOne(
        { organizationId },
        { sort: { createdAt: -1 } }
      );
    return subscription as Subscription | undefined;
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

    const updatedSub: Subscription = {
      ...currentSub,
      planId,
      status: 'active',
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      trialEnd: null,
      updatedAt: new Date(),
    };

    await db.collection('saas_subscriptions').updateOne(
      { id: currentSub.id },
      { $set: updatedSub }
    );

    // Update organization limits
    await this.updateOrganizationLimits(organizationId, plan.maxUsers, plan.maxStorage);

    return updatedSub;
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription) throw new Error('No active subscription found');

    await db.collection('saas_subscriptions').updateOne(
      { id: subscription.id },
      { 
        $set: {
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        }
      }
    );
  }

  // Plans Management
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const plans = await db.collection('saas_subscription_plans')
      .find({ isActive: true })
      .toArray();
    return plans as SubscriptionPlan[];
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | undefined> {
    const plan = await db.collection('saas_subscription_plans').findOne({ id: planId });
    return plan as SubscriptionPlan | undefined;
  }

  async getTrialPlan(): Promise<SubscriptionPlan> {
    let plan = await db.collection('saas_subscription_plans').findOne({ name: 'trial' }) as SubscriptionPlan | null;
    
    if (!plan) {
      // Create trial plan if doesn't exist
      const trialPlan: SubscriptionPlan = {
        _id: 'plan_trial',
        id: 'plan_trial',
        name: 'trial',
        displayName: 'تجربة مجانية',
        description: 'تجربة مجانية لمدة 14 يوم مع جميع المميزات',
        price: '0.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 5,
        maxStorage: 1,
        features: ['AI Agents', 'Basic Analytics', 'Email Support'],
        isActive: true,
        createdAt: new Date(),
      };
      
      await db.collection('saas_subscription_plans').insertOne(trialPlan);
      plan = trialPlan;
    }
    return plan;
  }

  // Usage Tracking
  async trackUsage(organizationId: string, metricType: string, value: number, metadata?: any): Promise<void> {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.collection('saas_usage_metrics').insertOne({
      _id: metricId,
      id: metricId,
      organizationId,
      metricType,
      value,
      date: new Date(),
      metadata: metadata || {},
    });
  }

  async getUsageMetrics(organizationId: string, metricType: string, startDate: Date, endDate: Date) {
    return await db.collection('saas_usage_metrics')
      .find({
        organizationId,
        metricType,
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: -1 })
      .toArray();
  }

  // Rate Limiting
  async checkRateLimit(organizationId: string, endpoint: string, limit: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (60 * 1000)); // 1-minute window

    // Count requests in current window
    const requestCount = await db.collection('saas_api_rate_limits').countDocuments({
      organizationId,
      endpoint,
      windowStart: { $gte: windowStart }
    });

    if (requestCount >= limit) {
      return false; // Rate limit exceeded
    }

    // Record this request
    const limitId = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('saas_api_rate_limits').insertOne({
      _id: limitId,
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

  // SLA Monitoring
  async recordSLAMetric(organizationId: string, metricType: string, value: number, threshold?: number): Promise<void> {
    const metricId = `sla_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let status = 'ok';
    if (threshold) {
      if (metricType === 'response_time' && value > threshold) status = 'warning';
      if (metricType === 'error_rate' && value > threshold) status = 'critical';
      if (metricType === 'uptime' && value < threshold) status = 'critical';
    }

    await db.collection('saas_sla_metrics').insertOne({
      _id: metricId,
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
    
    return await db.collection('saas_sla_metrics')
      .find({
        organizationId,
        metricType,
        timestamp: { $gte: startTime }
      })
      .sort({ timestamp: -1 })
      .toArray();
  }

  // Analytics Dashboard
  async getOrganizationAnalytics(organizationId: string) {
    const users = await this.getOrganizationUserCount(organizationId);
    const subscription = await this.getOrganizationSubscription(organizationId);
    const usageToday = await this.getTodayUsage(organizationId);

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

    const usage = await db.collection('saas_usage_metrics')
      .find({
        organizationId,
        date: { $gte: today, $lte: tomorrow }
      })
      .toArray();

    return usage.reduce((acc: Record<string, number>, metric: any) => {
      acc[metric.metricType] = (acc[metric.metricType] || 0) + metric.value;
      return acc;
    }, {});
  }

  // Initialize sample data
  async initializeSampleData(): Promise<void> {
    // Check if plans exist
    const existingPlans = await db.collection('saas_subscription_plans').findOne({});
    if (existingPlans) return;

    // Create subscription plans
    const plans = [
      {
        _id: 'plan_trial',
        id: 'plan_trial',
        name: 'trial',
        displayName: 'تجربة مجانية',
        description: 'تجربة مجانية لمدة 14 يوم مع جميع المميزات',
        price: '0.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 5,
        maxStorage: 1,
        features: ['AI Agents', 'Basic Analytics', 'Email Support', 'WhatsApp API'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: 'plan_starter',
        id: 'plan_starter',
        name: 'starter',
        displayName: 'الباقة الأساسية',
        description: 'مثالي للشركات الصغيرة والناشئة',
        price: '199.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 10,
        maxStorage: 5,
        features: ['AI Agents', 'Advanced Analytics', 'Email Support', 'WhatsApp API', 'Voice Calls'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: 'plan_professional',
        id: 'plan_professional',
        name: 'professional',
        displayName: 'الباقة الاحترافية',
        description: 'للشركات المتنامية مع احتياجات متقدمة',
        price: '499.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 50,
        maxStorage: 25,
        features: [
          'AI Agents', 'Advanced Analytics', 'Priority Support', 
          'WhatsApp API', 'Voice Calls', 'Custom Integrations',
          'Advanced Reports', 'Team Management'
        ],
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: 'plan_enterprise',
        id: 'plan_enterprise',
        name: 'enterprise',
        displayName: 'الباقة المؤسسية',
        description: 'للمؤسسات الكبيرة مع الدعم الكامل',
        price: '1299.00',
        currency: 'SAR',
        billingCycle: 'monthly',
        maxUsers: 500,
        maxStorage: 100,
        features: [
          'AI Agents', 'Advanced Analytics', '24/7 Support',
          'WhatsApp API', 'Voice Calls', 'Custom Integrations',
          'Advanced Reports', 'Team Management', 'SLA Guarantees',
          'Custom Development', 'Dedicated Manager'
        ],
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const plan of plans) {
      await db.collection('saas_subscription_plans').insertOne(plan);
    }

    console.log('✅ SaaS subscription plans initialized');
  }
}

export const saasStorage = new SaasStorageService();