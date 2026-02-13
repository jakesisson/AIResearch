import { Router } from 'express';
import { multiAgentSystem } from '../multilingual-agents-system';

const router = Router();

// Process message through multi-agent system
router.post('/process', async (req, res) => {
  try {
    const { 
      message, 
      sessionId = `session_${Date.now()}`, 
      userId = 'user_1', 
      userRole = 'viewer',
      businessType = 'general' 
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }
    
    console.log(`🤖 Multi-Agent Processing: "${message}" (${userRole})`);
    
    const result = await multiAgentSystem.processMessage(
      sessionId,
      userId, 
      userRole,
      message,
      businessType
    );
    
    res.json({
      success: true,
      sessionId,
      result
    });
    
  } catch (error) {
    console.error('Multi-agent processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Processing failed',
      message: 'خطأ في معالجة الرسالة'
    });
  }
});

// Get session history
router.get('/session/:sessionId/history', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = multiAgentSystem.getSessionHistory(sessionId);
    
    res.json({
      success: true,
      sessionId,
      history
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get history'
    });
  }
});

// Clear session
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    multiAgentSystem.clearSession(sessionId);
    
    res.json({
      success: true,
      message: 'Session cleared'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear session'
    });
  }
});

// Get system information
router.get('/info', (req, res) => {
  try {
    const stats = multiAgentSystem.getSystemStats();
    const agents = multiAgentSystem.getActiveAgents();
    
    res.json({
      success: true,
      system: 'Siyadah AI Multi-Agent System',
      version: '1.0.0',
      agents,
      stats,
      capabilities: [
        'Multilingual support (100+ languages)',
        'Intent detection and routing',
        'Task generation and execution',
        'Offer and proposal generation',
        'Call management and scheduling',
        'Customer service automation',
        'Memory and context management',
        'Role-based security'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system info'
    });
  }
});

// Test endpoint for quick validation
router.post('/test', async (req, res) => {
  try {
    const testCases = [
      { message: 'مرحباً، أريد معرفة الأسعار', language: 'ar', expectedIntent: 'sales_inquiry' },
      { message: 'Hello, I need a quote for my restaurant', language: 'en', expectedIntent: 'offer_request' },
      { message: 'أريد حجز موعد', language: 'ar', expectedIntent: 'scheduling' },
      { message: 'اتصل على +966501234567', language: 'ar', expectedIntent: 'telemarketing' }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      const result = await multiAgentSystem.processMessage(
        `test_${Date.now()}`,
        'test_user',
        'admin',
        testCase.message
      );
      
      results.push({
        input: testCase.message,
        expectedLanguage: testCase.language,
        expectedIntent: testCase.expectedIntent,
        result: result
      });
    }
    
    res.json({
      success: true,
      message: 'Multi-agent system test completed',
      testResults: results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

export default router;