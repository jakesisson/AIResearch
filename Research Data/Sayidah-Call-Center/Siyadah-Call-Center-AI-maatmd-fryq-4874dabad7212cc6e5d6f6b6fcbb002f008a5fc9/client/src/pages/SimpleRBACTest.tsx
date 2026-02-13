import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleRBACTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`خطأ: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">اختبار نظام RBAC</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => testAPI('/api/enterprise-rbac/health')}
            disabled={loading}
            className="h-12"
          >
            حالة النظام
          </Button>
          
          <Button 
            onClick={() => testAPI('/api/enterprise-rbac/organizations')}
            disabled={loading}
            className="h-12"
          >
            المؤسسات
          </Button>
          
          <Button 
            onClick={() => testAPI('/api/enterprise-rbac/roles')}
            disabled={loading}
            className="h-12"
          >
            الأدوار
          </Button>
          
          <Button 
            onClick={() => testAPI('/api/enterprise-rbac/initialize')}
            disabled={loading}
            className="h-12"
          >
            تهيئة النظام
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-96 bg-slate-900 p-4 rounded">
              {loading ? 'جاري التحميل...' : (result || 'اضغط على أي زر لاختبار API')}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}