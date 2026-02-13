import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare, Settings, Phone, Webhook, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppConfig {
  apiToken: string;
  sessionName: string;
  webhookUrl: string;
}

interface WhatsAppMessage {
  id: string;
  from: string;
  body: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppStatus {
  connected: boolean;
  sessionActive: boolean;
  webhookRunning: boolean;
  lastActivity: Date | null;
}

export default function WhatsAppTest() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    apiToken: '',
    sessionName: 'siyadah_session',
    webhookUrl: ''
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate webhook URL based on current domain
  useEffect(() => {
    const currentUrl = window.location.origin;
    setConfig(prev => ({
      ...prev,
      webhookUrl: `${currentUrl}/api/whatsapp/webhook`
    }));
  }, []);

  // Poll for incoming messages
  const { data: incomingMessages } = useQuery({
    queryKey: ['/api/whatsapp/messages'],
    queryFn: async () => {
      const response = await fetch('/api/whatsapp/messages');
      if (!response.ok) throw new Error('فشل في جلب الرسائل');
      return response.json();
    },
    refetchInterval: 3000,
    enabled: isConfigSaved
  });

  // Get WhatsApp status
  const { data: status } = useQuery({
    queryKey: ['/api/whatsapp/status'],
    queryFn: async () => {
      const response = await fetch('/api/whatsapp/status');
      if (!response.ok) throw new Error('فشل في جلب حالة الاتصال');
      return response.json();
    },
    refetchInterval: 10000,
    enabled: isConfigSaved
  });

  // Update messages when new ones arrive
  useEffect(() => {
    if (incomingMessages?.messages) {
      setMessages(prev => {
        const newMessages = incomingMessages.messages.filter(
          (newMsg: any) => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        return [...prev, ...newMessages];
      });
    }
  }, [incomingMessages]);

  // Save configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: WhatsAppConfig) => {
      const response = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(configData)
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', await response.text());
        throw new Error('الخادم لم يرجع استجابة JSON صحيحة');
      }
      
      if (!response.ok) throw new Error('فشل في حفظ الإعدادات');
      return response.json();
    },
    onSuccess: () => {
      setIsConfigSaved(true);
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات WhatsApp بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ phone, text }: { phone: string; text: string }) => {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: text })
      });
      if (!response.ok) throw new Error('فشل في إرسال الرسالة');
      return response.json();
    },
    onSuccess: (data) => {
      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        from: 'أنت',
        body: message,
        timestamp: new Date(),
        type: 'outgoing',
        status: data.success ? 'sent' : 'failed'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      toast({
        title: data.success ? "تم الإرسال" : "فشل الإرسال",
        description: data.success ? "تم إرسال الرسالة بنجاح" : "فشل في إرسال الرسالة"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإرسال",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSaveConfig = () => {
    if (!config.apiToken || !config.sessionName) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }
    saveConfigMutation.mutate(config);
  };

  const handleSendMessage = () => {
    if (!phoneNumber || !message) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال رقم الهاتف والرسالة",
        variant: "destructive"
      });
      return;
    }
    sendMessageMutation.mutate({ phone: phoneNumber, text: message });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    toast({
      title: "تم النسخ",
      description: "تم نسخ رابط الـ Webhook"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            اختبار WhatsApp API
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختبار وإدارة اتصال WhatsApp مع النظام
          </p>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              إرسال رسالة
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              الرسائل
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات WhatsApp API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiToken">API Token</Label>
                    <Input
                      id="apiToken"
                      type="password"
                      placeholder="أدخل API Token"
                      value={config.apiToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionName">اسم الجلسة</Label>
                    <Input
                      id="sessionName"
                      placeholder="اسم الجلسة"
                      value={config.sessionName}
                      onChange={(e) => setConfig(prev => ({ ...prev, sessionName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">رابط Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      readOnly
                      value={config.webhookUrl}
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyWebhookUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveConfig}
                  disabled={saveConfigMutation.isPending}
                  className="w-full"
                >
                  {saveConfigMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>

                {/* Status Display */}
                {status && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3">حالة الاتصال</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={status.connected ? "default" : "destructive"}>
                          {status.connected ? "متصل" : "غير متصل"}
                        </Badge>
                        <span className="text-sm">اتصال WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.sessionActive ? "default" : "secondary"}>
                          {status.sessionActive ? "نشط" : "غير نشط"}
                        </Badge>
                        <span className="text-sm">حالة الجلسة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.webhookRunning ? "default" : "secondary"}>
                          {status.webhookRunning ? "يعمل" : "متوقف"}
                        </Badge>
                        <span className="text-sm">Webhook</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Message Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  إرسال رسالة WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+966501234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageText">نص الرسالة</Label>
                  <Textarea
                    id="messageText"
                    placeholder="اكتب رسالتك هنا..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !isConfigSaved}
                  className="w-full"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>

                {!isConfigSaved && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">
                        يرجى حفظ الإعدادات أولاً قبل إرسال الرسائل
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Tab */}
          <TabsContent value="webhook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  إعدادات Webhook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold mb-2">معلومات Webhook</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    استخدم هذا الرابط في إعدادات WhatsApp API لاستقبال الرسائل الواردة:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={config.webhookUrl}
                      className="bg-white dark:bg-gray-800 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyWebhookUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">خطوات تكوين Webhook:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>انسخ رابط الـ Webhook أعلاه</li>
                    <li>ادخل إلى لوحة تحكم WhatsApp API</li>
                    <li>ابحث عن إعدادات Webhook</li>
                    <li>الصق الرابط في حقل Webhook URL</li>
                    <li>احفظ الإعدادات</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  الرسائل ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد رسائل بعد
                    </div>
                  ) : (
                    messages
                      .filter(msg => msg.body && msg.body !== 'N/A' && msg.from !== 'unknown')
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'} mb-3`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.type === 'outgoing'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {msg.type === 'outgoing' ? 'أنت' : msg.from.replace('@c.us', '').replace(/^\+/, '')}
                              </span>
                              <Badge 
                                variant={msg.type === 'outgoing' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {msg.type === 'outgoing' ? 'مُرسل' : 'مُستقبل'}
                              </Badge>
                            </div>
                            <p className="text-sm">{msg.body}</p>
                            <span className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}