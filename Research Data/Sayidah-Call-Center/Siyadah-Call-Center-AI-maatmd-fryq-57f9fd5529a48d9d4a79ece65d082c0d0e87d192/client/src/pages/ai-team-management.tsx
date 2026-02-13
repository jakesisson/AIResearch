import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  TrendingUp, 
  Activity, 
  Settings, 
  Plus,
  BarChart3,
  Clock,
  Target,
  Users,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function AiTeamManagement() {
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['/api/ai-agents'],
    queryFn: async () => {
      const response = await fetch('/api/ai-agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    }
  });

  const agents = agentsData?.agents || [];

  if (isLoading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">إدارة الفريق الذكي</h2>
            <p className="text-slate-400">جاري تحميل بيانات الوكلاء...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            إدارة الفريق الذكي
          </h1>
          <p className="text-slate-400">إدارة ومراقبة أداء الوكلاء الذكيين في سيادة AI</p>
        </div>

        {/* إحصائيات عامة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">إجمالي الوكلاء</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <p className="text-xs text-slate-400">وكيل ذكي نشط</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">متوسط الأداء</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {agents.length > 0 ? Math.round(agents.reduce((sum: number, agent: any) => sum + agent.performance, 0) / agents.length) : 0}%
              </div>
              <p className="text-xs text-slate-400">معدل الأداء العام</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">المهام المكتملة</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">847</div>
              <p className="text-xs text-slate-400">مهمة هذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">وقت الاستجابة</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1.2s</div>
              <p className="text-xs text-slate-400">متوسط الاستجابة</p>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الوكلاء */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent: any) => (
            <Card key={agent.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <p className="text-slate-400 text-sm">{agent.specialization}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    agent.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {agent.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">مستوى الأداء</span>
                      <span className="text-sm text-white font-semibold">{agent.performance}%</span>
                    </div>
                    <Progress value={agent.performance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">المهام المكتملة</p>
                      <p className="text-white font-semibold">{Math.floor(Math.random() * 100) + 50}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">معدل النجاح</p>
                      <p className="text-white font-semibold">{Math.floor(agent.performance * 0.95)}%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                        <Settings className="w-4 h-4 ml-1" />
                        إعدادات
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300">
                        <BarChart3 className="w-4 h-4 ml-1" />
                        إحصائيات
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* زر إضافة وكيل جديد */}
        <div className="mt-8">
          <Card className="bg-slate-800/30 border-slate-700 border-dashed">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">إضافة وكيل ذكي جديد</h3>
                <p className="text-slate-400 mb-4">قم بإنشاء وكيل ذكي جديد بمهارات متخصصة</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة وكيل جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}