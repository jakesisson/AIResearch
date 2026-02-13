import { useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Header } from "@/components/ui/Header";
import { AppIcon } from "@/components/AppIcon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WorkflowAutomation = () => {
  const [showBuilder, setShowBuilder] = useState(false);

  const workflows = [
    {
      id: 1,
      name: "أتمتة متابعة العملاء الجدد",
      description: "سير عمل تلقائي لمتابعة العملاء المحتملين الجدد عبر البريد الإلكتروني والاتصالات",
      status: "نشط",
      successRate: 94,
      totalRuns: 156,
      lastRun: "منذ 15 دقيقة",
      category: "مبيعات",
      steps: [
        { id: 1, name: "استلام عميل جديد", type: "trigger", status: "completed" },
        { id: 2, name: "إرسال رسالة ترحيب", type: "action", status: "completed" },
        { id: 3, name: "انتظار 24 ساعة", type: "delay", status: "completed" },
        { id: 4, name: "إرسال عرض مخصص", type: "action", status: "active" },
        { id: 5, name: "تقييم الاستجابة", type: "condition", status: "pending" }
      ],
      metrics: {
        avgExecutionTime: "2.3 دقيقة",
        emailsSent: 412,
        conversions: 38,
        errorRate: "1.2%"
      }
    },
    {
      id: 2,
      name: "معالجة تذاكر الدعم التلقائية",
      description: "تصنيف وتوجيه تذاكر الدعم تلقائياً حسب الأولوية والنوع",
      status: "نشط",
      successRate: 87,
      totalRuns: 89,
      lastRun: "منذ 5 دقائق",
      category: "دعم العملاء",
      steps: [
        { id: 1, name: "استلام تذكرة جديدة", type: "trigger", status: "completed" },
        { id: 2, name: "تحليل المحتوى", type: "ai", status: "completed" },
        { id: 3, name: "تصنيف الأولوية", type: "condition", status: "completed" },
        { id: 4, name: "توجيه للمختص", type: "action", status: "active" },
        { id: 5, name: "إرسال تأكيد للعميل", type: "action", status: "pending" }
      ],
      metrics: {
        avgExecutionTime: "1.8 دقيقة",
        ticketsProcessed: 234,
        accurateClassification: "92%",
        errorRate: "2.1%"
      }
    },
    {
      id: 3,
      name: "تحديث البيانات المالية",
      description: "مزامنة البيانات المالية من مصادر متعددة وإنشاء التقارير",
      status: "متوقف",
      successRate: 98,
      totalRuns: 45,
      lastRun: "منذ يومين",
      category: "مالية",
      steps: [
        { id: 1, name: "جدولة يومية", type: "trigger", status: "waiting" },
        { id: 2, name: "جمع البيانات", type: "action", status: "waiting" },
        { id: 3, name: "تحقق من التطابق", type: "condition", status: "waiting" },
        { id: 4, name: "إنشاء التقرير", type: "action", status: "waiting" },
        { id: 5, name: "إرسال للإدارة", type: "action", status: "waiting" }
      ],
      metrics: {
        avgExecutionTime: "5.2 دقيقة",
        dataPoints: 1250,
        accuracy: "99.1%",
        errorRate: "0.3%"
      }
    }
  ];

  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof workflows[0] | null>(null);

  const workflowTemplates = [
    {
      id: 1,
      name: "أتمتة الفواتير",
      description: "إنشاء وإرسال الفواتير تلقائياً",
      category: "مالية",
      estimatedTime: "30 دقيقة",
      complexity: "متوسط"
    },
    {
      id: 2,
      name: "متابعة المبيعات",
      description: "متابعة العملاء المحتملين تلقائياً",
      category: "مبيعات",
      estimatedTime: "20 دقيقة",
      complexity: "سهل"
    },
    {
      id: 3,
      name: "تقارير الأداء",
      description: "إنشاء تقارير الأداء الأسبوعية",
      category: "تقارير",
      estimatedTime: "45 دقيقة",
      complexity: "صعب"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-success/20 text-success";
      case "متوقف":
        return "bg-error/20 text-error";
      case "مجدول":
        return "bg-warning/20 text-warning";
      default:
        return "bg-text-muted/20 text-text-muted";
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "trigger":
        return "Play";
      case "action":
        return "Zap";
      case "condition":
        return "GitBranch";
      case "delay":
        return "Clock";
      case "ai":
        return "Bot";
      default:
        return "Circle";
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "active":
        return "text-warning";
      case "pending":
        return "text-primary";
      case "waiting":
        return "text-text-muted";
      default:
        return "text-text-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header 
        title="منشئ سير العمل" 
        subtitle="أتمت العمليات التجارية وراقب الأداء"
      />
      
      <main className="mr-72 pt-0">
        <div className="p-6 space-y-8">
          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-accent hover:bg-accent-600 text-background"
                onClick={() => setShowBuilder(true)}
              >
                <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                إنشاء سير عمل جديد
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <AppIcon name="FileText" className="w-4 h-4 ml-2" />
                استيراد قالب
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <select className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>جميع الفئات</option>
                <option>مبيعات</option>
                <option>دعم العملاء</option>
                <option>مالية</option>
                <option>تقارير</option>
              </select>
              <select className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>جميع الحالات</option>
                <option>نشط</option>
                <option>متوقف</option>
                <option>مجدول</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Workflows List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-text-primary">سير العمل النشط</h3>
              
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className={`glass-effect border p-6 cursor-pointer transition-all duration-300 ${
                      selectedWorkflow?.id === workflow.id 
                        ? "border-accent/50 bg-accent/5" 
                        : "border-white/10 hover:border-accent/30"
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-text-primary">{workflow.name}</h4>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-text-secondary text-sm mb-3">{workflow.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-text-muted">الفئة: {workflow.category}</span>
                          <span className="text-text-muted">آخر تشغيل: {workflow.lastRun}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">{workflow.successRate}%</p>
                        <p className="text-xs text-text-secondary">معدل النجاح</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">{workflow.totalRuns}</p>
                        <p className="text-xs text-text-secondary">عدد التشغيل</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-warning">{workflow.steps.length}</p>
                        <p className="text-xs text-text-secondary">عدد الخطوات</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-secondary">{workflow.metrics.avgExecutionTime}</p>
                        <p className="text-xs text-text-secondary">متوسط الوقت</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Workflow Details or Templates */}
            <div className="space-y-6">
              {selectedWorkflow ? (
                <>
                  <Card className="glass-effect border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-text-primary">تفاصيل سير العمل</h3>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                          <AppIcon name="Pause" className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                          <AppIcon name="Edit" className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">خطوات سير العمل</h4>
                        <div className="space-y-3">
                          {selectedWorkflow.steps.map((step: any, index: number) => (
                            <div key={step.id} className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.status === "completed" ? "bg-success/20" :
                                step.status === "active" ? "bg-warning/20" :
                                step.status === "pending" ? "bg-primary/20" :
                                "bg-text-muted/20"
                              }`}>
                                <AppIcon 
                                  name={getStepIcon(step.type)} 
                                  className={`w-4 h-4 ${getStepStatusColor(step.status)}`} 
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">{step.name}</p>
                                <p className="text-xs text-text-secondary">{step.type}</p>
                              </div>
                              {index < selectedWorkflow.steps.length - 1 && (
                                <div className="w-px h-6 bg-white/10 mx-4"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-text-primary mb-2">إحصائيات الأداء</h4>
                        <div className="space-y-3">
                          {Object.entries(selectedWorkflow.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-text-secondary text-sm">
                                {key === "avgExecutionTime" ? "متوسط وقت التنفيذ" :
                                 key === "emailsSent" ? "رسائل مُرسلة" :
                                 key === "conversions" ? "تحويلات" :
                                 key === "errorRate" ? "معدل الأخطاء" :
                                 key === "ticketsProcessed" ? "تذاكر معالجة" :
                                 key === "accurateClassification" ? "دقة التصنيف" :
                                 key === "dataPoints" ? "نقاط البيانات" :
                                 key === "accuracy" ? "الدقة" : key}
                              </span>
                              <span className="text-text-primary font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-accent hover:bg-accent-600 text-background"
                      onClick={() => console.log('تم تشغيل سير العمل:', selectedWorkflow.name)}
                    >
                      <AppIcon name="Play" className="w-4 h-4 ml-2" />
                      تشغيل يدوي
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      onClick={() => console.log('تم تكرار سير العمل:', selectedWorkflow.name)}
                    >
                      <AppIcon name="Copy" className="w-4 h-4 ml-2" />
                      تكرار سير العمل
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-warning text-warning hover:bg-warning/10"
                      onClick={() => console.log('عرض تقارير سير العمل:', selectedWorkflow.name)}
                    >
                      <AppIcon name="BarChart3" className="w-4 h-4 ml-2" />
                      عرض التقارير
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="glass-effect border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">قوالب سير العمل</h3>
                  <div className="space-y-4">
                    {workflowTemplates.map((template) => (
                      <div key={template.id} className="p-4 glass-light border border-white/5 rounded-lg hover:border-accent/30 transition-all duration-300 cursor-pointer">
                        <h4 className="font-medium text-text-primary mb-2">{template.name}</h4>
                        <p className="text-text-secondary text-sm mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-text-muted">
                              {template.category}
                            </Badge>
                            <span className="text-text-muted">{template.estimatedTime}</span>
                          </div>
                          <span className={`text-xs ${
                            template.complexity === "سهل" ? "text-success" :
                            template.complexity === "متوسط" ? "text-warning" :
                            "text-error"
                          }`}>
                            {template.complexity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-accent hover:bg-accent-600 text-background"
                    onClick={() => setShowBuilder(true)}
                  >
                    <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                    إنشاء من قالب
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Workflow Builder Modal */}
          {showBuilder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">منشئ سير العمل البصري</h2>
                    <Button variant="ghost" onClick={() => setShowBuilder(false)}>
                      <AppIcon name="X" className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Tools Panel */}
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-3">أدوات السير</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <AppIcon name="Play" className="w-4 h-4 text-primary" />
                            <span className="text-sm">نقطة البداية</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <AppIcon name="Mail" className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">إرسال إيميل</span>
                          </div>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg cursor-pointer hover:bg-green-500/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <AppIcon name="Phone" className="w-4 h-4 text-green-500" />
                            <span className="text-sm">إرسال رسالة</span>
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <AppIcon name="Clock" className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">انتظار</span>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <AppIcon name="GitBranch" className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">شرط</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Canvas */}
                    <div className="lg:col-span-3">
                      <div className="border-2 border-dashed border-muted rounded-lg h-96 flex items-center justify-center bg-muted/5">
                        <div className="text-center text-muted-foreground">
                          <AppIcon name="Plus" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>اسحب الأدوات من اليسار لبناء سير العمل</p>
                          <p className="text-sm mt-2">أو اختر من القوالب الجاهزة</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowBuilder(false)}>
                      إلغاء
                    </Button>
                    <Button className="bg-primary">
                      حفظ سير العمل
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkflowAutomation;
