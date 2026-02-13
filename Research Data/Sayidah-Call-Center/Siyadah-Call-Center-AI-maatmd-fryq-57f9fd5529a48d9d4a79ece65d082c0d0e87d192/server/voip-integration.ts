import { Request, Response } from 'express';
import { storage } from './storage';

// VoIP Activity storage
let voipActivities: any[] = [];

// Record VoIP activity
async function recordVoIPActivity(type: string, data: any) {
  try {
    const activity = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    voipActivities.push(activity);
    console.log(`📝 VoIP Activity recorded: ${type} - ${data.action}`);
    
    // Keep only last 100 activities
    if (voipActivities.length > 100) {
      voipActivities = voipActivities.slice(-100);
    }
  } catch (error) {
    console.error('❌ Error recording VoIP activity:', error);
  }
}

// Siyadah VoIP API Configuration
const SIYADAH_VOIP_API_KEY = "siyadah_voip_api_key_2025_v1";

// API Key validation middleware
export const validateVoIPApiKey = (req: Request, res: Response, next: any) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== SIYADAH_VOIP_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

// Customer update webhook handler
export const handleCustomerUpdate = async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;
    
    console.log(`🔗 VoIP Integration: Received ${event} event`, data);
    
    switch (event) {
      case 'customer_update':
        await processCustomerUpdate(data);
        break;
      case 'call_completed':
        await processCallCompleted(data);
        break;
      case 'call_initiated':
        await processCallInitiated(data);
        break;
      case 'voice_message':
        await processVoiceMessage(data);
        break;
      default:
        console.log(`⚠️ Unknown event type: ${event}`);
    }
    
    res.json({
      success: true,
      message: `Event ${event} processed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ VoIP Integration Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process customer update from VoIP system
async function processCustomerUpdate(data: any) {
  try {
    const { customer_id, name, phone, status, email, notes } = data;
    
    // Find existing opportunity or create new one
    const opportunities = await storage.getAllOpportunities();
    let existingOpportunity = opportunities.find(opp => 
      opp.phone === phone || opp.email === email || 
      (opp.contactPerson && opp.contactPerson.includes(name))
    );
    
    if (existingOpportunity) {
      // Update existing opportunity
      console.log(`📞 Updating existing customer: ${name} (${phone})`);
      
      // Update contact info but keep existing data
      const updatedOpportunity = {
        ...existingOpportunity,
        contactPerson: name || existingOpportunity.contactPerson,
        phone: phone || existingOpportunity.phone,
        email: email || existingOpportunity.email,
        notes: notes ? `${existingOpportunity.notes || ''}\n[VoIP Update]: ${notes}`.trim() : existingOpportunity.notes
      };
      
      // Update opportunity with proper ID handling
      try {
        // For MongoDB, we'll just update the existing opportunity directly
        await storage.updateOpportunity(existingOpportunity._id as any, updatedOpportunity);
        console.log(`📝 Updated existing opportunity: ${existingOpportunity._id}`);
        
        // Record activity
        await recordVoIPActivity('customer_update', {
          opportunity_id: existingOpportunity._id,
          customer_name: name,
          phone: phone,
          action: 'Customer information updated via VoIP',
          details: notes || 'Customer data synchronized'
        });
      } catch (updateError) {
        console.error('❌ Error updating opportunity:', updateError);
      }
      
    } else {
      // Create new opportunity from VoIP data
      console.log(`📞 Creating new opportunity from VoIP: ${name} (${phone})`);
      
      const newOpportunity = {
        name: `عميل VoIP - ${name}`,
        description: `عميل جديد من نظام VoIP - الهاتف: ${phone}`,
        value: 25000, // Default value for VoIP leads
        stage: 'prospecting' as const,
        probability: 30,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        // Required fields for database schema
        phone: phone,
        email: email || `${name.replace(/\s+/g, '').toLowerCase()}@voip-lead.com`,
        contactPerson: name,
        source: 'Siyadah VoIP System',
        assignedAgent: 'سارة AI'
      };
      
      const createdOpportunity = await storage.createOpportunity(newOpportunity);
      console.log(`✅ New VoIP opportunity created for: ${name}`);
      
      // Record activity for new opportunity
      await recordVoIPActivity('customer_created', {
        opportunity_id: createdOpportunity._id,
        customer_name: name,
        phone: phone,
        action: 'New customer created via VoIP',
        details: notes || 'Customer imported from VoIP system'
      });
    }
    
    console.log(`✅ Customer update processed: ${name} (${phone})`);
    
  } catch (error) {
    console.error('❌ Error processing customer update:', error);
    throw error;
  }
}

// Process completed call from VoIP system
async function processCallCompleted(data: any) {
  const { call_id, customer_id, phone, duration, outcome, notes, recording_url } = data;
  
  console.log(`📞 Call completed: ${call_id} - Duration: ${duration}s`);
  
  // Update opportunity if exists
  const opportunities = await storage.getAllOpportunities();
  const opportunity = opportunities.find(opp => 
    opp.phone === phone
  );
  
  if (opportunity) {
    const oldProbability = opportunity.probability;
    
    // Update opportunity based on call outcome
    if (outcome === 'interested') {
      opportunity.probability = Math.min(opportunity.probability + 20, 90);
      opportunity.stage = 'qualification';
    } else if (outcome === 'not_interested') {
      opportunity.probability = Math.max(opportunity.probability - 30, 10);
    }
    
    console.log(`📈 Updated opportunity probability for ${phone}: ${oldProbability}% → ${opportunity.probability}%`);
    
    // Record activity
    await recordVoIPActivity('call_completed', {
      opportunity_id: opportunity._id,
      customer_name: opportunity.contactPerson,
      phone: phone,
      action: `Call completed - ${outcome}`,
      details: `Duration: ${duration}s, Outcome: ${outcome}, Probability: ${oldProbability}% → ${opportunity.probability}%`,
      call_id,
      duration,
      outcome,
      recording_url
    });
  }
}

// Process call initiated from VoIP system
async function processCallInitiated(data: any) {
  const { call_id, customer_id, phone, scheduled_time } = data;
  
  console.log(`📞 Call initiated: ${call_id} to ${phone}`);
  
  // Find opportunity and record activity
  const opportunities = await storage.getAllOpportunities();
  const opportunity = opportunities.find(opp => opp.phone === phone);
  
  if (opportunity) {
    await recordVoIPActivity('call_initiated', {
      opportunity_id: opportunity._id,
      customer_name: opportunity.contactPerson,
      phone: phone,
      action: 'Call initiated',
      details: `Call ID: ${call_id}, Scheduled: ${scheduled_time || 'Now'}`,
      call_id,
      scheduled_time
    });
  } else {
    await recordVoIPActivity('call_initiated', {
      opportunity_id: null,
      customer_name: 'Unknown Customer',
      phone: phone,
      action: 'Call initiated to unknown number',
      details: `Call ID: ${call_id}, Phone: ${phone}`,
      call_id
    });
  }
  
  console.log(`📝 Call logged for: ${phone}`);
}

// Process voice message from VoIP system
async function processVoiceMessage(data: any) {
  const { message_id, customer_id, phone, transcript, sentiment, keywords } = data;
  
  console.log(`🎤 Voice message processed: ${message_id} from ${phone}`);
  
  // Find opportunity
  const opportunities = await storage.getAllOpportunities();
  const opportunity = opportunities.find(opp => opp.phone === phone);
  
  if (opportunity) {
    const oldProbability = opportunity.probability;
    
    // Analyze sentiment and update opportunity
    if (sentiment === 'positive') {
      opportunity.probability = Math.min(opportunity.probability + 15, 95);
    } else if (sentiment === 'negative') {
      opportunity.probability = Math.max(opportunity.probability - 20, 5);
    }
    
    console.log(`💭 Updated opportunity based on sentiment (${sentiment}): ${oldProbability}% → ${opportunity.probability}%`);
    
    // Record activity
    await recordVoIPActivity('voice_message', {
      opportunity_id: opportunity._id,
      customer_name: opportunity.contactPerson,
      phone: phone,
      action: `Voice message analyzed - ${sentiment || 'neutral'} sentiment`,
      details: `Message: ${transcript?.substring(0, 100)}${transcript?.length > 100 ? '...' : ''}, Keywords: ${keywords?.join(', ') || 'None'}, Probability: ${oldProbability}% → ${opportunity.probability}%`,
      message_id,
      transcript,
      sentiment,
      keywords
    });
  } else {
    // Record activity for unknown customer
    await recordVoIPActivity('voice_message', {
      opportunity_id: null,
      customer_name: 'Unknown Customer',
      phone: phone,
      action: 'Voice message from unknown number',
      details: `Message: ${transcript?.substring(0, 100)}${transcript?.length > 100 ? '...' : ''}, Sentiment: ${sentiment || 'neutral'}`,
      message_id,
      transcript,
      sentiment
    });
  }
  
  console.log(`📝 Voice message recorded: ${transcript?.substring(0, 100)}...`);
}

// VoIP system status and configuration
export const getVoipStatus = async (req: Request, res: Response) => {
  try {
    const opportunities = await storage.getAllOpportunities();
    const voipOpportunities = opportunities.filter(opp => 
      opp.source === 'Siyadah VoIP System' || opp.assignedAgent === 'سارة AI'
    );
    
    res.json({
      success: true,
      status: 'active',
      api_key_status: 'valid',
      integration_stats: {
        total_voip_activities: voipActivities.length,
        total_voip_opportunities: voipOpportunities.length,
        last_activity: voipActivities.length > 0 ? voipActivities[voipActivities.length - 1].timestamp : null
      },
      recent_activities: voipActivities.slice(-10),
      voip_opportunities: voipOpportunities.map(opp => ({
        id: opp._id,
        name: opp.name,
        phone: opp.phone,
        probability: opp.probability,
        stage: opp.stage,
        value: opp.value
      }))
    });
    
  } catch (error) {
    console.error('❌ Error getting VoIP status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get VoIP status'
    });
  }
};

// Send data to VoIP system
export const sendToVoipSystem = async (data: any) => {
  try {
    // This would normally make an HTTP request to the VoIP system
    // For now, we'll log it and return success
    console.log('📤 Sending to VoIP system:', data);
    
    // Simulate API call to VoIP system
    return {
      success: true,
      message: 'Data sent to VoIP system successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error sending to VoIP system:', error);
    throw error;
  }
};