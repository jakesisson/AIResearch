import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Volume2,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ElevenLabsSetup() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState({});
  const { toast } = useToast();

  const testElevenLabs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-elevenlabs');
      const result = await response.json();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "نجح الاختبار",
          description: "تم توليد الصوت الاحترافي بنجاح"
        });
      } else {
        toast({
          title: "فشل الاختبار",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: "خطأ في الاتصال بالخادم",
        status: "network_error"
      });
      toast({
        title: "خطأ في الشبكة",
        description: "تأكد من اتصال الإنترنت",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/elevenlabs-voices');
      const result = await response.json();
      if (result.success) {
        setVoices(result.voices);
      }
    } catch (error) {
      console.error('خطأ في تحميل الأصوات:', error);
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  const playTestAudio = () => {
    if (testResult?.audioUrl) {
      const audio = new Audio(testResult.audioUrl);
      audio.play().catch(error => {
        toast({
          title: "خطأ في تشغيل الصوت",
          description: "تأكد من إعدادات المتصفح",
          variant: "destructive"
        });
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'working': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'missing_key': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'generation_failed': 
      case 'api_error': 
      case 'network_error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'working': return <CheckCircle2 className="w-5 h-5" />;
      case 'missing_key': return <AlertTriangle className="w-5 h-5" />;
      case 'generation_failed': 
      case 'api_error': 
      case 'network_error': return <XCircle className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">إعداد ElevenLabs</h1>
        <p className="text-slate-400">تحسين جودة الصوت في المكالمات الآلية</p>
      </div>

      {/* API Status */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mic className="w-5 h-5 mr-3 text-blue-400" />
            حالة API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Button
                onClick={testElevenLabs}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                اختبار الآن
              </Button>
              
              {testResult && (
                <Badge className={getStatusColor(testResult.status)}>
                  {getStatusIcon(testResult.status)}
                  <span className="mr-2">
                    {testResult.status === 'working' ? 'يعمل' : 
                     testResult.status === 'missing_key' ? 'مفتاح مفقود' : 
                     'خطأ'}
                  </span>
                </Badge>
              )}
            </div>
            
            {testResult?.audioUrl && (
              <Button
                onClick={playTestAudio}
                size="sm"
                variant="outline"
                className="bg-green-500/20 border-green-500/30 text-green-300"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                تشغيل العينة
              </Button>
            )}
          </div>

          {testResult && (
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="text-sm">
                <div className="text-white font-medium mb-2">
                  {testResult.success ? '✅ نجح الاختبار' : '❌ فشل الاختبار'}
                </div>
                
                {testResult.success ? (
                  <div className="space-y-1 text-slate-300">
                    <div>الصوت المستخدم: {testResult.voiceUsed}</div>
                    <div>النص: "{testResult.text}"</div>
                    <div className="text-green-400">✓ {testResult.message}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-red-300">الخطأ: {testResult.error}</div>
                    {testResult.details && (
                      <div className="text-slate-400">{testResult.details}</div>
                    )}
                    {testResult.instruction && (
                      <div className="text-yellow-300">📝 {testResult.instruction}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Voices */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">الأصوات المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(voices).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(voices).map(([name, id]) => (
                <div key={name} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{name}</div>
                      <div className="text-xs text-slate-400 font-mono">{id}</div>
                    </div>
                    {name === 'sarah_professional' && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        مُوصى به
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mic className="w-8 h-8 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">لم يتم تحميل الأصوات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">تعليمات الإعداد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-300 mb-2">1. إضافة API Key:</h4>
              <ul className="space-y-1 text-sm text-blue-200">
                <li>• اذهب إلى إعدادات Secrets في Replit</li>
                <li>• أضف المفتاح: ELEVENLABS_API_KEY</li>
                <li>• القيمة: sk_0dd4ae739ab18383a25042fd92e76115289c59ddd0ae11cb</li>
                <li>• احفظ وأعد تشغيل النظام</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-medium text-green-300 mb-2">2. الفوائد:</h4>
              <ul className="space-y-1 text-sm text-green-200">
                <li>• صوت طبيعي 100% بالعربية</li>
                <li>• وضوح ممتاز في المكالمات</li>
                <li>• نبرة احترافية للأعمال</li>
                <li>• تحسين تجربة العملاء</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}