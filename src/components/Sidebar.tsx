import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CheckSquare,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Package, ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "ပင်မ",
    items: [
      { to: "/", label: "ပင်မစာမျက်နှာ", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "ရောင်းမည်",
    items: [
      { to: "/sales",    label: "အရောင်းစာမျက်နှာ", icon: ShoppingCart },
      { to: "/products", label: "ကုန်ပစ္စည်းများ",    icon: Package },
      { to: "/customers",label: "ဖောက်သည်များ",       icon: Users },
    ],
  },
  {
    label: "စီမံမှု",
    items: [
      { to: "/tasks",   label: "လုပ်စရာများ",    icon: CheckSquare },
      { to: "/reports", label: "အစီရင်ခံစာ",     icon: BarChart3 },
    ],
  },
  {
    label: "စနစ်",
    items: [
      { to: "/settings", label: "ဆက်တင်", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const shopInitials = branding.shopName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SM";

  return (
    // Desktop only — completely hidden on mobile (bottom nav handles mobile)
    <aside
      className={cn(
        "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Shop Branding */}
      <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border shrink-0", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm overflow-hidden">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.shopName} className="h-9 w-9 object-cover" />
          ) : (
            shopInitials
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-white leading-tight truncate">{branding.shopName}</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">{branding.shopTagline}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end = false }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-sidebar-primary text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate capitalize">
                {user.role.replace("_", " ")}
              </div>
            </div>
          </div>
        )}
        <div className={cn("flex gap-2", collapsed ? "flex-col" : "")}>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-colors",
              collapsed ? "justify-center w-full" : "flex-1"
            )}
            title="ထွက်မည်"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>ထွက်မည်</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-colors"
            title={collapsed ? "ချဲ့မည်" : "ခေါ်ရင်ခြုံ့မည်"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
