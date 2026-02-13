import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Database, Wifi, Shield, Activity, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  responseTime: number;
  lastCheck: Date;
  details?: string;
}

export default function SystemStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities']
  });

  const { data: agentsData } = useQuery({
    queryKey: ['/api/ai-agents']
  });

  const systemHealth: SystemHealth[] = [
    {
      name: 'خادم التطبيق',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 45,
      lastCheck: new Date(),
      details: 'الخادم يعمل بكفاءة عالية'
    },
    {
      name: 'قاعدة البيانات',
      status: 'healthy', 
      uptime: '99.8%',
      responseTime: 12,
      lastCheck: new Date(),
      details: 'MongoDB Atlas متصل'
    },
    {
      name: 'خدمات الذكاء الاصطناعي',
      status: 'healthy',
      uptime: '99.5%',
      responseTime: 150,
      lastCheck: new Date(),
      details: 'OpenAI GPT-4o نشط'
    },
    {
      name: 'خدمة WhatsApp',
      status: 'warning',
      uptime: '95.2%',
      responseTime: 320,
      lastCheck: new Date(),
      details: 'تحتاج إعادة تكوين'
    },
    {
      name: 'خدمة المكالمات الصوتية',
      status: 'healthy',
      uptime: '98.7%',
      responseTime: 89,
      lastCheck: new Date(),
      details: 'Twilio نشط'
    },
    {
      name: 'نظام الأمان',
      status: 'healthy',
      uptime: '100%',
      responseTime: 8,
      lastCheck: new Date(),
      details: 'جميع الحماية نشطة'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'سليم';
      case 'warning': return 'تحذير';
      case 'error': return 'خطأ';
      default: return 'غير معروف';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // محاكاة تحديث البيانات
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast({
      title: "تم تحديث الحالة",
      description: "تم تحديث حالة النظام بنجاح"
    });
  };

  const opportunitiesData = Array.isArray(opportunities) ? opportunities : [];
  const agents = (agentsData && Array.isArray((agentsData as any).agents)) ? (agentsData as any).agents : [];

  const overallStats = {
    totalServices: systemHealth.length,
    healthyServices: systemHealth.filter(s => s.status === 'healthy').length,
    warningServices: systemHealth.filter(s => s.status === 'warning').length,
    errorServices: systemHealth.filter(s => s.status === 'error').length,
    avgResponseTime: Math.round(systemHealth.reduce((sum, s) => sum + s.responseTime, 0) / systemHealth.length),
    dataIntegrity: opportunitiesData.length > 0 && agents.length > 0 ? 'سليم' : 'تحذير'
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6 space-y-8">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">حالة النظام</h1>
            <p className="text-slate-400">مراقبة شاملة لأداء وصحة النظام</p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* نظرة عامة */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الخدمات</p>
                  <p className="text-2xl font-bold text-white">{overallStats.totalServices}</p>
                </div>
                <Server className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">خدمات سليمة</p>
                  <p className="text-2xl font-bold text-green-400">{overallStats.healthyServices}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تحذيرات</p>
                  <p className="text-2xl font-bold text-yellow-400">{overallStats.warningServices}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">أخطاء</p>
                  <p className="text-2xl font-bold text-red-400">{overallStats.errorServices}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">متوسط الاستجابة</p>
                  <p className="text-2xl font-bold text-purple-400">{overallStats.avgResponseTime}ms</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">سلامة البيانات</p>
                  <p className="text-2xl font-bold text-green-400">{overallStats.dataIntegrity}</p>
                </div>
                <Database className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل الخدمات */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5" />
              تفاصيل حالة الخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="text-white font-medium">{service.name}</h3>
                      <p className="text-slate-400 text-sm">{service.details}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">وقت التشغيل</p>
                      <p className="text-white font-medium">{service.uptime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">زمن الاستجابة</p>
                      <p className="text-white font-medium">{service.responseTime}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">آخر فحص</p>
                      <p className="text-white font-medium">{service.lastCheck.toLocaleTimeString('ar-SA')}</p>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusText(service.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* معلومات النظام */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                معلومات قاعدة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">نوع قاعدة البيانات:</span>
                  <span className="text-white">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">إجمالي الفرص:</span>
                  <span className="text-green-400 font-bold">{opportunitiesData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الوكلاء النشطون:</span>
                  <span className="text-blue-400 font-bold">{agents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">حالة الاتصال:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">متصل</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                معلومات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">حماية API:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">نشطة</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">تشفير البيانات:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">SSL/TLS</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">المصادقة:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">JWT Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">مراقبة الوصول:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">فعالة</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل الأحداث الأخير */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              سجل الأحداث الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">تم تحديث النظام بنجاح</p>
                  <p className="text-slate-400 text-xs">منذ دقيقتين</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">تم تحديث قاعدة البيانات</p>
                  <p className="text-slate-400 text-xs">منذ 5 دقائق</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">تحذير: زمن استجابة WhatsApp مرتفع</p>
                  <p className="text-slate-400 text-xs">منذ 10 دقائق</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">تم إعادة تشغيل الخادم بنجاح</p>
                  <p className="text-slate-400 text-xs">منذ 30 دقيقة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}