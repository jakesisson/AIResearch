import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export interface Permission {
  resource: string;
  action: string;
  scope: string;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  roleNameAr: string;
  level: number;
  permissions: Permission[];
}

// صلاحيات الصفحات حسب الدور
export const PAGE_PERMISSIONS = {
  // صفحات الإدارة العليا
  '/admin/users': { resource: 'users', action: 'manage', minLevel: 1 },
  '/admin/organizations': { resource: 'organizations', action: 'manage', minLevel: 1 },
  '/admin/system': { resource: 'system', action: 'manage', minLevel: 1 },
  '/admin/billing': { resource: 'billing', action: 'manage', minLevel: 2 },
  
  // صفحات إدارة المؤسسة
  '/settings/advanced': { resource: 'settings', action: 'manage', minLevel: 2 },
  '/settings/integrations': { resource: 'integrations', action: 'manage', minLevel: 3 },
  '/settings/security': { resource: 'security', action: 'manage', minLevel: 3 },
  
  // صفحات الأعمال
  '/business/analytics': { resource: 'analytics', action: 'read', minLevel: 4 },
  '/business/reports': { resource: 'reports', action: 'read', minLevel: 4 },
  '/business/financial': { resource: 'financial', action: 'read', minLevel: 3 },
  
  // صفحات الذكاء الاصطناعي
  '/ai/team-management': { resource: 'ai_agents', action: 'manage', minLevel: 3 },
  '/ai/training': { resource: 'ai_training', action: 'manage', minLevel: 2 },
  
  // صفحات التواصل
  '/communication/whatsapp': { resource: 'whatsapp', action: 'use', minLevel: 5 },
  '/communication/voice': { resource: 'voice', action: 'use', minLevel: 5 },
  '/communication/email': { resource: 'email', action: 'use', minLevel: 5 }
};

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  
  // Test permission using the working RBAC API
  const testPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const response = await fetch('/api/rbac/test-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resource,
          action
        })
      });
      
      const result = await response.json();
      return result.success && result.hasPermission;
    } catch (error) {
      console.error('Permission test failed:', error);
      return false;
    }
  };

  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ['/api/rbac/user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user role info by testing a basic permission
      try {
        const response = await fetch('/api/rbac/test-permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            resource: '/api/dashboard',
            action: 'GET'
          })
        });
        
        const result = await response.json();
        if (result.success) {
          return {
            roleId: result.roleId,
            roleName: result.roleName,
            roleLevel: result.roleLevel,
            userId: result.userId
          };
        }
      } catch (error) {
        console.error('Failed to get user permissions:', error);
      }
      
      return null;
    },
    enabled: isAuthenticated && !!user?.id,
    retry: false,
  });

  // معلومات الصلاحيات من الاستجابة
  const userRole = userPermissions?.roleName || '';
  const userLevel = userPermissions?.roleLevel || 6;

  // التحقق من صلاحية صفحة معينة
  const canAccessPage = async (pagePath: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const pagePermission = PAGE_PERMISSIONS[pagePath as keyof typeof PAGE_PERMISSIONS];
    if (!pagePermission) return true; // صفحة عامة
    
    // التحقق من المستوى المطلوب
    const userLevel = userPermissions?.roleLevel || 6;
    if (userLevel > pagePermission.minLevel) return false;
    
    // التحقق من الصلاحية باستخدام API
    return await testPermission(pagePermission.resource, pagePermission.action);
  };

  // التحقق من صلاحية محددة
  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    return await testPermission(resource, action);
  };

  // الحصول على الصفحات المسموحة للمستخدم
  const getAllowedPages = (): string[] => {
    if (!user) return [];
    
    return Object.keys(PAGE_PERMISSIONS).filter(pagePath => 
      canAccessPage(pagePath)
    );
  };

  return {
    userPermissions,
    isLoading,
    canAccessPage,
    hasPermission,
    testPermission,
    getAllowedPages,
    userRole,
    userLevel
  };
}