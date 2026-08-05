import Dexie, { type Table } from 'dexie';
import type { Product, Contact, Sale, User } from '@/types';

// ── Re-export base types (local tables mirror server schema) ──────
export type LocalProduct = Product;
export type LocalContact = Contact;
export type LocalSale    = Sale;
export type LocalUser    = User;

// ── Outbox — pending operations to push to server ─────────────────
export interface OutboxEntry {
  id?:        number;                              // auto-increment PK
  resource:   'products' | 'contacts' | 'sales';
  operation:  'create' | 'update' | 'delete';
  localId:    number;                              // Dexie primary key of the record
  payload:    unknown;                             // full record data (or null for delete)
  retries:    number;
  error?:     string;
  createdAt:  number;                              // ms timestamp
}

// ── Dexie class ───────────────────────────────────────────────────
class AppDB extends Dexie {
  products!: Table<LocalProduct, number>;
  contacts!: Table<LocalContact, number>;
  sales!:    Table<LocalSale,    number>;
  users!:    Table<LocalUser,    number>;
  outbox!:   Table<OutboxEntry,  number>;

  constructor() {
    super('SalesManagerPro');
    this.version(1).stores({
      // Primary key listed first; other fields are indexes
      products: 'id, sku, category, active',
      contacts: 'id, email, status',
      sales:    'id, contactId, status, date',
      users:    'id',
      // Compound index [resource+localId] for efficient single-entry-per-record lookup
      outbox:   '++id, [resource+localId], resource, createdAt',
    });
  }
}

export const localDb = new AppDB();

// ── Temp ID generator ─────────────────────────────────────────────
// Offline-created records get a unique NEGATIVE id so they never
// collide with server-assigned positive ids.
let _lastMs = 0;
let _msSeq  = 0;
export function genTempId(): number {
  const now = Date.now();
  if (now === _lastMs) { _msSeq++; } else { _lastMs = now; _msSeq = 0; }
  // Result is always negative and unique per millisecond (up to 1 000 per ms)
  return -(now * 1000 + _msSeq);
}
