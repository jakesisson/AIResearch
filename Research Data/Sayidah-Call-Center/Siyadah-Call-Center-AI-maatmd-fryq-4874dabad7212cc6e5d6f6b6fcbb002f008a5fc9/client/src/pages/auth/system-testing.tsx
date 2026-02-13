import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Settings, Users, Shield, Database } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

interface AuthTest {
  email: string;
  password: string;
  expectedRole: string;
  description: string;
}

interface PermissionTest {
  userId: string;
  resource: string;
  action: string;
  expectedResult: boolean;
  description: string;
}

export default function SystemTesting() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const authTests: AuthTest[] = [
    {
      email: 'admin@demo.siyadah.ai',
      password: 'demo123456',
      expectedRole: 'organization_admin',
      description: 'Demo Organization Admin'
    },
    {
      email: 'admin@startup.siyadah.ai',
      password: 'startup123456',
      expectedRole: 'organization_admin',
      description: 'Startup Organization Admin'
    },
    {
      email: 'admin@enterprise.siyadah.ai',
      password: 'enterprise123456',
      expectedRole: 'organization_admin',
      description: 'Enterprise Organization Admin'
    }
  ];

  const permissionTests: PermissionTest[] = [
    {
      userId: 'demo_admin_001',
      resource: 'users',
      action: 'manage',
      expectedResult: true,
      description: 'Admin can manage users'
    },
    {
      userId: 'demo_admin_001',
      resource: 'system',
      action: 'manage',
      expectedResult: false,
      description: 'Demo admin cannot manage system'
    },
    {
      userId: 'demo_admin_001',
      resource: 'analytics',
      action: 'read',
      expectedResult: true,
      description: 'Admin can read analytics'
    }
  ];

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const testAuthentication = async (test: AuthTest): Promise<TestResult> => {
    try {
      const response = await apiRequest('POST', '/api/enterprise-saas/login', {
        email: test.email,
        password: test.password
      });

      const data = await response.json();
      
      if (data.success && data.data?.user?.role === test.expectedRole) {
        return {
          name: `Auth: ${test.description}`,
          status: 'success',
          message: `تم تسجيل الدخول بنجاح - الدور: ${data.data.user.role}`,
          details: {
            email: test.email,
            role: data.data.user.role,
            organization: data.data.organization?.name
          },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: `Auth: ${test.description}`,
          status: 'error',
          message: `فشل في المصادقة أو الدور غير متطابق`,
          details: data,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error: any) {
      return {
        name: `Auth: ${test.description}`,
        status: 'error',
        message: `خطأ في الشبكة: ${error.message}`,
        details: error,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testPermission = async (test: PermissionTest): Promise<TestResult> => {
    try {
      const response = await apiRequest('POST', '/api/rbac/test-permission', {
        userId: test.userId,
        resource: test.resource,
        action: test.action
      });

      const data = await response.json();
      
      if (data.success && data.hasPermission === test.expectedResult) {
        return {
          name: `Permission: ${test.description}`,
          status: 'success',
          message: `الصلاحية صحيحة - ${data.hasPermission ? 'مسموح' : 'مرفوض'}`,
          details: {
            userId: test.userId,
            resource: test.resource,
            action: test.action,
            hasPermission: data.hasPermission,
            roleLevel: data.roleLevel
          },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: `Permission: ${test.description}`,
          status: 'error',
          message: `نتيجة الصلاحية غير متوقعة - متوقع: ${test.expectedResult}, فعلي: ${data.hasPermission}`,
          details: data,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error: any) {
      return {
        name: `Permission: ${test.description}`,
        status: 'error',
        message: `خطأ في اختبار الصلاحية: ${error.message}`,
        details: error,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testSystemHealth = async (): Promise<TestResult> => {
    try {
      // Test multiple endpoints
      const endpoints = [
        '/api/rbac/roles-matrix',
        '/api/rbac/permission-audit',
        '/api/enterprise-saas/plans'
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await apiRequest('GET', endpoint);
            const data = await response.json();
            return { endpoint, success: data.success || false, status: response.status };
          } catch (error) {
            return { endpoint, success: false, error: error.message };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        return {
          name: 'System Health Check',
          status: 'success',
          message: `جميع النقاط النهائية تعمل بشكل صحيح (${successCount}/${totalCount})`,
          details: results,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'System Health Check',
          status: 'warning',
          message: `بعض النقاط النهائية لا تعمل (${successCount}/${totalCount})`,
          details: results,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error: any) {
      return {
        name: 'System Health Check',
        status: 'error',
        message: `فشل في فحص صحة النظام: ${error.message}`,
        details: error,
        timestamp: new Date().toISOString()
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // System Health Check
    setCurrentTest('فحص صحة النظام...');
    const healthResult = await testSystemHealth();
    addTestResult(healthResult);

    // Authentication Tests
    for (const authTest of authTests) {
      setCurrentTest(`اختبار المصادقة: ${authTest.description}`);
      const result = await testAuthentication(authTest);
      addTestResult(result);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
    }

    // Permission Tests
    for (const permTest of permissionTests) {
      setCurrentTest(`اختبار الصلاحيات: ${permTest.description}`);
      const result = await testPermission(permTest);
      addTestResult(result);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentTest('');
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'success' ? 'نجح' : status === 'error' ? 'فشل' : 'تحذير'}
      </Badge>
    );
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            اختبار شامل لنظام المصادقة والصلاحيات
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            فحص شامل لجميع جوانب الأمان والمصادقة في منصة سيادة
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              لوحة التحكم في الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                size="lg"
                className="flex-1 max-w-xs"
              >
                {isRunning ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
              </Button>
              
              {isRunning && (
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    الاختبار الحالي: {currentTest}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">إجمالي الاختبارات</p>
                    <p className="text-2xl font-bold">{testResults.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">نجحت</p>
                    <p className="text-2xl font-bold text-green-700">{successCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">فشلت</p>
                    <p className="text-2xl font-bold text-red-700">{errorCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">تحذيرات</p>
                    <p className="text-2xl font-bold text-yellow-700">{warningCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                نتائج الاختبارات
              </CardTitle>
              <CardDescription>
                نتائج مفصلة لجميع اختبارات النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.name}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(result.timestamp).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {result.message}
                    </p>
                    
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                          عرض التفاصيل
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>اختبارات المصادقة المتاحة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {authTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{test.description}</span>
                    <Badge variant="outline">{test.expectedRole}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اختبارات الصلاحيات المتاحة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {permissionTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{test.description}</span>
                    <Badge variant={test.expectedResult ? "default" : "secondary"}>
                      {test.expectedResult ? 'مسموح' : 'مرفوض'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}