import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mic, 
  Volume2, 
  Settings, 
  Activity,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

export default function VoiceSystemCard() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const voiceStats = {
    totalCalls: 47,
    successRate: 94,
    avgDuration: '2:30',
    activeNumber: '+17065744440'
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-800/20 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-emerald-300 flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="w-6 h-6 ml-2" />
            النظام الصوتي التفاعلي
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
            متصل
          </Badge>
        </CardTitle>
        <CardDescription className="text-emerald-200/70">
          نظام المكالمات الذكي مع GPT-4o والتفاعل الصوتي العربي
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-emerald-800/20 border border-emerald-600/30">
            <div className="text-2xl font-bold text-white">{voiceStats.totalCalls}</div>
            <div className="text-sm text-emerald-300">مكالمة</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-800/20 border border-emerald-600/30">
            <div className="text-2xl font-bold text-white">{voiceStats.successRate}%</div>
            <div className="text-sm text-emerald-300">نجاح</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-800/20 border border-emerald-600/30">
            <div className="text-2xl font-bold text-white">{voiceStats.avgDuration}</div>
            <div className="text-sm text-emerald-300">متوسط</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-800/20 border border-emerald-600/30">
            <div className="text-lg font-bold text-white">+1706</div>
            <div className="text-sm text-emerald-300">رقم نشط</div>
          </div>
        </div>

        {/* حالة النظام */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-white">Twilio Voice</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">فعال</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-white">OpenAI GPT-4o</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">متصل</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-white">التركيب الصوتي العربي</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">جاهز</Badge>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <Button 
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`flex-1 ${isVoiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isVoiceActive ? (
              <>
                <PauseCircle className="w-4 h-4 ml-2" />
                إيقاف النظام
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 ml-2" />
                تفعيل النظام
              </>
            )}
          </Button>
          
          <Button variant="outline" className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/20">
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </Button>
          
          <Button variant="outline" className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/20">
            <Activity className="w-4 h-4 ml-2" />
            السجلات
          </Button>
        </div>

        {/* رسالة حالة */}
        <div className="p-4 rounded-lg bg-blue-600/10 border border-blue-500/30">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="p-1 rounded-full bg-blue-500/20">
              <Mic className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">النظام جاهز للمكالمات</h4>
              <p className="text-sm text-blue-200">
                يمكن للعملاء الاتصال على {voiceStats.activeNumber} والتفاعل مع المساعد الذكي باللغة العربية
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}