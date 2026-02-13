import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  Headphones
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdvancedVoiceTest() {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testNumber, setTestNumber] = useState('+966566100095');
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testAdvancedVoice = async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/api/twilio/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: testNumber, 
          message: 'اختبار النظام الصوتي المتقدم مع Media Streams' 
        })
      });
      
      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "تم إرسال الاختبار",
          description: `معرف المكالمة: ${result.callId}`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "فشل الاختبار",
        description: "تأكد من الرقم وحالة الخدمة",
        variant: "destructive"
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const features = [
    {
      icon: <Mic className="w-5 h-5" />,
      title: "تحويل الكلام إلى نص",
      description: "Whisper API للتعرف على الكلام العربي",
      status: "working"
    },
    {
      icon: <Volume2 className="w-5 h-5" />,
      title: "تحويل النص إلى كلام",
      description: "ElevenLabs + Polly للصوت الطبيعي",
      status: "working"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "تدفق الصوت المباشر",
      description: "Twilio Media Streams للمحادثة الفورية",
      status: "working"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "ذكاء اصطناعي متقدم",
      description: "GPT-4o لفهم السياق والردود الذكية",
      status: "working"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            نظام المحادثة الصوتية المتقدم
          </h1>
          <p className="text-slate-400">
            اختبار النظام الجديد مع Twilio Media Streams والذكاء الاصطناعي
          </p>
        </div>

        {/* Test Interface */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Phone className="w-6 h-6 mr-3 text-blue-400" />
              اختبار المكالمة المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4 space-x-reverse">
              <Input
                type="tel"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="رقم الهاتف للاختبار"
                className="bg-slate-700/50 border-slate-600/50 text-white"
                dir="ltr"
              />
              <Button
                onClick={testAdvancedVoice}
                disabled={isTestLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isTestLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                اختبار النظام
              </Button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      تم إرسال المكالمة بنجاح
                    </div>
                    <div className="text-sm text-slate-300">
                      معرف المكالمة: {testResult.callId}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    خطأ: {testResult.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="text-blue-400 mt-1">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{feature.title}</h3>
                      <Badge className={getStatusColor(feature.status)}>
                        نشط
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flow Description */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">تدفق المحادثة المتقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div className="text-white">
                  <strong>التحية الأولى:</strong> "مرحباً، معك سيادة AI، كيف أقدر أخدمك اليوم؟"
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div className="text-white">
                  <strong>استماع مستمر:</strong> تدفق صوتي مباشر عبر WebSockets
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div className="text-white">
                  <strong>تحويل ومعالجة:</strong> Whisper API → GPT-4o → ElevenLabs/Polly
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div className="text-white">
                  <strong>رد تفاعلي:</strong> محادثة ذهاباً وإياباً حتى الانتهاء
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                <div className="text-white">
                  <strong>إنهاء ذكي:</strong> "شكراً لتواصلك مع سيادة AI، يومك سعيد."
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}