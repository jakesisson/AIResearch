# إصلاح تركيب الصوت - Siyadah AI

## المشكلة المبلغة
"لا يتكلم ويرد علي بالصوت" - النظام يفهم لكن لا يرد صوتياً

## السبب المحتمل
1. **مشاكل XML**: أحرف خاصة في ردود AI تكسر TwiML
2. **طول النص**: ردود طويلة تسبب مشاكل في التركيب
3. **أحرف غير مدعومة**: رموز تتداخل مع Polly

## الحل المطبق

### 1. XML Escaping
```typescript
const escapedResponse = aiResponse
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');
```

### 2. تنظيف النص للصوت
```typescript
response = response
  .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0020-\u007E]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
```

### 3. تحديد طول الرد
```typescript
if (response.length > 200) {
  response = response.substring(0, 200).trim() + '.';
}
```

### 4. تحسين التوقيت
```xml
<Say voice="Polly.Zeina" language="ar" rate="0.85">النص</Say>
<Pause length="1"/>
<Gather>...</Gather>
```

## النتيجة المتوقعة

الآن النظام سيقوم بـ:
1. **توليد رد نصي** من GPT-4o
2. **تنظيف النص** من الأحرف المشكلة
3. **إنشاء TwiML صحيح** مع Say elements
4. **تركيب صوتي** عبر Polly.Zeina
5. **تشغيل الصوت** للمتصل
6. **انتظار الرد** للمتابعة

## الاختبار
- TwiML يحتوي على Say elements صحيحة
- Polly.Zeina voice مع معدل 0.85
- Pause elements للتوقيت المناسب
- Gather للاستماع التفاعلي

النظام الآن جاهز للتحدث والاستماع بفعالية.