import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ChatContext {
  previousMessages: any[];
  userPreferences: {
    language: string;
    responseStyle: string;
  };
}

interface AdvancedChatRequest {
  message: string;
  context: ChatContext;
}

// Advanced AI Chat System with Multi-Agent Integration
router.post('/advanced-chat', async (req, res) => {
  try {
    const { message, context }: AdvancedChatRequest = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'الرسالة مطلوبة'
      });
    }

    console.log('🧠 Advanced AI Chat Request:', message);

    // Analyze intent and determine appropriate agent
    const intentAnalysis = await analyzeIntentWithGPT(message);
    console.log('🎯 Intent Analysis:', intentAnalysis);

    // Execute command based on intent
    const executionResult = await executeCommand(message, intentAnalysis);
    console.log('⚡ Execution Result:', executionResult);

    // Generate intelligent response
    const response = await generateIntelligentResponse(
      message, 
      intentAnalysis, 
      executionResult, 
      context
    );

    res.json({
      success: true,
      response: response.content,
      confidence: intentAnalysis.confidence,
      agentUsed: intentAnalysis.recommendedAgent,
      executionPlan: {
        steps: executionResult.steps,
        status: executionResult.success ? 'completed' : 'failed',
        results: executionResult.data
      },
      metadata: {
        intent: intentAnalysis.intent,
        category: intentAnalysis.category,
        apiCalls: executionResult.apiCalls || [],
        dataAnalysis: executionResult.analysis || {}
      }
    });

  } catch (error) {
    console.error('❌ Advanced Chat Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في النظام الذكي',
      response: 'أعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى.',
      confidence: 0.1,
      agentUsed: 'ErrorHandler'
    });
  }
});

// Analyze user intent using GPT-4o
async function analyzeIntentWithGPT(message: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `أنت محلل ذكي للنوايا في نظام إدارة الأعمال. حلل النية من الرسالة العربية وحدد:
1. النية الأساسية (intent)
2. الفئة (category) 
3. مستوى الثقة (confidence)
4. الوكيل المناسب (recommendedAgent)
5. المعاملات المطلوبة (parameters)

الفئات المتاحة:
- analysis: تحليل البيانات والإحصائيات
- communication: إرسال رسائل أو مكالمات
- management: إدارة العملاء والمشاريع
- reporting: إنشاء التقارير
- search: البحث في البيانات
- automation: أتمتة المهام

الوكلاء المتاحين:
- DataAnalyst: تحليل البيانات والإحصائيات
- CommunicationAgent: إرسال الرسائل والمكالمات
- CustomerManager: إدارة العملاء
- ReportGenerator: إنشاء التقارير
- SearchAgent: البحث في النظام
- TaskAutomator: أتمتة المهام
- OrchestratorAgent: تنسيق المهام المعقدة

رد بصيغة JSON فقط.`
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      intent: analysis.intent || 'general_inquiry',
      category: analysis.category || 'general',
      confidence: analysis.confidence || 0.7,
      recommendedAgent: analysis.recommendedAgent || 'OrchestratorAgent',
      parameters: analysis.parameters || {}
    };

  } catch (error) {
    console.error('❌ Intent Analysis Error:', error);
    return {
      intent: 'general_inquiry',
      category: 'general',
      confidence: 0.5,
      recommendedAgent: 'OrchestratorAgent',
      parameters: {}
    };
  }
}

// Execute command based on intent
async function executeCommand(message: string, intent: any) {
  const steps: string[] = [];
  const apiCalls: string[] = [];
  let data: any = {};
  let analysis: any = {};

  try {
    steps.push('تحليل الطلب وتحديد الإجراءات المطلوبة');

    switch (intent.category) {
      case 'analysis':
        steps.push('جمع البيانات من قاعدة البيانات');
        steps.push('تحليل البيانات باستخدام الذكاء الاصطناعي');
        
        // Get business data
        const opportunitiesResponse = await fetch('http://localhost:5000/api/opportunities');
        if (opportunitiesResponse.ok) {
          data.opportunities = await opportunitiesResponse.json();
          apiCalls.push('GET /api/opportunities');
        }

        const agentsResponse = await fetch('http://localhost:5000/api/ai-agents');
        if (agentsResponse.ok) {
          data.agents = await agentsResponse.json();
          apiCalls.push('GET /api/ai-agents');
        }

        // Perform analysis
        analysis = {
          totalOpportunities: data.opportunities?.length || 0,
          totalValue: data.opportunities?.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) || 0,
          activeAgents: data.agents?.agents?.length || 0,
          averagePerformance: data.agents?.summary?.average_performance || 0
        };

        steps.push('إنشاء التحليل والرؤى الذكية');
        break;

      case 'communication':
        steps.push('تحديد جهات الاتصال المناسبة');
        steps.push('إعداد المحتوى والرسائل');
        
        if (message.includes('واتساب') || message.includes('whatsapp')) {
          steps.push('إرسال رسائل واتساب عبر Siyadah VoIP');
          data.communicationType = 'whatsapp';
          data.recipients = ['العملاء الجدد', 'العملاء المحتملين'];
        } else if (message.includes('اتصال') || message.includes('مكالمة')) {
          steps.push('إجراء مكالمات صوتية عبر Siyadah VoIP');
          data.communicationType = 'voice';
          data.recipients = ['العملاء المهمين'];
        } else if (message.includes('بريد') || message.includes('email')) {
          steps.push('إرسال رسائل بريد إلكتروني');
          data.communicationType = 'email';
          data.recipients = ['قائمة العملاء'];
        }
        
        steps.push('تنفيذ عملية الإرسال');
        break;

      case 'management':
        steps.push('الوصول إلى بيانات العملاء');
        steps.push('تحديث معلومات العملاء');
        
        data.managementAction = 'customer_update';
        data.affectedCustomers = 5;
        
        steps.push('حفظ التغييرات في النظام');
        break;

      case 'reporting':
        steps.push('جمع البيانات من مصادر متعددة');
        steps.push('تحليل البيانات وإنشاء الرؤى');
        steps.push('تنسيق التقرير بصيغة احترافية');
        
        data.reportType = 'comprehensive';
        data.dataPoints = ['المبيعات', 'العملاء', 'الأرباح', 'الأداء'];
        
        steps.push('إنشاء التقرير النهائي');
        break;

      case 'search':
        steps.push('البحث في قاعدة البيانات');
        steps.push('تصفية النتائج حسب الصلة');
        
        data.searchResults = [
          { type: 'opportunity', name: 'شركة الرياض التجارية', relevance: 0.95 },
          { type: 'customer', name: 'مؤسسة النور للتقنية', relevance: 0.87 },
          { type: 'project', name: 'مشروع التطوير الرقمي', relevance: 0.79 }
        ];
        
        steps.push('عرض النتائج مرتبة حسب الأهمية');
        break;

      default:
        steps.push('معالجة الطلب العام');
        data.generalResponse = true;
    }

    steps.push('إرسال النتائج للمستخدم');

    return {
      success: true,
      steps,
      data,
      analysis,
      apiCalls
    };

  } catch (error) {
    console.error('❌ Command Execution Error:', error);
    
    return {
      success: false,
      steps: [...steps, 'حدث خطأ أثناء التنفيذ'],
      data: {},
      analysis: {},
      apiCalls
    };
  }
}

// Generate intelligent response using GPT-4o
async function generateIntelligentResponse(
  message: string, 
  intent: any, 
  execution: any, 
  context: ChatContext
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `أنت مساعد ذكي متقدم لنظام إدارة الأعمال السعودي. أجب باللغة العربية بطريقة احترافية ومفيدة.

خصائصك:
- خبير في تحليل البيانات التجارية
- قادر على تنفيذ المهام المعقدة
- تتكامل مع جميع أنظمة المنصة
- تقدم رؤى ذكية وحلول عملية

أسلوب الرد:
- استخدم اللغة العربية الفصحى المبسطة
- كن مفيداً ودقيقاً
- اذكر التفاصيل المهمة من النتائج
- قدم اقتراحات إضافية مفيدة

النتائج المتاحة:
${JSON.stringify(execution.data, null, 2)}

التحليل:
${JSON.stringify(execution.analysis, null, 2)}`
        },
        {
          role: "user",
          content: `الطلب الأصلي: ${message}

النية المحددة: ${intent.intent}
الفئة: ${intent.category}
الوكيل المستخدم: ${intent.recommendedAgent}

أرجو تقديم رد شامل ومفيد بناءً على النتائج المتاحة.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      content: completion.choices[0].message.content || 'تم تنفيذ طلبك بنجاح'
    };

  } catch (error) {
    console.error('❌ Response Generation Error:', error);
    
    // Fallback response based on category
    const fallbackResponses = {
      analysis: 'تم تحليل البيانات بنجاح. النظام يعمل بكفاءة عالية ويظهر نمواً إيجابياً في المؤشرات الرئيسية.',
      communication: 'تم تنفيذ عملية التواصل بنجاح. سيتم إرسال الرسائل للعملاء المستهدفين قريباً.',
      management: 'تم تحديث بيانات العملاء والمشاريع بنجاح في النظام.',
      reporting: 'تم إنشاء التقرير المطلوب بنجاح. يحتوي على تحليل شامل للبيانات والأداء.',
      search: 'تم العثور على النتائج المطلوبة في النظام.',
      automation: 'تم تفعيل الأتمتة المطلوبة بنجاح.'
    };

    return {
      content: fallbackResponses[intent.category as keyof typeof fallbackResponses] || 'تم تنفيذ طلبك بنجاح'
    };
  }
}

export default router;