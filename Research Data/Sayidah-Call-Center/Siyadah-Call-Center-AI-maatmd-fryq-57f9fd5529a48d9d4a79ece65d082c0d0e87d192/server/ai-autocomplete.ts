import OpenAI from "openai";

// Enhanced autocomplete system for AI commands
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'fallback-key-for-demo' 
});

export interface AutocompleteResult {
  suggestions: Array<{
    text: string;
    description: string;
    category: string;
    confidence: number;
    intent: string;
  }>;
  predictedCommand: string;
  confidence: number;
}

export interface CommandTemplate {
  pattern: string;
  description: string;
  category: string;
  examples: string[];
  intent: string;
}

// Predefined command templates based on business automation context
const COMMAND_TEMPLATES: CommandTemplate[] = [
  // WhatsApp Commands
  {
    pattern: "أرسل واتساب لـ {target}",
    description: "إرسال رسائل واتساب للعملاء",
    category: "اتصالات",
    examples: ["أرسل واتساب لجميع العملاء", "أرسل واتساب للعملاء المهتمين", "أرسل واتساب لعميل محدد"],
    intent: "whatsapp_send"
  },
  {
    pattern: "أرسل رسالة واتساب بمحتوى {message}",
    description: "إرسال رسالة واتساب مخصصة",
    category: "اتصالات",
    examples: ["أرسل رسالة واتساب بمحتوى شكرا لتواصلكم معنا", "أرسل رسالة واتساب بمحتوى العرض الخاص"],
    intent: "whatsapp_custom"
  },

  // Call Commands
  {
    pattern: "اتصل بـ {target}",
    description: "إجراء مكالمات هاتفية",
    category: "اتصالات",
    examples: ["اتصل بجميع العملاء", "اتصل بالعملاء المؤهلين", "اتصل برقم +966501234567"],
    intent: "call_make"
  },

  // Email Commands
  {
    pattern: "أرسل إيميل لـ {target}",
    description: "إرسال رسائل بريد إلكتروني",
    category: "اتصالات",
    examples: ["أرسل إيميل لجميع العملاء", "أرسل إيميل للعملاء الجدد", "أرسل إيميل تذكير"],
    intent: "email_send"
  },

  // Data & Reports
  {
    pattern: "اعرض {data_type}",
    description: "عرض البيانات والإحصائيات",
    category: "بيانات",
    examples: ["اعرض إحصائيات النظام", "اعرض العملاء", "اعرض الفرص التجارية", "اعرض التقارير"],
    intent: "data_show"
  },
  {
    pattern: "أنشئ تقرير {report_type}",
    description: "إنشاء تقارير مفصلة",
    category: "تقارير",
    examples: ["أنشئ تقرير المبيعات", "أنشئ تقرير الأداء", "أنشئ تقرير شهري"],
    intent: "report_create"
  },

  // Scheduling
  {
    pattern: "جدول {activity} مع {target}",
    description: "جدولة الأنشطة والاجتماعات",
    category: "جدولة",
    examples: ["جدول اجتماعات مع العملاء", "جدول مكالمات مع الفريق", "جدول عروض تقديمية"],
    intent: "schedule_activity"
  },

  // Campaign Management
  {
    pattern: "أطلق حملة {campaign_type}",
    description: "إطلاق حملات تسويقية",
    category: "تسويق",
    examples: ["أطلق حملة تسويقية", "أطلق حملة واتساب", "أطلق حملة بريد إلكتروني"],
    intent: "campaign_launch"
  },

  // Analysis
  {
    pattern: "حلل {analysis_target}",
    description: "تحليل البيانات والأداء",
    category: "تحليل",
    examples: ["حلل أداء الفريق", "حلل رضا العملاء", "حلل معدل التحويل"],
    intent: "analyze_data"
  },

  // Task Management
  {
    pattern: "أنشئ {task_type}",
    description: "إنشاء مهام وعناصر جديدة",
    category: "إدارة",
    examples: ["أنشئ عميل جديد", "أنشئ فرصة تجارية", "أنشئ سير عمل"],
    intent: "create_item"
  }
];

export class AIAutocomplete {
  private static commandHistory: string[] = [];

  static async getSuggestions(input: string, context?: any): Promise<AutocompleteResult> {
    const trimmedInput = input.trim().toLowerCase();
    
    if (trimmedInput.length < 2) {
      return {
        suggestions: this.getPopularCommands(),
        predictedCommand: "",
        confidence: 0.3
      };
    }

    try {
      // Use OpenAI for intelligent autocomplete if available
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'fallback-key-for-demo') {
        return await this.getAIEnhancedSuggestions(input, context);
      }
    } catch (error) {
      console.log('OpenAI autocomplete fallback:', error);
    }

    // Fallback to pattern matching
    return this.getPatternBasedSuggestions(trimmedInput);
  }

  private static async getAIEnhancedSuggestions(input: string, context?: any): Promise<AutocompleteResult> {
    const prompt = `أنت مساعد ذكي لنظام أتمتة الأعمال. المستخدم يكتب: "${input}"

السياق التجاري:
- العملاء: ${context?.totalOpportunities || 3}
- القيمة: ${context?.totalPipelineValue || 430000} ريال
- سير العمل النشط: ${context?.activeWorkflows || 3}

اقترح 5 أوامر مكملة محتملة بناء على ما كتبه المستخدم. ركز على:
1. أوامر واتساب ومكالمات
2. تقارير وإحصائيات
3. إدارة العملاء
4. حملات تسويقية
5. تحليل البيانات

أجب بصيغة JSON:
{
  "suggestions": [
    {
      "text": "النص الكامل للأمر",
      "description": "وصف ما سيفعله الأمر",
      "category": "الفئة",
      "confidence": 0.9,
      "intent": "نوع الأمر"
    }
  ],
  "predictedCommand": "الأمر الأكثر احتمالا",
  "confidence": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        suggestions: result.suggestions || [],
        predictedCommand: result.predictedCommand || "",
        confidence: result.confidence || 0.7
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI autocomplete response:', parseError);
      return this.getPatternBasedSuggestions(input.toLowerCase());
    }
  }

  private static getPatternBasedSuggestions(input: string): AutocompleteResult {
    const suggestions = [];
    
    // Match against command templates
    for (const template of COMMAND_TEMPLATES) {
      const score = this.calculateMatchScore(input, template);
      if (score > 0.3) {
        for (const example of template.examples) {
          if (example.toLowerCase().includes(input) || this.fuzzyMatch(input, example.toLowerCase())) {
            suggestions.push({
              text: example,
              description: template.description,
              category: template.category,
              confidence: score,
              intent: template.intent
            });
          }
        }
      }
    }

    // Add contextual suggestions based on input patterns
    if (input.includes('واتس') || input.includes('whatsapp')) {
      suggestions.push(
        {
          text: "أرسل واتساب لجميع العملاء",
          description: "إرسال رسائل واتساب لجميع العملاء في قاعدة البيانات",
          category: "اتصالات",
          confidence: 0.9,
          intent: "whatsapp_bulk"
        },
        {
          text: "أرسل واتساب للعملاء المهتمين",
          description: "إرسال رسائل للعملاء الذين أبدوا اهتماماً مؤخراً",
          category: "اتصالات",
          confidence: 0.85,
          intent: "whatsapp_interested"
        }
      );
    }

    if (input.includes('اعرض') || input.includes('إحصائ')) {
      suggestions.push(
        {
          text: "اعرض إحصائيات النظام",
          description: "عرض إحصائيات شاملة عن الأداء والمبيعات",
          category: "بيانات",
          confidence: 0.9,
          intent: "show_statistics"
        },
        {
          text: "اعرض العملاء النشطين",
          description: "قائمة بالعملاء النشطين وحالتهم",
          category: "بيانات",
          confidence: 0.8,
          intent: "show_customers"
        }
      );
    }

    if (input.includes('اتصل') || input.includes('مكالم')) {
      suggestions.push(
        {
          text: "اتصل بجميع العملاء المؤهلين",
          description: "إجراء مكالمات للعملاء المؤهلين فقط",
          category: "اتصالات",
          confidence: 0.9,
          intent: "call_qualified"
        },
        {
          text: "اتصل بالعملاء الذين لم يردوا",
          description: "متابعة العملاء الذين لم يردوا على الرسائل",
          category: "اتصالات",
          confidence: 0.8,
          intent: "call_no_response"
        }
      );
    }

    // Sort by confidence and limit results
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const topSuggestions = suggestions.slice(0, 5);

    return {
      suggestions: topSuggestions,
      predictedCommand: topSuggestions[0]?.text || "",
      confidence: topSuggestions[0]?.confidence || 0.5
    };
  }

  private static calculateMatchScore(input: string, template: CommandTemplate): number {
    let score = 0;
    const inputWords = input.split(' ');
    
    // Check if any examples match
    for (const example of template.examples) {
      const exampleWords = example.toLowerCase().split(' ');
      const matchingWords = inputWords.filter(word => 
        exampleWords.some(exampleWord => 
          exampleWord.includes(word) || word.includes(exampleWord)
        )
      );
      
      const wordScore = matchingWords.length / Math.max(inputWords.length, exampleWords.length);
      score = Math.max(score, wordScore);
    }

    return score;
  }

  private static fuzzyMatch(input: string, target: string): boolean {
    if (input.length === 0) return true;
    if (target.length === 0) return false;

    let inputIndex = 0;
    for (let i = 0; i < target.length && inputIndex < input.length; i++) {
      if (target[i] === input[inputIndex]) {
        inputIndex++;
      }
    }

    return inputIndex === input.length;
  }

  private static getPopularCommands() {
    return [
      {
        text: "أرسل واتساب لجميع العملاء",
        description: "إرسال رسائل واتساب جماعية",
        category: "اتصالات",
        confidence: 0.9,
        intent: "whatsapp_bulk"
      },
      {
        text: "اعرض إحصائيات النظام",
        description: "عرض إحصائيات شاملة",
        category: "بيانات",
        confidence: 0.9,
        intent: "show_statistics"
      },
      {
        text: "أنشئ تقرير المبيعات",
        description: "إنشاء تقرير مبيعات مفصل",
        category: "تقارير",
        confidence: 0.8,
        intent: "create_sales_report"
      },
      {
        text: "جدول اجتماعات مع العملاء",
        description: "جدولة اجتماعات العملاء",
        category: "جدولة",
        confidence: 0.8,
        intent: "schedule_meetings"
      },
      {
        text: "اتصل بالعملاء المؤهلين",
        description: "إجراء مكالمات للعملاء المؤهلين",
        category: "اتصالات",
        confidence: 0.8,
        intent: "call_qualified"
      }
    ];
  }

  static addToHistory(command: string) {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > 50) {
      this.commandHistory = this.commandHistory.slice(0, 50);
    }
  }

  static getRecentCommands(limit: number = 5) {
    return this.commandHistory.slice(0, limit);
  }
}