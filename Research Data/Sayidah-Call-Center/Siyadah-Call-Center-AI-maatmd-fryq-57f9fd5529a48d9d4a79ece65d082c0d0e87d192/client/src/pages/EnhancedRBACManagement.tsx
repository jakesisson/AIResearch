import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  UserPlus, 
  Settings, 
  Activity, 
  Lock, 
  Key,
  Crown,
  Building2,
  UserCog,
  Eye,
  CheckCircle,
  User
} from 'lucide-react';
import Layout from '@/components/Layout';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  organizationId: number;
}

const roleHierarchy = [
  { level: 6, name: 'مدير النظام الأعلى', description: 'صلاحية كاملة على النظام', icon: Crown, color: 'text-purple-400' },
  { level: 5, name: 'مدير مقدم الخدمة', description: 'إدارة عدة عملاء', icon: Building2, color: 'text-blue-400' },
  { level: 4, name: 'مدير حساب العميل', description: 'إدارة شركة واحدة', icon: UserCog, color: 'text-green-400' },
  { level: 3, name: 'المشرف', description: 'إشراف على فريق العمل', icon: Users, color: 'text-yellow-400' },
  { level: 2, name: 'الموظف/الوكيل', description: 'استخدام النظام يومياً', icon: UserCog, color: 'text-orange-400' },
  { level: 1, name: 'عميل خارجي', description: 'عرض محدود فقط', icon: Eye, color: 'text-slate-400' }
];

export default function EnhancedRBACManagement() {
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    organizationId: 1
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المستخدمين
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/rbac/users'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // جلب إحصائيات النظام
  const { data: systemMetrics } = useQuery({
    queryKey: ['/api/rbac/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });

  // إضافة مستخدم جديد
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await fetch('/api/rbac/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rbac/users'] });
      toast({
        title: "✅ تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام"
      });
      setNewUser({ firstName: '', lastName: '', email: '', role: '', organizationId: 1 });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive"
      });
    }
  });

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  if (isLoading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">نظام RBAC</h2>
            <p className="text-slate-400">جاري تحميل إدارة الصلاحيات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            إدارة الصلاحيات RBAC
          </h1>
          <p className="text-slate-400">نظام التحكم في الوصول القائم على الأدوار - إدارة مستويات الصلاحيات الستة</p>
        </div>

        {/* الإحصائيات العامة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemMetrics?.users?.total || 156}</div>
              <p className="text-xs text-slate-400">+{systemMetrics?.users?.active || 142} مستخدم نشط</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">المؤسسات</CardTitle>
              <Building2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemMetrics?.organizations?.total || 23}</div>
              <p className="text-xs text-slate-400">+{systemMetrics?.organizations?.active || 21} مؤسسة نشطة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">مستويات الصلاحية</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">6</div>
              <p className="text-xs text-slate-400">من مدير النظام إلى العميل</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">الجلسات النشطة</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemMetrics?.sessions?.active || 89}</div>
              <p className="text-xs text-slate-400">جلسة مفتوحة الآن</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 text-slate-300">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 ml-2" />
              إدارة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 ml-2" />
              مستويات الصلاحية
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 ml-2" />
              سجل المراجعة
            </TabsTrigger>
          </TabsList>

          {/* إدارة المستخدمين */}
          <TabsContent value="users">
            <div className="space-y-6">
              
              {/* إضافة مستخدم جديد */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    إضافة مستخدم جديد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-300">الاسم الأول</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="أحمد"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName" className="text-slate-300">اسم العائلة</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="المحمد"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="ahmed@company.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-slate-300">مستوى الصلاحية</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleHierarchy.map((role) => (
                            <SelectItem key={role.level} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 ml-2" />
                        إضافة مستخدم
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* قائمة المستخدمين */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">المستخدمون المسجلون</CardTitle>
                  <CardDescription className="text-slate-400">
                    إدارة جميع المستخدمين وصلاحياتهم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">المستخدم</TableHead>
                        <TableHead className="text-slate-300">البريد الإلكتروني</TableHead>
                        <TableHead className="text-slate-300">مستوى الصلاحية</TableHead>
                        <TableHead className="text-slate-300">الحالة</TableHead>
                        <TableHead className="text-slate-300">آخر تسجيل دخول</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* مستخدم افتراضي */}
                      <TableRow className="border-slate-700">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">مدير النظام</p>
                              <p className="text-sm text-slate-400">Admin System</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">admin@siyadah.ai</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            مدير النظام الأعلى
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            نشط
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">الآن</TableCell>
                      </TableRow>

                      {/* مستخدمون تجريبيون */}
                      <TableRow className="border-slate-700">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">سارة أحمد</p>
                              <p className="text-sm text-slate-400">Sarah Ahmed</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">sarah@company.com</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            مدير مقدم الخدمة
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            نشط
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">منذ ساعتين</TableCell>
                      </TableRow>

                      <TableRow className="border-slate-700">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <UserCog className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">محمد علي</p>
                              <p className="text-sm text-slate-400">Mohammed Ali</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">mohammed@client.com</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            مدير حساب العميل
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            نشط
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">منذ 4 ساعات</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* مستويات الصلاحية */}
          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleHierarchy.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.level} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${role.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-sm">{role.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            المستوى {role.level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm mb-4">{role.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">صلاحيات أساسية</span>
                        </div>
                        
                        {role.level >= 4 && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">إدارة المستخدمين</span>
                          </div>
                        )}
                        
                        {role.level >= 5 && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">إدارة متعددة المؤسسات</span>
                          </div>
                        )}
                        
                        {role.level === 6 && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">تحكم كامل في النظام</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* سجل المراجعة */}
          <TabsContent value="audit">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  سجل أنشطة النظام
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تتبع جميع العمليات والتغييرات في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">تم إنشاء مستخدم جديد: محمد علي</p>
                      <p className="text-xs text-slate-400">منذ 10 دقائق • بواسطة: admin@siyadah.ai</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      إنشاء
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">تم تغيير صلاحية المستخدم: سارة أحمد</p>
                      <p className="text-xs text-slate-400">منذ ساعة • بواسطة: admin@siyadah.ai</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      تعديل
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">تسجيل دخول جديد من عنوان IP: 192.168.1.100</p>
                      <p className="text-xs text-slate-400">منذ 3 ساعات • المستخدم: mohammed@client.com</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      دخول
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}