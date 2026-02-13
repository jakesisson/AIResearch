// src/pages/workflow-automation-builder/components/VersionControl.jsx
import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const VersionControl = ({ workflow, onWorkflowUpdate }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ from: null, to: null });
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);

  // Mock version history
  useEffect(() => {
    const mockVersions = [
      {
        id: 'v1.2.1',
        version: '1.2.1',
        timestamp: new Date(Date.now() - 3600000),
        author: 'أحمد محمد',
        message: 'إضافة وكيل ذكي لتحليل البيانات وتحسين شروط التصعيد',
        changes: {
          added: 2,
          modified: 3,
          removed: 1
        },
        branch: 'main',
        isActive: true,
        tags: ['stable', 'production']
      },
      {
        id: 'v1.2.0',
        version: '1.2.0',
        timestamp: new Date(Date.now() - 7200000),
        author: 'فاطمة أحمد',
        message: 'تحسين أداء المعالجة وإضافة قوالب رسائل عربية جديدة',
        changes: {
          added: 1,
          modified: 5,
          removed: 0
        },
        branch: 'main',
        isActive: false,
        tags: ['stable']
      },
      {
        id: 'v1.1.5',
        version: '1.1.5',
        timestamp: new Date(Date.now() - 14400000),
        author: 'محمد علي',
        message: 'إصلاح مشكلة في تشغيل سير العمل التلقائي',
        changes: {
          added: 0,
          modified: 2,
          removed: 0
        },
        branch: 'hotfix',
        isActive: false,
        tags: ['hotfix']
      },
      {
        id: 'v1.1.4',
        version: '1.1.4',
        timestamp: new Date(Date.now() - 21600000),
        author: 'سارة محمود',
        message: 'تحديث واجهة المستخدم وإضافة ميزات إمكانية الوصول',
        changes: {
          added: 3,
          modified: 8,
          removed: 2
        },
        branch: 'feature/ui-improvements',
        isActive: false,
        tags: []
      },
      {
        id: 'v1.1.3',
        version: '1.1.3',
        timestamp: new Date(Date.now() - 28800000),
        author: 'أحمد محمد',
        message: 'دمج ميزة التقارير التفاعلية مع تحسينات الأمان',
        changes: {
          added: 4,
          modified: 6,
          removed: 1
        },
        branch: 'main',
        isActive: false,
        tags: ['stable']
      }
    ];
    setVersions(mockVersions);
    setSelectedVersion(mockVersions[0]);

    const mockBranches = [
      { name: 'main', lastCommit: 'v1.2.1', isActive: true, protection: true },
      { name: 'develop', lastCommit: 'v1.2.0-dev.3', isActive: false, protection: false },
      { name: 'feature/ai-enhancements', lastCommit: 'v1.2.0-feature.1', isActive: false, protection: false },
      { name: 'hotfix/urgent-fix', lastCommit: 'v1.1.5-hotfix.1', isActive: false, protection: false }
    ];
    setBranches(mockBranches);
  }, []);

  const handleCreateVersion = () => {
    if (!commitMessage.trim()) {
      alert('يرجى إدخال رسالة الالتزام');
      return;
    }

    const newVersion = {
      id: `v${workflow.version || '1.0.0'}`,
      version: workflow.version || '1.0.0',
      timestamp: new Date(),
      author: 'أنت',
      message: commitMessage,
      changes: {
        added: Math.floor(Math.random() * 3),
        modified: Math.floor(Math.random() * 5),
        removed: Math.floor(Math.random() * 2)
      },
      branch: currentBranch,
      isActive: true,
      tags: []
    };

    // Make previous version inactive
    setVersions(prev => [
      newVersion,
      ...prev.map(v => ({ ...v, isActive: false }))
    ]);
    
    setCommitMessage('');
    setSelectedVersion(newVersion);
  };

  const handleRevertToVersion = (version) => {
    if (window.confirm(`هل أنت متأكد من الرجوع إلى الإصدار ${version.version}؟`)) {
      onWorkflowUpdate(prev => ({
        ...prev,
        version: version.version,
        // Here you would restore the actual workflow data
      }));
      
      setVersions(prev => prev.map(v => ({
        ...v,
        isActive: v.id === version.id
      })));
    }
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;

    const newBranch = {
      name: newBranchName,
      lastCommit: selectedVersion?.version || '1.0.0',
      isActive: false,
      protection: false
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    setIsCreatingBranch(false);
  };

  const getChangesSummary = (changes) => {
    const total = changes.added + changes.modified + changes.removed;
    return {
      total,
      text: `${changes.added} إضافة، ${changes.modified} تعديل، ${changes.removed} حذف`
    };
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    if (hours > 0) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    return 'منذ دقائق';
  };

  return (
    <div className="h-full flex">
      {/* Version History Sidebar */}
      <div className="w-80 border-r border-white/10 glass-effect p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            سجل الإصدارات
          </h3>
          <p className="text-sm text-text-secondary">
            تتبع جميع التغييرات والتحديثات
          </p>
        </div>

        {/* Branch Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            الفرع الحالي
          </label>
          <div className="flex space-x-2">
            <select
              value={currentBranch}
              onChange={(e) => setCurrentBranch(e.target.value)}
              className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name} {branch.protection && '🔒'}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsCreatingBranch(true)}
              className="p-2 glass-effect border border-white/10 rounded-lg text-text-secondary hover:text-accent transition-colors duration-300"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
        </div>

        {/* Create New Version */}
        <div className="mb-6 p-4 glass-effect border border-white/10 rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-3">
            إنشاء إصدار جديد
          </h4>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="وصف التغييرات والتحديثات..."
            className="w-full h-20 p-3 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-sm"
          />
          <button
            onClick={handleCreateVersion}
            disabled={!commitMessage.trim()}
            className="w-full mt-3 bg-accent hover:bg-accent-600 disabled:bg-surface disabled:text-text-secondary text-background font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            حفظ الإصدار
          </button>
        </div>

        {/* Version List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                selectedVersion?.id === version.id
                  ? 'border-accent/30 bg-accent/10' :'border-white/10 glass-effect hover:border-accent/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    version.isActive ? 'text-accent' : 'text-text-primary'
                  }`}>
                    {version.version}
                  </span>
                  {version.isActive && (
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                  )}
                </div>
                <span className="text-xs text-text-muted">
                  {getTimeSince(version.timestamp)}
                </span>
              </div>
              
              <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                {version.message}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{version.author}</span>
                <span className="text-text-secondary">
                  {getChangesSummary(version.changes).total} تغيير
                </span>
              </div>
              
              {version.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {version.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${
                        tag === 'production' ? 'bg-success/20 text-success' :
                        tag === 'stable' ? 'bg-primary/20 text-primary' :
                        tag === 'hotfix'? 'bg-warning/20 text-warning' : 'bg-surface text-text-secondary'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Version Details */}
      <div className="flex-1 p-6">
        {selectedVersion ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  الإصدار {selectedVersion.version}
                </h2>
                <p className="text-text-secondary">
                  {selectedVersion.message}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsComparing(!isComparing)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    isComparing 
                      ? 'bg-primary text-white' :'glass-effect border border-white/10 text-text-primary hover:text-accent'
                  }`}
                >
                  <Icon name="GitCompare" size={16} className="ml-1" />
                  مقارنة
                </button>
                
                {!selectedVersion.isActive && (
                  <button
                    onClick={() => handleRevertToVersion(selectedVersion)}
                    className="px-4 py-2 bg-warning hover:bg-warning-600 text-background rounded-lg transition-all duration-300"
                  >
                    <Icon name="RotateCcw" size={16} className="ml-1" />
                    الرجوع لهذا الإصدار
                  </button>
                )}
              </div>
            </div>

            {/* Version Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">
                  معلومات الإصدار
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">المؤلف:</span>
                    <span className="text-text-primary">{selectedVersion.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">التاريخ:</span>
                    <span className="text-text-primary">
                      {selectedVersion.timestamp.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">الفرع:</span>
                    <span className="text-text-primary">{selectedVersion.branch}</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">
                  إحصائيات التغييرات
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-success text-sm">إضافات</span>
                    <span className="text-success font-medium">+{selectedVersion.changes.added}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warning text-sm">تعديلات</span>
                    <span className="text-warning font-medium">~{selectedVersion.changes.modified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-error text-sm">حذف</span>
                    <span className="text-error font-medium">-{selectedVersion.changes.removed}</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect border border-white/10 rounded-lg p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2">
                  حالة النشر
                </h3>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 ${
                    selectedVersion.isActive ? 'text-success' : 'text-text-secondary'
                  }`}>
                    <Icon 
                      name={selectedVersion.isActive ? 'CheckCircle' : 'Circle'} 
                      size={16} 
                    />
                    <span className="text-sm">
                      {selectedVersion.isActive ? 'نشط حالياً' : 'غير نشط'}
                    </span>
                  </div>
                  {selectedVersion.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="Tag" size={14} className="text-accent" />
                      <span className="text-sm text-text-primary">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Changes Details */}
            <div className="glass-effect border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                تفاصيل التغييرات
              </h3>
              
              {/* Mock change details */}
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Plus" size={16} className="text-success" />
                    <span className="text-sm font-medium text-success">إضافة عقدة جديدة</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    تم إضافة عقدة "تحليل المشاعر" لتحسين فهم ردود أفعال العملاء
                  </p>
                </div>
                
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Edit" size={16} className="text-warning" />
                    <span className="text-sm font-medium text-warning">تحديث شروط التصعيد</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    تم تحسين منطق التصعيد ليأخذ في الاعتبار أولوية العميل ونوع المشكلة
                  </p>
                </div>
                
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Minus" size={16} className="text-error" />
                    <span className="text-sm font-medium text-error">إزالة عقدة قديمة</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    تم حذف عقدة "التحقق اليدوي" المهجورة لتبسيط سير العمل
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="GitBranch" size={24} className="text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              اختر إصداراً لعرض التفاصيل
            </h3>
            <p className="text-text-secondary">
              انقر على أي إصدار من القائمة الجانبية لعرض تفاصيله
            </p>
          </div>
        )}
      </div>

      {/* Create Branch Modal */}
      {isCreatingBranch && (
        <div className="fixed inset-0 z-500 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-md glass-effect rounded-lg border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  إنشاء فرع جديد
                </h3>
                <button
                  onClick={() => setIsCreatingBranch(false)}
                  className="p-2 rounded-lg glass-hover text-text-secondary hover:text-text-primary"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  اسم الفرع
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/new-feature"
                  className="w-full p-3 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCreatingBranch(false)}
                  className="flex-1 glass-effect border border-white/10 text-text-primary hover:text-accent font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateBranch}
                  disabled={!newBranchName.trim()}
                  className="flex-1 bg-accent hover:bg-accent-600 disabled:bg-surface disabled:text-text-secondary text-background font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;