import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import * as csvWriter from 'csv-writer';
import { Response } from 'express';
import { storage } from './storage';

export class ExportService {
  static async exportToExcel(data: any[], filename: string, res: Response) {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}.xlsx`);
      res.send(buffer);
    } catch (error) {
      console.error('Excel export error:', error);
      res.status(500).json({ message: 'خطأ في تصدير ملف Excel' });
    }
  }

  static async exportToPDF(data: any[], title: string, res: Response) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(title)}.pdf`);
      
      doc.pipe(res);
      
      // Add Arabic font support and title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      
      // Add current date
      doc.fontSize(12).text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'right' });
      doc.moveDown();
      
      // Add data table
      let yPosition = 150;
      const headers = Object.keys(data[0] || {});
      
      // Table headers
      headers.forEach((header, index) => {
        doc.text(header, 50 + (index * 100), yPosition);
      });
      
      yPosition += 20;
      
      // Table data
      data.forEach((row, rowIndex) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        headers.forEach((header, colIndex) => {
          doc.text(String(row[header] || ''), 50 + (colIndex * 100), yPosition);
        });
        
        yPosition += 20;
      });
      
      doc.end();
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ message: 'خطأ في تصدير ملف PDF' });
    }
  }

  static async exportToCSV(data: any[], filename: string, res: Response) {
    try {
      if (!data.length) {
        return res.status(400).json({ message: "لا توجد بيانات للتصدير" });
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(key => `"${String(row[key] || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}.csv`);
      res.send('\ufeff' + csvContent); // Add BOM for proper Arabic encoding
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ message: 'خطأ في تصدير ملف CSV' });
    }
  }

  static async exportOpportunities(format: string, res: Response) {
    const opportunities = await storage.getAllOpportunities();
    const exportData = opportunities.map(opp => ({
      'اسم العميل': opp.name,
      'البريد الإلكتروني': opp.email,
      'القيمة': opp.value,
      'المرحلة': opp.stage,
      'الاحتمالية': `${opp.probability}%`,
      'المسؤول': opp.assignedAgent,
      'المصدر': opp.source,
      'الهاتف': opp.phone,
      'تاريخ الإنشاء': new Date(opp.createdAt).toLocaleDateString('ar-SA')
    }));

    switch (format) {
      case 'excel':
        return this.exportToExcel(exportData, 'opportunities', res);
      case 'pdf':
        return this.exportToPDF(exportData, 'opportunities-report', res);
      case 'csv':
        return this.exportToCSV(exportData, 'opportunities', res);
      default:
        res.status(400).json({ message: 'صيغة غير مدعومة' });
    }
  }

  static async exportTickets(format: string, res: Response) {
    const tickets = await storage.getAllSupportTickets();
    const exportData = tickets.map(ticket => ({
      'الموضوع': ticket.subject,
      'الوصف': ticket.description,
      'الحالة': ticket.status,
      'الأولوية': ticket.priority,
      'المسؤول': ticket.assignedTo || 'غير محدد',
      'اسم العميل': ticket.customerName,
      'بريد العميل': ticket.customerEmail,
      'درجة الرضا': ticket.satisfaction || 'لم يقيم',
      'وقت الاستجابة': ticket.responseTime ? `${ticket.responseTime} دقيقة` : 'غير محدد',
      'تاريخ الإنشاء': new Date(ticket.createdAt).toLocaleDateString('ar-SA')
    }));

    switch (format) {
      case 'excel':
        return this.exportToExcel(exportData, 'تذاكر_الدعم', res);
      case 'pdf':
        return this.exportToPDF(exportData, 'تقرير تذاكر الدعم الفني', res);
      case 'csv':
        return this.exportToCSV(exportData, 'تذاكر_الدعم', res);
      default:
        res.status(400).json({ message: 'صيغة غير مدعومة' });
    }
  }

  static async exportWorkflows(format: string, res: Response) {
    const workflows = await storage.getAllWorkflows();
    const exportData = workflows.map(workflow => ({
      'اسم سير العمل': workflow.name,
      'الوصف': workflow.description || 'لا يوجد وصف',
      'الحالة': workflow.status,
      'معدل النجاح': `${workflow.successRate}%`,
      'آخر تشغيل': workflow.lastRun ? new Date(workflow.lastRun).toLocaleDateString('ar-SA') : 'لم يتم التشغيل',
      'إجمالي التشغيلات': workflow.totalRuns,
      'تاريخ الإنشاء': new Date(workflow.createdAt).toLocaleDateString('ar-SA')
    }));

    switch (format) {
      case 'excel':
        return this.exportToExcel(exportData, 'سير_العمل', res);
      case 'pdf':
        return this.exportToPDF(exportData, 'تقرير سير العمل', res);
      case 'csv':
        return this.exportToCSV(exportData, 'سير_العمل', res);
      default:
        res.status(400).json({ message: 'صيغة غير مدعومة' });
    }
  }
}