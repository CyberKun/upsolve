import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/shared/api/client';
import type { ProblemNoteResponse } from '@/shared/api/types';

export function useNote(queueItemId: string) {
  return useQuery({
    queryKey: ['notes', queueItemId],
    queryFn: async () => {
      try { return await api.get<ProblemNoteResponse>(`/queue/${queueItemId}/notes`); }
      catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
    },
    enabled: !!queueItemId,
  });
}

export function useSaveNote(queueItemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      stuckReason?: string;
      keyObservation?: string;
      approachComplexity?: string;
      whatToRemember?: string;
      mistakeCategories: string[];
      version: number;
    }) => api.put<ProblemNoteResponse>(`/queue/${queueItemId}/notes`, data),
    onSuccess: (note) => {
      qc.setQueryData(['notes', queueItemId], note);
      qc.invalidateQueries({ queryKey: ['queue'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
