import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// حماية معدل الطلبات
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'تم تجاوز حد الطلبات المسموح'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// حماية أمنية شاملة
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
];

// تشفير البيانات الحساسة
export const encryptSensitiveData = (data: string): string => {
  // تطبيق تشفير أساسي - يجب استخدام مكتبة تشفير قوية في الإنتاج
  return Buffer.from(data).toString('base64');
};

export const decryptSensitiveData = (encryptedData: string): string => {
  return Buffer.from(encryptedData, 'base64').toString('utf8');
};

// التحقق من صحة البيانات
export const validatePhoneNumber = body('phone')
  .matches(/^\+[1-9]\d{1,14}$/)
  .withMessage('رقم الهاتف غير صحيح');

export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('البريد الإلكتروني غير صحيح');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص');

// معالجة أخطاء التحقق
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// تسجيل العمليات الحساسة
export const auditLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      userId: (req as any).user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl
    };
    
    console.log('🔐 Security Audit:', JSON.stringify(logData));
    next();
  };
};

// حماية من CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  
  if (req.method === 'GET') {
    return next();
  }
  
  if (!token || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'رمز الحماية غير صحيح'
    });
  }
  
  next();
};

// تنظيف البيانات
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };
  
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  
  next();
};

export default {
  createRateLimit,
  securityMiddleware,
  encryptSensitiveData,
  decryptSensitiveData,
  validatePhoneNumber,
  validateEmail,
  validatePassword,
  handleValidationErrors,
  auditLogger,
  csrfProtection,
  sanitizeInput
};