import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, User, AlertCircle, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  title: string;
  customer: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  description: string;
  createdAt: Date;
  assignedTo?: string;
  responseTime?: number;
}

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    title: 'مشكلة في تسجيل الدخول',
    customer: 'أحمد محمد',
    priority: 'high',
    status: 'open',
    category: 'تقني',
    description: 'لا أستطيع تسجيل الدخول إلى حسابي',
    createdAt: new Date('2024-01-15'),
    responseTime: 2
  },
  {
    id: '2',
    title: 'استفسار عن الأسعار',
    customer: 'فاطمة العلي',
    priority: 'medium',
    status: 'in-progress',
    category: 'مبيعات',
    description: 'أريد معرفة أسعار الخدمات المتاحة',
    createdAt: new Date('2024-01-14'),
    assignedTo: 'سارة أحمد',
    responseTime: 4
  },
  {
    id: '3',
    title: 'طلب إلغاء الاشتراك',
    customer: 'خالد السعيد',
    priority: 'low',
    status: 'resolved',
    category: 'إداري',
    description: 'أريد إلغاء اشتراكي الحالي',
    createdAt: new Date('2024-01-13'),
    assignedTo: 'محمد حسن',
    responseTime: 24
  }
];

export default function CustomerService() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const { toast } = useToast();

  const { data: tickets = mockTickets } = useQuery({
    queryKey: ['/api/support-tickets'],
    queryFn: () => Promise.resolve(mockTickets)
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleCreateTicket = () => {
    toast({
      title: "تم إنشاء التذكرة بنجاح",
      description: "تم إنشاء تذكرة دعم جديدة وسيتم الرد عليها قريباً"
    });
    setIsNewTicketOpen(false);
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: Math.round(tickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.length)
  };

  return (
    <Layout showBackButton={true}>
      <div className="space-y-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي التذاكر</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تذاكر مفتوحة</p>
                  <p className="text-2xl font-bold text-red-400">{stats.open}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">قيد المعالجة</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تم الحل</p>
                  <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">متوسط الرد (ساعة)</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.avgResponseTime}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث والفلاتر */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في التذاكر..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="open">مفتوحة</SelectItem>
                    <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                    <SelectItem value="resolved">تم الحل</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    تذكرة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>إنشاء تذكرة دعم جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">اسم العميل</label>
                        <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="اسم العميل" />
                      </div>
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
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">عنوان المشكلة</label>
                      <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="عنوان المشكلة" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">وصف المشكلة</label>
                      <Textarea className="bg-slate-700/50 border-slate-600 text-white" placeholder="وصف تفصيلي للمشكلة..." rows={4} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleCreateTicket} className="bg-blue-600 hover:bg-blue-700">
                        إنشاء التذكرة
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* قائمة التذاكر */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority === 'high' ? 'عالية' : 
                         ticket.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status === 'open' ? 'مفتوحة' :
                         ticket.status === 'in-progress' ? 'قيد المعالجة' :
                         ticket.status === 'resolved' ? 'تم الحل' : 'مغلقة'}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-300 mb-3">{ticket.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{ticket.customer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{ticket.createdAt.toLocaleDateString('ar-SA')}</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>مُكلف: {ticket.assignedTo}</span>
                        </div>
                      )}
                      {ticket.responseTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>وقت الرد: {ticket.responseTime} ساعة</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      رد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">لا توجد تذاكر</h3>
              <p className="text-slate-400">لا توجد تذاكر دعم تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}