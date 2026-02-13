import OpenAI from 'openai';

// Initialize OpenAI with error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized for multi-agent system');
  } else {
    console.warn('⚠️ OpenAI API key not found for multi-agent system');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI for multi-agent system:', error);
}

// Language detection mappings
const LANGUAGE_PATTERNS = {
  'ar': /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  'ar-najdi': /(?:يا\s+رجال|والله|حبيبي|ابشرك|الله\s+يعطيك)/i,
  'en': /^[a-zA-Z\s.,!?'"()-]+$/,
  'es': /(?:hola|gracias|por\s+favor|buenos\s+días)/i,
  'fr': /(?:bonjour|merci|s'il\s+vous\s+plaît|bonne\s+journée)/i
};

// Shared context for all agents
interface AgentContext {
  sessionId: string;
  userId: string;
  userRole: 'admin' | 'marketing_manager' | 'sales_manager' | 'viewer';
  language: string;
  intent: string;
  businessType: string;
  conversationHistory: Array<{ role: string; content: string; timestamp: Date; taskId?: string }>;
  currentTask?: any;
  memoryBank: Map<string, any>;
}

// Base Agent class
abstract class BaseAgent {
  protected name: string;
  protected emoji: string;
  
  constructor(name: string, emoji: string) {
    this.name = name;
    this.emoji = emoji;
  }
  
  abstract process(context: AgentContext, input?: any): Promise<any>;
  
  protected log(context: AgentContext, action: string, data?: any) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    context.conversationHistory.push({
      role: `${this.emoji} ${this.name}`,
      content: `${action}: ${JSON.stringify(data || {})}`,
      timestamp: new Date(),
      taskId
    });
    return taskId;
  }
}

// 🌐 Language Detection Agent
class LanguageAgent extends BaseAgent {
  constructor() {
    super('LanguageAgent', '🌐');
  }
  
  async process(context: AgentContext, input: string): Promise<string> {
    // Advanced language detection
    let detectedLang = 'en'; // default
    
    if (LANGUAGE_PATTERNS['ar'].test(input)) {
      detectedLang = 'ar';
      if (LANGUAGE_PATTERNS['ar-najdi'].test(input)) {
        detectedLang = 'ar-najdi';
      }
    } else if (LANGUAGE_PATTERNS['es'].test(input)) {
      detectedLang = 'es';
    } else if (LANGUAGE_PATTERNS['fr'].test(input)) {
      detectedLang = 'fr';
    }
    
    context.language = detectedLang;
    this.log(context, 'Language detected', { language: detectedLang, input: input.substring(0, 50) });
    
    return detectedLang;
  }
}

// 📥 Intent Understanding Agent
class IntentAgent extends BaseAgent {
  constructor() {
    super('IntentAgent', '📥');
  }
  
  async process(context: AgentContext, input: string): Promise<string> {
    try {
      if (!openai) {
        console.warn('OpenAI not available, using fallback intent detection');
        return this.detectIntentFallback(input);
      }
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Analyze user intent and classify into one of these categories:
            - sales_inquiry: User asking about products/services/pricing
            - customer_service: User needs help/support
            - scheduling: User wants to book appointment/meeting
            - telemarketing: User wants to make outbound calls
            - offer_request: User wants proposal/quote
            - general_chat: Casual conversation
            - unclear: Intent needs clarification
            
            Respond only with the category name.`
          },
          {
            role: 'user',
            content: input
          }
        ],
        max_tokens: 20,
        temperature: 0.1
      });
      
      const intent = completion.choices[0].message.content?.trim() || 'unclear';
      context.intent = intent;
      this.log(context, 'Intent classified', { intent, input: input.substring(0, 100) });
      
      return intent;
    } catch (error) {
      console.error('Intent analysis error:', error);
      context.intent = 'unclear';
      return 'unclear';
    }
  }
  
  private detectIntentFallback(input: string): string {
    const intentPatterns = {
      'sales_inquiry': /سعر|price|cost|تكلفة|كم|how much/i,
      'customer_service': /مساعدة|help|support|دعم|مشكلة|problem/i,
      'scheduling': /موعد|meeting|appointment|حجز|book/i,
      'telemarketing': /اتصل|call|اتصال|phone|\+\d+/i,
      'offer_request': /عرض|quote|proposal|اقتراح|عرض سعر/i
    };
    
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(input)) {
        return intent;
      }
    }
    
    return 'general_chat';
  }
}

// 🧭 Orchestrator Agent (Main Controller)
class OrchestratorAgent extends BaseAgent {
  private agents: Map<string, BaseAgent>;
  
  constructor() {
    super('OrchestratorAgent', '🧭');
    this.agents = new Map();
    this.initializeAgents();
  }
  
  private initializeAgents() {
    this.agents.set('language', new LanguageAgent());
    this.agents.set('intent', new IntentAgent());
    this.agents.set('task', new TaskAgent());
    this.agents.set('offer', new OfferAgent());
    this.agents.set('call', new CallAgent());
    this.agents.set('customer_service', new CustomerServiceAgent());
    this.agents.set('scheduler', new SchedulerAgent());
    this.agents.set('memory', new MemoryAgent());
    this.agents.set('response', new ResponseAgent());
    this.agents.set('security', new SecurityAgent());
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    try {
      // 1. Security validation
      const securityAgent = this.agents.get('security')!;
      const securityCheck = await securityAgent.process(context, input);
      if (!securityCheck.allowed) {
        return { error: 'Access denied', message: securityCheck.reason };
      }
      
      // 2. Language detection
      const languageAgent = this.agents.get('language')!;
      await languageAgent.process(context, input);
      
      // 3. Intent analysis
      const intentAgent = this.agents.get('intent')!;
      await intentAgent.process(context, input);
      
      // 4. Route to appropriate agent based on intent
      let result: any = {};
      
      switch (context.intent) {
        case 'sales_inquiry':
          const offerAgent = this.agents.get('offer')!;
          result = await offerAgent.process(context, input);
          break;
          
        case 'customer_service':
          const customerAgent = this.agents.get('customer_service')!;
          result = await customerAgent.process(context, input);
          break;
          
        case 'scheduling':
          const schedulerAgent = this.agents.get('scheduler')!;
          result = await schedulerAgent.process(context, input);
          break;
          
        case 'telemarketing':
          const callAgent = this.agents.get('call')!;
          result = await callAgent.process(context, input);
          break;
          
        case 'offer_request':
          const taskAgent = this.agents.get('task')!;
          const task = await taskAgent.process(context, input);
          const offerAgent2 = this.agents.get('offer')!;
          result = await offerAgent2.process(context, task);
          break;
          
        default:
          result = { needsClarification: true, intent: context.intent };
      }
      
      // 5. Store in memory
      const memoryAgent = this.agents.get('memory')!;
      await memoryAgent.process(context, { input, result });
      
      // 6. Generate response
      const responseAgent = this.agents.get('response')!;
      const finalResponse = await responseAgent.process(context, result);
      
      this.log(context, 'Orchestration complete', { 
        intent: context.intent, 
        language: context.language,
        agentsUsed: this.getUsedAgents(context.intent)
      });
      
      return finalResponse;
      
    } catch (error) {
      console.error('Orchestration error:', error);
      return { 
        error: 'Processing failed', 
        message: 'عذراً، حدث خطأ في معالجة طلبك' 
      };
    }
  }
  
  private getUsedAgents(intent: string): string[] {
    const agentMap: { [key: string]: string[] } = {
      'sales_inquiry': ['security', 'language', 'intent', 'offer', 'memory', 'response'],
      'customer_service': ['security', 'language', 'intent', 'customer_service', 'memory', 'response'],
      'scheduling': ['security', 'language', 'intent', 'scheduler', 'memory', 'response'],
      'telemarketing': ['security', 'language', 'intent', 'call', 'memory', 'response'],
      'offer_request': ['security', 'language', 'intent', 'task', 'offer', 'memory', 'response']
    };
    
    return agentMap[intent] || ['security', 'language', 'intent', 'memory', 'response'];
  }
}

// 📋 Task Generation Agent
class TaskAgent extends BaseAgent {
  constructor() {
    super('TaskAgent', '📋');
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    const taskStructure = {
      id: `task_${Date.now()}`,
      type: context.intent,
      language: context.language,
      priority: this.calculatePriority(context.userRole),
      requirements: this.extractRequirements(input),
      estimatedTime: this.estimateTime(context.intent),
      assignedAgent: this.getAgentForTask(context.intent)
    };
    
    context.currentTask = taskStructure;
    this.log(context, 'Task generated', taskStructure);
    
    return taskStructure;
  }
  
  private calculatePriority(role: string): 'high' | 'medium' | 'low' {
    const priorityMap: { [key: string]: 'high' | 'medium' | 'low' } = {
      'admin': 'high',
      'marketing_manager': 'high',
      'sales_manager': 'medium',
      'viewer': 'low'
    };
    return priorityMap[role] || 'low';
  }
  
  private extractRequirements(input: string): string[] {
    // Simple keyword extraction for requirements
    const keywords = input.toLowerCase().match(/\b(?:تحتاج|أريد|طلب|مطلوب|need|want|require|request)\s+([^.!?]*)/g);
    return keywords || ['General assistance'];
  }
  
  private estimateTime(intent: string): string {
    const timeMap: { [key: string]: string } = {
      'sales_inquiry': '2-3 minutes',
      'customer_service': '5-10 minutes',
      'scheduling': '3-5 minutes',
      'telemarketing': '10-15 minutes',
      'offer_request': '5-10 minutes'
    };
    return timeMap[intent] || '2-5 minutes';
  }
  
  private getAgentForTask(intent: string): string {
    const agentMap: { [key: string]: string } = {
      'sales_inquiry': 'OfferAgent',
      'customer_service': 'CustomerServiceAgent',
      'scheduling': 'SchedulerAgent',
      'telemarketing': 'CallAgent',
      'offer_request': 'OfferAgent'
    };
    return agentMap[intent] || 'ResponseAgent';
  }
}

// 🧾 Offer Generation Agent
class OfferAgent extends BaseAgent {
  constructor() {
    super('OfferAgent', '🧾');
  }
  
  async process(context: AgentContext, input: any): Promise<any> {
    const businessTypes = {
      'restaurant': { price: 25000, features: ['إدارة الطاولات', 'نظام POS', 'إدارة المخزون'] },
      'store': { price: 15000, features: ['متجر إلكتروني', 'إدارة المنتجات', 'نظام دفع'] },
      'app': { price: 35000, features: ['تطبيق موبايل', 'واجهة مستخدم', 'إدارة البيانات'] },
      'crm': { price: 45000, features: ['إدارة العملاء', 'تتبع المبيعات', 'تقارير متقدمة'] }
    };
    
    // Detect business type from input
    let detectedType = 'store';
    const inputText = typeof input === 'string' ? input : JSON.stringify(input);
    
    if (/مطعم|مقهى|restaurant|cafe/i.test(inputText)) detectedType = 'restaurant';
    else if (/تطبيق|موبايل|app|mobile/i.test(inputText)) detectedType = 'app';
    else if (/crm|عملاء|customers/i.test(inputText)) detectedType = 'crm';
    
    const offer = businessTypes[detectedType as keyof typeof businessTypes];
    
    const proposal = {
      type: detectedType,
      price: offer.price,
      currency: 'SAR',
      features: offer.features,
      language: context.language,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      contactInfo: 'sales@siyadah.ai',
      terms: context.language === 'ar' ? 'الدفع 50% مقدم و 50% عند التسليم' : '50% upfront, 50% on delivery'
    };
    
    this.log(context, 'Offer generated', proposal);
    return proposal;
  }
}

// 📞 Call Management Agent
class CallAgent extends BaseAgent {
  constructor() {
    super('CallAgent', '📞');
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    // Extract phone number from input
    const phoneRegex = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9})/g;
    const phones = input.match(phoneRegex);
    
    if (!phones || phones.length === 0) {
      return {
        needsPhoneNumber: true,
        message: context.language === 'ar' ? 
          'من فضلك أدخل رقم الهاتف للاتصال' : 
          'Please provide the phone number to call'
      };
    }
    
    const callData = {
      phoneNumber: phones[0],
      callType: 'outbound_sales',
      language: context.language,
      script: this.generateCallScript(context.language),
      scheduledTime: new Date(),
      estimatedDuration: '5-10 minutes'
    };
    
    this.log(context, 'Call scheduled', callData);
    
    // Trigger actual call via Siyadah VoIP
    try {
      const callResult = await this.initiateCall(callData);
      return { ...callData, callResult };
    } catch (error) {
      return { 
        ...callData, 
        error: 'Call failed to initiate',
        message: context.language === 'ar' ? 
          'فشل في بدء المكالمة، سنعاود المحاولة قريباً' :
          'Call failed to start, we will try again shortly'
      };
    }
  }
  
  private generateCallScript(language: string): string {
    const scripts = {
      'ar': 'مرحباً، معك سيادة AI. نحن شركة متخصصة في الذكاء الاصطناعي للأعمال. هل يمكنني أن أعرض عليك حلولنا التقنية؟',
      'ar-najdi': 'السلام عليكم، معك من سيادة AI. نحن شركة تقنية، نقدر نساعدكم في تطوير أعمالكم. ممكن نتكلم دقائق؟',
      'en': 'Hello, this is Siyadah AI. We specialize in AI solutions for businesses. May I tell you about our services?',
      'es': 'Hola, soy de Siyadah AI. Nos especializamos en soluciones de IA para empresas. ¿Puedo contarle sobre nuestros servicios?',
      'fr': 'Bonjour, je suis de Siyadah AI. Nous sommes spécialisés dans les solutions IA pour les entreprises. Puis-je vous parler de nos services?'
    };
    
    return scripts[language as keyof typeof scripts] || scripts['en'];
  }
  
  private async initiateCall(callData: any): Promise<any> {
    // Integration with existing Siyadah VoIP system
    try {
      const response = await fetch('http://localhost:5000/api/siyadah-voip/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: callData.phoneNumber,
          message: callData.script
        })
      });
      
      return await response.json();
    } catch (error) {
      throw new Error('Siyadah VoIP integration failed');
    }
  }
}

// 🧑‍💻 Customer Service Agent
class CustomerServiceAgent extends BaseAgent {
  constructor() {
    super('CustomerServiceAgent', '🧑‍💻');
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a helpful customer service representative for Siyadah AI. 
            Respond in ${context.language} language.
            Be polite, professional, and solution-oriented.
            Our services: Store systems (15K SAR), Restaurant systems (25K SAR), Mobile apps (35K SAR), CRM systems (45K SAR).`
          },
          {
            role: 'user',
            content: input
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
      
      const response = completion.choices[0].message.content || 'How can I help you?';
      
      this.log(context, 'Customer service response generated', { 
        input: input.substring(0, 100),
        response: response.substring(0, 100)
      });
      
      return {
        response,
        type: 'customer_service',
        language: context.language,
        followUpActions: this.suggestFollowUp(input)
      };
      
    } catch (error) {
      return {
        response: context.language === 'ar' ? 
          'أعتذر، دعني أتواصل مع فريق الدعم لمساعدتك' :
          'I apologize, let me connect you with our support team',
        type: 'customer_service_error'
      };
    }
  }
  
  private suggestFollowUp(input: string): string[] {
    const suggestions = [];
    
    if (/price|سعر|تكلفة/i.test(input)) {
      suggestions.push('request_quote');
    }
    if (/demo|تجربة|عرض/i.test(input)) {
      suggestions.push('schedule_demo');
    }
    if (/support|دعم|مساعدة/i.test(input)) {
      suggestions.push('technical_support');
    }
    
    return suggestions;
  }
}

// 📆 Scheduler Agent
class SchedulerAgent extends BaseAgent {
  constructor() {
    super('SchedulerAgent', '📆');
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    // Extract time/date information
    const timePatterns = {
      'ar': /(?:غداً|اليوم|الساعة|في|يوم|صباحاً|مساءً|\d{1,2}:\d{2})/g,
      'en': /(?:today|tomorrow|at|morning|afternoon|evening|\d{1,2}:\d{2}|am|pm)/gi
    };
    
    const timeMatches = input.match(timePatterns[context.language as keyof typeof timePatterns] || timePatterns['en']);
    
    const appointment = {
      requestedTime: timeMatches?.join(' ') || 'flexible',
      type: this.detectAppointmentType(input),
      language: context.language,
      duration: '30 minutes',
      status: 'pending',
      availableSlots: this.getAvailableSlots(),
      meetingLink: 'https://meet.siyadah.ai/room/' + Math.random().toString(36).substr(2, 9)
    };
    
    this.log(context, 'Appointment scheduled', appointment);
    
    return appointment;
  }
  
  private detectAppointmentType(input: string): string {
    if (/demo|عرض|تجربة/i.test(input)) return 'demo';
    if (/consultation|استشارة|مشورة/i.test(input)) return 'consultation';
    if (/meeting|اجتماع|لقاء/i.test(input)) return 'meeting';
    return 'general';
  }
  
  private getAvailableSlots(): string[] {
    const now = new Date();
    const slots = [];
    
    for (let i = 1; i <= 5; i++) {
      const slotTime = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      slots.push(slotTime.toISOString().split('T')[0] + ' 10:00 AM');
      slots.push(slotTime.toISOString().split('T')[0] + ' 2:00 PM');
    }
    
    return slots.slice(0, 6); // Return 6 available slots
  }
}

// 🧠 Memory Agent
class MemoryAgent extends BaseAgent {
  constructor() {
    super('MemoryAgent', '🧠');
  }
  
  async process(context: AgentContext, data: any): Promise<void> {
    const memoryEntry = {
      timestamp: new Date(),
      sessionId: context.sessionId,
      userId: context.userId,
      language: context.language,
      intent: context.intent,
      data: data,
      taskId: data.taskId || `memory_${Date.now()}`
    };
    
    // Store in context memory bank
    context.memoryBank.set(memoryEntry.taskId, memoryEntry);
    
    // Also store in conversation history
    context.conversationHistory.push({
      role: 'memory_agent',
      content: `Stored: ${JSON.stringify(memoryEntry)}`,
      timestamp: new Date(),
      taskId: memoryEntry.taskId
    });
    
    this.log(context, 'Memory stored', { taskId: memoryEntry.taskId, dataSize: JSON.stringify(data).length });
  }
}

// 🎤 Response Agent
class ResponseAgent extends BaseAgent {
  constructor() {
    super('ResponseAgent', '🎤');
  }
  
  async process(context: AgentContext, data: any): Promise<any> {
    if (data.error) {
      return this.generateErrorResponse(context, data);
    }
    
    if (data.needsClarification) {
      return this.generateClarificationRequest(context);
    }
    
    return this.generateSuccessResponse(context, data);
  }
  
  private generateErrorResponse(context: AgentContext, data: any): any {
    const errorMessages = {
      'ar': 'أعتذر، حدث خطأ أثناء معالجة طلبك. دعني أساعدك بطريقة أخرى.',
      'ar-najdi': 'والله أعتذر، صار خطأ. خلنا نحاول مرة ثانية.',
      'en': 'I apologize, an error occurred while processing your request. Let me help you in a different way.',
      'es': 'Disculpa, ocurrió un error al procesar tu solicitud. Permíteme ayudarte de otra manera.',
      'fr': 'Je m\'excuse, une erreur s\'est produite lors du traitement de votre demande. Permettez-moi de vous aider autrement.'
    };
    
    return {
      message: errorMessages[context.language as keyof typeof errorMessages] || errorMessages['en'],
      type: 'error',
      language: context.language,
      suggestedActions: ['retry', 'contact_support']
    };
  }
  
  private generateClarificationRequest(context: AgentContext): any {
    const clarificationMessages = {
      'ar': 'لم أفهم طلبك بوضوح. هل يمكنك توضيح ما تحتاجه بالتحديد؟',
      'ar-najdi': 'ما فهمت قصدك زين. ممكن توضح أكثر وش تبي بالضبط؟',
      'en': 'I didn\'t understand your request clearly. Could you please clarify what exactly you need?',
      'es': 'No entendí tu solicitud claramente. ¿Podrías aclarar exactamente qué necesitas?',
      'fr': 'Je n\'ai pas bien compris votre demande. Pourriez-vous clarifier ce dont vous avez exactement besoin?'
    };
    
    return {
      message: clarificationMessages[context.language as keyof typeof clarificationMessages] || clarificationMessages['en'],
      type: 'clarification',
      language: context.language,
      suggestedQuestions: this.getSuggestedQuestions(context.language)
    };
  }
  
  private generateSuccessResponse(context: AgentContext, data: any): any {
    let message = '';
    
    switch (data.type) {
      case 'offer':
        message = this.formatOfferResponse(context, data);
        break;
      case 'appointment':
        message = this.formatAppointmentResponse(context, data);
        break;
      case 'call':
        message = this.formatCallResponse(context, data);
        break;
      case 'customer_service':
        message = data.response;
        break;
      default:
        message = this.formatGeneralResponse(context, data);
    }
    
    this.log(context, 'Response generated', { type: data.type, language: context.language });
    
    return {
      message,
      type: 'success',
      language: context.language,
      data: data,
      timestamp: new Date()
    };
  }
  
  private formatOfferResponse(context: AgentContext, data: any): string {
    const templates = {
      'ar': `ممتاز! أقدر أقدم لك ${data.type} بسعر ${data.price.toLocaleString()} ريال. يشمل: ${data.features.join('، ')}. العرض صالح حتى ${new Date(data.validUntil).toLocaleDateString('ar-SA')}.`,
      'ar-najdi': `تمام! أقدر أسوي لك ${data.type} بـ ${data.price.toLocaleString()} ريال. ويشمل: ${data.features.join('، ')}. العرض ساري إلى ${new Date(data.validUntil).toLocaleDateString('ar-SA')}.`,
      'en': `Excellent! I can offer you a ${data.type} system for ${data.price.toLocaleString()} SAR. It includes: ${data.features.join(', ')}. Offer valid until ${new Date(data.validUntil).toLocaleDateString()}.`,
      'es': `¡Excelente! Puedo ofrecerte un sistema ${data.type} por ${data.price.toLocaleString()} SAR. Incluye: ${data.features.join(', ')}. Oferta válida hasta ${new Date(data.validUntil).toLocaleDateString()}.`,
      'fr': `Excellent ! Je peux vous offrir un système ${data.type} pour ${data.price.toLocaleString()} SAR. Il comprend : ${data.features.join(', ')}. Offre valable jusqu'au ${new Date(data.validUntil).toLocaleDateString()}.`
    };
    
    return templates[context.language as keyof typeof templates] || templates['en'];
  }
  
  private formatAppointmentResponse(context: AgentContext, data: any): string {
    const templates = {
      'ar': `تم تحديد موعد ${data.type}. الأوقات المتاحة: ${data.availableSlots.slice(0, 3).join('، ')}. رابط الاجتماع: ${data.meetingLink}`,
      'ar-najdi': `تم حجز موعد ${data.type}. الأوقات المتاحة: ${data.availableSlots.slice(0, 3).join('، ')}. رابط اللقاء: ${data.meetingLink}`,
      'en': `${data.type} appointment scheduled. Available times: ${data.availableSlots.slice(0, 3).join(', ')}. Meeting link: ${data.meetingLink}`,
      'es': `Cita de ${data.type} programada. Horarios disponibles: ${data.availableSlots.slice(0, 3).join(', ')}. Enlace de reunión: ${data.meetingLink}`,
      'fr': `Rendez-vous ${data.type} programmé. Heures disponibles : ${data.availableSlots.slice(0, 3).join(', ')}. Lien de réunion : ${data.meetingLink}`
    };
    
    return templates[context.language as keyof typeof templates] || templates['en'];
  }
  
  private formatCallResponse(context: AgentContext, data: any): string {
    const templates = {
      'ar': `تم جدولة مكالمة إلى ${data.phoneNumber}. النص: ${data.script.substring(0, 100)}...`,
      'ar-najdi': `تم حجز مكالمة لـ ${data.phoneNumber}. الكلام: ${data.script.substring(0, 100)}...`,
      'en': `Call scheduled to ${data.phoneNumber}. Script: ${data.script.substring(0, 100)}...`,
      'es': `Llamada programada a ${data.phoneNumber}. Guión: ${data.script.substring(0, 100)}...`,
      'fr': `Appel programmé vers ${data.phoneNumber}. Script : ${data.script.substring(0, 100)}...`
    };
    
    return templates[context.language as keyof typeof templates] || templates['en'];
  }
  
  private formatGeneralResponse(context: AgentContext, data: any): string {
    const templates = {
      'ar': 'تم تنفيذ طلبك بنجاح. كيف يمكنني مساعدتك أكثر؟',
      'ar-najdi': 'تم إنجاز طلبك. وش تحتاج أكثر؟',
      'en': 'Your request has been completed successfully. How else can I help you?',
      'es': 'Tu solicitud se ha completado exitosamente. ¿En qué más puedo ayudarte?',
      'fr': 'Votre demande a été traitée avec succès. Comment puis-je vous aider davantage ?'
    };
    
    return templates[context.language as keyof typeof templates] || templates['en'];
  }
  
  private getSuggestedQuestions(language: string): string[] {
    const suggestions = {
      'ar': [
        'أريد معرفة الأسعار',
        'أحتاج موعد للمناقشة',
        'أريد التحدث مع فريق المبيعات'
      ],
      'en': [
        'I want to know the prices',
        'I need an appointment to discuss',
        'I want to talk to the sales team'
      ],
      'es': [
        'Quiero conocer los precios',
        'Necesito una cita para discutir',
        'Quiero hablar con el equipo de ventas'
      ],
      'fr': [
        'Je veux connaître les prix',
        'J\'ai besoin d\'un rendez-vous pour discuter',
        'Je veux parler à l\'équipe de vente'
      ]
    };
    
    return suggestions[language as keyof typeof suggestions] || suggestions['en'];
  }
}

// 🛡️ Security Agent
class SecurityAgent extends BaseAgent {
  constructor() {
    super('SecurityAgent', '🛡️');
  }
  
  async process(context: AgentContext, input: string): Promise<any> {
    // Role-based access control
    const rolePermissions = {
      'admin': ['all'],
      'marketing_manager': ['sales_inquiry', 'offer_request', 'telemarketing', 'scheduling'],
      'sales_manager': ['sales_inquiry', 'offer_request', 'customer_service', 'scheduling'],
      'viewer': ['sales_inquiry', 'general_chat']
    };
    
    const userPermissions = rolePermissions[context.userRole] || ['general_chat'];
    
    // Check for risky instructions
    const riskyPatterns = [
      /delete|drop|remove|destroy/i,
      /admin|root|sudo|password/i,
      /hack|exploit|attack|malware/i,
      /حذف|إزالة|تدمير|هجوم/i
    ];
    
    const hasRiskyContent = riskyPatterns.some(pattern => pattern.test(input));
    
    if (hasRiskyContent) {
      this.log(context, 'Security risk detected', { input: input.substring(0, 50), risk: 'risky_content' });
      return {
        allowed: false,
        reason: 'Risky content detected',
        message: context.language === 'ar' ? 
          'لا يمكنني تنفيذ هذا الطلب لأسباب أمنية' :
          'I cannot execute this request for security reasons'
      };
    }
    
    // Check intent permissions
    if (!userPermissions.includes('all') && !userPermissions.includes(context.intent)) {
      this.log(context, 'Access denied', { 
        userRole: context.userRole, 
        intent: context.intent, 
        permissions: userPermissions 
      });
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        message: context.language === 'ar' ? 
          'ليس لديك صلاحية لتنفيذ هذا الطلب' :
          'You do not have permission to execute this request'
      };
    }
    
    this.log(context, 'Security check passed', { 
      userRole: context.userRole, 
      intent: context.intent 
    });
    
    return { allowed: true };
  }
}

// Main Multi-Agent System
export class MultilingualAgentSystem {
  private orchestrator: OrchestratorAgent;
  private sessions: Map<string, AgentContext>;
  
  constructor() {
    this.orchestrator = new OrchestratorAgent();
    this.sessions = new Map();
  }
  
  async processMessage(
    sessionId: string,
    userId: string,
    userRole: string,
    message: string,
    businessType: string = 'general'
  ): Promise<any> {
    
    // Get or create session context
    let context = this.sessions.get(sessionId);
    if (!context) {
      context = {
        sessionId,
        userId,
        userRole: userRole as any,
        language: 'en',
        intent: '',
        businessType,
        conversationHistory: [],
        memoryBank: new Map()
      };
      this.sessions.set(sessionId, context);
    }
    
    // Process through orchestrator
    try {
      const result = await this.orchestrator.process(context, message);
      
      // Update session
      this.sessions.set(sessionId, context);
      
      return result;
    } catch (error) {
      console.error('Multi-agent system error:', error);
      return {
        error: 'System error',
        message: 'عذراً، حدث خطأ في النظام'
      };
    }
  }
  
  getSessionHistory(sessionId: string): any[] {
    const context = this.sessions.get(sessionId);
    return context?.conversationHistory || [];
  }
  
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
  
  getActiveAgents(): string[] {
    return [
      '🌐 LanguageAgent',
      '📥 IntentAgent', 
      '🧭 OrchestratorAgent',
      '📋 TaskAgent',
      '🧾 OfferAgent',
      '📞 CallAgent',
      '🧑‍💻 CustomerServiceAgent',
      '📆 SchedulerAgent',
      '🧠 MemoryAgent',
      '🎤 ResponseAgent',
      '🛡️ SecurityAgent'
    ];
  }
  
  getSystemStats(): any {
    return {
      activeSessions: this.sessions.size,
      totalAgents: 11,
      supportedLanguages: ['ar', 'ar-najdi', 'en', 'es', 'fr'],
      uptime: process.uptime()
    };
  }
}

// Export singleton instance
export const multiAgentSystem = new MultilingualAgentSystem();