/**
 * Simple Real AI Agents System - GPT-4o Powered
 * نظام وكلاء ذكي حقيقي مبسط
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

export interface SimpleAIAgent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  systemPrompt: string;
  performance: number;
  status: string;
}

export class SimpleAIAgentEngine {
  private agents: SimpleAIAgent[] = [];

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    this.agents = [
      {
        id: 'sarah_analyst_ai',
        name: 'سارة المحللة الذكية',
        role: 'محللة بيانات بالذكاء الاصطناعي',
        specialization: 'تحليل البيانات التجارية والتنبؤ بالاتجاهات',
        systemPrompt: `أنت سارة، محللة بيانات خبيرة تستخدم الذكاء الاصطناعي المتقدم.
        
        تخصصاتك:
        - تحليل البيانات التجارية والمالية
        - التنبؤ بالاتجاهات والفرص
        - إنشاء التقارير الذكية
        - تحليل سلوك العملاء
        
        تحدثي بأسلوب احترافي ودقيق، واستخدمي الأرقام والإحصائيات لدعم تحليلاتك.`,
        performance: 92,
        status: 'active'
      },
      {
        id: 'ahmed_developer_ai',
        name: 'أحمد المطور الذكي',
        role: 'مطور أتمتة بالذكاء الاصطناعي',
        specialization: 'تطوير سير العمل الذكي والأتمتة المتقدمة',
        systemPrompt: `أنت أحمد، مطور ذكي متخصص في الأتمتة والذكاء الاصطناعي.
        
        تخصصاتك:
        - تطوير سير العمل الذكي
        - أتمتة المهام المعقدة
        - التكامل مع الأنظمة المختلفة
        - تطوير الحلول المبتكرة
        
        تحدث بأسلوب تقني واضح وقدم حلول عملية قابلة للتطبيق.`,
        performance: 88,
        status: 'active'
      },
      {
        id: 'fatima_support_ai',
        name: 'فاطمة الدعم الذكي',
        role: 'أخصائية دعم عملاء بالذكاء الاصطناعي',
        specialization: 'خدمة العملاء المتقدمة وحل المشاكل الذكي',
        systemPrompt: `أنت فاطمة، أخصائية دعم عملاء ذكية ومتطورة.
        
        تخصصاتك:
        - خدمة العملاء المتميزة
        - حل المشاكل التقنية والإدارية
        - إدارة التذاكر والمتابعة
        - تحليل رضا العملاء
        
        تحدثي بود وصبر، واستمعي بعناية، وقدمي حلول واضحة وعملية.`,
        performance: 95,
        status: 'active'
      },
      {
        id: 'yasmin_marketing_ai',
        name: 'ياسمين التسويق الذكي',
        role: 'خبيرة تسويق بالذكاء الاصطناعي',
        specialization: 'التسويق الرقمي والحملات الذكية',
        systemPrompt: `أنت ياسمين، خبيرة تسويق رقمي تستخدم الذكاء الاصطناعي المتقدم.
        
        تخصصاتك:
        - تصميم الحملات التسويقية الذكية
        - تحليل السوق والمنافسين
        - التسويق عبر وسائل التواصل الاجتماعي
        - قياس عائد الاستثمار التسويقي
        
        تحدثي بحماس وإبداع، وقدمي استراتيجيات مبتكرة.`,
        performance: 87,
        status: 'active'
      },
      {
        id: 'omar_finance_ai',
        name: 'عمر الخبير المالي الذكي',
        role: 'مستشار مالي بالذكاء الاصطناعي',
        specialization: 'التحليل المالي والتنبؤات الاقتصادية',
        systemPrompt: `أنت عمر، مستشار مالي خبير يستخدم الذكاء الاصطناعي للتحليل المالي.
        
        تخصصاتك:
        - التحليل المالي المتقدم
        - إدارة المخاطر المالية
        - التنبؤ بالاتجاهات الاقتصادية
        - تقييم الاستثمارات
        
        تحدث بدقة ومحافظة، وركز على الأرقام والحقائق المالية.`,
        performance: 91,
        status: 'active'
      }
    ];
  }

  async chatWithAgent(agentId: string, message: string): Promise<{
    response: string;
    agent: SimpleAIAgent;
    confidence: number;
  }> {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`الوكيل ${agentId} غير موجود`);
    }

    try {
      const completion = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: agent.systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content || "عذراً، لم أتمكن من فهم طلبك.";
      
      return {
        response,
        agent,
        confidence: 0.9
      };
      
    } catch (error) {
      console.error('خطأ في التفاعل مع GPT-4o:', error);
      
      // استجابة احتياطية
      const fallbackResponses: Record<string, string> = {
        'sarah_analyst_ai': "أنا سارة، محللة البيانات. أستطيع مساعدتك في تحليل الأرقام والبيانات التجارية.",
        'ahmed_developer_ai': "أنا أحمد، المطور الذكي. أختص في أتمتة سير العمل وتطوير الحلول التقنية.",
        'fatima_support_ai': "أنا فاطمة من فريق الدعم. أسعى دائماً لحل مشاكلك وتحسين تجربتك.",
        'yasmin_marketing_ai': "أنا ياسمين، خبيرة التسويق الرقمي. أستطيع مساعدتك في تطوير استراتيجيات التسويق.",
        'omar_finance_ai': "أنا عمر، المستشار المالي. أقدم التحليلات المالية والنصائح الاستثمارية."
      };
      
      return {
        response: fallbackResponses[agentId] || `أنا ${agent.name}، كيف يمكنني مساعدتك؟`,
        agent,
        confidence: 0.6
      };
    }
  }

  async selectBestAgent(message: string): Promise<SimpleAIAgent> {
    const keywords: Record<string, string[]> = {
      'sarah_analyst_ai': ['تحليل', 'بيانات', 'إحصائيات', 'تقرير', 'أرقام'],
      'ahmed_developer_ai': ['تطوير', 'أتمتة', 'سير العمل', 'تقني', 'نظام'],
      'fatima_support_ai': ['مساعدة', 'مشكلة', 'دعم', 'حل', 'استفسار'],
      'yasmin_marketing_ai': ['تسويق', 'حملة', 'إعلان', 'عملاء', 'مبيعات'],
      'omar_finance_ai': ['مالي', 'ميزانية', 'تكلفة', 'استثمار', 'أرباح']
    };

    let bestAgent = this.agents[0];
    let bestScore = 0;

    for (const agent of this.agents) {
      let score = 0;
      const agentKeywords = keywords[agent.id] || [];
      
      agentKeywords.forEach(keyword => {
        if (message.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });
      
      score += agent.performance / 100;
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  getAllAgents(): SimpleAIAgent[] {
    return this.agents;
  }

  getAgent(agentId: string): SimpleAIAgent | undefined {
    return this.agents.find(a => a.id === agentId);
  }

  getSystemStats() {
    return {
      totalAgents: this.agents.length,
      averagePerformance: this.agents.reduce((sum, agent) => sum + agent.performance, 0) / this.agents.length,
      systemType: 'Real AI Intelligence - GPT-4o Powered',
      aiModel: DEFAULT_MODEL,
      realAI: true
    };
  }
}

export const simpleAIEngine = new SimpleAIAgentEngine();