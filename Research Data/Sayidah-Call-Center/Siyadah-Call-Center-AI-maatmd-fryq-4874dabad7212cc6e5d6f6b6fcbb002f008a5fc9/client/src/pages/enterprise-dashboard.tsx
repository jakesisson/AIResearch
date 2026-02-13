import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Shield,
  Clock,
  Target,
  BarChart3,
  Globe,
  Server,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function EnterpriseDashboard() {
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities']
  });

  const { data: agentsData } = useQuery({
    queryKey: ['/api/ai-agents']
  });

  const agents = (agentsData && Array.isArray((agentsData as any).agents)) ? (agentsData as any).agents : [];
  const opportunitiesData = Array.isArray(opportunities) ? opportunities : [];
  const totalValue = opportunitiesData.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);

  const enterpriseMetrics = {
    totalRevenue: totalValue,
    activeClients: 23,
    systemUptime: 99.9,
    responseTime: 78,
    aiAgents: agents.length,
    avgPerformance: agents.length > 0 ? 
      Math.round(agents.reduce((sum: number, agent: any) => sum + agent.performance, 0) / agents.length) : 0,
    securityLevel: 'Enterprise Grade',
    complianceScore: 95
  };

  return (
    <Layout showBackButton={true}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            لوحة التحكم المؤسسية
          </h1>
          <p className="text-slate-400">مراقبة شاملة لأداء المؤسسة والمقاييس الاستراتيجية</p>
        </div>

        {/* المقاييس الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(enterpriseMetrics.totalRevenue / 1000000).toFixed(1)}M ريال</div>
              <p className="text-xs text-green-400">+18% من الربع الماضي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">العملاء النشطون</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{enterpriseMetrics.activeClients}</div>
              <p className="text-xs text-blue-400">+5 عملاء جدد</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">وقت التشغيل</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{enterpriseMetrics.systemUptime}%</div>
              <p className="text-xs text-purple-400">SLA متقدم</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">أداء الـ AI</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{enterpriseMetrics.avgPerformance}%</div>
              <p className="text-xs text-yellow-400">{enterpriseMetrics.aiAgents} وكيل نشط</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* الأداء التشغيلي */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الأداء التشغيلي</CardTitle>
                <CardDescription className="text-slate-400">
                  مقاييس الأداء الرئيسية للعمليات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">معدل الاستجابة</span>
                      <span className="text-sm text-white">{enterpriseMetrics.responseTime}ms</span>
                    </div>
                    <Progress value={100 - (enterpriseMetrics.responseTime / 10)} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">رضا العملاء</span>
                      <span className="text-sm text-white">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">كفاءة العمليات</span>
                      <span className="text-sm text-white">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">أمان النظام</span>
                      <span className="text-sm text-white">99%</span>
                    </div>
                    <Progress value={99} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تحليل الأعمال</CardTitle>
                <CardDescription className="text-slate-400">
                  نظرة شاملة على الأداء التجاري
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">الفرص النشطة</div>
                        <div className="text-xl font-bold text-white">{opportunitiesData.length}</div>
                      </div>
                      <Target className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">معدل التحويل</div>
                        <div className="text-xl font-bold text-white">73%</div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">دورة البيع</div>
                        <div className="text-xl font-bold text-white">28 يوم</div>
                      </div>
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">النمو الشهري</div>
                        <div className="text-xl font-bold text-white">+24%</div>
                      </div>
                      <BarChart3 className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الحالة المؤسسية */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">حالة النظام</CardTitle>
                <CardDescription className="text-slate-400">
                  مراقبة الخدمات المؤسسية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">MongoDB Atlas</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    متصل
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">AI Agents</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    نشط
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">API Gateway</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    مستقر
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">الأمان</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    محمي
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">الامتثال والأمان</CardTitle>
                <CardDescription className="text-slate-400">
                  مستوى الامتثال للمعايير
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">ISO 27001</span>
                  <Badge className="bg-green-500/20 text-green-400">معتمد</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">SOC 2 Type II</span>
                  <Badge className="bg-green-500/20 text-green-400">معتمد</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">GDPR</span>
                  <Badge className="bg-green-500/20 text-green-400">متوافق</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">نظام SAMA</span>
                  <Badge className="bg-green-500/20 text-green-400">متوافق</Badge>
                </div>
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">نقاط الامتثال</span>
                    <span className="text-sm text-white">{enterpriseMetrics.complianceScore}/100</span>
                  </div>
                  <Progress value={enterpriseMetrics.complianceScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">الطلبات اليومية</span>
                  <span className="text-white font-semibold">24,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المستخدمون النشطون</span>
                  <span className="text-white font-semibold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">البيانات المعالجة</span>
                  <span className="text-white font-semibold">2.3 TB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الدول المخدومة</span>
                  <span className="text-white font-semibold">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}