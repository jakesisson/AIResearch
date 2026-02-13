
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Bot, 
  Globe, 
  Star,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Play
} from 'lucide-react';

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "أحمد السعدي",
      company: "متجر الرياض الإلكتروني",
      country: "🇸🇦",
      text: "زادت مبيعاتنا 300% في شهرين بفضل الأتمتة الذكية",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      company: "Tech Solutions LLC",
      country: "🇺🇸",
      text: "Best AI automation platform we've used. Customer service is incredible!",
      rating: 5
    },
    {
      name: "محمد عبدالله",
      company: "مؤسسة النور التجارية",
      country: "🇦🇪",
      text: "وفرنا 80% من وقت الردود على العملاء مع زيادة الرضا",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      title: "وكلاء ذكيين متعددين",
      description: "فريق من الذكاء الاصطناعي يعمل 24/7 لخدمة عملائك",
      stats: "91.7% معدل نجاح"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-green-600" />,
      title: "أتمتة واتساب",
      description: "رسائل ذكية ومحادثات تفاعلية باللغة العربية والإنجليزية",
      stats: "استجابة فورية"
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: "مكالمات صوتية ذكية",
      description: "مكالمات تلقائية بأصوات طبيعية ومتابعة العملاء",
      stats: "100% معدل اتصال"
    },
    {
      icon: <Mail className="w-8 h-8 text-red-600" />,
      title: "تسويق بريدي متقدم",
      description: "حملات مخصصة وتحليلات عميقة لسلوك العملاء",
      stats: "45% معدل فتح"
    }
  ];

  const pricingPlans = [
    {
      name: "البداية",
      price: 299,
      description: "للمتاجر الصغيرة",
      features: ["1000 رسالة واتساب", "5000 إيميل", "100 دقيقة مكالمات", "وكيل ذكي واحد"],
      popular: false
    },
    {
      name: "الأعمال",
      price: 899,
      description: "للشركات المتوسطة",
      features: ["5000 رسالة واتساب", "25000 إيميل", "500 دقيقة مكالمات", "3 وكلاء أذكياء", "تحليلات متقدمة"],
      popular: true
    },
    {
      name: "المؤسسات",
      price: 2499,
      description: "للشركات الكبيرة",
      features: ["20000 رسالة واتساب", "100000 إيميل", "2000 دقيقة مكالمات", "10 وكلاء أذكياء", "تقارير مخصصة"],
      popular: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-600">منصة عالمية 🌍</Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                أتمت أعمالك مع 
                <span className="text-blue-400"> الذكاء الاصطناعي</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                منصة سيادة AI - الحل الشامل لأتمتة التسويق وخدمة العملاء 
                للمتاجر والشركات الصغيرة في جميع أنحاء العالم
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  ابدأ تجربتك المجانية
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4">
                  <Play className="ml-2 w-5 h-5" />
                  شاهد العرض التوضيحي
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>20,000+ عميل عالمي</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>4.9/5 تقييم</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/20 rounded-lg p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">300%</div>
                    <div className="text-sm text-green-200">زيادة المبيعات</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                    <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-blue-200">خدمة مستمرة</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">91.7%</div>
                  <div className="text-blue-200">معدل نجاح الوكلاء الأذكياء</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار سيادة AI؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              منصة متكاملة تجمع أفضل تقنيات الذكاء الاصطناعي لأتمتة أعمالك وزيادة أرباحك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Badge variant="secondary">{feature.stats}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ماذا يقول عملاؤنا؟
            </h2>
            <p className="text-xl text-gray-600">
              آراء حقيقية من أصحاب أعمال حول العالم
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="text-center p-8">
              <CardContent>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl font-medium text-gray-900 mb-6">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div className="text-lg">
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name} {testimonials[currentTestimonial].country}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              أسعار بسيطة وشفافة
            </h2>
            <p className="text-xl text-gray-600">
              ادفع فقط مقابل ما تستخدمه. بدون رسوم خفية أو التزامات طويلة المدى
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    الأكثر شعبية
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-4xl font-bold text-blue-600 mt-4">
                    {plan.price.toLocaleString()}
                    <span className="text-lg text-gray-500"> ريال/شهر</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    ابدأ الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              🌍 نخدم العملاء في أكثر من 50 دولة حول العالم
            </p>
            <div className="flex justify-center gap-2 text-2xl">
              🇸🇦 🇦🇪 🇪🇬 🇺🇸 🇬🇧 🇨🇦 🇩🇪 🇫🇷 🇦🇺 🇯🇵
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            جاهز لتحويل أعمالك؟
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف التجار الذين زادوا مبيعاتهم وحسنوا خدمة عملائهم مع سيادة AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
              ابدأ تجربتك المجانية لمدة 14 يوم
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              تحدث مع خبير
            </Button>
          </div>
          <p className="text-blue-200 mt-4 text-sm">
            لا توجد رسوم إعداد • إلغاء في أي وقت • دعم 24/7
          </p>
        </div>
      </section>
    </div>
  );
}
