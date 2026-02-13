import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchSystem from '@/components/SearchSystem';
import { 
  Bell, 
  Settings, 
  User, 
  Menu,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface EnhancedHeaderProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function EnhancedHeader({ onNavigate, className }: EnhancedHeaderProps) {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, title: 'فاتورة جديدة', message: 'تم إنشاء فاتورة INV-001', type: 'info', time: '5 دقائق' },
    { id: 2, title: 'دفعة مستلمة', message: 'تم استلام دفعة 15,000 ريال', type: 'success', time: '10 دقائق' },
    { id: 3, title: 'عميل جديد', message: 'انضم عميل جديد للنظام', type: 'info', time: '1 ساعة' }
  ];

  const getPageTitle = () => {
    switch (location) {
      case '/': 
      case '/ag-dashboard': return 'لوحة تحكم AG-UI الذكية';
      case '/financial': return 'النظام المالي';
      case '/sales': return 'إدارة المبيعات';
      case '/customer-service': return 'خدمة العملاء';
      case '/workflow': return 'أتمتة العمليات';
      case '/reports': return 'التقارير';
      case '/settings': return 'الإعدادات';
      case '/ai-team': return 'فريق الذكاء الاصطناعي';
      default: return 'منصة أتمتة الأعمال';
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Menu & Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('ar-SA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SearchSystem 
              onNavigate={onNavigate}
              className="w-full"
            />
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="hidden sm:flex"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
            >
              <Globe className="h-4 w-4" />
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium text-foreground">الإشعارات</h3>
                    <p className="text-sm text-muted-foreground">{notifications.length} إشعار جديد</p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            notification.type === 'success' ? "bg-green-500" :
                            notification.type === 'warning' ? "bg-yellow-500" :
                            "bg-blue-500"
                          )} />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        onNavigate?.('/notifications');
                        setShowNotifications(false);
                      }}
                    >
                      عرض جميع الإشعارات
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUserMenuClick}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">المدير</span>
              </Button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">المدير الرئيسي</p>
                        <p className="text-sm text-muted-foreground">admin@company.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        onNavigate?.('/settings');
                        setShowUserMenu(false);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      الإعدادات
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        onNavigate?.('/user-management');
                        setShowUserMenu(false);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      إدارة المستخدمين
                    </Button>
                    
                    <hr className="my-2" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <SearchSystem 
            onNavigate={onNavigate}
            className="w-full"
          />
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}