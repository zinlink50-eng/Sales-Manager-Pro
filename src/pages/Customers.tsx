import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Deal, Contact } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Mail, Phone, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");

  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api.get<Deal[]>("/api/deals") });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.get<Contact[]>("/api/contacts") });

  const wonDeals = deals.filter((d) => d.stage === "Closed Won");
  const customerContactIds = new Set(wonDeals.map((d) => d.contactId).filter(Boolean));
  const customers = contacts.filter((c) => customerContactIds.has(c.id));

  const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

  const filtered = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return !search || fullName.includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ဖောက်သည်စုစုပေါင်း", value: String(customers.length), icon: Building2, color: "text-blue-600 bg-blue-50" },
          { label: "စုစုပေါင်းဝင်ငွေ", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "ပိတ်ဆင်းသောဈေးကွက်", value: String(wonDeals.length), icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
          { label: "ပျမ်းမျှဈေးကွက်တန်ဖိုး", value: formatCurrency(avgDealSize), icon: DollarSign, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="ဖောက်သည်ရှာဖွေမည်..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          {customers.length === 0
            ? "ဖောက်သည်မရှိသေး — ဈေးကွက်ပိတ်ဆင်းမှသာ ဤနေရာတွင် ပေါ်လာမည်။"
            : "ရှာဖွေမှုနှင့် ကိုက်ညီသောဖောက်သည် မတွေ့ပါ။"}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const customerDeals = wonDeals.filter((d) => d.contactId === customer.id);
          const totalValue = customerDeals.reduce((s, d) => s + d.value, 0);
          const latestDeal = customerDeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                      {getInitials(`${customer.firstName} ${customer.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</div>
                    {customer.position && <div className="text-xs text-gray-500">{customer.position}</div>}
                    <Badge variant="success" className="mt-0.5">ဖောက်သည်</Badge>
                  </div>
                </div>

                <div className="space-y-1.5 border-t pt-3">
                  {customer.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />{customer.company}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`mailto:${customer.email}`} className="hover:text-primary">{customer.email}</a>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />{customer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-bold text-emerald-600">{formatCurrency(totalValue)}</div>
                    <div className="text-xs text-gray-400">စုစုပေါင်းတန်ဖိုး</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-bold text-indigo-600">{customerDeals.length}</div>
                    <div className="text-xs text-gray-400">နိုင်ရသောဈေးကွက်</div>
                  </div>
                </div>

                {latestDeal && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    နောက်ဆုံးဈေးကွက်: {latestDeal.title} · {formatDate(latestDeal.updatedAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
