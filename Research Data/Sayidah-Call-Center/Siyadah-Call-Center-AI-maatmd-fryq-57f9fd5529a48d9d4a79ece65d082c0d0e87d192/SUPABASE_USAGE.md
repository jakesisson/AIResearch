# دليل استخدام Supabase مع النظام

## الاتصال الحالي
النظام متصل بنجاح مع قاعدة بيانات Supabase PostgreSQL باستخدام:
```
DATABASE_URL=postgresql://postgres.zlnerstfmdvyiafkmutl:kujm4VUpjS0NUQaVPoPssn@aws-0-eu-north-1.pooler.supabase.com:6543/postgres
```

## نوع الاتصال: PostgreSQL Direct Connection
نحن نستخدم اتصال PostgreSQL مباشر عبر Transaction Pooler، وليس Supabase JavaScript SDK.

**لا نحتاج إلى:**
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- Supabase JavaScript Client

**نستخدم:**
- DATABASE_URL مباشرة مع Drizzle ORM
- اتصال PostgreSQL أصلي
- Transaction pooler للأداء العالي

## تحقق من المشروع الصحيح في Supabase
1. **تأكد من أنك في المشروع الصحيح**: `zlnerstfmdvyiafkmutl`
2. **المنطقة**: aws-0-eu-north-1 (أوروبا الشمالية)
3. **البورت**: 6543 (Transaction pooler)

الجداول المتوفرة حالياً:
- activities (52 سجل)
- ai_team_members (31 عضو)
- opportunities (31 فرصة)
- support_tickets
- users (1 مستخدم)
- workflows
- integrations
- notifications

## طرق استخدام قاعدة البيانات

### 1. استخدام SQL Editor في Supabase Dashboard
للاستعلامات المباشرة، استخدم SQL commands فقط:

```sql
-- عرض جميع المستخدمين
SELECT * FROM users;

-- عرض الفرص التجارية
SELECT * FROM opportunities ORDER BY created_at DESC LIMIT 10;

-- عرض إحصائيات الفريق الذكي
SELECT name, specialization, active_deals, conversion_rate 
FROM ai_team_members 
WHERE is_active = true;

-- إدراج فرصة جديدة
INSERT INTO opportunities (name, email, value, stage, probability, assigned_agent)
VALUES ('عميل جديد', 'client@example.com', 100000, 'qualification', 80, 'سارة المبيعات');
```

### 2. استخدام API Endpoints من التطبيق
النظام يوفر واجهات برمجية كاملة:

```bash
# الحصول على البيانات
curl "http://localhost:5000/api/opportunities"

# إضافة فرصة جديدة
curl -X POST "http://localhost:5000/api/opportunities" \
  -H "Content-Type: application/json" \
  -d '{"name": "عميل جديد", "email": "test@example.com", "value": 50000}'

# تحديث بيانات
curl -X PATCH "http://localhost:5000/api/opportunities/1" \
  -H "Content-Type: application/json" \
  -d '{"stage": "proposal", "probability": 90}'
```

### 3. الوصول المباشر عبر Drizzle ORM
```typescript
import { db } from './server/database';
import { opportunities } from '@shared/schema';

// استعلام البيانات
const allOpportunities = await db.select().from(opportunities);

// إدراج بيانات جديدة
const newOpp = await db.insert(opportunities).values({
  name: "فرصة جديدة",
  email: "client@example.com",
  value: 75000,
  stage: "qualification"
}).returning();
```

## الجداول المتاحة
- `users` - المستخدمين
- `opportunities` - الفرص التجارية
- `workflows` - سير العمل
- `support_tickets` - تذاكر الدعم
- `ai_team_members` - أعضاء الفريق الذكي
- `activities` - سجل الأنشطة
- `notifications` - الإشعارات
- `integrations` - التكاملات

## حالة النظام الحالية
✅ قاعدة البيانات متصلة ومُحدثة
✅ جميع الجداول تم إنشاؤها
✅ البيانات التجريبية متوفرة
✅ API endpoints تعمل بشكل كامل
✅ واجهة المستخدم العربية تعمل بسلاسة