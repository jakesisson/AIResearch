import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VoiceSetup() {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const webhookUrl = `${window.location.origin}/webhook/voice`;
  const statusUrl = `${window.location.origin}/webhook/voice/status`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الرابط إلى الحافظة"
    });
  };

  const testWebhook = async () => {
    setIsTestLoading(true);
    try {
      const response = await fetch('/webhook/voice/interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'SpeechResult': 'اختبار النظام',
          'From': '+966500000000',
          'CallSid': 'WEBHOOK_TEST'
        })
      });
      
      const result = await response.text();
      setTestResult({ 
        success: result.includes('<?xml'), 
        response: result.substring(0, 200) + '...',
        type: result.includes('<?xml') ? 'TwiML' : 'HTML'
      });
      
      if (result.includes('<?xml')) {
        toast({
          title: "نجح الاختبار",
          description: "نظام المكالمات الصوتية يعمل بشكل صحيح"
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ success: false, error: 'خطأ في الاتصال' });
      toast({
        title: "فشل الاختبار",
        description: "تأكد من تشغيل الخادم",
        variant: "destructive"
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/webhook/voice/status');
      const status = await response.json();
      
      toast({
        title: "حالة النظام",
        description: `الحالة: ${status.status} - النسخة: ${status.version}`
      });
    } catch (error) {
      toast({
        title: "خطأ في الحالة",
        description: "لا يمكن الوصول لحالة النظام",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إعداد نظام المكالمات الصوتية</h1>
          <p className="text-slate-400">تكوين Twilio Voice + OpenAI + ElevenLabs</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button onClick={checkStatus} variant="outline" className="bg-slate-800/50 border-slate-600/50">
            <RefreshCw className="w-4 h-4 mr-2" />
            حالة النظام
          </Button>
          <Button onClick={testWebhook} disabled={isTestLoading} className="bg-gradient-to-r from-green-600 to-green-700">
            {isTestLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            اختبار النظام
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Webhook URL</CardTitle>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-400 mb-2">جاهز للاستخدام</div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              نشط
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">OpenAI GPT-4</CardTitle>
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-400 mb-2">متصل ومتاح</div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              متاح
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">ElevenLabs TTS</CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-400 mb-2">مفتاح API مطلوب</div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              اختياري
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Configuration */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-3 text-blue-400" />
            إعداد Twilio Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Webhook URL للمكالمات الصوتية
            </label>
            <div className="flex space-x-3 space-x-reverse">
              <Input
                value={webhookUrl}
                readOnly
                className="flex-1 bg-slate-700/50 border-slate-600/50 text-white"
              />
              <Button
                onClick={() => copyToClipboard(webhookUrl)}
                variant="outline"
                className="bg-slate-700/50 border-slate-600/50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              استخدم هذا الرابط في إعدادات Twilio Phone Number
            </p>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">خطوات إعداد Twilio:</h4>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                اذهب إلى Twilio Console وقم بشراء رقم هاتف
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                في إعدادات الرقم، اضبط Voice Webhook URL على: <code className="bg-slate-600/50 px-1 rounded">{webhookUrl}</code>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                اضبط HTTP Method على POST
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                احفظ الإعدادات واختبر المكالمة
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PlayCircle className="w-5 h-5 mr-3 text-green-400" />
              نتيجة الاختبار
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">نجح الاختبار</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-white">{testResult.response}</p>
                  <p className="text-sm text-green-300 mt-2">
                    الوقت: {new Date(testResult.timestamp).toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">فشل الاختبار</span>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-300">{testResult.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-3 text-purple-400" />
            ميزات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-white">الوظائف الأساسية:</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                  استقبال المكالمات الصوتية
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                  تحليل الكلام العربي
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                  ردود ذكية تفاعلية
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                  تحديد النوايا والمشاعر
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-white">الميزات المتقدمة:</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2" />
                  تكامل OpenAI GPT-4
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2" />
                  العامية السعودية الطبيعية
                </li>
                <li className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
                  صوت ElevenLabs عالي الجودة
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mr-2" />
                  حفظ سياق المحادثات
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}