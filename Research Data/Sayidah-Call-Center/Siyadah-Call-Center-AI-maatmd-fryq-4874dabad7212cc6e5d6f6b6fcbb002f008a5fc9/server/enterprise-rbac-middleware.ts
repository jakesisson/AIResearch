import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { rbacService } from './enterprise-rbac-service';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    roleId: string;
  };
}

// JWT Authentication Middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required',
      errorAr: 'مطلوب رمز الوصول'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      roleId: decoded.roleId
    };
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token',
      errorAr: 'رمز غير صالح أو منتهي الصلاحية'
    });
  }
};

// Permission-based Authorization Middleware
export const requirePermission = (resource: string, action: string, scope: string = 'organization') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        errorAr: 'مطلوب المصادقة'
      });
    }

    try {
      const hasPermission = await rbacService.hasPermission(
        req.user.userId, 
        resource, 
        action, 
        scope
      );

      if (!hasPermission) {
        await rbacService.logAudit(
          req.user.organizationId,
          req.user.userId,
          'access_denied',
          resource,
          undefined,
          { 
            action, 
            scope, 
            endpoint: req.path,
            method: req.method
          }
        );

        return res.status(403).json({ 
          success: false, 
          error: `Access denied for ${action} on ${resource}`,
          errorAr: `رفض الوصول لـ ${action} على ${resource}`,
          details: {
            resource,
            action,
            scope,
            required: `${resource}:${action}:${scope}`
          }
        });
      }

      // Log successful access
      await rbacService.logAudit(
        req.user.organizationId,
        req.user.userId,
        'access_granted',
        resource,
        undefined,
        { 
          action, 
          scope, 
          endpoint: req.path,
          method: req.method
        }
      );

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Permission check failed',
        errorAr: 'فشل في فحص الصلاحيات'
      });
    }
  };
};

// Organization Isolation Middleware
export const enforceOrganizationBoundary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      errorAr: 'مطلوب المصادقة'
    });
  }

  // System super admin bypasses organization boundaries
  if (req.user.roleId === 'system_super_admin') {
    return next();
  }

  // Extract organization ID from request (URL param, body, or query)
  const requestedOrgId = req.params.organizationId || req.body.organizationId || req.query.organizationId;

  if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
    await rbacService.logAudit(
      req.user.organizationId,
      req.user.userId,
      'boundary_violation',
      'organization',
      requestedOrgId as string
    );

    return res.status(403).json({ 
      success: false, 
      error: 'Access denied: Organization boundary violation',
      errorAr: 'رفض الوصول: انتهاك حدود المؤسسة'
    });
  }

  next();
};

// Rate Limiting by Organization
const organizationRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const organizationRateLimit = (maxRequests: number = 1000, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const orgId = req.user.organizationId;
    const now = Date.now();
    const current = organizationRequestCounts.get(orgId);

    if (!current || now > current.resetTime) {
      organizationRequestCounts.set(orgId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        errorAr: 'تم تجاوز حد المعدل',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
    }

    current.count++;
    next();
  };
};

// Data Boundary Enforcement
export const enforceDataBoundary = (resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        errorAr: 'مطلوب المصادقة'
      });
    }

    const resourceId = req.params.id || req.params.resourceId || req.body.id;
    
    if (!resourceId) {
      return next(); // No resource ID to check
    }

    try {
      const hasAccess = await rbacService.enforceDataBoundary(
        req.user.userId,
        resourceType,
        resourceId
      );

      if (!hasAccess) {
        await rbacService.logAudit(
          req.user.organizationId,
          req.user.userId,
          'data_boundary_violation',
          resourceType,
          resourceId
        );

        return res.status(403).json({ 
          success: false, 
          error: `Access denied to ${resourceType} resource`,
          errorAr: `رفض الوصول لمورد ${resourceType}`
        });
      }

      next();
    } catch (error) {
      console.error('Data boundary check error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Data boundary check failed',
        errorAr: 'فشل في فحص حدود البيانات'
      });
    }
  };
};

// Audit Logging Middleware
export const auditLog = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      await rbacService.logAudit(
        req.user.organizationId,
        req.user.userId,
        action,
        resource,
        req.params.id || req.body.id,
        {
          endpoint: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    }
    next();
  };
};

// Role-based Access Control Shortcuts
export const requireSystemAdmin = requirePermission('system', 'manage', 'global');
export const requireOrgAdmin = requirePermission('organization', 'manage', 'organization');
export const requireUserManagement = requirePermission('users', 'manage', 'organization');
export const requireBillingAccess = requirePermission('billing', 'read', 'organization');
export const requireReportsAccess = requirePermission('reports', 'read', 'organization');

// Combined Middleware for Common Patterns
export const secureOrgEndpoint = [
  authenticateToken,
  enforceOrganizationBoundary,
  organizationRateLimit(500, 60000)
];

export const secureUserEndpoint = [
  authenticateToken,
  enforceOrganizationBoundary,
  enforceDataBoundary('user'),
  organizationRateLimit(200, 60000)
];

export const secureAdminEndpoint = [
  authenticateToken,
  requireOrgAdmin,
  enforceOrganizationBoundary,
  organizationRateLimit(100, 60000)
];

export type { AuthenticatedRequest };