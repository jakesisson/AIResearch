import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Table, BarChart3, Users, Workflow, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/ui/sidebar';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (type: string, format: string) => {
    setLoading(`${type}-${format}`);
    try {
      const response = await fetch(`/api/export/${type}/${format}`);
      
      if (!response.ok) {
        throw new Error('فشل في التصدير');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تحميل تقرير ${type} بصيغة ${format.toUpperCase()}`,
      });
    } catch (error) {
      // Handle export error gracefully
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      id: 'opportunities',
      title: 'تقرير الفرص التجارية',
      description: 'تقرير شامل لجميع الفرص التجارية وحالتها الحالية',
      icon: BarChart3,
      color: 'bg-blue-500',
      count: 'المبيعات والأرباح'
    },
    {
      id: 'tickets',
      title: 'تقرير التذاكر',
      description: 'تقرير خدمة العملاء وحالة التذاكر',
      icon: Headphones,
      color: 'bg-green-500',
      count: 'خدمة العملاء'
    },
    {
      id: 'workflows',
      title: 'تقرير سير العمل',
      description: 'أداء وإحصائيات سير العمل الآلي',
      icon: Workflow,
      color: 'bg-purple-500',
      count: 'الأتمتة'
    }
  ];

  const formats = [
    { id: 'excel', name: 'Excel', icon: Table, description: 'ملف Excel قابل للتحرير' },
    { id: 'pdf', name: 'PDF', icon: FileText, description: 'ملف PDF للطباعة' },
    { id: 'csv', name: 'CSV', icon: Download, description: 'بيانات منفصلة بفواصل' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <Sidebar />
      
      <div className="fixed top-0 right-0 left-72 bg-gradient-to-l from-accent/20 to-primary/20 backdrop-blur-lg border-b border-white/10 z-40">
        <div className="p-6 text-right">
          <h1 className="text-2xl font-bold text-white mb-2">التقارير والتصدير</h1>
          <p className="text-muted-foreground">تصدير التقارير المفصلة بصيغ مختلفة للتحليل والمراجعة</p>
        </div>
      </div>
      
      <main className="mr-72 pt-24 pb-6">
        <div className="px-6 space-y-6 max-w-5xl">
          <div className="grid gap-6">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="glass-effect border border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${report.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <CardTitle className="text-xl text-white">{report.title}</CardTitle>
                          <CardDescription className="mt-1 text-muted-foreground">
                            {report.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                        {report.count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formats.map((format) => {
                        const FormatIcon = format.icon;
                        const isLoading = loading === `${report.id}-${format.id}`;
                        
                        return (
                          <Button
                            key={format.id}
                            variant="outline"
                            className="h-auto p-4 justify-start border-white/10 hover:border-accent/50 hover:bg-accent/10"
                            onClick={() => handleExport(report.id, format.id)}
                            disabled={isLoading}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <FormatIcon className="h-5 w-5 text-accent" />
                              <div className="text-right">
                                <div className="font-medium text-white">
                                  {isLoading ? 'جاري التصدير...' : `تصدير ${format.name}`}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format.description}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-8 glass-effect border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right text-white">
                <Users className="h-5 w-5" />
                معلومات التصدير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-right">
                  <h4 className="font-medium mb-2 text-accent">Excel (.xlsx)</h4>
                  <p className="text-muted-foreground">
                    مناسب للتحليل المتقدم والرسوم البيانية. يحتوي على جداول متعددة وتنسيق متقدم.
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-medium mb-2 text-accent">PDF (.pdf)</h4>
                  <p className="text-muted-foreground">
                    مناسب للطباعة والمشاركة. تقرير مصمم بشكل احترافي جاهز للعرض.
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-medium mb-2 text-accent">CSV (.csv)</h4>
                  <p className="text-muted-foreground">
                    بيانات خام قابلة للاستيراد في أنظمة أخرى. مناسب للتحليل البرمجي.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}