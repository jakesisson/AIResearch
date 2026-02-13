// ملف التكوين الآمن - جميع APIs والخدمات الخارجية معزولة هنا
import crypto from 'crypto';

export interface SecureConfig {
  siyadahVoIP: {
    apiKey: string;
    baseUrl: string;
    phoneNumber: string;
    webhookUrl: string;
  };
  customWhatsApp: {
    sessionName: string;
    apiKey: string;
    serverUrl: string;
    webhookUrl: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  elevenlabs: {
    apiKey: string;
    voiceId: string;
  };
  mongodb: {
    uri: string;
    database: string;
    username: string;
    password: string;
  };
  security: {
    jwtSecret: string;
    encryption: {
      algorithm: string;
      key: string;
    };
  };
}

// التكوين الآمن الافتراضي
const SECURE_CONFIG: SecureConfig = {
  siyadahVoIP: {
    apiKey: process.env.SIYADAH_VOIP_API_KEY || 'siyadah_voip_api_key_2025_v1',
    baseUrl: process.env.SIYADAH_VOIP_BASE_URL || 'https://voip.siyadah.ai',
    phoneNumber: process.env.SIYADAH_VOIP_PHONE || '+966500000000',
    webhookUrl: process.env.SIYADAH_VOIP_WEBHOOK || '/webhook/siyadah-voice'
  },
  customWhatsApp: {
    sessionName: process.env.CUSTOM_WHATSAPP_SESSION || 'siyadah_session',
    apiKey: process.env.CUSTOM_WHATSAPP_API_KEY || '',
    serverUrl: process.env.CUSTOM_WHATSAPP_SERVER_URL || '',
    webhookUrl: process.env.CUSTOM_WHATSAPP_WEBHOOK_URL || '/webhook/custom-whatsapp'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o' // الموديل الأحدث
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: '21m00Tcm4TlvDq8ikWAM' // الصوت العربي الافتراضي
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://siyada:JppPfSY7nhwOL6R6@cluster0.zabls2k.mongodb.net/business_automation?retryWrites=true&w=majority&appName=Cluster0',
    database: 'business_automation',
    username: 'siyada',
    password: process.env.MONGODB_PASSWORD || 'JppPfSY7nhwOL6R6'
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    encryption: {
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
    }
  }
};

// وظائف التشفير والفك
class SecureStorage {
  private static algorithm = 'aes-256-gcm';
  private static key = Buffer.from(SECURE_CONFIG.security.encryption.key, 'hex');

  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.warn('تحذير: فشل تشفير البيانات، استخدام النص العادي');
      return text;
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) return encryptedText;
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.warn('تحذير: فشل فك تشفير البيانات، استخدام النص العادي');
      return encryptedText;
    }
  }
}

// وظائف الوصول الآمنة
export class ConfigManager {
  // الحصول على تكوين Custom WhatsApp
  static getCustomWhatsAppConfig() {
    return {
      sessionName: SECURE_CONFIG.customWhatsApp.sessionName,
      apiKey: SECURE_CONFIG.customWhatsApp.apiKey,
      serverUrl: SECURE_CONFIG.customWhatsApp.serverUrl,
      webhookUrl: SECURE_CONFIG.customWhatsApp.webhookUrl
    };
  }

  // الحصول على تكوين Siyadah VoIP
  static getSiyadahVoIPConfig() {
    return {
      apiKey: SECURE_CONFIG.siyadahVoIP.apiKey,
      baseUrl: SECURE_CONFIG.siyadahVoIP.baseUrl,
      phoneNumber: SECURE_CONFIG.siyadahVoIP.phoneNumber,
      webhookUrl: SECURE_CONFIG.siyadahVoIP.webhookUrl,
      isConfigured: !!(SECURE_CONFIG.siyadahVoIP.apiKey && SECURE_CONFIG.siyadahVoIP.baseUrl)
    };
  }

  // الحصول على تكوين OpenAI
  static getOpenAIConfig() {
    return {
      apiKey: SECURE_CONFIG.openai.apiKey,
      model: SECURE_CONFIG.openai.model,
      isConfigured: !!SECURE_CONFIG.openai.apiKey
    };
  }

  // الحصول على تكوين ElevenLabs
  static getElevenLabsConfig() {
    return {
      apiKey: SECURE_CONFIG.elevenlabs.apiKey,
      voiceId: SECURE_CONFIG.elevenlabs.voiceId,
      isConfigured: !!SECURE_CONFIG.elevenlabs.apiKey
    };
  }

  // الحصول على تكوين MongoDB
  static getMongoConfig() {
    return {
      uri: SECURE_CONFIG.mongodb.uri,
      database: SECURE_CONFIG.mongodb.database,
      isConfigured: !!SECURE_CONFIG.mongodb.uri
    };
  }

  // الحصول على تكوين الأمان
  static getSecurityConfig() {
    return {
      jwtSecret: SECURE_CONFIG.security.jwtSecret,
      encryptionKey: SECURE_CONFIG.security.encryption.key,
      isConfigured: !!(SECURE_CONFIG.security.jwtSecret && SECURE_CONFIG.security.encryption.key)
    };
  }

  // تحديث التكوين بشكل آمن
  static updateConfig(service: keyof SecureConfig, config: any) {
    try {
      SECURE_CONFIG[service] = { ...SECURE_CONFIG[service], ...config };
      console.log(`✅ تم تحديث تكوين ${service} بنجاح`);
      return true;
    } catch (error) {
      console.error(`❌ فشل في تحديث تكوين ${service}:`, error);
      return false;
    }
  }

  // التحقق من حالة جميع الخدمات
  static getSystemStatus() {
    const siyadahVoIP = this.getSiyadahVoIPConfig();
    const openai = this.getOpenAIConfig();
    const elevenlabs = this.getElevenLabsConfig();
    const mongodb = this.getMongoConfig();
    const security = this.getSecurityConfig();

    return {
      siyadahVoIP: {
        status: siyadahVoIP.isConfigured ? 'متصل' : 'غير مكوّن',
        apiKey: siyadahVoIP.apiKey ? `${siyadahVoIP.apiKey.substring(0, 8)}...` : 'غير موجود'
      },
      openai: {
        status: openai.isConfigured ? 'متصل' : 'غير مكوّن',
        model: openai.model
      },
      elevenlabs: {
        status: elevenlabs.isConfigured ? 'متصل' : 'غير مكوّن',
        voiceId: elevenlabs.voiceId
      },
      mongodb: {
        status: mongodb.isConfigured ? 'متصل' : 'غير مكوّن',
        database: mongodb.database
      },
      security: {
        status: security.isConfigured ? 'آمن' : 'يحتاج إعداد',
        jwtConfigured: !!security.jwtSecret,
        encryptionConfigured: !!security.encryptionKey
      },
      overall: {
        configured: [siyadahVoIP, openai, elevenlabs, mongodb, security].filter(s => s.isConfigured).length,
        total: 5,
        percentage: Math.round(([siyadahVoIP, openai, elevenlabs, mongodb, security].filter(s => s.isConfigured).length / 5) * 100)
      }
    };
  }

  // تنظيف البيانات القديمة
  static cleanupOldConfigs() {
    console.log('🧹 تنظيف التكوينات القديمة...');
    
    // إزالة المتغيرات القديمة من الذاكرة
    const oldVars = [
      'OLD_TWILIO_ACCOUNT_SID',
      'OLD_TWILIO_AUTH_TOKEN',
      'LEGACY_OPENAI_KEY',
      'DEPRECATED_CONFIG'
    ];

    oldVars.forEach(varName => {
      if (process.env[varName]) {
        delete process.env[varName];
        console.log(`🗑️ تم حذف ${varName}`);
      }
    });

    console.log('✅ تم تنظيف التكوينات القديمة');
  }

  // تصدير التكوين للاستخدام
  static exportForService(serviceName: keyof SecureConfig) {
    switch (serviceName) {
      case 'siyadahVoIP':
        return this.getSiyadahVoIPConfig();
      case 'openai':
        return this.getOpenAIConfig();
      case 'elevenlabs':
        return this.getElevenLabsConfig();
      case 'mongodb':
        return this.getMongoConfig();
      case 'security':
        return this.getSecurityConfig();
      default:
        throw new Error(`خدمة غير معروفة: ${serviceName}`);
    }
  }
}

// تصدير التكوين الافتراضي
export default ConfigManager;
export { SecureStorage };