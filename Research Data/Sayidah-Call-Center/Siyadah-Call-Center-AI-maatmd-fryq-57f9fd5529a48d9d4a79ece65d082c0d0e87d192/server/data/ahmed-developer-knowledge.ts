export const ahmedDeveloperKnowledge = {
  // إعدادات التدفق والأتمتة
  workflowSetup: {
    addPostCallAction: "افتح إعدادات التدفق، اضغط \"إضافة خطوة\" واختار \"بعد المكالمة\"",
    sendSmsAfterCall: "في الخطوة الجديدة اختار \"إرسال SMS\" واكتب نص الرسالة",
    setupReminder: "اضغط \"تذكير\" وحدد الوقت وعدّد التذكيرات",
    crmIntegration: "اختر \"توصيل\" ثم \"CRM\" وأدخل بيانات الحساب",
    callRouting: "في التدفق اختر \"شرط\" وحدد المعايير ثم الوجهة",
    dailyEmailReport: "انشئ مهمة مجدولة \"يوميًا\" واختار \"إرسال بريد\"",
    pauseWorkflow: "بجانب اسم التدفق انقر \"توقف مؤقت\"",
    editVoiceMessage: "افتح إعدادات الرسالة الصوتية واكتب النص الجديد"
  },

  // التوقيت والجدولة
  timing: {
    addDelay: "اختر \"انتظار\" وحدد المدة",
    scheduleAutoReply: "في الرد الآلي اختر \"جدولة\" وحدد الوقت",
    holidaySettings: "في الجدولة اختر \"استثناء أيام\" وحدد العطلات",
    nightTimeRestriction: "في جدولة الرسائل فعل \"عدم الإرسال ليلاً\"",
    retryAttempts: "في شرط الإخفاق فعل \"إعادة المحاولة\" وعدد المرات",
    customTimeout: "في المهمة اختر \"مهلة\" وحدد الثواني",
    apiTimeout: "في \"API Call\" حدد \"Timeout\" بالثواني"
  },

  // التكاملات الخارجية
  integrations: {
    whatsappIntegration: "فعل \"واتساب\" من الإضافات وأدخل الـ API",
    googleSheetsIntegration: "في الإضافات فعل \"Google Sheets\" وأدخل التفويض",
    telegramIntegration: "فعل \"Telegram\" وأدخل التوكن",
    slackIntegration: "فعل \"Slack\" من الإضافات وأدخل الـ Webhook",
    googleCalendarIntegration: "فعل \"Google Calendar\" وأدخل التفويض",
    powerBiIntegration: "في \"التقارير\" فعل \"Power BI\" وأدخل التفويض",
    weatherApiIntegration: "في الإضافات فعل \"Weather API\" وأدخل المفتاح",
    voicemailIntegration: "فعل \"البريد الصوتي\" من الإضافات"
  },

  // إدارة الرسائل والإشعارات
  messaging: {
    changeSenderNumber: "في إعدادات الرسائل حرر رقم المرسل",
    bulkSms: "استخدم \"حملة SMS\" واختر القائمة",
    whatsappBulk: "أنشئ \"حملة WhatsApp\" وارفع القائمة",
    smsWithLink: "عند كتابة الرسالة الصق الرابط",
    customVoiceMessage: "ارفع ملف صوتي في \"الرسائل الصوتية\"",
    sendFile: "في الخطوة اختر \"إرسال ملف\" وارفعه",
    emailSignature: "في إعدادات البريد أضف \"التوقيع\"",
    messageEncoding: "في إعدادات الرسائل اختر \"ترميز UTF-8\""
  },

  // المراقبة والتقارير
  monitoring: {
    performanceTracking: "اذهب لتقارير الأداء واختر الوكيل المطلوب",
    instantNotification: "في الخطوة الأخيرة اختر \"إرسال إشعار\" وحدد المدير",
    disableNotifications: "في الإعدادات العامة أوقف \"الإشعارات\"",
    errorChecking: "اضغط \"تدقيق\" وسيظهر الأخطاء",
    messageDelivery: "افتح سجل الرسائل وتحقق من الحالة",
    executionLog: "افتح \"سجل المهام\" وابحث بالمهمة",
    errorLogOnly: "في \"سجل التنفيذ\" فعل \"عرض الأخطاء\"",
    quotaWarning: "في \"مراقبة الحصص\" فعل \"تحذير عند 80%\""
  },

  // إدارة البيانات والنماذج
  dataManagement: {
    customerDataCollection: "في التدفق أضف \"نموذج\" قبل الاتصال",
    surveyLink: "اختر \"إرسال رابط\" وأدخل عنوان الاستبيان",
    addFormField: "في \"نموذج العميل\" اضغط \"إضافة حقل\"",
    receiveFiles: "أضف \"استلام ملف\" في نموذج المكالمة",
    customerRating: "بعد المكالمة أرسل \"نموذج تقييم\"",
    editFormText: "في \"نماذج\" حرر الأسئلة والنصوص",
    exportCsv: "استخدم \"تصدير CSV\" ثم أرفقه",
    dataToSheets: "في التدفق اختر \"Google Sheets → إضافة صف\""
  },

  // الأمان والصيانة
  security: {
    backupWorkflows: "اضغط \"تصدير\" واختر \"ملف JSON\"",
    restoreBackup: "اضغط \"استيراد\" وارفع الملف",
    userPermissions: "في \"إدارة المستخدمين\" حرر الأدوار والصلاحيات",
    maintenanceMode: "فعل \"وضع الصيانة\" من القوائم",
    workflowSecurity: "في \"الأمان\" اضبط المصادقة وTLS",
    changeLanguage: "في الإعدادات اختر اللغة العربية أو الإنجليزية"
  },

  // الإعدادات المتقدمة
  advancedSettings: {
    changeVoice: "في إعدادات الرد الآلي اختر صوتًا آخر",
    voiceActivation: "في \"إعدادات الصوت\" فعّل \"تنشيط بالكلمة\"",
    speechRecognition: "فعل \"STT\" من الإضافات",
    themeChange: "في الإعدادات العامة اختر \"الثيم\" الجديد",
    callLimit: "في إعدادات الاتصال اضبط \"الحد الأقصى للمحاولات\"",
    taskPriority: "في المهمة اختر \"أولوية\" مرتفعة أو منخفضة",
    parallelTasks: "قلّل عدد الشروط واستخدم \"مهام متوازية\"",
    soundNotifications: "في \"إعدادات الصوت\" فعل \"إشعارات صوتية\""
  },

  // الاختبار والتطوير
  testing: {
    testWorkflow: "اضغط \"تشغيل تجريبي\" وشغّل السيناريو",
    reorderSteps: "اسحب الخطوة بالمؤشر وضعها بمكان جديد",
    addNote: "في سجل المكالمة اضغط \"ملاحظة\" واكتبها",
    conditionSetup: "في \"شرط\" اختر الحقل والمعيار",
    languageCondition: "في \"شرط\" اختر حقل اللغة وقيمتها",
    retryOnFailure: "في \"API Call\" فعل \"Retry on failure\"",
    httpRetry: "في \"API Call\" فعل \"Retry on failure\""
  },

  // التقارير والتحليلات
  reporting: {
    weeklyReport: "في \"التقارير\" اختر \"أسبوعي\" ثم \"تصدير\"",
    companyEmail: "في الإعدادات أضف SMTP الخاص بالشركة",
    csvToAdmin: "في التدفق اختر \"تصدير CSV وإرساله بالبريد\"",
    autoDataCollection: "فعل \"تسجيل المعلومات\" في إعدادات المكالمة",
    voiceConfirmation: "في \"الرد الآلي\" فعل \"تسجيل الرد\"",
    dailyMessageCount: "في \"لوحة التحكم\" قسم الإحصائيات",
    powerBiData: "في التدفق اختر \"نشْر إلى Power BI\""
  },

  // المالية والحصص
  billing: {
    balanceDeduction: "أضف \"API Call\" إلى النظام المالي",
    balanceWarning: "في \"مراقبة الرصيد\" فعل \"تحذير عند مستوى معين\"",
    quotaMonitoring: "في \"مراقبة الحصص\" فعل \"تحذير عند 80%\"",
    quotaWarning: "في \"مراقبة الحصص\" فعل \"تحذير عند 80%\""
  }
};

export function getAhmedResponse(question: string): string {
  const q = question.toLowerCase();
  
  // إعدادات التدفق
  if (q.includes('تدفق') || q.includes('سير عمل') || q.includes('خطوة') || q.includes('إضافة')) {
    if (q.includes('مكالمة')) {
      return `⚙️ إعداد التدفق بعد المكالمة:\n• ${ahmedDeveloperKnowledge.workflowSetup.addPostCallAction}\n• إرسال SMS: ${ahmedDeveloperKnowledge.workflowSetup.sendSmsAfterCall}\n• تذكير: ${ahmedDeveloperKnowledge.workflowSetup.setupReminder}`;
    }
    if (q.includes('نسخة احتياطية') || q.includes('احتياطي') || q.includes('backup')) {
      return `🔒 النسخ الاحتياطية للتدفقات:\n• عمل نسخة احتياطية: ${ahmedDeveloperKnowledge.security.backupWorkflows}\n• استعادة النسخة: ${ahmedDeveloperKnowledge.security.restoreBackup}\n• مراجعة التغييرات: في "سجل التعديلات" شوف كل التغييرات\n• الرجوع لإصدار سابق: في "الإصدارات" اضغط "استعادة"`;
    }
    return `🔧 إدارة التدفقات:\n• إيقاف مؤقت: ${ahmedDeveloperKnowledge.workflowSetup.pauseWorkflow}\n• تحرير الرسائل: ${ahmedDeveloperKnowledge.workflowSetup.editVoiceMessage}\n• اختبار: ${ahmedDeveloperKnowledge.testing.testWorkflow}`;
  }
  
  // التكاملات
  if (q.includes('تكامل') || q.includes('دمج') || q.includes('ربط') || q.includes('api')) {
    if (q.includes('واتساب') || q.includes('whatsapp')) {
      return `📱 تكامل واتساب:\n• التفعيل: ${ahmedDeveloperKnowledge.integrations.whatsappIntegration}\n• الرسائل الجماعية: ${ahmedDeveloperKnowledge.messaging.whatsappBulk}`;
    }
    if (q.includes('crm')) {
      return `🗂️ تكامل CRM:\n• ${ahmedDeveloperKnowledge.workflowSetup.crmIntegration}`;
    }
    if (q.includes('google') || q.includes('جوجل')) {
      return `📊 تكاملات جوجل:\n• الجداول: ${ahmedDeveloperKnowledge.integrations.googleSheetsIntegration}\n• التقويم: ${ahmedDeveloperKnowledge.integrations.googleCalendarIntegration}\n• إرسال البيانات: ${ahmedDeveloperKnowledge.dataManagement.dataToSheets}`;
    }
    return `🔌 التكاملات المتاحة:\n• Slack: ${ahmedDeveloperKnowledge.integrations.slackIntegration}\n• Telegram: ${ahmedDeveloperKnowledge.integrations.telegramIntegration}\n• Power BI: ${ahmedDeveloperKnowledge.integrations.powerBiIntegration}`;
  }
  
  // الرسائل والإشعارات
  if (q.includes('رسالة') || q.includes('إشعار') || q.includes('sms') || q.includes('بريد')) {
    if (q.includes('جماعي') || q.includes('bulk')) {
      return `📢 الرسائل الجماعية:\n• SMS جماعي: ${ahmedDeveloperKnowledge.messaging.bulkSms}\n• واتساب جماعي: ${ahmedDeveloperKnowledge.messaging.whatsappBulk}`;
    }
    return `💬 إدارة الرسائل:\n• تغيير المرسل: ${ahmedDeveloperKnowledge.messaging.changeSenderNumber}\n• إضافة رابط: ${ahmedDeveloperKnowledge.messaging.smsWithLink}\n• رسالة صوتية: ${ahmedDeveloperKnowledge.messaging.customVoiceMessage}\n• توقيع البريد: ${ahmedDeveloperKnowledge.messaging.emailSignature}`;
  }
  
  // المراقبة والأداء
  if (q.includes('مراقبة') || q.includes('أداء') || q.includes('تقرير') || q.includes('سجل')) {
    return `📊 المراقبة والتقارير:\n• تتبع الأداء: ${ahmedDeveloperKnowledge.monitoring.performanceTracking}\n• فحص الأخطاء: ${ahmedDeveloperKnowledge.monitoring.errorChecking}\n• سجل التنفيذ: ${ahmedDeveloperKnowledge.monitoring.executionLog}\n• تحذير الحصص: ${ahmedDeveloperKnowledge.monitoring.quotaWarning}`;
  }
  
  // الجدولة والتوقيت
  if (q.includes('جدولة') || q.includes('وقت') || q.includes('تأخير') || q.includes('timeout')) {
    return `⏰ إدارة التوقيت:\n• إضافة تأخير: ${ahmedDeveloperKnowledge.timing.addDelay}\n• الجدولة التلقائية: ${ahmedDeveloperKnowledge.timing.scheduleAutoReply}\n• العطلات: ${ahmedDeveloperKnowledge.timing.holidaySettings}\n• منع الليل: ${ahmedDeveloperKnowledge.timing.nightTimeRestriction}`;
  }
  
  // الأمان والنسخ الاحتياطية
  if (q.includes('نسخ احتياطي') || q.includes('backup') || q.includes('أمان') || q.includes('security') || 
      q.includes('نسخة احتياطية') || q.includes('استعادة') || q.includes('restore')) {
    return `🔒 الأمان والنسخ الاحتياطية:\n• النسخ الاحتياطي: ${ahmedDeveloperKnowledge.security.backupWorkflows}\n• الاستعادة: ${ahmedDeveloperKnowledge.security.restoreBackup}\n• الصلاحيات: ${ahmedDeveloperKnowledge.security.userPermissions}\n• وضع الصيانة: ${ahmedDeveloperKnowledge.security.maintenanceMode}`;
  }
  
  // إدارة البيانات
  if (q.includes('بيانات') || q.includes('نموذج') || q.includes('استبيان') || q.includes('csv')) {
    return `📋 إدارة البيانات:\n• جمع البيانات: ${ahmedDeveloperKnowledge.dataManagement.customerDataCollection}\n• إضافة حقل: ${ahmedDeveloperKnowledge.dataManagement.addFormField}\n• تصدير CSV: ${ahmedDeveloperKnowledge.dataManagement.exportCsv}\n• استلام ملفات: ${ahmedDeveloperKnowledge.dataManagement.receiveFiles}`;
  }
  
  // الاختبار والتطوير
  if (q.includes('اختبار') || q.includes('test') || q.includes('تجريبي') || q.includes('شرط')) {
    return `🧪 الاختبار والتطوير:\n• تشغيل تجريبي: ${ahmedDeveloperKnowledge.testing.testWorkflow}\n• ترتيب الخطوات: ${ahmedDeveloperKnowledge.testing.reorderSteps}\n• إعداد الشروط: ${ahmedDeveloperKnowledge.testing.conditionSetup}\n• إعادة المحاولة: ${ahmedDeveloperKnowledge.testing.retryOnFailure}`;
  }
  
  return "أحتاج إلى مزيد من التفاصيل لتقديم الحل المناسب. يمكنك السؤال عن: التدفقات، التكاملات، الرسائل، المراقبة، الجدولة، الأمان، أو البيانات.";
}