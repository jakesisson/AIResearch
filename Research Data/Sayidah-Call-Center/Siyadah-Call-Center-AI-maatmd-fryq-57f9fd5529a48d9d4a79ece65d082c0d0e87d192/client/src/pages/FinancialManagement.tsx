import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  FileText, 
  CreditCard, 
  TrendingUp,
  Plus,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  vatAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  currency: string;
}

interface Payment {
  _id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: string;
  paymentDate: string;
  currency: string;
}

interface FinancialSummary {
  totalRevenue: number;
  pendingRevenue: number;
  totalExpenses: number;
  netProfit: number;
  vatCollected: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  currency: string;
}

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  // Fetch financial data
  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ['/api/financial/reports/financial-summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/financial/invoices'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/financial/payments'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await fetch('/api/financial/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (!response.ok) throw new Error('فشل في إنشاء الفاتورة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/reports/financial-summary'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'sent': return 'مرسلة';
      case 'overdue': return 'متأخرة';
      case 'draft': return 'مسودة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  const downloadInvoicePDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('فشل في تنزيل الفاتورة');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">النظام المالي</h1>
            <p className="text-muted-foreground">إدارة الفواتير والمدفوعات والتقارير المالية</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </Button>
        </div>

        {/* Financial Overview Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summary.totalRevenue.toLocaleString()} {summary.currency}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  الشهر الحالي: {summary.monthlyRevenue.toLocaleString()} {summary.currency}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستحقات المعلقة</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.pendingRevenue.toLocaleString()} {summary.currency}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.pendingInvoices} فاتورة معلقة
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summary.totalExpenses.toLocaleString()} {summary.currency}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  الشهر الحالي: {summary.monthlyExpenses.toLocaleString()} {summary.currency}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-2xl font-bold",
                  summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {summary.netProfit.toLocaleString()} {summary.currency}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  الشهر الحالي: {summary.monthlyProfit.toLocaleString()} {summary.currency}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    آخر الفواتير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices?.slice(0, 5).map(invoice => (
                        <div key={invoice._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.totalAmount.toLocaleString()} {invoice.currency}</p>
                            <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    آخر المدفوعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments?.slice(0, 5).map(payment => (
                        <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{payment.method}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              +{payment.amount.toLocaleString()} {payment.currency}
                            </p>
                            <Badge className="text-xs bg-green-100 text-green-800">
                              مكتملة
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>إدارة الفواتير</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 ml-2" />
                      تصفية
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 ml-2" />
                      بحث
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-5 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices?.map(invoice => (
                      <div key={invoice._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-lg">{invoice.invoiceNumber}</p>
                              <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                                {getStatusText(invoice.status)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{invoice.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold">
                              {invoice.totalAmount.toLocaleString()} {invoice.currency}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadInvoicePDF(invoice._id, invoice.invoiceNumber)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المدفوعات</CardTitle>
                <CardDescription>
                  تتبع وإدارة جميع المدفوعات الواردة والصادرة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments?.map(payment => (
                      <div key={payment._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">طريقة الدفع: {payment.method}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              {payment.amount.toLocaleString()} {payment.currency}
                            </p>
                            <Badge className="text-xs bg-green-100 text-green-800">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تقارير مالية سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 ml-2" />
                    تقرير الإيرادات الشهرية
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 ml-2" />
                    تحليل الربحية
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 ml-2" />
                    تقرير المدفوعات المتأخرة
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 ml-2" />
                    تقرير الضرائب (VAT)
                  </Button>
                </CardContent>
              </Card>

              {summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الضرائب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>ضريبة القيمة المضافة المحصلة</span>
                        <span className="font-bold">
                          {summary.vatCollected.toLocaleString()} {summary.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>معدل الضريبة</span>
                        <span className="font-bold">15%</span>
                      </div>
                      <Button className="w-full">
                        تصدير تقرير الضرائب
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}