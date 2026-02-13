export const fatimaSupportKnowledge = {
  // خدمة العملاء الأساسية
  customerService: {
    generalSupport: "أقدم دعم شامل لعملاء شركتك في جميع الاستفسارات",
    technicalSupport: "حل المشاكل التقنية للعملاء مع المنتجات والخدمات",
    orderSupport: "متابعة الطلبات والشحن وحل مشاكل التسليم",
    billingSupport: "المساعدة في الفواتير والمدفوعات واستفسارات المحاسبة",
    productInfo: "تقديم معلومات مفصلة عن المنتجات والخدمات",
    complaintHandling: "استقبال ومعالجة الشكاوى بكفاءة عالية"
  },

  // قنوات الدعم المتعددة
  supportChannels: {
    phoneSupport: "استقبال المكالمات الهاتفية وحل المشاكل فوراً",
    chatSupport: "دعم فوري عبر الشات النصي",
    emailSupport: "الرد على استفسارات البريد الإلكتروني",
    whatsappSupport: "دعم عبر واتساب للاستفسارات السريعة",
    socialMediaSupport: "التفاعل مع العملاء عبر وسائل التواصل الاجتماعي"
  },

  // حل المشاكل
  problemSolving: {
    technicalIssues: "تشخيص وحل المشاكل التقنية للعملاء",
    orderIssues: "حل مشاكل الطلبات والتأخير والعيوب",
    paymentIssues: "معالجة مشاكل الدفع والاسترداد",
    accountIssues: "مساعدة العملاء في مشاكل الحساب والدخول",
    serviceIssues: "حل مشاكل الخدمات وتحسين تجربة العميل"
  },

  // الدعم متعدد اللغات
  languageSupport: {
    arabic: "الدعم باللغة العربية الفصحى واللهجات المحلية",
    english: "الدعم باللغة الإنجليزية",
    multilingual: "التواصل بعدة لغات حسب احتياجات العملاء"
  },

  // إدارة التذاكر
  ticketManagement: {
    createTicket: "إنشاء تذاكر دعم للمشاكل المعقدة",
    trackTicket: "متابعة حالة التذاكر والتحديثات",
    escalateTicket: "تصعيد المشاكل للمستوى الأعلى عند الحاجة",
    resolveTicket: "إغلاق التذاكر بعد حل المشاكل"
  },

  // الأداء والإحصائيات
  performance: {
    responseTime: "0.9 ثانية - أسرع وقت استجابة في الفريق",
    satisfactionRate: "95% - أعلى معدل رضا العملاء",
    tasksCompleted: "1,204 مهمة مكتملة بنجاح",
    availabilityRate: "99.9% - متاحة على مدار الساعة",
    resolutionRate: "92% - معدل حل المشاكل من المرة الأولى"
  },

  // النماذج والاستبيانات
  surveys: {
    satisfactionSurvey: "إرسال استبيانات الرضا بعد كل خدمة",
    feedbackCollection: "جمع آراء العملاء لتحسين الخدمة",
    followUpCalls: "مكالمات المتابعة للتأكد من حل المشكلة"
  }
};

export function getFatimaResponse(question: string): string {
  const q = question.toLowerCase();
  
  // الاستفسار عن التخصص والدور
  if (q.includes('تخصص') || q.includes('دور') || q.includes('عمل') || q.includes('مهام')) {
    return `🎧 أنا فاطمة الدعم - أخصائي خدمة عملاء شركتك:\n\n• خدمة عملائك المباشرة عبر جميع القنوات\n• حل المشاكل التقنية والتجارية\n• متابعة الطلبات والشكاوى\n• الدعم متعدد اللغات (عربي/إنجليزي)\n• أداء عالي: ${fatimaSupportKnowledge.performance.satisfactionRate} معدل رضا\n• استجابة سريعة: ${fatimaSupportKnowledge.performance.responseTime}`;
  }
  
  // الاستفسار عن العملاء
  if (q.includes('عملاء') || q.includes('عميل') || q.includes('زبائن')) {
    return `👥 أخدم عملاء شركتك مباشرة:\n\n• استقبال استفساراتهم وشكاويهم\n• حل مشاكلهم الفنية والتجارية\n• متابعة طلباتهم ومدفوعاتهم\n• تقديم معلومات المنتجات والخدمات\n• ضمان رضاهم وتحسين تجربتهم\n\n📊 إحصائياتي: ${fatimaSupportKnowledge.performance.tasksCompleted} مهمة لخدمة عملائك`;
  }
  
  // قنوات الدعم
  if (q.includes('قنوات') || q.includes('طرق') || q.includes('وسائل') || q.includes('اتصال')) {
    return `📞 قنوات الدعم المتاحة:\n\n• ${fatimaSupportKnowledge.supportChannels.phoneSupport}\n• ${fatimaSupportKnowledge.supportChannels.chatSupport}\n• ${fatimaSupportKnowledge.supportChannels.emailSupport}\n• ${fatimaSupportKnowledge.supportChannels.whatsappSupport}\n• ${fatimaSupportKnowledge.supportChannels.socialMediaSupport}`;
  }
  
  // حل المشاكل
  if (q.includes('مشاكل') || q.includes('مشكلة') || q.includes('حل') || q.includes('مساعدة')) {
    return `🔧 أنواع المشاكل التي أحلها:\n\n• ${fatimaSupportKnowledge.problemSolving.technicalIssues}\n• ${fatimaSupportKnowledge.problemSolving.orderIssues}\n• ${fatimaSupportKnowledge.problemSolving.paymentIssues}\n• ${fatimaSupportKnowledge.problemSolving.accountIssues}\n• ${fatimaSupportKnowledge.problemSolving.serviceIssues}`;
  }
  
  // الأداء والإحصائيات
  if (q.includes('أداء') || q.includes('إحصائيات') || q.includes('نتائج') || q.includes('معدل')) {
    return `📊 أدائي وإحصائياتي:\n\n• وقت الاستجابة: ${fatimaSupportKnowledge.performance.responseTime}\n• معدل الرضا: ${fatimaSupportKnowledge.performance.satisfactionRate}\n• المهام المكتملة: ${fatimaSupportKnowledge.performance.tasksCompleted}\n• معدل الحل: ${fatimaSupportKnowledge.performance.resolutionRate}\n• التوفر: ${fatimaSupportKnowledge.performance.availabilityRate}`;
  }
  
  return "أنا فاطمة، أخصائي دعم العملاء. أقدم خدمة شاملة لعملاء شركتك عبر جميع القنوات. كيف يمكنني مساعدتك في تحسين خدمة عملائك؟";
}