import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  password: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUpperCase: boolean;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
  };
  twoFactor: {
    enabled: boolean;
    issuer: string;
    digits: number;
  };
}

class EnhancedSecurity {
  private config: SecurityConfig;
  private activeSessions: Map<string, any> = new Map();
  private failedAttempts: Map<string, { count: number; lockUntil: Date }> = new Map();
  private auditLog: any[] = [];

  constructor() {
    this.config = {
      jwt: {
        secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
        expiresIn: '15m',
        refreshExpiresIn: '7d'
      },
      password: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUpperCase: true
      },
      session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      },
      twoFactor: {
        enabled: true,
        issuer: 'Siyadah AI',
        digits: 6
      }
    };
  }

  // Enhanced rate limiting
  createRateLimiter(windowMs: number, max: number, message: string) {
    return rateLimit({
      windowMs,
      max,
      message: { error: message },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path
        });
        res.status(429).json({ error: message });
      }
    });
  }

  // Password validation
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors = [];
    
    if (password.length < this.config.password.minLength) {
      errors.push(`كلمة المرور يجب أن تكون ${this.config.password.minLength} أحرف على الأقل`);
    }
    
    if (this.config.password.requireNumbers && !/\d/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على أرقام');
    }
    
    if (this.config.password.requireUpperCase && !/[A-Z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على أحرف كبيرة');
    }
    
    if (this.config.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رموز خاصة');
    }

    // Check against common passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'كلمة_المرور', '123456789', 'password1'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('كلمة المرور ضعيفة جداً - اختر كلمة مرور أقوى');
    }

    return { valid: errors.length === 0, errors };
  }

  // Account lockout protection
  checkAccountLockout(identifier: string): boolean {
    const attempts = this.failedAttempts.get(identifier);
    if (!attempts) return false;
    
    if (attempts.lockUntil && new Date() < attempts.lockUntil) {
      return true; // Account is locked
    }
    
    if (attempts.lockUntil && new Date() >= attempts.lockUntil) {
      this.failedAttempts.delete(identifier); // Unlock account
      return false;
    }
    
    return false;
  }

  // Record failed login attempt
  recordFailedAttempt(identifier: string): void {
    const attempts = this.failedAttempts.get(identifier) || { count: 0, lockUntil: null };
    attempts.count++;
    
    if (attempts.count >= 5) {
      attempts.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      this.logSecurityEvent('ACCOUNT_LOCKED', { identifier, attempts: attempts.count });
    }
    
    this.failedAttempts.set(identifier, attempts);
  }

  // Clear failed attempts on successful login
  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  // Enhanced JWT token generation
  generateTokens(userId: string, sessionId: string) {
    const accessToken = jwt.sign(
      { 
        userId, 
        sessionId,
        type: 'access',
        permissions: this.getUserPermissions(userId)
      },
      this.config.jwt.secret,
      { expiresIn: this.config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { 
        userId, 
        sessionId,
        type: 'refresh'
      },
      this.config.jwt.secret,
      { expiresIn: this.config.jwt.refreshExpiresIn }
    );

    // Store session
    this.activeSessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      userAgent: '',
      ip: ''
    });

    return { accessToken, refreshToken };
  }

  // Token validation middleware
  validateToken() {
    return async (req: Request, res: Response, next: any) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ error: 'لا يوجد رمز مصادقة' });
        }

        const decoded = jwt.verify(token, this.config.jwt.secret) as any;
        
        // Check if session is still active
        const session = this.activeSessions.get(decoded.sessionId);
        if (!session) {
          return res.status(401).json({ error: 'انتهت صلاحية الجلسة' });
        }

        // Update last activity
        session.lastActivity = new Date();
        this.activeSessions.set(decoded.sessionId, session);

        req.user = decoded;
        next();
      } catch (error) {
        this.logSecurityEvent('INVALID_TOKEN', { 
          token: req.headers.authorization,
          ip: req.ip,
          error: (error as Error).message
        });
        return res.status(401).json({ error: 'رمز مصادقة غير صالح' });
      }
    };
  }

  // Input sanitization
  sanitizeInput() {
    return [
      body('email').isEmail().normalizeEmail().escape(),
      body('password').isLength({ min: this.config.password.minLength }).trim(),
      body('*').escape() // Sanitize all other fields
    ];
  }

  // Validation error handler
  handleValidationErrors() {
    return (req: Request, res: Response, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        this.logSecurityEvent('VALIDATION_ERROR', {
          errors: errors.array(),
          ip: req.ip,
          body: req.body
        });
        return res.status(400).json({ 
          error: 'بيانات غير صالحة',
          details: errors.array()
        });
      }
      next();
    };
  }

  // Security headers middleware
  securityHeaders() {
    return (req: Request, res: Response, next: any) => {
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;"
      );
      
      // Other security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      if (this.config.session.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      
      next();
    };
  }

  // Audit logging
  logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date(),
      event,
      details,
      severity: this.getEventSeverity(event)
    };
    
    this.auditLog.push(logEntry);
    console.log(`🔒 SECURITY [${logEntry.severity}]: ${event}`, details);
    
    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }

    // Send critical alerts immediately
    if (logEntry.severity === 'CRITICAL') {
      this.sendSecurityAlert(logEntry);
    }
  }

  // Get security audit logs
  getAuditLogs(limit: number = 100) {
    return this.auditLog.slice(-limit).reverse();
  }

  // Session management
  invalidateSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  invalidateAllSessions(userId: string): number {
    let count = 0;
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  getActiveSessions(userId?: string) {
    if (userId) {
      const userSessions = [];
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (session.userId === userId) {
          userSessions.push({ sessionId, ...session });
        }
      }
      return userSessions;
    }
    return Array.from(this.activeSessions.entries()).map(([sessionId, session]) => ({ sessionId, ...session }));
  }

  // Utility methods
  private getUserPermissions(userId: string): string[] {
    // In real implementation, fetch from database
    return ['read', 'write', 'admin'];
  }

  private getEventSeverity(event: string): string {
    const criticalEvents = ['ACCOUNT_LOCKED', 'INVALID_TOKEN', 'RATE_LIMIT_EXCEEDED'];
    const warningEvents = ['VALIDATION_ERROR', 'FAILED_LOGIN'];
    
    if (criticalEvents.includes(event)) return 'CRITICAL';
    if (warningEvents.includes(event)) return 'WARNING';
    return 'INFO';
  }

  private sendSecurityAlert(logEntry: any): void {
    // In production, send to security team via Slack, email, etc.
    console.log('🚨 CRITICAL SECURITY ALERT:', logEntry);
  }

  // Security endpoints
  createSecurityEndpoints() {
    return {
      getAuditLogs: (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 100;
        res.json({
          logs: this.getAuditLogs(limit),
          total: this.auditLog.length
        });
      },

      getActiveSessions: (req: Request, res: Response) => {
        const userId = req.query.userId as string;
        res.json({
          sessions: this.getActiveSessions(userId),
          total: this.activeSessions.size
        });
      },

      invalidateSession: (req: Request, res: Response) => {
        const { sessionId } = req.body;
        const success = this.invalidateSession(sessionId);
        res.json({ success, message: success ? 'تم إلغاء الجلسة' : 'الجلسة غير موجودة' });
      },

      securityStatus: (req: Request, res: Response) => {
        res.json({
          activeSessions: this.activeSessions.size,
          failedAttempts: this.failedAttempts.size,
          auditLogEntries: this.auditLog.length,
          lastCriticalEvent: this.auditLog
            .filter(log => log.severity === 'CRITICAL')
            .slice(-1)[0] || null,
          config: {
            passwordPolicy: this.config.password,
            twoFactorEnabled: this.config.twoFactor.enabled,
            secureSession: this.config.session.secure
          }
        });
      }
    };
  }
}

export const enhancedSecurity = new EnhancedSecurity();
export { EnhancedSecurity };
export default EnhancedSecurity;