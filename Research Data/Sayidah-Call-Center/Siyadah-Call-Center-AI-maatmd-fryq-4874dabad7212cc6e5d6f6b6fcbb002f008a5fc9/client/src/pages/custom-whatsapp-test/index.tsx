import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Settings, Send, Webhook } from 'lucide-react';

export default function CustomWhatsAppTest() {
  const [phoneNumber, setPhoneNumber] = useState('+21621219217');
  const [message, setMessage] = useState('مرحباً! هذه رسالة تجريبية من منصة سيادة AI');
  const [apiKey, setApiKey] = useState('comp_mc7awp6j_6ef95dac217e7acc7d80041077ff5413');
  const [serverUrl, setServerUrl] = useState('https://your-api-server.com');
  const [sessionName, setSessionName] = useState('siyadah_session');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [webhookData, setWebhookData] = useState<any[]>([]);

  const sendTestMessage = async () => {
    setLoading(true);
    try {
      // Store current configuration
      const config = {
        sessionName,
        apiKey,
        serverUrl,
        webhookUrl: `${window.location.origin}/webhook/custom-whatsapp`
      };
      localStorage.setItem('customWhatsAppConfig', JSON.stringify(config));

      // Send the message with configuration included
      const response = await fetch('/api/external/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          useCustomAPI: true,
          customConfig: config
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const configureAPI = async () => {
    try {
      // Store configuration in localStorage for immediate use
      const config = {
        sessionName,
        apiKey,
        serverUrl,
        webhookUrl: `${window.location.origin}/webhook/custom-whatsapp`,
        timestamp: Date.now()
      };
      
      localStorage.setItem('customWhatsAppConfig', JSON.stringify(config));
      
      // Also try to send to server (fallback if server route works)
      try {
        await fetch('/api/custom-whatsapp/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      } catch (e) {
        console.log('Server config failed, using localStorage fallback');
      }
      
      alert('✅ تم حفظ إعدادات API بنجاح');
    } catch (error: any) {
      console.error('Configuration error:', error);
      alert('❌ خطأ في الاتصال: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            اختبار Custom WhatsApp API
          </h1>
          <p className="text-slate-400">
            اختبار وتكوين API الواتساب المخصص
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-3 text-blue-400" />
                إعدادات API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Name
                </label>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="siyadah_session"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Token
                </label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="comp_mc7awp6j_6ef95dac217e7acc7d80041077ff5413"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Server URL
                </label>
                <Input
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://your-api-server.com"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <Button 
                onClick={configureAPI}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>

          {/* Message Testing Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-green-400" />
                إرسال رسالة تجريبية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  رقم الهاتف
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+21621219217"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  الرسالة
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <Button 
                onClick={sendTestMessage}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'جاري الإرسال...' : 'إرسال رسالة'}
              </Button>

              {/* Result Display */}
              {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={result.success ? 'bg-green-600' : 'bg-red-600'}>
                      {result.success ? 'نجح' : 'فشل'}
                    </Badge>
                    {result.messageId && (
                      <span className="text-xs text-slate-400">
                        ID: {result.messageId}
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <p className="text-red-400 text-sm">{result.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhook Information */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Webhook className="w-5 h-5 mr-3 text-purple-400" />
              معلومات Webhook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300">Webhook URL:</span>
                <code className="bg-slate-700 px-3 py-1 rounded text-green-400">
                  {window.location.origin}/webhook/custom-whatsapp
                </code>
              </div>
              
              <div className="text-sm text-slate-400">
                <p className="mb-2">استخدم هذا الرابط في لوحة تحكم API الخاص بك:</p>
                <div className="bg-slate-800 p-3 rounded border-l-4 border-blue-500">
                  <p className="font-mono text-blue-300">
                    POST {window.location.origin}/webhook/custom-whatsapp
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Usage Example */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              مثال على التكامل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`// Configuration in your API dashboard:
Webhook URL: ${window.location.origin}/webhook/custom-whatsapp

// Expected webhook payload format:
{
  "from": "+21621219217",
  "body": "رسالة الواردة",
  "type": "text",
  "timestamp": 1640995200,
  "session": "siyadah_session",
  "event": "message"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}