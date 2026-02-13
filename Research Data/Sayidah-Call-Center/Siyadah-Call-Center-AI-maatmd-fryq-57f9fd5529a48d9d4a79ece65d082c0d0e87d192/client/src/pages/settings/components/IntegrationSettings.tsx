import React, { useState } from 'react';
import AppIcon from '@/components/AppIcon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface IntegrationSettingsProps {
  onSettingsChange?: () => void;
  onSaveComplete?: () => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onSettingsChange, onSaveComplete }) => {
  const [activeCategory, setActiveCategory] = useState('ai-models');
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const integrationCategories = [
    { id: 'ai-models', label: 'نماذج الذكاء الاصطناعي', icon: 'Brain' },
    { id: 'crm-erp', label: 'أنظمة CRM/ERP', icon: 'Database' },
    { id: 'payment', label: 'طرق الدفع', icon: 'CreditCard' },
    { id: 'communication', label: 'قنوات التواصل', icon: 'MessageSquare' },
    { id: 'analytics', label: 'أدوات التحليل', icon: 'BarChart' }
  ];

  // AI Models category
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

  const analyticsTools = [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'أداة تحليل البيانات الشاملة من جوجل',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['تحليل الزوار', 'التقارير المخصصة', 'تتبع الأهداف']
    },
    {
      id: 'tableau',
      name: 'Tableau',
      description: 'منصة تصور البيانات والتحليلات التفاعلية',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop',
      isConnected: false,
      status: 'available',
      features: ['لوحات تفاعلية', 'تحليل متقدم', 'تقارير آنية']
    }
  ];

  const handleConnect = (integrationId: string) => {
    setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connecting' }));
    onSettingsChange?.();
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connected' }));
      toast({
        title: "تم الاتصال بنجاح",
        description: "تم ربط التكامل بالمنصة بنجاح"
      });
      onSaveComplete?.();
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm('هل أنت متأكد من قطع الاتصال؟')) {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'disconnected' }));
      onSettingsChange?.();
      toast({
        title: "تم قطع الاتصال",
        description: "تم قطع الاتصال مع التكامل"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'connecting': return 'Clock';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  const renderIntegrationCard = (integration: any) => {
    const currentStatus = connectionStatus[integration.id] || (integration.isConnected ? 'active' : 'available');
    
    return (
      <Card key={integration.id} className="glass-effect border border-white/10 p-6 hover:border-accent/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
              <img
                src={integration.logo}
                alt={integration.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2306FFA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
                }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">{integration.name}</h4>
              <p className="text-sm text-text-secondary mt-1">{integration.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <AppIcon 
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
            {integration.features.map((feature: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
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
              <Input 
                type="password" 
                className="flex-1 bg-surface/50 border-white/10"
                placeholder="أدخل مفتاح API الخاص بـ OpenAI"
                defaultValue={currentStatus === 'active' ? '••••••••••••••••••••••••••••••' : ''}
              />
              <Button variant="ghost" size="icon" className="ml-2 text-text-secondary hover:text-accent">
                <AppIcon name="Eye" size={18} />
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-1">
              يمكنك الحصول على مفتاح API من{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" className="text-accent hover:underline">
                هنا
              </a>
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex space-x-2">
            {currentStatus === 'active' && (
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent-300">
                <AppIcon name="Settings" size={14} className="ml-1" />
                إعدادات
              </Button>
            )}
            {currentStatus === 'active' && integration.lastSync && (
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <AppIcon name="RefreshCw" size={14} className="ml-1" />
                مزامنة
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentStatus === 'active' ? (
              <Button
                onClick={() => handleDisconnect(integration.id)}
                variant="destructive"
                size="sm"
              >
                قطع الاتصال
              </Button>
            ) : (
              <Button
                onClick={() => handleConnect(integration.id)}
                disabled={currentStatus === 'connecting'}
                className="bg-accent hover:bg-accent-600 disabled:bg-surface disabled:text-text-muted text-background"
                size="sm"
              >
                {currentStatus === 'connecting' ? (
                  <>
                    <AppIcon name="Loader2" size={14} className="ml-2 animate-spin" />
                    جاري الاتصال...
                  </>
                ) : (
                  <>
                    <AppIcon name="Link" size={14} className="ml-2" />
                    ربط
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const getCurrentIntegrations = () => {
    switch (activeCategory) {
      case 'ai-models':
        return aiModels;
      case 'crm-erp':
        return crmErpSystems;
      case 'payment':
        return paymentMethods;
      case 'communication':
        return communicationChannels;
      case 'analytics':
        return analyticsTools;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Integration Categories */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-text-primary">فئات التكاملات</h3>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="glass-effect border border-white/10 grid w-full grid-cols-5">
            {integrationCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="flex items-center space-x-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
              >
                <AppIcon name={category.icon} size={16} />
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {integrationCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-text-primary">{category.label}</h4>
                <Badge variant="outline" className="text-text-muted">
                  {getCurrentIntegrations().length} متاح
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getCurrentIntegrations().map(renderIntegrationCard)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Integration Summary */}
      <Card className="glass-effect border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">ملخص التكاملات</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 glass-light border border-white/5 rounded-lg">
            <p className="text-2xl font-bold text-success">8</p>
            <p className="text-sm text-text-secondary">تكاملات نشطة</p>
          </div>
          <div className="text-center p-4 glass-light border border-white/5 rounded-lg">
            <p className="text-2xl font-bold text-warning">3</p>
            <p className="text-sm text-text-secondary">في انتظار الربط</p>
          </div>
          <div className="text-center p-4 glass-light border border-white/5 rounded-lg">
            <p className="text-2xl font-bold text-accent">15</p>
            <p className="text-sm text-text-secondary">إجمالي المتاح</p>
          </div>
          <div className="text-center p-4 glass-light border border-white/5 rounded-lg">
            <p className="text-2xl font-bold text-primary">98.5%</p>
            <p className="text-sm text-text-secondary">معدل التشغيل</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
