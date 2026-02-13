// نظام فصل API للتطوير والإنتاج
export interface ApiEnvironment {
  isDevelopment: boolean;
  useRealApi: boolean;
}

export interface CallResult {
  success: boolean;
  callId: string;
  status: string;
  message?: string;
  error?: string;
}

export class ApiAbstraction {
  private static environment: ApiEnvironment = {
    isDevelopment: false,
    useRealApi: true
  };

  // تحديد نمط العمل
  static setEnvironment(env: Partial<ApiEnvironment>) {
    this.environment = { ...this.environment, ...env };
  }

  // محاكاة ناجحة للمكالمات في فترة التطوير
  static async simulateCall(to: string, message: string): Promise<CallResult> {
    const callId = `DEV_CALL_${Date.now()}`;
    
    console.log('🔧 Development Mode Call Simulation');
    console.log('📞 Target:', to);
    console.log('💬 Message:', message);
    console.log('✅ Call ID:', callId);
    
    // محاكاة وقت المعالجة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      callId: callId,
      status: 'simulated',
      message: 'مكالمة محاكاة ناجحة - وضع التطوير'
    };
  }

  // مكالمة حقيقية للإنتاج باستخدام Siyadah VoIP
  static async realCall(to: string, message: string): Promise<CallResult> {
    const { ConfigManager } = await import('./secure-config');
    const siyadahConfig = ConfigManager.getSiyadahVoIPConfig();
    const { apiKey, baseUrl } = siyadahConfig;

    if (!apiKey || !baseUrl) {
      return {
        success: false,
        callId: '',
        status: 'error',
        error: 'Siyadah VoIP credentials missing'
      };
    }

    try {
      const url = `${baseUrl}/api/voice/call`;
      
      const payload = {
        to: to,
        message: message,
        apiKey: apiKey
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          callId: data.callId || 'SIYADAH_' + Date.now(),
          status: data.status || 'completed',
          message: 'مكالمة حقيقية تم تنفيذها عبر Siyadah VoIP'
        };
      } else {
        return {
          success: false,
          callId: '',
          status: 'error',
          error: 'Siyadah VoIP API error'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        callId: '',
        status: 'error',
        error: error.message
      };
    }
  }

  // الدالة الرئيسية التي تقرر نوع المكالمة
  static async executeCall(to: string, message: string): Promise<CallResult> {
    console.log('🎯 API Abstraction Layer');
    console.log('Environment:', this.environment);

    // في وضع التطوير، استخدم المحاكاة
    if (this.environment.isDevelopment && !this.environment.useRealApi) {
      return this.simulateCall(to, message);
    }

    // في الإنتاج أو عند تفعيل Real API، استخدم المكالمات الحقيقية
    return this.realCall(to, message);
  }

  // تبديل الأوضاع بسهولة
  static enableDevelopmentMode() {
    this.setEnvironment({ isDevelopment: true, useRealApi: false });
    console.log('🔧 Switched to Development Mode - API calls will be simulated');
  }

  static enableProductionMode() {
    this.setEnvironment({ isDevelopment: false, useRealApi: true });
    console.log('🚀 Switched to Production Mode - Real API calls enabled');
  }

  static enableRealApiInDevelopment() {
    this.setEnvironment({ isDevelopment: true, useRealApi: true });
    console.log('🧪 Development with Real API - Testing mode enabled');
  }

  // حالة النظام
  static getStatus() {
    return {
      environment: this.environment,
      mode: this.environment.isDevelopment 
        ? (this.environment.useRealApi ? 'Development + Real API' : 'Development Simulation')
        : 'Production'
    };
  }
}