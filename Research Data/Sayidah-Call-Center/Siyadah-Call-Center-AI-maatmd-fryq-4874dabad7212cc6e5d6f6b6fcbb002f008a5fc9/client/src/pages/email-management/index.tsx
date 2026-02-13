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
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const EmailManagement = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    templateId: '',
    scheduledDate: '',
    isScheduled: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock email templates data
  const emailTemplates = [
    {
      id: 1,
      name: "رسالة ترحيب للعملاء الجدد",
      subject: "مرحباً بك في منصة الأتمتة الذكية",
      content: "عزيزنا العميل،\n\nنرحب بك في منصة الأتمتة الذكية. نحن سعداء لانضمامك إلينا...",
      category: "welcome",
      usageCount: 145,
      lastUsed: "منذ يومين",
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: "متابعة العروض",
      subject: "هل لديك أسئلة حول عرضنا؟",
      content: "عزيزنا العميل،\n\nنأمل أن تكون قد راجعت عرضنا المرسل إليك...",
      category: "follow_up",
      usageCount: 89,
      lastUsed: "منذ ساعة",
      createdAt: new Date('2024-01-20')
    },
    {
      id: 3,
      name: "تأكيد الصفقة",
      subject: "تأكيد إتمام الصفقة",
      content: "عزيزنا العميل،\n\nنشكرك على ثقتك بنا. تم إتمام الصفقة بنجاح...",
      category: "confirmation",
      usageCount: 67,
      lastUsed: "منذ 3 أيام",
      createdAt: new Date('2024-01-10')
    }
  ];

  // Mock campaigns data
  const emailCampaigns = [
    {
      id: 1,
      name: "حملة المنتجات الجديدة",
      subject: "اكتشف منتجاتنا الجديدة",
      status: "sent",
      scheduledDate: new Date('2024-01-25'),
      sentDate: new Date('2024-01-25'),
      recipients: 1250,
      openRate: 42.5,
      clickRate: 8.3,
      bounceRate: 2.1
    },
    {
      id: 2,
      name: "تحديث أسعار الخدمات",
      subject: "تحديث مهم على أسعار خدماتنا",
      status: "scheduled",
      scheduledDate: new Date('2024-02-01'),
      recipients: 890,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0
    },
    {
      id: 3,
      name: "نشرة أخبار يناير",
      subject: "نشرة أخبار منصة الأتمتة - يناير 2024",
      status: "draft",
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0
    }
  ];

  // Email metrics
  const emailMetrics = {
    totalSent: 2847,
    openRate: 68.7,
    clickRate: 12.4,
    bounceRate: 3.2,
    unsubscribeRate: 1.8,
    avgResponseTime: "2.3 ساعة"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-success/20 text-success';
      case 'scheduled':
        return 'bg-warning/20 text-warning';
      case 'draft':
        return 'bg-text-muted/20 text-text-muted';
      case 'failed':
        return 'bg-error/20 text-error';
      default:
        return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'sent': 'مُرسلة',
      'scheduled': 'مجدولة',
      'draft': 'مسودة',
      'failed': 'فشلت'
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'welcome': 'ترحيب',
      'follow_up': 'متابعة',
      'confirmation': 'تأكيد',
      'newsletter': 'نشرة إخبارية',
      'promotion': 'عروض ترويجية',
      'general': 'عام'
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header 
        title="إدارة البريد الإلكتروني" 
        subtitle="إنشاء وإرسال الحملات البريدية مع قوالب ذكية"
      />
      
      <main className="mr-72 pt-0">
        <div className="p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="glass-effect border border-white/10 p-4 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <AppIcon name="Send" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">رسائل مُرسلة</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.totalSent.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-success/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <AppIcon name="Mail" className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">معدل الفتح</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.openRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <AppIcon name="MousePointer" className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">معدل النقر</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.clickRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-warning/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AppIcon name="AlertTriangle" className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">معدل الارتداد</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.bounceRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-error/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-error/20 rounded-lg">
                  <AppIcon name="UserMinus" className="w-5 h-5 text-error" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">إلغاء الاشتراك</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.unsubscribeRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <AppIcon name="Clock" className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">متوسط الاستجابة</p>
                  <p className="text-lg font-bold text-text-primary">{emailMetrics.avgResponseTime}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="glass-effect border border-white/10">
                <TabsTrigger value="templates">قوالب البريد</TabsTrigger>
                <TabsTrigger value="campaigns">الحملات</TabsTrigger>
                <TabsTrigger value="analytics">التحليلات</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">قوالب البريد الإلكتروني</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent-600 text-background">
                      <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                      قالب جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-effect border border-white/10 max-w-2xl" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-text-primary">إنشاء قالب بريد إلكتروني جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">اسم القالب</label>
                          <Input
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                            placeholder="اسم القالب"
                            className="bg-surface border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">الفئة</label>
                          <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                            <SelectTrigger className="bg-surface border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="welcome">ترحيب</SelectItem>
                              <SelectItem value="follow_up">متابعة</SelectItem>
                              <SelectItem value="confirmation">تأكيد</SelectItem>
                              <SelectItem value="newsletter">نشرة إخبارية</SelectItem>
                              <SelectItem value="promotion">عروض ترويجية</SelectItem>
                              <SelectItem value="general">عام</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">موضوع الرسالة</label>
                        <Input
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                          placeholder="موضوع الرسالة"
                          className="bg-surface border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">محتوى الرسالة</label>
                        <Textarea
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                          placeholder="محتوى الرسالة"
                          className="bg-surface border-white/10"
                          rows={8}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button className="flex-1 bg-accent hover:bg-accent-600 text-background">
                          حفظ القالب
                        </Button>
                        <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10">
                          معاينة
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Templates List */}
                <div className="lg:col-span-2 space-y-4">
                  {emailTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`glass-effect border p-6 cursor-pointer transition-all duration-300 ${
                        selectedTemplate?.id === template.id 
                          ? "border-accent/50 bg-accent/5" 
                          : "border-white/10 hover:border-accent/30"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-text-primary">{template.name}</h4>
                            <Badge variant="outline" className="text-text-muted">
                              {getCategoryLabel(template.category)}
                            </Badge>
                          </div>
                          <p className="text-text-secondary text-sm mb-2">{template.subject}</p>
                          <p className="text-text-muted text-sm line-clamp-2">{template.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center space-x-4 text-sm text-text-muted">
                          <span>استُخدم {template.usageCount} مرة</span>
                          <span>آخر استخدام: {template.lastUsed}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                            <AppIcon name="Copy" className="w-3 h-3 ml-1" />
                            نسخ
                          </Button>
                          <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                            <AppIcon name="Edit" className="w-3 h-3 ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Template Details */}
                <div>
                  {selectedTemplate ? (
                    <Card className="glass-effect border border-white/10 p-6 sticky top-6">
                      <h3 className="text-lg font-bold text-text-primary mb-4">تفاصيل القالب</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">معلومات القالب</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">الاسم:</span>
                              <span className="text-text-primary text-sm">{selectedTemplate.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">الفئة:</span>
                              <Badge variant="outline" className="text-text-muted">
                                {getCategoryLabel(selectedTemplate.category)}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">عدد الاستخدامات:</span>
                              <span className="text-text-primary text-sm">{selectedTemplate.usageCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary text-sm">آخر استخدام:</span>
                              <span className="text-text-primary text-sm">{selectedTemplate.lastUsed}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-text-primary mb-2">الموضوع</h4>
                          <p className="text-text-secondary text-sm bg-surface/50 p-3 rounded-lg">
                            {selectedTemplate.subject}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-text-primary mb-2">المحتوى</h4>
                          <div className="text-text-secondary text-sm bg-surface/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                            {selectedTemplate.content}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button className="w-full bg-accent hover:bg-accent-600 text-background">
                          <AppIcon name="Send" className="w-4 h-4 ml-2" />
                          استخدام في حملة
                        </Button>
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                          <AppIcon name="Edit" className="w-4 h-4 ml-2" />
                          تعديل القالب
                        </Button>
                        <Button variant="outline" className="w-full border-warning text-warning hover:bg-warning/10">
                          <AppIcon name="Copy" className="w-4 h-4 ml-2" />
                          نسخ القالب
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card className="glass-effect border border-white/10 p-6 text-center">
                      <AppIcon name="Mail" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">اختر قالب</h3>
                      <p className="text-text-secondary">انقر على أي قالب من القائمة لعرض التفاصيل</p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">الحملات البريدية</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent-600 text-background">
                      <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                      حملة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-effect border border-white/10" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-text-primary">إنشاء حملة بريدية جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">اسم الحملة</label>
                        <Input
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                          placeholder="اسم الحملة"
                          className="bg-surface border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">موضوع الرسالة</label>
                        <Input
                          value={newCampaign.subject}
                          onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                          placeholder="موضوع الرسالة"
                          className="bg-surface border-white/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">قالب البريد</label>
                        <Select value={newCampaign.templateId} onValueChange={(value) => setNewCampaign({...newCampaign, templateId: value})}>
                          <SelectTrigger className="bg-surface border-white/10">
                            <SelectValue placeholder="اختر قالب" />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch 
                          checked={newCampaign.isScheduled}
                          onCheckedChange={(checked) => setNewCampaign({...newCampaign, isScheduled: checked})}
                        />
                        <label className="text-sm font-medium text-text-secondary">جدولة الإرسال</label>
                      </div>
                      {newCampaign.isScheduled && (
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-2">تاريخ ووقت الإرسال</label>
                          <Input
                            type="datetime-local"
                            value={newCampaign.scheduledDate}
                            onChange={(e) => setNewCampaign({...newCampaign, scheduledDate: e.target.value})}
                            className="bg-surface border-white/10"
                          />
                        </div>
                      )}
                      <Button className="w-full bg-accent hover:bg-accent-600 text-background">
                        {newCampaign.isScheduled ? "جدولة الحملة" : "إرسال فوري"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {emailCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="glass-effect border border-white/10 p-6 hover:border-accent/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-text-primary">{campaign.name}</h4>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusLabel(campaign.status)}
                          </Badge>
                        </div>
                        <p className="text-text-secondary text-sm mb-2">{campaign.subject}</p>
                        <div className="flex items-center space-x-4 text-xs text-text-muted">
                          <span>المستلمين: {campaign.recipients.toLocaleString()}</span>
                          {campaign.scheduledDate && (
                            <span>
                              {campaign.status === 'sent' ? 'تاريخ الإرسال' : 'مجدولة لـ'}: {campaign.scheduledDate.toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {campaign.status === 'sent' && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-lg font-bold text-success">{campaign.openRate}%</p>
                          <p className="text-xs text-text-secondary">معدل الفتح</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-accent">{campaign.clickRate}%</p>
                          <p className="text-xs text-text-secondary">معدل النقر</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-warning">{campaign.bounceRate}%</p>
                          <p className="text-xs text-text-secondary">معدل الارتداد</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                      <div className="flex space-x-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm" className="bg-accent hover:bg-accent-600 text-background">
                            <AppIcon name="Send" className="w-3 h-3 ml-1" />
                            إرسال
                          </Button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                            <AppIcon name="Edit" className="w-3 h-3 ml-1" />
                            تعديل الجدولة
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                          <AppIcon name="BarChart3" className="w-3 h-3 ml-1" />
                          التفاصيل
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6 text-center">
                <AppIcon name="BarChart3" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">تحليلات البريد الإلكتروني</h3>
                <p className="text-text-secondary">ستتوفر تحليلات مفصلة لأداء الحملات البريدية قريباً</p>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">إعدادات البريد الإلكتروني</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">خادم SMTP</label>
                    <Input
                      placeholder="smtp.example.com"
                      className="bg-surface border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">منفذ SMTP</label>
                      <Input
                        placeholder="587"
                        className="bg-surface border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">التشفير</label>
                      <Select>
                        <SelectTrigger className="bg-surface border-white/10">
                          <SelectValue placeholder="اختر نوع التشفير" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">بدون تشفير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">اسم المستخدم</label>
                      <Input
                        placeholder="username@example.com"
                        className="bg-surface border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">كلمة المرور</label>
                      <Input
                        type="password"
                        placeholder="كلمة المرور"
                        className="bg-surface border-white/10"
                      />
                    </div>
                  </div>
                  <Button className="bg-accent hover:bg-accent-600 text-background">
                    حفظ الإعدادات
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EmailManagement;
