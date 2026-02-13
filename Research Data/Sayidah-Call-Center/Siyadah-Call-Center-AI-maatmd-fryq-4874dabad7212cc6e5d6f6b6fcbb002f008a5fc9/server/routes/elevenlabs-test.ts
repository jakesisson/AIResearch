import { Router } from 'express';
import { ElevenLabsService } from '../elevenlabs-service';

const router = Router();

// Test ElevenLabs integration
router.post('/test', async (req, res) => {
  try {
    const { text = 'مرحباً من سيادة AI' } = req.body;
    
    // Check if ElevenLabs API key is available
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.json({
        success: false,
        error: 'ElevenLabs API key not configured',
        fallback: 'Using Siyadah VoIP Polly voices instead',
        message: 'System working with Polly.Zeina voice'
      });
    }
    
    // Test text generation
    const audioBuffer = await ElevenLabsService.generateSpeech(text);
    
    if (audioBuffer) {
      res.json({
        success: true,
        message: 'ElevenLabs voice generation successful',
        audioSize: audioBuffer.length,
        voice: 'Professional Arabic voice'
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to generate audio',
        fallback: 'Using Siyadah VoIP Polly voices'
      });
    }
    
  } catch (error) {
    console.error('ElevenLabs test error:', error);
    res.json({
      success: false,
      error: error.message,
      fallback: 'System working with Siyadah VoIP Polly voices'
    });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.json({
        success: false,
        error: 'ElevenLabs API key not configured',
        available: ['Polly.Zeina (Siyadah VoIP default)']
      });
    }
    
    const voices = await ElevenLabsService.getAvailableVoices();
    res.json({
      success: true,
      voices: voices || ['sarah_professional', 'ahmed_business', 'fatima_customer']
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      fallback: ['Polly.Zeina (Siyadah VoIP)']
    });
  }
});

export default router;