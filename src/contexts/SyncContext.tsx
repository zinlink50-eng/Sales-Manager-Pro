import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { localDb } from '@/lib/db';
import { syncAll, drainOutbox } from '@/lib/sync';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useAuth } from '@/contexts/AuthContext';

interface SyncState {
  isOnline:     boolean;
  isSyncing:    boolean;
  pendingCount: number;
  lastSyncAt:   Date | null;
  syncError:    string | null;
  triggerSync:  () => void;
}

const SyncContext = createContext<SyncState | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const qc          = useQueryClient();
  const { user }    = useAuth();
  const isOnline    = useOnlineStatus();
  const [isSyncing,    setIsSyncing]    = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt,   setLastSyncAt]   = useState<Date | null>(null);
  const [syncError,    setSyncError]    = useState<string | null>(null);
  const syncingRef  = useRef(false);

  // Keep pending count up-to-date
  const refreshPending = useCallback(async () => {
    const count = await localDb.outbox.count();
    setPendingCount(count);
  }, []);

  // Core sync function
  const doSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    try {
      await syncAll(qc);
      setLastSyncAt(new Date());
    } catch (err) {
      setSyncError((err as Error).message);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshPending();
    }
  }, [qc, refreshPending]);

  // Sync when coming back online (only if authenticated)
  useEffect(() => {
    if (isOnline && user) doSync();
  }, [isOnline, user, doSync]);

  // Sync on login (user becomes non-null)
  useEffect(() => {
    if (user) {
      refreshPending();
      if (navigator.onLine) doSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Periodic background drain when online (every 30 s, authenticated only)
  useEffect(() => {
    if (!isOnline || !user) return;
    const id = setInterval(async () => {
      if (!syncingRef.current) {
        try { await drainOutbox(qc); await refreshPending(); } catch { /* ignore */ }
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [isOnline, qc, refreshPending]);

  const triggerSync = useCallback(() => { doSync(); }, [doSync]);

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingCount, lastSyncAt, syncError, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext(): SyncState {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncContext must be used within SyncProvider');
  return ctx;
}
