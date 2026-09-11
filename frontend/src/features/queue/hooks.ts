import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { QueueItemResponse, PageResponse, ProblemResponse, SubmissionResponse } from '@/shared/api/types';

export function useQueue(params: Record<string, unknown>) {
  return useQuery({
    queryKey: ['queue', params],
    queryFn: () => api.get<PageResponse<QueueItemResponse>>('/queue', params),
  });
}

export function useQueueItem(id: string) {
  return useQuery({
    queryKey: ['queue', id],
    queryFn: () => api.get<QueueItemResponse>(`/queue/${id}`),
    enabled: !!id,
  });
}

export function useAddToQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { problemId?: number; problemUrl?: string; priority?: string }) =>
      api.post<QueueItemResponse>('/queue', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  });
}

export function useUpdateQueueItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; priority?: string; version: number }) =>
      api.patch<QueueItemResponse>(`/queue/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  });
}

export function useArchiveItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<QueueItemResponse>(`/queue/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  });
}

export function useUnarchiveItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<QueueItemResponse>(`/queue/${id}/unarchive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue'] }),
  });
}

export function useQueueSubmissions(id: string) {
  return useQuery({
    queryKey: ['queue', id, 'submissions'],
    queryFn: () => api.get<SubmissionResponse[]>(`/queue/${id}/submissions`),
    enabled: !!id,
  });
}

export function useSearchProblems(search: string) {
  return useQuery({
    queryKey: ['problems', search],
    queryFn: () => api.get<PageResponse<ProblemResponse>>('/problems', { search, size: 20 }),
    enabled: search.length >= 2,
  });
}
