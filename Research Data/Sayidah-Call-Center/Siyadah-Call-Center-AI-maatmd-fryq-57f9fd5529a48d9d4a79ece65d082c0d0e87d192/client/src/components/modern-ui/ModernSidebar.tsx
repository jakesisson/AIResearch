import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Mail, 
  Users, 
  Workflow, 
  MessageSquare, 
  Settings, 
  PieChart,
  FileText,
  Phone,
  Zap,
  Bot,
  Target,
  TrendingUp,
  Activity,
  AlertTriangle,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { 
    id: 'reports', 
    label: 'التقارير', 
    icon: BarChart3, 
    path: '/reports',
    description: 'تقارير شاملة وتحليلات'
  },
  { 
    id: 'email', 
    label: 'البريد الإلكتروني', 
    icon: Mail, 
    path: '/email-management',
    description: 'إدارة الحملات والرسائل'
  },
  { 
    id: 'customers', 
    label: 'خدمة العملاء', 
    icon: Users, 
    path: '/customer-service',
    description: 'دعم ومتابعة العملاء'
  },
  { 
    id: 'workflow', 
    label: 'سير العمل', 
    icon: Workflow, 
    path: '/workflow-automation',
    description: 'أتمتة العمليات'
  },
  { 
    id: 'team', 
    label: 'الفريق الذكي', 
    icon: Bot, 
    path: '/ai-team-management',
    description: 'إدارة الوكلاء الذكيين'
  },
  { 
    id: 'sales', 
    label: 'المبيعات', 
    icon: Target, 
    path: '/sales-pipeline',
    description: 'إدارة الفرص التجارية'
  },
  { 
    id: 'control', 
    label: 'لوحة التحكم', 
    icon: Activity, 
    path: '/system-status',
    description: 'مراقبة النظام'
  },
  { 
    id: 'communications', 
    label: 'الاتصالات', 
    icon: Phone, 
    path: '/twilio-test',
    description: 'واتساب ومكالمات'
  },
  { 
    id: 'voice-analytics', 
    label: 'تحليلات المكالمات', 
    icon: MessageSquare, 
    path: '/voice-analytics',
    description: 'نظام الصوت الذكي'
  },
  { 
    id: 'voice-setup', 
    label: 'إعداد المكالمات', 
    icon: Settings, 
    path: '/voice-setup',
    description: 'تكوين Twilio Voice'
  },
  { 
    id: 'twilio-setup', 
    label: 'ربط Twilio', 
    icon: Phone, 
    path: '/twilio-setup',
    description: 'إعداد الرقم الأمريكي'
  },
  { 
    id: 'twilio-diagnostics', 
    label: 'تشخيص Twilio', 
    icon: Settings, 
    path: '/twilio-diagnostics',
    description: 'فحص حالة الاتصال'
  },
  { 
    id: 'twilio-logs', 
    label: 'سجلات Twilio', 
    icon: AlertTriangle, 
    path: '/twilio-logs',
    description: 'مراقبة المكالمات'
  },
  { 
    id: 'elevenlabs-setup', 
    label: 'إعداد الصوت المتقدم', 
    icon: Zap, 
    path: '/elevenlabs-setup',
    description: 'جودة صوت احترافية'
  },
  { 
    id: 'quick', 
    label: 'إجراءات سريعة', 
    icon: Zap, 
    path: '/quick-actions',
    description: 'مهام فورية'
  },
  { 
    id: 'multi-agents', 
    label: 'الوكلاء المتعددين', 
    icon: Bot, 
    path: '/multi-agent-chat',
    description: 'نظام الذكاء الاصطناعي متعدد اللغات'
  },
  { 
    id: 'advanced-self-learning', 
    label: 'التعلم الذاتي المتقدم', 
    icon: Brain, 
    path: '/advanced-self-learning',
    description: 'محرك التعلم الذكي بمعايير عالمية'
  },
  { 
    id: 'enterprise-ai', 
    label: 'الذكاء الاصطناعي المؤسسي', 
    icon: Sparkles, 
    path: '/enterprise-ai',
    description: 'نظام الذكاء الاصطناعي بأعلى المعايير العالمية'
  }
];

export default function ModernSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-80 max-w-sm bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-full" role="complementary" aria-label="الشريط الجانبي للتنقل">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-gray-100">Siyadah AI</h1>
            <p className="text-sm text-slate-300">إدارة الأعمال بالذكاء الاصطناعي</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="قائمة التنقل الرئيسية">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path}>
              <div 
                className={cn(
                  "group relative flex items-center min-h-12 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-400",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10" 
                    : "hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent"
                )}
                role="button"
                aria-label={`${item.label} - ${item.description}`}
                tabIndex={0}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 ml-3 transition-colors flex-shrink-0",
                    isActive ? "text-blue-400" : "text-slate-300 group-hover:text-slate-200"
                  )}
                  aria-hidden="true"
                />
                <div className="flex-1 text-right min-w-0">
                  <div className={cn(
                    "font-medium transition-colors truncate",
                    isActive ? "text-gray-100" : "text-gray-200 group-hover:text-white"
                  )}>
                    {item.label}
                  </div>
                  <div className={cn(
                    "text-xs transition-colors truncate",
                    isActive ? "text-blue-200" : "text-slate-400 group-hover:text-slate-300"
                  )}>
                    {item.description}
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" aria-hidden="true" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
        <Link href="/settings">
          <div 
            className={cn(
              "flex items-center space-x-3 space-x-reverse min-h-12 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group focus-within:ring-2 focus-within:ring-blue-400",
              location === '/settings' 
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30" 
                : "hover:bg-slate-800/50 border border-transparent"
            )}
            role="button"
            aria-label="الإعدادات - تخصيص وإدارة"
            tabIndex={0}
          >
            <Settings 
              className={cn(
                "w-5 h-5 transition-colors flex-shrink-0",
                location === '/settings' ? "text-blue-400" : "text-slate-300 group-hover:text-slate-200"
              )}
              aria-hidden="true"
            />
            <div className="flex-1 text-right min-w-0">
              <div className={cn(
                "font-medium transition-colors truncate",
                location === '/settings' ? "text-gray-100" : "text-gray-200 group-hover:text-white"
              )}>
                الإعدادات
              </div>
              <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate">
                تخصيص وإدارة
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}