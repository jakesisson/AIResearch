import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Network, Bot, CheckCircle, AlertCircle } from 'lucide-react';

interface WorkflowStage {
  stage: string;
  status: 'pending' | 'active' | 'completed';
  agent?: string;
  description?: string;
}

interface LangGraphResponse {
  response: string;
  workflow_stage: string;
  agents_involved: string[];
  satisfaction_score?: number;
  next_actions: string[];
  thread_id: string;
  error?: string;
}

export default function LangGraphTest() {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<LangGraphResponse | null>(null);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [threadId, setThreadId] = useState<string>('');

  const processMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء كتابة رسالة',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setWorkflowStages([
      { stage: 'بداية المحادثة', status: 'active' },
      { stage: 'تحليل النية', status: 'pending' },
      { stage: 'اختيار الوكيل', status: 'pending' },
      { stage: 'تنفيذ المهمة', status: 'pending' },
      { stage: 'توليد الاستجابة', status: 'pending' },
    ]);

    try {
      const result = await apiRequest('POST', '/api/langgraph/process', {
        message,
        customer_id: `test_${Date.now()}`,
        thread_id: threadId || undefined,
      });

      // Type guard for successful response
      if (result && typeof result === 'object' && 'response' in result) {
        const langGraphResult = result as unknown as LangGraphResponse;
        setResponse(langGraphResult);
        setThreadId(langGraphResult.thread_id);
        
        // Update workflow stages based on response
        const stages = [...workflowStages];
        stages[1] = { ...stages[1], status: 'completed' };
        stages[2] = { ...stages[2], status: 'active', agent: langGraphResult.agents_involved[0] };
        stages[3] = { ...stages[3], status: 'completed' };
        stages[4] = { ...stages[4], status: 'completed' };
        setWorkflowStages(stages);
        
        toast({
          title: 'نجح',
          description: 'تمت معالجة الرسالة بنجاح',
        });
      } else if (result && typeof result === 'object' && 'error' in result) {
        setError((result as any).error);
        toast({
          title: 'خطأ',
          description: (result as any).error || 'فشل في معالجة الرسالة',
          variant: 'destructive',
        });
      } else {
        setError('استجابة غير متوقعة من الخادم');
        toast({
          title: 'خطأ',
          description: 'استجابة غير متوقعة من الخادم',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في النظام',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getVisualization = async () => {
    setLoading(true);
    try {
      const result = await apiRequest('GET', '/api/langgraph/workflow/visualization');
      if (result && typeof result === 'object' && !('error' in result)) {
        toast({
          title: 'نجح',
          description: 'تم الحصول على تصور سير العمل',
        });
        console.log('Workflow visualization:', result);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في الحصول على التصور',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            اختبار تكامل LangGraph مع CrewAI
          </CardTitle>
          <CardDescription>
            نظام متطور لتنسيق 8 وكلاء ذكيين عبر 3 مجموعات: الدعم، التسويق الهاتفي، والمبيعات
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>إرسال رسالة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="اكتب رسالتك هنا... مثال: أريد معرفة أسعار خدماتكم"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              dir="rtl"
            />
            <div className="flex gap-2">
              <Button 
                onClick={processMessage} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    معالجة...
                  </>
                ) : (
                  'معالجة الرسالة'
                )}
              </Button>
              <Button 
                onClick={getVisualization}
                variant="outline"
                disabled={loading}
              >
                عرض سير العمل
              </Button>
            </div>
            {threadId && (
              <div className="text-sm text-muted-foreground">
                معرف المحادثة: {threadId}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Stages */}
        <Card>
          <CardHeader>
            <CardTitle>مراحل سير العمل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowStages.map((stage, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {stage.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : stage.status === 'active' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  {stage.agent && (
                    <Badge variant="secondary">{stage.agent}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Section */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>استجابة النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">الرد:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap" dir="rtl">
                {response.response}
              </p>
            </div>
            
            {response.agents_involved && (
              <div className="space-y-2">
                <h4 className="font-semibold">الوكلاء المشاركون:</h4>
                <div className="flex gap-2 flex-wrap">
                  {response.agents_involved.map((agent: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      <Bot className="ml-1 h-3 w-3" />
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {response.satisfaction_score !== undefined && (
              <div className="space-y-2">
                <h4 className="font-semibold">درجة الثقة:</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${response.satisfaction_score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{(response.satisfaction_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {response.next_actions && response.next_actions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">الإجراءات التالية:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {response.next_actions.map((action: string, idx: number) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}