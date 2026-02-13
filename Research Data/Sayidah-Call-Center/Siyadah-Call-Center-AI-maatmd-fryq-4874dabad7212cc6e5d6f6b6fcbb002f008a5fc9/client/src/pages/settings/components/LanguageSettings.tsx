import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppIcon from '@/components/ui/app-icon';
import { useLanguage, type LanguageSettings } from '@/hooks/useLanguage';

interface LanguageSettingsProps {
  onSettingsChange?: () => void;
  onSaveComplete?: () => void;
}

export default function LanguageSettings({ onSettingsChange, onSaveComplete }: LanguageSettingsProps) {
  const { settings, updateSettings, formatCurrency, formatNumber, formatDate } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would typically save to a backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving language settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof LanguageSettings, value: any) => {
    updateSettings({ [key]: value });
    onSettingsChange?.();
  };

  const previewDate = new Date();
  const previewNumber = 1234567.89;
  const previewCurrency = 15250;

  return (
    <div className="space-y-6">
      <Card className="glass-effect border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-text-primary">
            <AppIcon name="Globe" className="w-5 h-5 ml-2" />
            إعدادات اللغة والمنطقة
          </CardTitle>
          <CardDescription className="text-text-secondary">
            تخصيص اللغة والتنسيق الإقليمي للمنصة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold text-text-primary">لغة الواجهة</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      ع
                    </div>
                    <div>
                      <h5 className="font-medium text-text-primary">العربية</h5>
                      <p className="text-sm text-text-secondary">اللغة الافتراضية للمنصة</p>
                    </div>
                  </div>
                  <Badge variant={settings.language === 'ar' ? 'success' : 'secondary'}>
                    {settings.language === 'ar' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      EN
                    </div>
                    <div>
                      <h5 className="font-medium text-text-primary">English</h5>
                      <p className="text-sm text-text-secondary">قريباً - تحت التطوير</p>
                    </div>
                  </div>
                  <Badge variant="secondary">قريباً</Badge>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-text-primary">الإعدادات الإقليمية</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">المنطقة الزمنية</label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">آسيا/الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">آسيا/دبي (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">آسيا/الكويت (GMT+3)</SelectItem>
                      <SelectItem value="Africa/Cairo">أفريقيا/القاهرة (GMT+2)</SelectItem>
                      <SelectItem value="Asia/Beirut">آسيا/بيروت (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">تنسيق التاريخ</label>
                  <Select 
                    value={settings.dateFormat} 
                    onValueChange={(value: any) => handleSettingChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gregorian">التقويم الميلادي</SelectItem>
                      <SelectItem value="hijri">التقويم الهجري</SelectItem>
                      <SelectItem value="both">كلاهما</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-secondary mt-1">
                    معاينة: {formatDate(previewDate)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">العملة الافتراضية</label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value: any) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                      <SelectItem value="QAR">ريال قطري (QAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-secondary mt-1">
                    معاينة: {formatCurrency(previewCurrency)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">تنسيق الأرقام</label>
                  <Select 
                    value={settings.numberFormat} 
                    onValueChange={(value: any) => handleSettingChange('numberFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="western">الأرقام الغربية (123)</SelectItem>
                      <SelectItem value="arabic">الأرقام العربية (١٢٣)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-text-secondary mt-1">
                    معاينة: {formatNumber(previewNumber)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* RTL Setting */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-text-primary">اتجاه النص (RTL)</h5>
                <p className="text-sm text-text-secondary">تخطيط من اليمين إلى اليسار للنصوص العربية</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={settings.rtl}
                  onCheckedChange={(checked) => handleSettingChange('rtl', checked)}
                />
                <span className="text-sm text-text-secondary">
                  {settings.rtl ? 'مفعل' : 'معطل'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-600 text-background"
            >
              <AppIcon name="Save" className="w-4 h-4 ml-2" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-text-primary hover:bg-white/5"
              onClick={() => {
                updateSettings({
                  language: 'ar',
                  timezone: 'Asia/Riyadh',
                  dateFormat: 'gregorian',
                  currency: 'SAR',
                  numberFormat: 'western',
                  rtl: true
                });
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}