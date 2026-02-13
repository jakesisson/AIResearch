import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { IUser, InsertUser } from '@shared/schema';

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.error('⚠️  JWT_SECRET not set! Using fallback - CHANGE IN PRODUCTION!');
  return crypto.randomBytes(64).toString('hex');
})();
const JWT_EXPIRES_IN = '24h';

export interface AuthRequest extends Request {
  user?: IUser;
}

// تشفير كلمة المرور
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// التحقق من كلمة المرور
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// إنشاء JWT token
export function generateToken(user: IUser): string {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// التحقق من JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware للمصادقة
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    const user = await storage.getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Middleware للتحقق من الصلاحيات
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// تسجيل مستخدم جديد
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}): Promise<{ user: Omit<IUser, 'password'>, token: string }> {
  // التحقق من عدم وجود المستخدم
  const existingUserByUsername = await storage.getUserByUsername(userData.username);
  if (existingUserByUsername) {
    throw new Error('Username already exists');
  }

  const existingUserByEmail = await storage.getUserByEmail(userData.email);
  if (existingUserByEmail) {
    throw new Error('Email already exists');
  }

  // تشفير كلمة المرور
  const hashedPassword = await hashPassword(userData.password);

  // إنشاء المستخدم
  const newUser: InsertUser = {
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    fullName: userData.fullName,
    role: userData.role || 'user',
    isActive: true
  };

  const user = await storage.createUser(newUser);
  const token = generateToken(user);

  // إزالة كلمة المرور من الاستجابة
  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

// تسجيل الدخول
export async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<{ user: Omit<IUser, 'password'>, token: string }> {
  // البحث عن المستخدم
  const user = await storage.getUserByUsername(credentials.username);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // التحقق من كلمة المرور
  const isValidPassword = await verifyPassword(credentials.password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // التحقق من حالة المستخدم
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const token = generateToken(user);

  // إزالة كلمة المرور من الاستجابة
  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

// تحديث كلمة المرور
export async function updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<{success: boolean; message: string}> {
  try {
    const user = await storage.getUserById(userId.toString());
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // التحقق من كلمة المرور الحالية
    const isValidPassword = await verifyPassword(oldPassword, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // تشفير كلمة المرور الجديدة
    const hashedNewPassword = await hashPassword(newPassword);

    // تحديث كلمة المرور
    await storage.updateUser(userId, { password: hashedNewPassword });
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// إنشاء مستخدم Admin افتراضي
export async function createDefaultAdmin(): Promise<void> {
  try {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      return; // Admin موجود بالفعل
    }

    const adminUser: InsertUser = {
      username: 'admin',
      email: 'admin@platform.com',
      password: await hashPassword('admin123'), // يجب تغييرها في الإنتاج
      fullName: 'مدير النظام',
      role: 'admin',
      isActive: true
    };

    await storage.createUser(adminUser);
    console.log('✅ Default admin user created: admin/admin123');
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
  }
}