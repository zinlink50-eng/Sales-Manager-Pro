---
name: SyncProvider Wiring
description: Where SyncProvider and OfflineBanner must be placed in the component tree
---

## Rule
- `SyncProvider` must be inside `QueryClientProvider` (needs `useQueryClient`) AND inside `AuthProvider` (needs `useAuth`).
- App.tsx order: `QueryClientProvider > AuthProvider > BrandingProvider > SyncProvider > BrowserRouter`
- `OfflineBanner` must be inside the `SyncProvider` tree (it calls `useSyncContext`). It lives in `Layout.tsx`.

**Why:** SyncContext uses both the query client (to invalidate queries after sync) and the authenticated user (to only sync when logged in). Getting the nesting wrong causes context-not-found runtime errors.

**How to apply:** If adding new context providers, insert them between SyncProvider and BrowserRouter, or outside AuthProvider if they don't need auth.
