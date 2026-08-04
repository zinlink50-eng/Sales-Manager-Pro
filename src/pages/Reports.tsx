import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale, Product, RevenueData, DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

const statusConfig: Record<string, { label: string; variant: any }> = {
  pending:   { label: "စောင့်ဆိုင်းနေ", variant: "warning"     },
  confirmed: { label: "အတည်ပြုပြီ",    variant: "info"        },
  delivered: { label: "ပို့ဆောင်ပြီ",   variant: "success"     },
  cancelled: { label: "ပယ်ဖျက်ပြီ",    variant: "destructive" },
};

export default function Reports() {
  const { data: stats }       = useQuery({ queryKey: ["dashboard-stats"],   queryFn: () => api.get<DashboardStats>("/api/dashboard/stats") });
  const { data: revenue }     = useQuery({ queryKey: ["dashboard-revenue"], queryFn: () => api.get<RevenueData[]>("/api/dashboard/revenue") });
  const { data: sales = [] }  = useQuery({ queryKey: ["sales"],             queryFn: () => api.get<Sale[]>("/api/sales") });
  const { data: products = []} = useQuery({ queryKey: ["products"],         queryFn: () => api.get<Product[]>("/api/products") });

  const confirmedSales = sales.filter((s) => s.status === "confirmed" || s.status === "delivered");
  const totalRevenue   = confirmedSales.reduce((s, sale) => s + sale.total, 0);
  const avgOrder       = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Product sold quantities
  const productQtys = sales
    .flatMap((s) => s.items ?? [])
    .reduce((acc, item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
  const topProductData = Object.entries(productQtys)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, qty]) => ({ name, qty }));

  // Product revenue
  const productRevenue = sales
    .flatMap((s) => s.items ?? [])
    .reduce((acc, item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity * item.unitPrice;
      return acc;
    }, {} as Record<string, number>);
  const topRevenueData = Object.entries(productRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Category breakdown
  const categoryRevenue = products.reduce((acc, p) => {
    const sold = productRevenue[p.name] || 0;
    if (sold > 0) acc[p.category] = (acc[p.category] || 0) + sold;
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));

  // Staff performance based on sales
  const staffPerf = sales.reduce((acc, s) => {
    const name = s.assignedToName || "တာဝန်မပေးရသေး";
    if (!acc[name]) acc[name] = { name, count: 0, revenue: 0 };
    acc[name].count   += 1;
    acc[name].revenue += s.total;
    return acc;
  }, {} as Record<string, { name: string; count: number; revenue: number }>);
  const staffData = Object.values(staffPerf).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "စုစုပေါင်းဝင်ငွေ",          value: formatCurrency(totalRevenue), icon: DollarSign,  color: "bg-emerald-50 text-emerald-600", change: "+18.5%" },
          { label: "အရောင်းအကြိမ်ရေ",            value: String(sales.length),         icon: ShoppingCart, color: "bg-blue-50 text-blue-600",     change: "+12.3%" },
          { label: "ပျမ်းမျှမှာယူမှုတန်ဖိုး",    value: formatCurrency(avgOrder),     icon: TrendingUp,  color: "bg-indigo-50 text-indigo-600",  change: "+5.1%"  },
          { label: "ကုန်ပစ္စည်းမျိုးစုံ",          value: String(products.length),      icon: Package,     color: "bg-amber-50 text-amber-600",    change: `${products.filter((p)=>p.stock!==undefined&&p.minStock!==undefined&&p.stock<p.minStock).length} ကုန်ပြတ်` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-emerald-600 font-medium">{kpi.change} ယခင်ကာလနှင့် နှိုင်းယှဉ်</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">ဝင်ငွေ</TabsTrigger>
          <TabsTrigger value="products">ကုန်ပစ္စည်း</TabsTrigger>
          <TabsTrigger value="performance">ဝန်ထမ်းစွမ်းဆောင်</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">လစဉ်ဝင်ငွေ နှင့် ပန်းတိုင်</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#rev)" strokeWidth={2} name="ဝင်ငွေ" />
                    <Area type="monotone" dataKey="target"  stroke="#e5e7eb" fill="none" strokeWidth={2} strokeDasharray="4 2" name="ပန်းတိုင်" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales table */}
            <Card>
              <CardHeader><CardTitle className="text-base">လတ်တလော အရောင်းမှတ်တမ်းများ</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        {["#", "ဖောက်သည်", "စုစုပေါင်း", "အခြေအနေ", "ရက်စွဲ"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sales.slice(0, 8).map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2 text-xs font-mono text-gray-400">#{String(sale.id).padStart(4, "0")}</td>
                          <td className="px-4 py-2 text-sm">{sale.contactName || "—"}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-primary">{formatCurrency(sale.total)}</td>
                          <td className="px-4 py-2"><Badge variant={statusConfig[sale.status]?.variant}>{statusConfig[sale.status]?.label}</Badge></td>
                          <td className="px-4 py-2 text-xs text-gray-400">{formatDate(sale.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">ရောင်းအားအမြင့်ဆုံး ကုန်ပစ္စည်း (အရေ)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProductData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v: number) => [`${v} ခု`, "ရောင်းချမှု"]} />
                    <Bar dataKey="qty" fill="#6366f1" radius={[0, 4, 4, 0]} name="ရောင်းချမှု" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">အမျိုးအစားအလိုက် ဝင်ငွေ</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">ကုန်ပစ္စည်းအလိုက် ဝင်ငွေ</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="ဝင်ငွေ" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">ဝန်ထမ်းအလိုက် ဝင်ငွေ</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={staffData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="#10b981" name="ဝင်ငွေ" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">ဝန်ထမ်း စွမ်းဆောင်ရည် အသေးစိတ်</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["ဝန်ထမ်း", "အရောင်းအကြိမ်", "ဝင်ငွေစုစုပေါင်း"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staffData.map((rep) => (
                      <tr key={rep.name} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-sm">{rep.name}</td>
                        <td className="px-4 py-3 text-sm">{rep.count}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{formatCurrency(rep.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
