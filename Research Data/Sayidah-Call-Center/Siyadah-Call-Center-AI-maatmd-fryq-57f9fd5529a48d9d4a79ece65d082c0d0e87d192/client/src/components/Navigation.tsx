import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  MessageSquare, 
  Settings, 
  Users, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationProps {
  showBackButton?: boolean;
}

export default function Navigation({ showBackButton = false }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { 
      path: '/', 
      label: 'لوحة التحكم', 
      icon: Home,
      isActive: location === '/'
    },
    { 
      path: '/chat', 
      label: 'المحادثة الذكية', 
      icon: MessageSquare,
      isActive: location === '/chat'
    },
    { 
      path: '/settings', 
      label: 'الإعدادات', 
      icon: Settings,
      isActive: location === '/settings'
    },
    { 
      path: '/rbac-management', 
      label: 'إدارة الصلاحيات', 
      icon: Users,
      isActive: location === '/rbac-management'
    }
  ];

  return (
    <nav className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* اليسار - شعار النظام */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">سيادة AI</h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                متصل
              </Badge>
            </div>
          </div>

          {/* الوسط - روابط التنقل */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={item.isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
                      item.isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* اليمين - زر الرجوع */}
          <div className="flex items-center">
            {showBackButton && location !== '/' && (
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  رجوع للوحة التحكم
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}