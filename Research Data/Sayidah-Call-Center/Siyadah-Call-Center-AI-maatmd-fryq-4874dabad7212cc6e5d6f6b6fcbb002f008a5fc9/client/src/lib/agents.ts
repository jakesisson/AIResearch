// مكتبة الوكلاء الذكيين المحدثة

export interface Agent {
  id: string;
  name: string;
  role: string;
  performance: number;
  status: 'نشط' | 'غير نشط' | 'صيانة';
  avatar: string;
  specializations: string[];
  tasksCompleted: number;
  successRate: number;
  responseTime: string;
  currentTasks: string[];
  lastActivity: string;
  monthlyRevenue: number;
  efficiency: number;
}

export const agents: Agent[] = [
  {
    id: '1',
    name: 'سارة المختصة',
    role: 'مختصة المبيعات',
    performance: 92,
    status: 'نشط',
    avatar: '/api/placeholder/40/40',
    specializations: ['المبيعات', 'خدمة العملاء', 'التفاوض'],
    tasksCompleted: 157,
    successRate: 94,
    responseTime: '2.3 دقيقة',
    currentTasks: ['متابعة عميل جديد', 'إعداد عرض سعر'],
    lastActivity: 'منذ 5 دقائق',
    monthlyRevenue: 45000,
    efficiency: 96
  },
  {
    id: '2',
    name: 'أحمد المحلل',
    role: 'محلل البيانات',
    performance: 88,
    status: 'نشط',
    avatar: '/api/placeholder/40/40',
    specializations: ['تحليل البيانات', 'التقارير', 'التنبؤات'],
    tasksCompleted: 134,
    successRate: 91,
    responseTime: '1.8 دقيقة',
    currentTasks: ['تحليل مبيعات الشهر', 'إعداد تقرير أداء'],
    lastActivity: 'منذ 12 دقيقة',
    monthlyRevenue: 38000,
    efficiency: 89
  },
  {
    id: '3',
    name: 'فاطمة المساعدة',
    role: 'مساعدة العملاء',
    performance: 95,
    status: 'نشط',
    avatar: '/api/placeholder/40/40',
    specializations: ['دعم العملاء', 'حل المشاكل', 'التواصل'],
    tasksCompleted: 203,
    successRate: 97,
    responseTime: '1.2 دقيقة',
    currentTasks: ['الرد على استفسارات', 'معالجة شكوى'],
    lastActivity: 'منذ دقيقتين',
    monthlyRevenue: 28000,
    efficiency: 98
  }
];

export const getAgentById = (id: string): Agent | undefined => {
  return agents.find(agent => agent.id === id);
};

export const getActiveAgents = (): Agent[] => {
  return agents.filter(agent => agent.status === 'نشط');
};

export const getAgentPerformanceAverage = (): number => {
  return agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length;
};

export const getTotalTasksCompleted = (): number => {
  return agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
};

export const getTotalMonthlyRevenue = (): number => {
  return agents.reduce((sum, agent) => sum + agent.monthlyRevenue, 0);
};