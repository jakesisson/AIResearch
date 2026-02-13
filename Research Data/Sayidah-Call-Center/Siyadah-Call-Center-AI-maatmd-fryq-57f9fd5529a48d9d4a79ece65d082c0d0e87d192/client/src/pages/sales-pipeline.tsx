import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Users,
  Phone,
  Mail,
  Calendar,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function SalesPipeline() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/opportunities');
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">خط المبيعات</h2>
            <p className="text-slate-400">جاري تحميل الفرص التجارية...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalValue = opportunities?.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) || 0;
  const activeOpportunities = opportunities?.filter((opp: any) => opp.stage !== 'closed').length || 0;

  const stageGroups = {
    'qualification': opportunities?.filter((opp: any) => opp.stage === 'qualification') || [],
    'proposal': opportunities?.filter((opp: any) => opp.stage === 'proposal') || [],
    'negotiation': opportunities?.filter((opp: any) => opp.stage === 'negotiation') || [],
    'closed-won': opportunities?.filter((opp: any) => opp.stage === 'closed-won') || []
  };

  return (
    <Layout showBackButton={true}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-green-400" />
            خط المبيعات
          </h1>
          <p className="text-slate-400">إدارة ومتابعة الفرص التجارية عبر مراحل البيع</p>
        </div>

        {/* إحصائيات المبيعات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">إجمالي القيمة</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(totalValue / 1000000).toFixed(1)}M ريال</div>
              <p className="text-xs text-slate-400">+{activeOpportunities} فرصة نشطة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">73%</div>
              <p className="text-xs text-slate-400">من الاهتمام للإغلاق</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">متوسط دورة البيع</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">28</div>
              <p className="text-xs text-slate-400">يوماً في المتوسط</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">العملاء الجدد</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-slate-400">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* مراحل خط المبيعات */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* مرحلة التأهيل */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                التأهيل المبدئي
              </CardTitle>
              <CardDescription className="text-slate-400">
                {stageGroups.qualification.length} فرصة • {stageGroups.qualification.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0).toLocaleString()} ريال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageGroups.qualification.map((opportunity: any) => (
                <Card key={opportunity._id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{opportunity.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {(opportunity.value || 0).toLocaleString()} ريال
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{opportunity.contact || 'لا يوجد جهة اتصال'}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* مرحلة العرض */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                تقديم العرض
              </CardTitle>
              <CardDescription className="text-slate-400">
                {stageGroups.proposal.length} فرصة • {stageGroups.proposal.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0).toLocaleString()} ريال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageGroups.proposal.map((opportunity: any) => (
                <Card key={opportunity._id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{opportunity.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {(opportunity.value || 0).toLocaleString()} ريال
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{opportunity.contact || 'لا يوجد جهة اتصال'}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* مرحلة التفاوض */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                التفاوض
              </CardTitle>
              <CardDescription className="text-slate-400">
                {stageGroups.negotiation.length} فرصة • {stageGroups.negotiation.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0).toLocaleString()} ريال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageGroups.negotiation.map((opportunity: any) => (
                <Card key={opportunity._id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{opportunity.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {(opportunity.value || 0).toLocaleString()} ريال
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{opportunity.contact || 'لا يوجد جهة اتصال'}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Calendar className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* مرحلة الإغلاق الناجح */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                تم الإغلاق
              </CardTitle>
              <CardDescription className="text-slate-400">
                {stageGroups['closed-won'].length} فرصة • {stageGroups['closed-won'].reduce((sum: number, opp: any) => sum + (opp.value || 0), 0).toLocaleString()} ريال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stageGroups['closed-won'].map((opportunity: any) => (
                <Card key={opportunity._id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{opportunity.name}</h4>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {(opportunity.value || 0).toLocaleString()} ريال
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{opportunity.contact || 'لا يوجد جهة اتصال'}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <TrendingUp className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* إضافة فرصة جديدة */}
        <div className="mt-8">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 ml-2" />
            إضافة فرصة جديدة
          </Button>
        </div>
      </div>
    </Layout>
  );
}