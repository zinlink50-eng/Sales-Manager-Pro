export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "sales_rep" | "manager";
  phone?: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: "active" | "inactive" | "prospect";
  source?: string;
  assignedTo?: number;
  assignedToName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  title: string;
  contactId?: number;
  contactName?: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted";
  value?: number;
  notes?: string;
  assignedTo?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: number;
  title: string;
  contactId?: number;
  contactName?: string;
  company?: string;
  stage: string;
  value: number;
  probability: number;
  expectedClose: string;
  assignedTo?: number;
  assignedToName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: number;
  name: string;
  color: string;
  order: number;
  probability: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  assignedTo?: number;
  assignedToName?: string;
  relatedType?: "deal" | "contact" | "lead";
  relatedId?: number;
  relatedName?: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  userId?: number;
  userName?: string;
  relatedType?: string;
  relatedId?: number;
  relatedName?: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  category: string;
  description?: string;
  imageUrl?: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: number;
  contactId?: number;
  contactName?: string;
  assignedTo?: number;
  assignedToName?: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  date: string;
  items: SaleItem[];
  total: number;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  activeDeals: number;
  dealsGrowth: number;
  newLeads: number;
  leadsGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  pipelineValue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface PipelineFunnelData {
  stage: string;
  value: number;
  count: number;
}
