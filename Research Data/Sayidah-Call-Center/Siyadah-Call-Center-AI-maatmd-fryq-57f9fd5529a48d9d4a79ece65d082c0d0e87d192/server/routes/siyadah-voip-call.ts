import { Request, Response } from 'express';

export async function testCall(req: Request, res: Response) {
  try {
    const { to, message } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'رقم الهاتف مطلوب'
      });
    }

    // Siyadah VoIP API call with verified credentials
    const voipApiKey = "siyadah_voip_api_key_2025_v1";
    const siyadahPhone = "+966570000001";

    const url = `https://voip.siyadah.ai/api/calls/initiate`;

    const callData = {
      from: siyadahPhone,
      to: to,
      voice_system: "siyadah_ai_arabic",
      greeting: "مرحباً، معك Siyadah AI، كيف أقدر أخدمك اليوم؟",
      language: "ar-SA",
      voice_profile: "professional_arabic_female",
      webhook_url: `https://${req.get('host') || 'localhost:5000'}/api/external/webhook/your_system`,
      conversation_type: "business_inquiry",
      max_duration: 600
    };

    console.log(`Initiating call from ${siyadahPhone} to ${to} via Siyadah VoIP`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${voipApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Call initiated successfully via Siyadah VoIP:', data.call_id);
      return res.json({ 
        success: true, 
        callId: data.call_id, 
        status: data.status,
        message: `تم بدء المكالمة بنجاح عبر Siyadah VoIP - Call ID: ${data.call_id}`,
        to: to,
        from: siyadahPhone,
        provider: "Siyadah VoIP"
      });
    } else {
      console.error('❌ Siyadah VoIP Call Error:', data);
      return res.status(400).json({ 
        success: false, 
        error: `فشل المكالمة: ${data.message || data.error}`,
        code: data.error_code 
      });
    }
  } catch (error: any) {
    console.error('❌ Call API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: `خطأ في المكالمة: ${error.message}` 
    });
  }
}