/**
 * Enterprise API Router - World-Class Implementation
 * Professional-grade solution for all API routing conflicts
 */

import { Express, Request, Response, NextFunction } from 'express';

export function setupEnterpriseAPIRouter(app: Express): void {
  console.log('🏢 Setting up Enterprise API Router...');

  // Force API routes to be handled before ANY middleware including Vite
  const apiHandler = (req: Request, res: Response, next: NextFunction) => {
    // Only handle API routes
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    // Force JSON response for all API endpoints
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Handle specific endpoints
    if (req.method === 'POST' && req.path === '/api/process-command') {
      return handleProcessCommand(req, res);
    }
    
    if (req.method === 'POST' && req.path === '/api/execute-plan') {
      return handleExecutePlan(req, res);
    }

    // Continue to other API routes
    next();
  };

  // Register the handler BEFORE any other middleware
  app.use(apiHandler);

  console.log('✅ Enterprise API Router configured with priority handling');
}

async function handleProcessCommand(req: Request, res: Response): Promise<Response> {
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

    console.log('🤖 Enterprise Processing:', message);

    // Dynamic import to avoid circular dependencies
    const { processCommandWithAgents } = await import('./ai-agents-engine');
    const response = await processCommandWithAgents(message);
    
    return res.json(response);
    
  } catch (error) {
    console.error('❌ Enterprise API Error:', error);
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
}

async function handleExecutePlan(req: Request, res: Response): Promise<Response> {
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

    console.log('🚀 Enterprise Execution:', plan.goal);

    // Dynamic import to avoid circular dependencies
    const { executeAgentPlan } = await import('./ai-agents-engine');
    const result = await executeAgentPlan(plan);
    
    return res.json(result);
    
  } catch (error) {
    console.error('❌ Enterprise Execution Error:', error);
    return res.status(500).json({
      success: false,
      summary: "حدث خطأ في تنفيذ الخطة",
      results: [],
      nextStep: "يرجى المحاولة مرة أخرى"
    });
  }
}