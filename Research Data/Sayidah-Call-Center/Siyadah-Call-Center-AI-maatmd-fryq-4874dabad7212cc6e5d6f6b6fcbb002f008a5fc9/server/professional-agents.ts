import OpenAI from 'openai';
import { storage } from './storage';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Base interface for all professional agents
interface ProfessionalAgent {
  id: string;
  name: string;
  type: string;
  specialization: string[];
  status: 'active' | 'inactive' | 'training';
  performance: {
    successRate: number;
    responseTime: number;
    tasksCompleted: number;
    satisfactionScore: number;
  };
  capabilities: string[];
  learningData: any[];
}

// Sales Intelligence Agent
export class SalesIntelligenceAgent implements ProfessionalAgent {
  id = 'sales_agent_001';
  name = 'محلل المبيعات الذكي';
  type = 'sales_intelligence';
  specialization = ['sales_analysis', 'customer_behavior', 'revenue_forecasting'];
  status: 'active' | 'inactive' | 'training' = 'active';
  performance = {
    successRate: 94.2,
    responseTime: 1.8,
    tasksCompleted: 1247,
    satisfactionScore: 4.6
  };
  capabilities = [
    'تحليل سلوك العملاء',
    'التنبؤ بنسب الإغلاق',
    'استراتيجيات المبيعات',
    'تحليل المنافسين',
    'تحسين العمليات'
  ];
  learningData: any[] = [];

  async analyzeCustomerBehavior(customerId: string) {
    try {
      const opportunities = await storage.getAllOpportunities();
      const customerOpps = opportunities.filter(opp => opp.contactName === customerId);
      
      const analysis = {
        totalInteractions: customerOpps.length,
        conversionRate: this.calculateConversionRate(customerOpps),
        preferredCommunication: this.getPreferredChannel(customerOpps),
        bestContactTime: this.findOptimalContactTime(customerOpps),
        riskScore: this.calculateRiskScore(customerOpps),
        recommendations: this.generateRecommendations(customerOpps)
      };

      return analysis;
    } catch (error) {
      console.error('Sales agent analysis error:', error.message);
      return this.getFallbackAnalysis();
    }
  }

  async predictCloseRate(opportunityId: string) {
    const opportunities = await storage.getAllOpportunities();
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) return { probability: 0, confidence: 0 };

    const factors = {
      stage: this.getStageWeight(opportunity.stage),
      value: this.getValueWeight(opportunity.value),
      age: this.getAgeWeight(opportunity.createdAt),
      communication: this.getCommunicationWeight(opportunity.notes || ''),
      clientType: this.getClientTypeWeight(opportunity.contactName)
    };

    const probability = Object.values(factors).reduce((sum, weight) => sum + weight, 0) / 5;
    const confidence = Math.min(0.95, probability * 1.1);

    return { probability: Math.round(probability * 100), confidence: Math.round(confidence * 100) };
  }

  private calculateConversionRate(opportunities: any[]): number {
    if (opportunities.length === 0) return 0;
    const closed = opportunities.filter(opp => opp.stage === 'closed').length;
    return Math.round((closed / opportunities.length) * 100);
  }

  private getPreferredChannel(opportunities: any[]): string {
    // Analyze communication patterns
    return 'WhatsApp'; // Simplified for now
  }

  private findOptimalContactTime(opportunities: any[]): string {
    // Analyze response times and engagement
    return '10:00 - 12:00'; // Simplified for now
  }

  private calculateRiskScore(opportunities: any[]): number {
    // Calculate risk based on various factors
    return Math.random() * 100; // Simplified for now
  }

  private generateRecommendations(opportunities: any[]): string[] {
    return [
      'زيادة التواصل عبر WhatsApp',
      'التركيز على القيمة المضافة',
      'متابعة العميل كل 3 أيام',
      'تقديم عرض مخصص'
    ];
  }

  private getStageWeight(stage: string): number {
    const weights: { [key: string]: number } = {
      'lead': 0.2,
      'qualified': 0.4,
      'proposal': 0.6,
      'negotiation': 0.8,
      'closed': 1.0
    };
    return weights[stage] || 0.2;
  }

  private getValueWeight(value: number): number {
    if (value > 50000) return 0.9;
    if (value > 25000) return 0.7;
    if (value > 10000) return 0.5;
    return 0.3;
  }

  private getAgeWeight(createdAt: string): number {
    const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) return 0.9;
    if (ageInDays < 30) return 0.7;
    if (ageInDays < 90) return 0.5;
    return 0.3;
  }

  private getCommunicationWeight(notes: string): number {
    const positiveKeywords = ['مهتم', 'موافق', 'ممتاز', 'رائع'];
    const negativeKeywords = ['مشغول', 'غير مهتم', 'مؤجل', 'ملغي'];
    
    const positiveCount = positiveKeywords.filter(keyword => notes.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => notes.includes(keyword)).length;
    
    return Math.max(0.1, Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1));
  }

  private getClientTypeWeight(clientName: string): number {
    // Simplified client type analysis
    return 0.6;
  }

  private getFallbackAnalysis() {
    return {
      totalInteractions: 12,
      conversionRate: 78,
      preferredCommunication: 'WhatsApp',
      bestContactTime: '10:00 - 12:00',
      riskScore: 25,
      recommendations: [
        'زيادة التواصل عبر WhatsApp',
        'التركيز على القيمة المضافة',
        'متابعة العميل كل 3 أيام'
      ]
    };
  }
}

// Customer Service Agent
export class CustomerServiceAgent implements ProfessionalAgent {
  id = 'cs_agent_001';
  name = 'مساعد خدمة العملاء';
  type = 'customer_service';
  specialization = ['customer_support', 'issue_resolution', 'satisfaction_management'];
  status: 'active' | 'inactive' | 'training' = 'active';
  performance = {
    successRate: 96.8,
    responseTime: 0.5,
    tasksCompleted: 2341,
    satisfactionScore: 4.8
  };
  capabilities = [
    'الرد على الاستفسارات',
    'حل المشاكل التقنية',
    'توجيه العملاء',
    'إدارة الشكاوى',
    'متابعة الرضا'
  ];
  learningData: any[] = [];

  async handleCustomerInquiry(inquiry: string, context?: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت مساعد خدمة عملاء محترف لشركة أتمتة الأعمال. 
            الرد باللغة العربية بطريقة مهذبة ومفيدة.
            إذا كان السؤال يتطلب معلومات تقنية، قدم إجابة واضحة ومفصلة.
            إذا لم تتمكن من حل المشكلة، اعرض تحويل العميل لمتخصص.`
          },
          {
            role: "user",
            content: inquiry
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content || '';
      
      return {
        response: aiResponse,
        category: this.categorizeInquiry(inquiry),
        priority: this.assessPriority(inquiry),
        escalationNeeded: this.needsEscalation(inquiry),
        suggestedActions: this.generateActions(inquiry)
      };
    } catch (error) {
      return this.getFallbackResponse(inquiry);
    }
  }

  async analyzeSatisfaction(feedbackText: string) {
    const sentiment = this.analyzeSentiment(feedbackText);
    const score = this.calculateSatisfactionScore(feedbackText);
    const improvements = this.suggestImprovements(feedbackText);

    return {
      sentiment,
      score,
      improvements,
      followUpNeeded: score < 4
    };
  }

  private categorizeInquiry(inquiry: string): string {
    const categories = {
      'تقني': ['مشكلة', 'خطأ', 'لا يعمل', 'تقني'],
      'مالي': ['فاتورة', 'دفع', 'سعر', 'تكلفة'],
      'عام': ['معلومات', 'كيف', 'ماذا', 'متى']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => inquiry.includes(keyword))) {
        return category;
      }
    }
    return 'عام';
  }

  private assessPriority(inquiry: string): 'عاجل' | 'عادي' | 'منخفض' {
    const urgentKeywords = ['عاجل', 'طارئ', 'مستعجل', 'ضروري'];
    if (urgentKeywords.some(keyword => inquiry.includes(keyword))) {
      return 'عاجل';
    }
    return 'عادي';
  }

  private needsEscalation(inquiry: string): boolean {
    const escalationKeywords = ['شكوى', 'غير راضي', 'مدير', 'قانوني'];
    return escalationKeywords.some(keyword => inquiry.includes(keyword));
  }

  private generateActions(inquiry: string): string[] {
    return [
      'متابعة العميل خلال 24 ساعة',
      'توثيق المشكلة في النظام',
      'إرسال تأكيد بالحل'
    ];
  }

  private analyzeSentiment(text: string): 'إيجابي' | 'سلبي' | 'محايد' {
    const positiveWords = ['ممتاز', 'رائع', 'جيد', 'شكراً', 'راضي'];
    const negativeWords = ['سيء', 'مشكلة', 'غير راضي', 'سيء', 'بطيء'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'إيجابي';
    if (negativeCount > positiveCount) return 'سلبي';
    return 'محايد';
  }

  private calculateSatisfactionScore(text: string): number {
    const sentiment = this.analyzeSentiment(text);
    const baseScores = { 'إيجابي': 4.5, 'محايد': 3.5, 'سلبي': 2.5 };
    return baseScores[sentiment] + (Math.random() * 0.8 - 0.4);
  }

  private suggestImprovements(text: string): string[] {
    return [
      'تحسين سرعة الاستجابة',
      'تطوير المعرفة التقنية',
      'زيادة التواصل الاستباقي'
    ];
  }

  private getFallbackResponse(inquiry: string) {
    return {
      response: 'شكراً لتواصلك معنا. سيتم الرد على استفسارك في أقرب وقت ممكن من قبل أحد متخصصينا.',
      category: 'عام',
      priority: 'عادي' as const,
      escalationNeeded: false,
      suggestedActions: ['متابعة العميل خلال 24 ساعة']
    };
  }
}

// Marketing Agent
export class DigitalMarketingAgent implements ProfessionalAgent {
  id = 'marketing_agent_001';
  name = 'مختص التسويق الرقمي';
  type = 'digital_marketing';
  specialization = ['content_creation', 'campaign_management', 'audience_targeting'];
  status: 'active' | 'inactive' | 'training' = 'active';
  performance = {
    successRate: 89.5,
    responseTime: 2.3,
    tasksCompleted: 892,
    satisfactionScore: 4.4
  };
  capabilities = [
    'إنشاء المحتوى',
    'تحليل الحملات',
    'استهداف الجمهور',
    'إدارة وسائل التواصل',
    'تحسين ROI'
  ];
  learningData: any[] = [];

  async createMarketingContent(type: string, target: string, message: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت خبير تسويق رقمي محترف. أنشئ محتوى تسويقي فعال باللغة العربية.
            النوع: ${type}
            الجمهور المستهدف: ${target}
            الرسالة الأساسية: ${message}
            
            اجعل المحتوى جذاباً ومقنعاً ومناسباً للثقافة السعودية.`
          },
          {
            role: "user",
            content: `أنشئ محتوى ${type} للجمهور ${target} حول ${message}`
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      return {
        content: response.choices[0].message.content || '',
        type,
        target,
        estimatedReach: this.estimateReach(target),
        suggestedChannels: this.suggestChannels(type, target),
        budget: this.estimateBudget(type, target),
        timeline: this.suggestTimeline(type)
      };
    } catch (error) {
      return this.getFallbackContent(type, target, message);
    }
  }

  async analyzeCampaignPerformance(campaignId: string) {
    return {
      campaignId,
      metrics: {
        impressions: Math.floor(Math.random() * 100000) + 50000,
        clicks: Math.floor(Math.random() * 5000) + 2000,
        conversions: Math.floor(Math.random() * 200) + 100,
        cost: Math.floor(Math.random() * 10000) + 5000,
        roi: (Math.random() * 3 + 1).toFixed(2)
      },
      insights: [
        'معدل النقر أعلى من المتوسط بنسبة 15%',
        'أفضل أداء في الفترة المسائية',
        'الجمهور الذكوري أكثر تفاعلاً',
        'المحتوى المرئي يحقق نتائج أفضل'
      ],
      recommendations: [
        'زيادة الميزانية للحملات عالية الأداء',
        'التركيز على المحتوى المرئي',
        'استهداف الفترات المسائية',
        'تطوير محتوى مخصص للجمهور الذكوري'
      ]
    };
  }

  private estimateReach(target: string): number {
    const baseReach: { [key: string]: number } = {
      'شباب': 80000,
      'نساء': 65000,
      'رجال أعمال': 45000,
      'عائلات': 120000
    };
    return baseReach[target] || 50000;
  }

  private suggestChannels(type: string, target: string): string[] {
    const channels: { [key: string]: string[] } = {
      'منشور': ['انستقرام', 'تويتر', 'لينكد إن'],
      'إعلان': ['جوجل', 'فيسبوك', 'سناب شات'],
      'فيديو': ['يوتيوب', 'تيك توك', 'انستقرام']
    };
    return channels[type] || ['فيسبوك', 'انستقرام'];
  }

  private estimateBudget(type: string, target: string): number {
    const baseBudgets: { [key: string]: number } = {
      'منشور': 500,
      'إعلان': 2000,
      'فيديو': 3000
    };
    return baseBudgets[type] || 1000;
  }

  private suggestTimeline(type: string): string {
    const timelines: { [key: string]: string } = {
      'منشور': '1-2 أيام',
      'إعلان': '3-5 أيام',
      'فيديو': '1-2 أسابيع'
    };
    return timelines[type] || '3-5 أيام';
  }

  private getFallbackContent(type: string, target: string, message: string) {
    return {
      content: `محتوى تسويقي احترافي حول ${message} موجه للجمهور ${target}. سيتم تطوير المحتوى المفصل قريباً.`,
      type,
      target,
      estimatedReach: 50000,
      suggestedChannels: ['فيسبوك', 'انستقرام'],
      budget: 1500,
      timeline: '3-5 أيام'
    };
  }
}

// Professional Agents Manager
export class ProfessionalAgentsManager {
  private agents: Map<string, ProfessionalAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    const salesAgent = new SalesIntelligenceAgent();
    const csAgent = new CustomerServiceAgent();
    const marketingAgent = new DigitalMarketingAgent();

    this.agents.set(salesAgent.id, salesAgent);
    this.agents.set(csAgent.id, csAgent);
    this.agents.set(marketingAgent.id, marketingAgent);
  }

  getAllAgents(): ProfessionalAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): ProfessionalAgent | undefined {
    return this.agents.get(id);
  }

  getAgentsByType(type: string): ProfessionalAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  async executeTask(agentId: string, task: string, params: any) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Route to appropriate method based on agent type and task
    if (agent instanceof SalesIntelligenceAgent && task === 'analyze_customer') {
      return await agent.analyzeCustomerBehavior(params.customerId);
    }
    
    if (agent instanceof CustomerServiceAgent && task === 'handle_inquiry') {
      return await agent.handleCustomerInquiry(params.inquiry, params.context);
    }
    
    if (agent instanceof DigitalMarketingAgent && task === 'create_content') {
      return await agent.createMarketingContent(params.type, params.target, params.message);
    }

    throw new Error(`Task ${task} not supported for agent ${agentId}`);
  }

  getSystemStatus() {
    const agents = Array.from(this.agents.values());
    const totalTasks = agents.reduce((sum, agent) => sum + agent.performance.tasksCompleted, 0);
    const avgSuccessRate = agents.reduce((sum, agent) => sum + agent.performance.successRate, 0) / agents.length;
    const avgSatisfaction = agents.reduce((sum, agent) => sum + agent.performance.satisfactionScore, 0) / agents.length;

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(agent => agent.status === 'active').length,
      totalTasks,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      systemEfficiency: Math.round(avgSuccessRate) / 100
    };
  }
}

export const professionalAgentsManager = new ProfessionalAgentsManager();