import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Users, Shield, Eye, Edit, Trash2, Plus, 
  Settings, Database, FileText, MessageSquare,
  Phone, Mail, BarChart3, Crown, Lock,
  CheckCircle, XCircle, AlertTriangle, Clock
} from 'lucide-react';

interface UserRole {
  id: string;
  name: string;
  displayName: string;
  level: number;
  permissions: string[];
  description: string;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  roleId: string;
  actions: TestAction[];
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
}

interface TestAction {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  expectedResult: 'allow' | 'deny';
  description: string;
}

export default function UserExperienceDemo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test scenarios for different user roles
  const testScenarios: TestScenario[] = [
    {
      id: 'system_admin',
      name: 'مدير النظام الأعلى',
      description: 'صلاحيات كاملة لإدارة النظام والمستخدمين والبيانات',
      roleId: 'system_super_admin',
      status: 'pending',
      actions: [
        {
          id: 'create_user',
          name: 'إنشاء مستخدم جديد',
          endpoint: '/api/rbac/users',
          method: 'POST',
          expectedResult: 'allow',
          description: 'إنشاء مستخدمين جدد في النظام'
        },
        {
          id: 'delete_user',
          name: 'حذف مستخدم',
          endpoint: '/api/rbac/users/:id',
          method: 'DELETE',
          expectedResult: 'allow',
          description: 'حذف المستخدمين من النظام'
        },
        {
          id: 'manage_roles',
          name: 'إدارة الأدوار',
          endpoint: '/api/rbac/roles',
          method: 'POST',
          expectedResult: 'allow',
          description: 'إنشاء وتعديل أدوار المستخدمين'
        },
        {
          id: 'view_analytics',
          name: 'عرض التحليلات',
          endpoint: '/api/analytics',
          method: 'GET',
          expectedResult: 'allow',
          description: 'الوصول لجميع التحليلات والتقارير'
        },
        {
          id: 'system_settings',
          name: 'إعدادات النظام',
          endpoint: '/api/settings',
          method: 'PUT',
          expectedResult: 'allow',
          description: 'تعديل إعدادات النظام العامة'
        }
      ]
    },
    {
      id: 'service_admin',
      name: 'مدير مقدم الخدمة',
      description: 'إدارة العملاء والخدمات والدعم الفني',
      roleId: 'service_provider_admin',
      status: 'pending',
      actions: [
        {
          id: 'manage_clients',
          name: 'إدارة العملاء',
          endpoint: '/api/clients',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض وإدارة قائمة العملاء'
        },
        {
          id: 'create_client',
          name: 'إضافة عميل جديد',
          endpoint: '/api/clients',
          method: 'POST',
          expectedResult: 'allow',
          description: 'إنشاء حسابات عملاء جديدة'
        },
        {
          id: 'view_billing',
          name: 'عرض الفواتير',
          endpoint: '/api/billing',
          method: 'GET',
          expectedResult: 'allow',
          description: 'الوصول لنظام الفواتير والمدفوعات'
        },
        {
          id: 'support_tickets',
          name: 'تذاكر الدعم',
          endpoint: '/api/support',
          method: 'GET',
          expectedResult: 'allow',
          description: 'إدارة تذاكر الدعم الفني'
        },
        {
          id: 'system_delete',
          name: 'حذف النظام',
          endpoint: '/api/system',
          method: 'DELETE',
          expectedResult: 'deny',
          description: 'لا يُسمح بحذف النظام'
        }
      ]
    },
    {
      id: 'account_manager',
      name: 'مدير حساب العميل',
      description: 'إدارة حساب عميل واحد وفريقه',
      roleId: 'client_account_manager',
      status: 'pending',
      actions: [
        {
          id: 'manage_team',
          name: 'إدارة الفريق',
          endpoint: '/api/team',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض وإدارة أعضاء فريقه'
        },
        {
          id: 'add_team_member',
          name: 'إضافة عضو فريق',
          endpoint: '/api/team',
          method: 'POST',
          expectedResult: 'allow',
          description: 'إضافة أعضاء جدد للفريق'
        },
        {
          id: 'view_reports',
          name: 'عرض التقارير',
          endpoint: '/api/reports',
          method: 'GET',
          expectedResult: 'allow',
          description: 'الوصول لتقارير حسابه'
        },
        {
          id: 'account_settings',
          name: 'إعدادات الحساب',
          endpoint: '/api/account/settings',
          method: 'PUT',
          expectedResult: 'allow',
          description: 'تعديل إعدادات حسابه'
        },
        {
          id: 'other_accounts',
          name: 'حسابات أخرى',
          endpoint: '/api/accounts',
          method: 'GET',
          expectedResult: 'deny',
          description: 'لا يُسمح بالوصول لحسابات أخرى'
        }
      ]
    },
    {
      id: 'supervisor',
      name: 'المشرف',
      description: 'الإشراف على العمليات اليومية والموظفين',
      roleId: 'supervisor',
      status: 'pending',
      actions: [
        {
          id: 'view_team_performance',
          name: 'أداء الفريق',
          endpoint: '/api/team/performance',
          method: 'GET',
          expectedResult: 'allow',
          description: 'مراقبة أداء أعضاء الفريق'
        },
        {
          id: 'assign_tasks',
          name: 'تعيين المهام',
          endpoint: '/api/tasks',
          method: 'POST',
          expectedResult: 'allow',
          description: 'تعيين مهام للموظفين'
        },
        {
          id: 'approve_requests',
          name: 'الموافقة على الطلبات',
          endpoint: '/api/requests/approve',
          method: 'PUT',
          expectedResult: 'allow',
          description: 'الموافقة على طلبات الموظفين'
        },
        {
          id: 'financial_data',
          name: 'البيانات المالية',
          endpoint: '/api/finance',
          method: 'GET',
          expectedResult: 'deny',
          description: 'لا يُسمح بالوصول للبيانات المالية'
        },
        {
          id: 'delete_users',
          name: 'حذف المستخدمين',
          endpoint: '/api/users/:id',
          method: 'DELETE',
          expectedResult: 'deny',
          description: 'لا يُسمح بحذف المستخدمين'
        }
      ]
    },
    {
      id: 'employee',
      name: 'الموظف',
      description: 'صلاحيات العمل اليومي والمهام المخصصة',
      roleId: 'agent_employee',
      status: 'pending',
      actions: [
        {
          id: 'view_own_tasks',
          name: 'مهامي الشخصية',
          endpoint: '/api/my-tasks',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض مهامه الشخصية'
        },
        {
          id: 'update_task_status',
          name: 'تحديث حالة المهمة',
          endpoint: '/api/tasks/:id/status',
          method: 'PUT',
          expectedResult: 'allow',
          description: 'تحديث حالة مهامه'
        },
        {
          id: 'submit_timesheet',
          name: 'تسجيل الوقت',
          endpoint: '/api/timesheet',
          method: 'POST',
          expectedResult: 'allow',
          description: 'تسجيل ساعات العمل'
        },
        {
          id: 'view_own_profile',
          name: 'الملف الشخصي',
          endpoint: '/api/profile',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض وتعديل ملفه الشخصي'
        },
        {
          id: 'admin_functions',
          name: 'مهام إدارية',
          endpoint: '/api/admin',
          method: 'GET',
          expectedResult: 'deny',
          description: 'لا يُسمح بالوصول للمهام الإدارية'
        }
      ]
    },
    {
      id: 'external_client',
      name: 'العميل الخارجي',
      description: 'عرض محدود للبيانات والتقارير الخاصة به',
      roleId: 'external_client_view',
      status: 'pending',
      actions: [
        {
          id: 'view_own_data',
          name: 'بياناتي الشخصية',
          endpoint: '/api/client/data',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض بياناته الشخصية فقط'
        },
        {
          id: 'download_reports',
          name: 'تحميل التقارير',
          endpoint: '/api/client/reports',
          method: 'GET',
          expectedResult: 'allow',
          description: 'تحميل تقاريره الخاصة'
        },
        {
          id: 'contact_support',
          name: 'التواصل مع الدعم',
          endpoint: '/api/support/ticket',
          method: 'POST',
          expectedResult: 'allow',
          description: 'إنشاء تذاكر دعم فني'
        },
        {
          id: 'view_invoices',
          name: 'عرض الفواتير',
          endpoint: '/api/client/invoices',
          method: 'GET',
          expectedResult: 'allow',
          description: 'عرض فواتيره الخاصة'
        },
        {
          id: 'internal_data',
          name: 'البيانات الداخلية',
          endpoint: '/api/internal',
          method: 'GET',
          expectedResult: 'deny',
          description: 'لا يُسمح بالوصول للبيانات الداخلية'
        }
      ]
    }
  ];

  // Test specific role permissions
  const runRoleTest = async (scenario: TestScenario) => {
    setIsRunningTests(true);
    const results: any = {};

    try {
      toast({
        title: 'بدء اختبار الصلاحيات',
        description: `اختبار صلاحيات ${scenario.name}...`,
      });

      for (const action of scenario.actions) {
        try {
          // Simulate API call with expected permission check
          const response = await fetch(`/api/rbac/test-permission`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roleId: scenario.roleId,
              resource: action.endpoint,
              action: action.method,
            }),
          });

          const result = await response.json();
          const hasPermission = result.hasPermission;
          const expectedAllow = action.expectedResult === 'allow';
          const testPassed = hasPermission === expectedAllow;

          results[action.id] = {
            ...action,
            actualResult: hasPermission ? 'allow' : 'deny',
            testPassed,
            details: result
          };
        } catch (error: any) {
          results[action.id] = {
            ...action,
            actualResult: 'error',
            testPassed: false,
            error: error?.message || 'خطأ غير محدد'
          };
        }
      }

      setTestResults(prev => ({
        ...prev,
        [scenario.id]: results
      }));

      const passedTests = Object.values(results).filter((r: any) => r.testPassed).length;
      const totalTests = scenario.actions.length;

      toast({
        title: 'اكتمل اختبار الصلاحيات',
        description: `${scenario.name}: ${passedTests}/${totalTests} اختبار نجح`,
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
      await runRoleTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunningTests(false);
  };

  const getStatusIcon = (status: string, testPassed?: boolean) => {
    if (status === 'running') return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
    if (status === 'error' || testPassed === false) return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'success' || testPassed === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'system_super_admin': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'service_provider_admin': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'client_account_manager': return <Users className="w-5 h-5 text-blue-500" />;
      case 'supervisor': return <Eye className="w-5 h-5 text-green-500" />;
      case 'agent_employee': return <Settings className="w-5 h-5 text-orange-500" />;
      case 'external_client_view': return <Lock className="w-5 h-5 text-gray-500" />;
      default: return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            اختبار تجربة المستخدم - جميع الصلاحيات
          </h1>
          <p className="text-slate-400">
            اختبار شامل لجميع مستويات الصلاحيات في النظام
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 ml-2" />
              لوحة التحكم في الاختبارات
            </CardTitle>
            <CardDescription className="text-slate-400">
              تشغيل اختبارات الصلاحيات للأدوار المختلفة
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
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="individual" className="data-[state=active]:bg-slate-700">
              اختبار فردي
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-slate-700">
              النتائج التفصيلية
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testScenarios.map((scenario) => {
                const results = testResults[scenario.id];
                const totalTests = scenario.actions.length;
                const passedTests = results ? 
                  Object.values(results).filter((r: any) => r.testPassed).length : 0;
                const hasResults = !!results;

                return (
                  <Card key={scenario.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center">
                          {getRoleIcon(scenario.roleId)}
                          <span className="mr-2">{scenario.name}</span>
                        </div>
                        {hasResults && getStatusIcon('success', passedTests === totalTests)}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {scenario.description}
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
                          onClick={() => runRoleTest(scenario)}
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

          {/* Individual Testing Tab */}
          <TabsContent value="individual" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">اختبار دور محدد</CardTitle>
                <CardDescription className="text-slate-400">
                  اختر دوراً لاختبار صلاحياته بالتفصيل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {testScenarios.map((scenario) => (
                    <Card key={scenario.id} className="bg-slate-700 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center">
                          {getRoleIcon(scenario.roleId)}
                          <span className="mr-2">{scenario.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-slate-300 text-sm">{scenario.description}</p>
                          
                          <div className="space-y-2">
                            <h4 className="text-white font-medium">الاختبارات المتضمنة:</h4>
                            {scenario.actions.map((action) => (
                              <div key={action.id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">{action.name}</span>
                                <Badge 
                                  variant={action.expectedResult === 'allow' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {action.expectedResult === 'allow' ? 'مسموح' : 'ممنوع'}
                                </Badge>
                              </div>
                            ))}
                          </div>

                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => runRoleTest(scenario)}
                            disabled={isRunningTests}
                          >
                            اختبار هذا الدور
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Results Tab */}
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
                {Object.entries(testResults).map(([scenarioId, results]) => {
                  const scenario = testScenarios.find(s => s.id === scenarioId);
                  if (!scenario) return null;

                  return (
                    <Card key={scenarioId} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          {getRoleIcon(scenario.roleId)}
                          <span className="mr-2">{scenario.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.values(results).map((result: any) => (
                            <div 
                              key={result.id} 
                              className={`p-4 rounded-lg border ${
                                result.testPassed 
                                  ? 'bg-green-900/20 border-green-700' 
                                  : 'bg-red-900/20 border-red-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium flex items-center">
                                  {getStatusIcon('', result.testPassed)}
                                  <span className="mr-2">{result.name}</span>
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
                              <p className="text-slate-400 text-sm">{result.description}</p>
                              <div className="mt-2 text-xs text-slate-500">
                                {result.method} {result.endpoint}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}