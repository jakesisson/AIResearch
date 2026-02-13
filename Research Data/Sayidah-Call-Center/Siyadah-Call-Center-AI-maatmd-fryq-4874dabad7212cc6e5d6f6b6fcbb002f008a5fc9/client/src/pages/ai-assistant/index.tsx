
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { AppIcon } from '../../components/AppIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    actions?: Array<{
      type: string;
      description: string;
      count?: number;
    }>;
  };
}

interface InsightData {
  insights: string[];
  trends: string[];
  recommendations: string[];
  predictions: string[];
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // رسالة ترحيب
    const welcomeMessage: AIMessage = {
      id: '1',
      type: 'ai',
      content: 'مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في:\n\n• تحليل بيانات العملاء\n• إنشاء ردود تلقائية\n• تحليل المشاعر\n• إنشاء التقارير\n• أتمتة المهام\n\nكيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          context: {
            previousMessages: messages.slice(-5)
          }
        })
      });

      const data = await response.json();

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'عذراً، حدث خطأ في الاستجابة.',
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          actions: data.actions
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);

      let errorMessage = 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';

      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
        }
      }
      const errorMessageObj: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            totalCalls: Math.floor(Math.random() * 1000) + 500,
            totalEmails: Math.floor(Math.random() * 500) + 200,
            totalWhatsApp: Math.floor(Math.random() * 300) + 150,
            averageResponseTime: Math.floor(Math.random() * 10) + 5,
            satisfactionRating: Math.random() * 2 + 8,
            commonIssues: ['استفسارات تقنية', 'طلبات إرجاع', 'مشاكل التوصيل']
          }
        })
      });

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Insights Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSentimentAnalysis = async () => {
    if (!analysisText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: analysisText
        })
      });

      const data = await response.json();
      setSentimentResult(data);
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'ThumbsUp';
      case 'negative': return 'ThumbsDown';
      default: return 'Minus';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title="مساعد الذكاء الاصطناعي" subtitle="محادثة ذكية وتحليل متقدم للبيانات" />

      <main className="mr-72 pt-0">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 glass-light border border-white/10">
              <TabsTrigger value="chat" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                <AppIcon name="MessageSquare" className="w-4 h-4 ml-2" />
                المحادثة الذكية
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                <AppIcon name="TrendingUp" className="w-4 h-4 ml-2" />
                الإحصائيات والرؤى
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                <AppIcon name="Brain" className="w-4 h-4 ml-2" />
                تحليل المشاعر
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-accent data-[state=active]:text-background">
                <AppIcon name="FileText" className="w-4 h-4 ml-2" />
                التقارير الذكية
              </TabsTrigger>
            </TabsList>

            {/* المحادثة الذكية */}
            <TabsContent value="chat" className="space-y-6">
              <Card className="p-6 glass-light border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <AppIcon name="Bot" className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">المساعد الذكي</h3>
                      <p className="text-sm text-text-secondary">متصل ومستعد للمساعدة</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-accent border-accent/30">
                    <div className="w-2 h-2 bg-accent rounded-full ml-2 animate-pulse"></div>
                    نشط
                  </Badge>
                </div>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-accent text-background'
                            : 'bg-surface/50 text-text-primary border border-white/10'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.metadata?.actions && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-text-secondary mb-2">الإجراءات المقترحة:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.metadata.actions.map((action, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {action.description}
                                  {action.count && ` (${action.count})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-text-muted mt-2">
                          {message.timestamp.toLocaleTimeString('ar-SA')}
                          {message.metadata?.confidence && (
                            ` • ثقة: ${Math.round(message.metadata.confidence * 100)}%`
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-surface/50 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-text-secondary">المساعد يفكر...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 bg-surface border-white/10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim()}
                    className="bg-accent hover:bg-accent-600 text-background"
                  >
                    <AppIcon name="Send" className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* الإحصائيات والرؤى */}
            <TabsContent value="insights" className="space-y-6">
              <Card className="p-6 glass-light border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">تحليل البيانات والرؤى الذكية</h3>
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={loading}
                    className="bg-accent hover:bg-accent-600 text-background"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="ml-2" />
                    ) : (
                      <AppIcon name="RefreshCw" className="w-4 h-4 ml-2" />
                    )}
                    إنشاء التحليل
                  </Button>
                </div>

                {insights ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-3 flex items-center">
                        <AppIcon name="Eye" className="w-4 h-4 ml-2 text-accent" />
                        الرؤى المكتشفة
                      </h4>
                      <ul className="space-y-2">
                        {insights.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start">
                            <AppIcon name="ArrowLeft" className="w-3 h-3 mt-1 ml-2 text-accent flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-3 flex items-center">
                        <AppIcon name="TrendingUp" className="w-4 h-4 ml-2 text-green-500" />
                        الاتجاهات
                      </h4>
                      <ul className="space-y-2">
                        {insights.trends.map((trend, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start">
                            <AppIcon name="ArrowLeft" className="w-3 h-3 mt-1 ml-2 text-green-500 flex-shrink-0" />
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-3 flex items-center">
                        <AppIcon name="Lightbulb" className="w-4 h-4 ml-2 text-yellow-500" />
                        التوصيات
                      </h4>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start">
                            <AppIcon name="ArrowLeft" className="w-3 h-3 mt-1 ml-2 text-yellow-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-3 flex items-center">
                        <AppIcon name="Zap" className="w-4 h-4 ml-2 text-purple-500" />
                        التوقعات
                      </h4>
                      <ul className="space-y-2">
                        {insights.predictions.map((pred, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start">
                            <AppIcon name="ArrowLeft" className="w-3 h-3 mt-1 ml-2 text-purple-500 flex-shrink-0" />
                            {pred}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AppIcon name="BarChart3" className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">انقر على "إنشاء التحليل" للحصول على رؤى ذكية حول بياناتك</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* تحليل المشاعر */}
            <TabsContent value="sentiment" className="space-y-6">
              <Card className="p-6 glass-light border border-white/10">
                <h3 className="text-lg font-semibold text-text-primary mb-6">تحليل المشاعر المتقدم</h3>

                <div className="space-y-4 mb-6">
                  <Textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="أدخل النص المراد تحليله (رسالة عميل، تقييم، إلخ...)"
                    className="min-h-32 bg-surface border-white/10"
                  />

                  <Button
                    onClick={handleSentimentAnalysis}
                    disabled={loading || !analysisText.trim()}
                    className="bg-accent hover:bg-accent-600 text-background"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="ml-2" />
                    ) : (
                      <AppIcon name="Brain" className="w-4 h-4 ml-2" />
                    )}
                    تحليل المشاعر
                  </Button>
                </div>

                {sentimentResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-4">نتائج التحليل</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">المشاعر العامة:</span>
                          <div className="flex items-center space-x-2">
                            <AppIcon 
                              name={getSentimentIcon(sentimentResult.sentiment)} 
                              className={`w-4 h-4 ${getSentimentColor(sentimentResult.sentiment)}`}
                            />
                            <Badge 
                              variant="outline" 
                              className={`${getSentimentColor(sentimentResult.sentiment)} border-current`}
                            >
                              {sentimentResult.sentiment === 'positive' ? 'إيجابي' : 
                               sentimentResult.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">مستوى الثقة:</span>
                          <Badge variant="outline" className="text-accent border-accent/30">
                            {Math.round(sentimentResult.confidence * 100)}%
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary">مستوى الأولوية:</span>
                          <Badge 
                            variant="outline" 
                            className={`${
                              sentimentResult.urgency === 'urgent' ? 'text-red-500 border-red-500/30' :
                              sentimentResult.urgency === 'high' ? 'text-orange-500 border-orange-500/30' :
                              sentimentResult.urgency === 'medium' ? 'text-yellow-500 border-yellow-500/30' :
                              'text-green-500 border-green-500/30'
                            }`}
                          >
                            {sentimentResult.urgency === 'urgent' ? 'عاجل' :
                             sentimentResult.urgency === 'high' ? 'عالي' :
                             sentimentResult.urgency === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-surface/30 border border-white/5">
                      <h4 className="font-medium text-text-primary mb-4">التفاصيل</h4>

                      {sentimentResult.emotions && sentimentResult.emotions.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-text-secondary">المشاعر المكتشفة:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {sentimentResult.emotions.map((emotion: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {sentimentResult.keywords && (
                            <div>
                              <span className="text-sm text-text-secondary">الكلمات المفتاحية:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {sentimentResult.keywords.map((keyword: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* التقارير الذكية */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="p-6 glass-light border border-white/10">
                <div className="text-center py-12">
                  <AppIcon name="FileText" className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">التقارير الذكية</h3>
                  <p className="text-text-secondary mb-6">قريباً - سيتم إضافة إنشاء التقارير التلقائية والتحليل المتقدم</p>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <AppIcon name="Clock" className="w-4 h-4 ml-2" />
                    قيد التطوير
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}