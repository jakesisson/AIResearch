import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Users, DollarSign, Activity, 
  MessageSquare, Phone, Mail, Zap,
  BarChart3, PieChart, Calendar, Bell,
  Bot, BrainCircuit, Sparkles, Target,
  Shield, TestTube, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLocation } from 'wouter';
import IntelligentChatInterface from '@/components/IntelligentChatInterface';

interface DashboardMetrics {
  totalPipelineValue: number;
  totalOpportunities: number;
  conversionRate: number;
  activeTickets: number;
  ticketResolutionRate: number;
  activeWorkflows: number;
  opportunitiesByStage: Record<string, number>;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isConnected } = useWebSocket() || { isConnected: false };

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/metrics/dashboard');
      if (!response.ok) throw new Error('فشل في تحميل البيانات');
      return response.json();
    },
    refetchInterval: 30000 // تحديث كل 30 ثانية
  });

  // Quick access to RBAC management
  const goToRBACManagement = () => {
    navigate('/rbac-management');
  };

  const quickActions = [
    {
      title: 'اختبار تجربة المستخدم',
      description: 'اختبار شامل لجميع الصلاحيات والأدوار',
      icon: Shield,
      action: goToRBACManagement,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'إرسال رسائل واتساب',
      description: 'إرسال رسائل جماعية للعملاء',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => window.location.href = '/ai-assistant'
    },
    {
      title: 'جدولة اجتماع',
      description: 'حجز موعد مع العملاء',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => window.location.href = '/ai-assistant'
    },
    {
      title: 'تحليل البيانات',
      description: 'تحليل ذكي للأداء',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => window.location.href = '/ai-assistant'
    },
    {
      title: 'إطلاق حملة',
      description: 'حملة تسويقية ذكية',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => window.location.href = '/ai-assistant'
    }
  ];

  const aiInsights = [
    {
      title: 'أداء ممتاز هذا الأسبوع',
      description: 'معدل التحويل ارتفع بنسبة 23% مقارنة بالأسبوع الماضي',
      type: 'success'
    },
    {
      title: 'عملاء يحتاجون متابعة',
      description: '12 عميل لم يتم التواصل معهم خلال 5 أيام',
      type: 'warning'
    },
    {
      title: 'فرصة تسويقية',
      description: 'الوقت مناسب لإطلاق حملة للعملاء المهتمين',
      type: 'info'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الذكية</h1>
          <p className="text-gray-600 mt-1">نظرة شاملة على أداء أعمالك</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'متصل' : 'غير متصل'}
          </Badge>
          <Button onClick={() => window.location.href = '/ai-assistant'}>
            <Bot className="h-4 w-4 mr-2" />
            المساعد الذكي
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-600" />
            الذكاء الاصطناعي - رؤى ذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-l-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-l-yellow-500' :
                  'bg-blue-50 border-l-blue-500'
                }`}
              >
                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Section - Enhanced with 6 Intelligent Agents */}
      <div className="h-[600px]">
        <IntelligentChatInterface />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي قيمة الأنابيب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalPipelineValue?.toLocaleString() || 0} ر.س
            </div>
            <p className="text-xs text-muted-foreground">+15% من الشهر الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفرص</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalOpportunities || 0}</div>
            <p className="text-xs text-muted-foreground">+3 فرص جديدة هذا الأسبوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.conversionRate || 0}%</div>
            <Progress value={metrics?.conversionRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التذاكر النشطة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              معدل الحل: {metrics?.ticketResolutionRate || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الفرص حسب المرحلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.opportunitiesByStage && Object.entries(metrics.opportunitiesByStage).map(([stage, count]) => (
                <div key={stage} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{stage}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط اليومي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-gray-500">
              <BarChart3 className="h-8 w-8 mr-2" />
              الرسم البياني قيد التطوير
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>النشاطات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">تم إنشاء فرصة جديدة</p>
                  <p className="text-xs text-gray-500">شركة التقنية المتطورة - 150,000 ر.س</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">منذ ساعتين</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">تم إرسال رسائل واتساب</p>
                  <p className="text-xs text-gray-500">25 رسالة للعملاء الجدد</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">منذ 4 ساعات</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">تم تنفيذ أمر ذكي</p>
                  <p className="text-xs text-gray-500">تحليل أداء الفريق وإنشاء التقرير</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">منذ 6 ساعات</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}