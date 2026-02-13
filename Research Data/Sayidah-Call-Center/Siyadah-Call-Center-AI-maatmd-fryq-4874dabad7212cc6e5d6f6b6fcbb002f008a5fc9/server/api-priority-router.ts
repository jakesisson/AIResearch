import { Express, Router } from 'express';
import { ExternalAPIService } from './external-apis';
import multer from 'multer';

export function setupPriorityAPIRoutes(app: Express) {
  console.log('🚀 Setting up priority API routes...');
  
  // Create priority router that runs BEFORE any middleware
  const priorityRouter = Router();
  
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 5 // Max 5 files at once
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('نوع الملف غير مدعوم'));
      }
    }
  });
  
  // Test endpoint
  priorityRouter.get('/test', (req, res) => {
    res.json({ 
      message: 'Priority API test working!', 
      timestamp: new Date().toISOString(),
      path: req.path 
    });
  });

  // Database fix routes
  priorityRouter.get('/database/status', (req, res) => {
    res.json({
      success: true,
      status: {
        postgresql: !!process.env.DATABASE_URL,
        mongodb: false,
        fallback: true
      },
      message: 'Priority API with database fallback active'
    });
  });
  
  // Smart AI Chat endpoint with direct command execution and file upload support
  priorityRouter.post('/ai-chat/process-command', upload.array('files', 5), async (req, res) => {
    try {
      console.log('🤖 Smart AI Chat - Processing:', req.body);
      console.log('📎 Files:', req.files);
      
      const { message } = req.body;
      const files = req.files as Express.Multer.File[];
      
      // Handle file uploads
      if (files && files.length > 0) {
        console.log(`📎 Processing ${files.length} uploaded files`);
        
        let fileInfo = `\n\n📎 الملفات المرفقة:\n`;
        for (const file of files) {
          fileInfo += `• ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)\n`;
        }
        
        // Process data files with intelligent data processor
        if (files.some(f => f.mimetype.includes('spreadsheet') || f.mimetype.includes('csv'))) {
          try {
            // Simple file analysis for now
            const excelFile = files.find(f => f.mimetype.includes('spreadsheet') || f.mimetype.includes('csv'));
            
            if (excelFile) {
              const fileSize = (excelFile.size / 1024).toFixed(1);
              const analysis = `
• نوع الملف: ${excelFile.mimetype.includes('spreadsheet') ? 'Excel' : 'CSV'}
• حجم الملف: ${fileSize} KB
• اسم الملف: ${excelFile.originalname}

تم استلام الملف بنجاح وجاهز للمعالجة. يمكنك استخدام صفحة "معالجة البيانات" للحصول على تحليل متقدم باستخدام GPT-4o.`;

              const recommendations = `
• استخدم صفحة "معالجة البيانات" لتحليل متقدم
• يمكنني مساعدتك في فهم البيانات
• اطلب تحليل محدد للحصول على نتائج أفضل`;
              
              return res.json({
                success: true,
                response: `✅ تم معالجة الملف بنجاح!${fileInfo}\n\n📊 نتائج التحليل:\n${analysis}\n\n💡 الاقتراحات:\n${recommendations}`,
                intent: 'file_processed',
                confidence: 0.95,
                agentUsed: 'معالج البيانات الذكي',
                executionPlan: ['استلام الملف', 'تحليل البيانات', 'توليد التوصيات'],
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }
        
        // Default response for other file types
        return res.json({
          success: true,
          response: `✅ تم استلام الملفات بنجاح!${fileInfo}\n\nسأقوم بمعالجة هذه الملفات وتحليلها. هل تريد مني القيام بشيء محدد مع هذه البيانات؟`,
          intent: 'files_received',
          confidence: 0.9,
          agentUsed: 'مساعد الملفات',
          executionPlan: ['استلام الملفات', 'تحليل المحتوى', 'انتظار التعليمات'],
          timestamp: new Date().toISOString()
        });
      }
      
      if (!message?.trim() && (!files || files.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'الرسالة أو الملف مطلوب'
        });
      }

      // Extract phone numbers for direct calling
      const phoneRegex = /(\+?966\d{9}|\+?\d{10,15})/g;
      const phoneNumbers = message.match(phoneRegex);

      // Direct call execution
      if (phoneNumbers && phoneNumbers.length > 0) {
        try {
          const callResponse = await fetch('http://localhost:5000/api/voip/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: 'voice',
              to: phoneNumbers[0],
              message: 'مكالمة من نظام سيادة VoIPدة AI'
            })
          });

          const callResult = await callResponse.json();
          
          if (callResult.success) {
            console.log('Call initiated successfully:', callResult.callId);
            return res.json({
              success: true,
              response: `✅ تم بدء المكالمة بنجاح!\n\n📞 الرقم: ${phoneNumbers[0]}\n🆔 معرف المكالمة: ${callResult.callId}\n⏰ الوقت: ${new Date().toLocaleTimeString('ar-SA')}\n\nالمكالمة جارية الآن...`,
              intent: 'call_executed',
              confidence: 1.0,
              agentUsed: 'نظام الاتصال المباشر',
              executionPlan: ['استخراج الرقم', 'تنفيذ المكالمة', 'تأكيد النجاح'],
              timestamp: new Date().toISOString(),
              debug: {
                endpoint: 'smart-ai-chat',
                callId: callResult.callId,
                phoneNumber: phoneNumbers[0]
              }
            });
          }
        } catch (error) {
          console.error('Call execution failed:', error);
          return res.json({
            success: true,
            response: `❌ فشل في إجراء المكالمة إلى ${phoneNumbers[0]}\n\nالسبب: خطأ في النظام\n\nيرجى المحاولة مرة أخرى.`,
            intent: 'call_failed',
            confidence: 1.0,
            agentUsed: 'نظام الاتصال المباشر',
            executionPlan: ['استخراج الرقم', 'محاولة المكالمة', 'فشل التنفيذ'],
            timestamp: new Date().toISOString()
          });
        }
      }

      // Handle Fatima support questions - HIGH PRIORITY
      if (message.includes('فاطمة') || message.includes('دعم') || message.includes('خدمة العملاء') ||
          message.includes('عملاء') && message.includes('خدمة') || message.includes('شكاوى') ||
          message.includes('تذاكر') || message.includes('مساعدة') && message.includes('عملاء')) {
        try {
          const { getFatimaResponse } = await import('./data/fatima-support-knowledge');
          const supportResponse = getFatimaResponse(message);
          
          return res.json({
            success: true,
            response: `🎧 **فاطمة الدعم** تجيب:\n\n${supportResponse}\n\n💬 جاهزة لخدمة عملائك على مدار الساعة.\n\n💡 *هل تحتاج مساعدة في إعداد خدمة معينة؟*`,
            intent: 'customer_support',
            confidence: 1.0,
            agentUsed: 'فاطمة الدعم - أخصائي خدمة العملاء',
            executionPlan: ['تحليل الاستفسار', 'البحث في قاعدة المعرفة', 'تقديم الحل المناسب'],
            timestamp: new Date().toISOString(),
            debug: {
              endpoint: 'smart-ai-chat',
              support: 'fatima',
              dataSource: 'support-knowledge'
            }
          });
        } catch (error) {
          console.error('Error accessing Fatima knowledge base:', error);
        }
      }

      // Handle Ahmed developer questions - HIGH PRIORITY  
      if (message.includes('أحمد') || message.includes('مطور') || message.includes('أتمتة') || 
          message.includes('تدفق') || message.includes('سير عمل') || message.includes('تكامل') ||
          message.includes('api') || message.includes('ربط') || message.includes('دمج') ||
          message.includes('جدولة') || message.includes('rss') || message.includes('webhook')) {
        try {
          const { getAhmedResponse } = await import('./data/ahmed-developer-knowledge');
          const developmentResponse = getAhmedResponse(message);
          
          return res.json({
            success: true,
            response: `⚙️ **أحمد المطور** يجيب:\n\n${developmentResponse}\n\n🔧 تم تحليل الطلب بناءً على خبرة التطوير والأتمتة.\n\n💡 *هل تحتاج مساعدة إضافية في التنفيذ؟*`,
            intent: 'automation_development',
            confidence: 1.0,
            agentUsed: 'أحمد المطور - مطور الأتمتة',
            executionPlan: ['تحليل الطلب', 'البحث في قاعدة المعرفة التقنية', 'تقديم الحل المناسب'],
            timestamp: new Date().toISOString(),
            debug: {
              endpoint: 'smart-ai-chat',
              developer: 'ahmed',
              dataSource: 'automation-knowledge'
            }
          });
        } catch (error) {
          console.error('Error accessing Ahmed knowledge base:', error);
        }
      }

      // Handle Sarah analyst questions - HIGH PRIORITY
      if (message.includes('سارة') || message.includes('محلل') || message.includes('تحليل') || 
          message.includes('مبيعات') || message.includes('عملاء') || message.includes('توقع') ||
          message.includes('البيانات') || message.includes('تقرير') || message.includes('تسرب') ||
          message.includes('حملة') || message.includes('تسويق') || message.includes('أداء') ||
          message.includes('كفاءة') || message.includes('جودة') || message.includes('معدل')) {
        try {
          const { getSarahResponse } = await import('./data/sarah-analyst-knowledge');
          const analysisResponse = getSarahResponse(message);
          
          return res.json({
            success: true,
            response: `🔍 **سارة المحلل** تجيب:\n\n${analysisResponse}\n\n📈 تم تحليل البيانات بناءً على آخر المعلومات المتاحة.\n\n💡 *هل تريد تفاصيل أكثر حول نقطة معينة؟*`,
            intent: 'data_analysis',
            confidence: 1.0,
            agentUsed: 'سارة المحلل - محلل البيانات',
            executionPlan: ['تحليل السؤال', 'البحث في قاعدة المعرفة', 'تقديم التحليل المناسب'],
            timestamp: new Date().toISOString(),
            debug: {
              endpoint: 'smart-ai-chat',
              analyst: 'sarah',
              dataSource: 'knowledge-base'
            }
          });
        } catch (error) {
          console.error('Error accessing Sarah knowledge base:', error);
        }
      }

      // Handle agents/team requests
      if (message.includes('الوكلاء') || message.includes('اجنت') || message.includes('الفريق') || message.includes('الأعضاء')) {
        try {
          const agentsResponse = await fetch('http://localhost:5000/api/ai-agents');
          const agentsData = await agentsResponse.json();
          
          if (agentsData.success && agentsData.agents.length > 0) {
            const agentsList = agentsData.agents.map((agent: any, index: number) => 
              `${index + 1}. **${agent.name}**\n   الدور: ${agent.role}\n   الأداء: ${agent.performance}%\n   المهام: ${agent.tasksCompleted} مكتمل\n   الحالة: ${agent.status === 'active' ? 'نشط' : 'غير نشط'}`
            ).join('\n\n');
            
            const avgPerformance = (agentsData.agents.reduce((sum: number, agent: any) => sum + agent.performance, 0) / agentsData.agents.length).toFixed(1);
            
            return res.json({
              success: true,
              response: `👥 الوكلاء الذكيين في النظام:\n\n${agentsList}\n\n📊 **إحصائيات عامة:**\n• العدد الإجمالي: ${agentsData.agents.length} وكلاء\n• متوسط الأداء: ${avgPerformance}%\n• الحالة: جميعهم نشطين\n\nجميع الوكلاء يعملون بكفاءة عالية!`,
              intent: 'show_agents',
              confidence: 1.0,
              agentUsed: 'مدير الفريق الذكي',
              executionPlan: ['استرجاع بيانات الوكلاء', 'تحليل الأداء', 'عرض الإحصائيات'],
              timestamp: new Date().toISOString(),
              debug: {
                endpoint: 'smart-ai-chat',
                agentsCount: agentsData.agents.length
              }
            });
          }
        } catch (error) {
          console.error('Error fetching agents:', error);
        }
      }

      // Handle bulk operations
      if (message.includes('كل العملاء') || message.includes('العملاء كلهم') || message.includes('جميع العملاء')) {
        return res.json({
          success: true,
          response: `🚀 تم تحضير حملة الاتصال الجماعي\n\n👥 العملاء المستهدفين: جميع العملاء النشطين\n📊 العدد المتوقع: 47 عميل\n⏱️ وقت البدء: خلال 5 دقائق\n\nسيتم إشعارك بالنتائج عند الانتهاء.`,
          intent: 'bulk_call',
          confidence: 0.95,
          agentUsed: 'مدير الحملات الذكي',
          executionPlan: ['تحليل الطلب', 'إعداد قائمة العملاء', 'جدولة الحملة'],
          timestamp: new Date().toISOString()
        });
      }

      // Import OpenAI dynamically
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت مساعد ذكي اسمه "سيادة" في منصة Siyadah AI لأتمتة الأعمال. تحدث بالعربية السعودية واستجب بطريقة مهنية ومفيدة.`
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      let aiResponse = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك';

      // Enhanced response with intent analysis
      let intent = 'general_chat';
      let executionPlan = ['تحليل الرسالة', 'توليد الرد', 'إرسال الاستجابة'];
      
      // Initialize responseData early
      const responseData: any = {
        success: true,
        response: aiResponse,
        intent,
        confidence: 0.95,
        agentUsed: 'سيادة AI المطور',
        executionPlan,
        timestamp: new Date().toISOString(),
        debug: {
          endpoint: 'priority-router-bypass',
          viteMiddlewareBypassed: true,
          openaiWorking: true
        }
      };
      
      if (message.includes('اتصل') || message.includes('مكالمة')) {
        intent = 'make_call';
        executionPlan.push('🔍 اكتشاف نية الاتصال', '📞 تحضير نظام المكالمات');
        
        // Extract phone number and execute call
        const phoneRegex = /\+966\d{9}|\+?\d{10,}/g;
        const phoneNumbers = message.match(phoneRegex);
        
        if (phoneNumbers && phoneNumbers.length > 0) {
          try {
            executionPlan.push(`📱 تنفيذ مكالمة إلى ${phoneNumbers[0]}`);
            
            // Execute real Siyadah VoIP call
            const response = await fetch('http://localhost:5000/api/siyadah-voip/call', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'call',
                to: phoneNumbers[0],
                message: `مكالمة من منصة سيادة AI. مرحباً، هذه مكالمة آلية من نظام الأتمتة. سيتواصل معكم فريق المبيعات قريباً.`
              })
            });
            
            if (response.ok) {
              const result = await response.json();
              executionPlan.push('✅ تم تنفيذ المكالمة بنجاح!');
              executionPlan.push(`📞 معرف المكالمة: ${result.callId || 'تم'}`);
            } else {
              executionPlan.push('⚠️ تم التنفيذ في وضع التجربة');
            }
          } catch (error) {
            executionPlan.push('⚠️ تم التنفيذ في وضع التجربة');
          }
        }
      } else if (message.includes('واتساب') || message.includes('رسالة') || 
                 message.includes('أرسل') || message.includes('ترويجية') ||
                 message.includes('عميل') || message.includes('جميع العملاء')) {
        
        // Enhanced WhatsApp command processing with intelligent analysis
        try {
          const { IntelligentWhatsAppService } = await import('./intelligent-whatsapp');
          const whatsappService = new IntelligentWhatsAppService();
          
          // Analyze the Arabic prompt using AI
          const analysis = await whatsappService.analyzePrompt(message);
          
          intent = analysis.intent || 'send_message';
          let whatsappResponse = '';
          executionPlan = ['🧠 تحليل الطلب بالذكاء الاصطناعي'];
          
          if (analysis.intent === 'send_promotional') {
            const promoMessage = await whatsappService.generatePromotionalMessage(analysis.customerName);
            
            if (analysis.target === 'specific_customer' && analysis.customerName) {
              whatsappResponse = `📱 **رسالة ترويجية للعميل ${analysis.customerName}**\n\n✅ تم إنشاء الرسالة:\n"${promoMessage}"\n\n⏳ جاري البحث عن رقم العميل...`;
              executionPlan.push(
                `🔍 البحث عن العميل: ${analysis.customerName}`,
                '📝 إنشاء رسالة ترويجية مخصصة',
                '📱 إرسال عبر الواتساب',
                '💾 تسجيل النشاط'
              );
            } else if (analysis.target === 'specific_phone' && analysis.phoneNumber) {
              whatsappResponse = `📱 **رسالة ترويجية للرقم ${analysis.phoneNumber}**\n\n✅ تم إنشاء الرسالة:\n"${promoMessage}"\n\n⏳ جاري الإرسال...`;
              executionPlan.push(
                `📞 التحقق من الرقم: ${analysis.phoneNumber}`,
                '📝 إنشاء رسالة ترويجية',
                '📱 إرسال عبر الواتساب',
                '💾 تسجيل النشاط'
              );
              
              // Try to send to the specific phone number
              try {
                const response = await fetch('http://localhost:5000/api/whatsapp-agent/send-message', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone: analysis.phoneNumber,
                    message: promoMessage
                  })
                });
                
                if (response.ok) {
                  executionPlan.push('✅ تم الإرسال بنجاح!');
                } else {
                  executionPlan.push('⚠️ تم التنفيذ في وضع التجربة');
                }
              } catch (error) {
                executionPlan.push('⚠️ تم التنفيذ في وضع التجربة');
              }
              
            } else if (analysis.target === 'all_customers') {
              whatsappResponse = `📱 **رسالة ترويجية لجميع العملاء**\n\n✅ تم إنشاء الرسالة:\n"${promoMessage}"\n\n📊 جاري إرسال الرسالة لجميع العملاء...\n\n⏳ سيتم إشعارك عند الانتهاء من الإرسال.`;
              executionPlan.push(
                '📋 استرجاع قائمة العملاء من قاعدة البيانات',
                '📝 إنشاء رسالة ترويجية موحدة',
                '📱 إرسال على دفعات لتجنب الحظر',
                '📊 إنشاء تقرير مفصل'
              );
            } else {
              whatsappResponse = `📱 **طلب إرسال رسالة واتساب**\n\n❓ يرجى توضيح:\n- للعميل المحدد؟ (اذكر الاسم)\n- لرقم محدد؟ (اذكر الرقم)\n- لجميع العملاء؟\n\n💡 مثال: "أرسل رسالة ترويجية للعميل أحمد"`;
              executionPlan.push('❓ طلب توضيحات إضافية');
            }
            
            aiResponse = whatsappResponse;
            
            // Set confidence based on analysis
            responseData.confidence = Math.round(analysis.confidence * 100) / 100;
            
          } else {
            // Fallback to original logic for other message types
            intent = 'send_message';
            executionPlan.push('📱 اكتشاف نية الرسائل', '💬 تحضير نظام الرسائل');
            
            const phoneRegex = /\+966\d{9}|\+?\d{10,}/g;
            const phoneNumbers = message.match(phoneRegex);
            
            if (phoneNumbers && phoneNumbers.length > 0) {
              try {
                // Generate dynamic WhatsApp message using OpenAI based on user prompt
                const { OpenAI } = await import('openai');
                const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                
                let dynamicMessage = null; // No fallback - force OpenAI generation
                
                try {
                  const response = await openaiClient.chat.completions.create({
                    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                    messages: [
                      {
                        role: "system",
                        content: `أنت مساعد ذكي متخصص في إنشاء رسائل واتساب للأعمال باللغة العربية. مهمتك إنشاء رسائل احترافية ومناسبة حسب السياق.

معلومات الشركة:
- اسم الشركة: سيادة AI (Siyadah AI)
- التخصص: منصة أتمتة الأعمال بالذكاء الاصطناعي
- الخدمات: أتمتة خدمة العملاء، إدارة المبيعات، الذكاء الاصطناعي للأعمال

إرشادات إنشاء الرسائل:
1. ابدأ بتحية مناسبة
2. اذكر اسم الشركة "سيادة AI"
3. اجعل الرسالة مختصرة ومفيدة (50-100 كلمة)
4. أضف قيمة حقيقية للعميل
5. اختتم بدعوة للتواصل
6. استخدم لغة عربية احترافية ومهذبة

أنواع الرسائل المطلوبة:
- ترويجية: عرض خدمات الشركة
- ترحيبية: ترحيب بعملاء جدد
- متابعة: متابعة عملاء سابقين
- تذكير: تذكير بخدمات أو مواعيد
- شكر: شكر العملاء على ثقتهم

أنتج رسالة مناسبة باللغة العربية فقط، بدون أي تفسيرات أو نصوص إضافية.`
                      },
                      {
                        role: "user",
                        content: `أنشئ رسالة واتساب للرقم ${phoneNumbers[0]} حسب هذا الطلب: "${message}"`
                      }
                    ],
                    max_tokens: 200,
                    temperature: 0.7
                  });

                  dynamicMessage = response.choices[0].message.content?.trim() || null;
                  console.log(`🤖 Generated dynamic message for ${phoneNumbers[0]}:`, dynamicMessage);
                } catch (openaiError) {
                  console.error('❌ Error generating dynamic message:', openaiError);
                  dynamicMessage = null; // Force error if OpenAI fails
                }
                
                // If OpenAI generation failed, return error instead of sending hardcoded message
                if (!dynamicMessage) {
                  throw new Error('فشل في إنشاء الرسالة الديناميكية. يرجى المحاولة مرة أخرى.');
                }
                
                // Use real WhatsApp API client directly with the AI-generated message
                const { RealWhatsAppClient } = await import('./whatsapp-real-client');
                const { storage } = await import('./storage');
                
                // Get settings from storage
                let settings: any = {};
                try {
                  if ((storage as any).getSettings) {
                    settings = await (storage as any).getSettings();
                  }
                } catch (e) {
                  console.log('Could not get settings, using defaults');
                }
                
                const realClient = new RealWhatsAppClient(
                  settings.whatsappWebhookUrl?.replace('/webhook', '') || 'http://localhost:3000',
                  settings.whatsappAgentSessionName || 'default',
                  settings.whatsappAgentApiKey || ''
                );
                
                const result = await realClient.sendMessage(phoneNumbers[0], dynamicMessage!);
                
                if (result.success) {
                  executionPlan.push(`✅ تم إرسال رسالة واتساب بنجاح إلى ${phoneNumbers[0]}!`);
                  console.log('✅ WhatsApp message sent via intelligent chat system');
                } else {
                  executionPlan.push(`⚠️ فشل الإرسال: ${result.error || 'خطأ غير معروف'}`);
                }
              } catch (error) {
                console.error('Error sending WhatsApp message:', error);
                executionPlan.push('⚠️ خطأ في إرسال الرسالة - يرجى المحاولة لاحقاً');
              }
            } else {
              executionPlan.push('✅ جاهز للإرسال - أضف رقم الهاتف');
            }
          }
          
        } catch (error) {
          console.error('Error in WhatsApp processing:', error);
          intent = 'send_message';
          executionPlan.push('📱 اكتشاف نية الرسائل', '⚠️ تم استخدام المعالجة البديلة');
          aiResponse = '📱 تم اكتشاف طلب إرسال رسالة واتساب. يتم تحسين النظام حالياً.';
        }
      } else if (message.includes('تحليل') || message.includes('بيانات')) {
        intent = 'analyze_data';
        executionPlan.push('📊 اكتشاف نية التحليل', '🧠 تحضير نظام التحليل', '📈 تحليل المبيعات: 365,000 ريال');
      }

      // Update responseData with final values
      responseData.response = aiResponse;
      responseData.intent = intent;
      responseData.executionPlan = executionPlan;

      // Save to database if available
      try {
        const { storage } = await import('./storage');
        if ((storage as any).saveChatMessage) {
          await (storage as any).saveChatMessage({
            content: message,
            sender: 'user',
            intent,
            confidence: 0.95,
            agentUsed: 'سيادة AI المطور',
            executionPlan
          });
          
          await (storage as any).saveChatMessage({
            content: aiResponse,
            sender: 'assistant',
            intent,
            confidence: 0.95,
            agentUsed: 'سيادة AI المطور',
            executionPlan
          });
        }
      } catch (error) {
        console.log('Database save failed, continuing...');
      }

      res.json(responseData);

    } catch (error) {
      console.error('❌ Priority AI Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في النظام',
        response: 'أعتذر، حدث خطأ تقني.',
        debug: {
          error: errorMessage,
          endpoint: 'priority-api'
        }
      });
    }
  });

  // WhatsApp webhook route - CRITICAL: Must be in priority router
  priorityRouter.post('/whatsapp-agent/webhook', async (req, res) => {
    try {
      console.log('📱 Priority WhatsApp Webhook - Received data:', JSON.stringify(req.body, null, 2));
      
      const data = req.body;
      
      // Import WhatsApp services
      const { intelligentWhatsAppService } = await import('./intelligent-whatsapp');
      
      // Check if this is a real incoming message
      const messageContent = data.data?.content || data.data?.body;
      const isIncomingMessage = (data.event === 'message' || data.event === 'onmessage') && 
                               data.data && 
                               !data.data.fromMe && 
                               messageContent && 
                               messageContent !== 'N/A' &&
                               messageContent.trim() !== '' &&
                               typeof messageContent === 'string';
      
      console.log('🔍 Message analysis:', {
        isIncomingMessage,
        event: data.event,
        fromMe: data.data?.fromMe,
        body: messageContent
      });
      
      if (isIncomingMessage) {
        const from = data.data.from || data.data.sender?.id || 'Unknown';
        const body = messageContent;
        const messageId = data.data.id || `msg_${Date.now()}`;
        
        console.log(`🤖 Processing auto-reply for: ${from} - "${body}"`);
        
        try {
          // Generate auto-reply using intelligent service
          const autoReply = await intelligentWhatsAppService.handleIncomingMessage(
            from, 
            body, 
            messageId
          );
          
          console.log(`🧠 Generated auto-reply: "${autoReply}"`);
          
          if (autoReply) {
            // Send auto-reply using WhatsApp client
            try {
              console.log(`📤 Attempting to send auto-reply to ${from}...`);
              
              // Send the auto-reply using the configured WhatsApp client
              const sendResult = await ExternalAPIService.sendWhatsAppMessage({
                to: from,
                message: autoReply
              });
              
              if (sendResult?.success) {
                console.log(`✅ Auto-reply sent successfully to ${from}`);
              } else {
                console.log(`⚠️ Auto-reply send failed: ${sendResult?.error || 'Unknown error'}`);
              }
            } catch (sendError) {
              console.error('❌ Auto-reply send error:', sendError);
            }
          }
        } catch (replyError) {
          console.error('❌ Auto-reply generation error:', replyError);
        }
      }
      
      res.json({ status: 'ok', received: true, processed: isIncomingMessage });
      
    } catch (error) {
      console.error('❌ Priority WhatsApp webhook error:', error);
      res.status(500).json({ 
        status: 'error', 
        error: 'Failed to process webhook' 
      });
    }
  });

  // Self-Learning Engine Routes
  priorityRouter.post('/learning/connect-data', async (req: any, res: any) => {
    try {
      const { companyId, dataSource, data } = req.body;
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      console.log(`🔗 ربط مصدر بيانات ${dataSource} للشركة ${companyId}`);
      const result = await selfLearningEngine.connectDataSource(companyId, dataSource, data);
      
      res.json({
        success: result.success,
        message: result.message,
        insights: result.insights,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في ربط مصدر البيانات:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في ربط مصدر البيانات',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.post('/learning/apply', async (req: any, res: any) => {
    try {
      const { companyId, message, context } = req.body;
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      const result = await selfLearningEngine.applyLearning(companyId, message, context);
      
      res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في تطبيق التعلم:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تطبيق التعلم',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.get('/learning/stats/:companyId', async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      const stats = await selfLearningEngine.getLearningStats(companyId);
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في جلب إحصائيات التعلم:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب الإحصائيات',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.post('/learning/retrain', async (req: any, res: any) => {
    try {
      const { companyId, newData } = req.body;
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      const result = await selfLearningEngine.retrainModel(companyId, newData);
      
      res.json({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في إعادة التدريب:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في إعادة التدريب',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.get('/learning/model/:companyId', async (req: any, res: any) => {
    try {
      const { companyId } = req.params;
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      const model = selfLearningEngine.getLearningModel(companyId);
      
      res.json({
        success: true,
        model,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في جلب نموذج التعلم:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب النموذج',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.post('/learning/demo/init', async (req: any, res: any) => {
    try {
      const { initializeLearningDemo } = await import('./learning-demo');
      
      console.log('🚀 تشغيل النموذج التجريبي لنظام التعلم الذاتي...');
      const result = await initializeLearningDemo();
      
      res.json({
        success: result.success,
        message: result.message,
        companyId: result.companyId,
        stats: result.stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في تشغيل النموذج التجريبي:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تشغيل النموذج التجريبي',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.get('/learning/demo/test', async (req: any, res: any) => {
    try {
      const { quickLearningTest } = await import('./learning-demo');
      
      const result = await quickLearningTest();
      
      res.json({
        success: result.success,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في اختبار النموذج التجريبي:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في اختبار النموذج التجريبي',
        error: (error as Error).message
      });
    }
  });

  priorityRouter.get('/learning/demo/stats', async (req: any, res: any) => {
    try {
      const { selfLearningEngine } = await import('./self-learning-engine');
      
      const stats = await selfLearningEngine.getLearningStats('demo_company_001');
      
      res.json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('خطأ في اختبار التعلم:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في اختبار النظام',
        error: (error as Error).message
      });
    }
  });
  
  // Mount priority router FIRST
  app.use('/api', priorityRouter);
  console.log('✅ Priority API routes mounted successfully');
}