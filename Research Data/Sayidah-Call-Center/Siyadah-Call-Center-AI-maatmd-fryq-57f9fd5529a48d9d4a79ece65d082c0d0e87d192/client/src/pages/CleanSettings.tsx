import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Loader2, Check, X, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsData {
  companyName: string;
  adminEmail: string;
  adminPhone: string;
  language: string;
  theme: string;
  emailNotifications: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  openaiApiKey: string;
  timezone: string;
  currency: string;
  elevenLabsApiKey: string;
  whatsappApiToken: string;
  whatsappWebhookUrl: string;
}

export default function CleanSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState('profile');
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [whatsappTestResult, setWhatsappTestResult] = useState<{success: boolean; message: string} | null>(null);

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('فشل في تحميل الإعدادات');
      return response.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<SettingsData>) => {
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
        description: 'تم حفظ الإعدادات بنجاح',
      });
    }
  });

  const updateSetting = (key: keyof SettingsData, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      updateMutation.mutate(newSettings);
    }
  };

  const handleWhatsAppTest = () => {
    navigate('/whatsapp-test');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">جارٍ تحميل الإعدادات</h2>
          <p className="text-slate-400 mt-2">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">خطأ في تحميل الإعدادات</h2>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 hover:bg-blue-700">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'profile', name: 'الملف الشخصي', icon: '👤' },
    { id: 'ai', name: 'الذكاء الاصطناعي', icon: '🧠' },
    { id: 'communications', name: 'الاتصالات', icon: '📞' },
    { id: 'system', name: 'النظام', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">إعدادات سيادة AI</h1>
                <p className="text-slate-400">إدارة إعدادات النظام والتكوين</p>
              </div>
            </div>
            
            {updateMutation.isPending && (
              <div className="flex items-center gap-2 bg-blue-600/20 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30">
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الحفظ...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* الملف الشخصي */}
        {activeSection === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  👤 معلومات الشركة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  البيانات الأساسية للشركة والحساب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="companyName" className="text-white font-medium">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName || ''}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    placeholder="سيادة AI"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail" className="text-white font-medium">البريد الإلكتروني</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail || ''}
                    onChange={(e) => updateSetting('adminEmail', e.target.value)}
                    placeholder="admin@siyadah.ai"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="adminPhone" className="text-white font-medium">رقم الهاتف</Label>
                  <Input
                    id="adminPhone"
                    value={settings.adminPhone || ''}
                    onChange={(e) => updateSetting('adminPhone', e.target.value)}
                    placeholder="+966 XX XXX XXXX"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🌍 الإعدادات الإقليمية
                </CardTitle>
                <CardDescription className="text-slate-400">
                  المنطقة الزمنية واللغة والعملة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="timezone" className="text-white font-medium">المنطقة الزمنية</Label>
                  <Select 
                    value={settings.timezone || 'Asia/Riyadh'} 
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency" className="text-white font-medium">العملة</Label>
                  <Select 
                    value={settings.currency || 'SAR'} 
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الذكاء الاصطناعي */}
        {activeSection === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🧠 OpenAI & ChatGPT
                </CardTitle>
                <CardDescription className="text-slate-400">
                  إعدادات الذكاء الاصطناعي والمحادثة الذكية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="openaiApiKey" className="text-white font-medium">مفتاح OpenAI API</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">يتم تشفير المفتاح تلقائياً</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎤 ElevenLabs Voice AI
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تحويل النص إلى كلام بجودة عالية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="elevenLabsApiKey" className="text-white font-medium">مفتاح ElevenLabs API</Label>
                  <Input
                    id="elevenLabsApiKey"
                    type="password"
                    value={settings.elevenLabsApiKey || ''}
                    onChange={(e) => updateSetting('elevenLabsApiKey', e.target.value)}
                    placeholder="sk_..."
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">لتحسين جودة الصوت الطبيعي</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الاتصالات */}
        {activeSection === 'communications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📞 Twilio Communications
                </CardTitle>
                <CardDescription className="text-slate-400">
                  إعدادات المكالمات والرسائل النصية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="twilioAccountSid" className="text-white font-medium">Twilio Account SID</Label>
                  <Input
                    id="twilioAccountSid"
                    value={settings.twilioAccountSid || ''}
                    onChange={(e) => updateSetting('twilioAccountSid', e.target.value)}
                    placeholder="AC..."
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="twilioAuthToken" className="text-white font-medium">Twilio Auth Token</Label>
                  <Input
                    id="twilioAuthToken"
                    type="password"
                    value={settings.twilioAuthToken || ''}
                    onChange={(e) => updateSetting('twilioAuthToken', e.target.value)}
                    placeholder="•••••••••••••••"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp API Settings */}
            <Card className="bg-green-900/20 backdrop-blur-sm border-green-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  WhatsApp API 💬
                </CardTitle>
                <CardDescription className="text-green-200/70">
                  إعدادات واجهة برمجة تطبيقات واتساب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsappApiToken" className="text-white font-medium">WhatsApp API Token</Label>
                  <Input
                    id="whatsappApiToken"
                    type="password"
                    value={settings.whatsappApiToken || ''}
                    onChange={(e) => updateSetting('whatsappApiToken', e.target.value)}
                    placeholder="Your WhatsApp API Token..."
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400"
                  />
                  <p className="text-xs text-green-300/70 mt-1">مفتاح API من WhatsApp Business</p>
                </div>
                
                <div>
                  <Label htmlFor="whatsappWebhookUrl" className="text-white font-medium">Webhook URL</Label>
                  <Input
                    id="whatsappWebhookUrl"
                    value={settings.whatsappWebhookUrl || ''}
                    onChange={(e) => updateSetting('whatsappWebhookUrl', e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                    className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-400"
                  />
                  <p className="text-xs text-green-300/70 mt-1">رابط استقبال الرسائل</p>
                </div>
                
                {/* Quick Test Button */}
                <div className="pt-1">
                  <Button 
                    onClick={handleWhatsAppTest}
                    disabled={!settings?.whatsappApiToken || isTestingWhatsApp}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isTestingWhatsApp ? 'جاري الاختبار...' : 'اختبار سريع 🚀'}
                  </Button>
                  {whatsappTestResult && (
                    <p className={`text-xs mt-2 ${whatsappTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {whatsappTestResult.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* النظام */}
        {activeSection === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📧 الإشعارات
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تفضيلات التنبيهات والإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="text-white font-medium">الإشعارات بالبريد</Label>
                    <p className="text-sm text-slate-400">تلقي التنبيهات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications || false}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* النظام */}
        {activeSection === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎨 المظهر والواجهة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  تخصيص شكل ومظهر التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language" className="text-white font-medium">اللغة</Label>
                  <Select 
                    value={settings.language || 'ar'} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="theme" className="text-white font-medium">السمة</Label>
                  <Select 
                    value={settings.theme || 'dark'} 
                    onValueChange={(value) => updateSetting('theme', value)}
                  >
                    <SelectTrigger className="mt-2 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر السمة" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="dark">الداكنة 🌙</SelectItem>
                      <SelectItem value="light">الفاتحة ☀️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  ℹ️ معلومات النظام
                </CardTitle>
                <CardDescription className="text-slate-400">
                  حالة النظام والإحصائيات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300">حالة النظام</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">متصل</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    آخر تحديث: الآن
                  </div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="text-slate-300 mb-1">الإصدار</div>
                  <div className="text-sm text-slate-400">سيادة AI v2.0.0</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Success Message */}
      {updateMutation.isSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check className="w-5 h-5" />
          تم حفظ الإعدادات بنجاح
        </div>
      )}
    </div>
  );
}