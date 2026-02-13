/**
 * CrewAI System for Siyadah Platform
 * نظام الوكلاء الذكيين المتطور لخدمة العملاء والتسويق والمبيعات
 */

import { Request, Response } from 'express';
import { connectToMongoDB } from './mongodb';
import mongoose from 'mongoose';

// Define Customer Agent Types
export interface CustomerAgent {
  id: string;
  name: string;
  nameAr: string;
  type: 'support' | 'telemarketing' | 'telesales';
  group: string;
  groupAr: string;
  capabilities: string[];
  capabilitiesAr: string[];
  personality: string;
  personalityAr: string;
  icon: string;
  active: boolean;
  modelConfig: {
    temperature: number;
    maxTokens: number;
    model: string;
  };
}

// Customer Service Agents Group
export const CUSTOMER_SERVICE_AGENTS: CustomerAgent[] = [
  {
    id: 'agent_support_responder',
    name: 'Support Responder',
    nameAr: 'مستجيب الدعم',
    type: 'support',
    group: 'Customer Service',
    groupAr: 'خدمة العملاء',
    capabilities: [
      'Welcome customers warmly',
      'Identify problems or inquiries',
      'Explain solutions clearly',
      'Escalate to human when needed'
    ],
    capabilitiesAr: [
      'يرحب بالعميل',
      'يحدد المشكلة أو الاستفسار',
      'يشرح الحل بشكل مبسط وواضح',
      'يحيل للموظف البشري إذا لزم'
    ],
    personality: 'Professional, empathetic, and solution-focused',
    personalityAr: 'محترف، متعاطف، ومركز على الحلول',
    icon: '🧕',
    active: true,
    modelConfig: {
      temperature: 0.7,
      maxTokens: 500,
      model: 'gpt-4o'
    }
  },
  {
    id: 'agent_ticket_creator',
    name: 'Ticket Creator',
    nameAr: 'منشئ التذاكر',
    type: 'support',
    group: 'Customer Service',
    groupAr: 'خدمة العملاء',
    capabilities: [
      'Automatically log customer complaints',
      'Generate ticket numbers',
      'Assure customers their request is being tracked',
      'Send confirmation messages'
    ],
    capabilitiesAr: [
      'يسجل بلاغ العميل تلقائيًا',
      'يعطيه رقم تذكرة',
      'يطمّنه أن طلبه قيد المتابعة',
      'يرسل رسائل تأكيد'
    ],
    personality: 'Organized, reliable, and reassuring',
    personalityAr: 'منظم، موثوق، ومطمئن',
    icon: '🧾',
    active: true,
    modelConfig: {
      temperature: 0.5,
      maxTokens: 300,
      model: 'gpt-4o'
    }
  },
  {
    id: 'agent_feedback_collector',
    name: 'Feedback Collector',
    nameAr: 'جامع التعليقات',
    type: 'support',
    group: 'Customer Service',
    groupAr: 'خدمة العملاء',
    capabilities: [
      'Request service ratings politely',
      'Collect customer feedback',
      'Thank customers for their time',
      'Record satisfaction scores'
    ],
    capabilitiesAr: [
      'يطلب من العميل تقييم الخدمة بأسلوب لطيف',
      'يجمع تعليقات العملاء',
      'يشكر العملاء على وقتهم',
      'يسجل درجات الرضا'
    ],
    personality: 'Friendly, appreciative, and non-intrusive',
    personalityAr: 'ودود، مقدر، وغير متطفل',
    icon: '📊',
    active: true,
    modelConfig: {
      temperature: 0.8,
      maxTokens: 200,
      model: 'gpt-4o'
    }
  }
];

// Telemarketing Agents Group
export const TELEMARKETING_AGENTS: CustomerAgent[] = [
  {
    id: 'agent_telemarketing_pitcher',
    name: 'Telemarketing Pitcher',
    nameAr: 'مسوق هاتفي',
    type: 'telemarketing',
    group: 'Telemarketing',
    groupAr: 'التسويق الهاتفي',
    capabilities: [
      'Start with smart questions',
      'Present quick 2-line offers',
      'Ask if customer wants details',
      'Create interest quickly'
    ],
    capabilitiesAr: [
      'يبدأ بسؤال ذكي',
      'يقدم عرضًا سريعًا بـ 2 سطر كحد أقصى',
      'يسأل العميل هل يناسبه معرفة التفاصيل',
      'يخلق اهتمام سريع'
    ],
    personality: 'Engaging, concise, and persuasive',
    personalityAr: 'جذاب، مختصر، ومقنع',
    icon: '🧲',
    active: true,
    modelConfig: {
      temperature: 0.8,
      maxTokens: 400,
      model: 'gpt-4o'
    }
  },
  {
    id: 'agent_lead_qualifier',
    name: 'Lead Qualifier',
    nameAr: 'مؤهل العملاء المحتملين',
    type: 'telemarketing',
    group: 'Telemarketing',
    groupAr: 'التسويق الهاتفي',
    capabilities: [
      'Ask qualifying questions',
      'Assess budget, decision authority, timing',
      'Record answers internally',
      'Score lead quality'
    ],
    capabilitiesAr: [
      'يسأل أسئلة ذكية للتأهيل',
      'يقيّم الميزانية، صلاحية القرار، التوقيت',
      'يسجل الإجابات داخليًا',
      'يقيّم جودة العميل المحتمل'
    ],
    personality: 'Analytical, tactful, and efficient',
    personalityAr: 'تحليلي، لبق، وفعال',
    icon: '🎁',
    active: true,
    modelConfig: {
      temperature: 0.6,
      maxTokens: 350,
      model: 'gpt-4o'
    }
  }
];

// Telesales (Closing) Agents Group
export const TELESALES_AGENTS: CustomerAgent[] = [
  {
    id: 'agent_closer',
    name: 'Sales Closer',
    nameAr: 'مختتم الصفقات',
    type: 'telesales',
    group: 'Telesales',
    groupAr: 'تلي سيلز',
    capabilities: [
      'Convert interested customers',
      'Present compelling offers',
      'Provide discounts or benefits',
      'Push for decision making'
    ],
    capabilitiesAr: [
      'يحول العميل المهتم إلى مسار الإقناع النهائي',
      'يقدم عرض مختصر + خصم أو فائدة',
      'يحث العميل على اتخاذ قرار',
      'يدفع نحو إتمام الصفقة'
    ],
    personality: 'Confident, persuasive, and results-driven',
    personalityAr: 'واثق، مقنع، وموجه للنتائج',
    icon: '🧠',
    active: true,
    modelConfig: {
      temperature: 0.7,
      maxTokens: 500,
      model: 'gpt-4o'
    }
  },
  {
    id: 'agent_scheduler',
    name: 'Appointment Scheduler',
    nameAr: 'منسق المواعيد',
    type: 'telesales',
    group: 'Telesales',
    groupAr: 'تلي سيلز',
    capabilities: [
      'Offer meeting times',
      'Schedule free trials',
      'Share calendar links',
      'Register appointments'
    ],
    capabilitiesAr: [
      'يعرض وقت مكالمة أو تجربة مجانية',
      'يشارك رابط تقويم',
      'يسجل الموعد في النظام',
      'ينسق المواعيد'
    ],
    personality: 'Organized, helpful, and accommodating',
    personalityAr: 'منظم، مساعد، ومتعاون',
    icon: '📅',
    active: true,
    modelConfig: {
      temperature: 0.5,
      maxTokens: 300,
      model: 'gpt-4o'
    }
  },
  {
    id: 'agent_objection_handler',
    name: 'Objection Handler',
    nameAr: 'معالج الاعتراضات',
    type: 'telesales',
    group: 'Telesales',
    groupAr: 'تلي سيلز',
    capabilities: [
      'Handle customer objections',
      'Address price concerns',
      'Build trust and confidence',
      'Provide reassuring responses'
    ],
    capabilitiesAr: [
      'يتعامل مع اعتراضات العميل',
      'يرد على مخاوف السعر',
      'يبني الثقة',
      'يرد باحترافية مقنعة ومطمئنة'
    ],
    personality: 'Understanding, patient, and reassuring',
    personalityAr: 'متفهم، صبور، ومطمئن',
    icon: '💬',
    active: true,
    modelConfig: {
      temperature: 0.7,
      maxTokens: 400,
      model: 'gpt-4o'
    }
  }
];

// Combined all agents
export const ALL_CUSTOMER_AGENTS = [
  ...CUSTOMER_SERVICE_AGENTS,
  ...TELEMARKETING_AGENTS,
  ...TELESALES_AGENTS
];

// Agent Schema for MongoDB
const CustomerAgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  organizationId: { type: String, required: true },
  name: String,
  nameAr: String,
  type: String,
  group: String,
  groupAr: String,
  capabilities: [String],
  capabilitiesAr: [String],
  personality: String,
  personalityAr: String,
  icon: String,
  active: { type: Boolean, default: true },
  modelConfig: {
    temperature: Number,
    maxTokens: Number,
    model: String
  },
  metrics: {
    totalInteractions: { type: Number, default: 0 },
    successfulInteractions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    lastActive: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CustomerAgentModel = mongoose.model('CustomerAgent', CustomerAgentSchema);

// Deploy customer agents for an organization
export async function deployCustomerAgents(organizationId: string): Promise<any> {
  try {
    await connectToMongoDB();
    
    const deployedAgents = [];
    
    for (const agent of ALL_CUSTOMER_AGENTS) {
      const existingAgent = await CustomerAgentModel.findOne({
        agentId: agent.id,
        organizationId
      });
      
      if (!existingAgent) {
        const newAgent = new CustomerAgentModel({
          ...agent,
          agentId: agent.id,
          organizationId,
          metrics: {
            totalInteractions: 0,
            successfulInteractions: 0,
            averageRating: 0,
            lastActive: new Date()
          }
        });
        
        const saved = await newAgent.save();
        deployedAgents.push(saved);
      }
    }
    
    return {
      success: true,
      deployed: deployedAgents.length,
      total: ALL_CUSTOMER_AGENTS.length,
      agents: deployedAgents
    };
  } catch (error: any) {
    console.error('Error deploying customer agents:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// API Routes
export async function deployCustomerAgentsAPI(req: Request, res: Response) {
  try {
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }
    
    const result = await deployCustomerAgents(organizationId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getCustomerAgentsAPI(req: Request, res: Response) {
  try {
    const { organizationId } = req.query;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }
    
    await connectToMongoDB();
    const agents = await CustomerAgentModel.find({ organizationId });
    
    res.json({
      success: true,
      agents,
      count: agents.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}