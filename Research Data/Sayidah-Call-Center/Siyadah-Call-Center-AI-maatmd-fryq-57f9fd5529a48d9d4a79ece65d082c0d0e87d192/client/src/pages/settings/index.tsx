import { useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/Header";
import { AppIcon } from "@/components/AppIcon";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingsChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveComplete = () => {
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header 
        title="الإعدادات والتكوين" 
        subtitle="إدارة إعدادات المنصة والتكاملات الخارجية"
        showVoiceCommand={false}
      />
      
      <main className="mr-72 pt-0">
        <div className="p-6 space-y-6">
          {/* Settings Navigation */}
          <Tabs defaultValue="integrations" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="glass-effect border border-white/10">
                <TabsTrigger value="integrations" className="flex items-center space-x-2">
                  <AppIcon name="Plug" className="w-4 h-4" />
                  <span>التكاملات</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <AppIcon name="Bell" className="w-4 h-4" />
                  <span>الإشعارات</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <AppIcon name="User" className="w-4 h-4" />
                  <span>الملف الشخصي</span>
                </TabsTrigger>
                <TabsTrigger value="language" className="flex items-center space-x-2">
                  <AppIcon name="Globe" className="w-4 h-4" />
                  <span>اللغة</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <AppIcon name="Shield" className="w-4 h-4" />
                  <span>الأمان</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center space-x-2">
                  <AppIcon name="Palette" className="w-4 h-4" />
                  <span>المظهر</span>
                </TabsTrigger>
              </TabsList>
              
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-3">
                  <span className="text-warning text-sm">يوجد تغييرات غير محفوظة</span>
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            <TabsContent value="integrations">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">التكاملات الخارجية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "WhatsApp Business", icon: "MessageSquare", status: "متصل", color: "green" },
                    { name: "Gmail", icon: "Mail", status: "متصل", color: "green" },
                    { name: "Slack", icon: "Hash", status: "غير متصل", color: "gray" },
                    { name: "Microsoft Teams", icon: "Users", status: "غير متصل", color: "gray" },
                    { name: "Zoom", icon: "Video", status: "متصل", color: "green" },
                    { name: "Salesforce", icon: "Database", status: "غير متصل", color: "gray" }
                  ].map((integration, index) => (
                    <Card key={index} className="p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            integration.color === 'green' ? 'bg-green-500/20' : 'bg-slate-500/20'
                          }`}>
                            <AppIcon name={integration.icon as any} className={`w-5 h-5 ${
                              integration.color === 'green' ? 'text-green-500' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{integration.name}</p>
                            <Badge variant={integration.color === 'green' ? 'default' : 'secondary'}>
                              {integration.status}
                            </Badge>
                          </div>
                        </div>
                        <Switch checked={integration.color === 'green'} />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary text-primary hover:bg-primary/10"
                        onClick={() => {
                          console.log(`تم النقر على ${integration.name}`);
                          // معالجة التكامل هنا
                        }}
                      >
                        {integration.status === 'متصل' ? 'إعادة ضبط' : 'ربط الآن'}
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">إعدادات الإشعارات</h3>
                <div className="space-y-6">
                  {[
                    { title: "إشعارات البريد الإلكتروني", description: "تلقي إشعارات عبر البريد الإلكتروني", enabled: true },
                    { title: "إشعارات SMS", description: "تلقي رسائل نصية قصيرة", enabled: false },
                    { title: "إشعارات المتصفح", description: "إشعارات فورية في المتصفح", enabled: true },
                    { title: "تقارير أسبوعية", description: "تقرير أسبوعي بالأداء والإحصائيات", enabled: true },
                    { title: "تنبيهات الأمان", description: "إشعارات عند محاولات الدخول المشبوهة", enabled: true },
                    { title: "تحديثات المنتج", description: "إشعارات حول الميزات الجديدة", enabled: false }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-text-primary">{notification.title}</p>
                        <p className="text-sm text-text-secondary">{notification.description}</p>
                      </div>
                      <Switch checked={notification.enabled} />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">معلومات الملف الشخصي</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128" 
                      alt="صورة المستخدم" 
                      className="w-24 h-24 rounded-full border-4 border-accent/30 mb-4"
                    />
                    <Button variant="outline" className="border-primary text-primary">
                      <AppIcon name="Camera" className="w-4 h-4 ml-2" />
                      تغيير الصورة
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <Input 
                        id="fullName" 
                        defaultValue="أحمد الإداري" 
                        className="bg-surface border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue="ahmed@company.com"
                        className="bg-surface border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input 
                        id="phone" 
                        defaultValue="+966 50 123 4567"
                        className="bg-surface border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">المنصب</Label>
                      <Input 
                        id="role" 
                        defaultValue="مدير النظام"
                        className="bg-surface border-white/10"
                      />
                    </div>
                    
                    <Button className="bg-accent hover:bg-accent-600 text-background">
                      حفظ التغييرات
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">إعدادات الأمان والخصوصية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">تغيير كلمة المرور</h4>
                      <div className="space-y-3">
                        <Input type="password" placeholder="كلمة المرور الحالية" className="bg-surface border-white/10" />
                        <Input type="password" placeholder="كلمة المرور الجديدة" className="bg-surface border-white/10" />
                        <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" className="bg-surface border-white/10" />
                        <Button className="bg-accent hover:bg-accent-600 text-background">
                          تحديث كلمة المرور
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">إعدادات المصادقة</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">المصادقة الثنائية</p>
                            <p className="text-sm text-text-secondary">حماية إضافية لحسابك</p>
                          </div>
                          <Switch checked={true} />
                        </div>

                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">تسجيل الدخول التلقائي</p>
                            <p className="text-sm text-text-secondary">البقاء مسجل الدخول لمدة 30 يوم</p>
                          </div>
                          <Switch checked={false} />
                        </div>

                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">تسجيل الأنشطة</p>
                            <p className="text-sm text-text-secondary">تسجيل جميع عمليات تسجيل الدخول</p>
                          </div>
                          <Switch checked={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="glass-effect border border-white/10 p-6">
                <h3 className="text-xl font-bold text-text-primary mb-6">إعدادات المظهر والعرض</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">إعدادات النظام</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">الوضع المظلم</p>
                            <p className="text-sm text-text-secondary">تشغيل المظهر المظلم</p>
                          </div>
                          <Switch checked={true} />
                        </div>

                        <div className="space-y-2">
                          <Label>اللغة</Label>
                          <select className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50">
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>المنطقة الزمنية</Label>
                          <select className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50">
                            <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                            <option value="Asia/Dubai">دبي (GMT+4)</option>
                            <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>حجم الخط</Label>
                          <select className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50">
                            <option value="small">صغير</option>
                            <option value="medium" selected>متوسط</option>
                            <option value="large">كبير</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">إدارة البيانات</h4>
                      <div className="space-y-4">
                        <Button className="w-full bg-primary hover:bg-primary-600 text-background">
                          <AppIcon name="Download" className="w-4 h-4 ml-2" />
                          تصدير البيانات
                        </Button>
                        <Button className="w-full bg-warning hover:bg-warning-600 text-background">
                          <AppIcon name="RefreshCw" className="w-4 h-4 ml-2" />
                          مسح البيانات المؤقتة
                        </Button>
                        <Button className="w-full bg-error hover:bg-error-600 text-background">
                          <AppIcon name="Trash2" className="w-4 h-4 ml-2" />
                          حذف الحساب نهائياً
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">إعدادات الإشعارات المرئية</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">الرسوم المتحركة</p>
                            <p className="text-sm text-text-secondary">تشغيل التأثيرات البصرية</p>
                          </div>
                          <Switch checked={true} />
                        </div>

                        <div className="flex items-center justify-between p-4 glass-light border border-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-text-primary">الأصوات</p>
                            <p className="text-sm text-text-secondary">تشغيل أصوات النظام</p>
                          </div>
                          <Switch checked={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
