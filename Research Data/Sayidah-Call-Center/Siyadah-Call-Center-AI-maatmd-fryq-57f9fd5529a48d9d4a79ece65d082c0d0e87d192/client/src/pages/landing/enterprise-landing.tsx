import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  Star,
  Check,
  Building2,
  Globe,
  BarChart3,
  Play,
  Phone,
  Mail,
  CheckCircle,
  Award,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'الوكلاء الذكيون',
    description: 'نظام متطور من الوكلاء الذكيين يعملون بتقنية GPT-4o لأتمتة المهام التجارية',
    color: 'text-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'واتساب AI',
    description: 'أتمتة كاملة لرسائل واتساب مع ردود ذكية باللغة العربية',
    color: 'text-green-600'
  },
  {
    icon: TrendingUp,
    title: 'إدارة المبيعات',
    description: 'نظام CRM متكامل لتتبع الفرص التجارية وإدارة العملاء',
    color: 'text-purple-600'
  },
  {
    icon: BarChart3,
    title: 'التحليلات الذكية',
    description: 'تقارير وإحصائيات مفصلة لاتخاذ قرارات مدروسة',
    color: 'text-orange-600'
  }
];

const plans = [
  {
    name: 'مبتدئ',
    nameEn: 'Starter',
    price: '299',
    period: 'شهرياً',
    description: 'مثالي للشركات الناشئة',
    features: [
      'حتى 10 مستخدمين',
      '1,000 رسالة شهرياً',
      'الدردشة الأساسية',
      'التقارير الأساسية',
      'الدعم عبر البريد'
    ],
    buttonText: 'ابدأ المجاني',
    popular: false
  },
  {
    name: 'احترافي',
    nameEn: 'Professional',
    price: '599',
    period: 'شهرياً',
    description: 'للشركات المتوسطة',
    features: [
      'حتى 50 مستخدم',
      '10,000 رسالة شهرياً',
      'جميع ميزات الذكاء الاصطناعي',
      'تكامل واتساب',
      'المكالمات الصوتية',
      'التقارير المتقدمة',
      'الدعم المباشر'
    ],
    buttonText: 'ابدأ التجربة',
    popular: true
  },
  {
    name: 'مؤسسي',
    nameEn: 'Enterprise',
    price: '1499',
    period: 'شهرياً',
    description: 'للمؤسسات الكبيرة',
    features: [
      'مستخدمين غير محدود',
      'رسائل غير محدودة',
      'جميع الميزات المتقدمة',
      'التكاملات المخصصة',
      'مدير نجاح مخصص',
      'الدعم المميز 24/7',
      'التخصيص الكامل'
    ],
    buttonText: 'تواصل معنا',
    popular: false
  }
];

const testimonials = [
  {
    name: 'أحمد المالكي',
    position: 'مدير عام، شركة التقنية المتقدمة',
    content: 'سيادة AI غيرت طريقة عملنا بالكامل. توفير الوقت والجهد أصبح ملحوظاً في جميع العمليات.',
    rating: 5
  },
  {
    name: 'فاطمة الزهراني',
    position: 'مديرة المبيعات، مجموعة الابتكار',
    content: 'النظام سهل الاستخدام ومتطور. الدعم الفني ممتاز والنتائج فاقت توقعاتنا.',
    rating: 5
  },
  {
    name: 'محمد العتيبي',
    position: 'CEO، ستارت أب الرياض',
    content: 'استثمار حقيقي في المستقبل. النظام ساعدنا على النمو بشكل أسرع من المتوقع.',
    rating: 5
  }
];

export default function EnterpriseLanding() {
  const [, setLocation] = useLocation();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Professional Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group cursor-pointer" onClick={() => setLocation('/')}>
              <div className="relative">
                <Building2 className="h-8 w-8 text-blue-600 ml-2 transform group-hover:scale-110 transition-transform duration-200" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                سيادة AI
              </span>
              <Badge variant="secondary" className="mr-2 text-xs bg-blue-100 text-blue-700">
                PRO
              </Badge>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/auth/login')}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                تسجيل الدخول
              </Button>
              <Button 
                onClick={() => setLocation('/auth/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                ابدأ الآن
                <Sparkles className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Building2 className="h-20 w-20 text-blue-600 animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Award className="h-8 w-8 text-yellow-500 animate-bounce" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 leading-tight">
              سيادة AI
            </h1>
            
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm px-4 py-2 mb-4">
                <CheckCircle className="h-4 w-4 ml-1" />
                موثوق من +10,000 شركة عربية
              </Badge>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-6">
              منصة الذكاء الاصطناعي المتقدمة للأعمال العربية
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              حلول ذكية ومتطورة لأتمتة العمليات التجارية باللغة العربية. 
              نظام متكامل يجمع بين أحدث تقنيات الذكاء الاصطناعي وأفضل الممارسات في إدارة الأعمال.
              <strong className="text-blue-600"> زيادة الإنتاجية بنسبة 300% مضمونة</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                onClick={() => setLocation('/auth/login')}
              >
                ابدأ التجربة المجانية - 30 يوم
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Play className="ml-2 h-5 w-5" />
                شاهد العرض التوضيحي
              </Button>
            </div>
            
            {/* Live Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">21.7M+</div>
                <div className="text-sm text-gray-600">ريال سعودي معالج</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">300%</div>
                <div className="text-sm text-gray-600">زيادة الإنتاجية</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-purple-600">10K+</div>
                <div className="text-sm text-gray-600">شركة تثق بنا</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">دعم متواصل</div>
              </div>
            </div>
            
            {/* Demo Credentials */}
            <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-blue-800 mb-3">حسابات تجريبية جاهزة:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">احترافي</Badge>
                    <p>admin@demo.siyadah.ai</p>
                    <p>demo123456</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">مبتدئ</Badge>
                    <p>admin@startup.tech</p>
                    <p>demo123456</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">مؤسسي</Badge>
                    <p>admin@enterprise.corp</p>
                    <p>demo123456</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ميزات متطورة لأعمالك
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نظام شامل يجمع بين أحدث تقنيات الذكاء الاصطناعي وأفضل الممارسات في إدارة الأعمال
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              خطط مرنة تناسب احتياجاتك
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اختر الخطة المناسبة لحجم أعمالك. يمكنك الترقية أو التغيير في أي وقت
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`border-2 ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'} 
                           hover:shadow-lg transition-all duration-300 relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">الأكثر شعبية</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-600 mr-2">ر.س</span>
                    <span className="text-gray-500">/ {plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 ml-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                    onClick={() => setLocation('/auth/login')}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ماذا يقول عملاؤنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              آراء وتجارب حقيقية من عملائنا الذين حققوا نتائج مميزة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.position}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            ابدأ رحلتك مع الذكاء الاصطناعي اليوم
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            انضم إلى آلاف الشركات التي تستخدم سيادة AI لتطوير أعمالها وتحقيق نتائج استثنائية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              onClick={() => setLocation('/auth/login')}
            >
              ابدأ التجربة المجانية الآن
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
            >
              تحدث مع فريق المبيعات
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-blue-400 ml-3" />
              <span className="text-2xl font-bold">سيادة AI</span>
            </div>
            <p className="text-gray-400 mb-6">
              منصة الذكاء الاصطناعي الرائدة في المملكة العربية السعودية
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>© 2025 سيادة AI. جميع الحقوق محفوظة.</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}