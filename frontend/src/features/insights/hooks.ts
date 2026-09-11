import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';

export interface TopicStat { tag: string; attempted: number; solved: number; solveRate: number | null; insufficientData: boolean; }
export interface TopicAnalytics { topics: TopicStat[]; }
export interface DifficultyBand { label: string; minRating: number | null; maxRating: number | null; attempted: number; solved: number; solveRate: number | null; insufficientData: boolean; }
export interface DifficultyAnalytics { bands: DifficultyBand[]; }
export interface WeeklyActivity { weekStart: string; contestant: number; virtual: number; practice: number; total: number; }
export interface ActivityAnalytics { activity: WeeklyActivity[]; }
export interface MistakeCount { category: string; count: number; }
export interface MistakeAnalytics { mistakes: MistakeCount[]; totalNotes: number; }

export function useTopicAnalytics(params?: { minRating?: number; maxRating?: number }) {
  return useQuery({ queryKey: ['analytics', 'topics', params], queryFn: () => api.get<TopicAnalytics>('/analytics/topics', params) });
}
export function useDifficultyAnalytics() {
  return useQuery({ queryKey: ['analytics', 'difficulty'], queryFn: () => api.get<DifficultyAnalytics>('/analytics/difficulty') });
}
export function useActivityAnalytics(weeks = 12) {
  return useQuery({ queryKey: ['analytics', 'activity', weeks], queryFn: () => api.get<ActivityAnalytics>('/analytics/activity', { weeks }) });
}
export function useMistakeAnalytics() {
  return useQuery({ queryKey: ['analytics', 'mistakes'], queryFn: () => api.get<MistakeAnalytics>('/analytics/mistakes') });
}
