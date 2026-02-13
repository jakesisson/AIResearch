import React, { useState, useEffect, useRef } from 'react';
import { ModernLayout } from '@/components/modern-ui/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Download, 
  Mic, 
  Phone,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  model: string;
}

interface TestResult {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  settings: VoiceSettings;
  audioUrl: string;
  timestamp: string;
  size: number;
}

interface CallSession {
  callSid: string;
  from: string;
  to: string;
  status: string;
  language: string;
  duration: number;
  speechResults: Array<{
    text: string;
    confidence: number;
    timestamp: string;
  }>;
  aiResponses: Array<{
    text: string;
    timestamp: string;
    language: string;
  }>;
  quality: string;
}

export default function EnhancedVoiceInterface() {
  const [testText, setTestText] = useState('مرحباً، هذا اختبار للصوت الذكي من منصة الأتمتة');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0.5,
    model: 'eleven_turbo_v2'
  });
  const [voices, setVoices] = useState([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] });
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
    loadCacheStats();
    loadCallSessions();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/enhanced-elevenlabs/voices-detailed');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
        if (data.voices.length > 0 && !selectedVoice) {
          setSelectedVoice(data.voices[0].voice_id);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الأصوات:', error);
    }
  };

  const loadCacheStats = async () => {
    try {
      const response = await fetch('/api/enhanced-elevenlabs/cache-stats');
      const data = await response.json();
      if (data.success) {
        setCacheStats(data.cache);
      }
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات التخزين المؤقت:', error);
    }
  };

  const loadCallSessions = async () => {
    // Simulate loading call sessions - replace with actual API call
    const mockSessions: CallSession[] = [
      {
        callSid: 'CA123456789',
        from: '+966501234567',
        to: '+17753209700',
        status: 'completed',
        language: 'ar-SA',
        duration: 180,
        speechResults: [
          { text: 'مرحباً، أريد معلومات عن خدماتكم', confidence: 0.95, timestamp: '2025-06-22T15:30:00Z' },
          { text: 'نعم، أريد التحدث مع قسم المبيعات', confidence: 0.88, timestamp: '2025-06-22T15:30:30Z' }
        ],
        aiResponses: [
          { text: 'مرحباً بك، سعيد لمساعدتك اليوم', timestamp: '2025-06-22T15:30:05Z', language: 'ar-SA' },
          { text: 'سأقوم بتحويلك إلى قسم المبيعات', timestamp: '2025-06-22T15:30:35Z', language: 'ar-SA' }
        ],
        quality: 'high'
      }
    ];
    setCallSessions(mockSessions);
  };

  const testVoice = async () => {
    if (!testText.trim() || !selectedVoice) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال النص واختيار الصوت",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/enhanced-elevenlabs/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voiceId: selectedVoice,
          ...voiceSettings
        })
      });

      const data = await response.json();
      if (data.success) {
        const selectedVoiceData = voices.find((v: any) => v.voice_id === selectedVoice);
        const newResult: TestResult = {
          id: Date.now().toString(),
          text: testText,
          voiceId: selectedVoice,
          voiceName: selectedVoiceData?.name || 'Unknown',
          settings: voiceSettings,
          audioUrl: data.audioUrl,
          timestamp: new Date().toISOString(),
          size: data.size
        };

        setTestResults(prev => [newResult, ...prev]);
        loadCacheStats();

        toast({
          title: "نجح",
          description: "تم إنشاء الصوت بنجاح"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الصوت",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = async (audioUrl: string, id: string) => {
    if (isPlaying === id) {
      audioRef.current?.pause();
      setIsPlaying(null);
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(id);
        
        audioRef.current.onended = () => {
          setIsPlaying(null);
        };
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تشغيل الصوت",
        variant: "destructive"
      });
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/enhanced-elevenlabs/clear-cache', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        loadCacheStats();
        toast({
          title: "نجح",
          description: "تم مسح ذاكرة التخزين المؤقت"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في مسح التخزين المؤقت",
        variant: "destructive"
      });
    }
  };

  return (
    <ModernLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">واجهة الصوت المتقدمة</h1>
            <p className="text-gray-400 mt-2">إدارة شاملة للأصوات الذكية والمكالمات</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              ElevenLabs متصل
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Cache: {cacheStats.size}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Testing Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  اختبار الأصوات المتقدم
                </CardTitle>
                <CardDescription>
                  اختبر وخصص إعدادات الصوت لتحصل على أفضل جودة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    النص التجريبي
                  </label>
                  <Input
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="أدخل النص المراد تحويله إلى صوت"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    اختيار الصوت
                  </label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="اختر الصوت" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {voices.map((voice: any) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name} ({voice.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      الاستقرار ({voiceSettings.stability})
                    </label>
                    <Slider
                      value={[voiceSettings.stability]}
                      onValueChange={([value]) => 
                        setVoiceSettings(prev => ({ ...prev, stability: value }))
                      }
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      التشابه ({voiceSettings.similarity_boost})
                    </label>
                    <Slider
                      value={[voiceSettings.similarity_boost]}
                      onValueChange={([value]) => 
                        setVoiceSettings(prev => ({ ...prev, similarity_boost: value }))
                      }
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    الأسلوب ({voiceSettings.style})
                  </label>
                  <Slider
                    value={[voiceSettings.style]}
                    onValueChange={([value]) => 
                      setVoiceSettings(prev => ({ ...prev, style: value }))
                    }
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={testVoice} 
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      اختبار الصوت
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cache Management */}
          <div>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إدارة التخزين المؤقت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">الملفات المحفوظة</span>
                  <Badge variant="secondary">{cacheStats.size}</Badge>
                </div>
                
                <Button 
                  onClick={clearCache}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  مسح التخزين المؤقت
                </Button>

                <Separator className="bg-gray-700" />

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">الملفات الحديثة</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {cacheStats.keys.map((key, index) => (
                        <div key={index} className="text-xs text-gray-500 truncate">
                          {key}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Results */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              نتائج الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div key={result.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{result.voiceName}</h4>
                        <p className="text-gray-400 text-sm truncate max-w-md">
                          {result.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{(result.size / 1024).toFixed(1)} KB</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => playAudio(result.audioUrl, result.id)}
                        >
                          {isPlaying === result.id ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(result.audioUrl, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(result.timestamp).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    لا توجد نتائج اختبار بعد
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Call Sessions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="w-5 h-5" />
              سجلات المكالمات المحسنة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {callSessions.map((session) => (
                  <div key={session.callSid} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">من: {session.from}</h4>
                        <p className="text-gray-400 text-sm">إلى: {session.to}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={session.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {session.status}
                        </Badge>
                        <Badge variant="outline">{session.quality}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium text-gray-300">المدخلات الصوتية:</h5>
                        {session.speechResults.map((speech, index) => (
                          <div key={index} className="text-sm text-gray-400 ml-4">
                            • {speech.text} (ثقة: {(speech.confidence * 100).toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-300">ردود الذكاء الاصطناعي:</h5>
                        {session.aiResponses.map((response, index) => (
                          <div key={index} className="text-sm text-gray-400 ml-4">
                            • {response.text}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-3 flex items-center gap-4">
                      <span>المدة: {session.duration}s</span>
                      <span>اللغة: {session.language}</span>
                      <span>Call ID: {session.callSid}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <audio ref={audioRef} className="hidden" />
      </div>
    </ModernLayout>
  );
}