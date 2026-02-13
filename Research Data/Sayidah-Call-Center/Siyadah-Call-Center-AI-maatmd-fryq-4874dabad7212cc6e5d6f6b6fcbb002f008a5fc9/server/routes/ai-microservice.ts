import express, { Request, Response } from 'express';
import { aiMicroservice } from '../ai-microservice-client';

const router = express.Router();

// AI Prompt Processing
router.post('/ai/process', async (req: Request, res: Response) => {
  try {
    const { prompt, context, language = 'ar', max_tokens = 1000 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'النص مطلوب'
      });
    }

    const result = await aiMicroservice.processPrompt({
      prompt,
      context,
      language,
      max_tokens
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة الطلب'
    });
  }
});

// Business Data Analysis
router.post('/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { data, analysis_type, language = 'ar' } = req.body;

    if (!data || !analysis_type) {
      return res.status(400).json({
        success: false,
        error: 'البيانات ونوع التحليل مطلوبان'
      });
    }

    const validTypes = ['sentiment', 'trends', 'insights', 'performance'];
    if (!validTypes.includes(analysis_type)) {
      return res.status(400).json({
        success: false,
        error: 'نوع التحليل غير صحيح'
      });
    }

    const result = await aiMicroservice.analyzeData({
      data,
      analysis_type,
      language
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في تحليل البيانات'
    });
  }
});

// Text Translation
router.post('/ai/translate', async (req: Request, res: Response) => {
  try {
    const { text, from_lang = 'ar', to_lang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'النص مطلوب للترجمة'
      });
    }

    const result = await aiMicroservice.translateText({
      text,
      from_lang,
      to_lang
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في الترجمة'
    });
  }
});

// Business Insights from Opportunities
router.post('/ai/business-insights', async (req: Request, res: Response) => {
  try {
    const { opportunities } = req.body;

    if (!opportunities || !Array.isArray(opportunities)) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الفرص مطلوبة كمصفوفة'
      });
    }

    const result = await aiMicroservice.generateBusinessInsights(opportunities);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في توليد الرؤى التجارية'
    });
  }
});

// AI Service Health Check
router.get('/ai/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await aiMicroservice.isHealthy();
    
    res.json({
      success: true,
      ai_service_status: isHealthy ? 'متاح' : 'غير متاح',
      fallback_enabled: !isHealthy,
      message: isHealthy ? 'خدمة الذكاء الاصطناعي تعمل بشكل طبيعي' : 'يتم استخدام النظام البديل'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في فحص حالة الخدمة'
    });
  }
});

// Enhanced Chat Processing with AI Microservice
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, user_id } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'الرسالة مطلوبة'
      });
    }

    // Add business context for better responses
    const businessContext = `
    منصة سيادة AI للأعمال السعودية
    - خدمات الذكاء الاصطناعي
    - إدارة الفرص التجارية
    - أتمتة سير العمل
    - تحليلات الأعمال
    ${context || ''}
    `;

    const result = await aiMicroservice.processPrompt({
      prompt: message,
      context: businessContext,
      language: 'ar',
      max_tokens: 1500
    });

    // Log conversation for learning (if enabled)
    console.log(`AI Chat - User: ${user_id || 'anonymous'}, Query: ${message.substring(0, 50)}...`);

    res.json({
      success: result.success,
      response: result.response,
      service: result.success ? 'fastapi-microservice' : 'fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة المحادثة'
    });
  }
});

export default router;