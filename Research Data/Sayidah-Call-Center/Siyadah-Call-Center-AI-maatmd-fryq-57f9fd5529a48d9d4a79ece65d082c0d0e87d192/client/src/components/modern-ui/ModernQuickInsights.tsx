import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  ArrowUpRight,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const insights = [
  {
    title: 'أداء المبيعات',
    description: 'زيادة 25% في المبيعات هذا الشهر',
    value: '365,000 ريال',
    trend: '+25%',
    color: 'green',
    icon: DollarSign
  },
  {
    title: 'نشاط العملاء',
    description: 'معدل التفاعل مرتفع هذا الأسبوع',
    value: '94%',
    trend: '+12%',
    color: 'blue',
    icon: Users
  },
  {
    title: 'كفاءة الفريق',
    description: 'أداء ممتاز للوكلاء الذكيين',
    value: '91.7%',
    trend: '+5%',
    color: 'purple',
    icon: Target
  }
];

const quickActions = [
  { 
    label: 'إنشاء عرض جديد', 
    description: 'لعميل محتمل',
    icon: Target,
    action: 'create-proposal'
  },
  { 
    label: 'جدولة اجتماع', 
    description: 'مع الفريق',
    icon: Calendar,
    action: 'schedule-meeting'
  },
  { 
    label: 'إرسال حملة', 
    description: 'تسويقية',
    icon: MessageSquare,
    action: 'send-campaign'
  }
];

export default function ModernQuickInsights() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Quick Insights */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 ml-2 text-yellow-400" />
            رؤى سريعة
          </CardTitle>
          <CardDescription className="text-slate-400">
            أهم الإحصائيات والاتجاهات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg bg-${insight.color}-500/20`}>
                    <Icon className={`w-5 h-5 text-${insight.color}-400`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    <p className="text-sm text-slate-400">{insight.description}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{insight.value}</div>
                  <Badge className={`bg-${insight.color}-500/20 text-${insight.color}-400 border-${insight.color}-500/30`}>
                    <TrendingUp className="w-3 h-3 ml-1" />
                    {insight.trend}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 ml-2 text-blue-400" />
            إجراءات سريعة
          </CardTitle>
          <CardDescription className="text-slate-400">
            أوامر شائعة للتنفيذ السريع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-between h-auto p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Icon className="w-5 h-5 text-blue-400" />
                  <div className="text-right">
                    <div className="font-medium text-white">{action.label}</div>
                    <div className="text-sm text-slate-400">{action.description}</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Button>
            );
          })}
          
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white mb-1">مساعد AI متقدم</h4>
                <p className="text-sm text-slate-300">اكتب أمرك وسأنفذه فوراً</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                جرب الآن
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}