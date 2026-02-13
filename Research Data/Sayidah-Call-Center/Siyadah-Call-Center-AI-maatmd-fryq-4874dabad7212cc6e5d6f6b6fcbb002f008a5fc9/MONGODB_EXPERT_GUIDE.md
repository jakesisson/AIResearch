# دليل خبير MongoDB - الإعداد المتكامل

## 1. هيكلة القواعد والمجموعات

### هيكل قاعدة البيانات الموصى به:
```javascript
// قاعدة البيانات الأساسية
business_automation/
├── users                 // المستخدمين والأدوار
├── ai_agents            // الوكلاء الذكيين
├── opportunities        // الفرص التجارية
├── workflows            // سير العمل
├── support_tickets      // تذاكر الدعم
├── activities           // سجل الأنشطة
├── notifications        // الإشعارات
├── integrations         // التكاملات الخارجية
├── audit_logs           // سجلات المراجعة
└── system_metrics       // مقاييس النظام
```

### مخططات البيانات الموصى بها:
```javascript
// مخطط Users مع التشفير
users: {
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password_hash: String (bcrypt),
  role: String (enum: ['admin', 'manager', 'agent']),
  permissions: [String],
  last_login: Date,
  failed_attempts: Number,
  locked_until: Date,
  created_at: Date,
  updated_at: Date
}

// مخطط AI Agents مع الأداء
ai_agents: {
  _id: ObjectId,
  name: String,
  role: String,
  specialization: String,
  status: String (enum: ['active', 'inactive', 'maintenance']),
  performance_metrics: {
    success_rate: Number,
    avg_response_time: Number,
    tasks_completed: Number,
    efficiency: Number
  },
  created_at: Date,
  updated_at: Date
}
```

## 2. ضبط الأمان والتوثيق

### إنشاء الأدوار الأمنية:
```javascript
// 1. إنشاء مدير قاعدة البيانات
db.createUser({
  user: "db_admin",
  pwd: "complex_password_123!",
  roles: [
    { role: "dbAdmin", db: "business_automation" },
    { role: "readWrite", db: "business_automation" }
  ]
})

// 2. إنشاء مستخدم للتطبيق
db.createUser({
  user: "app_user",
  pwd: "app_password_456!",
  roles: [
    { role: "readWrite", db: "business_automation" }
  ]
})

// 3. إنشاء مستخدم للقراءة فقط (التقارير)
db.createUser({
  user: "readonly_user",
  pwd: "readonly_password_789!",
  roles: [
    { role: "read", db: "business_automation" }
  ]
})
```

### إعدادات الأمان المتقدمة:
```javascript
// تفعيل التشفير أثناء النقل
ssl: {
  mode: "requireSSL",
  certificateKeyFile: "/path/to/certificate.pem"
}

// تفعيل التشفير أثناء التخزين
security: {
  enableEncryption: true,
  encryptionKeyFile: "/path/to/key"
}

// تقييد الشبكات
net: {
  bindIp: "127.0.0.1,10.0.0.0/8",
  ipv6: false
}
```

## 3. إعداد النسخ الاحتياطي والاسترجاع

### نسخ احتياطية تلقائية:
```bash
#!/bin/bash
# سكريبت النسخ الاحتياطي اليومي

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="business_automation"

# إنشاء نسخة احتياطية
mongodump --host cluster0.zabls2k.mongodb.net \
          --username backup_user \
          --password $MONGO_BACKUP_PASSWORD \
          --db $DB_NAME \
          --out $BACKUP_DIR/$DATE

# ضغط النسخة
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/$DATE

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

# رفع للتخزين السحابي
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://mongodb-backups/
```

### استراتيجية الاسترجاع:
```bash
# استرجاع كامل
mongorestore --host cluster0.zabls2k.mongodb.net \
             --username restore_user \
             --password $MONGO_RESTORE_PASSWORD \
             --db business_automation \
             /backups/mongodb/20250624_120000

# استرجاع مجموعة واحدة
mongorestore --host cluster0.zabls2k.mongodb.net \
             --username restore_user \
             --password $MONGO_RESTORE_PASSWORD \
             --db business_automation \
             --collection ai_agents \
             /backups/mongodb/20250624_120000/business_automation/ai_agents.bson
```

## 4. المراقبة وتنبيهات الأداء

### مقاييس المراقبة الأساسية:
```javascript
// إعداد مؤشرات الأداء
db.runCommand({
  "profile": 2,  // تسجيل جميع العمليات
  "slowms": 100  // العمليات البطيئة أكثر من 100ms
})

// مراقبة الاتصالات
db.serverStatus().connections

// مراقبة استخدام الذاكرة
db.serverStatus().mem

// مراقبة العمليات النشطة
db.currentOp()
```

### تنبيهات MongoDB Atlas:
```javascript
// تنبيهات الاستخدام
{
  "metric": "DATABASE_DISK_USAGE_DATA_SIZE",
  "threshold": 80,
  "units": "PERCENTAGE",
  "mode": "AVERAGE"
}

// تنبيهات الأداء
{
  "metric": "DATABASE_AVERAGE_OPERATION_EXECUTION_TIME",
  "threshold": 1000,
  "units": "MILLISECONDS",
  "mode": "AVERAGE"
}

// تنبيهات الاتصالات
{
  "metric": "DATABASE_CONNECTION_COUNT",
  "threshold": 100,
  "units": "RAW",
  "mode": "AVERAGE"
}
```

### سكريبت مراقبة مخصص:
```javascript
// monitoring_script.js
function checkDatabaseHealth() {
  var stats = db.serverStatus();
  var metrics = {
    connections: stats.connections.current,
    memory: stats.mem.resident,
    operations: stats.opcounters,
    timestamp: new Date()
  };
  
  // حفظ المقاييس
  db.system_metrics.insertOne(metrics);
  
  // فحص التنبيهات
  if (metrics.connections > 100) {
    // إرسال تنبيه
    sendAlert("High connection count: " + metrics.connections);
  }
  
  if (metrics.memory > 1000) {
    sendAlert("High memory usage: " + metrics.memory + "MB");
  }
}

// تشغيل كل 5 دقائق
setInterval(checkDatabaseHealth, 300000);
```

## 5. اختبارات دورية للأمان والتحميل

### اختبارات الأمان الأسبوعية:
```bash
#!/bin/bash
# security_tests.sh

echo "فحص أمان MongoDB..."

# 1. فحص المستخدمين والأدوار
mongo --eval "db.getUsers()"

# 2. فحص كلمات المرور الضعيفة
mongo --eval "
db.getUsers().forEach(function(user) {
  if(user.user.length < 8) {
    print('تحذير: كلمة مرور ضعيفة للمستخدم: ' + user.user);
  }
});
"

# 3. فحص الأذونات المفرطة
mongo --eval "
db.getUsers().forEach(function(user) {
  user.roles.forEach(function(role) {
    if(role.role === 'root' || role.role === 'dbAdminAnyDatabase') {
      print('تحذير: أذونات مفرطة للمستخدم: ' + user.user);
    }
  });
});
"

# 4. فحص الاتصالات المشبوهة
mongo --eval "
db.currentOp().inprog.forEach(function(op) {
  if(op.client && !op.client.match(/^(127\\.0\\.0\\.1|10\\.|192\\.168\\.)/)) {
    print('تحذير: اتصال مشبوه من: ' + op.client);
  }
});
"
```

### اختبارات التحميل الشهرية:
```javascript
// load_test.js
const { MongoClient } = require('mongodb');

async function performLoadTest() {
  const client = new MongoClient(connectionString);
  const concurrentOperations = 100;
  const operationsPerThread = 1000;
  
  console.log('بدء اختبار التحميل...');
  
  const promises = [];
  for (let i = 0; i < concurrentOperations; i++) {
    promises.push(runConcurrentOperations(client, operationsPerThread));
  }
  
  const startTime = Date.now();
  await Promise.all(promises);
  const endTime = Date.now();
  
  console.log(`اكتمل الاختبار في ${endTime - startTime}ms`);
  console.log(`المعدل: ${(concurrentOperations * operationsPerThread) / ((endTime - startTime) / 1000)} عملية/ثانية`);
}

async function runConcurrentOperations(client, count) {
  const db = client.db('business_automation');
  const collection = db.collection('load_test');
  
  for (let i = 0; i < count; i++) {
    await collection.insertOne({
      data: `test_data_${i}`,
      timestamp: new Date(),
      random: Math.random()
    });
  }
}

// تشغيل الاختبار
performLoadTest();
```

### جدولة الاختبارات:
```bash
# إضافة للـ crontab
# اختبارات الأمان كل أسبوع (الأحد 2 صباحاً)
0 2 * * 0 /scripts/security_tests.sh

# اختبارات التحميل كل شهر (أول يوم 3 صباحاً)
0 3 1 * * node /scripts/load_test.js

# نسخ احتياطية يومية (كل يوم 1 صباحاً)
0 1 * * * /scripts/backup.sh

# تنظيف سجلات قديمة (كل يوم 4 صباحاً)
0 4 * * * mongo --eval "db.audit_logs.deleteMany({created_at: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})"
```

## ملخص التوصيات

### أولويات فورية:
1. **إنشاء مستخدمين بأدوار محددة** بدلاً من استخدام مستخدم واحد
2. **تفعيل النسخ الاحتياطية التلقائية** مع الحفظ السحابي
3. **إعداد تنبيهات الأداء** لمراقبة الاستخدام
4. **إنشاء فهارس محسنة** للاستعلامات المتكررة

### أولويات متوسطة:
1. **تنفيذ تشفير البيانات** الحساسة
2. **إعداد اختبارات الأمان** الدورية
3. **تحسين استعلامات الاستخدام** الثقيل
4. **إنشاء بيئة اختبار** منفصلة

### أولويات طويلة المدى:
1. **التوسع الأفقي** (Sharding) عند النمو
2. **إعداد Replica Sets** للتوفر العالي
3. **تنفيذ Data Archiving** للبيانات القديمة
4. **تحسين الشبكة** وتوطين البيانات