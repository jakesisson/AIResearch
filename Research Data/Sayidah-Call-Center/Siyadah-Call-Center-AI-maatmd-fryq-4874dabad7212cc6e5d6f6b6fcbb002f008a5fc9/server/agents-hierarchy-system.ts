// نظام الهيكل الإداري للوكلاء الذكية - سيادة AI
// Management Hierarchy System for 21 Smart Agents

export interface AgentManager {
  id: string;
  name: string;
  title: string;
  level: 'CEO' | 'Director' | 'Manager' | 'Supervisor' | 'Team Lead';
  department: string;
  managedAgents: string[];
  responsibilities: string[];
  performance: number;
  experience: string;
  specialization: string;
}

export interface AgentSupervisor {
  id: string;
  name: string;
  title: string;
  department: string;
  supervisedAgents: string[];
  managerReportsTo: string;
  responsibilities: string[];
  performance: number;
}

// الرئيس التنفيذي للوكلاء
export const CEO_AGENT: AgentManager = {
  id: 'ceo_001',
  name: 'الدكتور محمد العليا',
  title: 'الرئيس التنفيذي للذكاء الاصطناعي',
  level: 'CEO',
  department: 'Executive Leadership',
  managedAgents: ['dir_001', 'dir_002', 'dir_003', 'dir_004', 'dir_005'],
  responsibilities: [
    'الإشراف العام على جميع العمليات الذكية',
    'وضع الاستراتيجيات طويلة المدى',
    'اتخاذ القرارات الحرجة',
    'ضمان التوافق مع أهداف الشركة'
  ],
  performance: 98,
  experience: '15+ سنة في الذكاء الاصطناعي',
  specialization: 'القيادة الاستراتيجية والذكاء الاصطناعي'
};

// مدراء الأقسام الخمسة
export const DEPARTMENT_DIRECTORS: AgentManager[] = [
  {
    id: 'dir_001',
    name: 'الدكتورة نورا الفهم',
    title: 'مديرة قسم الفهم البشري',
    level: 'Director',
    department: 'Human Understanding Engine',
    managedAgents: ['mgr_001'],
    responsibilities: [
      'إدارة محرك الفهم البشري',
      'تطوير خوارزميات فهم المشاعر',
      'ضمان التفاعل الطبيعي مع العملاء'
    ],
    performance: 96,
    experience: '12 سنة في معالجة اللغات الطبيعية',
    specialization: 'الفهم البشري وتحليل المشاعر'
  },
  {
    id: 'dir_002',
    name: 'المهندس خالد التنفيذ',
    title: 'مدير قسم التنفيذ الذكي',
    level: 'Director',
    department: 'Smart Execution Engine',
    managedAgents: ['mgr_002'],
    responsibilities: [
      'إدارة عمليات التنفيذ التلقائي',
      'تحسين كفاءة العمليات',
      'ضمان سرعة الاستجابة'
    ],
    performance: 94,
    experience: '10 سنوات في الأتمتة الذكية',
    specialization: 'التنفيذ التلقائي والأتمتة'
  },
  {
    id: 'dir_003',
    name: 'الدكتور عبدالله الجودة',
    title: 'مدير قسم الجودة والثقة',
    level: 'Director',
    department: 'Trust & Quality Engine',
    managedAgents: ['mgr_003'],
    responsibilities: [
      'ضمان أعلى معايير الجودة',
      'مراقبة الأداء المستمرة',
      'تطوير أنظمة الثقة'
    ],
    performance: 97,
    experience: '14 سنة في ضمان الجودة',
    specialization: 'ضمان الجودة وإدارة المخاطر'
  },
  {
    id: 'dir_004',
    name: 'المهندسة سارة التكامل',
    title: 'مديرة قسم التكامل والتحكم',
    level: 'Director',
    department: 'Integration & Control Engine',
    managedAgents: ['mgr_004'],
    responsibilities: [
      'إدارة التكامل مع الأنظمة الخارجية',
      'ضمان الأمان والامتثال',
      'تنسيق العمليات المعقدة'
    ],
    performance: 95,
    experience: '11 سنة في تكامل الأنظمة',
    specialization: 'تكامل الأنظمة والأمان السيبراني'
  },
  {
    id: 'dir_005',
    name: 'الدكتور أحمد العالمية',
    title: 'مدير قسم التميز العالمي',
    level: 'Director',
    department: 'Global Experience Engine',
    managedAgents: ['mgr_005'],
    responsibilities: [
      'قيادة التجربة العالمية',
      'تطوير الحلول متعددة اللغات',
      'ضمان التميز التنافسي'
    ],
    performance: 93,
    experience: '13 سنة في التطوير العالمي',
    specialization: 'التجربة العالمية واللغات المتعددة'
  }
];

// مدراء المجموعات
export const GROUP_MANAGERS: AgentManager[] = [
  {
    id: 'mgr_001',
    name: 'أستاذة فاطمة الذكية',
    title: 'مدير مجموعة الفهم البشري',
    level: 'Manager',
    department: 'Human Understanding Engine',
    managedAgents: ['agent_1', 'agent_2', 'agent_3', 'agent_4', 'agent_5'],
    responsibilities: [
      'الإشراف المباشر على وكلاء الفهم البشري',
      'تطوير مهارات التحليل',
      'ضمان فهم احتياجات العملاء'
    ],
    performance: 92,
    experience: '8 سنوات في إدارة الفرق الذكية',
    specialization: 'إدارة الفرق وتطوير المهارات'
  },
  {
    id: 'mgr_002',
    name: 'المهندس يوسف السريع',
    title: 'مدير مجموعة التنفيذ الذكي',
    level: 'Manager',
    department: 'Smart Execution Engine',
    managedAgents: ['agent_6', 'agent_7', 'agent_8', 'agent_9'],
    responsibilities: [
      'إدارة عمليات التنفيذ السريع',
      'تحسين أوقات الاستجابة',
      'ضمان دقة التنفيذ'
    ],
    performance: 90,
    experience: '7 سنوات في إدارة العمليات',
    specialization: 'إدارة العمليات والتحسين المستمر'
  },
  {
    id: 'mgr_003',
    name: 'الدكتورة هند المتميزة',
    title: 'مدير مجموعة الجودة والثقة',
    level: 'Manager',
    department: 'Trust & Quality Engine',
    managedAgents: ['agent_10', 'agent_11', 'agent_12', 'agent_13'],
    responsibilities: [
      'مراقبة معايير الجودة',
      'تطوير أنظمة المراجعة',
      'ضمان رضا العملاء'
    ],
    performance: 94,
    experience: '9 سنوات في ضمان الجودة',
    specialization: 'ضمان الجودة ورضا العملاء'
  },
  {
    id: 'mgr_004',
    name: 'المهندس علي المتصل',
    title: 'مدير مجموعة التكامل والتحكم',
    level: 'Manager',
    department: 'Integration & Control Engine',
    managedAgents: ['agent_14', 'agent_15', 'agent_16', 'agent_17'],
    responsibilities: [
      'إدارة التكامل مع الأنظمة',
      'ضمان الأمان السيبراني',
      'مراقبة الأداء المستمر'
    ],
    performance: 91,
    experience: '6 سنوات في التكامل التقني',
    specialization: 'التكامل التقني والأمان'
  },
  {
    id: 'mgr_005',
    name: 'الأستاذة زينب العالمية',
    title: 'مدير مجموعة التميز العالمي',
    level: 'Manager',
    department: 'Global Experience Engine',
    managedAgents: ['agent_18', 'agent_19', 'agent_20', 'agent_21'],
    responsibilities: [
      'قيادة التجربة العالمية',
      'تطوير الحلول متعددة اللغات',
      'ضمان التميز التنافسي'
    ],
    performance: 89,
    experience: '8 سنوات في التطوير العالمي',
    specialization: 'التجربة العالمية والتطوير الثقافي'
  }
];

// مشرفون تقنيون
export const SUPERVISORS: AgentSupervisor[] = [
  {
    id: 'sup_001',
    name: 'المهندس ماجد المراقب',
    title: 'مشرف تقني - المحرك البشري',
    department: 'Human Understanding Engine',
    supervisedAgents: ['agent_1', 'agent_2', 'agent_3'],
    managerReportsTo: 'mgr_001',
    responsibilities: [
      'المراقبة التقنية اليومية',
      'حل المشاكل الفورية',
      'تقارير الأداء اليومية'
    ],
    performance: 87
  },
  {
    id: 'sup_002',
    name: 'المهندسة لينا السريعة',
    title: 'مشرف تقني - التنفيذ الذكي',
    department: 'Smart Execution Engine',
    supervisedAgents: ['agent_6', 'agent_7'],
    managerReportsTo: 'mgr_002',
    responsibilities: [
      'مراقبة سرعة التنفيذ',
      'تحسين الأداء',
      'ضمان الاستقرار'
    ],
    performance: 85
  },
  {
    id: 'sup_003',
    name: 'الدكتور كريم الدقيق',
    title: 'مشرف تقني - الجودة والثقة',
    department: 'Trust & Quality Engine',
    supervisedAgents: ['agent_10', 'agent_11'],
    managerReportsTo: 'mgr_003',
    responsibilities: [
      'مراجعة معايير الجودة',
      'اختبار الأداء',
      'تحليل التغذية الراجعة'
    ],
    performance: 88
  },
  {
    id: 'sup_004',
    name: 'المهندس طارق الآمن',
    title: 'مشرف تقني - التكامل والأمان',
    department: 'Integration & Control Engine',
    supervisedAgents: ['agent_14', 'agent_15', 'agent_16'],
    managerReportsTo: 'mgr_004',
    responsibilities: [
      'مراقبة الأمان السيبراني',
      'ضمان التكامل السليم',
      'إدارة المخاطر التقنية'
    ],
    performance: 90
  },
  {
    id: 'sup_005',
    name: 'الأستاذة ريم المتقنة',
    title: 'مشرف تقني - التميز العالمي',
    department: 'Global Experience Engine',
    supervisedAgents: ['agent_18', 'agent_19'],
    managerReportsTo: 'mgr_005',
    responsibilities: [
      'ضمان جودة التجربة العالمية',
      'مراقبة الأداء متعدد اللغات',
      'تحسين التفاعل الثقافي'
    ],
    performance: 86
  }
];

// دالة للحصول على الهيكل الإداري الكامل
export function getCompleteHierarchy() {
  return {
    ceo: CEO_AGENT,
    directors: DEPARTMENT_DIRECTORS,
    managers: GROUP_MANAGERS,
    supervisors: SUPERVISORS,
    totalManagementLevels: 4,
    totalManagers: 1 + 5 + 5 + 5, // CEO + Directors + Managers + Supervisors
    managementRatio: '16 مدير لـ 21 وكيل ذكي'
  };
}

// دالة للحصول على هيكل قسم معين
export function getDepartmentHierarchy(department: string) {
  const director = DEPARTMENT_DIRECTORS.find(d => d.department === department);
  const manager = GROUP_MANAGERS.find(m => m.department === department);
  const supervisor = SUPERVISORS.find(s => s.department === department);
  
  return {
    director,
    manager,
    supervisor,
    structure: `${director?.name} → ${manager?.name} → ${supervisor?.name}`
  };
}

// دالة للحصول على إحصائيات الإدارة
export function getManagementStats() {
  const allManagers = [CEO_AGENT, ...DEPARTMENT_DIRECTORS, ...GROUP_MANAGERS];
  const avgPerformance = allManagers.reduce((sum, m) => sum + m.performance, 0) / allManagers.length;
  
  return {
    totalCEO: 1,
    totalDirectors: DEPARTMENT_DIRECTORS.length,
    totalManagers: GROUP_MANAGERS.length,
    totalSupervisors: SUPERVISORS.length,
    avgManagerPerformance: Math.round(avgPerformance * 10) / 10,
    managementLevels: 4,
    spanOfControl: '4-5 وكلاء لكل مدير'
  };
}

// دالة للحصول على سلسلة القيادة لوكيل معين
export function getAgentChainOfCommand(agentId: string) {
  // البحث عن المدير المباشر
  const manager = GROUP_MANAGERS.find(m => m.managedAgents.includes(agentId));
  if (!manager) return null;
  
  // البحث عن المدير العام
  const director = DEPARTMENT_DIRECTORS.find(d => d.department === manager.department);
  
  // البحث عن المشرف التقني
  const supervisor = SUPERVISORS.find(s => s.supervisedAgents.includes(agentId));
  
  return {
    agent: agentId,
    supervisor: supervisor?.name || 'غير محدد',
    manager: manager.name,
    director: director?.name,
    ceo: CEO_AGENT.name,
    chainOfCommand: `${CEO_AGENT.name} → ${director?.name} → ${manager.name} → ${supervisor?.name || 'مباشر'} → الوكيل ${agentId}`
  };
}

export default {
  getCompleteHierarchy,
  getDepartmentHierarchy,
  getManagementStats,
  getAgentChainOfCommand,
  CEO_AGENT,
  DEPARTMENT_DIRECTORS,
  GROUP_MANAGERS,
  SUPERVISORS
};