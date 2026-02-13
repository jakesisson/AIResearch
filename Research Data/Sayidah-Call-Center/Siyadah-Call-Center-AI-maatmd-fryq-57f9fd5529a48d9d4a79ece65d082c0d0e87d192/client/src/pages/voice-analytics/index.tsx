import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Phone, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Users,
  BarChart3,
  PlayCircle,
  StopCircle,
  RefreshCw
} from 'lucide-react';

interface CallSession {
  callSid: string;
  conversationHistory: Array<{
    timestamp: string;
    speaker: 'caller' | 'ai';
    text: string;
    intent?: string;
  }>;
  currentStep: string;
  customerInfo: {
    phone: string;
    intent: string;
    sentiment: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  totalCalls: number;
  intents: Record<string, number>;
  sentiments: Record<string, number>;
  avgConversationLength: number;
  recentCalls: CallSession[];
}

export default function VoiceAnalytics() {
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/webhook/voice/analytics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const testVoiceResponse = async () => {
    if (!testMessage.trim()) return;
    
    setIsTestLoading(true);
    try {
      const response = await fetch('/webhook/voice/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ success: false, error: 'خطأ في الاختبار' });
    } finally {
      setIsTestLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ar-SA');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'إيجابي': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'سلبي': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">جاري تحميل تحليلات المكالمات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">تحليلات المكالمات الصوتية</h1>
          <p className="text-slate-400">نظام Twilio Voice + OpenAI + ElevenLabs</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="bg-slate-800/50 border-slate-600/50">
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">إجمالي المكالمات</CardTitle>
              <Phone className="w-5 h-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{analytics?.totalCalls || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">متوسط طول المحادثة</CardTitle>
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {analytics?.avgConversationLength?.toFixed(1) || 0}
            </div>
            <p className="text-sm text-slate-400">رسالة لكل مكالمة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">النوايا المكتشفة</CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {Object.keys(analytics?.intents || {}).length}
            </div>
            <p className="text-sm text-slate-400">نوع مختلف</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">المشاعر الإيجابية</CardTitle>
              <Users className="w-5 h-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {Math.round(((analytics?.sentiments?.['إيجابي'] || 0) / (analytics?.totalCalls || 1)) * 100)}%
            </div>
            <p className="text-sm text-slate-400">من المكالمات</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Interface */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <PlayCircle className="w-5 h-5 mr-3 text-green-400" />
            اختبار نظام الصوت الذكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3 space-x-reverse">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="اكتب رسالة لاختبار رد المساعد الذكي..."
              className="flex-1 bg-slate-700/50 border-slate-600/50 text-white"
              onKeyPress={(e) => e.key === 'Enter' && testVoiceResponse()}
            />
            <Button 
              onClick={testVoiceResponse}
              disabled={isTestLoading || !testMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isTestLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              اختبار
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">نتيجة الاختبار:</h4>
              {testResult.success ? (
                <div className="space-y-2">
                  <p className="text-slate-300">
                    <strong>الرسالة الأصلية:</strong> {testResult.originalMessage}
                  </p>
                  <p className="text-slate-300">
                    <strong>رد المساعد:</strong> {testResult.aiResponse.response}
                  </p>
                  <div className="flex space-x-2 space-x-reverse">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      النية: {testResult.aiResponse.intent}
                    </Badge>
                    <Badge className={getSentimentColor(testResult.aiResponse.sentiment)}>
                      المشاعر: {testResult.aiResponse.sentiment}
                    </Badge>
                  </div>
                  {testResult.voiceUrl && (
                    <div className="mt-2">
                      <audio controls className="w-full">
                        <source src={testResult.voiceUrl} type="audio/mpeg" />
                        متصفحك لا يدعم تشغيل الصوت
                      </audio>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-400">خطأ: {testResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-3 text-blue-400" />
            المكالمات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.recentCalls?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">لا توجد مكالمات بعد</p>
          ) : (
            <div className="space-y-4">
              {analytics?.recentCalls?.map((call, index) => (
                <div key={call.callSid} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{call.customerInfo.phone}</span>
                      <Badge className={getSentimentColor(call.customerInfo.sentiment)}>
                        {call.customerInfo.sentiment}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-400">{formatTime(call.createdAt)}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-slate-400">النية المكتشفة: </span>
                    <span className="text-blue-400">{call.customerInfo.intent}</span>
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    عدد الرسائل: {call.conversationHistory?.length || 0}
                  </div>
                  
                  {call.conversationHistory && call.conversationHistory.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-600/30 rounded text-sm">
                      <span className="text-slate-400">آخر رسالة: </span>
                      <span className="text-slate-300">
                        {call.conversationHistory[call.conversationHistory.length - 1]?.text?.substring(0, 100)}
                        {call.conversationHistory[call.conversationHistory.length - 1]?.text?.length > 100 && '...'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intent Analysis */}
      {analytics && Object.keys(analytics.intents).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-3 text-green-400" />
                توزيع النوايا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.intents).map(([intent, count]) => (
                  <div key={intent} className="flex items-center justify-between">
                    <span className="text-slate-300">{intent}</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${(count / analytics.totalCalls) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-3 text-purple-400" />
                توزيع المشاعر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.sentiments).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <span className="text-slate-300">{sentiment}</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: `${(count / analytics.totalCalls) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}