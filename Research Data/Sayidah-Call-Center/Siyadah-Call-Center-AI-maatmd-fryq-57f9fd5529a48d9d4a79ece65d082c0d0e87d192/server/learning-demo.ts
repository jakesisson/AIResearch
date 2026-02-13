import { selfLearningEngine } from './self-learning-engine';

// نموذج تجريبي لإظهار قدرات نظام التعلم الذاتي
export async function initializeLearningDemo() {
  const companyId = 'demo_company_001';
  
  // بيانات تجريبية من مصادر مختلفة
  const demoData = [
    // بيانات من Google Sheets
    { id: 1, type: 'customer_inquiry', content: 'أريد معرفة أسعار نظام CRM', response: 'نظام CRM لدينا يبدأ من 45,000 ريال ويشمل إدارة العملاء والفرص والتقارير', category: 'pricing' },
    { id: 2, type: 'customer_inquiry', content: 'هل لديكم تطبيقات جوال؟', response: 'نعم، نقدم حلول التطبيقات بسعر 35,000 ريال مع واجهات مخصصة', category: 'services' },
    { id: 3, type: 'customer_inquiry', content: 'ما هي مدة التطوير؟', response: 'مدة التطوير عادة من 4-8 أسابيع حسب تعقيد المشروع', category: 'timeline' },
    
    // بيانات من محادثات واتساب
    { id: 4, type: 'whatsapp_message', content: 'السلام عليكم', response: 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك في سيادة AI', category: 'greeting' },
    { id: 5, type: 'whatsapp_message', content: 'أعطني عرض سعر للمطعم', response: 'نظام إدارة المطاعم لدينا يكلف 25,000 ريال ويشمل إدارة الطلبات والمخزون والتقارير', category: 'pricing' },
    { id: 6, type: 'whatsapp_message', content: 'هل يدعم النظام اللغة العربية؟', response: 'نعم، جميع أنظمتنا مصممة خصيصاً للسوق العربي مع دعم كامل للعربية', category: 'features' },
    
    // بيانات من نظام CRM
    { id: 7, type: 'crm_interaction', content: 'عميل مهتم بنظام المتاجر الإلكترونية', response: 'نظام التجارة الإلكترونية يبدأ من 15,000 ريال مع إدارة المنتجات والمدفوعات', category: 'pricing' },
    { id: 8, type: 'crm_interaction', content: 'استفسار عن الدعم الفني', response: 'نقدم دعم فني 24/7 مع فريق متخصص لضمان عمل النظام بكفاءة', category: 'support' },
    
    // بيانات من APIs خارجية
    { id: 9, type: 'api_request', content: 'طلب عرض تجريبي', response: 'يمكنك حجز عرض تجريبي مجاني لمدة 30 دقيقة مع فريقنا المتخصص', category: 'demo' },
    { id: 10, type: 'api_request', content: 'معلومات عن الشركة', response: 'سيادة AI شركة سعودية متخصصة في حلول الذكاء الاصطناعي وأتمتة الأعمال منذ 2024', category: 'company_info' }
  ];

  try {
    console.log('🚀 بدء تشغيل النموذج التجريبي لنظام التعلم الذاتي...');
    
    // ربط البيانات التجريبية
    const result = await selfLearningEngine.connectDataSource(
      companyId, 
      'manual', 
      demoData
    );

    if (result.success) {
      console.log('✅ تم ربط البيانات التجريبية بنجاح');
      console.log(`📊 تم تحليل ${demoData.length} سجل`);
      console.log('📈 الرؤى المكتشفة:', result.insights);
      
      // اختبار التعلم التلقائي
      const testMessages = [
        'كم سعر نظام CRM؟',
        'أريد نظام للمطعم',
        'هل تدعمون العربية؟',
        'أريد عرض تجريبي'
      ];

      console.log('\n🧪 اختبار النظام المتعلم:');
      for (const message of testMessages) {
        const response = await selfLearningEngine.applyLearning(companyId, message);
        console.log(`📝 السؤال: "${message}"`);
        console.log(`🤖 الرد: "${response.response}"`);
        console.log(`🎯 الثقة: ${(response.confidence * 100).toFixed(0)}%`);
        console.log(`📚 مصدر التعلم: ${response.learnedFrom}`);
        console.log('---');
      }

      // الحصول على إحصائيات التعلم
      const stats = await selfLearningEngine.getLearningStats(companyId);
      console.log('\n📊 إحصائيات النموذج:');
      console.log(`🎯 إجمالي الأنماط: ${stats.totalPatterns}`);
      console.log(`💬 إجمالي التفاعلات: ${stats.totalInteractions}`);
      console.log(`🎯 دقة التعلم: ${stats.learningAccuracy.toFixed(1)}%`);
      console.log(`🔝 أهم الأنماط:`, stats.topPatterns.slice(0, 3).map(p => p.pattern));
      
      return {
        success: true,
        companyId,
        stats,
        message: 'تم تشغيل النموذج التجريبي بنجاح'
      };
      
    } else {
      console.error('❌ فشل في ربط البيانات التجريبية');
      return {
        success: false,
        message: 'فشل في تشغيل النموذج التجريبي'
      };
    }
    
  } catch (error) {
    console.error('❌ خطأ في النموذج التجريبي:', error);
    return {
      success: false,
      message: 'حدث خطأ في تشغيل النموذج التجريبي'
    };
  }
}

// اختبار سريع للنظام
export async function quickLearningTest(companyId: string = 'demo_company_001') {
  try {
    const testMessage = 'كم سعر نظام المطاعم؟';
    const response = await selfLearningEngine.applyLearning(companyId, testMessage);
    
    return {
      success: true,
      testMessage,
      response: response.response,
      confidence: response.confidence,
      learnedFrom: response.learnedFrom
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// دمج بيانات واتساب الحقيقية مع نظام التعلم
export async function integrateWhatsAppLearning(messageData: {
  userMessage: string;
  systemResponse: string;
  timestamp: string;
  from: string;
}) {
  const companyId = 'siyadah_ai_main';
  
  try {
    // إضافة التفاعل الجديد إلى نظام التعلم
    await selfLearningEngine.connectDataSource(companyId, 'whatsapp', [{
      id: Date.now(),
      content: messageData.userMessage,
      response: messageData.systemResponse,
      timestamp: messageData.timestamp,
      source: 'whatsapp_real',
      from: messageData.from
    }]);
    
    console.log('📚 تم إضافة تفاعل واتساب جديد لنظام التعلم');
    return true;
  } catch (error) {
    console.error('❌ خطأ في دمج تفاعل واتساب:', error);
    return false;
  }
}