export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  title: string;
  contactId?: number;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted";
  value?: number;
  notes?: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: number;
  title: string;
  contactId?: number;
  company?: string;
  stage: string;
  value: number;
  probability: number;
  expectedClose: string;
  assignedTo?: number;
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
  relatedType?: "deal" | "contact" | "lead";
  relatedId?: number;
  createdAt: string;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  userId?: number;
  relatedType?: string;
  relatedId?: number;
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
  assignedTo?: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  date: string;
  items: SaleItem[];
  total: number;
  notes?: string;
  createdAt: string;
}
