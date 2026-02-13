import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Settings, 
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface LearningStats {
  totalPatterns: number;
  totalInteractions: number;
  learningAccuracy: number;
  topPatterns: Array<{
    id: string;
    pattern: string;
    frequency: number;
    confidence: number;
    context: string;
  }>;
  recentImprovements: string[];
}

interface DataSource {
  type: 'google_sheet' | 'crm' | 'whatsapp' | 'api' | 'manual';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const dataSources: DataSource[] = [
  {
    type: 'google_sheet',
    name: 'Google Sheets',
    description: 'استيراد البيانات من جداول Google',
    icon: FileText
  },
  {
    type: 'crm',
    name: 'نظام CRM',
    description: 'ربط نظام إدارة علاقات العملاء',
    icon: Users
  },
  {
    type: 'whatsapp',
    name: 'محادثات واتساب',
    description: 'تحليل محادثات واتساب السابقة',
    icon: MessageSquare
  },
  {
    type: 'api',
    name: 'API خارجي',
    description: 'ربط مصدر بيانات عبر API',
    icon: Database
  },
  {
    type: 'manual',
    name: 'إدخال يدوي',
    description: 'إدخال البيانات يدوياً',
    icon: Upload
  }
];

export default function SelfLearningPage() {
  const [companyId] = useState('company_001'); // يمكن أخذها من المستخدم الحالي
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [uploadData, setUploadData] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const queryClient = useQueryClient();

  // جلب إحصائيات التعلم
  const { data: learningStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/learning/stats', companyId],
    queryFn: () => apiRequest(`/api/learning/stats/${companyId}`),
    refetchInterval: 30000 // تحديث كل 30 ثانية
  });

  // جلب نموذج التعلم
  const { data: learningModel } = useQuery({
    queryKey: ['/api/learning/model', companyId],
    queryFn: () => apiRequest(`/api/learning/model/${companyId}`)
  });

  // ربط مصدر البيانات
  const connectDataMutation = useMutation({
    mutationFn: (data: { companyId: string; dataSource: string; data: any[] }) =>
      apiRequest('/api/learning/connect-data', { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: (result) => {
      setConnectionStatus('connected');
      queryClient.invalidateQueries({ queryKey: ['/api/learning/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/model'] });
    },
    onError: () => {
      setConnectionStatus('error');
    }
  });

  // تطبيق التعلم على رسالة تجريبية
  const testLearningMutation = useMutation({
    mutationFn: (data: { companyId: string; message: string; context?: any }) =>
      apiRequest('/api/learning/apply', { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
  });

  // إعادة تدريب النموذج
  const retrainMutation = useMutation({
    mutationFn: (data: { companyId: string; newData: any[] }) =>
      apiRequest('/api/learning/retrain', { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/model'] });
    }
  });

  const handleConnectDataSource = () => {
    if (!selectedDataSource || !uploadData.trim()) return;

    setConnectionStatus('connecting');
    
    try {
      // تحويل البيانات النصية إلى JSON
      const parsedData = uploadData.split('\n').filter(line => line.trim()).map((line, index) => ({
        id: index + 1,
        content: line.trim(),
        timestamp: new Date().toISOString(),
        source: selectedDataSource
      }));

      connectDataMutation.mutate({
        companyId,
        dataSource: selectedDataSource,
        data: parsedData
      });
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleTestLearning = () => {
    if (!testMessage.trim()) return;

    testLearningMutation.mutate({
      companyId,
      message: testMessage,
      context: { source: 'test_interface' }
    });
  };

  const stats = learningStats?.stats;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-400" />
              نظام التعلم الذاتي
            </h1>
            <p className="text-gray-400 mt-2">
              محرك التعلم الذكي المخصص لكل عميل - تحليل البيانات وتحسين الأداء تلقائياً
            </p>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400">
            نشط
          </Badge>
        </div>

        {/* إحصائيات سريعة */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي الأنماط</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.totalPatterns}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">التفاعلات المتعلمة</p>
                    <p className="text-2xl font-bold text-green-400">{stats.totalInteractions}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">دقة التعلم</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.learningAccuracy.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">حالة النظام</p>
                    <p className="text-lg font-bold text-green-400">يتعلم</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="connect">ربط البيانات</TabsTrigger>
            <TabsTrigger value="patterns">الأنماط المتعلمة</TabsTrigger>
            <TabsTrigger value="test">اختبار التعلم</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* تبويب ربط البيانات */}
          <TabsContent value="connect" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  ربط مصدر بيانات جديد
                </CardTitle>
                <CardDescription>
                  اختر مصدر البيانات الذي تريد ربطه لبدء عملية التعلم الذاتي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* اختيار مصدر البيانات */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {dataSources.map((source) => {
                    const Icon = source.icon;
                    return (
                      <Card 
                        key={source.type}
                        className={`cursor-pointer transition-all ${
                          selectedDataSource === source.type 
                            ? 'bg-blue-900 border-blue-400' 
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedDataSource(source.type)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                          <h4 className="font-medium text-sm">{source.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{source.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedDataSource && (
                  <div className="space-y-4 mt-6">
                    <Label htmlFor="data-input">
                      بيانات {dataSources.find(s => s.type === selectedDataSource)?.name}
                    </Label>
                    <Textarea
                      id="data-input"
                      placeholder="أدخل البيانات هنا - سطر واحد لكل سجل..."
                      value={uploadData}
                      onChange={(e) => setUploadData(e.target.value)}
                      rows={8}
                      className="bg-gray-700 border-gray-600"
                    />
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={handleConnectDataSource}
                        disabled={!selectedDataSource || !uploadData.trim() || connectionStatus === 'connecting'}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {connectionStatus === 'connecting' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            جاري الربط...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4 mr-2" />
                            ربط البيانات
                          </>
                        )}
                      </Button>

                      {connectionStatus === 'connected' && (
                        <Alert className="flex-1 bg-green-900 border-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-400">
                            تم ربط البيانات بنجاح وبدء عملية التعلم التلقائي
                          </AlertDescription>
                        </Alert>
                      )}

                      {connectionStatus === 'error' && (
                        <Alert className="flex-1 bg-red-900 border-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-400">
                            فشل في ربط البيانات. يرجى المحاولة مرة أخرى
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأنماط المتعلمة */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  الأنماط المكتشفة
                </CardTitle>
                <CardDescription>
                  أهم الأنماط التي اكتشفها النظام من بياناتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topPatterns && stats.topPatterns.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topPatterns.map((pattern, index) => (
                      <div key={pattern.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">#{index + 1} - {pattern.pattern}</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {(pattern.confidence * 100).toFixed(0)}% ثقة
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          التكرار: {pattern.frequency} مرة | السياق: {pattern.context}
                        </div>
                        <Progress value={pattern.confidence * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    لا توجد أنماط مكتشفة حتى الآن. قم بربط مصدر بيانات أولاً.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* التحسينات الأخيرة */}
            {stats?.recentImprovements && stats.recentImprovements.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    التحسينات الأخيرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.recentImprovements.map((improvement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* تبويب اختبار التعلم */}
          <TabsContent value="test" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  اختبار النظام المتعلم
                </CardTitle>
                <CardDescription>
                  جرب كيف يرد النظام على رسائل مختلفة بناءً على ما تعلمه
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-message">رسالة تجريبية</Label>
                  <Textarea
                    id="test-message"
                    placeholder="اكتب رسالة لاختبار كيف سيرد النظام..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <Button 
                  onClick={handleTestLearning}
                  disabled={!testMessage.trim() || testLearningMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {testLearningMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري الاختبار...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      اختبار الرد
                    </>
                  )}
                </Button>

                {/* نتيجة الاختبار */}
                {testLearningMutation.data && (
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-lg">رد النظام المتعلم</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-900 rounded">
                          <strong>الرد:</strong> {testLearningMutation.data.result.response}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>مستوى الثقة: {(testLearningMutation.data.result.confidence * 100).toFixed(0)}%</span>
                          <span>متعلم من: {testLearningMutation.data.result.learnedFrom}</span>
                        </div>
                        {testLearningMutation.data.result.suggestions?.length > 0 && (
                          <div>
                            <strong className="text-sm">اقتراحات:</strong>
                            <ul className="mt-1 text-sm text-gray-400">
                              {testLearningMutation.data.result.suggestions.map((suggestion, index) => (
                                <li key={index} className="ml-4">• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التحليلات */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* مخطط الأداء */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    أداء التعلم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>دقة التنبؤ</span>
                        <span className="text-blue-400 font-bold">{stats.learningAccuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.learningAccuracy} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span>عدد الأنماط</span>
                        <span className="text-green-400 font-bold">{stats.totalPatterns}</span>
                      </div>
                      <Progress value={(stats.totalPatterns / 100) * 100} className="h-3" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* أدوات إدارة النموذج */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إدارة النموذج
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => retrainMutation.mutate({ companyId, newData: [] })}
                    disabled={retrainMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {retrainMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        جاري إعادة التدريب...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        إعادة تدريب النموذج
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    تصدير النموذج المتعلم
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    استيراد نموذج محفوظ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}