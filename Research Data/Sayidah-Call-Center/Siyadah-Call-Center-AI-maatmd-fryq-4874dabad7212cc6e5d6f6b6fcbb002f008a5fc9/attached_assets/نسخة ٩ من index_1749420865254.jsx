// src/pages/sales-pipeline-management/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';

import Sidebar from 'components/ui/Sidebar';
import Header from 'components/ui/Header';
import FilterSidebar from './components/FilterSidebar';
import PipelineBoard from './components/PipelineBoard';
import OpportunityDetailPanel from './components/OpportunityDetailPanel';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import VoiceCommandModal from './components/VoiceCommandModal';
import ProposalGenerator from './components/ProposalGenerator';
import NotificationCenter from './components/NotificationCenter';

const SalesPipelineManagement = () => {
  const navigate = useNavigate();
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    stage: 'all',
    value: 'all',
    dateRange: 'all',
    teamMember: 'all',
    source: 'all'
  });

  // Pipeline stages configuration
  const pipelineStages = [
    { id: 'lead', name: 'عملاء محتملين', color: 'bg-secondary', order: 1 },
    { id: 'qualified', name: 'مؤهلين', color: 'bg-primary', order: 2 },
    { id: 'proposal', name: 'عرض سعر', color: 'bg-warning', order: 3 },
    { id: 'negotiation', name: 'تفاوض', color: 'bg-accent', order: 4 },
    { id: 'closed', name: 'مغلق', color: 'bg-success', order: 5 }
  ];

  // Mock opportunities data
  const [opportunities, setOpportunities] = useState([
    {
      id: 1,
      name: 'شركة التقنية المتقدمة',
      stage: 'qualified',
      value: 250000,
      probability: 85,
      assignedAgent: 'سارة المبيعات',
      agentAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      source: 'موقع إلكتروني',
      contactPerson: 'أحمد الخالدي',
      email: 'ahmed@techadvanced.com',
      phone: '+966501234567',
      lastActivity: 'اتصال هاتفي - منذ ساعتين',
      nextAction: 'إرسال عرض سعر',
      priority: 'high',
      createdAt: new Date('2024-01-15'),
      expectedCloseDate: new Date('2024-02-15'),
      notes: 'عميل مهتم جداً بحلول إدارة المخزون',
      tags: ['مخزون', 'تقنية', 'مؤسسة كبيرة'],
      conversationHistory: [
        { date: new Date(), type: 'call', duration: '15 دقيقة', summary: 'مناقشة متطلبات المشروع' },
        { date: new Date(Date.now() - 86400000), type: 'email', summary: 'إرسال معلومات أولية' }
      ]
    },
    {
      id: 2,
      name: 'مجموعة الأعمال الذكية',
      stage: 'proposal',
      value: 180000,
      probability: 70,
      assignedAgent: 'محمد الأعمال',
      agentAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      source: 'إحالة',
      contactPerson: 'فاطمة السالم',
      email: 'fatima@smartbusiness.com',
      phone: '+966507654321',
      lastActivity: 'إرسال عرض سعر - منذ يوم',
      nextAction: 'متابعة العرض',
      priority: 'medium',
      createdAt: new Date('2024-01-10'),
      expectedCloseDate: new Date('2024-02-28'),
      notes: 'يحتاجون حل شامل لإدارة العملاء',
      tags: ['CRM', 'إدارة', 'متوسطة'],
      conversationHistory: [
        { date: new Date(Date.now() - 86400000), type: 'meeting', duration: '45 دقيقة', summary: 'عرض تقديمي للحل' },
        { date: new Date(Date.now() - 172800000), type: 'email', summary: 'تحديد موعد العرض' }
      ]
    },
    {
      id: 3,
      name: 'شركة النمو السريع',
      stage: 'negotiation',
      value: 320000,
      probability: 90,
      assignedAgent: 'سارة المبيعات',
      agentAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      source: 'معرض تجاري',
      contactPerson: 'خالد الراشد',
      email: 'khalid@rapidgrowth.com',
      phone: '+966509876543',
      lastActivity: 'اجتماع تفاوض - منذ 3 ساعات',
      nextAction: 'إنهاء التفاوض',
      priority: 'high',
      createdAt: new Date('2024-01-05'),
      expectedCloseDate: new Date('2024-02-05'),
      notes: 'قريبون جداً من إتمام الصفقة',
      tags: ['صفقة كبيرة', 'تفاوض نهائي', 'مؤسسة'],
      conversationHistory: [
        { date: new Date(Date.now() - 10800000), type: 'meeting', duration: '60 دقيقة', summary: 'اجتماع تفاوض على الأسعار' },
        { date: new Date(Date.now() - 172800000), type: 'call', duration: '20 دقيقة', summary: 'مناقشة الشروط' }
      ]
    },
    {
      id: 4,
      name: 'مؤسسة الابتكار',
      stage: 'lead',
      value: 150000,
      probability: 45,
      assignedAgent: 'أحمد التطوير',
      agentAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      source: 'تسويق رقمي',
      contactPerson: 'نورا العتيبي',
      email: 'nora@innovation.com',
      phone: '+966502468135',
      lastActivity: 'استفسار أولي - منذ يومين',
      nextAction: 'تأهيل العميل',
      priority: 'medium',
      createdAt: new Date('2024-01-20'),
      expectedCloseDate: new Date('2024-03-15'),
      notes: 'يحتاجون تقييم احتياجاتهم أولاً',
      tags: ['جديد', 'تأهيل', 'ابتكار'],
      conversationHistory: [
        { date: new Date(Date.now() - 172800000), type: 'email', summary: 'استفسار عن الخدمات' }
      ]
    },
    {
      id: 5,
      name: 'شركة التميز التجاري',
      stage: 'closed',
      value: 400000,
      probability: 100,
      assignedAgent: 'سارة المبيعات',
      agentAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      source: 'عميل سابق',
      contactPerson: 'عبدالله المطيري',
      email: 'abdullah@excellence.com',
      phone: '+966503691472',
      lastActivity: 'توقيع العقد - منذ أسبوع',
      nextAction: 'تسليم المشروع',
      priority: 'high',
      createdAt: new Date('2023-12-01'),
      expectedCloseDate: new Date('2024-01-20'),
      notes: 'صفقة مغلقة بنجاح',
      tags: ['مغلق', 'نجح', 'عميل مهم'],
      conversationHistory: [
        { date: new Date(Date.now() - 604800000), type: 'meeting', duration: '90 دقيقة', summary: 'توقيع العقد' },
        { date: new Date(Date.now() - 1209600000), type: 'call', duration: '30 دقيقة', summary: 'مراجعة نهائية للشروط' }
      ]
    }
  ]);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalPipelineValue: 1300000,
    averageDealSize: 260000,
    conversionRate: 72,
    salesVelocity: 45,
    monthlyGrowth: 15.5,
    activeOpportunities: 4,
    closedDeals: 1,
    averageTimeToClose: 38
  });

  // AI team members
  const aiTeamMembers = [
    {
      id: 1,
      name: 'سارة المبيعات',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      specialization: 'تأهيل العملاء',
      activeDeals: 3,
      conversionRate: 78
    },
    {
      id: 2,
      name: 'محمد الأعمال',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      specialization: 'إدارة الحسابات',
      activeDeals: 1,
      conversionRate: 85
    },
    {
      id: 3,
      name: 'أحمد التطوير',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      specialization: 'الحلول التقنية',
      activeDeals: 1,
      conversionRate: 68
    }
  ];

  // Filter opportunities based on current filters
  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.stage !== 'all' && opp.stage !== filters.stage) return false;
    if (filters.teamMember !== 'all' && opp.assignedAgent !== filters.teamMember) return false;
    if (filters.source !== 'all' && opp.source !== filters.source) return false;
    if (filters.value !== 'all') {
      const [min, max] = filters.value.split('-').map(Number);
      if (max && (opp.value < min * 1000 || opp.value > max * 1000)) return false;
      if (!max && opp.value < min * 1000) return false;
    }
    return true;
  });

  // Handle opportunity card click
  const handleOpportunityClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailPanelOpen(true);
  };

  // Handle opportunity stage change (drag and drop)
  const handleStageChange = (opportunityId, newStage) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunityId 
        ? { 
            ...opp, 
            stage: newStage,
            lastActivity: `تم نقل الفرصة إلى مرحلة ${pipelineStages.find(s => s.id === newStage)?.name} - الآن`
          }
        : opp
    ));
    
    // Add notification
    addNotification({
      id: Date.now(),
      type: 'stage_change',
      title: 'تحديث مرحلة الفرصة',
      message: `تم نقل فرصة ${opportunities.find(o => o.id === opportunityId)?.name} إلى مرحلة ${pipelineStages.find(s => s.id === newStage)?.name}`,
      timestamp: new Date()
    });
  };

  // Add notification helper
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 latest
  };

  // Voice command handler
  const handleVoiceCommand = (command) => {
    // Process voice commands
    console.log('Voice command:', command);
    addNotification({
      id: Date.now(),
      type: 'voice_command',
      title: 'أمر صوتي',
      message: `تم تنفيذ: ${command}`,
      timestamp: new Date()
    });
  };

  // Auto-generate notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const aiRecommendations = [
        'سارة توصي بمتابعة عميل شركة التقنية المتقدمة',
        'فرصة جديدة مؤهلة من خلال الذكاء الاصطناعي',
        'تحديث تلقائي لاحتمالية نجاح صفقة النمو السريع',
        'تذكير: موعد اجتماع مع مجموعة الأعمال الذكية'
      ];
      
      const randomRecommendation = aiRecommendations[Math.floor(Math.random() * aiRecommendations.length)];
      
      addNotification({
        id: Date.now(),
        type: 'ai_recommendation',
        title: 'توصية ذكية',
        message: randomRecommendation,
        timestamp: new Date()
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      
      <main className="lg:ml-80 pt-16">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
                إدارة خط المبيعات
              </h1>
              <p className="text-text-secondary">
                تتبع العملاء المحتملين وإدارة الفرص والمراقبة المدعومة بالذكاء الاصطناعي
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="bg-secondary hover:bg-secondary-600 text-background font-medium px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Icon name="Mic" size={20} />
                <span>أمر صوتي</span>
              </button>
              <button
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                className="lg:hidden glass-effect border border-white/20 text-text-primary hover:text-accent font-medium px-4 py-3 rounded-lg transition-all duration-300"
              >
                <Icon name="Filter" size={20} />
              </button>
            </div>
          </div>

          {/* Performance Analytics Toggle */}
          <div className="glass-effect border border-white/10 rounded-xl p-4">
            <button
              onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary">
                  تحليلات الأداء
                </h3>
                <p className="text-text-secondary text-sm">
                  مؤشرات الأداء الرئيسية والاتجاهات
                </p>
              </div>
              <Icon 
                name={isAnalyticsExpanded ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-text-secondary" 
              />
            </button>
            
            <AnimatePresence>
              {isAnalyticsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <PerformanceAnalytics metrics={performanceMetrics} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Filter Sidebar */}
            <div className={`${isFilterSidebarOpen ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                opportunities={opportunities}
                aiTeamMembers={aiTeamMembers}
                onClose={() => setIsFilterSidebarOpen(false)}
              />
            </div>

            {/* Pipeline Board */}
            <div className="flex-1 min-w-0">
              <PipelineBoard
                stages={pipelineStages}
                opportunities={filteredOpportunities}
                onOpportunityClick={handleOpportunityClick}
                onStageChange={handleStageChange}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Opportunity Detail Panel */}
      <AnimatePresence>
        {isDetailPanelOpen && selectedOpportunity && (
          <OpportunityDetailPanel
            opportunity={selectedOpportunity}
            onClose={() => {
              setIsDetailPanelOpen(false);
              setSelectedOpportunity(null);
            }}
            onUpdate={(updatedOpportunity) => {
              setOpportunities(prev => prev.map(opp => 
                opp.id === updatedOpportunity.id ? updatedOpportunity : opp
              ));
            }}
          />
        )}
      </AnimatePresence>

      {/* Voice Command Modal */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <VoiceCommandModal
            onClose={() => setIsVoiceModalOpen(false)}
            onCommand={handleVoiceCommand}
          />
        )}
      </AnimatePresence>

      {/* Proposal Generator */}
      <ProposalGenerator opportunities={opportunities} />

      {/* Notification Center */}
      <NotificationCenter notifications={notifications} />

      {/* Mobile Filter Overlay */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-500 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 glass-effect border-l border-white/10 overflow-y-auto">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              opportunities={opportunities}
              aiTeamMembers={aiTeamMembers}
              onClose={() => setIsFilterSidebarOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipelineManagement;