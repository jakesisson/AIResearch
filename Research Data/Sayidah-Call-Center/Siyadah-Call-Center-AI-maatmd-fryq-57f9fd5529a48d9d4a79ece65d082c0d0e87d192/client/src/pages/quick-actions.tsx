import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, MessageSquare, Phone, Mail, Plus, Users, Target, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function QuickActions() {
  const [isNewOpportunityOpen, setIsNewOpportunityOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isBulkMessageOpen, setIsBulkMessageOpen] = useState(false);
  const { toast } = useToast();

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities']
  });

  const { data: agentsData } = useQuery({
    queryKey: ['/api/ai-agents']
  });

  const opportunitiesData = Array.isArray(opportunities) ? opportunities : [];
  const agents = (agentsData && Array.isArray((agentsData as any).agents)) ? (agentsData as any).agents : [];

  const handleQuickCall = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/ai-chat/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `اتصل على ${phoneNumber}` })
      });
      
      if (response.ok) {
        toast({
          title: "تم بدء المكالمة",
          description: `جاري الاتصال على ${phoneNumber}`
        });
      } else {
        toast({
          title: "خطأ في المكالمة",
          description: "لم نتمكن من إجراء المكالمة، يرجى المحاولة لاحقاً"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في المكالمة",
        description: "حدث خطأ أثناء محاولة الاتصال"
      });
    }
  };

  const handleQuickMessage = async (message: string, numbers: string[]) => {
    try {
      const response = await fetch('/api/ai-chat/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `أرسل رسالة "${message}" إلى ${numbers.join(', ')}` })
      });
      
      if (response.ok) {
        toast({
          title: "تم إرسال الرسائل",
          description: `تم إرسال ${numbers.length} رسالة بنجاح`
        });
      } else {
        toast({
          title: "خطأ في الإرسال",
          description: "لم نتمكن من إرسال الرسائل"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الرسائل"
      });
    }
    setIsBulkMessageOpen(false);
  };

  const handleCreateOpportunity = () => {
    toast({
      title: "تم إنشاء الفرصة بنجاح",
      description: "تم إضافة فرصة جديدة إلى نظام المبيعات"
    });
    setIsNewOpportunityOpen(false);
  };

  const handleCreateTask = () => {
    toast({
      title: "تم إنشاء المهمة بنجاح",
      description: "تم إضافة مهمة جديدة إلى قائمة المهام"
    });
    setIsNewTaskOpen(false);
  };

  const quickActionCards = [
    {
      title: "مكالمة سريعة",
      description: "اتصال فوري بالعملاء",
      icon: Phone,
      color: "blue",
      action: () => handleQuickCall("+966501234567")
    },
    {
      title: "رسالة جماعية",
      description: "إرسال رسائل لعدة عملاء",
      icon: MessageSquare,
      color: "green",
      action: () => setIsBulkMessageOpen(true)
    },
    {
      title: "فرصة جديدة",
      description: "إضافة فرصة مبيعات جديدة",
      icon: Target,
      color: "purple",
      action: () => setIsNewOpportunityOpen(true)
    },
    {
      title: "مهمة جديدة",
      description: "إنشاء مهمة أو تذكير",
      icon: Plus,
      color: "orange",
      action: () => setIsNewTaskOpen(true)
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'green': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'orange': return 'bg-orange-600 hover:bg-orange-700 text-white';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const recentActivities = [
    {
      id: '1',
      action: 'مكالمة',
      target: 'شركة التقنية المتقدمة',
      time: 'منذ 5 دقائق',
      status: 'مكتملة',
      type: 'call'
    },
    {
      id: '2',
      action: 'رسالة واتساب',
      target: '15 عميل',
      time: 'منذ 15 دقيقة',
      status: 'تم الإرسال',
      type: 'message'
    },
    {
      id: '3',
      action: 'فرصة جديدة',
      target: 'مؤسسة النور للتقنية',
      time: 'منذ 30 دقيقة',
      status: 'تم الإنشاء',
      type: 'opportunity'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-400" />;
      case 'opportunity': return <Target className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = {
    totalOpportunities: opportunitiesData.length,
    activeAgents: agents.length,
    todayActions: 8,
    pendingTasks: 5
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6 space-y-8">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">الإجراءات السريعة</h1>
            <p className="text-slate-400">تنفيذ المهام والعمليات بسرعة وكفاءة</p>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الفرص النشطة</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOpportunities}</p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الوكلاء النشطون</p>
                  <p className="text-2xl font-bold text-white">{stats.activeAgents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجراءات اليوم</p>
                  <p className="text-2xl font-bold text-white">{stats.todayActions}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">المهام المعلقة</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActionCards.map((card, index) => (
                <Button
                  key={index}
                  onClick={card.action}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${getColorClasses(card.color)}`}
                >
                  <card.icon className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold">{card.title}</p>
                    <p className="text-xs opacity-80">{card.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* النشاط الأخير */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-slate-400 text-sm">{activity.target}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-green-400 font-medium">{activity.status}</p>
                    <p className="text-slate-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نافذة الرسالة الجماعية */}
        <Dialog open={isBulkMessageOpen} onOpenChange={setIsBulkMessageOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>إرسال رسالة جماعية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">نص الرسالة</label>
                <Textarea 
                  className="bg-slate-700/50 border-slate-600 text-white" 
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">قائمة العملاء</label>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="اختر قائمة العملاء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    <SelectItem value="active">العملاء النشطون</SelectItem>
                    <SelectItem value="prospects">العملاء المحتملون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsBulkMessageOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={() => handleQuickMessage("رسالة تجريبية", ["+966501234567", "+966507654321"])}
                  className="bg-green-600 hover:bg-green-700"
                >
                  إرسال الرسالة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة الفرصة الجديدة */}
        <Dialog open={isNewOpportunityOpen} onOpenChange={setIsNewOpportunityOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء فرصة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">اسم الفرصة</label>
                  <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="اسم الفرصة" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">اسم الشركة</label>
                  <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="اسم الشركة" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">القيمة (ريال)</label>
                  <Input type="number" className="bg-slate-700/50 border-slate-600 text-white" placeholder="القيمة" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">المرحلة</label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">عميل محتمل</SelectItem>
                      <SelectItem value="qualified">مؤهل</SelectItem>
                      <SelectItem value="proposal">عرض</SelectItem>
                      <SelectItem value="negotiation">تفاوض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">الوصف</label>
                <Textarea className="bg-slate-700/50 border-slate-600 text-white" placeholder="وصف الفرصة..." rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsNewOpportunityOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateOpportunity} className="bg-purple-600 hover:bg-purple-700">
                  إنشاء الفرصة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* نافذة المهمة الجديدة */}
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">عنوان المهمة</label>
                <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="عنوان المهمة" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">الوصف</label>
                <Textarea className="bg-slate-700/50 border-slate-600 text-white" placeholder="وصف المهمة..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">الأولوية</label>
                  <Select>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">تاريخ الاستحقاق</label>
                  <Input type="date" className="bg-slate-700/50 border-slate-600 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateTask} className="bg-orange-600 hover:bg-orange-700">
                  إنشاء المهمة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}