import { IOpportunity } from '@shared/schema';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface WhatsAppCommand {
  type: 'send_promotional' | 'send_custom' | 'send_bulk' | 'unknown';
  target: 'customer_name' | 'phone_number' | 'all_customers' | 'unknown';
  customerName?: string;
  phoneNumber?: string;
  customMessage?: string;
  confidence: number;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  executedActions: string[];
  sentCount?: number;
}

export class WhatsAppAgent {
  
  /**
   * Analyze Arabic prompt to understand WhatsApp command
   */
  async analyzePrompt(prompt: string): Promise<WhatsAppCommand> {
    console.log('📝 WhatsApp Agent analyzing prompt:', prompt);
    try {
      console.log('🤖 Calling OpenAI GPT-4o for analysis...');
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت محلل ذكي لأوامر واتساب. حلل النص العربي واستخرج:

            1. نوع الأمر:
               - send_promotional: إرسال رسالة ترويجية
               - send_custom: إرسال رسالة مخصصة
               - send_bulk: إرسال جماعي
               - unknown: غير واضح

            2. المستهدف:
               - customer_name: اسم عميل محدد
               - phone_number: رقم هاتف
               - all_customers: جميع العملاء
               - unknown: غير محدد

            3. استخرج اسم العميل (إن وُجد)
            4. استخرج رقم الهاتف (إن وُجد)
            5. استخرج نص الرسالة المخصصة (إن وُجد)
            6. درجة الثقة (0-1)

            أمثلة:
            - "أرسل رسالة ترويجية للعميل محمد عكاشة" → customer_name: محمد عكاشة
            - "أرسل رسالة للرقم +21653844063" → phone_number: +21653844063
            - "أرسل رسالة ترويجية الى هذا الرقم +21653844063" → phone_number: +21653844063
            - "أرسل لجميع العملاء رسالة ترويجية" → all_customers

            رد بـ JSON فقط.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      console.log('WhatsApp Agent GPT-4o Analysis:', {
        prompt,
        gptResponse: analysis,
        confidence: analysis.confidence
      });
      
      return {
        type: analysis.type || 'unknown',
        target: analysis.target || 'unknown',
        customerName: analysis.customerName,
        phoneNumber: analysis.phoneNumber,
        customMessage: analysis.customMessage,
        confidence: analysis.confidence || 0.5
      };
    } catch (error) {
      console.error('WhatsApp Agent - Error analyzing prompt:', error);
      return {
        type: 'unknown',
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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت كاتب محتوى تسويقي لشركة "سيادة AI" المتخصصة في الذكاء الاصطناعي.

            اكتب رسالة ترويجية احترافية تتضمن:
            - تحية شخصية
            - مقدمة عن سيادة AI
            - أهم الخدمات (أتمتة الأعمال، الذكاء الاصطناعي، أنظمة CRM)
            - عرض خاص أو استشارة مجانية
            - دعوة للتواصل

            الرسالة يجب أن تكون:
            - مختصرة (80-100 كلمة)
            - احترافية وودودة
            - مقنعة وتحفز على التواصل
            - باللغة العربية الفصحى`
          },
          {
            role: "user",
            content: customerName ? `اكتب رسالة للعميل: ${customerName}` : 'اكتب رسالة ترويجية عامة'
          }
        ]
      });

      return response.choices[0].message.content || this.getDefaultPromotionalMessage(customerName);
    } catch (error) {
      console.error('WhatsApp Agent - Error generating message:', error);
      return this.getDefaultPromotionalMessage(customerName);
    }
  }

  private getDefaultPromotionalMessage(customerName?: string): string {
    const greeting = customerName ? `مرحباً ${customerName}،` : 'مرحباً،';
    return `${greeting}

نتشرف بتقديم خدمات سيادة AI المتطورة في مجال الذكاء الاصطناعي وأتمتة الأعمال.

🚀 خدماتنا تشمل:
✅ أتمتة العمليات التجارية
✅ أنظمة إدارة العملاء الذكية
✅ حلول الذكاء الاصطناعي المخصصة

🎁 عرض خاص: استشارة مجانية لمدة 30 دقيقة!

للتواصل والاستفسار، نحن في خدمتكم.

فريق سيادة AI`;
  }

  /**
   * Execute WhatsApp command
   */
  async executeCommand(
    prompt: string, 
    customers: IOpportunity[], 
    sendMessageFunction: (phone: string, message: string) => Promise<any>
  ): Promise<ExecutionResult> {
    
    const analysis = await this.analyzePrompt(prompt);
    
    // Add simple pattern detection as backup
    const phonePattern = /(\+\d{8,15})/;
    const phoneMatch = prompt.match(phonePattern);
    
    if (analysis.confidence < 0.4) {
      // If GPT analysis failed but we can detect a phone number, try simple pattern matching
      if (phoneMatch && (prompt.includes('أرسل') || prompt.includes('ارسل'))) {
        analysis.type = 'send_promotional';
        analysis.target = 'phone_number';
        analysis.phoneNumber = phoneMatch[1];
        analysis.confidence = 0.8;
      } else {
        return {
          success: false,
          message: 'لم أتمكن من فهم الطلب بوضوح. يرجى إعادة الصياغة.',
          executedActions: []
        };
      }
    }

    const executedActions: string[] = [];

    try {
      switch (analysis.target) {
        case 'customer_name':
          return await this.sendToCustomerByName(analysis, customers, sendMessageFunction, executedActions);
        
        case 'phone_number':
          return await this.sendToPhoneNumber(analysis, sendMessageFunction, executedActions);
        
        case 'all_customers':
          return await this.sendToAllCustomers(analysis, customers, sendMessageFunction, executedActions);
        
        default:
          return {
            success: false,
            message: 'لم يتم تحديد المستهدف للرسالة.',
            executedActions: []
          };
      }
    } catch (error) {
      console.error('WhatsApp Agent - Execution error:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء إرسال الرسائل.',
        executedActions: executedActions
      };
    }
  }

  private async sendToCustomerByName(
    analysis: WhatsAppCommand,
    customers: IOpportunity[],
    sendMessageFunction: (phone: string, message: string) => Promise<any>,
    executedActions: string[]
  ): Promise<ExecutionResult> {
    
    if (!analysis.customerName) {
      return {
        success: false,
        message: 'لم يتم تحديد اسم العميل.',
        executedActions: []
      };
    }

    const customer = customers.find(c => 
      c.name.toLowerCase().includes(analysis.customerName!.toLowerCase()) || 
      c.contactPerson.toLowerCase().includes(analysis.customerName!.toLowerCase())
    );

    if (!customer) {
      return {
        success: false,
        message: `لم يتم العثور على العميل: ${analysis.customerName}`,
        executedActions: []
      };
    }

    const message = analysis.customMessage || await this.generatePromotionalMessage(customer.contactPerson);
    
    try {
      await sendMessageFunction(customer.phone, message);
      executedActions.push(`✅ تم إرسال رسالة إلى ${customer.contactPerson} (${customer.phone})`);
      
      return {
        success: true,
        message: `تم إرسال الرسالة بنجاح إلى ${customer.contactPerson}`,
        executedActions: executedActions
      };
    } catch (error) {
      return {
        success: false,
        message: `فشل في إرسال الرسالة إلى ${customer.contactPerson}`,
        executedActions: []
      };
    }
  }

  private async sendToPhoneNumber(
    analysis: WhatsAppCommand,
    sendMessageFunction: (phone: string, message: string) => Promise<any>,
    executedActions: string[]
  ): Promise<ExecutionResult> {
    
    if (!analysis.phoneNumber) {
      return {
        success: false,
        message: 'لم يتم تحديد رقم الهاتف.',
        executedActions: []
      };
    }

    const message = analysis.customMessage || await this.generatePromotionalMessage();
    
    try {
      await sendMessageFunction(analysis.phoneNumber, message);
      executedActions.push(`✅ تم إرسال رسالة إلى ${analysis.phoneNumber}`);
      
      return {
        success: true,
        message: `تم إرسال الرسالة بنجاح إلى ${analysis.phoneNumber}`,
        executedActions: executedActions
      };
    } catch (error) {
      return {
        success: false,
        message: `فشل في إرسال الرسالة إلى ${analysis.phoneNumber}`,
        executedActions: []
      };
    }
  }

  private async sendToAllCustomers(
    analysis: WhatsAppCommand,
    customers: IOpportunity[],
    sendMessageFunction: (phone: string, message: string) => Promise<any>,
    executedActions: string[]
  ): Promise<ExecutionResult> {
    
    const message = analysis.customMessage || await this.generatePromotionalMessage();
    let successCount = 0;
    let failCount = 0;

    // Limit to first 5 customers to avoid spam
    const targetCustomers = customers.slice(0, 5);
    
    for (const customer of targetCustomers) {
      try {
        await sendMessageFunction(customer.phone, message);
        executedActions.push(`✅ ${customer.contactPerson} (${customer.phone})`);
        successCount++;
        
        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        executedActions.push(`❌ فشل إرسال إلى ${customer.contactPerson}`);
        failCount++;
      }
    }

    const totalSent = successCount;
    const resultMessage = `تم إرسال ${totalSent} رسالة بنجاح من أصل ${targetCustomers.length}`;
    
    return {
      success: successCount > 0,
      message: resultMessage,
      executedActions: executedActions,
      sentCount: totalSent
    };
  }

  /**
   * Get usage statistics
   */
  getStats(): { totalCommands: number; successRate: string } {
    // This would be implemented with actual storage in a real system
    return {
      totalCommands: 0,
      successRate: "0%"
    };
  }
}

// Export singleton instance
export const whatsappAgent = new WhatsAppAgent();