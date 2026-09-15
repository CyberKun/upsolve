import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Info } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { useTopicAnalytics, useDifficultyAnalytics, useActivityAnalytics, useMistakeAnalytics } from './hooks';

function InfoPanel({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)} className="flex items-center text-sm text-secondary-text hover:text-primary-text transition-colors">
        <Info className="w-4 h-4 mr-1.5" />
        {title}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-secondary-bg border border-border rounded-md text-sm text-secondary-text">
          {content}
        </div>
      )}
    </div>
  );
}

export function InsightsPage() {
  const { data: topicsData, isLoading: topicsLoading, error: topicsError } = useTopicAnalytics();
  const { data: diffData, isLoading: diffLoading, error: diffError } = useDifficultyAnalytics();
  const { data: activityData, isLoading: activityLoading, error: activityError } = useActivityAnalytics();
  const { data: mistakesData, isLoading: mistakesLoading, error: mistakesError } = useMistakeAnalytics();

  if (topicsLoading || diffLoading || activityLoading || mistakesLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
         <LoadingSkeleton className="h-10 w-48" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <LoadingSkeleton className="h-96 w-full" />
           <LoadingSkeleton className="h-96 w-full" />
           <LoadingSkeleton className="h-96 w-full" />
           <LoadingSkeleton className="h-96 w-full" />
         </div>
      </div>
    );
  }

  if (topicsError || diffError || activityError || mistakesError) return <p role="alert" className="text-error">{(topicsError || diffError || activityError || mistakesError)?.message}</p>;

  // Topic Data Formatting
  const topicsChartData = (topicsData?.topics || []).map(t => ({
    name: t.tag,
    Attempted: t.attempted - t.solved,
    Solved: t.solved,
    Total: t.attempted
  })).sort((a, b) => b.Total - a.Total).slice(0, 15); // limit to top 15 for readability

  // Activity Data Formatting
  const activityChartData = (activityData?.activity || []).map(w => ({
    name: new Date(w.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Contest: w.contestant,
    Virtual: w.virtual,
    Practice: w.practice
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader title="Insights" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Topic Breakdown */}
        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Topic Breakdown</h2>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'var(--clear)' }} />
                <Legend />
                <Bar dataKey="Attempted" stackId="a" fill="var(--secondary-text)" name="Attempted (Unsolved)" />
                <Bar dataKey="Solved" stackId="a" fill="var(--accent-color)" name="Solved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InfoPanel 
            title="How this is calculated"
            content="Shows problems attempted vs solved for each tag. Problems with multiple tags are counted in each tag category."
          />
        </div>

        {/* Difficulty Bands */}
        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Difficulty Bands</h2>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary-bg text-secondary-text border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-medium">Rating Band</th>
                  <th className="px-4 py-2 font-medium text-right">Attempted</th>
                  <th className="px-4 py-2 font-medium text-right">Solved</th>
                  <th className="px-4 py-2 font-medium text-right">Solve Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(diffData?.bands || []).map((band, i) => (
                  <tr key={i} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-2 font-medium text-primary-text">{band.label}</td>
                    <td className="px-4 py-2 text-right font-mono text-secondary-text">{band.attempted}</td>
                    <td className="px-4 py-2 text-right font-mono text-secondary-text">{band.solved}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">
                      {band.insufficientData ? (
                        <span className="text-secondary-text text-xs">Not enough data</span>
                      ) : (
                        <span className={band.solveRate && band.solveRate >= 0.8 ? 'text-accent' : band.solveRate && band.solveRate < 0.5 ? 'text-error' : 'text-primary-text'}>
                          {Math.round((band.solveRate || 0) * 100)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <InfoPanel 
            title="How this is calculated"
            content="Aggregates your performance into rating bands (e.g. 1200-1399). Solve rate is only calculated if you have at least 5 attempts in that band."
          />
        </div>

        {/* Weekly Activity */}
        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Weekly Activity</h2>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'var(--secondary-bg)' }} />
                <Legend />
                <Bar dataKey="Contest" stackId="a" fill="var(--accent-color)" />
                <Bar dataKey="Virtual" stackId="a" fill="var(--warning)" />
                <Bar dataKey="Practice" stackId="a" fill="var(--secondary-text)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InfoPanel 
            title="How this is calculated"
            content="Counts distinct problems with accepted submissions per week and context (live contest, virtual contest, or practice). A problem solved in more than one context is counted in each context."
          />
        </div>

        {/* Mistake Patterns */}
        <div className="bg-primary-bg border border-border rounded-lg p-6 shadow-sm shadow-theme flex flex-col">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Mistake Patterns</h2>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {!mistakesData?.mistakes || mistakesData.mistakes.length === 0 ? (
              <div className="text-sm text-secondary-text text-center py-8">No mistake data logged yet. Add notes to your solved problems.</div>
            ) : (
              mistakesData.mistakes.map((m, i) => {
                const percentage = mistakesData.totalNotes > 0 ? (m.count / mistakesData.totalNotes) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-primary-text">{m.category.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-mono text-secondary-text">{m.count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-surface-hover rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <InfoPanel 
            title="How this is calculated"
            content="Aggregates the mistake categories you select when adding notes to problems in your queue. Percentages are relative to the total number of problems with notes."
          />
        </div>

      </div>
    </div>
  );
}
