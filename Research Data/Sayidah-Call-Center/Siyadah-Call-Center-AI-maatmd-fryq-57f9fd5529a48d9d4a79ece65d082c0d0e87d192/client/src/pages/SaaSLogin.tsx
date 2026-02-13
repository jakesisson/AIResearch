import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    organization: any;
    user: any;
    token: string;
  };
}

export default function SaaSLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      email: 'admin@demo.siyadah.ai',
      password: 'demo123456',
      org: 'شركة سيادة التقنية',
      plan: 'محترف'
    },
    {
      email: 'admin@startup.tech',
      password: 'demo123456',
      org: 'شركة التقنية الناشئة',
      plan: 'مبتدئ'
    },
    {
      email: 'admin@enterprise.corp',
      password: 'demo123456',
      org: 'المؤسسة التجارية الكبرى',
      plan: 'مؤسسي'
    }
  ];

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/enterprise-saas/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result: LoginResponse = await response.json();

      if (result.success && result.data) {
        // Store authentication data
        localStorage.setItem('saas_token', result.data.token);
        localStorage.setItem('saas_user', JSON.stringify(result.data.user));
        localStorage.setItem('saas_organization', JSON.stringify(result.data.organization));
        
        // Redirect to dashboard
        setLocation('/saas-dashboard');
      } else {
        setError(result.message || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              سيادة AI
            </CardTitle>
            <CardDescription>
              منصة الذكاء الاصطناعي للأعمال
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.siyadah.ai"
                  required
                  className="text-right"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  كلمة المرور
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123456"
                  required
                  className="text-right"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                حسابات تجريبية متاحة:
              </p>
              
              <div className="space-y-2">
                {demoAccounts.map((account, index) => (
                  <div
                    key={index}
                    onClick={() => fillDemo(account.email, account.password)}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border-r-4 border-blue-500"
                  >
                    <div className="font-medium text-blue-600">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2">
                        {account.plan}
                      </span>
                      {account.org}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {account.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}