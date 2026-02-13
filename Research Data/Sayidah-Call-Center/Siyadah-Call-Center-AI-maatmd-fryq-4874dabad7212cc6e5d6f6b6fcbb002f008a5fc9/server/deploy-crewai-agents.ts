/**
 * Deploy CrewAI Customer Service Agents
 * نشر وكلاء خدمة العملاء الذكيين
 */

import { connectToMongoDB } from './mongodb';

const customerServiceAgents = [
  // Customer Support Group
  {
    agentId: 'agent_support_responder',
    nameEn: 'Support Responder',
    nameAr: 'مستجيب الدعم',
    descriptionEn: 'Handles customer inquiries and provides instant support',
    descriptionAr: 'يتعامل مع استفسارات العملاء ويقدم الدعم الفوري',
    type: 'support',
    groupEn: 'Customer Support',
    groupAr: 'دعم العملاء',
    capabilities: ['answer_questions', 'provide_help', 'resolve_issues'],
    icon: '🎧',
    model: 'gpt-4o',
    temperature: 0.7,
    isActive: true
  },
  {
    agentId: 'agent_ticket_creator',
    nameEn: 'Ticket Creator',
    nameAr: 'منشئ التذاكر',
    descriptionEn: 'Creates support tickets for complex issues',
    descriptionAr: 'ينشئ تذاكر دعم للمشاكل المعقدة',
    type: 'support',
    groupEn: 'Customer Support',
    groupAr: 'دعم العملاء',
    capabilities: ['create_tickets', 'prioritize_issues', 'assign_tasks'],
    icon: '🎫',
    model: 'gpt-4o',
    temperature: 0.5,
    isActive: true
  },
  {
    agentId: 'agent_feedback_collector',
    nameEn: 'Feedback Collector',
    nameAr: 'جامع التعليقات',
    descriptionEn: 'Collects and analyzes customer feedback',
    descriptionAr: 'يجمع ويحلل تعليقات العملاء',
    type: 'support',
    groupEn: 'Customer Support',
    groupAr: 'دعم العملاء',
    capabilities: ['collect_feedback', 'analyze_sentiment', 'generate_reports'],
    icon: '📋',
    model: 'gpt-4o',
    temperature: 0.6,
    isActive: true
  },
  
  // Telemarketing Group
  {
    agentId: 'agent_telemarketing_pitcher',
    nameEn: 'Telemarketing Pitcher',
    nameAr: 'مسوق هاتفي',
    descriptionEn: 'Presents products and services to potential customers',
    descriptionAr: 'يعرض المنتجات والخدمات للعملاء المحتملين',
    type: 'sales',
    groupEn: 'Telemarketing',
    groupAr: 'التسويق الهاتفي',
    capabilities: ['pitch_products', 'handle_objections', 'qualify_leads'],
    icon: '📞',
    model: 'gpt-4o',
    temperature: 0.8,
    isActive: true
  },
  {
    agentId: 'agent_lead_qualifier',
    nameEn: 'Lead Qualifier',
    nameAr: 'مؤهل العملاء المحتملين',
    descriptionEn: 'Qualifies leads and identifies hot prospects',
    descriptionAr: 'يؤهل العملاء المحتملين ويحدد الفرص الساخنة',
    type: 'sales',
    groupEn: 'Telemarketing',
    groupAr: 'التسويق الهاتفي',
    capabilities: ['qualify_leads', 'score_prospects', 'segment_customers'],
    icon: '🎯',
    model: 'gpt-4o',
    temperature: 0.6,
    isActive: true
  },
  
  // Telesales Group
  {
    agentId: 'agent_sales_closer',
    nameEn: 'Sales Closer',
    nameAr: 'مغلق الصفقات',
    descriptionEn: 'Closes deals and finalizes sales',
    descriptionAr: 'يغلق الصفقات وينهي المبيعات',
    type: 'sales',
    groupEn: 'Telesales',
    groupAr: 'المبيعات الهاتفية',
    capabilities: ['close_deals', 'negotiate_terms', 'process_orders'],
    icon: '💼',
    model: 'gpt-4o',
    temperature: 0.7,
    isActive: true
  },
  {
    agentId: 'agent_appointment_scheduler',
    nameEn: 'Appointment Scheduler',
    nameAr: 'جدولة المواعيد',
    descriptionEn: 'Schedules appointments and meetings',
    descriptionAr: 'يجدول المواعيد والاجتماعات',
    type: 'sales',
    groupEn: 'Telesales',
    groupAr: 'المبيعات الهاتفية',
    capabilities: ['schedule_appointments', 'manage_calendar', 'send_reminders'],
    icon: '📅',
    model: 'gpt-4o',
    temperature: 0.5,
    isActive: true
  },
  {
    agentId: 'agent_objection_handler',
    nameEn: 'Objection Handler',
    nameAr: 'معالج الاعتراضات',
    descriptionEn: 'Handles customer objections professionally',
    descriptionAr: 'يتعامل مع اعتراضات العملاء بمهنية',
    type: 'sales',
    groupEn: 'Telesales',
    groupAr: 'المبيعات الهاتفية',
    capabilities: ['handle_objections', 'provide_solutions', 'build_trust'],
    icon: '🛡️',
    model: 'gpt-4o',
    temperature: 0.7,
    isActive: true
  }
];

async function deployAgents() {
  try {
    const mongodb = await connectToMongoDB();
    const db = mongodb;
    console.log('🤖 Deploying CrewAI customer service agents...');
    
    // Create customeragents collection if not exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'customeragents');
    
    if (!collectionExists) {
      await db.createCollection('customeragents');
      console.log('✅ Created customeragents collection');
    }
    
    const collection = db.collection('customeragents');
    
    // Clear existing agents
    await collection.deleteMany({});
    
    // Insert new agents
    const result = await collection.insertMany(customerServiceAgents.map(agent => ({
      ...agent,
      organizationId: 'global',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalInteractions: 0,
        successRate: 95,
        averageResponseTime: 2.5,
        lastActive: new Date()
      },
      configuration: {
        maxTokens: 1024,
        systemPrompt: `أنت ${agent.nameAr}، وكيل خدمة عملاء محترف في منصة سيادة للذكاء الاصطناعي.
مهمتك هي ${agent.descriptionAr}.
تحدث باللغة العربية بشكل أساسي، واستخدم لغة مهنية ولطيفة.`,
        responseStyle: 'professional',
        language: 'ar'
      }
    })));
    
    console.log(`✅ Successfully deployed ${result.insertedCount} customer service agents`);
    
    // Display deployed agents
    const agents = await collection.find({}).toArray();
    console.log('\n📊 Deployed agents:');
    agents.forEach(agent => {
      console.log(`${agent.icon} ${agent.nameAr} (${agent.groupAr})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deploying agents:', error);
    process.exit(1);
  }
}

// Run deployment
deployAgents();