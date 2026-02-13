import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/ui/sidebar";
import { Header } from "@/components/ui/Header";
import { AppIcon } from "@/components/AppIcon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Opportunity } from "@/types";

const SalesPipeline = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch opportunities from API
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: () => fetch('/api/opportunities').then(res => res.json())
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/opportunities', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الفرصة الجديدة بنجاح",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الفرصة",
        variant: "destructive",
      });
    },
  });

  // Update opportunity stage mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest(`/api/opportunities/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث مرحلة الفرصة بنجاح",
      });
    },
  });

  // Get AI insights for opportunity
  const getAiInsights = async (opportunityId: number) => {
    setAiInsightLoading(true);
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/ai-insights`, {
        method: 'POST'
      });
      const insights = await response.json();
      setAiInsights(insights);
      toast({
        title: "تحليل ذكي",
        description: "تم إنشاء تحليل ذكي للفرصة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحليل",
        description: "تعذر إنشاء التحليل الذكي",
        variant: "destructive",
      });
    } finally {
      setAiInsightLoading(false);
    }
  };

  const stages = [
    { id: 'lead', name: 'عميل محتمل', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: 'Users' },
    { id: 'qualified', name: 'مؤهل', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: 'UserCheck' },
    { id: 'proposal', name: 'عرض', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: 'FileText' },
    { id: 'negotiation', name: 'تفاوض', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: 'Handshake' },
    { id: 'closed', name: 'مغلقة', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: 'CheckCircle' },
  ];

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter((opp: any) => opp.stage === stage);
  };

  const handleCreateOpportunity = (formData: FormData) => {
    const opportunityData = {
      name: formData.get('name') as string,
      value: parseInt(formData.get('value') as string) || 0,
      stage: formData.get('stage') as string || 'lead',
      source: formData.get('source') as string || 'موقع إلكتروني',
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
      priority: formData.get('priority') as string || 'medium',
    };

    createOpportunityMutation.mutate(opportunityData);
  };

  const handleStageUpdate = (opportunityId: number, newStage: string) => {
    updateOpportunityMutation.mutate({
      id: opportunityId,
      updates: { stage: newStage }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalValue = () => {
    return opportunities.reduce((total: number, opp: any) => total + (opp.value || 0), 0);
  };

  const calculateStageValue = (stage: string) => {
    return getOpportunitiesByStage(stage).reduce((total: number, opp: any) => total + (opp.value || 0), 0);
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      high: { text: 'عالية', variant: 'destructive' as const },
      medium: { text: 'متوسطة', variant: 'secondary' as const },
      low: { text: 'منخفضة', variant: 'outline' as const }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header title="خط المبيعات" subtitle="إدارة الفرص والعملاء المحتملين" />
        <main className="mr-72 pt-0">
          <div className="p-6 space-y-6">
            {/* Loading skeletons */}
            <Card className="glass-effect border border-white/10 p-6 animate-pulse">
              <div className="h-8 bg-white/5 rounded mb-4"></div>
              <div className="grid grid-cols-5 gap-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 rounded"></div>
                ))}
              </div>
            </Card>
            <div className="grid grid-cols-5 gap-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-16 bg-white/5 rounded animate-pulse"></div>
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, j) => (
                      <div key={j} className="h-32 bg-white/5 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title="خط المبيعات" subtitle="إدارة الفرص والعملاء المحتملين" />
      
      <main className="mr-72 pt-0">
        <div className="p-6 space-y-6">
          {/* Pipeline Overview */}
          <Card className="glass-effect border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-accent/20 rounded-lg">
                  <AppIcon name="TrendingUp" className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">نظرة عامة على الخط</h3>
                  <p className="text-text-secondary text-sm">إدارة شاملة للفرص التجارية</p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent-600 text-background">
                    <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                    إضافة فرصة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border border-white/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-text-primary">إضافة فرصة جديدة</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      أدخل تفاصيل العميل المحتمل الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleCreateOpportunity(new FormData(e.target as HTMLFormElement)); 
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-text-primary">اسم العميل</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="شركة التقنية المتقدمة"
                          className="bg-background border-white/20 text-text-primary"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="value" className="text-text-primary">قيمة الصفقة (ريال)</Label>
                          <Input
                            id="value"
                            name="value"
                            type="number"
                            placeholder="250000"
                            className="bg-background border-white/20 text-text-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-text-primary">الأولوية</Label>
                          <Select name="priority" defaultValue="medium">
                            <SelectTrigger className="bg-background border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">عالية</SelectItem>
                              <SelectItem value="medium">متوسطة</SelectItem>
                              <SelectItem value="low">منخفضة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-text-primary">الشخص المسؤول</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          placeholder="أحمد الخالدي"
                          className="bg-background border-white/20 text-text-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-text-primary">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ahmed@company.com"
                            className="bg-background border-white/20 text-text-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-text-primary">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+966501234567"
                            className="bg-background border-white/20 text-text-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source" className="text-text-primary">مصدر العميل</Label>
                        <Select name="source" defaultValue="موقع إلكتروني">
                          <SelectTrigger className="bg-background border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="موقع إلكتروني">موقع إلكتروني</SelectItem>
                            <SelectItem value="إحالة">إحالة</SelectItem>
                            <SelectItem value="وسائل التواصل">وسائل التواصل</SelectItem>
                            <SelectItem value="مكالمة باردة">مكالمة باردة</SelectItem>
                            <SelectItem value="معرض">معرض</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-text-primary">ملاحظات</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="ملاحظات إضافية عن العميل..."
                          className="bg-background border-white/20 text-text-primary resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        className="bg-accent hover:bg-accent-600 text-background"
                        disabled={createOpportunityMutation.isPending}
                      >
                        {createOpportunityMutation.isPending ? (
                          <>
                            <AppIcon name="Loader2" className="w-4 h-4 ml-2 animate-spin" />
                            جارٍ الحفظ...
                          </>
                        ) : (
                          "حفظ الفرصة"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {stages.map(stage => {
                const count = getOpportunitiesByStage(stage.id).length;
                const value = calculateStageValue(stage.id);
                return (
                  <div key={stage.id} className="text-center">
                    <div className={`p-4 rounded-lg border ${stage.color} mb-2 transition-all duration-300 hover:scale-105`}>
                      <div className="flex items-center justify-center mb-2">
                        <AppIcon name={stage.icon} className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm opacity-80">{stage.name}</p>
                    </div>
                    <p className="text-xs text-text-muted font-medium">
                      {formatCurrency(value)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-text-secondary text-sm">إجمالي قيمة الخط</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(calculateTotalValue())}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-sm">إجمالي الفرص</p>
                  <p className="text-2xl font-bold text-primary">{opportunities.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-sm">معدل التحويل</p>
                  <p className="text-2xl font-bold text-success">
                    {opportunities.length ? Math.round((getOpportunitiesByStage('closed').length / opportunities.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {stages.map(stage => {
              const stageOpportunities = getOpportunitiesByStage(stage.id);
              return (
                <div key={stage.id} className="space-y-4">
                  <div className={`p-4 rounded-lg border ${stage.color} text-center transition-all duration-300 hover:scale-105`}>
                    <div className="flex items-center justify-center mb-2">
                      <AppIcon name={stage.icon} className="w-5 h-5 ml-2" />
                      <h3 className="font-semibold">{stage.name}</h3>
                    </div>
                    <p className="text-sm opacity-80">{stageOpportunities.length} فرص</p>
                    <p className="text-xs mt-1">{formatCurrency(calculateStageValue(stage.id))}</p>
                  </div>

                  <div className="space-y-3 min-h-[500px]">
                    {stageOpportunities.map((opportunity: any) => {
                      const priorityConfig = getPriorityBadge(opportunity.priority);
                      return (
                        <Card 
                          key={opportunity._id || opportunity.id} 
                          className="glass-effect border border-white/10 p-4 cursor-pointer hover:border-accent/30 transition-all duration-300 hover:transform hover:scale-105"
                          onClick={() => setSelectedOpportunity(opportunity)}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-text-primary truncate">{opportunity.name}</h4>
                                <p className="text-text-secondary text-sm">{opportunity.contactPerson}</p>
                              </div>
                              <Badge variant={priorityConfig.variant} className="text-xs">
                                {priorityConfig.text}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-accent font-bold text-lg">
                                {formatCurrency(opportunity.value || 0)}
                              </span>
                              <span className="text-xs text-text-muted">
                                {opportunity.probability || 50}% احتمالية
                              </span>
                            </div>

                            <div className="text-xs text-text-muted space-y-1">
                              <div className="flex items-center">
                                <AppIcon name="MapPin" className="w-3 h-3 ml-1" />
                                <span>{opportunity.source}</span>
                              </div>
                              <div className="flex items-center">
                                <AppIcon name="User" className="w-3 h-3 ml-1" />
                                <span>{opportunity.assignedAgent || 'غير محدد'}</span>
                              </div>
                              {opportunity.lastActivity && (
                                <div className="flex items-center">
                                  <AppIcon name="Clock" className="w-3 h-3 ml-1" />
                                  <span>{opportunity.lastActivity}</span>
                                </div>
                              )}
                            </div>

                            {stage.id !== 'closed' && (
                              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                                {stages.filter(s => s.id !== stage.id).slice(0, 2).map(nextStage => (
                                  <Button
                                    key={nextStage.id}
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2 hover:bg-accent/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStageUpdate(opportunity.id, nextStage.id);
                                    }}
                                    disabled={updateOpportunityMutation.isPending}
                                  >
                                    <AppIcon name="ArrowRight" className="w-3 h-3 ml-1" />
                                    {nextStage.name}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                    
                    {stageOpportunities.length === 0 && (
                      <div className="text-center py-8 text-text-muted">
                        <AppIcon name="Inbox" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">لا توجد فرص في هذه المرحلة</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opportunity Details Modal */}
          {selectedOpportunity && (
            <Dialog open={!!selectedOpportunity} onOpenChange={() => {
              setSelectedOpportunity(null);
              setAiInsights(null);
            }}>
              <DialogContent className="bg-surface border border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-text-primary flex items-center">
                    <AppIcon name="Briefcase" className="w-5 h-5 ml-2" />
                    {selectedOpportunity.name}
                  </DialogTitle>
                  <DialogDescription className="text-text-secondary">
                    تفاصيل شاملة للفرصة ومعلومات العميل
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-light border border-white/5 p-4 text-center">
                      <AppIcon name="DollarSign" className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <p className="text-accent font-bold text-xl">{formatCurrency(selectedOpportunity.value || 0)}</p>
                      <p className="text-text-secondary text-sm">قيمة الصفقة</p>
                    </Card>
                    <Card className="glass-light border border-white/5 p-4 text-center">
                      <AppIcon name="Target" className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-primary font-bold text-xl">{selectedOpportunity.probability || 50}%</p>
                      <p className="text-text-secondary text-sm">احتمالية النجاح</p>
                    </Card>
                    <Card className="glass-light border border-white/5 p-4 text-center">
                      <AppIcon name="Calendar" className="w-8 h-8 mx-auto mb-2 text-warning" />
                      <p className="text-warning font-bold text-xl">
                        {selectedOpportunity.expectedCloseDate ? 
                          new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString('ar-SA') : 
                          'غير محدد'
                        }
                      </p>
                      <p className="text-text-secondary text-sm">تاريخ الإغلاق المتوقع</p>
                    </Card>
                    <Card className="glass-light border border-white/5 p-4 text-center">
                      <AppIcon name="Flag" className="w-8 h-8 mx-auto mb-2 text-secondary" />
                      <p className="text-secondary font-bold text-xl">
                        {stages.find(s => s.id === selectedOpportunity.stage)?.name}
                      </p>
                      <p className="text-text-secondary text-sm">المرحلة الحالية</p>
                    </Card>
                  </div>

                  {/* AI Insights */}
                  <Card className="glass-light border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-text-primary flex items-center">
                        <AppIcon name="Brain" className="w-5 h-5 ml-2" />
                        التحليل الذكي
                      </h4>
                      <Button
                        onClick={() => getAiInsights(selectedOpportunity.id)}
                        disabled={aiInsightLoading}
                        variant="outline"
                        size="sm"
                      >
                        {aiInsightLoading ? (
                          <>
                            <AppIcon name="Loader2" className="w-4 h-4 ml-2 animate-spin" />
                            جارٍ التحليل...
                          </>
                        ) : (
                          <>
                            <AppIcon name="Sparkles" className="w-4 h-4 ml-2" />
                            تحليل ذكي
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {aiInsights ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-accent/10 rounded-lg">
                            <p className="text-2xl font-bold text-accent">{aiInsights.analysis.score}</p>
                            <p className="text-text-secondary text-sm">نقاط القوة</p>
                          </div>
                          <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{aiInsights.analysis.probability}%</p>
                            <p className="text-text-secondary text-sm">احتمالية النجاح</p>
                          </div>
                          <div className="text-center p-4 bg-warning/10 rounded-lg">
                            <p className="text-lg font-bold text-warning">{aiInsights.analysis.urgency}</p>
                            <p className="text-text-secondary text-sm">مستوى الأولوية</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-text-primary mb-2">التوصيات</h5>
                            <ul className="space-y-1">
                              {aiInsights.analysis.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-text-secondary text-sm flex items-start">
                                  <AppIcon name="CheckCircle2" className="w-4 h-4 ml-2 mt-0.5 text-success flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-text-primary mb-2">الخطوات التالية</h5>
                            <ul className="space-y-1">
                              {aiInsights.analysis.nextActions.map((action: string, index: number) => (
                                <li key={index} className="text-text-secondary text-sm flex items-start">
                                  <AppIcon name="ArrowRight" className="w-4 h-4 ml-2 mt-0.5 text-primary flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        <AppIcon name="Brain" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">اضغط على "تحليل ذكي" للحصول على رؤى وتوصيات مخصصة</p>
                      </div>
                    )}
                  </Card>
                </div>

                <DialogFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setSelectedOpportunity(null)}>
                      إغلاق
                    </Button>
                    <Button variant="outline">
                      <AppIcon name="Edit" className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary-600 text-background">
                      <AppIcon name="Mail" className="w-4 h-4 ml-2" />
                      إرسال بريد
                    </Button>
                    <Button className="bg-accent hover:bg-accent-600 text-background">
                      <AppIcon name="Phone" className="w-4 h-4 ml-2" />
                      إجراء مكالمة
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesPipeline;