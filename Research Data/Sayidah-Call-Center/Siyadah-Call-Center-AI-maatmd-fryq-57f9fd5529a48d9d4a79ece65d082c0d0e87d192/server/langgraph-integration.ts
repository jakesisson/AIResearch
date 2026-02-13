/**
 * LangGraph + CrewAI Integration for Node.js
 * تكامل LangGraph مع CrewAI للخادم
 */

import { Request, Response, Router } from 'express';
import { nativeLangGraph } from './langgraph-native-integration';

interface LangGraphProcessRequest {
  message: string;
  customer_id: string;
  thread_id?: string;
  context?: Record<string, any>;
}

interface LangGraphResponse {
  success: boolean;
  data?: {
    response: string;
    workflow_stage: string;
    agents_involved: string[];
    satisfaction_score?: number;
    next_actions: string[];
    thread_id: string;
  };
  error?: string;
}

export class LangGraphService {
  // Native integration - no external service needed
  constructor() {}

  async processConversation(request: LangGraphProcessRequest): Promise<LangGraphResponse> {
    try {
      const result = await nativeLangGraph.processConversation(
        request.message,
        request.customer_id,
        request.thread_id,
        request.context
      );
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error: any) {
      console.error('Native LangGraph error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getWorkflowVisualization(workflowId?: string): Promise<any> {
    try {
      return await nativeLangGraph.getWorkflowVisualization(workflowId);
    } catch (error: any) {
      console.error('Error fetching workflow visualization:', error);
      return { success: false, error: error.message };
    }
  }

  async getAgentPerformance(agentId?: string, dateFrom?: string, dateTo?: string): Promise<any> {
    try {
      return await nativeLangGraph.getAgentPerformance(agentId, dateFrom, dateTo);
    } catch (error: any) {
      console.error('Error fetching agent performance:', error);
      return { success: false, error: error.message };
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      return await nativeLangGraph.getSystemStats();
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create router for LangGraph endpoints
export function createLangGraphRouter(): Router {
  const router = Router();
  const langGraphService = new LangGraphService();

  // Process conversation with LangGraph
  router.post('/api/langgraph/process', async (req: Request, res: Response) => {
    try {
      const { message, customer_id, thread_id, context } = req.body;

      if (!message || !customer_id) {
        return res.status(400).json({
          success: false,
          error: 'Message and customer_id are required',
        });
      }

      // Process with LangGraph
      const result = await langGraphService.processConversation({
        message,
        customer_id,
        thread_id,
        context,
      });

      // If LangGraph service is down, fallback to regular CrewAI
      if (!result.success && result.error?.includes('ECONNREFUSED')) {
        console.log('LangGraph service unavailable, using direct CrewAI integration');
        
        // Use existing CrewAI system
        const { executeCrewWorkflow } = await import('./crewai-executor');
        const crewResult = await executeCrewWorkflow(
          message,
          {
            customerId: customer_id,
            conversationHistory: [],
          },
          'global' // organizationId
        );

        return res.json({
          success: true,
          data: {
            response: crewResult.primaryResponse.response,
            workflow_stage: 'completed',
            agents_involved: [crewResult.primaryResponse.agentName],
            thread_id: customer_id,
            next_actions: [],
            satisfaction_score: crewResult.primaryResponse.confidence,
          },
          fallback: true,
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error('LangGraph process error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get workflow visualization
  router.get('/api/langgraph/workflow/visualization', async (req: Request, res: Response) => {
    try {
      const { workflow_id } = req.query;
      const result = await langGraphService.getWorkflowVisualization(workflow_id as string);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get agent performance metrics
  router.get('/api/langgraph/agents/performance', async (req: Request, res: Response) => {
    try {
      const { agent_id, date_from, date_to } = req.query;
      const result = await langGraphService.getAgentPerformance(
        agent_id as string,
        date_from as string,
        date_to as string
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get system statistics
  router.get('/api/langgraph/stats', async (req: Request, res: Response) => {
    try {
      const result = await langGraphService.getSystemStats();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get workflow states for a thread
  router.get('/api/langgraph/workflow/states/:thread_id', async (req: Request, res: Response) => {
    try {
      const { thread_id } = req.params;
      const result = await nativeLangGraph.getWorkflowStates(thread_id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Reset workflow for a thread
  router.post('/api/langgraph/workflow/reset/:thread_id', async (req: Request, res: Response) => {
    try {
      const { thread_id } = req.params;
      const result = await nativeLangGraph.resetWorkflow(thread_id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

// Export for use in main server
export const langGraphRouter = createLangGraphRouter();