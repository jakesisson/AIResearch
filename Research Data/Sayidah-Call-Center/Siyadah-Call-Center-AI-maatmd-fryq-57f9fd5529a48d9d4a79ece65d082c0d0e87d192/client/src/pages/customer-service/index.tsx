import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/ui/sidebar";
import { Header } from "@/components/ui/Header";
import { AppIcon } from "@/components/AppIcon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket } from "@/types";

const CustomerService = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    customerName: '',
    customerEmail: '',
    priority: 'medium'
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/support-tickets'],
    queryFn: async () => {
      const response = await fetch('/api/support-tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    }
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticket: any) => {
      return apiRequest('/api/support-tickets', 'POST', {
        ...ticket,
        assignedTo: 'فاطمة الدعم' // Auto-assign to AI support agent
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "تم إنشاء التذكرة بنجاح",
        description: "تم إضافة تذكرة دعم جديدة وتعيينها تلقائياً"
      });
      setNewTicket({
        subject: '',
        description: '',
        customerName: '',
        customerEmail: '',
        priority: 'medium'
      });
    }
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest(`/api/support-tickets/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "تم تحديث التذكرة",
        description: "تم تحديث حالة التذكرة بنجاح"
      });
    }
  });

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    return true;
  });

  // Calculate metrics
  const metrics = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: tickets.length ? Math.round(tickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.length) : 0,
    customerSatisfaction: tickets.filter(t => t.satisfaction).length ? 
      Math.round(tickets.filter(t => t.satisfaction).reduce((sum, t) => sum + t.satisfaction, 0) / tickets.filter(t => t.satisfaction).length) : 0
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-error/20 text-error';
      case 'in_progress':
        return 'bg-warning/20 text-warning';
      case 'resolved':
        return 'bg-success/20 text-success';
      case 'closed':
        return 'bg-text-muted/20 text-text-muted';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'open': 'مفتوحة',
      'in_progress': 'قيد التنفيذ',
      'resolved': 'محلولة',
      'closed': 'مغلقة'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'high': 'عالية',
      'medium': 'متوسطة',
      'low': 'منخفضة'
    };
    return labels[priority] || priority;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header title="خدمة العملاء" subtitle="جاري تحميل البيانات..." />
        <main className="mr-72 pt-0">
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header 
        title="مركز خدمة العملاء" 
        subtitle="إدارة تذاكر الدعم والإشراف على جودة الخدمة"
      />
      
      <main className="mr-72 pt-0">
        <div className="p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="glass-effect border border-white/10 p-4 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <AppIcon name="Ticket" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">إجمالي التذاكر</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.totalTickets}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-error/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-error/20 rounded-lg">
                  <AppIcon name="AlertCircle" className="w-5 h-5 text-error" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">تذاكر مفتوحة</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.openTickets}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-warning/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AppIcon name="Clock" className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">قيد التنفيذ</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.inProgressTickets}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-success/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <AppIcon name="CheckCircle" className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">محلولة</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.resolvedTickets}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <AppIcon name="Timer" className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">متوسط الاستجابة</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.avgResponseTime} دقيقة</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <AppIcon name="Heart" className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">رضا العملاء</p>
                  <p className="text-lg font-bold text-text-primary">{metrics.customerSatisfaction}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="glass-effect border border-white/10">
                <TabsTrigger value="tickets">تذاكر الدعم</TabsTrigger>
                <TabsTrigger value="analytics">تحليلات الأداء</TabsTrigger>
                <TabsTrigger value="knowledge">قاعدة المعرفة</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent-600 text-background">
                      <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                      تذكرة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-effect border border-white/10" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-text-primary">إنشاء تذكرة دعم جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">موضوع التذكرة</label>
                        <Input
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                          placeholder="موضوع التذكرة"
                          className="bg-surface border-white/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">اسم العميل</label>
                          <Input
                            value={newTicket.customerName}
                            onChange={(e) => setNewTicket({...newTicket, customerName: e.target.value})}
                            placeholder="اسم العميل"
                            className="bg-surface border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">البريد الإلكتروني</label>
                          <Input
                            type="email"
                            value={newTicket.customerEmail}
                            onChange={(e) => setNewTicket({...newTicket, customerEmail: e.target.value})}
                            placeholder="البريد الإلكتروني"
                            className="bg-surface border-white/10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">الأولوية</label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                          <SelectTrigger className="bg-surface border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">عالية</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                            <SelectItem value="low">منخفضة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">وصف المشكلة</label>
                        <Textarea
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                          placeholder="وصف تفصيلي للمشكلة"
                          className="bg-surface border-white/10"
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={() => createTicketMutation.mutate(newTicket)}
                        disabled={createTicketMutation.isPending}
                        className="w-full bg-accent hover:bg-accent-600 text-background"
                      >
                        {createTicketMutation.isPending ? "جاري الإنشاء..." : "إنشاء التذكرة"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-surface border-white/10">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="open">مفتوحة</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="resolved">محلولة</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40 bg-surface border-white/10">
                    <SelectValue placeholder="جميع الأولويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="tickets" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-4">
                  {filteredTickets.length === 0 ? (
                    <Card className="glass-effect border border-white/10 p-8 text-center">
                      <AppIcon name="Inbox" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">لا توجد تذاكر</h3>
                      <p className="text-text-secondary">لم يتم العثور على تذاكر دعم تطابق المرشحات المحددة</p>
                    </Card>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <Card 
                        key={ticket.id} 
                        className={`glass-effect border p-6 cursor-pointer transition-all duration-300 ${
                          selectedTicket?.id === ticket.id 
                            ? "border-accent/50 bg-accent/5" 
                            : "border-white/10 hover:border-accent/30"
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-text-primary">{ticket.subject}</h4>
                              <Badge className={getStatusColor(ticket.status)}>
                                {getStatusLabel(ticket.status)}
                              </Badge>
                              <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                                {getPriorityLabel(ticket.priority)}
                              </Badge>
                            </div>
                            <p className="text-text-secondary text-sm mb-2">{ticket.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-text-muted">
                              <span>العميل: {ticket.customerName}</span>
                              <span>المُعين: {ticket.assignedTo || 'غير مُعين'}</span>
                              <span>تاريخ الإنشاء: {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex space-x-2">
                            {ticket.status === 'open' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketMutation.mutate({ id: ticket.id, updates: { status: 'in_progress' }});
                                }}
                                className="bg-warning hover:bg-warning-600 text-background"
                              >
                                بدء العمل
                              </Button>
                            )}
                            {ticket.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketMutation.mutate({ id: ticket.id, updates: { status: 'resolved', resolvedAt: new Date().toISOString() }});
                                }}
                                className="bg-success hover:bg-success-600 text-background"
                              >
                                حل التذكرة
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/10"
                            >
                              <AppIcon name="MessageSquare" className="w-3 h-3 ml-1" />
                              رد
                            </Button>
                          </div>
                          
                          {ticket.responseTime && (
                            <span className="text-xs text-text-muted">
                              وقت الاستجابة: {ticket.responseTime} دقيقة
                            </span>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {/* Ticket Details */}
                <div>
                  {selectedTicket ? (
                    <Card className="glass-effect border border-white/10 p-6 sticky top-6">
                      <h3 className="text-lg font-bold text-text-primary mb-4">تفاصيل التذكرة</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">معلومات العميل</h4>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-text-secondary">الاسم: </span>
                              <span className="text-text-primary">{selectedTicket.customerName}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-text-secondary">البريد الإلكتروني: </span>
                              <span className="text-text-primary">{selectedTicket.customerEmail}</span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-text-primary mb-2">تفاصيل التذكرة</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">الحالة:</span>
                              <Badge className={getStatusColor(selectedTicket.status)}>
                                {getStatusLabel(selectedTicket.status)}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">الأولوية:</span>
                              <Badge className={getPriorityColor(selectedTicket.priority)} variant="outline">
                                {getPriorityLabel(selectedTicket.priority)}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">المُعين إلى:</span>
                              <span className="text-text-primary text-sm">{selectedTicket.assignedTo || 'غير مُعين'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">تاريخ الإنشاء:</span>
                              <span className="text-text-primary text-sm">
                                {new Date(selectedTicket.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {selectedTicket.resolvedAt && (
                              <div className="flex justify-between">
                                <span className="text-text-secondary text-sm">تاريخ الحل:</span>
                                <span className="text-text-primary text-sm">
                                  {new Date(selectedTicket.resolvedAt).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedTicket.satisfaction && (
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">تقييم العميل</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <AppIcon
                                    key={i}
                                    name="Star"
                                    className={`w-4 h-4 ${
                                      i < selectedTicket.satisfaction ? 'text-warning fill-current' : 'text-text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-text-primary text-sm">({selectedTicket.satisfaction}/5)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button className="w-full bg-accent hover:bg-accent-600 text-background">
                          <AppIcon name="Edit" className="w-4 h-4 ml-2" />
                          تعديل التذكرة
                        </Button>
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                          <AppIcon name="MessageSquare" className="w-4 h-4 ml-2" />
                          إضافة تعليق
                        </Button>
                        {selectedTicket.status !== 'closed' && (
                          <Button 
                            variant="outline" 
                            className="w-full border-error text-error hover:bg-error/10"
                            onClick={() => updateTicketMutation.mutate({ 
                              id: selectedTicket.id, 
                              updates: { status: 'closed' }
                            })}
                          >
                            <AppIcon name="X" className="w-4 h-4 ml-2" />
                            إغلاق التذكرة
                          </Button>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <Card className="glass-effect border border-white/10 p-6 text-center">
                      <AppIcon name="Ticket" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">اختر تذكرة</h3>
                      <p className="text-text-secondary">انقر على أي تذكرة من القائمة لعرض التفاصيل</p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6 text-center">
                <AppIcon name="BarChart3" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">تحليلات الأداء</h3>
                <p className="text-text-secondary">ستتوفر تحليلات مفصلة لأداء فريق الدعم قريباً</p>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6 text-center">
                <AppIcon name="BookOpen" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">قاعدة المعرفة</h3>
                <p className="text-text-secondary">مكتبة المقالات والحلول الشائعة ستتوفر قريباً</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CustomerService;
