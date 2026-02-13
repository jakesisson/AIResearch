import * as XLSX from 'xlsx';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessedData {
  structure: {
    tableName: string;
    columns: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
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

export class DataProcessor {
  
  // معالجة ملفات Excel
  async processExcelFile(buffer: Buffer): Promise<ProcessedData> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      if (rawData.length === 0) {
        throw new Error('الملف فارغ أو لا يحتوي على بيانات');
      }

      // تحليل البيانات باستخدام AI
      return await this.analyzeDataWithAI(rawData, sheetName);
      
    } catch (error: any) {
      throw new Error(`خطأ في معالجة ملف Excel: ${error.message}`);
    }
  }

  // معالجة البيانات النصية
  async processTextData(textData: string): Promise<ProcessedData> {
    try {
      let rawData: any[];
      
      // محاولة تحليل البيانات كـ JSON
      try {
        rawData = JSON.parse(textData);
      } catch {
        // إذا لم تكن JSON، محاولة تحليلها كـ CSV
        rawData = this.parseCSVText(textData);
      }

      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('البيانات المدخلة غير صحيحة أو فارغة');
      }

      return await this.analyzeDataWithAI(rawData, 'البيانات المدخلة');
      
    } catch (error: any) {
      throw new Error(`خطأ في معالجة البيانات النصية: ${error.message}`);
    }
  }

  // تحليل البيانات باستخدام الذكاء الاصطناعي
  private async analyzeDataWithAI(rawData: any[], sourceName: string): Promise<ProcessedData> {
    const sampleData = rawData.slice(0, 5); // عينة من البيانات للتحليل
    
    const prompt = `
    تحليل البيانات التالية وإنشاء هيكل منظم لها:

    عينة من البيانات:
    ${JSON.stringify(sampleData, null, 2)}

    يرجى إنشاء:
    1. اسم جدول مناسب بالعربية
    2. أعمدة مع تحديد نوع البيانات لكل عمود
    3. وصف مختصر لكل عمود
    4. تحليل للبيانات ونصائح لتحسينها

    إرجع النتيجة بصيغة JSON فقط بهذا الشكل:
    {
      "tableName": "اسم الجدول بالعربية",
      "columns": [
        {
          "name": "اسم العمود",
          "type": "text|number|date|boolean|email|phone",
          "description": "وصف العمود"
        }
      ],
      "insights": ["تحليل 1", "تحليل 2"],
      "recommendations": ["نصيحة 1", "نصيحة 2"]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "أنت خبير في تحليل البيانات وتنظيمها. قم بتحليل البيانات وإنشاء هيكل منظم لها باللغة العربية."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // تنظيف وتطبيق أنواع البيانات
      const cleanedData = this.cleanAndValidateData(rawData, aiAnalysis.columns);

      return {
        structure: {
          tableName: aiAnalysis.tableName || sourceName,
          columns: aiAnalysis.columns || []
        },
        data: cleanedData,
        summary: {
          totalRows: cleanedData.length,
          insights: aiAnalysis.insights || [],
          recommendations: aiAnalysis.recommendations || []
        }
      };

    } catch (error) {
      console.error('خطأ في تحليل البيانات:', error);
      
      // إذا فشل التحليل بالذكاء الاصطناعي، استخدم تحليل أساسي
      return this.basicDataAnalysis(rawData, sourceName);
    }
  }

  // تحليل أساسي للبيانات في حالة فشل الذكاء الاصطناعي
  private basicDataAnalysis(rawData: any[], sourceName: string): ProcessedData {
    const firstRow = rawData[0];
    const columns = Object.keys(firstRow).map(key => ({
      name: key,
      type: this.detectDataType(firstRow[key]) as any,
      description: `عمود ${key}`
    }));

    return {
      structure: {
        tableName: sourceName,
        columns
      },
      data: rawData,
      summary: {
        totalRows: rawData.length,
        insights: [`تم العثور على ${rawData.length} صف من البيانات`],
        recommendations: ['يُنصح بمراجعة البيانات قبل الحفظ']
      }
    };
  }

  // تنظيف وتحقق من صحة البيانات
  private cleanAndValidateData(rawData: any[], columns: any[]): any[] {
    return rawData.map(row => {
      const cleanedRow: Record<string, any> = {};
      
      columns.forEach(column => {
        const value = row[column.name];
        cleanedRow[column.name] = this.convertValueToType(value, column.type);
      });
      
      return cleanedRow;
    });
  }

  // تحويل القيمة إلى النوع المطلوب
  private convertValueToType(value: any, type: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (type) {
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      
      case 'boolean':
        if (typeof value === 'boolean') return value;
        const str = String(value).toLowerCase();
        return ['true', '1', 'yes', 'نعم', 'صحيح'].includes(str);
      
      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(value)) ? String(value) : null;
      
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\-\s\(\)]+$/;
        return phoneRegex.test(String(value)) ? String(value) : null;
      
      default:
        return String(value);
    }
  }

  // اكتشاف نوع البيانات
  private detectDataType(value: any): string {
    if (value === null || value === undefined) return 'text';
    
    // رقم
    if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
      return 'number';
    }
    
    // تاريخ
    if (!isNaN(Date.parse(value))) {
      return 'date';
    }
    
    // إيميل
    if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'email';
    }
    
    // هاتف
    if (typeof value === 'string' && /^[\+]?[0-9\-\s\(\)]+$/.test(value)) {
      return 'phone';
    }
    
    // منطقي
    if (typeof value === 'boolean' || 
        ['true', 'false', '1', '0', 'yes', 'no', 'نعم', 'لا'].includes(String(value).toLowerCase())) {
      return 'boolean';
    }
    
    return 'text';
  }

  // تحليل النص كـ CSV
  private parseCSVText(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('البيانات يجب أن تحتوي على سطر واحد على الأقل للعناوين وسطر للبيانات');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }
}

export const dataProcessor = new DataProcessor();