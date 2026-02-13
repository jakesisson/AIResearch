/**
 * Global Smart Communications System - Abu Iyad Version 9.0
 * Complete 21-agent specialized system for enterprise communication
 */

export function getGlobalAgentsSystem() {
  const globalAgents = [
    // محرك الفهم البشري - Human Understanding Engine
    { id: 1, name: 'سارة المحلل', specialization: 'Human Understanding Engine - تحليل البيانات وسلوك العملاء', performance: 92, engine: 'Human Understanding Engine' },
    { id: 2, name: 'أحمد المطور', specialization: 'Human Understanding Engine - تطوير وأتمتة سير العمل', performance: 88, engine: 'Human Understanding Engine' },
    { id: 3, name: 'فاطمة الدعم', specialization: 'Human Understanding Engine - دعم العملاء والخدمات الذكية', performance: 95, engine: 'Human Understanding Engine' },
    { id: 4, name: 'وكيل الذاكرة التفاعلية', specialization: 'Human Understanding Engine - تذكر المحادثات السابقة', performance: 98, engine: 'Human Understanding Engine' },
    { id: 5, name: 'وكيل تخصيص النبرة', specialization: 'Human Understanding Engine - تغيير النبرة حسب نوع العميل', performance: 92, engine: 'Human Understanding Engine' },
    
    // محرك التنفيذ الذكي - Smart Execution Engine
    { id: 6, name: 'وكيل العروض الذكية', specialization: 'Smart Execution Engine - إرسال عروض الأسعار والملفات تلقائيًا', performance: 89, engine: 'Smart Execution Engine' },
    { id: 7, name: 'وكيل الجدولة التلقائية', specialization: 'Smart Execution Engine - حجز الاجتماعات تلقائيًا مع خيارات ذكية', performance: 93, engine: 'Smart Execution Engine' },
    { id: 8, name: 'وكيل مساعد المدفوعات', specialization: 'Smart Execution Engine - إرسال وتتبع عمليات الدفع', performance: 91, engine: 'Smart Execution Engine' },
    { id: 9, name: 'وكيل التصعيد الذكي', specialization: 'Smart Execution Engine - تصعيد ذكي للمشرف عند الحاجة', performance: 95, engine: 'Smart Execution Engine' },
    
    // محرك الجودة والثقة - Trust & Quality Engine
    { id: 10, name: 'وكيل تحليل المشاعر', specialization: 'Trust & Quality Engine - تحليل المشاعر وتغيير الرد حسبها', performance: 97, engine: 'Trust & Quality Engine' },
    { id: 11, name: 'وكيل ضمان الجودة المباشر', specialization: 'Trust & Quality Engine - مراقبة جودة الرد في الوقت الحقيقي', performance: 99, engine: 'Trust & Quality Engine' },
    { id: 12, name: 'وكيل المتابعة الاحترافية', specialization: 'Trust & Quality Engine - متابعة العملاء بعد المحادثة', performance: 90, engine: 'Trust & Quality Engine' },
    { id: 13, name: 'وكيل حلقة التحسين', specialization: 'Trust & Quality Engine - جمع التقييمات وتحسين النظام آليًا', performance: 94, engine: 'Trust & Quality Engine' },
    
    // محرك التكامل والتحكم - Integration & Control Engine
    { id: 14, name: 'وكيل التكامل مع CRM', specialization: 'Integration & Control Engine - مزامنة المحادثات مع بيانات العميل', performance: 96, engine: 'Integration & Control Engine' },
    { id: 15, name: 'وكيل توحيد القنوات', specialization: 'Integration & Control Engine - توحيد المحادثات عبر الواتساب والمكالمات والإيميلات', performance: 93, engine: 'Integration & Control Engine' },
    { id: 16, name: 'وكيل الأمان والامتثال', specialization: 'Integration & Control Engine - ضمان الخصوصية والامتثال (GDPR - نظام سعودي)', performance: 100, engine: 'Integration & Control Engine' },
    { id: 17, name: 'وكيل التحليلات المتقدمة', specialization: 'Integration & Control Engine - تقارير حية للأداء والرضا', performance: 95, engine: 'Integration & Control Engine' },
    
    // محرك التميز العالمي - Global Experience Engine
    { id: 18, name: 'وكيل الصوت الذكي', specialization: 'Global Experience Engine - الرد بالصوت البشري الطبيعي في المكالمات', performance: 98, engine: 'Global Experience Engine' },
    { id: 19, name: 'وكيل اللغات واللهجات', specialization: 'Global Experience Engine - التحدث بلهجات متعددة حسب العميل', performance: 94, engine: 'Global Experience Engine' },
    { id: 20, name: 'وكيل التطوير الذاتي', specialization: 'Global Experience Engine - تطوير ذاتي للنظام بناء على الأداء', performance: 92, engine: 'Global Experience Engine' },
    { id: 21, name: 'وكيل العملاء المميزين', specialization: 'Global Experience Engine - تخصيص وكيل دائم للعملاء المهمين', performance: 99, engine: 'Global Experience Engine' }
  ];

  return globalAgents.map(agent => ({
    ...agent,
    avatar: `https://images.unsplash.com/photo-${1500000000 + agent.id}?w=128&h=128&fit=crop&crop=face`,
    activeDeals: Math.floor(Math.random() * 8) + 2,
    conversionRate: agent.performance,
    isActive: true,
    status: 'active',
    capabilities: ['multilingual', 'voice', 'chat', 'automation'],
    description: `وكيل متخصص في ${agent.specialization.split(' - ')[1]}`,
    _id: `global_agent_${agent.id}`,
    createdAt: new Date()
  }));
}

export const globalSystemStats = {
  totalAgents: 21,
  engines: 5,
  averagePerformance: 94.3,
  version: '9.0',
  deploymentDate: new Date().toISOString()
};