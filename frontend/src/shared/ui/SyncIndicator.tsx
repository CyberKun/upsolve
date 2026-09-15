import { useEffect } from 'react';
import { usePreferences } from '@/features/settings/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { api } from '@/shared/api/client';
import type { SyncJobResponse } from '@/shared/api/types';

export function SyncIndicator() {
  const { user, isDemoMode } = useAuth();
  const queryClient = useQueryClient();
  const { data: prefs } = usePreferences();
  const trackedHandle = prefs?.trackedHandle || 'No handle';

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['sync-jobs'],
    queryFn: () => api.get<SyncJobResponse[]>('/sync-jobs'),
    enabled: !!user?.setupComplete,
    refetchInterval: 10000,
  });

  const triggerSync = useMutation({
    mutationFn: () => api.post<SyncJobResponse>('/sync-jobs'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to start sync');
    }
  });

  const latestJob = jobs?.[0];
  useEffect(() => {
    if (latestJob?.state === 'COMPLETED') {
      for (const key of ['queue', 'analytics', 'reviews', 'problems']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    }
  }, [latestJob?.id, latestJob?.state, queryClient]);
  const isSyncing = triggerSync.isPending || latestJob?.state === 'RUNNING' || latestJob?.state === 'QUEUED';

  const lastSyncTime = latestJob?.completedAt
    ? new Date(latestJob.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never synced';

  return (
    <div className="px-3 py-3 border-t border-border bg-primary-bg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-xs text-primary-text truncate max-w-[120px]" title={trackedHandle}>
            {trackedHandle}
          </span>
          <span className="text-[10px] text-secondary-text">
            {isSyncing ? 'Syncing...' : `Last sync: ${lastSyncTime}`}
          </span>
        </div>
        <button
          onClick={() => triggerSync.mutate()}
          disabled={isSyncing || isLoading || !user?.setupComplete || isDemoMode}
          className={`p-1.5 rounded-md transition-colors ${
            isSyncing
              ? 'text-accent bg-accent-light'
              : 'text-secondary-text hover:bg-surface-hover hover:text-primary-text'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isDemoMode ? "Sync disabled in demo mode" : "Sync submissions"}
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
