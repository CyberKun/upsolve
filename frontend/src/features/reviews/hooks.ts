import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { ReviewScheduleResponse } from '@/shared/api/types';

interface ReviewItemResponse {
  queueItemId: string;
  problem: {
    id: number;
    contestId: number | null;
    problemIndex: string;
    name: string;
    rating: number | null;
    tags: string[];
  };
  status: string;
  nextReviewDate: string;
  intervalIndex: number;
  totalReviews: number;
}

interface ReviewDueResponse {
  overdue: ReviewItemResponse[];
  today: ReviewItemResponse[];
  upcoming: ReviewItemResponse[];
}

export function useDueReviews() {
  return useQuery({
    queryKey: ['reviews', 'due'],
    queryFn: () => api.get<ReviewDueResponse>('/reviews/due'),
  });
}

export function useRecordReview(queueItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      outcome: string;
      notesRevealed: boolean;
      reflection?: string;
      idempotencyKey: string;
    }) => api.post<ReviewScheduleResponse>(`/queue/${queueItemId}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useSetReviewSchedule(queueItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { enabled: boolean }) =>
      api.put<ReviewScheduleResponse>(`/queue/${queueItemId}/review-schedule`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useSnoozeReview(queueItemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { days: number }) =>
      api.post<ReviewScheduleResponse>(`/queue/${queueItemId}/review-schedule/snooze`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}