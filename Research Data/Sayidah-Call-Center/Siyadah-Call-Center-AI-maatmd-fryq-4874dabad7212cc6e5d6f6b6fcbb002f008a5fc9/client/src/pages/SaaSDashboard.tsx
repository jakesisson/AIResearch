import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Phone, 
  Database, 
  TrendingUp, 
  Calendar,
  LogOut,
  Settings,
  BarChart3,
  UserPlus
} from 'lucide-react';

interface AnalyticsData {
  subscription: {
    plan: string;
    planName: string;
    status: string;
    daysRemaining: number;
    limits: {
      users: number;
      apiCalls: number;
      storage: number;
      features: string[];
    };
  };
  usage: {
    users: number;
    apiCalls: number;
    storage: number;
    usagePercentage: {
      users: number;
      apiCalls: number;
      storage: number;
    };
  };
  features: string[];
  stats: {
    totalRevenue: number;
    activeUsers: number;
    apiCallsToday: number;
    lastLogin: string;
  };
}

const featureNames: { [key: string]: string } = {
  'basic_chat': 'الدردشة الأساسية',
  'advanced_chat': 'الدردشة المتقدمة',
  'basic_reports': 'التقارير الأساسية',
  'advanced_reports': 'التقارير المتقدمة',
  'whatsapp_integration': 'تكامل واتساب',
  'voice_calls': 'المكالمات الصوتية',
  'ai_agents': 'الوكلاء الذكيون',
  'workflow_automation': 'أتمتة سير العمل',
  'all_features': 'جميع الميزات',
  'priority_support': 'الدعم المميز',
  'custom_integrations': 'التكاملات المخصصة',
  'dedicated_success_manager': 'مدير نجاح مخصص'
};

export default function SaaSDashboard() {
  const [, setLocation] = useLocation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('saas_token');
      if (!token) {
        setLocation('/saas-login');
        return;
      }

      // Load user info from localStorage
      const userData = localStorage.getItem('saas_user');
      const orgData = localStorage.getItem('saas_organization');
      
      if (userData) setUser(JSON.parse(userData));
      if (orgData) setOrganization(JSON.parse(orgData));

      // Fetch analytics data
      const response = await fetch('/api/enterprise-saas/analytics', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('فشل في تحميل البيانات');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'خطأ في تحميل البيانات');
      }

    } catch (err: any) {
      setError('خطأ في تحميل لوحة التحكم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_organization');
    setLocation('/saas-login');
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ar-SA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) return null;

  const { subscription, usage, features, stats } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                سيادة AI - لوحة التحكم
              </h1>
              <p className="text-gray-600">
                {organization?.name} • {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {subscription.planName}
                    </Badge>
                    معلومات الاشتراك
                  </CardTitle>
                  <CardDescription>
                    حالة الاشتراك: {subscription.status === 'active' ? 'نشط' : 'منتهي'}
                  </CardDescription>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-blue-600">
                    {subscription.daysRemaining}
                  </div>
                  <div className="text-sm text-gray-600">يوم متبقي</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">المستخدمون النشطون</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.activeUsers)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">استدعاءات API اليوم</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.apiCallsToday)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">الإيرادات الشهرية</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.totalRevenue)} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">التخزين المستخدم</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usage.storage} GB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الاستخدام</CardTitle>
              <CardDescription>الاستخدام مقابل الحدود المسموحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>المستخدمون</span>
                  <span>
                    {formatNumber(usage.users)} / 
                    {subscription.limits.users === -1 ? ' غير محدود' : formatNumber(subscription.limits.users)}
                  </span>
                </div>
                <Progress 
                  value={subscription.limits.users === -1 ? 0 : usage.usagePercentage.users} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>استدعاءات API</span>
                  <span>
                    {formatNumber(usage.apiCalls)} / 
                    {subscription.limits.apiCalls === -1 ? ' غير محدود' : formatNumber(subscription.limits.apiCalls)}
                  </span>
                </div>
                <Progress 
                  value={subscription.limits.apiCalls === -1 ? 0 : usage.usagePercentage.apiCalls} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>التخزين (GB)</span>
                  <span>
                    {usage.storage} / 
                    {subscription.limits.storage === -1 ? ' غير محدود' : subscription.limits.storage}
                  </span>
                </div>
                <Progress 
                  value={subscription.limits.storage === -1 ? 0 : usage.usagePercentage.storage} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الميزات المتاحة</CardTitle>
              <CardDescription>الميزات المشمولة في خطتك الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{featureNames[feature] || feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للميزات الأساسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => setLocation('/dashboard')}
              >
                <BarChart3 className="h-6 w-6" />
                فتح الدردشة الذكية
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                عرض التقارير
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                إدارة الفريق
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                ترقية الاشتراك
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}