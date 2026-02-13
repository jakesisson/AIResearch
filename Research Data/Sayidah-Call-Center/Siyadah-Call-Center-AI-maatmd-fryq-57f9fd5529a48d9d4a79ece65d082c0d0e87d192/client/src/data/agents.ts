
export interface Agent {
  id: number;
  name: string;
  role: string;
  specialization: string;
  avatar: string;
  status: string;
  activeDeals: number;
  conversionRate: number;
  totalDeals: number;
  revenue: string;
  avgDealSize: string;
  responseTime: string;
  skills: string[];
  recentActivities: Array<{
    type: string;
    description: string;
    time: string;
  }>;
  performance: {
    thisMonth: number;
    lastMonth: number;
    thisQuarter: number;
  };
}

export const agents: Agent[] = [
  {
    id: 1,
    name: "سارة المبيعات",
    role: "متخصصة المبيعات",
    specialization: "تأهيل العملاء",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
    status: "نشطة",
    activeDeals: 3,
    conversionRate: 85,
    totalDeals: 47,
    revenue: "1.2M ريال",
    avgDealSize: "25.5K ريال",
    responseTime: "2.3 دقيقة",
    skills: ["تأهيل العملاء", "التفاوض", "إدارة العلاقات"],
    recentActivities: [
      { type: "deal", description: "أغلقت صفقة مع شركة التقنية المتقدمة", time: "منذ ساعتين" },
      { type: "call", description: "اتصال متابعة مع عميل محتمل", time: "منذ 4 ساعات" },
      { type: "email", description: "أرسلت عرض سعر مخصص", time: "منذ يوم" }
    ],
    performance: {
      thisMonth: 92,
      lastMonth: 88,
      thisQuarter: 89
    }
  },
  {
    id: 2,
    name: "أحمد التطوير",
    role: "محلل الأعمال",
    specialization: "الحلول التقنية",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxواG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
    status: "يعمل",
    activeDeals: 1,
    conversionRate: 92,
    totalDeals: 23,
    revenue: "800K ريال",
    avgDealSize: "34.8K ريال",
    responseTime: "1.8 دقيقة",
    skills: ["تحليل البيانات", "التحليل التقني", "استراتيجية الأعمال"],
    recentActivities: [
      { type: "analysis", description: "أنجز تحليل شامل للسوق", time: "منذ 30 دقيقة" },
      { type: "report", description: "أنشأ تقرير أداء أسبوعي", time: "منذ 3 ساعات" },
      { type: "meeting", description: "اجتماع استراتيجي مع الفريق", time: "منذ يوم" }
    ],
    performance: {
      thisMonth: 94,
      lastMonth: 91,
      thisQuarter: 93
    }
  },
  {
    id: 3,
    name: "فاطمة الدعم",
    role: "أخصائية خدمة العملاء",
    specialization: "دعم العملاء",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxواG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
    status: "متاحة",
    activeDeals: 0,
    conversionRate: 96,
    totalDeals: 156,
    revenue: "N/A",
    avgDealSize: "N/A",
    responseTime: "45 ثانية",
    skills: ["خدمة العملاء", "حل المشاكل", "التواصل"],
    recentActivities: [
      { type: "ticket", description: "حلت 5 تذاكر دعم", time: "منذ ساعة" },
      { type: "chat", description: "جلسة دردشة مع عميل", time: "منذ 2 ساعة" },
      { type: "feedback", description: "جمعت ملاحظات العملاء", time: "منذ 4 ساعات" }
    ],
    performance: {
      thisMonth: 98,
      lastMonth: 95,
      thisQuarter: 96
    }
  },
  {
    id: 4,
    name: "محمد التسويق",
    role: "متخصص التسويق الرقمي",
    specialization: "الحملات الإعلانية",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxواG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
    status: "نشط",
    activeDeals: 2,
    conversionRate: 88,
    totalDeals: 35,
    revenue: "950K ريال",
    avgDealSize: "27.1K ريال",
    responseTime: "3.2 دقيقة",
    skills: ["التسويق الرقمي", "إدارة الحملات", "تحليل البيانات"],
    recentActivities: [
      { type: "campaign", description: "أطلق حملة إعلانية جديدة", time: "منذ ساعة" },
      { type: "analysis", description: "حلل أداء الحملات السابقة", time: "منذ 3 ساعات" },
      { type: "lead", description: "تأهيل عميل محتمل جديد", time: "منذ 5 ساعات" }
    ],
    performance: {
      thisMonth: 90,
      lastMonth: 87,
      thisQuarter: 88
    }
  }
];

export const agentRoles = [
  "متخصص المبيعات",
  "محلل الأعمال", 
  "أخصائي خدمة العملاء",
  "متخصص التسويق الرقمي",
  "مطور الحلول",
  "محلل البيانات"
];

export const agentSkills = [
  "تأهيل العملاء",
  "التفاوض",
  "إدارة العلاقات",
  "تحليل البيانات",
  "التحليل التقني",
  "استراتيجية الأعمال",
  "خدمة العملاء",
  "حل المشاكل",
  "التواصل",
  "التسويق الرقمي",
  "إدارة الحملات"
];
