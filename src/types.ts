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

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  assignedTo?: number;
  assignedToName?: string;
  relatedType?: string;
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
  salesCount: number;
  salesGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  lowStockItems: number;
  todayNetProfit: number;
  monthNetProfit: number;
  yearNetProfit: number;
  totalCapital: number;
  totalInventoryValue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}
