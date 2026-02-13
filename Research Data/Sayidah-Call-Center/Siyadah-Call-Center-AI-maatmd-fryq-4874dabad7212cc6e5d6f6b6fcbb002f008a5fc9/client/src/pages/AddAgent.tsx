import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Plus } from "lucide-react";

export default function AddAgent() {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    performance: 85
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      // إضافة مباشرة إلى قاعدة البيانات
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });
      
      if (!response.ok) {
        throw new Error('فشل في إضافة الوكيل');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الوكيل الجديد بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agents'] });
      setFormData({ name: "", specialization: "", performance: 85 });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الوكيل",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.specialization) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    addAgentMutation.mutate({
      ...formData,
      status: 'active',
      isActive: true,
      activeDeals: 0,
      conversionRate: formData.performance
    });
  };

  const quickAgents = [
    { name: "ليلى التسويق", specialization: "حملات التسويق الرقمي وإدارة وسائل التواصل الاجتماعي", performance: 92 },
    { name: "عمر المالية", specialization: "التحليل المالي وإعداد التقارير المحاسبية", performance: 89 },
    { name: "نورا العمليات", specialization: "تحسين العمليات التشغيلية وإدارة المشاريع", performance: 94 },
    { name: "زياد التطوير", specialization: "تطوير الحلول التقنية والبرمجة", performance: 91 },
    { name: "ريم الموارد البشرية", specialization: "إدارة الموارد البشرية والتوظيف", performance: 88 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إضافة وكيل ذكي جديد</h1>
          <p className="text-slate-400">أضف وكلاء ذكيين جدد لفريق العمل الآلي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* نموذج الإضافة */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                إنشاء وكيل مخصص
              </CardTitle>
              <CardDescription className="text-slate-400">
                أدخل تفاصيل الوكيل الذكي الجديد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">اسم الوكيل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: أحمد المطور"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="specialization" className="text-white">التخصص</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="مثال: تطوير وأتمتة سير العمل"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="performance" className="text-white">معدل الأداء المتوقع (%)</Label>
                  <Input
                    id="performance"
                    type="number"
                    min="60"
                    max="100"
                    value={formData.performance}
                    onChange={(e) => setFormData(prev => ({ ...prev, performance: parseInt(e.target.value) }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={addAgentMutation.isPending}
                >
                  {addAgentMutation.isPending ? "جاري الإضافة..." : "إضافة الوكيل"}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* وكلاء جاهزين */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-400" />
                وكلاء جاهزين للإضافة
              </CardTitle>
              <CardDescription className="text-slate-400">
                اختر من الوكلاء المُعدين مسبقاً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickAgents.map((agent, index) => (
                <div key={index} className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {agent.performance}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{agent.specialization}</p>
                  <Button
                    size="sm"
                    onClick={() => addAgentMutation.mutate({
                      ...agent,
                      status: 'active',
                      isActive: true,
                      activeDeals: 0,
                      conversionRate: agent.performance
                    })}
                    disabled={addAgentMutation.isPending}
                    className="w-full bg-slate-600 hover:bg-slate-500 text-white text-xs"
                  >
                    إضافة فورية
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}