import { Bell, Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";

const pageMeta: Record<string, { title: string; subtitle: string; action?: { label: string; to: string } }> = {
  "/": { title: "ပင်မစာမျက်နှာ", subtitle: "အရောင်းအနေအထားကို ချက်ချင်းကြည့်ရှုနိုင်သည်" },
  "/leads": { title: "လိဒ်များ", subtitle: "လာရောက်သောလိဒ်များ ကြည့်ရှုစီမံမည်", action: { label: "လိဒ်ထည့်မည်", to: "/leads?new=true" } },
  "/contacts": { title: "အဆက်အသွယ်များ", subtitle: "အဆက်အသွယ်များ ကြည့်ရှုစီမံမည်", action: { label: "အဆက်အသွယ်ထည့်မည်", to: "/contacts?new=true" } },
  "/deals": { title: "ဈေးကွက်", subtitle: "ဈေးကွက်များ ကြည့်ရှုမည်", action: { label: "ဈေးကွက်ထည့်မည်", to: "/deals?new=true" } },
  "/customers": { title: "ဖောက်သည်များ", subtitle: "ရောင်းပြီးသောဖောက်သည်များ" },
  "/products": { title: "ကုန်ပစ္စည်းများ", subtitle: "ကုန်ပစ္စည်းစာရင်း ကြည့်ရှုစီမံမည်", action: { label: "ကုန်ပစ္စည်းထည့်မည်", to: "/products?new=true" } },
  "/sales": { title: "အရောင်းစာရင်း", subtitle: "အရောင်းမှတ်တမ်းများ ကြည့်ရှုမည်", action: { label: "အရောင်းထည့်မည်", to: "/sales?new=true" } },
  "/tasks": { title: "လုပ်စရာများ", subtitle: "လုပ်စရာများ စီမံမည်", action: { label: "လုပ်စရာထည့်မည်", to: "/tasks?new=true" } },
  "/reports": { title: "အစီရင်ခံ", subtitle: "အရောင်းအချက်အလက်နှင့် စစ်ဆေးချက်" },
  "/settings": { title: "ဆက်တင်", subtitle: "စနစ်ဆက်တင်ပြင်ဆင်မည်" },
};

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? { title: "Sales Manager Pro", subtitle: "" };

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </Button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">{meta.title}</h1>
        <p className="text-xs text-gray-500 leading-tight">{meta.subtitle}</p>
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
