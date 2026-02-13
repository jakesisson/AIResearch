// src/pages/email-integration-setup/components/EmailTemplateManager.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const EmailTemplateManager = ({ isConnected, apiKey, user_name, company_name, login_link }) => {
  const [templates, setTemplates] = useState([
  {
    id: 1,
    name: 'ترحيب بالعملاء الجدد',
    subject: 'مرحبًا بك في خدماتنا',
    type: 'transactional',
    lastModified: new Date(2023, 10, 15),
    previewImage: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=300&h=200',
    variables: ['{{user_name}}', '{{company_name}}', '{{login_link}}']
  },
  {
    id: 2,
    name: 'تأكيد الطلب',
    subject: 'تم استلام طلبك بنجاح',
    type: 'transactional',
    lastModified: new Date(2023, 11, 5),
    previewImage: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
    variables: ['{{order_number}}', '{{order_items}}', '{{delivery_date}}']
  },
  {
    id: 3,
    name: 'النشرة الشهرية',
    subject: 'أحدث الأخبار والعروض لشهر {{month}}',
    type: 'marketing',
    lastModified: new Date(2023, 9, 28),
    previewImage: 'https://images.pixabay.com/photo/2018/03/10/12/00/paper-3213924_1280.jpg?auto=compress&cs=tinysrgb&w=300&h=200',
    variables: ['{{month}}', '{{featured_products}}', '{{special_offer}}']
  }]
  );
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      setTemplates(templates.filter((t) => t.id !== templateId));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'transactional':return 'ShoppingCart';
      case 'marketing':return 'Megaphone';
      default:return 'Mail';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'transactional':return 'إجرائي';
      case 'marketing':return 'تسويقي';
      default:return 'عام';
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Icon name="Lock" size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          يرجى الاتصال بخدمة البريد أولاً
        </h3>
        <p className="text-text-secondary mb-6">
          قم بإعداد الاتصال بخدمة Brevo من تبويب التكوين الأساسي للوصول إلى إدارة القوالب
        </p>
        <Button variant="primary" iconName="ArrowLeft">
          العودة إلى التكوين
        </Button>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-text-primary">قوالب البريد الإلكتروني</h2>
          <p className="text-text-secondary">إدارة قوالب البريد الإلكتروني المستخدمة في سير العمل</p>
        </div>
        <Button
          variant="primary"
          iconName="Plus"
          onClick={() => setShowTemplateModal(true)}>

          قالب جديد
        </Button>
      </div>

      {/* Template Categories */}
      <div className="flex space-x-2 border-b border-white/10 pb-2">
        <button className="px-4 py-2 text-sm rounded-lg bg-accent text-background font-medium">
          الكل
        </button>
        <button className="px-4 py-2 text-sm rounded-lg hover:bg-surface/50 text-text-secondary font-medium">
          إجرائي
        </button>
        <button className="px-4 py-2 text-sm rounded-lg hover:bg-surface/50 text-text-secondary font-medium">
          تسويقي
        </button>
        <button className="px-4 py-2 text-sm rounded-lg hover:bg-surface/50 text-text-secondary font-medium">
          إشعارات
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) =>
        <div key={template.id} className="glass-effect rounded-lg border border-white/10 overflow-hidden group">
            <div className="relative h-40 overflow-hidden">
              <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface/80 text-white inline-flex items-center">
                    <Icon name={getTypeIcon(template.type)} size={12} className="mr-1" />
                    {getTypeLabel(template.type)}
                  </span>
                </div>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300">
                <button
                onClick={() => handleSelectTemplate(template)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200">

                  <Icon name="Edit" size={16} />
                </button>
                <button
                onClick={() => setPreviewMode(true)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200">

                  <Icon name="Eye" size={16} />
                </button>
                <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="p-2 rounded-full bg-error/70 hover:bg-error text-white transition-colors duration-200">

                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-text-primary truncate">{template.name}</h3>
              <p className="text-sm text-text-secondary truncate mt-1">{template.subject}</p>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-text-muted">
                  آخر تعديل: {template.lastModified.toLocaleDateString('ar-SA')}
                </span>
                <div className="flex -space-x-2">
                  {template.variables.slice(0, 3).map((variable, index) =>
                <span
                  key={index}
                  className="w-6 h-6 rounded-full bg-accent/20 border border-background flex items-center justify-center text-xs text-accent tooltip"
                  data-tooltip={variable}>

                      {`{${index + 1}}`}
                    </span>
                )}
                  {template.variables.length > 3 &&
                <span className="w-6 h-6 rounded-full bg-surface border border-background flex items-center justify-center text-xs text-text-secondary">
                      +{template.variables.length - 3}
                    </span>
                }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Template Card */}
        <div
          onClick={() => setShowTemplateModal(true)}
          className="glass-effect rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center p-6 h-full cursor-pointer hover:border-accent/50 transition-colors duration-300 min-h-[300px]">

          <div className="p-4 rounded-full bg-accent/10 mb-4">
            <Icon name="Plus" size={24} className="text-accent" />
          </div>
          <h3 className="font-medium text-text-primary">إنشاء قالب جديد</h3>
          <p className="text-sm text-text-secondary text-center mt-2">
            قم بإنشاء قالب بريد إلكتروني جديد للاستخدام في سير العمل
          </p>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateModal &&
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-glow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-medium text-text-primary">
                {selectedTemplate ? 'تعديل قالب' : 'إنشاء قالب جديد'}
              </h3>
              <button
              onClick={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
              }}
              className="p-2 rounded-lg hover:bg-white/5 text-text-secondary">

                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Template Editor Form - Just a placeholder for the actual editor */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary">اسم القالب</label>
                    <input
                    type="text"
                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="أدخل اسم القالب"
                    defaultValue={selectedTemplate?.name || ''} />

                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-primary">موضوع البريد الإلكتروني</label>
                    <input
                    type="text"
                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="موضوع البريد الإلكتروني"
                    defaultValue={selectedTemplate?.subject || ''} />

                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary">نوع القالب</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                      type="radio"
                      name="templateType"
                      defaultChecked={!selectedTemplate || selectedTemplate?.type === 'transactional'}
                      className="w-4 h-4 text-accent focus:ring-accent" />

                      <span className="text-text-primary">إجرائي</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                      type="radio"
                      name="templateType"
                      defaultChecked={selectedTemplate?.type === 'marketing'}
                      className="w-4 h-4 text-accent focus:ring-accent" />

                      <span className="text-text-primary">تسويقي</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary">محتوى القالب</label>
                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <div className="bg-background p-3 border-b border-white/10 flex items-center space-x-2">
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Bold" size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Italic" size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Link" size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Image" size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="List" size={16} />
                      </button>
                      <div className="ml-2 h-5 border-l border-white/10"></div>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Code" size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded text-text-secondary">
                        <Icon name="Braces" size={16} />
                      </button>
                    </div>
                    <div className="h-80 bg-background p-4">
                      <div className="glass-effect h-full border border-white/10 rounded-lg p-4" dir="rtl">
                        <p className="text-text-primary">مرحبًا {{ user_name }}،</p>
                        <br />
                        <p className="text-text-primary">نشكرك على انضمامك إلى {{ company_name }}. نحن سعداء جدًا بانضمامك إلى مجتمعنا!</p>
                        <br />
                        <p className="text-text-primary">يمكنك الوصول إلى حسابك من خلال الرابط التالي:</p>
                        <p className="text-accent">{{ login_link }}</p>
                        <br />
                        <p className="text-text-primary">إذا كان لديك أي أسئلة، فلا تتردد في الرد على هذا البريد الإلكتروني.</p>
                        <br />
                        <p className="text-text-primary">مع خالص التحيات،</p>
                        <p className="text-text-primary">فريق {{ company_name }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary">المتغيرات المتاحة</label>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTemplate?.variables || ['{{user_name}}', '{{company_name}}', '{{login_link}}']).map((variable, index) =>
                  <div key={index} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm flex items-center">
                        <span>{variable}</span>
                        <button className="ml-2 hover:text-error">
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                  )}
                    <button className="bg-surface/50 text-text-secondary px-3 py-1 rounded-full text-sm flex items-center hover:bg-surface">
                      <Icon name="Plus" size={14} className="mr-1" />
                      <span>إضافة متغير</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <Button
              variant="text"
              iconName="X"
              onClick={() => {
                setShowTemplateModal(false);
                setSelectedTemplate(null);
              }}>

                إلغاء
              </Button>
              <div className="flex space-x-3">
                <Button variant="secondary" iconName="Eye">
                  معاينة
                </Button>
                <Button variant="primary" iconName="Save">
                  {selectedTemplate ? 'حفظ التغييرات' : 'إنشاء القالب'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Preview Mode Modal */}
      {previewMode &&
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl overflow-hidden">
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setPreviewMode(false)} className="text-gray-500 hover:text-gray-700">
                    <Icon name="X" size={20} />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg" dir="rtl">
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">من: شركة المستقبل &lt;no-reply@future-company.com&gt;</p>
                      <p className="text-sm text-gray-500">إلى: عميل جديد &lt;customer@example.com&gt;</p>
                    </div>
                    <p className="text-sm text-gray-500">18 ديسمبر 2023، 10:42 ص</p>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-2">مرحبًا بك في خدماتنا</h2>
                </div>
                
                <div className="text-gray-800">
                  <p className="mb-4">مرحبًا أحمد،</p>
                  <p className="mb-4">نشكرك على انضمامك إلى شركة المستقبل. نحن سعداء جدًا بانضمامك إلى مجتمعنا!</p>
                  <p className="mb-2">يمكنك الوصول إلى حسابك من خلال الرابط التالي:</p>
                  <p className="mb-4 text-blue-600 underline">https://future-company.com/login</p>
                  <p className="mb-4">إذا كان لديك أي أسئلة، فلا تتردد في الرد على هذا البريد الإلكتروني.</p>
                  <p className="mb-1">مع خالص التحيات،</p>
                  <p className="font-semibold">فريق شركة المستقبل</p>
                  
                  <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">©️ 2023 شركة المستقبل. جميع الحقوق محفوظة.</p>
                    <p className="text-xs text-gray-500 mt-1">طريق الملك فهد، الرياض، المملكة العربية السعودية</p>
                    <div className="flex justify-center space-x-4 mt-2">
                      <a href="#" className="text-blue-500 hover:text-blue-700">
                        <Icon name="Twitter" size={16} />
                      </a>
                      <a href="#" className="text-blue-500 hover:text-blue-700">
                        <Icon name="Linkedin" size={16} />
                      </a>
                      <a href="#" className="text-blue-500 hover:text-blue-700">
                        <Icon name="Facebook" size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end">
              <Button
              variant="primary"
              iconName="X"
              onClick={() => setPreviewMode(false)}>

                إغلاق المعاينة
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default EmailTemplateManager;