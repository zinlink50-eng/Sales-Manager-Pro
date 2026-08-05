import { WifiOff, RefreshCw, CloudUpload, CheckCircle2 } from 'lucide-react';
import { useSyncContext } from '@/contexts/SyncContext';
import { cn } from '@/lib/utils';

export default function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount, syncError, triggerSync } = useSyncContext();

  // Nothing to show if fully online with no pending items and no error
  if (isOnline && pendingCount === 0 && !syncError && !isSyncing) return null;

  const isOfflineWithPending = !isOnline && pendingCount > 0;
  const isOfflineClean       = !isOnline && pendingCount === 0;
  const hasSyncError         = isOnline && !!syncError;
  const hasPending           = isOnline && pendingCount > 0;

  return (
    <div
      className={cn(
        'fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all duration-300',
        !isOnline              && 'bg-gray-700',
        hasSyncError           && 'bg-red-600',
        isSyncing              && 'bg-blue-600',
        hasPending && !isSyncing && 'bg-amber-600',
      )}
    >
      {/* Offline */}
      {isOfflineClean && (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>ကွန်ယက်ချိတ်ဆက်မှု မရှိပါ — ဒေသတွင်း မိုဒ်တွင် အလုပ်လုပ်နေသည်</span>
        </>
      )}

      {/* Offline with pending */}
      {isOfflineWithPending && (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>ဆာဗာနှင့် sync မရှိ — ဒေသတွင်း {pendingCount} ခု ကျန်ရှိ</span>
        </>
      )}

      {/* Syncing */}
      {isSyncing && (
        <>
          <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
          <span>ဆာဗာနှင့် sync လုပ်နေသည်...</span>
        </>
      )}

      {/* Pending upload */}
      {hasPending && !isSyncing && (
        <>
          <CloudUpload className="h-3.5 w-3.5 shrink-0" />
          <span>{pendingCount} ခု sync ဆိုင်း — </span>
          <button
            onClick={triggerSync}
            className="underline underline-offset-2 hover:no-underline"
          >
            ယခု sync လုပ်မည်
          </button>
        </>
      )}

      {/* Sync error */}
      {hasSyncError && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Sync မအောင်မြင် — </span>
          <button
            onClick={triggerSync}
            className="underline underline-offset-2 hover:no-underline"
          >
            ပြန်ကြိုးစားမည်
          </button>
        </>
      )}
    </div>
  );
}
