/**
 * CrewAI API Routes
 * واجهات برمجية لنظام الوكلاء الذكيين
 */

import { Request, Response, Router } from 'express';
import { deployCustomerAgents, getCustomerAgentsAPI, deployCustomerAgentsAPI } from './crewai-system';
import { executeCrewWorkflow, AgentContext } from './crewai-executor';

// Simple authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  // For now, pass through - can be enhanced later
  next();
};

const router = Router();

// Deploy agents for organization
router.post('/deploy-agents', isAuthenticated, deployCustomerAgentsAPI);

// Get organization agents
router.get('/agents', isAuthenticated, getCustomerAgentsAPI);

// Execute crew workflow
router.post('/execute', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('CrewAI Execute Request Body:', req.body);
    
    const { 
      message, 
      conversationId, 
      customer_id, 
      customerId,
      organization_id,
      organizationId 
    } = req.body;
    
    // Support both naming conventions
    const actualCustomerId = customerId || customer_id || `customer_${Date.now()}`;
    const actualOrgId = organizationId || organization_id || 'global';
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build context from request
    const context: AgentContext = {
      customerId: actualCustomerId,
      conversationHistory: req.body.conversationHistory || req.body.conversation_history || [],
      currentIntent: req.body.currentIntent || req.body.current_intent
    };

    // Add current message to history
    context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Execute crew workflow
    const result = await executeCrewWorkflow(message, context, actualOrgId);

    // Add response to history
    context.conversationHistory.push({
      role: 'assistant',
      content: result.primaryResponse.response,
      timestamp: new Date()
    });

    res.json({
      success: true,
      result,
      updatedContext: {
        ...context,
        conversationHistory: context.conversationHistory.slice(-10) // Keep last 10 messages
      }
    });
  } catch (error: any) {
    console.error('CrewAI execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test agent conversation
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { message, agentId = 'agent_support_responder' } = req.body;
    
    // Simple test without full workflow
    const testContext: AgentContext = {
      customerId: 'test_customer',
      conversationHistory: [
        {
          role: 'user',
          content: message,
          timestamp: new Date()
        }
      ]
    };

    const { executeAgent } = await import('./crewai-executor');
    const response = await executeAgent(
      agentId,
      message,
      testContext,
      'test_org'
    );

    res.json({
      success: true,
      response,
      message: `تم اختبار ${response.agentName} بنجاح`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get agent statistics
router.get('/stats/:organizationId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { CustomerAgentModel } = await import('./crewai-system');
    
    const agents = await CustomerAgentModel.find({ organizationId });
    
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.active).length,
      totalInteractions: agents.reduce((sum, a) => sum + (a.metrics?.totalInteractions || 0), 0),
      avgRating: agents.reduce((sum, a) => sum + (a.metrics?.averageRating || 0), 0) / agents.length,
      agentGroups: {
        support: agents.filter(a => a.type === 'support').length,
        telemarketing: agents.filter(a => a.type === 'telemarketing').length,
        telesales: agents.filter(a => a.type === 'telesales').length
      }
    };

    res.json({
      success: true,
      stats,
      agents: agents.map(a => ({
        id: a.agentId,
        name: a.nameAr,
        type: a.type,
        metrics: a.metrics
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;