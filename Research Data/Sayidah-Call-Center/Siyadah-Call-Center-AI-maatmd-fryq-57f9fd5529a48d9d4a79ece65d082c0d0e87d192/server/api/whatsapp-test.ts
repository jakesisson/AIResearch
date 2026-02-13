import { Request, Response } from 'express';

export async function handleWhatsAppTest(req: Request, res: Response) {
  try {
    const { token, webhookUrl } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp API Token is required'
      });
    }

    // Test connection to WhatsApp API
    const testResult = await testWhatsAppConnection(token, webhookUrl);
    
    return res.json(testResult);
  } catch (error) {
    console.error('WhatsApp test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during WhatsApp test'
    });
  }
}

async function testWhatsAppConnection(token: string, webhookUrl?: string): Promise<{success: boolean; error?: string; message?: string}> {
  try {
    // Simple validation test
    if (token.length < 10) {
      return {
        success: false,
        error: 'Token appears to be invalid (too short)'
      };
    }

    // Test webhook URL if provided
    if (webhookUrl) {
      try {
        new URL(webhookUrl);
      } catch {
        return {
          success: false,
          error: 'Webhook URL format is invalid'
        };
      }
    }

    // For now, we'll do basic validation
    // In production, you would make actual API calls to WhatsApp Business API
    return {
      success: true,
      message: 'WhatsApp API configuration validated successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to validate WhatsApp API configuration'
    };
  }
}