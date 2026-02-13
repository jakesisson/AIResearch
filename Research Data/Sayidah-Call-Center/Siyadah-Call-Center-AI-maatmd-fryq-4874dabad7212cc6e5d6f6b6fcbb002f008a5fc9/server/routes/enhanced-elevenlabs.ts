import { Router, Request, Response } from 'express';
import { ElevenLabsService } from '../elevenlabs-service';
import { ElevenLabsValidator } from '../elevenlabs-validator';

const router = Router();

// Enhanced voice generation with custom options
router.post('/generate-voice', async (req: Request, res: Response) => {
  try {
    const { text, voiceId, options = {} } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'النص مطلوب لإنشاء الصوت' 
      });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'مفتاح ElevenLabs API غير متوفر'
      });
    }

    console.log('🎵 إنشاء صوت متقدم:', { text: text.substring(0, 50), voiceId, options });

    const audioBuffer = await ElevenLabsService.generateSpeech(text, voiceId, options);

    if (audioBuffer) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(audioBuffer);
    } else {
      res.status(500).json({
        success: false,
        error: 'فشل في إنشاء الصوت'
      });
    }
  } catch (error: any) {
    console.error('خطأ في إنشاء الصوت المتقدم:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ غير متوقع'
    });
  }
});

// Voice streaming endpoint
router.post('/stream-voice', async (req: Request, res: Response) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'النص مطلوب للتدفق الصوتي' 
      });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'مفتاح ElevenLabs API غير متوفر'
      });
    }

    const stream = await ElevenLabsService.generateSpeechStream(text, voiceId);

    if (stream) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      });

      const reader = stream.getReader();
      
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        pump();
      };

      pump();
    } else {
      res.status(500).json({
        success: false,
        error: 'فشل في بدء التدفق الصوتي'
      });
    }
  } catch (error: any) {
    console.error('خطأ في التدفق الصوتي:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ غير متوقع'
    });
  }
});

// Get available voices with details
router.get('/voices-detailed', async (req: Request, res: Response) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'مفتاح ElevenLabs API غير متوفر'
      });
    }

    const voices = await ElevenLabsService.getAvailableVoices();
    
    // Get detailed info for each voice
    const detailedVoices = await Promise.all(
      voices.map(async (voice: any) => {
        const details = await ElevenLabsService.getVoiceDetails(voice.voice_id);
        return {
          ...voice,
          details: details || {}
        };
      })
    );

    res.json({
      success: true,
      voices: detailedVoices,
      arabic_voices: ElevenLabsService.getArabicVoices()
    });
  } catch (error: any) {
    console.error('خطأ في جلب الأصوات المفصلة:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ غير متوقع'
    });
  }
});

// Voice testing with different settings
router.post('/test-voice', async (req: Request, res: Response) => {
  try {
    const { 
      text = 'مرحباً، هذا اختبار للصوت الذكي من منصة الأتمتة', 
      voiceId,
      stability = 0.75,
      similarity_boost = 0.85,
      style = 0.5,
      model = 'eleven_turbo_v2'
    } = req.body;

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'مفتاح ElevenLabs API غير متوفر'
      });
    }

    const options = {
      model,
      voice_settings: {
        stability: parseFloat(stability),
        similarity_boost: parseFloat(similarity_boost),
        style: parseFloat(style),
        use_speaker_boost: true
      }
    };

    console.log('🧪 اختبار الصوت:', { text, voiceId, options });

    const audioBuffer = await ElevenLabsService.generateSpeech(text, voiceId, options);

    if (audioBuffer) {
      const audioUrl = await ElevenLabsService.saveAudioFile(
        audioBuffer, 
        `test-voice-${Date.now()}.mp3`
      );

      res.json({
        success: true,
        message: 'تم إنشاء الصوت التجريبي بنجاح',
        audioUrl,
        settings: options,
        size: audioBuffer.length
      });
    } else {
      // Professional error analysis
      if (process.env.ELEVENLABS_API_KEY) {
        const detailedStatus = await ElevenLabsValidator.getDetailedStatus(process.env.ELEVENLABS_API_KEY);
        res.status(500).json({
          success: false,
          error: 'فشل في إنشاء الصوت التجريبي',
          detailed_analysis: detailedStatus,
          suggestion: 'تحقق من صلاحيات المفتاح'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'مفتاح ElevenLabs API غير موجود'
        });
      }
    }
  } catch (error: any) {
    console.error('خطأ في اختبار الصوت:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'خطأ غير متوقع'
    });
  }
});

// Cache management
router.get('/cache-stats', (req: Request, res: Response) => {
  try {
    const stats = { 
    size: 0, 
    keys: [],
    message: 'نظام التخزين المؤقت جاهز للاستخدام'
  };
    res.json({
      success: true,
      cache: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/clear-cache', (req: Request, res: Response) => {
  try {
    ElevenLabsService.clearCache();
    res.json({
      success: true,
      message: 'تم مسح ذاكرة التخزين المؤقت بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Professional API key validation endpoint
router.get('/validate-key', async (req: Request, res: Response) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.json({
        success: false,
        status: 'مفتاح API غير موجود',
        recommendations: ['أضف مفتاح ElevenLabs في Replit Secrets']
      });
    }

    const validation = await ElevenLabsValidator.validateApiKey(process.env.ELEVENLABS_API_KEY);
    const detailedStatus = await ElevenLabsValidator.getDetailedStatus(process.env.ELEVENLABS_API_KEY);

    res.json({
      success: validation.isValid,
      permissions: validation.permissions,
      errors: validation.errors,
      recommendations: validation.recommendations,
      detailed_status: detailedStatus,
      key_preview: `${process.env.ELEVENLABS_API_KEY.substring(0, 8)}...`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'فشل في التحقق من المفتاح',
      details: error.message
    });
  }
});

export default router;