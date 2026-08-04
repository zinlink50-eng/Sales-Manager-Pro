// ─────────────────────────────────────────────────────────────
//  Role-Based Access Control definitions
//  Three roles:
//    admin      – full access
//    manager    – no Settings, no Tasks
//    sales_rep  – Sales + Customers only (no Dashboard/Reports/Settings)
// ─────────────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "sales_rep";

/** Burmese display labels for roles */
export const ROLE_LABELS: Record<Role, string> = {
  admin:     "စီမံခန့်ခွဲသူ",
  manager:   "မန်နေဂျာ",
  sales_rep: "အရောင်းဝန်ထမ်း",
};

/** Colour badge styling per role */
export const ROLE_BADGE: Record<Role, string> = {
  admin:     "bg-violet-100 text-violet-700",
  manager:   "bg-blue-100 text-blue-700",
  sales_rep: "bg-emerald-100 text-emerald-700",
};

/** Exact top-level paths each role may visit */
const ALLOWED_PATHS: Record<Role, string[]> = {
  admin:     ["/", "/sales", "/products", "/customers", "/tasks", "/reports", "/settings"],
  manager:   ["/", "/sales", "/products", "/customers", "/reports"],
  sales_rep: ["/sales", "/customers"],
};

/** Where to land after login, or when redirected away from a forbidden route */
export const HOME_ROUTE: Record<Role, string> = {
  admin:     "/",
  manager:   "/",
  sales_rep: "/sales",
};

/**
 * Returns true when the given role may visit the given pathname.
 * Matches exact path or any sub-path (e.g. /sales/new is covered by /sales).
 */
export function canAccess(role: Role, pathname: string): boolean {
  return (ALLOWED_PATHS[role] ?? []).some((allowed) =>
    allowed === "/"
      ? pathname === "/"
      : pathname === allowed || pathname.startsWith(allowed + "/")
  );
}

/** Returns the full list of allowed paths for a role (used to build nav menus). */
export function getAllowedPaths(role: Role): string[] {
  return ALLOWED_PATHS[role] ?? [];
}
