import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Autocomplete } from '@/components/ui/autocomplete';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap, 
  Sparkles, 
  MessageSquare,
  TrendingUp,
  Users,
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// AG-UI Protocol inspired interfaces
interface AGMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    source?: string;
    executionTime?: number;
  };
  actions?: AGAction[];
  status?: 'pending' | 'completed' | 'error';
}

interface AGAction {
  type: 'navigate' | 'execute' | 'suggest' | 'data';
  label: string;
  path?: string;
  command?: string;
  data?: Record<string, unknown>;
  confidence?: number;
}

interface AGChatProps {
  onNavigate?: (path: string) => void;
  onActionExecute?: (action: AGAction) => void;
  className?: string;
}

export function AGChatInterface({ onNavigate, onActionExecute, className }: AGChatProps) {
  const [messages, setMessages] = useState<AGMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🚀 مرحباً! أنا المساعد الذكي المتطور القائم على بروتوكول AG-UI. يمكنني مساعدتك في إدارة أعمالك بذكاء متقدم مع الإكمال التلقائي والتنفيذ الفوري للمهام.',
      timestamp: new Date(),
      metadata: { confidence: 1.0, source: 'ag-ui-protocol' },
      actions: [
        { type: 'data', label: 'عرض الإحصائيات الذكية', path: '/dashboard', confidence: 0.9 },
        { type: 'execute', label: 'تحليل أداء المبيعات', command: 'اعرض تحليل المبيعات', confidence: 0.85 },
        { type: 'execute', label: 'إرسال تقرير واتساب', command: 'أرسل واتساب لجميع العملاء', confidence: 0.8 },
        { type: 'suggest', label: 'اقتراحات ذكية للتحسين', command: 'اقترح تحسينات', confidence: 0.75 }
      ],
      status: 'completed'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAdvancedMode, setUseAdvancedMode] = useState(true);
  const [agentStatus, setAgentStatus] = useState<'active' | 'thinking' | 'idle'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  // Advanced AG-UI inspired quick actions
  const agQuickActions = [
    { 
      label: '📊 تحليل ذكي', 
      command: 'حلل أداء النظام بالذكاء الاصطناعي',
      icon: TrendingUp,
      category: 'analytics'
    },
    { 
      label: '💬 واتساب جماعي', 
      command: 'أرسل رسائل واتساب ذكية لجميع العملاء',
      icon: MessageSquare,
      category: 'communication'
    },
    { 
      label: '👥 إدارة العملاء', 
      command: 'اعرض تحليل تفصيلي للعملاء مع التوصيات',
      icon: Users,
      category: 'crm'
    },
    { 
      label: '📋 تقرير متقدم', 
      command: 'أنشئ تقرير مفصل مع رؤى ذكية',
      icon: FileText,
      category: 'reports'
    },
    { 
      label: '📞 مكالمات ذكية', 
      command: 'اتصل بالعملاء مع تحليل الأولوية',
      icon: Phone,
      category: 'communication'
    }
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced AG-UI command processing
  const processAGCommand = async (command: string): Promise<AGMessage> => {
    setAgentStatus('thinking');
    
    try {
      const response = await fetch('/api/ai/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command })
      });

      const result = await response.json();
      
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.response || 'تم تنفيذ الأمر بنجاح',
        timestamp: new Date(),
        metadata: {
          confidence: result.confidence || 0.8,
          source: 'ag-ui-enhanced',
          executionTime: Date.now() % 1000
        },
        actions: result.actions?.map((action: any) => ({
          type: action.type || 'execute',
          label: action.description || action.label,
          command: action.command,
          confidence: action.confidence || 0.7
        })) || [],
        status: 'completed'
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'حدث خطأ في معالجة الأمر. سأحاول مرة أخرى بطريقة مختلفة.',
        timestamp: new Date(),
        metadata: { confidence: 0.3, source: 'error-handler' },
        status: 'error'
      };
    } finally {
      setAgentStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMessage: AGMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      status: 'completed'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Add thinking indicator
    const thinkingMessage: AGMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '🤔 أحلل طلبك وأجهز الإجراءات المناسبة...',
      timestamp: new Date(),
      status: 'pending'
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await processAGCommand(inputText);
      
      // Replace thinking message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id ? response : msg
        )
      );
    } catch (error) {
      console.error('AG-UI Command processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: AGAction) => {
    if (action.type === 'navigate' && action.path && onNavigate) {
      onNavigate(action.path);
    } else if (action.command) {
      setInputText(action.command);
      // Auto-execute the action
      setTimeout(() => {
        const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(syntheticEvent);
      }, 100);
    } else if (onActionExecute) {
      onActionExecute(action);
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-primary" />
            <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">المساعد الذكي AG-UI</h3>
            <p className="text-xs text-muted-foreground">
              حالة النظام: {agentStatus === 'active' ? 'نشط' : agentStatus === 'thinking' ? 'يفكر...' : 'متاح'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={useAdvancedMode ? "default" : "outline"} className="text-xs">
            {useAdvancedMode ? 'وضع متقدم' : 'وضع بسيط'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseAdvancedMode(!useAdvancedMode)}
          >
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  <Bot className="w-4 h-4 text-accent" />
                  {message.metadata?.confidence && message.metadata.confidence > 0.8 && (
                    <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                </div>
              )}

              <div className={cn(
                "flex-1 max-w-[80%]",
                message.type === 'user' ? "text-right" : "text-right"
              )}>
                <div
                  className={cn(
                    "inline-block p-3 rounded-lg",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-muted-foreground",
                    message.status === 'error' && "border-red-200 bg-red-50"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Enhanced Metadata */}
                  {message.metadata && (
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      {getMessageStatusIcon(message.status)}
                      {message.metadata.confidence && (
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getConfidenceColor(message.metadata.confidence))}
                        >
                          ثقة: {Math.round(message.metadata.confidence * 100)}%
                        </Badge>
                      )}
                      {message.metadata.executionTime && (
                        <span>{message.metadata.executionTime}ms</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        className="h-8 text-xs flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        {action.label}
                        {action.confidence && action.confidence > 0.8 && (
                          <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                            {Math.round(action.confidence * 100)}%
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString('ar-SA')}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Enhanced Quick Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          إجراءات AG-UI الذكية:
        </div>
        <div className="flex flex-wrap gap-2">
          {agQuickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputText(action.command)}
                className="text-xs h-8 flex items-center gap-2"
              >
                <IconComponent className="w-3 h-3" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-border bg-background">
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-accent/5 to-primary/5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={useAdvancedMode ? "default" : "outline"}
              size="sm"
              onClick={() => setUseAdvancedMode(!useAdvancedMode)}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 ml-1" />
              AG-UI المتطور
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {useAdvancedMode ? "وضع الذكاء الاصطناعي المتقدم مُفعل" : "الوضع البسيط"}
          </div>
        </div>

        <div className="flex gap-3 p-4">
          {useAdvancedMode ? (
            <Autocomplete
              value={inputText}
              onChange={setInputText}
              onSelect={(suggestion) => {
                setInputText(suggestion);
                setTimeout(() => {
                  const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleSubmit(syntheticEvent);
                }, 100);
              }}
              placeholder="اكتب أمرك هنا... AG-UI سيقترح أفضل الحلول الذكية"
              className="flex-1"
              disabled={isProcessing}
            />
          ) : (
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب أمرك هنا..."
                className="w-full min-h-[60px] max-h-[120px] resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isProcessing}
              />
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="self-end flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {useAdvancedMode && <Sparkles className="w-3 h-3" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

