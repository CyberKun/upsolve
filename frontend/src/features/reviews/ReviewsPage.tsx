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

  if (error) return <p role="alert" className="text-error">{(error)?.message}</p>;

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
          <h2 className="flex items-center gap-2 text-sm font-semibold text-error mb-3">
            <AlertCircle size={16} />
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-primary-bg p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-secondary-text">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-primary-text">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                  <span className="text-xs text-error font-medium bg-error-light px-2 py-0.5 rounded-full">
                    Overdue
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveReview(item.queueItemId)}
                    className="px-3 py-1.5 bg-accent text-on-accent text-sm rounded-md hover:bg-button-hover transition-colors"
                  >
                    Start review
                  </button>
                  <Link
                    to={`/queue/${item.queueItemId}`}
                    className="px-3 py-1.5 border border-border text-sm rounded-md hover:bg-surface-hover transition-colors"
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
          <h2 className="text-sm font-semibold text-accent mb-3">
            Today ({today.length})
          </h2>
          <div className="space-y-2">
            {today.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-primary-bg p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-secondary-text">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-primary-text">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                </div>
                <button
                  onClick={() => setActiveReview(item.queueItemId)}
                  className="px-3 py-1.5 bg-accent text-on-accent text-sm rounded-md hover:bg-button-hover transition-colors"
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
          <h2 className="text-sm font-semibold text-secondary-text mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <div key={item.queueItemId} className="flex items-center justify-between bg-primary-bg p-4 rounded-lg border border-border opacity-80">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-xs text-secondary-text">
                      {item.problem.contestId}{item.problem.problemIndex}
                    </div>
                    <div className="font-medium text-primary-text">{item.problem.name}</div>
                  </div>
                  <RatingLabel rating={item.problem.rating} />
                  <span className="text-xs text-secondary-text">
                    Due {item.nextReviewDate}
                  </span>
                </div>
                <Link
                  to={`/queue/${item.queueItemId}`}
                  className="text-sm text-accent hover:underline flex items-center gap-1"
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