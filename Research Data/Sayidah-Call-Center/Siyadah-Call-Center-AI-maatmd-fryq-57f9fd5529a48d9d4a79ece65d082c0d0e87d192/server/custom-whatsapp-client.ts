// Custom WhatsApp Client Integration
import axios from 'axios';

export interface CustomWhatsAppConfig {
  sessionName: string;
  apiKey: string;
  serverUrl: string;
  webhookUrl: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: string;
}

export interface WebhookMessage {
  from: string;
  body: string;
  type: string;
  timestamp: number;
  session: string;
  event: string;
}

export class CustomWhatsAppClient {
  private config: CustomWhatsAppConfig;
  private client: any;

  constructor(config: CustomWhatsAppConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    // Initialize the client based on the structure from integration_node.js
    // This would normally use: new WhatsAppClient(sessionName, null, apiKey)
    console.log(`📱 Initializing Custom WhatsApp Client`);
    console.log(`Session: ${this.config.sessionName}`);
    console.log(`API Key: ${this.config.apiKey ? this.config.apiKey.substring(0, 20) + '...' : 'Not provided'}`);
    console.log(`Server URL: ${this.config.serverUrl || 'Not provided'}`);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{success: boolean, messageId?: string, error?: string}> {
    try {
      if (!this.config.apiKey || !this.config.serverUrl) {
        return {
          success: false,
          error: 'API Key and Server URL are required'
        };
      }

      console.log(`📤 Custom WhatsApp API: Sending to ${phoneNumber}`);
      console.log(`📤 Using session: ${this.config.sessionName}`);
      
      // Make actual API call to your custom WhatsApp service
      const response = await axios.post(`${this.config.serverUrl}/api/send-message`, {
        session: this.config.sessionName,
        to: phoneNumber,
        message: message,
        api_key: this.config.apiKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 30000
      });
      
      if (response.status === 200 && response.data.success) {
        console.log(`✅ Custom WhatsApp message sent successfully`);
        return {
          success: true,
          messageId: response.data.messageId || `custom_${Date.now()}`
        };
      } else {
        console.error('Custom WhatsApp API Error:', response.data);
        return {
          success: false,
          error: response.data.error || 'API request failed'
        };
      }
    } catch (error: any) {
      console.error('Custom WhatsApp send error:', error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'Cannot connect to WhatsApp API server. Please check server URL.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send message'
      };
    }
  }

  async configureWebhook(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.config.serverUrl}/api/webhook/configure`,
        { webhookUrl: this.config.webhookUrl },
        { timeout: 10000 }
      );
      
      console.log(`✅ Webhook configured: ${response.status}`);
      return response.status === 200;
    } catch (error: any) {
      console.error(`❌ Webhook config error: ${error.message}`);
      return false;
    }
  }

  processWebhookMessage(data: any): WebhookMessage {
    return {
      from: data.from || 'unknown',
      body: data.body || data.text || 'N/A',
      type: data.type || 'text',
      timestamp: data.timestamp || Date.now(),
      session: data.session || 'unknown',
      event: data.event || 'message'
    };
  }
}