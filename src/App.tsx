import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { SyncProvider } from "@/contexts/SyncContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Tasks from "@/pages/Tasks";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import { canAccess, HOME_ROUTE, type Role } from "@/lib/rbac";

// ── Role guard – wraps individual route elements ──────────────
function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;
  const role = user.role as Role;
  if (!canAccess(role, location.pathname)) {
    return <Navigate to={HOME_ROUTE[role]} replace />;
  }
  return <>{children}</>;
}

// ── Redirects to the role-specific home page ──────────────────
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_ROUTE[user.role as Role]} replace />;
}

// ── All protected routes ──────────────────────────────────────
function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="h-5 w-5 bg-primary rounded" />
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Dashboard — admin & manager only */}
        <Route
          index
          element={
            <RoleGuard>
              <Dashboard />
            </RoleGuard>
          }
        />

        {/* Sales & Customers — all roles */}
        <Route path="sales"     element={<Sales />} />
        <Route path="customers" element={<Customers />} />

        {/* Products — admin & manager */}
        <Route
          path="products"
          element={
            <RoleGuard>
              <Products />
            </RoleGuard>
          }
        />

        {/* Tasks — admin only */}
        <Route
          path="tasks"
          element={
            <RoleGuard>
              <Tasks />
            </RoleGuard>
          }
        />

        {/* Reports — admin & manager */}
        <Route
          path="reports"
          element={
            <RoleGuard>
              <Reports />
            </RoleGuard>
          }
        />

        {/* Settings — admin only */}
        <Route
          path="settings"
          element={
            <RoleGuard>
              <Settings />
            </RoleGuard>
          }
        />

        {/* Catch-all: redirect to role home */}
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  );
}

// ── Public (login) route ──────────────────────────────────────
function PublicRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to={HOME_ROUTE[user.role as Role]} replace />;
  return <Login />;
}

// ── App root ──────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandingProvider>
          <SyncProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicRoute />} />
                <Route path="/*"    element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </SyncProvider>
        </BrandingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
