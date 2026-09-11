import { useState } from 'react';
import { Link } from 'react-router';
import { RotateCcw, ExternalLink, AlertCircle } from 'lucide-react';
import { useDueReviews } from './hooks';
import { ReviewSession } from './ReviewSession';
import { PageHeader } from '@/shared/ui/PageHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';

export function ReviewsPage() {
  const { data, isLoading, error } = useDueReviews();
  const [activeReview, setActiveReview] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Reviews" />
        <LoadingSkeleton className="h-32 w-full mb-4" count={3} />
      </div>
    );
  }

  if (error) return <p role="alert" className="text-red-600">{(error)?.message}</p>;

  const overdue = data?.overdue ?? [];
  const today = data?.today ?? [];
  const upcoming = data?.upcoming ?? [];
  const hasAny = overdue.length > 0 || today.length > 0 || upcoming.length > 0;

  if (activeReview) {
    return (
      <div>
        <PageHeader title="Review Session" />
        <ReviewSession
          queueItemId={activeReview}
          onClose={() => setActiveReview(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reviews" />

      {!hasAny && (
        <EmptyState
          icon={<RotateCcw size={40} />}
          title="No reviews scheduled"
          description="Solve problems and enable spaced repetition to see reviews here."
        />
      )}

      {overdue.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#DC2626] mb-3">
            <AlertCircle size={16} />
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E5E2DB]">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-[#6B7280]">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-[#242824]">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                  <span className="text-xs text-[#DC2626] font-medium bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                    Overdue
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveReview(item.queueItemId)}
                    className="px-3 py-1.5 bg-[#35634E] text-white text-sm rounded-md hover:bg-[#2D5442] transition-colors"
                  >
                    Start review
                  </button>
                  <Link
                    to={`/queue/${item.queueItemId}`}
                    className="px-3 py-1.5 border border-[#E5E2DB] text-sm rounded-md hover:bg-[#F0EFEB] transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {today.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#35634E] mb-3">
            Today ({today.length})
          </h2>
          <div className="space-y-2">
            {today.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E5E2DB]">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-[#6B7280]">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-[#242824]">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                </div>
                <button
                  onClick={() => setActiveReview(item.queueItemId)}
                  className="px-3 py-1.5 bg-[#35634E] text-white text-sm rounded-md hover:bg-[#2D5442] transition-colors"
                >
                  Start review
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[#6B7280] mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E5E2DB] opacity-80">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-[#6B7280]">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-[#242824]">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                  <span className="text-xs text-[#6B7280]">
                    Due {item.nextReviewDate}
                  </span>
                </div>
                <Link
                  to={`/queue/${item.queueItemId}`}
                  className="text-sm text-[#35634E] hover:underline flex items-center gap-1"
                >
                  View <ExternalLink size={12} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}