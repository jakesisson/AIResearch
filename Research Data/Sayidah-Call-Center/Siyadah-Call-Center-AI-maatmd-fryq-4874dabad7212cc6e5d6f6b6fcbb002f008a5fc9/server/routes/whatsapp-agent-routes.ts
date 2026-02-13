import { Router, Request, Response } from 'express';
import { whatsappAgent } from '../whatsapp-agent';
import { storage } from '../storage';

const router = Router();

/**
 * Process WhatsApp command through the intelligent agent
 */
router.post('/process-command', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال نص الطلب'
      });
    }

    console.log('🤖 WhatsApp Agent processing command:', prompt);

    // Get customer data
    const opportunities = await storage.getAllOpportunities();
    
    // Create send message function that uses the existing WhatsApp API
    const sendMessageFunction = async (phone: string, message: string) => {
      try {
        // Make a request to the existing WhatsApp API
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: phone,
            message: message
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to send message');
        }

        console.log(`📱 Message sent successfully to ${phone}`);
        return result;
      } catch (error) {
        console.error(`❌ Failed to send message to ${phone}:`, error);
        throw error;
      }
    };

    // Execute the command using the WhatsApp agent
    const result = await whatsappAgent.executeCommand(prompt, opportunities, sendMessageFunction);

    // Return the result
    res.json({
      success: result.success,
      message: result.message,
      executedActions: result.executedActions,
      sentCount: result.sentCount,
      analysis: {
        intent: 'whatsapp_messaging',
        confidence: result.success ? 0.9 : 0.3,
        type: 'whatsapp_command'
      }
    });

  } catch (error) {
    console.error('❌ WhatsApp Agent error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء معالجة طلب الواتساب'
    });
  }
});

/**
 * Get WhatsApp agent status and statistics
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const stats = whatsappAgent.getStats();
    
    res.json({
      success: true,
      agent: {
        name: 'WhatsApp Agent',
        type: 'messaging',
        status: 'active',
        capabilities: [
          'إرسال رسائل ترويجية',
          'إرسال رسائل مخصصة', 
          'إرسال جماعي للعملاء',
          'تحليل الأوامر العربية'
        ],
        stats: stats
      }
    });
  } catch (error) {
    console.error('❌ Error getting WhatsApp agent status:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الحصول على حالة الوكيل'
    });
  }
});

/**
 * Test WhatsApp agent with sample commands
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const testCommands = [
      'أرسل رسالة ترويجية للعميل محمد عكاشة',
      'أرسل رسالة للرقم +21653844063',
      'أرسل رسالة ترويجية لجميع العملاء'
    ];

    const results = [];
    
    for (const command of testCommands) {
      try {
        const analysis = await whatsappAgent.analyzePrompt(command);
        results.push({
          command,
          analysis,
          status: 'analyzed'
        });
      } catch (error) {
        results.push({
          command,
          error: 'فشل في التحليل',
          status: 'failed'
        });
      }
    }

    res.json({
      success: true,
      message: 'تم اختبار الوكيل بنجاح',
      testResults: results
    });

  } catch (error) {
    console.error('❌ Error testing WhatsApp agent:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء اختبار الوكيل'
    });
  }
});

export default router;