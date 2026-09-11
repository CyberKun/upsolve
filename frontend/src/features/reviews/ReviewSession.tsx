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
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-[#E5E2DB] p-6">
      {recordReview.error && <p role="alert" className="text-red-600 mb-4">{recordReview.error.message}</p>}
      {/* Problem Info */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#E5E2DB]">
        <div>
          <div className="font-mono text-xs text-[#6B7280] mb-1">
            {problem.contestId}{problem.problemIndex}
          </div>
          <h2 className="text-lg font-semibold text-[#242824]">{problem.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <RatingLabel rating={problem.rating} />
          <a
            href={cfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#35634E] hover:underline flex items-center gap-1"
          >
            Open on Codeforces <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {step === 'attempt' && (
        <div className="space-y-6">
          <div className="bg-[#EBF5F0] p-4 rounded-md">
            <p className="text-sm text-[#35634E]">
              Try solving this problem first before revealing your notes.
            </p>
          </div>

          {!notesRevealed ? (
            <button
              onClick={() => setNotesRevealed(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#D97706] text-[#D97706] rounded-md hover:bg-[#FEF3C7] transition-colors"
            >
              <Eye size={16} />
              Reveal my notes
            </button>
          ) : (
            <div className="bg-[#F6F5F1] p-4 rounded-md space-y-3">
              <h3 className="text-sm font-semibold text-[#242824]">Your Notes</h3>
              {note?.stuckReason && (
                <div>
                  <div className="text-xs font-medium text-[#6B7280] mb-1">Where I got stuck</div>
                  <div className="text-sm text-[#242824] whitespace-pre-wrap">{note.stuckReason}</div>
                </div>
              )}
              {note?.keyObservation && (
                <div>
                  <div className="text-xs font-medium text-[#6B7280] mb-1">Key observation</div>
                  <div className="text-sm text-[#242824] whitespace-pre-wrap">{note.keyObservation}</div>
                </div>
              )}
              {note?.approachComplexity && (
                <div>
                  <div className="text-xs font-medium text-[#6B7280] mb-1">Approach and complexity</div>
                  <div className="text-sm text-[#242824] whitespace-pre-wrap">{note.approachComplexity}</div>
                </div>
              )}
              {note?.whatToRemember && (
                <div>
                  <div className="text-xs font-medium text-[#6B7280] mb-1">What to remember</div>
                  <div className="text-sm text-[#242824] whitespace-pre-wrap">{note.whatToRemember}</div>
                </div>
              )}
              {(!note?.stuckReason && !note?.keyObservation && !note?.approachComplexity && !note?.whatToRemember) && (
                <p className="text-sm text-[#6B7280] italic">No notes recorded for this problem.</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#E5E2DB]">
            <p className="text-sm text-[#6B7280] mb-4">How did your attempt go?</p>
            <button
              onClick={() => setStep('outcome')}
              className="px-4 py-2 bg-[#35634E] text-white text-sm rounded-md hover:bg-[#2D5442] transition-colors"
            >
              Record outcome
            </button>
          </div>
        </div>
      )}

      {step === 'outcome' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-[#242824] mb-4">What was the outcome?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleOutcome('SOLVED_INDEPENDENTLY')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-[#35634E] text-[#35634E] hover:bg-[#EBF5F0] transition-colors disabled:opacity-50"
              >
                <Check size={24} />
                <span className="text-sm font-medium">Solved independently</span>
              </button>
              <button
                onClick={() => handleOutcome('NEEDED_HINT')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-[#D97706] text-[#D97706] hover:bg-[#FEF3C7] transition-colors disabled:opacity-50"
              >
                <HelpCircle size={24} />
                <span className="text-sm font-medium">Needed a hint</span>
              </button>
              <button
                onClick={() => handleOutcome('COULD_NOT_SOLVE')}
                disabled={isDemoMode || submitting}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
              >
                <X size={24} />
                <span className="text-sm font-medium">Could not solve</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#242824] mb-1.5">
              Reflection (optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn from this review?"
              className="w-full px-3 py-2 min-h-20 border border-[#E5E2DB] rounded-md text-sm resize-y focus:outline-none focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E]"
            />
          </div>
        </div>
      )}

      {step === 'submitted' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EBF5F0] rounded-full mb-4">
            <Check size={24} className="text-[#35634E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#242824] mb-2">Review recorded</h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Your next review has been scheduled.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#35634E] text-white text-sm rounded-md hover:bg-[#2D5442] transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}