---
name: Offline-First Data Layer
description: How pages read/write data — always via offline-api.ts, never api.ts directly from pages
---

## Rule
All page-level `useQuery` calls must use `productsOffline.list`, `salesOffline.list`, etc. from `src/lib/offline-api.ts` — NOT `api.get('/api/...')` directly. All page-level mutations must use `productsOffline.create/update/delete`, etc.

**Why:** IndexedDB (Dexie) is the source of truth for reads. SyncContext keeps it current when online. This lets the app work fully offline without any UI changes.

**How to apply:**
- Import from `@/lib/offline-api` in pages, not `@/lib/api`
- `api.ts` is used only by `sync.ts` (pull/drain logic) — keep it that way
- After a mutation, invalidate the relevant React Query key so localDb re-read triggers

## Sync flow
1. User logs in → SyncContext calls `syncAll()` (drain outbox + pull server → localDb)
2. User goes offline → reads still work (localDb has data), writes go to outbox
3. User comes back online → SyncContext auto-drains outbox, then re-pulls

## Tables
- `localDb.products`, `.contacts`, `.sales`, `.users` — mirror server schema
- `localDb.outbox` — pending creates/updates/deletes; drained by `drainOutbox()` in sync.ts
