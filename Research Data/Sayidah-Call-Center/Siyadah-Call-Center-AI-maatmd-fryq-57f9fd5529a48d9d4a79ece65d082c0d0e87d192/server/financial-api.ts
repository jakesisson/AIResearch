import express, { Request, Response } from 'express';
import { storage } from './mongodb-storage';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { join } from 'path';

const router = express.Router();

// Invoice Management Routes
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await storage.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: "خطأ في جلب الفواتير" });
  }
});

router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: "خطأ في جلب الفاتورة" });
  }
});

router.post('/invoices', async (req: Request, res: Response) => {
  try {
    const invoice = await storage.createInvoice(req.body);
    
    // Log activity
    await storage.createActivity({
      type: 'invoice_created',
      title: 'إنشاء فاتورة جديدة',
      description: `تم إنشاء فاتورة رقم ${invoice.invoiceNumber} للعميل ${invoice.customerName}`,
      entityType: 'invoice',
      entityId: invoice._id
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: "خطأ في إنشاء الفاتورة" });
  }
});

router.put('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await storage.updateInvoice(req.params.id, req.body);
    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    
    // Log activity
    await storage.createActivity({
      type: 'invoice_updated',
      title: 'تحديث فاتورة',
      description: `تم تحديث فاتورة رقم ${invoice.invoiceNumber}`,
      entityType: 'invoice',
      entityId: invoice._id
    });
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: "خطأ في تحديث الفاتورة" });
  }
});

router.delete('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteInvoice(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    
    // Log activity
    await storage.createActivity({
      type: 'invoice_deleted',
      title: 'حذف فاتورة',
      description: `تم حذف فاتورة رقم ${req.params.id}`,
      entityType: 'invoice',
      entityId: req.params.id
    });
    
    res.json({ message: "تم حذف الفاتورة بنجاح" });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: "خطأ في حذف الفاتورة" });
  }
});

// Generate PDF Invoice
router.get('/invoices/:id/pdf', async (req: Request, res: Response) => {
  try {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);

    // Add company header
    doc.fontSize(20).text('منصة أتمتة الأعمال', 50, 50);
    doc.fontSize(12).text('نظام إدارة الأعمال المتكامل', 50, 80);
    
    // Invoice details
    doc.fontSize(16).text(`فاتورة رقم: ${invoice.invoiceNumber}`, 50, 120);
    doc.fontSize(12);
    doc.text(`تاريخ الإصدار: ${new Date(invoice.issueDate).toLocaleDateString('ar-SA')}`, 50, 150);
    doc.text(`تاريخ الاستحقاق: ${new Date(invoice.dueDate).toLocaleDateString('ar-SA')}`, 50, 170);
    doc.text(`حالة الفاتورة: ${invoice.status}`, 50, 190);
    
    // Customer details
    doc.text('بيانات العميل:', 50, 220);
    doc.text(`الاسم: ${invoice.customerName}`, 70, 240);
    doc.text(`البريد الإلكتروني: ${invoice.customerEmail}`, 70, 260);
    
    // Items table
    let yPosition = 300;
    doc.text('تفاصيل الفاتورة:', 50, yPosition);
    yPosition += 20;
    
    // Table headers
    doc.text('الوصف', 50, yPosition);
    doc.text('الكمية', 200, yPosition);
    doc.text('السعر', 280, yPosition);
    doc.text('المجموع', 360, yPosition);
    yPosition += 20;
    
    // Table items
    invoice.items.forEach(item => {
      doc.text(item.description, 50, yPosition);
      doc.text(item.quantity.toString(), 200, yPosition);
      doc.text(`${item.unitPrice} ريال`, 280, yPosition);
      doc.text(`${item.total} ريال`, 360, yPosition);
      yPosition += 20;
    });
    
    // Totals
    yPosition += 20;
    doc.text(`المجموع الفرعي: ${invoice.subtotal} ريال`, 250, yPosition);
    yPosition += 20;
    doc.text(`ضريبة القيمة المضافة (${invoice.vatRate * 100}%): ${invoice.vatAmount} ريال`, 250, yPosition);
    yPosition += 20;
    doc.fontSize(14).text(`المجموع الكلي: ${invoice.totalAmount} ريال`, 250, yPosition);
    
    if (invoice.notes) {
      yPosition += 40;
      doc.fontSize(12).text('ملاحظات:', 50, yPosition);
      doc.text(invoice.notes, 50, yPosition + 20);
    }
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: "خطأ في إنشاء ملف PDF" });
  }
});

// Payment Management Routes
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const payments = await storage.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: "خطأ في جلب المدفوعات" });
  }
});

router.post('/payments', async (req: Request, res: Response) => {
  try {
    const payment = await storage.createPayment(req.body);
    
    // Log activity
    await storage.createActivity({
      type: 'payment_created',
      title: 'تسجيل دفعة جديدة',
      description: `تم تسجيل دفعة بمبلغ ${payment.amount} ${payment.currency}`,
      entityType: 'payment',
      entityId: payment._id
    });
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: "خطأ في تسجيل الدفعة" });
  }
});

// Expense Management Routes
router.get('/expenses', async (req: Request, res: Response) => {
  try {
    const expenses = await storage.getAllExpenses();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: "خطأ في جلب المصروفات" });
  }
});

router.post('/expenses', async (req: Request, res: Response) => {
  try {
    const expense = await storage.createExpense(req.body);
    
    // Log activity
    await storage.createActivity({
      type: 'expense_created',
      title: 'تسجيل مصروف جديد',
      description: `تم تسجيل مصروف: ${expense.description} بمبلغ ${expense.amount} ${expense.currency}`,
      entityType: 'expense',
      entityId: expense._id
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: "خطأ في تسجيل المصروف" });
  }
});

// Financial Reports
router.get('/reports/financial-summary', async (req: Request, res: Response) => {
  try {
    const invoices = await storage.getAllInvoices();
    const payments = await storage.getAllPayments();
    const expenses = await storage.getAllExpenses();
    
    // Calculate financial metrics
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const pendingRevenue = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const totalExpenses = expenses
      .filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const netProfit = totalRevenue - totalExpenses;
    
    const vatCollected = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.vatAmount, 0);
    
    // Monthly trends
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = invoices
      .filter(inv => {
        const invoiceDate = new Date(inv.issueDate);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear &&
               inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const monthlyExpenses = expenses
      .filter(exp => {
        const expenseDate = new Date(exp.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear &&
               exp.status === 'approved';
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({
      totalRevenue,
      pendingRevenue,
      totalExpenses,
      netProfit,
      vatCollected,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length,
      currency: 'SAR'
    });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({ message: "خطأ في إنشاء التقرير المالي" });
  }
});

// Search functionality
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q: query, filters } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: "يرجى تقديم نص للبحث" });
    }
    
    const results = await storage.searchData(query, filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ message: "خطأ في البحث" });
  }
});

export default router;