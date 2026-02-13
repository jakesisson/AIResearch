import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Database,
  Lightbulb,
  Zap,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Cpu,
  Network,
  RefreshCw,
  Sparkles,
  Bot,
  Eye,
  Clock,
  ThumbsUp
} from 'lucide-react';

interface EnterpriseAnalytics {
  analytics: {
    activePatterns: number;
    learningVelocity: number;
    adaptationRate: number;
    predictionAccuracy: number;
    responseTime: number;
    userSatisfaction: number;
    anomaliesDetected: number;
    trendsIdentified: string[];
  };
  predictions: {
    customerBehavior: {
      likelyToConvert: number;
      churnRisk: number;
      lifetimeValue: number;
      preferredChannel: string;
      bestContactTime: string;
    };
    businessTrends: {
      demandForecast: number;
      seasonalPattern: string;
      growthRate: number;
      marketSentiment: string;
    };
    recommendations: Array<{
      action: string;
      priority: string;
      expectedImpact: string;
      confidence: number;
    }>;
  };
  patterns: Array<{
    id: string;
    pattern: string;
    frequency: number;
    confidence: number;
    category: string;
    priority: string;
    successRate: number;
    userFeedback: number;
  }>;
  dataSources: Array<{
    id: string;
    type: string;
    name: string;
    status: string;
    recordsProcessed: number;
  }>;
}

export default function EnterpriseAIDashboard() {
  const [analytics, setAnalytics] = useState<EnterpriseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAnalytics();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/enterprise-ai/analytics/demo_company_001');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWithEnterpriseAI = async () => {
    if (!testInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/enterprise-ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo_company_001',
          input: testInput,
          context: { source: 'enterprise_dashboard' }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(data.result);
        await loadAnalytics(); // Refresh analytics after processing
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const connectGoogleSheets = async () => {
    if (!googleSheetsId.trim()) return;
    
    setIsConnecting(true);
    try {
      const response = await fetch('/api/enterprise-ai/connect-google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo_company_001',
          spreadsheetId: googleSheetsId,
          credentials: null // Would be actual credentials in production
        })
      });
      
      if (response.ok) {
        setGoogleSheetsId('');
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Google Sheets connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWhatsAppBusiness = async () => {
    if (!whatsappToken.trim()) return;
    
    setIsConnecting(true);
    try {
      const response = await fetch('/api/enterprise-ai/connect-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo_company_001',
          accessToken: whatsappToken,
          businessId: 'demo_business_id'
        })
      });
      
      if (response.ok) {
        setWhatsappToken('');
        await loadAnalytics();
      }
    } catch (error) {
      console.error('WhatsApp connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  نظام الذكاء الاصطناعي المؤسسي
                </h1>
                <p className="text-gray-300">
                  لوحة تحكم متقدمة للتحليلات الذكية والتعلم التلقائي
                </p>
              </div>
            </div>
            
            <Button 
              onClick={loadAnalytics}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
          </div>
          
          {/* Real-time Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">الأنماط النشطة</p>
                    <p className="font-semibold text-purple-400">{analytics?.analytics.activePatterns || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">سرعة التعلم</p>
                    <p className="font-semibold text-yellow-400">
                      {Math.round((analytics?.analytics.learningVelocity || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">دقة التنبؤ</p>
                    <p className="font-semibold text-green-400">
                      {Math.round((analytics?.analytics.predictionAccuracy || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">زمن الاستجابة</p>
                    <p className="font-semibold text-blue-400">
                      {analytics?.analytics.responseTime || 0}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-slate-800/50 border-slate-700">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              التحليلات المتقدمة
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              التنبؤات الذكية
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-purple-600">
              الاختبار المتقدم
            </TabsTrigger>
            <TabsTrigger value="data-sources" className="data-[state=active]:bg-purple-600">
              مصادر البيانات
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              الأنماط المتعلمة
            </TabsTrigger>
          </TabsList>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مقاييس الأداء المتقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">سرعة التعلم</span>
                      <span className="text-sm text-white">
                        {Math.round((analytics?.analytics.learningVelocity || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analytics?.analytics.learningVelocity || 0) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">معدل التكيف</span>
                      <span className="text-sm text-white">
                        {Math.round((analytics?.analytics.adaptationRate || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analytics?.analytics.adaptationRate || 0) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">دقة التنبؤ</span>
                      <span className="text-sm text-white">
                        {Math.round((analytics?.analytics.predictionAccuracy || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(analytics?.analytics.predictionAccuracy || 0) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">رضا المستخدمين</span>
                      <span className="text-sm text-white">
                        {analytics?.analytics.userSatisfaction || 0}/5.0
                      </span>
                    </div>
                    <Progress value={((analytics?.analytics.userSatisfaction || 0) / 5) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Trends Analysis */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    الاتجاهات المحددة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.analytics.trendsIdentified?.map((trend, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                        <Eye className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Anomalies Detection */}
            {analytics?.analytics?.anomaliesDetected && analytics.analytics.anomaliesDetected > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                    الشذوذات المكتشفة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{analytics?.analytics?.anomaliesDetected || 0} شذوذ مكتشف</Badge>
                    <span className="text-gray-400 text-sm">تم تحديد أنماط غير عادية تتطلب المراجعة</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Behavior Predictions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    توقعات سلوك العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">احتمال التحويل</span>
                    <Badge variant="secondary">
                      {Math.round((analytics?.predictions.customerBehavior.likelyToConvert || 0) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">مخاطر الانقطاع</span>
                    <Badge variant="secondary">
                      {Math.round((analytics?.predictions.customerBehavior.churnRisk || 0) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">القيمة المدى الطويل</span>
                    <Badge variant="secondary">
                      {analytics?.predictions.customerBehavior.lifetimeValue?.toLocaleString() || 0} ريال
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">القناة المفضلة</span>
                    <Badge variant="secondary">
                      {analytics?.predictions.customerBehavior.preferredChannel || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">أفضل وقت للتواصل</span>
                    <Badge variant="secondary">
                      {analytics?.predictions.customerBehavior.bestContactTime || 'N/A'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Business Trends */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    اتجاهات الأعمال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">توقع الطلب</span>
                    <Badge variant="secondary">
                      +{Math.round(((analytics?.predictions.businessTrends.demandForecast || 1) - 1) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">النمط الموسمي</span>
                    <Badge variant="secondary">
                      {analytics?.predictions.businessTrends.seasonalPattern || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">معدل النمو</span>
                    <Badge variant="secondary">
                      {Math.round((analytics?.predictions.businessTrends.growthRate || 0) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">مزاج السوق</span>
                    <Badge variant="secondary">
                      {analytics?.predictions.businessTrends.marketSentiment || 'N/A'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  التوصيات الذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics?.predictions.recommendations?.map((recommendation, index) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{recommendation.action}</h4>
                        <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                          {recommendation.priority === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{recommendation.expectedImpact}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">الثقة:</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(recommendation.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  اختبار الذكاء الاصطناعي المؤسسي
                </CardTitle>
                <CardDescription className="text-gray-400">
                  اختبر قدرات النظام المتقدمة في فهم ومعالجة الاستفسارات المعقدة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">الاستفسار للاختبار</label>
                  <Textarea
                    placeholder="اكتب استفسار معقد لاختبار النظام... مثل: أريد نظام CRM متكامل مع WhatsApp وتحليلات متقدمة للعملاء"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    rows={4}
                  />
                </div>
                
                <Button 
                  onClick={processWithEnterpriseAI}
                  disabled={!testInput.trim() || isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? 'جاري المعالجة المتقدمة...' : 'معالجة بالذكاء الاصطناعي المؤسسي'}
                </Button>

                {testResult && (
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <h4 className="text-white font-medium mb-4">نتائج المعالجة المتقدمة</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-400 text-sm">الرد الذكي:</span>
                        <p className="text-gray-200 mt-1 p-3 bg-slate-600/50 rounded">
                          {testResult.response}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">الثقة:</span>
                          <p className="text-white font-medium">{testResult.confidence}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">المشاعر:</span>
                          <p className="text-white font-medium">{testResult.sentiment}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">العاطفة:</span>
                          <p className="text-white font-medium">{testResult.emotion}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">التنبؤات:</span>
                          <p className="text-white font-medium">متاحة</p>
                        </div>
                      </div>

                      {testResult.recommendations && (
                        <div>
                          <span className="text-gray-400 text-sm">التوصيات الذكية:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {testResult.recommendations.map((rec: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {testResult.learningInsights && (
                        <div>
                          <span className="text-gray-400 text-sm">رؤى التعلم:</span>
                          <div className="mt-1 p-2 bg-slate-600/30 rounded text-xs">
                            <p className="text-gray-300">
                              نمط جديد: {testResult.learningInsights.newPatternDetected ? 'نعم' : 'لا'} | 
                              سرعة التعلم: {testResult.learningInsights.learningSpeed} | 
                              جودة الاستجابة: {Math.round((testResult.learningInsights.adaptationMetrics?.responseQuality || 0) * 100)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="data-sources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Sheets Integration */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-400" />
                    ربط Google Sheets
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    ربط جداول البيانات لتحليل معلومات العملاء
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">معرف الجدول</label>
                    <Input
                      placeholder="أدخل معرف Google Sheets..."
                      value={googleSheetsId}
                      onChange={(e) => setGoogleSheetsId(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={connectGoogleSheets}
                    disabled={!googleSheetsId.trim() || isConnecting}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    {isConnecting ? 'جاري الربط...' : 'ربط Google Sheets'}
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp Business Integration */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    ربط WhatsApp Business
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    ربط واتساب بزنس لتحليل المحادثات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">رمز الوصول</label>
                    <Input
                      placeholder="أدخل رمز وصول WhatsApp Business..."
                      value={whatsappToken}
                      onChange={(e) => setWhatsappToken(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      type="password"
                    />
                  </div>
                  <Button 
                    onClick={connectWhatsAppBusiness}
                    disabled={!whatsappToken.trim() || isConnecting}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isConnecting ? 'جاري الربط...' : 'ربط WhatsApp Business'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Connected Data Sources */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  مصادر البيانات المتصلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.dataSources?.map((source, index) => (
                    <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          source.status === 'active' ? 'bg-green-400' : 
                          source.status === 'syncing' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-white font-medium">{source.name}</p>
                          <p className="text-gray-400 text-sm">{source.type}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge variant="secondary">{source.recordsProcessed} سجل</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {source.status === 'active' ? 'نشط' : 
                           source.status === 'syncing' ? 'يتم المزامنة' : 'غير نشط'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  الأنماط المتعلمة المتقدمة
                </CardTitle>
                <CardDescription className="text-gray-400">
                  أهم الأنماط التي تعلمها النظام المؤسسي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.patterns?.map((pattern, index) => (
                    <div key={pattern.id} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{pattern.pattern}</h4>
                          <div className="flex items-center gap-4 text-xs">
                            <Badge variant={
                              pattern.priority === 'critical' ? 'destructive' : 
                              pattern.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {pattern.priority === 'critical' ? 'حرج' : 
                               pattern.priority === 'high' ? 'عالي' : 
                               pattern.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <span className="text-gray-500">التكرار: {pattern.frequency}</span>
                            <span className="text-gray-500">الثقة: {Math.round(pattern.confidence * 100)}%</span>
                            <span className="text-gray-500">النجاح: {pattern.successRate}%</span>
                            <span className="text-gray-500">التقييم: {pattern.userFeedback}/5.0</span>
                          </div>
                        </div>
                        <Badge variant="outline">{pattern.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}