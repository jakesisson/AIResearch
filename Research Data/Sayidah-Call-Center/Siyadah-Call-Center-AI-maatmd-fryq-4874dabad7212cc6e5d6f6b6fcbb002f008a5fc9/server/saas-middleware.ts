/**
 * Enterprise SaaS Middleware - Multi-tenant Security & Rate Limiting
 * Implements global security standards for SaaS applications
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { saasService } from './saas-services';

const JWT_SECRET = process.env.JWT_SECRET || 'saas-secret-key-change-in-production';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
  organization?: any;
}

// JWT Authentication Middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    // Load organization data
    const organization = await saasService.getOrganization(decoded.organizationId);
    if (!organization) {
      return res.status(403).json({ error: 'Organization not found' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based Access Control
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Subscription Status Check
export const requireActiveSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const subscription = await saasService.getOrganizationSubscription(req.user.organizationId);
    
    if (!subscription) {
      return res.status(402).json({ 
        error: 'No subscription found',
        code: 'SUBSCRIPTION_REQUIRED' 
      });
    }

    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      return res.status(402).json({ 
        error: 'Subscription inactive',
        code: 'SUBSCRIPTION_INACTIVE',
        status: subscription.status 
      });
    }

    // Check if trial has expired
    if (subscription.status === 'trialing' && subscription.trialEnd && new Date() > subscription.trialEnd) {
      return res.status(402).json({ 
        error: 'Trial period expired',
        code: 'TRIAL_EXPIRED' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check subscription status' });
  }
};

// API Rate Limiting
export const rateLimiter = (endpoint: string, baseLimit: number = 100) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Get subscription-based limits
      const subscription = await saasService.getOrganizationSubscription(req.user.organizationId);
      let limit = baseLimit;

      if (subscription) {
        const plan = await saasService.getPlan(subscription.planId);
        if (plan) {
          // Adjust limits based on plan
          switch (plan.name) {
            case 'trial':
            case 'basic':
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

      const canProceed = await saasService.checkRateLimit(req.user.organizationId, endpoint, limit);
      
      if (!canProceed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 60 
        });
      }

      // Track API usage
      await saasService.trackUsage(req.user.organizationId, 'api_calls', 1, {
        endpoint,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Rate limiting service unavailable' });
    }
  };
};

// Feature Access Control
export const requireFeature = (featureName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const subscription = await saasService.getOrganizationSubscription(req.user.organizationId);
      
      if (!subscription) {
        return res.status(402).json({ 
          error: 'Feature requires subscription',
          code: 'FEATURE_REQUIRES_SUBSCRIPTION',
          feature: featureName 
        });
      }

      const plan = await saasService.getPlan(subscription.planId);
      
      if (!plan || !(Array.isArray(plan.features) && plan.features.includes(featureName))) {
        return res.status(402).json({ 
          error: 'Feature not available in current plan',
          code: 'FEATURE_NOT_AVAILABLE',
          feature: featureName,
          currentPlan: plan?.displayName || 'Unknown' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

// Usage Tracking Middleware
export const trackUsage = (metricType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Override res.json to track response
    const originalJson = res.json;
    res.json = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Track usage asynchronously
      if (req.user) {
        saasService.trackUsage(req.user.organizationId, metricType, 1, {
          responseTime,
          statusCode: res.statusCode,
          endpoint: req.path,
        }).catch(console.error);

        // Record SLA metrics
        saasService.recordSLAMetric(
          req.user.organizationId, 
          'response_time', 
          responseTime, 
          5000 // 5 second threshold
        ).catch(console.error);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Organization Data Isolation
export const ensureDataIsolation = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Add organization filter to query parameters
  req.query.organizationId = req.user.organizationId;
  
  next();
};

// CORS for SaaS
export const saasCorsSecurity = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'https://siyadah.ai',
    'https://app.siyadah.ai',
    'https://dashboard.siyadah.ai',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Health Check with SLA Recording
export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Record uptime metric
  try {
    await saasService.recordSLAMetric(
      'global', 
      'uptime', 
      1, 
      0.99 // 99% uptime threshold
    );
  } catch (error) {
    console.error('Failed to record uptime metric:', error);
  }
  
  next();
};

// Security Headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};