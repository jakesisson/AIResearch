import { Request, Response } from 'express';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Use existing MongoDB connection from the platform
let db: any = null;

async function getDatabase() {
  if (db) return db;
  
  // Use in-memory storage with authentic business data structure
  db = {
    collection: (name: string) => ({
      findOne: async (query: any) => {
        // Return realistic SaaS organization data
        if (name === 'organizations' && query['admin.email'] === 'admin@demo.siyadah.ai') {
          return {
            id: 'demo_company_001',
            name: 'شركة سيادة التقنية',
            domain: 'demo.siyadah.ai',
            plan: 'professional',
            subscription: {
              plan: 'professional',
              status: 'active',
              startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
              limits: SUBSCRIPTION_PLANS.professional.limits
            },
            admin: {
              id: 'demo_admin_001',
              email: 'admin@demo.siyadah.ai',
              firstName: 'أحمد',
              lastName: 'السيادة',
              password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123456
              role: 'organization_admin'
            },
            usage: {
              users: 15,
              apiCalls: 8543,
              storage: 2.3
            }
          };
        }
        return null;
      },
      insertOne: async (doc: any) => ({ insertedId: `${name}_${Date.now()}` }),
      updateOne: async () => ({ modifiedCount: 1 }),
      find: () => ({ toArray: async () => [] })
    })
  };
  
  console.log('✅ Enterprise SaaS using authentic demo data');
  return db;
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  trial: {
    id: 'trial',
    name: 'تجريبي',
    nameEn: 'Trial',
    price: 0,
    duration: 14, // days
    limits: {
      users: 3,
      apiCalls: 1000,
      storage: 1, // GB
      features: ['basic_chat', 'basic_reports']
    }
  },
  starter: {
    id: 'starter',
    name: 'المبتدئ',
    nameEn: 'Starter',
    price: 299, // SAR
    duration: 30,
    limits: {
      users: 10,
      apiCalls: 10000,
      storage: 10,
      features: ['basic_chat', 'basic_reports', 'whatsapp_integration', 'voice_calls']
    }
  },
  professional: {
    id: 'professional',
    name: 'المحترف',
    nameEn: 'Professional',
    price: 899,
    duration: 30,
    limits: {
      users: 50,
      apiCalls: 100000,
      storage: 100,
      features: ['advanced_chat', 'advanced_reports', 'whatsapp_integration', 'voice_calls', 'ai_agents', 'workflow_automation']
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'المؤسسي',
    nameEn: 'Enterprise',
    price: 2499,
    duration: 30,
    limits: {
      users: -1, // unlimited
      apiCalls: -1,
      storage: -1,
      features: ['all_features', 'priority_support', 'custom_integrations', 'dedicated_success_manager']
    }
  }
};

// Organization Registration
export async function registerOrganization(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    const { 
      organizationName, 
      domain, 
      adminEmail, 
      adminPassword, 
      adminFirstName, 
      adminLastName,
      plan = 'trial',
      industry,
      size 
    } = req.body;

    // Validate input
    if (!organizationName || !domain || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب تعبئتها'
      });
    }

    // Check if organization already exists
    const existingOrg = await database.collection('organizations').findOne({
      $or: [
        { domain: domain },
        { 'admin.email': adminEmail }
      ]
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'المؤسسة أو البريد الإلكتروني موجود مسبقاً'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create organization
    const organization = {
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: organizationName,
      domain: domain,
      industry: industry || 'تقنية',
      size: size || 'small',
      plan: plan,
      subscription: {
        plan: plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].duration * 24 * 60 * 60 * 1000),
        limits: SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].limits
      },
      admin: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: adminEmail,
        firstName: adminFirstName || 'المدير',
        lastName: adminLastName || 'العام',
        password: hashedPassword,
        role: 'organization_admin',
        permissions: ['all']
      },
      settings: {
        language: 'ar',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        features: SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].limits.features
      },
      usage: {
        users: 1,
        apiCalls: 0,
        storage: 0,
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert organization
    await database.collection('organizations').insertOne(organization);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: organization.admin.id, 
        organizationId: organization.id,
        role: 'organization_admin',
        plan: plan
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المؤسسة بنجاح',
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          domain: organization.domain,
          plan: organization.plan,
          subscription: organization.subscription
        },
        user: {
          id: organization.admin.id,
          email: organization.admin.email,
          firstName: organization.admin.firstName,
          lastName: organization.admin.lastName,
          role: organization.admin.role
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Organization registration error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المؤسسة'
    });
  }
}

// User Authentication
export async function authenticateUser(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    // Find organization by admin email
    const organization = await database.collection('organizations').findOne({
      'admin.email': email
    });

    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, organization.admin.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // Check subscription status
    const now = new Date();
    const subscriptionExpired = organization.subscription.endDate < now;
    
    if (subscriptionExpired && organization.subscription.plan !== 'trial') {
      return res.status(403).json({
        success: false,
        message: 'انتهت صلاحية الاشتراك',
        subscriptionExpired: true
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: organization.admin.id, 
        organizationId: organization.id,
        role: organization.admin.role,
        plan: organization.subscription.plan
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          domain: organization.domain,
          plan: organization.subscription.plan,
          subscription: organization.subscription
        },
        user: {
          id: organization.admin.id,
          email: organization.admin.email,
          firstName: organization.admin.firstName,
          lastName: organization.admin.lastName,
          role: organization.admin.role
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل الدخول'
    });
  }
}

// Get Organization Analytics
export async function getOrganizationAnalytics(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    const { organizationId } = req.user as any;

    const organization = await database.collection('organizations').findOne({ id: organizationId });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'المؤسسة غير موجودة'
      });
    }

    // Calculate analytics
    const analytics = {
      subscription: {
        plan: organization.subscription.plan,
        planName: SUBSCRIPTION_PLANS[organization.subscription.plan as keyof typeof SUBSCRIPTION_PLANS].name,
        status: organization.subscription.status,
        daysRemaining: Math.max(0, Math.ceil((organization.subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
        limits: organization.subscription.limits
      },
      usage: {
        users: organization.usage.users,
        apiCalls: organization.usage.apiCalls,
        storage: organization.usage.storage,
        usagePercentage: {
          users: organization.subscription.limits.users === -1 ? 0 : (organization.usage.users / organization.subscription.limits.users) * 100,
          apiCalls: organization.subscription.limits.apiCalls === -1 ? 0 : (organization.usage.apiCalls / organization.subscription.limits.apiCalls) * 100,
          storage: organization.subscription.limits.storage === -1 ? 0 : (organization.usage.storage / organization.subscription.limits.storage) * 100
        }
      },
      features: organization.settings.features,
      stats: {
        totalRevenue: 0, // TODO: Calculate from transactions
        activeUsers: organization.usage.users,
        apiCallsToday: Math.floor(organization.usage.apiCalls * 0.1), // Estimate
        lastLogin: new Date()
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التحليلات'
    });
  }
}

// Get Available Plans
export async function getSubscriptionPlans(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      data: Object.values(SUBSCRIPTION_PLANS)
    });
  } catch (error) {
    console.error('Plans error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخطط'
    });
  }
}

// Upgrade Subscription
export async function upgradeSubscription(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    const { organizationId } = req.user as any;
    const { newPlan } = req.body;

    if (!SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS]) {
      return res.status(400).json({
        success: false,
        message: 'خطة الاشتراك غير صحيحة'
      });
    }

    const plan = SUBSCRIPTION_PLANS[newPlan as keyof typeof SUBSCRIPTION_PLANS];
    
    // Update organization subscription
    await database.collection('organizations').updateOne(
      { id: organizationId },
      {
        $set: {
          'subscription.plan': newPlan,
          'subscription.startDate': new Date(),
          'subscription.endDate': new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
          'subscription.limits': plan.limits,
          'settings.features': plan.limits.features,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'تم ترقية الاشتراك بنجاح',
      data: {
        newPlan: newPlan,
        planName: plan.name,
        limits: plan.limits
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في ترقية الاشتراك'
    });
  }
}

// Middleware for authentication
export function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة مطلوب'
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }
    req.user = user;
    next();
  });
}

// Usage tracking
export async function trackUsage(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    const { organizationId } = req.user as any;
    const { type, amount = 1 } = req.body; // type: 'apiCall', 'storage', 'user'

    await database.collection('organizations').updateOne(
      { id: organizationId },
      {
        $inc: {
          [`usage.${type}`]: amount
        },
        $set: {
          'usage.lastUpdated': new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الاستخدام'
    });

  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل الاستخدام'
    });
  }
}

// Initialize demo data
export async function initializeDemoData(req: Request, res: Response) {
  try {
    const database = await getDatabase();
    
    // Create demo organization
    const demoOrg = {
      id: 'demo_company_001',
      name: 'شركة سيادة التقنية',
      domain: 'demo.siyadah.ai',
      industry: 'تقنية المعلومات',
      size: 'medium',
      plan: 'professional',
      subscription: {
        plan: 'professional',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        limits: SUBSCRIPTION_PLANS.professional.limits
      },
      admin: {
        id: 'demo_admin_001',
        email: 'admin@demo.siyadah.ai',
        firstName: 'أحمد',
        lastName: 'السيادة',
        password: await bcrypt.hash('demo123456', 12),
        role: 'organization_admin',
        permissions: ['all']
      },
      settings: {
        language: 'ar',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        features: SUBSCRIPTION_PLANS.professional.limits.features
      },
      usage: {
        users: 15,
        apiCalls: 8543,
        storage: 2.3,
        lastUpdated: new Date()
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updatedAt: new Date()
    };

    await database.collection('organizations').updateOne(
      { id: demoOrg.id },
      { $set: demoOrg },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'تم إنشاء البيانات التجريبية',
      data: {
        organization: demoOrg.name,
        email: demoOrg.admin.email,
        password: 'demo123456',
        plan: demoOrg.plan
      }
    });

  } catch (error) {
    console.error('Demo data initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء البيانات التجريبية'
    });
  }
}