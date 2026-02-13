import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Phone, 
  Database, 
  TrendingUp, 
  Calendar,
  LogOut,
  Settings,
  BarChart3,
  UserPlus,
  MessageSquare,
  Bot,
  Workflow,
  Mail
} from 'lucide-react';

interface DashboardData {
  organization: {
    name: string;
    subscription: {
      plan: string;
      planName: string;
      status: string;
      daysRemaining: number;
    };
  };
  stats: {
    totalRevenue: number;
    activeUsers: number;
    apiCallsToday: number;
    lastLogin: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  quickStats: {
    opportunities: number;
    aiAgents: number;
    workflows: number;
    messages: number;
  };
}

export default function MainDashboard() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('saas_token');
      const userData = localStorage.getItem('saas_user');
      
      if (!token) {
        setLocation('/auth/login');
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Load analytics data
      const response = await fetch('/api/enterprise-saas/analytics', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Transform analytics data to dashboard format
          const orgData = JSON.parse(localStorage.getItem('saas_organization') || '{}');
          setData({
            organization: {
              name: orgData.name || 'منظمة تجريبية',
              subscription: result.data.subscription
            },
            stats: result.data.stats,
            recentActivity: [
              {
                id: '1',
                type: 'chat',
                description: 'تم إرسال 15 رسالة واتساب تلقائية',
                timestamp: new Date().toISOString()
              },
              {
                id: '2',
                type: 'agent',
                description: 'وكيل الذكاء الاصطناعي "سارة" نشط',
                timestamp: new Date().toISOString()
              },
              {
                id: '3',
                type: 'opportunity',
                description: 'فرصة جديدة: شركة التقنية المتقدمة',
                timestamp: new Date().toISOString()
              }
            ],
            quickStats: {
              opportunities: 23,
              aiAgents: 6,
              workflows: 12,
              messages: 1247
            }
          });
        }
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_organization');
    setLocation('/auth/login');
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ar-SA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                سيادة AI - لوحة التحكم الرئيسية
              </h1>
              <p className="text-gray-600">
                {data.organization.name} • أهلاً {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {data.organization.subscription.planName}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setLocation('/settings/profile')}>
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
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الفرص التجارية</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.quickStats.opportunities)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوكلاء الذكيون</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.quickStats.aiAgents)}
                  </p>
                </div>
                <Bot className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">سير العمل</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.quickStats.workflows)}
                  </p>
                </div>
                <Workflow className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الرسائل المرسلة</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.quickStats.messages)}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>الوصول السريع للميزات الأساسية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-blue-50"
                  onClick={() => setLocation('/ai/chat-interface')}
                >
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">الدردشة الذكية</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-green-50"
                  onClick={() => setLocation('/business/sales-pipeline')}
                >
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span className="text-sm">إدارة المبيعات</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-purple-50"
                  onClick={() => setLocation('/communication/whatsapp')}
                >
                  <Phone className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">واتساب AI</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 hover:bg-orange-50"
                  onClick={() => setLocation('/ai/team-management')}
                >
                  <Bot className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">إدارة الوكلاء</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الاشتراك الحالي</CardTitle>
              <CardDescription>معلومات خطة الاشتراك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الخطة:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {data.organization.subscription.planName}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الحالة:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {data.organization.subscription.status === 'active' ? 'نشط' : 'منتهي'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">الأيام المتبقية:</span>
                <span className="font-bold text-2xl text-blue-600">
                  {data.organization.subscription.daysRemaining}
                </span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                ترقية الاشتراك
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر العمليات والأنشطة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    عرض التفاصيل
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}