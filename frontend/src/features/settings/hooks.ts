import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { PreferencesResponse, SyncJobResponse } from '@/shared/api/types';

export function usePreferences() {
  return useQuery({ queryKey: ['preferences'], queryFn: () => api.get<PreferencesResponse>('/preferences') });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PreferencesResponse>) => api.patch<PreferencesResponse>('/preferences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
  });
}

export function useSyncHistory() {
  return useQuery({ queryKey: ['sync-jobs'], queryFn: () => api.get<SyncJobResponse[]>('/sync-jobs') });
}
