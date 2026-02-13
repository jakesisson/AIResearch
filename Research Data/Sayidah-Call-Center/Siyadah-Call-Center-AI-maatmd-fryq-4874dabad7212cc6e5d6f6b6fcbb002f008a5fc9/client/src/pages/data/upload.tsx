import { DataUploadInterface } from '@/components/DataUploadInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileSpreadsheet, Brain, Zap } from 'lucide-react';

function DataUploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">معالجة البيانات الذكية</h1>
          </div>
          <p className="text-lg text-gray-600">
            ارفع ملفات Excel أو أدخل البيانات النصية ودع الذكاء الاصطناعي ينظمها لك
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <FileSpreadsheet className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">رفع ملفات Excel</h3>
              <p className="text-sm text-gray-600">
                دعم كامل لملفات .xlsx و .xls و .csv
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">تحليل ذكي</h3>
              <p className="text-sm text-gray-600">
                تحليل تلقائي لأنواع البيانات والعلاقات
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">تنظيم فوري</h3>
              <p className="text-sm text-gray-600">
                إنشاء هيكل قاعدة بيانات محترف تلقائياً
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Upload Interface */}
        <DataUploadInterface />

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-right">كيفية الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-800">رفع ملف Excel:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>اختر ملف Excel أو CSV من جهازك</li>
                  <li>انقر على "تحليل ومعالجة الملف"</li>
                  <li>راجع التحليل الذكي والهيكل المقترح</li>
                  <li>وافق على حفظ البيانات في قاعدة البيانات</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-800">إدخال نصي:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>الصق البيانات في صيغة JSON أو CSV</li>
                  <li>انقر على "تحليل ومعالجة البيانات"</li>
                  <li>راجع النتائج والتوصيات الذكية</li>
                  <li>احفظ البيانات المنظمة في النظام</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">نصائح للحصول على أفضل النتائج:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• تأكد من أن البيانات تحتوي على أسماء أعمدة واضحة</li>
                <li>• استخدم تنسيق متسق للتواريخ والأرقام</li>
                <li>• تجنب الخلايا المدمجة في ملفات Excel</li>
                <li>• استخدم النصوص العربية للأسماء والأوصاف</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DataUploadPage;