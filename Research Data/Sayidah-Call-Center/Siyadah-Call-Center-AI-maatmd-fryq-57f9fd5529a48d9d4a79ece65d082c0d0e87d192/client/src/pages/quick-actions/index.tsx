import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/ui/sidebar';
import { 
  Plus, 
  MessageSquare, 
  Phone, 
  Mail, 
  UserPlus, 
  Workflow,
  Target,
  Bot,
  Zap,
  Clock
} from 'lucide-react';

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Quick Contact Form
  const [contactForm, setContactForm] = useState({
    method: 'whatsapp',
    to: '',
    message: '',
    subject: ''
  });

  // Quick Opportunity Form
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    client: '',
    value: '',
    stage: 'تأهيل',
    description: ''
  });

  // Quick AI Member Form
  const [aiMemberForm, setAiMemberForm] = useState({
    name: '',
    role: '',
    specialization: ''
  });

  const contactMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/external/contact/quick', 'POST', data),
    onSuccess: () => {
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال رسالتك بنجاح"
      });
      setContactForm({ method: 'whatsapp', to: '', message: '', subject: '' });
      setActiveAction(null);
    },
    onError: () => {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive"
      });
    }
  });

  const opportunityMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/opportunities', 'POST', data),
    onSuccess: () => {
      toast({
        title: "تم إنشاء الفرصة",
        description: "تم إنشاء فرصة جديدة بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      setOpportunityForm({ title: '', client: '', value: '', stage: 'تأهيل', description: '' });
      setActiveAction(null);
    }
  });

  const aiMemberMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/ai-team-members', 'POST', data),
    onSuccess: () => {
      toast({
        title: "تم إنشاء عضو الذكاء الاصطناعي",
        description: "تم إضافة عضو جديد لفريق الذكاء الاصطناعي"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-team-members'] });
      setAiMemberForm({ name: '', role: '', specialization: '' });
      setActiveAction(null);
    }
  });

  const quickActions = [
    {
      id: 'contact',
      title: 'تواصل سريع',
      description: 'إرسال رسالة أو مكالمة فورية',
      icon: MessageSquare,
      color: 'bg-blue-500',
      action: () => setActiveAction('contact')
    },
    {
      id: 'opportunity',
      title: 'فرصة جديدة',
      description: 'إضافة فرصة بيع سريعة',
      icon: Target,
      color: 'bg-green-500',
      action: () => setActiveAction('opportunity')
    },
    {
      id: 'ai-member',
      title: 'عضو ذكاء اصطناعي',
      description: 'إنشاء عضو فريق ذكي جديد',
      icon: Bot,
      color: 'bg-purple-500',
      action: () => setActiveAction('ai-member')
    },
    {
      id: 'workflow',
      title: 'سير عمل سريع',
      description: 'إنشاء سير عمل بسيط',
      icon: Workflow,
      color: 'bg-orange-500',
      action: () => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 mr-72 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">الإجراءات السريعة</h1>
            <p className="text-muted-foreground">تنفيذ المهام الشائعة بسرعة وسهولة</p>
          </div>

          {!activeAction ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Card key={action.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={action.action}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`${action.color} p-4 rounded-full group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveAction(null)}
                className="mb-4"
              >
                ← العودة للإجراءات السريعة
              </Button>

              {activeAction === 'contact' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      تواصل سريع
                    </CardTitle>
                    <CardDescription>إرسال رسالة أو إجراء مكالمة فورية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="method">طريقة التواصل</Label>
                        <Select value={contactForm.method} onValueChange={(value) => setContactForm({...contactForm, method: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر طريقة التواصل" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">واتساب</SelectItem>
                            <SelectItem value="call">مكالمة صوتية</SelectItem>
                            <SelectItem value="email">بريد إلكتروني</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="to">رقم الهاتف أو البريد الإلكتروني</Label>
                        <Input
                          id="to"
                          value={contactForm.to}
                          onChange={(e) => setContactForm({...contactForm, to: e.target.value})}
                          placeholder="+966501234567 أو example@email.com"
                        />
                      </div>
                    </div>
                    {contactForm.method === 'email' && (
                      <div>
                        <Label htmlFor="subject">موضوع الرسالة</Label>
                        <Input
                          id="subject"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          placeholder="موضوع الرسالة"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="message">الرسالة</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        placeholder="اكتب رسالتك هنا..."
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={() => contactMutation.mutate(contactForm)}
                      disabled={contactMutation.isPending || !contactForm.to || !contactForm.message}
                      className="w-full"
                    >
                      {contactMutation.isPending ? "جاري الإرسال..." : "إرسال"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeAction === 'opportunity' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      فرصة بيع جديدة
                    </CardTitle>
                    <CardDescription>إضافة فرصة بيع سريعة للنظام</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">عنوان الفرصة</Label>
                        <Input
                          id="title"
                          value={opportunityForm.title}
                          onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                          placeholder="عنوان الفرصة"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client">اسم العميل</Label>
                        <Input
                          id="client"
                          value={opportunityForm.client}
                          onChange={(e) => setOpportunityForm({...opportunityForm, client: e.target.value})}
                          placeholder="اسم العميل"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="value">القيمة المتوقعة (ريال)</Label>
                        <Input
                          id="value"
                          type="number"
                          value={opportunityForm.value}
                          onChange={(e) => setOpportunityForm({...opportunityForm, value: e.target.value})}
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stage">المرحلة</Label>
                        <Select value={opportunityForm.stage} onValueChange={(value) => setOpportunityForm({...opportunityForm, stage: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المرحلة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="تأهيل">تأهيل</SelectItem>
                            <SelectItem value="اقتراح">اقتراح</SelectItem>
                            <SelectItem value="تفاوض">تفاوض</SelectItem>
                            <SelectItem value="إغلاق">إغلاق</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">وصف الفرصة</Label>
                      <Textarea
                        id="description"
                        value={opportunityForm.description}
                        onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                        placeholder="تفاصيل الفرصة والمتطلبات..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => opportunityMutation.mutate({
                        ...opportunityForm,
                        value: parseFloat(opportunityForm.value) || 0,
                        status: 'نشطة'
                      })}
                      disabled={opportunityMutation.isPending || !opportunityForm.title || !opportunityForm.client}
                      className="w-full"
                    >
                      {opportunityMutation.isPending ? "جاري الإنشاء..." : "إنشاء الفرصة"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeAction === 'ai-member' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      عضو ذكاء اصطناعي جديد
                    </CardTitle>
                    <CardDescription>إضافة عضو جديد لفريق الذكاء الاصطناعي</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم العضو</Label>
                      <Input
                        id="name"
                        value={aiMemberForm.name}
                        onChange={(e) => setAiMemberForm({...aiMemberForm, name: e.target.value})}
                        placeholder="مساعد المبيعات الذكي"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">الدور</Label>
                      <Select value={aiMemberForm.role} onValueChange={(value) => setAiMemberForm({...aiMemberForm, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="مساعد مبيعات">مساعد مبيعات</SelectItem>
                          <SelectItem value="محلل بيانات">محلل بيانات</SelectItem>
                          <SelectItem value="مساعد دعم فني">مساعد دعم فني</SelectItem>
                          <SelectItem value="مساعد تسويق">مساعد تسويق</SelectItem>
                          <SelectItem value="مساعد إداري">مساعد إداري</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specialization">التخصص</Label>
                      <Input
                        id="specialization"
                        value={aiMemberForm.specialization}
                        onChange={(e) => setAiMemberForm({...aiMemberForm, specialization: e.target.value})}
                        placeholder="تحليل البيانات والتنبؤ بالمبيعات"
                      />
                    </div>
                    <Button 
                      onClick={() => aiMemberMutation.mutate({
                        ...aiMemberForm,
                        status: 'نشط',
                        performance: Math.floor(Math.random() * 20) + 80
                      })}
                      disabled={aiMemberMutation.isPending || !aiMemberForm.name || !aiMemberForm.role}
                      className="w-full"
                    >
                      {aiMemberMutation.isPending ? "جاري الإنشاء..." : "إنشاء العضو"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}