/**
 * offline-api.ts
 * ──────────────
 * Offline-aware CRUD wrappers.
 *
 * Reads always come from local IndexedDB (populated by SyncContext on login/reconnect).
 * Writes go to the server immediately when online; when offline they land in the outbox
 * and are pushed automatically when connectivity returns.
 */

import { localDb, genTempId } from './db';
import { api } from './api';
import type { Product, Contact, Sale, User } from '@/types';

// ─── Products ──────────────────────────────────────────────────────────────────
export const productsOffline = {
  list: (): Promise<Product[]> => localDb.products.toArray(),

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    if (navigator.onLine) {
      const created = await api.post<Product>('/api/products', data);
      await localDb.products.put(created);
      return created;
    }
    const tempId = genTempId();
    const local = { ...data, id: tempId } as Product;
    await localDb.products.put(local);
    await localDb.outbox.add({
      resource: 'products', operation: 'create',
      localId: tempId, payload: data, retries: 0, createdAt: Date.now(),
    });
    return local;
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    if (navigator.onLine) {
      const updated = await api.put<Product>(`/api/products/${id}`, data);
      await localDb.products.put(updated);
      return updated;
    }
    const local = await localDb.products.get(id);
    const merged = { ...(local ?? {}), ...data, id } as Product;
    await localDb.products.put(merged);
    await localDb.outbox.add({
      resource: 'products', operation: 'update',
      localId: id, payload: data, retries: 0, createdAt: Date.now(),
    });
    return merged;
  },

  delete: async (id: number): Promise<void> => {
    if (navigator.onLine) {
      await api.delete(`/api/products/${id}`);
    } else {
      await localDb.outbox.add({
        resource: 'products', operation: 'delete',
        localId: id, payload: null, retries: 0, createdAt: Date.now(),
      });
    }
    await localDb.products.delete(id);
  },
};

// ─── Contacts ──────────────────────────────────────────────────────────────────
export const contactsOffline = {
  list: (): Promise<Contact[]> => localDb.contacts.toArray(),

  create: async (data: Omit<Contact, 'id'>): Promise<Contact> => {
    if (navigator.onLine) {
      const created = await api.post<Contact>('/api/contacts', data);
      await localDb.contacts.put(created);
      return created;
    }
    const tempId = genTempId();
    const local = { ...data, id: tempId } as Contact;
    await localDb.contacts.put(local);
    await localDb.outbox.add({
      resource: 'contacts', operation: 'create',
      localId: tempId, payload: data, retries: 0, createdAt: Date.now(),
    });
    return local;
  },

  update: async (id: number, data: Partial<Contact>): Promise<Contact> => {
    if (navigator.onLine) {
      const updated = await api.put<Contact>(`/api/contacts/${id}`, data);
      await localDb.contacts.put(updated);
      return updated;
    }
    const local = await localDb.contacts.get(id);
    const merged = { ...(local ?? {}), ...data, id } as Contact;
    await localDb.contacts.put(merged);
    await localDb.outbox.add({
      resource: 'contacts', operation: 'update',
      localId: id, payload: data, retries: 0, createdAt: Date.now(),
    });
    return merged;
  },

  delete: async (id: number): Promise<void> => {
    if (navigator.onLine) {
      await api.delete(`/api/contacts/${id}`);
    } else {
      await localDb.outbox.add({
        resource: 'contacts', operation: 'delete',
        localId: id, payload: null, retries: 0, createdAt: Date.now(),
      });
    }
    await localDb.contacts.delete(id);
  },
};

// ─── Sales ─────────────────────────────────────────────────────────────────────
export const salesOffline = {
  list: (): Promise<Sale[]> => localDb.sales.toArray(),

  create: async (data: any): Promise<Sale> => {
    if (navigator.onLine) {
      const created = await api.post<Sale>('/api/sales', data);
      await localDb.sales.put(created);
      return created;
    }
    const tempId = genTempId();
    const local = { ...data, id: tempId } as Sale;
    await localDb.sales.put(local);
    await localDb.outbox.add({
      resource: 'sales', operation: 'create',
      localId: tempId, payload: data, retries: 0, createdAt: Date.now(),
    });
    return local;
  },

  delete: async (id: number): Promise<void> => {
    if (navigator.onLine) {
      await api.delete(`/api/sales/${id}`);
    } else {
      await localDb.outbox.add({
        resource: 'sales', operation: 'delete',
        localId: id, payload: null, retries: 0, createdAt: Date.now(),
      });
    }
    await localDb.sales.delete(id);
  },
};

// ─── Users (read-only) ─────────────────────────────────────────────────────────
export const usersOffline = {
  list: (): Promise<User[]> => localDb.users.toArray(),
};
