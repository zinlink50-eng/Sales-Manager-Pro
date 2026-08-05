import { Bell, Search, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess, type Role } from "@/lib/rbac";

const pageMeta: Record<string, { title: string; subtitle: string; action?: { label: string; to: string } }> = {
  "/":          { title: "ပင်မစာမျက်နှာ",   subtitle: "အရောင်းအနေအထားကို ချက်ချင်းကြည့်ရှုနိုင်သည်" },
  "/sales":     { title: "အရောင်းစာမျက်နှာ", subtitle: "POS အရောင်းမှတ်တမ်း", action: { label: "အရောင်းထည့်မည်", to: "/sales?new=true" } },
  "/products":  { title: "ကုန်ပစ္စည်းများ",   subtitle: "ကုန်ပစ္စည်းစာရင်း ကြည့်ရှုစီမံမည်", action: { label: "ကုန်ပစ္စည်းထည့်မည်", to: "/products?new=true" } },
  "/customers": { title: "ဖောက်သည်များ",      subtitle: "ဖောက်သည်မှတ်တမ်းများ" },
  "/tasks":     { title: "လုပ်စရာများ",        subtitle: "လုပ်စရာများ စီမံမည်", action: { label: "လုပ်စရာထည့်မည်", to: "/tasks?new=true" } },
  "/reports":   { title: "အစီရင်ခံစာ",        subtitle: "အရောင်းအချက်အလက်နှင့် စစ်ဆေးချက်" },
  "/settings":  { title: "ဆက်တင်",            subtitle: "စနစ်ဆက်တင်ပြင်ဆင်မည်" },
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const role = (user?.role ?? "sales_rep") as Role;
  const meta = pageMeta[location.pathname] ?? { title: "Sales Manager Pro", subtitle: "" };
  const hasSettings = canAccess(role, "/settings");

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 md:px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">{meta.title}</h1>
        <p className="text-xs text-gray-500 leading-tight hidden sm:block">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ရှာဖွေမည်…"
            className="pl-9 w-48 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* Settings shortcut — mobile only, only for roles with access */}
        {hasSettings && (
          <Link to="/settings" className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={location.pathname === "/settings" ? "text-primary" : "text-gray-600"}
              title="ဆက်တင်"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        )}

        {meta.action && (
          <Link to={meta.action.to}>
            <Button size="sm" className="gap-1.5 ml-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{meta.action.label}</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
