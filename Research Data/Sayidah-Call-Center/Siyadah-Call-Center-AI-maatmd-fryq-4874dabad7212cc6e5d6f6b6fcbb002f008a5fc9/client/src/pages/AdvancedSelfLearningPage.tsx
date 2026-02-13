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
  Network
} from 'lucide-react';

interface LearningPattern {
  id: string;
  pattern: string;
  frequency: number;
  context: string;
  suggestedResponse: string;
  confidence: number;
  examples: string[];
  category: string;
  language: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
  successRate: number;
  userFeedback: number;
}

interface LearningStats {
  totalPatterns: number;
  totalInteractions: number;
  learningAccuracy: number;
  topPatterns: LearningPattern[];
  recentImprovements: string[];
  performanceMetrics: {
    responseAccuracy: number;
    patternRecognition: number;
    adaptationSpeed: number;
    userSatisfaction: number;
  };
  languageSupport: {
    arabic: number;
    english: number;
    multilingual: number;
  };
  businessInsights: {
    topCategories: Array<{name: string, percentage: number}>;
    trendAnalysis: Array<{trend: string, impact: string}>;
    recommendations: string[];
  };
}

export default function AdvancedSelfLearningPage() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [newDataSource, setNewDataSource] = useState('');
  const [connectingData, setConnectingData] = useState(false);

  useEffect(() => {
    loadLearningStats();
  }, []);

  const loadLearningStats = async () => {
    try {
      const response = await fetch('/api/learning/stats/demo_company_001');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLearningMessage = async () => {
    if (!testMessage.trim()) return;
    
    setIsTestingMessage(true);
    try {
      const response = await fetch('/api/learning/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo_company_001',
          message: testMessage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(data.result);
        await loadLearningStats(); // Refresh stats
      }
    } catch (error) {
      console.error('خطأ في اختبار الرسالة:', error);
    } finally {
      setIsTestingMessage(false);
    }
  };

  const connectDataSource = async () => {
    if (!newDataSource.trim()) return;
    
    setConnectingData(true);
    try {
      const response = await fetch('/api/learning/connect-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'demo_company_001',
          dataSource: 'manual',
          data: [{ message: newDataSource, timestamp: new Date() }]
        })
      });
      
      if (response.ok) {
        setNewDataSource('');
        await loadLearningStats();
      }
    } catch (error) {
      console.error('خطأ في ربط البيانات:', error);
    } finally {
      setConnectingData(false);
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                نظام التعلم الذاتي المتقدم
              </h1>
              <p className="text-gray-300">
                محرك تعلم ذكي بمعايير عالمية مع عزل كامل للبيانات
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">حالة النظام</p>
                    <p className="font-semibold text-green-400">نشط ومتصل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">المعايير</p>
                    <p className="font-semibold text-blue-400">عالمية</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">عزل البيانات</p>
                    <p className="font-semibold text-purple-400">مؤمن 100%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">التعلم</p>
                    <p className="font-semibold text-yellow-400">مستمر</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              الأنماط المتعلمة
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-purple-600">
              اختبار النظام
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              رؤى الأعمال
            </TabsTrigger>
            <TabsTrigger value="management" className="data-[state=active]:bg-purple-600">
              إدارة البيانات
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مقاييس الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.performanceMetrics && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">دقة الاستجابة</span>
                          <span className="text-sm text-white">{stats.performanceMetrics.responseAccuracy}%</span>
                        </div>
                        <Progress value={stats.performanceMetrics.responseAccuracy} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">التعرف على الأنماط</span>
                          <span className="text-sm text-white">{stats.performanceMetrics.patternRecognition}%</span>
                        </div>
                        <Progress value={stats.performanceMetrics.patternRecognition} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">سرعة التكيف</span>
                          <span className="text-sm text-white">{stats.performanceMetrics.adaptationSpeed}%</span>
                        </div>
                        <Progress value={stats.performanceMetrics.adaptationSpeed} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">رضا المستخدمين</span>
                          <span className="text-sm text-white">{stats.performanceMetrics.userSatisfaction}/5.0</span>
                        </div>
                        <Progress value={(stats.performanceMetrics.userSatisfaction / 5) * 100} className="h-2" />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Language Support */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    دعم اللغات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.languageSupport && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">العربية</span>
                          <span className="text-sm text-white">{stats.languageSupport.arabic}%</span>
                        </div>
                        <Progress value={stats.languageSupport.arabic} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">الإنجليزية</span>
                          <span className="text-sm text-white">{stats.languageSupport.english}%</span>
                        </div>
                        <Progress value={stats.languageSupport.english} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">متعدد اللغات</span>
                          <span className="text-sm text-white">{stats.languageSupport.multilingual}%</span>
                        </div>
                        <Progress value={stats.languageSupport.multilingual} className="h-2" />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Key Statistics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    إحصائيات رئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">إجمالي الأنماط</span>
                    <Badge variant="secondary">{stats?.totalPatterns || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">إجمالي التفاعلات</span>
                    <Badge variant="secondary">{stats?.totalInteractions || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">دقة التعلم</span>
                    <Badge variant="secondary">{stats?.learningAccuracy || 0}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Improvements */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  التحسينات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats?.recentImprovements?.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{improvement}</span>
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
                  الأنماط المتعلمة
                </CardTitle>
                <CardDescription className="text-gray-400">
                  أهم الأنماط التي تعلمها النظام من التفاعلات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPatterns?.map((pattern, index) => (
                    <div key={pattern.id} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{pattern.pattern}</h4>
                          <p className="text-gray-400 text-sm mb-2">{pattern.context}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <Badge variant={pattern.priority === 'high' ? 'destructive' : pattern.priority === 'medium' ? 'default' : 'secondary'}>
                              {pattern.priority === 'high' ? 'عالي' : pattern.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <span className="text-gray-500">التكرار: {pattern.frequency}</span>
                            <span className="text-gray-500">الثقة: {Math.round(pattern.confidence * 100)}%</span>
                            <span className="text-gray-500">النجاح: {pattern.successRate}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-300 text-sm mb-2">الرد المقترح:</p>
                        <p className="text-gray-200 text-sm bg-slate-600/50 p-2 rounded">
                          {pattern.suggestedResponse}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">أمثلة:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.examples?.slice(0, 3).map((example, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  اختبار النظام
                </CardTitle>
                <CardDescription className="text-gray-400">
                  اختبر قدرة النظام على فهم والرد على الرسائل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">رسالة الاختبار</label>
                  <Textarea
                    placeholder="اكتب رسالة لاختبار النظام... مثل: كم سعر نظام CRM؟"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={testLearningMessage}
                  disabled={!testMessage.trim() || isTestingMessage}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isTestingMessage ? 'جاري الاختبار...' : 'اختبار الرسالة'}
                </Button>

                {testResult && (
                  <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <h4 className="text-white font-medium mb-3">نتيجة الاختبار</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">الرد:</span>
                        <p className="text-gray-200 mt-1 p-2 bg-slate-600/50 rounded">
                          {testResult.response}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">الثقة:</span>
                          <p className="text-white font-medium">{testResult.confidence}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">الفئة:</span>
                          <p className="text-white font-medium">{testResult.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">المشاعر:</span>
                          <p className="text-white font-medium">{testResult.sentiment}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">المصدر:</span>
                          <p className="text-white font-medium">{testResult.learningSource}</p>
                        </div>
                      </div>

                      {testResult.suggestions && (
                        <div>
                          <span className="text-gray-400 text-sm">اقتراحات:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {testResult.suggestions.map((suggestion: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Categories */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    أهم الفئات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.businessInsights?.topCategories?.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{width: `${category.percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-xs w-8">{category.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    تحليل الاتجاهات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.businessInsights?.trendAnalysis?.map((trend, index) => (
                      <div key={index} className="p-3 rounded-lg bg-slate-700/50">
                        <p className="text-gray-200 text-sm mb-1">{trend.trend}</p>
                        <Badge variant={trend.impact === 'عالي' ? 'destructive' : 'secondary'} className="text-xs">
                          تأثير {trend.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  التوصيات الذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats?.businessInsights?.recommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  إدارة مصادر البيانات
                </CardTitle>
                <CardDescription className="text-gray-400">
                  ربط وإدارة مصادر البيانات لتحسين التعلم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">إضافة بيانات جديدة</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أدخل نص أو استفسار جديد للتعلم منه..."
                      value={newDataSource}
                      onChange={(e) => setNewDataSource(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white flex-1"
                    />
                    <Button 
                      onClick={connectDataSource}
                      disabled={!newDataSource.trim() || connectingData}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {connectingData ? 'جاري الربط...' : 'إضافة'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="h-5 w-5 text-green-400" />
                        <span className="text-white font-medium">WhatsApp</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">ربط مع رسائل WhatsApp</p>
                      <Badge variant="secondary">قريباً</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-medium">Google Sheets</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">ربط مع جداول البيانات</p>
                      <Badge variant="secondary">قريباً</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Network className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-medium">APIs</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">ربط مع APIs خارجية</p>
                      <Badge variant="secondary">قريباً</Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}