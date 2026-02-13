import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';

export default function TwilioTest() {
  const [testType, setTestType] = useState<'whatsapp' | 'call' | 'sms'>('sms');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!phone || !message) {
      setResult({
        success: false,
        error: 'رقم الهاتف والرسالة مطلوبان'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/twilio/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: testType,
          to: phone,
          message: message
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'فشل في الاتصال بالخادم'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <Sidebar />
      
      <div className="fixed top-0 right-0 left-72 bg-gradient-to-l from-accent/20 to-primary/20 backdrop-blur-lg border-b border-white/10 z-40">
        <div className="p-6 text-right">
          <h1 className="text-2xl font-bold text-white mb-2">اختبار Twilio</h1>
          <p className="text-muted-foreground">اختبر خدمات الواتساب والمكالمات</p>
        </div>
      </div>
      
      <main className="mr-72 pt-24">
        <div className="p-6 space-y-6">
          <Card className="glass-effect border border-white/10">
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                {testType === 'whatsapp' ? <MessageSquare className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                اختبار تكامل Twilio
              </CardTitle>
              <CardDescription className="text-right text-muted-foreground">
                اختبر إرسال الرسائل النصية، الواتساب، أو إجراء المكالمات باستخدام Twilio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-type" className="text-right block">نوع الاختبار</Label>
                <Select value={testType} onValueChange={(value: 'whatsapp' | 'call' | 'sms') => setTestType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الاختبار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">رسالة نصية SMS</SelectItem>
                    <SelectItem value="whatsapp">رسالة واتساب</SelectItem>
                    <SelectItem value="call">مكالمة صوتية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+966501234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-right"
                  dir="ltr"
                />
                <p className="text-sm text-muted-foreground text-right">
                  أدخل الرقم بالصيغة الدولية (مثال: +966501234567)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-right block">الرسالة</Label>
                <Textarea
                  id="message"
                  placeholder={testType === 'sms' ? 'اكتب الرسالة النصية...' : testType === 'whatsapp' ? 'اكتب رسالة الواتساب...' : 'اكتب نص المكالمة...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-right min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleTest} 
                disabled={isLoading || !phone || !message}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    {testType === 'whatsapp' ? <MessageSquare className="mr-2 h-4 w-4" /> : <Phone className="mr-2 h-4 w-4" />}
                    {testType === 'whatsapp' ? 'إرسال رسالة واتساب' : 'إجراء مكالمة'}
                  </>
                )}
              </Button>

              {result && (
                <Alert className={result.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription className="text-right flex-1">
                      {result.success ? (
                        <div>
                          <p className="font-medium text-green-400">تم الإرسال بنجاح!</p>
                          {result.messageId && (
                            <p className="text-sm text-muted-foreground mt-1">
                              معرف الرسالة: {result.messageId}
                            </p>
                          )}
                          {result.callId && (
                            <p className="text-sm text-muted-foreground mt-1">
                              معرف المكالمة: {result.callId}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-red-400">فشل في الإرسال</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.error}
                          </p>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border border-white/10">
            <CardHeader>
              <CardTitle className="text-right">معلومات التكامل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-right">
                <div>
                  <h4 className="font-medium text-accent mb-2">الواتساب</h4>
                  <p className="text-sm text-muted-foreground">
                    يتم إرسال الرسائل عبر Twilio WhatsApp Business API
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-accent mb-2">المكالمات الصوتية</h4>
                  <p className="text-sm text-muted-foreground">
                    المكالمات تستخدم تقنية Text-to-Speech باللغة العربية
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-accent mb-2">متطلبات الاختبار</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• حساب Twilio مفعل مع رصيد كافي</li>
                    <li>• رقم هاتف مؤكد في حساب Twilio</li>
                    <li>• تطبيق واتساب مفعل للرقم المرسل إليه</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}