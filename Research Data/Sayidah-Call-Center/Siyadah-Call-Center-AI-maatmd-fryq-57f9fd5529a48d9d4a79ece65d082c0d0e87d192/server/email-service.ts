import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private transporter: any;
  private readonly defaultFrom = 'noreply@siyadah.ai';
  
  constructor() {
    this.initializeService();
  }
  
  private initializeService() {
    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid for email service');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } 
    // Fallback to SMTP configuration
    else if (process.env.SMTP_HOST) {
      console.log('📧 Using SMTP for email service');
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      console.warn('⚠️ No email service configured. Email sending will be simulated.');
    }
  }
  
  async send(options: EmailOptions): Promise<boolean> {
    try {
      const from = options.from || process.env.EMAIL_FROM || this.defaultFrom;
      
      // SendGrid
      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          to: options.to,
          from,
          subject: options.subject,
          html: options.html
        });
        console.log('✅ Email sent via SendGrid to:', options.to);
        return true;
      }
      
      // SMTP
      if (this.transporter) {
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html
        });
        console.log('✅ Email sent via SMTP to:', options.to);
        return true;
      }
      
      // Development mode - simulate email
      console.log('📧 SIMULATED EMAIL:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('From:', from);
      console.log('---');
      return true;
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }
  
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a73e8; text-align: center;">مرحباً بك في منصة سيادة AI</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          أهلاً ${userName}،
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          نحن سعداء بانضمامك إلى منصة سيادة AI لأتمتة الأعمال بالذكاء الاصطناعي.
        </p>
        <h2 style="color: #333;">ما يمكنك فعله الآن:</h2>
        <ul style="font-size: 16px; line-height: 1.8;">
          <li>إدارة فريقك الذكي من الوكلاء</li>
          <li>أتمتة عمليات البيع والتسويق</li>
          <li>تحليل البيانات بالذكاء الاصطناعي</li>
          <li>إدارة علاقات العملاء</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/dashboard" 
             style="background-color: #1a73e8; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            ابدأ الآن
          </a>
        </div>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          منصة سيادة AI - أتمتة الأعمال بالذكاء الاصطناعي
        </p>
      </div>
    `;
    
    return this.send({
      to,
      subject: 'مرحباً بك في منصة سيادة AI',
      html
    });
  }
  
  /**
   * Send notification email
   */
  async sendNotificationEmail(to: string, title: string, message: string): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          ${message}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/notifications" 
             style="background-color: #1a73e8; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            عرض التفاصيل
          </a>
        </div>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          منصة سيادة AI - أتمتة الأعمال بالذكاء الاصطناعي
        </p>
      </div>
    `;
    
    return this.send({
      to,
      subject: title,
      html
    });
  }
  
  /**
   * Send report email
   */
  async sendReportEmail(to: string, reportType: string, reportData: any): Promise<boolean> {
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">تقرير ${reportType}</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          تم إنشاء التقرير المطلوب بنجاح.
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333;">ملخص التقرير:</h3>
          <ul style="font-size: 14px; line-height: 1.8;">
            ${Object.entries(reportData).map(([key, value]) => 
              `<li><strong>${key}:</strong> ${value}</li>`
            ).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/reports" 
             style="background-color: #1a73e8; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            عرض التقرير الكامل
          </a>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          منصة سيادة AI - أتمتة الأعمال بالذكاء الاصطناعي
        </p>
      </div>
    `;
    
    return this.send({
      to,
      subject: `تقرير ${reportType} - منصة سيادة AI`,
      html
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return emailService.send(options);
}

export default emailService;