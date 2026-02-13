// src/pages/settings-configuration/components/BillingSettings.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const BillingSettings = ({ onSettingsChange, onSaveComplete }) => {
  const [activeTab, setActiveTab] = useState('subscription');
  
  const billingTabs = [
    { id: 'subscription', label: 'الاشتراك', icon: 'CreditCard' },
    { id: 'usage', label: 'الاستخدام', icon: 'BarChart3' },
    { id: 'history', label: 'التاريخ', icon: 'FileText' }
  ];

  const currentPlan = {
    name: 'الباقة المتقدمة',
    price: 999,
    currency: 'SAR',
    billingCycle: 'شهري',
    nextBilling: '2024-02-15',
    features: [
      'فريق ذكي غير محدود',
      'تكاملات متقدمة',
      'تحليلات مفصلة',
      'دعم أولوية',
      'تخزين 100 جيجا'
    ],
    limits: {
      aiAgents: 'غير محدود',
      storage: '100 جيجا',
      apiCalls: '100,000 شهرياً',
      users: '50 مستخدم'
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      price: 299,
      description: 'مثالية للشركات الناشئة',
      features: [
        '5 أعضاء فريق ذكي',
        'تكاملات أساسية',
        'دعم بريد إلكتروني',
        'تخزين 10 جيجا'
      ],
      limits: {
        aiAgents: 5,
        storage: '10 جيجا',
        apiCalls: '10,000 شهرياً',
        users: '10 مستخدم'
      },
      popular: false
    },
    {
      id: 'professional',
      name: 'الباقة المتقدمة',
      price: 999,
      description: 'الأفضل للشركات المتنامية',
      features: [
        'فريق ذكي غير محدود',
        'تكاملات متقدمة',
        'تحليلات مفصلة',
        'دعم أولوية',
        'تخزين 100 جيجا'
      ],
      limits: {
        aiAgents: 'غير محدود',
        storage: '100 جيجا',
        apiCalls: '100,000 شهرياً',
        users: '50 مستخدم'
      },
      popular: true,
      current: true
    },
    {
      id: 'enterprise',
      name: 'باقة الشركات',
      price: 2999,
      description: 'حلول متكاملة للشركات الكبيرة',
      features: [
        'كل ميزات الباقة المتقدمة',
        'تخصيص كامل',
        'مدير حساب مخصص',
        'تدريب الفريق',
        'تخزين غير محدود'
      ],
      limits: {
        aiAgents: 'غير محدود',
        storage: 'غير محدود',
        apiCalls: 'غير محدود',
        users: 'غير محدود'
      },
      popular: false
    }
  ];

  const usageData = {
    currentPeriod: {
      start: '2024-01-15',
      end: '2024-02-15'
    },
    metrics: [
      {
        name: 'استدعاءات API',
        used: 45230,
        limit: 100000,
        unit: 'استدعاء',
        icon: 'Zap'
      },
      {
        name: 'التخزين المستخدم',
        used: 23.5,
        limit: 100,
        unit: 'جيجا',
        icon: 'HardDrive'
      },
      {
        name: 'المستخدمين النشطين',
        used: 12,
        limit: 50,
        unit: 'مستخدم',
        icon: 'Users'
      },
      {
        name: 'أعضاء الفريق الذكي',
        used: 8,
        limit: 'unlimited',
        unit: 'عضو',
        icon: 'Bot'
      }
    ]
  };

  const billingHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 999,
      status: 'مدفوع',
      description: 'الباقة المتقدمة - يناير 2024',
      invoiceNumber: 'INV-2024-001',
      paymentMethod: 'مدى ****1234'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 999,
      status: 'مدفوع',
      description: 'الباقة المتقدمة - ديسمبر 2023',
      invoiceNumber: 'INV-2023-012',
      paymentMethod: 'سداد'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 999,
      status: 'مدفوع',
      description: 'الباقة المتقدمة - نوفمبر 2023',
      invoiceNumber: 'INV-2023-011',
      paymentMethod: 'مدى ****1234'
    }
  ];

  const getUsagePercentage = (used, limit) => {
    if (limit === 'unlimited' || limit === 'غير محدود') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'text-success';
    if (percentage < 80) return 'text-warning';
    return 'text-error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مدفوع': return 'text-success';
      case 'معلق': return 'text-warning';
      case 'منتهي': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const renderSubscription = () => (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="space-y-4">
        <h4 className="text-lg font-heading font-semibold text-text-primary">الباقة الحالية</h4>
        
        <div className="glass-effect border border-accent/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h5 className="text-xl font-heading font-bold text-text-primary">{currentPlan.name}</h5>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-2xl font-bold text-accent">{currentPlan.price}</span>
                <span className="text-text-secondary">{currentPlan.currency}/{currentPlan.billingCycle}</span>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                التجديد التالي: {new Date(currentPlan.nextBilling).toLocaleDateString('ar-SA')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
                نشط
              </div>
              <button className="text-accent hover:text-accent-300 text-sm font-medium transition-colors duration-300">
                إدارة الاشتراك
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h6 className="font-medium text-text-primary mb-3">الميزات المتضمنة:</h6>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h6 className="font-medium text-text-primary mb-3">حدود الاستخدام:</h6>
              <div className="space-y-2">
                {Object.entries(currentPlan.limits).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">
                      {key === 'aiAgents' ? 'أعضاء الفريق الذكي' :
                       key === 'storage' ? 'التخزين' :
                       key === 'apiCalls' ? 'استدعاءات API' :
                       key === 'users' ? 'المستخدمين' : key}
                    </span>
                    <span className="text-text-primary text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Available Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-heading font-semibold text-text-primary">الباقات المتاحة</h4>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-sm">الدفع:</span>
            <select className="px-3 py-1 rounded-lg glass-effect border border-white/20 text-text-primary bg-transparent text-sm">
              <option value="monthly" className="bg-surface">شهري</option>
              <option value="yearly" className="bg-surface">سنوي (خصم 20%)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass-effect border rounded-lg p-6 transition-all duration-300 ${
              plan.current ? 'border-accent/50 shadow-glow-accent' :
              plan.popular ? 'border-warning/30' : 'border-white/10 hover:border-accent/30'
            }`}>
              {plan.popular && !plan.current && (
                <div className="bg-warning text-background text-xs font-medium px-3 py-1 rounded-full mb-4 text-center">
                  الأكثر شيوعاً
                </div>
              )}
              
              {plan.current && (
                <div className="bg-accent text-background text-xs font-medium px-3 py-1 rounded-full mb-4 text-center">
                  الباقة الحالية
                </div>
              )}
              
              <div className="text-center mb-6">
                <h5 className="text-lg font-heading font-bold text-text-primary mb-2">{plan.name}</h5>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-accent">{plan.price}</span>
                  <span className="text-text-secondary">ريال/شهر</span>
                </div>
                <p className="text-text-secondary text-sm">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                disabled={plan.current}
                className={`w-full font-medium py-3 rounded-lg transition-all duration-300 ${
                  plan.current 
                    ? 'bg-surface text-text-muted cursor-not-allowed' :'bg-accent hover:bg-accent-600 text-background transform hover:scale-105'
                }`}
              >
                {plan.current ? 'الباقة الحالية' : 'ترقية'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-heading font-semibold text-text-primary">الاستخدام الحالي</h4>
        <p className="text-text-secondary text-sm">
          الفترة: {new Date(usageData.currentPeriod.start).toLocaleDateString('ar-SA')} - 
          {new Date(usageData.currentPeriod.end).toLocaleDateString('ar-SA')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageData.metrics.map((metric) => {
          const percentage = getUsagePercentage(metric.used, metric.limit);
          const isUnlimited = metric.limit === 'unlimited' || metric.limit === 'غير محدود';
          
          return (
            <div key={metric.name} className="glass-effect border border-white/10 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name={metric.icon} size={20} className="text-accent" />
                <h5 className="font-medium text-text-primary">{metric.name}</h5>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-text-primary">
                    {typeof metric.used === 'number' ? metric.used.toLocaleString('ar-SA') : metric.used}
                  </span>
                  <span className="text-text-secondary text-sm">
                    {isUnlimited ? 'غير محدود' : `من ${metric.limit.toLocaleString('ar-SA')}`} {metric.unit}
                  </span>
                </div>
                
                {!isUnlimited && (
                  <>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          percentage < 50 ? 'bg-success' :
                          percentage < 80 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={getUsageColor(percentage)}>
                        {percentage.toFixed(1)}% مستخدم
                      </span>
                      <span className="text-text-muted">
                        {(metric.limit - metric.used).toLocaleString('ar-SA')} متبقي
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Usage Alerts */}
      <div className="glass-effect border border-warning/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-1" />
          <div>
            <h5 className="font-medium text-text-primary mb-2">تنبيهات الاستخدام</h5>
            <p className="text-text-secondary text-sm mb-3">
              سيتم إرسال تنبيه عند الوصول إلى 80% من حد الاستخدام.
            </p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-2 border-white/20 bg-surface/50 text-accent focus:ring-accent/50 focus:ring-2" />
                <span className="text-text-secondary text-sm">تنبيهات البريد الإلكتروني</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-2 border-white/20 bg-surface/50 text-accent focus:ring-accent/50 focus:ring-2" />
                <span className="text-text-secondary text-sm">إشعارات داخل التطبيق</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-heading font-semibold text-text-primary">تاريخ الفواتير</h4>
        <button className="text-accent hover:text-accent-300 font-medium transition-colors duration-300 flex items-center space-x-2">
          <Icon name="Download" size={16} />
          <span>تحميل جميع الفواتير</span>
        </button>
      </div>
      
      <div className="glass-effect border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/50 border-b border-white/10">
              <tr>
                <th className="text-right p-4 text-sm font-medium text-text-secondary">التاريخ</th>
                <th className="text-right p-4 text-sm font-medium text-text-secondary">الوصف</th>
                <th className="text-right p-4 text-sm font-medium text-text-secondary">المبلغ</th>
                <th className="text-center p-4 text-sm font-medium text-text-secondary">الحالة</th>
                <th className="text-right p-4 text-sm font-medium text-text-secondary">طريقة الدفع</th>
                <th className="text-center p-4 text-sm font-medium text-text-secondary">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {new Date(invoice.date).toLocaleDateString('ar-SA')}
                      </p>
                      <p className="text-text-muted text-xs">{invoice.invoiceNumber}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-text-primary text-sm">{invoice.description}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-text-primary">{invoice.amount.toLocaleString('ar-SA')} ريال</p>
                  </td>
                  <td className="text-center p-4">
                    <span className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-text-secondary text-sm">{invoice.paymentMethod}</p>
                  </td>
                  <td className="text-center p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-accent hover:text-accent-300 transition-colors duration-300" title="تحميل الفاتورة">
                        <Icon name="Download" size={16} />
                      </button>
                      <button className="text-text-secondary hover:text-text-primary transition-colors duration-300" title="عرض التفاصيل">
                        <Icon name="Eye" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="glass-effect border border-white/10 rounded-lg p-6">
        <h5 className="font-medium text-text-primary mb-4">طريقة الدفع</h5>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="CreditCard" size={20} className="text-accent" />
            <div>
              <p className="font-medium text-text-primary">بطاقة مدى ****1234</p>
              <p className="text-text-secondary text-sm">تنتهي في 12/26</p>
            </div>
          </div>
          <button className="text-accent hover:text-accent-300 font-medium transition-colors duration-300">
            تغيير
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-surface/50 rounded-lg p-1">
        {billingTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-accent text-background shadow-glow-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'subscription' && renderSubscription()}
        {activeTab === 'usage' && renderUsage()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default BillingSettings;