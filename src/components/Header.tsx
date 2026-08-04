import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";

const pageMeta: Record<string, { title: string; subtitle: string; action?: { label: string; to: string } }> = {
  "/": { title: "Dashboard", subtitle: "Your sales overview at a glance" },
  "/leads": { title: "Leads", subtitle: "Track and manage incoming leads", action: { label: "Add Lead", to: "/leads?new=true" } },
  "/contacts": { title: "Contacts", subtitle: "Manage your contact database", action: { label: "Add Contact", to: "/contacts?new=true" } },
  "/deals": { title: "Pipeline", subtitle: "Track deals through your pipeline", action: { label: "Add Deal", to: "/deals?new=true" } },
  "/customers": { title: "Customers", subtitle: "Your converted customers" },
  "/products": { title: "Products", subtitle: "Manage your product catalog & inventory", action: { label: "Add Product", to: "/products?new=true" } },
  "/sales": { title: "Sales Orders", subtitle: "Record and track sales transactions", action: { label: "Record Sale", to: "/sales?new=true" } },
  "/tasks": { title: "Tasks", subtitle: "Stay on top of your to-dos", action: { label: "Add Task", to: "/tasks?new=true" } },
  "/reports": { title: "Reports & Analytics", subtitle: "Performance insights and trends" },
  "/settings": { title: "Settings", subtitle: "Configure your workspace" },
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
            placeholder="Search…"
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
