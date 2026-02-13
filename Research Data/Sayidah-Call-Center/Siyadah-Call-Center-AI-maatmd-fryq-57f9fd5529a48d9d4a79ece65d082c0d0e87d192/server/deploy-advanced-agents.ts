import mongoose, { Schema, Document } from 'mongoose';
import { connectToMongoDB } from './mongodb';

/**
 * Deploy 20+ Specialized AI Agents System
 * Each agent has unique capabilities and specialization
 */

export interface AIAgent extends Document {
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  specialization: string;
  specializationAr: string;
  capabilities: string[];
  capabilitiesAr: string[];
  performance: number;
  status: 'active' | 'training' | 'offline';
  created: Date;
  lastActive: Date;
  tasksCompleted: number;
  successRate: number;
  languages: string[];
  integrations: string[];
  aiModel: string;
  organizationId?: string;
  deployedAt?: Date;
}

// Create Mongoose schema
const AIAgentSchema = new Schema<AIAgent>({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  role: { type: String, required: true },
  roleAr: { type: String, required: true },
  specialization: { type: String, required: true },
  specializationAr: { type: String, required: true },
  capabilities: [{ type: String }],
  capabilitiesAr: [{ type: String }],
  performance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'training', 'offline'], default: 'active' },
  created: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  tasksCompleted: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  languages: [{ type: String }],
  integrations: [{ type: String }],
  aiModel: { type: String, default: 'gpt-4o' },
  organizationId: { type: String },
  deployedAt: { type: Date, default: Date.now }
});

// Create model
export const AIAgentModel = mongoose.model<AIAgent>('AIAgent', AIAgentSchema);

// Define agent data without Document methods
interface AIAgentData {
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  specialization: string;
  specializationAr: string;
  capabilities: string[];
  capabilitiesAr: string[];
  performance: number;
  status: 'active' | 'training' | 'offline';
  created: Date;
  lastActive: Date;
  tasksCompleted: number;
  successRate: number;
  languages: string[];
  integrations: string[];
  aiModel: string;
  organizationId?: string;
}

export const SPECIALIZED_AI_AGENTS: AIAgentData[] = [
  // Sales & Marketing Agents
  {
    name: 'Sarah Sales',
    nameAr: 'سارة المبيعات',
    role: 'Sales Manager',
    roleAr: 'مديرة المبيعات',
    specialization: 'Lead Generation & Conversion',
    specializationAr: 'توليد العملاء المحتملين والتحويل',
    capabilities: [
      'Qualify leads automatically',
      'Schedule sales meetings',
      'Send personalized follow-ups',
      'Track sales pipeline',
      'Generate sales reports'
    ],
    capabilitiesAr: [
      'تأهيل العملاء المحتملين تلقائياً',
      'جدولة اجتماعات المبيعات',
      'إرسال متابعات شخصية',
      'تتبع مسار المبيعات',
      'إنشاء تقارير المبيعات'
    ],
    performance: 92,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1250,
    successRate: 89.5,
    languages: ['ar', 'en'],
    integrations: ['WhatsApp', 'Email', 'CRM'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Mohammed Marketing',
    nameAr: 'محمد التسويق',
    role: 'Marketing Strategist',
    roleAr: 'استراتيجي التسويق',
    specialization: 'Campaign Management & Analytics',
    specializationAr: 'إدارة الحملات والتحليلات',
    capabilities: [
      'Create marketing campaigns',
      'Analyze campaign performance',
      'Segment customer base',
      'Generate content ideas',
      'Optimize ad spending'
    ],
    capabilitiesAr: [
      'إنشاء حملات تسويقية',
      'تحليل أداء الحملات',
      'تقسيم قاعدة العملاء',
      'توليد أفكار المحتوى',
      'تحسين الإنفاق الإعلاني'
    ],
    performance: 88,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 890,
    successRate: 87.2,
    languages: ['ar', 'en'],
    integrations: ['Social Media', 'Email', 'Analytics'],
    aiModel: 'gpt-4o'
  },
  
  // Customer Service Agents
  {
    name: 'Fatima Support',
    nameAr: 'فاطمة الدعم',
    role: 'Customer Support Lead',
    roleAr: 'رئيسة دعم العملاء',
    specialization: 'Customer Issue Resolution',
    specializationAr: 'حل مشاكل العملاء',
    capabilities: [
      'Handle customer inquiries 24/7',
      'Resolve technical issues',
      'Process refunds and returns',
      'Escalate complex issues',
      'Track customer satisfaction'
    ],
    capabilitiesAr: [
      'معالجة استفسارات العملاء على مدار الساعة',
      'حل المشاكل التقنية',
      'معالجة المرتجعات والاستردادات',
      'تصعيد المشاكل المعقدة',
      'تتبع رضا العملاء'
    ],
    performance: 95,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 3450,
    successRate: 94.1,
    languages: ['ar', 'en'],
    integrations: ['WhatsApp', 'Email', 'Chat'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Abdullah Assistant',
    nameAr: 'عبدالله المساعد',
    role: 'Virtual Assistant',
    roleAr: 'المساعد الافتراضي',
    specialization: 'Task Automation & Scheduling',
    specializationAr: 'أتمتة المهام والجدولة',
    capabilities: [
      'Schedule appointments',
      'Send reminders',
      'Manage calendar',
      'Book travel arrangements',
      'Coordinate meetings'
    ],
    capabilitiesAr: [
      'جدولة المواعيد',
      'إرسال التذكيرات',
      'إدارة التقويم',
      'حجز ترتيبات السفر',
      'تنسيق الاجتماعات'
    ],
    performance: 91,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 2100,
    successRate: 90.3,
    languages: ['ar', 'en'],
    integrations: ['Calendar', 'Email', 'SMS'],
    aiModel: 'gpt-4o'
  },
  
  // Finance & Operations Agents
  {
    name: 'Noor Finance',
    nameAr: 'نور المالية',
    role: 'Financial Analyst',
    roleAr: 'المحللة المالية',
    specialization: 'Financial Planning & Analysis',
    specializationAr: 'التخطيط والتحليل المالي',
    capabilities: [
      'Generate financial reports',
      'Track expenses and revenue',
      'Create budget forecasts',
      'Analyze cash flow',
      'Monitor KPIs'
    ],
    capabilitiesAr: [
      'إنشاء التقارير المالية',
      'تتبع المصروفات والإيرادات',
      'إنشاء توقعات الميزانية',
      'تحليل التدفق النقدي',
      'مراقبة مؤشرات الأداء'
    ],
    performance: 93,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1580,
    successRate: 92.7,
    languages: ['ar', 'en'],
    integrations: ['Accounting', 'Banking', 'Reports'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Khalid Operations',
    nameAr: 'خالد العمليات',
    role: 'Operations Manager',
    roleAr: 'مدير العمليات',
    specialization: 'Process Optimization',
    specializationAr: 'تحسين العمليات',
    capabilities: [
      'Optimize workflows',
      'Monitor team performance',
      'Identify bottlenecks',
      'Implement automation',
      'Track productivity'
    ],
    capabilitiesAr: [
      'تحسين سير العمل',
      'مراقبة أداء الفريق',
      'تحديد نقاط الاختناق',
      'تنفيذ الأتمتة',
      'تتبع الإنتاجية'
    ],
    performance: 90,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1120,
    successRate: 88.9,
    languages: ['ar', 'en'],
    integrations: ['Workflow', 'Analytics', 'Reports'],
    aiModel: 'gpt-4o'
  },
  
  // HR & Recruitment Agents
  {
    name: 'Layla HR',
    nameAr: 'ليلى الموارد البشرية',
    role: 'HR Specialist',
    roleAr: 'أخصائية الموارد البشرية',
    specialization: 'Talent Management',
    specializationAr: 'إدارة المواهب',
    capabilities: [
      'Screen job applications',
      'Schedule interviews',
      'Onboard new employees',
      'Track employee performance',
      'Manage leave requests'
    ],
    capabilitiesAr: [
      'فحص طلبات التوظيف',
      'جدولة المقابلات',
      'إدماج الموظفين الجدد',
      'تتبع أداء الموظفين',
      'إدارة طلبات الإجازة'
    ],
    performance: 89,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 950,
    successRate: 87.4,
    languages: ['ar', 'en'],
    integrations: ['HRIS', 'Email', 'Calendar'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Ahmed Recruiter',
    nameAr: 'أحمد التوظيف',
    role: 'Recruitment Specialist',
    roleAr: 'أخصائي التوظيف',
    specialization: 'Talent Acquisition',
    specializationAr: 'اكتساب المواهب',
    capabilities: [
      'Source candidates',
      'Conduct initial screening',
      'Assess skills match',
      'Coordinate with hiring managers',
      'Track recruitment metrics'
    ],
    capabilitiesAr: [
      'البحث عن المرشحين',
      'إجراء الفحص الأولي',
      'تقييم توافق المهارات',
      'التنسيق مع مديري التوظيف',
      'تتبع مقاييس التوظيف'
    ],
    performance: 86,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 780,
    successRate: 85.2,
    languages: ['ar', 'en'],
    integrations: ['LinkedIn', 'Job Boards', 'ATS'],
    aiModel: 'gpt-4o'
  },
  
  // Technical & IT Agents
  {
    name: 'Yasir Tech',
    nameAr: 'ياسر التقني',
    role: 'Technical Support',
    roleAr: 'الدعم التقني',
    specialization: 'IT Support & Troubleshooting',
    specializationAr: 'دعم تقنية المعلومات وحل المشاكل',
    capabilities: [
      'Diagnose technical issues',
      'Provide step-by-step solutions',
      'Monitor system health',
      'Update documentation',
      'Escalate critical issues'
    ],
    capabilitiesAr: [
      'تشخيص المشاكل التقنية',
      'توفير حلول خطوة بخطوة',
      'مراقبة صحة النظام',
      'تحديث الوثائق',
      'تصعيد المشاكل الحرجة'
    ],
    performance: 91,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 2340,
    successRate: 89.8,
    languages: ['ar', 'en'],
    integrations: ['Ticketing', 'Monitoring', 'Slack'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Reem Developer',
    nameAr: 'ريم المطورة',
    role: 'Development Assistant',
    roleAr: 'مساعدة التطوير',
    specialization: 'Code Review & Documentation',
    specializationAr: 'مراجعة الكود والتوثيق',
    capabilities: [
      'Review code quality',
      'Generate documentation',
      'Suggest optimizations',
      'Find security vulnerabilities',
      'Create test cases'
    ],
    capabilitiesAr: [
      'مراجعة جودة الكود',
      'إنشاء التوثيق',
      'اقتراح التحسينات',
      'إيجاد الثغرات الأمنية',
      'إنشاء حالات الاختبار'
    ],
    performance: 88,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1650,
    successRate: 87.1,
    languages: ['ar', 'en'],
    integrations: ['GitHub', 'Jira', 'CI/CD'],
    aiModel: 'gpt-4o'
  },
  
  // Legal & Compliance Agents
  {
    name: 'Omar Legal',
    nameAr: 'عمر القانوني',
    role: 'Legal Advisor',
    roleAr: 'المستشار القانوني',
    specialization: 'Contract Review & Compliance',
    specializationAr: 'مراجعة العقود والامتثال',
    capabilities: [
      'Review contracts',
      'Ensure compliance',
      'Draft legal documents',
      'Assess risks',
      'Provide legal guidance'
    ],
    capabilitiesAr: [
      'مراجعة العقود',
      'ضمان الامتثال',
      'صياغة المستندات القانونية',
      'تقييم المخاطر',
      'تقديم الإرشاد القانوني'
    ],
    performance: 94,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 620,
    successRate: 93.2,
    languages: ['ar', 'en'],
    integrations: ['Document Management', 'Email'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Huda Compliance',
    nameAr: 'هدى الامتثال',
    role: 'Compliance Officer',
    roleAr: 'مسؤولة الامتثال',
    specialization: 'Regulatory Compliance',
    specializationAr: 'الامتثال التنظيمي',
    capabilities: [
      'Monitor regulations',
      'Audit compliance',
      'Update policies',
      'Train employees',
      'Report violations'
    ],
    capabilitiesAr: [
      'مراقبة اللوائح',
      'تدقيق الامتثال',
      'تحديث السياسات',
      'تدريب الموظفين',
      'الإبلاغ عن الانتهاكات'
    ],
    performance: 92,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 480,
    successRate: 91.5,
    languages: ['ar', 'en'],
    integrations: ['Compliance Tools', 'Reports'],
    aiModel: 'gpt-4o'
  },
  
  // Content & Creative Agents
  {
    name: 'Salma Content',
    nameAr: 'سلمى المحتوى',
    role: 'Content Creator',
    roleAr: 'منشئة المحتوى',
    specialization: 'Content Strategy & Creation',
    specializationAr: 'استراتيجية وإنشاء المحتوى',
    capabilities: [
      'Write blog posts',
      'Create social media content',
      'Develop content calendars',
      'Optimize for SEO',
      'Analyze content performance'
    ],
    capabilitiesAr: [
      'كتابة مقالات المدونة',
      'إنشاء محتوى وسائل التواصل',
      'تطوير تقويمات المحتوى',
      'التحسين لمحركات البحث',
      'تحليل أداء المحتوى'
    ],
    performance: 90,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1420,
    successRate: 88.7,
    languages: ['ar', 'en'],
    integrations: ['CMS', 'Social Media', 'Analytics'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Tariq Designer',
    nameAr: 'طارق المصمم',
    role: 'Design Assistant',
    roleAr: 'مساعد التصميم',
    specialization: 'Visual Design & Branding',
    specializationAr: 'التصميم المرئي والعلامة التجارية',
    capabilities: [
      'Create design concepts',
      'Generate color palettes',
      'Suggest layouts',
      'Review brand consistency',
      'Optimize images'
    ],
    capabilitiesAr: [
      'إنشاء مفاهيم التصميم',
      'توليد لوحات الألوان',
      'اقتراح التخطيطات',
      'مراجعة اتساق العلامة التجارية',
      'تحسين الصور'
    ],
    performance: 87,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 890,
    successRate: 86.3,
    languages: ['ar', 'en'],
    integrations: ['Design Tools', 'Asset Management'],
    aiModel: 'gpt-4o'
  },
  
  // Research & Analytics Agents
  {
    name: 'Maha Research',
    nameAr: 'مها البحث',
    role: 'Research Analyst',
    roleAr: 'محللة البحوث',
    specialization: 'Market Research & Insights',
    specializationAr: 'أبحاث السوق والرؤى',
    capabilities: [
      'Conduct market research',
      'Analyze competitors',
      'Track industry trends',
      'Generate insights reports',
      'Predict market changes'
    ],
    capabilitiesAr: [
      'إجراء أبحاث السوق',
      'تحليل المنافسين',
      'تتبع اتجاهات الصناعة',
      'إنشاء تقارير الرؤى',
      'التنبؤ بتغيرات السوق'
    ],
    performance: 91,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 720,
    successRate: 90.1,
    languages: ['ar', 'en'],
    integrations: ['Research Tools', 'Analytics', 'Reports'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Faisal Data',
    nameAr: 'فيصل البيانات',
    role: 'Data Analyst',
    roleAr: 'محلل البيانات',
    specialization: 'Data Analysis & Visualization',
    specializationAr: 'تحليل البيانات والتصور',
    capabilities: [
      'Analyze large datasets',
      'Create dashboards',
      'Identify patterns',
      'Generate predictions',
      'Optimize data queries'
    ],
    capabilitiesAr: [
      'تحليل مجموعات البيانات الكبيرة',
      'إنشاء لوحات المعلومات',
      'تحديد الأنماط',
      'توليد التنبؤات',
      'تحسين استعلامات البيانات'
    ],
    performance: 93,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1890,
    successRate: 92.4,
    languages: ['ar', 'en'],
    integrations: ['BI Tools', 'Databases', 'Visualization'],
    aiModel: 'gpt-4o'
  },
  
  // Project Management Agents
  {
    name: 'Zahra Project',
    nameAr: 'زهرة المشاريع',
    role: 'Project Manager',
    roleAr: 'مديرة المشاريع',
    specialization: 'Project Planning & Tracking',
    specializationAr: 'تخطيط وتتبع المشاريع',
    capabilities: [
      'Create project plans',
      'Track milestones',
      'Manage resources',
      'Report progress',
      'Identify risks'
    ],
    capabilitiesAr: [
      'إنشاء خطط المشاريع',
      'تتبع المعالم',
      'إدارة الموارد',
      'الإبلاغ عن التقدم',
      'تحديد المخاطر'
    ],
    performance: 89,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 540,
    successRate: 88.2,
    languages: ['ar', 'en'],
    integrations: ['PM Tools', 'Calendar', 'Reports'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Hamza Coordinator',
    nameAr: 'حمزة المنسق',
    role: 'Team Coordinator',
    roleAr: 'منسق الفريق',
    specialization: 'Team Collaboration',
    specializationAr: 'تعاون الفريق',
    capabilities: [
      'Coordinate team activities',
      'Schedule meetings',
      'Track deliverables',
      'Facilitate communication',
      'Resolve conflicts'
    ],
    capabilitiesAr: [
      'تنسيق أنشطة الفريق',
      'جدولة الاجتماعات',
      'تتبع التسليمات',
      'تسهيل التواصل',
      'حل النزاعات'
    ],
    performance: 87,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1120,
    successRate: 86.5,
    languages: ['ar', 'en'],
    integrations: ['Slack', 'Teams', 'Calendar'],
    aiModel: 'gpt-4o'
  },
  
  // Specialized Industry Agents
  {
    name: 'Lina Healthcare',
    nameAr: 'لينا الرعاية الصحية',
    role: 'Healthcare Specialist',
    roleAr: 'أخصائية الرعاية الصحية',
    specialization: 'Healthcare Administration',
    specializationAr: 'إدارة الرعاية الصحية',
    capabilities: [
      'Manage patient appointments',
      'Track medical records',
      'Send health reminders',
      'Coordinate with providers',
      'Process insurance claims'
    ],
    capabilitiesAr: [
      'إدارة مواعيد المرضى',
      'تتبع السجلات الطبية',
      'إرسال تذكيرات صحية',
      'التنسيق مع مقدمي الخدمة',
      'معالجة مطالبات التأمين'
    ],
    performance: 92,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 980,
    successRate: 91.3,
    languages: ['ar', 'en'],
    integrations: ['EMR', 'Scheduling', 'Insurance'],
    aiModel: 'gpt-4o'
  },
  {
    name: 'Majed Education',
    nameAr: 'ماجد التعليم',
    role: 'Education Specialist',
    roleAr: 'أخصائي التعليم',
    specialization: 'Educational Support',
    specializationAr: 'الدعم التعليمي',
    capabilities: [
      'Create learning materials',
      'Track student progress',
      'Schedule classes',
      'Provide tutoring support',
      'Generate progress reports'
    ],
    capabilitiesAr: [
      'إنشاء المواد التعليمية',
      'تتبع تقدم الطلاب',
      'جدولة الفصول',
      'تقديم الدعم التعليمي',
      'إنشاء تقارير التقدم'
    ],
    performance: 90,
    status: 'active',
    created: new Date(),
    lastActive: new Date(),
    tasksCompleted: 1340,
    successRate: 89.4,
    languages: ['ar', 'en'],
    integrations: ['LMS', 'Video Conferencing', 'Assessment'],
    aiModel: 'gpt-4o'
  }
];

/**
 * Deploy all AI agents to the database
 */
export async function deployAdvancedAgents(organizationId?: string): Promise<{
  success: boolean;
  deployed: number;
  message: string;
}> {
  try {
    await connectToMongoDB();
    
    // Prepare agents with organization ID if provided
    const agentsToInsert = SPECIALIZED_AI_AGENTS.map(agent => ({
      ...agent,
      organizationId: organizationId || 'global',
      deployedAt: new Date()
    }));
    
    // Insert all agents
    const result = await AIAgentModel.insertMany(agentsToInsert);
    
    console.log(`✅ Successfully deployed ${result.length} AI agents`);
    
    return {
      success: true,
      deployed: result.length,
      message: `تم نشر ${result.length} وكيل ذكاء اصطناعي متخصص بنجاح`
    };
  } catch (error) {
    console.error('❌ Failed to deploy AI agents:', error);
    return {
      success: false,
      deployed: 0,
      message: 'فشل نشر وكلاء الذكاء الاصطناعي'
    };
  }
}

/**
 * Get AI agents by organization
 */
export async function getOrganizationAgents(organizationId: string): Promise<AIAgent[]> {
  try {
    await connectToMongoDB();
    const agents = await AIAgentModel
      .find({ organizationId })
      .sort({ performance: -1 })
      .exec();
    
    return agents;
  } catch (error) {
    console.error('Failed to fetch organization agents:', error);
    return [];
  }
}

/**
 * Update agent performance metrics
 */
export async function updateAgentPerformance(
  agentId: string, 
  metrics: {
    tasksCompleted?: number;
    successRate?: number;
    performance?: number;
  }
): Promise<boolean> {
  try {
    await connectToMongoDB();
    
    const updateData: any = {
      lastActive: new Date()
    };
    
    if (metrics.tasksCompleted !== undefined) {
      updateData.tasksCompleted = metrics.tasksCompleted;
    }
    if (metrics.successRate !== undefined) {
      updateData.successRate = metrics.successRate;
    }
    if (metrics.performance !== undefined) {
      updateData.performance = metrics.performance;
    }
    
    const result = await AIAgentModel.updateOne(
      { _id: agentId },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Failed to update agent performance:', error);
    return false;
  }
}

/**
 * Initialize AI agents for all organizations
 */
export async function initializeAllOrganizationAgents(): Promise<void> {
  try {
    await connectToMongoDB();
    
    // Use mongoose to find organizations
    const OrganizationModel = mongoose.model('Organization', new Schema({
      name: String,
      _id: Schema.Types.ObjectId
    }));
    
    const organizations = await OrganizationModel.find({}).exec();
    
    for (const org of organizations) {
      // Check if agents already exist for this organization
      if (org._id) {
        const existingAgents = await getOrganizationAgents(org._id.toString());
        
        if (existingAgents.length === 0) {
          console.log(`🚀 Deploying agents for organization: ${org.name}`);
          await deployAdvancedAgents(org._id.toString());
        }
      }
    }
    
    // Deploy global agents
    const globalAgents = await getOrganizationAgents('global');
    if (globalAgents.length === 0) {
      console.log('🚀 Deploying global AI agents');
      await deployAdvancedAgents('global');
    }
    
    console.log('✅ AI agents initialization complete');
  } catch (error) {
    console.error('Failed to initialize organization agents:', error);
  }
}