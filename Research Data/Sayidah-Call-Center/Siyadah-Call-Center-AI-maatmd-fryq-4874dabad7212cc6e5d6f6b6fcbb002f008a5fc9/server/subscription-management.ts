
import { Request, Response } from 'express';

interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  features: {
    whatsappMessages: number;
    emailsSent: number;
    voiceCalls: number;
    aiAgents: number;
    advancedAnalytics: boolean;
  };
  overageRates: {
    whatsappPer1000: number;
    emailPer1000: number;
    voiceCallPerMinute: number;
  };
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'خطة البداية',
    priceMonthly: 299,
    features: {
      whatsappMessages: 1000,
      emailsSent: 5000,
      voiceCalls: 100,
      aiAgents: 1,
      advancedAnalytics: false
    },
    overageRates: {
      whatsappPer1000: 50,
      emailPer1000: 25,
      voiceCallPerMinute: 2
    }
  },
  {
    id: 'business',
    name: 'خطة الأعمال',
    priceMonthly: 899,
    features: {
      whatsappMessages: 5000,
      emailsSent: 25000,
      voiceCalls: 500,
      aiAgents: 3,
      advancedAnalytics: true
    },
    overageRates: {
      whatsappPer1000: 40,
      emailPer1000: 20,
      voiceCallPerMinute: 1.5
    }
  },
  {
    id: 'enterprise',
    name: 'خطة المؤسسات',
    priceMonthly: 2499,
    features: {
      whatsappMessages: 20000,
      emailsSent: 100000,
      voiceCalls: 2000,
      aiAgents: 10,
      advancedAnalytics: true
    },
    overageRates: {
      whatsappPer1000: 30,
      emailPer1000: 15,
      voiceCallPerMinute: 1
    }
  }
];

interface UserSubscription {
  userId: string;
  planId: string;
  startDate: Date;
  nextBillingDate: Date;
  status: 'active' | 'suspended' | 'cancelled';
  usage: {
    whatsappMessages: number;
    emailsSent: number;
    voiceMinutes: number;
  };
  monthlyBill: number;
}

class SubscriptionManager {
  private userSubscriptions = new Map<string, UserSubscription>();

  getPlan(planId: string): SubscriptionPlan | undefined {
    return subscriptionPlans.find(plan => plan.id === planId);
  }

  getAllPlans(): SubscriptionPlan[] {
    return subscriptionPlans;
  }

  subscribeUser(userId: string, planId: string): UserSubscription {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('خطة الاشتراك غير موجودة');
    }

    const subscription: UserSubscription = {
      userId,
      planId,
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'active',
      usage: {
        whatsappMessages: 0,
        emailsSent: 0,
        voiceMinutes: 0
      },
      monthlyBill: plan.priceMonthly
    };

    this.userSubscriptions.set(userId, subscription);
    return subscription;
  }

  trackUsage(userId: string, type: 'whatsapp' | 'email' | 'voice', amount: number): void {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) return;

    switch (type) {
      case 'whatsapp':
        subscription.usage.whatsappMessages += amount;
        break;
      case 'email':
        subscription.usage.emailsSent += amount;
        break;
      case 'voice':
        subscription.usage.voiceMinutes += amount;
        break;
    }

    this.calculateMonthlyBill(userId);
  }

  private calculateMonthlyBill(userId: string): void {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) return;

    const plan = this.getPlan(subscription.planId);
    if (!plan) return;

    let totalBill = plan.priceMonthly;

    // حساب التجاوزات
    const whatsappOverage = Math.max(0, subscription.usage.whatsappMessages - plan.features.whatsappMessages);
    const emailOverage = Math.max(0, subscription.usage.emailsSent - plan.features.emailsSent);
    const voiceOverage = Math.max(0, subscription.usage.voiceMinutes - plan.features.voiceCalls);

    totalBill += Math.ceil(whatsappOverage / 1000) * plan.overageRates.whatsappPer1000;
    totalBill += Math.ceil(emailOverage / 1000) * plan.overageRates.emailPer1000;
    totalBill += voiceOverage * plan.overageRates.voiceCallPerMinute;

    subscription.monthlyBill = totalBill;
  }

  getUserSubscription(userId: string): UserSubscription | undefined {
    return this.userSubscriptions.get(userId);
  }

  getUsageReport(userId: string): any {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) return null;

    const plan = this.getPlan(subscription.planId);
    if (!plan) return null;

    return {
      plan: plan.name,
      usage: subscription.usage,
      limits: plan.features,
      currentBill: subscription.monthlyBill,
      overages: {
        whatsapp: Math.max(0, subscription.usage.whatsappMessages - plan.features.whatsappMessages),
        email: Math.max(0, subscription.usage.emailsSent - plan.features.emailsSent),
        voice: Math.max(0, subscription.usage.voiceMinutes - plan.features.voiceCalls)
      }
    };
  }
}

export const subscriptionManager = new SubscriptionManager();

// API Routes
export const subscriptionRoutes = {
  getPlans: (req: Request, res: Response) => {
    const plans = subscriptionManager.getAllPlans();
    res.json({ success: true, plans });
  },

  subscribe: (req: Request, res: Response) => {
    try {
      const { userId, planId } = req.body;
      const subscription = subscriptionManager.subscribeUser(userId, planId);
      res.json({ success: true, subscription });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  getUsage: (req: Request, res: Response) => {
    const { userId } = req.params;
    const usage = subscriptionManager.getUsageReport(userId);
    
    if (!usage) {
      return res.status(404).json({ success: false, error: 'الاشتراك غير موجود' });
    }

    res.json({ success: true, usage });
  },

  trackUsage: (req: Request, res: Response) => {
    const { userId, type, amount } = req.body;
    subscriptionManager.trackUsage(userId, type, amount);
    res.json({ success: true, message: 'تم تسجيل الاستخدام' });
  }
};
