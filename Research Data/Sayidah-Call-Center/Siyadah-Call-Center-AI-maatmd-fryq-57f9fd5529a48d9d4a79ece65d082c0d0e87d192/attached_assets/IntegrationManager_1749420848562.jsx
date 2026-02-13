// src/pages/workflow-automation-builder/components/IntegrationManager.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const IntegrationManager = ({ workflow }) => {
  const [activeTab, setActiveTab] = useState('systems'); // systems, channels, apis
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);

  // Mock integration data
  const integrations = {
    systems: [
      {
        id: 1,
        name: 'نظام إدارة علاقات العملاء (CRM)',
        type: 'crm',
        provider: 'Salesforce',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000),
        features: ['جهات الاتصال', 'الصفقات', 'المهام', 'التقارير'],
        endpoints: 4,
        usage: 245
      },
      {
        id: 2,
        name: 'نظام تخطيط موارد المؤسسة (ERP)',
        type: 'erp',
        provider: 'SAP',
        status: 'connected',
        lastSync: new Date(Date.now() - 600000),
        features: ['المالية', 'المخزون', 'الموارد البشرية'],
        endpoints: 6,
        usage: 156
      },
      {
        id: 3,
        name: 'نظام إدارة المخزون',
        type: 'inventory',
        provider: 'NetSuite',
        status: 'error',
        lastSync: new Date(Date.now() - 3600000),
        error: 'فشل في المصادقة - يرجى تحديث بيانات الاعتماد',
        features: ['المنتجات', 'المخزون', 'الطلبات'],
        endpoints: 3,
        usage: 89
      }
    ],
    channels: [
      {
        id: 1,
        name: 'البريد الإلكتروني',
        type: 'email',
        provider: 'SendGrid',
        status: 'connected',
        config: {
          smtp_server: 'smtp.sendgrid.net',
          port: 587,
          encryption: 'TLS'
        },
        dailyQuota: 10000,
        dailyUsage: 2347
      },
      {
        id: 2,
        name: 'الرسائل النصية (SMS)',
        type: 'sms',
        provider: 'Twilio',
        status: 'connected',
        config: {
          account_sid: 'AC***************',
          from_number: '+966501234567'
        },
        monthlyQuota: 5000,
        monthlyUsage: 1234
      },
      {
        id: 3,
        name: 'واتساب للأعمال',
        type: 'whatsapp',
        provider: 'WhatsApp Business API',
        status: 'pending',
        config: {
          business_phone: '+966501234567',
          webhook_url: 'https://api.company.com/whatsapp'
        }
      },
      {
        id: 4,
        name: 'سلاك',
        type: 'slack',
        provider: 'Slack',
        status: 'disconnected',
        config: {}
      }
    ],
    apis: [
      {
        id: 1,
        name: 'API خدمة الدفع',
        type: 'payment',
        provider: 'Stripe',
        status: 'connected',
        baseUrl: 'https://api.stripe.com/v1',
        authType: 'API Key',
        rateLimits: '100 requests/minute',
        lastUsed: new Date(Date.now() - 900000)
      },
      {
        id: 2,
        name: 'API التحليلات',
        type: 'analytics',
        provider: 'Google Analytics',
        status: 'connected',
        baseUrl: 'https://analyticsreporting.googleapis.com/v4',
        authType: 'OAuth 2.0',
        rateLimits: '10,000 requests/day',
        lastUsed: new Date(Date.now() - 1800000)
      },
      {
        id: 3,
        name: 'API الترجمة',
        type: 'translation',
        provider: 'Google Translate',
        status: 'error',
        baseUrl: 'https://translation.googleapis.com/language/translate/v2',
        authType: 'API Key',
        error: 'تم تجاوز الحد الأقصى للاستخدام اليومي'
      }
    ]
  };

  const availableIntegrations = [
    {
      name: 'Microsoft Dynamics 365',
      type: 'crm',
      description: 'نظام إدارة علاقات العملاء من مايكروسوفت',
      icon: 'Building2',
      category: 'CRM/ERP'
    },
    {
      name: 'HubSpot',
      type: 'marketing',
      description: 'منصة التسويق والمبيعات الشاملة',
      icon: 'Megaphone',
      category: 'Marketing'
    },
    {
      name: 'Zoom',
      type: 'communication',
      description: 'منصة الاجتماعات والاتصالات المرئية',
      icon: 'Video',
      category: 'Communication'
    },
    {
      name: 'Dropbox',
      type: 'storage',
      description: 'خدمة التخزين السحابي',
      icon: 'Cloud',
      category: 'Storage'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-error';
      case 'pending': return 'text-warning';
      case 'disconnected': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'CheckCircle';
      case 'error': return 'XCircle';
      case 'pending': return 'Clock';
      case 'disconnected': return 'Circle';
      default: return 'Circle';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'crm': return 'Users';
      case 'erp': return 'Building2';
      case 'inventory': return 'Package';
      case 'email': return 'Mail';
      case 'sms': return 'MessageSquare';
      case 'whatsapp': return 'MessageCircle';
      case 'slack': return 'Hash';
      case 'payment': return 'CreditCard';
      case 'analytics': return 'BarChart3';
      case 'translation': return 'Languages';
      default: return 'Link';
    }
  };

  const renderSystemsTab = () => (
    <div className="space-y-6">
      {integrations.systems.map((system) => (
        <div key={system.id} className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Icon name={getTypeIcon(system.type)} size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {system.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {system.provider}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(system.status)} 
                size={20} 
                className={getStatusColor(system.status)}
              />
              <span className={`text-sm ${getStatusColor(system.status)}`}>
                {system.status === 'connected' ? 'متصل' :
                 system.status === 'error' ? 'خطأ' :
                 system.status === 'pending' ? 'في الانتظار' : 'غير متصل'}
              </span>
            </div>
          </div>

          {system.error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-error">
                <Icon name="AlertTriangle" size={14} className="ml-1" />
                {system.error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-sm">
              <span className="text-text-secondary">نقاط النهاية:</span>
              <span className="text-text-primary font-medium ml-1">
                {system.endpoints}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-text-secondary">الاستخدام الشهري:</span>
              <span className="text-text-primary font-medium ml-1">
                {system.usage}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-text-secondary">آخر مزامنة:</span>
              <span className="text-text-primary font-medium ml-1">
                {system.lastSync?.toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-secondary mb-2">
              الميزات المتاحة:
            </h4>
            <div className="flex flex-wrap gap-2">
              {system.features.map((feature, index) => (
                <span key={index} className="px-3 py-1 bg-surface text-text-primary text-sm rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-all duration-300">
              تكوين
            </button>
            <button className="px-4 py-2 glass-effect border border-white/10 text-text-primary hover:text-accent transition-all duration-300">
              اختبار الاتصال
            </button>
            {system.status === 'error' && (
              <button className="px-4 py-2 bg-accent hover:bg-accent-600 text-background rounded-lg transition-all duration-300">
                إعادة الاتصال
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderChannelsTab = () => (
    <div className="space-y-6">
      {integrations.channels.map((channel) => (
        <div key={channel.id} className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Icon name={getTypeIcon(channel.type)} size={24} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {channel.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {channel.provider}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(channel.status)} 
                size={20} 
                className={getStatusColor(channel.status)}
              />
              <span className={`text-sm ${getStatusColor(channel.status)}`}>
                {channel.status === 'connected' ? 'متصل' :
                 channel.status === 'pending' ? 'في الانتظار' : 'غير متصل'}
              </span>
            </div>
          </div>

          {/* Usage Statistics */}
          {(channel.dailyQuota || channel.monthlyQuota) && (
            <div className="bg-surface/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                إحصائيات الاستخدام
              </h4>
              {channel.dailyQuota && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">الاستخدام اليومي</span>
                    <span className="text-text-primary">
                      {channel.dailyUsage?.toLocaleString('ar-SA')} / {channel.dailyQuota?.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(channel.dailyUsage / channel.dailyQuota) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {channel.monthlyQuota && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">الاستخدام الشهري</span>
                    <span className="text-text-primary">
                      {channel.monthlyUsage?.toLocaleString('ar-SA')} / {channel.monthlyQuota?.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(channel.monthlyUsage / channel.monthlyQuota) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuration Preview */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-secondary mb-2">
              الإعدادات:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(channel.config).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-text-secondary capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="text-text-primary font-mono">
                    {typeof value === 'string' && value.includes('*') ? value : 
                     typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : 
                     String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-secondary hover:bg-secondary-600 text-white rounded-lg transition-all duration-300">
              تكوين
            </button>
            <button className="px-4 py-2 glass-effect border border-white/10 text-text-primary hover:text-accent transition-all duration-300">
              اختبار الإرسال
            </button>
            {channel.status === 'disconnected' && (
              <button className="px-4 py-2 bg-accent hover:bg-accent-600 text-background rounded-lg transition-all duration-300">
                الاتصال
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAPIsTab = () => (
    <div className="space-y-6">
      {integrations.apis.map((api) => (
        <div key={api.id} className="glass-effect border border-white/10 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Icon name={getTypeIcon(api.type)} size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {api.name}
                </h3>
                <p className="text-sm text-text-secondary font-mono">
                  {api.baseUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Icon 
                name={getStatusIcon(api.status)} 
                size={20} 
                className={getStatusColor(api.status)}
              />
              <span className={`text-sm ${getStatusColor(api.status)}`}>
                {api.status === 'connected' ? 'متصل' : 'خطأ'}
              </span>
            </div>
          </div>

          {api.error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-error">
                <Icon name="AlertTriangle" size={14} className="ml-1" />
                {api.error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-text-secondary">نوع المصادقة:</span>
              <span className="text-text-primary font-medium ml-1">
                {api.authType}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">حدود المعدل:</span>
              <span className="text-text-primary font-medium ml-1">
                {api.rateLimits}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">المزود:</span>
              <span className="text-text-primary font-medium ml-1">
                {api.provider}
              </span>
            </div>
            <div>
              <span className="text-text-secondary">آخر استخدام:</span>
              <span className="text-text-primary font-medium ml-1">
                {api.lastUsed?.toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-accent hover:bg-accent-600 text-background rounded-lg transition-all duration-300">
              تكوين
            </button>
            <button className="px-4 py-2 glass-effect border border-white/10 text-text-primary hover:text-accent transition-all duration-300">
              اختبار API
            </button>
            <button className="px-4 py-2 glass-effect border border-white/10 text-text-primary hover:text-accent transition-all duration-300">
              عرض الوثائق
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'systems', label: 'الأنظمة الخارجية', icon: 'Building2' },
    { id: 'channels', label: 'قنوات الاتصال', icon: 'MessageSquare' },
    { id: 'apis', label: 'واجهات برمجة التطبيقات', icon: 'Code' }
  ];

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            إدارة التكامل
          </h2>
          <p className="text-text-secondary">
            ربط سير العمل بالأنظمة الخارجية وقنوات الاتصال
          </p>
        </div>

        <button
          onClick={() => setIsAddingIntegration(true)}
          className="bg-accent hover:bg-accent-600 text-background font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <Icon name="Plus" size={20} />
          <span>إضافة تكامل</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-accent/20 text-accent border border-accent/30' :'text-text-secondary hover:text-text-primary glass-hover'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {activeTab === 'systems' && renderSystemsTab()}
        {activeTab === 'channels' && renderChannelsTab()}
        {activeTab === 'apis' && renderAPIsTab()}
      </div>

      {/* Add Integration Modal */}
      {isAddingIntegration && (
        <div className="fixed inset-0 z-500 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl glass-effect rounded-lg border border-white/20">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text-primary">
                  إضافة تكامل جديد
                </h3>
                <button
                  onClick={() => setIsAddingIntegration(false)}
                  className="p-2 rounded-lg glass-hover text-text-secondary hover:text-text-primary"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableIntegrations.map((integration, index) => (
                  <div
                    key={index}
                    className="p-4 glass-effect border border-white/10 rounded-lg cursor-pointer transition-all duration-300 hover:border-accent/30 hover:shadow-glow-accent/20 group"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-all duration-300">
                        <Icon name={integration.icon} size={20} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary group-hover:text-accent transition-colors duration-300">
                          {integration.name}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {integration.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {integration.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsAddingIntegration(false)}
                  className="flex-1 glass-effect border border-white/10 text-text-primary hover:text-accent font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  إلغاء
                </button>
                <button className="flex-1 bg-accent hover:bg-accent-600 text-background font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationManager;