// src/pages/settings-configuration/components/IntegrationSettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const IntegrationSettings = ({ onSettingsChange, onSaveComplete }) => {
  const [activeCategory, setActiveCategory] = useState('ai-models');
  const [connectionStatus, setConnectionStatus] = useState({});
  
  const integrationCategories = [
    { id: 'ai-models', label: 'نماذج الذكاء الاصطناعي', icon: 'Brain' },
    { id: 'crm-erp', label: 'أنظمة CRM/ERP', icon: 'Database' },
    { id: 'payment', label: 'طرق الدفع', icon: 'CreditCard' },
    { id: 'communication', label: 'قنوات التواصل', icon: 'MessageSquare' },
    { id: 'analytics', label: 'أدوات التحليل', icon: 'BarChart' }
  ];

  // New AI Models category
  const aiModels = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'منصة الذكاء الاصطناعي الرائدة مع نماذج GPT-4o وDALL-E',
      logo: 'https://images.unsplash.com/photo-1679922985026-efa40c8f7343?w=64&h=64&fit=crop',
      isConnected: true,
      status: 'active',
      lastSync: new Date().toISOString(),
      features: ['GPT-4o', 'DALL-E 3', 'Whisper', 'Embeddings']
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'نماذج Claude للذكاء الاصطناعي المتطورة والآمنة',
      logo: 'https://images.unsplash.com/photo-1626760933955-0b466e138aeb?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku']
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      description: 'منصة مفتوحة للنماذج اللغوية ومعالجة الصور',
      logo: 'https://images.pexels.com/photos/256502/pexels-photo-256502.jpeg?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['Llama 3', 'Mistral', 'SDXL', 'Transformers']
    }
  ];

  const crmErpSystems = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'نظام إدارة علاقات العملاء الرائد عالمياً',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop',
      isConnected: true,
      status: 'active',
      lastSync: '2024-01-15T10:30:00Z',
      features: ['جهات الاتصال', 'الفرص', 'التقارير']
    },
    {
      id: 'dynamics',
      name: 'Microsoft Dynamics',
      description: 'حل متكامل لإدارة الأعمال من مايكروسوفت',
      logo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['ERP', 'CRM', 'تحليلات الأعمال']
    },
    {
      id: 'odoo',
      name: 'Odoo ERP',
      description: 'نظام إدارة موارد المؤسسات مفتوح المصدر',
      logo: 'https://images.pixabay.com/photo/2017/06/10/07/18/list-2389219_150.jpg',
      isConnected: false,
      status: 'available',
      features: ['المحاسبة', 'المخزون', 'المبيعات']
    }
  ];

  const paymentMethods = [
    {
      id: 'sadad',
      name: 'سداد',
      description: 'نظام المدفوعات الوطني السعودي',
      logo: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?w=64&h=64&fit=crop',
      isConnected: true,
      status: 'active',
      currency: 'SAR',
      features: ['التحويل الفوري', 'فواتير مؤسسية', 'دفع بالكود']
    },
    {
      id: 'mada',
      name: 'مدى',
      description: 'شبكة المدفوعات الإلكترونية السعودية',
      logo: 'https://images.pixabay.com/photo/2016/10/10/14/13/credit-card-1730085_150.jpg',
      isConnected: true,
      status: 'active',
      currency: 'SAR',
      features: ['بطاقات الخصم', 'POS', 'التجارة الإلكترونية']
    },
    {
      id: 'stcpay',
      name: 'STC Pay',
      description: 'محفظة الدفع الرقمية من stc',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      currency: 'SAR',
      features: ['تحويل فوري', 'دفع بـ QR', 'فواتير']
    }
  ];

  const communicationChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'منصة المراسلة الأكثر شيوعاً في السعودية',
      logo: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=64&h=64&fit=crop',
      isConnected: true,
      status: 'active',
      features: ['رسائل آلية', 'كتالوج المنتجات', 'خدمة العملاء']
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'منصة مراسلة آمنة وسريعة',
      logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['بوتات ذكية', 'قنوات بث', 'مجموعات']
    },
    {
      id: 'email',
      name: 'البريد الإلكتروني',
      description: 'تكامل مع خدمات البريد الإلكتروني',
      logo: 'https://images.pixabay.com/photo/2016/12/10/16/57/mail-1899189_150.jpg',
      isConnected: true,
      status: 'active',
      features: ['SMTP/IMAP', 'قوالب الرسائل', 'التتبع']
    }
  ];

  const handleConnect = (integrationId) => {
    setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connecting' }));
    onSettingsChange?.();
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connected' }));
    }, 2000);
  };

  const handleDisconnect = (integrationId) => {
    if (confirm('هل أنت متأكد من قطع الاتصال؟')) {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'disconnected' }));
      onSettingsChange?.();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'connecting': return 'Clock';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  const renderIntegrationCard = (integration, type) => {
    const currentStatus = connectionStatus[integration.id] || (integration.isConnected ? 'active' : 'available');
    
    return (
      <div key={integration.id} className="glass-effect border border-white/10 rounded-lg p-6 hover:border-accent/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
              <img
                src={integration.logo}
                alt={integration.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2306FFA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
                }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">{integration.name}</h4>
              <p className="text-sm text-text-secondary mt-1">{integration.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon 
              name={getStatusIcon(currentStatus)} 
              size={16} 
              className={getStatusColor(currentStatus)} 
            />
            <span className={`text-sm font-medium ${getStatusColor(currentStatus)}`}>
              {currentStatus === 'active' ? 'متصل' :
               currentStatus === 'connecting' ? 'جاري الاتصال...' :
               currentStatus === 'error' ? 'خطأ' : 'غير متصل'}
            </span>
          </div>
        </div>
        
        {/* Features */}
        <div className="mb-4">
          <p className="text-sm font-medium text-text-secondary mb-2">الميزات:</p>
          <div className="flex flex-wrap gap-2">
            {integration.features.map((feature, index) => (
              <span key={index} className="text-xs bg-surface px-2 py-1 rounded text-text-secondary">
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        {/* Additional Info */}
        {integration.currency && (
          <div className="mb-4">
            <p className="text-sm text-text-secondary">العملة: <span className="font-medium text-accent">{integration.currency}</span></p>
          </div>
        )}
        
        {integration.lastSync && currentStatus === 'active' && (
          <div className="mb-4">
            <p className="text-sm text-text-secondary">
              آخر مزامنة: <span className="font-medium">{new Date(integration.lastSync).toLocaleString('ar-SA')}</span>
            </p>
          </div>
        )}
        
        {/* API Key Input for OpenAI */}
        {integration.id === 'openai' && (
          <div className="mb-4 pt-3 border-t border-white/10">
            <label className="block text-sm font-medium text-text-secondary mb-2">مفتاح API:</label>
            <div className="flex items-center">
              <input 
                type="password" 
                className="flex-1 px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300"
                placeholder="أدخل مفتاح API الخاص بـ OpenAI"
                value={currentStatus === 'active' ? '••••••••••••••••••••••••••••••' : ''}
                onChange={() => {}}
              />
              <button className="ml-2 p-2 text-text-secondary hover:text-accent transition-colors duration-300">
                <Icon name="Eye" size={18} />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">يمكنك الحصول على مفتاح API من <a href="https://platform.openai.com/api-keys" target="_blank" className="text-accent hover:underline">هنا</a></p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex space-x-2">
            {currentStatus === 'active' && (
              <button className="text-accent hover:text-accent-300 text-sm font-medium transition-colors duration-300 flex items-center space-x-1">
                <Icon name="Settings" size={14} />
                <span>إعدادات</span>
              </button>
            )}
            {currentStatus === 'active' && integration.lastSync && (
              <button className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-300 flex items-center space-x-1">
                <Icon name="RefreshCw" size={14} />
                <span>مزامنة</span>
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentStatus === 'active' ? (
              <button
                onClick={() => handleDisconnect(integration.id)}
                className="bg-error hover:bg-error-dark text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 text-sm"
              >
                قطع الاتصال
              </button>
            ) : (
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={currentStatus === 'connecting'}
                className="bg-accent hover:bg-accent-600 disabled:bg-surface disabled:text-text-muted text-background font-medium px-4 py-2 rounded-lg transition-all duration-300 text-sm flex items-center space-x-2"
              >
                {currentStatus === 'connecting' ? (
                  <>
                    <Icon name="Loader2" size={14} className="animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={14} />
                    <span>اتصال</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getCurrentIntegrations = () => {
    switch (activeCategory) {
      case 'ai-models': return aiModels;
      case 'crm-erp': return crmErpSystems;
      case 'payment': return paymentMethods;
      case 'communication': return communicationChannels;
      case 'analytics': return [];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex space-x-1 bg-surface/50 rounded-lg p-1">
        {integrationCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-accent text-background shadow-glow-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Icon name={category.icon} size={16} />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-heading font-semibold text-text-primary">
            {integrationCategories.find(cat => cat.id === activeCategory)?.label}
          </h4>
          <button className="text-accent hover:text-accent-300 text-sm font-medium transition-colors duration-300 flex items-center space-x-2">
            <Icon name="Plus" size={16} />
            <span>إضافة تكامل جديد</span>
          </button>
        </div>
        
        {getCurrentIntegrations().length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getCurrentIntegrations().map((integration) => renderIntegrationCard(integration, activeCategory))}
          </div>
        ) : (
          <div className="glass-effect border border-white/10 rounded-lg p-12 text-center">
            <Icon name="Puzzle" size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium text-text-primary mb-2">
              لا توجد تكاملات متاحة
            </h3>
            <p className="text-text-secondary">
              سيتم إضافة المزيد من التكاملات قريباً
            </p>
          </div>
        )}
      </div>
      
      {/* Authentication Status Panel */}
      <div className="glass-effect border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-heading font-semibold text-text-primary mb-4">حالة المصادقة</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
            <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success mb-1">متصل</p>
            <p className="text-xs text-text-secondary">{getCurrentIntegrations().filter(i => i.isConnected).length} خدمة</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
            <Icon name="Clock" size={24} className="text-warning mx-auto mb-2" />
            <p className="text-sm font-medium text-warning mb-1">قيد الإعداد</p>
            <p className="text-xs text-text-secondary">{Object.values(connectionStatus).filter(s => s === 'connecting').length} خدمة</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-text-muted/10 border border-text-muted/20">
            <Icon name="Circle" size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-sm font-medium text-text-muted mb-1">متاح</p>
            <p className="text-xs text-text-secondary">{getCurrentIntegrations().filter(i => !i.isConnected).length} خدمة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;