import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, MessageSquare, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModernChatInterface from './ModernChatInterface';
import CallerIdDisplay from './CallerIdDisplay';

interface KPIData {
  callsToday: number;
  answerRate: number;
  newOpportunities: number;
  satisfactionRate: number;
  activeAgents: number;
  totalRevenue: number;
}

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  details: string;
}

const QuickActionButton = ({ 
  icon, 
  label, 
  description, 
  onClick, 
  color = 'blue',
  disabled = false 
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4 w-full text-right transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{label}</h3>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default function CallCenterDashboard() {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'مكالمة جماعية',
      target: 'العملاء الجدد (15 عميل)',
      status: 'success',
      timestamp: new Date(Date.now() - 5 * 60000),
      details: 'تم الاتصال بـ 15 عميل، رد 12 عميل، 3 فرص جديدة'
    },
    {
      id: '2',
      action: 'رسالة واتساب',
      target: 'متابعة العروض (8 عملاء)',
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60000),
      details: 'جاري إرسال رسائل المتابعة...'
    },
    {
      id: '3',
      action: 'تحليل البيانات',
      target: 'عملاء الشهر الماضي',
      status: 'success',
      timestamp: new Date(Date.now() - 15 * 60000),
      details: 'تم تحليل 150 عميل، نسبة النجاح 85%'
    }
  ]);

  const { data: kpiData } = useQuery({
    queryKey: ['/api/dashboard-stats'],
    queryFn: async () => {
      return {
        callsToday: 47,
        answerRate: 78,
        newOpportunities: 12,
        satisfactionRate: 92,
        activeAgents: 3,
        totalRevenue: 125000
      } as KPIData;
    },
    refetchInterval: 30000
  });

  const stats = kpiData || {
    callsToday: 47,
    answerRate: 78,
    newOpportunities: 12,
    satisfactionRate: 92,
    activeAgents: 3,
    totalRevenue: 125000
  };

  const handleQuickAction = (action: string) => {
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      action: action,
      target: 'قيد التحديد...',
      status: 'pending',
      timestamp: new Date(),
      details: 'جاري التنفيذ...'
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Dashboard */}
      <div className="w-96 flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            سيادة Call Center AI
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            مركز الاتصال الذكي المؤتمت
          </p>
        </div>

        {/* Live KPIs */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 مؤشرات الأداء الحية
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.callsToday}
                    </div>
                    <div className="text-xs text-gray-500">مكالمة اليوم</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.answerRate}%
                    </div>
                    <div className="text-xs text-gray-500">نسبة الرد</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.newOpportunities}
                    </div>
                    <div className="text-xs text-gray-500">فرصة جديدة</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.satisfactionRate}%
                    </div>
                    <div className="text-xs text-gray-500">رضا العملاء</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-300">إجمالي المبيعات</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue.toLocaleString()} ريال
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ أزرار الأتمتة السريعة
          </h2>
          
          <div className="space-y-3">
            <QuickActionButton
              icon={<Phone className="w-5 h-5" />}
              label="أطلق حملة مكالمات"
              description="اتصال جماعي للعملاء المستهدفين"
              onClick={() => handleQuickAction('حملة مكالمات')}
              color="blue"
            />
            
            <QuickActionButton
              icon={<MessageSquare className="w-5 h-5" />}
              label="أرسل واتساب متابعة"
              description="رسائل تلقائية للعملاء المهتمين"
              onClick={() => handleQuickAction('واتساب متابعة')}
              color="green"
            />
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔗 اختبار الأنظمة
          </h2>
          <div className="space-y-2">
            <a 
              href="/whatsapp-test" 
              className="block p-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  اختبار WhatsApp API
                </span>
              </div>
            </a>
            <a 
              href="/twilio-test" 
              className="block p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  اختبار المكالمات
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Activity Log */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🧾 السجل الذكي
          </h2>
          
          <div className="space-y-3">
            {activityLog.map((activity) => (
              <Card key={activity.id} className="p-3 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {activity.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500 animate-spin" />}
                      {activity.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <Badge variant={
                        activity.status === 'success' ? 'default' : 
                        activity.status === 'pending' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {activity.status === 'success' ? 'مكتمل' : 
                         activity.status === 'pending' ? 'جاري' : 'فشل'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  <div className="text-right mb-2">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                      {activity.action}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.target}
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.details}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ModernChatInterface />
      </div>
    </div>
  );
}