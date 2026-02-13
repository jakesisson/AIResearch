// src/pages/workflow-automation-builder/components/PropertiesPanel.jsx
import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const PropertiesPanel = ({ selectedNode, onNodeUpdate, workflow, onWorkflowUpdate }) => {
  const [localConfig, setLocalConfig] = useState({});
  const [activeSection, setActiveSection] = useState('general');

  // Arabic message templates
  const messageTemplates = {
    welcome: 'مرحباً بك! نحن سعداء لانضمامك إلينا.',
    followUp: 'نود متابعة طلبك والتأكد من رضاك عن خدماتنا.',
    reminder: 'تذكير: لديك مهمة تحتاج إلى اهتمامك.',
    confirmation: 'تم تأكيد طلبك بنجاح. ستتلقى تحديثات قريباً.',
    escalation: 'تم تصعيد طلبك إلى المستوى التالي للمراجعة.',
    completion: 'تهانينا! تم إكمال العملية بنجاح.'
  };

  // Condition operators
  const conditionOperators = [
    { value: 'equals', label: 'يساوي' },
    { value: 'not_equals', label: 'لا يساوي' },
    { value: 'greater_than', label: 'أكبر من' },
    { value: 'less_than', label: 'أصغر من' },
    { value: 'contains', label: 'يحتوي على' },
    { value: 'starts_with', label: 'يبدأ بـ' },
    { value: 'ends_with', label: 'ينتهي بـ' },
    { value: 'is_empty', label: 'فارغ' },
    { value: 'is_not_empty', label: 'غير فارغ' }
  ];

  // Time units
  const timeUnits = [
    { value: 'minutes', label: 'دقائق' },
    { value: 'hours', label: 'ساعات' },
    { value: 'days', label: 'أيام' },
    { value: 'weeks', label: 'أسابيع' }
  ];

  useEffect(() => {
    if (selectedNode) {
      setLocalConfig(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    
    if (selectedNode) {
      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          config: newConfig
        }
      };
      onNodeUpdate(updatedNode);
    }
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          نوع المشغل
        </label>
        <select
          value={localConfig.triggerType || 'manual'}
          onChange={(e) => handleConfigChange('triggerType', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="manual">يدوي</option>
          <option value="form_submission">تقديم نموذج</option>
          <option value="email_received">استقبال بريد إلكتروني</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">مجدول</option>
          <option value="database_change">تغيير في قاعدة البيانات</option>
        </select>
      </div>

      {localConfig.triggerType === 'schedule' && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            جدولة التشغيل
          </label>
          <input
            type="text"
            placeholder="0 9 * * MON-FRI (كل يوم عمل في 9 صباحاً)"
            value={localConfig.schedule || ''}
            onChange={(e) => handleConfigChange('schedule', e.target.value)}
            className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          وصف المشغل
        </label>
        <textarea
          value={localConfig.description || ''}
          onChange={(e) => handleConfigChange('description', e.target.value)}
          placeholder="وصف تفصيلي لما يحدث عند تشغيل هذا المشغل..."
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 h-24 resize-none"
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          المتغير المراد فحصه
        </label>
        <input
          type="text"
          placeholder="customer.status"
          value={localConfig.variable || ''}
          onChange={(e) => handleConfigChange('variable', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          العامل
        </label>
        <select
          value={localConfig.operator || 'equals'}
          onChange={(e) => handleConfigChange('operator', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {conditionOperators.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          القيمة المتوقعة
        </label>
        <input
          type="text"
          placeholder="القيمة للمقارنة"
          value={localConfig.expectedValue || ''}
          onChange={(e) => handleConfigChange('expectedValue', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={localConfig.caseSensitive || false}
          onChange={(e) => handleConfigChange('caseSensitive', e.target.checked)}
          className="w-4 h-4 text-accent bg-surface border-white/20 rounded focus:ring-accent focus:ring-2"
        />
        <label htmlFor="caseSensitive" className="text-sm text-text-secondary">
          حساس للأحرف الكبيرة والصغيرة
        </label>
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          نوع الإجراء
        </label>
        <select
          value={localConfig.actionType || 'email'}
          onChange={(e) => handleConfigChange('actionType', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="email">إرسال بريد إلكتروني</option>
          <option value="sms">إرسال رسالة نصية</option>
          <option value="webhook">استدعاء Webhook</option>
          <option value="database">تحديث قاعدة البيانات</option>
          <option value="notification">إرسال إشعار</option>
          <option value="api_call">استدعاء API</option>
        </select>
      </div>

      {(localConfig.actionType === 'email' || localConfig.actionType === 'sms') && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            قالب الرسالة
          </label>
          <select
            value={localConfig.messageTemplate || ''}
            onChange={(e) => handleConfigChange('messageTemplate', e.target.value)}
            className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 mb-2"
          >
            <option value="">اختر قالباً...</option>
            {Object.entries(messageTemplates).map(([key, value]) => (
              <option key={key} value={key}>{value.substring(0, 30)}...</option>
            ))}
          </select>
          <textarea
            value={localConfig.customMessage || (localConfig.messageTemplate ? messageTemplates[localConfig.messageTemplate] : '')}
            onChange={(e) => handleConfigChange('customMessage', e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 h-32 resize-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          المستقبل
        </label>
        <input
          type="text"
          placeholder="البريد الإلكتروني أو رقم الهاتف"
          value={localConfig.recipient || ''}
          onChange={(e) => handleConfigChange('recipient', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>
    </div>
  );

  const renderDelayConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            المدة
          </label>
          <input
            type="number"
            min="1"
            value={localConfig.duration || ''}
            onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
            className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            الوحدة
          </label>
          <select
            value={localConfig.timeUnit || 'minutes'}
            onChange={(e) => handleConfigChange('timeUnit', e.target.value)}
            className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {timeUnits.map((unit) => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          سبب التأخير
        </label>
        <input
          type="text"
          placeholder="وصف سبب فترة الانتظار"
          value={localConfig.reason || ''}
          onChange={(e) => handleConfigChange('reason', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>
    </div>
  );

  const renderAIAgentConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          نوع المهمة
        </label>
        <select
          value={localConfig.taskType || 'analysis'}
          onChange={(e) => handleConfigChange('taskType', e.target.value)}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="analysis">تحليل البيانات</option>
          <option value="classification">تصنيف</option>
          <option value="recommendation">توصيات</option>
          <option value="prediction">تنبؤ</option>
          <option value="content_generation">إنتاج المحتوى</option>
          <option value="decision_making">اتخاذ قرار</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          تعليمات المهمة
        </label>
        <textarea
          value={localConfig.instructions || ''}
          onChange={(e) => handleConfigChange('instructions', e.target.value)}
          placeholder="تعليمات مفصلة للوكيل الذكي حول كيفية تنفيذ المهمة..."
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 h-32 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          مستوى الثقة المطلوب (%)
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={localConfig.confidenceThreshold || 80}
          onChange={(e) => handleConfigChange('confidenceThreshold', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>0%</span>
          <span className="text-text-primary">{localConfig.confidenceThreshold || 80}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="requireHumanReview"
          checked={localConfig.requireHumanReview || false}
          onChange={(e) => handleConfigChange('requireHumanReview', e.target.checked)}
          className="w-4 h-4 text-accent bg-surface border-white/20 rounded focus:ring-accent focus:ring-2"
        />
        <label htmlFor="requireHumanReview" className="text-sm text-text-secondary">
          يتطلب مراجعة بشرية
        </label>
      </div>
    </div>
  );

  const renderGeneralConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          اسم العقدة
        </label>
        <input
          type="text"
          value={selectedNode?.data?.label || ''}
          onChange={(e) => {
            if (selectedNode) {
              const updatedNode = {
                ...selectedNode,
                data: {
                  ...selectedNode.data,
                  label: e.target.value
                }
              };
              onNodeUpdate(updatedNode);
            }
          }}
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          وصف
        </label>
        <textarea
          value={localConfig.description || ''}
          onChange={(e) => handleConfigChange('description', e.target.value)}
          placeholder="وصف تفصيلي لوظيفة هذه العقدة..."
          className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 h-24 resize-none"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isEnabled"
          checked={localConfig.isEnabled !== false}
          onChange={(e) => handleConfigChange('isEnabled', e.target.checked)}
          className="w-4 h-4 text-accent bg-surface border-white/20 rounded focus:ring-accent focus:ring-2"
        />
        <label htmlFor="isEnabled" className="text-sm text-text-secondary">
          مفعل
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="logExecution"
          checked={localConfig.logExecution || false}
          onChange={(e) => handleConfigChange('logExecution', e.target.checked)}
          className="w-4 h-4 text-accent bg-surface border-white/20 rounded focus:ring-accent focus:ring-2"
        />
        <label htmlFor="logExecution" className="text-sm text-text-secondary">
          تسجيل التنفيذ
        </label>
      </div>
    </div>
  );

  const renderConfigByType = () => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'trigger':
        return renderTriggerConfig();
      case 'condition':
        return renderConditionConfig();
      case 'action':
        return renderActionConfig();
      case 'delay':
        return renderDelayConfig();
      case 'ai_agent':
        return renderAIAgentConfig();
      default:
        return renderGeneralConfig();
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-white/10 glass-effect p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MousePointer2" size={24} className="text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            اختر عقدة للتحرير
          </h3>
          <p className="text-text-secondary text-sm">
            انقر على أي عقدة في سير العمل لعرض وتحرير خصائصها
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'general', label: 'عام', icon: 'Settings' },
    { id: 'config', label: 'الإعدادات', icon: 'Sliders' },
    { id: 'advanced', label: 'متقدم', icon: 'Code' }
  ];

  return (
    <div className="w-80 border-l border-white/10 glass-effect flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Icon name="Edit3" size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              خصائص العقدة
            </h3>
            <p className="text-sm text-text-secondary">
              {selectedNode.data?.label || 'Unnamed Node'}
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-accent/20 text-accent' :'text-text-secondary hover:text-text-primary glass-hover'
              }`}
            >
              <Icon name={section.icon} size={14} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'general' && renderGeneralConfig()}
        {activeSection === 'config' && renderConfigByType()}
        {activeSection === 'advanced' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                JSON Configuration
              </label>
              <textarea
                value={JSON.stringify(localConfig, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setLocalConfig(parsed);
                  } catch (error) {
                    // Handle invalid JSON
                  }
                }}
                className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 h-64 resize-none font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // Reset to defaults
              setLocalConfig({});
            }}
            className="flex-1 px-4 py-2 glass-effect border border-white/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-300"
          >
            إعادة تعيين
          </button>
          <button
            onClick={() => {
              // Delete node
              onWorkflowUpdate(prev => ({
                ...prev,
                nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
                connections: prev.connections.filter(c => 
                  c.source !== selectedNode.id && c.target !== selectedNode.id
                )
              }));
            }}
            className="px-4 py-2 bg-error/20 border border-error/30 rounded-lg text-error hover:bg-error/30 transition-all duration-300"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;