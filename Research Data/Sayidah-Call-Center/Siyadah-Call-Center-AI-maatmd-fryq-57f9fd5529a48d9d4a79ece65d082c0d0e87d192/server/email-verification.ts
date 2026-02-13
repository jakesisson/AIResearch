import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

// Temporary email service until configured
async function sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
  console.log('📧 Email Service Request:', {
    to: options.to,
    subject: options.subject
  });
  // Return true to simulate successful send
  return true;
}

interface VerificationToken {
  userId: string;
  type: 'email_verification' | 'password_reset';
  exp: number;
}

export class EmailVerificationService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'siyadah-email-verification-secret-2025';
  private readonly FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';
  
  /**
   * Generate email verification token
   */
  generateVerificationToken(userId: string, type: 'email_verification' | 'password_reset' = 'email_verification'): string {
    const payload: VerificationToken = {
      userId,
      type,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    return jwt.sign(payload, this.JWT_SECRET);
  }
  
  /**
   * Verify token
   */
  verifyToken(token: string): VerificationToken | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as VerificationToken;
      
      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
  
  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, userId: string, userName: string): Promise<boolean> {
    try {
      const token = this.generateVerificationToken(userId);
      const verificationUrl = `${this.FRONTEND_URL}/verify-email?token=${token}`;
      
      const emailContent = {
        to: email,
        subject: 'تأكيد البريد الإلكتروني - منصة سيادة AI',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a73e8;">مرحباً ${userName}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              شكراً لتسجيلك في منصة سيادة AI. لتفعيل حسابك، يرجى النقر على الرابط التالي:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #1a73e8; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                تأكيد البريد الإلكتروني
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              إذا لم تطلب إنشاء حساب، يمكنك تجاهل هذا البريد الإلكتروني.
            </p>
            <p style="font-size: 14px; color: #666;">
              صلاحية هذا الرابط تنتهي خلال 24 ساعة.
            </p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              منصة سيادة AI - أتمتة الأعمال بالذكاء الاصطناعي
            </p>
          </div>
        `
      };
      
      return await sendEmail(emailContent);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }
  
  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, userId: string, userName: string): Promise<boolean> {
    try {
      const token = this.generateVerificationToken(userId, 'password_reset');
      const resetUrl = `${this.FRONTEND_URL}/reset-password?token=${token}`;
      
      const emailContent = {
        to: email,
        subject: 'إعادة تعيين كلمة المرور - منصة سيادة AI',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a73e8;">مرحباً ${userName}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. للمتابعة، انقر على الرابط التالي:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #d32f2f; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                إعادة تعيين كلمة المرور
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
            </p>
            <p style="font-size: 14px; color: #666;">
              صلاحية هذا الرابط تنتهي خلال 24 ساعة.
            </p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              منصة سيادة AI - أتمتة الأعمال بالذكاء الاصطناعي
            </p>
          </div>
        `
      };
      
      return await sendEmail(emailContent);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

// API Endpoints
export const emailVerificationService = new EmailVerificationService();

/**
 * Request email verification
 */
export async function requestEmailVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مطلوب'
      });
    }
    
    // Get user from storage
    const user = await (storage as any).getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مُفعّل بالفعل'
      });
    }
    
    // Send verification email
    const sent = await emailVerificationService.sendVerificationEmail(
      email,
      user.id,
      user.firstName || 'مستخدم'
    );
    
    if (sent) {
      res.json({
        success: true,
        message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'فشل إرسال البريد الإلكتروني'
      });
    }
  } catch (error) {
    console.error('Email verification request error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء معالجة الطلب'
    });
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق مطلوب'
      });
    }
    
    // Verify token
    const decoded = emailVerificationService.verifyToken(token);
    if (!decoded || decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صالح أو منتهي الصلاحية'
      });
    }
    
    // Update user email verification status
    await (storage as any).updateUser(decoded.userId, {
      emailVerified: true,
      emailVerifiedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'تم تفعيل البريد الإلكتروني بنجاح'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء التحقق'
    });
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني مطلوب'
      });
    }
    
    // Get user from storage
    const user = await (storage as any).getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين'
      });
    }
    
    // Send password reset email
    await emailVerificationService.sendPasswordResetEmail(
      email,
      user.id,
      user.firstName || 'مستخدم'
    );
    
    res.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء معالجة الطلب'
    });
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق وكلمة المرور الجديدة مطلوبان'
      });
    }
    
    // Verify token
    const decoded = emailVerificationService.verifyToken(token);
    if (!decoded || decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صالح أو منتهي الصلاحية'
      });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      });
    }
    
    // Update user password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await (storage as any).updateUser(decoded.userId, {
      password: hashedPassword
    });
    
    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
    });
  }
}