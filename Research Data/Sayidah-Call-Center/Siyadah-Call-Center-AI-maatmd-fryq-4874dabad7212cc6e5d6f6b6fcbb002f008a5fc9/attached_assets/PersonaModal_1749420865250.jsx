// src/pages/ai-team-management/components/PersonaModal.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PersonaModal = ({ persona, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editedPersona, setEditedPersona] = useState(persona);

  // Mock performance data
  const performanceData = [
    { name: 'يناير', performance: 8.5, tasks: 45, satisfaction: 92 },
    { name: 'فبراير', performance: 8.8, tasks: 52, satisfaction: 94 },
    { name: 'مارس', performance: 9.1, tasks: 58, satisfaction: 96 },
    { name: 'أبريل', performance: 9.0, tasks: 55, satisfaction: 95 },
    { name: 'مايو', performance: 9.2, tasks: 62, satisfaction: 94 },
    { name: 'يونيو', performance: 9.3, tasks: 67, satisfaction: 97 }
  ];

  const workflowOptions = [
    'lead-qualification',
    'follow-up-calls',
    'technical-support',
    'ticket-resolution',
    'data-analysis',
    'report-generation',
    'process-automation',
    'workflow-optimization',
    'content-creation',
    'social-media-management'
  ];

  const getWorkflowLabel = (workflow) => {
    const labels = {
      'lead-qualification': 'تأهيل العملاء المحتملين',
      'follow-up-calls': 'مكالمات المتابعة',
      'technical-support': 'الدعم التقني',
      'ticket-resolution': 'حل التذاكر',
      'data-analysis': 'تحليل البيانات',
      'report-generation': 'إنتاج التقارير',
      'process-automation': 'أتمتة العمليات',
      'workflow-optimization': 'تحسين سير العمل',
      'content-creation': 'إنتاج المحتوى',
      'social-media-management': 'إدارة وسائل التواصل الاجتماعي'
    };
    return labels[workflow] || workflow;
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: 'User' },
    { id: 'configuration', label: 'التكوين', icon: 'Settings' },
    { id: 'workflows', label: 'سير العمل', icon: 'GitBranch' },
    { id: 'analytics', label: 'التحليلات', icon: 'BarChart3' }
  ];

  const handleSave = () => {
    onSave(editedPersona);
  };

  const handleWorkflowToggle = (workflow) => {
    setEditedPersona(prev => ({
      ...prev,
      workflowAssignments: prev.workflowAssignments?.includes(workflow)
        ? prev.workflowAssignments.filter(w => w !== workflow)
        : [...(prev.workflowAssignments || []), workflow]
    }));
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] glass-effect border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <Image
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                {persona.name}
              </h2>
              <p className="text-text-secondary">{persona.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg glass-hover"
          >
            <Icon name="X" size={24} className="text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex space-x-1 p-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-accent/20 text-accent border border-accent/30' :'glass-hover text-text-secondary hover:text-accent'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-effect border border-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Star" size={16} className="text-warning" />
                    <span className="text-sm text-text-secondary">التقييم</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{persona.performanceRating}/10</p>
                </div>
                <div className="glass-effect border border-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="MessageSquare" size={16} className="text-accent" />
                    <span className="text-sm text-text-secondary">المحادثات النشطة</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{persona.activeConversations}</p>
                </div>
                <div className="glass-effect border border-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-text-secondary">المهام المكتملة</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{persona.completedTasks}</p>
                </div>
              </div>

              {/* Specialization and Expertise */}
              <div className="glass-effect border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">التخصص والخبرات</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-text-secondary">التخصص الرئيسي:</span>
                    <p className="text-text-primary font-medium">{persona.specialization}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">المجالات:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {persona.expertise?.map((skill, index) => (
                        <span key={index} className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">اللغات المدعومة:</span>
                    <div className="flex space-x-2 mt-2">
                      {persona.languages?.map((lang) => (
                        <span key={lang} className="bg-surface px-3 py-1 rounded text-text-primary text-sm">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="glass-effect border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">الحالة الحالية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-text-secondary">حالة النظام:</span>
                    <p className="text-text-primary font-medium">{persona.status}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">التوفر:</span>
                    <p className="text-text-primary font-medium">{persona.availability}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">وقت الاستجابة:</span>
                    <p className="text-text-primary font-medium">{persona.responseTime}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">رضا العملاء:</span>
                    <p className="text-text-primary font-medium">{persona.customerSatisfaction}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Configuration */}
                <div className="glass-effect border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">التكوين الأساسي</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">اسم الشخصية</label>
                      <input
                        type="text"
                        value={editedPersona.name}
                        onChange={(e) => setEditedPersona(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">الدور</label>
                      <input
                        type="text"
                        value={editedPersona.role}
                        onChange={(e) => setEditedPersona(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">التخصص</label>
                      <input
                        type="text"
                        value={editedPersona.specialization}
                        onChange={(e) => setEditedPersona(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Configuration */}
                <div className="glass-effect border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">حالة النظام</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">الحالة</label>
                      <select
                        value={editedPersona.status}
                        onChange={(e) => setEditedPersona(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="maintenance">صيانة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">التوفر</label>
                      <select
                        value={editedPersona.availability}
                        onChange={(e) => setEditedPersona(prev => ({ ...prev, availability: e.target.value }))}
                        className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="available">متاح</option>
                        <option value="busy">مشغول</option>
                        <option value="offline">غير متصل</option>
                        <option value="unavailable">غير متاح</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="glass-effect border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">تخصيص سير العمل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowOptions.map((workflow) => (
                    <label key={workflow} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editedPersona.workflowAssignments?.includes(workflow) || false}
                        onChange={() => handleWorkflowToggle(workflow)}
                        className="w-4 h-4 text-accent border-2 border-white/20 bg-surface/50 rounded focus:ring-accent/50 focus:ring-2"
                      />
                      <span className="text-text-primary group-hover:text-accent transition-colors duration-300">
                        {getWorkflowLabel(workflow)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Performance Chart */}
              <div className="glass-effect border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">تحليل الأداء - آخر 6 أشهر</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(26, 29, 41, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#F8FAFC'
                        }} 
                      />
                      <Line type="monotone" dataKey="performance" stroke="#06FFA5" strokeWidth={2} />
                      <Line type="monotone" dataKey="satisfaction" stroke="#6366F1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Task Performance */}
              <div className="glass-effect border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">المهام المكتملة شهرياً</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(26, 29, 41, 0.95)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#F8FAFC'
                        }} 
                      />
                      <Bar dataKey="tasks" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Handle start conversation
                console.log('Start conversation with', persona.name);
              }}
              className="glass-effect border border-white/10 text-text-secondary hover:text-accent px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Icon name="MessageSquare" size={18} />
              <span>بدء محادثة</span>
            </button>
            <button
              onClick={() => {
                // Handle assign task
                console.log('Assign task to', persona.name);
              }}
              className="glass-effect border border-white/10 text-text-secondary hover:text-accent px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Icon name="Plus" size={18} />
              <span>تكليف مهمة</span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="glass-effect border border-white/10 text-text-secondary hover:text-text-primary px-6 py-2 rounded-lg transition-all duration-300"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="bg-accent hover:bg-accent-600 text-background font-medium px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;