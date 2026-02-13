// Custom WhatsApp Configuration API
import { Request, Response } from 'express';

// In-memory storage for dynamic configuration
// In production, this would be stored in database
let dynamicConfig = {
  sessionName: 'siyadah_session',
  apiKey: '',
  serverUrl: '',
  webhookUrl: '/webhook/custom-whatsapp'
};

export const configureCustomWhatsApp = (req: Request, res: Response) => {
  try {
    const { sessionName, apiKey, serverUrl, webhookUrl } = req.body;
    
    if (!sessionName || !apiKey || !serverUrl) {
      return res.status(400).json({
        success: false,
        error: 'Session name, API key, and server URL are required'
      });
    }
    
    // Update dynamic configuration
    dynamicConfig = {
      sessionName,
      apiKey,
      serverUrl,
      webhookUrl: webhookUrl || '/webhook/custom-whatsapp'
    };
    
    console.log('🔧 Custom WhatsApp API configured:');
    console.log(`Session: ${sessionName}`);
    console.log(`Server: ${serverUrl}`);
    console.log(`API Key: ${apiKey.substring(0, 20)}...`);
    
    res.json({
      success: true,
      message: 'Configuration saved successfully',
      config: {
        sessionName,
        serverUrl,
        webhookUrl: dynamicConfig.webhookUrl
      }
    });
  } catch (error: any) {
    console.error('Configuration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCustomWhatsAppConfig = () => {
  return dynamicConfig;
};