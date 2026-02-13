// Using fetch instead of axios for better compatibility
import fs from 'fs';
import path from 'path';

import ConfigManager from './secure-config';

export class ElevenLabsService {
  private static readonly BASE_URL = 'https://api.elevenlabs.io/v1';
  private static audioCache = new Map<string, Buffer>();
  
  // Available Professional Arabic voices
  private static readonly ARABIC_VOICES = {
    'sarah_professional': 'EXAVITQu4vr4xnSDxMaL', // أفضل صوت نسائي عربي احترافي
    'ahmed_business': '21m00Tcm4TlvDq8ikWAM', // صوت رجالي للأعمال
    'fatima_customer': 'pNInz6obpgDQGcFmaJgB', // صوت خدمة العملاء
    'omar_sales': 'VR6AewLTigWG4xSOukaG' // صوت المبيعات المحترف
  };

  private static readonly ARABIC_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default Arabic voice
  
  static async generateSpeech(
    text: string, 
    voiceId: string = this.ARABIC_VOICE_ID,
    options: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    } = {}
  ): Promise<Buffer | null> {
    try {
      if (!process.env.ELEVENLABS_API_KEY) {
        console.warn('ElevenLabs API key not found');
        return null;
      }

      const defaultOptions = {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
        ...options
      };

      const response = await fetch(`${this.BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: defaultOptions
        })
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } else {
        const errorText = await response.text();
        console.error('ElevenLabs API Error:', response.status, errorText);
        
        // Professional error handling for API issues
        if (response.status === 401) {
          console.warn('🔑 ElevenLabs API: Authentication required - verify API key permissions');
        } else if (response.status === 429) {
          console.warn('⏱️ ElevenLabs API: Rate limit exceeded - implementing backoff strategy');
        } else if (response.status === 403) {
          console.warn('🚫 ElevenLabs API: Access forbidden - check subscription status');
        }
        return null;
      }
      
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      return null;
    }
  }

  static async saveAudioFile(audioBuffer: Buffer, filename?: string): Promise<string | null> {
    try {
      const audioDir = path.join(process.cwd(), 'temp_audio');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const fileName = filename || `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      fs.writeFileSync(filePath, audioBuffer);
      
      // Return public URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      return `${baseUrl}/temp_audio/${fileName}`;
      
    } catch (error) {
      console.error('Error saving audio file:', error);
      return null;
    }
  }

  static async generateAndSaveAudio(
    text: string,
    voiceId?: string,
    options?: any
  ): Promise<string | null> {
    try {
      const audioBuffer = await this.generateSpeech(text, voiceId, options);
      
      if (!audioBuffer) {
        return null;
      }

      return await this.saveAudioFile(audioBuffer);
      
    } catch (error) {
      console.error('Error generating and saving audio:', error);
      return null;
    }
  }

  static async getAvailableVoices(): Promise<any[]> {
    // Return pre-configured Arabic voices since API has permission restrictions
    return Object.entries(this.getArabicVoices()).map(([name, id]) => ({
      voice_id: id,
      name: name,
      category: 'premade',
      language: 'Arabic'
    }));
  }

  static getArabicVoices() {
    return this.ARABIC_VOICES;
  }

  static async getVoiceDetails(voiceId: string): Promise<any | null> {
    if (!process.env.ELEVENLABS_API_KEY) return null;

    try {
      const response = await fetch(`${this.BASE_URL}/voices/${voiceId}`, {
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الصوت:', error);
      return null;
    }
  }

  static async generateSpeechStream(
    text: string,
    voiceId: string = this.ARABIC_VOICE_ID
  ): Promise<ReadableStream | null> {
    if (!process.env.ELEVENLABS_API_KEY) return null;

    try {
      const response = await fetch(`${this.BASE_URL}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85
          }
        })
      });

      if (response.ok && response.body) {
        return response.body;
      }
      return null;
    } catch (error) {
      console.error('خطأ في تدفق الصوت:', error);
      return null;
    }
  }

  static clearCache(): void {
    this.audioCache.clear();
    console.log('🧹 تم مسح ذاكرة التخزين المؤقت للصوت');
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.audioCache.size,
      keys: Array.from(this.audioCache.keys()).map(key => key.substring(0, 50) + '...')
    };
  }

  static cleanupOldFiles(olderThanHours: number = 24): void {
    try {
      const audioDir = path.join(process.cwd(), 'temp_audio');
      
      if (!fs.existsSync(audioDir)) {
        return;
      }

      const files = fs.readdirSync(audioDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(audioDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old audio file: ${file}`);
        }
      });
      
    } catch (error) {
      console.error('Error cleaning up audio files:', error);
    }
  }
}

// Cleanup old files every hour
setInterval(() => {
  ElevenLabsService.cleanupOldFiles(2); // Delete files older than 2 hours
}, 60 * 60 * 1000);

export default ElevenLabsService;