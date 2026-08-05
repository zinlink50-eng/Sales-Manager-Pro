/**
 * sync.ts
 * ───────
 * Two operations:
 *   pullFromServer()  – fetch all data from server → store in IndexedDB
 *   drainOutbox()     – push pending local changes → server, resolve temp IDs
 *
 * Both accept a QueryClient so they can invalidate React Query
 * caches when data changes.
 */

import type { QueryClient } from '@tanstack/react-query';
import type { Product, Contact, Sale, User } from '@/types';
import { localDb } from './db';
import { api } from './api';

// ── Pull: server → IndexedDB ──────────────────────────────────────
export async function pullFromServer(qc: QueryClient): Promise<void> {
  // Identify records with pending outbox entries — do not overwrite them
  const pending       = await localDb.outbox.toArray();
  const pendingIds    = {
    products: new Set(pending.filter(e => e.resource === 'products').map(e => e.localId)),
    contacts: new Set(pending.filter(e => e.resource === 'contacts').map(e => e.localId)),
    sales:    new Set(pending.filter(e => e.resource === 'sales').map(e => e.localId)),
  };

  const [products, contacts, sales, users] = await Promise.all([
    api.get<Product[]>('/api/products'),
    api.get<Contact[]>('/api/contacts'),
    api.get<Sale[]>('/api/sales'),
    api.get<User[]>('/api/users'),
  ]);

  await localDb.transaction('rw', [localDb.products, localDb.contacts, localDb.sales, localDb.users], async () => {
    // ── Products ──
    const serverProductIds = new Set(products.map(p => p.id));
    for (const local of await localDb.products.toArray()) {
      if (!serverProductIds.has(local.id) && !pendingIds.products.has(local.id)) {
        await localDb.products.delete(local.id);
      }
    }
    for (const p of products) {
      if (!pendingIds.products.has(p.id)) await localDb.products.put(p);
    }

    // ── Contacts ──
    const serverContactIds = new Set(contacts.map(c => c.id));
    for (const local of await localDb.contacts.toArray()) {
      if (!serverContactIds.has(local.id) && !pendingIds.contacts.has(local.id)) {
        await localDb.contacts.delete(local.id);
      }
    }
    for (const c of contacts) {
      if (!pendingIds.contacts.has(c.id)) await localDb.contacts.put(c);
    }

    // ── Sales ──
    const serverSaleIds = new Set(sales.map(s => s.id));
    for (const local of await localDb.sales.toArray()) {
      if (!serverSaleIds.has(local.id) && !pendingIds.sales.has(local.id)) {
        await localDb.sales.delete(local.id);
      }
    }
    for (const s of sales) {
      if (!pendingIds.sales.has(s.id)) await localDb.sales.put(s);
    }

    // ── Users (read-only, always overwrite) ──
    await localDb.users.clear();
    await localDb.users.bulkPut(users);
  });

  qc.invalidateQueries({ queryKey: ['products'] });
  qc.invalidateQueries({ queryKey: ['contacts'] });
  qc.invalidateQueries({ queryKey: ['sales'] });
  qc.invalidateQueries({ queryKey: ['users'] });
}

// ── Drain: IndexedDB outbox → server ─────────────────────────────
export async function drainOutbox(qc: QueryClient): Promise<number> {
  const entries = await localDb.outbox.orderBy('createdAt').toArray();
  if (!entries.length) return 0;

  // Sort: contacts first (contacts may be referenced by sales), then products, then sales
  const ORDER: Record<string, number> = { contacts: 0, products: 1, sales: 2 };
  entries.sort((a, b) => (ORDER[a.resource] ?? 3) - (ORDER[b.resource] ?? 3));

  // Map: `resource:localId` → real server id (built as we go)
  const idMap = new Map<string, number>();
  let synced = 0;

  for (const entry of entries) {
    try {
      if (entry.operation === 'create') {
        let payload = entry.payload as Record<string, unknown>;

        // Fix temp contact ID inside a sale payload
        if (entry.resource === 'sales') {
          const cid = payload.contactId as number | undefined;
          if (cid && cid < 0) {
            const realId = idMap.get(`contacts:${cid}`);
            if (realId) payload = { ...payload, contactId: realId };
          }
        }

        // POST to server
        const created = await api.post<Record<string, unknown>>(`/api/${entry.resource}`, payload);
        const serverId = created.id as number;

        // Record mapping for downstream entries (e.g. sale references contact)
        idMap.set(`${entry.resource}:${entry.localId}`, serverId);

        // Replace temp local record with authoritative server record
        // Use the correct table via type-safe lookup
        const tbl = localDb[entry.resource as 'products' | 'contacts' | 'sales'];
        await tbl.delete(entry.localId as never);
        await tbl.put(created as never);
        await localDb.outbox.delete(entry.id!);

      } else if (entry.operation === 'update') {
        const updated = await api.put<Record<string, unknown>>(
          `/api/${entry.resource}/${entry.localId}`,
          entry.payload,
        );
        const tbl = localDb[entry.resource as 'products' | 'contacts' | 'sales'];
        await tbl.put(updated as never);
        await localDb.outbox.delete(entry.id!);

      } else if (entry.operation === 'delete') {
        // Server may return 404 if it never received the create — that's fine
        try {
          await api.delete(`/api/${entry.resource}/${entry.localId}`);
        } catch (_e) { /* ignore 404 */ }
        await localDb.outbox.delete(entry.id!);
      }

      synced++;
    } catch (err) {
      await localDb.outbox.update(entry.id!, {
        retries: (entry.retries ?? 0) + 1,
        error:   (err as Error).message,
      });
      // Stop processing to preserve order; user can retry later
      break;
    }
  }

  if (synced > 0) {
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['contacts'] });
    qc.invalidateQueries({ queryKey: ['sales'] });
  }

  return synced;
}

// ── Convenience: drain then pull ─────────────────────────────────
export async function syncAll(qc: QueryClient): Promise<void> {
  await drainOutbox(qc);
  await pullFromServer(qc);
}
