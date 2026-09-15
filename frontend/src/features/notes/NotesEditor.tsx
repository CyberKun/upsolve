import { useAuth } from '@/features/auth/useAuth';
import { useState, useEffect } from 'react';
import { useNote, useSaveNote } from './hooks';
import { Check, Loader2 } from 'lucide-react';
import { ApiError } from '@/shared/api/client';

const MISTAKE_CATEGORIES = [
  { id: 'MISSED_OBSERVATION', label: 'Missed observation' },
  { id: 'MISSING_PREREQUISITE', label: 'Missing prerequisite' },
  { id: 'INCORRECT_PROOF', label: 'Incorrect proof' },
  { id: 'IMPLEMENTATION_BUG', label: 'Implementation bug' },
  { id: 'COMPLEXITY_ISSUE', label: 'Complexity issue' },
  { id: 'OVERFLOW', label: 'Overflow' },
  { id: 'EDGE_CASE', label: 'Edge case' },
  { id: 'OTHER', label: 'Other' },
] as const;

export function NotesEditor({ queueItemId }: { queueItemId: string }) {
  const { isDemoMode } = useAuth();
  const { data: note, isLoading, error: loadError } = useNote(queueItemId);
  const { mutate: saveNote, isPending: isSaving, error: saveError } = useSaveNote(queueItemId);

  const [stuckReason, setStuckReason] = useState('');
  const [keyObservation, setKeyObservation] = useState('');
  const [approachComplexity, setApproachComplexity] = useState('');
  const [whatToRemember, setWhatToRemember] = useState('');
  const [mistakeCategories, setMistakeCategories] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Update local state when note data loads
  useEffect(() => {
    if (note) {
      setStuckReason(note.stuckReason || '');
      setKeyObservation(note.keyObservation || '');
      setApproachComplexity(note.approachComplexity || '');
      setWhatToRemember(note.whatToRemember || '');
      setMistakeCategories(note.mistakeCategories || []);
    }
  }, [note]);

  // Track dirtiness
  const isDirty = note ? (
    stuckReason !== (note.stuckReason || '') ||
    keyObservation !== (note.keyObservation || '') ||
    approachComplexity !== (note.approachComplexity || '') ||
    whatToRemember !== (note.whatToRemember || '') ||
    JSON.stringify([...mistakeCategories].sort()) !== JSON.stringify([...(note.mistakeCategories || [])].sort())
  ) : (
    stuckReason !== '' ||
    keyObservation !== '' ||
    approachComplexity !== '' ||
    whatToRemember !== '' ||
    mistakeCategories.length > 0
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle errors
  useEffect(() => {
    if (saveError) {
      setSaveStatus('error');
      if (saveError instanceof ApiError && saveError.status === 409) {
        setErrorMessage('Notes modified elsewhere. Refresh to see latest.');
      } else {
        setErrorMessage(saveError instanceof Error ? saveError.message : 'An error occurred while saving.');
      }
    }
  }, [saveError]);

  const handleSave = () => {
    setSaveStatus('saving');
    setErrorMessage('');
    
    saveNote(
      {
        stuckReason,
        keyObservation,
        approachComplexity,
        whatToRemember,
        mistakeCategories,
        version: note?.version || 0,
      },
      {
        onSuccess: () => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        },
      }
    );
  };

  if (loadError) return <p role="alert">{loadError.message}</p>;

  if (isLoading) {
    return <div className="p-6">Loading notes...</div>;
  }

  const toggleCategory = (id: string) => {
    setMistakeCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-primary-bg border border-border rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Where I got stuck</label>
          <textarea disabled={isDemoMode || isSaving} maxLength={10000}
            className="w-full min-h-24 border border-border rounded-md p-3 text-sm resize-y focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="What was the key difficulty?"
            value={stuckReason}
            onChange={(e) => setStuckReason(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Key observation</label>
          <textarea disabled={isDemoMode || isSaving} maxLength={10000}
            className="w-full min-h-24 border border-border rounded-md p-3 text-sm resize-y focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="What insight unlocked the solution?"
            value={keyObservation}
            onChange={(e) => setKeyObservation(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Approach and complexity</label>
          <textarea disabled={isDemoMode || isSaving} maxLength={10000}
            className="w-full min-h-24 border border-border rounded-md p-3 text-sm resize-y focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Describe the approach and time/space complexity"
            value={approachComplexity}
            onChange={(e) => setApproachComplexity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What to remember</label>
          <textarea disabled={isDemoMode || isSaving} maxLength={10000}
            className="w-full min-h-24 border border-border rounded-md p-3 text-sm resize-y focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Key takeaways for future problems"
            value={whatToRemember}
            onChange={(e) => setWhatToRemember(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Mistake categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {MISTAKE_CATEGORIES.map((cat) => (
              <label key={cat.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox" disabled={isDemoMode || isSaving}
                  className="rounded border-border text-accent focus:ring-accent"
                  checked={mistakeCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm">
            {isDirty && saveStatus === 'idle' && (
              <span className="text-warning">Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-error">{errorMessage}</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isDemoMode || !isDirty || isSaving || saveStatus === 'saving'}
            className="flex items-center justify-center min-w-[120px] px-4 py-2 bg-accent text-on-accent rounded-md text-sm hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveStatus === 'saving' || isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              'Save notes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
