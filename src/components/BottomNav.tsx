import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { type Role, getAllowedPaths } from "@/lib/rbac";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

// Operational tabs only — Settings lives in the desktop sidebar
const OPERATIONAL_ITEMS: NavItem[] = [
  { to: "/",          label: "ပင်မ",        icon: LayoutDashboard, end: true },
  { to: "/sales",     label: "အရောင်း",     icon: ShoppingCart },
  { to: "/products",  label: "ကုန်ပစ္စည်း", icon: Package },
  { to: "/customers", label: "ဖောက်သည်",   icon: Users },
  { to: "/reports",   label: "အစီရင်ခံ",    icon: BarChart3 },
];

export default function BottomNav() {
  const { user } = useAuth();
  const role    = (user?.role ?? "sales_rep") as Role;
  const allowed = getAllowedPaths(role);

  const items = OPERATIONAL_ITEMS.filter((item) => allowed.includes(item.to));

  const tabCount  = items.length;
  const listClass = tabCount <= 2
    ? "flex items-stretch justify-center gap-0 h-16"
    : "flex items-stretch h-16";

  return (
    // Visible on mobile + tablet (< 1024 px); hidden on desktop where sidebar takes over
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className={listClass}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                tabCount <= 2 ? "w-36" : "flex-1",
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
