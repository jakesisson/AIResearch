import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    domain: '',
    plan: 'professional'
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        const response = await fetch('/api/enterprise-saas/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'فشل في إنشاء الحساب');
        }
        
        return result;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `مرحباً ${data.data.user?.firstName}! تم إنشاء حسابك في منظمة ${data.data.organization?.name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: "البيانات المرجعة غير صحيحة",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "معلومات مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Professional animated background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-white/80 text-lg">
            انضم إلى منصة سيادة للذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white/90">الاسم الأول</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  placeholder="أحمد"
                  dir="rtl"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white/90">الاسم الأخير</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  placeholder="محمد"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-white/90">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="ahmed@company.com"
              />
            </div>

            <div>
              <Label htmlFor="organizationName" className="text-white/90">اسم المنظمة</Label>
              <Input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="شركة التقنية المتقدمة"
                dir="rtl"
              />
            </div>

            <div>
              <Label htmlFor="domain" className="text-white/90">نطاق المنظمة</Label>
              <Input
                id="domain"
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="company.ai"
              />
            </div>

            <div>
              <Label htmlFor="plan" className="text-white/90">الخطة</Label>
              <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">المبتدئ - مجاني</SelectItem>
                  <SelectItem value="professional">المحترف - 99 ريال/شهر</SelectItem>
                  <SelectItem value="enterprise">المؤسسي - 299 ريال/شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password" className="text-white/90">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white/90">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-white/80">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}