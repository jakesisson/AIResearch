import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Smartphone,
  Globe,
  Zap,
  Search,
  Shield,
  Database
} from 'lucide-react';

export default function UXImprovements() {
  const improvements = [
    {
      category: 'الاستجابة للجوال',
      status: 'completed',
      items: [
        'تحسين عرض الجداول على الشاشات الصغيرة',
        'تحسين قوائم التنقل للمس',
        'تحسين أحجام الأزرار والنصوص',
        'إضافة gestures للتفاعل'
      ]
    },
    {
      category: 'تحسين التنقل',
      status: 'completed',
      items: [
        'إصلاح جميع الروابط المكسورة',
        'إضافة breadcrumbs للصفحات',
        'تحسين sidebar navigation',
        'إضافة shortcuts للوحة المفاتيح'
      ]
    },
    {
      category: 'نظام البحث المتقدم',
      status: 'completed',
      items: [
        'بحث شامل عبر جميع البيانات',
        'فلترة متقدمة بالفئات',
        'autocomplete ذكي',
        'حفظ عمليات البحث المتكررة'
      ]
    },
    {
      category: 'تحسين الأداء',
      status: 'completed',
      items: [
        'lazy loading للصفحات الثقيلة',
        'caching للبيانات المتكررة',
        'تحسين أوقات التحميل',
        'ضغط الصور والملفات'
      ]
    },
    {
      category: 'الأمان المتقدم',
      status: 'completed',
      items: [
        'المصادقة الثنائية (2FA)',
        'إدارة الجلسات المتقدمة',
        'تشفير البيانات الحساسة',
        'audit logs شامل'
      ]
    },
    {
      category: 'دعم اللغات',
      status: 'in-progress',
      items: [
        'تحسين دعم العربية (RTL)',
        'إضافة دعم الإنجليزية',
        'ترجمة جميع النصوص',
        'تبديل اللغة الفوري'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">قيد التطوير</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">تحسينات تجربة المستخدم</h1>
          <p className="text-muted-foreground">
            التحسينات المطبقة لتعزيز تجربة المستخدم وأداء النظام
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">المكتمل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">5</div>
              <p className="text-xs text-muted-foreground">فئات مكتملة</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">قيد التطوير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <p className="text-xs text-muted-foreground">فئة قيد العمل</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي التحسينات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">24</div>
              <p className="text-xs text-muted-foreground">تحسين مطبق</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">83%</div>
              <p className="text-xs text-muted-foreground">من التحسينات</p>
            </CardContent>
          </Card>
        </div>

        {/* Improvements List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {improvements.map((improvement, index) => (
            <Card key={index} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(improvement.status)}
                    {improvement.category}
                  </CardTitle>
                  {getStatusBadge(improvement.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {improvement.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">استجابة مثالية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                تصميم متجاوب بالكامل يعمل بسلاسة على جميع الأجهزة
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">بحث ذكي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                نظام بحث متقدم مع فلترة ذكية واقتراحات فورية
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">أداء سريع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                أوقات تحميل محسنة مع lazy loading وcaching ذكي
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">أمان متقدم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                مصادقة ثنائية وتشفير شامل لحماية البيانات
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">دعم متعدد اللغات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                دعم كامل للعربية والإنجليزية مع تبديل فوري
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">إدارة البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                نسخ احتياطي تلقائي وإدارة متقدمة للبيانات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
            <CardDescription>
              التحسينات المخططة للمراحل القادمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">إكمال دعم اللغة الإنجليزية</p>
                  <p className="text-sm text-muted-foreground">ترجمة شاملة وتبديل اللغة</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">2</span>
                </div>
                <div>
                  <p className="font-medium">تطبيق الجوال المخصص</p>
                  <p className="text-sm text-muted-foreground">React Native مع offline mode</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">تحليلات متقدمة</p>
                  <p className="text-sm text-muted-foreground">لوحات تحكم تفاعلية وتقارير ذكية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}