// src/pages/sales-pipeline-management/components/OpportunityDetailPanel.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const OpportunityDetailPanel = ({ opportunity, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedOpportunity, setEditedOpportunity] = useState(opportunity);

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: 'Eye' },
    { id: 'history', label: 'سجل المحادثات', icon: 'MessageSquare' },
    { id: 'proposal', label: 'العروض', icon: 'FileText' },
    { id: 'actions', label: 'الإجراءات التالية', icon: 'CheckSquare' }
  ];

  const handleSave = () => {
    onUpdate?.(editedOpportunity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedOpportunity(opportunity);
    setIsEditing(false);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-text-muted';
    }
  };

  // Get stage color
  const getStageColor = (stage) => {
    switch (stage) {
      case 'lead': return 'bg-secondary';
      case 'qualified': return 'bg-primary';
      case 'proposal': return 'bg-warning';
      case 'negotiation': return 'bg-accent';
      case 'closed': return 'bg-success';
      default: return 'bg-text-muted';
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-2xl glass-effect border-l border-white/10 z-500 overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="sticky top-0 glass-effect border-b border-white/10 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-heading font-bold text-text-primary">
              {opportunity?.name}
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStageColor(opportunity?.stage)}`}>
              {opportunity?.stage === 'lead' && 'عميل محتمل'}
              {opportunity?.stage === 'qualified' && 'مؤهل'}
              {opportunity?.stage === 'proposal' && 'عرض سعر'}
              {opportunity?.stage === 'negotiation' && 'تفاوض'}
              {opportunity?.stage === 'closed' && 'مغلق'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg glass-hover"
                title="تعديل"
              >
                <Icon name="Edit" size={20} className="text-text-secondary hover:text-accent transition-colors duration-300" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-accent hover:bg-accent-600 text-background px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  حفظ
                </button>
                <button
                  onClick={handleCancel}
                  className="glass-effect border border-white/20 text-text-primary hover:text-accent px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  إلغاء
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg glass-hover"
            >
              <Icon name="X" size={20} className="text-text-secondary hover:text-error transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface rounded-lg p-1">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                activeTab === tab?.id
                  ? 'bg-accent text-background shadow-lg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span className="text-sm">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">قيمة الصفقة</span>
                  <Icon name="DollarSign" size={16} className="text-primary" />
                </div>
                <div className="text-2xl font-heading font-bold text-text-primary">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedOpportunity?.value || 0}
                      onChange={(e) => setEditedOpportunity(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="w-full bg-surface border border-white/20 rounded px-3 py-2 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  ) : (
                    `${(opportunity?.value / 1000).toFixed(0)}K ريال`
                  )}
                </div>
              </div>
              
              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">احتمالية النجاح</span>
                  <Icon name="Target" size={16} className="text-accent" />
                </div>
                <div className="text-2xl font-heading font-bold text-text-primary">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedOpportunity?.probability || 0}
                      onChange={(e) => setEditedOpportunity(prev => ({ ...prev, probability: Number(e.target.value) }))}
                      className="w-full bg-surface border border-white/20 rounded px-3 py-2 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  ) : (
                    `${opportunity?.probability}%`
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="glass-effect border border-white/10 rounded-lg p-4">
              <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Icon name="User" size={16} className="text-primary" />
                <span>معلومات الاتصال</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="User" size={16} className="text-text-muted" />
                  <div>
                    <span className="text-text-secondary text-sm">جهة الاتصال:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOpportunity?.contactPerson || ''}
                        onChange={(e) => setEditedOpportunity(prev => ({ ...prev, contactPerson: e.target.value }))}
                        className="ml-2 bg-surface border border-white/20 rounded px-3 py-1 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    ) : (
                      <span className="ml-2 text-text-primary font-medium">{opportunity?.contactPerson}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" size={16} className="text-text-muted" />
                  <div>
                    <span className="text-text-secondary text-sm">البريد الإلكتروني:</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedOpportunity?.email || ''}
                        onChange={(e) => setEditedOpportunity(prev => ({ ...prev, email: e.target.value }))}
                        className="ml-2 bg-surface border border-white/20 rounded px-3 py-1 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    ) : (
                      <span className="ml-2 text-text-primary font-medium">{opportunity?.email}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" size={16} className="text-text-muted" />
                  <div>
                    <span className="text-text-secondary text-sm">الهاتف:</span>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedOpportunity?.phone || ''}
                        onChange={(e) => setEditedOpportunity(prev => ({ ...prev, phone: e.target.value }))}
                        className="ml-2 bg-surface border border-white/20 rounded px-3 py-1 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    ) : (
                      <span className="ml-2 text-text-primary font-medium">{opportunity?.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Agent */}
            <div className="glass-effect border border-white/10 rounded-lg p-4">
              <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-secondary" />
                <span>العضو المسؤول</span>
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={opportunity?.agentAvatar}
                    alt={opportunity?.assignedAgent}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{opportunity?.assignedAgent}</p>
                  <p className="text-sm text-text-secondary">{opportunity?.lastActivity}</p>
                </div>
              </div>
            </div>

            {/* Priority and Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2 flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning" />
                  <span>الأولوية</span>
                </h4>
                <span className={`font-medium ${getPriorityColor(opportunity?.priority)}`}>
                  {opportunity?.priority === 'high' && 'عالية'}
                  {opportunity?.priority === 'medium' && 'متوسطة'}
                  {opportunity?.priority === 'low' && 'منخفضة'}
                </span>
              </div>
              
              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-2 flex items-center space-x-2">
                  <Icon name="Globe" size={16} className="text-accent" />
                  <span>المصدر</span>
                </h4>
                <span className="text-text-primary font-medium">{opportunity?.source}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="glass-effect border border-white/10 rounded-lg p-4">
              <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Icon name="FileText" size={16} className="text-primary" />
                <span>ملاحظات</span>
              </h3>
              {isEditing ? (
                <textarea
                  value={editedOpportunity?.notes || ''}
                  onChange={(e) => setEditedOpportunity(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-surface border border-white/20 rounded px-3 py-2 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent min-h-[100px] resize-none"
                  placeholder="أضف ملاحظاتك هنا..."
                />
              ) : (
                <p className="text-text-secondary leading-relaxed">
                  {opportunity?.notes || 'لا توجد ملاحظات'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="glass-effect border border-white/10 rounded-lg p-4">
              <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Icon name="Tag" size={16} className="text-accent" />
                <span>العلامات</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-surface border border-white/20 text-text-primary text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-text-primary">
                سجل المحادثات والتفاعلات
              </h3>
              <button className="bg-primary hover:bg-primary-600 text-background px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                <Icon name="Plus" size={16} />
                <span>إضافة تفاعل</span>
              </button>
            </div>
            
            {opportunity?.conversationHistory?.map((interaction, index) => (
              <div key={index} className="glass-effect border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      interaction?.type === 'call' ? 'bg-primary/20 text-primary' :
                      interaction?.type === 'email' ? 'bg-accent/20 text-accent' :
                      interaction?.type === 'meeting'? 'bg-secondary/20 text-secondary' : 'bg-surface text-text-muted'
                    }`}>
                      <Icon 
                        name={
                          interaction?.type === 'call' ? 'Phone' :
                          interaction?.type === 'email' ? 'Mail' :
                          interaction?.type === 'meeting'? 'Users' : 'MessageSquare'
                        } 
                        size={16} 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {interaction?.type === 'call' && 'مكالمة هاتفية'}
                        {interaction?.type === 'email' && 'بريد إلكتروني'}
                        {interaction?.type === 'meeting' && 'اجتماع'}
                      </p>
                      {interaction?.duration && (
                        <p className="text-sm text-text-secondary">المدة: {interaction?.duration}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-text-muted">
                    {interaction?.date?.toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className="text-text-secondary leading-relaxed">{interaction?.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* Proposal Tab */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-text-primary">
                العروض والمقترحات
              </h3>
              <button className="bg-warning hover:bg-warning-dark text-background px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>إنشاء عرض جديد</span>
              </button>
            </div>
            
            <div className="glass-effect border border-white/10 rounded-lg p-6 text-center">
              <Icon name="FileText" size={48} className="text-text-muted mx-auto mb-4" />
              <h4 className="text-lg font-heading font-medium text-text-primary mb-2">
                لم يتم إنشاء عروض بعد
              </h4>
              <p className="text-text-secondary mb-4">
                استخدم الذكاء الاصطناعي لإنشاء عروض مخصصة للعميل
              </p>
              <button className="bg-accent hover:bg-accent-600 text-background px-6 py-3 rounded-lg font-medium transition-all duration-300">
                إنشاء عرض بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        )}

        {/* Next Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-text-primary">
                الإجراءات التالية المقترحة
              </h3>
              <button className="bg-success hover:bg-success-dark text-background px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                <Icon name="Plus" size={16} />
                <span>إضافة إجراء</span>
              </button>
            </div>
            
            {/* AI Recommendations */}
            <div className="glass-effect bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Brain" size={16} className="text-accent" />
                <h4 className="font-medium text-text-primary">توصيات الذكاء الاصطناعي</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="Phone" size={16} className="text-primary" />
                    <span className="text-text-primary">اتصال متابعة خلال 24 ساعة</span>
                  </div>
                  <button className="text-accent hover:text-accent-300 text-sm font-medium">
                    تنفيذ
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="FileText" size={16} className="text-warning" />
                    <span className="text-text-primary">إرسال عرض سعر مفصل</span>
                  </div>
                  <button className="text-accent hover:text-accent-300 text-sm font-medium">
                    تنفيذ
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="Calendar" size={16} className="text-secondary" />
                    <span className="text-text-primary">جدولة اجتماع عرض تقديمي</span>
                  </div>
                  <button className="text-accent hover:text-accent-300 text-sm font-medium">
                    تنفيذ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OpportunityDetailPanel;