// src/pages/email-integration-setup/components/AdvancedSettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const AdvancedSettings = ({ isConnected, apiKey }) => {
  const [settings, setSettings] = useState({
    webhookEnabled: false,
    webhookUrl: '',
    webhookEvents: ['sent', 'opened', 'clicked', 'bounced'],
    rateLimit: 100,
    rateLimitPeriod: 'hour',
    autoRetry: true,
    maxRetries: 3,
    complianceLevel: 'standard',
    domainAuthentication: false,
    spfRecord: 'v=spf1 include:spf.brevo.com ~all',
    dkimRecord: 'brevo._domainkey',
    spamThreshold: 7
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWebhookEventToggle = (event) => {
    const currentEvents = [...settings.webhookEvents];
    if (currentEvents.includes(event)) {
      handleChange('webhookEvents', currentEvents.filter(e => e !== event));
    } else {
      handleChange('webhookEvents', [...currentEvents, event]);
    }
  };

  const handleSave = () => {
    // Save settings logic - for now just show an alert
    alert('تم حفظ الإعدادات المتقدمة بنجاح!');
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Icon name="Lock" size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          يرجى الاتصال بخدمة البريد أولاً
        </h3>
        <p className="text-text-secondary mb-6">
          قم بإعداد الاتصال بخدمة Brevo من تبويب التكوين الأساسي للوصول إلى الإعدادات المتقدمة
        </p>
        <Button variant="primary" iconName="ArrowLeft">
          العودة إلى التكوين
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">الإعدادات المتقدمة</h2>
        <p className="text-text-secondary">خيارات متقدمة للتحكم بسلوك إرسال البريد الإلكتروني وتكامله</p>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <Icon name="AlertTriangle" size={18} className="text-warning mr-2" />
          <p className="text-sm text-warning">
            هذه الإعدادات متقدمة وقد تؤثر على أداء نظام البريد الإلكتروني. يُرجى توخي الحذر عند تعديلها.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Webhook Configuration */}
        <div className="glass-effect rounded-lg p-6 border border-white/10 col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Webhook" size={18} className="mr-2 text-accent" />
            إعدادات Webhook
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  تفعيل Webhook
                </label>
                <p className="text-xs text-text-secondary">
                  استلام إشعارات فورية عن أحداث البريد الإلكتروني
                </p>
              </div>
              <div className="relative inline-block w-12 h-6 select-none">
                <input
                  type="checkbox"
                  id="webhookEnabled"
                  name="webhookEnabled"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  checked={settings.webhookEnabled}
                  onChange={(e) => handleChange('webhookEnabled', e.target.checked)}
                />
                <label
                  htmlFor="webhookEnabled"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.webhookEnabled ? 'bg-accent' : 'bg-white/20'}`}
                ></label>
              </div>
            </div>
            
            {settings.webhookEnabled && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    عنوان URL لـ Webhook
                  </label>
                  <input
                    type="text"
                    value={settings.webhookUrl}
                    onChange={(e) => handleChange('webhookUrl', e.target.value)}
                    placeholder="https://your-app.com/api/email-webhook"
                    className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                  />
                  <p className="text-xs text-text-secondary">
                    عنوان URL الذي سيتم إرسال بيانات أحداث البريد الإلكتروني إليه
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    أحداث Webhook
                  </label>
                  <p className="text-xs text-text-secondary mb-2">
                    اختر الأحداث التي تريد استلام إشعارات بها
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'sent', label: 'إرسال البريد', icon: 'Send' },
                      { id: 'opened', label: 'فتح البريد', icon: 'Eye' },
                      { id: 'clicked', label: 'نقر على رابط', icon: 'MousePointer' },
                      { id: 'bounced', label: 'ارتداد البريد', icon: 'XCircle' },
                      { id: 'complaint', label: 'شكوى', icon: 'AlertOctagon' },
                      { id: 'unsubscribed', label: 'إلغاء الاشتراك', icon: 'UserMinus' }
                    ].map(event => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`event-${event.id}`}
                          checked={settings.webhookEvents.includes(event.id)}
                          onChange={() => handleWebhookEventToggle(event.id)}
                          className="w-4 h-4 text-accent focus:ring-accent rounded"
                        />
                        <label htmlFor={`event-${event.id}`} className="flex items-center text-sm text-text-primary">
                          <Icon name={event.icon} size={14} className="text-text-secondary mr-1" />
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-surface/30 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center">
                    <Icon name="Code" size={14} className="mr-1 text-text-secondary" />
                    مثال على بيانات Webhook
                  </h4>
                  <pre className="text-xs text-text-secondary bg-background/50 p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify({
                      event: 'opened',
                      email: 'recipient@example.com',
                      message_id: 'msg_12345',
                      timestamp: new Date().toISOString(),
                      tags: ['order_confirmation']
                    }, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="glass-effect rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Activity" size={18} className="mr-2 text-accent" />
            حدود الإرسال
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-3 space-y-1">
                <label className="block text-sm font-medium text-text-primary">
                  الحد الأقصى للإرسال
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.rateLimit}
                  onChange={(e) => handleChange('rateLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium text-text-primary">
                  لكل
                </label>
                <select
                  value={settings.rateLimitPeriod}
                  onChange={(e) => handleChange('rateLimitPeriod', e.target.value)}
                  className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                >
                  <option value="minute">دقيقة</option>
                  <option value="hour">ساعة</option>
                  <option value="day">يوم</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              تحديد الحد الأقصى لعدد رسائل البريد الإلكتروني التي يمكن إرسالها خلال فترة زمنية محددة
            </p>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    إعادة المحاولة التلقائية
                  </label>
                  <p className="text-xs text-text-secondary">
                    إعادة محاولة الإرسال تلقائيًا في حالة الفشل
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 select-none">
                  <input
                    type="checkbox"
                    id="autoRetry"
                    name="autoRetry"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    checked={settings.autoRetry}
                    onChange={(e) => handleChange('autoRetry', e.target.checked)}
                  />
                  <label
                    htmlFor="autoRetry"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.autoRetry ? 'bg-accent' : 'bg-white/20'}`}
                  ></label>
                </div>
              </div>
              
              {settings.autoRetry && (
                <div className="space-y-1 pt-2">
                  <label className="block text-sm font-medium text-text-primary">
                    الحد الأقصى لمحاولات إعادة الإرسال
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxRetries}
                    onChange={(e) => handleChange('maxRetries', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Settings */}
        <div className="glass-effect rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Shield" size={18} className="mr-2 text-accent" />
            إعدادات الامتثال
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                مستوى الامتثال
              </label>
              <select
                value={settings.complianceLevel}
                onChange={(e) => handleChange('complianceLevel', e.target.value)}
                className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              >
                <option value="standard">قياسي</option>
                <option value="enhanced">محسّن</option>
                <option value="strict">صارم</option>
              </select>
              <p className="text-xs text-text-secondary">
                تعيين مستوى الامتثال للقوانين واللوائح (يوصى بالمستوى القياسي للبداية)
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                عتبة التصفية كبريد مزعج
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.spamThreshold}
                onChange={(e) => handleChange('spamThreshold', parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>متساهل (1)</span>
                <span>متوازن ({settings.spamThreshold})</span>
                <span>صارم (10)</span>
              </div>
              <p className="text-xs text-text-secondary pt-1">
                تحديد مدى صرامة فلترة البريد المزعج (القيمة الأعلى = فلترة أكثر صرامة)
              </p>
            </div>
            
            <div className="p-3 mt-2 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start">
                <Icon name="Info" size={14} className="text-accent mt-0.5 mr-2" />
                <p className="text-xs text-accent">
                  يتطلب الامتثال للقوانين السعودية تضمين عنوان فعلي وخيار إلغاء الاشتراك في جميع رسائل البريد الإلكتروني التسويقية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Authentication */}
        <div className="glass-effect rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Lock" size={18} className="mr-2 text-accent" />
            مصادقة النطاق
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  مصادقة النطاق
                </label>
                <p className="text-xs text-text-secondary">
                  تحسين توصيل البريد الإلكتروني وتقليل احتمالية تصنيفه كبريد مزعج
                </p>
              </div>
              <div className="relative inline-block w-12 h-6 select-none">
                <input
                  type="checkbox"
                  id="domainAuthentication"
                  name="domainAuthentication"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  checked={settings.domainAuthentication}
                  onChange={(e) => handleChange('domainAuthentication', e.target.checked)}
                />
                <label
                  htmlFor="domainAuthentication"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.domainAuthentication ? 'bg-accent' : 'bg-white/20'}`}
                ></label>
              </div>
            </div>
            
            {settings.domainAuthentication && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    سجل SPF
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={settings.spfRecord}
                      readOnly
                      className="flex-1 px-3 py-2 bg-surface/30 border border-white/10 rounded-l-lg focus:outline-none"
                    />
                    <button
                      className="px-3 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-600 transition-colors duration-200"
                      onClick={() => navigator.clipboard.writeText(settings.spfRecord)}
                    >
                      <Icon name="Copy" size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    أضف سجل TXT هذا إلى إعدادات DNS الخاصة بنطاقك
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    سجل DKIM
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={settings.dkimRecord}
                      readOnly
                      className="flex-1 px-3 py-2 bg-surface/30 border border-white/10 rounded-l-lg focus:outline-none"
                    />
                    <button
                      className="px-3 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-600 transition-colors duration-200"
                      onClick={() => navigator.clipboard.writeText(settings.dkimRecord)}
                    >
                      <Icon name="Copy" size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    أضف سجل CNAME هذا إلى إعدادات DNS الخاصة بنطاقك
                  </p>
                </div>
                
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start">
                    <Icon name="AlertCircle" size={14} className="text-warning mt-0.5 mr-2" />
                    <p className="text-xs text-warning">
                      قد تستغرق تغييرات DNS ما يصل إلى 48 ساعة حتى تنتشر. راجع لوحة تحكم Brevo للتحقق من حالة المصادقة.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button variant="primary" iconName="Save" onClick={handleSave}>
          حفظ الإعدادات المتقدمة
        </Button>
      </div>

      {/* Custom styles for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #fff;
          transform: translateX(100%);
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: var(--color-accent);
        }
        .toggle-checkbox {
          right: 50%;
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdvancedSettings;