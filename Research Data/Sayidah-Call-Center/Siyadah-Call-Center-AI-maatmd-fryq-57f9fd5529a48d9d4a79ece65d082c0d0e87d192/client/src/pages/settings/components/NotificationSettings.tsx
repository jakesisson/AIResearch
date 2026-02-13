import React, { useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  onSettingsChange?: () => void;
  onSaveComplete?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSettingsChange, onSaveComplete }) => {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      newLeads: true,
      taskReminders: true,
      systemUpdates: false,
      weeklyReports: true,
      securityAlerts: true
    },
    push: {
      enabled: true,
      newLeads: true,
      taskReminders: true,
      systemUpdates: false,
      instantMessages: true,
      urgentTickets: true
    },
    sms: {
      enabled: false,
      newLeads: false,
      taskReminders: false,
      securityAlerts: true,
      systemOutages: true
    },
    inApp: {
      enabled: true,
      newLeads: true,
      taskReminders: true,
      systemUpdates: true,
      teamMentions: true,
      aiRecommendations: true
    }
  });
  
  const [frequency, setFrequency] = useState({
    digestFrequency: 'daily',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendNotifications: false
  });
  
  const [preview, setPreview] = useState<any>(null);
  const { toast } = useToast();

  const notificationTypes = [
    {
      id: 'newLeads',
      label: 'عملاء محتملين جدد',
      description: 'إشعار عند وصول عميل محتمل جديد',
      icon: 'UserPlus',
      category: 'business'
    },
    {
      id: 'taskReminders',
      label: 'تذكير المهام',
      description: 'تذكير بالمهام المستحقة والمواعيد',
      icon: 'Calendar',
      category: 'productivity'
    },
    {
      id: 'systemUpdates',
      label: 'تحديثات النظام',
      description: 'إشعارات التحديثات والصيانة',
      icon: 'Download',
      category: 'system'
    },
    {
      id: 'weeklyReports',
      label: 'التقارير الأسبوعية',
      description: 'ملخص أداء الأسبوع',
      icon: 'BarChart3',
      category: 'reports'
    },
    {
      id: 'securityAlerts',
      label: 'تنبيهات الأمان',
      description: 'تحديثات أمنية ومحاولات دخول',
      icon: 'Shield',
      category: 'security'
    },
    {
      id: 'instantMessages',
      label: 'الرسائل الفورية',
      description: 'رسائل الفريق والعملاء',
      icon: 'MessageSquare',
      category: 'communication'
    },
    {
      id: 'urgentTickets',
      label: 'التذاكر العاجلة',
      description: 'تذاكر الدعم عالية الأولوية',
      icon: 'AlertTriangle',
      category: 'support'
    },
    {
      id: 'teamMentions',
      label: 'إشارات الفريق',
      description: 'عند الإشارة إليك في المحادثات',
      icon: 'AtSign',
      category: 'social'
    },
    {
      id: 'aiRecommendations',
      label: 'توصيات الذكاء الاصطناعي',
      description: 'اقتراحات وتوصيات ذكية',
      icon: 'Bot',
      category: 'ai'
    },
    {
      id: 'systemOutages',
      label: 'انقطاع الخدمة',
      description: 'إشعارات عطل أو انقطاع الخدمة',
      icon: 'WifiOff',
      category: 'system'
    }
  ];

  const channels = [
    {
      id: 'email',
      label: 'البريد الإلكتروني',
      icon: 'Mail',
      description: 'إشعارات مفصلة مع روابط سريعة',
      color: 'text-primary'
    },
    {
      id: 'push',
      label: 'الإشعارات المدفوعة',
      icon: 'Smartphone',
      description: 'إشعارات فورية على الجهاز',
      color: 'text-accent'
    },
    {
      id: 'sms',
      label: 'الرسائل النصية',
      icon: 'MessageCircle',
      description: 'للإشعارات المهمة والعاجلة فقط',
      color: 'text-warning'
    },
    {
      id: 'inApp',
      label: 'داخل التطبيق',
      icon: 'Bell',
      description: 'إشعارات ضمن واجهة المنصة',
      color: 'text-secondary'
    }
  ];

  const handleNotificationToggle = (channel: string, type: string) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel as keyof typeof prev],
        [type]: !prev[channel as keyof typeof prev][type as keyof typeof prev.email]
      }
    }));
    onSettingsChange?.();
  };

  const handleChannelToggle = (channel: string) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel as keyof typeof prev],
        enabled: !prev[channel as keyof typeof prev].enabled
      }
    }));
    onSettingsChange?.();
  };

  const handleFrequencyChange = (setting: string, value: string | boolean) => {
    setFrequency(prev => ({ ...prev, [setting]: value }));
    onSettingsChange?.();
  };

  const showPreview = (type: string) => {
    const notification = notificationTypes.find(n => n.id === type);
    setPreview({
      type,
      title: notification?.label,
      message: `هذا مثال على إشعار ${notification?.label}. سيتم عرضه بهذا الشكل عند التفعيل.`,
      timestamp: new Date()
    });
    
    setTimeout(() => setPreview(null), 5000);
  };

  const saveSettings = () => {
    // Simulate saving settings
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات الإشعارات بنجاح"
    });
    onSaveComplete?.();
  };

  return (
    <div className="space-y-8">
      {/* Preview Notification */}
      {preview && (
        <div className="fixed top-20 right-6 z-50 glass-effect border border-accent/30 rounded-lg p-4 max-w-sm shadow-glow-accent animate-slide-in">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <AppIcon name="Bell" size={16} className="text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary text-sm">{preview.title}</h4>
              <p className="text-text-secondary text-xs mt-1">{preview.message}</p>
              <p className="text-text-muted text-xs mt-2">{preview.timestamp.toLocaleTimeString('ar-SA')}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreview(null)}
              className="h-6 w-6 text-text-muted hover:text-text-primary"
            >
              <AppIcon name="X" size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Notification Channels */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">قنوات الإشعارات</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <Card key={channel.id} className="glass-effect border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <AppIcon name={channel.icon} size={20} className={channel.color} />
                  <span className="font-medium text-text-primary">{channel.label}</span>
                </div>
                <Switch
                  checked={notifications[channel.id as keyof typeof notifications]?.enabled || false}
                  onCheckedChange={() => handleChannelToggle(channel.id)}
                />
              </div>
              <p className="text-text-secondary text-xs">{channel.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">أنواع الإشعارات</h3>
        
        <Card className="glass-effect border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface/50 border-b border-white/10">
                <tr>
                  <th className="text-right p-4 text-sm font-medium text-text-secondary">نوع الإشعار</th>
                  <th className="text-center p-4 text-sm font-medium text-text-secondary">البريد الإلكتروني</th>
                  <th className="text-center p-4 text-sm font-medium text-text-secondary">الإشعارات المدفوعة</th>
                  <th className="text-center p-4 text-sm font-medium text-text-secondary">الرسائل النصية</th>
                  <th className="text-center p-4 text-sm font-medium text-text-secondary">داخل التطبيق</th>
                  <th className="text-center p-4 text-sm font-medium text-text-secondary">معاينة</th>
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((type) => (
                  <tr key={type.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <AppIcon name={type.icon} size={16} className="text-accent" />
                        <div>
                          <p className="font-medium text-text-primary text-sm">{type.label}</p>
                          <p className="text-text-secondary text-xs">{type.description}</p>
                        </div>
                      </div>
                    </td>
                    {channels.map((channel) => (
                      <td key={channel.id} className="text-center p-4">
                        {notifications[channel.id as keyof typeof notifications] && type.id in notifications[channel.id as keyof typeof notifications] ? (
                          <Switch
                            checked={notifications[channel.id as keyof typeof notifications][type.id as keyof typeof notifications.email] || false}
                            onCheckedChange={() => handleNotificationToggle(channel.id, type.id)}
                            disabled={!notifications[channel.id as keyof typeof notifications].enabled}
                          />
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showPreview(type.id)}
                        className="h-8 w-8 text-accent hover:text-accent-300"
                        title="معاينة الإشعار"
                      >
                        <AppIcon name="Eye" size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Frequency and Timing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">التوقيت والتكرار</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digest Frequency */}
          <Card className="glass-effect border border-white/10 p-6">
            <h4 className="font-medium text-text-primary mb-4">تكرار الملخص</h4>
            <div className="space-y-3">
              {[
                { value: 'immediate', label: 'فوري' },
                { value: 'hourly', label: 'كل ساعة' },
                { value: 'daily', label: 'يومي' },
                { value: 'weekly', label: 'أسبوعي' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="digestFrequency"
                    value={option.value}
                    checked={frequency.digestFrequency === option.value}
                    onChange={(e) => handleFrequencyChange('digestFrequency', e.target.value)}
                    className="w-4 h-4 text-accent bg-surface border-white/20 focus:ring-accent/50"
                  />
                  <span className="text-text-primary">{option.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="glass-effect border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-primary">ساعات الهدوء</h4>
              <Switch
                checked={frequency.quietHoursEnabled}
                onCheckedChange={(checked) => handleFrequencyChange('quietHoursEnabled', checked)}
              />
            </div>
            
            {frequency.quietHoursEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">بداية ساعات الهدوء</label>
                  <Select 
                    value={frequency.quietHoursStart} 
                    onValueChange={(value) => handleFrequencyChange('quietHoursStart', value)}
                  >
                    <SelectTrigger className="bg-surface border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-text-secondary mb-2">نهاية ساعات الهدوء</label>
                  <Select 
                    value={frequency.quietHoursEnd} 
                    onValueChange={(value) => handleFrequencyChange('quietHoursEnd', value)}
                  >
                    <SelectTrigger className="bg-surface border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </Card>

          {/* Weekend Settings */}
          <Card className="glass-effect border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-text-primary">إشعارات نهاية الأسبوع</h4>
                <p className="text-sm text-text-secondary">تلقي الإشعارات في أيام الجمعة والسبت</p>
              </div>
              <Switch
                checked={frequency.weekendNotifications}
                onCheckedChange={(checked) => handleFrequencyChange('weekendNotifications', checked)}
              />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-effect border border-white/10 p-6">
            <h4 className="font-medium text-text-primary mb-4">إجراءات سريعة</h4>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-warning text-warning hover:bg-warning/10"
                onClick={() => {
                  // Disable all notifications
                  setNotifications(prev => ({
                    email: { ...prev.email, enabled: false },
                    push: { ...prev.push, enabled: false },
                    sms: { ...prev.sms, enabled: false },
                    inApp: { ...prev.inApp, enabled: false }
                  }));
                  onSettingsChange?.();
                }}
              >
                <AppIcon name="BellOff" size={16} className="ml-2" />
                إيقاف جميع الإشعارات
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  // Reset to defaults
                  setNotifications({
                    email: {
                      enabled: true,
                      newLeads: true,
                      taskReminders: true,
                      systemUpdates: false,
                      weeklyReports: true,
                      securityAlerts: true
                    },
                    push: {
                      enabled: true,
                      newLeads: true,
                      taskReminders: true,
                      systemUpdates: false,
                      instantMessages: true,
                      urgentTickets: true
                    },
                    sms: {
                      enabled: false,
                      newLeads: false,
                      taskReminders: false,
                      securityAlerts: true,
                      systemOutages: true
                    },
                    inApp: {
                      enabled: true,
                      newLeads: true,
                      taskReminders: true,
                      systemUpdates: true,
                      teamMentions: true,
                      aiRecommendations: true
                    }
                  });
                  onSettingsChange?.();
                }}
              >
                <AppIcon name="RotateCcw" size={16} className="ml-2" />
                إعادة تعيين للافتراضي
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          className="bg-accent hover:bg-accent-600 text-background"
        >
          <AppIcon name="Save" size={16} className="ml-2" />
          حفظ إعدادات الإشعارات
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
