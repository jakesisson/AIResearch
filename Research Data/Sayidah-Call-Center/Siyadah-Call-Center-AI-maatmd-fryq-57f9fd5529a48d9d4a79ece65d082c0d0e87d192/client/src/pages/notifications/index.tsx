import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/ui/sidebar';
import { 
  Bell, 
  Settings, 
  Mail, 
  MessageSquare, 
  Phone,
  Check,
  X,
  Filter,
  Search,
  Archive,
  Star,
  Clock,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  archived: boolean;
  source: string;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  opportunityUpdates: boolean;
  workflowAlerts: boolean;
  systemAlerts: boolean;
  teamUpdates: boolean;
  digestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => apiRequest('/api/notifications', 'GET')
  });

  const { data: settings = {} } = useQuery({
    queryKey: ['/api/notifications/settings'],
    queryFn: async () => {
      // Mock settings data since we don't have a real endpoint
      return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        opportunityUpdates: true,
        workflowAlerts: true,
        systemAlerts: true,
        teamUpdates: false,
        digestFrequency: 'daily'
      } as NotificationSettings;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}/read`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}/archive`, 'PATCH'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: "تم أرشفة الإشعار", description: "تم نقل الإشعار إلى الأرشيف" });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) => 
      apiRequest('/api/notifications/settings', 'PATCH', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({ title: "تم حفظ الإعدادات", description: "تم تحديث إعدادات الإشعارات بنجاح" });
    }
  });

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      _id: '1',
      title: 'فرصة جديدة تحتاج متابعة',
      message: 'فرصة "شركة الرياض للتقنية" بقيمة 150,000 ريال تحتاج إلى متابعة عاجلة',
      type: 'warning',
      priority: 'high',
      read: false,
      archived: false,
      source: 'المبيعات',
      actionUrl: '/sales',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'تم إكمال سير العمل',
      message: 'سير عمل "معالجة طلبات العملاء" تم تنفيذه بنجاح',
      type: 'success',
      priority: 'medium',
      read: true,
      archived: false,
      source: 'الأتمتة',
      actionUrl: '/workflow',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام إلى الإصدار 2.1.4 بنجاح مع تحسينات في الأداء',
      type: 'info',
      priority: 'low',
      read: false,
      archived: false,
      source: 'النظام',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '4',
      title: 'خطأ في التكامل',
      message: 'فشل في الاتصال مع خدمة البريد الإلكتروني. يرجى التحقق من الإعدادات',
      type: 'error',
      priority: 'high',
      read: false,
      archived: false,
      source: 'التكاملات',
      actionUrl: '/settings',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.read) ||
                      (activeTab === 'archived' && notification.archived);
    
    return matchesSearch && matchesType && matchesTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <X className="h-5 w-5 text-red-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">الإشعارات</h1>
              <p className="text-muted-foreground">إدارة الإشعارات والتنبيهات</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveTab('unread')}>
                <Bell className="h-4 w-4 ml-2" />
                غير المقروءة ({mockNotifications.filter(n => !n.read).length})
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <TabsList className="grid w-full lg:w-auto grid-cols-4">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="unread">غير المقروءة</TabsTrigger>
                <TabsTrigger value="archived">الأرشيف</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الإشعارات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="success">نجاح</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
                    <p className="text-muted-foreground">لم يتم العثور على إشعارات تطابق المعايير المحددة</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card key={notification._id} className={`transition-all hover:shadow-lg ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse flex-1">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority === 'high' ? 'عالية' : 
                                 notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                              </Badge>
                              {!notification.read && (
                                <Badge variant="secondary">جديد</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notification.source}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate(notification._id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archiveMutation.mutate(notification._id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {filteredNotifications.filter(n => !n.read).map((notification) => (
                <Card key={notification._id} className="border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse flex-1">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold">{notification.title}</h3>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority === 'high' ? 'عالية' : 
                               notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                            <Badge variant="secondary">جديد</Badge>
                          </div>
                          <p className="text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {notification.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => archiveMutation.mutate(notification._id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">الأرشيف فارغ</h3>
                  <p className="text-muted-foreground">لا توجد إشعارات مؤرشفة حالياً</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      إعدادات الإشعارات
                    </CardTitle>
                    <CardDescription>تخصيص طرق استلام الإشعارات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">إشعارات البريد الإلكتروني</Label>
                        <p className="text-sm text-muted-foreground">استلام الإشعارات عبر البريد الإلكتروني</p>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">الإشعارات الفورية</Label>
                        <p className="text-sm text-muted-foreground">إشعارات المتصفح الفورية</p>
                      </div>
                      <Switch 
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">رسائل SMS</Label>
                        <p className="text-sm text-muted-foreground">إشعارات عبر الرسائل النصية</p>
                      </div>
                      <Switch 
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ smsNotifications: checked })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="digest-frequency">تكرار الملخص</Label>
                      <Select 
                        value={settings.digestFrequency} 
                        onValueChange={(value) => 
                          updateSettingsMutation.mutate({ digestFrequency: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تكرار الملخص" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">فوري</SelectItem>
                          <SelectItem value="hourly">كل ساعة</SelectItem>
                          <SelectItem value="daily">يومي</SelectItem>
                          <SelectItem value="weekly">أسبوعي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>أنواع الإشعارات</CardTitle>
                    <CardDescription>اختر أنواع الإشعارات التي تريد استلامها</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تحديثات الفرص</Label>
                        <p className="text-sm text-muted-foreground">إشعارات تغييرات فرص المبيعات</p>
                      </div>
                      <Switch 
                        checked={settings.opportunityUpdates}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ opportunityUpdates: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تنبيهات سير العمل</Label>
                        <p className="text-sm text-muted-foreground">إشعارات تنفيذ سير العمل</p>
                      </div>
                      <Switch 
                        checked={settings.workflowAlerts}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ workflowAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تنبيهات النظام</Label>
                        <p className="text-sm text-muted-foreground">تحديثات وصيانة النظام</p>
                      </div>
                      <Switch 
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ systemAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">تحديثات الفريق</Label>
                        <p className="text-sm text-muted-foreground">إشعارات أنشطة فريق العمل</p>
                      </div>
                      <Switch 
                        checked={settings.teamUpdates}
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ teamUpdates: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}