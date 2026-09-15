import { Link } from 'react-router';
import { ExternalLink, ListTodo } from 'lucide-react';
import { useTodayQueue } from './hooks';
import { useDueReviews } from '@/features/reviews/hooks';
import { PageHeader } from '@/shared/ui/PageHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { SyncIndicator } from '@/shared/ui/SyncIndicator';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { ExplorePage } from '@/features/explore/ExplorePage';

export function TodayPage() {
  return <ExplorePage dailyPractice={<TodayActivity />} />;
}

function TodayActivity() {
  const { data: queueData, isLoading: queueLoading, error: queueError } = useTodayQueue();
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useDueReviews();

  if (queueLoading || reviewsLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
         <LoadingSkeleton className="h-10 w-48" />
         <LoadingSkeleton className="h-32 w-full" />
         <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (queueError || reviewsError) return <p role="alert" className="text-error">{(queueError || reviewsError)?.message}</p>;

  const overdueCount = reviewsData?.overdue.length || 0;
  const todayCount = reviewsData?.today.length || 0;
  const dueTotal = overdueCount + todayCount;
  const queueTotal = queueData?.totalElements || 0;

  const dueItems = [...(reviewsData?.overdue || []), ...(reviewsData?.today || [])];
  
  const hasContent = dueTotal > 0 || (queueData?.content && queueData.content.length > 0);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader title="Today" headingLevel={2} />
      
      <p className="text-secondary-text mb-8 font-medium">
        {dueTotal} reviews due Â· {queueTotal} problems in queue
      </p>

      {!hasContent ? (
        <EmptyState
          title="All caught up!"
          description="You have no reviews due and your queue is empty."
          icon={<ListTodo />}
        />
      ) : (
        <div className="space-y-8">
          {dueTotal > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-primary-text mb-4">Due Reviews</h2>
              <div className="bg-primary-bg border border-border rounded-lg overflow-hidden shadow-sm shadow-theme">
                <ul className="divide-y divide-border">
                  {dueItems.map(item => (
                    <li key={item.queueItemId} className="p-4 flex items-center justify-between hover:bg-secondary-bg transition-colors">
                      <div>
                         <Link to={`/queue/${item.queueItemId}`} className="font-medium text-primary-text hover:text-accent">
                           <span className="font-mono text-xs text-secondary-text mr-2 bg-secondary-bg px-1.5 py-0.5 rounded">{item.problem.contestId}{item.problem.problemIndex}</span>
                           {item.problem.name}
                         </Link>
                      </div>
                      <Link to={`/queue/${item.queueItemId}`} className="text-sm font-medium text-accent hover:underline">
                        Review now
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {queueData?.content && queueData.content.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-primary-text mb-4">Next Actions</h2>
              <div className="bg-primary-bg border border-border rounded-lg overflow-hidden shadow-sm shadow-theme">
                <ul className="divide-y divide-border">
                  {queueData.content.map(item => {
                     const cfUrl = item.problem.contestId 
                       ? `https://codeforces.com/contest/${item.problem.contestId}/problem/${item.problem.problemIndex}`
                       : `https://codeforces.com/problemset/problem/${item.problem.contestId}/${item.problem.problemIndex}`;
                     return (
                       <li key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary-bg transition-colors">
                         <div>
                           <div className="flex items-center space-x-2 mb-1">
                             <span className="font-mono text-xs text-secondary-text bg-secondary-bg px-1.5 py-0.5 rounded">
                               {item.problem.contestId}{item.problem.problemIndex}
                             </span>
                             <RatingLabel rating={item.problem.rating} />
                             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.priority === 'HIGH' ? 'bg-error-light text-error' : item.priority === 'MEDIUM' ? 'bg-warning-light text-warning' : 'bg-secondary-bg text-primary-text'}`}>
                               {item.priority}
                             </span>
                           </div>
                           <div className="font-medium text-primary-text">{item.problem.name}</div>
                         </div>
                         <div className="flex items-center space-x-3">
                           <a href={cfUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-text hover:text-primary-text p-2 rounded-md hover:bg-secondary-bg transition-colors" title="Open on Codeforces">
                             <ExternalLink className="w-4 h-4" />
                           </a>
                           <Link to={`/queue/${item.id}`} className="px-4 py-2 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-button-hover transition-colors shadow-sm shadow-theme">
                             Start practice
                           </Link>
                         </div>
                       </li>
                     );
                  })}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <SyncIndicator />
      </div>
    </div>
  );
}
