import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { storage } from './storage';

interface TwoFactorData {
  secret: string;
  enabled: boolean;
  backupCodes?: string[];
}

export class TwoFactorAuthService {
  private readonly appName = 'Siyadah AI';
  
  /**
   * Generate 2FA secret for user
   */
  generateSecret(userEmail: string): speakeasy.GeneratedSecret {
    return speakeasy.generateSecret({
      name: `${this.appName} (${userEmail})`,
      length: 32
    });
  }
  
  /**
   * Generate QR code for secret
   */
  async generateQRCode(secret: speakeasy.GeneratedSecret): Promise<string> {
    try {
      return await QRCode.toDataURL(secret.otpauth_url!);
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }
  
  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });
  }
  
  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  
  /**
   * Hash backup codes for storage
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = await import('bcryptjs');
    const hashedCodes: string[] = [];
    
    for (const code of codes) {
      const hashed = await bcrypt.hash(code, 10);
      hashedCodes.push(hashed);
    }
    
    return hashedCodes;
  }
  
  /**
   * Verify backup code
   */
  async verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
    const bcrypt = await import('bcryptjs');
    
    for (let i = 0; i < hashedCodes.length; i++) {
      const isValid = await bcrypt.compare(code, hashedCodes[i]);
      if (isValid) {
        return i; // Return index of matched code
      }
    }
    
    return -1; // No match found
  }
}

// API Endpoints
export const twoFactorService = new TwoFactorAuthService();

/**
 * Enable 2FA - Step 1: Generate secret and QR code
 */
export async function enable2FAStep1(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Get user data
    const user = await (storage as any).getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: 'المصادقة الثنائية مفعلة بالفعل'
      });
    }
    
    // Generate secret
    const secret = twoFactorService.generateSecret(user.email);
    const qrCode = await twoFactorService.generateQRCode(secret);
    
    // Store temporary secret (not enabled yet)
    await (storage as any).updateUser(userId, {
      twoFactorTempSecret: secret.base32
    });
    
    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إعداد المصادقة الثنائية'
    });
  }
}

/**
 * Enable 2FA - Step 2: Verify token and activate
 */
export async function enable2FAStep2(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق مطلوب'
      });
    }
    
    // Get user data
    const user = await (storage as any).getUser(userId);
    if (!user || !user.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        error: 'يجب إكمال الخطوة الأولى أولاً'
      });
    }
    
    // Verify token
    const isValid = twoFactorService.verifyToken(user.twoFactorTempSecret, token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح'
      });
    }
    
    // Generate backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    const hashedBackupCodes = await twoFactorService.hashBackupCodes(backupCodes);
    
    // Enable 2FA
    await (storage as any).updateUser(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorTempSecret,
      twoFactorTempSecret: null,
      twoFactorBackupCodes: hashedBackupCodes
    });
    
    res.json({
      success: true,
      message: 'تم تفعيل المصادقة الثنائية بنجاح',
      backupCodes // Return plain codes once for user to save
    });
  } catch (error) {
    console.error('2FA activation error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء تفعيل المصادقة الثنائية'
    });
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(req: Request, res: Response) {
  try {
    const { password } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور مطلوبة'
      });
    }
    
    // Get user and verify password
    const user = await (storage as any).getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور غير صحيحة'
      });
    }
    
    // Disable 2FA
    await (storage as any).updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    });
    
    res.json({
      success: true,
      message: 'تم إلغاء تفعيل المصادقة الثنائية'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إلغاء المصادقة الثنائية'
    });
  }
}

/**
 * Verify 2FA token during login
 */
export async function verify2FA(req: Request, res: Response) {
  try {
    const { userId, token, backupCode } = req.body;
    
    if (!userId || (!token && !backupCode)) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المطلوبة غير مكتملة'
      });
    }
    
    // Get user
    const user = await (storage as any).getUser(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: 'المصادقة الثنائية غير مفعلة'
      });
    }
    
    let isValid = false;
    
    // Try token verification first
    if (token && user.twoFactorSecret) {
      isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    }
    
    // Try backup code if token failed
    if (!isValid && backupCode && user.twoFactorBackupCodes) {
      const codeIndex = await twoFactorService.verifyBackupCode(
        backupCode, 
        user.twoFactorBackupCodes
      );
      
      if (codeIndex >= 0) {
        isValid = true;
        
        // Remove used backup code
        const newBackupCodes = [...user.twoFactorBackupCodes];
        newBackupCodes.splice(codeIndex, 1);
        
        await (storage as any).updateUser(userId, {
          twoFactorBackupCodes: newBackupCodes
        });
      }
    }
    
    if (isValid) {
      res.json({
        success: true,
        message: 'تم التحقق بنجاح'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح'
      });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء التحقق'
    });
  }
}

/**
 * Generate new backup codes
 */
export async function generateNewBackupCodes(req: Request, res: Response) {
  try {
    const { password } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور مطلوبة'
      });
    }
    
    // Get user and verify password
    const user = await (storage as any).getUser(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: 'المصادقة الثنائية غير مفعلة'
      });
    }
    
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور غير صحيحة'
      });
    }
    
    // Generate new backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    const hashedBackupCodes = await twoFactorService.hashBackupCodes(backupCodes);
    
    // Update user
    await (storage as any).updateUser(userId, {
      twoFactorBackupCodes: hashedBackupCodes
    });
    
    res.json({
      success: true,
      message: 'تم إنشاء رموز احتياطية جديدة',
      backupCodes
    });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الرموز الاحتياطية'
    });
  }
}