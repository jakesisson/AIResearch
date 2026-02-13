import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Users, Shield, Database, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  isActive: boolean;
}

interface Organization {
  id: string;
  name: string;
  domain?: string;
  plan: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  nameAr: string;
  level: number;
  permissions: string[];
  description: string;
}

export default function UserTestingSystem() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Test configuration
  const [selectedUserId, setSelectedUserId] = useState('');
  const [testResource, setTestResource] = useState('users');
  const [testAction, setTestAction] = useState('read');
  const [testScope, setTestScope] = useState('organization');

  // New organization form
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('trial');

  // New user form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserOrgId, setNewUserOrgId] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('external_client_view');

  const apiCall = async (endpoint: string, method: string = 'GET', body?: any): Promise<TestResult> => {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const initializeSystem = async () => {
    setLoading(true);
    const result = await apiCall('/api/enterprise-rbac/initialize', 'POST');
    addResult(result);
    
    if (result.success) {
      await loadSystemData();
    }
    setLoading(false);
  };

  const loadSystemData = async () => {
    // Load organizations
    const orgsResult = await apiCall('/api/enterprise-rbac/organizations');
    if (orgsResult.success && orgsResult.data?.organizations) {
      setOrganizations(orgsResult.data.organizations);
    }

    // Load roles
    const rolesResult = await apiCall('/api/enterprise-rbac/roles');
    if (rolesResult.success && rolesResult.data?.data) {
      setRoles(rolesResult.data.data);
    }

    // Load system health
    const healthResult = await apiCall('/api/enterprise-rbac/health');
    if (healthResult.success && healthResult.data?.data) {
      setSystemStats(healthResult.data.data);
    }
  };

  const testPermission = async () => {
    if (!selectedUserId || !testResource || !testAction) {
      addResult({
        success: false,
        error: 'الرجاء تحديد جميع المعايير المطلوبة',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    const result = await apiCall('/api/enterprise-rbac/test-permission', 'POST', {
      userId: selectedUserId,
      resource: testResource,
      action: testAction,
      scope: testScope
    });
    addResult(result);
    setLoading(false);
  };

  const createOrganization = async () => {
    if (!newOrgName) {
      addResult({
        success: false,
        error: 'اسم المؤسسة مطلوب',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    const result = await apiCall('/api/enterprise-rbac/organizations', 'POST', {
      name: newOrgName,
      domain: newOrgDomain,
      plan: newOrgPlan
    });
    addResult(result);
    
    if (result.success) {
      setNewOrgName('');
      setNewOrgDomain('');
      setNewOrgPlan('trial');
      await loadSystemData();
    }
    setLoading(false);
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserOrgId) {
      addResult({
        success: false,
        error: 'البريد الإلكتروني ومعرف المؤسسة مطلوبان',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setLoading(true);
    const result = await apiCall('/api/enterprise-rbac/users', 'POST', {
      organizationId: newUserOrgId,
      email: newUserEmail,
      firstName: newUserFirstName,
      lastName: newUserLastName,
      roleId: newUserRoleId
    });
    addResult(result);
    
    if (result.success) {
      setNewUserEmail('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserOrgId('');
      setNewUserRoleId('external_client_view');
      await loadUsersForOrg(newUserOrgId);
    }
    setLoading(false);
  };

  const loadUsersForOrg = async (orgId: string) => {
    const result = await apiCall(`/api/enterprise-rbac/organizations/${orgId}/users`);
    if (result.success && result.data?.users) {
      setUsers(result.data.users);
    }
  };

  const batchPermissionTest = async () => {
    if (!selectedUserId) {
      addResult({
        success: false,
        error: 'الرجاء تحديد المستخدم',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const operations = [
      { resource: 'users', action: 'create', scope: 'organization' },
      { resource: 'users', action: 'read', scope: 'organization' },
      { resource: 'users', action: 'update', scope: 'organization' },
      { resource: 'users', action: 'delete', scope: 'organization' },
      { resource: 'reports', action: 'read', scope: 'organization' },
      { resource: 'settings', action: 'update', scope: 'organization' },
      { resource: 'data', action: 'read', scope: 'own' },
      { resource: 'organizations', action: 'manage', scope: 'global' }
    ];

    setLoading(true);
    const result = await apiCall('/api/enterprise-rbac/batch-permission-test', 'POST', {
      userId: selectedUserId,
      operations
    });
    addResult(result);
    setLoading(false);
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏢 نظام RBAC المؤسسي العالمي
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            اختبار شامل لنظام الصلاحيات مع عزل كامل للبيانات
          </p>
        </div>

        {/* System Status */}
        {systemStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemStats.statistics?.organizations?.total || 0}
                  </div>
                  <div className="text-sm text-slate-600">مؤسسات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {systemStats.statistics?.users?.total || 0}
                  </div>
                  <div className="text-sm text-slate-600">مستخدمين</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {roles.length}
                  </div>
                  <div className="text-sm text-slate-600">أدوار</div>
                </div>
                <div className="text-center">
                  <Badge variant={systemStats.status === 'healthy' ? 'default' : 'destructive'}>
                    {systemStats.statusAr}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="permission-test" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="permission-test">اختبار الصلاحيات</TabsTrigger>
            <TabsTrigger value="organizations">المؤسسات</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="roles">الأدوار</TabsTrigger>
            <TabsTrigger value="results">النتائج</TabsTrigger>
          </TabsList>

          {/* Permission Testing */}
          <TabsContent value="permission-test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  اختبار الصلاحيات المتقدم
                </CardTitle>
                <CardDescription>
                  اختبر صلاحيات المستخدمين بدقة مع تفاصيل شاملة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="userId">المستخدم</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستخدم" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="resource">المورد</Label>
                    <Select value={testResource} onValueChange={setTestResource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">المستخدمين</SelectItem>
                        <SelectItem value="reports">التقارير</SelectItem>
                        <SelectItem value="settings">الإعدادات</SelectItem>
                        <SelectItem value="data">البيانات</SelectItem>
                        <SelectItem value="organizations">المؤسسات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="action">الإجراء</Label>
                    <Select value={testAction} onValueChange={setTestAction}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create">إنشاء</SelectItem>
                        <SelectItem value="read">قراءة</SelectItem>
                        <SelectItem value="update">تحديث</SelectItem>
                        <SelectItem value="delete">حذف</SelectItem>
                        <SelectItem value="manage">إدارة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scope">النطاق</Label>
                    <Select value={testScope} onValueChange={setTestScope}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">الخاص</SelectItem>
                        <SelectItem value="organization">المؤسسة</SelectItem>
                        <SelectItem value="global">عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={testPermission} disabled={loading}>
                    اختبار الصلاحية
                  </Button>
                  <Button onClick={batchPermissionTest} variant="outline" disabled={loading}>
                    اختبار مجمع
                  </Button>
                  <Button onClick={initializeSystem} variant="secondary" disabled={loading}>
                    تهيئة النظام
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Management */}
          <TabsContent value="organizations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  إدارة المؤسسات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="orgName">اسم المؤسسة</Label>
                    <Input 
                      value={newOrgName} 
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="مثال: شركة التقنية المتقدمة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgDomain">النطاق</Label>
                    <Input 
                      value={newOrgDomain} 
                      onChange={(e) => setNewOrgDomain(e.target.value)}
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgPlan">الخطة</Label>
                    <Select value={newOrgPlan} onValueChange={setNewOrgPlan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">تجريبية</SelectItem>
                        <SelectItem value="starter">مبتدئ</SelectItem>
                        <SelectItem value="professional">احترافي</SelectItem>
                        <SelectItem value="enterprise">مؤسسي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createOrganization} disabled={loading}>
                  إنشاء مؤسسة
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizations.map(org => (
                    <Card key={org.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => loadUsersForOrg(org.id)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription>{org.domain}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{org.plan}</Badge>
                          <span className="text-sm text-slate-600">
                            {org.userCount} مستخدم
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="userEmail">البريد الإلكتروني</Label>
                    <Input 
                      value={newUserEmail} 
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userFirstName">الاسم الأول</Label>
                    <Input 
                      value={newUserFirstName} 
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="أحمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userLastName">الاسم الأخير</Label>
                    <Input 
                      value={newUserLastName} 
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="محمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userOrg">المؤسسة</Label>
                    <Select value={newUserOrgId} onValueChange={setNewUserOrgId}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المؤسسة" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="userRole">الدور</Label>
                    <Select value={newUserRoleId} onValueChange={setNewUserRoleId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createUser} disabled={loading}>
                  إنشاء مستخدم
                </Button>
                
                <div className="space-y-2">
                  {users.map(user => (
                    <Card key={user.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {roles.find(r => r.id === user.roleId)?.nameAr || user.roleId}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mr-2"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            اختيار للاختبار
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الأدوار والصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map(role => (
                    <Card key={role.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{role.nameAr}</h3>
                          <Badge variant="outline">مستوى {role.level}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{role.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 5).map((perm, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {role.permissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 5} المزيد
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>نتائج الاختبارات</CardTitle>
                <CardDescription>آخر 10 نتائج اختبار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result, idx) => (
                    <Alert key={idx} className={result.success ? 'border-green-200' : 'border-red-200'}>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <div className="flex-1">
                          <AlertDescription>
                            <div className="font-medium mb-1">
                              {result.success ? 'نجح' : 'فشل'} - {new Date(result.timestamp).toLocaleTimeString('ar-SA')}
                            </div>
                            {result.data && (
                              <div className="text-xs bg-slate-50 p-2 rounded mt-2">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                              </div>
                            )}
                            {result.error && (
                              <div className="text-red-600 text-sm">{result.error}</div>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}