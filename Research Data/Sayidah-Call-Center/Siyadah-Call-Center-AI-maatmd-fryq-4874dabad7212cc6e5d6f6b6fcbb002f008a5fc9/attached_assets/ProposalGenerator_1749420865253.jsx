// src/pages/sales-pipeline-management/components/ProposalGenerator.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';

const ProposalGenerator = ({ opportunities }) => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [generationStep, setGenerationStep] = useState('select'); // select, configure, generating, complete
  const [proposalConfig, setProposalConfig] = useState({
    template: 'comprehensive',
    includeCustomization: true,
    includePricing: true,
    includeTimeline: true,
    includeTerms: true,
    language: 'arabic',
    tone: 'professional'
  });
  const [generatedProposal, setGeneratedProposal] = useState(null);

  const proposalTemplates = [
    {
      id: 'comprehensive',
      name: 'شامل ومفصل',
      description: 'عرض مفصل مع جميع التفاصيل التقنية والمالية',
      sections: ['نظرة عامة', 'الحل المقترح', 'التسعير', 'الجدولة', 'الشروط'],
      icon: 'FileText'
    },
    {
      id: 'executive',
      name: 'تنفيذي مختصر',
      description: 'عرض مختصر للإدارة العليا مع التركيز على القيمة',
      sections: ['الملخص التنفيذي', 'القيمة المضافة', 'الاستثمار المطلوب'],
      icon: 'Briefcase'
    },
    {
      id: 'technical',
      name: 'تقني متخصص',
      description: 'عرض تقني مفصل للفرق التقنية',
      sections: ['المتطلبات التقنية', 'الحل التقني', 'التكامل', 'الدعم'],
      icon: 'Settings'
    }
  ];

  const generateProposal = async () => {
    setGenerationStep('generating');
    
    // Simulate AI proposal generation
    setTimeout(() => {
      const mockProposal = {
        title: `عرض مخصص لـ ${selectedOpportunity?.name}`,
        sections: [
          {
            title: 'الملخص التنفيذي',
            content: `نحن سعداء لتقديم هذا العرض المخصص لـ ${selectedOpportunity?.name}. يهدف هذا الحل إلى تحسين عملياتكم التجارية وزيادة الكفاءة بنسبة تصل إلى 40%.`
          },
          {
            title: 'الحل المقترح',
            content: 'حل متكامل يشمل نظام إدارة علاقات العملاء، أتمتة العمليات، وتحليلات ذكية لاتخاذ قرارات مدروسة.'
          },
          {
            title: 'التسعير والاستثمار',
            content: `الاستثمار المطلوب: ${(selectedOpportunity?.value || 0).toLocaleString()} ريال سعودي، مع إمكانية التقسيط على 12 شهر.`
          },
          {
            title: 'الجدولة الزمنية',
            content: 'مدة التنفيذ المتوقعة: 3-4 أشهر مع التسليم على مراحل لضمان الجودة والفعالية.'
          }
        ],
        createdAt: new Date(),
        estimatedReadTime: '5 دقائق'
      };
      
      setGeneratedProposal(mockProposal);
      setGenerationStep('complete');
    }, 3000);
  };

  const resetGenerator = () => {
    setGenerationStep('select');
    setSelectedOpportunity(null);
    setGeneratedProposal(null);
  };

  const downloadProposal = () => {
    // Simulate download
    console.log('Downloading proposal...', generatedProposal);
    alert('سيتم تحميل العرض قريباً');
  };

  const sendProposal = () => {
    // Simulate sending
    console.log('Sending proposal...', generatedProposal);
    alert(`تم إرسال العرض إلى ${selectedOpportunity?.email}`);
    setIsGeneratorOpen(false);
    resetGenerator();
  };

  // Filter opportunities that can have proposals
  const proposalReadyOpportunities = opportunities?.filter(opp => 
    ['qualified', 'proposal', 'negotiation'].includes(opp?.stage)
  ) || [];

  return (
    <div className="fixed bottom-6 right-6 z-400">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isGeneratorOpen && proposalReadyOpportunities.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGeneratorOpen(true)}
            className="bg-warning hover:bg-warning-dark text-background w-14 h-14 rounded-full shadow-elevation-3 border border-white/20 transition-all duration-300 flex items-center justify-center group"
          >
            <Icon name="FileText" size={24} className="group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Generator Modal */}
      <AnimatePresence>
        {isGeneratorOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-96 glass-effect border border-white/20 rounded-2xl shadow-elevation-3 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-warning to-warning-dark p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-background font-heading font-bold flex items-center space-x-2">
                  <Icon name="Sparkles" size={20} />
                  <span>مولد العروض الذكي</span>
                </h3>
                <button
                  onClick={() => {
                    setIsGeneratorOpen(false);
                    resetGenerator();
                  }}
                  className="text-background/80 hover:text-background p-1 rounded transition-colors duration-300"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
              {/* Step 1: Select Opportunity */}
              {generationStep === 'select' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-text-primary mb-3">اختر الفرصة:</h4>
                    <div className="space-y-2">
                      {proposalReadyOpportunities?.map((opportunity) => (
                        <button
                          key={opportunity?.id}
                          onClick={() => {
                            setSelectedOpportunity(opportunity);
                            setGenerationStep('configure');
                          }}
                          className="w-full text-left glass-effect border border-white/10 rounded-lg p-3 hover:border-warning/30 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-text-primary group-hover:text-warning transition-colors duration-300">
                                {opportunity?.name}
                              </p>
                              <p className="text-text-secondary text-sm">
                                {(opportunity?.value / 1000).toFixed(0)}K ريال • {opportunity?.assignedAgent}
                              </p>
                            </div>
                            <Icon name="ChevronRight" size={16} className="text-text-muted group-hover:text-warning transition-colors duration-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Configure Proposal */}
              {generationStep === 'configure' && selectedOpportunity && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-text-primary">إعداد العرض:</h4>
                    <button
                      onClick={() => setGenerationStep('select')}
                      className="text-warning hover:text-warning-dark text-sm flex items-center space-x-1"
                    >
                      <Icon name="ArrowLeft" size={16} />
                      <span>العودة</span>
                    </button>
                  </div>
                  
                  {/* Selected Opportunity Info */}
                  <div className="glass-effect bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                    <p className="font-medium text-text-primary">{selectedOpportunity?.name}</p>
                    <p className="text-text-secondary text-sm">{selectedOpportunity?.contactPerson}</p>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-3">
                    <label className="text-text-primary font-medium text-sm">قالب العرض:</label>
                    <div className="space-y-2">
                      {proposalTemplates?.map((template) => (
                        <label key={template?.id} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="template"
                            value={template?.id}
                            checked={proposalConfig?.template === template?.id}
                            onChange={(e) => setProposalConfig(prev => ({ ...prev, template: e.target.value }))}
                            className="w-4 h-4 text-warning bg-surface border-2 border-white/20 focus:ring-warning/50 focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon name={template?.icon} size={16} className="text-warning" />
                            <div>
                              <p className="text-text-primary text-sm font-medium group-hover:text-warning transition-colors duration-300">
                                {template?.name}
                              </p>
                              <p className="text-text-secondary text-xs">{template?.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <label className="text-text-primary font-medium text-sm">خيارات إضافية:</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalConfig?.includePricing}
                          onChange={(e) => setProposalConfig(prev => ({ ...prev, includePricing: e.target.checked }))}
                          className="w-4 h-4 text-warning bg-surface border-2 border-white/20 rounded focus:ring-warning/50 focus:ring-2"
                        />
                        <span className="text-text-secondary text-sm">تضمين التسعير المفصل</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalConfig?.includeTimeline}
                          onChange={(e) => setProposalConfig(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                          className="w-4 h-4 text-warning bg-surface border-2 border-white/20 rounded focus:ring-warning/50 focus:ring-2"
                        />
                        <span className="text-text-secondary text-sm">إضافة الجدولة الزمنية</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalConfig?.includeTerms}
                          onChange={(e) => setProposalConfig(prev => ({ ...prev, includeTerms: e.target.checked }))}
                          className="w-4 h-4 text-warning bg-surface border-2 border-white/20 rounded focus:ring-warning/50 focus:ring-2"
                        />
                        <span className="text-text-secondary text-sm">تضمين الشروط والأحكام</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={generateProposal}
                    className="w-full bg-warning hover:bg-warning-dark text-background font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Icon name="Sparkles" size={16} />
                    <span>إنشاء العرض</span>
                  </button>
                </div>
              )}

              {/* Step 3: Generating */}
              {generationStep === 'generating' && (
                <div className="text-center py-8">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-warning/20 border-t-warning animate-spin"></div>
                    <Icon name="Sparkles" size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-warning" />
                  </div>
                  <h4 className="font-medium text-text-primary mb-2">جاري إنشاء العرض...</h4>
                  <p className="text-text-secondary text-sm">الذكاء الاصطناعي يحلل البيانات وينشئ عرضاً مخصصاً</p>
                </div>
              )}

              {/* Step 4: Complete */}
              {generationStep === 'complete' && generatedProposal && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-text-primary">العرض جاهز!</h4>
                    <button
                      onClick={resetGenerator}
                      className="text-warning hover:text-warning-dark text-sm flex items-center space-x-1"
                    >
                      <Icon name="RotateCcw" size={16} />
                      <span>جديد</span>
                    </button>
                  </div>

                  {/* Proposal Preview */}
                  <div className="glass-effect bg-surface/30 border border-white/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-text-primary">{generatedProposal?.title}</h5>
                      <div className="flex items-center space-x-1 text-text-muted text-xs">
                        <Icon name="Clock" size={12} />
                        <span>{generatedProposal?.estimatedReadTime}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {generatedProposal?.sections?.slice(0, 2)?.map((section, index) => (
                        <div key={index}>
                          <h6 className="text-text-primary text-sm font-medium">{section?.title}</h6>
                          <p className="text-text-secondary text-xs">
                            {section?.content?.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={sendProposal}
                      className="w-full bg-accent hover:bg-accent-600 text-background font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Icon name="Send" size={16} />
                      <span>إرسال للعميل</span>
                    </button>
                    
                    <button
                      onClick={downloadProposal}
                      className="w-full glass-effect border border-white/20 text-text-primary hover:text-warning font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Icon name="Download" size={16} />
                      <span>تحميل PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalGenerator;