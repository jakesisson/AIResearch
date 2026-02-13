# API Test Suite
## مجموعة اختبارات APIs تلقائية

تم إنشاؤها تلقائياً من OpenAPI specification

### التثبيت

```bash
pip install -r requirements.txt
```

### تشغيل الاختبارات

#### تشغيل جميع الاختبارات
```bash
python test_runner.py --run
```

#### تشغيل مجموعة محددة
```bash
python test_runner.py --suite backend
python test_runner.py --suite frontend  
python test_runner.py --suite integration
```

#### بدء الجدولة التلقائية
```bash
python test_runner.py --schedule
```

### بنية المشروع

```
tests/
├── backend/           # اختبارات Backend مباشرة
├── frontend/          # اختبارات Frontend ومحاكاة المستخدم
├── integration/       # اختبارات التكامل مع الخدمات الخارجية
├── reports/           # تقارير النتائج
├── logs/              # ملفات السجلات
├── test_runner.py     # وكيل تشغيل الاختبارات
├── test_config.json   # إعدادات الاختبارات
└── requirements.txt   # متطلبات Python
```

### إعداد الإشعارات

قم بتحرير ملف `test_config.json` لتفعيل إشعارات البريد الإلكتروني أو Slack.

### التقارير

- تقارير JSON: `tests/reports/*.json`
- تقارير HTML: `tests/reports/*.html`
- السجلات: `tests/logs/test_runner.log`

### أنواع الاختبارات

1. **Backend Tests**: اختبارات API مباشرة عبر HTTP requests
2. **Frontend Tests**: محاكاة تفاعل المستخدم مع رؤوس المتصفح و Selenium
3. **Integration Tests**: اختبارات التكامل مع الخدمات الخارجية باستخدام mocks

### الجدولة

الاختبارات تعمل تلقائياً حسب الجدولة المحددة في `test_config.json`:
- يومياً في وقت محدد
- كل عدة ساعات
- عند الحاجة يدوياً

### المراقبة

النظام يرسل إشعارات عند:
- فشل أي اختبار
- انخفاض معدل النجاح عن الحد المسموح
- زيادة زمن الاستجابة عن المعدل المقبول
