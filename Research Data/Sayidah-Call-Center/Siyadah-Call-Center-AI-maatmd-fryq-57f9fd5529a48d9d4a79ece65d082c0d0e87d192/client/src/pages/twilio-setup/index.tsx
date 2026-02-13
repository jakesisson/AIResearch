import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Settings, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TwilioSetup() {
  const { toast } = useToast();
  const webhookUrl = `${window.location.origin}/webhook/voice`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الرابط إلى الحافظة"
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إعداد Twilio Voice</h1>
          <p className="text-slate-400">ربط رقمك الأمريكي مع نظام المكالمات الذكي</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Webhook جاهز
        </Badge>
      </div>

      {/* Webhook URL Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-3 text-blue-400" />
            Webhook URL للمكالمات الصوتية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3 space-x-reverse">
            <Input
              value={webhookUrl}
              readOnly
              className="flex-1 bg-slate-700/50 border-slate-600/50 text-white font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(webhookUrl)}
              variant="outline"
              className="bg-slate-700/50 border-slate-600/50"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2 space-x-reverse">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                انسخ هذا الرابط واستخدمه في إعدادات Voice الخاصة برقمك في Twilio Console
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step by Step Guide */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-3 text-green-400" />
            خطوات الإعداد في Twilio Console
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "اذهب إلى Twilio Console",
                description: "سجل دخول إلى حسابك في console.twilio.com",
                action: "فتح Twilio Console",
                url: "https://console.twilio.com"
              },
              {
                step: 2,
                title: "اختر رقمك الأمريكي",
                description: "من Phone Numbers → Manage → Active numbers",
                action: "إدارة الأرقام"
              },
              {
                step: 3,
                title: "إعداد Voice Webhook",
                description: "في قسم Voice Configuration اضبط الإعدادات التالية:",
                details: [
                  `Webhook URL: ${webhookUrl}`,
                  "HTTP Method: POST",
                  "Primary Handler: Webhook URL"
                ]
              },
              {
                step: 4,
                title: "احفظ التكوين",
                description: "اضغط Save Configuration واختبر المكالمة",
                action: "حفظ الإعدادات"
              }
            ].map((item, index) => (
              <div key={index} className="flex space-x-4 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                  
                  {item.details && (
                    <div className="bg-slate-700/30 rounded p-3 mb-2">
                      {item.details.map((detail, i) => (
                        <div key={i} className="text-xs text-slate-300 font-mono mb-1">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {item.url && (
                    <Button
                      onClick={() => window.open(item.url, '_blank')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {item.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Configuration */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">مثال على التكوين الصحيح</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-700/30 rounded-lg p-4 font-mono text-sm">
            <div className="space-y-2 text-slate-300">
              <div><span className="text-blue-400">Voice URL:</span> {webhookUrl}</div>
              <div><span className="text-blue-400">HTTP Method:</span> POST</div>
              <div><span className="text-blue-400">Fallback URL:</span> (اختياري)</div>
              <div><span className="text-blue-400">Status Callback:</span> (اختياري)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />
            اختبار النظام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">للاختبار:</h4>
            <ol className="space-y-1 text-sm text-green-300">
              <li>1. اتصل على رقمك الأمريكي من أي هاتف</li>
              <li>2. ستسمع ترحيب بالعربية من المساعد الذكي</li>
              <li>3. تكلم بالعربية وستحصل على رد ذكي</li>
              <li>4. النظام سيحلل كلامك ويرد بشكل مناسب</li>
            </ol>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">أمثلة المحادثات:</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <div><span className="text-blue-400">أنت:</span> "أريد أشتري منتجكم"</div>
              <div><span className="text-green-400">المساعد:</span> "ممتاز! أقدر أحولك على قسم المبيعات"</div>
              <div><span className="text-blue-400">أنت:</span> "أبغى أحجز اجتماع"</div>
              <div><span className="text-green-400">المساعد:</span> "أكيد، إيش الوقت المناسب لك؟"</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">حالة النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">Webhook API</div>
              <div className="text-xs text-green-400">نشط</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">OpenAI GPT-4</div>
              <div className="text-xs text-green-400">متصل</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">ElevenLabs TTS</div>
              <div className="text-xs text-orange-400">اختياري</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}