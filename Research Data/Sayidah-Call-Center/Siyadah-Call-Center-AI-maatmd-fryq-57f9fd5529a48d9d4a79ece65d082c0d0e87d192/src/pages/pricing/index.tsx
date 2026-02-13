
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Phone, Mail, MessageSquare, Bot, BarChart3 } from 'lucide-react';

interface Plan {
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

interface UserUsage {
  plan: string;
  usage: {
    whatsappMessages: number;
    emailsSent: number;
    voiceMinutes: number;
  };
  limits: {
    whatsappMessages: number;
    emailsSent: number;
    voiceCalls: number;
    aiAgents: number;
    advancedAnalytics: boolean;
  };
  currentBill: number;
  overages: {
    whatsapp: number;
    email: number;
    voice: number;
  };
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    fetchUserUsage();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('خطأ في جلب الخطط:', error);
    }
  };

  const fetchUserUsage = async () => {
    try {
      const response = await fetch('/api/subscription/usage/user123');
      const data = await response.json();
      if (data.success) {
        setUserUsage(data.usage);
      }
    } catch (error) {
      console.error('خطأ في جلب الاستخدام:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user123', planId })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('تم الاشتراك بنجاح!');
        fetchUserUsage();
      }
    } catch (error) {
      console.error('خطأ في الاشتراك:', error);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل خطط الأسعار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            خطط الأسعار
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر الخطة المناسبة لحجم أعمالك. ادفع حسب الاستهلاك مع مرونة كاملة.
          </p>
        </div>

        {/* Current Usage (if subscribed) */}
        {userUsage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                استخدامك الحالي - {userUsage.plan}
              </CardTitle>
              <CardDescription>
                فاتورتك الحالية: {userUsage.currentBill.toLocaleString()} ريال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      رسائل واتساب
                    </span>
                    <span className="text-sm text-gray-600">
                      {userUsage.usage.whatsappMessages.toLocaleString()} / {userUsage.limits.whatsappMessages.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(userUsage.usage.whatsappMessages, userUsage.limits.whatsappMessages)} />
                  {userUsage.overages.whatsapp > 0 && (
                    <p className="text-sm text-orange-600">
                      تجاوز: {userUsage.overages.whatsapp.toLocaleString()} رسالة
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      رسائل بريدية
                    </span>
                    <span className="text-sm text-gray-600">
                      {userUsage.usage.emailsSent.toLocaleString()} / {userUsage.limits.emailsSent.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(userUsage.usage.emailsSent, userUsage.limits.emailsSent)} />
                  {userUsage.overages.email > 0 && (
                    <p className="text-sm text-orange-600">
                      تجاوز: {userUsage.overages.email.toLocaleString()} رسالة
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      دقائق مكالمات
                    </span>
                    <span className="text-sm text-gray-600">
                      {userUsage.usage.voiceMinutes.toLocaleString()} / {userUsage.limits.voiceCalls.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(userUsage.usage.voiceMinutes, userUsage.limits.voiceCalls)} />
                  {userUsage.overages.voice > 0 && (
                    <p className="text-sm text-orange-600">
                      تجاوز: {userUsage.overages.voice.toLocaleString()} دقيقة
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`relative ${index === 1 ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  الأكثر شعبية
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-blue-600">
                  {plan.priceMonthly.toLocaleString()}
                  <span className="text-lg text-gray-500"> ريال/شهر</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{plan.features.whatsappMessages.toLocaleString()} رسالة واتساب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{plan.features.emailsSent.toLocaleString()} رسالة بريدية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{plan.features.voiceCalls.toLocaleString()} دقيقة مكالمات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{plan.features.aiAgents} وكيل ذكي</span>
                  </div>
                  {plan.features.advancedAnalytics && (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>تحليلات متقدمة</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">أسعار التجاوز:</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>واتساب: {plan.overageRates.whatsappPer1000} ريال/1000 رسالة</div>
                    <div>بريد: {plan.overageRates.emailPer1000} ريال/1000 رسالة</div>
                    <div>مكالمات: {plan.overageRates.voiceCallPerMinute} ريال/دقيقة</div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  variant={index === 1 ? "default" : "outline"}
                  onClick={() => subscribe(plan.id)}
                >
                  اختر هذه الخطة
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Market Note */}
        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">🌍 منصة عالمية للجميع</h3>
              <p className="text-gray-600">
                نخدم المتاجر والشركات الصغيرة في جميع أنحاء العالم. 
                أسعارنا تنافسية عالمياً مع دعم محلي باللغة العربية والإنجليزية.
              </p>
              <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
                <span>🇸🇦 السعودية</span>
                <span>🇦🇪 الإمارات</span>
                <span>🇪🇬 مصر</span>
                <span>🇺🇸 أمريكا</span>
                <span>🇬🇧 بريطانيا</span>
                <span>🌍 وأكثر...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
