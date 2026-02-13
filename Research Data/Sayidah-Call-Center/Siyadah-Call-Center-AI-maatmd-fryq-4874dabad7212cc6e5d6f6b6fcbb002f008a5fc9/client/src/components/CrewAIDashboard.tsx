import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Phone, MessageSquare, Mail, Users, TrendingUp, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  agentId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  groupAr: string;
  icon: string;
  type: string;
  metrics?: {
    totalInteractions: number;
    successRate: number;
    averageResponseTime: number;
    lastActive: string;
  };
}

interface CustomerConversation {
  customerId: string;
  customerName: string;
  lastMessage: string;
  agentAssigned: string;
  status: 'active' | 'resolved' | 'pending';
  timestamp: string;
}

export function CrewAIDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [testMessage, setTestMessage] = useState('');

  // Fetch agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/crewai/agents', { organizationId: 'global' }],
  });

  // Test agent mutation
  const testAgentMutation = useMutation({
    mutationFn: async (data: { message: string; agentId?: string }) => {
      const response = await apiRequest('POST', '/api/crewai/execute', {
        message: data.message,
        customer_id: `test_${Date.now()}`,
        organization_id: 'global',
        selected_agent: data.agentId
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.result) {
        const response = data.result.primaryResponse;
        toast({
          title: `${response.agentName} رد بنجاح`,
          description: response.response.substring(0, 100) + '...',
        });
      }
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في اختبار الوكيل',
        variant: 'destructive',
      });
    }
  });

  const agents = agentsData?.agents || [];
  
  // Group agents by type
  const agentGroups = agents.reduce((acc: any, agent: Agent) => {
    if (!acc[agent.groupAr]) acc[agent.groupAr] = [];
    acc[agent.groupAr].push(agent);
    return acc;
  }, {});

  // Calculate statistics
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a: Agent) => a.metrics?.lastActive).length;
  const totalInteractions = agents.reduce((sum: number, a: Agent) => 
    sum + (a.metrics?.totalInteractions || 0), 0);
  const avgSuccessRate = agents.reduce((sum: number, a: Agent) => 
    sum + (a.metrics?.successRate || 0), 0) / (agents.length || 1);

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوكلاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {activeAgents} نشط حالياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التفاعلات اليوم</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% من الأمس
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة النجاح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <Progress value={avgSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت الاستجابة</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 ثانية</div>
            <p className="text-xs text-muted-foreground">
              أسرع بـ 15% من المعيار
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Management */}
      <Card>
        <CardHeader>
          <CardTitle>وكلاء خدمة العملاء الذكيين</CardTitle>
          <CardDescription>
            إدارة ومراقبة أداء وكلاء CrewAI لخدمة العملاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">جميع الوكلاء</TabsTrigger>
              <TabsTrigger value="support">دعم العملاء</TabsTrigger>
              <TabsTrigger value="marketing">التسويق الهاتفي</TabsTrigger>
              <TabsTrigger value="sales">المبيعات</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {Object.entries(agentGroups).map(([group, groupAgents]: [string, any]) => (
                <div key={group}>
                  <h3 className="text-lg font-semibold mb-3">{group}</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupAgents.map((agent: Agent) => (
                      <Card 
                        key={agent.agentId}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{agent.icon}</span>
                              <div>
                                <CardTitle className="text-base">{agent.nameAr}</CardTitle>
                                <CardDescription className="text-xs">
                                  {agent.descriptionAr}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={agent.type === 'support' ? 'default' : 'secondary'}>
                              {agent.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">التفاعلات</p>
                              <p className="text-sm font-bold">
                                {agent.metrics?.totalInteractions || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">النجاح</p>
                              <p className="text-sm font-bold">
                                {agent.metrics?.successRate || 95}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">الاستجابة</p>
                              <p className="text-sm font-bold">
                                {agent.metrics?.averageResponseTime || 2.5}s
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="support">
              <AgentGroup agents={agents.filter((a: Agent) => a.type === 'support')} />
            </TabsContent>

            <TabsContent value="marketing">
              <AgentGroup agents={agents.filter((a: Agent) => a.groupAr.includes('التسويق'))} />
            </TabsContent>

            <TabsContent value="sales">
              <AgentGroup agents={agents.filter((a: Agent) => a.groupAr.includes('المبيعات'))} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Testing Panel */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedAgent.icon}</span>
              اختبار {selectedAgent.nameAr}
            </CardTitle>
            <CardDescription>
              {selectedAgent.descriptionAr}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">رسالة الاختبار</label>
              <textarea
                className="w-full mt-2 p-3 border rounded-md text-right"
                rows={3}
                placeholder="اكتب رسالة لاختبار الوكيل..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
            <Button
              onClick={() => testAgentMutation.mutate({ 
                message: testMessage, 
                agentId: selectedAgent.agentId 
              })}
              disabled={!testMessage || testAgentMutation.isPending}
              className="w-full"
            >
              {testAgentMutation.isPending ? 'جاري الاختبار...' : 'اختبار الوكيل'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>المحادثات الأخيرة</CardTitle>
          <CardDescription>
            آخر التفاعلات مع عملاء العملاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockConversations.map((conv) => (
              <div key={conv.customerId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{conv.customerName}</p>
                  <p className="text-sm text-muted-foreground">{conv.lastMessage}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">{conv.agentAssigned}</Badge>
                    <span className="text-muted-foreground">{conv.timestamp}</span>
                  </div>
                </div>
                <Badge variant={
                  conv.status === 'active' ? 'default' : 
                  conv.status === 'resolved' ? 'secondary' : 'outline'
                }>
                  {conv.status === 'active' ? 'نشط' : 
                   conv.status === 'resolved' ? 'محلول' : 'معلق'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for agent groups
function AgentGroup({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Card key={agent.agentId}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <CardTitle className="text-base">{agent.nameAr}</CardTitle>
                <CardDescription className="text-xs">
                  {agent.descriptionAr}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// Mock data for recent conversations
const mockConversations: CustomerConversation[] = [
  {
    customerId: 'cust_001',
    customerName: 'أحمد محمد',
    lastMessage: 'أريد معرفة تفاصيل أكثر عن خطة المؤسسات',
    agentAssigned: 'مسوق هاتفي',
    status: 'active',
    timestamp: 'قبل 5 دقائق'
  },
  {
    customerId: 'cust_002',
    customerName: 'فاطمة العلي',
    lastMessage: 'شكراً على المساعدة السريعة',
    agentAssigned: 'مستجيب الدعم',
    status: 'resolved',
    timestamp: 'قبل 15 دقيقة'
  },
  {
    customerId: 'cust_003',
    customerName: 'عبدالله السالم',
    lastMessage: 'متى يمكنني الحصول على عرض سعر؟',
    agentAssigned: 'مغلق الصفقات',
    status: 'pending',
    timestamp: 'قبل ساعة'
  }
];