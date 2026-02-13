
import express from 'express';
import { backgroundIntelligence } from '../background-intelligence';

const router = express.Router();

// الحصول على صحة النظام
router.get('/system-health', (req, res) => {
  try {
    const health = backgroundIntelligence.getSystemHealth();
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في الحصول على صحة النظام'
    });
  }
});

// الحصول على آخر الرؤى
router.get('/insights', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const insights = backgroundIntelligence.getLatestInsights(limit);
    
    res.json({
      success: true,
      insights,
      count: insights.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في الحصول على الرؤى'
    });
  }
});

// حالة المهام الخلفية
router.get('/background-tasks', (req, res) => {
  try {
    const tasks = backgroundIntelligence.getBackgroundTasksStatus();
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في الحصول على حالة المهام'
    });
  }
});

// بدء الخدمة
router.post('/start', (req, res) => {
  try {
    backgroundIntelligence.start();
    res.json({
      success: true,
      message: 'تم بدء خدمة الذكاء الخلفي بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في بدء الخدمة'
    });
  }
});

// إيقاف الخدمة
router.post('/stop', (req, res) => {
  try {
    backgroundIntelligence.stop();
    res.json({
      success: true,
      message: 'تم إيقاف خدمة الذكاء الخلفي'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في إيقاف الخدمة'
    });
  }
});

export default router;
