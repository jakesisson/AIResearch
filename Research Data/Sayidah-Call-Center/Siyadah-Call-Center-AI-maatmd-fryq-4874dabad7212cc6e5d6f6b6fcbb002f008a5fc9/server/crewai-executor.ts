/**
 * CrewAI Execution Engine
 * محرك تنفيذ الوكلاء الذكيين مع تكامل OpenAI
 */

import OpenAI from 'openai';
import { CustomerAgentModel } from './crewai-system';
import { connectToMongoDB } from './mongodb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export interface AgentContext {
  customerId: string;
  customerName?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  customerProfile?: {
    type: 'cold' | 'warm' | 'hot';
    interests: string[];
    objections: string[];
    budget?: number;
    timeline?: string;
  };
  currentIntent?: string;
  selectedAgent?: string;
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  response: string;
  nextAction?: string;
  confidence: number;
  metadata?: any;
}

// Intent detection to select the right agent
export async function detectCustomerIntent(message: string, context: AgentContext): Promise<{
  intent: string;
  confidence: number;
  suggestedAgent: string;
}> {
  try {
    const systemPrompt = `أنت محلل نوايا ذكي. حلل رسالة العميل وحدد النية والوكيل المناسب.

الوكلاء المتاحون:
1. agent_support_responder - للاستفسارات والمشاكل
2. agent_telemarketing_pitcher - للاهتمام بالمنتجات
3. agent_lead_qualifier - لتأهيل العملاء المحتملين
4. agent_closer - لإغلاق الصفقات
5. agent_objection_handler - للتعامل مع الاعتراضات
6. agent_scheduler - لحجز المواعيد
7. agent_ticket_creator - لإنشاء التذاكر
8. agent_feedback_collector - لجمع التقييمات

حلل الرسالة وأرجع JSON بالشكل التالي:
{
  "intent": "support|sales|qualification|closing|objection|scheduling|feedback",
  "confidence": 0.0-1.0,
  "suggestedAgent": "agent_id",
  "reasoning": "سبب الاختيار"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `رسالة العميل: ${message}\n\nسياق المحادثة: ${JSON.stringify(context.conversationHistory.slice(-3))}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      intent: result.intent || 'support',
      confidence: result.confidence || 0.8,
      suggestedAgent: result.suggestedAgent || 'agent_support_responder'
    };
  } catch (error) {
    console.error('Intent detection error:', error);
    return {
      intent: 'support',
      confidence: 0.5,
      suggestedAgent: 'agent_support_responder'
    };
  }
}

// Execute agent with specific personality and capabilities
export async function executeAgent(
  agentId: string,
  message: string,
  context: AgentContext,
  organizationId: string
): Promise<AgentResponse> {
  try {
    await connectToMongoDB();
    
    // Get agent configuration
    const agent = await CustomerAgentModel.findOne({ agentId, organizationId });
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Build agent personality prompt
    const personalityPrompt = `أنت ${agent.nameAr} (${agent.name}).
الدور: ${agent.personalityAr}
المجموعة: ${agent.groupAr}

قدراتك:
${agent.capabilitiesAr.map((cap: string, i: number) => `${i + 1}. ${cap}`).join('\n')}

تعليمات مهمة:
- استخدم أسلوبك الخاص حسب شخصيتك
- كن مختصراً ومباشراً (2-3 جمل كحد أقصى)
- اختتم دائماً بـ CTA واضح
- إذا العميل بارد، كن لطيفاً واعرض المتابعة لاحقاً
- إذا العميل ساخن، خذ بياناته وحدد موعد

معلومات العميل:
- النوع: ${context.customerProfile?.type || 'unknown'}
- الاهتمامات: ${context.customerProfile?.interests?.join(', ') || 'غير محدد'}
- الاعتراضات: ${context.customerProfile?.objections?.join(', ') || 'لا يوجد'}`;

    // Generate response
    const response = await openai.chat.completions.create({
      model: agent.modelConfig?.model || 'gpt-4o',
      messages: [
        { role: 'system', content: personalityPrompt },
        ...context.conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      temperature: agent.modelConfig?.temperature || 0.7,
      max_tokens: agent.modelConfig?.maxTokens || 400
    });

    const agentResponse = response.choices[0].message.content || '';

    // Update agent metrics
    await CustomerAgentModel.updateOne(
      { _id: agent._id },
      {
        $inc: { 'metrics.totalInteractions': 1 },
        $set: { 'metrics.lastActive': new Date() }
      }
    );

    // Determine next action based on agent type
    let nextAction = undefined;
    if (agentId === 'agent_support_responder' && agentResponse.includes('تصعيد')) {
      nextAction = 'escalate_to_human';
    } else if (agentId === 'agent_telemarketing_pitcher' && context.customerProfile?.type === 'warm') {
      nextAction = 'activate_lead_qualifier';
    } else if (agentId === 'agent_lead_qualifier' && context.customerProfile?.type === 'hot') {
      nextAction = 'activate_closer';
    } else if (agentId === 'agent_closer' && agentResponse.includes('موافق')) {
      nextAction = 'activate_scheduler';
    }

    return {
      agentId: agent.agentId,
      agentName: agent.nameAr || 'وكيل',
      response: agentResponse,
      nextAction,
      confidence: 0.9,
      metadata: {
        model: agent.modelConfig?.model || 'gpt-4o',
        temperature: agent.modelConfig?.temperature || 0.7
      }
    };
  } catch (error: any) {
    console.error('Agent execution error:', error);
    return {
      agentId,
      agentName: 'وكيل',
      response: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
      confidence: 0.3
    };
  }
}

// Profile customer based on conversation
export async function profileCustomer(context: AgentContext): Promise<{
  type: 'cold' | 'warm' | 'hot';
  interests: string[];
  objections: string[];
  recommendedAction: string;
}> {
  try {
    const recentMessages = context.conversationHistory.slice(-5);
    
    const systemPrompt = `حلل محادثة العميل وحدد:
1. نوع العميل: cold (غير مهتم), warm (مهتم نوعاً ما), hot (جاهز للشراء)
2. اهتماماته الرئيسية
3. اعتراضاته أو مخاوفه
4. الإجراء الموصى به

أرجع النتيجة بصيغة JSON`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(recentMessages) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    });

    const profile = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      type: profile.type || 'cold',
      interests: profile.interests || [],
      objections: profile.objections || [],
      recommendedAction: profile.recommendedAction || 'متابعة عادية'
    };
  } catch (error) {
    console.error('Customer profiling error:', error);
    return {
      type: 'cold',
      interests: [],
      objections: [],
      recommendedAction: 'متابعة عادية'
    };
  }
}

// Orchestrate multiple agents in a crew
export async function executeCrewWorkflow(
  message: string,
  context: AgentContext,
  organizationId: string
): Promise<{
  primaryResponse: AgentResponse;
  supportingAgents?: AgentResponse[];
  workflow: string[];
  finalRecommendation: string;
}> {
  try {
    // Step 1: Detect intent
    const intent = await detectCustomerIntent(message, context);
    
    // Step 2: Profile customer
    const customerProfile = await profileCustomer(context);
    context.customerProfile = customerProfile;
    
    // Step 3: Execute primary agent
    const primaryResponse = await executeAgent(
      intent.suggestedAgent,
      message,
      context,
      organizationId
    );

    const workflow = [intent.suggestedAgent];
    const supportingAgents: AgentResponse[] = [];

    // Step 4: Execute supporting agents based on workflow
    if (primaryResponse.nextAction) {
      if (primaryResponse.nextAction === 'activate_lead_qualifier') {
        const qualifierResponse = await executeAgent(
          'agent_lead_qualifier',
          'تأهيل العميل',
          context,
          organizationId
        );
        supportingAgents.push(qualifierResponse);
        workflow.push('agent_lead_qualifier');
      } else if (primaryResponse.nextAction === 'activate_closer') {
        const closerResponse = await executeAgent(
          'agent_closer',
          'إغلاق الصفقة',
          context,
          organizationId
        );
        supportingAgents.push(closerResponse);
        workflow.push('agent_closer');
      } else if (primaryResponse.nextAction === 'activate_scheduler') {
        const schedulerResponse = await executeAgent(
          'agent_scheduler',
          'حجز موعد',
          context,
          organizationId
        );
        supportingAgents.push(schedulerResponse);
        workflow.push('agent_scheduler');
      }
    }

    // Step 5: Generate final recommendation
    const finalRecommendation = customerProfile.type === 'hot' 
      ? 'العميل جاهز للشراء - أغلق الصفقة الآن'
      : customerProfile.type === 'warm'
      ? 'العميل مهتم - تابع مع تأهيل أكثر'
      : 'العميل يحتاج مزيد من التثقيف - أرسل معلومات';

    return {
      primaryResponse,
      supportingAgents: supportingAgents.length > 0 ? supportingAgents : undefined,
      workflow,
      finalRecommendation
    };
  } catch (error: any) {
    console.error('Crew workflow error:', error);
    return {
      primaryResponse: {
        agentId: 'agent_support_responder',
        agentName: 'مستجيب الدعم',
        response: 'عذراً، حدث خطأ في النظام. سيتم تحويلك لموظف بشري.',
        confidence: 0.1
      },
      workflow: ['error'],
      finalRecommendation: 'تصعيد للدعم البشري'
    };
  }
}