import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";

const pageMeta: Record<string, { title: string; subtitle: string; action?: { label: string; to: string } }> = {
  "/": { title: "ပင်မစာမျက်နှာ", subtitle: "သင်၏ အရောင်းအနေအထားကို ချက်ချင်းကြည့်ရှုနိုင်သည်" },
  "/leads": { title: "လိဒ်များ", subtitle: "လာရောက်သောလိဒ်များ ခြေရာခံပြီး စီမံခန့်ခွဲမည်", action: { label: "လိဒ်ထည့်မည်", to: "/leads?new=true" } },
  "/contacts": { title: "အဆက်အသွယ်များ", subtitle: "အဆက်အသွယ်ဒေတာဘေ့စ် စီမံခန့်ခွဲမည်", action: { label: "အဆက်အသွယ်ထည့်မည်", to: "/contacts?new=true" } },
  "/deals": { title: "ဈေးကွက်စီမံ", subtitle: "ဈေးကွက်စီမံတွင် ဈေးကွက်များ ခြေရာခံမည်", action: { label: "ဈေးကွက်ထည့်မည်", to: "/deals?new=true" } },
  "/customers": { title: "ဖောက်သည်များ", subtitle: "ဖောက်သည်ဖြစ်ပြီးသောသူများ" },
  "/products": { title: "ကုန်ပစ္စည်းများ", subtitle: "ကုန်ပစ္စည်းစာရင်းနှင့် လက်ကျန်ကုန်ပစ္စည်း စီမံခန့်ခွဲမည်", action: { label: "ကုန်ပစ္စည်းထည့်မည်", to: "/products?new=true" } },
  "/sales": { title: "အရောင်းမှာယူမှုများ", subtitle: "အရောင်းငွေသွင်းများ မှတ်တမ်းတင်ပြီး ခြေရာခံမည်", action: { label: "အရောင်းမှတ်တမ်းတင်မည်", to: "/sales?new=true" } },
  "/tasks": { title: "လုပ်ဆောင်ချက်များ", subtitle: "လုပ်ဆောင်ရမည့်ကိစ္စများ ထိပ်တန်းထားမည်", action: { label: "လုပ်ဆောင်ချက်ထည့်မည်", to: "/tasks?new=true" } },
  "/reports": { title: "အစီရင်ခံစာများ နှင့် ခွဲခြမ်းစိတ်ဖြာမှု", subtitle: "စွမ်းဆောင်ရည် ထိုးထွင်းသိမြင်မှုများနှင့် ခေတ်လမ်းစဉ်" },
  "/settings": { title: "ဆက်တင်များ", subtitle: "သင်၏ အလုပ်ခွင်ကို ပြင်ဆင်သတ်မှတ်မည်" },
};

export default function Header() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? { title: "Sales Manager Pro", subtitle: "" };

  return (
    <header className="h-16 border-b bg-white flex items-center px-6 gap-4 shrink-0">
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
              {meta.action.label}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
