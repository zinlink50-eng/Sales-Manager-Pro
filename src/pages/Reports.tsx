import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale, Product, RevenueData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Banknote } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

const statusConfig: Record<string, { label: string; variant: any }> = {
  pending:   { label: "စောင့်ဆိုင်းနေ", variant: "warning"     },
  confirmed: { label: "အတည်ပြုပြီ",    variant: "info"        },
  delivered: { label: "ပို့ဆောင်ပြီ",   variant: "success"     },
  cancelled: { label: "ပယ်ဖျက်ပြီ",    variant: "destructive" },
};

function SummaryCard({
  label, value, sub, icon: Icon, color,
}: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
        {sub && <div className="mt-2 text-xs font-medium text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { data: revenue }      = useQuery({ queryKey: ["dashboard-revenue"], queryFn: () => api.get<RevenueData[]>("/api/dashboard/revenue") });
  const { data: sales = [] }   = useQuery({ queryKey: ["sales"],             queryFn: () => api.get<Sale[]>("/api/sales") });
  const { data: products = [] } = useQuery({ queryKey: ["products"],         queryFn: () => api.get<Product[]>("/api/products") });

  // ── Core filters ──────────────────────────────────────────
  const confirmedSales = sales.filter((s) => s.status === "confirmed" || s.status === "delivered");
  const totalRevenue   = confirmedSales.reduce((s, sale) => s + sale.total, 0);
  const avgOrder       = confirmedSales.length > 0 ? totalRevenue / confirmedSales.length : 0;

  // ── Cost/profit helpers ───────────────────────────────────
  const costMap = new Map(products.map((p) => [p.id, p.cost ?? 0]));

  const totalCOGS = confirmedSales.reduce((sum, sale) =>
    sum + sale.items.reduce((c, item) => c + (costMap.get(item.productId) ?? 0) * item.quantity, 0), 0);
  const grossProfit  = totalRevenue - totalCOGS;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // ── Per-product profit breakdown ──────────────────────────
  type ProdRow = { name: string; revenue: number; cogs: number; profit: number; qty: number };
  const prodMap = confirmedSales
    .flatMap((s) => s.items)
    .reduce((acc, item) => {
      if (!acc[item.productName]) acc[item.productName] = { name: item.productName, revenue: 0, cogs: 0, profit: 0, qty: 0 };
      const cost = costMap.get(item.productId) ?? 0;
      acc[item.productName].revenue += item.quantity * item.unitPrice;
      acc[item.productName].cogs    += item.quantity * cost;
      acc[item.productName].profit  += item.quantity * (item.unitPrice - cost);
      acc[item.productName].qty     += item.quantity;
      return acc;
    }, {} as Record<string, ProdRow>);
  const productProfitData = Object.values(prodMap).sort((a, b) => b.profit - a.profit);

  // ── Product sold quantities (all sales for display) ────────
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

  // ── Category revenue breakdown ─────────────────────────────
  const productRevenue = sales
    .flatMap((s) => s.items ?? [])
    .reduce((acc, item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity * item.unitPrice;
      return acc;
    }, {} as Record<string, number>);
  const categoryRevenue = products.reduce((acc, p) => {
    const sold = productRevenue[p.name] || 0;
    if (sold > 0) acc[p.category] = (acc[p.category] || 0) + sold;
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));

  // ── Staff performance ─────────────────────────────────────
  const staffPerf = sales.reduce((acc, s) => {
    const name = s.assignedToName || "တာဝန်မပေးရသေး";
    if (!acc[name]) acc[name] = { name, count: 0, revenue: 0 };
    acc[name].count   += 1;
    acc[name].revenue += s.total;
    return acc;
  }, {} as Record<string, { name: string; count: number; revenue: number }>);
  const staffData = Object.values(staffPerf).sort((a, b) => b.revenue - a.revenue);

  // ── Chart data: Revenue vs COGS vs Profit per product ─────
  const plChartData = productProfitData.slice(0, 6).map((r) => ({
    name:    r.name,
    ဝင်ငွေ:  r.revenue,
    ကုန်ကျစရိတ်: r.cogs,
    အမြတ်:  r.profit,
  }));

  return (
    <div className="space-y-6">

      {/* ── Top Summary KPIs ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="စုစုပေါင်းဝင်ငွေ"        value={formatCurrency(totalRevenue)} sub={`${confirmedSales.length} ကြိမ် အရောင်း`}  icon={DollarSign}  color="bg-blue-50 text-blue-600"    />
        <SummaryCard label="ကုန်ကျစရိတ်စုစုပေါင်း"    value={formatCurrency(totalCOGS)}   sub="COGS"                                         icon={ShoppingCart} color="bg-rose-50 text-rose-600"    />
        <SummaryCard label="အမြတ်ငွေစုစုပေါင်း"       value={formatCurrency(grossProfit)} sub={`Margin ${grossMarginPct.toFixed(1)}%`}        icon={Banknote}    color="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="ပျမ်းမျှမှာယူမှုတန်ဖိုး"  value={formatCurrency(avgOrder)}    sub={`ကုန်ပစ္စည်း ${products.length} မျိုး`}       icon={TrendingUp}  color="bg-indigo-50 text-indigo-600" />
      </div>

      <Tabs defaultValue="finance">
        <TabsList className="mb-4">
          <TabsTrigger value="finance">ငွေကြေးအချက်အလက်</TabsTrigger>
          <TabsTrigger value="revenue">ဝင်ငွေ</TabsTrigger>
          <TabsTrigger value="products">ကုန်ပစ္စည်း</TabsTrigger>
          <TabsTrigger value="performance">ဝန်ထမ်းစွမ်းဆောင်</TabsTrigger>
        </TabsList>

        {/* ── Finance Tab ──────────────────────────────────────── */}
        <TabsContent value="finance" className="space-y-4">

          {/* P&L highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "ဝင်ငွေ (Revenue)",        value: totalRevenue, accent: "border-l-blue-500",    text: "text-blue-700"    },
              { label: "ကုန်ကျစရိတ် (COGS)",      value: totalCOGS,    accent: "border-l-rose-400",    text: "text-rose-600"    },
              { label: "အမြတ် (Gross Profit)",     value: grossProfit,  accent: "border-l-emerald-500", text: "text-emerald-700" },
            ].map((row) => (
              <Card key={row.label} className={`border-l-4 ${row.accent}`}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${row.text}`}>{formatCurrency(row.value)}</p>
                  {row.label.startsWith("အမြတ်") && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${grossMarginPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {grossMarginPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      Gross Margin {grossMarginPct.toFixed(1)}%
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue vs COGS vs Profit chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">ကုန်ပစ္စည်းအလိုက် ဝင်ငွေ / ကုန်ကျ / အမြတ်</CardTitle></CardHeader>
            <CardContent>
              {plChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={plChartData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="ဝင်ငွေ"       fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ကုန်ကျစရိတ်" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="အမြတ်"       fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-10 text-center text-sm text-gray-400">အတည်ပြုပြီးသော အရောင်းမှတ်တမ်းမရှိသေး</div>
              )}
            </CardContent>
          </Card>

          {/* Per-product profit table */}
          <Card>
            <CardHeader><CardTitle className="text-base">ကုန်ပစ္စည်းအလိုက် အမြတ်ချက်ချာ</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["ကုန်ပစ္စည်း", "ရေ", "ဝင်ငွေ", "ကုန်ကျ", "အမြတ်", "Margin"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productProfitData.length > 0 ? productProfitData.map((row) => {
                      const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                      return (
                        <tr key={row.name} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-sm font-medium">{row.name}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">{row.qty}</td>
                          <td className="px-4 py-2.5 text-sm text-blue-600 font-medium">{formatCurrency(row.revenue)}</td>
                          <td className="px-4 py-2.5 text-sm text-rose-500">{formatCurrency(row.cogs)}</td>
                          <td className="px-4 py-2.5 text-sm text-emerald-600 font-bold">{formatCurrency(row.profit)}</td>
                          <td className="px-4 py-2.5 text-sm">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${margin >= 40 ? "bg-emerald-100 text-emerald-700" : margin >= 20 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"}`}>
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">အတည်ပြုပြီးသော အရောင်းမှတ်တမ်းမရှိသေး</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Revenue Tab ──────────────────────────────────────── */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">လစဉ်ဝင်ငွေ နှင့် ပန်းတိုင်</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#rev)" strokeWidth={2} name="ဝင်ငွေ" />
                    <Area type="monotone" dataKey="target"  stroke="#e5e7eb" fill="none"       strokeWidth={2} strokeDasharray="4 2" name="ပန်းတိုင်" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent sales table */}
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

        {/* ── Products Tab ─────────────────────────────────────── */}
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

          {/* Top-selling items detail table */}
          <Card>
            <CardHeader><CardTitle className="text-base">အရောင်းအမြင့်ဆုံး ကုန်ပစ္စည်းများ အသေးစိတ်</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["ကုန်ပစ္စည်း", "ရောင်းချမှု (ရေ)", "ဝင်ငွေ"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topProductData.map((row) => {
                      const rev = productRevenue[row.name] ?? 0;
                      return (
                        <tr key={row.name} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-sm font-medium">{row.name}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">{row.qty} ခု</td>
                          <td className="px-4 py-2.5 text-sm text-emerald-600 font-bold">{formatCurrency(rev)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Staff Performance Tab ────────────────────────────── */}
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
