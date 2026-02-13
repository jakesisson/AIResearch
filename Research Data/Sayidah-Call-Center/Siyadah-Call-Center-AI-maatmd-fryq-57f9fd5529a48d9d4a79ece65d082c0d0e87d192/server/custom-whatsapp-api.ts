import express from 'express';
import cors from 'cors';
import { CustomWhatsAppClient } from './custom-whatsapp-client';

// Create dedicated API server for Custom WhatsApp integration
const apiApp = express();

// Enable CORS and JSON parsing
apiApp.use(cors());
apiApp.use(express.json({ limit: '10mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global configuration storage
let customWhatsAppConfig: any = null;

// Configuration endpoint
apiApp.post('/configure', (req, res) => {
  try {
    const { sessionName, apiKey, serverUrl, webhookUrl } = req.body;
    
    if (!sessionName || !apiKey || !serverUrl) {
      return res.status(400).json({
        success: false,
        error: 'Session name, API key, and server URL are required'
      });
    }
    
    console.log('🔧 Custom WhatsApp API configured:');
    console.log(`Session: ${sessionName}`);
    console.log(`Server: ${serverUrl}`);
    console.log(`API Key: ${apiKey.substring(0, 20)}...`);
    
    // Store configuration
    customWhatsAppConfig = {
      sessionName,
      apiKey,
      serverUrl,
      webhookUrl: webhookUrl || '/webhook/custom-whatsapp'
    };
    
    // Also store globally for other services
    (global as any).customWhatsAppConfig = customWhatsAppConfig;
    
    res.json({
      success: true,
      message: 'Configuration saved successfully',
      config: {
        sessionName,
        serverUrl,
        webhookUrl: webhookUrl || '/webhook/custom-whatsapp'
      }
    });
  } catch (error: any) {
    console.error('Configuration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send WhatsApp message endpoint
apiApp.post('/send', async (req, res) => {
  try {
    const { to, message, customConfig } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    // Use provided config or stored config
    const config = customConfig || customWhatsAppConfig;
    
    if (!config || !config.apiKey || !config.serverUrl) {
      return res.status(400).json({
        success: false,
        error: 'Custom WhatsApp API not configured. Please configure first.'
      });
    }

    console.log('📱 Sending WhatsApp message via Custom API');
    const customClient = new CustomWhatsAppClient(config);
    const result = await customClient.sendMessage(to, message);
    
    res.json(result);
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp message',
      details: error.message
    });
  }
});

// Health check endpoint
apiApp.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Custom WhatsApp API server running',
    configured: !!customWhatsAppConfig,
    timestamp: new Date().toISOString()
  });
});

// Start the dedicated API server on a different port
const API_PORT = 5001;

export function startCustomWhatsAppAPI() {
  apiApp.listen(API_PORT, '0.0.0.0', () => {
    console.log(`🔧 Custom WhatsApp API server running on port ${API_PORT}`);
  });
  
  return apiApp;
}

export { apiApp, customWhatsAppConfig };