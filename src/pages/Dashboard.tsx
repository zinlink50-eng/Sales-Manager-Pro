import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardStats, RevenueData, Activity, Sale, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, AlertTriangle,
  Phone, Mail, Calendar, FileText, CheckCircle, Package, Banknote, BarChart3, Warehouse,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
  call:           { icon: Phone,         color: "text-blue-500 bg-blue-50"     },
  email:          { icon: Mail,          color: "text-purple-500 bg-purple-50" },
  meeting:        { icon: Calendar,      color: "text-green-500 bg-green-50"   },
  note:           { icon: FileText,      color: "text-gray-500 bg-gray-50"     },
  deal_created:   { icon: ShoppingCart,  color: "text-indigo-500 bg-indigo-50" },
  task_completed: { icon: CheckCircle,   color: "text-emerald-500 bg-emerald-50" },
};

function KpiCard({ title, value, growth, icon: Icon, accent = "blue" }: {
  title: string;
  value: number | string;
  growth?: number;
  icon: React.ElementType;
  accent?: "blue" | "emerald" | "violet" | "amber" | "rose";
}) {
  const accentMap = {
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet:  "bg-violet-50 text-violet-600",
    amber:   "bg-amber-50 text-amber-600",
    rose:    "bg-rose-50 text-rose-600",
  };
  const isPositive = (growth ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs text-muted-foreground leading-tight">{title}</p>
            <p className="text-xl font-bold mt-1 truncate">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {growth !== undefined && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(growth)}% ယခင်လနှင့် နှိုင်းယှဉ်
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats }      = useQuery({ queryKey: ["dashboard-stats"],      queryFn: () => api.get<DashboardStats>("/api/dashboard/stats") });
  const { data: revenue }    = useQuery({ queryKey: ["dashboard-revenue"],    queryFn: () => api.get<RevenueData[]>("/api/dashboard/revenue") });
  const { data: activities } = useQuery({ queryKey: ["dashboard-activities"], queryFn: () => api.get<Activity[]>("/api/dashboard/activities") });
  const { data: products = [] } = useQuery({ queryKey: ["products"],          queryFn: () => api.get<Product[]>("/api/products") });
  const { data: sales = [] }    = useQuery({ queryKey: ["sales"],             queryFn: () => api.get<Sale[]>("/api/sales") });

  // Top 5 products by quantity sold
  const productSales = sales
    .flatMap((s) => s.items ?? [])
    .reduce((acc, item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  // Low-stock products
  const lowStock = products.filter(
    (p) => p.stock !== undefined && p.minStock !== undefined && p.stock < p.minStock
  );

  return (
    <div className="space-y-5">

      {/* ── Row 1: Operational KPIs ── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">လုပ်ငန်းအချက်အလက်</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            title="စုစုပေါင်းဝင်ငွေ"
            value={stats ? formatCurrency(stats.totalRevenue) : "—"}
            growth={stats?.revenueGrowth}
            icon={DollarSign}
            accent="blue"
          />
          <KpiCard
            title="အရောင်းအကြိမ်ရေ"
            value={stats?.salesCount ?? 0}
            growth={stats?.salesGrowth}
            icon={ShoppingCart}
            accent="violet"
          />
          <KpiCard
            title="ဖောက်သည်စုစုပေါင်း"
            value={stats?.totalCustomers ?? 0}
            growth={stats?.customersGrowth}
            icon={Users}
            accent="emerald"
          />
          <KpiCard
            title="ကုန်ပြတ်လုနီး (မျိုး)"
            value={stats?.lowStockItems ?? 0}
            growth={stats?.lowStockItems ? -(stats.lowStockItems) : undefined}
            icon={AlertTriangle}
            accent="amber"
          />
        </div>
      </div>

      {/* ── Row 2: Profit & Capital KPIs ── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">အမြတ်အစွန်း နှင့် ရင်းနှီးငွေ</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard
            title="ယနေ့ အမြတ်"
            value={stats ? formatCurrency(stats.todayNetProfit) : "—"}
            icon={Banknote}
            accent="emerald"
          />
          <KpiCard
            title="ယခုလ အမြတ်"
            value={stats ? formatCurrency(stats.monthNetProfit) : "—"}
            icon={TrendingUp}
            accent="emerald"
          />
          <KpiCard
            title="ယခုနှစ် အမြတ်"
            value={stats ? formatCurrency(stats.yearNetProfit) : "—"}
            icon={BarChart3}
            accent="blue"
          />
          <KpiCard
            title="အရင်းငွေစုစုပေါင်း"
            value={stats ? formatCurrency(stats.totalCapital) : "—"}
            icon={Warehouse}
            accent="violet"
          />
          <KpiCard
            title="ကုန်ပစ္စည်းတန်ဖိုးစုစုပေါင်း"
            value={stats ? formatCurrency(stats.totalInventoryValue) : "—"}
            icon={Package}
            accent="amber"
          />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">လစဉ်ဝင်ငွေ နှင့် ပန်းတိုင်</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} name="ဝင်ငွေ" />
                <Area type="monotone" dataKey="target"  stroke="#e5e7eb" fill="none" strokeWidth={2} strokeDasharray="4 2" name="ပန်းတိုင်" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">အရောင်းရဆုံးကုန်ပစ္စည်း</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v: number) => [`${v} ခု`, "ရောင်းချမှု"]} />
                  <Bar dataKey="qty" fill="#6366f1" radius={[0, 4, 4, 0]} name="ရောင်းချမှု" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">ရောင်းချမှုမရှိသေး</div>
            )}
            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  ကုန်ပြတ်လုနီး ({lowStock.length} မျိုး)
                </div>
                {lowStock.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600"><Package className="h-3 w-3" />{p.name}</span>
                    <span className="text-red-500 font-medium">{p.stock} {p.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">လတ်တလော လှုပ်ရှားမှုများ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities?.map((activity) => {
              const config = activityIcons[activity.type] || activityIcons.note;
              const Icon   = config.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {activity.userName && (
                        <span className="text-xs text-muted-foreground">မှ {activity.userName}</span>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeDate(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!activities?.length && (
              <p className="text-sm text-center text-gray-400 py-4">လှုပ်ရှားမှုမရှိသေး</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
