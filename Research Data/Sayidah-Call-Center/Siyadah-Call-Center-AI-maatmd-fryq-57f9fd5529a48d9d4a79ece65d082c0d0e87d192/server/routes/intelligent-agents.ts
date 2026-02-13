
import express from 'express';
import { intelligentAgentSystem } from '../intelligent-agents-system';

const router = express.Router();

// الحصول على حالة النظام الذكي
router.get('/system-status', (req, res) => {
  try {
    const status = intelligentAgentSystem.getSystemStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في الحصول على حالة النظام'
    });
  }
});

// إضافة مهمة ذكية
router.post('/add-task', async (req, res) => {
  try {
    const { type, priority = 5, context, requiredSkills = [] } = req.body;
    
    if (!type || !context) {
      return res.status(400).json({
        success: false,
        error: 'نوع المهمة والسياق مطلوبان'
      });
    }

    const taskId = await intelligentAgentSystem.addIntelligentTask({
      type,
      priority,
      context,
      requiredSkills,
      status: 'pending'
    });

    res.json({
      success: true,
      taskId,
      message: 'تم إضافة المهمة للنظام الذكي بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في إضافة المهمة'
    });
  }
});

// استفسار ذكي
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'الاستفسار مطلوب'
      });
    }

    const result = await intelligentAgentSystem.querySystemIntelligence(query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في معالجة الاستفسار'
    });
  }
});

// تحليل عميل ذكي
router.post('/analyze-customer', async (req, res) => {
  try {
    const { customerId, analysisType = 'comprehensive' } = req.body;
    
    const taskId = await intelligentAgentSystem.addIntelligentTask({
      type: 'customer_analysis',
      priority: 8,
      context: { customerId, analysisType },
      requiredSkills: ['data_analysis', 'customer_psychology'],
      status: 'pending'
    });

    res.json({
      success: true,
      taskId,
      message: 'جاري تحليل العميل بواسطة خبراء الذكاء الاصطناعي...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في تحليل العميل'
    });
  }
});

// تحسين مبيعات ذكي
router.post('/optimize-sales', async (req, res) => {
  try {
    const { opportunityId, stage } = req.body;
    
    const taskId = await intelligentAgentSystem.addIntelligentTask({
      type: 'sales_optimization',
      priority: 9,
      context: { opportunityId, stage },
      requiredSkills: ['sales_optimization', 'business_strategy'],
      status: 'pending'
    });

    res.json({
      success: true,
      taskId,
      message: 'جاري تحسين استراتيجية المبيعات...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في تحسين المبيعات'
    });
  }
});

// تأهيل عملاء محتملين ذكي
router.post('/qualify-lead', async (req, res) => {
  try {
    const { leadId, leadData } = req.body;
    
    const taskId = await intelligentAgentSystem.addIntelligentTask({
      type: 'lead_qualification',
      priority: 7,
      context: { leadId, leadData },
      requiredSkills: ['lead_qualification', 'sales_analysis'],
      status: 'pending'
    });

    res.json({
      success: true,
      taskId,
      message: 'جاري تأهيل العميل المحتمل بواسطة الخبراء الذكيين...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في تأهيل العميل المحتمل'
    });
  }
});

// إدارة حملة ذكية
router.post('/manage-campaign', async (req, res) => {
  try {
    const { campaignType, targetAudience, objectives } = req.body;
    
    const taskId = await intelligentAgentSystem.addIntelligentTask({
      type: 'campaign_management',
      priority: 6,
      context: { campaignType, targetAudience, objectives },
      requiredSkills: ['digital_marketing', 'content_creation'],
      status: 'pending'
    });

    res.json({
      success: true,
      taskId,
      message: 'جاري إنشاء وإدارة الحملة التسويقية الذكية...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في إدارة الحملة'
    });
  }
});

// إحصائيات الأداء المتقدمة
router.get('/performance-analytics', (req, res) => {
  try {
    const status = intelligentAgentSystem.getSystemStatus();
    
    const analytics = {
      overallEfficiency: status.systemEfficiency,
      agentPerformance: status.agents.map(agent => ({
        name: agent.name,
        role: agent.role,
        successRate: agent.performance.successRate,
        tasksCompleted: agent.performance.tasksCompleted,
        learningProgress: agent.performance.learningProgress,
        customerSatisfaction: agent.performance.customerSatisfactionScore
      })),
      systemLoad: {
        activeTasks: status.agents.reduce((sum, agent) => sum + agent.currentTasks, 0),
        queuedTasks: status.queuedTasks,
        knowledgeBase: status.globalKnowledge
      },
      insights: {
        topPerformer: status.agents.reduce((best, current) => 
          current.performance.successRate > best.performance.successRate ? current : best
        ),
        averageResponseTime: status.agents.reduce((sum, agent) => 
          sum + agent.performance.averageResponseTime, 0) / status.agents.length,
        totalLearnings: status.agents.reduce((sum, agent) => 
          sum + agent.memoryInsights.patternsLearned, 0)
      }
    };

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في تحليل الأداء'
    });
  }
});

export default router;
