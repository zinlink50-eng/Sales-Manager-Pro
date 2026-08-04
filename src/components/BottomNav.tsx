import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/",        label: "ပင်မ",        icon: LayoutDashboard, end: true },
  { to: "/sales",   label: "အရောင်း",     icon: ShoppingCart },
  { to: "/products",label: "ကုန်ပစ္စည်း", icon: Package },
  { to: "/customers",label: "ဖောက်သည်",   icon: Users },
  { to: "/reports", label: "အစီရင်ခံ",    icon: BarChart3 },
  { to: "/settings",label: "ဆက်တင်",      icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-stretch h-16">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
