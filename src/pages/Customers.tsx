import { useQuery } from "@tanstack/react-query";
import { salesOffline, contactsOffline } from "@/lib/offline-api";
import type { Sale, Contact } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, ShoppingCart, Calendar, Phone, Mail, Building2, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");

  const { data: sales = [] }    = useQuery({ queryKey: ["sales"],    queryFn: salesOffline.list });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: contactsOffline.list });

  // Build customer list: contacts who appear in at least one sale
  const customerIds = new Set(sales.map((s) => s.contactId).filter(Boolean));
  const customers   = contacts.filter((c) => customerIds.has(c.id));

  const totalRevenue = sales
    .filter((s) => s.status === "confirmed" || s.status === "delivered")
    .reduce((sum, s) => sum + s.total, 0);
  const avgSpend = customers.length > 0
    ? sales.reduce((sum, s) => sum + s.total, 0) / customers.length
    : 0;

  const filtered = customers.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ဖောက်သည်စုစုပေါင်း",    value: String(customers.length),        icon: ShoppingCart, color: "text-blue-600 bg-blue-50"    },
          { label: "စုစုပေါင်းဝင်ငွေ",        value: formatCurrency(totalRevenue),     icon: DollarSign,   color: "text-emerald-600 bg-emerald-50" },
          { label: "အရောင်းအကြိမ်ရေ",         value: String(sales.length),             icon: TrendingUp,   color: "text-indigo-600 bg-indigo-50" },
          { label: "ပျမ်းမျှဖောက်သည်မှ ဝင်ငွေ", value: formatCurrency(avgSpend),        icon: DollarSign,   color: "text-amber-600 bg-amber-50"  },
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
            ? "ဖောက်သည်မရှိသေး — အရောင်းမှတ်တမ်းတင်ပြီးမှ ဤနေရာတွင် ပေါ်လာမည်။"
            : "ရှာဖွေမှုနှင့် ကိုက်ညီသောဖောက်သည် မတွေ့ပါ။"}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const customerSales = sales.filter((s) => s.contactId === customer.id);
          const totalSpent    = customerSales.reduce((sum, s) => sum + s.total, 0);
          const lastSale      = [...customerSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

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
                    {customer.company && <div className="text-xs text-gray-500">{customer.company}</div>}
                    <Badge variant="success" className="mt-0.5 text-xs">ဖောက်သည်</Badge>
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
                    <a href={`mailto:${customer.email}`} className="hover:text-primary truncate">{customer.email}</a>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />{customer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-bold text-emerald-600">{formatCurrency(totalSpent)}</div>
                    <div className="text-xs text-gray-400">စုစုပေါင်းသုံးငွေ</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-bold text-indigo-600">{customerSales.length}</div>
                    <div className="text-xs text-gray-400">ဝယ်ယူမှုအကြိမ်</div>
                  </div>
                </div>

                {lastSale && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    နောက်ဆုံးဝယ်: {formatDate(lastSale.date)}
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
