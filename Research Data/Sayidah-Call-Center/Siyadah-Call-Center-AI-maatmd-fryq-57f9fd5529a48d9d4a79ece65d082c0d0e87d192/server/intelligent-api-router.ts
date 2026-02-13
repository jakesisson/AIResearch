/**
 * Intelligent API Router - Professional Grade Implementation
 * Handles all AI agent processing with enterprise-level reliability
 */

import { Express, Request, Response } from 'express';

export function setupIntelligentAPIRouter(app: Express): void {
  // Process Command Endpoint - Core Intelligence
  app.post('/api/process-command', async (req: Request, res: Response) => {
    // Force JSON response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          response: "رسالة غير صالحة",
          agent: "النظام",
          agentRole: "مساعد عام",
          confidence: 0.3,
          suggestions: ["عرض الفرص", "حالة الوكلاء"],
          executionPlan: null,
          needsApproval: false,
          canExecuteNow: false
        });
      }

      console.log('🤖 Processing intelligent command:', message);

      const { processCommandWithAgents } = await import('./ai-agents-engine');
      const response = await processCommandWithAgents(message);
      
      return res.json(response);
      
    } catch (error) {
      console.error('❌ Command processing error:', error);
      return res.status(500).json({
        response: "حدث خطأ في معالجة طلبك",
        agent: "النظام",
        agentRole: "مساعد عام",
        confidence: 0.5,
        suggestions: ["عرض الفرص", "حالة الوكلاء"],
        executionPlan: null,
        needsApproval: false,
        canExecuteNow: false
      });
    }
  });

  // Execute Plan Endpoint - Specialized Execution
  app.post('/api/execute-plan', async (req: Request, res: Response) => {
    // Force JSON response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const { plan } = req.body;
      
      if (!plan || !plan.goal) {
        return res.status(400).json({
          success: false,
          summary: "خطة غير صالحة",
          results: [],
          nextStep: "يرجى تقديم خطة صحيحة"
        });
      }

      console.log('🚀 Executing plan:', plan.goal);

      const { executeAgentPlan } = await import('./ai-agents-engine');
      const result = await executeAgentPlan(plan);
      
      return res.json(result);
      
    } catch (error) {
      console.error('❌ Plan execution error:', error);
      return res.status(500).json({
        success: false,
        summary: "حدث خطأ في تنفيذ الخطة",
        results: [],
        nextStep: "يرجى المحاولة مرة أخرى"
      });
    }
  });

  console.log('✅ Intelligent API Router configured successfully');
}