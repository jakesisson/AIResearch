import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  PhoneCall, 
  MessageSquare, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Send,
  RefreshCw,
  Key,
  Webhook,
  Database
} from "lucide-react";

const VoipIntegration = () => {
  const [testData, setTestData] = useState({
    event: 'customer_update',
    customer_id: '12345',
    name: 'عبدالرحمن',
    phone: '+966566100095',
    status: 'active',
    email: 'abdulrahman@example.com',
    notes: 'عميل مهتم بخدمات الذكاء الاصطناعي'
  });

  const [callData, setCallData] = useState({
    call_id: 'CALL_' + Date.now(),
    customer_id: '12345',
    phone: '+966566100095',
    duration: 120,
    outcome: 'interested',
    notes: 'مكالمة ناجحة، العميل مهتم بالخدمات'
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get VoIP status
  const { data: voipStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/voip/status'],
    queryFn: async () => {
      const response = await fetch('/api/voip/status', {
        headers: {
          'X-API-Key': 'siyadah_voip_api_key_2025_v1'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch VoIP status');
      }
      return response.json();
    }
  });

  // Test customer update
  const testCustomerUpdate = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/external/webhook/your_system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'siyadah_voip_api_key_2025_v1'
        },
        body: JSON.stringify({
          event: 'customer_update',
          data: data
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send customer update');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "نجح التحديث",
        description: "تم إرسال تحديث العميل بنجاح",
      });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  // Test call completion
  const testCallCompleted = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/external/webhook/your_system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'siyadah_voip_api_key_2025_v1'
        },
        body: JSON.stringify({
          event: 'call_completed',
          data: data
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send call completion');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل المكالمة",
        description: "تم إرسال بيانات المكالمة المكتملة بنجاح",
      });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل المكالمة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const handleTestSubmit = () => {
    testCustomerUpdate.mutate(testData);
  };

  // Make actual call using Twilio
  const makeActualCall = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch('/api/twilio/test-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: `مرحباً، هذه مكالمة تجريبية من نظام سيادة AI. نشكرك على اختبار نظام التكامل.`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to make call');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم إجراء المكالمة",
        description: `تم إجراء المكالمة بنجاح. معرف المكالمة: ${data.callId || 'غير متوفر'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في المكالمة",
        description: "فشل في إجراء المكالمة. تحقق من الرقم والإعدادات.",
        variant: "destructive",
      });
    },
  });

  const handleCallSubmit = () => {
    testCallCompleted.mutate(callData);
  };

  const handleActualCall = () => {
    if (callData.phone) {
      makeActualCall.mutate(callData.phone);
    }
  };

  const generateTestData = () => {
    setTestData({
      ...testData,
      customer_id: Math.random().toString(36).substr(2, 9),
      name: ['أحمد المالكي', 'فاطمة العتيبي', 'محمد الغامدي', 'نورا السعد'][Math.floor(Math.random() * 4)],
      phone: '+96650' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
    });
  };

  const eventTypes = [
    { value: 'customer_update', label: 'تحديث العميل', icon: <Database className="w-4 h-4" /> },
    { value: 'call_completed', label: 'مكالمة مكتملة', icon: <PhoneCall className="w-4 h-4" /> },
    { value: 'call_initiated', label: 'بدء مكالمة', icon: <Phone className="w-4 h-4" /> },
    { value: 'voice_message', label: 'رسالة صوتية', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const statusTypes = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'pending', label: 'في الانتظار' },
    { value: 'blocked', label: 'محظور' }
  ];

  const callOutcomes = [
    { value: 'interested', label: 'مهتم' },
    { value: 'not_interested', label: 'غير مهتم' },
    { value: 'callback_requested', label: 'طلب إعادة اتصال' },
    { value: 'no_answer', label: 'لا يوجد رد' },
    { value: 'busy', label: 'مشغول' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            تكامل Siyadah VoIP
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اختبار وإدارة التكامل مع نظام Siyadah VoIP للمكالمات الذكية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                حالة النظام
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStatus()}
                disabled={statusLoading}
              >
                <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {voipStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الحالة</span>
                  <Badge variant={voipStatus.status === 'active' ? 'default' : 'destructive'}>
                    {voipStatus.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">مفتاح API</span>
                  <Badge variant={voipStatus.api_key_status === 'valid' ? 'default' : 'destructive'}>
                    {voipStatus.api_key_status === 'valid' ? 'صالح' : 'غير صالح'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الأنشطة</span>
                  <span className="text-sm font-medium">
                    {voipStatus.integration_stats?.total_voip_activities || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الفرص</span>
                  <span className="text-sm font-medium">
                    {voipStatus.integration_stats?.total_voip_opportunities || 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">لا توجد بيانات متاحة</p>
                </div>
              </div>
            )}
          </Card>

          {/* API Configuration */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Key className="w-5 h-5 text-blue-500 ml-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تكوين API
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Webhook URL
                </label>
                <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    /api/external/webhook/your_system
                  </code>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Key
                </label>
                <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    siyadah_voip_api_key_2025_v1
                  </code>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Header
                </label>
                <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    X-API-Key: siyadah_voip_api_key_2025_v1
                  </code>
                </div>
              </div>
            </div>
          </Card>

          {/* Integration Stats */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 text-green-500 ml-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                إحصائيات التكامل
              </h3>
            </div>
            
            {voipStatus?.integration_stats ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {voipStatus.integration_stats.total_voip_activities}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    إجمالي الأنشطة
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {voipStatus.integration_stats.total_voip_opportunities}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    فرص VoIP
                  </div>
                </div>
                
                {voipStatus.integration_stats.last_activity && (
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      آخر نشاط
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(voipStatus.integration_stats.last_activity).toLocaleString('ar')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">لا توجد إحصائيات متاحة</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Testing Interface */}
        <Tabs defaultValue="customer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              اختبار تحديث العميل
            </TabsTrigger>
            <TabsTrigger value="call" className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              اختبار مكالمة مكتملة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  اختبار تحديث بيانات العميل
                </h3>
                <Button
                  variant="outline"
                  onClick={generateTestData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  توليد بيانات تجريبية
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نوع الحدث
                    </label>
                    <Select value={testData.event} onValueChange={(value) => setTestData({...testData, event: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      معرف العميل
                    </label>
                    <Input
                      value={testData.customer_id}
                      onChange={(e) => setTestData({...testData, customer_id: e.target.value})}
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم العميل
                    </label>
                    <Input
                      value={testData.name}
                      onChange={(e) => setTestData({...testData, name: e.target.value})}
                      placeholder="عبدالرحمن"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <Input
                      value={testData.phone}
                      onChange={(e) => setTestData({...testData, phone: e.target.value})}
                      placeholder="+966566100095"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      حالة العميل
                    </label>
                    <Select value={testData.status} onValueChange={(value) => setTestData({...testData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <Input
                      value={testData.email}
                      onChange={(e) => setTestData({...testData, email: e.target.value})}
                      placeholder="abdulrahman@example.com"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ملاحظات
                    </label>
                    <Textarea
                      value={testData.notes}
                      onChange={(e) => setTestData({...testData, notes: e.target.value})}
                      placeholder="عميل مهتم بخدمات الذكاء الاصطناعي"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleTestSubmit}
                  disabled={testCustomerUpdate.isPending}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {testCustomerUpdate.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  إرسال تحديث العميل
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="call">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  اختبار مكالمة مكتملة
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      معرف المكالمة
                    </label>
                    <Input
                      value={callData.call_id}
                      onChange={(e) => setCallData({...callData, call_id: e.target.value})}
                      placeholder="CALL_1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      معرف العميل
                    </label>
                    <Input
                      value={callData.customer_id}
                      onChange={(e) => setCallData({...callData, customer_id: e.target.value})}
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <Input
                      value={callData.phone}
                      onChange={(e) => setCallData({...callData, phone: e.target.value})}
                      placeholder="+966566100095"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      مدة المكالمة (ثانية)
                    </label>
                    <Input
                      type="number"
                      value={callData.duration}
                      onChange={(e) => setCallData({...callData, duration: parseInt(e.target.value) || 0})}
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نتيجة المكالمة
                    </label>
                    <Select value={callData.outcome} onValueChange={(value) => setCallData({...callData, outcome: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {callOutcomes.map((outcome) => (
                          <SelectItem key={outcome.value} value={outcome.value}>
                            {outcome.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ملاحظات المكالمة
                    </label>
                    <Textarea
                      value={callData.notes}
                      onChange={(e) => setCallData({...callData, notes: e.target.value})}
                      placeholder="مكالمة ناجحة، العميل مهتم بالخدمات"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  onClick={handleCallSubmit}
                  disabled={testCallCompleted.isPending}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {testCallCompleted.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Webhook className="w-4 h-4" />
                  )}
                  محاكاة استقبال البيانات
                </Button>
                
                <Button
                  onClick={handleActualCall}
                  disabled={makeActualCall.isPending || !callData.phone}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {makeActualCall.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                  إجراء مكالمة فعلية
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VoipIntegration;