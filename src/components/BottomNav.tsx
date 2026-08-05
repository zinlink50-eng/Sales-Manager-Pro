import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  CheckSquare, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { type Role, getAllowedPaths } from "@/lib/rbac";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

// Full set of bottom-nav items per role — filtered at render time
const ALL_ITEMS: NavItem[] = [
  { to: "/",          label: "ပင်မ",        icon: LayoutDashboard, end: true },
  { to: "/sales",     label: "အရောင်း",     icon: ShoppingCart },
  { to: "/products",  label: "ကုန်ပစ္စည်း", icon: Package },
  { to: "/customers", label: "ဖောက်သည်",   icon: Users },
  { to: "/tasks",     label: "လုပ်စရာ",     icon: CheckSquare },
  { to: "/reports",   label: "အစီရင်ခံ",    icon: BarChart3 },
  { to: "/settings",  label: "ဆက်တင်",      icon: Settings },
];

export default function BottomNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role    = (user?.role ?? "sales_rep") as Role;
  const allowed = getAllowedPaths(role);

  // Keep only paths the role can access; cap at 5 so they don't get tiny
  const items = ALL_ITEMS.filter((item) => allowed.includes(item.to)).slice(0, 5);

  return (
    // Visible only on mobile + tablet (< 1024 px)
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-[68px]">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation select-none",
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600 active:text-gray-700"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-8 rounded-full transition-all",
                    isActive ? "bg-primary/10" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all",
                      isActive ? "h-6 w-6 text-primary" : "h-5 w-5"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    isActive ? "text-primary font-semibold" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout — always shown at far right, small */}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex flex-col items-center justify-center gap-1 px-3 text-gray-300 hover:text-red-400 active:text-red-500 transition-colors touch-manipulation select-none"
          aria-label="ထွက်မည်"
        >
          <div className="flex items-center justify-center w-10 h-8">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-[9px] font-medium leading-none">ထွက်</span>
        </button>
      </div>
    </nav>
  );
}
