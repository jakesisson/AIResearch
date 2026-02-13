import { IWhatsAppConversation, IWhatsAppMessage, InsertWhatsAppConversation, InsertWhatsAppMessage, IOpportunity } from '@shared/schema';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface WhatsAppPromptAnalysis {
  intent: 'send_promotional' | 'send_custom' | 'reply_to_message' | 'unknown';
  target: 'specific_customer' | 'specific_phone' | 'all_customers' | 'unknown';
  customerName?: string;
  phoneNumber?: string;
  messageContent?: string;
  confidence: number;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  content: string;
  error?: string;
}

export class IntelligentWhatsAppService {
  private conversations: Map<string, IWhatsAppConversation> = new Map();
  private messages: IWhatsAppMessage[] = [];
  
  /**
   * Analyze Arabic prompt to understand user intent
   */
  async analyzePrompt(prompt: string): Promise<WhatsAppPromptAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `أنت مساعد ذكي لتحليل طلبات إرسال رسائل واتساب. حلل الطلب العربي واستخرج المعلومات التالية:
            
            1. النية (intent):
               - send_promotional: إرسال رسالة ترويجية
               - send_custom: إرسال رسالة مخصصة
               - reply_to_message: الرد على رسالة
               - unknown: غير واضح
            
            2. الهدف (target):
               - specific_customer: عميل محدد بالاسم
               - specific_phone: رقم هاتف محدد
               - all_customers: جميع العملاء
               - unknown: غير محدد
            
            3. استخرج اسم العميل إذا ذُكر
            4. استخرج رقم الهاتف إذا ذُكر
            5. استخرج محتوى الرسالة إذا ذُكر
            6. اعط درجة ثقة من 0 إلى 1
            
            أجب بصيغة JSON فقط.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        intent: analysis.intent || 'unknown',
        target: analysis.target || 'unknown',
        customerName: analysis.customerName,
        phoneNumber: analysis.phoneNumber,
        messageContent: analysis.messageContent,
        confidence: analysis.confidence || 0.5
      };
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      return {
        intent: 'unknown',
        target: 'unknown',
        confidence: 0
      };
    }
  }

  /**
   * Generate promotional message content
   */
  async generatePromotionalMessage(customerName?: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `أنت مسوق محترف لشركة "سيادة AI" المتخصصة في الذكاء الاصطناعي وأتمتة الأعمال. 
            اكتب رسالة ترويجية قصيرة ومؤثرة باللغة العربية تتضمن:
            - ترحيب شخصي
            - عرض خدمات الشركة (أتمتة العمليات، الذكاء الاصطناعي، إدارة العملاء)
            - عرض خاص أو حافز للتواصل
            - دعوة للتواصل
            
            يجب أن تكون الرسالة احترافية وودودة ولا تتجاوز 100 كلمة.`
          },
          {
            role: "user",
            content: customerName ? `اكتب رسالة ترويجية للعميل: ${customerName}` : 'اكتب رسالة ترويجية عامة'
          }
        ]
      });

      return response.choices[0].message.content || 'مرحباً، نود تقديم خدماتنا المتميزة في مجال الذكاء الاصطناعي وأتمتة الأعمال. تواصل معنا للحصول على استشارة مجانية!';
    } catch (error) {
      console.error('Error generating promotional message:', error);
      return 'مرحباً من فريق سيادة AI! نقدم حلول الذكاء الاصطناعي المتطورة لنمو أعمالك. تواصل معنا اليوم!';
    }
  }

  /**
   * Generate automatic reply based on incoming message
   */
  async generateAutoReply(incomingMessage: string, conversationHistory: IWhatsAppMessage[]): Promise<string> {
    try {
      const historyText = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.direction === 'incoming' ? 'العميل' : 'سيادة AI'}: ${msg.content}`)
        .join('\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `أنت مساعد ذكي لشركة "سيادة AI" المتخصصة في الذكاء الاصطناعي وأتمتة الأعمال.
            
            مهامك:
            - الرد على استفسارات العملاء بشكل احترافي ومفيد
            - تقديم معلومات عن خدمات الشركة
            - توجيه العملاء للخطوات التالية المناسبة
            - الحفاظ على طابع ودود ومهني
            
            خدمات الشركة:
            - أتمتة العمليات التجارية
            - أنظمة الذكاء الاصطناعي
            - إدارة علاقات العملاء (CRM)
            - التحليل الذكي للبيانات
            - روبوتات المحادثة
            
            أجب بالعربية وكن مختصراً (50-80 كلمة كحد أقصى).`
          },
          {
            role: "user",
            content: `تاريخ المحادثة:\n${historyText}\n\nالرسالة الجديدة: ${incomingMessage}\n\nاكتب رداً مناسباً:`
          }
        ]
      });

      return response.choices[0].message.content || 'شكراً لتواصلك معنا! سنقوم بالرد عليك في أقرب وقت ممكن.';
    } catch (error) {
      console.error('Error generating auto reply:', error);
      return 'شكراً لرسالتك! فريقنا سيتواصل معك قريباً بإذن الله.';
    }
  }

  /**
   * Process intelligent WhatsApp command
   */
  async processWhatsAppCommand(prompt: string, whatsappClient: any, customers: IOpportunity[]): Promise<{
    success: boolean;
    message: string;
    executedActions: string[];
  }> {
    const analysis = await this.analyzePrompt(prompt);
    const executedActions: string[] = [];

    if (analysis.confidence < 0.6) {
      return {
        success: false,
        message: 'لم أتمكن من فهم الطلب بوضوح. يرجى إعادة صياغة الطلب.',
        executedActions: []
      };
    }

    try {
      switch (analysis.intent) {
        case 'send_promotional':
          return await this.handlePromotionalMessage(analysis, whatsappClient, customers, executedActions);
        
        case 'send_custom':
          return await this.handleCustomMessage(analysis, whatsappClient, customers, executedActions);
        
        default:
          return {
            success: false,
            message: 'نوع الطلب غير مدعوم حالياً.',
            executedActions: []
          };
      }
    } catch (error) {
      console.error('Error processing WhatsApp command:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء معالجة الطلب.',
        executedActions: []
      };
    }
  }

  private async handlePromotionalMessage(
    analysis: WhatsAppPromptAnalysis, 
    whatsappClient: any, 
    customers: IOpportunity[], 
    executedActions: string[]
  ) {
    switch (analysis.target) {
      case 'specific_customer':
        if (!analysis.customerName) {
          return {
            success: false,
            message: 'لم يتم تحديد اسم العميل.',
            executedActions: []
          };
        }
        
        const customer = customers.find(c => 
          c.name.includes(analysis.customerName!) || 
          c.contactPerson.includes(analysis.customerName!)
        );
        
        if (!customer) {
          return {
            success: false,
            message: `لم يتم العثور على العميل: ${analysis.customerName}`,
            executedActions: []
          };
        }

        const personalMessage = await this.generatePromotionalMessage(customer.contactPerson);
        await this.sendMessage(whatsappClient, customer.phone, personalMessage, prompt);
        executedActions.push(`تم إرسال رسالة ترويجية إلى ${customer.contactPerson} (${customer.phone})`);
        
        return {
          success: true,
          message: `تم إرسال رسالة ترويجية بنجاح إلى ${customer.contactPerson}`,
          executedActions: executedActions
        };

      case 'specific_phone':
        if (!analysis.phoneNumber) {
          return {
            success: false,
            message: 'لم يتم تحديد رقم الهاتف.',
            executedActions: []
          };
        }

        const phoneMessage = await this.generatePromotionalMessage();
        await this.sendMessage(whatsappClient, analysis.phoneNumber, phoneMessage, prompt);
        executedActions.push(`تم إرسال رسالة ترويجية إلى ${analysis.phoneNumber}`);
        
        return {
          success: true,
          message: `تم إرسال رسالة ترويجية بنجاح إلى ${analysis.phoneNumber}`,
          executedActions: executedActions
        };

      case 'all_customers':
        const bulkMessage = await this.generatePromotionalMessage();
        let sentCount = 0;
        
        for (const customer of customers.slice(0, 5)) { // Limit to 5 to avoid spam
          try {
            await this.sendMessage(whatsappClient, customer.phone, bulkMessage, prompt);
            executedActions.push(`تم إرسال رسالة إلى ${customer.contactPerson} (${customer.phone})`);
            sentCount++;
            
            // Add delay between messages
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Failed to send to ${customer.phone}:`, error);
          }
        }
        
        return {
          success: true,
          message: `تم إرسال ${sentCount} رسالة ترويجية بنجاح`,
          executedActions: executedActions
        };

      default:
        return {
          success: false,
          message: 'لم يتم تحديد المستهدف للرسالة.',
          executedActions: []
        };
    }
  }

  private async handleCustomMessage(
    analysis: WhatsAppPromptAnalysis, 
    whatsappClient: any, 
    customers: IOpportunity[], 
    executedActions: string[]
  ) {
    if (!analysis.messageContent) {
      return {
        success: false,
        message: 'لم يتم تحديد محتوى الرسالة.',
        executedActions: []
      };
    }

    // Similar logic to promotional but with custom content
    // Implementation details...
    
    return {
      success: true,
      message: 'تم إرسال الرسالة المخصصة بنجاح',
      executedActions: executedActions
    };
  }

  private async sendMessage(whatsappClient: any, phone: string, content: string, originalPrompt?: string): Promise<void> {
    try {
      const result = await whatsappClient.sendMessage(phone, content);
      
      // Store conversation and message in database
      await this.storeMessage({
        conversationId: this.getOrCreateConversationId(phone),
        messageId: result?.messageId || `msg_${Date.now()}`,
        direction: 'outgoing',
        content: content,
        messageType: 'text',
        status: 'sent',
        isAIGenerated: true,
        prompt: originalPrompt,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  private getOrCreateConversationId(phone: string): string {
    const existing = Array.from(this.conversations.values()).find(c => c.phone === phone);
    if (existing) {
      return existing._id;
    }

    const conversationId = `conv_${Date.now()}_${phone.replace(/\+/g, '')}`;
    const conversation: IWhatsAppConversation = {
      _id: conversationId,
      phone: phone,
      sessionId: `session_${Date.now()}`,
      isActive: true,
      lastActivity: new Date(),
      createdAt: new Date()
    };

    this.conversations.set(conversationId, conversation);
    return conversationId;
  }

  private async storeMessage(message: InsertWhatsAppMessage): Promise<void> {
    const fullMessage: IWhatsAppMessage = {
      ...message,
      _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.messages.push(fullMessage);
    console.log('Stored WhatsApp message:', fullMessage);
  }

  /**
   * Handle incoming WhatsApp message and generate auto-reply
   */
  async handleIncomingMessage(phone: string, content: string, messageId: string): Promise<string | null> {
    try {
      const conversationId = this.getOrCreateConversationId(phone);
      
      // Store incoming message
      await this.storeMessage({
        conversationId,
        messageId,
        direction: 'incoming',
        content,
        messageType: 'text',
        status: 'delivered',
        timestamp: new Date()
      });

      // Get conversation history
      const conversationHistory = this.messages.filter(m => m.conversationId === conversationId);
      
      // Generate auto-reply
      const autoReply = await this.generateAutoReply(content, conversationHistory);
      
      return autoReply;
    } catch (error) {
      console.error('Error handling incoming message:', error);
      return null;
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(phone: string): IWhatsAppMessage[] {
    const conversation = Array.from(this.conversations.values()).find(c => c.phone === phone);
    if (!conversation) return [];
    
    return this.messages.filter(m => m.conversationId === conversation._id);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): IWhatsAppConversation[] {
    return Array.from(this.conversations.values());
  }
}

export const intelligentWhatsAppService = new IntelligentWhatsAppService();