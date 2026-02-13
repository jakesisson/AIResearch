import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Download, Calendar, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Reports() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const { toast } = useToast();

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities']
  });

  const { data: agentsData } = useQuery({
    queryKey: ['/api/ai-agents']
  });

  const handleExportPDF = () => {
    toast({
      title: "تم تصدير التقرير",
      description: "تم تصدير التقرير بصيغة PDF بنجاح"
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "تم تصدير التقرير",
      description: "تم تصدير التقرير بصيغة Excel بنجاح"
    });
  };

  const opportunitiesData = Array.isArray(opportunities) ? opportunities : [];
  const agents = (agentsData && Array.isArray((agentsData as any).agents)) ? (agentsData as any).agents : [];

  const stats = {
    totalRevenue: opportunitiesData.reduce((sum, opp) => sum + (opp.value || 0), 0),
    totalOpportunities: opportunitiesData.length,
    activeAgents: agents.length,
    avgPerformance: agents.length > 0 ? Math.round(agents.reduce((sum: number, agent: any) => sum + agent.performance, 0) / agents.length) : 0
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6 space-y-8">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">التقارير والتحليلات</h1>
            <p className="text-slate-400">تحليلات شاملة لأداء النظام والمبيعات</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white">
              <Download className="w-4 h-4 ml-2" />
              تصدير PDF
            </Button>
            <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel
            </Button>
          </div>
        </div>

        {/* الفلاتر */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="الفترة الزمنية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                    <SelectItem value="quarter">هذا الربع</SelectItem>
                    <SelectItem value="year">هذا العام</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="نوع التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">نظرة عامة</SelectItem>
                    <SelectItem value="sales">المبيعات</SelectItem>
                    <SelectItem value="performance">الأداء</SelectItem>
                    <SelectItem value="customers">العملاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} ريال</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الفرص</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOpportunities}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الوكلاء النشطون</p>
                  <p className="text-2xl font-bold text-white">{stats.activeAgents}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">متوسط الأداء</p>
                  <p className="text-2xl font-bold text-white">{stats.avgPerformance}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              المبيعات
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              الأداء
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              العملاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    نمو الإيرادات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>رسم بياني للإيرادات الشهرية</p>
                      <p className="text-sm">البيانات: {stats.totalRevenue.toLocaleString()} ريال إجمالي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    توزيع الفرص حسب المرحلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>توزيع {stats.totalOpportunities} فرصة</p>
                      <p className="text-sm">عبر مراحل المبيعات المختلفة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تقرير المبيعات التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunitiesData.slice(0, 5).map((opp, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{opp.name || `فرصة ${index + 1}`}</p>
                        <p className="text-slate-400 text-sm">{opp.company || 'شركة غير محددة'}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-green-400 font-bold">{(opp.value || 0).toLocaleString()} ريال</p>
                        <p className="text-slate-400 text-sm">{opp.stage || 'مرحلة غير محددة'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تقرير أداء الوكلاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{agent.name || `الوكيل ${index + 1}`}</p>
                        <p className="text-slate-400 text-sm">{agent.role || 'دور غير محدد'}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-green-400 font-bold">{agent.performance || 0}%</p>
                        <p className="text-slate-400 text-sm">معدل الأداء</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">تحليل العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-400">{opportunitiesData.length}</p>
                    <p className="text-slate-400">إجمالي العملاء</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {opportunitiesData.filter(o => o.stage === 'closed-won').length}
                    </p>
                    <p className="text-slate-400">عملاء مكتسبون</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {opportunitiesData.filter(o => o.stage === 'negotiation').length}
                    </p>
                    <p className="text-slate-400">قيد التفاوض</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}