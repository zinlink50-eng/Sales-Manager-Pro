import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Deal, Lead, Contact, RevenueData, PipelineFunnelData, DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Award } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function Reports() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => api.get<DashboardStats>("/api/dashboard/stats") });
  const { data: revenue } = useQuery({ queryKey: ["dashboard-revenue"], queryFn: () => api.get<RevenueData[]>("/api/dashboard/revenue") });
  const { data: funnel } = useQuery({ queryKey: ["dashboard-funnel"], queryFn: () => api.get<PipelineFunnelData[]>("/api/dashboard/pipeline-funnel") });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api.get<Deal[]>("/api/deals") });
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: () => api.get<Lead[]>("/api/leads") });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.get<Contact[]>("/api/contacts") });

  // Lead source breakdown
  const leadSources = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const leadSourceData = Object.entries(leadSources).map(([name, value]) => ({ name, value }));

  // Deal stage breakdown
  const dealStages = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + d.value;
    return acc;
  }, {} as Record<string, number>);
  const dealStageData = Object.entries(dealStages).map(([name, value]) => ({ name, value }));

  // Rep performance
  const repPerformance = deals.reduce((acc, d) => {
    const rep = d.assignedToName || "တာဝန်မပေးရသေး";
    if (!acc[rep]) acc[rep] = { rep, won: 0, total: 0, wonValue: 0, totalValue: 0 };
    acc[rep].total += 1;
    acc[rep].totalValue += d.value;
    if (d.stage === "Closed Won") {
      acc[rep].won += 1;
      acc[rep].wonValue += d.value;
    }
    return acc;
  }, {} as Record<string, any>);
  const repData = Object.values(repPerformance).map((r: any) => ({
    ...r,
    winRate: r.total > 0 ? Math.round((r.won / r.total) * 100) : 0,
  }));

  // Lead status breakdown
  const leadStatusData = [
    { name: "အသစ်", value: leads.filter((l) => l.status === "new").length },
    { name: "ဆက်သွယ်ပြီး", value: leads.filter((l) => l.status === "contacted").length },
    { name: "အရည်အချင်းပြည့်", value: leads.filter((l) => l.status === "qualified").length },
    { name: "ဖောက်သည်ဖြစ်ပြီ", value: leads.filter((l) => l.status === "converted").length },
    { name: "မသင့်လျော်", value: leads.filter((l) => l.status === "unqualified").length },
  ].filter((d) => d.value > 0);

  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const avgDeal = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "စုစုပေါင်းဝင်ငွေ", value: formatCurrency(totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600", change: "+18.5%" },
          { label: "နိုင်မှုနှုန်း", value: `${winRate}%`, icon: Award, color: "bg-blue-50 text-blue-600", change: "+3.2%" },
          { label: "ပျမ်းမျှဈေးကွက်တန်ဖိုး", value: formatCurrency(avgDeal), icon: TrendingUp, color: "bg-indigo-50 text-indigo-600", change: "+5.1%" },
          { label: "အဆက်အသွယ်စုစုပေါင်း", value: String(contacts.length), icon: Users, color: "bg-amber-50 text-amber-600", change: "+12" },
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
          <TabsTrigger value="pipeline">ဈေးကွက်စီမံ</TabsTrigger>
          <TabsTrigger value="leads">လိဒ်</TabsTrigger>
          <TabsTrigger value="performance">အဖွဲ့စွမ်းဆောင်ရည်</TabsTrigger>
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
                    <Area type="monotone" dataKey="target" stroke="#e5e7eb" fill="none" strokeWidth={2} strokeDasharray="4 2" name="ပန်းတိုင်" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">ဈေးကွက်အလိုက် ဝင်ငွေ</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={wonDeals.slice(0, 8)} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="company" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="တန်ဖိုး" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">ဆင့်အလိုက် ဈေးကွက်တန်ဖိုး</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="တန်ဖိုး" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">ဆင့်အလိုက် ဈေးကွက် (တန်ဖိုး)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={dealStageData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {dealStageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Deals table */}
          <Card>
            <CardHeader><CardTitle className="text-base">လက်ရှိဈေးကွက်အားလုံး</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["ဈေးကွက်", "ကုမ္ပဏီ", "ဆင့်", "တန်ဖိုး", "ဖြစ်နိုင်ချေ", "ပိတ်ဆင်းမည့်ရက်", "ရောင်းသူ"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deals.filter((d) => !["Closed Lost"].includes(d.stage)).map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium">{deal.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{deal.company || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant={deal.stage === "Closed Won" ? "success" : "secondary"}>{deal.stage}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">{formatCurrency(deal.value)}</td>
                        <td className="px-4 py-3 text-sm">{deal.probability}%</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(deal.expectedClose)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{deal.assignedToName || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">လိဒ်ရင်းမြစ်</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={leadSourceData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name">
                      {leadSourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">လိဒ်အခြေအနေ ခွဲခြမ်းစိတ်ဖြာ</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={leadStatusData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="လိဒ်">
                      {leadStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lead value by source */}
          <Card>
            <CardHeader><CardTitle className="text-base">ရင်းမြစ်အလိုက် လိဒ်တန်ဖိုး</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={Object.entries(
                    leads.reduce((acc, l) => { acc[l.source] = (acc[l.source] || 0) + (l.value || 0); return acc; }, {} as Record<string, number>)
                  ).map(([name, value]) => ({ name, value }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="တန်ဖိုး" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">ရောင်းသူအလိုက် ဝင်ငွေ</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={repData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="rep" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="wonValue" fill="#10b981" name="နိုင်ရဝင်ငွေ" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalValue" fill="#e5e7eb" name="ဈေးကွက်တန်ဖိုးစုစုပေါင်း" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">ရောင်းသူအလိုက် နိုင်မှုနှုန်း</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 pt-2">
                  {repData.map((rep) => (
                    <div key={rep.rep} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{rep.rep}</span>
                        <span className="text-gray-500">{rep.won}/{rep.total} ဈေးကွက် · {rep.winRate}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rep.winRate}%` }} />
                      </div>
                      <div className="text-xs text-gray-400">နိုင်ရ: {formatCurrency(rep.wonValue)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">ရောင်းသူ စွမ်းဆောင်ရည် အသေးစိတ်</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["ရောင်းသူ", "ဈေးကွက်စုစုပေါင်း", "နိုင်ရ", "နိုင်မှုနှုန်း", "ဈေးကွက်တန်ဖိုးစုစုပေါင်း", "နိုင်ရဝင်ငွေ"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {repData.sort((a, b) => b.wonValue - a.wonValue).map((rep) => (
                    <tr key={rep.rep} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-sm">{rep.rep}</td>
                      <td className="px-4 py-3 text-sm">{rep.total}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{rep.won}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rep.winRate}%` }} /></div>
                          {rep.winRate}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-primary font-medium">{formatCurrency(rep.totalValue)}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{formatCurrency(rep.wonValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
