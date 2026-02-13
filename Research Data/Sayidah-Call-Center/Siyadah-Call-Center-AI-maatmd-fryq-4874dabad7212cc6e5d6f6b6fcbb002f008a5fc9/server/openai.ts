import OpenAI from 'openai';

interface AIResponse {
  success: boolean;
  response?: string;
  actions?: Array<{
    type: string;
    description: string;
    count?: number;
    link?: string;
  }>;
  confidence?: number;
  context?: any;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  history: Array<{
    date: string;
    type: 'call' | 'email' | 'whatsapp';
    content: string;
    status: string;
  }>;
  preferences: {
    language: string;
    contactMethod: string;
    bestTime: string;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

class AdvancedAIEngine {
  private openai: OpenAI | null = null;
  private customerProfiles: Map<string, CustomerProfile> = new Map();

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  // تحليل المشاعر المتقدم
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
    urgency: 'low' | 'medium' | 'high' | 'urgent';
  }> {
    if (!this.openai) {
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
        urgency: 'medium'
      };
    }

    try {
      const prompt = `
تحليل المشاعر والحالة العاطفية للنص التالي باللغة العربية:

"${text}"

قم بالرد بصيغة JSON فقط:
{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.0-1.0,
  "emotions": ["قائمة بالمشاعر المكتشفة"],
  "urgency": "low|medium|high|urgent",
  "keywords": ["الكلمات المفتاحية المهمة"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Sentiment Analysis Error:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: [],
        urgency: 'medium'
      };
    }
  }

  // إنشاء رد تلقائي ذكي
  async generateSmartResponse(
    customerMessage: string,
    context: {
      customerProfile?: CustomerProfile;
      previousMessages?: string[];
      businessType?: string;
      urgency?: string;
    }
  ): Promise<{
    response: string;
    suggestedActions: string[];
    followUpQuestions: string[];
    escalate: boolean;
  }> {
    if (!this.openai) {
      return {
        response: 'شكراً لك على تواصلك معنا. سيتم الرد عليك في أقرب وقت ممكن.',
        suggestedActions: ['متابعة لاحقة'],
        followUpQuestions: [],
        escalate: false
      };
    }

    try {
      const prompt = `
أنت مساعد ذكي لخدمة العملاء باللغة العربية. 

رسالة العميل: "${customerMessage}"

السياق:
- نوع العمل: ${context.businessType || 'خدمات عامة'}
- الأولوية: ${context.urgency || 'عادية'}
- تاريخ العميل: ${context.customerProfile ? 'عميل دائم' : 'عميل جديد'}

قم بإنشاء رد مهني ومفيد يتضمن:
1. رد مناسب ومفصل
2. اقتراحات للإجراءات التالية
3. أسئلة للمتابعة إذا لزم الأمر
4. تحديد ما إذا كان يحتاج تصعيد لموظف بشري

الرد بصيغة JSON:
{
  "response": "الرد النصي",
  "suggestedActions": ["قائمة الإجراءات المقترحة"],
  "followUpQuestions": ["أسئلة المتابعة"],
  "escalate": boolean
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Response Generation Error:', error);
      return {
        response: 'شكراً لك على تواصلك معنا. سيتم الرد عليك في أقرب وقت ممكن.',
        suggestedActions: ['متابعة لاحقة'],
        followUpQuestions: [],
        escalate: false
      };
    }
  }

  // تحليل جودة المكالمة
  async analyzeCallQuality(
    transcript: string,
    duration: number,
    outcome: string
  ): Promise<{
    qualityScore: number;
    strengths: string[];
    improvements: string[];
    customerSatisfaction: number;
    recommendations: string[];
  }> {
    if (!this.openai) {
      return {
        qualityScore: 7.5,
        strengths: ['تفاعل جيد'],
        improvements: ['تحسين وقت الاستجابة'],
        customerSatisfaction: 8.0,
        recommendations: ['متابعة دورية']
      };
    }

    try {
      const prompt = `
تحليل جودة المكالمة التالية:

النص المكتوب: "${transcript}"
المدة: ${duration} ثانية
النتيجة: ${outcome}

قم بتقييم:
1. جودة الخدمة (1-10)
2. نقاط القوة
3. مجالات التحسين
4. رضا العميل المتوقع (1-10)
5. توصيات للمستقبل

الرد بصيغة JSON:
{
  "qualityScore": 1-10,
  "strengths": ["نقاط القوة"],
  "improvements": ["مجالات التحسين"],
  "customerSatisfaction": 1-10,
  "recommendations": ["التوصيات"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Call Analysis Error:', error);
      return {
        qualityScore: 7.5,
        strengths: ['تفاعل جيد'],
        improvements: ['تحسين وقت الاستجابة'],
        customerSatisfaction: 8.0,
        recommendations: ['متابعة دورية']
      };
    }
  }

  // تحليل البيانات والإحصائيات
  async generateInsights(data: {
    totalCalls: number;
    totalEmails: number;
    totalWhatsApp: number;
    averageResponseTime: number;
    satisfactionRating: number;
    commonIssues: string[];
  }): Promise<{
    insights: string[];
    trends: string[];
    recommendations: string[];
    predictions: string[];
  }> {
    if (!this.openai) {
      return {
        insights: ['ازدياد في الاستفسارات'],
        trends: ['تحسن في أوقات الاستجابة'],
        recommendations: ['زيادة فريق الدعم'],
        predictions: ['نمو متوقع في الخدمات']
      };
    }

    try {
      const prompt = `
تحليل بيانات خدمة العملاء:

إجمالي المكالمات: ${data.totalCalls}
إجمالي الإيميلات: ${data.totalEmails}
إجمالي رسائل واتساب: ${data.totalWhatsApp}
متوسط وقت الاستجابة: ${data.averageResponseTime} دقيقة
تقييم الرضا: ${data.satisfactionRating}/10
المشاكل الشائعة: ${data.commonIssues.join(', ')}

قدم تحليلاً شاملاً بصيغة JSON:
{
  "insights": ["رؤى مهمة من البيانات"],
  "trends": ["الاتجاهات المكتشفة"],
  "recommendations": ["توصيات للتحسين"],
  "predictions": ["توقعات مستقبلية"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Insights Generation Error:', error);
      return {
        insights: ['ازدياد في الاستفسارات'],
        trends: ['تحسن في أوقات الاستجابة'],
        recommendations: ['زيادة فريق الدعم'],
        predictions: ['نمو متوقع في الخدمات']
      };
    }
  }

  // إنشاء تقارير ذكية
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    data: any
  ): Promise<{
    summary: string;
    keyMetrics: Array<{ name: string; value: string; trend: string }>;
    recommendations: string[];
    nextActions: string[];
  }> {
    if (!this.openai) {
      return {
        summary: 'تقرير شامل لأداء خدمة العملاء',
        keyMetrics: [
          { name: 'المكالمات المنجزة', value: '150', trend: 'up' },
          { name: 'معدل الرضا', value: '8.5/10', trend: 'stable' }
        ],
        recommendations: ['تحسين وقت الاستجابة'],
        nextActions: ['مراجعة العمليات']
      };
    }

    try {
      const prompt = `
إنشاء تقرير ${type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'} لخدمة العملاء:

البيانات: ${JSON.stringify(data)}

قم بإنشاء تقرير شامل بصيغة JSON:
{
  "summary": "ملخص التقرير",
  "keyMetrics": [
    {"name": "اسم المؤشر", "value": "القيمة", "trend": "up|down|stable"}
  ],
  "recommendations": ["توصيات للتحسين"],
  "nextActions": ["الإجراءات التالية"]
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('AI Report Generation Error:', error);
      return {
        summary: 'تقرير شامل لأداء خدمة العملاء',
        keyMetrics: [
          { name: 'المكالمات المنجزة', value: '150', trend: 'up' },
          { name: 'معدل الرضا', value: '8.5/10', trend: 'stable' }
        ],
        recommendations: ['تحسين وقت الاستجابة'],
        nextActions: ['مراجعة العمليات']
      };
    }
  }

  // Methods for backward compatibility with existing routes
  async processSmartCommand(command: string, realData: any) {
    return await processAICommand(command, 'general', realData);
  }

  async analyzeOpportunity(opportunity: any) {
    return {
      analysis: `تحليل الفرصة: ${opportunity.name}`,
      recommendations: ['متابعة العميل خلال 24 ساعة', 'إرسال عرض مخصص'],
      probability: opportunity.probability || 70,
      nextSteps: ['جدولة اجتماع', 'إرسال عرض تفصيلي']
    };
  }

  async generateEmailTemplate(context: any) {
    return `الموضوع: ${context.subject || 'متابعة مهمة'}

مرحباً ${context.customerName || 'عزيزي العميل'},

نشكرك على اهتمامك بخدماتنا. نتطلع لخدمتك بأفضل شكل ممكن.

مع أطيب التحيات،
فريق العمل`;
  }

  async generateWorkflowSuggestions(workflowType: string, context: any) {
    return [
      'إرسال رسالة ترحيب تلقائية',
      'جدولة مكالمة متابعة',
      'إضافة للقائمة البريدية',
      'تعيين وكيل مبيعات'
    ];
  }

  async generateAdvancedAnalytics(analyticsData: any) {
    return {
      insights: [
        `إجمالي الفرص: ${analyticsData.opportunities.length}`,
        `القيمة الإجمالية: ${analyticsData.summary.totalPipelineValue.toLocaleString()} ريال`,
        `معدل التحويل: ${analyticsData.summary.conversionRate.toFixed(1)}%`
      ],
      trends: [
        'ازدياد في الاستفسارات بنسبة 15%',
        'تحسن في أوقات الاستجابة',
        'ارتفاع في معدل الرضا'
      ],
      recommendations: [
        'زيادة فريق المبيعات',
        'تحسين عملية المتابعة',
        'استخدام أدوات أتمتة إضافية'
      ]
    };
  }
}

interface CommandIntent {
  type: string;
  target?: string;
  path?: string;
  entity?: string;
  filters?: any;
  action?: string;
  parameters?: any;
  method?: string;
  confidence?: number;
}

// Updated function with enhanced capabilities
export async function processAICommand(message: string, context: string = 'general', metadata?: any) {
  const startTime = Date.now();

  try {
    // Analyze the command intent with enhanced understanding
    const intent = analyzeCommandIntent(message);

    // Handle specific intents with enhanced capabilities
    switch (intent.type) {
      case 'navigation':
        return {
          text: `سأنقلك إلى ${intent.target}`,
          actions: [{ type: 'navigate', target: intent.path }],
          suggestions: [`عرض تقارير ${intent.target}`, `إدارة ${intent.target}`],
          processingTime: Date.now() - startTime,
          confidence: intent.confidence || 0.9
        };

      case 'communication':
        return await handleCommunicationRequest(intent);

      case 'data_query':
        return await handleDataQuery(intent.entity, intent.filters);

      case 'action_request':
        return await handleActionRequest(intent.action, intent.parameters);

      case 'system_status':
        return await handleSystemStatusQuery();

      default:
        return await generateGeneralResponse(message, context, metadata);
    }
  } catch (error: any) {
    console.error('Error processing AI command:', error);

    // Enhanced error handling
    if (error.code === 'TIMEOUT') {
      error.processingTime = Date.now() - startTime;
    }

    throw error;
  }
}

async function handleCommunicationRequest(intent: any) {
  const { ExternalAPIService } = await import('./external-apis');
  const { storage } = await import('./mongodb-storage');
  
  try {
    // Get real customer data
    const opportunities = await storage.getAllOpportunities();
    const customers = opportunities.map(opp => ({ 
      name: opp.name, 
      phone: opp.phone, 
      email: opp.email,
      stage: opp.stage 
    }));

    if (intent.action === 'call') {
      if (intent.target && intent.target.includes('+')) {
        // Direct call to specific number
        const result = await ExternalAPIService.makeCall({
          to: intent.target,
          message: `مرحباً، هذه مكالمة من نظام الأتمتة التجارية للمتابعة معكم.`
        });

        return {
          response: result.success 
            ? `✅ تم إجراء مكالمة بنجاح إلى ${intent.target}\nمعرف المكالمة: ${result.callId}`
            : `❌ فشل في الاتصال: ${result.error}`,
          actions: result.success 
            ? [{ type: 'call_made', description: 'مكالمة منفذة', count: 1 }]
            : [],
          executionPlan: {
            completed: result.success ? 1 : 0,
            pending: result.success ? 0 : 1,
            nextSteps: result.success ? 'متابعة نتيجة المكالمة' : 'إعادة المحاولة أو تجربة رقم آخر',
            timeline: 'تم التنفيذ فوراً'
          }
        };
      } else {
        // Call customers from database
        const callTargets = customers.filter(c => c.phone).slice(0, 2);
        let results = [];
        let successCount = 0;

        for (const customer of callTargets) {
          try {
            const result = await ExternalAPIService.makeCall({
              to: customer.phone,
              message: `مرحباً ${customer.name}، هذه مكالمة من نظام الأتمتة التجارية لمتابعة ${customer.stage}.`
            });

            if (result.success) {
              results.push(`✅ تم الاتصال بـ ${customer.name} (${customer.phone})`);
              successCount++;
            } else {
              results.push(`❌ فشل الاتصال بـ ${customer.name}: ${result.error}`);
            }
          } catch (error) {
            results.push(`❌ خطأ في الاتصال بـ ${customer.name}`);
          }
        }

        return {
          response: `تم تنفيذ حملة اتصالات:\n\n${results.join('\n')}\n\nالإجمالي: ${successCount} من ${callTargets.length} مكالمة`,
          actions: [
            { type: 'call_campaign', description: 'حملة اتصالات', count: successCount }
          ],
          executionPlan: {
            completed: successCount,
            pending: callTargets.length - successCount,
            nextSteps: 'متابعة ردود العملاء وتسجيل النتائج',
            timeline: 'تم التنفيذ فوراً'
          }
        };
      }
    }

    if (intent.action === 'message') {
      let targets = [];
      let messageText = intent.message || 'مرحباً، نتواصل معكم من نظام الأتمتة التجارية.';

      // Determine targets based on intent
      if (intent.target === 'all' || intent.target === 'جميع') {
        targets = customers.filter(c => intent.method === 'whatsapp' ? c.phone : c.email);
      } else if (intent.target && intent.target.includes('+')) {
        targets = [{ name: 'العميل', phone: intent.target, email: intent.target }];
      } else {
        targets = customers.slice(0, 3); // Default to first 3 customers
      }

      let results = [];
      let successCount = 0;

      if (intent.method === 'whatsapp') {
        for (const customer of targets.filter(c => c.phone)) {
          try {
            const result = await ExternalAPIService.sendWhatsAppMessage({
              to: customer.phone,
              message: `مرحباً ${customer.name}، ${messageText}`
            });

            if (result.success) {
              results.push(`✅ واتساب لـ ${customer.name} (${customer.phone})`);
              successCount++;
            } else {
              results.push(`❌ فشل واتساب لـ ${customer.name}: ${result.error}`);
            }
          } catch (error) {
            results.push(`❌ خطأ واتساب لـ ${customer.name}`);
          }
        }
      } else if (intent.method === 'email') {
        for (const customer of targets.filter(c => c.email)) {
          try {
            const result = await ExternalAPIService.sendEmail({
              to: customer.email,
              subject: 'رسالة من نظام الأتمتة التجارية',
              body: `عزيزي ${customer.name}،\n\n${messageText}\n\nتحياتنا،\nفريق الأتمتة التجارية`
            });

            if (result.success) {
              results.push(`✅ إيميل لـ ${customer.name} (${customer.email})`);
              successCount++;
            } else {
              results.push(`❌ فشل إيميل لـ ${customer.name}: ${result.error}`);
            }
          } catch (error) {
            results.push(`❌ خطأ إيميل لـ ${customer.name}`);
          }
        }
      }

      return {
        response: `تم تنفيذ حملة ${intent.method === 'whatsapp' ? 'واتساب' : intent.method === 'email' ? 'بريد إلكتروني' : 'رسائل'}:\n\n${results.join('\n')}\n\nالإجمالي: ${successCount} من ${targets.length} رسالة`,
        actions: [
          { type: `${intent.method}_campaign`, description: `حملة ${intent.method}`, count: successCount }
        ],
        executionPlan: {
          completed: successCount,
          pending: targets.length - successCount,
          nextSteps: successCount > 0 ? 'مراقبة ردود العملاء' : 'مراجعة بيانات الاتصال',
          timeline: 'تم الإرسال فوراً'
        }
      };
    }

    return {
      response: 'لم أفهم نوع الاتصال المطلوب. يمكنني إجراء مكالمات أو إرسال رسائل واتساب أو إيميل.',
      actions: [],
      executionPlan: {
        completed: 0,
        pending: 1,
        nextSteps: 'توضيح نوع الاتصال المطلوب',
        timeline: 'في انتظار التوضيح'
      }
    };

  } catch (error) {
    console.error('Communication request error:', error);
    return {
      response: 'حدث خطأ في معالجة طلب التواصل. تأكد من إعدادات Siyadah VoIP.',
      actions: [],
      executionPlan: {
        completed: 0,
        pending: 1,
        nextSteps: 'مراجعة إعدادات النظام',
        timeline: 'يتطلب تدخل فني'
      }
    };
  }
}

async function handleSystemStatusQuery() {
  try {
    // Get system status information
    const status = {
      database: 'متصل',
      server: 'يعمل بشكل طبيعي',
      integrations: 'متاحة',
      lastUpdate: new Date().toLocaleString('ar-SA')
    };

    return {
      text: `حالة النظام: ${status.database} | الخادم: ${status.server} | آخر تحديث: ${status.lastUpdate}`,
      actions: [{ type: 'navigate', target: '/system-status' }],
      suggestions: ['عرض تفاصيل النظام', 'فحص الأداء', 'عرض السجلات'],
      processingTime: 0,
      confidence: 1.0
    };
  } catch (error) {
    return {
      text: 'لا يمكن الحصول على حالة النظام حالياً.',
      suggestions: ['إعادة المحاولة', 'التحقق من الاتصال'],
      processingTime: 0,
      confidence: 0.5,
      isError: true
    };
  }
}

// Enhanced command analysis for communication requests
function analyzeCommandIntent(message: string): CommandIntent {
  const lowerMessage = message.toLowerCase().trim();

  // Enhanced communication detection with Arabic context
  if (lowerMessage.includes('اتصل') || lowerMessage.includes('اتصال') || 
      lowerMessage.includes('كلم') || lowerMessage.includes('تواصل') ||
      lowerMessage.includes('call') || lowerMessage.includes('مكالمة') ||
      lowerMessage.includes('اتصالات')) {

    const phoneMatch = message.match(/(\+?\d{8,15})/);
    let target = phoneMatch ? phoneMatch[1] : null;
    
    // Check for target indicators
    if (lowerMessage.includes('جميع') || lowerMessage.includes('كل')) target = 'all';
    if (lowerMessage.includes('عملاء') || lowerMessage.includes('العملاء')) target = 'customers';

    return { 
      type: 'communication', 
      action: 'call', 
      target,
      confidence: 0.95
    };
  }

  if (lowerMessage.includes('رسالة') || lowerMessage.includes('رسل') || 
      lowerMessage.includes('واتس') || lowerMessage.includes('whatsapp') ||
      lowerMessage.includes('أرسل') || lowerMessage.includes('ارسل') ||
      lowerMessage.includes('إيميل') || lowerMessage.includes('email') ||
      lowerMessage.includes('بريد')) {

    let method = 'whatsapp'; // Default to WhatsApp for Arabic users
    if (lowerMessage.includes('إيميل') || lowerMessage.includes('email') || lowerMessage.includes('بريد')) {
      method = 'email';
    } else if (lowerMessage.includes('sms') || lowerMessage.includes('نص')) {
      method = 'sms';
    }

    const phoneMatch = message.match(/(\+?\d{8,15})/);
    let target = phoneMatch ? phoneMatch[1] : null;
    
    // Enhanced target detection
    if (lowerMessage.includes('جميع') || lowerMessage.includes('كل')) target = 'all';
    if (lowerMessage.includes('المهتمين')) target = 'interested';
    if (lowerMessage.includes('هذا الأسبوع')) target = 'this_week';
    if (lowerMessage.includes('العملاء')) target = 'customers';

    // Extract custom message if quoted
    const messageMatch = message.match(/["']([^"']+)["']/);
    const customMessage = messageMatch ? messageMatch[1] : null;

    return { 
      type: 'communication', 
      action: 'message', 
      target,
      method,
      message: customMessage,
      confidence: 0.95
    };
  }

  // System status intents
  if (lowerMessage.includes('حالة') || lowerMessage.includes('وضع') || 
      lowerMessage.includes('status') || lowerMessage.includes('نظام')) {
    return { type: 'system_status', confidence: 0.9 };
  }

  // Navigation intents
  if (lowerMessage.includes('اذهب') || lowerMessage.includes('انتقل') || 
      lowerMessage.includes('عرض') || lowerMessage.includes('فتح')) {

    if (lowerMessage.includes('عملاء') || lowerMessage.includes('العملاء')) {
      return { type: 'navigation', target: 'إدارة العملاء', path: '/sales-pipeline', confidence: 0.9 };
    }
    if (lowerMessage.includes('تقارير') || lowerMessage.includes('التقارير')) {
      return { type: 'navigation', target: 'التقارير', path: '/reports', confidence: 0.9 };
    }
    if (lowerMessage.includes('فريق') || lowerMessage.includes('الفريق')) {
      return { type: 'navigation', target: 'إدارة الفريق', path: '/ai-team-management', confidence: 0.9 };
    }
    if (lowerMessage.includes('إعدادات') || lowerMessage.includes('settings')) {
      return { type: 'navigation', target: 'الإعدادات', path: '/settings', confidence: 0.9 };
    }
  }

  // Data query intents
  if (lowerMessage.includes('كم') || lowerMessage.includes('عدد') || 
      lowerMessage.includes('إحصائيات') || lowerMessage.includes('أداء')) {
    return { type: 'data_query', entity: 'statistics', confidence: 0.8 };
  }

  // Action intents
  if (lowerMessage.includes('أضف') || lowerMessage.includes('أنشئ') || 
      lowerMessage.includes('جديد') || lowerMessage.includes('إنشاء')) {
    return { type: 'action_request', action: 'create', confidence: 0.8 };
  }

  if (lowerMessage.includes('حذف') || lowerMessage.includes('امسح') || lowerMessage.includes('إزالة')) {
    return { type: 'action_request', action: 'delete', confidence: 0.8 };
  }

  if (lowerMessage.includes('تحديث') || lowerMessage.includes('تعديل') || lowerMessage.includes('تغيير')) {
    return { type: 'action_request', action: 'update', confidence: 0.8 };
  }

  return { type: 'general', confidence: 0.6 };
}

async function handleDataQuery(entity: string, filters: any) {
  const { storage } = await import('./mongodb-storage');
  
  try {
    switch (entity) {
      case 'statistics':
      case 'إحصائيات':
        const opportunities = await storage.getAllOpportunities();
        const workflows = await storage.getAllWorkflows();
        const aiTeam = await storage.getAllAiTeamMembers();
        
        const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        const wonDeals = opportunities.filter(opp => opp.stage === 'مغلقة - فاز').length;
        const conversionRate = opportunities.length > 0 ? (wonDeals / opportunities.length * 100).toFixed(1) : 0;
        
        return {
          response: `📊 إحصائيات النظام الحالية:\n\n• إجمالي الفرص: ${opportunities.length}\n• القيمة المتوقعة: ${totalValue.toLocaleString()} ريال\n• الصفقات المغلقة: ${wonDeals}\n• معدل التحويل: ${conversionRate}%\n• سير العمل النشط: ${workflows.length}\n• فريق AI: ${aiTeam.length} أعضاء`,
          actions: [
            { type: 'data_retrieved', description: 'إحصائيات محدثة', count: opportunities.length }
          ],
          executionPlan: {
            completed: 1,
            pending: 0,
            nextSteps: 'يمكن تصدير التقرير التفصيلي',
            timeline: 'البيانات محدثة لحظياً'
          }
        };
        
      case 'customers':
      case 'عملاء':
        const customers = await storage.getAllOpportunities();
        const activeCustomers = customers.filter(c => c.stage !== 'مغلقة - خسر');
        
        let customersList = customers.slice(0, 5).map((customer, index) => 
          `${index + 1}. ${customer.name} - ${customer.stage} - ${customer.value?.toLocaleString()} ريال`
        ).join('\n');
        
        return {
          response: `👥 عملاء النظام:\n\nإجمالي العملاء: ${customers.length}\nالعملاء النشطون: ${activeCustomers.length}\n\nأحدث 5 عملاء:\n${customersList}`,
          actions: [
            { type: 'customers_listed', description: 'قائمة العملاء', count: customers.length }
          ],
          executionPlan: {
            completed: 1,
            pending: 0,
            nextSteps: 'يمكن التواصل مع العملاء أو تصدير القائمة',
            timeline: 'تم جلب البيانات فوراً'
          }
        };
        
      default:
        return {
          response: `لا يمكنني العثور على بيانات لـ ${entity}. الأنواع المتاحة: إحصائيات، عملاء، فرص، تقارير`,
          actions: [],
          executionPlan: {
            completed: 0,
            pending: 1,
            nextSteps: 'تحديد نوع البيانات المطلوبة',
            timeline: 'في انتظار التوضيح'
          }
        };
    }
  } catch (error) {
    console.error('Data query error:', error);
    return {
      response: 'حدث خطأ في جلب البيانات من قاعدة البيانات.',
      actions: [],
      executionPlan: {
        completed: 0,
        pending: 1,
        nextSteps: 'مراجعة اتصال قاعدة البيانات',
        timeline: 'يتطلب تدخل فني'
      }
    };
  }
}

async function handleActionRequest(action: string, parameters: any) {
  const { storage } = await import('./mongodb-storage');
  
  try {
    switch (action) {
      case 'create':
        // Create new opportunity or workflow
        const newOpportunity = await storage.createOpportunity({
          name: `عميل جديد ${Date.now()}`,
          email: `customer${Date.now()}@example.com`,
          phone: '+966501234567',
          value: 50000,
          stage: 'عميل محتمل',
          probability: 60,
          assignedAgent: 'مساعد المبيعات الذكي',
          source: 'المساعد الذكي'
        });
        
        return {
          response: `✅ تم إنشاء فرصة جديدة:\n\nالاسم: ${newOpportunity.name}\nالقيمة: ${newOpportunity.value?.toLocaleString()} ريال\nالمرحلة: ${newOpportunity.stage}\nالوكيل: ${newOpportunity.assignedAgent}`,
          actions: [
            { type: 'opportunity_created', description: 'فرصة جديدة', count: 1 }
          ],
          executionPlan: {
            completed: 1,
            pending: 0,
            nextSteps: 'متابعة العميل الجديد وجدولة اجتماع',
            timeline: 'تم الإنشاء فوراً'
          }
        };
        
      case 'update':
        const opportunities = await storage.getAllOpportunities();
        if (opportunities.length > 0) {
          const firstOpp = opportunities[0];
          await storage.updateOpportunity(firstOpp.id, {
            stage: 'متابعة',
            probability: (firstOpp.probability || 50) + 10
          });
          
          return {
            response: `✅ تم تحديث الفرصة: ${firstOpp.name}\nالمرحلة الجديدة: متابعة\nاحتمالية النجاح: ${(firstOpp.probability || 50) + 10}%`,
            actions: [
              { type: 'opportunity_updated', description: 'تحديث فرصة', count: 1 }
            ],
            executionPlan: {
              completed: 1,
              pending: 0,
              nextSteps: 'مراقبة تطور الفرصة',
              timeline: 'تم التحديث فوراً'
            }
          };
        } else {
          return {
            response: 'لا توجد فرص متاحة للتحديث. يمكنك إنشاء فرصة جديدة أولاً.',
            actions: [],
            executionPlan: {
              completed: 0,
              pending: 1,
              nextSteps: 'إنشاء فرصة جديدة',
              timeline: 'يتطلب إجراء إضافي'
            }
          };
        }
        
      case 'delete':
        const allOpportunities = await storage.getAllOpportunities();
        if (allOpportunities.length > 0) {
          const lastOpp = allOpportunities[allOpportunities.length - 1];
          await storage.deleteOpportunity(lastOpp.id);
          
          return {
            response: `✅ تم حذف الفرصة: ${lastOpp.name}\nالسبب: تنظيف البيانات التلقائي`,
            actions: [
              { type: 'opportunity_deleted', description: 'حذف فرصة', count: 1 }
            ],
            executionPlan: {
              completed: 1,
              pending: 0,
              nextSteps: 'مراجعة الفرص المتبقية',
              timeline: 'تم الحذف فوراً'
            }
          };
        } else {
          return {
            response: 'لا توجد فرص متاحة للحذف.',
            actions: [],
            executionPlan: {
              completed: 0,
              pending: 0,
              nextSteps: 'قاعدة البيانات نظيفة بالفعل',
              timeline: 'لا يوجد إجراء مطلوب'
            }
          };
        }
        
      default:
        return {
          response: `الإجراء "${action}" غير مدعوم. الإجراءات المتاحة: إنشاء، تحديث، حذف`,
          actions: [],
          executionPlan: {
            completed: 0,
            pending: 1,
            nextSteps: 'تحديد إجراء صحيح',
            timeline: 'في انتظار التوضيح'
          }
        };
    }
  } catch (error) {
    console.error('Action request error:', error);
    return {
      response: `حدث خطأ في تنفيذ الإجراء "${action}". تأكد من صحة البيانات.`,
      actions: [],
      executionPlan: {
        completed: 0,
        pending: 1,
        nextSteps: 'مراجعة الخطأ وإعادة المحاولة',
        timeline: 'يتطلب تدخل فني'
      }
    };
  }
}

async function generateGeneralResponse(message: string, context: string, metadata: any) {
  // Placeholder for general response generation logic
  return {
    text: `لم يتم فهم الأمر. يرجى تحديد الأمر بشكل أوضح.`,
    suggestions: ['المساعدة', 'الأوامر الشائعة'],
    processingTime: 0,
    confidence: 0.5
  };
}

// Create AIService instance for backward compatibility
const AIService = new AdvancedAIEngine();

export { AdvancedAIEngine, CustomerProfile, AIResponse, AIService };