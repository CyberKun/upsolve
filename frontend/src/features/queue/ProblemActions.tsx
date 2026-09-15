import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/shared/api/client';
import type { QueueItemResponse, ReviewScheduleResponse } from '@/shared/api/types';
import { useAuth } from '@/features/auth/useAuth';
import { useUpdateQueueItem } from './hooks';
import { useSetReviewSchedule, useSnoozeReview } from '@/features/reviews/hooks';
import { ReviewSession } from '@/features/reviews/ReviewSession';

export function ProblemActions({ item }: { item: QueueItemResponse }) {
  const { isDemoMode } = useAuth();
  const update = useUpdateQueueItem(item.id);
  const schedule = useSetReviewSchedule(item.id);
  const snooze = useSnoozeReview(item.id);
  const [reviewing, setReviewing] = useState(false);
  const { data: current, error: loadError } = useQuery({
    queryKey: ['reviews', 'schedule', item.id],
    queryFn: async () => {
      try { return await api.get<ReviewScheduleResponse>(`/queue/${item.id}/review-schedule`); }
      catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
    },
  });
  const error = update.error || schedule.error || snooze.error || loadError;
  const busy = isDemoMode || update.isPending || schedule.isPending || snooze.isPending;
  return (
    <section className="bg-primary-bg border border-border rounded-lg p-6 mb-6 space-y-4">
      <h2 className="text-lg font-semibold">Practice and reviews</h2>
      {error && <p role="alert" className="text-error text-sm">{error.message}</p>}
      <div className="flex flex-wrap gap-4">
        <label className="text-sm">Status
          <select aria-label="Status" className="border rounded p-2 ml-2" value={item.status} disabled={busy || item.status === 'SOLVED'}
            onChange={e => update.mutate({ status: e.target.value, version: item.version })}>
            <option value="PENDING">Pending</option><option value="ATTEMPTED">Attempted</option><option value="SOLVED">Solved</option>
          </select>
        </label>
        <label className="text-sm">Priority
          <select aria-label="Priority" className="border rounded p-2 ml-2" value={item.priority} disabled={busy}
            onChange={e => update.mutate({ priority: e.target.value, version: item.version })}>
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>{current ? `${current.paused ? 'Paused' : 'Next review'}: ${current.nextReviewDate}` : 'Reviews are not enabled'}</span>
        <button className="border rounded px-3 py-2 disabled:opacity-50" disabled={busy || !!item.archivedAt}
          onClick={() => schedule.mutate({ enabled: !current || current.paused })}>
          {!current ? 'Enable reviews' : current.paused ? 'Resume reviews' : 'Pause reviews'}
        </button>
        {current && !current.paused && !item.archivedAt && <>
          <button className="border rounded px-3 py-2 disabled:opacity-50" disabled={busy} onClick={() => snooze.mutate({ days: 1 })}>Snooze 1 day</button>
          <button className="bg-accent text-on-accent rounded px-3 py-2 disabled:opacity-50" disabled={busy} onClick={() => setReviewing(true)}>Start review</button>
        </>}
      </div>
      {reviewing && <div><button className="text-sm underline mb-3" onClick={() => setReviewing(false)}>Close review</button><ReviewSession queueItemId={item.id} onClose={() => setReviewing(false)} /></div>}
    </section>
  );
}
