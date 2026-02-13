import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleSettings {
  companyName: string;
  adminEmail: string;
  adminPhone: string;
  language: string;
  theme: string;
  emailNotifications: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  openaiApiKey: string;
}

export default function SimpleSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SimpleSettings>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('فشل في تحميل الإعدادات');
      const data = await response.json();
      console.log('✅ Settings loaded:', data);
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<SimpleSettings>) => {
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

  const updateSetting = (key: keyof SimpleSettings, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      updateMutation.mutate(newSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">جارٍ تحميل الإعدادات...</h2>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">خطأ في تحميل الإعدادات</h2>
          <Button onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold">إعدادات سيادة AI</h1>
        </div>
        <p className="text-slate-400 mt-2">إدارة إعدادات النظام والتكوين</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* الملف الشخصي */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">الملف الشخصي</CardTitle>
              <CardDescription className="text-slate-400">
                معلومات الشركة والحساب الأساسي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-white">اسم الشركة</Label>
                <Input
                  id="companyName"
                  value={settings.companyName || ''}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                  placeholder="سيادة AI"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="adminEmail" className="text-white">البريد الإلكتروني</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail || ''}
                  onChange={(e) => updateSetting('adminEmail', e.target.value)}
                  placeholder="admin@siyadah.ai"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="adminPhone" className="text-white">رقم الهاتف</Label>
                <Input
                  id="adminPhone"
                  value={settings.adminPhone || ''}
                  onChange={(e) => updateSetting('adminPhone', e.target.value)}
                  placeholder="+966 XX XXX XXXX"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* الذكاء الاصطناعي */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">الذكاء الاصطناعي</CardTitle>
              <CardDescription className="text-slate-400">
                إعدادات OpenAI و الأتمتة الذكية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openaiApiKey" className="text-white">مفتاح OpenAI</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* الاتصالات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">الاتصالات</CardTitle>
              <CardDescription className="text-slate-400">
                إعدادات الرسائل والتكامل مع VoIP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 text-slate-400">
                <p>نظام الاتصالات متكامل مع Siyadah VoIP</p>
                <p className="text-sm mt-2">لا حاجة لإعدادات إضافية</p>
              </div>
            </CardContent>
          </Card>

          {/* النظام */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">النظام</CardTitle>
              <CardDescription className="text-slate-400">
                اللغة والسمة والإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language" className="text-white">اللغة</Label>
                <Select 
                  value={settings.language || 'ar'} 
                  onValueChange={(value) => updateSetting('language', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="theme" className="text-white">السمة</Label>
                <Select 
                  value={settings.theme || 'dark'} 
                  onValueChange={(value) => updateSetting('theme', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="اختر السمة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="dark">الداكنة</SelectItem>
                    <SelectItem value="light">الفاتحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="text-white">الإشعارات بالبريد</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications || false}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* حالة الحفظ */}
        {updateMutation.isPending && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            جارٍ الحفظ...
          </div>
        )}
      </div>
    </div>
  );
}