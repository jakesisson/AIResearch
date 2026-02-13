import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Mail, Workflow, Loader2 } from 'lucide-react';


interface SentimentAnalysis {
  rating: number;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

interface OpportunityAnalysis {
  score: number;
  probability: number;
  recommendations: string[];
  nextActions: string[];
  urgency: 'low' | 'medium' | 'high';
}

export default function AIAnalytics() {
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysis | null>(null);
  const [opportunityData, setOpportunityData] = useState('');
  const [opportunityResult, setOpportunityResult] = useState<OpportunityAnalysis | null>(null);
  const [emailContext, setEmailContext] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleSentimentAnalysis = async () => {
    if (!sentimentText.trim()) return;
    
    setLoading(prev => ({ ...prev, sentiment: true }));
    try {
      const response = await fetch('/api/ai/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentimentText }),
      });
      const result: SentimentAnalysis = await response.json();
      setSentimentResult(result);
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(prev => ({ ...prev, sentiment: false }));
    }
  };

  const handleOpportunityAnalysis = async () => {
    if (!opportunityData.trim()) return;
    
    setLoading(prev => ({ ...prev, opportunity: true }));
    try {
      const data = JSON.parse(opportunityData);
      const response = await fetch('/api/ai/analyze-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setOpportunityResult(result);
    } catch (error) {
      console.error('Error analyzing opportunity:', error);
    } finally {
      setLoading(prev => ({ ...prev, opportunity: false }));
    }
  };

  const handleEmailGeneration = async () => {
    if (!emailContext.trim()) return;
    
    setLoading(prev => ({ ...prev, email: true }));
    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: emailContext }),
      });
      const result = await response.json();
      setEmailTemplate(result.template);
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'neutral': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">تحليلات الذكاء الاصطناعي</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">تحليل المشاعر</h3>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="أدخل النص لتحليل المشاعر..."
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
              className="min-h-24"
            />
            
            <Button 
              onClick={handleSentimentAnalysis}
              disabled={loading.sentiment || !sentimentText.trim()}
              className="w-full"
            >
              {loading.sentiment ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : null}
              تحليل المشاعر
            </Button>
            
            {sentimentResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${getSentimentColor(sentimentResult.sentiment)}`}>
                    {sentimentResult.sentiment === 'positive' ? 'إيجابي' : 
                     sentimentResult.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {sentimentResult.rating}/5 نجوم
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  الثقة: {Math.round(sentimentResult.confidence * 100)}%
                </div>
                {sentimentResult.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sentimentResult.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Opportunity Analysis */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">تحليل الفرص</h3>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder='أدخل بيانات الفرصة (JSON): {"name": "اسم الفرصة", "value": 50000, "stage": "المرحلة"}'
              value={opportunityData}
              onChange={(e) => setOpportunityData(e.target.value)}
              className="min-h-24"
            />
            
            <Button 
              onClick={handleOpportunityAnalysis}
              disabled={loading.opportunity || !opportunityData.trim()}
              className="w-full"
            >
              {loading.opportunity ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : null}
              تحليل الفرصة
            </Button>
            
            {opportunityResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">النتيجة: {opportunityResult.score}/100</span>
                  <Badge className={getUrgencyColor(opportunityResult.urgency)}>
                    {opportunityResult.urgency === 'high' ? 'عالي' : 
                     opportunityResult.urgency === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  احتمالية النجاح: {opportunityResult.probability}%
                </div>
                
                {opportunityResult.recommendations.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">التوصيات:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {opportunityResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {opportunityResult.nextActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">الخطوات التالية:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {opportunityResult.nextActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Email Generation */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">إنشاء قوالب البريد الإلكتروني</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Textarea
                placeholder="اكتب سياق البريد الإلكتروني (مثال: رد على استفسار عميل حول المنتج)"
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
                className="min-h-32"
              />
              
              <Button 
                onClick={handleEmailGeneration}
                disabled={loading.email || !emailContext.trim()}
                className="w-full"
              >
                {loading.email ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : null}
                إنشاء قالب البريد
              </Button>
            </div>
            
            {emailTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">القالب المُولَّد:</h4>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {emailTemplate}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}