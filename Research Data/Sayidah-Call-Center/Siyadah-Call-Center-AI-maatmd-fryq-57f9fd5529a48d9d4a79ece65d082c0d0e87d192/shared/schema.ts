// MongoDB Schema Types for Business Automation Platform

export interface IUser {
  _id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface InsertUser {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

export interface IOpportunity {
  _id: string;
  name: string;
  email: string;
  value: number;
  stage: string;
  probability: number;
  assignedAgent: string;
  source: string;
  contactPerson: string;
  phone: string;
  lastActivity?: string;
  nextFollowUp?: Date;
  notes?: string;
  createdAt: Date;
}

export interface InsertOpportunity {
  name: string;
  email: string;
  value: number;
  stage: string;
  probability: number;
  assignedAgent: string;
  source: string;
  contactPerson: string;
  phone: string;
  lastActivity?: string;
  nextFollowUp?: Date;
  notes?: string;
}

export interface IWorkflow {
  _id: string;
  name: string;
  description?: string;
  status: string;
  isActive: boolean;
  successRate: number;
  lastRun?: Date;
  totalRuns: number;
  config?: any;
  createdAt: Date;
}

export interface ISupportTicket {
  _id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  customerName: string;
  customerEmail: string;
  satisfaction?: number;
  responseTime?: number;
  tags?: string[];
  createdAt: Date;
}

export interface IAiTeamMember {
  _id: string;
  name: string;
  specialization: string;
  avatar?: string;
  activeDeals: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: Date;
}

export interface IActivity {
  _id: string;
  type: string;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  userId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IIntegration {
  _id: string;
  name: string;
  type: string;
  config: any;
  isConnected: boolean;
  lastSync?: Date;
  createdAt: Date;
}

export interface IWhatsAppConversation {
  _id: string;
  phone: string;
  contactName?: string;
  sessionId: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}

export interface InsertWhatsAppConversation {
  phone: string;
  contactName?: string;
  sessionId: string;
  isActive: boolean;
  lastActivity: Date;
}

export interface IWhatsAppMessage {
  _id: string;
  conversationId: string;
  messageId: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'voice';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isAIGenerated?: boolean;
  prompt?: string; // Original user prompt that triggered this message
  timestamp: Date;
  createdAt: Date;
}

export interface InsertWhatsAppMessage {
  conversationId: string;
  messageId: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  messageType: 'text' | 'image' | 'document' | 'voice';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isAIGenerated?: boolean;
  prompt?: string;
  timestamp: Date;
}

// Financial schema types for MongoDB compatibility
export interface IInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  paymentMethod?: string;
  notes?: string;
  vatRate?: number;
  subtotal?: number;
  currency?: string;
}

export interface IPayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  transactionId?: string;
  currency?: string;
}

export interface IExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
  receiptUrl?: string;
  currency?: string;
  status?: string;
}

export type InsertInvoice = Omit<IInvoice, 'id' | 'createdAt'>;
export type InsertPayment = Omit<IPayment, 'id' | 'createdAt'>;
export type InsertExpense = Omit<IExpense, 'id' | 'createdAt'>;

// User Data Tables - جداول البيانات المخصصة للمستخدمين
export interface IUserDataTable {
  _id: string;
  userId: string;
  tableName: string;
  originalFileName?: string;
  columns: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
    description: string;
  }>;
  metadata: {
    totalRows: number;
    insights: string[];
    recommendations: string[];
    sourceType: 'excel' | 'text' | 'csv';
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Data Records - السجلات الفعلية للبيانات
export interface IUserDataRecord {
  _id: string;
  tableId: string;
  data: Record<string, any>;
  createdAt: Date;
}

// Data Processing History - تاريخ معالجة البيانات
export interface IDataProcessingHistory {
  _id: string;
  userId: string;
  sourceType: 'excel' | 'text' | 'csv';
  originalData: any;
  processedData: {
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
  };
  aiAnalysis: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export type InsertUserDataTable = Omit<IUserDataTable, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertUserDataRecord = Omit<IUserDataRecord, '_id' | 'createdAt'>;
export type InsertDataProcessingHistory = Omit<IDataProcessingHistory, '_id' | 'createdAt'>;