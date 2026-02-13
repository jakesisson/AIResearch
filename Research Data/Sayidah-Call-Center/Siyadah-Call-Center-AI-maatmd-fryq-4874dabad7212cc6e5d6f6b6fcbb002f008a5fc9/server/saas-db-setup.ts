/**
 * SaaS Database Setup - MongoDB Collections and Sample Data
 * Initializes complete multi-tenant platform structure
 */

import { mongodb } from './mongodb';

export async function initializeSaasDatabase(): Promise<void> {
  try {
    console.log('🚀 Initializing SaaS Platform Database...');

    // Check if already initialized
    const existingPlans = await mongodb.collection('saas_subscription_plans').findOne({});
    if (existingPlans) {
      console.log('✅ SaaS Database already initialized');
      return;
    }

    // Create subscription plans
    const plans = [
      {
        _id: 'plan_trial',
        name: 'trial',
        displayName: 'تجربة مجانية',
        description: 'تجربة مجانية لمدة 14 يوم مع جميع المميزات',
        price: '0.00',
        currency: 'SAR',
        billing: 'monthly',
        maxUsers: 5,
        maxStorage: 1,
        features: ['AI Agents', 'Basic Analytics', 'Email Support', 'WhatsApp API'],
        active: true,
        created: new Date(),
      },
      {
        _id: 'plan_starter',
        name: 'starter',
        displayName: 'الباقة الأساسية',
        description: 'مثالي للشركات الصغيرة والناشئة',
        price: '199.00',
        currency: 'SAR',
        billing: 'monthly',
        maxUsers: 10,
        maxStorage: 5,
        features: ['AI Agents', 'Advanced Analytics', 'Email Support', 'WhatsApp API', 'Voice Calls'],
        active: true,
        created: new Date(),
      },
      {
        _id: 'plan_professional',
        name: 'professional',
        displayName: 'الباقة الاحترافية',
        description: 'للشركات المتنامية مع احتياجات متقدمة',
        price: '499.00',
        currency: 'SAR',
        billing: 'monthly',
        maxUsers: 50,
        maxStorage: 25,
        features: [
          'AI Agents', 'Advanced Analytics', 'Priority Support', 
          'WhatsApp API', 'Voice Calls', 'Custom Integrations',
          'Advanced Reports', 'Team Management'
        ],
        active: true,
        created: new Date(),
      },
      {
        _id: 'plan_enterprise',
        name: 'enterprise',
        displayName: 'الباقة المؤسسية',
        description: 'للمؤسسات الكبيرة مع الدعم الكامل',
        price: '1299.00',
        currency: 'SAR',
        billing: 'monthly',
        maxUsers: 500,
        maxStorage: 100,
        features: [
          'AI Agents', 'Advanced Analytics', '24/7 Support',
          'WhatsApp API', 'Voice Calls', 'Custom Integrations',
          'Advanced Reports', 'Team Management', 'SLA Guarantees',
          'Custom Development', 'Dedicated Manager'
        ],
        active: true,
        created: new Date(),
      },
    ];

    for (const plan of plans) {
      await mongodb.collection('saas_subscription_plans').insertOne(plan);
    }

    // Create demo organization
    const demoOrgId = `org_${Date.now()}_demo`;
    const demoOrg = {
      _id: demoOrgId,
      name: 'شركة سيادة التجريبية',
      domain: 'demo.siyadah.ai',
      tier: 'professional',
      maxUsers: 50,
      maxStorage: 25,
      settings: {},
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_organizations').insertOne(demoOrg);

    // Create trial subscription for demo org
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const demoSub = {
      _id: `sub_${Date.now()}_demo`,
      orgId: demoOrgId,
      planId: 'plan_professional',
      status: 'active',
      periodStart: new Date(),
      periodEnd: trialEnd,
      trialEnd,
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_subscriptions').insertOne(demoSub);

    // Create demo user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('demo123456', 12);

    const demoUser = {
      _id: `user_${Date.now()}_demo`,
      orgId: demoOrgId,
      email: 'admin@demo.siyadah.ai',
      password: hashedPassword,
      firstName: 'أحمد',
      lastName: 'المدير',
      role: 'admin',
      active: true,
      twoFactor: false,
      prefs: {},
      created: new Date(),
      updated: new Date(),
    };

    await mongodb.collection('saas_users').insertOne(demoUser);

    // Create indexes for performance
    await mongodb.collection('saas_organizations').createIndex({ domain: 1 }, { unique: true, sparse: true });
    await mongodb.collection('saas_users').createIndex({ email: 1 }, { unique: true });
    await mongodb.collection('saas_users').createIndex({ orgId: 1 });
    await mongodb.collection('saas_subscriptions').createIndex({ orgId: 1 });
    await mongodb.collection('saas_usage_metrics').createIndex({ orgId: 1, date: -1 });
    await mongodb.collection('saas_rate_limits').createIndex({ orgId: 1, endpoint: 1, windowStart: 1 });

    console.log('✅ SaaS Platform Database Initialized Successfully');
    console.log('📧 Demo Login: admin@demo.siyadah.ai / demo123456');
    console.log('🏢 Demo Organization: شركة سيادة التجريبية');
    console.log('📊 Created 4 subscription plans');
    console.log('🔧 Database indexes created for performance');

  } catch (error) {
    console.error('❌ SaaS Database Initialization Failed:', error);
    throw error;
  }
}