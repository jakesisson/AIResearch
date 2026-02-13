/**
 * Intelligent Communication API
 * Provides context-aware, human-like AI customer interactions
 */

import { Request, Response } from 'express';
import IntelligentCommunicationSystem from './intelligent-communication-system';
import RealManagementHierarchy from './real-management-hierarchy';

export class IntelligentCommunicationAPI {
  
  // Process incoming WhatsApp message with full context awareness
  static async processWhatsAppMessage(req: Request, res: Response) {
    try {
      const { customerId, message, customerInfo } = req.body;
      
      if (!customerId || !message) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID and message are required'
        });
      }

      // Process with intelligent system
      const result = await IntelligentCommunicationSystem.processIncomingMessage(
        customerId,
        message,
        'whatsapp'
      );

      // Send response back via WhatsApp
      try {
        const { ExternalAPIService } = await import('./external-apis');
        const whatsappResult = await ExternalAPIService.sendWhatsAppMessage({
          to: customerId,
          message: result.response
        });

        return res.json({
          success: true,
          response: result.response,
          agent: result.agent,
          confidence: result.confidence,
          intent: result.intent,
          urgency: result.urgency,
          followUpRequired: result.followUpRequired,
          whatsappSent: whatsappResult.success,
          messageId: whatsappResult.messageId,
          customerReport: result.customerReport,
          timestamp: new Date().toISOString()
        });

      } catch (whatsappError) {
        console.error('WhatsApp sending failed:', whatsappError);
        
        // Still return the AI response even if WhatsApp fails
        return res.json({
          success: true,
          response: result.response,
          agent: result.agent,
          confidence: result.confidence,
          intent: result.intent,
          urgency: result.urgency,
          followUpRequired: result.followUpRequired,
          whatsappSent: false,
          error: 'WhatsApp delivery failed',
          customerReport: result.customerReport,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Intelligent communication error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process message',
        message: 'حدث خطأ في معالجة الرسالة'
      });
    }
  }

  // Process voice call with intelligent conversation
  static async processVoiceCall(req: Request, res: Response) {
    try {
      const { customerId, spokenText, callId } = req.body;
      
      if (!customerId || !spokenText) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID and spoken text are required'
        });
      }

      // Process with intelligent system
      const result = await IntelligentCommunicationSystem.processIncomingMessage(
        customerId,
        spokenText,
        'voice'
      );

      // Generate TwiML response for voice
      const twimlResponse = `
        <Response>
          <Say voice="alice" language="ar-EG">${result.response}</Say>
          ${result.followUpRequired ? '<Gather input="speech" language="ar-EG" speechTimeout="5" action="/api/communication/voice-followup" />' : ''}
        </Response>
      `;

      return res.set('Content-Type', 'text/xml').send(twimlResponse);

    } catch (error) {
      console.error('Voice call processing error:', error);
      
      // Fallback TwiML response
      const fallbackResponse = `
        <Response>
          <Say voice="alice" language="ar-EG">نعتذر، حدث خطأ تقني. سيتم تحويلك إلى أحد ممثلي خدمة العملاء.</Say>
          <Dial>+966501234567</Dial>
        </Response>
      `;
      
      return res.set('Content-Type', 'text/xml').send(fallbackResponse);
    }
  }

  // Get customer interaction history and insights
  static async getCustomerInsights(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const customerReport = IntelligentCommunicationSystem.getCustomerReport(customerId);
      
      if (!customerReport) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      return res.json({
        success: true,
        customer: customerReport.customer,
        interactions: customerReport.interactions,
        recommendations: customerReport.recommendations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Customer insights error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get customer insights'
      });
    }
  }

  // Get real-time agent performance dashboard
  static async getAgentPerformance(req: Request, res: Response) {
    try {
      const hierarchy = RealManagementHierarchy.getCompleteHierarchy();
      const performanceReport = RealManagementHierarchy.getAgentPerformanceReport();
      
      return res.json({
        success: true,
        overview: {
          totalAgents: performanceReport.totalAgents,
          averageResponseTime: performanceReport.averageResponseTime,
          averageAccuracy: performanceReport.averageAccuracy,
          averageSatisfaction: performanceReport.averageSatisfaction,
          totalConversations: performanceReport.totalConversations
        },
        topPerformers: performanceReport.topPerformers,
        agentDetails: hierarchy.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          specialization: agent.specialization,
          performance: agent.performance,
          manager: hierarchy.managers.find(m => m.id === agent.managerId)?.name || 'Direct Report'
        })),
        managementStructure: {
          ceo: hierarchy.ceo,
          directors: hierarchy.directors.length,
          managers: hierarchy.managers.length,
          totalStaff: hierarchy.totalStaff
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Agent performance error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get agent performance data'
      });
    }
  }

  // Update customer profile manually
  static async updateCustomerProfile(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const updates = req.body;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      // Update customer profile
      IntelligentCommunicationSystem.updateCustomerProfile(customerId, {
        ...updates,
        timestamp: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Customer profile updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update customer profile'
      });
    }
  }

  // Generate proactive customer outreach suggestions
  static async getOutreachSuggestions(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const customerReport = IntelligentCommunicationSystem.getCustomerReport(customerId);
      
      if (!customerReport) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      const suggestions = [];
      
      // Analyze customer data to generate suggestions
      if (customerReport.interactions.pending > 2) {
        suggestions.push({
          type: 'follow_up',
          priority: 'high',
          message: 'عميل لديه استفسارات معلقة - يحتاج متابعة فورية',
          suggestedAction: 'اتصال مباشر أو رسالة واتساب شخصية',
          timing: 'الآن'
        });
      }

      if (customerReport.interactions.averageSentiment < 0) {
        suggestions.push({
          type: 'recovery',
          priority: 'high', 
          message: 'عميل غير راضي - يحتاج تدخل إداري',
          suggestedAction: 'تصعيد للمدير مع عرض تعويض',
          timing: 'خلال ساعة'
        });
      }

      if (customerReport.interactions.engagementScore > 70) {
        suggestions.push({
          type: 'upsell',
          priority: 'medium',
          message: 'عميل مهتم جداً - فرصة لترقية الخدمة',
          suggestedAction: 'عرض خطة أعلى مع خصم خاص',
          timing: 'خلال 24 ساعة'
        });
      }

      return res.json({
        success: true,
        customerId,
        suggestions,
        customerSummary: {
          name: customerReport.customer.name,
          totalInteractions: customerReport.interactions.total,
          lastInteraction: customerReport.interactions.lastInteraction?.timestamp,
          preferredChannel: customerReport.interactions.preferredChannel,
          engagementScore: customerReport.interactions.engagementScore
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Outreach suggestions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate outreach suggestions'
      });
    }
  }

  // Test intelligent conversation with sample scenarios
  static async testConversation(req: Request, res: Response) {
    try {
      const { scenario, message } = req.body;
      
      const testCustomerId = `test_${Date.now()}`;
      
      // Create test customer profile based on scenario
      const testScenarios: { [key: string]: any } = {
        'technical_support': {
          name: 'أحمد العميل',
          company: 'شركة التقنية المتقدمة',
          businessContext: { size: 'medium', industry: 'technology', needs: ['technical_support'] }
        },
        'sales_inquiry': {
          name: 'فاطمة المدير',
          company: 'مؤسسة النجاح',
          businessContext: { size: 'large', industry: 'retail', needs: ['crm_system'], decisionMaker: true }
        },
        'complaint': {
          name: 'سعد الزبون',
          company: 'متجر الابتكار',
          businessContext: { size: 'small', industry: 'ecommerce', needs: ['customer_service'] }
        }
      };

      const testProfile = testScenarios[scenario] || testScenarios['technical_support'];
      
      const result = await IntelligentCommunicationSystem.processIncomingMessage(
        testCustomerId,
        message || 'مرحباً، أحتاج مساعدة في نظامكم',
        'whatsapp'
      );

      return res.json({
        success: true,
        scenario,
        testResult: {
          customerProfile: testProfile,
          agentResponse: result.response,
          selectedAgent: result.agent,
          confidence: result.confidence,
          intent: result.intent,
          urgency: result.urgency,
          followUpRequired: result.followUpRequired
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Conversation test error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to test conversation'
      });
    }
  }
}

export default IntelligentCommunicationAPI;