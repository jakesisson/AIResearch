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
import { Mail, Send, Users, TrendingUp, Calendar, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  recipients: number;
  openRate: number;
  clickRate: number;
  sentDate?: Date;
  scheduledDate?: Date;
  template: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  lastUsed: Date;
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'حملة العروض الصيفية',
    subject: 'عروض حصرية لفترة محدودة - خصم 30%',
    status: 'sent',
    recipients: 1250,
    openRate: 28.5,
    clickRate: 5.2,
    sentDate: new Date('2024-01-10'),
    template: 'summer-offers'
  },
  {
    id: '2',
    name: 'نشرة إخبارية شهرية',
    subject: 'آخر الأخبار والتحديثات - يناير 2024',
    status: 'scheduled',
    recipients: 2100,
    openRate: 0,
    clickRate: 0,
    scheduledDate: new Date('2024-01-20'),
    template: 'newsletter'
  },
  {
    id: '3',
    name: 'ترحيب بالعملاء الجدد',
    subject: 'مرحباً بك! دليل البداية السريعة',
    status: 'sent',
    recipients: 89,
    openRate: 45.2,
    clickRate: 12.8,
    sentDate: new Date('2024-01-12'),
    template: 'welcome'
  }
];

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'قالب الترحيب',
    subject: 'مرحباً بك في منصتنا!',
    content: 'مرحباً {{name}}, نحن سعداء بانضمامك إلينا...',
    category: 'ترحيب',
    lastUsed: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'قالب العروض',
    subject: 'عرض خاص لك!',
    content: 'لديك عرض حصري بخصم {{discount}}%...',
    category: 'تسويق',
    lastUsed: new Date('2024-01-12')
  },
  {
    id: '3',
    name: 'قالب النشرة الإخبارية',
    subject: 'آخر الأخبار والتحديثات',
    content: 'إليك آخر الأخبار والتحديثات الهامة...',
    category: 'إخبارية',
    lastUsed: new Date('2024-01-08')
  }
];

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const { toast } = useToast();

  const { data: campaigns = mockCampaigns } = useQuery({
    queryKey: ['/api/email-campaigns'],
    queryFn: () => Promise.resolve(mockCampaigns)
  });

  const { data: templates = mockTemplates } = useQuery({
    queryKey: ['/api/email-templates'],
    queryFn: () => Promise.resolve(mockTemplates)
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'scheduled': return 'مجدولة';
      case 'sent': return 'تم الإرسال';
      case 'paused': return 'متوقفة';
      default: return status;
    }
  };

  const handleCreateCampaign = () => {
    toast({
      title: "تم إنشاء الحملة بنجاح",
      description: "تم إنشاء حملة بريد إلكتروني جديدة"
    });
    setIsNewCampaignOpen(false);
  };

  const handleCreateTemplate = () => {
    toast({
      title: "تم إنشاء القالب بنجاح",
      description: "تم إنشاء قالب بريد إلكتروني جديد"
    });
    setIsNewTemplateOpen(false);
  };

  // حساب الإحصائيات
  const stats = {
    totalCampaigns: campaigns.length,
    sentCampaigns: campaigns.filter(c => c.status === 'sent').length,
    totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients, 0),
    avgOpenRate: campaigns.filter(c => c.status === 'sent').length > 0 
      ? Math.round(campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.status === 'sent').length)
      : 0,
    avgClickRate: campaigns.filter(c => c.status === 'sent').length > 0
      ? Math.round(campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.clickRate, 0) / campaigns.filter(c => c.status === 'sent').length * 10) / 10
      : 0
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
                  <p className="text-slate-400 text-sm">إجمالي الحملات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCampaigns}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تم الإرسال</p>
                  <p className="text-2xl font-bold text-green-400">{stats.sentCampaigns}</p>
                </div>
                <Send className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي المستلمين</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalRecipients.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">متوسط الفتح</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.avgOpenRate}%</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">متوسط النقر</p>
                  <p className="text-2xl font-bold text-red-400">{stats.avgClickRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              الحملات
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              القوالب
            </TabsTrigger>
          </TabsList>

          {/* تبويب الحملات */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* شريط البحث والفلاتر */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="البحث في الحملات..."
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
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="scheduled">مجدولة</SelectItem>
                        <SelectItem value="sent">تم الإرسال</SelectItem>
                        <SelectItem value="paused">متوقفة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 ml-2" />
                        حملة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>إنشاء حملة بريد إلكتروني جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">اسم الحملة</label>
                          <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="اسم الحملة" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">موضوع الرسالة</label>
                          <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="موضوع الرسالة" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">القالب</label>
                            <Select>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="اختر القالب" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.map(template => (
                                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">تاريخ الإرسال</label>
                            <Input type="datetime-local" className="bg-slate-700/50 border-slate-600 text-white" />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">قائمة المستلمين</label>
                          <Select>
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                              <SelectValue placeholder="اختر قائمة المستلمين" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-customers">جميع العملاء</SelectItem>
                              <SelectItem value="active-customers">العملاء النشطون</SelectItem>
                              <SelectItem value="new-customers">العملاء الجدد</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>
                            إلغاء
                          </Button>
                          <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
                            إنشاء الحملة
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* قائمة الحملات */}
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-300 mb-3">{campaign.subject}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">المستلمون: </span>
                            <span className="text-white font-medium">{campaign.recipients.toLocaleString()}</span>
                          </div>
                          {campaign.status === 'sent' && (
                            <>
                              <div>
                                <span className="text-slate-400">معدل الفتح: </span>
                                <span className="text-green-400 font-medium">{campaign.openRate}%</span>
                              </div>
                              <div>
                                <span className="text-slate-400">معدل النقر: </span>
                                <span className="text-blue-400 font-medium">{campaign.clickRate}%</span>
                              </div>
                            </>
                          )}
                          <div>
                            <span className="text-slate-400">التاريخ: </span>
                            <span className="text-white font-medium">
                              {campaign.sentDate ? campaign.sentDate.toLocaleDateString('ar-SA') :
                               campaign.scheduledDate ? campaign.scheduledDate.toLocaleDateString('ar-SA') : 'غير محدد'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب القوالب */}
          <TabsContent value="templates" className="space-y-6">
            {/* شريط القوالب */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">قوالب البريد الإلكتروني</h3>
                  <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 ml-2" />
                        قالب جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>إنشاء قالب بريد إلكتروني جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">اسم القالب</label>
                            <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="اسم القالب" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">الفئة</label>
                            <Select>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="welcome">ترحيب</SelectItem>
                                <SelectItem value="marketing">تسويق</SelectItem>
                                <SelectItem value="newsletter">إخبارية</SelectItem>
                                <SelectItem value="notification">إشعار</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">موضوع الرسالة</label>
                          <Input className="bg-slate-700/50 border-slate-600 text-white" placeholder="موضوع الرسالة" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-2 block">محتوى القالب</label>
                          <Textarea className="bg-slate-700/50 border-slate-600 text-white min-h-[200px]" placeholder="محتوى القالب... يمكنك استخدام المتغيرات مثل {{name}}, {{company}}, {{discount}}" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setIsNewTemplateOpen(false)}>
                            إلغاء
                          </Button>
                          <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
                            حفظ القالب
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* قائمة القوالب */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-400 mb-1">الموضوع:</p>
                        <p className="text-white font-medium">{template.subject}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-400 mb-1">المحتوى:</p>
                        <p className="text-slate-300 text-sm line-clamp-3">{template.content}</p>
                      </div>
                      
                      <div className="text-xs text-slate-400">
                        آخر استخدام: {template.lastUsed.toLocaleDateString('ar-SA')}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Eye className="w-4 h-4 ml-1" />
                          معاينة
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}