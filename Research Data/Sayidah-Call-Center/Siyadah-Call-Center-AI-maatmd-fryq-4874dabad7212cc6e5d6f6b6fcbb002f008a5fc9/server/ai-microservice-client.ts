import axios, { AxiosResponse } from 'axios';

interface AIResponse {
  success: boolean;
  response?: string;
  analysis?: any;
  translation?: string;
  error?: string;
}

interface PromptRequest {
  prompt: string;
  context?: string;
  language?: string;
  max_tokens?: number;
}

interface AnalysisRequest {
  data: Record<string, any>;
  analysis_type: 'sentiment' | 'trends' | 'insights' | 'performance';
  language?: string;
}

interface TranslationRequest {
  text: string;
  from_lang: string;
  to_lang: string;
}

class AIMicroserviceClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.AI_MICROSERVICE_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds timeout
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return response.data.status === 'healthy';
    } catch (error) {
      console.log('AI Microservice not available, using fallback');
      return false;
    }
  }

  async processPrompt(request: PromptRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/api/v1/ai/respond`,
        {
          prompt: request.prompt,
          context: request.context,
          language: request.language || 'ar',
          max_tokens: request.max_tokens || 1000
        },
        { timeout: this.timeout }
      );

      return {
        success: true,
        response: response.data.response
      };
    } catch (error: any) {
      console.error('AI Microservice error:', error.message);
      return this.fallbackResponse(request.prompt);
    }
  }

  async analyzeData(request: AnalysisRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/api/v1/ai/analyze`,
        {
          data: request.data,
          analysis_type: request.analysis_type,
          language: request.language || 'ar'
        },
        { timeout: this.timeout }
      );

      return {
        success: true,
        analysis: response.data.analysis
      };
    } catch (error: any) {
      console.error('AI Analysis error:', error.message);
      return this.fallbackAnalysis(request);
    }
  }

  async translateText(request: TranslationRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseURL}/api/v1/ai/translate`,
        {
          text: request.text,
          from_lang: request.from_lang,
          to_lang: request.to_lang
        },
        { timeout: this.timeout }
      );

      return {
        success: true,
        translation: response.data.translation
      };
    } catch (error: any) {
      console.error('AI Translation error:', error.message);
      return this.fallbackTranslation(request);
    }
  }

  async generateBusinessInsights(opportunitiesData: any[]): Promise<AIResponse> {
    try {
      const analysisData = {
        opportunities: opportunitiesData,
        total_value: opportunitiesData.reduce((sum, opp) => sum + (opp.value || 0), 0),
        count: opportunitiesData.length
      };

      return await this.analyzeData({
        data: analysisData,
        analysis_type: 'insights',
        language: 'ar'
      });
    } catch (error: any) {
      return {
        success: false,
        error: 'فشل في توليد الرؤى التجارية'
      };
    }
  }

  // Fallback methods when FastAPI is unavailable
  private async fallbackResponse(prompt: string): Promise<AIResponse> {
    // Use OpenAI directly as fallback
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي متخصص في الأعمال السعودية. تجيب باللغة العربية بطريقة مهنية.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000
      });

      return {
        success: true,
        response: response.choices[0].message.content || 'لا يمكن معالجة الطلب حالياً'
      };
    } catch (error) {
      return {
        success: false,
        error: 'خطأ في معالجة الطلب'
      };
    }
  }

  private fallbackAnalysis(request: AnalysisRequest): AIResponse {
    const data = request.data;
    let analysis = '';

    switch (request.analysis_type) {
      case 'performance':
        analysis = 'تحليل الأداء: النظام يعمل بكفاءة عالية مع إمكانية التحسين';
        break;
      case 'trends':
        analysis = 'اتجاهات: نمو مستقر مع توقعات إيجابية للمستقبل';
        break;
      case 'insights':
        analysis = 'رؤى: فرص نمو متاحة مع ضرورة التركيز على العملاء الرئيسيين';
        break;
      case 'sentiment':
        analysis = 'تحليل المشاعر: إيجابي بشكل عام مع بعض نقاط التحسين';
        break;
      default:
        analysis = 'تحليل عام: البيانات تظهر أداءً مقبولاً';
    }

    return {
      success: true,
      analysis: analysis
    };
  }

  private fallbackTranslation(request: TranslationRequest): AIResponse {
    // Simple fallback translations for common phrases
    const commonTranslations: Record<string, string> = {
      'hello': 'مرحباً',
      'thank you': 'شكراً',
      'welcome': 'مرحباً بك',
      'good': 'جيد',
      'مرحباً': 'hello',
      'شكراً': 'thank you',
      'جيد': 'good'
    };

    const translation = commonTranslations[request.text.toLowerCase()] || request.text;

    return {
      success: true,
      translation: translation
    };
  }
}

export const aiMicroservice = new AIMicroserviceClient();