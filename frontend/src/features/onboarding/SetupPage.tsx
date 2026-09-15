import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/shared/api/client';
import { useAuth } from '@/features/auth/useAuth';
import { InlineError } from '@/shared/ui/InlineError';

const TOPICS = [
  'math', 'dp', 'greedy', 'graphs', 'binary search', 'constructive algorithms',
  'implementation', 'number theory', 'data structures', 'strings', 'geometry',
  'combinatorics', 'trees', 'dfs and similar', 'sortings', 'two pointers', 'brute force'
];

const setupSchema = z.object({
  handle: z.string().min(1, 'Handle is required'),
  minRating: z.coerce.number().min(800).max(3500),
  maxRating: z.coerce.number().min(800).max(3500),
  topics: z.array(z.string()),
  timezone: z.string(),
}).refine(data => data.minRating <= data.maxRating, {
  message: "Min rating cannot be greater than Max rating",
  path: ['maxRating']
});

type SetupValues = z.infer<typeof setupSchema>;

export function SetupPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      handle: '',
      minRating: 1400,
      maxRating: 1800,
      topics: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  });

  const onSubmit = async (data: SetupValues) => {
    try {
      setGlobalError('');
      // Update preferences
      await api.patch('/preferences', {
        targetRatingMin: data.minRating,
        targetRatingMax: data.maxRating,
        preferredTopics: data.topics,
        timeZone: data.timezone,
      });

      await api.post('/tracked-handle', { handle: data.handle });
      await refreshUser();
      navigate('/today');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGlobalError(err.detail);
      } else {
        setGlobalError('Failed to save setup data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary-bg flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-primary-bg p-8 rounded-lg shadow-sm shadow-theme border border-border">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-primary-text">Set up your practice workspace</h1>
          <p className="text-sm text-secondary-text mt-2">
            Configure your Codeforces tracking and practice preferences.
          </p>
        </div>

        {globalError && (
          <div className="mb-6 p-3 bg-error-light border border-error-light rounded-md">
            <InlineError message={globalError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Handle */}
          <section>
            <h2 className="text-base font-medium text-primary-text mb-1">Track a Codeforces handle</h2>
            <p className="text-xs text-secondary-text mb-3">
              We'll import your public submission history. This does not verify ownership of the handle.
            </p>
            <input
              type="text"
              placeholder="Codeforces handle"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              {...register('handle')}
            />
            {errors.handle && <InlineError message={errors.handle.message as string} />}
          </section>

          {/* Difficulty Range */}
          <section>
            <h2 className="text-base font-medium text-primary-text mb-3">Target Difficulty Range</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-secondary-text mb-1">Min (800-3500)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  {...register('minRating')}
                />
                {errors.minRating && <InlineError message={errors.minRating.message as string} />}
              </div>
              <div className="flex-1">
                <label className="block text-xs text-secondary-text mb-1">Max (800-3500)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  {...register('maxRating')}
                />
                {errors.maxRating && <InlineError message={errors.maxRating.message as string} />}
              </div>
            </div>
          </section>

          {/* Topics */}
          <section>
            <h2 className="text-base font-medium text-primary-text mb-3">Preferred Topics</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto p-1">
              {TOPICS.map(topic => (
                <label key={topic} className="flex items-center gap-2 cursor-pointer text-sm text-primary-text">
                  <input
                    type="checkbox"
                    value={topic}
                    className="rounded text-accent focus:ring-accent border-border"
                    {...register('topics')}
                  />
                  {topic}
                </label>
              ))}
            </div>
            {errors.topics && <InlineError message={errors.topics.message as string} />}
          </section>

          {/* Timezone */}
          <section>
            <h2 className="text-base font-medium text-primary-text mb-1">Time Zone</h2>
            <p className="text-xs text-secondary-text mb-3">Used for scheduling daily reviews.</p>
            <select
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              {...register('timezone')}
            >
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-detected)
              </option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
            {errors.timezone && <InlineError message={errors.timezone.message as string} />}
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-accent hover:bg-button-hover text-on-accent text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Start tracking'}
          </button>
        </form>
      </div>
    </div>
  );
}
