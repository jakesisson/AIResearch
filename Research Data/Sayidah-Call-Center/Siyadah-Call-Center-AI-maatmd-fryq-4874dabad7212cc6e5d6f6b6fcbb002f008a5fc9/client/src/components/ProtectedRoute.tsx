import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredResource?: string;
  requiredAction?: string;
  requiredLevel?: number;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export function ProtectedRoute({
  children,
  requiredResource,
  requiredAction = 'GET',
  requiredLevel,
  requiredPermission,
  fallbackPath = '/auth/login',
  showAccessDenied = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { testPermission } = usePermissions();
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      
      // If not authenticated, redirect to login
      if (!authLoading && !isAuthenticated) {
        setLocation(fallbackPath);
        return;
      }

      // If no specific resource required, allow access
      if (!requiredResource && !requiredPermission) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check permission based on what's provided
      let resourceToCheck = requiredResource;
      let actionToCheck = requiredAction;
      
      if (requiredPermission) {
        resourceToCheck = requiredPermission.resource;
        actionToCheck = requiredPermission.action;
      }

      // Test permission for specific resource
      try {
        const allowed = await testPermission(resourceToCheck || '', actionToCheck);
        setHasAccess(allowed);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, authLoading, requiredResource, requiredAction, fallbackPath, setLocation, testPermission]);

  // Show loading while checking authentication or permissions
  if (authLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no permission
  if (hasAccess === false && showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">غير مصرح بالوصول</h3>
                <p>عذراً، ليس لديك الصلاحية المطلوبة للوصول إلى هذه الصفحة.</p>
                <div className="text-sm text-red-600 dark:text-red-400">
                  <p>المورد المطلوب: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{requiredResource}</code></p>
                  <p>الإجراء المطلوب: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{requiredAction}</code></p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/dashboard')}
                    className="flex items-center gap-2"
                  >
                    العودة للرئيسية
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.history.back()}
                  >
                    رجوع
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If access denied but not showing access denied page, redirect
  if (hasAccess === false && !showAccessDenied) {
    setLocation(fallbackPath);
    return null;
  }

  // Render children if has access
  return <>{children}</>;
}

// Hook for checking permissions in components
export function useRoutePermission(resource: string, action: string = 'GET') {
  const { testPermission } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      try {
        const allowed = await testPermission(resource, action);
        setHasPermission(allowed);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [resource, action, testPermission]);

  return { hasPermission, isLoading };
}