import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/ui/sidebar';
import PlaceholderMessage from '@/components/common/PlaceholderMessage';
import { 
  Plug, 
  Settings,
  Plus,
  Check,
  X,
  AlertTriangle,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Database,
  Cloud,
  Globe,
  Key,
  Shield,
  Refresh,
  Download,
  Upload
} from 'lucide-react';

interface Integration {
  _id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  apiKey?: string;
  endpoint?: string;
  settings: Record<string, any>;
  lastSync?: string;
  createdAt: string;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: any;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'textarea';
    required: boolean;
    placeholder?: string;
  }[];
  webhookSupport: boolean;
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Record<string, any>>({});

  // Mock integrations data
  const mockIntegrations: Integration[] = [
    {
      _id: '1',
      name: 'Twilio Communications',
      type: 'communications',
      status: 'connected',
      description: 'منصة الرسائل والمكالمات',
      apiKey: 'AC***',
      endpoint: 'https://api.twilio.com',
      settings: {
        phoneNumber: '+17065744440',
        region: 'us1'
      },
      lastSync: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      name: 'OpenAI GPT',
      type: 'ai',
      status: 'connected',
      description: 'خدمات الذكاء الاصطناعي',
      apiKey: 'sk-***',
      endpoint: 'https://api.openai.com',
      settings: {
        model: 'gpt-4o',
        maxTokens: 1000
      },
      lastSync: new Date().toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      name: 'MongoDB Atlas',
      type: 'database',
      status: 'connected',
      description: 'قاعدة البيانات الأساسية',
      endpoint: 'cluster0.gi1rraa.mongodb.net',
      settings: {
        database: 'business_automation',
        ssl: true
      },
      lastSync: new Date().toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const integrationTemplates: IntegrationTemplate[] = [
    {
      id: 'email_smtp',
      name: 'SMTP Email',
      type: 'email',
      description: 'خدمة البريد الإلكتروني عبر SMTP',
      icon: Mail,
      fields: [
        { name: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
        { name: 'port', label: 'Port', type: 'text', required: true, placeholder: '587' },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'fromEmail', label: 'From Email', type: 'text', required: true }
      ],
      webhookSupport: false
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'messaging',
      description: 'تكامل مع Slack للإشعارات',
      icon: MessageSquare,
      fields: [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
        { name: 'channel', label: 'Default Channel', type: 'text', required: false, placeholder: '#general' }
      ],
      webhookSupport: true
    },
    {
      id: 'webhook',
      name: 'Generic Webhook',
      type: 'webhook',
      description: 'Webhook مخصص لتطبيقات أخرى',
      icon: Globe,
      fields: [
        { name: 'url', label: 'Webhook URL', type: 'url', required: true },
        { name: 'method', label: 'HTTP Method', type: 'text', required: true, placeholder: 'POST' },
        { name: 'headers', label: 'Headers (JSON)', type: 'textarea', required: false },
        { name: 'secret', label: 'Secret', type: 'password', required: false }
      ],
      webhookSupport: true
    },
    {
      id: 'zapier',
      name: 'Zapier',
      type: 'automation',
      description: 'أتمتة المهام مع Zapier',
      icon: Zap,
      fields: [
        { name: 'webhookUrl', label: 'Zapier Webhook URL', type: 'url', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', required: false }
      ],
      webhookSupport: true
    }
  ];

  const { data: integrations = mockIntegrations, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: () => apiRequest('/api/integrations', 'GET')
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/integrations', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowAddIntegration(false);
      setSelectedTemplate(null);
      setNewIntegration({});
      toast({ title: "تم إنشاء التكامل", description: "تم إضافة التكامل الجديد بنجاح" });
    }
  });

  const testIntegrationMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/integrations/${id}/test`, 'POST'),
    onSuccess: (data) => {
      toast({ 
        title: data.success ? "نجح الاختبار" : "فشل الاختبار", 
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string, enabled: boolean }) => 
      apiRequest(`/api/integrations/${id}/toggle`, 'PATCH', { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({ title: "تم تحديث التكامل", description: "تم تحديث حالة التكامل" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="h-4 w-4" />;
      case 'disconnected': return <X className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <X className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'communications': return <Phone className="h-6 w-6" />;
      case 'ai': return <Zap className="h-6 w-6" />;
      case 'database': return <Database className="h-6 w-6" />;
      case 'email': return <Mail className="h-6 w-6" />;
      case 'messaging': return <MessageSquare className="h-6 w-6" />;
      case 'webhook': return <Globe className="h-6 w-6" />;
      case 'automation': return <Settings className="h-6 w-6" />;
      default: return <Plug className="h-6 w-6" />;
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'لم يتم المزامنة';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 mr-72 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">التكاملات</h1>
              <p className="text-muted-foreground">إدارة التكاملات مع الخدمات الخارجية</p>
            </div>
            <Button onClick={() => setShowAddIntegration(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة تكامل
            </Button>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">التكاملات النشطة</TabsTrigger>
              <TabsTrigger value="available">التكاملات المتاحة</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(integration => (
                  <Card key={integration._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="p-2 bg-muted rounded-lg">
                            {getTypeIcon(integration.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription>{integration.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(integration.status)}
                            {integration.status === 'connected' ? 'متصل' :
                             integration.status === 'disconnected' ? 'غير متصل' : 'خطأ'}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        {integration.endpoint && (
                          <div className="flex items-center text-muted-foreground">
                            <Globe className="h-4 w-4 ml-2" />
                            {integration.endpoint}
                          </div>
                        )}
                        {integration.apiKey && (
                          <div className="flex items-center text-muted-foreground">
                            <Key className="h-4 w-4 ml-2" />
                            {integration.apiKey}
                          </div>
                        )}
                        <div className="flex items-center text-muted-foreground">
                          <Refresh className="h-4 w-4 ml-2" />
                          آخر مزامنة: {formatLastSync(integration.lastSync)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testIntegrationMutation.mutate(integration._id)}
                            disabled={testIntegrationMutation.isPending}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <Switch
                          checked={integration.status === 'connected'}
                          onCheckedChange={(checked) => 
                            toggleIntegrationMutation.mutate({
                              id: integration._id,
                              enabled: checked
                            })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTemplates.map(template => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowAddIntegration(true);
                        }}>
                    <CardHeader>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <template.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{template.type}</Badge>
                        {template.webhookSupport && (
                          <Badge variant="secondary">Webhook</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    إدارة Webhooks
                  </CardTitle>
                  <CardDescription>
                    إعداد وإدارة webhooks للتكاملات الخارجية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Webhook للفرص الجديدة</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        يتم إرسال webhook عند إنشاء فرصة جديدة
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          POST /webhooks/opportunity/created
                        </code>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Webhook لسير العمل</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        يتم إرسال webhook عند إكمال سير العمل
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          POST /webhooks/workflow/completed
                        </code>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Webhook للتذاكر</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        يتم إرسال webhook عند إنشاء تذكرة دعم جديدة
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          POST /webhooks/ticket/created
                        </code>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Integration Dialog */}
          {showAddIntegration && selectedTemplate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <selectedTemplate.icon className="h-6 w-6" />
                      <div>
                        <CardTitle>إضافة {selectedTemplate.name}</CardTitle>
                        <CardDescription>{selectedTemplate.description}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => {
                      setShowAddIntegration(false);
                      setSelectedTemplate(null);
                      setNewIntegration({});
                    }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate.fields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          value={newIntegration[field.name] || ''}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            [field.name]: e.target.value
                          })}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={newIntegration[field.name] || ''}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            [field.name]: e.target.value
                          })}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddIntegration(false);
                        setSelectedTemplate(null);
                        setNewIntegration({});
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={() => createIntegrationMutation.mutate({
                        ...newIntegration,
                        name: selectedTemplate.name,
                        type: selectedTemplate.type,
                        templateId: selectedTemplate.id
                      })}
                      disabled={createIntegrationMutation.isPending}
                    >
                      {createIntegrationMutation.isPending ? "جاري الإنشاء..." : "إضافة التكامل"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}