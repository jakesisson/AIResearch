// src/pages/settings-configuration/components/NotificationSettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const NotificationSettings = ({ onSettingsChange, onSaveComplete }) => {
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
  
  const [preview, setPreview] = useState(null);

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

  const handleNotificationToggle = (channel, type) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type]
      }
    }));
    onSettingsChange?.();
  };

  const handleChannelToggle = (channel) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled
      }
    }));
    onSettingsChange?.();
  };

  const handleFrequencyChange = (setting, value) => {
    setFrequency(prev => ({ ...prev, [setting]: value }));
    onSettingsChange?.();
  };

  const showPreview = (type) => {
    const notification = notificationTypes.find(n => n.id === type);
    setPreview({
      type,
      title: notification.label,
      message: `هذا مثال على إشعار ${notification.label}. سيتم عرضه بهذا الشكل عند التفعيل.`,
      timestamp: new Date()
    });
    
    setTimeout(() => setPreview(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Preview Notification */}
      {preview && (
        <div className="fixed top-20 right-6 z-500 glass-effect border border-accent/30 rounded-lg p-4 max-w-sm shadow-glow-accent animate-slide-in">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Icon name="Bell" size={16} className="text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary text-sm">{preview.title}</h4>
              <p className="text-text-secondary text-xs mt-1">{preview.message}</p>
              <p className="text-text-muted text-xs mt-2">{preview.timestamp.toLocaleTimeString('ar-SA')}</p>
            </div>
            <button
              onClick={() => setPreview(null)}
              className="text-text-muted hover:text-text-primary transition-colors duration-300"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Notification Channels */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">قنوات الإشعارات</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="glass-effect border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon name={channel.icon} size={20} className={channel.color} />
                  <span className="font-medium text-text-primary">{channel.label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[channel.id]?.enabled || false}
                    onChange={() => handleChannelToggle(channel.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
              <p className="text-text-secondary text-xs">{channel.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">أنواع الإشعارات</h3>
        
        <div className="glass-effect border border-white/10 rounded-lg overflow-hidden">
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
                        <Icon name={type.icon} size={16} className="text-accent" />
                        <div>
                          <p className="font-medium text-text-primary text-sm">{type.label}</p>
                          <p className="text-text-secondary text-xs">{type.description}</p>
                        </div>
                      </div>
                    </td>
                    {channels.map((channel) => (
                      <td key={channel.id} className="text-center p-4">
                        {notifications[channel.id] && type.id in notifications[channel.id] ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[channel.id][type.id] || false}
                              onChange={() => handleNotificationToggle(channel.id, type.id)}
                              disabled={!notifications[channel.id].enabled}
                              className="sr-only peer"
                            />
                            <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                              notifications[channel.id].enabled 
                                ? 'bg-surface peer-checked:bg-accent peer-focus:ring-4 peer-focus:ring-accent/20' :'bg-text-muted/20 cursor-not-allowed'
                            }`}></div>
                          </label>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center p-4">
                      <button
                        onClick={() => showPreview(type.id)}
                        className="text-accent hover:text-accent-300 transition-colors duration-300"
                        title="معاينة الإشعار"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Frequency and Timing */}
      <div className="space-y-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary">التوقيت والتكرار</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digest Frequency */}
          <div className="glass-effect border border-white/10 rounded-lg p-6">
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
                    value={option.value}
                    checked={frequency.digestFrequency === option.value}
                    onChange={(e) => handleFrequencyChange('digestFrequency', e.target.value)}
                    className="w-4 h-4 text-accent bg-surface border-white/20 focus:ring-accent/50 focus:ring-2"
                  />
                  <span className="text-text-primary">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="glass-effect border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-primary">ساعات الهدوء</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={frequency.quietHoursEnabled}
                  onChange={(e) => handleFrequencyChange('quietHoursEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            
            {frequency.quietHoursEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">من</label>
                  <input
                    type="time"
                    value={frequency.quietHoursStart}
                    onChange={(e) => handleFrequencyChange('quietHoursStart', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">إلى</label>
                  <input
                    type="time"
                    value={frequency.quietHoursEnd}
                    onChange={(e) => handleFrequencyChange('quietHoursEnd', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="weekend-notifications"
                    checked={frequency.weekendNotifications}
                    onChange={(e) => handleFrequencyChange('weekendNotifications', e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-white/20 bg-surface/50 text-accent focus:ring-accent/50 focus:ring-2"
                  />
                  <label htmlFor="weekend-notifications" className="text-text-primary text-sm">تفعيل الإشعارات في نهاية الأسبوع</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-6 border-t border-white/10">
        <button
          onClick={() => {
            onSaveComplete?.();
            // Show success message
          }}
          className="bg-accent hover:bg-accent-600 text-background font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <Icon name="Save" size={16} />
          <span>حفظ إعدادات الإشعارات</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;