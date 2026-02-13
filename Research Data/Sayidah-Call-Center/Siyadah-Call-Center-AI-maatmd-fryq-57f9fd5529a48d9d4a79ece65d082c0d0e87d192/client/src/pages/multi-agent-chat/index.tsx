import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  Languages, 
  Target, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Calendar,
  DollarSign,
  Headphones,
  Shield,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ModernLayout from '@/components/modern-ui/ModernLayout';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  language?: string;
  intent?: string;
  agentsUsed?: string[];
  data?: any;
}

interface AgentInfo {
  name: string;
  emoji: string;
  description: string;
  active: boolean;
}

const AGENT_INFO: AgentInfo[] = [
  { name: 'LanguageAgent', emoji: '🌐', description: 'Language Detection', active: false },
  { name: 'IntentAgent', emoji: '📥', description: 'Intent Analysis', active: false },
  { name: 'OrchestratorAgent', emoji: '🧭', description: 'Task Routing', active: true },
  { name: 'TaskAgent', emoji: '📋', description: 'Task Generation', active: false },
  { name: 'OfferAgent', emoji: '🧾', description: 'Proposal Creation', active: false },
  { name: 'CallAgent', emoji: '📞', description: 'Call Management', active: false },
  { name: 'CustomerServiceAgent', emoji: '🧑‍💻', description: 'Customer Support', active: false },
  { name: 'SchedulerAgent', emoji: '📆', description: 'Appointment Booking', active: false },
  { name: 'MemoryAgent', emoji: '🧠', description: 'Context Storage', active: false },
  { name: 'ResponseAgent', emoji: '🎤', description: 'Response Generation', active: false },
  { name: 'SecurityAgent', emoji: '🛡️', description: 'Access Control', active: false }
];

export default function MultiAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [userRole, setUserRole] = useState<'admin' | 'marketing_manager' | 'sales_manager' | 'viewer'>('admin');
  const [activeAgents, setActiveAgents] = useState<string[]>(['OrchestratorAgent']);
  const [systemStats, setSystemStats] = useState<any>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSystemInfo();
    addWelcomeMessage();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSystemInfo = async () => {
    try {
      const response = await fetch('/api/multi-agent/info');
      const data = await response.json();
      if (data.success) {
        setSystemStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content: 'مرحباً بك في نظام سيادة AI متعدد الوكلاء. يمكنني مساعدتك في أكثر من 100 لغة ولهجة. جرب قول "أريد معرفة الأسعار" أو "I need a quote for my business"',
      timestamp: new Date(),
      language: 'ar'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/multi-agent/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          userId: 'user_1',
          userRole,
          businessType: 'general'
        })
      });

      const data = await response.json();

      if (data.success) {
        const agentMessage: Message = {
          id: `agent_${Date.now()}`,
          type: 'agent',
          content: data.result.message || 'تم تنفيذ الطلب',
          timestamp: new Date(),
          language: data.result.language,
          intent: data.result.type,
          data: data.result
        };

        setMessages(prev => [...prev, agentMessage]);

        // Update active agents based on response
        if (data.result.data?.agentsUsed) {
          setActiveAgents(data.result.data.agentsUsed);
        }

        // Show success toast
        toast({
          title: "تم المعالجة",
          description: `اللغة: ${data.result.language || 'تلقائي'} | النوع: ${data.result.type || 'عام'}`
        });

      } else {
        throw new Error(data.error || 'Processing failed');
      }

    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "خطأ في المعالجة",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const testSystem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/multi-agent/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        const testMessage: Message = {
          id: `test_${Date.now()}`,
          type: 'system',
          content: `تم اختبار النظام بنجاح. نتائج الاختبار: ${data.testResults.length} حالات اختبار تمت`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, testMessage]);
        
        toast({
          title: "اختبار النظام",
          description: "تم اختبار جميع الوكلاء بنجاح"
        });
      }
    } catch (error) {
      toast({
        title: "فشل الاختبار",
        description: "حدث خطأ أثناء اختبار النظام",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-5 h-5" />;
      case 'agent': return <Bot className="w-5 h-5" />;
      case 'system': return <Zap className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'sales_inquiry': return <DollarSign className="w-4 h-4" />;
      case 'customer_service': return <Headphones className="w-4 h-4" />;
      case 'scheduling': return <Calendar className="w-4 h-4" />;
      case 'telemarketing': return <Phone className="w-4 h-4" />;
      case 'offer_request': return <Target className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <ModernLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">🤖 نظام الوكلاء المتعددين</h1>
            <p className="text-gray-400 mt-2">نظام ذكي متعدد اللغات للتفاعل مع العملاء</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={testSystem} variant="outline" disabled={isLoading}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              اختبار النظام
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3 space-y-4">
            {/* Messages */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">المحادثة</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      الجلسة: {sessionId.slice(-8)}
                    </Badge>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      الدور: {userRole}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === 'user'
                                ? 'bg-blue-600'
                                : message.type === 'agent'
                                ? 'bg-green-600'
                                : 'bg-purple-600'
                            }`}
                          >
                            {getMessageIcon(message.type)}
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {message.language && (
                                <Badge variant="secondary" className="text-xs">
                                  <Languages className="w-3 h-3 mr-1" />
                                  {message.language}
                                </Badge>
                              )}
                              {message.intent && (
                                <Badge variant="secondary" className="text-xs">
                                  {getIntentIcon(message.intent)}
                                  <span className="mr-1">{message.intent}</span>
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {message.timestamp.toLocaleTimeString('ar-SA')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Input */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك بأي لغة... (العربية، English, Español, Français)"
                    className="bg-gray-800 border-gray-700 text-white"
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="bg-gray-800 border-gray-700 text-white rounded px-3 py-1 text-sm"
                  >
                    <option value="admin">مدير النظام</option>
                    <option value="marketing_manager">مدير التسويق</option>
                    <option value="sales_manager">مدير المبيعات</option>
                    <option value="viewer">مشاهد</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Active Agents */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">الوكلاء النشطون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {AGENT_INFO.map((agent) => (
                    <div
                      key={agent.name}
                      className={`flex items-center gap-2 p-2 rounded ${
                        activeAgents.includes(agent.name)
                          ? 'bg-green-900/30 border border-green-600'
                          : 'bg-gray-800'
                      }`}
                    >
                      <span className="text-lg">{agent.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {agent.description}
                        </div>
                        <div className="text-xs text-gray-400">{agent.name}</div>
                      </div>
                      {activeAgents.includes(agent.name) && (
                        <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Stats */}
            {systemStats && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">إحصائيات النظام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">الجلسات النشطة</span>
                      <span className="text-white">{systemStats.activeSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">إجمالي الوكلاء</span>
                      <span className="text-white">{systemStats.totalAgents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">اللغات المدعومة</span>
                      <span className="text-white">{systemStats.supportedLanguages?.length || 100}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">وقت التشغيل</span>
                      <span className="text-white">{Math.floor(systemStats.uptime / 60)}د</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInput('أريد معرفة الأسعار')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    استعلام عن الأسعار
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInput('أحتاج موعد للمناقشة')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    حجز موعد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInput('اتصل على +966501234567')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    طلب اتصال
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setInput('I need help with my order')}
                  >
                    <Headphones className="w-4 h-4 mr-2" />
                    دعم العملاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}