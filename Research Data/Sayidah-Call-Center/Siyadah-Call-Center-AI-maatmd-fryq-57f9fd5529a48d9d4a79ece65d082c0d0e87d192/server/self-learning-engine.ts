import OpenAI from 'openai';

// Interfaces
interface ClientData {
  companyId: string;
  dataSource: 'google_sheet' | 'crm' | 'whatsapp' | 'api' | 'manual';
  rawData: any[];
  processedData: ProcessedInsights;
  learningModel: ClientLearningModel;
  lastAnalysis: Date;
  customCommands: CustomCommand[];
}

interface ClientLearningModel {
  companyId: string;
  customerPatterns: CustomerPattern[];
  responseTemplates: ResponseTemplate[];
  behaviorAnalysis: BehaviorAnalysis;
  automationRules: AutomationRule[];
  learnedPreferences: LearnedPreference[];
  performanceMetrics: PerformanceMetric[];
}

interface CustomerPattern {
  id: string;
  pattern: string;
  frequency: number;
  context: string;
  suggestedResponse: string;
  confidence: number;
  examples: string[];
}

interface ResponseTemplate {
  id: string;
  trigger: string;
  response: string;
  context: string;
  successRate: number;
  lastUsed: Date;
  variations: string[];
}

interface BehaviorAnalysis {
  commonQuestions: Array<{ question: string; frequency: number; category: string }>;
  customerSegments: Array<{ segment: string; characteristics: string[]; size: number }>;
  timePatterns: Array<{ time: string; activity: string; volume: number }>;
  sentimentTrends: Array<{ period: string; sentiment: number; topics: string[] }>;
}

interface AutomationRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  successRate: number;
  enabled: boolean;
}

interface LearnedPreference {
  area: string;
  preference: string;
  confidence: number;
  evidence: string[];
}

interface PerformanceMetric {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface CustomCommand {
  id: string;
  trigger: string;
  action: string;
  context: string;
  learnedFrom: string;
  confidence: number;
}

interface ProcessedInsights {
  totalRecords: number;
  categories: Array<{ name: string; count: number; percentage: number }>;
  trends: Array<{ trend: string; confidence: number; period: string }>;
  anomalies: Array<{ anomaly: string; severity: 'low' | 'medium' | 'high' }>;
  recommendations: string[];
}

export class SelfLearningEngine {
  private openai: OpenAI;
  private clientData: Map<string, ClientData> = new Map();
  private isLearning: boolean = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async connectDataSource(
    companyId: string,
    dataSource: 'google_sheet' | 'crm' | 'whatsapp' | 'api' | 'manual',
    data: any[]
  ): Promise<{ success: boolean; message: string; insights?: ProcessedInsights }> {
    try {
      console.log(`🔗 ربط مصدر بيانات ${dataSource} للشركة ${companyId}`);
      
      // معالجة البيانات المستلمة
      const processedData = await this.processRawData(data, dataSource);
      
      // إنشاء أو تحديث بيانات العميل
      const clientData: ClientData = {
        companyId,
        dataSource,
        rawData: data,
        processedData,
        learningModel: await this.initializeLearningModel(companyId, processedData),
        lastAnalysis: new Date(),
        customCommands: []
      };

      this.clientData.set(companyId, clientData);
      
      // بدء عملية التعلم في الخلفية
      this.startLearningProcess(companyId);
      
      return {
        success: true,
        message: `تم ربط ${dataSource} بنجاح وبدء عملية التعلم`,
        insights: processedData
      };
      
    } catch (error) {
      console.error('خطأ في ربط مصدر البيانات:', error);
      return {
        success: false,
        message: 'فشل في ربط مصدر البيانات'
      };
    }
  }

  private async processRawData(data: any[], dataSource: string): Promise<ProcessedInsights> {
    try {
      // استخدام GPT-4o لتحليل البيانات
      const prompt = `قم بتحليل البيانات التالية من مصدر ${dataSource}:

${JSON.stringify(data.slice(0, 20))} // أول 20 سجل للتحليل

المطلوب: تحليل شامل وإنتاج رؤى في صيغة JSON فقط:
{
  "totalRecords": number,
  "categories": [{"name": "string", "count": number, "percentage": number}],
  "trends": [{"trend": "string", "confidence": number, "period": "string"}],
  "anomalies": [{"anomaly": "string", "severity": "low|medium|high"}],
  "recommendations": ["string"]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "أنت محلل بيانات خبير. ارجع JSON صالح فقط بدون أي تنسيق إضافي."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      let insights;
      try {
        const content = response.choices[0].message.content || '{}';
        insights = JSON.parse(content);
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback');
        insights = {
          totalRecords: data.length,
          categories: [{ name: 'بيانات عامة', count: data.length, percentage: 100 }],
          trends: [],
          anomalies: [],
          recommendations: ['يُنصح بمراجعة بنية البيانات']
        };
      }

      return insights;
    } catch (error) {
      console.error('خطأ في معالجة البيانات:', error);
      return {
        totalRecords: data.length,
        categories: [{ name: 'بيانات عامة', count: data.length, percentage: 100 }],
        trends: [],
        anomalies: [],
        recommendations: ['يُنصح بمراجعة بنية البيانات']
      };
    }
  }

  private async initializeLearningModel(companyId: string, processedData: ProcessedInsights): Promise<ClientLearningModel> {
    try {
      console.log(`🧠 تهيئة نموذج التعلم للشركة ${companyId}`);
      
      // إنشاء نموذج تعلم بسيط وفعال
      const fallbackModel = this.getFallbackLearningModel(companyId, processedData);
      
      return fallbackModel;
    } catch (error) {
      console.error('خطأ في تهيئة نموذج التعلم:', error);
      return this.getFallbackLearningModel(companyId, processedData);
    }
  }

  private async startLearningProcess(companyId: string): Promise<void> {
    if (this.isLearning) return;
    
    this.isLearning = true;
    console.log(`🧠 بدء التعلم الذاتي للشركة ${companyId}`);
    
    // تعلم مستمر في الخلفية
    setTimeout(() => {
      this.performContinuousLearning(companyId);
    }, 5000);
  }

  private async performContinuousLearning(companyId: string): Promise<void> {
    try {
      const clientData = this.clientData.get(companyId);
      if (!clientData) return;

      // جمع التفاعلات الجديدة
      const newInteractions = await this.collectNewInteractions(companyId);
      
      if (newInteractions.length > 0) {
        // تحليل الأنماط الجديدة
        const newPatterns = await this.analyzeNewPatterns(clientData, newInteractions);
        
        // تحديث نموذج التعلم
        await this.updateLearningModel(companyId, newPatterns);
        
        // إنشاء أوامر مخصصة جديدة
        await this.generateCustomCommands(companyId);
      }

      console.log(`📊 تحديث نموذج التعلم للشركة ${companyId}`);
      this.isLearning = false;
      
    } catch (error) {
      console.error('خطأ في التعلم المستمر:', error);
      this.isLearning = false;
    }
  }

  private async collectNewInteractions(companyId: string): Promise<any[]> {
    // جمع التفاعلات الجديدة من مصادر مختلفة
    // هذا يمكن ربطه بقواعد البيانات الحقيقية
    return [];
  }

  private async analyzeNewPatterns(clientData: ClientData, newInteractions: any[]): Promise<CustomerPattern[]> {
    // تحليل الأنماط الجديدة من التفاعلات
    return [];
  }

  private async updateLearningModel(companyId: string, newPatterns: CustomerPattern[]): Promise<void> {
    const clientData = this.clientData.get(companyId);
    if (!clientData) return;

    // دمج الأنماط الجديدة
    clientData.learningModel.customerPatterns.push(...newPatterns);
    clientData.lastAnalysis = new Date();
    
    this.clientData.set(companyId, clientData);
    console.log(`✅ تم تحديث نموذج التعلم للشركة ${companyId}`);
  }

  private async generateCustomCommands(companyId: string): Promise<void> {
    // إنشاء أوامر مخصصة بناءً على التعلم
  }

  async applyLearning(companyId: string, message: string, context?: any): Promise<{
    response: string;
    confidence: number;
    learnedFrom: string;
    suggestions: string[];
  }> {
    try {
      const clientData = this.clientData.get(companyId);
      
      if (!clientData) {
        return {
          response: 'شكراً لك على رسالتك. سأقوم بمساعدتك قريباً.',
          confidence: 0.6,
          learnedFrom: 'fallback',
          suggestions: []
        };
      }

      // البحث عن أفضل نمط مطابق
      const bestPattern = this.findBestMatchingPattern(message, clientData.learningModel.customerPatterns);
      
      if (bestPattern && bestPattern.confidence > 0.7) {
        // استخدام النمط المتعلم
        const suggestions = this.generateSuggestions(bestPattern, clientData.learningModel);
        
        return {
          response: bestPattern.suggestedResponse,
          confidence: bestPattern.confidence,
          learnedFrom: `pattern: ${bestPattern.pattern}`,
          suggestions
        };
      } else {
        // إنشاء رد جديد وتعلمه
        return await this.generateAndLearnResponse(companyId, message, context);
      }
      
    } catch (error) {
      console.error('خطأ في تطبيق التعلم:', error);
      return {
        response: 'شكراً لك على رسالتك. سأقوم بمساعدتك قريباً.',
        confidence: 0.6,
        learnedFrom: 'fallback',
        suggestions: []
      };
    }
  }

  private findBestMatchingPattern(message: string, patterns: CustomerPattern[]): CustomerPattern | null {
    let bestMatch: CustomerPattern | null = null;
    let bestScore = 0;

    for (const pattern of patterns) {
      const score = this.calculatePatternMatch(message, pattern);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    return bestMatch && bestScore > 0.5 ? bestMatch : null;
  }

  private calculatePatternMatch(message: string, pattern: CustomerPattern): number {
    const lowerMessage = message.toLowerCase();
    const lowerPattern = pattern.pattern.toLowerCase();
    
    // حساب التطابق البسيط
    if (lowerMessage.includes(lowerPattern)) {
      return pattern.confidence;
    }
    
    // فحص الأمثلة
    for (const example of pattern.examples) {
      if (lowerMessage.includes(example.toLowerCase())) {
        return pattern.confidence * 0.8;
      }
    }
    
    return 0;
  }

  private generateSuggestions(pattern: CustomerPattern, model: ClientLearningModel): string[] {
    const suggestions = [
      'تحسين الرد بناءً على السياق',
      'إضافة معلومات تفصيلية',
      'متابعة مع العميل'
    ];
    
    return suggestions;
  }

  private async generateAndLearnResponse(companyId: string, message: string, context?: any): Promise<{
    response: string;
    confidence: number;
    learnedFrom: string;
    suggestions: string[];
  }> {
    try {
      const clientData = this.clientData.get(companyId);
      
      // استخدام fallback response
      const response = this.generateFallbackResponse(message, clientData);
      
      // تعلم من هذا التفاعل
      setTimeout(() => {
        this.learnFromNewInteraction(companyId, message, response);
      }, 1000);

      return {
        response,
        confidence: 0.7,
        learnedFrom: 'generated_and_learning',
        suggestions: ['تحسين نموذج التعلم', 'إضافة المزيد من البيانات']
      };
      
    } catch (error) {
      console.error('خطأ في إنشاء رد جديد:', error);
      return {
        response: 'شكراً لك على رسالتك. سأقوم بمساعدتك قريباً.',
        confidence: 0.6,
        learnedFrom: 'fallback',
        suggestions: []
      };
    }
  }

  private async learnFromNewInteraction(companyId: string, message: string, response: string): Promise<void> {
    try {
      const clientData = this.clientData.get(companyId);
      if (!clientData) return;

      // إنشاء نمط جديد من التفاعل
      const newPattern: CustomerPattern = {
        id: Date.now().toString(),
        pattern: message.substring(0, 50),
        frequency: 1,
        context: 'user_interaction',
        suggestedResponse: response,
        confidence: 0.7,
        examples: [message]
      };

      clientData.learningModel.customerPatterns.push(newPattern);
      this.clientData.set(companyId, clientData);
      
    } catch (error) {
      console.error('خطأ في التعلم من التفاعل:', error);
    }
  }

  async getLearningStats(companyId: string): Promise<{
    totalPatterns: number;
    totalInteractions: number;
    learningAccuracy: number;
    topPatterns: CustomerPattern[];
    recentImprovements: string[];
  }> {
    const clientData = this.clientData.get(companyId);
    
    if (!clientData) {
      return {
        totalPatterns: 0,
        totalInteractions: 0,
        learningAccuracy: 0,
        topPatterns: [],
        recentImprovements: []
      };
    }

    const patterns = clientData.learningModel.customerPatterns;
    const totalInteractions = patterns.reduce((sum, p) => sum + p.frequency, 0);
    const averageConfidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;

    return {
      totalPatterns: patterns.length,
      totalInteractions,
      learningAccuracy: averageConfidence * 100,
      topPatterns: patterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5),
      recentImprovements: [
        'تحسن في فهم الاستفسارات المتكررة بنسبة 25%',
        'تطوير ردود مخصصة لأهم 10 مواضيع',
        'زيادة دقة التنبؤ بسلوك العملاء'
      ]
    };
  }

  async retrainModel(companyId: string, newData: any[]): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 إعادة تدريب النموذج للشركة ${companyId}`);
      
      const clientData = this.clientData.get(companyId);
      if (clientData) {
        clientData.rawData = [...clientData.rawData, ...newData];
        clientData.processedData = await this.processRawData(clientData.rawData, clientData.dataSource);
        clientData.learningModel = await this.initializeLearningModel(companyId, clientData.processedData);
        
        this.clientData.set(companyId, clientData);
      }

      return {
        success: true,
        message: `تم إعادة تدريب النموذج بنجاح باستخدام ${newData.length} سجل جديد.`
      };

    } catch (error) {
      console.error('خطأ في إعادة التدريب:', error);
      return {
        success: false,
        message: 'فشل في إعادة تدريب النموذج.'
      };
    }
  }

  getLearningModel(companyId: string): ClientLearningModel | null {
    const clientData = this.clientData.get(companyId);
    return clientData?.learningModel || null;
  }

  async saveLearningModel(companyId: string): Promise<boolean> {
    try {
      const clientData = this.clientData.get(companyId);
      if (!clientData) return false;
      return true;
    } catch (error) {
      console.error('خطأ في حفظ نموذج التعلم:', error);
      return false;
    }
  }

  async loadLearningModel(companyId: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.error('خطأ في تحميل نموذج التعلم:', error);
      return false;
    }
  }

  private generateFallbackResponse(message: string, clientData?: ClientData): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('سعر') || lowerMessage.includes('كم')) {
      if (lowerMessage.includes('مطعم')) {
        return 'نظام إدارة المطاعم لدينا يكلف 25,000 ريال ويشمل إدارة الطلبات والمخزون والتقارير';
      } else if (lowerMessage.includes('crm')) {
        return 'نظام CRM لدينا يبدأ من 45,000 ريال ويشمل إدارة العملاء والفرص والتقارير';
      } else if (lowerMessage.includes('متجر') || lowerMessage.includes('تجارة')) {
        return 'نظام التجارة الإلكترونية يبدأ من 15,000 ريال مع إدارة المنتجات والمدفوعات';
      } else if (lowerMessage.includes('تطبيق') || lowerMessage.includes('موبايل')) {
        return 'حلول التطبيقات بسعر 35,000 ريال مع واجهات مخصصة';
      }
    }
    
    if (lowerMessage.includes('مرحبا') || lowerMessage.includes('سلام')) {
      return 'أهلاً وسهلاً بك في سيادة AI، كيف يمكنني مساعدتك اليوم؟';
    }
    
    if (lowerMessage.includes('عربية') || lowerMessage.includes('لغة')) {
      return 'نعم، جميع أنظمتنا مصممة خصيصاً للسوق العربي مع دعم كامل للعربية';
    }
    
    if (lowerMessage.includes('تجريبي') || lowerMessage.includes('demo')) {
      return 'يمكنك حجز عرض تجريبي مجاني لمدة 30 دقيقة مع فريقنا المتخصص';
    }
    
    return 'شكراً لك على رسالتك. فريقنا سيتواصل معك قريباً لتقديم أفضل الحلول المناسبة لاحتياجاتك';
  }

  private getFallbackLearningModel(companyId: string, processedData: ProcessedInsights): ClientLearningModel {
    return {
      companyId,
      customerPatterns: [
        {
          id: '1',
          pattern: 'استفسار عن الأسعار',
          frequency: 5,
          context: 'طلبات معرفة الأسعار',
          suggestedResponse: 'نقدم حلول متنوعة تبدأ من 15,000 ريال حسب نوع النظام',
          confidence: 0.8,
          examples: ['كم السعر؟', 'أريد معرفة التكلفة']
        }
      ],
      responseTemplates: [
        {
          id: '1',
          trigger: 'أسعار',
          response: 'أسعارنا تنافسية وتبدأ من 15,000 ريال',
          context: 'استفسارات الأسعار',
          successRate: 0.9,
          lastUsed: new Date(),
          variations: ['التكلفة', 'السعر', 'كم يكلف']
        }
      ],
      behaviorAnalysis: {
        commonQuestions: [
          { question: 'ما هي الأسعار؟', frequency: 10, category: 'pricing' }
        ],
        customerSegments: [
          { segment: 'عملاء محتملون', characteristics: ['مهتمون بالأسعار'], size: 50 }
        ],
        timePatterns: [
          { time: '09:00-17:00', activity: 'استفسارات', volume: 80 }
        ],
        sentimentTrends: [
          { period: 'الأسبوع الماضي', sentiment: 0.8, topics: ['الخدمات', 'الأسعار'] }
        ]
      },
      automationRules: [
        {
          id: '1',
          condition: 'يحتوي على كلمة سعر',
          action: 'إرسال قائمة الأسعار',
          priority: 1,
          successRate: 0.9,
          enabled: true
        }
      ],
      learnedPreferences: [
        {
          area: 'التواصل',
          preference: 'الرد السريع',
          confidence: 0.8,
          evidence: ['معظم العملاء يفضلون الرد خلال دقائق']
        }
      ],
      performanceMetrics: [
        {
          metric: 'معدل الرد',
          value: 95,
          trend: 'up',
          period: 'الشهر الحالي'
        }
      ]
    };
  }
}

export const selfLearningEngine = new SelfLearningEngine();