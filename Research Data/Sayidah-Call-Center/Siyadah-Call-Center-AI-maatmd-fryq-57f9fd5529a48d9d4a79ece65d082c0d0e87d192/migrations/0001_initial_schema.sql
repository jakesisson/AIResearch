-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"avatar" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create ai_team_members table
CREATE TABLE IF NOT EXISTS "ai_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"specialization" text NOT NULL,
	"avatar" text,
	"active_deals" integer DEFAULT 0 NOT NULL,
	"conversion_rate" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"stage" text NOT NULL,
	"value" integer NOT NULL,
	"probability" integer NOT NULL,
	"assigned_agent" text NOT NULL,
	"source" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"last_activity" text,
	"next_action" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"notes" text,
	"tags" text[],
	"expected_close_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"description" text,
	"config" jsonb,
	"triggers" text[],
	"actions" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"priority" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"assigned_to" text,
	"response_time" integer,
	"satisfaction" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create activities table
CREATE TABLE IF NOT EXISTS "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"entity_type" text,
	"entity_id" integer,
	"user_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"user_id" integer,
	"is_read" boolean DEFAULT false NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Insert initial AI team members
INSERT INTO "ai_team_members" ("name", "specialization", "avatar", "active_deals", "conversion_rate", "is_active") VALUES
('سارة المبيعات', 'تأهيل العملاء والمبيعات', 'https://images.unsplash.com/photo-1494790108755-2616b612b5aa?w=150&h=150&fit=crop&crop=face', 3, 85, true),
('أحمد التطوير', 'تحليل الأعمال والحلول التقنية', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 1, 92, true),
('فاطمة الدعم', 'خدمة العملاء والدعم الفني', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', 0, 96, true);

-- Insert sample opportunities
INSERT INTO "opportunities" ("name", "stage", "value", "probability", "assigned_agent", "source", "contact_person", "email", "phone", "priority", "notes", "last_activity") VALUES
('شركة التقنية المتقدمة', 'qualified', 250000, 75, 'سارة المبيعات', 'موقع إلكتروني', 'أحمد الخالدي', 'ahmed@techadvanced.com', '+966501234567', 'high', 'عميل مهتم بحلول إدارة المشاريع', 'اتصال متابعة - منذ يوم'),
('مؤسسة الابتكار الرقمي', 'proposal', 180000, 60, 'أحمد التطوير', 'إحالة', 'فاطمة السعدي', 'fatima@digitalinnovation.sa', '+966502345678', 'medium', 'يحتاجون لنظام CRM مخصص', 'إرسال عرض فني - منذ 3 أيام'),
('شركة النمو المستدام', 'negotiation', 320000, 85, 'سارة المبيعات', 'معرض تجاري', 'محمد العتيبي', 'mohammed@sustainablegrowth.com', '+966503456789', 'high', 'مشروع تحول رقمي شامل', 'جلسة تفاوض - منذ ساعتين'),
('مجموعة الشرق الأوسط', 'lead', 90000, 30, 'فاطمة الدعم', 'مكالمة باردة', 'علياء القحطاني', 'alya@middleeastgroup.sa', '+966504567890', 'low', 'استفسار أولي عن الخدمات', 'مكالمة استطلاعية - منذ أسبوع');

-- Insert sample support tickets
INSERT INTO "support_tickets" ("subject", "description", "status", "priority", "customer_name", "customer_email", "assigned_to", "response_time", "satisfaction") VALUES
('مشكلة في تسجيل الدخول', 'لا أستطيع الوصول لحسابي رغم إدخال البيانات الصحيحة', 'resolved', 'high', 'خالد المالكي', 'khalid@example.com', 'فاطمة الدعم', 15, 5),
('طلب تدريب على النظام', 'نحتاج جلسة تدريبية لفريق العمل على استخدام المنصة', 'in_progress', 'medium', 'نورا الحمدان', 'nora@company.sa', 'أحمد التطوير', 45, null),
('استفسار عن الفوترة', 'سؤال حول تفاصيل الفاتورة الأخيرة', 'open', 'low', 'عبدالله الغامدي', 'abdullah@business.com', 'فاطمة الدعم', null, null);

-- Insert sample activities
INSERT INTO "activities" ("type", "title", "description", "entity_type", "entity_id") VALUES
('opportunity_created', 'إنشاء فرصة جديدة', 'تم إنشاء فرصة جديدة: شركة التقنية المتقدمة', 'opportunity', 1),
('ticket_resolved', 'حل تذكرة دعم', 'تم حل مشكلة تسجيل الدخول للعميل خالد المالكي', 'support_ticket', 1),
('deal_advanced', 'تقدم في الصفقة', 'انتقلت صفقة شركة النمو المستدام إلى مرحلة التفاوض', 'opportunity', 3),
('team_performance', 'تحديث أداء الفريق', 'سارة المبيعات حققت هدف المبيعات الشهري', 'ai_team_member', 1),
('workflow_triggered', 'تفعيل سير عمل', 'تم تفعيل سير عمل متابعة العملاء المحتملين', 'workflow', null);

-- Insert sample workflows
INSERT INTO "workflows" ("name", "type", "status", "description", "config", "triggers", "actions", "is_active") VALUES
('متابعة العملاء المحتملين', 'sales', 'active', 'سير عمل تلقائي لمتابعة العملاء الجدد', '{"frequency": "daily", "reminder_days": [1, 3, 7]}', ARRAY['new_lead_created'], ARRAY['send_email', 'create_task', 'schedule_call'], true),
('إشعارات الدعم الفني', 'support', 'active', 'إرسال تنبيهات للتذاكر عالية الأولوية', '{"escalation_time": 30, "notification_channels": ["email", "slack"]}', ARRAY['high_priority_ticket'], ARRAY['notify_manager', 'escalate_ticket'], true),
('تقارير الأداء الأسبوعية', 'analytics', 'active', 'إنشاء تقارير أداء تلقائية', '{"report_day": "sunday", "recipients": ["management@company.com"]}', ARRAY['weekly_schedule'], ARRAY['generate_report', 'send_email'], true);