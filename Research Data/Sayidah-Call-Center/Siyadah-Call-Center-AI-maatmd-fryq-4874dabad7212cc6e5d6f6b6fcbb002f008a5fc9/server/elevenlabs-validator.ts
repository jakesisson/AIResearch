// Professional ElevenLabs API Key Validator
// Author: Business Automation Platform
// Purpose: Validate API key permissions and provide actionable feedback

export interface ElevenLabsPermissions {
  text_to_speech: boolean;
  voices_read: boolean;
  user_read: boolean;
  subscription_active: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  permissions: ElevenLabsPermissions;
  errors: string[];
  recommendations: string[];
}

export class ElevenLabsValidator {
  private static readonly API_BASE = 'https://api.elevenlabs.io/v1';

  static async validateApiKey(apiKey: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      permissions: {
        text_to_speech: false,
        voices_read: false,
        user_read: false,
        subscription_active: false
      },
      errors: [],
      recommendations: []
    };

    if (!apiKey || !apiKey.startsWith('sk_')) {
      result.errors.push('مفتاح API غير صالح - يجب أن يبدأ بـ sk_');
      result.recommendations.push('تحقق من صحة المفتاح من لوحة ElevenLabs');
      return result;
    }

    // Test user_read permission
    try {
      const userResponse = await fetch(`${this.API_BASE}/user`, {
        headers: { 'xi-api-key': apiKey }
      });
      
      if (userResponse.ok) {
        result.permissions.user_read = true;
        const userData = await userResponse.json();
        result.permissions.subscription_active = userData.subscription?.status === 'active';
      } else if (userResponse.status === 401) {
        const errorData = await userResponse.json();
        if (errorData.detail?.message?.includes('missing_permissions')) {
          result.errors.push('المفتاح يفتقر لصلاحية user_read');
        }
      }
    } catch (error) {
      result.errors.push('فشل في التحقق من صلاحيات المستخدم');
    }

    // Test voices_read permission
    try {
      const voicesResponse = await fetch(`${this.API_BASE}/voices`, {
        headers: { 'xi-api-key': apiKey }
      });
      
      if (voicesResponse.ok) {
        result.permissions.voices_read = true;
      } else if (voicesResponse.status === 401) {
        const errorData = await voicesResponse.json();
        if (errorData.detail?.message?.includes('missing_permissions')) {
          result.errors.push('المفتاح يفتقر لصلاحية voices_read');
        }
      }
    } catch (error) {
      result.errors.push('فشل في التحقق من صلاحيات الأصوات');
    }

    // Test text_to_speech permission with minimal request
    try {
      const ttsResponse = await fetch(`${this.API_BASE}/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: 'test',
          model_id: 'eleven_multilingual_v2'
        })
      });
      
      if (ttsResponse.ok || ttsResponse.status === 422) {
        // 422 means we have permission but invalid parameters
        result.permissions.text_to_speech = true;
      } else if (ttsResponse.status === 401) {
        const errorData = await ttsResponse.json();
        if (errorData.detail?.message?.includes('missing_permissions')) {
          result.errors.push('المفتاح يفتقر لصلاحية text_to_speech');
          result.recommendations.push('فعّل صلاحية Text to Speech في لوحة ElevenLabs');
        }
      }
    } catch (error) {
      result.errors.push('فشل في التحقق من صلاحيات تحويل النص إلى كلام');
    }

    // Generate final recommendations
    if (!result.permissions.text_to_speech) {
      result.recommendations.push('1. اذهب إلى ElevenLabs Dashboard');
      result.recommendations.push('2. انقر على Profile → API Keys');
      result.recommendations.push('3. أنشئ مفتاح جديد مع تفعيل Text to Speech');
      result.recommendations.push('4. استبدل المفتاح في Replit Secrets');
    }

    if (!result.permissions.subscription_active) {
      result.recommendations.push('تأكد من تفعيل الاشتراك في ElevenLabs');
    }

    result.isValid = result.permissions.text_to_speech && 
                   result.permissions.voices_read && 
                   result.permissions.subscription_active;

    return result;
  }

  static async getDetailedStatus(apiKey: string): Promise<string> {
    const validation = await this.validateApiKey(apiKey);
    
    let status = '\n🔍 **تحليل مفتاح ElevenLabs:**\n\n';
    
    if (validation.isValid) {
      status += '✅ المفتاح صالح ومكتمل الصلاحيات\n';
    } else {
      status += '❌ المفتاح يحتاج إصلاح\n\n';
      
      status += '**الصلاحيات:**\n';
      status += `• Text to Speech: ${validation.permissions.text_to_speech ? '✅' : '❌'}\n`;
      status += `• Voices Read: ${validation.permissions.voices_read ? '✅' : '❌'}\n`;
      status += `• User Read: ${validation.permissions.user_read ? '✅' : '❌'}\n`;
      status += `• Subscription: ${validation.permissions.subscription_active ? '✅' : '❌'}\n\n`;
      
      if (validation.errors.length > 0) {
        status += '**المشاكل:**\n';
        validation.errors.forEach(error => {
          status += `• ${error}\n`;
        });
        status += '\n';
      }
      
      if (validation.recommendations.length > 0) {
        status += '**الحلول:**\n';
        validation.recommendations.forEach(rec => {
          status += `${rec}\n`;
        });
      }
    }
    
    return status;
  }
}