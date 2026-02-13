import { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, Check, X, Download, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProcessedData {
  structure: {
    tableName: string;
    columns: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  data: Array<Record<string, any>>;
  summary: {
    totalRows: number;
    insights: string[];
    recommendations: string[];
  };
}

interface ProcessingResult {
  processingId: string;
  processedData: ProcessedData;
  preview: Array<Record<string, any>>;
}

export function DataUploadInterface() {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [textData, setTextData] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "تم اختيار الملف",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }
  };

  const processFile = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', 'demo_user');

      const response = await fetch('/api/data/process-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل في معالجة الملف');
      }

      const result = await response.json();
      
      if (result.success) {
        setProcessingResult(result.data);
        setShowApproval(true);
        toast({
          title: "تم التحليل بنجاح",
          description: `تم تحليل ${result.data.processedData.summary.totalRows} سجل`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('File processing error:', error);
      toast({
        title: "خطأ في المعالجة",
        description: error.message || 'حدث خطأ أثناء معالجة الملف',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async () => {
    if (!textData.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البيانات النصية أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/data/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textData,
          userId: 'demo_user'
        })
      });

      const result = await response.json();

      if (result && result.processedData) {
        setProcessingResult(result);
        setShowApproval(true);
        toast({
          title: "تم التحليل بنجاح",
          description: `تم تحليل ${result.processedData.summary.totalRows} سجل`,
        });
      } else {
        throw new Error('فشل في معالجة البيانات');
      }
    } catch (error: any) {
      console.error('Text processing error:', error);
      toast({
        title: "خطأ في المعالجة",
        description: error.message || 'حدث خطأ أثناء معالجة البيانات',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const approveAndSave = async () => {
    if (!processingResult) return;

    try {
      const response = await fetch('/api/data/approve-and-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processingId: processingResult.processingId,
          tableName: processingResult.processedData.structure.tableName,
          processedData: processingResult.processedData,
          userId: 'demo_user'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: result.message,
        });
        
        // إعادة تعيين الحالة
        setProcessingResult(null);
        setShowApproval(false);
        setSelectedFile(null);
        setTextData('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || 'حدث خطأ أثناء حفظ البيانات',
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      boolean: 'bg-yellow-100 text-yellow-800',
      email: 'bg-orange-100 text-orange-800',
      phone: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (showApproval && processingResult) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Database className="h-5 w-5" />
            مراجعة البيانات المعالجة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات الجدول */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{processingResult.processedData.structure.tableName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>عدد السجلات: <span className="font-semibold">{processingResult.processedData.summary.totalRows}</span></div>
              <div>عدد الأعمدة: <span className="font-semibold">{processingResult.processedData.structure.columns.length}</span></div>
            </div>
          </div>

          {/* هيكل الأعمدة */}
          <div>
            <h4 className="font-semibold mb-3">هيكل الأعمدة:</h4>
            <div className="grid gap-2">
              {processingResult.processedData.structure.columns.map((column, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{column.name}</span>
                    <Badge className={getTypeColor(column.type)}>{column.type}</Badge>
                  </div>
                  <span className="text-sm text-gray-600">{column.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* معاينة البيانات */}
          <div>
            <h4 className="font-semibold mb-3">معاينة البيانات (أول 5 سجلات):</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {processingResult.processedData.structure.columns.map((column, index) => (
                      <th key={index} className="p-2 text-right border-b">{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processingResult.preview.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {processingResult.processedData.structure.columns.map((column, colIndex) => (
                        <td key={colIndex} className="p-2 text-right">
                          {row[column.name]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* تحليلات ذكية */}
          {processingResult.processedData.summary.insights.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">تحليلات ذكية:</h4>
              <ul className="space-y-2">
                {processingResult.processedData.summary.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* توصيات */}
          {processingResult.processedData.summary.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">توصيات:</h4>
              <ul className="space-y-2">
                {processingResult.processedData.summary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">💡</span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4">
            <Button onClick={approveAndSave} className="flex-1">
              <Check className="h-4 w-4 ml-2" />
              موافق - احفظ في قاعدة البيانات
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowApproval(false);
                setProcessingResult(null);
              }}
              className="flex-1"
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Upload className="h-5 w-5" />
          رفع ومعالجة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اختيار طريقة الرفع */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={uploadMode === 'file' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMode('file')}
            className="flex-1"
          >
            <FileSpreadsheet className="h-4 w-4 ml-2" />
            رفع ملف Excel
          </Button>
          <Button
            variant={uploadMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMode('text')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 ml-2" />
            إدخال نصي
          </Button>
        </div>

        <Separator />

        {uploadMode === 'file' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                اختر ملف Excel أو CSV:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedFile && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={processFile} 
              disabled={!selectedFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري المعالجة...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  تحليل ومعالجة الملف
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                أدخل البيانات (JSON أو CSV):
              </label>
              <Textarea
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                placeholder={`مثال JSON:
[
  {"الاسم": "أحمد علي", "العمر": 25, "المدينة": "الرياض"},
  {"الاسم": "فاطمة محمد", "العمر": 30, "المدينة": "جدة"}
]

أو مثال CSV:
الاسم,العمر,المدينة
أحمد علي,25,الرياض
فاطمة محمد,30,جدة`}
                className="min-h-32 text-right"
                dir="rtl"
              />
            </div>
            
            <Button 
              onClick={processText} 
              disabled={!textData.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري المعالجة...
                </div>
              ) : (
                <>
                  <FileText className="h-4 w-4 ml-2" />
                  تحليل ومعالجة البيانات
                </>
              )}
            </Button>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">الميزات الذكية:</h4>
          <ul className="text-sm space-y-1">
            <li>• تحليل تلقائي لأنواع البيانات (نص، رقم، تاريخ، إيميل...)</li>
            <li>• إنشاء هيكل جدول احترافي تلقائياً</li>
            <li>• تنظيف وتحسين البيانات باستخدام الذكاء الاصطناعي</li>
            <li>• تحليلات وتوصيات ذكية للبيانات</li>
            <li>• معاينة كاملة قبل الحفظ النهائي</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}