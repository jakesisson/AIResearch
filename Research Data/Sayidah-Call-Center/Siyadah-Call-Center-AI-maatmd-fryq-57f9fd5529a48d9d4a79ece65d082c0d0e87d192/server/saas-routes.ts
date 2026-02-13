/**
 * Enterprise SaaS API Routes - Multi-tenant Platform
 * Implements global SaaS standards with complete functionality
 */

import type { Express } from 'express';
import { saasImplementation } from './saas-implementation';
import { 
  authenticateToken, requireRole, requireActiveSubscription, 
  rateLimiter, requireFeature, trackUsage, ensureDataIsolation,
  securityHeaders 
} from './saas-middleware';
import { signupSchema, loginSchema, changePlanSchema } from '../shared/saas-schema';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
}) : null;

export function setupSaasRoutes(app: Express) {
  // Apply security headers globally
  app.use('/api/saas', securityHeaders);

  // Public signup route
  app.post('/api/saas/signup', rateLimiter('signup', 5), async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Create organization
      const organization = await saasService.createOrganization({
        name: validatedData.organizationName,
        domain: validatedData.domain,
        subscriptionTier: 'trial',
        maxUsers: 5,
        maxStorage: 1,
      });

      // Create admin user
      const user = await saasService.createUser({
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'admin',
        isActive: true,
      }, organization.id);

      // Generate auth token
      const authResult = await saasService.authenticateUser(validatedData.email, validatedData.password);
      
      if (!authResult) {
        throw new Error('Failed to authenticate after signup');
      }

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: {
          user: {
            id: authResult.user.id,
            email: authResult.user.email,
            firstName: authResult.user.firstName,
            lastName: authResult.user.lastName,
            role: authResult.user.role,
          },
          organization: {
            id: authResult.organization.id,
            name: authResult.organization.name,
            domain: authResult.organization.domain,
            subscriptionTier: authResult.organization.subscriptionTier,
          },
          token: authResult.token,
        },
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Signup failed',
        code: 'SIGNUP_FAILED',
      });
    }
  });

  // Public login route
  app.post('/api/saas/login', rateLimiter('login', 10), async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const authResult = await saasService.authenticateUser(validatedData.email, validatedData.password);
      
      if (!authResult) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: authResult.user.id,
            email: authResult.user.email,
            firstName: authResult.user.firstName,
            lastName: authResult.user.lastName,
            role: authResult.user.role,
          },
          organization: {
            id: authResult.organization.id,
            name: authResult.organization.name,
            domain: authResult.organization.domain,
            subscriptionTier: authResult.organization.subscriptionTier,
          },
          token: authResult.token,
        },
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Login failed',
        code: 'LOGIN_FAILED',
      });
    }
  });

  // Get current user profile
  app.get('/api/saas/profile', authenticateToken, async (req: any, res) => {
    try {
      const user = await saasService.getOrganizationUsers(req.user.organizationId);
      const currentUser = user.find(u => u.id === req.user.userId);
      
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role,
          lastLoginAt: currentUser.lastLoginAt,
          preferences: currentUser.preferences,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Subscription Plans
  app.get('/api/saas/plans', async (req, res) => {
    try {
      const plans = await saasService.getAllPlans();
      res.json({
        success: true,
        data: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billingCycle: plan.billingCycle,
          maxUsers: plan.maxUsers,
          maxStorage: plan.maxStorage,
          features: plan.features,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get plans' });
    }
  });

  // Organization Analytics Dashboard
  app.get('/api/saas/analytics', 
    authenticateToken, 
    requireActiveSubscription,
    trackUsage('analytics_view'),
    async (req: any, res) => {
      try {
        const analytics = await saasService.getOrganizationAnalytics(req.user.organizationId);
        
        res.json({
          success: true,
          data: analytics,
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get analytics' });
      }
    }
  );

  // Usage Metrics
  app.get('/api/saas/usage/:metricType', 
    authenticateToken, 
    requireActiveSubscription,
    async (req: any, res) => {
      try {
        const { metricType } = req.params;
        const days = parseInt(req.query.days as string) || 7;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const metrics = await saasService.getUsageMetrics(
          req.user.organizationId, 
          metricType, 
          startDate, 
          endDate
        );
        
        res.json({
          success: true,
          data: metrics,
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get usage metrics' });
      }
    }
  );

  // Upgrade/Change Plan
  app.post('/api/saas/change-plan', 
    authenticateToken, 
    requireRole(['admin', 'owner']),
    rateLimiter('plan_change', 3),
    async (req: any, res) => {
      try {
        const validatedData = changePlanSchema.parse(req.body);
        
        const subscription = await saasService.upgradePlan(req.user.organizationId, validatedData.planId);
        
        res.json({
          success: true,
          message: 'Plan updated successfully',
          data: {
            subscriptionId: subscription.id,
            planId: subscription.planId,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          },
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message || 'Failed to change plan',
          code: 'PLAN_CHANGE_FAILED',
        });
      }
    }
  );

  // Create Stripe Payment Intent for Subscription
  app.post('/api/saas/create-payment-intent', 
    authenticateToken, 
    requireRole(['admin', 'owner']),
    async (req: any, res) => {
      if (!stripe) {
        return res.status(500).json({ error: 'Payment system not configured' });
      }

      try {
        const { planId, billingCycle } = req.body;
        
        const plan = await saasService.getPlan(planId);
        if (!plan) {
          return res.status(404).json({ error: 'Plan not found' });
        }

        const amount = Math.round(parseFloat(plan.price) * 100); // Convert to cents
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: plan.currency.toLowerCase(),
          metadata: {
            organizationId: req.user.organizationId,
            planId,
            billingCycle,
          },
        });

        res.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            amount,
            currency: plan.currency,
            planName: plan.displayName,
          },
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create payment intent' });
      }
    }
  );

  // Team Management
  app.get('/api/saas/team', 
    authenticateToken, 
    requireActiveSubscription,
    ensureDataIsolation,
    async (req: any, res) => {
      try {
        const users = await saasService.getOrganizationUsers(req.user.organizationId);
        
        res.json({
          success: true,
          data: users.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
          })),
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get team members' });
      }
    }
  );

  app.post('/api/saas/team/invite', 
    authenticateToken, 
    requireActiveSubscription,
    requireRole(['admin', 'owner']),
    rateLimiter('team_invite', 10),
    async (req: any, res) => {
      try {
        const { email, firstName, lastName, role = 'user' } = req.body;
        
        // Check user limits
        const userCount = await saasService.getOrganizationUserCount(req.user.organizationId);
        const org = await saasService.getOrganization(req.user.organizationId);
        
        if (userCount >= (org?.maxUsers || 5)) {
          return res.status(402).json({
            error: 'User limit reached for current plan',
            code: 'USER_LIMIT_EXCEEDED',
          });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12);
        
        const user = await saasService.createUser({
          email,
          password: tempPassword,
          firstName,
          lastName,
          role,
          isActive: true,
        }, req.user.organizationId);

        // TODO: Send invitation email with temp password
        
        res.status(201).json({
          success: true,
          message: 'User invited successfully',
          data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tempPassword, // In production, send via email only
          },
        });
      } catch (error: any) {
        res.status(400).json({
          error: error.message || 'Failed to invite user',
          code: 'INVITE_FAILED',
        });
      }
    }
  );

  // SLA Metrics
  app.get('/api/saas/sla/:metricType', 
    authenticateToken, 
    requireFeature('Advanced Analytics'),
    async (req: any, res) => {
      try {
        const { metricType } = req.params;
        const hours = parseInt(req.query.hours as string) || 24;
        
        const metrics = await saasService.getSLAMetrics(req.user.organizationId, metricType, hours);
        
        res.json({
          success: true,
          data: metrics,
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get SLA metrics' });
      }
    }
  );

  // Health check endpoint
  app.get('/api/saas/health', async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Record global SLA metric
      await saasService.recordSLAMetric('global', 'uptime', 1, 0.99);
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        services: {
          database: 'connected',
          auth: 'operational',
          billing: stripe ? 'operational' : 'unavailable',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: 'Service check failed',
      });
    }
  });
}