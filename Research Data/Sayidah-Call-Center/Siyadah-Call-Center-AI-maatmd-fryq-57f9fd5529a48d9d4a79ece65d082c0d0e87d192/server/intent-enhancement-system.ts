/**
 * نظام تطوير وكيل الفهم (IntentAgent) مع 100 سؤال متوقع
 * يصنف الأسئلة إلى 5 فئات: مبيعات، خدمة عملاء، تسويق، جدولة، استفسارات عامة
 */

export interface ExpectedQuestion {
  id: number;
  question: string;
  category: string;
  intent: string;
  confidence: number;
  response: string;
  keywords: string[];
}

export interface IntentPattern {
  category: string;
  patterns: RegExp[];
  keywords: string[];
  priority: number;
}

// قاعدة بيانات الأسئلة المتوقعة مع الإجابات
export const EXPECTED_QUESTIONS: ExpectedQuestion[] = [
  // فئة المبيعات (20 سؤال)
  {
    id: 1,
    question: "أريد معرفة أسعار نظام إدارة المطاعم",
    category: "مبيعات", 
    intent: "price_inquiry",
    confidence: 0.95,
    response: "نظام إدارة المطاعم يبدأ من 25,000 ريال ويشمل إدارة الطلبات، المخزون، والتقارير المالية. هل تريد عرض تفصيلي؟",
    keywords: ["أسعار", "نظام", "مطاعم", "سعر", "تكلفة"]
  },
  {
    id: 2,
    question: "عطني عرض سعر لنظام CRM كامل",
    category: "مبيعات",
    intent: "quote_request", 
    confidence: 0.92,
    response: "نظام CRM الشامل 35,000 ريال يشمل إدارة العملاء، المبيعات، والتقارير. سأجهز لك عرض مفصل خلال 10 دقائق.",
    keywords: ["عرض", "سعر", "CRM", "نظام إدارة العملاء"]
  },
  {
    id: 3,
    question: "هل تقدرون تطوروا لنا متجر إلكتروني متكامل؟",
    category: "مبيعات",
    intent: "service_inquiry",
    confidence: 0.88,
    response: "نعم، نطور متاجر إلكترونية متكاملة تبدأ من 15,000 ريال مع الدفع الإلكتروني وإدارة المخزون. هل تريد مناقشة المتطلبات؟",
    keywords: ["متجر إلكتروني", "تطوير", "موقع", "تجارة إلكترونية"]
  },
  {
    id: 4,
    question: "أبغى أحد يتواصل مع عميل اسمه فهد لإتمام الصفقة",
    category: "مبيعات",
    intent: "lead_followup",
    confidence: 0.90,
    response: "تم تعيين مدير المبيعات للتواصل مع العميل فهد خلال الساعة القادمة لإتمام الصفقة. ستصلك تحديثات فورية.",
    keywords: ["تواصل", "عميل", "صفقة", "متابعة"]
  },
  {
    id: 5,
    question: "عطني تقرير بالمبيعات هذا الأسبوع",
    category: "مبيعات",
    intent: "sales_report",
    confidence: 0.93,
    response: "تقرير مبيعات الأسبوع: 12 صفقة بقيمة 485,000 ريال. أعلى أداء كان نظام المطاعم بـ 3 صفقات. التقرير المفصل جاهز للتحميل.",
    keywords: ["تقرير", "مبيعات", "أسبوع", "إحصائيات"]
  },
  {
    id: 6,
    question: "هل ممكن نحصل على خصم للكمية الكبيرة؟",
    category: "مبيعات",
    intent: "discount_inquiry",
    confidence: 0.87,
    response: "نعم، نقدم خصومات للكميات: 10% لأكثر من 5 تراخيص، 15% لأكثر من 10 تراخيص. ما هو العدد المطلوب؟",
    keywords: ["خصم", "كمية", "تراخيص", "عرض خاص"]
  },
  {
    id: 7,
    question: "متى نقدر نبدأ مشروع النظام؟",
    category: "مبيعات",
    intent: "timeline_inquiry",
    confidence: 0.85,
    response: "يمكن البدء فوراً بعد توقيع العقد. المرحلة الأولى تستغرق أسبوعين والتسليم النهائي خلال 6-8 أسابيع.",
    keywords: ["بداية", "مشروع", "توقيت", "تنفيذ"]
  },
  {
    id: 8,
    question: "أريد تجربة النظام قبل الشراء",
    category: "مبيعات",
    intent: "demo_request",
    confidence: 0.91,
    response: "ممتاز! نوفر نسخة تجريبية مجانية لمدة 14 يوم مع جميع الميزات. سأرسل لك رابط التفعيل خلال 5 دقائق.",
    keywords: ["تجربة", "نسخة تجريبية", "ديمو", "اختبار"]
  },
  {
    id: 9,
    question: "ما هي طرق الدفع المتاحة؟",
    category: "مبيعات",
    intent: "payment_methods",
    confidence: 0.86,
    response: "نقبل: تحويل بنكي، فيزا/ماستركارد، مدى، STC Pay، ودفع آجل للشركات. جميع المدفوعات آمنة ومشفرة.",
    keywords: ["دفع", "طرق الدفع", "فيزا", "تحويل"]
  },
  {
    id: 10,
    question: "هل يوجد ضمان على النظام؟",
    category: "مبيعات",
    intent: "warranty_inquiry",
    confidence: 0.84,
    response: "نعم، ضمان شامل لمدة سنة يشمل الدعم الفني، التحديثات، وإصلاح أي مشاكل تقنية مجاناً.",
    keywords: ["ضمان", "صيانة", "دعم فني"]
  },
  {
    id: 11,
    question: "كم يحتاج النظام من موظفين للتشغيل؟",
    category: "مبيعات",
    intent: "operational_requirements",
    confidence: 0.82,
    response: "النظام مصمم ليكون بسيط. موظف واحد يقدر يدير النظام بالكامل بعد التدريب الذي نوفره مجاناً.",
    keywords: ["موظفين", "تشغيل", "إدارة", "سهولة"]
  },
  {
    id: 12,
    question: "هل النظام يدعم اللغة العربية بالكامل؟",
    category: "مبيعات",
    intent: "language_support",
    confidence: 0.89,
    response: "نعم، جميع أنظمتنا مطورة بالعربية بالكامل مع واجهة RTL وتقارير باللغة العربية والإنجليزية.",
    keywords: ["عربي", "لغة", "واجهة", "تقارير"]
  },
  {
    id: 13,
    question: "ما الفرق بين الخطة الأساسية والمتقدمة؟",
    category: "مبيعات",
    intent: "plan_comparison",
    confidence: 0.88,
    response: "الأساسية تشمل الميزات الرئيسية، المتقدمة تضيف التقارير المتقدمة، الذكاء الاصطناعي، والتكامل مع الأنظمة الأخرى.",
    keywords: ["خطة", "فرق", "مقارنة", "ميزات"]
  },
  {
    id: 14,
    question: "هل ممكن تخصيص النظام حسب احتياجاتنا؟",
    category: "مبيعات",
    intent: "customization_inquiry",
    confidence: 0.87,
    response: "بالتأكيد! نقدم تخصيص كامل للنظام ليناسب طبيعة عملكم. التخصيص يبدأ من 5,000 ريال حسب التعقيد.",
    keywords: ["تخصيص", "احتياجات", "تطوير خاص"]
  },
  {
    id: 15,
    question: "كم المدة المطلوبة للتدريب؟",
    category: "مبيعات", 
    intent: "training_duration",
    confidence: 0.83,
    response: "التدريب الأساسي يومين، والمتقدم 4 أيام. نوفر تدريب حضوري ومرئي مع شهادات معتمدة.",
    keywords: ["تدريب", "مدة", "دورات", "شهادات"]
  },
  {
    id: 16,
    question: "هل النظام يعمل على الجوال والكمبيوتر؟",
    category: "مبيعات",
    intent: "platform_compatibility", 
    confidence: 0.86,
    response: "نعم، النظام متجاوب يعمل على جميع الأجهزة: كمبيوتر، تابلت، جوال. كما نوفر تطبيق جوال مخصص.",
    keywords: ["جوال", "كمبيوتر", "تطبيق", "متجاوب"]
  },
  {
    id: 17,
    question: "ما هي متطلبات التشغيل التقنية؟",
    category: "مبيعات",
    intent: "technical_requirements",
    confidence: 0.81,
    response: "متطلبات بسيطة: إنترنت مستقر، متصفح حديث. لا نحتاج خوادم خاصة لأن النظام سحابي بالكامل.",
    keywords: ["متطلبات", "تقنية", "خوادم", "سحابي"]
  },
  {
    id: 18,
    question: "هل توفرون دعم تقني 24/7؟",
    category: "مبيعات",
    intent: "support_availability",
    confidence: 0.85,
    response: "نعم، دعم فني متاح 24/7 عبر الهاتف، الدردشة المباشرة، والواتساب. متوسط وقت الاستجابة 5 دقائق.",
    keywords: ["دعم فني", "24/7", "مساعدة", "استجابة"]
  },
  {
    id: 19,
    question: "كيف نضمن أمان البيانات؟",
    category: "مبيعات",
    intent: "security_inquiry",
    confidence: 0.90,
    response: "أمان عالي: تشفير SSL، نسخ احتياطية يومية، خوادم في السعودية، امتثال لقوانين حماية البيانات.",
    keywords: ["أمان", "بيانات", "تشفير", "حماية"]
  },
  {
    id: 20,
    question: "هل يمكن ربط النظام مع أنظمتنا الحالية؟",
    category: "مبيعات",
    intent: "integration_inquiry", 
    confidence: 0.84,
    response: "نعم، نوفر تكامل مع جميع الأنظمة الشائعة: المحاسبة، ERP، أنظمة الدفع. التكامل يتم عبر APIs آمنة.",
    keywords: ["تكامل", "ربط", "أنظمة", "APIs"]
  },

  // فئة خدمة العملاء (20 سؤال)
  {
    id: 21,
    question: "عميل يشتكي من بطء النظام",
    category: "خدمة عملاء",
    intent: "performance_complaint",
    confidence: 0.92,
    response: "تم تسجيل الشكوى. فريق الدعم الفني سيتواصل مع العميل خلال 15 دقيقة لحل مشكلة البطء فوراً.",
    keywords: ["شكوى", "بطء", "أداء", "مشكلة"]
  },
  {
    id: 22,
    question: "كيف أرد على عميل يطلب استرداد؟",
    category: "خدمة عملاء",
    intent: "refund_request",
    confidence: 0.89,
    response: "سياسة الاسترداد: متاح خلال 30 يوم من الشراء. سأرسل لك نموذج طلب الاسترداد ونص الرد المعتمد.",
    keywords: ["استرداد", "رد", "سياسة", "ضمان"]
  },
  {
    id: 23,
    question: "أحتاج نص جاهز للرد على الأسئلة المتكررة",
    category: "خدمة عملاء",
    intent: "template_request",
    confidence: 0.94,
    response: "تم إرسال 25 نص جاهز للأسئلة الشائعة: إعادة تعيين كلمة المرور، مشاكل تسجيل الدخول، طرق الدفع، والمزيد.",
    keywords: ["نص جاهز", "أسئلة متكررة", "ردود", "قوالب"]
  },
  {
    id: 24,
    question: "العميل يطلب دعم فني عاجل",
    category: "خدمة عملاء",
    intent: "urgent_support",
    confidence: 0.96,
    response: "تم تصعيد الطلب للدعم العاجل. مهندس متخصص سيتصل بالعميل خلال 5 دقائق لحل المشكلة.",
    keywords: ["عاجل", "دعم فني", "سريع", "طارئ"]
  },
  {
    id: 25,
    question: "أبغى أرسل استبيان رضا للعملاء",
    category: "خدمة عملاء",
    intent: "satisfaction_survey",
    confidence: 0.88,
    response: "تم إعداد استبيان رضا العملاء. سيرسل تلقائياً لجميع العملاء عبر الإيميل والواتساب خلال ساعة.",
    keywords: ["استبيان", "رضا", "تقييم", "ملاحظات"]
  },
  {
    id: 26,
    question: "العميل لا يقدر يسجل دخول للنظام",
    category: "خدمة عملاء",
    intent: "login_issue",
    confidence: 0.91,
    response: "مشكلة تسجيل الدخول شائعة. تم إرسال رابط إعادة تعيين كلمة المرور للعميل مع تعليمات مبسطة.",
    keywords: ["تسجيل دخول", "كلمة مرور", "دخول", "حساب"]
  },
  {
    id: 27,
    question: "كيف أتعامل مع عميل غاضب؟",
    category: "خدمة عملاء",
    intent: "angry_customer",
    confidence: 0.85,
    response: "دليل التعامل مع العملاء الغاضبين: استمع، اعتذر، حل المشكلة، تابع. سأرسل لك السكريبت المفصل.",
    keywords: ["غاضب", "تعامل", "عميل منزعج", "إدارة"]
  },
  {
    id: 28,
    question: "العميل يطلب تدريب إضافي",
    category: "خدمة عملاء",
    intent: "additional_training",
    confidence: 0.87,
    response: "تم جدولة جلسة تدريب إضافية مجانية للعميل. المدرب سيتواصل معه لتحديد الموعد المناسب.",
    keywords: ["تدريب إضافي", "جلسة", "تعليم", "مساعدة"]
  },
  {
    id: 29,
    question: "هل يمكن ترقية حساب العميل؟",
    category: "خدمة عملاء",
    intent: "account_upgrade",
    confidence: 0.83,
    response: "نعم، ترقية الحساب متاحة فوراً. الفرق في السعر سيحسب تناسبياً والميزات الجديدة ستفعل خلال ساعة.",
    keywords: ["ترقية", "حساب", "خطة أعلى", "تطوير"]
  },
  {
    id: 30,
    question: "العميل فقد بياناته ويطلب استرجاعها",
    category: "خدمة عملاء",
    intent: "data_recovery",
    confidence: 0.93,
    response: "لا تقلق، جميع البيانات محفوظة بنسخ احتياطية. فريق الاسترجاع سيعيد البيانات خلال 2-4 ساعات.",
    keywords: ["فقد بيانات", "استرجاع", "نسخ احتياطية", "ضياع"]
  },
  {
    id: 31,
    question: "كيف أشرح للعميل الميزة الجديدة؟",
    category: "خدمة عملاء",
    intent: "feature_explanation",
    confidence: 0.82,
    response: "تم إعداد فيديو شرح مبسط للميزة الجديدة مع دليل مصور. سأرسل المواد التوضيحية خلال 10 دقائق.",
    keywords: ["شرح", "ميزة جديدة", "توضيح", "تعليم"]
  },
  {
    id: 32,
    question: "العميل يطلب إلغاء الاشتراك",
    category: "خدمة عملاء",
    intent: "cancellation_request",
    confidence: 0.90,
    response: "سأتواصل مع العميل أولاً لفهم السبب وتقديم حلول. إذا أصر على الإلغاء، سنطبق سياسة الإلغاء المعتمدة.",
    keywords: ["إلغاء", "اشتراك", "إنهاء", "توقف"]
  },
  {
    id: 33,
    question: "هل يمكن تمديد فترة التجربة؟",
    category: "خدمة عملاء",
    intent: "trial_extension",
    confidence: 0.86,
    response: "نعم، يمكن تمديد التجربة أسبوع إضافي لمرة واحدة. سأفعل التمديد فوراً وأرسل تأكيد للعميل.",
    keywords: ["تمديد", "فترة تجربة", "إضافي", "تجريبي"]
  },
  {
    id: 34,
    question: "العميل يواجه مشكلة في التقارير",
    category: "خدمة عملاء",
    intent: "reporting_issue",
    confidence: 0.88,
    response: "مشاكل التقارير عادة بسيطة. سأرسل للعميل دليل إنشاء التقارير خطوة بخطوة مع أمثلة عملية.",
    keywords: ["تقارير", "مشكلة", "بيانات", "إحصائيات"]
  },
  {
    id: 35,
    question: "كيف أساعد عميل لا يفهم التقنية؟",
    category: "خدمة عملاء",
    intent: "non_tech_customer",
    confidence: 0.84,
    response: "للعملاء غير التقنيين نوفر دعم مبسط: مكالمة فيديو، تحكم عن بعد، أو زيارة ميدانية إذا لزم الأمر.",
    keywords: ["غير تقني", "مبسط", "سهل", "توضيح"]
  },
  {
    id: 36,
    question: "العميل يريد شرح الفاتورة",
    category: "خدمة عملاء",
    intent: "billing_explanation",
    confidence: 0.87,
    response: "تم تحضير شرح تفصيلي للفاتورة مع تفكيك جميع التكاليف والرسوم. سأرسل نسخة واضحة للعميل.",
    keywords: ["فاتورة", "شرح", "تكاليف", "رسوم"]
  },
  {
    id: 37,
    question: "هل يمكن تغيير عنوان الفاتورة؟",
    category: "خدمة عملاء",
    intent: "billing_address_change",
    confidence: 0.85,
    response: "نعم، تغيير عنوان الفاتورة متاح فوراً. سأحدث البيانات وأرسل فاتورة محدثة للعميل خلال ساعة.",
    keywords: ["تغيير عنوان", "فاتورة", "تحديث بيانات"]
  },
  {
    id: 38,
    question: "العميل يطلب شهادة إتمام التدريب",
    category: "خدمة عملاء",
    intent: "training_certificate",
    confidence: 0.83,
    response: "تم إصدار شهادة إتمام التدريب المعتمدة باسم العميل. سترسل عبر الإيميل خلال 30 دقيقة.",
    keywords: ["شهادة", "تدريب", "إتمام", "معتمدة"]
  },
  {
    id: 39,
    question: "كيف أشرح للعميل طريقة النسخ الاحتياطي؟",
    category: "خدمة عملاء",
    intent: "backup_explanation",
    confidence: 0.81,
    response: "النسخ الاحتياطي تلقائي كل يوم. سأعد فيديو شرح مبسط يوضح كيفية الوصول للنسخ واستعادة البيانات.",
    keywords: ["نسخ احتياطي", "شرح", "استعادة", "تلقائي"]
  },
  {
    id: 40,
    question: "العميل يريد تقرير استخدامه للنظام",
    category: "خدمة عملاء",
    intent: "usage_report",
    confidence: 0.86,
    response: "تم إعداد تقرير استخدام شامل يوضح: ساعات الاستخدام، الميزات المستخدمة، وتوصيات التحسين.",
    keywords: ["تقرير استخدام", "إحصائيات", "نشاط", "تحليل"]
  },

  // فئة التسويق (20 سؤال)  
  {
    id: 41,
    question: "أطلق حملة ترويجية لمنتجنا الجديد",
    category: "تسويق",
    intent: "campaign_launch",
    confidence: 0.94,
    response: "تم إعداد حملة ترويجية متكاملة تشمل: إعلانات سوشيال ميديا، إيميل تسويقي، ومحتوى إبداعي. ستنطلق خلال 24 ساعة.",
    keywords: ["حملة", "ترويج", "منتج جديد", "إطلاق"]
  },
  {
    id: 42,
    question: "جهز لي محتوى إعلاني للانستقرام",
    category: "تسويق",
    intent: "social_content",
    confidence: 0.91,
    response: "تم تصميم 10 منشورات إنستقرام احترافية مع النصوص والهاشتاقات المناسبة. جاهز للنشر خلال ساعتين.",
    keywords: ["محتوى", "إنستقرام", "منشورات", "سوشيال ميديا"]
  },
  {
    id: 43,
    question: "وش أفضل وقت ننشر فيه الإعلانات؟",
    category: "تسويق",
    intent: "timing_optimization",
    confidence: 0.88,
    response: "بناءً على تحليل جمهورك: أفضل أوقات النشر 8-10 صباحاً و7-9 مساءً خلال أيام الأسبوع، و2-4 عصراً في الويكند.",
    keywords: ["أفضل وقت", "نشر", "توقيت", "جمهور"]
  },
  {
    id: 44,
    question: "أرسل عرض تسويقي لقائمة العملاء",
    category: "تسويق",
    intent: "email_campaign",
    confidence: 0.93,
    response: "تم إعداد حملة إيميل تسويقية جذابة مع عرض خاص 20% خصم. سترسل لـ 1,250 عميل خلال الساعة القادمة.",
    keywords: ["عرض تسويقي", "قائمة عملاء", "إيميل", "حملة"]
  },
  {
    id: 45,
    question: "أحتاج اقتراحات لعناوين إعلانات",
    category: "تسويق",
    intent: "ad_headlines",
    confidence: 0.89,
    response: "15 عنوان إعلاني قوي: 'وفر 50% اليوم فقط', 'الحل الذي تبحث عنه', 'اكتشف المستقبل الآن'. القائمة الكاملة جاهزة.",
    keywords: ["عناوين إعلانات", "اقتراحات", "عناوين جذابة"]
  },
  {
    id: 46,
    question: "كيف أقيس نجاح الحملة الإعلانية؟",
    category: "تسويق",
    intent: "campaign_metrics",
    confidence: 0.87,
    response: "مؤشرات النجاح: معدل النقر (CTR), التحويل، تكلفة التحويل، العائد على الاستثمار. لوحة متابعة متاحة لايف.",
    keywords: ["قياس", "نجاح", "مؤشرات", "تحليل"]
  },
  {
    id: 47,
    question: "أبغى أستهدف عملاء جدد في منطقة الرياض",
    category: "تسويق",
    intent: "geo_targeting",
    confidence: 0.92,
    response: "تم إعداد حملة استهداف جغرافي للرياض تشمل: الإعلانات المحلية، الكلمات المفتاحية الإقليمية، والعروض الخاصة.",
    keywords: ["استهداف", "الرياض", "عملاء جدد", "جغرافي"]
  },
  {
    id: 48,
    question: "ما هي أفضل منصة إعلانية لمنتجنا؟",
    category: "تسويق",
    intent: "platform_recommendation",
    confidence: 0.85,
    response: "بناءً على تحليل منتجك وجمهورك: جوجل آدز للبحث، إنستقرام للصور، لينكد إن للB2B، سناب شات للشباب.",
    keywords: ["منصة إعلانية", "أفضل", "توصية", "مناسب"]
  },
  {
    id: 49,
    question: "أحتاج فيديو ترويجي قصير",
    category: "تسويق",
    intent: "video_content",
    confidence: 0.90,
    response: "تم تصميم فيديو ترويجي 60 ثانية احترافي مع الموسيقى والنصوص. سيكون جاهز خلال 48 ساعة للمراجعة.",
    keywords: ["فيديو", "ترويجي", "قصير", "إنتاج"]
  },
  {
    id: 50,
    question: "كيف أزيد متابعين صفحتنا؟",
    category: "تسويق",
    intent: "follower_growth",
    confidence: 0.86,
    response: "استراتيجية نمو المتابعين: محتوى قيم يومي، تفاعل مع التعليقات، مسابقات، تعاون مع المؤثرين، إعلانات مدفوعة.",
    keywords: ["متابعين", "زيادة", "نمو", "صفحة"]
  },
  {
    id: 51,
    question: "أبغى أعمل مسابقة على تويتر",
    category: "تسويق",
    intent: "contest_campaign",
    confidence: 0.88,
    response: "تم تصميم مسابقة تويتر تفاعلية مع جوائز قيمة. تشمل: قواعد واضحة، هاشتاق مميز، وآلية اختيار الفائزين.",
    keywords: ["مسابقة", "تويتر", "جوائز", "تفاعل"]
  },
  {
    id: 52,
    question: "ما هو معدل التحويل الطبيعي؟",
    category: "تسويق",
    intent: "conversion_benchmarks",
    confidence: 0.84,
    response: "معدلات التحويل الطبيعية: التجارة الإلكترونية 2-3%, الخدمات 5-10%, B2B 2-5%. موقعك حالياً عند 3.2%.",
    keywords: ["معدل تحويل", "طبيعي", "مقارنة", "صناعة"]
  },
  {
    id: 53,
    question: "أحتاج تحليل المنافسين",
    category: "تسويق",
    intent: "competitor_analysis",
    confidence: 0.91,
    response: "تم إعداد تحليل شامل للمنافسين يشمل: أسعارهم، استراتيجياتهم التسويقية، نقاط قوتهم وضعفهم، وفرص التفوق.",
    keywords: ["تحليل منافسين", "دراسة", "مقارنة", "سوق"]
  },
  {
    id: 54,
    question: "كيف أكتب نص إعلاني مقنع؟",
    category: "تسويق",
    intent: "copywriting_tips",
    confidence: 0.83,
    response: "أساسيات النص المقنع: ابدأ بمشكلة، قدم الحل، أضف دليل اجتماعي، انهي بدعوة واضحة للعمل. قوالب جاهزة متوفرة.",
    keywords: ["نص إعلاني", "مقنع", "كتابة", "تسويق"]
  },
  {
    id: 55,
    question: "أبغى أتعاون مع مؤثرين",
    category: "تسويق",
    intent: "influencer_marketing",
    confidence: 0.89,
    response: "تم إعداد قائمة 20 مؤثر مناسب لمجالك مع تفاصيل التواصل، أسعارهم، ومعدل تفاعل جمهورهم.",
    keywords: ["مؤثرين", "تعاون", "إنفلونسر", "شراكة"]
  },
  {
    id: 56,
    question: "ما هي أفضل طريقة لعمل استطلاع رأي؟",
    category: "تسويق",
    intent: "survey_methodology",
    confidence: 0.82,
    response: "استطلاع فعال: أسئلة واضحة ومختصرة، مزيج من مفتوحة ومغلقة، حافز للمشاركة، تحليل النتائج بصرياً.",
    keywords: ["استطلاع رأي", "طريقة", "أسئلة", "آراء"]
  },
  {
    id: 57,
    question: "كيف أحسن موقعنا في نتائج البحث؟",
    category: "تسويق",
    intent: "seo_optimization",
    confidence: 0.87,
    response: "تحسين SEO: كلمات مفتاحية قوية، محتوى قيم، سرعة الموقع، روابط خارجية، تحديث مستمر. خطة 6 أشهر جاهزة.",
    keywords: ["SEO", "تحسين", "محركات بحث", "موقع"]
  },
  {
    id: 58,
    question: "أحتاج خطة تسويقية لـ 6 أشهر",
    category: "تسويق",
    intent: "marketing_plan",
    confidence: 0.92,
    response: "خطة تسويقية شاملة لـ 6 أشهر تشمل: تحديد الجمهور، الرسائل الرئيسية، القنوات، الميزانية، والجدول الزمني.",
    keywords: ["خطة تسويقية", "6 أشهر", "استراتيجية", "شاملة"]
  },
  {
    id: 59,
    question: "ما هي تكلفة الإعلان على جوجل؟",
    category: "تسويق",
    intent: "advertising_costs",
    confidence: 0.85,
    response: "تكلفة إعلانات جوجل تتراوح 2-5 ريال للنقرة حسب المجال. ميزانية مقترحة: 3,000-5,000 ريال شهرياً للبداية.",
    keywords: ["تكلفة إعلان", "جوجل", "سعر", "ميزانية"]
  },
  {
    id: 60,
    question: "كيف أقيس رضا العملاء عن الحملة؟",
    category: "تسويق",
    intent: "customer_satisfaction",
    confidence: 0.84,
    response: "قياس رضا العملاء: استبيانات قصيرة، تحليل التعليقات، معدل الإعجاب والمشاركة، مؤشر NPS، المبيعات المتكررة.",
    keywords: ["قياس رضا", "عملاء", "استبيان", "تقييم"]
  },

  // فئة الجدولة (20 سؤال)
  {
    id: 61,
    question: "حدد موعد مع العميل أحمد بكرة الساعة 3",
    category: "جدولة",
    intent: "schedule_appointment",
    confidence: 0.95,
    response: "تم تحديد موعد مع العميل أحمد غداً الساعة 3 عصراً. إرسال دعوة تقويم ورسالة تذكير تلقائياً.",
    keywords: ["موعد", "تحديد", "عميل", "غداً"]
  },
  {
    id: 62,
    question: "أبغى أرسل دعوة لاجتماع مع الفريق",
    category: "جدولة",
    intent: "team_meeting",
    confidence: 0.92,
    response: "تم إعداد دعوة اجتماع فريق لغد الساعة 10 صباحاً. الدعوة تشمل: رابط الاجتماع، جدول الأعمال، والمواد المرفقة.",
    keywords: ["دعوة", "اجتماع", "فريق", "جماعي"]
  },
  {
    id: 63,
    question: "رتب لي لقاء مع مدير التسويق الأسبوع القادم",
    category: "جدولة",
    intent: "executive_meeting",
    confidence: 0.89,
    response: "تم التنسيق مع مدير التسويق. اللقاء مجدول الثلاثاء القادم الساعة 11 صباحاً في قاعة الاجتماعات الرئيسية.",
    keywords: ["لقاء", "مدير", "تسويق", "أسبوع قادم"]
  },
  {
    id: 64,
    question: "أرسل تذكير لمكالمة العميل علي",
    category: "جدولة",
    intent: "call_reminder",
    confidence: 0.94,
    response: "تم إرسال تذكير للعميل علي بالمكالمة المجدولة اليوم الساعة 4 عصراً. تذكير إضافي سيرسل قبل ساعة من الموعد.",
    keywords: ["تذكير", "مكالمة", "عميل", "موعد"]
  },
  {
    id: 65,
    question: "متى فيه وقت فاضي نحط فيه اجتماع أسبوعي؟",
    category: "جدولة",
    intent: "recurring_meeting",
    confidence: 0.87,
    response: "الأوقات المتاحة للاجتماع الأسبوعي: الاثنين 9 صباحاً، الأربعاء 2 عصراً، الخميس 10 صباحاً. أيهم يناسبك؟",
    keywords: ["وقت فاضي", "اجتماع أسبوعي", "مناسب", "متكرر"]
  },
  {
    id: 66,
    question: "احجز لي قاعة اجتماعات لعرض العميل",
    category: "جدولة",
    intent: "room_booking",
    confidence: 0.91,
    response: "تم حجز قاعة الاجتماعات الكبيرة لعرض العميل غداً من 2-4 عصراً. مع إعداد البروجكتر والمواد اللازمة.",
    keywords: ["حجز قاعة", "اجتماعات", "عرض", "عميل"]
  },
  {
    id: 67,
    question: "أجل الموعد المجدول مع العميل فاطمة",
    category: "جدولة",
    intent: "reschedule_appointment",
    confidence: 0.88,
    response: "تم تأجيل موعد العميلة فاطمة من اليوم إلى الأحد القادم نفس الوقت. إرسال تنبيه التأجيل وطلب تأكيد جديد.",
    keywords: ["تأجيل", "موعد", "عميلة", "تغيير"]
  },
  {
    id: 68,
    question: "اعرض لي جدول المواعيد لهذا الأسبوع",
    category: "جدولة",
    intent: "schedule_view",
    confidence: 0.93,
    response: "جدول الأسبوع: الاثنين 3 مواعيد، الثلاثاء 2 مواعيد، الأربعاء فاضي، الخميس 4 مواعيد، الجمعة موعد واحد. التفاصيل الكاملة مرفقة.",
    keywords: ["جدول مواعيد", "أسبوع", "عرض", "تقويم"]
  },
  {
    id: 69,
    question: "ألغي الاجتماع المجدول الساعة 5",
    category: "جدولة",
    intent: "cancel_meeting",
    confidence: 0.90,
    response: "تم إلغاء الاجتماع المجدول الساعة 5 مساءً. إرسال إشعار الإلغاء لجميع المشاركين مع الاعتذار عن عدم الإمكان.",
    keywords: ["إلغاء", "اجتماع", "ساعة 5", "مجدول"]
  },
  {
    id: 70,
    question: "أحتاج موعد عاجل مع المدير العام",
    category: "جدولة",
    intent: "urgent_appointment",
    confidence: 0.86,
    response: "تم التنسيق للموعد العاجل. المدير العام متاح خلال ساعة في مكتبه أو فوراً عبر مكالمة فيديو. أيهما تفضل؟",
    keywords: ["موعد عاجل", "مدير عام", "فوري", "سريع"]
  },
  {
    id: 71,
    question: "جدول لي مقابلات للوظيفة الجديدة",
    category: "جدولة",
    intent: "interview_scheduling",
    confidence: 0.89,
    response: "تم جدولة 5 مقابلات للوظيفة: غداً 2 مقابلة، بعد غد 3 مقابلات. كل مقابلة 45 دقيقة مع فترة راحة 15 دقيقة.",
    keywords: ["مقابلات", "وظيفة", "جدولة", "توظيف"]
  },
  {
    id: 72,
    question: "أرسل رابط الاجتماع المرئي للحضور",
    category: "جدولة",
    intent: "video_meeting_link",
    confidence: 0.92,
    response: "تم إرسال رابط الاجتماع المرئي لجميع المشاركين مع تعليمات الانضمام. الاجتماع سيبدأ تلقائياً في الوقت المحدد.",
    keywords: ["رابط", "اجتماع مرئي", "حضور", "فيديو"]
  },
  {
    id: 73,
    question: "حط لي تذكير شخصي للاتصال بالمورد",
    category: "جدولة",
    intent: "personal_reminder",
    confidence: 0.85,
    response: "تم إعداد تذكير شخصي للاتصال بالمورد غداً الساعة 9 صباحاً. التذكير سيصل عبر الجوال والإيميل.",
    keywords: ["تذكير شخصي", "اتصال", "مورد", "خاص"]
  },
  {
    id: 74,
    question: "ما هي المواعيد المؤكدة لهذا الشهر؟",
    category: "جدولة",
    intent: "confirmed_appointments",
    confidence: 0.88,
    response: "المواعيد المؤكدة هذا الشهر: 18 موعد عميل، 6 اجتماعات داخلية، 3 عروض تقديمية. إجمالي 27 موعد مؤكد.",
    keywords: ["مواعيد مؤكدة", "شهر", "مؤكد", "إجمالي"]
  },
  {
    id: 75,
    question: "احجز لي وقت للراحة بين المواعيد",
    category: "جدولة",
    intent: "break_scheduling",
    confidence: 0.84,
    response: "تم إضافة فترات راحة 15 دقيقة بين كل موعدين. هذا يضمن وقت كافي للتحضير والانتقال بين الاجتماعات.",
    keywords: ["وقت راحة", "بين مواعيد", "استراحة", "فاصل"]
  },
  {
    id: 76,
    question: "أحتاج تقرير بحضور الاجتماعات",
    category: "جدولة",
    intent: "attendance_report",
    confidence: 0.87,
    response: "تقرير حضور الاجتماعات: معدل الحضور 85%، أعلى حضور اجتماعات الصباح، أقل حضور اجتماعات ما بعد العصر.",
    keywords: ["تقرير حضور", "اجتماعات", "إحصائيات", "نسبة"]
  },
  {
    id: 77,
    question: "اعمل جدول مواعيد للأسبوع القادم",
    category: "جدولة",
    intent: "weekly_schedule",
    confidence: 0.91,
    response: "تم إعداد جدول الأسبوع القادم: 3 مواعيد يومياً، فترة صباحية ومسائية، مع حفظ وقت للمهام الطارئة.",
    keywords: ["جدول مواعيد", "أسبوع قادم", "تنظيم", "خطة"]
  },
  {
    id: 78,
    question: "أرسل دعوة تقويم لحفل الشركة",
    category: "جدولة",
    intent: "event_invitation",
    confidence: 0.89,
    response: "تم إرسال دعوة تقويم لحفل الشركة لجميع الموظفين مع تفاصيل المكان، الوقت، والفعاليات المخططة.",
    keywords: ["دعوة تقويم", "حفل شركة", "فعالية", "موظفين"]
  },
  {
    id: 79,
    question: "نبهني قبل كل اجتماع بـ 10 دقائق",
    category: "جدولة",
    intent: "meeting_alerts",
    confidence: 0.86,
    response: "تم إعداد تنبيهات تلقائية قبل كل اجتماع بـ 10 دقائق. التنبيه سيشمل اسم الاجتماع والمشاركين.",
    keywords: ["تنبيه", "قبل اجتماع", "10 دقائق", "تذكير"]
  },
  {
    id: 80,
    question: "أحتاج موعد لمراجعة الأداء الشهري",
    category: "جدولة",
    intent: "performance_review",
    confidence: 0.83,
    response: "تم جدولة اجتماع مراجعة الأداء الشهري نهاية هذا الأسبوع. سيشمل تقييم الإنجازات والأهداف الجديدة.",
    keywords: ["مراجعة أداء", "شهري", "تقييم", "إنجازات"]
  },

  // فئة الاستفسارات العامة (20 سؤال)
  {
    id: 81,
    question: "وش الخدمات اللي تقدمونها بالضبط؟",
    category: "استفسارات عامة",
    intent: "service_overview",
    confidence: 0.94,
    response: "نقدم: أنظمة إدارة الأعمال، تطوير المواقع والتطبيقات، أنظمة CRM، حلول التجارة الإلكترونية، والذكاء الاصطناعي.",
    keywords: ["خدمات", "نقدم", "أنظمة", "تطوير"]
  },
  {
    id: 82,
    question: "هل في خصم للعملاء الجدد؟",
    category: "استفسارات عامة",
    intent: "new_customer_discount",
    confidence: 0.91,
    response: "نعم، خصم 25% للعملاء الجدد على جميع الأنظمة + تدريب مجاني + 3 أشهر دعم فني إضافي. العرض ساري لنهاية الشهر.",
    keywords: ["خصم", "عملاء جدد", "عرض", "تخفيض"]
  },
  {
    id: 83,
    question: "كيف أبدأ معكم؟",
    category: "استفسارات عامة",
    intent: "getting_started",
    confidence: 0.88,
    response: "البداية سهلة: مكالمة استشارية مجانية 30 دقيقة لفهم احتياجاتك، ثم عرض مخصص، وأخيراً التنفيذ خلال أسبوعين.",
    keywords: ["أبدأ", "بداية", "كيف", "خطوات"]
  },
  {
    id: 84,
    question: "هل أنظمتكم آمنة؟",
    category: "استفسارات عامة",
    intent: "security_inquiry",
    confidence: 0.92,
    response: "أمان عالي المستوى: تشفير SSL 256-bit، خوادم في السعودية، نسخ احتياطية يومية، امتثال لقوانين حماية البيانات.",
    keywords: ["آمنة", "أمان", "حماية", "تشفير"]
  },
  {
    id: 85,
    question: "هل تتعاملون مع شركات خارج السعودية؟",
    category: "استفسارات عامة",
    intent: "international_service",
    confidence: 0.87,
    response: "نعم، نخدم عملاء في الخليج والشرق الأوسط. دعم متعدد اللغات، مناطق زمنية مختلفة، وامتثال للقوانين المحلية.",
    keywords: ["خارج السعودية", "دولي", "خليج", "عالمي"]
  },
  {
    id: 86,
    question: "ما هي مدة التطوير؟",
    category: "استفسارات عامة",
    intent: "development_timeline",
    confidence: 0.85,
    response: "المدة تختلف حسب التعقيد: نظام بسيط 2-4 أسابيع، متوسط 6-8 أسابيع، معقد 10-16 أسبوع. تحديثات أسبوعية مضمونة.",
    keywords: ["مدة تطوير", "وقت", "تنفيذ", "مشروع"]
  },
  {
    id: 87,
    question: "هل توفرون تدريب للموظفين؟",
    category: "استفسارات عامة",
    intent: "training_availability",
    confidence: 0.89,
    response: "نعم، تدريب شامل: حضوري أو مرئي، مواد تعليمية، شهادات معتمدة، ودعم مستمر بعد التدريب.",
    keywords: ["تدريب", "موظفين", "تعليم", "دورات"]
  },
  {
    id: 88,
    question: "ما هي تكلفة الصيانة السنوية؟",
    category: "استفسارات عامة",
    intent: "maintenance_cost",
    confidence: 0.86,
    response: "الصيانة 15% من قيمة النظام سنوياً تشمل: دعم فني، تحديثات، نسخ احتياطية، وضمان استمرارية العمل.",
    keywords: ["صيانة", "تكلفة", "سنوية", "دعم"]
  },
  {
    id: 89,
    question: "هل يمكن تجربة النظام مجاناً؟",
    category: "استفسارات عامة",
    intent: "free_trial",
    confidence: 0.93,
    response: "نعم، نسخة تجريبية مجانية 14 يوم بجميع الميزات، دون التزام، مع دعم فني كامل أثناء التجربة.",
    keywords: ["تجربة مجانية", "ديمو", "اختبار", "بدون التزام"]
  },
  {
    id: 90,
    question: "أين مقركم الرئيسي؟",
    category: "استفسارات عامة",
    intent: "location_inquiry",
    confidence: 0.84,
    response: "مقرنا الرئيسي في الرياض، مع مكاتب في جدة والدمام. نقدم خدمات عن بعد لجميع مناطق المملكة.",
    keywords: ["مقر", "موقع", "عنوان", "مكاتب"]
  },
  {
    id: 91,
    question: "كم عدد العملاء اللي تخدمونهم؟",
    category: "استفسارات عامة",
    intent: "client_portfolio",
    confidence: 0.82,
    response: "نخدم أكثر من 500 عميل من مختلف القطاعات: تجارة، تعليم، صحة، صناعة، مع نسبة رضا 98%.",
    keywords: ["عدد عملاء", "حجم", "قطاعات", "خبرة"]
  },
  {
    id: 92,
    question: "هل تقدمون استشارات مجانية؟",
    category: "استفسارات عامة",
    intent: "free_consultation",
    confidence: 0.90,
    response: "نعم، استشارة مجانية 45 دقيقة مع خبرائنا لتحليل احتياجاتك وتقديم أفضل الحلول. احجز موعدك الآن.",
    keywords: ["استشارة مجانية", "خبراء", "تحليل", "حلول"]
  },
  {
    id: 93,
    question: "ما هي طرق التواصل معكم؟",
    category: "استفسارات عامة",
    intent: "contact_methods",
    confidence: 0.88,
    response: "تواصل معنا عبر: هاتف، واتساب، إيميل، الدردشة المباشرة بالموقع، أو زيارة مكاتبنا. متاحون 24/7.",
    keywords: ["تواصل", "اتصال", "طرق", "خدمة عملاء"]
  },
  {
    id: 94,
    question: "هل أنظمتكم متوافقة مع الجوال؟",
    category: "استفسارات عامة",
    intent: "mobile_compatibility",
    confidence: 0.87,
    response: "نعم، جميع أنظمتنا متجاوبة تعمل بكفاءة على الجوال والتابلت مع تطبيقات مخصصة للأندرويد وآيفون.",
    keywords: ["متوافق", "جوال", "متجاوب", "تطبيق"]
  },
  {
    id: 95,
    question: "كيف تضمنون جودة الخدمة؟",
    category: "استفسارات عامة",
    intent: "quality_assurance",
    confidence: 0.85,
    response: "ضمان الجودة عبر: اختبارات شاملة، مراجعة من فرق متخصصة، معايير عالمية، وضمان استرداد في حال عدم الرضا.",
    keywords: ["جودة", "ضمان", "اختبارات", "معايير"]
  },
  {
    id: 96,
    question: "هل تقدمون حلول مخصصة؟",
    category: "استفسارات عامة",
    intent: "custom_solutions",
    confidence: 0.89,
    response: "نعم، نطور حلول مخصصة بالكامل حسب احتياجاتك الفريدة. من التصميم للتطوير للتنفيذ.",
    keywords: ["حلول مخصصة", "تطوير خاص", "فريد", "مختص"]
  },
  {
    id: 97,
    question: "ما هي الضمانات المقدمة؟",
    category: "استفسارات عامة",
    intent: "warranty_terms",
    confidence: 0.86,
    response: "ضمانات شاملة: سنة كاملة على النظام، ضمان أداء، استرداد جزئي، ودعم مجاني طوال فترة الضمان.",
    keywords: ["ضمانات", "شروط", "سنة", "حماية"]
  },
  {
    id: 98,
    question: "هل يمكن ترقية النظام لاحقاً؟",
    category: "استفسارات عامة",
    intent: "system_upgrade",
    confidence: 0.84,
    response: "نعم، الترقية متاحة دائماً. نضيف ميزات جديدة، نحسن الأداء، ونطور القدرات حسب نمو عملك.",
    keywords: ["ترقية", "تطوير", "تحسين", "نمو"]
  },
  {
    id: 99,
    question: "كم سعر الاستشارة التقنية؟",
    category: "استفسارات عامة",
    intent: "consultation_cost",
    confidence: 0.83,
    response: "الاستشارة الأولى مجانية. الاستشارات المتخصصة 500 ريال/ساعة مع إمكانية خصم القيمة من المشروع.",
    keywords: ["سعر استشارة", "تقنية", "تكلفة", "مجانية"]
  },
  {
    id: 100,
    question: "متى يكون النظام جاهز للاستخدام؟",
    category: "استفسارات عامة",
    intent: "system_readiness",
    confidence: 0.88,
    response: "بعد التطوير، نحتاج 3-5 أيام للاختبار النهائي، التدريب، ونقل البيانات. ثم النظام جاهز 100%.",
    keywords: ["جاهز", "استخدام", "انتهاء", "تفعيل"]
  }
];

// أنماط تصنيف النوايا المحسنة
export const INTENT_PATTERNS: IntentPattern[] = [
  {
    category: "مبيعات",
    patterns: [
      /سعر|تكلفة|كم|price|cost/i,
      /عرض|quote|proposal/i,
      /شراء|buy|purchase|اشتري/i,
      /خصم|discount|تخفيض/i,
      /خطة|plan|package/i
    ],
    keywords: ["سعر", "تكلفة", "عرض", "شراء", "خصم", "خطة"],
    priority: 1
  },
  {
    category: "خدمة عملاء",
    patterns: [
      /مشكلة|شكوى|problem|complaint/i,
      /دعم|support|مساعدة|help/i,
      /استرداد|refund|إرجاع/i,
      /تدريب|training|تعليم/i,
      /حساب|account|login/i
    ],
    keywords: ["مشكلة", "دعم", "مساعدة", "استرداد", "تدريب"],
    priority: 2
  },
  {
    category: "تسويق",
    patterns: [
      /حملة|campaign|إعلان|ad/i,
      /تسويق|marketing|ترويج/i,
      /سوشيال|social|منشور/i,
      /محتوى|content|إبداعي/i,
      /جمهور|audience|مستهدف/i
    ],
    keywords: ["حملة", "تسويق", "إعلان", "محتوى", "جمهور"],
    priority: 3
  },
  {
    category: "جدولة",
    patterns: [
      /موعد|appointment|meeting/i,
      /اجتماع|جدولة|schedule/i,
      /تقويم|calendar|تاريخ/i,
      /تذكير|reminder|تنبيه/i,
      /حجز|booking|reservation/i
    ],
    keywords: ["موعد", "اجتماع", "جدولة", "تذكير", "حجز"],
    priority: 4
  },
  {
    category: "استفسارات عامة",
    patterns: [
      /ماذا|what|وش|ايش/i,
      /كيف|how|طريقة/i,
      /معلومات|info|تفاصيل/i,
      /خدمات|services|منتجات/i,
      /عام|general|استفسار/i
    ],
    keywords: ["ماذا", "كيف", "معلومات", "خدمات", "استفسار"],
    priority: 5
  }
];

export class EnhancedIntentAgent {
  private questions: ExpectedQuestion[];
  private patterns: IntentPattern[];

  constructor() {
    this.questions = EXPECTED_QUESTIONS;
    this.patterns = INTENT_PATTERNS;
  }

  // تحليل النية الذكي مع البحث في الأسئلة المتوقعة
  analyzeIntent(userInput: string): {
    category: string;
    intent: string;
    confidence: number;
    suggestedResponse: string;
    matchedQuestion?: ExpectedQuestion;
  } {
    const input = userInput.toLowerCase().trim();
    
    // البحث أولاً في الأسئلة المتوقعة
    const directMatch = this.findDirectMatch(input);
    if (directMatch && directMatch.confidence > 0.8) {
      return {
        category: directMatch.category,
        intent: directMatch.intent,
        confidence: directMatch.confidence,
        suggestedResponse: directMatch.response,
        matchedQuestion: directMatch
      };
    }

    // البحث بالكلمات المفتاحية
    const keywordMatch = this.findKeywordMatch(input);
    if (keywordMatch && keywordMatch.confidence > 0.7) {
      return {
        category: keywordMatch.category,
        intent: keywordMatch.intent,
        confidence: keywordMatch.confidence,
        suggestedResponse: keywordMatch.response,
        matchedQuestion: keywordMatch
      };
    }

    // التصنيف بالأنماط العامة
    const patternMatch = this.classifyByPatterns(input);
    return {
      category: patternMatch.category,
      intent: 'general_inquiry',
      confidence: patternMatch.confidence,
      suggestedResponse: `تم تصنيف طلبك ضمن ${patternMatch.category}. سيقوم الوكيل المختص بالتعامل معه فوراً.`
    };
  }

  private findDirectMatch(input: string): ExpectedQuestion | null {
    for (const question of this.questions) {
      const similarity = this.calculateSimilarity(input, question.question.toLowerCase());
      if (similarity > 0.8) {
        return { ...question, confidence: similarity };
      }
    }
    return null;
  }

  private findKeywordMatch(input: string): ExpectedQuestion | null {
    let bestMatch: ExpectedQuestion | null = null;
    let bestScore = 0;

    for (const question of this.questions) {
      const score = this.calculateKeywordScore(input, question.keywords);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = { ...question, confidence: score };
      }
    }

    return bestMatch;
  }

  private classifyByPatterns(input: string): { category: string; confidence: number } {
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(input)) {
          return {
            category: pattern.category,
            confidence: 0.6
          };
        }
      }
    }

    return {
      category: "استفسارات عامة",
      confidence: 0.5
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    let matches = 0;
    for (const word1 of words1) {
      if (word1.length > 2) {
        for (const word2 of words2) {
          if (word2.includes(word1) || word1.includes(word2)) {
            matches++;
            break;
          }
        }
      }
    }

    return matches / Math.max(words1.length, words2.length);
  }

  private calculateKeywordScore(input: string, keywords: string[]): number {
    let score = 0;
    for (const keyword of keywords) {
      if (input.includes(keyword.toLowerCase())) {
        score += 1 / keywords.length;
      }
    }
    return score;
  }

  // إحصائيات النظام
  getSystemStats() {
    const categoryStats = this.questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions: this.questions.length,
      categoriesCount: Object.keys(categoryStats).length,
      categoryBreakdown: categoryStats,
      averageConfidence: this.questions.reduce((sum, q) => sum + q.confidence, 0) / this.questions.length
    };
  }

  // البحث عن أسئلة حسب الفئة
  getQuestionsByCategory(category: string): ExpectedQuestion[] {
    return this.questions.filter(q => q.category === category);
  }

  // الحصول على أكثر الأسئلة شيوعاً
  getMostConfidentQuestions(limit: number = 10): ExpectedQuestion[] {
    return this.questions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }
}