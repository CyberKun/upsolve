import { useAuth } from '@/features/auth/useAuth';
import { useState } from 'react';
import { ExternalLink, Eye, Check, HelpCircle, X } from 'lucide-react';
import { useRecordReview } from './hooks';
import { useQueueItem } from '@/features/queue/hooks';
import { useNote } from '@/features/notes/hooks';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';

interface ReviewSessionProps {
  queueItemId: string;
  onClose: () => void;
}

type SessionStep = 'attempt' | 'outcome' | 'submitted';

export function ReviewSession({ queueItemId, onClose }: ReviewSessionProps) {
  const { isDemoMode } = useAuth();
  const { data: item, isLoading, error: itemError } = useQueueItem(queueItemId);
  const { data: note } = useNote(queueItemId);
  const recordReview = useRecordReview(queueItemId);

  const [step, setStep] = useState<SessionStep>('attempt');
  const [notesRevealed, setNotesRevealed] = useState(false);
  const [reflection, setReflection] = useState('');
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);

  if (itemError) return <p role="alert">{itemError.message}</p>;

  if (isLoading || !item) {
    return <LoadingSkeleton className="h-64 w-full" />;
  }

  const problem = item.problem;
  const cfUrl = problem.contestId
    ? `https://codeforces.com/contest/${problem.contestId}/problem/${problem.problemIndex}`
    : '#';

  const handleOutcome = async (outcome: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await recordReview.mutateAsync({
        outcome,
        notesRevealed,
        reflection: reflection || undefined,
        idempotencyKey,
      });
      setStep('submitted');
    } catch {
      // Error handled by TanStack Query
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-primary-bg rounded-lg border border-border p-6">
      {recordReview.error && <p role="alert" className="text-error mb-4">{recordReview.error.message}</p>}
      {/* Problem Info */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
        <div>
          <div className="font-mono text-xs text-secondary-text mb-1">
            {problem.contestId}{problem.problemIndex}
          </div>
          <h2 className="text-lg font-semibold text-primary-text">{problem.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <RatingLabel rating={problem.rating} />
          <a
            href={cfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            Open on Codeforces <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {step === 'attempt' && (
        <div className="space-y-6">
          <div className="bg-accent-light p-4 rounded-md">
            <p className="text-sm text-accent">
              Try solving this problem first before revealing your notes.
            </p>
          </div>

          {!notesRevealed ? (
            <button
              onClick={() => setNotesRevealed(true)}
              className="flex items-center gap-2 px-4 py-2 border border-warning text-warning rounded-md hover:bg-warning-light transition-colors"
            >
              <Eye size={16} />
              Reveal my notes
            </button>
          ) : (
            <div className="bg-secondary-bg p-4 rounded-md space-y-3">
              <h3 className="text-sm font-semibold text-primary-text">Your Notes</h3>
              {note?.stuckReason && (
                <div>
                  <div className="text-xs font-medium text-secondary-text mb-1">Where I got stuck</div>
                  <div className="text-sm text-primary-text whitespace-pre-wrap">{note.stuckReason}</div>
                </div>
              )}
              {note?.keyObservation && (
                <div>
                  <div className="text-xs font-medium text-secondary-text mb-1">Key observation</div>
                  <div className="text-sm text-primary-text whitespace-pre-wrap">{note.keyObservation}</div>
                </div>
              )}
              {note?.approachComplexity && (
                <div>
                  <div className="text-xs font-medium text-secondary-text mb-1">Approach and complexity</div>
                  <div className="text-sm text-primary-text whitespace-pre-wrap">{note.approachComplexity}</div>
                </div>
              )}
              {note?.whatToRemember && (
                <div>
                  <div className="text-xs font-medium text-secondary-text mb-1">What to remember</div>
                  <div className="text-sm text-primary-text whitespace-pre-wrap">{note.whatToRemember}</div>
                </div>
              )}
              {(!note?.stuckReason && !note?.keyObservation && !note?.approachComplexity && !note?.whatToRemember) && (
                <p className="text-sm text-secondary-text italic">No notes recorded for this problem.</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-secondary-text mb-4">How did your attempt go?</p>
            <button
              onClick={() => setStep('outcome')}
              className="px-4 py-2 bg-accent text-on-accent text-sm rounded-md hover:bg-button-hover transition-colors"
            >
              Record outcome
            </button>
          </div>
        </div>
      )}

      {step === 'outcome' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-primary-text mb-4">What was the outcome?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleOutcome('SOLVED_INDEPENDENTLY')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-accent text-accent hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                <Check size={24} />
                <span className="text-sm font-medium">Solved independently</span>
              </button>
              <button
                onClick={() => handleOutcome('NEEDED_HINT')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-warning text-warning hover:bg-warning-light transition-colors disabled:opacity-50"
              >
                <HelpCircle size={24} />
                <span className="text-sm font-medium">Needed a hint</span>
              </button>
              <button
                onClick={() => handleOutcome('COULD_NOT_SOLVE')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-error text-error hover:bg-error-light transition-colors disabled:opacity-50"
              >
                <X size={24} />
                <span className="text-sm font-medium">Could not solve</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5">
              Reflection (optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn from this review?"
              className="w-full px-3 py-2 min-h-20 border border-border rounded-md text-sm resize-y focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {step === 'submitted' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-light rounded-full mb-4">
            <Check size={24} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">Review recorded</h3>
          <p className="text-sm text-secondary-text mb-6">
            Your next review has been scheduled.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-on-accent text-sm rounded-md hover:bg-button-hover transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}