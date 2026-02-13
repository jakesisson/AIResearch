import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Shield, Eye, Edit, CheckCircle, XCircle, AlertTriangle, 
  Clock, Crown, Lock, PlayCircle, BarChart3, TestTube
} from 'lucide-react';

interface TestResult {
  testId: string;
  hasPermission: boolean;
  roleLevel: number;
  roleName: string;
  reason: string;
  testPassed: boolean;
  endpoint: string;
  method: string;
  expectedResult: string;
  actualResult: string;
}

interface RoleMatrix {
  roleId: string;
  roleName: string;
  level: number;
  permissionCount: number;
}

export default function RBACManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Get roles matrix
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/rbac/roles-matrix'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/roles-matrix');
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      return response.json();
    }
  });

  // Test scenarios for comprehensive permission testing
  const testScenarios = [
    // System Super Admin Tests
    {
      roleId: 'system_super_admin',
      tests: [
        { endpoint: '/api/rbac/users', method: 'POST', expected: 'allow', name: 'إنشاء مستخدم' },
        { endpoint: '/api/rbac/users/:id', method: 'DELETE', expected: 'allow', name: 'حذف مستخدم' },
        { endpoint: '/api/system', method: 'DELETE', expected: 'allow', name: 'حذف النظام' },
        { endpoint: '/api/analytics', method: 'GET', expected: 'allow', name: 'التحليلات' },
        { endpoint: '/api/settings', method: 'PUT', expected: 'allow', name: 'إعدادات النظام' }
      ]
    },
    // Service Provider Admin Tests  
    {
      roleId: 'service_provider_admin',
      tests: [
        { endpoint: '/api/clients', method: 'GET', expected: 'allow', name: 'عرض العملاء' },
        { endpoint: '/api/clients', method: 'POST', expected: 'allow', name: 'إضافة عميل' },
        { endpoint: '/api/billing', method: 'GET', expected: 'allow', name: 'الفواتير' },
        { endpoint: '/api/system', method: 'DELETE', expected: 'deny', name: 'حذف النظام (ممنوع)' },
        { endpoint: '/api/internal', method: 'GET', expected: 'deny', name: 'البيانات الداخلية (ممنوع)' }
      ]
    },
    // Client Account Manager Tests
    {
      roleId: 'client_account_manager',
      tests: [
        { endpoint: '/api/team', method: 'GET', expected: 'allow', name: 'عرض الفريق' },
        { endpoint: '/api/team', method: 'POST', expected: 'allow', name: 'إضافة عضو فريق' },
        { endpoint: '/api/reports', method: 'GET', expected: 'allow', name: 'التقارير' },
        { endpoint: '/api/accounts', method: 'GET', expected: 'deny', name: 'حسابات أخرى (ممنوع)' },
        { endpoint: '/api/finance', method: 'GET', expected: 'deny', name: 'البيانات المالية (ممنوع)' }
      ]
    },
    // Supervisor Tests
    {
      roleId: 'supervisor',
      tests: [
        { endpoint: '/api/team/performance', method: 'GET', expected: 'allow', name: 'أداء الفريق' },
        { endpoint: '/api/tasks', method: 'POST', expected: 'allow', name: 'تعيين مهام' },
        { endpoint: '/api/requests/approve', method: 'PUT', expected: 'allow', name: 'موافقة طلبات' },
        { endpoint: '/api/finance', method: 'GET', expected: 'deny', name: 'البيانات المالية (ممنوع)' },
        { endpoint: '/api/users/:id', method: 'DELETE', expected: 'deny', name: 'حذف مستخدمين (ممنوع)' }
      ]
    },
    // Employee Tests
    {
      roleId: 'agent_employee',
      tests: [
        { endpoint: '/api/my-tasks', method: 'GET', expected: 'allow', name: 'مهامي الشخصية' },
        { endpoint: '/api/tasks/:id/status', method: 'PUT', expected: 'allow', name: 'تحديث حالة مهمة' },
        { endpoint: '/api/profile', method: 'GET', expected: 'allow', name: 'الملف الشخصي' },
        { endpoint: '/api/admin', method: 'GET', expected: 'deny', name: 'المهام الإدارية (ممنوع)' },
        { endpoint: '/api/finance', method: 'GET', expected: 'deny', name: 'البيانات المالية (ممنوع)' }
      ]
    },
    // External Client Tests
    {
      roleId: 'external_client_view',
      tests: [
        { endpoint: '/api/client/data', method: 'GET', expected: 'allow', name: 'بياناتي الشخصية' },
        { endpoint: '/api/client/reports', method: 'GET', expected: 'allow', name: 'تقاريري' },
        { endpoint: '/api/support/ticket', method: 'POST', expected: 'allow', name: 'إنشاء تذكرة دعم' },
        { endpoint: '/api/internal', method: 'GET', expected: 'deny', name: 'البيانات الداخلية (ممنوع)' },
        { endpoint: '/api/admin', method: 'GET', expected: 'deny', name: 'المهام الإدارية (ممنوع)' }
      ]
    }
  ];

  // Run permission test for specific role
  const runRoleTests = async (roleId: string) => {
    setIsRunningTests(true);
    const scenario = testScenarios.find(s => s.roleId === roleId);
    if (!scenario) return;

    const results: TestResult[] = [];

    try {
      toast({
        title: 'بدء اختبار الصلاحيات',
        description: `اختبار صلاحيات ${getRoleName(roleId)}...`,
      });

      for (const test of scenario.tests) {
        try {
          const response = await fetch('/api/rbac/test-permission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roleId,
              resource: test.endpoint,
              action: test.method,
            }),
          });

          const result = await response.json();
          const hasPermission = result.hasPermission;
          const expectedAllow = test.expected === 'allow';
          const testPassed = hasPermission === expectedAllow;

          results.push({
            testId: `${roleId}_${test.endpoint}_${test.method}`,
            hasPermission,
            roleLevel: result.roleLevel,
            roleName: result.roleName,
            reason: result.reason,
            testPassed,
            endpoint: test.endpoint,
            method: test.method,
            expectedResult: test.expected,
            actualResult: hasPermission ? 'allow' : 'deny'
          });
        } catch (error: any) {
          results.push({
            testId: `${roleId}_${test.endpoint}_${test.method}`,
            hasPermission: false,
            roleLevel: 0,
            roleName: 'خطأ',
            reason: 'خطأ في الاختبار',
            testPassed: false,
            endpoint: test.endpoint,
            method: test.method,
            expectedResult: test.expected,
            actualResult: 'error'
          });
        }
      }

      setTestResults(prev => ({ ...prev, [roleId]: results }));

      const passedTests = results.filter(r => r.testPassed).length;
      const totalTests = results.length;

      toast({
        title: 'اكتمل اختبار الصلاحيات',
        description: `${getRoleName(roleId)}: ${passedTests}/${totalTests} اختبار نجح`,
        variant: passedTests === totalTests ? 'default' : 'destructive',
      });

    } catch (error: any) {
      toast({
        title: 'خطأ في الاختبار',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    
    for (const scenario of testScenarios) {
      await runRoleTests(scenario.roleId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningTests(false);
  };

  const getRoleName = (roleId: string) => {
    const roleNames: Record<string, string> = {
      'system_super_admin': 'مدير النظام الأعلى',
      'service_provider_admin': 'مدير مقدم الخدمة',
      'client_account_manager': 'مدير حساب العميل',
      'supervisor': 'المشرف',
      'agent_employee': 'الموظف',
      'external_client_view': 'العميل الخارجي'
    };
    return roleNames[roleId] || roleId;
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'system_super_admin': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'service_provider_admin': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'client_account_manager': return <Users className="w-5 h-5 text-blue-500" />;
      case 'supervisor': return <Eye className="w-5 h-5 text-green-500" />;
      case 'agent_employee': return <Edit className="w-5 h-5 text-orange-500" />;
      case 'external_client_view': return <Lock className="w-5 h-5 text-gray-500" />;
      default: return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (testPassed: boolean) => {
    return testPassed ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            نظام إدارة الصلاحيات والأدوار (RBAC)
          </h1>
          <p className="text-slate-400">
            اختبار شامل لجميع مستويات الصلاحيات وأدوار المستخدمين
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TestTube className="w-5 h-5 ml-2" />
              لوحة التحكم في اختبارات الصلاحيات
            </CardTitle>
            <CardDescription className="text-slate-400">
              تشغيل اختبارات شاملة لجميع الأدوار والصلاحيات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunningTests}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunningTests ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
              </Button>
              <Badge variant="outline" className="text-slate-300">
                {testScenarios.length} أدوار للاختبار
              </Badge>
              {rolesData && (
                <Badge variant="outline" className="text-slate-300">
                  {rolesData.data.totalEndpoints} نقطة وصول
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-slate-700">
              الأدوار والمستويات
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-slate-700">
              نتائج الاختبارات
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testScenarios.map((scenario) => {
                const results = testResults[scenario.roleId];
                const totalTests = scenario.tests.length;
                const passedTests = results ? results.filter(r => r.testPassed).length : 0;
                const hasResults = !!results;

                return (
                  <Card key={scenario.roleId} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center">
                          {getRoleIcon(scenario.roleId)}
                          <span className="mr-2">{getRoleName(scenario.roleId)}</span>
                        </div>
                        {hasResults && getStatusIcon(passedTests === totalTests)}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        المستوى {rolesData?.data.roles.find((r: RoleMatrix) => r.roleId === scenario.roleId)?.level || 'غير محدد'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">عدد الاختبارات:</span>
                          <span className="text-white">{totalTests}</span>
                        </div>
                        
                        {hasResults && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">النجح:</span>
                              <span className="text-green-400">{passedTests}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">الفشل:</span>
                              <span className="text-red-400">{totalTests - passedTests}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${(passedTests / totalTests) * 100}%` }}
                              ></div>
                            </div>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                          onClick={() => runRoleTests(scenario.roleId)}
                          disabled={isRunningTests}
                        >
                          اختبار هذا الدور
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">مصفوفة الأدوار والصلاحيات</CardTitle>
                <CardDescription className="text-slate-400">
                  عرض تفصيلي لجميع الأدوار ومستوياتها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Clock className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="mr-2 text-slate-400">جاري التحميل...</span>
                  </div>
                ) : rolesData?.data?.roles ? (
                  <div className="space-y-4">
                    {rolesData.data.roles.map((role: RoleMatrix) => (
                      <div key={role.roleId} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(role.roleId)}
                          <div>
                            <h3 className="text-white font-medium">{role.roleName}</h3>
                            <p className="text-slate-400 text-sm">المستوى {role.level}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {role.permissionCount} صلاحية
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => runRoleTests(role.roleId)}
                            disabled={isRunningTests}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="w-4 h-4 ml-1" />
                            اختبار
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    فشل في تحميل بيانات الأدوار
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {Object.keys(testResults).length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">لا توجد نتائج حتى الآن</h3>
                  <p className="text-slate-400">قم بتشغيل الاختبارات لعرض النتائج التفصيلية</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(testResults).map(([roleId, results]) => (
                  <Card key={roleId} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        {getRoleIcon(roleId)}
                        <span className="mr-2">{getRoleName(roleId)}</span>
                        <Badge variant="outline" className="mr-2">
                          {results.filter(r => r.testPassed).length}/{results.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {results.map((result) => (
                          <div 
                            key={result.testId} 
                            className={`p-4 rounded-lg border ${
                              result.testPassed 
                                ? 'bg-green-900/20 border-green-700' 
                                : 'bg-red-900/20 border-red-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium flex items-center">
                                {getStatusIcon(result.testPassed)}
                                <span className="mr-2">{result.method} {result.endpoint}</span>
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={result.expectedResult === 'allow' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  متوقع: {result.expectedResult === 'allow' ? 'مسموح' : 'ممنوع'}
                                </Badge>
                                <Badge 
                                  variant={result.actualResult === 'allow' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  فعلي: {result.actualResult === 'allow' ? 'مسموح' : 'ممنوع'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-slate-400 text-sm">{result.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}