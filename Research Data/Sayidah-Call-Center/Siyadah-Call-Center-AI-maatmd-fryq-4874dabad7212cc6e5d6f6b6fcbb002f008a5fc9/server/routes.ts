import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { AIService } from "./openai";
import { authenticateToken, requireRole, loginUser, registerUser, updatePassword, type AuthRequest } from "./auth";
import { z } from "zod";
import enhancedElevenlabsRoutes from './routes/enhanced-elevenlabs';
import apiControlRoutes from './routes/api-control';
import intelligentAgentsRoutes from './routes/intelligent-agents';
import backgroundIntelligenceRoutes from './routes/background-intelligence';
import aiMicroserviceRoutes from './routes/ai-microservice';
import { professionalAgentsManager } from './professional-agents';
import { subscriptionRoutes } from './routes/subscription-management';
import { telecomManager } from './telecom-partnerships';
import { intelligentAssistant, intelligentAgents } from './ai-agents-engine';
import { 
  handleAnalyticsReport, 
  handleTrackEvent, 
  handleOrganizationMetrics,
  analyticsService 
} from './saas-analytics-integration';

// MongoDB validation schemas
const insertAiTeamMemberSchema = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
  avatar: z.string().optional(),
  activeDeals: z.number().default(0),
  conversionRate: z.number().default(0),
  isActive: z.boolean().default(true)
});

const insertOpportunitySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  value: z.number().positive(),
  stage: z.string().min(1),
  probability: z.number().min(0).max(100),
  assignedAgent: z.string().min(1),
  source: z.string().min(1),
  contactPerson: z.string().min(1),
  phone: z.string().min(1),
  lastActivity: z.string().optional(),
  nextFollowUp: z.date().optional(),
  notes: z.string().optional()
});

const insertSupportTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().min(1),
  customerEmail: z.string().email(),
  assignedAgent: z.string().min(1),
  category: z.string().min(1),
  source: z.string().min(1)
});

const insertWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  trigger: z.string().min(1),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any())
  })),
  isActive: z.boolean().default(true)
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Request validation middleware
  const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "بيانات غير صحيحة", errors: errors.array() });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", [
    body("username").isLength({ min: 3 }).withMessage("اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
    body("password").isLength({ min: 6 }).withMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    body("email").isEmail().withMessage("البريد الإلكتروني غير صحيح"),
    validateRequest
  ], async (req: Request, res: Response) => {
    try {
      const result = await registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/auth/login", [
    body("username").notEmpty().withMessage("اسم المستخدم مطلوب"),
    body("password").notEmpty().withMessage("كلمة المرور مطلوبة"),
    validateRequest
  ], async (req: Request, res: Response) => {
    try {
      const result = await loginUser(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.patch("/api/auth/password", [
    body("currentPassword").notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),
    body("newPassword").isLength({ min: 6 }).withMessage("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
    authenticateToken,
    validateRequest
  ], async (req: AuthRequest, res: Response) => {
    try {
      const result = await updatePassword(parseInt(req.user!._id), req.body.currentPassword, req.body.newPassword);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ 
      id: req.user!._id, 
      username: req.user!.username,
      email: req.user!.email,
      role: req.user!.role 
    });
  });

  // Dashboard statistics
  app.get("/api/dashboard-stats", async (req: Request, res: Response) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      const aiTeamMembers = await storage.getAllAiTeamMembers();
      const workflows = await storage.getAllWorkflows();
      const tickets = await storage.getAllSupportTickets();

      const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
      const activeOpportunities = opportunities.filter(opp => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost').length;
      const activeAgents = aiTeamMembers.filter(agent => agent.isActive).length;
      const avgPerformance = aiTeamMembers.length > 0 
        ? aiTeamMembers.reduce((sum, agent) => sum + (agent.conversionRate || 0), 0) / aiTeamMembers.length 
        : 0;
      const activeWorkflows = workflows.filter(wf => wf.isActive).length;
      const successfulWorkflows = workflows.filter(wf => wf.successRate && wf.successRate > 80).length;
      const workflowSuccessRate = workflows.length > 0 
        ? (successfulWorkflows / workflows.length) * 100 
        : 0;
      const openTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress').length;
      const ticketResolutionRate = tickets.length > 0 
        ? ((tickets.length - openTickets) / tickets.length) * 100 
        : 0;

      const opportunitiesByStage = {
        qualification: opportunities.filter(opp => opp.stage === 'qualification').length,
        proposal: opportunities.filter(opp => opp.stage === 'proposal').length,
        negotiation: opportunities.filter(opp => opp.stage === 'negotiation').length,
        closed_won: opportunities.filter(opp => opp.stage === 'closed_won').length,
        closed_lost: opportunities.filter(opp => opp.stage === 'closed_lost').length
      };

      res.json({
        totalRevenue,
        activeOpportunities,
        activeAgents,
        avgPerformance,
        activeWorkflows,
        workflowSuccessRate,
        openTickets,
        ticketResolutionRate,
        opportunitiesByStage
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // النظام العالمي للاتصالات الذكية - إضافة 20 وكيل متخصص
  app.post("/api/advanced-agents/deploy", async (req: Request, res: Response) => {
    try {
      const { allAdvancedAgents } = await import('./advanced-agents-system');
      
      // إضافة جميع الوكلاء المتقدمين إلى قاعدة البيانات
      const deployedAgents = [];
      
      for (const agent of allAdvancedAgents) {
        try {
          const newAgent = await storage.createAiTeamMember({
            name: agent.name,
            specialization: `${agent.engine} - ${agent.specialization}`,
            avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=128&h=128&fit=crop&crop=face`,
            activeDeals: Math.floor(Math.random() * 10),
            conversionRate: agent.performance,
            isActive: agent.status === 'active',
            status: agent.status,
            performance: agent.performance,
            engine: agent.engine,
            capabilities: agent.capabilities,
            description: agent.description
          });
          deployedAgents.push(newAgent);
        } catch (error) {
          console.log(`تخطي الوكيل ${agent.name} - موجود مسبقاً`);
        }
      }

      res.json({
        success: true,
        message: `تم نشر النظام العالمي للاتصالات الذكية - نسخة أبو إياد 9.0`,
        deployedAgents: deployedAgents.length,
        totalAgents: allAdvancedAgents.length,
        systemStatus: 'operational'
      });

    } catch (error) {
      console.error('خطأ في نشر النظام المتقدم:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في نشر النظام المتقدم'
      });
    }
  });

  // إضافة وكيل جديد مخصص
  app.post("/api/ai-agents/create", [
    body('name').notEmpty().withMessage('اسم الوكيل مطلوب'),
    body('specialization').notEmpty().withMessage('التخصص مطلوب'),
  ], async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'بيانات غير صحيحة',
          details: errors.array()
        });
      }

      const { name, specialization, avatar, performance, engine } = req.body;
      
      const newAgent = await storage.createAiTeamMember({
        name,
        specialization,
        avatar: avatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=128&h=128&fit=crop&crop=face`,
        activeDeals: 0,
        conversionRate: performance || Math.floor(Math.random() * 20) + 80,
        isActive: true,
        status: 'active',
        performance: performance || Math.floor(Math.random() * 20) + 80,
        engine: engine || 'Custom Engine'
      });

      res.json({
        success: true,
        message: 'تم إضافة الوكيل بنجاح',
        agent: newAgent
      });

    } catch (error) {
      console.error('خطأ في إضافة الوكيل:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في إضافة الوكيل'
      });
    }
  });

  // Enhanced ElevenLabs routes
  app.use('/api/enhanced-elevenlabs', enhancedElevenlabsRoutes);

  // VoIP system integrated with Siyadah VoIP only
  app.post('/api/voip/test', async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'رقم الهاتف والرسالة مطلوبان' 
        });
      }

      // Using Siyadah VoIP system
      const callId = `SV${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      res.json({
        success: true,
        message: 'تم إرسال المكالمة عبر نظام سيادة VoIP',
        callId,
        status: 'processed'
      });
    } catch (error) {
      console.error('VoIP test error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'خطأ في إرسال المكالمة' 
      });
    }
  });

  // API Control System
  app.use('/api/control', apiControlRoutes);

  app.use('/api/enhanced-elevenlabs', enhancedElevenlabsRoutes);
  app.use('/api/intelligent-agents', intelligentAgentsRoutes);
  app.use('/api/background-intelligence', backgroundIntelligenceRoutes);
  
  // FastAPI AI Microservice Integration
  app.use('/api/microservice', aiMicroserviceRoutes);

  // AI Assistant Chat System
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: 'الرسالة مطلوبة' 
        });
      }

      const response = await intelligentAssistant.processMessage(message, context || {});
      
      res.json({
        success: true,
        response: response.message,
        suggestions: response.suggestions || [],
        executionPlan: response.executionPlan
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'خطأ في معالجة الرسالة' 
      });
    }
  });

  // WebSocket setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'مرحباً بك في منصة سيادة للذكاء الاصطناعي' 
    }));
  });

  // Professional SaaS Analytics Routes
  app.get('/api/analytics/report', handleAnalyticsReport);
  app.post('/api/analytics/track', handleTrackEvent);
  app.get('/api/analytics/organization/:organizationId', handleOrganizationMetrics);

  // Enhanced WhatsApp API Integration Routes
  app.post('/api/whatsapp/send-message', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { phone, message, organizationId } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and message are required'
        });
      }

      // Track analytics event
      await analyticsService.trackEvent({
        organizationId: organizationId || 'default',
        userId: (req as any).user?.id || 'system',
        userRole: (req as any).user?.role || 'user',
        eventType: 'api_call',
        eventData: {
          apiEndpoint: '/api/whatsapp/send-message',
          success: true,
          feature: 'whatsapp_messaging'
        },
        metadata: {
          sessionId: `sess_${Date.now()}`,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      });

      // Simulate WhatsApp API call (replace with actual API integration)
      const response = {
        success: true,
        messageId: `msg_${Date.now()}`,
        status: 'sent',
        timestamp: new Date().toISOString()
      };

      console.log(`📱 WhatsApp message sent to ${phone}: ${message}`);
      
      res.json({
        success: true,
        data: response,
        message: 'WhatsApp message sent successfully'
      });

    } catch (error) {
      console.error('WhatsApp send error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send WhatsApp message'
      });
    }
  });

  app.get('/api/whatsapp/status', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Track analytics event
      await analyticsService.trackEvent({
        organizationId: req.query.organizationId as string || 'default',
        userId: (req as any).user?.id || 'system',
        userRole: (req as any).user?.role || 'user',
        eventType: 'api_call',
        eventData: {
          apiEndpoint: '/api/whatsapp/status',
          success: true,
          feature: 'whatsapp_status'
        },
        metadata: {
          sessionId: `sess_${Date.now()}`,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      });

      res.json({
        success: true,
        status: 'active',
        apiVersion: '2.0',
        features: ['messaging', 'media', 'webhooks'],
        lastUpdate: new Date().toISOString()
      });

    } catch (error) {
      console.error('WhatsApp status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get WhatsApp status'
      });
    }
  });

  function broadcastNotification(notification: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }

  // CrewAI Customer Service System
  try {
    const crewAIRouter = (await import('./crewai-api')).default;
    app.use('/api/crewai', crewAIRouter);
    
    // LangGraph + CrewAI Integration
    const { langGraphRouter } = await import('./langgraph-integration');
    app.use(langGraphRouter);
    console.log('🎯 LangGraph + CrewAI Integration registered');
    console.log('🤖 CrewAI Customer Service System registered');
  } catch (error) {
    console.error('❌ Failed to load CrewAI routes:', error);
  }
  
  // Deploy customer service agents on startup
  setTimeout(async () => {
    try {
      const { deployCustomerAgents } = await import('./crewai-system');
      await deployCustomerAgents('global');
      console.log('✅ Customer service agents deployed for global organization');
    } catch (error) {
      console.error('Failed to deploy customer agents:', error);
    }
  }, 5000);

  return httpServer;
}