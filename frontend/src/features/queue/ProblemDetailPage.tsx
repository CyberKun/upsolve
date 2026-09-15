import { ProblemActions } from './ProblemActions';
import { useAuth } from '@/features/auth/useAuth';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ExternalLink, Archive, ArchiveRestore } from 'lucide-react';
import { useQueueItem, useQueueSubmissions, useArchiveItem, useUnarchiveItem } from './hooks';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { NotesEditor } from '@/features/notes/NotesEditor';

export function ProblemDetailPage() {
  const { isDemoMode } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const { data: item, isLoading: isItemLoading, error: itemError } = useQueueItem(id!);
  const { data: submissions, isLoading: isSubmissionsLoading } = useQueueSubmissions(id!);
  
  const { mutate: archiveItem, isPending: isArchiving, error: archiveError } = useArchiveItem(id!);
  const { mutate: unarchiveItem, isPending: isUnarchiving, error: unarchiveError } = useUnarchiveItem(id!);

  if (itemError) return <p role="alert">{itemError.message}</p>;

  if (isItemLoading || !item) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <LoadingSkeleton className="h-8 w-32" />
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  const { problem } = item;
  const cfUrl = problem.contestId 
    ? `https://codeforces.com/contest/${problem.contestId}/problem/${problem.problemIndex}`
    : `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.problemIndex}`;

  const isArchived = !!item.archivedAt;

  const handleArchiveToggle = () => {
    if (isArchived) {
      unarchiveItem();
    } else {
      archiveItem();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/queue" className="inline-flex items-center text-sm text-secondary-text hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to queue
        </Link>
      </div>

      <div className="bg-primary-bg border border-border rounded-lg p-6 mb-8 shadow-sm shadow-theme">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono text-sm text-secondary-text bg-secondary-bg px-2 py-0.5 rounded">
                {problem.contestId}{problem.problemIndex}
              </span>
              <StatusBadge status={item.status} />
              {isArchived && (
                <span className="text-xs font-medium bg-secondary-bg text-secondary-text px-2 py-0.5 rounded-full">
                  Archived
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-primary-text mb-3">{problem.name}</h1>
            
            <div className="flex items-center space-x-4">
              <RatingLabel rating={problem.rating} />
              <div className="text-sm">
                Priority: <span className={`font-medium ${item.priority === 'HIGH' ? 'text-error' : item.priority === 'MEDIUM' ? 'text-warning' : 'text-secondary-text'}`}>{item.priority}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 sm:items-end">
            <a 
              href={cfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-secondary-bg text-primary-text rounded-md hover:bg-surface-hover transition-colors text-sm font-medium"
            >
              Open on Codeforces
              <ExternalLink className="w-4 h-4 ml-2 text-secondary-text" />
            </a>
            <button
              onClick={handleArchiveToggle}
              disabled={isDemoMode || isArchiving || isUnarchiving}
              className="inline-flex items-center px-4 py-2 border border-border text-primary-text rounded-md hover:bg-secondary-bg transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="w-4 h-4 mr-2 text-secondary-text" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2 text-secondary-text" />
                  Archive
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {(archiveError || unarchiveError) && <p role="alert">{(archiveError || unarchiveError)?.message}</p>}
      <ProblemActions key={item.id} item={item} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-primary-text mb-4">Notes & Reflection</h2>
            <NotesEditor key={item.id} queueItemId={item.id} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-primary-text mb-4">Submissions</h2>
          <div className="bg-primary-bg border border-border rounded-lg overflow-hidden">
            {isSubmissionsLoading ? (
              <div className="p-4 space-y-3">
                <LoadingSkeleton className="h-10 w-full" />
                <LoadingSkeleton className="h-10 w-full" />
              </div>
            ) : !submissions || submissions.length === 0 ? (
              <div className="p-6 text-center text-sm text-secondary-text">
                No submissions found for this problem.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {submissions.map((sub) => (
                  <li key={sub.cfSubmissionId} className="p-4 flex flex-col space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${sub.verdict === 'OK' ? 'text-accent' : 'text-error'}`}>
                        {sub.verdict || 'UNKNOWN'}
                      </span>
                      <span className="text-xs text-secondary-text">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-secondary-text">
                      {sub.language} {sub.timeConsumedMs ? `• ${sub.timeConsumedMs}ms` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
