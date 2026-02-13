import { Router } from 'express';
import { MongoClient } from 'mongodb';

const router = Router();

// جلب جميع الوكلاء الذكيين
router.get('/ai-agents', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('business_automation');
    const agents = await db.collection('ai_team_members').find({}).toArray();
    
    await client.close();
    
    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent._id.toString(),
        name: agent.name,
        role: agent.role,
        performance: agent.performance,
        status: agent.status,
        specializations: agent.specializations || [],
        tasksCompleted: agent.tasksCompleted || 0,
        successRate: agent.successRate || 0,
        responseTime: agent.responseTime || '0 دقيقة',
        currentTasks: agent.currentTasks || [],
        lastActivity: agent.lastActivity || 'غير محدد',
        monthlyRevenue: agent.monthlyRevenue || 0,
        efficiency: agent.efficiency || 0
      }))
    });
  } catch (error) {
    console.error('خطأ في جلب الوكلاء:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب بيانات الوكلاء'
    });
  }
});

// تحديث أداء وكيل
router.patch('/ai-agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('business_automation');
    const result = await db.collection('ai_team_members').updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'الوكيل غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث بيانات الوكيل'
    });
  } catch (error) {
    console.error('خطأ في تحديث الوكيل:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في تحديث بيانات الوكيل'
    });
  }
});

// إحصائيات الوكلاء
router.get('/ai-agents/stats', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('business_automation');
    const agents = await db.collection('ai_team_members').find({}).toArray();
    
    await client.close();
    
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'نشط').length,
      averagePerformance: agents.reduce((sum, a) => sum + (a.performance || 0), 0) / agents.length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0),
      totalRevenue: agents.reduce((sum, a) => sum + (a.monthlyRevenue || 0), 0)
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الوكلاء:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الإحصائيات'
    });
  }
});

export default router;