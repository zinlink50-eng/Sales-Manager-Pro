/**
 * offline-ops.ts
 * ──────────────
 * All CRUD operations for the three offline-capable resources
 * (products, contacts, sales).  Every write goes to IndexedDB
 * first; server sync is handled separately by sync.ts.
 *
 * Outbox policy — one entry per (resource, localId):
 *   create + update  →  keep create, merge payload
 *   create + delete  →  remove both (never reached server)
 *   update + delete  →  replace with delete
 */

import type { Product, Contact, Sale } from '@/types';
import { localDb, genTempId, type OutboxEntry } from './db';

// ── Internal: upsert a single outbox entry per record ─────────────
async function upsertOutbox(
  entry: Omit<OutboxEntry, 'id' | 'retries' | 'error' | 'createdAt'>
): Promise<void> {
  const existing = await localDb.outbox
    .where('[resource+localId]')
    .equals([entry.resource, entry.localId])
    .first();

  if (existing) {
    if (entry.operation === 'delete' && existing.operation === 'create') {
      // Offline create + offline delete → cancel both, never touched server
      await localDb.outbox.delete(existing.id!);
      return;
    }
    if (existing.operation === 'create' && entry.operation === 'update') {
      // Merge update payload into the pending create
      await localDb.outbox.update(existing.id!, {
        payload: { ...(existing.payload as Record<string, unknown>), ...(entry.payload as Record<string, unknown>) },
      });
      return;
    }
    // Otherwise replace (e.g. update → delete, or update → update)
    await localDb.outbox.update(existing.id!, {
      operation: entry.operation,
      payload:   entry.payload,
      retries:   0,
      error:     undefined,
    });
  } else {
    await localDb.outbox.add({ ...entry, retries: 0, createdAt: Date.now() });
  }
}

const now = () => new Date().toISOString();

// ────────────────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────────────────
export async function localCreateProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const id     = genTempId();
  const record: Product = { ...data as Product, id, createdAt: now(), updatedAt: now() };
  await localDb.products.put(record);
  await upsertOutbox({ resource: 'products', operation: 'create', localId: id, payload: data });
  return record;
}

export async function localUpdateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const existing = await localDb.products.get(id);
  if (!existing) throw new Error('Product not found');
  const updated: Product = { ...existing, ...data, updatedAt: now() };
  await localDb.products.put(updated);
  await upsertOutbox({ resource: 'products', operation: 'update', localId: id, payload: updated });
  return updated;
}

export async function localDeleteProduct(id: number): Promise<void> {
  await localDb.products.delete(id);
  await upsertOutbox({ resource: 'products', operation: 'delete', localId: id, payload: null });
}

// ────────────────────────────────────────────────────────────────
// CONTACTS
// ────────────────────────────────────────────────────────────────
export async function localCreateContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
  const id     = genTempId();
  const record: Contact = { ...data as Contact, id, createdAt: now(), updatedAt: now() };
  await localDb.contacts.put(record);
  await upsertOutbox({ resource: 'contacts', operation: 'create', localId: id, payload: data });
  return record;
}

export async function localUpdateContact(id: number, data: Partial<Contact>): Promise<Contact> {
  const existing = await localDb.contacts.get(id);
  if (!existing) throw new Error('Contact not found');
  const updated: Contact = { ...existing, ...data, updatedAt: now() };
  await localDb.contacts.put(updated);
  await upsertOutbox({ resource: 'contacts', operation: 'update', localId: id, payload: updated });
  return updated;
}

export async function localDeleteContact(id: number): Promise<void> {
  await localDb.contacts.delete(id);
  await upsertOutbox({ resource: 'contacts', operation: 'delete', localId: id, payload: null });
}

// ────────────────────────────────────────────────────────────────
// SALES
// ────────────────────────────────────────────────────────────────
export async function localCreateSale(
  data: Omit<Sale, 'id' | 'createdAt'>,
  contacts: Array<{ id: number; firstName: string; lastName: string }>,
  users:    Array<{ id: number; name: string }>,
): Promise<Sale> {
  const id = genTempId();
  // Resolve display names at creation time (needed for offline display)
  const contact = data.contactId ? contacts.find(c => c.id === data.contactId) : undefined;
  const user    = data.assignedTo ? users.find(u => u.id === data.assignedTo) : undefined;
  const record: Sale = {
    ...data,
    id,
    createdAt:      now(),
    contactName:    contact ? `${contact.firstName} ${contact.lastName}` : undefined,
    assignedToName: user?.name,
  };
  await localDb.sales.put(record);
  await upsertOutbox({ resource: 'sales', operation: 'create', localId: id, payload: data });
  return record;
}

export async function localDeleteSale(id: number): Promise<void> {
  await localDb.sales.delete(id);
  await upsertOutbox({ resource: 'sales', operation: 'delete', localId: id, payload: null });
}
