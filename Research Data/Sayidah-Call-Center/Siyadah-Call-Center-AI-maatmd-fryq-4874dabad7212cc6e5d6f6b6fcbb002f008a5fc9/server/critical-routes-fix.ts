import type { Express } from "express";

// Critical Routes Fix - Force API routes before Vite middleware
export function setupCriticalRoutes(app: Express) {
  console.log('🔧 Setting up critical API routes...');

  // Force JSON responses for all critical API routes
  const setJsonHeaders = (req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  };

  // Opportunities API - Force proper JSON response
  app.get('/api/opportunities', setJsonHeaders, async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const opportunities = await storage.getAllOpportunities();
      
      const responseData = {
        success: true,
        opportunities: opportunities.map(opp => ({
          id: opp._id,
          name: opp.name,
          value: opp.value,
          stage: opp.stage,
          probability: opp.probability,
          assignedAgent: opp.assignedAgent,
          source: opp.source,
          contactPerson: opp.contactPerson,
          phone: opp.phone,
          email: opp.email,
          lastActivity: opp.lastActivity || 'لا توجد أنشطة حديثة',
          nextFollowUp: opp.nextFollowUp,
          notes: opp.notes || ''
        })),
        total: opportunities.length,
        totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
        timestamp: new Date().toISOString()
      };

      return res.json(responseData);
    } catch (error) {
      console.error('Opportunities API error:', error);
      return res.status(500).json({
        success: false,
        error: 'فشل في تحميل الفرص',
        opportunities: [],
        total: 0,
        totalValue: 0
      });
    }
  });

  // Workflows API - Force proper JSON response
  app.get('/api/workflows', setJsonHeaders, async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const workflows = await storage.getAllWorkflows();
      
      const responseData = {
        success: true,
        workflows: workflows.map(workflow => ({
          id: workflow._id,
          name: workflow.name,
          description: workflow.description || '',
          status: workflow.status,
          isActive: true,
          trigger: 'manual',
          actions: [],
          successRate: workflow.successRate || 0,
          executionsToday: 0,
          createdAt: workflow.createdAt,
          lastExecution: workflow.lastRun
        })),
        total: workflows.length,
        activeCount: workflows.length,
        timestamp: new Date().toISOString()
      };

      return res.json(responseData);
    } catch (error) {
      console.error('Workflows API error:', error);
      return res.status(500).json({
        success: false,
        error: 'فشل في تحميل سير العمل',
        workflows: [],
        total: 0,
        activeCount: 0
      });
    }
  });

  // Support Tickets API - Force proper JSON response
  app.get('/api/support-tickets', setJsonHeaders, async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const tickets = await storage.getAllSupportTickets();
      
      const responseData = {
        success: true,
        tickets: tickets.map(ticket => ({
          id: ticket._id,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          customerName: ticket.customerName,
          customerEmail: ticket.customerEmail,
          assignedAgent: ticket.assignedTo || 'غير محدد',
          createdAt: ticket.createdAt,
          updatedAt: ticket.createdAt,
          responseTime: ticket.responseTime
        })),
        total: tickets.length,
        openCount: tickets.filter(t => t.status === 'open').length,
        timestamp: new Date().toISOString()
      };

      return res.json(responseData);
    } catch (error) {
      console.error('Support tickets API error:', error);
      return res.status(500).json({
        success: false,
        error: 'فشل في تحميل التذاكر',
        tickets: [],
        total: 0,
        openCount: 0
      });
    }
  });

  // Users API - Force proper JSON response
  app.get('/api/users', setJsonHeaders, async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const users = await storage.getAllUsers();
      
      const responseData = {
        success: true,
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.createdAt,
          createdAt: user.createdAt
        })),
        total: users.length,
        activeCount: users.filter(u => u.isActive).length,
        timestamp: new Date().toISOString()
      };

      return res.json(responseData);
    } catch (error) {
      console.error('Users API error:', error);
      return res.status(500).json({
        success: false,
        error: 'فشل في تحميل المستخدمين',
        users: [],
        total: 0,
        activeCount: 0
      });
    }
  });

  console.log('✅ Critical API routes registered successfully');
}