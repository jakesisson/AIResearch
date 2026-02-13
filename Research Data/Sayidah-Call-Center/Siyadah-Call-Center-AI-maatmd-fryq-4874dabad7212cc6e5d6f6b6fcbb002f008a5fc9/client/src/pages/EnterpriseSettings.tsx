import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bot, Phone, MessageSquare, Shield, Bell, Eye, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  companyName: string;
  adminEmail: string;
  adminPhone: string;
  timezone: string;
  language: string;
  currency: string;
  
  // AI & Automation
  openaiApiKey: string;
  elevenLabsApiKey: string;
  aiResponseSpeed: 'fast' | 'balanced' | 'accurate';
  autoExecuteThreshold: number;
  agentPerformanceTracking: boolean;
  
  // Communication - Siyadah VoIP Only
  whatsappApiToken: string;
  whatsappWebhookUrl: string;
  emailSmtpServer: string;
  emailUsername: string;
  emailPassword: string;
  
  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: 'standard' | 'strict' | 'enterprise';
  apiRateLimit: number;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
  weeklyReports: boolean;
  realTimeAlerts: boolean;
  
  // Performance
  databaseBackupFrequency: 'daily' | 'weekly' | 'monthly';
  logRetentionDays: number;
  cacheEnabled: boolean;
  compressionEnabled: boolean;
  
  // UI/UX
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  showWelcomeMessage: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

export default function EnterpriseSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'شركة سيادة للذكاء الاصطناعي',
    adminEmail: 'admin@siyadah.ai',
    adminPhone: '+966501234567',
    timezone: 'Asia/Riyadh',
    language: 'ar',
    currency: 'SAR',
    
    openaiApiKey: '',
    elevenLabsApiKey: '',
    aiResponseSpeed: 'balanced',
    autoExecuteThreshold: 80,
    agentPerformanceTracking: true,
    
    whatsappApiToken: '',
    whatsappWebhookUrl: '',
    emailSmtpServer: '',
    emailUsername: '',
    emailPassword: '',
    
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordPolicy: 'standard',
    apiRateLimit: 100,
    
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    weeklyReports: true,
    realTimeAlerts: true,
    
    databaseBackupFrequency: 'daily',
    logRetentionDays: 30,
    cacheEnabled: true,
    compressionEnabled: true,
    
    theme: 'dark',
    sidebarCollapsed: false,
    showWelcomeMessage: true,
    animationsEnabled: true,
    soundEnabled: true
  });

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع الإعدادات بنجاح",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            إعدادات المؤسسة
          </h1>
          <p className="text-slate-400">
            إعدادات شاملة لنظام سيادة للذكاء الاصطناعي
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="ai">الذكاء الاصطناعي</TabsTrigger>
            <TabsTrigger value="communication">الاتصالات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">إعدادات المؤسسة</CardTitle>
                <CardDescription>
                  المعلومات الأساسية للشركة والإعدادات العامة
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">البريد الإلكتروني للمدير</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateSetting('adminEmail', e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  إعدادات الذكاء الاصطناعي
                </CardTitle>
                <CardDescription>
                  تكوين خدمات الذكاء الاصطناعي والأتمتة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="openaiKey">مفتاح OpenAI API</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="elevenLabsKey">مفتاح ElevenLabs API</Label>
                  <Input
                    id="elevenLabsKey"
                    type="password"
                    value={settings.elevenLabsApiKey}
                    onChange={(e) => updateSetting('elevenLabsApiKey', e.target.value)}
                    placeholder="..."
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>سرعة الاستجابة</Label>
                  <Select value={settings.aiResponseSpeed} onValueChange={(value: any) => updateSetting('aiResponseSpeed', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">سريع</SelectItem>
                      <SelectItem value="balanced">متوازن</SelectItem>
                      <SelectItem value="accurate">دقيق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-400" />
                  نظام الاتصالات
                </CardTitle>
                <CardDescription>
                  نظام Siyadah VoIP المتكامل
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-3 text-center p-6 text-slate-400">
                  <p>نظام الاتصالات متكامل مع Siyadah VoIP</p>
                  <p className="text-sm mt-2">لا حاجة لإعدادات إضافية</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  WhatsApp Business API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsappToken">رمز API</Label>
                  <Input
                    id="whatsappToken"
                    type="password"
                    value={settings.whatsappApiToken}
                    onChange={(e) => updateSetting('whatsappApiToken', e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappWebhook">Webhook URL</Label>
                  <Input
                    id="whatsappWebhook"
                    value={settings.whatsappWebhookUrl}
                    onChange={(e) => updateSetting('whatsappWebhookUrl', e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  إعدادات الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactor">المصادقة الثنائية</Label>
                  <Switch
                    id="twoFactor"
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(value) => updateSetting('twoFactorEnabled', value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">مهلة الجلسة (دقيقة)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  إعدادات التنبيهات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifs">تنبيهات البريد الإلكتروني</Label>
                  <Switch
                    id="emailNotifs"
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) => updateSetting('emailNotifications', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="browserNotifs">تنبيهات المتصفح</Label>
                  <Switch
                    id="browserNotifs"
                    checked={settings.browserNotifications}
                    onCheckedChange={(value) => updateSetting('browserNotifications', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cacheEnabled">تفعيل التخزين المؤقت</Label>
                  <Switch
                    id="cacheEnabled"
                    checked={settings.cacheEnabled}
                    onCheckedChange={(value) => updateSetting('cacheEnabled', value)}
                  />
                </div>
                <div>
                  <Label htmlFor="logRetention">فترة الاحتفاظ بالسجلات (يوم)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) => updateSetting('logRetentionDays', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
            حفظ جميع الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
}