import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Phone, CheckCircle, AlertTriangle, Info, X, Search, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: 'system' | 'email' | 'sms' | 'push';
  timestamp: Date;
  read: boolean;
  category: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'تم إنشاء فرصة جديدة',
    message: 'تم إضافة فرصة جديدة من شركة التقنية المتقدمة بقيمة 150,000 ريال',
    type: 'success',
    channel: 'system',
    timestamp: new Date('2024-01-15T10:30:00'),
    read: false,
    category: 'المبيعات'
  },
  {
    id: '2',
    title: 'تحديث نظام الأمان',
    message: 'تم تحديث بروتوكولات الأمان بنجاح. جميع البيانات محمية',
    type: 'info',
    channel: 'email',
    timestamp: new Date('2024-01-15T09:15:00'),
    read: true,
    category: 'النظام'
  },
  {
    id: '3',
    title: 'تحذير: مستوى الأداء منخفض',
    message: 'أداء وكيل الذكاء الاصطناعي "أحمد" انخفض إلى 75%',
    type: 'warning',
    channel: 'push',
    timestamp: new Date('2024-01-14T16:45:00'),
    read: false,
    category: 'الأداء'
  },
  {
    id: '4',
    title: 'نجاح حملة التسويق',
    message: 'حملة البريد الإلكتروني "العروض الصيفية" حققت معدل فتح 32%',
    type: 'success',
    channel: 'email',
    timestamp: new Date('2024-01-14T14:20:00'),
    read: true,
    category: 'التسويق'
  }
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    salesUpdates: true,
    performanceAlerts: true,
    marketingUpdates: false
  });
  const { toast } = useToast();

  const { data: notifications = mockNotifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => Promise.resolve(mockNotifications)
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.read) ||
                      (activeTab === 'read' && notification.read);
    
    return matchesSearch && matchesType && matchesTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <X className="w-5 h-5 text-red-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleMarkAsRead = (id: string) => {
    toast({
      title: "تم وضع علامة كمقروء",
      description: "تم تحديث حالة الإشعار"
    });
  };

  const handleMarkAllAsRead = () => {
    toast({
      title: "تم وضع علامة على جميع الإشعارات كمقروءة",
      description: "تم تحديث جميع الإشعارات"
    });
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "تم تحديث الإعدادات",
      description: "تم حفظ تفضيلات الإشعارات"
    });
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    success: notifications.filter(n => n.type === 'success').length,
    warnings: notifications.filter(n => n.type === 'warning').length,
    errors: notifications.filter(n => n.type === 'error').length
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6 space-y-8">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة الإشعارات</h1>
            <p className="text-slate-400">مركز الإشعارات والتنبيهات</p>
          </div>
          <Button onClick={handleMarkAllAsRead} className="bg-blue-600 hover:bg-blue-700 text-white">
            <CheckCircle className="w-4 h-4 ml-2" />
            تعيين الكل كمقروء
          </Button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الإشعارات</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">غير مقروءة</p>
                  <p className="text-2xl font-bold text-red-400">{stats.unread}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">نجاح</p>
                  <p className="text-2xl font-bold text-green-400">{stats.success}</p>
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
                  <p className="text-2xl font-bold text-yellow-400">{stats.warnings}</p>
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
                  <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              جميع الإشعارات ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              غير مقروءة ({stats.unread})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* تبويب جميع الإشعارات */}
          <TabsContent value="all" className="space-y-6">
            {/* شريط البحث والفلاتر */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="البحث في الإشعارات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="success">نجاح</SelectItem>
                        <SelectItem value="warning">تحذير</SelectItem>
                        <SelectItem value="error">خطأ</SelectItem>
                        <SelectItem value="info">معلومات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الإشعارات */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type === 'success' ? 'نجاح' :
                               notification.type === 'warning' ? 'تحذير' :
                               notification.type === 'error' ? 'خطأ' : 'معلومات'}
                            </Badge>
                            {!notification.read && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                جديد
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-slate-300 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(notification.channel)}
                              <span>{notification.channel === 'email' ? 'بريد إلكتروني' :
                                    notification.channel === 'sms' ? 'رسالة نصية' :
                                    notification.channel === 'push' ? 'إشعار فوري' : 'النظام'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-600/30 text-slate-300">
                                {notification.category}
                              </Badge>
                            </div>
                            <span>{notification.timestamp.toLocaleString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            تعيين كمقروء
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب غير مقروءة */}
          <TabsContent value="unread" className="space-y-6">
            <div className="space-y-4">
              {filteredNotifications.filter(n => !n.read).map((notification) => (
                <Card key={notification.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-blue-500 hover:bg-slate-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type === 'success' ? 'نجاح' :
                               notification.type === 'warning' ? 'تحذير' :
                               notification.type === 'error' ? 'خطأ' : 'معلومات'}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              جديد
                            </Badge>
                          </div>
                          
                          <p className="text-slate-300 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(notification.channel)}
                              <span>{notification.channel === 'email' ? 'بريد إلكتروني' :
                                    notification.channel === 'sms' ? 'رسالة نصية' :
                                    notification.channel === 'push' ? 'إشعار فوري' : 'النظام'}</span>
                            </div>
                            <span>{notification.timestamp.toLocaleString('ar-SA')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        تعيين كمقروء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* إعدادات القنوات */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">قنوات الإشعارات</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">البريد الإلكتروني</p>
                          <p className="text-slate-400 text-sm">تلقي الإشعارات عبر البريد الإلكتروني</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">الإشعارات الفورية</p>
                          <p className="text-slate-400 text-sm">تلقي إشعارات فورية في المتصفح</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.pushNotifications}
                        onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">الرسائل النصية</p>
                          <p className="text-slate-400 text-sm">تلقي إشعارات عبر الرسائل النصية</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings.smsNotifications}
                        onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* إعدادات الفئات */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">فئات الإشعارات</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">تنبيهات النظام</p>
                        <p className="text-slate-400 text-sm">إشعارات حول أداء النظام والأمان</p>
                      </div>
                      <Switch 
                        checked={settings.systemAlerts}
                        onCheckedChange={(value) => handleSettingChange('systemAlerts', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">تحديثات المبيعات</p>
                        <p className="text-slate-400 text-sm">إشعارات الفرص الجديدة والصفقات</p>
                      </div>
                      <Switch 
                        checked={settings.salesUpdates}
                        onCheckedChange={(value) => handleSettingChange('salesUpdates', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">تنبيهات الأداء</p>
                        <p className="text-slate-400 text-sm">إشعارات حول أداء الوكلاء والمقاييس</p>
                      </div>
                      <Switch 
                        checked={settings.performanceAlerts}
                        onCheckedChange={(value) => handleSettingChange('performanceAlerts', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">تحديثات التسويق</p>
                        <p className="text-slate-400 text-sm">إشعارات حول حملات التسويق والنتائج</p>
                      </div>
                      <Switch 
                        checked={settings.marketingUpdates}
                        onCheckedChange={(value) => handleSettingChange('marketingUpdates', value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredNotifications.length === 0 && activeTab !== 'settings' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">لا توجد إشعارات</h3>
              <p className="text-slate-400">لا توجد إشعارات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}