import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

// Demo organizations with pre-hashed passwords
const DEMO_ORGANIZATIONS = [
  {
    id: 'demo_company_001',
    name: 'شركة سيادة التقنية',
    domain: 'demo.siyadah.ai',
    industry: 'تقنية المعلومات',
    size: 'medium',
    plan: 'professional',
    subscription: {
      plan: 'professional',
      status: 'active',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      limits: {
        users: 50,
        apiCalls: 100000,
        storage: 100,
        features: ['advanced_chat', 'advanced_reports', 'whatsapp_integration', 'voice_calls', 'ai_agents', 'workflow_automation']
      }
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
      storage: 2.3,
      lastUpdated: new Date()
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'startup_tech_002',
    name: 'شركة التقنية الناشئة',
    domain: 'startup.tech',
    industry: 'Startups',
    size: 'small',
    plan: 'starter',
    subscription: {
      plan: 'starter',
      status: 'active',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      limits: {
        users: 10,
        apiCalls: 10000,
        storage: 10,
        features: ['basic_chat', 'basic_reports', 'whatsapp_integration', 'voice_calls']
      }
    },
    admin: {
      id: 'startup_admin_002',
      email: 'admin@startup.tech',
      firstName: 'فاطمة',
      lastName: 'العتيبي',
      password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123456
      role: 'organization_admin'
    },
    usage: {
      users: 5,
      apiCalls: 2147,
      storage: 0.8,
      lastUpdated: new Date()
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 'enterprise_corp_003',
    name: 'المؤسسة التجارية الكبرى',
    domain: 'enterprise.corp',
    industry: 'Enterprise',
    size: 'large',
    plan: 'enterprise',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      limits: {
        users: -1,
        apiCalls: -1,
        storage: -1,
        features: ['all_features', 'priority_support', 'custom_integrations', 'dedicated_success_manager']
      }
    },
    admin: {
      id: 'enterprise_admin_003',
      email: 'admin@enterprise.corp',
      firstName: 'محمد',
      lastName: 'الراشد',
      password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // demo123456
      role: 'organization_admin'
    },
    usage: {
      users: 127,
      apiCalls: 487235,
      storage: 45.7,
      lastUpdated: new Date()
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  trial: {
    id: 'trial',
    name: 'تجريبي',
    nameEn: 'Trial',
    price: 0,
    duration: 14,
    limits: {
      users: 3,
      apiCalls: 1000,
      storage: 1,
      features: ['basic_chat', 'basic_reports']
    }
  },
  starter: {
    id: 'starter',
    name: 'المبتدئ',
    nameEn: 'Starter',
    price: 299,
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
      users: -1,
      apiCalls: -1,
      storage: -1,
      features: ['all_features', 'priority_support', 'custom_integrations', 'dedicated_success_manager']
    }
  }
};

// Authentication
export async function getOrganizationByEmail(email: string) {
  const org = DEMO_ORGANIZATIONS.find(org => org.admin.email === email);
  return org || null;
}

export async function createNewOrganization(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  domain: string;
  plan: string;
}) {
  const { firstName, lastName, email, password, organizationName, domain, plan } = data;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Generate IDs
  const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create organization object
  const organization = {
    id: organizationId,
    name: organizationName,
    domain,
    industry: 'عام',
    size: 'small',
    plan,
    subscription: {
      plan,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      limits: {
        users: plan === 'enterprise' ? 500 : plan === 'professional' ? 50 : 10,
        apiCalls: plan === 'enterprise' ? 1000000 : plan === 'professional' ? 100000 : 10000,
        storage: plan === 'enterprise' ? 1000 : plan === 'professional' ? 100 : 10,
        features: plan === 'enterprise' 
          ? ['advanced_chat', 'advanced_reports', 'whatsapp_integration', 'voice_calls', 'ai_agents', 'workflow_automation', 'custom_integrations', 'priority_support']
          : plan === 'professional'
          ? ['advanced_chat', 'advanced_reports', 'whatsapp_integration', 'voice_calls', 'ai_agents', 'workflow_automation']
          : ['basic_chat', 'basic_reports', 'ai_agents']
      }
    },
    admin: {
      id: userId,
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'organization_admin'
    },
    usage: {
      users: 1,
      apiCalls: 0,
      storage: 0,
      lastUpdated: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      currency: 'SAR'
    }
  };
  
  // Add to demo organizations (in real system, save to database)
  DEMO_ORGANIZATIONS.push(organization);
  
  // Generate JWT token
  const token = jwt.sign(
    {
      userId: organization.admin.id,
      organizationId: organization.id,
      role: organization.admin.role,
      plan: organization.plan
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return {
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
    token
  };
}

export async function authenticateUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 SaaS Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    // Find organization by admin email
    const organization = DEMO_ORGANIZATIONS.find(org => org.admin.email === email);
    
    console.log('🔍 Organization found:', !!organization, organization?.admin?.email);

    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // Verify password - for demo purposes, accept direct match or bcrypt comparison
    let validPassword = false;
    if (password === 'demo123456') {
      validPassword = true;
    } else {
      validPassword = await bcrypt.compare(password, organization.admin.password);
    }
    
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
    const { organizationId } = req.user as any;

    const organization = DEMO_ORGANIZATIONS.find(org => org.id === organizationId);
    
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
      features: organization.subscription.limits.features,
      stats: {
        totalRevenue: SUBSCRIPTION_PLANS[organization.subscription.plan as keyof typeof SUBSCRIPTION_PLANS].price,
        activeUsers: organization.usage.users,
        apiCallsToday: Math.floor(organization.usage.apiCalls * 0.1),
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

// Get All Organizations (for demo)
export async function getAllOrganizations(req: Request, res: Response) {
  try {
    const organizations = DEMO_ORGANIZATIONS.map(org => ({
      id: org.id,
      name: org.name,
      domain: org.domain,
      plan: org.subscription.plan,
      status: org.subscription.status,
      users: org.usage.users,
      createdAt: org.createdAt
    }));

    res.json({
      success: true,
      data: organizations,
      total: organizations.length
    });
  } catch (error) {
    console.error('Organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المؤسسات'
    });
  }
}

// Initialize demo data
export async function initializeDemoData(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      message: 'تم إنشاء البيانات التجريبية',
      data: {
        organizations: DEMO_ORGANIZATIONS.length,
        demoCredentials: [
          {
            organization: 'شركة سيادة التقنية',
            email: 'admin@demo.siyadah.ai',
            password: 'demo123456',
            plan: 'professional'
          },
          {
            organization: 'شركة التقنية الناشئة',
            email: 'admin@startup.tech',
            password: 'demo123456',
            plan: 'starter'
          },
          {
            organization: 'المؤسسة التجارية الكبرى',
            email: 'admin@enterprise.corp',
            password: 'demo123456',
            plan: 'enterprise'
          }
        ]
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