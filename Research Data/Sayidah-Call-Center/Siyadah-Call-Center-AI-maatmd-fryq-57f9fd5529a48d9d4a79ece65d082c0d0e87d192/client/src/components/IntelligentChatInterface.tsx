import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  executionPlan?: ActionPlan;
  agent?: string;
  agentRole?: string;
  confidence?: number;
  needsApproval?: boolean;
  canExecuteNow?: boolean;
  executionResult?: any;
  entities?: any;
}

interface ActionPlan {
  goal: string;
  steps: ActionStep[];
  targetAudience: string;
  suggestedMessage: string;
  bestTiming: string;
  channels: string[];
  estimatedImpact: string;
  needsApproval: boolean;
}

interface ActionStep {
  step: number;
  description: string;
  agent: string;
  estimated_time: string;
  dependencies: string[];
}

interface IntelligentChatInterfaceProps {
  className?: string;
}

export default function IntelligentChatInterface({ className = "" }: IntelligentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `مرحباً! أنا فريق سيادة AI الذكي المطور. يمكنني مساعدتك في:

🎯 **تحليل الأعمال والتخطيط الذكي**
📱 **إدارة حملات التسويق والتواصل**
📊 **تحليل البيانات وإنشاء التقارير**
⚡ **تنفيذ المهام تلقائياً**

جرب أمثلة:
• "أرسل رسائل ترحيب لجميع العملاء الجدد"
• "حلل أداء المبيعات وأعطني تقرير"
• "اتصل بالعملاء المهتمين وقدم لهم عروض"
• "أنشئ حملة تسويقية للشركات الكبرى"`,
      sender: 'bot',
      timestamp: new Date(),
      agent: "فريق سيادة AI",
      agentRole: "6 وكلاء ذكيين متخصصين",
      confidence: 1.0
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentPlan, setCurrentPlan] = useState<ActionPlan | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await fetch('/api/process-command', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });
      
      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }
      
      const contentType = result.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await result.json();
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: data.suggestions,
        executionPlan: data.executionPlan,
        agent: data.agent,
        agentRole: data.agentRole,
        confidence: data.confidence,
        needsApproval: data.needsApproval,
        canExecuteNow: data.canExecuteNow,
        executionResult: data.executionResult,
        entities: data.entities
      };

      setMessages(prev => [...prev, botMessage]);
      if (data.executionPlan) {
        setCurrentPlan(data.executionPlan);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'عذراً، حدث خطأ في التواصل مع النظام. يرجى المحاولة مرة أخرى.',
        sender: 'bot',
        timestamp: new Date(),
        agent: "النظام",
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const executeAction = async (plan: ActionPlan) => {
    setIsLoading(true);
    try {
      const result = await fetch('/api/execute-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      
      const data = await result.json();
      
      const executionMessage: Message = {
        id: Date.now(),
        text: data.success ? 
          `✅ تم تنفيذ الخطة بنجاح!\n\n${data.summary}` :
          `❌ فشل في التنفيذ: ${data.error}`,
        sender: 'bot',
        timestamp: new Date(),
        agent: "مازن",
        agentRole: "وكيل المتابعة والتقارير",
        executionResult: data
      };

      setMessages(prev => [...prev, executionMessage]);
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green-500/20 text-green-400';
    if (confidence > 0.5) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getAgentIcon = (agentName: string) => {
    const icons = {
      'منى': '🧠',
      'ياسر': '📋',
      'سارة': '💬',
      'فهد': '📢',
      'دلال': '✅',
      'مازن': '📊'
    };
    return icons[agentName] || '🤖';
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">فريق سيادة AI الذكي</h2>
                <p className="text-sm text-gray-500">6 وكلاء ذكيين جاهزين لخدمتك</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">جميع الوكلاء متصلين</span>
            </div>
          </div>

          {/* عرض الوكلاء المتاحين */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">الوكلاء المتاحين:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span>🧠</span>
                <span>منى - تحليل النوايا</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span>ياسر - اقتراح الخطوات</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>سارة - خدمة العملاء</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📢</span>
                <span>فهد - التسويق الذكي</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>دلال - مراجعة الجودة</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>مازن - التقارير</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getAgentIcon(message.agent || '')}</span>
                    <span className="text-sm font-medium">
                      {message.agent ? `${message.agent} - ${message.agentRole}` : 'مساعد سيادة AI'}
                    </span>
                    {message.confidence && (
                      <Badge className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                        {Math.round(message.confidence * 100)}% ثقة
                      </Badge>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm">{message.text}</div>

                {message.executionPlan && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">خطة التنفيذ</span>
                    </div>
                    <div className="text-sm space-y-2">
                      <div><strong>🎯 الهدف:</strong> {message.executionPlan.goal}</div>
                      <div><strong>👥 الجمهور:</strong> {message.executionPlan.targetAudience}</div>
                      <div><strong>📱 القنوات:</strong> {message.executionPlan.channels?.join(', ')}</div>
                      <div><strong>⏰ التوقيت:</strong> {message.executionPlan.bestTiming}</div>
                      <div><strong>📊 التأثير:</strong> {message.executionPlan.estimatedImpact}</div>
                      
                      {message.executionPlan.steps && (
                        <div className="mt-3">
                          <div className="text-xs font-medium mb-2">خطوات التنفيذ:</div>
                          {message.executionPlan.steps.slice(0, 3).map((step: ActionStep, idx: number) => (
                            <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mb-1">
                              <strong>{step.step}.</strong> {step.description} 
                              <span className="text-gray-500"> ({step.estimated_time})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        {message.canExecuteNow ? (
                          <Button 
                            size="sm"
                            onClick={() => executeAction(message.executionPlan!)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            disabled={isLoading}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            ⚡ انطلق
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => executeAction(message.executionPlan!)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isLoading}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            ✅ تأكيد وتنفيذ
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setInput(`تعديل الخطة: ${message.executionPlan?.goal}`)}
                          className="text-xs"
                        >
                          ✏️ تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setInput('')}
                        >
                          ❌ إلغاء
                        </Button>
                      </div>

                      {message.needsApproval && (
                        <div className="mt-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                          <AlertCircle size={14} />
                          <span className="text-xs">يحتاج موافقتك قبل التنفيذ</span>
                        </div>
                      )}

                      {message.executionResult && (
                        <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/20">
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                            ✅ نتيجة التنفيذ:
                          </div>
                          <div className="text-xs">{message.executionResult.summary}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">اقتراحات:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs h-7"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString('ar-SA')}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">الوكلاء يعملون على طلبك...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب طلبك هنا... مثل: 'أرسل رسائل للعملاء الجدد' أو 'حلل أداء المبيعات'"
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}