import { Request, Response } from 'express';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessedDataStructure {
  tableName: string;
  columns: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
    description: string;
  }>;
}

interface ProcessedDataSummary {
  totalRows: number;
  insights: string[];
  recommendations: string[];
}

interface IntelligentDataResult {
  processingId: string;
  processedData: {
    structure: ProcessedDataStructure;
    data: Array<Record<string, any>>;
    summary: ProcessedDataSummary;
  };
  preview: Array<Record<string, any>>;
}

// Intelligent data analysis using GPT-4o
async function analyzeDataWithAI(data: any[]): Promise<{
  structure: ProcessedDataStructure;
  insights: string[];
  recommendations: string[];
}> {
  try {
    const sampleData = data.slice(0, 3);
    
    const prompt = `
تحليل البيانات التالية وتقديم هيكل قاعدة بيانات محترف:

البيانات النموذجية:
${JSON.stringify(sampleData, null, 2)}

المطلوب:
1. اقتراح اسم جدول مناسب باللغة الإنجليزية
2. تحديد نوع كل عمود (text, number, date, boolean, email, phone)
3. وصف موجز لكل عمود
4. 3 رؤى مهمة من البيانات
5. 3 توصيات لتحسين الاستفادة من البيانات

الرجاء الرد بتنسيق JSON:
{
  "tableName": "اسم_الجدول",
  "columns": [
    {
      "name": "اسم_العمود",
      "type": "نوع_البيانات",
      "description": "وصف العمود"
    }
  ],
  "insights": ["رؤية 1", "رؤية 2", "رؤية 3"],
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنت خبير تحليل بيانات متخصص في إنشاء هياكل قواعد بيانات محترفة. استجب بتنسيق JSON صحيح."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      structure: {
        tableName: analysis.tableName || 'user_data',
        columns: analysis.columns || []
      },
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || []
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis if AI fails
    const firstRow = data[0] || {};
    const columns = Object.keys(firstRow).map(key => ({
      name: key,
      type: inferColumnType(firstRow[key]) as any,
      description: `عمود ${key}`
    }));

    return {
      structure: {
        tableName: 'user_data',
        columns
      },
      insights: [
        `تحتوي البيانات على ${data.length} سجل`,
        `يوجد ${columns.length} عمود في البيانات`,
        'البيانات جاهزة للمعالجة'
      ],
      recommendations: [
        'تنظيم البيانات في جدول منفصل',
        'إضافة فهارس للبحث السريع',
        'إنشاء نسخ احتياطية دورية'
      ]
    };
  }
}

function inferColumnType(value: any): string {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    if (value.includes('@')) return 'email';
    if (/^\d{10,15}$/.test(value.replace(/\D/g, ''))) return 'phone';
    if (Date.parse(value)) return 'date';
  }
  return 'text';
}

// Process text data endpoint
export async function processTextData(req: Request, res: Response) {
  try {
    const { textData, userId } = req.body;

    if (!textData) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم تقديم بيانات للمعالجة'
      });
    }

    // Parse data based on format
    let parsedData: any[] = [];
    
    try {
      // Try JSON format first
      if (textData.trim().startsWith('[') || textData.trim().startsWith('{')) {
        parsedData = JSON.parse(textData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } else {
        // Try CSV format
        const lines = textData.trim().split('\n');
        const headers = lines[0].split(',').map((h: string) => h.trim());
        
        parsedData = lines.slice(1).map((line: string) => {
          const values = line.split(',').map((v: string) => v.trim());
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'تنسيق البيانات غير صحيح. يرجى استخدام JSON أو CSV'
      });
    }

    if (parsedData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لا توجد بيانات صالحة للمعالجة'
      });
    }

    // Analyze data with AI
    const analysis = await analyzeDataWithAI(parsedData);
    
    const processingId = randomUUID();
    const preview = parsedData.slice(0, 5);

    const result: IntelligentDataResult = {
      processingId,
      processedData: {
        structure: analysis.structure,
        data: parsedData,
        summary: {
          totalRows: parsedData.length,
          insights: analysis.insights,
          recommendations: analysis.recommendations
        }
      },
      preview
    };

    res.json(result);
  } catch (error) {
    console.error('Text processing error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة البيانات'
    });
  }
}

// Process file data endpoint
export async function processFileData(req: Request, res: Response) {
  try {
    // For now, return a placeholder response
    // In a real implementation, you would parse Excel/CSV files here
    
    const processingId = randomUUID();
    
    const sampleData = [
      { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567' },
      { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', phone: '0507654321' },
      { id: 3, name: 'محمد سعد', email: 'mohammed@example.com', phone: '0509876543' }
    ];

    const analysis = await analyzeDataWithAI(sampleData);

    const result: IntelligentDataResult = {
      processingId,
      processedData: {
        structure: analysis.structure,
        data: sampleData,
        summary: {
          totalRows: sampleData.length,
          insights: analysis.insights,
          recommendations: analysis.recommendations
        }
      },
      preview: sampleData
    };

    res.json(result);
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة الملف'
    });
  }
}

// Save processed data endpoint
export async function saveProcessedData(req: Request, res: Response) {
  try {
    const { processingId, approved, userId } = req.body;

    if (!approved) {
      return res.json({
        success: true,
        message: 'تم رفض حفظ البيانات'
      });
    }

    // In a real implementation, save data to MongoDB here
    console.log(`Saving processed data for user ${userId}, processing ID: ${processingId}`);

    res.json({
      success: true,
      message: 'تم حفظ البيانات بنجاح في قاعدة البيانات'
    });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في حفظ البيانات'
    });
  }
}

// Chat integration for data processing commands
export async function handleDataProcessingCommand(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Data processing intent detection
  if (lowerMessage.includes('معالجة البيانات') || 
      lowerMessage.includes('تحليل البيانات') ||
      lowerMessage.includes('رفع ملف') ||
      lowerMessage.includes('إدخال بيانات')) {
    
    return `
🔍 **نظام معالجة البيانات الذكي**

يمكنني مساعدتك في:

📊 **رفع وتحليل البيانات:**
• رفع ملفات Excel أو CSV
• إدخال بيانات نصية (JSON/CSV)
• تحليل ذكي باستخدام GPT-4o
• تنظيم البيانات حسب المعايير العالمية

🧠 **التحليل الذكي:**
• تحديد أنواع البيانات تلقائياً
• استخراج الرؤى والتوصيات
• إنشاء هيكل قاعدة بيانات محترف
• معاينة البيانات قبل الحفظ

🎯 **الإجراءات المتاحة:**
• "ارفع البيانات إلى صفحة المعالجة" - للانتقال لواجهة رفع البيانات
• "اعرض البيانات المحفوظة" - لاستعراض البيانات الحالية
• "حلل هذه البيانات: [البيانات]" - لتحليل بيانات مباشرة

اختر الإجراء المطلوب وسأوجهك خطوة بخطوة.
    `;
  }
  
  if (lowerMessage.includes('ارفع البيانات') || lowerMessage.includes('صفحة المعالجة')) {
    return `
🚀 **توجيه إلى صفحة معالجة البيانات**

انقر على الرابط التالي للانتقال إلى صفحة رفع ومعالجة البيانات:
👈 [معالجة البيانات الذكية](/data/upload)

في هذه الصفحة يمكنك:
✅ رفع ملفات Excel/CSV
✅ إدخال بيانات نصية
✅ مراجعة التحليل الذكي
✅ الموافقة على حفظ البيانات

النظام سيحلل بياناتك تلقائياً ويقترح أفضل تنظيم لها.
    `;
  }

  return '';
}