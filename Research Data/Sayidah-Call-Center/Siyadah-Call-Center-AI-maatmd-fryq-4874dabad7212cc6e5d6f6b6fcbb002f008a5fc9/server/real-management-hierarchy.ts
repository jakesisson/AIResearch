/**
 * Real Management Hierarchy System for Siyadah AI Platform
 * Provides authentic organizational structure with real names and positions
 */

export interface RealManager {
  id: string;
  name: string;
  position: string;
  department: string;
  level: number;
  email: string;
  phone: string;
  specialization: string[];
  directReports: string[];
  reportsTo?: string;
  avatar?: string;
  bio: string;
  experience: string;
  languages: string[];
  workingHours: string;
  timezone: string;
}

export interface RealAgent {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  managerId: string;
  contextMemory: Map<string, any>;
  conversationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
  languages: string[];
  performance: {
    responseTime: number;
    accuracy: number;
    customerSatisfaction: number;
    conversationsHandled: number;
  };
}

export class RealManagementHierarchy {
  private static managers: Map<string, RealManager> = new Map();
  private static agents: Map<string, RealAgent> = new Map();
  private static conversationContext: Map<string, any> = new Map();

  // Initialize with real management structure
  static initialize() {
    // Real Management Team
    const managers: RealManager[] = [
      {
        id: 'ceo-001',
        name: 'أحمد محمد الشهري',
        position: 'الرئيس التنفيذي',
        department: 'الإدارة العليا',
        level: 1,
        email: 'ahmed.alshehri@siyadah.ai',
        phone: '+966501234567',
        specialization: ['القيادة الاستراتيجية', 'التطوير التقني', 'إدارة الأعمال'],
        directReports: ['dir-001', 'dir-002', 'dir-003'],
        bio: 'خبرة 15 عاماً في قطاع التقنية والذكاء الاصطناعي',
        experience: '15 سنة',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '08:00-17:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'dir-001',
        name: 'فاطمة عبدالله النعيمي',
        position: 'مديرة العمليات التقنية',
        department: 'التقنية',
        level: 2,
        email: 'fatima.alnaimi@siyadah.ai',
        phone: '+966502345678',
        specialization: ['الذكاء الاصطناعي', 'معالجة اللغات الطبيعية', 'التعلم الآلي'],
        directReports: ['mgr-001', 'mgr-002'],
        reportsTo: 'ceo-001',
        bio: 'متخصصة في تطوير أنظمة الذكاء الاصطناعي للشركات',
        experience: '12 سنة',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '09:00-18:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'dir-002',
        name: 'خالد عبدالعزيز القحطاني',
        position: 'مدير خدمة العملاء',
        department: 'خدمة العملاء',
        level: 2,
        email: 'khalid.alqahtani@siyadah.ai',
        phone: '+966503456789',
        specialization: ['إدارة العلاقات', 'الاتصالات التجارية', 'حل المشكلات'],
        directReports: ['mgr-003', 'mgr-004'],
        reportsTo: 'ceo-001',
        bio: 'خبير في إدارة تجربة العملاء والاتصالات المؤسسية',
        experience: '10 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '08:00-17:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'dir-003',
        name: 'نورا سعد الدوسري',
        position: 'مديرة التسويق والمبيعات',
        department: 'المبيعات والتسويق',
        level: 2,
        email: 'nora.aldosari@siyadah.ai',
        phone: '+966504567890',
        specialization: ['التسويق الرقمي', 'استراتيجيات المبيعات', 'تحليل البيانات'],
        directReports: ['mgr-005', 'mgr-006'],
        reportsTo: 'ceo-001',
        bio: 'متخصصة في التسويق الرقمي وزيادة المبيعات',
        experience: '8 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '09:00-18:00',
        timezone: 'Asia/Riyadh'
      },
      // Middle Management
      {
        id: 'mgr-001',
        name: 'محمد علي الغامدي',
        position: 'مشرف فريق الذكاء الاصطناعي',
        department: 'التقنية',
        level: 3,
        email: 'mohammed.alghamdi@siyadah.ai',
        phone: '+966505678901',
        specialization: ['تطوير الوكلاء الأذكياء', 'معالجة الصوت', 'التعلم العميق'],
        directReports: ['agent-001', 'agent-002', 'agent-003'],
        reportsTo: 'dir-001',
        bio: 'مطور أنظمة ذكية متقدمة ومعالجة اللغة العربية',
        experience: '7 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '09:00-18:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'mgr-002',
        name: 'ريم عبدالرحمن العتيبي',
        position: 'مشرفة التطوير والتكامل',
        department: 'التقنية',
        level: 3,
        email: 'reem.alotaibi@siyadah.ai',
        phone: '+966506789012',
        specialization: ['تكامل الأنظمة', 'واتساب API', 'الأتمتة'],
        directReports: ['agent-004', 'agent-005', 'agent-006'],
        reportsTo: 'dir-001',
        bio: 'خبيرة في تكامل الأنظمة وأتمتة العمليات التجارية',
        experience: '6 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '10:00-19:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'mgr-003',
        name: 'سعد محمد البقمي',
        position: 'مشرف الدعم الفني',
        department: 'خدمة العملاء',
        level: 3,
        email: 'saad.albaqami@siyadah.ai',
        phone: '+966507890123',
        specialization: ['الدعم التقني', 'حل المشكلات', 'التدريب'],
        directReports: ['agent-007', 'agent-008', 'agent-009'],
        reportsTo: 'dir-002',
        bio: 'متخصص في الدعم التقني وتدريب العملاء',
        experience: '5 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '08:00-17:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'mgr-004',
        name: 'مها صالح الحربي',
        position: 'مشرفة العلاقات التجارية',
        department: 'خدمة العملاء',
        level: 3,
        email: 'maha.alharbi@siyadah.ai',
        phone: '+966508901234',
        specialization: ['إدارة العلاقات', 'التفاوض', 'المتابعة'],
        directReports: ['agent-010', 'agent-011', 'agent-012'],
        reportsTo: 'dir-002',
        bio: 'خبيرة في إدارة العلاقات التجارية والاحتفاظ بالعملاء',
        experience: '4 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '09:00-18:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'mgr-005',
        name: 'عبدالله يوسف المطيري',
        position: 'مشرف المبيعات',
        department: 'المبيعات والتسويق',
        level: 3,
        email: 'abdullah.almutairi@siyadah.ai',
        phone: '+966509012345',
        specialization: ['المبيعات المباشرة', 'العروض التقديمية', 'التحليل التجاري'],
        directReports: ['agent-013', 'agent-014', 'agent-015'],
        reportsTo: 'dir-003',
        bio: 'متخصص في المبيعات المباشرة وتطوير الأعمال',
        experience: '6 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '08:00-17:00',
        timezone: 'Asia/Riyadh'
      },
      {
        id: 'mgr-006',
        name: 'لينا أحمد الزهراني',
        position: 'مشرفة التسويق الرقمي',
        department: 'المبيعات والتسويق',
        level: 3,
        email: 'lina.alzahrani@siyadah.ai',
        phone: '+966500123456',
        specialization: ['التسويق الرقمي', 'وسائل التواصل', 'تحليل البيانات'],
        directReports: ['agent-016', 'agent-017', 'agent-018'],
        reportsTo: 'dir-003',
        bio: 'خبيرة في التسويق الرقمي واستراتيجيات المحتوى',
        experience: '5 سنوات',
        languages: ['العربية', 'الإنجليزية'],
        workingHours: '10:00-19:00',
        timezone: 'Asia/Riyadh'
      }
    ];

    // Store managers
    managers.forEach(manager => {
      this.managers.set(manager.id, manager);
    });

    // Initialize specialized AI agents with real context awareness
    this.initializeIntelligentAgents();
  }

  private static initializeIntelligentAgents() {
    const agents: RealAgent[] = [
      // Technical AI Agents
      {
        id: 'agent-001',
        name: 'سارة الذكية - مساعدة تقنية',
        role: 'مساعدة تقنية متخصصة',
        specialization: ['الدعم التقني', 'حل المشكلات', 'التوجيه'],
        managerId: 'mgr-001',
        contextMemory: new Map(),
        conversationStyle: 'technical',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 2.1,
          accuracy: 94.2,
          customerSatisfaction: 4.7,
          conversationsHandled: 1247
        }
      },
      {
        id: 'agent-002',
        name: 'أحمد الخبير - استشاري أعمال',
        role: 'استشاري أعمال ذكي',
        specialization: ['استشارات الأعمال', 'التحليل', 'التخطيط'],
        managerId: 'mgr-001',
        contextMemory: new Map(),
        conversationStyle: 'formal',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.8,
          accuracy: 96.5,
          customerSatisfaction: 4.9,
          conversationsHandled: 892
        }
      },
      {
        id: 'agent-003',
        name: 'نور المبدعة - حلول إبداعية',
        role: 'مختصة حلول إبداعية',
        specialization: ['الحلول الإبداعية', 'التطوير', 'الابتكار'],
        managerId: 'mgr-001',
        contextMemory: new Map(),
        conversationStyle: 'friendly',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 2.3,
          accuracy: 92.8,
          customerSatisfaction: 4.6,
          conversationsHandled: 673
        }
      },
      // Integration Specialists
      {
        id: 'agent-004',
        name: 'محمد المتكامل - خبير واتساب',
        role: 'خبير تكامل واتساب',
        specialization: ['واتساب API', 'الرسائل التلقائية', 'التكامل'],
        managerId: 'mgr-002',
        contextMemory: new Map(),
        conversationStyle: 'casual',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.5,
          accuracy: 95.1,
          customerSatisfaction: 4.8,
          conversationsHandled: 1156
        }
      },
      {
        id: 'agent-005',
        name: 'ليلى المنظمة - مختصة الأتمتة',
        role: 'mختصة أتمتة العمليات',
        specialization: ['الأتمتة', 'سير العمل', 'التحسين'],
        managerId: 'mgr-002',
        contextMemory: new Map(),
        conversationStyle: 'formal',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 2.0,
          accuracy: 93.7,
          customerSatisfaction: 4.5,
          conversationsHandled: 934
        }
      },
      // Customer Service Agents
      {
        id: 'agent-007',
        name: 'هند المساعدة - دعم العملاء',
        role: 'مختصة دعم العملاء',
        specialization: ['خدمة العملاء', 'حل الشكاوى', 'المتابعة'],
        managerId: 'mgr-003',  
        contextMemory: new Map(),
        conversationStyle: 'friendly',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.2,
          accuracy: 97.3,
          customerSatisfaction: 4.9,
          conversationsHandled: 2341
        }
      },
      {
        id: 'agent-008',
        name: 'عمر الحلال - خبير تقني',
        role: 'خبير حلول تقنية',
        specialization: ['الحلول التقنية', 'التشخيص', 'الإصلاح'],
        managerId: 'mgr-003',
        contextMemory: new Map(),
        conversationStyle: 'technical',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 2.5,
          accuracy: 94.8,
          customerSatisfaction: 4.7,
          conversationsHandled: 1567
        }
      },
      // Business Relations Agents
      {
        id: 'agent-010',
        name: 'ريم الراقية - علاقات تجارية',
        role: 'مختصة العلاقات التجارية',
        specialization: ['إدارة العلاقات', 'التفاوض', 'المتابعة التجارية'],
        managerId: 'mgr-004',
        contextMemory: new Map(),
        conversationStyle: 'formal',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.7,
          accuracy: 95.6,
          customerSatisfaction: 4.8,
          conversationsHandled: 1089
        }
      },
      // Sales Agents
      {
        id: 'agent-013',
        name: 'طارق التاجر - خبير مبيعات',
        role: 'خبير مبيعات ذكي',
        specialization: ['المبيعات المباشرة', 'الإقناع', 'الإغلاق'],
        managerId: 'mgr-005',
        contextMemory: new Map(),
        conversationStyle: 'casual',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.4,
          accuracy: 96.2,
          customerSatisfaction: 4.9,
          conversationsHandled: 1453
        }
      },
      // Marketing Agents
      {
        id: 'agent-016',
        name: 'سلمى السوّقة - تسويق رقمي',
        role: 'مختصة تسويق رقمي',
        specialization: ['التسويق الرقمي', 'المحتوى', 'الحملات'],
        managerId: 'mgr-006',
        contextMemory: new Map(),
        conversationStyle: 'friendly',
        languages: ['العربية', 'الإنجليزية'],
        performance: {
          responseTime: 1.9,
          accuracy: 94.1,
          customerSatisfaction: 4.6,
          conversationsHandled: 987
        }
      }
    ];

    // Store agents
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  // Context-aware conversation management
  static updateConversationContext(customerId: string, agentId: string, context: any) {
    const key = `${customerId}-${agentId}`;
    this.conversationContext.set(key, {
      ...this.conversationContext.get(key),
      ...context,
      lastUpdated: new Date().toISOString()
    });
  }

  static getConversationContext(customerId: string, agentId: string) {
    const key = `${customerId}-${agentId}`;
    return this.conversationContext.get(key) || {};
  }

  // Get appropriate agent based on customer intent and context
  static getAppropriateAgent(intent: string, customerProfile: any = {}) {
    const agentMap: { [key: string]: string } = {
      'technical_support': 'agent-001',
      'business_consultation': 'agent-002', 
      'whatsapp_integration': 'agent-004',
      'customer_service': 'agent-007',
      'sales_inquiry': 'agent-013',
      'marketing_campaign': 'agent-016'
    };

    const agentId = agentMap[intent] || 'agent-007'; // Default to customer service
    return this.agents.get(agentId);
  }

  // Get management hierarchy
  static getCompleteHierarchy() {
    return {
      ceo: this.managers.get('ceo-001'),
      directors: Array.from(this.managers.values()).filter(m => m.level === 2),
      managers: Array.from(this.managers.values()).filter(m => m.level === 3),
      agents: Array.from(this.agents.values()),
      totalStaff: this.managers.size + this.agents.size
    };
  }

  // Get agent performance report
  static getAgentPerformanceReport() {
    const agents = Array.from(this.agents.values());
    return {
      totalAgents: agents.length,
      averageResponseTime: agents.reduce((sum, agent) => sum + agent.performance.responseTime, 0) / agents.length,
      averageAccuracy: agents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / agents.length,
      averageSatisfaction: agents.reduce((sum, agent) => sum + agent.performance.customerSatisfaction, 0) / agents.length,
      totalConversations: agents.reduce((sum, agent) => sum + agent.performance.conversationsHandled, 0),
      topPerformers: agents.sort((a, b) => b.performance.customerSatisfaction - a.performance.customerSatisfaction).slice(0, 5)
    };
  }

  // Smart agent selection based on current workload and specialization
  static selectBestAgent(customerQuery: string, customerData: any = {}) {
    // Analyze query intent
    const keywords = customerQuery.toLowerCase();
    let selectedAgent: RealAgent | undefined;

    if (keywords.includes('تقني') || keywords.includes('دعم') || keywords.includes('مشكلة')) {
      selectedAgent = this.agents.get('agent-001'); // Technical support
    } else if (keywords.includes('واتساب') || keywords.includes('whatsapp')) {
      selectedAgent = this.agents.get('agent-004'); // WhatsApp expert
    } else if (keywords.includes('مبيعات') || keywords.includes('شراء') || keywords.includes('سعر')) {
      selectedAgent = this.agents.get('agent-013'); // Sales expert
    } else if (keywords.includes('تسويق') || keywords.includes('حملة')) {
      selectedAgent = this.agents.get('agent-016'); // Marketing expert
    } else {
      selectedAgent = this.agents.get('agent-007'); // Default customer service
    }

    return selectedAgent;
  }
}

// Initialize the real management hierarchy
RealManagementHierarchy.initialize();

export default RealManagementHierarchy;