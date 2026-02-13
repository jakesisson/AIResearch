// Global type definitions for the application

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface Opportunity {
  id: string;
  name: string;
  email: string;
  value: number;
  stage: string;
  probability: number;
  assignedAgent: string;
  source: string;
  phone: string;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  createdAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  status: string;
  type: string;
  trigger: string;
  successRate: number;
  executionCount: number;
  createdAt: Date;
}

export interface AiTeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  status: string;
  performance: number;
  tasksCompleted: number;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  config: Record<string, unknown>;
  createdAt: Date;
}