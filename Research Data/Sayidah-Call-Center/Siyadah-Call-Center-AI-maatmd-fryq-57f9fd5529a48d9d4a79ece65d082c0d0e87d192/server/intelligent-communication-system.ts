/**
 * Intelligent Communication System with Human-like AI Agents
 * Provides context-aware, personalized customer interactions
 */

import RealManagementHierarchy, { RealAgent } from './real-management-hierarchy';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  preferredLanguage: 'ar' | 'en';
  communicationStyle: 'formal' | 'casual';
  previousInteractions: ConversationHistory[];
  preferences: {
    contactTime: string;
    channel: 'whatsapp' | 'voice' | 'email';
    topics: string[];
  };
  businessContext: {
    industry: string;
    size: 'small' | 'medium' | 'large';
    needs: string[];
    budget?: number;
    decisionMaker: boolean;
  };
}

export interface ConversationHistory {
  id: string;
  timestamp: string;
  agentId: string;
  channel: 'whatsapp' | 'voice' | 'email';
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  outcome: 'resolved' | 'pending' | 'escalated';
  followUpRequired: boolean;
  nextAction?: string;
}

export interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: { [key: string]: string };
  urgency: 'low' | 'medium' | 'high';
  category: 'sales' | 'support' | 'technical' | 'general';
  recommendedAgent: string;
  context: any;
}

export class IntelligentCommunicationSystem {
  private static customerProfiles: Map<string, CustomerProfile> = new Map();
  private static conversationHistory: Map<string, ConversationHistory[]> = new Map();
  private static activeConversations: Map<string, any> = new Map();

  // Analyze customer intent with advanced NLP
  static analyzeIntent(message: string, customerContext: CustomerProfile): IntentAnalysis {
    const messageLower = message.toLowerCase();
    
    // Intent detection patterns (Arabic and English)
    const intentPatterns = {
      'price_inquiry': [
        'سعر', 'تكلفة', 'كم', 'أسعار', 'تسعير', 'price', 'cost', 'how much', 'pricing'
      ],
      'technical_support': [
        'مشكلة', 'خطأ', 'لا يعمل', 'عطل', 'دعم', 'مساعدة', 'problem', 'error', 'not working', 'support', 'help'
      ],
      'product_demo': [
        'عرض', 'تجربة', 'شرح', 'توضيح', 'demo', 'demonstration', 'show me', 'explain'
      ],
      'whatsapp_integration': [
        'واتساب', 'whatsapp', 'رسائل', 'تكامل', 'ربط', 'integration', 'connect', 'messages'
      ],
      'sales_follow_up': [
        'متابعة', 'عرض', 'اقتراح', 'follow up', 'proposal', 'offer', 'quote'
      ],
      'complaint': [
        'شكوى', 'مشكلة', 'استياء', 'غير راضي', 'complaint', 'issue', 'dissatisfied', 'problem'
      ]
    };

    let detectedIntent = 'general_inquiry';
    let maxMatches = 0;
    let confidence = 0;

    // Find best matching intent
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const matches = patterns.filter(pattern => messageLower.includes(pattern)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIntent = intent;
        confidence = Math.min(0.9, matches * 0.3 + 0.4);
      }
    }

    // Extract entities
    const entities: { [key: string]: string } = {};
    
    // Phone number extraction
    const phoneMatch = message.match(/(\+?966|0)?[5-9]\d{8}/);
    if (phoneMatch) entities.phone = phoneMatch[0];
    
    // Email extraction
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) entities.email = emailMatch[0];
    
    // Company name (simple detection)
    const companyPatterns = ['شركة', 'مؤسسة', 'company', 'corporation'];
    for (const pattern of companyPatterns) {
      const regex = new RegExp(`${pattern}\\s+([\\w\\s]+)`, 'gi');
      const match = message.match(regex);
      if (match) entities.company = match[0];
    }

    // Determine urgency
    const urgencyKeywords = {
      'high': ['عاجل', 'سريع', 'فوري', 'urgent', 'asap', 'emergency', 'immediately'],
      'medium': ['قريب', 'soon', 'today', 'اليوم'],
      'low': ['لاحقاً', 'later', 'whenever', 'متى ما']
    };

    let urgency: 'low' | 'medium' | 'high' = 'medium';
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        urgency = level as 'low' | 'medium' | 'high';
        break;
      }
    }

    // Categorize
    const categoryMap: { [key: string]: string } = {
      'price_inquiry': 'sales',
      'product_demo': 'sales',
      'sales_follow_up': 'sales',
      'technical_support': 'technical',
      'whatsapp_integration': 'technical',
      'complaint': 'support'
    };
    
    const category = categoryMap[detectedIntent] || 'general';

    // Select best agent
    const agentMap: { [key: string]: string } = {
      'technical_support': 'agent-001',
      'whatsapp_integration': 'agent-004',
      'price_inquiry': 'agent-013',
      'product_demo': 'agent-013',
      'sales_follow_up': 'agent-013',
      'complaint': 'agent-007'
    };

    const recommendedAgent = agentMap[detectedIntent] || 'agent-007';

    return {
      intent: detectedIntent,
      confidence,
      entities,
      urgency,
      category: category as 'sales' | 'support' | 'technical' | 'general',
      recommendedAgent,
      context: {
        previousInteractions: customerContext.previousInteractions.length,
        preferredStyle: customerContext.communicationStyle,
        businessContext: customerContext.businessContext
      }
    };
  }

  // Generate context-aware response
  static async generateContextualResponse(
    message: string, 
    customerProfile: CustomerProfile, 
    agent: RealAgent,
    intentAnalysis: IntentAnalysis
  ): Promise<string> {
    
    // Get conversation history
    const history = this.conversationHistory.get(customerProfile.id) || [];
    const lastInteraction = history[history.length - 1];
    
    // Build context for response generation
    const context = {
      customerName: customerProfile.name,
      customerCompany: customerProfile.company,
      previousInteractions: history.length,
      lastTopic: lastInteraction?.summary,
      customerPreferences: customerProfile.preferences,
      businessNeeds: customerProfile.businessContext.needs,
      communicationStyle: customerProfile.communicationStyle,
      urgency: intentAnalysis.urgency,
      intent: intentAnalysis.intent,
      agentName: agent.name,
      agentSpecialization: agent.specialization
    };

    // Generate personalized response based on intent and context
    let response = '';

    switch (intentAnalysis.intent) {
      case 'price_inquiry':
        response = this.generatePricingResponse(context, customerProfile);
        break;
      case 'technical_support':
        response = this.generateTechnicalResponse(context, message);
        break;
      case 'whatsapp_integration':
        response = this.generateWhatsAppResponse(context);
        break;
      case 'product_demo':
        response = this.generateDemoResponse(context);
        break;
      case 'complaint':
        response = this.generateComplaintResponse(context, customerProfile);
        break;
      default:
        response = this.generateGeneralResponse(context, message);
    }

    // Add personal touch based on agent personality
    response = this.addAgentPersonality(response, agent, customerProfile.communicationStyle);

    return response;
  }

  private static generatePricingResponse(context: any, customerProfile: CustomerProfile): string {
    const isReturning = context.previousInteractions > 0;
    const companySize = customerProfile.businessContext.size;
    
    let pricing = '';
    if (companySize === 'small') {
      pricing = 'خطة المؤسسات الصغيرة: 1,500 ريال شهرياً - تشمل واتساب + مكالمات ذكية + 3 وكلاء';
    } else if (companySize === 'medium') {
      pricing = 'خطة المؤسسات المتوسطة: 3,500 ريال شهرياً - تشمل جميع الميزات + 10 وكلاء + تقارير متقدمة';
    } else {
      pricing = 'خطة المؤسسات الكبيرة: 7,500 ريال شهرياً - حلول مخصصة + وكلاء لا محدودين + دعم VIP';
    }

    if (isReturning) {
      return `أهلاً وسهلاً بك مرة أخرى ${context.customerName}! بناءً على احتياجات ${context.customerCompany}:\n\n${pricing}\n\n✨ عرض خاص للعملاء المهتمين: خصم 20% على أول 3 أشهر\n\nهل تود جدولة عرض تقديمي مخصص لشركتكم؟`;
    } else {
      return `مرحباً ${context.customerName}! سعداء بتواصلكم مع سيادة AI\n\n${pricing}\n\n🎁 عرض ترحيبي: تجربة مجانية لمدة 14 يوم\n\nيمكنني تحضير عرض مخصص لاحتياجات شركتكم. متى يناسبكم؟`;
    }
  }

  private static generateTechnicalResponse(context: any, originalMessage: string): string {
    const isUrgent = context.urgency === 'high';
    
    if (isUrgent) {
      return `${context.customerName}, أدرك أن الأمر عاجل. دعني أساعدك فوراً:\n\n🔧 سأقوم بتشخيص المشكلة خلال دقائق\n📞 يمكنني اتصل بك مباشرة للحل السريع\n💬 أو نحل المشكلة هنا مباشرة\n\nما هو رقم هاتفك للاتصال المباشر؟`;
    } else {
      return `مرحباً ${context.customerName}، سأساعدك في حل هذه المشكلة:\n\n🔍 دعني أفهم التفاصيل أكثر:\n• متى بدأت المشكلة؟\n• هل ظهرت رسالة خطأ معينة؟\n• ما هو النظام المستخدم؟\n\n⚡ في معظم الحالات نحل المشكلة خلال 15 دقيقة`;
    }
  }

  private static generateWhatsAppResponse(context: any): string {
    return `${context.customerName}، واتساب API هو تخصصي! 🎯\n\n✅ يمكنني مساعدتك في:\n• ربط واتساب بنظامكم خلال ساعات\n• إعداد الردود التلقائية الذكية\n• تكامل مع قاعدة بيانات العملاء\n• تقارير تفصيلية للرسائل\n\n📱 هل لديكم حساب واتساب بزنس مفعّل؟ هذا كل ما نحتاجه للبدء!`;
  }

  private static generateDemoResponse(context: any): string {
    const timeSlots = ['10:00 صباحاً', '2:00 ظهراً', '7:00 مساءً'];
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    return `بالطبع ${context.customerName}! سأحضر لكم عرضاً تقديمياً مباشراً:\n\n🎥 العرض يشمل:\n• تجربة مباشرة للوكلاء الأذكياء\n• شرح مفصل للميزات\n• أمثلة من صناعتكم\n• جلسة أسئلة وأجوبة\n\n📅 متى يناسبكم؟ متاح ${randomSlot} أو أي وقت تحددونه\n\nالعرض 30 دقيقة فقط وستحصلون على فهم كامل للنظام!`;
  }

  private static generateComplaintResponse(context: any, customerProfile: CustomerProfile): string {
    const isExistingCustomer = context.previousInteractions > 2;
    
    if (isExistingCustomer) {
      return `${context.customerName}، أعتذر بصدق عن هذه المشكلة 🙏\n\nكعميل مهم لدينا، سأتعامل مع الأمر شخصياً:\n\n🔥 إجراءات فورية:\n• تصعيد مباشر لمدير خدمة العملاء\n• متابعة خاصة لحسابكم\n• تعويض مناسب إن لزم الأمر\n\n📞 سأتصل بك خلال 10 دقائق لحل الموضوع نهائياً`;
    } else {
      return `${context.customerName}، أعتذر عن التجربة السيئة 😔\n\nدعني أصحح الوضع فوراً:\n\n✅ سأراجع ما حدث بالتفصيل\n🔧 حل فوري للمشكلة\n📈 متابعة للتأكد من رضاكم\n\nرقم هاتفك للمتابعة المباشرة؟`;
    }
  }

  private static generateGeneralResponse(context: any, message: string): string {
    return `مرحباً ${context.customerName}! 👋\n\nشكراً لتواصلكم مع سيادة AI\n\n🤖 أنا ${context.agentName} وسأساعدكم في كل ما تحتاجونه:\n• استشارات تقنية متخصصة\n• حلول ذكية مخصصة\n• دعم فني متميز\n\nكيف يمكنني مساعدتكم اليوم؟`;
  }

  private static addAgentPersonality(response: string, agent: RealAgent, customerStyle: 'formal' | 'casual'): string {
    // Adjust tone based on agent personality and customer preference
    if (agent.conversationStyle === 'formal' && customerStyle === 'formal') {
      response = response.replace(/!/g, '.').replace(/😊|👋|🎯/g, '');
    } else if (agent.conversationStyle === 'friendly' && customerStyle === 'casual') {
      if (!response.includes('😊')) response += ' 😊';
    }

    // Add agent signature
    response += `\n\n---\n${agent.name}\n${agent.role}`;

    return response;
  }

  // Update customer profile based on interaction
  static updateCustomerProfile(customerId: string, interaction: any) {
    const profile = this.customerProfiles.get(customerId);
    if (!profile) return;

    // Update preferences based on interaction patterns
    if (interaction.sentiment === 'positive') {
      profile.preferences.channel = interaction.channel;
    }

    // Learn communication style
    if (interaction.message.includes('من فضلك') || interaction.message.includes('please')) {
      profile.communicationStyle = 'formal';
    } else if (interaction.message.includes('شلونك') || interaction.message.includes('hey')) {
      profile.communicationStyle = 'casual';
    }

    this.customerProfiles.set(customerId, profile);
  }

  // Log conversation for future context
  static logConversation(
    customerId: string, 
    agentId: string, 
    message: string, 
    response: string, 
    intent: string,
    outcome: 'resolved' | 'pending' | 'escalated' = 'pending'
  ) {
    const conversation: ConversationHistory = {
      id: `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId,
      channel: 'whatsapp', // Default, should be passed
      summary: `${intent}: ${message.substring(0, 50)}...`,
      sentiment: 'neutral', // Should be analyzed
      outcome,
      followUpRequired: outcome === 'pending',
      nextAction: outcome === 'pending' ? 'await_customer_response' : undefined
    };

    const history = this.conversationHistory.get(customerId) || [];
    history.push(conversation);
    this.conversationHistory.set(customerId, history);
  }

  // Get comprehensive customer report for system owner
  static getCustomerReport(customerId: string) {
    const profile = this.customerProfiles.get(customerId);
    const history = this.conversationHistory.get(customerId) || [];
    
    if (!profile) return null;

    return {
      customer: profile,
      interactions: {
        total: history.length,
        resolved: history.filter(h => h.outcome === 'resolved').length,
        pending: history.filter(h => h.outcome === 'pending').length,
        escalated: history.filter(h => h.outcome === 'escalated').length,
        lastInteraction: history[history.length - 1],
        averageSentiment: this.calculateAverageSentiment(history),
        preferredChannel: this.getMostUsedChannel(history),
        engagementScore: this.calculateEngagementScore(history)
      },
      recommendations: this.generateRecommendations(profile, history)
    };
  }

  private static calculateAverageSentiment(history: ConversationHistory[]) {
    const sentimentScores = { positive: 1, neutral: 0, negative: -1 };
    const totalScore = history.reduce((sum, h) => sum + sentimentScores[h.sentiment], 0);
    return totalScore / history.length;
  }

  private static getMostUsedChannel(history: ConversationHistory[]) {
    const channels = history.map(h => h.channel);
    return channels.sort((a, b) => 
      channels.filter(c => c === a).length - channels.filter(c => c === b).length
    ).pop();
  }

  private static calculateEngagementScore(history: ConversationHistory[]) {
    const recentInteractions = history.filter(h => 
      new Date(h.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    return Math.min(100, recentInteractions.length * 10);
  }

  private static generateRecommendations(profile: CustomerProfile, history: ConversationHistory[]) {
    const recommendations = [];
    
    if (history.length > 5 && !profile.businessContext.decisionMaker) {
      recommendations.push('Consider escalating to decision maker');
    }
    
    if (history.filter(h => h.sentiment === 'negative').length > 2) {
      recommendations.push('Priority customer - needs special attention');
    }
    
    if (profile.businessContext.budget && profile.businessContext.budget > 10000) {
      recommendations.push('High-value prospect - assign senior sales agent');
    }
    
    return recommendations;
  }

  // Process incoming message with full context awareness
  static async processIncomingMessage(
    customerId: string,
    message: string,
    channel: 'whatsapp' | 'voice' | 'email' = 'whatsapp'
  ) {
    // Get or create customer profile
    let customerProfile = this.customerProfiles.get(customerId);
    if (!customerProfile) {
      customerProfile = {
        id: customerId,
        name: `عميل ${customerId.slice(-4)}`,
        phone: customerId,
        preferredLanguage: 'ar',
        communicationStyle: 'formal',
        previousInteractions: [],
        preferences: {
          contactTime: '09:00-17:00',
          channel: channel,
          topics: []
        },
        businessContext: {
          industry: 'unknown',
          size: 'small',
          needs: [],
          decisionMaker: false
        }
      };
      this.customerProfiles.set(customerId, customerProfile);
    }

    // Analyze intent
    const intentAnalysis = this.analyzeIntent(message, customerProfile);
    
    // Select appropriate agent
    const agent = RealManagementHierarchy.getAppropriateAgent(intentAnalysis.intent, customerProfile);
    if (!agent) throw new Error('No available agent');

    // Generate contextual response
    const response = await this.generateContextualResponse(
      message,
      customerProfile,
      agent,
      intentAnalysis
    );

    // Log conversation
    this.logConversation(
      customerId,
      agent.id,
      message,
      response,
      intentAnalysis.intent
    );

    // Update customer profile
    this.updateCustomerProfile(customerId, {
      message,
      channel,
      sentiment: 'neutral',
      agent: agent.id
    });

    return {
      response,
      agent: agent.name,
      confidence: intentAnalysis.confidence,
      intent: intentAnalysis.intent,
      urgency: intentAnalysis.urgency,
      followUpRequired: intentAnalysis.urgency === 'high',
      customerReport: this.getCustomerReport(customerId)
    };
  }
}

export default IntelligentCommunicationSystem;