import express from 'express';
import { ApiAbstraction } from '../api-abstraction';

const router = express.Router();

// تحويل النظام لوضع التطوير
router.post('/development-mode', (req, res) => {
  ApiAbstraction.enableDevelopmentMode();
  res.json({ 
    success: true, 
    message: 'تم تفعيل وضع التطوير - المكالمات ستكون محاكاة',
    status: ApiAbstraction.getStatus()
  });
});

// تحويل النظام لوضع الإنتاج
router.post('/production-mode', (req, res) => {
  ApiAbstraction.enableProductionMode();
  res.json({ 
    success: true, 
    message: 'تم تفعيل وضع الإنتاج - مكالمات حقيقية',
    status: ApiAbstraction.getStatus()
  });
});

// تجربة API حقيقي في التطوير
router.post('/test-real-api', (req, res) => {
  ApiAbstraction.enableRealApiInDevelopment();
  res.json({ 
    success: true, 
    message: 'تم تفعيل اختبار API حقيقي في التطوير',
    status: ApiAbstraction.getStatus()
  });
});

// حالة النظام الحالية
router.get('/status', (req, res) => {
  res.json({
    success: true,
    ...ApiAbstraction.getStatus()
  });
});

// اختبار مكالمة سريع
router.post('/test-call', async (req, res) => {
  const { to, message } = req.body;
  
  if (!to) {
    return res.status(400).json({ 
      success: false, 
      error: 'Phone number required' 
    });
  }

  try {
    const result = await ApiAbstraction.executeCall(
      to, 
      message || 'اختبار من نظام فصل API'
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;