import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { QueueItemResponse, PageResponse, SyncJobResponse } from '@/shared/api/types';

export function useTodayQueue() {
  return useQuery({
    queryKey: ['queue', 'today'],
    queryFn: () => api.get<PageResponse<QueueItemResponse>>('/queue', { size: 5, archived: false, status: 'ACTIVE', sort: 'priorityRank,asc' }),
  });
}

export function useLatestSync() {
  return useQuery({
    queryKey: ['sync-jobs', 'latest'],
    queryFn: () => api.get<SyncJobResponse[]>('/sync-jobs'),
  });
}
