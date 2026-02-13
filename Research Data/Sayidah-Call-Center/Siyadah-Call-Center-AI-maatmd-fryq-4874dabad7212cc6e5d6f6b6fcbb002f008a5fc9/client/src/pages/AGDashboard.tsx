import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Sparkles,
  Brain,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedHeader from '@/components/EnhancedHeader';
import { AGChatInterface } from '@/components/ag-ui/AGChatInterface';

interface AGDashboardProps {
  onNavigate?: (path: string) => void;
}

export default function AGDashboard({ onNavigate }: AGDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'chat' | 'analytics'>('overview');
  const [agMode, setAGMode] = useState(true);

  // Enhanced metrics with AG-UI intelligence
  const agMetrics = [
    {
      title: 'الذكاء التجاري',
      value: '94.2%',
      change: '+12.5%',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'كفاءة الذكاء الاصطناعي',
      trend: 'up'
    },
    {
      title: 'التفاعل الذكي',
      value: '1,247',
      change: '+23.1%',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'تفاعلات AG-UI اليوم',
      trend: 'up'
    },
    {
      title: 'التحليل المتقدم',
      value: '89.7%',
      change: '+8.3%',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'دقة التنبؤات',
      trend: 'up'
    },
    {
      title: 'الأتمتة الذكية',
      value: '156',
      change: '+45.2%',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'مهام تم تنفيذها تلقائياً',
      trend: 'up'
    }
  ];

  // AG-UI Smart Suggestions
  const agSuggestions = [
    {
      title: 'تحسين معدل التحويل',
      description: 'الذكاء الاصطناعي يقترح زيادة التحويل بنسبة 23%',
      confidence: 0.94,
      action: 'اعرض خطة التحسين',
      category: 'optimization',
      icon: Target
    },
    {
      title: 'عملاء جدد محتملين',
      description: 'تم تحديد 12 عميل جديد بإمكانية عالية للتحويل',
      confidence: 0.87,
      action: 'اعرض العملاء المحتملين',
      category: 'leads',
      icon: Users
    },
    {
      title: 'تحليل الاتجاهات',
      description: 'اتجاه صاعد متوقع في القطاع خلال الأسبوعين القادمين',
      confidence: 0.91,
      action: 'اعرض تحليل الاتجاهات',
      category: 'trends',
      icon: TrendingUp
    }
  ];

  // AG-UI Quick Actions
  const agQuickActions = [
    {
      title: 'تحليل ذكي فوري',
      description: 'تحليل شامل بالذكاء الاصطناعي',
      command: 'حلل أداء النظام بالذكاء الاصطناعي مع التوصيات',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      title: 'حملة واتساب ذكية',
      description: 'إرسال رسائل مخصصة بالذكاء الاصطناعي',
      command: 'أرسل حملة واتساب ذكية للعملاء المناسبين',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'تقرير متقدم',
      description: 'تقرير مدعوم بالذكاء الاصطناعي',
      command: 'أنشئ تقرير متقدم مع رؤى الذكاء الاصطناعي',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'مكالمات مجدولة',
      description: 'جدولة المكالمات بناء على الذكاء الاصطناعي',
      command: 'جدول مكالمات ذكية للعملاء حسب الأولوية',
      icon: Phone,
      color: 'bg-orange-500'
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Enhanced Header with Search */}
      <EnhancedHeader onNavigate={onNavigate} />
      
      {/* AG-UI Enhanced Content */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Brain className="w-8 h-8 text-primary" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">لوحة تحكم AG-UI الذكية</h1>
                <p className="text-sm text-muted-foreground">
                  نظام أتمتة الأعمال المدعوم بالذكاء الاصطناعي المتقدم
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={agMode ? "default" : "outline"}
                onClick={() => setAGMode(!agMode)}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {agMode ? 'وضع AG-UI' : 'وضع عادي'}
              </Button>
              
              <div className="flex gap-1">
                {['overview', 'chat', 'analytics'].map((view) => (
                  <Button
                    key={view}
                    variant={activeView === view ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView(view as any)}
                    className="text-xs"
                  >
                    {view === 'overview' && 'نظرة عامة'}
                    {view === 'chat' && 'المساعد الذكي'}
                    {view === 'analytics' && 'التحليلات'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Enhanced Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                      <div className={cn("p-2 rounded-full", metric.bgColor)}>
                        <IconComponent className={cn("h-4 w-4", metric.color)} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getConfidenceColor(0.9)}>
                          {metric.change}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </CardContent>
                    {agMode && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* AG-UI Smart Suggestions */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  اقتراحات الذكاء الاصطناعي
                </CardTitle>
                <CardDescription>
                  توصيات ذكية مدعومة بتحليل البيانات المتقدم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agSuggestions.map((suggestion, index) => {
                    const IconComponent = suggestion.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge className={getConfidenceColor(suggestion.confidence)}>
                              ثقة: {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                            <Button variant="outline" size="sm">
                              {suggestion.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AG-UI Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  إجراءات AG-UI السريعة
                </CardTitle>
                <CardDescription>
                  مهام ذكية يمكن تنفيذها بنقرة واحدة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agQuickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <div key={index} className="group cursor-pointer">
                        <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", action.color)}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-medium text-foreground mb-1">{action.title}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            تنفيذ ذكي
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'chat' && (
          <Card className="h-[600px]">
            <AGChatInterface 
              onNavigate={onNavigate}
              className="h-full"
            />
          </Card>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  تحليلات AG-UI المتقدمة
                </CardTitle>
                <CardDescription>
                  رؤى عميقة مدعومة بالذكاء الاصطناعي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">تحليلات ذكية متقدمة</h3>
                  <p className="text-muted-foreground mb-6">
                    ستتم إضافة لوحات تحكم تفاعلية مدعومة بالذكاء الاصطناعي
                  </p>
                  <Button className="flex items-center gap-2 mx-auto">
                    <Sparkles className="w-4 h-4" />
                    قريباً جداً
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}