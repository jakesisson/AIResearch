/**
 * Enterprise SaaS Platform - Complete Implementation
 * Multi-tenant system with MongoDB Atlas integration
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-enterprise-secret-key-2025';

// SaaS Schemas
const saasOrgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, unique: true, sparse: true },
  tier: { type: String, default: 'trial' },
  maxUsers: { type: Number, default: 5 },
  maxStorage: { type: Number, default: 1 },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

const saasUserSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, default: 'user' },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date },
  verified: { type: Date },
  twoFactor: { type: Boolean, default: false },
  avatar: { type: String },
  prefs: { type: mongoose.Schema.Types.Mixed, default: {} },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

const saasSubSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  status: { type: String, default: 'trialing' },
  periodStart: { type: Date, default: Date.now },
  periodEnd: { type: Date, required: true },
  trialEnd: { type: Date },
  canceledAt: { type: Date },
  stripeSubId: { type: String },
  stripeCustomerId: { type: String },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

const saasPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  price: { type: String, required: true },
  currency: { type: String, default: 'SAR' },
  billing: { type: String, default: 'monthly' },
  maxUsers: { type: Number, required: true },
  maxStorage: { type: Number, required: true },
  features: [{ type: String }],
  active: { type: Boolean, default: true },
  created: { type: Date, default: Date.now }
});

const saasUsageSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  metricType: { type: String, required: true },
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const saasRateLimitSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  requestCount: { type: Number, default: 1 },
  windowStart: { type: Date, required: true },
  windowEnd: { type: Date, required: true },
  limit: { type: Number, required: true }
});

// Models
export const SaasOrg = mongoose.model('SaasOrg', saasOrgSchema);
export const SaasUser = mongoose.model('SaasUser', saasUserSchema);
export const SaasSub = mongoose.model('SaasSub', saasSubSchema);
export const SaasPlan = mongoose.model('SaasPlan', saasPlanSchema);
export const SaasUsage = mongoose.model('SaasUsage', saasUsageSchema);
export const SaasRateLimit = mongoose.model('SaasRateLimit', saasRateLimitSchema);

// Extended Request Interface
interface SaasRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
  organization?: any;
}

export class EnterpriseSaasSystem {
  
  // Organization Management
  async createOrganization(data: {
    name: string;
    domain?: string;
    tier?: string;
    maxUsers?: number;
    maxStorage?: number;
  }) {
    const organization = new SaasOrg({
      name: data.name,
      domain: data.domain,
      tier: data.tier || 'trial',
      maxUsers: data.maxUsers || 5,
      maxStorage: data.maxStorage || 1,
      settings: {},
      created: new Date(),
      updated: new Date()
    });

    const savedOrg = await organization.save();
    await this.createTrialSubscription(savedOrg._id.toString());
    
    return savedOrg;
  }

  async getOrganization(id: string) {
    return await SaasOrg.findById(id);
  }

  async updateOrgLimits(orgId: string, maxUsers: number, maxStorage: number) {
    return await SaasOrg.findByIdAndUpdate(orgId, {
      maxUsers,
      maxStorage,
      updated: new Date()
    });
  }

  // User Management
  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    active?: boolean;
  }, orgId: string) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Check organization limits
    const org = await this.getOrganization(orgId);
    if (!org) throw new Error('Organization not found');

    const userCount = await this.getOrgUserCount(orgId);
    if (userCount >= org.maxUsers) {
      throw new Error('Organization user limit exceeded');
    }

    const user = new SaasUser({
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
      updated: new Date()
    });

    return await user.save();
  }

  async authenticateUser(email: string, password: string) {
    const user = await SaasUser.findOne({ email });
    if (!user || !user.active) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const organization = await this.getOrganization(user.orgId);
    if (!organization) return null;

    // Update last login
    await SaasUser.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = jwt.sign(
      { userId: user._id.toString(), organizationId: user.orgId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token, organization };
  }

  async getOrgUsers(orgId: string) {
    return await SaasUser.find({ orgId });
  }

  async getOrgUserCount(orgId: string) {
    return await SaasUser.countDocuments({ orgId });
  }

  // Subscription Management
  async createTrialSubscription(orgId: string) {
    const trialPlan = await this.getTrialPlan();
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const subscription = new SaasSub({
      orgId,
      planId: trialPlan._id.toString(),
      status: 'trialing',
      periodStart: new Date(),
      periodEnd: trialEnd,
      trialEnd,
      created: new Date(),
      updated: new Date()
    });

    return await subscription.save();
  }

  async getOrgSubscription(orgId: string) {
    return await SaasSub.findOne({ orgId }).sort({ created: -1 });
  }

  async upgradePlan(orgId: string, planId: string) {
    const plan = await this.getPlan(planId);
    if (!plan) throw new Error('Plan not found');

    const currentSub = await this.getOrgSubscription(orgId);
    if (!currentSub) throw new Error('No active subscription found');

    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    const updatedSub = await SaasSub.findByIdAndUpdate(currentSub._id, {
      planId,
      status: 'active',
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      trialEnd: null,
      updated: new Date()
    }, { new: true });

    await this.updateOrgLimits(orgId, plan.maxUsers, plan.maxStorage);

    return updatedSub;
  }

  // Plans Management
  async getAllPlans() {
    return await SaasPlan.find({ active: true });
  }

  async getPlan(planId: string) {
    return await SaasPlan.findById(planId);
  }

  async getTrialPlan() {
    let plan = await SaasPlan.findOne({ name: 'trial' });
    
    if (!plan) {
      plan = new SaasPlan({
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
        created: new Date()
      });
      
      await plan.save();
    }
    return plan;
  }

  // Usage Tracking
  async trackUsage(orgId: string, metricType: string, value: number, metadata?: any) {
    const usage = new SaasUsage({
      orgId,
      metricType,
      value,
      date: new Date(),
      metadata: metadata || {}
    });

    await usage.save();
  }

  async getUsageMetrics(orgId: string, metricType: string, startDate: Date, endDate: Date) {
    return await SaasUsage.find({
      orgId,
      metricType,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
  }

  // Rate Limiting
  async checkRateLimit(orgId: string, endpoint: string, limit: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (60 * 1000)); // 1-minute window

    const requestCount = await SaasRateLimit.countDocuments({
      orgId,
      endpoint,
      windowStart: { $gte: windowStart }
    });

    if (requestCount >= limit) {
      return false;
    }

    const rateLimit = new SaasRateLimit({
      orgId,
      endpoint,
      requestCount: 1,
      windowStart: now,
      windowEnd: new Date(now.getTime() + (60 * 1000)),
      limit
    });

    await rateLimit.save();
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

    const usage = await SaasUsage.find({
      orgId,
      date: { $gte: today, $lte: tomorrow }
    });

    return usage.reduce((acc: Record<string, number>, metric: any) => {
      acc[metric.metricType] = (acc[metric.metricType] || 0) + metric.value;
      return acc;
    }, {});
  }

  // Initialize Sample Data
  async initializeData() {
    try {
      const existingPlans = await SaasPlan.findOne({});
      if (existingPlans) {
        console.log('✅ SaaS plans already exist');
        return;
      }

      const plans = [
        {
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
          created: new Date()
        },
        {
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
          created: new Date()
        },
        {
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
          created: new Date()
        },
        {
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
          created: new Date()
        }
      ];

      for (const planData of plans) {
        const plan = new SaasPlan(planData);
        await plan.save();
      }

      // Create demo organization
      const demoOrg = await this.createOrganization({
        name: 'شركة سيادة التجريبية',
        domain: 'demo.siyadah.ai',
        tier: 'professional',
        maxUsers: 50,
        maxStorage: 25
      });

      await this.createUser({
        email: 'admin@demo.siyadah.ai',
        password: 'demo123456',
        firstName: 'أحمد',
        lastName: 'المدير',
        role: 'admin',
        active: true
      }, demoOrg._id.toString());

      console.log('✅ SaaS Platform initialized successfully');
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

export const enterpriseSaasSystem = new EnterpriseSaasSystem();