/**
 * Working Agents System - نظام الوكلاء العامل
 * System for making 21 agents work in interactive chat
 */

export interface WorkingAgent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  status: 'active' | 'busy' | 'offline';
  performance: number;
  capabilities: string[];
  engine: string;
  activeDeals: number;
}

export function getWorkingAgentsSystem(): WorkingAgent[] {
  return [
    {
      id: 'agent_1',
      name: 'سارة المحلل',
      role: 'محلل البيانات',
      specialization: 'تحليل سلوك العملاء',
      status: 'active',
      performance: 92,
      capabilities: ['تحليل البيانات', 'التنبؤ', 'التقارير'],
      engine: 'Analytics Engine',
      activeDeals: 12
    },
    {
      id: 'agent_2',
      name: 'أحمد المطور',
      role: 'مطور الأتمتة',
      specialization: 'تطوير سير العمل',
      status: 'active',
      performance: 88,
      capabilities: ['الأتمتة', 'التطوير', 'التكامل'],
      engine: 'Development Engine',
      activeDeals: 8
    },
    {
      id: 'agent_3',
      name: 'فاطمة الدعم',
      role: 'أخصائي دعم العملاء',
      specialization: 'خدمة العملاء الذكية',
      status: 'active',
      performance: 95,
      capabilities: ['الدعم', 'حل المشاكل', 'التواصل'],
      engine: 'Support Engine',
      activeDeals: 15
    },
    {
      id: 'agent_4',
      name: 'وكيل الذاكرة التفاعلية',
      role: 'مساعد ذكي',
      specialization: 'الذاكرة وحفظ السياق',
      status: 'active',
      performance: 89,
      capabilities: ['الذاكرة', 'السياق', 'التذكر'],
      engine: 'Memory Engine',
      activeDeals: 6
    },
    {
      id: 'agent_5',
      name: 'وكيل تخصيص النبرة',
      role: 'مختص تواصل',
      specialization: 'تخصيص أسلوب التواصل',
      status: 'active',
      performance: 91,
      capabilities: ['النبرة', 'الأسلوب', 'التخصيص'],
      engine: 'Tone Engine',
      activeDeals: 10
    },
    {
      id: 'agent_6',
      name: 'وكيل العروض الذكية',
      role: 'مختص مبيعات',
      specialization: 'إنشاء العروض الذكية',
      status: 'active',
      performance: 93,
      capabilities: ['العروض', 'التسعير', 'التفاوض'],
      engine: 'Offers Engine',
      activeDeals: 18
    },
    {
      id: 'agent_7',
      name: 'وكيل الجدولة التلقائية',
      role: 'منسق المواعيد',
      specialization: 'إدارة المواعيد والجدولة',
      status: 'active',
      performance: 87,
      capabilities: ['الجدولة', 'المواعيد', 'التنسيق'],
      engine: 'Scheduling Engine',
      activeDeals: 7
    },
    {
      id: 'agent_8',
      name: 'وكيل مساعد المدفوعات',
      role: 'مختص مالي',
      specialization: 'إدارة المدفوعات والفواتير',
      status: 'active',
      performance: 90,
      capabilities: ['المدفوعات', 'الفواتير', 'المحاسبة'],
      engine: 'Payment Engine',
      activeDeals: 11
    },
    {
      id: 'agent_9',
      name: 'وكيل التصعيد الذكي',
      role: 'مدير الحالات',
      specialization: 'تصعيد القضايا المعقدة',
      status: 'active',
      performance: 86,
      capabilities: ['التصعيد', 'الإدارة', 'المتابعة'],
      engine: 'Escalation Engine',
      activeDeals: 4
    },
    {
      id: 'agent_10',
      name: 'وكيل تحليل المشاعر',
      role: 'محلل نفسي',
      specialization: 'فهم مشاعر العملاء',
      status: 'active',
      performance: 94,
      capabilities: ['المشاعر', 'التحليل', 'الفهم'],
      engine: 'Sentiment Engine',
      activeDeals: 9
    },
    {
      id: 'agent_11',
      name: 'وكيل ضمان الجودة المباشر',
      role: 'مراقب جودة',
      specialization: 'ضمان جودة الخدمة',
      status: 'active',
      performance: 92,
      capabilities: ['الجودة', 'المراقبة', 'التحسين'],
      engine: 'Quality Engine',
      activeDeals: 13
    },
    {
      id: 'agent_12',
      name: 'وكيل المتابعة الاحترافية',
      role: 'مختص متابعة',
      specialization: 'متابعة العملاء المستمرة',
      status: 'active',
      performance: 88,
      capabilities: ['المتابعة', 'التواصل', 'العلاقات'],
      engine: 'Follow-up Engine',
      activeDeals: 16
    },
    {
      id: 'agent_13',
      name: 'وكيل حلقة التحسين',
      role: 'مطور عمليات',
      specialization: 'تحسين العمليات المستمر',
      status: 'active',
      performance: 85,
      capabilities: ['التحسين', 'التطوير', 'الكفاءة'],
      engine: 'Improvement Engine',
      activeDeals: 5
    },
    {
      id: 'agent_14',
      name: 'وكيل التكامل مع CRM',
      role: 'مختص تقني',
      specialization: 'ربط أنظمة CRM',
      status: 'active',
      performance: 91,
      capabilities: ['التكامل', 'CRM', 'البيانات'],
      engine: 'CRM Engine',
      activeDeals: 8
    },
    {
      id: 'agent_15',
      name: 'وكيل توحيد القنوات',
      role: 'منسق قنوات',
      specialization: 'توحيد قنوات التواصل',
      status: 'active',
      performance: 89,
      capabilities: ['التوحيد', 'القنوات', 'التنسيق'],
      engine: 'Channels Engine',
      activeDeals: 12
    },
    {
      id: 'agent_16',
      name: 'وكيل الأمان والامتثال',
      role: 'مختص أمان',
      specialization: 'ضمان الأمان والامتثال',
      status: 'active',
      performance: 96,
      capabilities: ['الأمان', 'الامتثال', 'الحماية'],
      engine: 'Security Engine',
      activeDeals: 3
    },
    {
      id: 'agent_17',
      name: 'وكيل التحليلات المتقدمة',
      role: 'محلل متقدم',
      specialization: 'تحليلات متقدمة وذكية',
      status: 'active',
      performance: 93,
      capabilities: ['التحليلات', 'الذكاء', 'البيانات'],
      engine: 'Advanced Analytics Engine',
      activeDeals: 14
    },
    {
      id: 'agent_18',
      name: 'وكيل الصوت الذكي',
      role: 'مختص صوتي',
      specialization: 'المكالمات الصوتية الذكية',
      status: 'active',
      performance: 87,
      capabilities: ['الصوت', 'المكالمات', 'التحدث'],
      engine: 'Voice Engine',
      activeDeals: 11
    },
    {
      id: 'agent_19',
      name: 'وكيل اللغات واللهجات',
      role: 'خبير لغوي',
      specialization: 'دعم اللغات واللهجات المتعددة',
      status: 'active',
      performance: 90,
      capabilities: ['اللغات', 'اللهجات', 'الترجمة'],
      engine: 'Language Engine',
      activeDeals: 7
    },
    {
      id: 'agent_20',
      name: 'وكيل التطوير الذاتي',
      role: 'مطور ذاتي',
      specialization: 'التعلم والتطوير المستمر',
      status: 'active',
      performance: 84,
      capabilities: ['التعلم', 'التطوير', 'التحديث'],
      engine: 'Self-Development Engine',
      activeDeals: 6
    },
    {
      id: 'agent_21',
      name: 'وكيل العملاء المميزين',
      role: 'مدير علاقات VIP',
      specialization: 'خدمة العملاء المميزين',
      status: 'active',
      performance: 97,
      capabilities: ['VIP', 'العلاقات', 'الخدمة المميزة'],
      engine: 'VIP Engine',
      activeDeals: 20
    }
  ];
}

export function getAgentBySpecialization(specialization: string): WorkingAgent | null {
  const agents = getWorkingAgentsSystem();
  return agents.find(agent => 
    agent.specialization.includes(specialization) || 
    agent.capabilities.some(cap => cap.includes(specialization))
  ) || null;
}

export function getAgentStats() {
  const agents = getWorkingAgentsSystem();
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgPerformance = agents.reduce((sum, a) => sum + a.performance, 0) / totalAgents;
  const totalDeals = agents.reduce((sum, a) => sum + a.activeDeals, 0);
  
  return {
    totalAgents,
    activeAgents,
    avgPerformance: Math.round(avgPerformance * 10) / 10,
    totalDeals
  };
}