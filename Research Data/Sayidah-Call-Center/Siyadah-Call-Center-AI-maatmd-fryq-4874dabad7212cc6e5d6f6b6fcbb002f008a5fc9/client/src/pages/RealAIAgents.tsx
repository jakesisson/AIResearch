import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageCircle, Zap, Target, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleAIAgent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  performance: number;
  status: string;
  isRealAI?: boolean;
  aiModel?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agent?: {
    id: string;
    name: string;
    specialization: string;
  };
  confidence?: number;
}

export default function RealAIAgents() {
  const [selectedAgent, setSelectedAgent] = useState<SimpleAIAgent | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [autoSelect, setAutoSelect] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الوكلاء الذكيين الحقيقيين
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['/api/ai-agents'],
    select: (data: any) => ({
      agents: data.agents || [],
      systemStats: data.systemStats || {},
      realAI: data.realAI || false
    })
  });

  // التفاعل مع الذكاء الاصطناعي
  const chatMutation = useMutation({
    mutationFn: async (data: {
      agentId?: string;
      message: string;
      autoSelect: boolean;
    }) => {
      const response = await fetch('/api/ai-chat-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        // إضافة رسالة المستخدم
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: chatMessage,
          timestamp: new Date()
        };

        // إضافة رد الوكيل الذكي
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: result.response,
          timestamp: new Date(),
          agent: result.agent,
          confidence: result.confidence
        };

        setChatHistory(prev => [...prev, userMessage, agentMessage]);
        setChatMessage('');
        
        toast({
          title: "تم التفاعل بنجاح",
          description: `رد من ${result.agent.name} بثقة ${Math.round(result.confidence * 100)}%`
        });
      }
    },
    onError: (error) => {
      toast({
        title: "خطأ في التفاعل",
        description: "حدث خطأ في التواصل مع الذكاء الاصطناعي",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    chatMutation.mutate({
      agentId: autoSelect ? undefined : selectedAgent?.id,
      message: chatMessage,
      autoSelect
    });
  };

  const agents = agentsData?.agents || [];
  const systemStats = agentsData?.systemStats || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              الوكلاء الذكيين الحقيقيين
            </h1>
            {agentsData?.realAI && (
              <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                مدعوم بـ GPT-4o
              </Badge>
            )}
          </div>
          
          {/* إحصائيات النظام */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">إجمالي الوكلاء</p>
                    <p className="text-2xl font-bold text-white">{agents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">متوسط الأداء</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(systemStats.averagePerformance || 0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-slate-400">نوع النظام</p>
                    <p className="text-lg font-bold text-white">ذكاء حقيقي</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">النموذج</p>
                    <p className="text-lg font-bold text-white">GPT-4o</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">
              💬 الدردشة الذكية
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600">
              🤖 الوكلاء
            </TabsTrigger>
          </TabsList>

          {/* تبويب الدردشة */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* قائمة الوكلاء */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      اختيار الوكيل
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoSelect"
                        checked={autoSelect}
                        onChange={(e) => setAutoSelect(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="autoSelect" className="text-sm text-slate-300">
                        اختيار تلقائي ذكي
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {agents.map((agent: SimpleAIAgent) => (
                          <div
                            key={agent.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAgent?.id === agent.id
                                ? 'bg-blue-600/20 border border-blue-500'
                                : 'bg-slate-700/50 hover:bg-slate-700'
                            }`}
                            onClick={() => setSelectedAgent(agent)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} />
                                <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{agent.name}</p>
                                <p className="text-xs text-slate-400 truncate">{agent.specialization}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {agent.performance}%
                                  </Badge>
                                  {agent.isRealAI && (
                                    <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-300">
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* منطقة الدردشة */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      الدردشة مع الذكاء الاصطناعي
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      تفاعل مع الوكلاء الذكيين المدعومين بـ GPT-4o
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* تاريخ المحادثة */}
                    <ScrollArea className="h-64 mb-4 p-4 bg-slate-900/50 rounded-lg">
                      {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>ابدأ محادثة مع الذكاء الاصطناعي</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.type === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.type === 'agent' && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.agent?.name}`} />
                                  <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-100'
                                }`}
                              >
                                {message.type === 'agent' && (
                                  <p className="text-xs text-slate-400 mb-1">
                                    {message.agent?.name}
                                    {message.confidence && (
                                      <span className="mr-2">
                                        ({Math.round(message.confidence * 100)}% ثقة)
                                      </span>
                                    )}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString('ar-SA')}
                                </p>
                              </div>
                              {message.type === 'user' && (
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>أنت</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* منطقة إدخال الرسالة */}
                    <div className="flex gap-2">
                      <Textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 bg-slate-900/50 border-slate-600 text-white resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim() || chatMutation.isPending}
                        className="self-end"
                      >
                        {chatMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          'إرسال'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* تبويب الوكلاء */}
          <TabsContent value="agents">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent: SimpleAIAgent) => (
                <Card key={agent.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} />
                        <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {agent.role}
                        </CardDescription>
                      </div>
                      {agent.isRealAI && (
                        <Badge className="bg-green-600/20 text-green-300">
                          GPT-4o
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">التخصص:</p>
                        <p className="text-white text-sm">{agent.specialization}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">الأداء:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                              style={{ width: `${agent.performance}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">{agent.performance}%</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedAgent(agent);
                          // التبديل إلى تبويب الدردشة
                        }}
                      >
                        بدء محادثة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}