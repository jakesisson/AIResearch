import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/ui/sidebar';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Shield,
  Key,
  Mail,
  Phone,
  Calendar,
  Settings,
  Activity,
  Lock,
  Unlock,
  MoreHorizontal,
  Eye,
  Download
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  department?: string;
  phone?: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
  description: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    role: '',
    department: '',
    phone: '',
    password: '',
    isActive: true
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('/api/users', 'GET')
  });

  // Mock users data for demonstration
  const mockUsers: User[] = [
    {
      _id: '1',
      username: 'admin',
      email: 'admin@company.com',
      fullName: 'مدير النظام',
      role: 'admin',
      avatar: '',
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['all'],
      department: 'تقنية المعلومات',
      phone: '+966501234567'
    },
    {
      _id: '2',
      username: 'sales_manager',
      email: 'sales@company.com',
      fullName: 'أحمد محمد',
      role: 'sales_manager',
      avatar: '',
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['sales', 'opportunities', 'reports'],
      department: 'المبيعات',
      phone: '+966501234568'
    },
    {
      _id: '3',
      username: 'support_agent',
      email: 'support@company.com',
      fullName: 'فاطمة علي',
      role: 'support_agent',
      avatar: '',
      isActive: true,
      lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['support', 'tickets'],
      department: 'خدمة العملاء',
      phone: '+966501234569'
    },
    {
      _id: '4',
      username: 'marketing_user',
      email: 'marketing@company.com',
      fullName: 'سارة أحمد',
      role: 'marketing_user',
      avatar: '',
      isActive: false,
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['email', 'campaigns'],
      department: 'التسويق',
      phone: '+966501234570'
    }
  ];

  const roles: Role[] = [
    {
      id: 'admin',
      name: 'admin',
      displayName: 'مدير النظام',
      permissions: ['all'],
      description: 'صلاحيات كاملة على النظام'
    },
    {
      id: 'sales_manager',
      name: 'sales_manager',
      displayName: 'مدير المبيعات',
      permissions: ['sales', 'opportunities', 'reports', 'team'],
      description: 'إدارة فريق المبيعات والفرص'
    },
    {
      id: 'support_agent',
      name: 'support_agent',
      displayName: 'موظف دعم فني',
      permissions: ['support', 'tickets', 'customers'],
      description: 'معالجة تذاكر الدعم الفني'
    },
    {
      id: 'marketing_user',
      name: 'marketing_user',
      displayName: 'موظف تسويق',
      permissions: ['email', 'campaigns', 'analytics'],
      description: 'إدارة الحملات التسويقية'
    }
  ];

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest('/api/users', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddUser(false);
      setNewUser({
        username: '',
        email: '',
        fullName: '',
        role: '',
        department: '',
        phone: '',
        password: '',
        isActive: true
      });
      toast({ title: "تم إنشاء المستخدم", description: "تم إضافة المستخدم الجديد بنجاح" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: any) => apiRequest(`/api/users/${id}`, 'PATCH', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowEditUser(false);
      setSelectedUser(null);
      toast({ title: "تم تحديث المستخدم", description: "تم تحديث بيانات المستخدم بنجاح" });
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      apiRequest(`/api/users/${id}/status`, 'PATCH', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ 
        title: "تم تحديث حالة المستخدم", 
        description: "تم تحديث حالة المستخدم بنجاح" 
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/users/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "تم حذف المستخدم", description: "تم حذف المستخدم بنجاح" });
    }
  });

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDisplayName = (role: string) => {
    const roleObj = roles.find(r => r.name === role);
    return roleObj?.displayName || role;
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'لم يسجل دخول';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 mr-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المستخدمين</h1>
              <p className="text-muted-foreground">إدارة المستخدمين والأذونات</p>
            </div>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
              <TabsTrigger value="activity">سجل النشاط</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="relative flex-1 lg:max-w-md">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="البحث عن المستخدمين..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="تصفية حسب الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأدوار</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="تصفية حسب الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                  <Card key={user._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{user.fullName}</h3>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 ml-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Shield className="h-4 w-4 ml-2" />
                          {getRoleDisplayName(user.role)}
                        </div>
                        {user.department && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 ml-2" />
                            {user.department}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Activity className="h-4 w-4 ml-2" />
                          آخر دخول: {formatLastLogin(user.lastLogin)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditUser(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatusMutation.mutate({
                              id: user._id,
                              isActive: !user.isActive
                            })}
                          >
                            {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                        </div>
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteUserMutation.mutate(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {role.displayName}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Label>الصلاحيات:</Label>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(permission => (
                            <Badge key={permission} variant="outline">
                              {permission === 'all' ? 'جميع الصلاحيات' :
                               permission === 'sales' ? 'المبيعات' :
                               permission === 'support' ? 'الدعم الفني' :
                               permission === 'email' ? 'البريد الإلكتروني' :
                               permission === 'reports' ? 'التقارير' :
                               permission === 'opportunities' ? 'الفرص' :
                               permission === 'tickets' ? 'التذاكر' :
                               permission === 'customers' ? 'العملاء' :
                               permission === 'campaigns' ? 'الحملات' :
                               permission === 'analytics' ? 'التحليلات' :
                               permission === 'team' ? 'الفريق' : permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    سجل نشاط المستخدمين
                  </CardTitle>
                  <CardDescription>تتبع أنشطة المستخدمين وتسجيل الدخول</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUsers.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm">{formatLastLogin(user.lastLogin)}</p>
                          <Badge variant={user.isActive ? "default" : "secondary"} className="mt-1">
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add User Dialog */}
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المستخدم الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="اسم المستخدم"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+966501234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="القسم"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="كلمة المرور"
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse md:col-span-2">
                  <Switch
                    checked={newUser.isActive}
                    onCheckedChange={(checked) => setNewUser({...newUser, isActive: checked})}
                  />
                  <Label>حساب نشط</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUser(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={createUserMutation.isPending || !newUser.fullName || !newUser.email || !newUser.username}
                >
                  {createUserMutation.isPending ? "جاري الإنشاء..." : "إضافة المستخدم"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}