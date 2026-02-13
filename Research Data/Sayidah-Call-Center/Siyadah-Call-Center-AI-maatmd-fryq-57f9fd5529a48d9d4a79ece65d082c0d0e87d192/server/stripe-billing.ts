import { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';

// Initialize Stripe only if key is provided
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil' as any
  });
  console.log('💳 Stripe billing initialized');
} else {
  console.log('⚠️ Stripe billing not configured - STRIPE_SECRET_KEY missing');
}

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    nameAr: 'البداية',
    price: 299,
    currency: 'SAR',
    features: [
      '5 AI Agents',
      '1,000 Messages/Month',
      'Basic Analytics',
      'Email Support'
    ],
    featuresAr: [
      '5 وكلاء ذكاء اصطناعي',
      '1,000 رسالة شهرياً',
      'تحليلات أساسية',
      'دعم بالبريد الإلكتروني'
    ],
    stripeProductId: process.env.STRIPE_STARTER_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    nameAr: 'المحترف',
    price: 999,
    currency: 'SAR',
    features: [
      '20 AI Agents',
      '10,000 Messages/Month',
      'Advanced Analytics',
      'Priority Support',
      'WhatsApp Integration',
      'Custom Workflows'
    ],
    featuresAr: [
      '20 وكيل ذكاء اصطناعي',
      '10,000 رسالة شهرياً',
      'تحليلات متقدمة',
      'دعم ذو أولوية',
      'تكامل واتساب',
      'مسارات عمل مخصصة'
    ],
    stripeProductId: process.env.STRIPE_PROFESSIONAL_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID
  },
  business: {
    id: 'business',
    name: 'Business',
    nameAr: 'الأعمال',
    price: 2999,
    currency: 'SAR',
    features: [
      '50 AI Agents',
      '50,000 Messages/Month',
      'Enterprise Analytics',
      'Dedicated Support',
      'All Integrations',
      'Custom AI Training',
      'API Access'
    ],
    featuresAr: [
      '50 وكيل ذكاء اصطناعي',
      '50,000 رسالة شهرياً',
      'تحليلات مؤسسية',
      'دعم مخصص',
      'جميع التكاملات',
      'تدريب ذكاء اصطناعي مخصص',
      'وصول API'
    ],
    stripeProductId: process.env.STRIPE_BUSINESS_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'المؤسسة',
    price: 0, // Custom pricing
    currency: 'SAR',
    features: [
      'Unlimited AI Agents',
      'Unlimited Messages',
      'Custom Analytics',
      'White-label Option',
      'On-premise Deployment',
      'SLA Guarantee',
      'Dedicated Team'
    ],
    featuresAr: [
      'وكلاء ذكاء اصطناعي غير محدودين',
      'رسائل غير محدودة',
      'تحليلات مخصصة',
      'خيار العلامة البيضاء',
      'نشر محلي',
      'ضمان SLA',
      'فريق مخصص'
    ],
    stripeProductId: null,
    stripePriceId: null
  }
};

/**
 * Create Stripe customer
 */
export async function createStripeCustomer(
  email: string, 
  name: string, 
  organizationId: string
): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organizationId
      }
    });
    
    return customer.id;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Create subscription
 */
export async function createSubscription(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'خدمة الدفع غير متوفرة حالياً'
      });
    }
    
    const { planId, paymentMethodId } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan || !plan.stripePriceId) {
      return res.status(400).json({
        success: false,
        error: 'خطة الاشتراك غير صالحة'
      });
    }
    
    // Get user and organization
    const user = await (storage as any).getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.organizationId
      );
      
      // Update user with Stripe customer ID
      await (storage as any).updateUser(userId, {
        stripeCustomerId
      });
    }
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId
    });
    
    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{
        price: plan.stripePriceId
      }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    });
    
    // Update organization with subscription info
    await (storage as any).updateOrganization(user.organizationId, {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: planId,
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      }
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل إنشاء الاشتراك'
    });
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(req: Request, res: Response) {
  try {
    const { newPlanId } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Validate new plan
    const newPlan = SUBSCRIPTION_PLANS[newPlanId as keyof typeof SUBSCRIPTION_PLANS];
    if (!newPlan || !newPlan.stripePriceId) {
      return res.status(400).json({
        success: false,
        error: 'خطة الاشتراك الجديدة غير صالحة'
      });
    }
    
    // Get user and organization
    const user = await (storage as any).getUser(userId);
    const organization = await (storage as any).getOrganization(user.organizationId);
    
    if (!organization.subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد اشتراك نشط'
      });
    }
    
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(organization.subscriptionId);
    
    // Update subscription
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPlan.stripePriceId
      }],
      proration_behavior: 'create_prorations'
    });
    
    // Update organization
    await (storage as any).updateOrganization(user.organizationId, {
      subscriptionPlan: newPlanId,
      subscriptionStatus: updatedSubscription.status
    });
    
    res.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        plan: newPlanId
      }
    });
  } catch (error: any) {
    console.error('Subscription update error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل تحديث الاشتراك'
    });
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Get user and organization
    const user = await (storage as any).getUser(userId);
    const organization = await (storage as any).getOrganization(user.organizationId);
    
    if (!organization.subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد اشتراك نشط'
      });
    }
    
    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      organization.subscriptionId,
      { cancel_at_period_end: true }
    );
    
    // Update organization
    await (storage as any).updateOrganization(user.organizationId, {
      subscriptionStatus: 'canceling',
      subscriptionCancelAt: new Date(subscription.cancel_at! * 1000)
    });
    
    res.json({
      success: true,
      message: 'سيتم إلغاء الاشتراك في نهاية الفترة الحالية',
      cancelAt: new Date(subscription.cancel_at! * 1000)
    });
  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل إلغاء الاشتراك'
    });
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Get user and organization
    const user = await (storage as any).getUser(userId);
    const organization = await (storage as any).getOrganization(user.organizationId);
    
    if (!organization.subscriptionId) {
      return res.json({
        success: true,
        subscription: null,
        plan: SUBSCRIPTION_PLANS.starter // Default to starter if no subscription
      });
    }
    
    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(organization.subscriptionId, {
      expand: ['customer', 'default_payment_method']
    });
    
    // Get current plan
    const currentPlan = SUBSCRIPTION_PLANS[organization.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
      },
      plan: currentPlan,
      paymentMethod: subscription.default_payment_method
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل الحصول على تفاصيل الاشتراك'
    });
  }
}

/**
 * Create payment intent for one-time payment
 */
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, currency = 'SAR', description } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مسجل دخول'
      });
    }
    
    // Get user
    const user = await (storage as any).getUser(userId);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      description,
      metadata: {
        userId,
        organizationId: user.organizationId
      }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل إنشاء عملية الدفع'
    });
  }
}

/**
 * Handle Stripe webhook
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        break;
        
      case 'subscription.created':
      case 'subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('📅 Subscription event:', event.type, subscription.id);
        
        // Update organization subscription status
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && customer.metadata.organizationId) {
          await (storage as any).updateOrganization(customer.metadata.organizationId, {
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          });
        }
        break;
        
      case 'subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription cancelled:', deletedSubscription.id);
        
        // Update organization
        const deletedCustomerId = deletedSubscription.customer as string;
        const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId);
        if (deletedCustomer && !deletedCustomer.deleted && deletedCustomer.metadata.organizationId) {
          await (storage as any).updateOrganization(deletedCustomer.metadata.organizationId, {
            subscriptionStatus: 'cancelled',
            subscriptionId: null
          });
        }
        break;
        
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('⚠️ Payment failed for invoice:', invoice.id);
        
        // TODO: Send email notification
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}