/**
 * Complete SaaS System - Enterprise Grade Implementation
 * Full multi-tenant platform with MongoDB integration
 */

import { mongodb } from './mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-secret-key-change-in-production';

// SaaS Entity Interfaces
interface SaasOrg {
  _id: string;
  name: string;
  domain?: string;
  tier: string;
  maxUsers: number;
  maxStorage: number;
  settings: any;
  created: Date;
  updated: Date;
}

interface SaasUser {
  _id: string;
  orgId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
  active: boolean;
  lastLogin?: Date;
  verified?: Date;
  twoFactor: boolean;
  avatar?: string;
  prefs: any;
  created: Date;
  updated: Date;
}

interface SaasSub {
  _id: string;
  orgId: string;
  planId: string;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  stripeSubId?: string;
  stripeCustomerId?: string;
  created: Date;
  updated: Date;
}

interface SaasPlan {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  price: string;
  currency: string;
  billing: string;
  maxUsers: number;
  maxStorage: number;
  features: string[];
  active: boolean;
  created: Date;
}

// Extended Request type
interface SaasRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
  organization?: SaasOrg;
}

export class CompleteSaasSystem {
  // Organization Management
  async createOrganization(data: {
    name: string;
    domain?: string;
    tier?: string;
    maxUsers?: number;
    maxStorage?: number;
  }): Promise<SaasOrg> {
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const organization: SaasOrg = {
      _id: orgId,
      name: data.name,
      domain: data.domain,
      tier: data.tier || 'trial',
      maxUsers: data.maxUsers || 5,
      maxStorage: data.maxStorage || 1,
      settings: {},
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_organizations').insertOne(organization);
    await this.createTrialSubscription(orgId);
    
    return organization;
  }

  async getOrganization(id: string): Promise<SaasOrg | null> {
    const org = await mongodb.collection('saas_organizations').findOne({ _id: id });
    return org as SaasOrg | null;
  }

  async updateOrgLimits(orgId: string, maxUsers: number, maxStorage: number): Promise<void> {
    await mongodb.collection('saas_organizations').updateOne(
      { _id: orgId },
      { $set: { maxUsers, maxStorage, updated: new Date() } }
    );
  }

  // User Management
  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    active?: boolean;
  }, orgId: string): Promise<SaasUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const org = await this.getOrganization(orgId);
    if (!org) throw new Error('Organization not found');

    const userCount = await this.getOrgUserCount(orgId);
    if (userCount >= org.maxUsers) {
      throw new Error('Organization user limit exceeded');
    }

    const user: SaasUser = {
      _id: userId,
      orgId,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      active: userData.active !== false,
      twoFactor: false,
      prefs: {},
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_users').insertOne(user);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{
    user: SaasUser;
    token: string;
    organization: SaasOrg;
  } | null> {
    const user = await mongodb.collection('saas_users').findOne({ email }) as SaasUser | null;
    if (!user || !user.active) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const organization = await this.getOrganization(user.orgId);
    if (!organization) return null;

    await mongodb.collection('saas_users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = jwt.sign(
      { userId: user._id, organizationId: user.orgId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token, organization };
  }

  async getOrgUsers(orgId: string): Promise<SaasUser[]> {
    const users = await mongodb.collection('saas_users')
      .find({ orgId })
      .toArray();
    return users as SaasUser[];
  }

  async getOrgUserCount(orgId: string): Promise<number> {
    return await mongodb.collection('saas_users').countDocuments({ orgId });
  }

  // Subscription Management
  async createTrialSubscription(orgId: string): Promise<SaasSub> {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const trialPlan = await this.getTrialPlan();
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const subscription: SaasSub = {
      _id: subId,
      orgId,
      planId: trialPlan._id,
      status: 'trialing',
      periodStart: new Date(),
      periodEnd: trialEnd,
      trialEnd,
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_subscriptions').insertOne(subscription);
    return subscription;
  }

  async getOrgSubscription(orgId: string): Promise<SaasSub | null> {
    const sub = await mongodb.collection('saas_subscriptions')
      .findOne({ orgId }, { sort: { created: -1 } });
    return sub as SaasSub | null;
  }

  async upgradePlan(orgId: string, planId: string): Promise<SaasSub> {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const currentSub = await this.getOrgSubscription(orgId);
    if (!currentSub) throw new Error('No active subscription found');

    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    const updatedData = {
      planId,
      status: 'active',
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      trialEnd: undefined,
      updated: new Date(),
    };

    await mongodb.collection('saas_subscriptions').updateOne(
      { _id: currentSub._id },
      { $set: updatedData }
    );

    await this.updateOrgLimits(orgId, plan.maxUsers, plan.maxStorage);

    return { ...currentSub, ...updatedData };
  }

  // Plans Management
  async getAllPlans(): Promise<SaasPlan[]> {
    const plans = await mongodb.collection('saas_subscription_plans')
      .find({ active: true })
      .toArray();
    return plans as SaasPlan[];
  }

  async getPlan(planId: string): Promise<SaasPlan | null> {
    const plan = await mongodb.collection('saas_subscription_plans').findOne({ _id: planId });
    return plan as SaasPlan | null;
  }

  async getTrialPlan(): Promise<SaasPlan> {
    let plan = await mongodb.collection('saas_subscription_plans').findOne({ name: 'trial' }) as SaasPlan | null;
    
    if (!plan) {
      const trialPlan: SaasPlan = {
        _id: 'plan_trial',
        name: 'trial',
        displayName: 'تجربة مجانية',
        description: 'تجربة مجانية لمدة 14 يوم مع جميع المميزات',
        price: '0.00',
        currency: 'SAR',
        billing: 'monthly',
        maxUsers: 5,
        maxStorage: 1,
        features: ['AI Agents', 'Basic Analytics', 'Email Support'],
        active: true,
        created: new Date(),
      };
      
      await mongodb.collection('saas_subscription_plans').insertOne(trialPlan);
      plan = trialPlan;
    }
    return plan;
  }

  // Usage Tracking
  async trackUsage(orgId: string, metricType: string, value: number, metadata?: any): Promise<void> {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await mongodb.collection('saas_usage_metrics').insertOne({
      _id: metricId,
      orgId,
      metricType,
      value,
      date: new Date(),
      metadata: metadata || {},
    });
  }

  async getUsageMetrics(orgId: string, metricType: string, startDate: Date, endDate: Date) {
    return await mongodb.collection('saas_usage_metrics')
      .find({
        orgId,
        metricType,
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: -1 })
      .toArray();
  }

  // Rate Limiting
  async checkRateLimit(orgId: string, endpoint: string, limit: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (60 * 1000));

    const requestCount = await mongodb.collection('saas_rate_limits').countDocuments({
      orgId,
      endpoint,
      windowStart: { $gte: windowStart }
    });

    if (requestCount >= limit) {
      return false;
    }

    const limitId = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await mongodb.collection('saas_rate_limits').insertOne({
      _id: limitId,
      orgId,
      endpoint,
      requestCount: 1,
      windowStart: now,
      windowEnd: new Date(now.getTime() + (60 * 1000)),
      limit,
    });

    return true;
  }

  // Analytics
  async getOrgAnalytics(orgId: string) {
    const users = await this.getOrgUserCount(orgId);
    const subscription = await this.getOrgSubscription(orgId);
    const usageToday = await this.getTodayUsage(orgId);

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
        renewsAt: subscription?.periodEnd || null,
      },
      usage: usageToday,
      limits: {
        storage: plan?.maxStorage || 0,
        users: plan?.maxUsers || 0,
      },
    };
  }

  private async getTodayUsage(orgId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usage = await mongodb.collection('saas_usage_metrics')
      .find({
        orgId,
        date: { $gte: today, $lte: tomorrow }
      })
      .toArray();

    return usage.reduce((acc: Record<string, number>, metric: any) => {
      acc[metric.metricType] = (acc[metric.metricType] || 0) + metric.value;
      return acc;
    }, {});
  }

  // Initialize Data
  async initializeData(): Promise<void> {
    try {
      const existingPlans = await mongodb.collection('saas_subscription_plans').findOne({});
      if (existingPlans) {
        console.log('✅ SaaS plans already exist');
        return;
      }

      const plans = [
        {
          _id: 'plan_trial',
          name: 'trial',
          displayName: 'تجربة مجانية',
          description: 'تجربة مجانية لمدة 14 يوم مع جميع المميزات',
          price: '0.00',
          currency: 'SAR',
          billing: 'monthly',
          maxUsers: 5,
          maxStorage: 1,
          features: ['AI Agents', 'Basic Analytics', 'Email Support', 'WhatsApp API'],
          active: true,
          created: new Date(),
        },
        {
          _id: 'plan_starter',
          name: 'starter',
          displayName: 'الباقة الأساسية',
          description: 'مثالي للشركات الصغيرة والناشئة',
          price: '199.00',
          currency: 'SAR',
          billing: 'monthly',
          maxUsers: 10,
          maxStorage: 5,
          features: ['AI Agents', 'Advanced Analytics', 'Email Support', 'WhatsApp API', 'Voice Calls'],
          active: true,
          created: new Date(),
        },
        {
          _id: 'plan_professional',
          name: 'professional',
          displayName: 'الباقة الاحترافية',
          description: 'للشركات المتنامية مع احتياجات متقدمة',
          price: '499.00',
          currency: 'SAR',
          billing: 'monthly',
          maxUsers: 50,
          maxStorage: 25,
          features: [
            'AI Agents', 'Advanced Analytics', 'Priority Support', 
            'WhatsApp API', 'Voice Calls', 'Custom Integrations',
            'Advanced Reports', 'Team Management'
          ],
          active: true,
          created: new Date(),
        },
        {
          _id: 'plan_enterprise',
          name: 'enterprise',
          displayName: 'الباقة المؤسسية',
          description: 'للمؤسسات الكبيرة مع الدعم الكامل',
          price: '1299.00',
          currency: 'SAR',
          billing: 'monthly',
          maxUsers: 500,
          maxStorage: 100,
          features: [
            'AI Agents', 'Advanced Analytics', '24/7 Support',
            'WhatsApp API', 'Voice Calls', 'Custom Integrations',
            'Advanced Reports', 'Team Management', 'SLA Guarantees',
            'Custom Development', 'Dedicated Manager'
          ],
          active: true,
          created: new Date(),
        },
      ];

      for (const plan of plans) {
        await mongodb.collection('saas_subscription_plans').insertOne(plan);
      }

      console.log('✅ SaaS subscription plans initialized');

      // Create demo organization
      const demoOrg = await this.createOrganization({
        name: 'شركة سيادة التجريبية',
        domain: 'demo.siyadah.ai',
        tier: 'professional',
        maxUsers: 50,
        maxStorage: 25,
      });

      await this.createUser({
        email: 'admin@demo.siyadah.ai',
        password: 'demo123456',
        firstName: 'أحمد',
        lastName: 'المدير',
        role: 'admin',
        active: true,
      }, demoOrg._id);

      console.log('✅ Demo organization created');
      console.log('📧 Demo login: admin@demo.siyadah.ai / demo123456');

    } catch (error) {
      console.error('❌ SaaS initialization failed:', error);
    }
  }

  // Middleware Functions
  authenticateToken = async (req: SaasRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        role: decoded.role,
      };

      const organization = await this.getOrganization(decoded.organizationId);
      if (!organization) {
        return res.status(403).json({ error: 'Organization not found' });
      }

      req.organization = organization;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  requireRole = (allowedRoles: string[]) => {
    return (req: SaasRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  };

  rateLimiter = (endpoint: string, baseLimit: number = 100) => {
    return async (req: SaasRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const subscription = await this.getOrgSubscription(req.user.organizationId);
        let limit = baseLimit;

        if (subscription) {
          const plan = await this.getPlan(subscription.planId);
          if (plan) {
            switch (plan.name) {
              case 'trial':
              case 'starter':
                limit = baseLimit;
                break;
              case 'professional':
                limit = baseLimit * 3;
                break;
              case 'enterprise':
                limit = baseLimit * 10;
                break;
            }
          }
        }

        const canProceed = await this.checkRateLimit(req.user.organizationId, endpoint, limit);
        
        if (!canProceed) {
          return res.status(429).json({ 
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60 
          });
        }

        await this.trackUsage(req.user.organizationId, 'api_calls', 1, {
          endpoint,
          method: req.method,
          ip: req.ip,
        });

        next();
      } catch (error) {
        return res.status(500).json({ error: 'Rate limiting service unavailable' });
      }
    };
  };
}

export const completeSaasSystem = new CompleteSaasSystem();