// Custom WhatsApp Webhook Handler
import { Request, Response } from 'express';
import { CustomWhatsAppClient } from '../custom-whatsapp-client';

export const customWhatsAppWebhook = (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log('📱 Custom WhatsApp Webhook received:', data);
    
    if (data) {
      // Create client instance to process the message
      const client = new CustomWhatsAppClient({
        sessionName: 'siyadah_session',
        apiKey: '',
        serverUrl: '',
        webhookUrl: '/webhook/custom-whatsapp'
      });
      
      const messageInfo = client.processWebhookMessage(data);
      
      // Log the received message
      console.log(`📱 Received: ${messageInfo.body} from ${messageInfo.from}`);
      console.log('Message details:', messageInfo);
      
      // Here you can integrate with your AI system or business logic
      // For example, trigger AI response, save to database, etc.
      
      // Send auto-response if needed
      if (messageInfo.event === 'message' && messageInfo.body.toLowerCase().includes('مرحبا')) {
        console.log('🤖 Auto-response triggered for greeting');
        // You can implement auto-response logic here
      }
    }
    
    res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error(`❌ Custom WhatsApp webhook error: ${error.message}`);
    res.status(500).json({ error: error.message, status: 'error' });
  }
};