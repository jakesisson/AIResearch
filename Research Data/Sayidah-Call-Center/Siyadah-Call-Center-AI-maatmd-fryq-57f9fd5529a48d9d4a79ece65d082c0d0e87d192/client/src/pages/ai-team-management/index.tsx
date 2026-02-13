import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/Header";
import { AppIcon } from "@/components/AppIcon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
const AiTeamManagement = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  // استخدام بيانات الوكلاء الحقيقية
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['/api/ai-agents'],
    queryFn: async () => {
      const response = await fetch('/api/ai-agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json();
    }
  });

  const teamMembers = agentsData?.agents || [];

  const overallStats = {
    totalRevenue: "2.0M ريال",
    avgConversionRate: 91,
    totalDeals: 226,
    avgResponseTime: "1.6 دقيقة",
    customerSatisfaction: 96,
    activeMembers: 3
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header 
        title="إدارة الفريق الذكي" 
        subtitle="مراقبة وإدارة أداء فريق الذكاء الاصطناعي"
      />

      <main className="mr-72 pt-0">
        <div className="p-6 space-y-8">
          {/* Overall Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="glass-effect border border-white/10 p-4 hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <AppIcon name="DollarSign" className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">إجمالي الإيرادات</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.totalRevenue}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <AppIcon name="Target" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">معدل التحويل</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.avgConversionRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-warning/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AppIcon name="Briefcase" className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">إجمالي الصفقات</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.totalDeals}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <AppIcon name="Clock" className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">وقت الاستجابة</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.avgResponseTime}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-success/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  <AppIcon name="Heart" className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">رضا العملاء</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.customerSatisfaction}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect border border-white/10 p-4 hover:border-text-muted/30 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-text-muted/20 rounded-lg">
                  <AppIcon name="Users" className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">أعضاء نشطين</p>
                  <p className="text-lg font-bold text-text-primary">{overallStats.activeMembers}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Members List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">أعضاء الفريق</h3>
                <Button className="bg-accent hover:bg-accent-600 text-background">
                  <AppIcon name="Plus" className="w-4 h-4 ml-2" />
                  إضافة عضو جديد
                </Button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <Card 
                    key={member.id} 
                    className={`glass-effect border p-6 cursor-pointer transition-all duration-300 ${
                      selectedMember?.id === member.id 
                        ? "border-accent/50 bg-accent/5" 
                        : "border-white/10 hover:border-accent/30"
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full border-2 border-accent/30"
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-text-primary">{member.name}</h4>
                          <p className="text-text-secondary">{member.role}</p>
                          <p className="text-sm text-text-muted">{member.specialization}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          member.status === "نشطة" ? "bg-success/20 text-success" :
                          member.status === "يعمل" ? "bg-warning/20 text-warning" :
                          "bg-text-muted/20 text-text-muted"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ml-2 ${
                            member.status === "نشطة" ? "bg-success" :
                            member.status === "يعمل" ? "bg-warning" :
                            "bg-text-muted"
                          }`}></div>
                          {member.status}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{member.conversionRate}%</p>
                        <p className="text-xs text-text-secondary">معدل النجاح</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{member.activeDeals}</p>
                        <p className="text-xs text-text-secondary">صفقات نشطة</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-warning">{member.totalDeals}</p>
                        <p className="text-xs text-text-secondary">إجمالي الصفقات</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">{member.responseTime}</p>
                        <p className="text-xs text-text-secondary">وقت الاستجابة</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">الأداء هذا الشهر</span>
                        <span className="text-text-primary font-medium">{member.performance.thisMonth}%</span>
                      </div>
                      <Progress value={member.performance.thisMonth} className="h-2" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Member Details Panel */}
            <div className="space-y-6">
              {selectedMember ? (
                <>
                  <Card className="glass-effect border border-white/10 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <img 
                        src={selectedMember.avatar} 
                        alt={selectedMember.name}
                        className="w-20 h-20 rounded-full border-2 border-accent/30"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-text-primary">{selectedMember.name}</h3>
                        <p className="text-text-secondary">{selectedMember.role}</p>
                        <p className="text-sm text-text-muted">{selectedMember.specialization}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-text-primary mb-2">المهارات</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-surface rounded-full text-sm text-text-secondary">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-text-primary mb-2">الإحصائيات التفصيلية</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">الإيرادات المحققة</span>
                            <span className="text-text-primary font-medium">{selectedMember.revenue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">متوسط حجم الصفقة</span>
                            <span className="text-text-primary font-medium">{selectedMember.avgDealSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">إجمالي الصفقات</span>
                            <span className="text-text-primary font-medium">{selectedMember.totalDeals}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-text-primary mb-2">مقارنة الأداء</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-text-secondary">هذا الشهر</span>
                              <span className="text-sm text-text-primary">{selectedMember.performance.thisMonth}%</span>
                            </div>
                            <Progress value={selectedMember.performance.thisMonth} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-text-secondary">الشهر الماضي</span>
                              <span className="text-sm text-text-primary">{selectedMember.performance.lastMonth}%</span>
                            </div>
                            <Progress value={selectedMember.performance.lastMonth} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-text-secondary">هذا الربع</span>
                              <span className="text-sm text-text-primary">{selectedMember.performance.thisQuarter}%</span>
                            </div>
                            <Progress value={selectedMember.performance.thisQuarter} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-effect border border-white/10 p-6">
                    <h4 className="font-medium text-text-primary mb-4">الأنشطة الحديثة</h4>
                    <div className="space-y-3">
                      {selectedMember.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 glass-light border border-white/5 rounded-lg">
                          <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                            <AppIcon name="Activity" className="w-3 h-3 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">{activity.description}</p>
                            <p className="text-xs text-text-muted">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <Button className="w-full bg-accent hover:bg-accent-600 text-background">
                      <AppIcon name="Settings" className="w-4 h-4 ml-2" />
                      إعدادات العضو
                    </Button>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                      <AppIcon name="BarChart3" className="w-4 h-4 ml-2" />
                      عرض التقارير التفصيلية
                    </Button>
                    <Button variant="outline" className="w-full border-warning text-warning hover:bg-warning/10">
                      <AppIcon name="Pause" className="w-4 h-4 ml-2" />
                      إيقاف مؤقت
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="glass-effect border border-white/10 p-6 text-center">
                  <AppIcon name="UserCheck" className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">اختر عضو من الفريق</h3>
                  <p className="text-text-secondary">انقر على أي عضو من القائمة لعرض التفاصيل والإحصائيات</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AiTeamManagement;