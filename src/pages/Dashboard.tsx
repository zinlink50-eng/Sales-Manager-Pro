import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardStats, RevenueData, PipelineFunnelData, Activity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target, Percent,
  Phone, Mail, Calendar, FileText, CheckCircle, Star, Briefcase,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";
import { formatCurrency, formatRelativeDate, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: "text-blue-500 bg-blue-50" },
  email: { icon: Mail, color: "text-purple-500 bg-purple-50" },
  meeting: { icon: Calendar, color: "text-green-500 bg-green-50" },
  note: { icon: FileText, color: "text-gray-500 bg-gray-50" },
  deal_created: { icon: Briefcase, color: "text-indigo-500 bg-indigo-50" },
  deal_updated: { icon: TrendingUp, color: "text-amber-500 bg-amber-50" },
  lead_created: { icon: Target, color: "text-cyan-500 bg-cyan-50" },
  contact_created: { icon: Users, color: "text-pink-500 bg-pink-50" },
  task_completed: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-50" },
};

function KpiCard({
  title, value, growth, icon: Icon,
}: {
  title: string; value: number | string; growth: number;
  icon: React.ElementType;
}) {
  const isPositive = growth >= 0;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(growth)}% ယခင်လနှင့် နှိုင်းယှဉ်
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/api/dashboard/stats"),
  });
  const { data: revenue } = useQuery({
    queryKey: ["dashboard-revenue"],
    queryFn: () => api.get<RevenueData[]>("/api/dashboard/revenue"),
  });
  const { data: funnel } = useQuery({
    queryKey: ["dashboard-funnel"],
    queryFn: () => api.get<PipelineFunnelData[]>("/api/dashboard/pipeline-funnel"),
  });
  const { data: activities } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: () => api.get<Activity[]>("/api/dashboard/activities"),
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="စုစုပေါင်းဝင်ငွေ"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          growth={stats?.revenueGrowth ?? 0}
          icon={DollarSign}
        />
        <KpiCard
          title="လက်ရှိဈေးကွက်"
          value={stats?.activeDeals ?? 0}
          growth={stats?.dealsGrowth ?? 0}
          icon={Briefcase}
        />
        <KpiCard
          title="လိဒ်အသစ် (ရက် ၃၀)"
          value={stats?.newLeads ?? 0}
          growth={stats?.leadsGrowth ?? 0}
          icon={Target}
        />
        <KpiCard
          title="ပြောင်းနှုန်း"
          value={`${stats?.conversionRate ?? 0}%`}
          growth={stats?.conversionGrowth ?? 0}
          icon={Percent}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">ဝင်ငွေ နှင့် ပန်းတိုင်</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone" dataKey="revenue" stroke="#3b82f6"
                  fill="url(#colorRevenue)" strokeWidth={2} name="ဝင်ငွေ"
                />
                <Area
                  type="monotone" dataKey="target" stroke="#e5e7eb"
                  fill="none" strokeWidth={2} strokeDasharray="4 2" name="ပန်းတိုင်"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ဈေးကွက်အနေအထား</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnel?.map((item, i) => {
                const maxVal = funnel[0]?.value || 1;
                const pct = Math.round((item.value / maxVal) * 100);
                const colors = ["bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-amber-500"];
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gray-700">{item.stage}</span>
                      <span className="text-gray-500">{item.count} ဈေးကွက် · {formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors[i % colors.length])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ဝင်ငွေ ခန့်မှန်းချက်</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(stats.pipelineValue)}</span>
                </div>
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
              const Icon = config.icon;
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
