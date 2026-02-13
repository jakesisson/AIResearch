import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Target,
  Paperclip,
  FileSpreadsheet,
  Image,
  FileText,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  executionPlan?: string[];
  confidence?: number;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  }[];
}

export default function IntelligentChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً بك في سيادة AI! أنا مساعدك الذكي. يمكنني مساعدتك في إدارة أعمالك وتنفيذ المهام التلقائية. يمكنك أيضاً رفع الملفات والصور مباشرة في المحادثة.',
      isUser: false,
      timestamp: new Date(),
      confidence: 100
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Show file names in toast
    if (files.length > 0) {
      toast({
        title: `تم اختيار ${files.length} ملف`,
        description: files.map(f => f.name).join(', '),
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet;
    return FileText;
  };

  const processChatMutation = useMutation({
    mutationFn: async (data: { message: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append('message', data.message);
      
      // Add files if any
      if (data.files && data.files.length > 0) {
        data.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }

      // Use multipart/form-data for file uploads
      const headers: any = {};
      if (data.files && data.files.length > 0) {
        // Let browser set Content-Type with boundary for multipart
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/ai-chat/process-command', {
        method: 'POST',
        headers: data.files?.length ? {} : { 'Content-Type': 'application/json' },
        body: data.files?.length ? formData : JSON.stringify({ message: data.message })
      });

      if (!response.ok) {
        throw new Error('فشل في معالجة الرسالة');
      }

      return response.json();
    },
    onSuccess: (data) => {
      let responseContent = data.response || data.message || 'تم تنفيذ طلبك بنجاح';
      
      // Format WhatsApp agent response
      if (data.executedActions && Array.isArray(data.executedActions)) {
        responseContent += '\n\nالإجراءات المنفذة:\n' + data.executedActions.join('\n');
      }
      
      if (data.sentCount) {
        responseContent += `\n\n📊 تم إرسال ${data.sentCount} رسالة بنجاح`;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
        executionPlan: data.executionPlan || data.executedActions,
        confidence: data.confidence || (data.analysis?.confidence * 100)
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);

      if (data.success) {
        toast({
          title: "تم التنفيذ بنجاح",
          description: data.message || "تم تنفيذ طلبك بنجاح"
        });
      }
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  });

  const handleSendMessage = () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage || (selectedFiles.length > 0 ? `رفع ${selectedFiles.length} ملف` : ''),
      isUser: true,
      timestamp: new Date(),
      attachments: selectedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    processChatMutation.mutate({ 
      message: inputMessage || `تحليل ${selectedFiles.length} ملف`, 
      files: selectedFiles 
    });
    setInputMessage('');
    setSelectedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "تم إيقاف الإدخال الصوتي" : "تم تفعيل الإدخال الصوتي",
      description: isListening ? "يمكنك الآن الكتابة" : "تحدث الآن..."
    });
  };

  const quickCommands = [
    { text: "اعرض الفرص المتاحة", icon: Target },
    { text: "أرسل رسالة واتساب للعملاء", icon: MessageSquare },
    { text: "اتصل بالعملاء المهتمين", icon: Phone },
    { text: "أرسل حملة إيميل جديدة", icon: Mail }
  ];

  return (
    <Layout showBackButton={true}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          
          {/* منطقة المحادثة الرئيسية */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700 h-full flex flex-col">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  المحادثة الذكية مع سيادة AI
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mr-auto">
                    نشط
                  </Badge>
                </CardTitle>
              </CardHeader>

              {/* منطقة الرسائل */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* أيقونة المرسل */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        {message.isUser ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* محتوى الرسالة */}
                      <div className={`rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* عرض المرفقات */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => {
                              const Icon = getFileIcon(attachment.type);
                              return (
                                <div key={index} className="flex items-center gap-2 text-xs bg-slate-600/30 rounded p-1">
                                  <Icon className="w-4 h-4" />
                                  <span>{attachment.name}</span>
                                  <span className="text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* خطة التنفيذ */}
                        {message.executionPlan && message.executionPlan.length > 0 && (
                          <div className="mt-2 p-2 bg-slate-600/50 rounded text-xs">
                            <p className="font-semibold mb-1">خطة التنفيذ:</p>
                            <ul className="space-y-1">
                              {message.executionPlan.map((step, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* مستوى الثقة */}
                        {message.confidence && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                            <Zap className="w-3 h-3" />
                            دقة: {message.confidence}%
                          </div>
                        )}

                        <div className="text-xs text-slate-400 mt-1">
                          {message.timestamp.toLocaleTimeString('ar')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* مؤشر المعالجة */}
                {isProcessing && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-300">جاري المعالجة...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* منطقة الإدخال */}
              <div className="border-t border-slate-700 p-4 space-y-2">
                {/* عرض الملفات المحددة */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFiles.map((file, index) => {
                      const Icon = getFileIcon(file.type);
                      return (
                        <div key={index} className="flex items-center gap-2 bg-slate-700 rounded px-2 py-1 text-xs">
                          <Icon className="w-4 h-4 text-blue-400" />
                          <span className="text-white">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك هنا... أو ارفق ملف"
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={isProcessing}
                  />
                  
                  {/* زر رفع الملفات */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg,.pdf,.doc,.docx"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={toggleVoiceInput}
                    variant="outline"
                    className={`border-slate-600 ${isListening ? 'bg-red-600 text-white' : 'text-slate-300'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* الشريط الجانبي - الأوامر السريعة */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">أوامر سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white h-auto p-3"
                      onClick={() => setInputMessage(command.text)}
                    >
                      <Icon className="w-4 h-4 ml-2" />
                      <span className="text-xs">{command.text}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">إحصائيات المحادثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">الرسائل اليوم</span>
                  <span className="text-white font-semibold">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">الأوامر المنفذة</span>
                  <span className="text-green-400 font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">معدل النجاح</span>
                  <span className="text-green-400 font-semibold">94%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}