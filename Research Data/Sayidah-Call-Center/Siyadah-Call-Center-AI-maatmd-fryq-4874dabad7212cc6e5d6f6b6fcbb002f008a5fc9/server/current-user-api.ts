import type { Express } from "express";
import { authenticateToken } from "./enterprise-saas-auth";

// معلومات المستخدمين مع الأدوار المحددة
const DEMO_USERS_WITH_ROLES = [
  {
    id: "user_001",
    email: "admin@demo.siyadah.ai", 
    roleId: "service_provider_admin",
    roleName: "Service Provider Admin",
    roleNameAr: "مدير مقدم الخدمة",
    roleLevel: 2,
    organizationId: "demo_company_001"
  },
  {
    id: "user_002", 
    email: "admin@startup.tech",
    roleId: "client_account_manager",
    roleName: "Client Account Manager",
    roleNameAr: "مدير حساب العميل",
    roleLevel: 3,
    organizationId: "startup_tech_002"
  },
  {
    id: "user_003",
    email: "admin@enterprise.corp", 
    roleId: "service_provider_admin",
    roleName: "Service Provider Admin", 
    roleNameAr: "مدير مقدم الخدمة",
    roleLevel: 2,
    organizationId: "enterprise_corp_003"
  },
  {
    id: "user_004",
    email: "admin@siyadah.ai",
    roleId: "system_super_admin",
    roleName: "System Super Admin",
    roleNameAr: "مدير النظام الرئيسي", 
    roleLevel: 1,
    organizationId: "siyadah_main"
  }
];

export function setupCurrentUserAPI(app: Express) {
  // الحصول على المستخدم الحالي مع معلومات الدور
  app.get('/api/saas/current-user', authenticateToken, async (req: any, res) => {
    try {
      const { email } = req.user;
      
      // البحث عن المستخدم بالبريد الإلكتروني
      const currentUser = DEMO_USERS_WITH_ROLES.find(u => u.email === email);
      
      if (!currentUser) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      res.json(currentUser);
    } catch (error) {
      console.error('خطأ في الحصول على المستخدم الحالي:', error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  console.log('✅ Current User API configured successfully');
}