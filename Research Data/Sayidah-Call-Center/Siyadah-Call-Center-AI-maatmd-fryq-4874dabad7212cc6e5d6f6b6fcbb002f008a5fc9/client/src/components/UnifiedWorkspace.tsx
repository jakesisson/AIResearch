import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ChatInterface from './ChatInterface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Settings, 
  FileText,
  Zap,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Target,
  Workflow
} from 'lucide-react';

// Import existing components
import Dashboard from '@/pages/Dashboard';
import SalesPipeline from '@/pages/sales-pipeline';
import Reports from '@/pages/reports';
import AITeamManagement from '@/pages/ai-team-management';
import WorkflowAutomation from '@/pages/workflow-automation';
import CustomerService from '@/pages/customer-service';
import QuickActions from '@/pages/quick-actions';
import SystemStatus from '@/pages/system-status';
import UserManagement from '@/pages/user-management';
import Notifications from '@/pages/notifications';
import EmailManagement from '@/pages/email-management';
import SettingsPage from '@/pages/settings';
import TwilioTest from '@/pages/twilio-test';

interface WorkspaceTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  badge?: string;
  color?: string;
}

export default function UnifiedWorkspace() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('chat');
  const [contextData, setContextData] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<Array<{
    id: string;
    action: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'failed';
  }>>([]);

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'chat',
      label: 'المساعد الذكي',
      icon: MessageSquare,
      component: null,
      badge: 'مفعل',
      color: 'accent'
    },
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutGrid,
      component: Dashboard,
      color: 'primary'
    },
    {
      id: 'sales',
      label: 'المبيعات',
      icon: TrendingUp,
      component: SalesPipeline,
      color: 'success'
    },
    {
      id: 'team',
      label: 'الفريق الذكي',
      icon: Users,
      component: AITeamManagement,
      color: 'warning'
    },
    {
      id: 'workflow',
      label: 'سير العمل',
      icon: Workflow,
      component: WorkflowAutomation,
      color: 'secondary'
    },
    {
      id: 'customer-service',
      label: 'خدمة العملاء',
      icon: Phone,
      component: CustomerService,
      color: 'info'
    },
    {
      id: 'email',
      label: 'البريد الإلكتروني',
      icon: Mail,
      component: EmailManagement,
      color: 'warning'
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: FileText,
      component: Reports,
      color: 'info'
    },
    {
      id: 'quick-actions',
      label: 'إجراءات سريعة',
      icon: Zap,
      component: QuickActions,
      color: 'accent'
    },
    {
      id: 'communications',
      label: 'الاتصالات',
      icon: Phone,
      component: TwilioTest,
      color: 'purple'
    }
  ];

  // Handle navigation from chat
  const handleChatNavigation = (path: string, context?: any) => {
    const tabId = path.replace('/', '') || 'dashboard';
    const tab = workspaceTabs.find(t => t.id === tabId || path.includes(t.id));
    
    if (tab) {
      setActiveTab(tab.id);
      setContextData(context);
      
      // Add to recent actions
      setRecentActions(prev => [
        {
          id: Date.now().toString(),
          action: `تم الانتقال إلى ${tab.label}`,
          timestamp: new Date(),
          status: 'completed'
        },
        ...prev.slice(0, 4)
      ]);
    }
  };

  // Handle action execution
  const handleActionExecute = (action: any) => {
    console.log('Executing action:', action);
    
    setRecentActions(prev => [
      {
        id: Date.now().toString(),
        action: action.description || 'تم تنفيذ إجراء',
        timestamp: new Date(),
        status: 'completed'
      },
      ...prev.slice(0, 4)
    ]);
  };

  // Smart suggestions based on current tab
  const getSmartSuggestions = () => {
    const suggestions = {
      dashboard: [
        'اعرض لي أداء هذا الشهر',
        'ما هي الفرص التي تحتاج متابعة؟',
        'أنشئ تقرير سريع'
      ],
      sales: [
        'أضف عميل جديد',
        'أرسل عرض لعميل محدد',
        'تابع الفرص المعلقة'
      ],
      team: [
        'كيف أداء فريق المبيعات؟',
        'أنشئ مهمة للفريق',
        'اعرض إحصائيات الأداء'
      ],
      workflow: [
        'أنشئ سير عمل جديد',
        'فعّل أتمتة المتابعة',
        'اعرض الأتمتة النشطة'
      ]
    };
    
    return suggestions[activeTab as keyof typeof suggestions] || suggestions.dashboard;
  };

  const renderActiveComponent = () => {
    const tab = workspaceTabs.find(t => t.id === activeTab);
    if (!tab || !tab.component) return null;
    
    const Component = tab.component;
    return <Component contextData={contextData} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="flex h-screen">
        {/* Chat Sidebar */}
        <div className="w-96 border-l border-white/10 bg-background/50 backdrop-blur-lg flex flex-col">
          <ChatInterface
            onNavigate={handleChatNavigation}
            onActionExecute={handleActionExecute}
            className="flex-1"
          />
          
          {/* Quick Stats */}
          <div className="p-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-text-primary mb-3">إحصائيات سريعة</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-accent">24</div>
                <div className="text-xs text-text-secondary">فرص نشطة</div>
              </div>
              <div className="bg-surface/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-success">92%</div>
                <div className="text-xs text-text-secondary">أداء الفريق</div>
              </div>
            </div>
          </div>

          {/* Recent Actions */}
          {recentActions.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-text-primary mb-3">آخر الإجراءات</h4>
              <div className="space-y-2">
                {recentActions.map(action => (
                  <div key={action.id} className="flex items-center gap-2 text-xs">
                    <Badge 
                      variant={action.status === 'completed' ? 'default' : 'secondary'}
                      className="w-2 h-2 p-0"
                    />
                    <span className="text-text-secondary flex-1">{action.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="border-b border-white/10 bg-background/30 backdrop-blur-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-text-primary">
                  منصة الأتمتة التجارية المتكاملة
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    النظام متصل
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Smart Suggestions */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-text-secondary">اقتراحات ذكية:</span>
                <div className="flex gap-2 flex-wrap">
                  {getSmartSuggestions().slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        // Trigger chat with suggestion
                        const chatTab = document.querySelector('[data-tab="chat"]');
                        if (chatTab) {
                          setActiveTab('chat');
                          // Send suggestion to chat
                        }
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex gap-2 flex-wrap">
                {workspaceTabs.map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 whitespace-nowrap relative"
                    data-tab={tab.id}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        {tab.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-surface/10 to-background/50">
            {activeTab === 'chat' ? (
              <div className="p-8 h-full flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="mb-8">
                    <MessageSquare className="w-20 h-20 text-accent mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold text-text-primary mb-4">
                      مرحباً بك في منصة الأتمتة التجارية المتكاملة
                    </h2>
                    <p className="text-lg text-text-secondary mb-8">
                      استخدم المساعد الذكي على اليسار للتفاعل مع النظام والتنقل بين الوظائف بكل سهولة
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {workspaceTabs.slice(1, 7).map(tab => (
                      <Card 
                        key={tab.id}
                        className="p-4 cursor-pointer hover:bg-accent/10 transition-all duration-300 border-white/10"
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <tab.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-sm font-medium text-text-primary">{tab.label}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => setActiveTab('dashboard')}
                      className="gap-2"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      ابدأ من لوحة التحكم
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('sales')}
                      className="gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      إدارة المبيعات
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full p-4">
                {renderActiveComponent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}