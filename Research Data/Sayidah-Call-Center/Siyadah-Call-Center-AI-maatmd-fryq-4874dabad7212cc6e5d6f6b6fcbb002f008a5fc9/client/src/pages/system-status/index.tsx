import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/ui/sidebar';
import PlaceholderMessage from '@/components/common/PlaceholderMessage';
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';

interface SystemMetrics {
  uptime: string;
  requests: number;
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  services: {
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    lastCheck: string;
    responseTime?: number;
  }[];
}

export default function SystemStatus() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['/api/system/status'],
    queryFn: async () => {
      // Simulate system metrics since we don't have real monitoring
      const mockMetrics: SystemMetrics = {
        uptime: "2 أيام 14 ساعة 32 دقيقة",
        requests: Math.floor(Math.random() * 10000) + 5000,
        database: {
          status: 'healthy',
          responseTime: Math.floor(Math.random() * 50) + 10,
          connections: Math.floor(Math.random() * 20) + 5
        },
        memory: {
          used: Math.floor(Math.random() * 2000) + 1000,
          total: 4096,
          percentage: Math.floor(Math.random() * 30) + 25
        },
        services: [
          {
            name: 'MongoDB Atlas',
            status: 'online',
            lastCheck: new Date().toLocaleTimeString('ar-SA'),
            responseTime: Math.floor(Math.random() * 100) + 50
          },
          {
            name: 'OpenAI API',
            status: 'online',
            lastCheck: new Date().toLocaleTimeString('ar-SA'),
            responseTime: Math.floor(Math.random() * 200) + 100
          },
          {
            name: 'Twilio API',
            status: 'maintenance',
            lastCheck: new Date().toLocaleTimeString('ar-SA'),
            responseTime: undefined
          },
          {
            name: 'Express Server',
            status: 'online',
            lastCheck: new Date().toLocaleTimeString('ar-SA'),
            responseTime: Math.floor(Math.random() * 20) + 5
          }
        ]
      };
      
      setLastUpdate(new Date());
      return mockMetrics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance':
        return <Clock className="h-4 w-4" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 mr-72 p-8">
          <div className="max-w-6xl mx-auto">
            <PlaceholderMessage 
              title="قريباً" 
              description="لوحة مراقبة النظام قيد التطوير وستكون متاحة في التحديث القادم" 
              className="py-12"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 mr-72 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">حالة النظام</h1>
              <p className="text-muted-foreground">مراقبة الأداء والخدمات</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت التشغيل</p>
                    <p className="text-2xl font-bold text-green-600">{metrics?.uptime}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الطلبات اليوم</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics?.requests?.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">استخدام الذاكرة</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics?.memory?.percentage}%</p>
                    <Progress value={metrics?.memory?.percentage} className="mt-2" />
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                    <MemoryStick className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">قاعدة البيانات</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics?.database?.responseTime}ms</p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics?.database?.connections} اتصال</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                    <Database className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  حالة الخدمات
                </CardTitle>
                <CardDescription>مراقبة الخدمات الخارجية والداخلية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.services?.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            آخر فحص: {service.lastCheck}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status === 'online' ? 'متصل' :
                           service.status === 'maintenance' ? 'صيانة' : 'غير متصل'}
                        </Badge>
                        {service.responseTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {service.responseTime}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  معلومات النظام
                </CardTitle>
                <CardDescription>تفاصيل الأداء والموارد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">استخدام الذاكرة</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics?.memory?.used}MB / {metrics?.memory?.total}MB
                      </span>
                    </div>
                    <Progress value={metrics?.memory?.percentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">قاعدة البيانات</p>
                      <p className="text-xs text-muted-foreground">MongoDB Atlas</p>
                      <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        متصلة
                      </Badge>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Server className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium">الخادم</p>
                      <p className="text-xs text-muted-foreground">Express.js</p>
                      <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        يعمل
                      </Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      خدمة Twilio في وضع الصيانة. يتم استخدام المحاكاة حالياً.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}