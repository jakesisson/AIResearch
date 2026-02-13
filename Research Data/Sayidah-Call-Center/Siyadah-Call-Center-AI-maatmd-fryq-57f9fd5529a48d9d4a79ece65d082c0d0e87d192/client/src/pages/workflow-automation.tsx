import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function WorkflowAutomation() {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['/api/workflows'],
    queryFn: async () => {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">أتمتة سير العمل</h2>
            <p className="text-slate-400">جاري تحميل بيانات سير العمل...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const workflowData = workflows || [];
  const activeWorkflows = workflowData.filter((wf: any) => wf.status === 'active').length;
  const totalExecutions = workflowData.reduce((sum: number, wf: any) => sum + (wf.executions || 0), 0);

  return (
    <Layout showBackButton={true}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Workflow className="w-8 h-8 text-purple-400" />
            أتمتة سير العمل
          </h1>
          <p className="text-slate-400">إنشاء وإدارة سير العمل الآلي لتحسين الكفاءة</p>
        </div>

        {/* إحصائيات سير العمل */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">إجمالي سير العمل</CardTitle>
              <Workflow className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{workflowData.length}</div>
              <p className="text-xs text-slate-400">+{activeWorkflows} نشط</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">التنفيذات الكلية</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalExecutions.toLocaleString()}</div>
              <p className="text-xs text-slate-400">هذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">معدل النجاح</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">94%</div>
              <p className="text-xs text-slate-400">نجح التنفيذ</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">الوقت المتوفر</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">245h</div>
              <p className="text-xs text-slate-400">توفير شهري</p>
            </CardContent>
          </Card>
        </div>

        {/* قائمة سير العمل */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {workflowData.map((workflow: any) => (
            <Card key={workflow.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{workflow.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{workflow.description}</p>
                  </div>
                  <Badge className={`${
                    workflow.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {workflow.status === 'active' ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* خطوات سير العمل */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">خطوات التنفيذ</h4>
                    <div className="flex items-center gap-2 text-xs">
                      {workflow.steps?.map((step: string, index: number) => (
                        <React.Fragment key={index}>
                          <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">
                            {step}
                          </span>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* إحصائيات الأداء */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">التنفيذات</p>
                      <p className="text-white font-semibold">{workflow.executions || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">معدل النجاح</p>
                      <p className="text-white font-semibold">{workflow.successRate || 95}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">آخر تشغيل</p>
                      <p className="text-white font-semibold">منذ {Math.floor(Math.random() * 12) + 1}س</p>
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">حالة التنفيذ</span>
                      <span className="text-sm text-white">{workflow.successRate || 95}%</span>
                    </div>
                    <Progress value={workflow.successRate || 95} className="h-2" />
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 ml-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 ml-1" />
                          تشغيل
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-600 text-slate-300"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-600 text-slate-300"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* قوالب سير العمل الجاهزة */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">قوالب سير العمل الجاهزة</CardTitle>
            <CardDescription className="text-slate-400">
              ابدأ بسرعة باستخدام قوالب محددة مسبقاً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-700/50 border-slate-600 cursor-pointer hover:bg-slate-700/70 transition-colors">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">متابعة العملاء</h4>
                  <p className="text-xs text-slate-400">رسائل تلقائية للعملاء الجدد</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 cursor-pointer hover:bg-slate-700/70 transition-colors">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">معالجة الطلبات</h4>
                  <p className="text-xs text-slate-400">أتمتة معالجة الطلبات الواردة</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 cursor-pointer hover:bg-slate-700/70 transition-colors">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">تقارير دورية</h4>
                  <p className="text-xs text-slate-400">إنشاء وإرسال التقارير تلقائياً</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* إضافة سير عمل جديد */}
        <div className="text-center">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 ml-2" />
            إنشاء سير عمل جديد
          </Button>
        </div>
      </div>
    </Layout>
  );
}