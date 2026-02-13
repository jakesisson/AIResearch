import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard,
  Users,
  TrendingUp,
  Workflow,
  HeadphonesIcon,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Phone,
  Zap,
  UserCog,
  Building2,
  Bell,
  Search,
  Activity,
  FileText,
  PieChart,
  Target,
  Calendar,
  Brain,
  Mic,
  HelpCircle,
  Bot,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
}

const navigationItems = [
  {
    label: 'الرئيسية',
    icon: LayoutDashboard,
    href: '/',
    badge: null
  },
  {
    label: 'إدارة الفريق الذكي',
    icon: Brain,
    href: '/ai-team-management',
    badge: 'AI'
  },
  {
    label: 'خط المبيعات',
    icon: TrendingUp,
    href: '/sales-pipeline',
    badge: null
  },
  {
    label: 'أتمتة العمليات',
    icon: Workflow,
    href: '/workflow-automation',
    badge: null
  },
  {
    label: 'خدمة العملاء',
    icon: HeadphonesIcon,
    href: '/customer-service',
    badge: null
  },
  {
    label: 'إدارة البريد',
    icon: Mail,
    href: '/email-management',
    badge: null
  }
];

const advancedItems = [
  {
    label: 'النظام الصوتي المتقدم',
    icon: Mic,
    href: '/advanced-voice-test',
    badge: 'متقدم'
  },
  {
    label: 'الذكاء الاصطناعي متعدد اللغات',
    icon: Bot,
    href: '/multi-agent-chat',
    badge: 'AI'
  },
  {
    label: 'اختبار LangGraph',
    icon: Network,
    href: '/langgraph-test',
    badge: 'تكامل'
  },
  {
    label: 'إدارة الصلاحيات',
    icon: Shield,
    href: '/rbac-management',
    badge: 'مؤسسي'
  }
];

const systemItems = [
  {
    label: 'التقارير',
    icon: BarChart3,
    href: '/reports',
    badge: null
  },
  {
    label: 'الإعدادات',
    icon: Settings,
    href: '/settings',
    badge: null
  }
];

export default function ModernSidebar({ collapsed = false }: SidebarProps) {
  const [location] = useLocation();

  const SidebarItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <Link href={item.href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-11 text-right",
          isActive && "bg-blue-600/20 text-blue-400 border-blue-600/30",
          !collapsed && "px-3",
          collapsed && "px-2"
        )}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
        {!collapsed && (
          <>
            <span className="flex-1 text-right">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  );

  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full bg-gray-900 border-l border-gray-800 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-72"
      )}
      dir="rtl"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-white">سيادة AI</h2>
                <p className="text-xs text-gray-400">منصة الأتمتة الذكية</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                القائمة الرئيسية
              </h3>
            )}
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={location === item.href}
              />
            ))}
          </div>

          <Separator className="bg-gray-800" />

          {/* Advanced Features */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                الميزات المتقدمة
              </h3>
            )}
            {advancedItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={location === item.href}
              />
            ))}
          </div>

          <Separator className="bg-gray-800" />

          {/* System */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                النظام
              </h3>
            )}
            {systemItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={location === item.href}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          {!collapsed && (
            <div className="text-center">
              <p className="text-xs text-gray-500">إصدار 2.0 - مؤسسي</p>
              <p className="text-xs text-gray-600 mt-1">جميع الحقوق محفوظة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}