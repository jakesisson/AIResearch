// Real WhatsApp Client Implementation using your API system
import axios from 'axios';

interface WhatsAppConfig {
  sessionName: string;
  apiToken: string;
  baseURL: string;
}

export class RealWhatsAppClient {
  private config: WhatsAppConfig;
  private secretKey: string = '';
  private authToken: string = '';
  public authenticated: boolean = false;

  constructor(sessionName: string, baseURL: string, apiToken: string) {
    this.config = {
      sessionName,
      apiToken,
      baseURL: baseURL || 'https://3e0f14cc-731c-4c72-96e7-feb806c5128b-00-39cvzl2tdyxjo.sisko.replit.dev'
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Starting real API authentication...');
      
      // Step 1: Get secret key
      const secretResponse = await axios.get(`${this.config.baseURL}/api/secret-key`, { 
        timeout: 10000 
      });
      
      if (secretResponse.status === 200) {
        this.secretKey = secretResponse.data.secretKey || '';
        console.log('🔑 Secret key obtained');
        
        // Step 2: Generate auth token
        const tokenResponse = await axios.post(
          `${this.config.baseURL}/api/${this.config.sessionName}/${this.secretKey}/generate-token`,
          {},
          { timeout: 10000 }
        );
        
        if (tokenResponse.status === 201) {
          this.authToken = tokenResponse.data.full || '';
          this.authenticated = true;
          console.log('✅ Authentication successful');
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.authenticated) return false;
    
    try {
      const response = await axios.get(
        `${this.config.baseURL}/api/${this.config.sessionName}/check-connection-session`,
        {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
          timeout: 10000
        }
      );
      
      return response.status === 200 && response.data.status === 'CONNECTED';
    } catch (error) {
      return false;
    }
  }

  async sendMessage(phone: string, message: string) {
    if (!this.authenticated) {
      throw new Error('Client not authenticated');
    }
    
    try {
      console.log(`📱 Sending message via your API: ${phone} -> ${message}`);
      
      // Use the correct endpoint from your original client
      const response = await axios.post(
        `${this.config.baseURL}/api/${this.config.sessionName}/send-message`,
        {
          phone: phone,
          message: message
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}` 
          },
          timeout: 15000
        }
      );
      
      console.log('API Response:', response.status, response.data);
      
      // Your API responds with 200 for successful sends, regardless of response.data content
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Message sent successfully via your API');
        return {
          success: true,
          messageId: response.data.id || `msg_${Date.now()}`,
          to: phone,
          message: message,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
      }
      
      return { success: false, error: `HTTP ${response.status}` };
    } catch (error: any) {
      console.log('❌ Send error:', error.response?.data || error.message);
      
      // Even if API throws error, check if webhook confirms delivery
      // Your API might return error but still send the message
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        note: 'Message may still be delivered - check webhook logs'
      };
    }
  }
}