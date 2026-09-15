import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2, Lock, Download, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { usePreferences, useUpdatePreferences, useSyncHistory } from './hooks';

const TOPICS = [
  'math', 'dp', 'greedy', 'graphs', 'binary search', 'data structures',
  'constructive algorithms', 'brute force', 'strings', 'number theory',
  'geometry', 'combinatorics', 'two pointers', 'bitmasks', 'trees'
];

const TIME_ZONES = [
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
  'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'
];

const settingsSchema = z.object({
  targetRatingMin: z.number().min(800).max(3500),
  targetRatingMax: z.number().min(800).max(3500),
  preferredTopics: z.array(z.string()),
  timeZone: z.string(),
  reviewIntervals: z.string().regex(/^(\d+)(,\s*\d+)*$/, "Must be comma-separated numbers").refine(value => {
    const days = value.split(",").map(Number);
    return days.length <= 20 && days.every((day, i) => day > 0 && day <= 3650 && (i === 0 || day > days[i-1]!));
  }, "Use increasing positive intervals up to 3650 days"),
}).refine(data => data.targetRatingMin <= data.targetRatingMax, { message: "Minimum must not exceed maximum", path: ["targetRatingMax"] });

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { isDemoMode, logout } = useAuth();
  const { data: prefs, isLoading: prefsLoading, error: prefsError } = usePreferences();
  const { data: syncHistory, isLoading: syncLoading, error: syncError } = useSyncHistory();
  const { mutate: updatePrefs, isPending: isUpdating } = useUpdatePreferences();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const selectedTopics = watch('preferredTopics') || [];

  useEffect(() => {
    if (prefs) {
      reset({
        targetRatingMin: prefs.targetRatingMin,
        targetRatingMax: prefs.targetRatingMax,
        preferredTopics: prefs.preferredTopics,
        timeZone: prefs.timeZone,
        reviewIntervals: prefs.reviewIntervals.join(', '),
      });
    }
  }, [prefs, reset]);

  if (prefsLoading || syncLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <LoadingSkeleton className="h-10 w-48" />
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  if (prefsError || syncError) return <p role="alert" className="text-error">{(prefsError || syncError)?.message}</p>;

  const onSubmit = (data: SettingsFormData) => {
    setSaveStatus('saving');
    setErrorMsg('');

    const intervals = data.reviewIntervals.split(',').map(s => parseInt(s.trim(), 10));

    updatePrefs(
      {
        targetRatingMin: data.targetRatingMin,
        targetRatingMax: data.targetRatingMax,
        preferredTopics: data.preferredTopics,
        timeZone: data.timeZone,
        reviewIntervals: intervals,
      },
      {
        onSuccess: () => {
          setSaveStatus('saved');
          reset(data); // reset form to new state so isDirty is false
          setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: (err: any) => {
          setSaveStatus('error');
          setErrorMsg(err?.message || 'Failed to update preferences');
        }
      }
    );
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setValue('preferredTopics', selectedTopics.filter(t => t !== topic), { shouldDirty: true });
    } else {
      setValue('preferredTopics', [...selectedTopics, topic], { shouldDirty: true });
    }
  };

  const handleExport = () => {
    window.location.href = '/api/v1/export';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // Ignore errors on logout
    }
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
      <PageHeader title="Settings" />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-primary-bg border border-border rounded-lg shadow-sm shadow-theme">
        
        {/* Tracked Handle (Read-only) */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-primary-text mb-4">Tracked Handle</h3>
          <div className="flex items-center space-x-3 text-secondary-text">
            <Lock className="w-5 h-5 text-secondary-text" />
            <span className="font-medium text-primary-text bg-secondary-bg px-3 py-1.5 rounded-md">
              {prefs?.trackedHandle || 'No handle linked'}
            </span>
            <span className="text-sm">Cannot be changed after setup.</span>
          </div>
        </div>

        {/* Target Range */}
        <div className="p-6 border-t border-border">
          <h3 className="text-lg font-medium text-primary-text mb-1">Target Rating Range</h3>
          <p className="text-sm text-secondary-text mb-4">The rating band of problems you want to practice.</p>
          <div className="flex items-center space-x-4 max-w-xs">
            <div>
              <label className="block text-xs text-secondary-text mb-1">Min</label>
              <input type="number" {...register('targetRatingMin', { valueAsNumber: true })} className="w-full border border-border rounded-md px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent" />
              {errors.targetRatingMin && <p className="text-xs text-error mt-1">{errors.targetRatingMin.message}</p>}
            </div>
            <span className="text-secondary-text mt-4">-</span>
            <div>
              <label className="block text-xs text-secondary-text mb-1">Max</label>
              <input type="number" {...register('targetRatingMax', { valueAsNumber: true })} className="w-full border border-border rounded-md px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent" />
              {errors.targetRatingMax && <p className="text-xs text-error mt-1">{errors.targetRatingMax.message}</p>}
            </div>
          </div>
        </div>

        {/* Preferred Topics */}
        <div className="p-6 border-t border-border">
          <h3 className="text-lg font-medium text-primary-text mb-1">Preferred Topics</h3>
          <p className="text-sm text-secondary-text mb-4">Select the topics you want to focus on.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {TOPICS.map(topic => (
              <label key={topic} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-secondary-bg p-2 rounded-md transition-colors border border-clear hover:border-border">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => toggleTopic(topic)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="capitalize">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Zone */}
        <div className="p-6 border-t border-border">
          <h3 className="text-lg font-medium text-primary-text mb-1">Time Zone</h3>
          <p className="text-sm text-secondary-text mb-4">Used for calculating daily review schedules.</p>
          <select {...register('timeZone')} className="max-w-xs w-full border border-border rounded-md px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent">
            {[...new Set([...TIME_ZONES, ...(prefs?.timeZone ? [prefs.timeZone] : [])])].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Review Intervals */}
        <div className="p-6 border-t border-border">
          <h3 className="text-lg font-medium text-primary-text mb-1">Spaced Repetition Intervals</h3>
          <p className="text-sm text-secondary-text mb-4">Number of days between reviews (comma-separated).</p>
          <input type="text" {...register('reviewIntervals')} placeholder="1, 3, 7, 14, 30" className="max-w-md w-full border border-border rounded-md px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent" />
          {errors.reviewIntervals && <p className="text-xs text-error mt-1">{errors.reviewIntervals.message}</p>}
        </div>

        {/* Submit action */}
        <div className="p-6 border-t border-border bg-secondary-bg flex items-center justify-between rounded-b-lg">
          <div className="text-sm">
            {isDirty && saveStatus === 'idle' && <span className="text-warning">You have unsaved changes</span>}
            {saveStatus === 'error' && <span className="text-error">{errorMsg}</span>}
          </div>
          <button
            type="submit"
            disabled={isDemoMode || !isDirty || isUpdating || saveStatus === 'saving'}
            className="flex items-center justify-center min-w-[120px] px-4 py-2 bg-accent text-on-accent rounded-md text-sm font-medium hover:bg-button-hover disabled:opacity-50 transition-colors shadow-sm shadow-theme"
          >
            {saveStatus === 'saving' || isUpdating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : saveStatus === 'saved' ? (
              <><Check className="w-4 h-4 mr-2" />Saved</>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </form>

      {/* Sync History */}
      <div className="mt-8 bg-primary-bg border border-border rounded-lg shadow-sm shadow-theme">
        <div className="p-6">
          <h3 className="text-lg font-medium text-primary-text mb-1">Sync History</h3>
          <p className="text-sm text-secondary-text mb-4">Recent Codeforces synchronization jobs.</p>
          
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary-bg text-secondary-text border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-medium">Started</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Submissions</th>
                  <th className="px-4 py-2 font-medium">Added to Queue</th>
                  <th className="px-4 py-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!syncHistory || syncHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-4 text-center text-secondary-text">No sync history found</td></tr>
                ) : (
                  syncHistory.slice(0, 5).map(job => {
                    const start = job.startedAt ? new Date(job.startedAt) : new Date(job.createdAt);
                    const end = job.completedAt ? new Date(job.completedAt) : new Date();
                    const durationSecs = Math.round((end.getTime() - start.getTime()) / 1000);
                    
                    return (
                      <tr key={job.id} className="hover:bg-secondary-bg">
                        <td className="px-4 py-3">{start.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            job.state === 'COMPLETED' ? 'bg-success-light text-success' :
                            job.state === 'FAILED' ? 'bg-error-light text-error' :
                            'bg-info-light text-info'
                          }`}>
                            {job.state}
                          </span>
                        </td>
                        <td className="px-4 py-3">{job.totalSubmissionsFetched}</td>
                        <td className="px-4 py-3">{job.problemsAddedToQueue}</td>
                        <td className="px-4 py-3 text-secondary-text">{durationSecs}s</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col items-start">
          <h3 className="text-lg font-medium text-primary-text mb-2">Export Data</h3>
          <p className="text-sm text-secondary-text mb-4 flex-1">Download all your queue items, notes, and review history as a JSON file.</p>
          <button onClick={handleExport} className="inline-flex items-center px-4 py-2 border border-border text-primary-text rounded-md hover:bg-secondary-bg transition-colors text-sm font-medium">
            <Download className="w-4 h-4 mr-2 text-secondary-text" />
            Export all data
          </button>
        </div>

        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col items-start border-error-light">
          <h3 className="text-lg font-medium text-error mb-2">Logout</h3>
          <p className="text-sm text-secondary-text mb-4 flex-1">Sign out of your account on this device.</p>
          <button onClick={handleLogout} className="inline-flex items-center px-4 py-2 border border-error-light text-error bg-error-light rounded-md hover:bg-error-light transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
