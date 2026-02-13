/**
 * Enterprise SaaS API Routes - Complete Implementation
 * Professional multi-tenant platform endpoints
 */

import type { Express } from 'express';
import jwt from 'jsonwebtoken';
import { enterpriseSaasSystem } from './saas-enterprise';

export function setupSaasRoutes(app: Express) {
  console.log('🚀 Setting up Enterprise SaaS API Routes...');

  // Public Routes (No Authentication Required)
  
  // Organization Signup
  app.post('/api/saas/signup', async (req, res) => {
    try {
      const { organizationName, domain, firstName, lastName, email, password } = req.body;

      if (!organizationName || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Organization name, email, and password are required' 
        });
      }

      // Create organization
      const organization = await enterpriseSaasSystem.createOrganization({
        name: organizationName,
        domain,
        tier: 'trial',
        maxUsers: 5,
        maxStorage: 1
      });

      // Create admin user
      const user = await enterpriseSaasSystem.createUser({
        email,
        password,
        firstName,
        lastName,
        role: 'admin',
        active: true
      }, organization._id.toString());

      // Generate token
      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          organizationId: organization._id.toString(), 
          role: user.role 
        },
        process.env.JWT_SECRET || 'saas-enterprise-secret-key-2025',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          organization,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create organization' 
      });
    }
  });

  // User Login
  app.post('/api/saas/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      const result = await enterpriseSaasSystem.authenticateUser(email, password);
      
      if (!result) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: result.user._id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role
          },
          organization: {
            id: result.organization._id,
            name: result.organization.name,
            domain: result.organization.domain,
            tier: result.organization.tier
          },
          token: result.token
        }
      });

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Login failed' 
      });
    }
  });

  // Get Available Plans
  app.get('/api/saas/plans', async (req, res) => {
    try {
      const plans = await enterpriseSaasSystem.getAllPlans();
      
      res.json({
        success: true,
        data: plans.map(plan => ({
          id: plan._id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billing: plan.billing,
          maxUsers: plan.maxUsers,
          maxStorage: plan.maxStorage,
          features: plan.features
        }))
      });

    } catch (error: any) {
      console.error('Plans error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch plans' 
      });
    }
  });

  // Protected Routes (Authentication Required)

  // Get Organization Analytics
  app.get('/api/saas/analytics', 
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.rateLimiter('/api/saas/analytics', 50),
    async (req: any, res) => {
      try {
        const analytics = await enterpriseSaasSystem.getOrgAnalytics(req.user.organizationId);
        
        res.json({
          success: true,
          data: analytics
        });

      } catch (error: any) {
        console.error('Analytics error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to fetch analytics' 
        });
      }
    }
  );

  // Get Organization Team
  app.get('/api/saas/team',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.rateLimiter('/api/saas/team', 50),
    async (req: any, res) => {
      try {
        const users = await enterpriseSaasSystem.getOrgUsers(req.user.organizationId);
        
        res.json({
          success: true,
          data: users.map(user => ({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            active: user.active,
            lastLogin: user.lastLogin,
            created: user.created
          }))
        });

      } catch (error: any) {
        console.error('Team error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to fetch team' 
        });
      }
    }
  );

  // Create Team Member
  app.post('/api/saas/team',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.requireRole(['admin', 'manager']),
    enterpriseSaasSystem.rateLimiter('/api/saas/team', 20),
    async (req: any, res) => {
      try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password) {
          return res.status(400).json({ 
            success: false, 
            error: 'Email and password are required' 
          });
        }

        const user = await enterpriseSaasSystem.createUser({
          email,
          password,
          firstName,
          lastName,
          role: role || 'user',
          active: true
        }, req.user.organizationId);

        res.json({
          success: true,
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            active: user.active
          }
        });

      } catch (error: any) {
        console.error('Create user error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to create user' 
        });
      }
    }
  );

  // Get Organization Subscription
  app.get('/api/saas/subscription',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.rateLimiter('/api/saas/subscription', 30),
    async (req: any, res) => {
      try {
        const subscription = await enterpriseSaasSystem.getOrgSubscription(req.user.organizationId);
        
        if (!subscription) {
          return res.json({
            success: true,
            data: null
          });
        }

        const plan = await enterpriseSaasSystem.getPlan(subscription.planId);

        res.json({
          success: true,
          data: {
            id: subscription._id,
            status: subscription.status,
            periodStart: subscription.periodStart,
            periodEnd: subscription.periodEnd,
            trialEnd: subscription.trialEnd,
            plan: plan ? {
              id: plan._id,
              name: plan.name,
              displayName: plan.displayName,
              price: plan.price,
              currency: plan.currency
            } : null
          }
        });

      } catch (error: any) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to fetch subscription' 
        });
      }
    }
  );

  // Upgrade Plan
  app.post('/api/saas/upgrade',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.requireRole(['admin']),
    enterpriseSaasSystem.rateLimiter('/api/saas/upgrade', 10),
    async (req: any, res) => {
      try {
        const { planId } = req.body;

        if (!planId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Plan ID is required' 
          });
        }

        const subscription = await enterpriseSaasSystem.upgradePlan(req.user.organizationId, planId);
        
        res.json({
          success: true,
          data: {
            id: subscription._id,
            status: subscription.status,
            periodStart: subscription.periodStart,
            periodEnd: subscription.periodEnd,
            planId: subscription.planId
          }
        });

      } catch (error: any) {
        console.error('Upgrade error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to upgrade plan' 
        });
      }
    }
  );

  // Get Usage Metrics
  app.get('/api/saas/usage',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.rateLimiter('/api/saas/usage', 30),
    async (req: any, res) => {
      try {
        const { metricType, days } = req.query;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (parseInt(days as string) || 30));

        const metrics = await enterpriseSaasSystem.getUsageMetrics(
          req.user.organizationId,
          metricType as string || 'api_calls',
          startDate,
          endDate
        );

        res.json({
          success: true,
          data: metrics.map(metric => ({
            metricType: metric.metricType,
            value: metric.value,
            date: metric.date,
            metadata: metric.metadata
          }))
        });

      } catch (error: any) {
        console.error('Usage metrics error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to fetch usage metrics' 
        });
      }
    }
  );

  // Track Custom Usage
  app.post('/api/saas/track',
    enterpriseSaasSystem.authenticateToken,
    enterpriseSaasSystem.rateLimiter('/api/saas/track', 100),
    async (req: any, res) => {
      try {
        const { metricType, value, metadata } = req.body;

        if (!metricType || value === undefined) {
          return res.status(400).json({ 
            success: false, 
            error: 'Metric type and value are required' 
          });
        }

        await enterpriseSaasSystem.trackUsage(
          req.user.organizationId,
          metricType,
          value,
          metadata
        );

        res.json({
          success: true,
          data: { tracked: true }
        });

      } catch (error: any) {
        console.error('Track usage error:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Failed to track usage' 
        });
      }
    }
  );

  console.log('✅ Enterprise SaaS API Routes configured successfully');
  console.log('📊 Available endpoints:');
  console.log('   POST /api/saas/signup - Organization registration');
  console.log('   POST /api/saas/login - User authentication');
  console.log('   GET  /api/saas/plans - Available subscription plans');
  console.log('   GET  /api/saas/analytics - Organization analytics');
  console.log('   GET  /api/saas/team - Team management');
  console.log('   POST /api/saas/team - Create team member');
  console.log('   GET  /api/saas/subscription - Subscription details');
  console.log('   POST /api/saas/upgrade - Plan upgrade');
  console.log('   GET  /api/saas/usage - Usage metrics');
  console.log('   POST /api/saas/track - Track custom usage');
}