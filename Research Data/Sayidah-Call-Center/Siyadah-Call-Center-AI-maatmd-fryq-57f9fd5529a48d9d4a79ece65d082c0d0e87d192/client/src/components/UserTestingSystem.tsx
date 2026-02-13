import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Settings,
  Database,
  Lock
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

interface SystemStats {
  organizations: number;
  users: number;
  roles: number;
  status: string;
}

export default function UserTestingSystem() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const testDefinitions = [
    {
      id: 'health',
      name: 'فحص حالة النظام',
      endpoint: '/api/enterprise-rbac/health',
      method: 'GET'
    },
    {
      id: 'organizations',
      name: 'عرض المؤسسات',
      endpoint: '/api/enterprise-rbac/organizations',
      method: 'GET'
    },
    {
      id: 'roles',
      name: 'عرض الأدوار',
      endpoint: '/api/enterprise-rbac/roles',
      method: 'GET'
    },
    {
      id: 'users',
      name: 'عرض المستخدمين',
      endpoint: '/api/enterprise-rbac/users',
      method: 'GET'
    },
    {
      id: 'permissions',
      name: 'اختبار الصلاحيات',
      endpoint: '/api/enterprise-rbac/test-permission',
      method: 'POST',
      body: {
        userId: 'test_user_001',
        resource: 'users',
        action: 'read',
        scope: 'organization'
      }
    },
    {
      id: 'initialize',
      name: 'تهيئة النظام',
      endpoint: '/api/enterprise-rbac/initialize',
      method: 'POST'
    }
  ];

  const executeTest = async (testDef: any): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const options: RequestInit = {
        method: testDef.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (testDef.body) {
        options.body = JSON.stringify(testDef.body);
      }

      const response = await fetch(testDef.endpoint, options);
      const result = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok) {
        return {
          id: testDef.id,
          name: testDef.name,
          status: 'success',
          result,
          duration
        };
      } else {
        return {
          id: testDef.id,
          name: testDef.name,
          status: 'error',
          error: result.message || 'خطأ غير محدد',
          duration
        };
      }
    } catch (error) {
      return {
        id: testDef.id,
        name: testDef.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'خطأ في الشبكة',
        duration: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const initialTests = testDefinitions.map(test => ({
      id: test.id,
      name: test.name,
      status: 'pending' as const
    }));
    setTests(initialTests);

    for (const testDef of testDefinitions) {
      setTests(prev => prev.map(test => 
        test.id === testDef.id 
          ? { ...test, status: 'running' as const }
          : test
      ));

      const result = await executeTest(testDef);
      
      setTests(prev => prev.map(test => 
        test.id === testDef.id ? result : test
      ));

      // Update stats if health check was successful
      if (testDef.id === 'health' && result.status === 'success' && result.result?.data?.statistics) {
        setStats({
          organizations: result.result.data.statistics.organizations?.total || 0,
          users: result.result.data.statistics.users?.total || 0,
          roles: 6,
          status: result.result.data.statusAr || 'غير محدد'
        });
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const runSingleTest = async (testId: string) => {
    const testDef = testDefinitions.find(t => t.id === testId);
    if (!testDef) return;

    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ));

    const result = await executeTest(testDef);
    
    setTests(prev => prev.map(test => 
      test.id === testId ? result : test
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">نجح</Badge>;
      case 'error': return <Badge variant="destructive">فشل</Badge>;
      case 'running': return <Badge variant="secondary">قيد التشغيل</Badge>;
      default: return <Badge variant="outline">في الانتظار</Badge>;
    }
  };

  useEffect(() => {
    // Auto-run health check on component mount
    const healthTest = testDefinitions.find(t => t.id === 'health');
    if (healthTest) {
      runSingleTest('health');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🔒 نظام اختبار تجربة المستخدم RBAC
          </h1>
          <p className="text-slate-400 text-lg">
            اختبار شامل لنظام الصلاحيات المؤسسي مع واجهة المستخدم التفاعلية
          </p>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <Building className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{stats.organizations}</div>
                <div className="text-slate-400">المؤسسات</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{stats.users}</div>
                <div className="text-slate-400">المستخدمين</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{stats.roles}</div>
                <div className="text-slate-400">الأدوار</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{stats.status}</div>
                <div className="text-slate-400">حالة النظام</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="tests" className="text-white">الاختبارات</TabsTrigger>
            <TabsTrigger value="results" className="text-white">النتائج</TabsTrigger>
            <TabsTrigger value="system" className="text-white">النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  اختبارات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 mb-6">
                  <Button 
                    onClick={runAllTests} 
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRunning ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
                  </Button>
                </div>

                <div className="grid gap-3">
                  {testDefinitions.map((testDef) => {
                    const test = tests.find(t => t.id === testDef.id);
                    return (
                      <div 
                        key={testDef.id}
                        className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test?.status || 'pending')}
                          <span className="font-medium">{testDef.name}</span>
                          {test?.duration && (
                            <span className="text-sm text-slate-400">
                              ({test.duration}ms)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(test?.status || 'pending')}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runSingleTest(testDef.id)}
                            disabled={test?.status === 'running'}
                          >
                            تشغيل
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  نتائج الاختبارات التفصيلية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        لم يتم تشغيل أي اختبارات بعد. انقر على "تشغيل جميع الاختبارات" للبدء.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    tests.map((test) => (
                      <div key={test.id} className="border border-slate-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{test.name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        
                        {test.error && (
                          <Alert className="bg-red-900 border-red-700 mb-3">
                            <XCircle className="w-4 h-4" />
                            <AlertDescription className="text-red-100">
                              {test.error}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {test.result && (
                          <pre className="bg-slate-900 p-3 rounded text-sm overflow-x-auto border border-slate-600">
                            {JSON.stringify(test.result, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  معلومات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">الأدوار المتاحة</h3>
                    <div className="space-y-2">
                      {[
                        'System Super Admin - مدير النظام العام',
                        'Service Provider Admin - مدير مقدم الخدمة',
                        'Client Account Manager - مدير حساب العميل',
                        'Supervisor - المشرف',
                        'Agent/Employee - الوكيل/الموظف',
                        'External Client View - عرض العميل الخارجي'
                      ].map((role, index) => (
                        <div key={index} className="p-2 bg-slate-700 rounded text-sm">
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">الميزات المتاحة</h3>
                    <div className="space-y-2">
                      {[
                        '✅ عزل كامل للبيانات',
                        '✅ صلاحيات هرمية 6 مستويات',
                        '✅ دعم آلاف المستخدمين',
                        '✅ تدقيق شامل',
                        '✅ أداء محسن للمؤسسات',
                        '✅ قاعدة بيانات MongoDB Atlas'
                      ].map((feature, index) => (
                        <div key={index} className="p-2 bg-slate-700 rounded text-sm">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}