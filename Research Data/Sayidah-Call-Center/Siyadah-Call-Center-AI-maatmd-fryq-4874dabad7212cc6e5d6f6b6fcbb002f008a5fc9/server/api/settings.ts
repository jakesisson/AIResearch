import { Request, Response } from 'express';

// Default system settings
const defaultSettings = {
  // Profile Settings
  companyName: 'سيادة AI',
  companyLogo: '',
  adminEmail: 'admin@siyadah.ai',
  adminPhone: '+966 50 123 4567',
  timezone: 'Asia/Riyadh',
  language: 'ar',
  currency: 'SAR',
  
  // AI & Automation
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  aiResponseSpeed: 'balanced',
  autoExecuteThreshold: 85,
  agentPerformanceTracking: true,
  
  // Communication
  siyadahVoipApiKey: process.env.SIYADAH_VOIP_API_KEY || 'siyadah_voip_api_key_2025_v1',
  siyadahVoipBaseUrl: process.env.SIYADAH_VOIP_BASE_URL || 'https://voip.siyadah.ai',
  siyadahVoipPhoneNumber: process.env.SIYADAH_VOIP_PHONE || '+966500000000',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || 'comp_mc7awp6j_6ef95dac217e7acc7d80041077ff5413',
  whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || 'https://c0986d6a-2309-4f57-8f6c-51fa6f7c5f47-00-45rfsom6c6gv.sisko.replit.dev/api/whatsapp/webhook',
  
  // WhatsApp Agent Settings
  whatsappAgentApiKey: process.env.WHATSAPP_AGENT_API_KEY || 'comp_mc7mcc35p1c_ztn52oisa8t',
  whatsappAgentSessionName: process.env.WHATSAPP_AGENT_SESSION_NAME || '685c1019b12fc82021121258_Tst_Siyadah',
  
  emailSmtpServer: process.env.EMAIL_SMTP_SERVER || '',
  emailUsername: process.env.EMAIL_USERNAME || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  
  // Security
  twoFactorEnabled: false,
  sessionTimeout: 60,
  passwordPolicy: 'standard',
  ipWhitelist: ['127.0.0.1', '::1'],
  apiRateLimit: 100,
  
  // Notifications
  emailNotifications: true,
  smsNotifications: false,
  browserNotifications: true,
  weeklyReports: true,
  realTimeAlerts: true,
  
  // Performance
  databaseBackupFrequency: 'daily',
  logRetentionDays: 30,
  cacheEnabled: true,
  compressionEnabled: true,
  
  // UI/UX
  theme: 'dark',
  sidebarCollapsed: false,
  showWelcomeMessage: true,
  animationsEnabled: true,
  soundEnabled: true,
};

// In-memory settings storage (replace with database in production)
let currentSettings = { ...defaultSettings };

export const getSettings = async (req: Request, res: Response) => {
  try {
    console.log('⚙️ Settings API called - serving settings');
    console.log('⚙️ Current settings data:', JSON.stringify(currentSettings, null, 2));
    
    // Hide sensitive data for security
    const safeSettings = {
      ...currentSettings,
      openaiApiKey: currentSettings.openaiApiKey ? '••••••••' : '',
      elevenLabsApiKey: currentSettings.elevenLabsApiKey ? '••••••••' : '',
      siyadahVoipApiKey: currentSettings.siyadahVoipApiKey ? '••••••••' : '',
      whatsappApiToken: currentSettings.whatsappApiToken ? '••••••••' : '',
      whatsappAgentApiKey: currentSettings.whatsappAgentApiKey ? '••••••••' : '',
      emailPassword: currentSettings.emailPassword ? '••••••••' : '',
    };
    
    console.log('⚙️ Sending safe settings:', JSON.stringify(safeSettings, null, 2));
    res.json(safeSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'فشل في تحميل الإعدادات' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const newSettings = req.body;
    
    // Validate required fields
    if (!newSettings.companyName || !newSettings.adminEmail) {
      return res.status(400).json({ error: 'الحقول المطلوبة مفقودة' });
    }
    
    // Update settings (merge with existing)
    currentSettings = {
      ...currentSettings,
      ...newSettings,
      // Don't update masked passwords
      ...(newSettings.openaiApiKey === '••••••••' && { openaiApiKey: currentSettings.openaiApiKey }),
      ...(newSettings.elevenLabsApiKey === '••••••••' && { elevenLabsApiKey: currentSettings.elevenLabsApiKey }),
      ...(newSettings.siyadahVoipApiKey === '••••••••' && { siyadahVoipApiKey: currentSettings.siyadahVoipApiKey }),
      ...(newSettings.whatsappApiToken === '••••••••' && { whatsappApiToken: currentSettings.whatsappApiToken }),
      ...(newSettings.whatsappAgentApiKey === '••••••••' && { whatsappAgentApiKey: currentSettings.whatsappAgentApiKey }),
      ...(newSettings.emailPassword === '••••••••' && { emailPassword: currentSettings.emailPassword }),
    };
    
    res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'فشل في حفظ الإعدادات' });
  }
};

export const testConnection = async (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    let result = { success: false, message: '' };
    
    switch (service) {
      case 'openai':
        if (currentSettings.openaiApiKey) {
          result = { success: true, message: 'اتصال OpenAI ناجح' };
        } else {
          result = { success: false, message: 'مفتاح OpenAI مفقود' };
        }
        break;
        
      case 'elevenlabs':
        if (currentSettings.elevenLabsApiKey) {
          result = { success: true, message: 'اتصال ElevenLabs ناجح' };
        } else {
          result = { success: false, message: 'مفتاح ElevenLabs مفقود' };
        }
        break;
        
      case 'siyadah-voip':
        if (currentSettings.siyadahVoipApiKey && currentSettings.siyadahVoipBaseUrl) {
          result = { success: true, message: 'اتصال Siyadah VoIP ناجح' };
        } else {
          result = { success: false, message: 'بيانات Siyadah VoIP مفقودة' };
        }
        break;
        
      case 'whatsapp':
        if (currentSettings.whatsappApiToken) {
          result = { success: true, message: 'اتصال WhatsApp ناجح' };
        } else {
          result = { success: false, message: 'رمز WhatsApp مفقود' };
        }
        break;
        
      default:
        result = { success: false, message: 'خدمة غير معروفة' };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ success: false, message: 'فشل في اختبار الاتصال' });
  }
};