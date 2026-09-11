import { useAuth } from '@/features/auth/useAuth';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { useQueue } from './hooks';
import { PageHeader } from '@/shared/ui/PageHeader';
import { QueueTable } from './QueueTable';
import { QueueMobileList } from './QueueMobileList';
import { EmptyState } from '@/shared/ui/EmptyState';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { AddProblemDialog } from './AddProblemDialog';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'ATTEMPTED', label: 'Unsolved' },
  { id: 'SOLVED', label: 'Solved' },
  { id: 'ARCHIVED', label: 'Archived' },
];

export function QueuePage() {
  const { isDemoMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'ALL';
  const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
  
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if ((searchParams.get("search") || "") === debouncedSearch) return;
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('search', debouncedSearch);
      newParams.set('page', '0');
    } else {
      newParams.delete('search');
      newParams.set('page', '0');
    }
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tabId === 'ALL') {
      newParams.delete('status');
    } else {
      newParams.set('status', tabId);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const { data, isLoading, error } = useQueue({
    status: !['ALL', 'ARCHIVED'].includes(currentTab) ? currentTab : undefined,
    archived: currentTab === 'ARCHIVED',
    search: debouncedSearch || undefined,
    page,
    sort: searchParams.get("sort") || "createdAt,desc",
    priority: searchParams.get("priority") || undefined,
    minRating: searchParams.get("minRating") || undefined,
    maxRating: searchParams.get("maxRating") || undefined,
    size: 20
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <PageHeader 
        title="Upsolve Queue" 
        actions={
          <AddProblemDialog>
            <button disabled={isDemoMode} className="disabled:opacity-50 flex items-center px-4 py-2 bg-[#35634E] text-white rounded-md hover:bg-[#2c5241] transition-colors text-sm font-medium shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add problem
            </button>
          </AddProblemDialog>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex overflow-x-auto no-scrollbar space-x-1 bg-gray-100 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentTab === tab.id
                  ? 'bg-white text-[#35634E] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#E5E2DB] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#35634E] focus:border-[#35634E]"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        ) : error ? (<p role="alert" className="text-red-600">{error.message}</p>) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No problems found"
            description="Try adjusting your search or filters, or add a new problem to your queue."
            icon={<Search />}
          />
        ) : (
          <>
            <QueueTable items={data.content} onSort={column => {
              const field = ({ problem: 'problem.name', rating: 'problem.rating', status: 'status', priority: 'priorityRank', updatedAt: 'updatedAt' } as Record<string,string>)[column];
              if (!field) return;
              const next = new URLSearchParams(searchParams);
              next.set('sort', searchParams.get('sort') === field + ',asc' ? field + ',desc' : field + ',asc');
              next.set('page', '0'); setSearchParams(next);
            }} />
            <QueueMobileList items={data.content} />

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-[#E5E2DB] pt-4">
                <div className="text-sm text-gray-500">
                  Showing {data.page * data.size + 1} to {Math.min((data.page + 1) * data.size, data.totalElements)} of {data.totalElements} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(data.page - 1)}
                    disabled={data.page === 0}
                    className="px-3 py-1 border border-[#E5E2DB] rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(data.page + 1)}
                    disabled={data.page === data.totalPages - 1}
                    className="px-3 py-1 border border-[#E5E2DB] rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
