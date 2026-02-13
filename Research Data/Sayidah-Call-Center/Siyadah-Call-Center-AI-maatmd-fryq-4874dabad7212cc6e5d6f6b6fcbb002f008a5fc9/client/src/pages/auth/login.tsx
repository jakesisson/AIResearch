import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle,
  User,
  Zap
} from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch('/api/enterprise-saas/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'فشل في تسجيل الدخول');
        }
        
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${data.data.user?.firstName} ${data.data.user?.lastName}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البيانات المرجعة غير صحيحة",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Login mutation error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "معلومات مطلوبة",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const demoAccounts = [
    { email: 'admin@demo.siyadah.ai', password: 'demo123456', role: 'مدير مقدم الخدمة', level: 2 },
    { email: 'admin@startup.tech', password: 'demo123456', role: 'مدير حساب العميل', level: 3 },
    { email: 'admin@enterprise.corp', password: 'demo123456', role: 'مدير مقدم الخدمة', level: 2 },
    { email: 'admin@siyadah.ai', password: 'demo123456', role: 'مدير النظام الرئيسي', level: 1 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Professional animated background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            سيادة AI
          </CardTitle>
          <CardDescription className="text-white/80 text-lg">
            منصة الذكاء الاصطناعي المتقدمة للأعمال
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                dir="rtl"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                dir="rtl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-300">
              ليس لديك حساب؟{' '}
              <button 
                onClick={() => navigate('/auth/register')}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">حسابات تجريبية:</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  <div className="text-white font-medium">{account.email}</div>
                  <div className="text-gray-300 text-sm">{account.role} (مستوى {account.level})</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}