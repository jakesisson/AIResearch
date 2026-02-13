import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Bot, 
  Zap, 
  Shield, 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Award,
  BarChart3,
  HeadphonesIcon,
  Sparkles
} from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-blue-500" />,
      title: "ذكاء اصطناعي متقدم",
      description: "مساعد ذكي يفهم العربية ويتفاعل مع عملائك بطريقة طبيعية وذكية"
    },
    {
      icon: <Phone className="h-8 w-8 text-green-500" />,
      title: "مكالمات صوتية ذكية",
      description: "نظام مكالمات آلي بصوت طبيعي يتحدث العربية بلهجات مختلفة"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
      title: "واتساب للأعمال",
      description: "أتمتة رسائل واتساب مع ردود ذكية وتفاعل تلقائي مع العملاء"
    },
    {
      icon: <Mail className="h-8 w-8 text-red-500" />,
      title: "إدارة البريد الإلكتروني",
      description: "حملات بريد إلكتروني ذكية مع متابعة تلقائية وتحليل الأداء"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
      title: "تحليلات متقدمة",
      description: "تقارير شاملة وإحصائيات تفصيلية لتحسين أداء أعمالك"
    },
    {
      icon: <Shield className="h-8 w-8 text-teal-500" />,
      title: "أمان عالي المستوى",
      description: "حماية بيانات متقدمة مع تشفير وأمان على مستوى المؤسسات"
    }
  ];

  const testimonials = [
    {
      name: "أحمد المالكي",
      company: "شركة الرياض التجارية",
      content: "زادت كفاءة خدمة العملاء لدينا بنسبة 300% مع سيادة AI",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "فاطمة العتيبي",
      company: "مؤسسة النور للتقنية",
      content: "النظام ذكي جداً ويفهم احتياجات عملائنا بطريقة مذهلة",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "محمد الغامدي",
      company: "شركة المستقبل للتطوير",
      content: "وفرنا 80% من وقت فريق خدمة العملاء بعد استخدام المنصة",
      rating: 5,
      avatar: "👨‍💻"
    }
  ];

  const pricingPlans = [
    {
      name: "المتاجر الإلكترونية",
      price: "15,000",
      description: "مثالي للمتاجر الإلكترونية الصغيرة والمتوسطة",
      features: [
        "واتساب أوتوماتيك",
        "ردود ذكية بالعربية",
        "تتبع الطلبات",
        "دعم فني 24/7"
      ],
      popular: false
    },
    {
      name: "المطاعم والمقاهي",
      price: "25,000",
      description: "حل شامل لإدارة المطاعم والكافيهات",
      features: [
        "أخذ الطلبات تلقائياً",
        "جدولة التوصيل",
        "إدارة القوائم",
        "تقارير المبيعات",
        "دعم متعدد الفروع"
      ],
      popular: true
    },
    {
      name: "التطبيقات الذكية",
      price: "35,000",
      description: "لتطوير تطبيقات الجوال والويب الذكية",
      features: [
        "API متكامل",
        "ذكاء اصطناعي مخصص",
        "تحليلات متقدمة",
        "تكامل مع الأنظمة",
        "استشارات تقنية"
      ],
      popular: false
    },
    {
      name: "أنظمة CRM المتقدمة",
      price: "45,000",
      description: "نظام شامل لإدارة العلاقات مع العملاء",
      features: [
        "إدارة شاملة للعملاء",
        "أتمتة المبيعات",
        "مكالمات ذكية",
        "تقارير تنفيذية",
        "تدريب الفريق",
        "دعم مخصص"
      ],
      popular: false
    }
  ];

  const stats = [
    { number: "500+", label: "عميل راضي" },
    { number: "95%", label: "معدل الرضا" },
    { number: "24/7", label: "دعم مستمر" },
    { number: "99.9%", label: "وقت التشغيل" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                سيادة AI
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">المميزات</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الأسعار</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">آراء العملاء</a>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-lg">
                <Award className="w-4 h-4 ml-2" />
                الحل الأذكى لأتمتة الأعمال
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                مستقبل <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">الذكاء الاصطناعي</span>
                <br />
                لأعمالك
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                منصة متكاملة تجمع بين الذكاء الاصطناعي والأتمتة الذكية لتحويل طريقة تفاعلك مع العملاء
                <br />
                مع دعم كامل للغة العربية وجميع اللهجات المحلية
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    ابدأ مجاناً الآن
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <Phone className="ml-2 h-5 w-5" />
                  احجز عرض توضيحي
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              مميزات تقنية متقدمة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              حلول ذكية ومتطورة لجميع احتياجات أعمالك مع تقنيات الذكاء الاصطناعي الحديثة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              خطط أسعار مرنة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اختر الخطة المناسبة لحجم عملك ومتطلباتك التقنية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    الأكثر شعبية
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400 mr-1">ريال</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500 ml-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-3 rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  اختر هذه الخطة
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              آراء عملائنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف كيف ساعدت سيادة AI الشركات في تحسين أدائها وزيادة كفاءتها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-4xl ml-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ابدأ رحلتك نحو المستقبل
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            انضم إلى آلاف الشركات التي تستخدم سيادة AI لتحسين أعمالها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex">
              <Input 
                type="email" 
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-l-xl border-0 bg-white/90 text-gray-900 placeholder:text-gray-500 px-6 py-4 text-lg min-w-[300px]"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-r-xl font-semibold">
                ابدأ الآن
              </Button>
            </div>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            تجربة مجانية لمدة 14 يوم • لا حاجة لبطاقة ائتمانية
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">سيادة AI</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة الذكاء الاصطناعي الرائدة في المنطقة العربية لأتمتة الأعمال والتفاعل الذكي مع العملاء
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">الحلول</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مكالمات ذكية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">واتساب للأعمال</a></li>
                <li><a href="#" className="hover:text-white transition-colors">إدارة البريد</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تحليلات متقدمة</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">الشركة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">المدونة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الوظائف</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الوثائق</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">حالة النظام</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 سيادة AI. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;