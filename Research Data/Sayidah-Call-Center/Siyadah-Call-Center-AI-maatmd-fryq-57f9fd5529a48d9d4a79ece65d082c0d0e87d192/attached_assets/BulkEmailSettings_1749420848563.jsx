// src/pages/email-integration-setup/components/BulkEmailSettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const BulkEmailSettings = ({ isConnected, apiKey }) => {
  const [settings, setSettings] = useState({
    enableBulkEmails: true,
    maxBatchSize: 500,
    batchInterval: 15,
    defaultSegmentation: 'basic',
    autoUnsubscribe: true,
    trackCampaignStats: true,
    useContactLists: true
  });

  const [lists, setLists] = useState([
    { id: 1, name: 'العملاء النشطين', count: 1245, lastUpdated: new Date(2023, 9, 15) },
    { id: 2, name: 'العملاء الجدد', count: 347, lastUpdated: new Date(2023, 10, 28) },
    { id: 3, name: 'النشرة البريدية', count: 2156, lastUpdated: new Date(2023, 11, 10) }
  ]);

  const [segmentation, setSegmentation] = useState([
    { id: 1, name: 'حسب المنطقة', criteria: 'location', isActive: true },
    { id: 2, name: 'حسب العمر', criteria: 'age', isActive: false },
    { id: 3, name: 'المشتريات السابقة', criteria: 'purchase_history', isActive: true }
  ]);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic - for now just show an alert
    alert('تم حفظ إعدادات البريد الجماعي بنجاح!');
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Icon name="Lock" size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          يرجى الاتصال بخدمة البريد أولاً
        </h3>
        <p className="text-text-secondary mb-6">
          قم بإعداد الاتصال بخدمة Brevo من تبويب التكوين الأساسي للوصول إلى إعدادات البريد الجماعي
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
        <h2 className="text-xl font-semibold text-text-primary">إعدادات البريد الجماعي</h2>
        <p className="text-text-secondary">تكوين إعدادات إرسال رسائل البريد الإلكتروني الجماعية وقوائم جهات الاتصال</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Email Settings */}
        <div className="glass-effect rounded-lg p-6 border border-white/10 col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Users" size={18} className="mr-2 text-accent" />
            إعدادات الإرسال الجماعي
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  تمكين رسائل البريد الإلكتروني الجماعية
                </label>
                <p className="text-xs text-text-secondary">
                  السماح بإرسال رسائل بريد إلكتروني إلى قوائم كبيرة من جهات الاتصال
                </p>
              </div>
              <div className="relative inline-block w-12 h-6 select-none">
                <input
                  type="checkbox"
                  id="enableBulkEmails"
                  name="enableBulkEmails"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  checked={settings.enableBulkEmails}
                  onChange={(e) => handleChange('enableBulkEmails', e.target.checked)}
                />
                <label
                  htmlFor="enableBulkEmails"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.enableBulkEmails ? 'bg-accent' : 'bg-white/20'}`}
                ></label>
              </div>
            </div>
            
            {settings.enableBulkEmails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    الحد الأقصى لحجم الدفعة
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={settings.maxBatchSize}
                    onChange={(e) => handleChange('maxBatchSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                  />
                  <p className="text-xs text-text-secondary">
                    عدد رسائل البريد الإلكتروني التي سيتم إرسالها في كل دفعة
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    الفاصل الزمني بين الدفعات (دقائق)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.batchInterval}
                    onChange={(e) => handleChange('batchInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                  />
                  <p className="text-xs text-text-secondary">
                    المدة الزمنية بين كل دفعة من رسائل البريد الإلكتروني
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    التقسيم الافتراضي
                  </label>
                  <select
                    value={settings.defaultSegmentation}
                    onChange={(e) => handleChange('defaultSegmentation', e.target.value)}
                    className="w-full px-3 py-2 bg-surface/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                  >
                    <option value="none">بدون تقسيم</option>
                    <option value="basic">تقسيم أساسي</option>
                    <option value="advanced">تقسيم متقدم</option>
                  </select>
                  <p className="text-xs text-text-secondary">
                    كيفية تقسيم قوائم جهات الاتصال افتراضيًا
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      إلغاء الاشتراك التلقائي
                    </label>
                    <p className="text-xs text-text-secondary">
                      إدارة عمليات إلغاء الاشتراك تلقائيًا عبر جميع القوائم
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 select-none">
                    <input
                      type="checkbox"
                      id="autoUnsubscribe"
                      name="autoUnsubscribe"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={settings.autoUnsubscribe}
                      onChange={(e) => handleChange('autoUnsubscribe', e.target.checked)}
                    />
                    <label
                      htmlFor="autoUnsubscribe"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.autoUnsubscribe ? 'bg-accent' : 'bg-white/20'}`}
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      تتبع إحصائيات الحملات
                    </label>
                    <p className="text-xs text-text-secondary">
                      جمع البيانات حول معدلات الفتح والنقر والتحويل
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 select-none">
                    <input
                      type="checkbox"
                      id="trackCampaignStats"
                      name="trackCampaignStats"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={settings.trackCampaignStats}
                      onChange={(e) => handleChange('trackCampaignStats', e.target.checked)}
                    />
                    <label
                      htmlFor="trackCampaignStats"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.trackCampaignStats ? 'bg-accent' : 'bg-white/20'}`}
                    ></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      استخدام قوائم جهات الاتصال
                    </label>
                    <p className="text-xs text-text-secondary">
                      استخدام قوائم جهات الاتصال من Brevo بدلاً من القوائم المحلية
                    </p>
                  </div>
                  <div className="relative inline-block w-12 h-6 select-none">
                    <input
                      type="checkbox"
                      id="useContactLists"
                      name="useContactLists"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={settings.useContactLists}
                      onChange={(e) => handleChange('useContactLists', e.target.checked)}
                    />
                    <label
                      htmlFor="useContactLists"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.useContactLists ? 'bg-accent' : 'bg-white/20'}`}
                    ></label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Lists */}
        <div className="glass-effect rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary flex items-center">
              <Icon name="Users" size={18} className="mr-2 text-accent" />
              قوائم جهات الاتصال
            </h3>
            <Button variant="text" size="sm" iconName="Plus">
              قائمة جديدة
            </Button>
          </div>
          
          <div className="space-y-4">
            {lists.length > 0 ? (
              <div className="space-y-3">
                {lists.map(list => (
                  <div key={list.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg border border-white/5 hover:border-accent/20 transition-colors duration-200">
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">{list.name}</h4>
                      <p className="text-xs text-text-secondary">
                        {list.count.toLocaleString('ar-SA')} جهة اتصال • آخر تحديث: {list.lastUpdated.toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                        <Icon name="Edit" size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                        <Icon name="UploadCloud" size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-surface/30 rounded-lg border border-white/5">
                <Icon name="Users" size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  لم يتم إنشاء أي قوائم جهات اتصال بعد
                </p>
                <Button variant="primary" size="sm" iconName="Plus" className="mt-3">
                  إنشاء قائمة جديدة
                </Button>
              </div>
            )}
            
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start">
                <Icon name="Info" size={14} className="text-primary mt-0.5 mr-2" />
                <p className="text-xs text-primary">
                  يمكنك استيراد جهات الاتصال من ملف CSV أو مزامنتها من CRM الخاص بك.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Segmentation Rules */}
        <div className="glass-effect rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary flex items-center">
              <Icon name="Filter" size={18} className="mr-2 text-accent" />
              قواعد التقسيم
            </h3>
            <Button variant="text" size="sm" iconName="Plus">
              قاعدة جديدة
            </Button>
          </div>
          
          <div className="space-y-4">
            {segmentation.length > 0 ? (
              <div className="space-y-3">
                {segmentation.map(segment => (
                  <div key={segment.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg border border-white/5 hover:border-accent/20 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${segment.isActive ? 'bg-success' : 'bg-text-muted'} mr-3`}></div>
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{segment.name}</h4>
                        <p className="text-xs text-text-secondary">
                          معيار: {segment.criteria === 'location' ? 'الموقع الجغرافي' : 
                                    segment.criteria === 'age'? 'الفئة العمرية' : 'سجل المشتريات'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                        <Icon name="Edit" size={16} />
                      </button>
                      <button className={`p-2 rounded-lg hover:bg-white/5 ${segment.isActive ? 'text-success' : 'text-text-secondary'}`}>
                        <Icon name={segment.isActive ? 'CheckCircle' : 'Circle'} size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-surface/30 rounded-lg border border-white/5">
                <Icon name="Filter" size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  لم يتم إنشاء أي قواعد تقسيم بعد
                </p>
                <Button variant="primary" size="sm" iconName="Plus" className="mt-3">
                  إنشاء قاعدة جديدة
                </Button>
              </div>
            )}
            
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start">
                <Icon name="Lightbulb" size={14} className="text-accent mt-0.5 mr-2" />
                <p className="text-xs text-accent">
                  تساعد قواعد التقسيم على استهداف جمهور محدد بشكل أفضل وتحسين معدلات التفاعل مع حملاتك البريدية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Triggers */}
        <div className="glass-effect rounded-lg p-6 border border-white/10 col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center">
            <Icon name="Zap" size={18} className="mr-2 text-accent" />
            محفزات الحملات
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface/30 rounded-lg border border-white/5 hover:border-accent/20 transition-colors duration-200">
              <div className="p-3 rounded-full bg-primary/20 w-fit mb-3">
                <Icon name="Clock" size={20} className="text-primary" />
              </div>
              <h4 className="text-base font-medium text-text-primary mb-1">محفزات زمنية</h4>
              <p className="text-sm text-text-secondary mb-4">
                إرسال بريد إلكتروني بناءً على جدول زمني محدد
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">يومي</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">أسبوعي</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">شهري</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">مخصص</span>
              </div>
            </div>
            
            <div className="p-4 bg-surface/30 rounded-lg border border-white/5 hover:border-accent/20 transition-colors duration-200">
              <div className="p-3 rounded-full bg-accent/20 w-fit mb-3">
                <Icon name="Activity" size={20} className="text-accent" />
              </div>
              <h4 className="text-base font-medium text-text-primary mb-1">محفزات السلوك</h4>
              <p className="text-sm text-text-secondary mb-4">
                الرد على أفعال المستخدم مثل النقر أو التسجيل
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">تسجيل</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">نقر</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">شراء</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">هجر السلة</span>
              </div>
            </div>
            
            <div className="p-4 bg-surface/30 rounded-lg border border-white/5 hover:border-accent/20 transition-colors duration-200">
              <div className="p-3 rounded-full bg-success/20 w-fit mb-3">
                <Icon name="GitMerge" size={20} className="text-success" />
              </div>
              <h4 className="text-base font-medium text-text-primary mb-1">محفزات سير العمل</h4>
              <p className="text-sm text-text-secondary mb-4">
                تكامل مع سير العمل الآلي في النظام
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">مرحلة البيع</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">إعادة المشاركة</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">تذكير</span>
                <span className="text-xs px-2 py-1 rounded-full bg-surface/50 text-text-secondary">مخصص</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button variant="primary" iconName="Save" onClick={handleSaveSettings}>
          حفظ إعدادات البريد الجماعي
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

export default BulkEmailSettings;