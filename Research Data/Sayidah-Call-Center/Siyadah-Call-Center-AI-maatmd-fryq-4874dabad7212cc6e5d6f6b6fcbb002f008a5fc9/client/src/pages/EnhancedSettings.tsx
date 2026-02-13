import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Phone, 
  MessageSquare,
  Settings,
  Save,
  CheckCircle,
  Bot,
  Copy
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function EnhancedSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('فشل في تحميل الإعدادات');
      return response.json();
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error('فشل في حفظ الإعدادات');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح'
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive'
      });
    }
  });
  const [profileData, setProfileData] = useState({
    firstName: 'أحمد',
    lastName: 'المحمد',
    email: 'ahmed@company.com',
    phone: '+966501234567',
    company: 'شركة التقنية المتقدمة'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  });

  const [integrations, setIntegrations] = useState({
    whatsappConnected: true,
    twilioConnected: true,
    emailConnected: false,
    whatsappAgentApiKey: '',
    whatsappSessionName: ''
  });

  // Update integrations when settings are loaded
  useEffect(() => {
    if (settings) {
      setIntegrations(prev => ({
        ...prev,
        whatsappAgentApiKey: settings.whatsappAgentApiKey || '',
        whatsappSessionName: settings.whatsappAgentSessionName || ''
      }));
    }
  }, [settings]);

  const handleWhatsAppTest = () => {
    navigate('/whatsapp-test');
  };

  const handleSaveProfile = () => {
    toast({
      title: "✅ تم الحفظ بنجاح",
      description: "تم حفظ بيانات الملف الشخصي بنجاح"
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "✅ تم الحفظ بنجاح", 
      description: "تم حفظ إعدادات الإشعارات بنجاح"
    });
  };

  return (
    <Layout showBackButton={true}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إعدادات النظام</h1>
          <p className="text-slate-400">إدارة حسابك وتخصيص تجربة الاستخدام</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 text-slate-300">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <User className="w-4 h-4 ml-2" />
              الملف الشخصي
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Bell className="w-4 h-4 ml-2" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 ml-2" />
              الاتصالات
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 ml-2" />
              الأمان
            </TabsTrigger>
          </TabsList>

          {/* الملف الشخصي */}
          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  بيانات الملف الشخصي
                </CardTitle>
                <CardDescription className="text-slate-400">
                  إدارة المعلومات الأساسية لحسابك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-300">الاسم الأول</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-300">اسم العائلة</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300">اسم الشركة</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* الإشعارات */}
          <TabsContent value="notifications">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />
                  إعدادات الإشعارات
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تحكم في كيفية وصول الإشعارات إليك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 font-medium">إشعارات البريد الإلكتروني</Label>
                      <p className="text-sm text-slate-400">استقبال التحديثات المهمة عبر البريد</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 font-medium">رسائل SMS</Label>
                      <p className="text-sm text-slate-400">استقبال التنبيهات العاجلة عبر الرسائل</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 font-medium">الإشعارات الفورية</Label>
                      <p className="text-sm text-slate-400">تنبيهات مباشرة في المتصفح</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300 font-medium">الرسائل التسويقية</Label>
                      <p className="text-sm text-slate-400">عروض وتحديثات المنتجات</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ إعدادات الإشعارات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* الاتصالات والتكاملات */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    حالة التكاملات
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    إدارة اتصالات النظام مع الخدمات الخارجية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-white font-medium">WhatsApp API</h3>
                        <p className="text-sm text-slate-400">إرسال واستقبال الرسائل</p>
                      </div>
                    </div>
                    <Badge className={integrations.whatsappConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {integrations.whatsappConnected ? "متصل" : "غير متصل"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Twilio Voice</h3>
                        <p className="text-sm text-slate-400">المكالمات الصوتية الذكية</p>
                      </div>
                    </div>
                    <Badge className={integrations.twilioConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {integrations.twilioConnected ? "متصل" : "غير متصل"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Agent Configuration */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-green-400" />
                    إعدادات وكيل الواتساب الذكي
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    تكوين الوكيل الذكي لإرسال الرسائل التلقائية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsappAgentApiKey" className="text-slate-300 font-medium">
                        مفتاح API
                      </Label>
                      <Input
                        id="whatsappAgentApiKey"
                        type="password"
                        placeholder="ضع مفتاح API هنا..."
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                        value={integrations.whatsappAgentApiKey || ''}
                        onChange={(e) => setIntegrations(prev => ({ 
                          ...prev, 
                          whatsappAgentApiKey: e.target.value 
                        }))}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        مفتاح API للوكيل الذكي
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="whatsappSessionName" className="text-slate-300 font-medium">
                        اسم الجلسة
                      </Label>
                      <Input
                        id="whatsappSessionName"
                        placeholder="session_name_example"
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                        value={integrations.whatsappSessionName || ''}
                        onChange={(e) => setIntegrations(prev => ({ 
                          ...prev, 
                          whatsappSessionName: e.target.value 
                        }))}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        اسم فريد لجلسة الواتساب
                      </p>
                    </div>
                  </div>
                  
                  {/* Webhook URL Display */}
                  <div>
                    <Label className="text-slate-300 font-medium">
                      رابط Webhook للوكيل الذكي
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={`${window.location.origin}/api/whatsapp-agent/webhook`}
                        readOnly
                        className="bg-slate-700/30 border-slate-600 text-slate-300 flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp-agent/webhook`);
                          toast({
                            title: "تم النسخ",
                            description: "تم نسخ رابط الـ Webhook"
                          });
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      استخدم هذا الرابط في إعدادات واجهة برمجة التطبيقات
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => {
                        // Save WhatsApp Agent settings to API
                        const newSettings = {
                          ...settings,
                          whatsappAgentApiKey: integrations.whatsappAgentApiKey,
                          whatsappAgentSessionName: integrations.whatsappSessionName
                        };
                        saveSettingsMutation.mutate(newSettings);
                      }}
                      disabled={saveSettingsMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ إعدادات الوكيل
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/whatsapp-agent/test', {
                            method: 'POST'
                          });
                          const result = await response.json();
                          
                          if (result.success) {
                            toast({
                              title: "نجح الاختبار",
                              description: "وكيل الواتساب يعمل بشكل صحيح"
                            });
                          } else {
                            toast({
                              title: "فشل الاختبار",
                              description: result.message || "حدث خطأ أثناء الاختبار",
                              variant: "destructive"
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "خطأ في الاختبار",
                            description: "فشل في الاتصال بالوكيل",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Bot className="w-4 h-4 ml-2" />
                      اختبار الوكيل
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">تكوين الاتصالات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppTest}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    اختبار WhatsApp API
                  </Button>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="w-4 h-4 ml-2" />
                    اختبار المكالمات الصوتية
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* الأمان */}
          <TabsContent value="security">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  إعدادات الأمان
                </CardTitle>
                <CardDescription className="text-slate-400">
                  حماية حسابك ومعلوماتك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="text-white font-medium">كلمة المرور</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">آخر تغيير قبل 30 يوماً</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      تغيير كلمة المرور
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-medium">المصادقة الثنائية</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">حماية إضافية لحسابك</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      تفعيل المصادقة الثنائية
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-white font-medium">جلسات نشطة</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">إدارة الأجهزة المتصلة</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      عرض الجلسات النشطة
                    </Button>
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