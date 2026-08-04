import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { type Role, getAllowedPaths } from "@/lib/rbac";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

// Full ordered list of bottom-nav tabs
const ALL_ITEMS: NavItem[] = [
  { to: "/",         label: "ပင်မ",        icon: LayoutDashboard, end: true },
  { to: "/sales",    label: "အရောင်း",     icon: ShoppingCart },
  { to: "/products", label: "ကုန်ပစ္စည်း", icon: Package },
  { to: "/customers",label: "ဖောက်သည်",   icon: Users },
  { to: "/reports",  label: "အစီရင်ခံ",    icon: BarChart3 },
  { to: "/settings", label: "ဆက်တင်",      icon: Settings },
];

export default function BottomNav() {
  const { user } = useAuth();
  const role     = (user?.role ?? "sales_rep") as Role;
  const allowed  = getAllowedPaths(role);
  const items    = ALL_ITEMS.filter((item) => allowed.includes(item.to));

  // Decide tab width: more tabs → smaller, fewer tabs → larger
  const tabCount = items.length;
  // For ≤2 tabs make them centred rather than stretching awkwardly
  const listClass = tabCount <= 2
    ? "flex items-stretch justify-center gap-0 h-16"
    : "flex items-stretch h-16";

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className={listClass}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                tabCount <= 2 ? "w-32" : "flex-1",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
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
