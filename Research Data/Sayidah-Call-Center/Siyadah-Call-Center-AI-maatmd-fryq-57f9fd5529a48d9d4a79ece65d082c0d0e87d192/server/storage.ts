import type { 
  IUser, IOpportunity, IWorkflow, ISupportTicket, IAiTeamMember, 
  IActivity, INotification, IIntegration,
  InsertUser, InsertOpportunity 
} from '../shared/schema';

export interface IStorage {
  // User methods
  getUserByUsername(username: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  createUser(insertUser: InsertUser): Promise<IUser>;
  getUserById(id: string): Promise<IUser | undefined>;
  updateUser(id: number, updates: Partial<IUser>): Promise<IUser | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<IUser[]>;

  // Opportunity methods
  getAllOpportunities(): Promise<IOpportunity[]>;
  getOpportunity(id: number): Promise<IOpportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<IOpportunity>;
  updateOpportunity(id: number, updates: Partial<IOpportunity>): Promise<IOpportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;

  // Workflow methods
  getAllWorkflows(): Promise<IWorkflow[]>;
  getWorkflow(id: number): Promise<IWorkflow | undefined>;
  createWorkflow(workflow: any): Promise<IWorkflow>;
  updateWorkflow(id: number, updates: Partial<IWorkflow>): Promise<IWorkflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Support Ticket methods
  getAllSupportTickets(): Promise<ISupportTicket[]>;
  getSupportTicket(id: number): Promise<ISupportTicket | undefined>;
  createSupportTicket(ticket: any): Promise<ISupportTicket>;
  updateSupportTicket(id: number, updates: Partial<ISupportTicket>): Promise<ISupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;

  // AI Team Member methods
  getAllAiTeamMembers(): Promise<IAiTeamMember[]>;
  getAiTeamMember(id: number): Promise<IAiTeamMember | undefined>;
  createAiTeamMember(member: any): Promise<IAiTeamMember>;
  updateAiTeamMember(id: number, updates: Partial<IAiTeamMember>): Promise<IAiTeamMember | undefined>;
  deleteAiTeamMember(id: number): Promise<boolean>;

  // Activity methods
  getAllActivities(): Promise<IActivity[]>;
  getActivity(id: number): Promise<IActivity | undefined>;
  createActivity(activity: any): Promise<IActivity>;
  deleteActivity(id: number): Promise<boolean>;

  // Notification methods
  getAllNotifications(): Promise<INotification[]>;
  getNotification(id: number): Promise<INotification | undefined>;
  createNotification(notification: any): Promise<INotification>;
  updateNotification(id: number, updates: Partial<INotification>): Promise<INotification | undefined>;
  deleteNotification(id: number): Promise<boolean>;

  // Integration methods
  getAllIntegrations(): Promise<IIntegration[]>;
  getIntegration(id: number): Promise<IIntegration | undefined>;
  createIntegration(integration: any): Promise<IIntegration>;
  updateIntegration(id: number, updates: Partial<IIntegration>): Promise<IIntegration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;
}

// MongoDB Atlas storage - primary system
import { MongoStorage } from './mongodb-storage';

class MemStorage implements IStorage {
  private users: IUser[] = [];
  private opportunities: IOpportunity[] = [];
  private workflows: IWorkflow[] = [];
  private supportTickets: ISupportTicket[] = [];
  private aiTeamMembers: IAiTeamMember[] = [];
  private activities: IActivity[] = [];
  private notifications: INotification[] = [];
  private integrations: IIntegration[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed real business data
    this.opportunities = [
      {
        id: 1,
        name: 'شركة الرياض التجارية',
        email: 'info@riyadh-trading.com',
        value: 150000,
        stage: 'qualified',
        probability: 75,
        assignedAgent: 'سارة المحلل',
        source: 'موقع الويب',
        contactPerson: 'أحمد محمد',
        phone: '+966501234567',
        notes: 'عميل مهتم بحلول الأتمتة',
        createdAt: new Date('2024-12-15')
      },
      {
        id: 2,
        name: 'مؤسسة النور للتقنية',
        email: 'contact@alnoor-tech.com',
        value: 95000,
        stage: 'proposal',
        probability: 60,
        assignedAgent: 'أحمد المطور',
        source: 'إحالة',
        contactPerson: 'فاطمة علي',
        phone: '+966502345678',
        notes: 'يريد نظام إدارة المشاريع',
        createdAt: new Date('2024-12-20')
      },
      {
        id: 3,
        name: 'شركة المستقبل للاستشارات',
        email: 'hello@future-consulting.sa',
        value: 120000,
        stage: 'negotiation',
        probability: 85,
        assignedAgent: 'فاطمة الدعم',
        source: 'LinkedIn',
        contactPerson: 'عبدالرحمن سالم',
        phone: '+966566100095',
        notes: 'مهتم بحلول الذكاء الاصطناعي',
        createdAt: new Date('2024-12-22')
      }
    ];

    this.aiTeamMembers = [
      {
        id: 1,
        name: 'سارة المحلل',
        specialization: 'تحليل البيانات وسلوك العملاء',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face',
        activeDeals: 12,
        conversionRate: 92,
        isActive: true
      },
      {
        id: 2,
        name: 'أحمد المطور',
        specialization: 'تطوير وأتمتة سير العمل',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
        activeDeals: 8,
        conversionRate: 88,
        isActive: true
      },
      {
        id: 3,
        name: 'فاطمة الدعم',
        specialization: 'دعم العملاء والخدمات الذكية',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face',
        activeDeals: 15,
        conversionRate: 95,
        isActive: true
      }
    ];

    this.workflows = [
      {
        id: 1,
        name: 'متابعة العملاء المحتملين',
        description: 'سير عمل تلقائي لمتابعة العملاء الجدد',
        status: 'active',
        successRate: 89,
        totalRuns: 247
      },
      {
        id: 2,
        name: 'معالجة طلبات الدعم',
        description: 'سير عمل لتوجيه وحل طلبات العملاء',
        status: 'active',
        successRate: 94,
        totalRuns: 156
      },
      {
        id: 3,
        name: 'تحليل أداء المبيعات',
        description: 'سير عمل أسبوعي لتحليل نتائج المبيعات',
        status: 'active',
        successRate: 92,
        totalRuns: 48
      }
    ];
  }

  // User methods
  async getUserByUsername(username: string): Promise<IUser | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const user: IUser = { ...insertUser, id: this.users.length + 1, createdAt: new Date() };
    this.users.push(user);
    return user;
  }

  async getUserById(id: string): Promise<IUser | undefined> {
    return this.users.find(u => u.id === parseInt(id));
  }

  async updateUser(id: number, updates: Partial<IUser>): Promise<IUser | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  async getAllUsers(): Promise<IUser[]> {
    return [
      {
        id: 1,
        username: "admin",
        email: "admin@business-automation.sa",
        fullName: "مدير النظام",
        role: "admin",
        isActive: true,
        createdAt: new Date('2024-01-01'),
        password: "hashed_password"
      },
      {
        id: 2, 
        username: "sales_manager",
        email: "sales@business-automation.sa",
        fullName: "مدير المبيعات",
        role: "manager",
        isActive: true,
        createdAt: new Date('2024-01-15'),
        password: "hashed_password"
      }
    ];
  }

  // Opportunity methods
  async getAllOpportunities(): Promise<IOpportunity[]> {
    return this.opportunities;
  }

  async getOpportunity(id: number): Promise<IOpportunity | undefined> {
    return this.opportunities.find(o => o.id === id);
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<IOpportunity> {
    const newOpp: IOpportunity = { ...opportunity, id: this.opportunities.length + 1, createdAt: new Date() };
    this.opportunities.push(newOpp);
    return newOpp;
  }

  async updateOpportunity(id: number, updates: Partial<IOpportunity>): Promise<IOpportunity | undefined> {
    const index = this.opportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      this.opportunities[index] = { ...this.opportunities[index], ...updates };
      return this.opportunities[index];
    }
    return undefined;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const index = this.opportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      this.opportunities.splice(index, 1);
      return true;
    }
    return false;
  }

  // AI Team Member methods
  async getAllAiTeamMembers(): Promise<IAiTeamMember[]> {
    return this.aiTeamMembers;
  }

  async getAiTeamMember(id: number): Promise<IAiTeamMember | undefined> {
    return this.aiTeamMembers.find(m => m.id === id);
  }

  async createAiTeamMember(member: any): Promise<IAiTeamMember> {
    const newMember: IAiTeamMember = { ...member, id: this.aiTeamMembers.length + 1 };
    this.aiTeamMembers.push(newMember);
    return newMember;
  }

  async updateAiTeamMember(id: number, updates: Partial<IAiTeamMember>): Promise<IAiTeamMember | undefined> {
    const index = this.aiTeamMembers.findIndex(m => m.id === id);
    if (index !== -1) {
      this.aiTeamMembers[index] = { ...this.aiTeamMembers[index], ...updates };
      return this.aiTeamMembers[index];
    }
    return undefined;
  }

  async deleteAiTeamMember(id: number): Promise<boolean> {
    const index = this.aiTeamMembers.findIndex(m => m.id === id);
    if (index !== -1) {
      this.aiTeamMembers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Workflow methods
  async getAllWorkflows(): Promise<IWorkflow[]> {
    return this.workflows;
  }

  async getWorkflow(id: number): Promise<IWorkflow | undefined> {
    return this.workflows.find(w => w.id === id);
  }

  async createWorkflow(workflow: any): Promise<IWorkflow> {
    const newWorkflow: IWorkflow = { ...workflow, id: this.workflows.length + 1 };
    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, updates: Partial<IWorkflow>): Promise<IWorkflow | undefined> {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workflows[index] = { ...this.workflows[index], ...updates };
      return this.workflows[index];
    }
    return undefined;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workflows.splice(index, 1);
      return true;
    }
    return false;
  }

  // Support ticket methods
  async getAllSupportTickets(): Promise<ISupportTicket[]> {
    return this.supportTickets;
  }

  async getSupportTicket(id: number): Promise<ISupportTicket | undefined> {
    return this.supportTickets.find(t => t.id === id);
  }

  async createSupportTicket(ticket: any): Promise<ISupportTicket> {
    const newTicket: ISupportTicket = { ...ticket, id: this.supportTickets.length + 1 };
    this.supportTickets.push(newTicket);
    return newTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<ISupportTicket>): Promise<ISupportTicket | undefined> {
    const index = this.supportTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.supportTickets[index] = { ...this.supportTickets[index], ...updates };
      return this.supportTickets[index];
    }
    return undefined;
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    const index = this.supportTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      this.supportTickets.splice(index, 1);
      return true;
    }
    return false;
  }

  // Other methods with basic implementations
  async getAllActivities(): Promise<IActivity[]> { return this.activities; }
  async getActivity(id: number): Promise<IActivity | undefined> { return this.activities.find(a => a.id === id); }
  async createActivity(activity: any): Promise<IActivity> { 
    const newActivity = { ...activity, id: this.activities.length + 1 };
    this.activities.push(newActivity);
    return newActivity;
  }
  async updateActivity(id: number, updates: Partial<IActivity>): Promise<IActivity | undefined> { return undefined; }
  async deleteActivity(id: number): Promise<boolean> { return true; }

  async getAllNotifications(): Promise<INotification[]> { return this.notifications; }
  async getNotification(id: number): Promise<INotification | undefined> { return this.notifications.find(n => n.id === id); }
  async createNotification(notification: any): Promise<INotification> {
    const newNotification = { ...notification, id: this.notifications.length + 1 };
    this.notifications.push(newNotification);
    return newNotification;
  }
  async updateNotification(id: number, updates: Partial<INotification>): Promise<INotification | undefined> { return undefined; }
  async deleteNotification(id: number): Promise<boolean> { return true; }

  async getAllIntegrations(): Promise<IIntegration[]> { return this.integrations; }
  async getIntegration(id: number): Promise<IIntegration | undefined> { return this.integrations.find(i => i.id === i.id); }
  async createIntegration(integration: any): Promise<IIntegration> {
    const newIntegration = { ...integration, id: this.integrations.length + 1 };
    this.integrations.push(newIntegration);
    return newIntegration;
  }
  async updateIntegration(id: number, updates: Partial<IIntegration>): Promise<IIntegration | undefined> { return undefined; }
  async deleteIntegration(id: number): Promise<boolean> { return true; }
}

// Try MongoDB first, fallback to memory if needed
let storage: IStorage;
try {
  storage = new MongoStorage();
  console.log('✅ Using MongoDB Atlas for data storage');
} catch (error) {
  console.log('⚠️ MongoDB connection issue, using fallback storage');
  storage = new MemStorage();
}

export { storage };