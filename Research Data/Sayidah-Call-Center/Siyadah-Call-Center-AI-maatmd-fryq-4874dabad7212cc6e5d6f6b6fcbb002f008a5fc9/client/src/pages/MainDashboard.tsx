import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  Bot,
  Zap,
  Target,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Settings,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Clock,
  PieChart,
  Award,
  HeadphonesIcon,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

export default function MainDashboard() {
  const { data: opportunities, isLoading: loadingOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/opportunities');
      if (!response.ok) throw new Error('فشل في تحميل الفرص');
      return response.json();
    }
  });

  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['/api/ai-agents'],
    queryFn: async () => {
      const response = await fetch('/api/ai-agents');
      if (!response.ok) throw new Error('فشل في تحميل الوكلاء');
      return response.json();
    }
  });

  const isLoading = loadingOpportunities || loadingAgents;

  // حساب الإحصائيات من البيانات الحقيقية
  const totalValue = opportunities?.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) || 0;
  const activeOpportunities = opportunities?.filter((opp: any) => opp.stage !== 'closed').length || 0;
  const agents = agentsData?.agents || [];
  const avgPerformance = agents.length > 0 ? agents.reduce((sum: number, agent: any) => sum + (agent.performance || 0), 0) / agents.length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">سيادة AI</h2>
          <p className="text-slate-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header الجديد */}
      <div className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">سيادة AI</h1>
                <p className="text-slate-400 text-lg">مركز الاتصال الذكي - لوحة التحكم الرئيسية</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
                متصل ويعمل
              </Badge>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all"
                onClick={() => window.location.href = '/settings'}
              >
                <Settings className="w-4 h-4 ml-2" />
                الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* إحصائيات رئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">إجمالي الفرص</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(totalValue / 1000000).toFixed(1)}M ريال</div>
              <p className="text-xs text-slate-400">+{activeOpportunities} فرصة نشطة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">الوكلاء الذكيين</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <p className="text-xs text-slate-400">أداء {avgPerformance.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">المكالمات اليوم</CardTitle>
              <Phone className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">47</div>
              <p className="text-xs text-slate-400">معدل النجاح 94%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">رضا العملاء</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">96%</div>
              <p className="text-xs text-slate-400">+2% عن الأسبوع الماضي</p>
            </CardContent>
          </Card>
        </div>

        {/* الأقسام الرئيسية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* قسم الوصول السريع */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">الوصول السريع</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              
              <Link href="/ai-team-management">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <Bot className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">إدارة الفريق الذكي</h3>
                    <p className="text-xs text-slate-400">3 وكلاء نشطين</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/sales-pipeline">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">خط المبيعات</h3>
                    <p className="text-xs text-slate-400">{activeOpportunities} فرصة نشطة</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/voice-analytics">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <HeadphonesIcon className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">النظام الصوتي</h3>
                    <p className="text-xs text-slate-400">47 مكالمة اليوم</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/whatsapp-test">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">WhatsApp</h3>
                    <p className="text-xs text-slate-400">مرتبط ويعمل</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/financial-management">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <PieChart className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">النظام المالي</h3>
                    <p className="text-xs text-slate-400">إدارة شاملة</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/rbac-management">
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <ShieldCheck className="w-8 h-8 text-red-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-white mb-1">إدارة الصلاحيات</h3>
                    <p className="text-xs text-slate-400">نظام RBAC</p>
                  </CardContent>
                </Card>
              </Link>

            </div>
          </div>

          {/* قسم الأنشطة الحديثة */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">الأنشطة الحديثة</h2>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">مكالمة جديدة مع عميل محتمل</p>
                      <p className="text-xs text-slate-400">منذ 5 دقائق</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">تم إنشاء فرصة جديدة</p>
                      <p className="text-xs text-slate-400">منذ 12 دقيقة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">رسالة واتساب تم إرسالها</p>
                      <p className="text-xs text-slate-400">منذ 18 دقيقة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">تحليل أداء الوكلاء</p>
                      <p className="text-xs text-slate-400">منذ 25 دقيقة</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => window.location.href = '/reports'}
                >
                  عرض جميع الأنشطة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* أداء النظام */}
        <div className="mt-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">أداء الخادم</span>
                    <span className="text-sm text-green-400">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">قاعدة البيانات</span>
                    <span className="text-sm text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">أداء الوكلاء</span>
                    <span className="text-sm text-green-400">{avgPerformance.toFixed(0)}%</span>
                  </div>
                  <Progress value={avgPerformance} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">معدل الاستجابة</span>
                    <span className="text-sm text-green-400">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}