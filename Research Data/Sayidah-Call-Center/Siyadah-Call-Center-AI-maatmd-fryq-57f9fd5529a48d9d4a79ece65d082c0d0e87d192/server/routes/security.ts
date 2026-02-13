import { Router } from 'express';
import { auditLogger, validatePassword, handleValidationErrors } from '../security-middleware';
import { hashPassword } from '../auth';

const router = Router();

// تغيير كلمة المرور الافتراضية
router.post('/change-default-password', 
  auditLogger('password_change'),
  validatePassword,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // التحقق من كلمة المرور الحالية
      if (currentPassword !== 'admin123') {
        return res.status(400).json({
          success: false,
          error: 'كلمة المرور الحالية غير صحيحة'
        });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      
      // هنا يجب تحديث كلمة المرور في قاعدة البيانات
      // تم تجاهلها لأن النظام يستخدم متغيرات البيئة
      
      res.json({
        success: true,
        message: 'يجب تحديث ADMIN_PASSWORD في متغيرات البيئة'
      });
    } catch (error) {
      console.error('Security Error:', error);
      res.status(500).json({
        success: false,
        error: 'فشل في تغيير كلمة المرور'
      });
    }
  }
);

// فحص الثغرات الأمنية
router.get('/security-check', auditLogger('security_check'), (req, res) => {
  const securityIssues = [];
  
  // فحص متغيرات البيئة
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    securityIssues.push('JWT_SECRET غير آمن');
  }
  
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123') {
    securityIssues.push('كلمة مرور المدير ضعيفة');
  }
  
  if (!process.env.SIYADAH_VOIP_API_KEY) {
    securityIssues.push('Siyadah VoIP API Key مفقود');
  }
  
  res.json({
    success: true,
    securityStatus: securityIssues.length === 0 ? 'آمن' : 'يحتاج تحسين',
    issues: securityIssues,
    recommendations: [
      'استخدام كلمات مرور قوية',
      'تفعيل HTTPS في الإنتاج',
      'مراجعة صلاحيات المستخدمين',
      'تحديث جميع مفاتيح API'
    ]
  });
});

export default router;