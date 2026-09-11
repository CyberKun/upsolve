import { isCodeforcesProblemUrl } from '@/shared/api/problemUrl';
import { useState, useEffect, ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Link as LinkIcon, X } from 'lucide-react';
import { useAddToQueue, useSearchProblems } from './hooks';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { ApiError } from '@/shared/api/client';
import type { ProblemResponse } from '@/shared/api/types';

export function AddProblemDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'search' | 'url'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [selectedProblem, setSelectedProblem] = useState<ProblemResponse | null>(null);
  
  const [errorMsg, setErrorMsg] = useState('');

  const { data: searchResults, isLoading: isSearching } = useSearchProblems(debouncedSearch);
  const { mutate: addToQueue, isPending: isAdding } = useAddToQueue();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isCfUrl = isCodeforcesProblemUrl;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
      setDebouncedSearch('');
      setUrl('');
      setPriority('MEDIUM');
      setSelectedProblem(null);
      setErrorMsg('');
      setMode('search');
    }
  };

  const isValid = mode === 'search' ? selectedProblem !== null : isCfUrl(url);

  const handleSubmit = () => {
    if (!isValid) return;
    setErrorMsg('');
    const data = mode === 'search'
      ? { problemId: selectedProblem?.id, priority }
      : { problemUrl: url, priority };

    addToQueue(data, {
      onSuccess: () => {
        handleOpenChange(false);
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setErrorMsg('Problem is already in the queue');
          } else if (err.status === 404) {
            setErrorMsg('Problem not found');
          } else {
            setErrorMsg(err.message || 'Failed to add problem');
          }
        } else {
          setErrorMsg('An unexpected error occurred');
        }
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50">
          <Dialog.Title className="text-lg font-semibold mb-4">Add problem to queue</Dialog.Title>
          <Dialog.Description className="sr-only">Search the catalog or paste a Codeforces problem URL.</Dialog.Description>
          
          <Dialog.Close aria-label="Close dialog" className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </Dialog.Close>

          <div className="flex space-x-2 mb-6">
            <button
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'search' ? 'bg-[#35634E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setMode('search')}
            >
              Search catalog
            </button>
            <button
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'url' ? 'bg-[#35634E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setMode('url')}
            >
              Enter URL
            </button>
          </div>

          {mode === 'search' ? (
            <div className="space-y-4 h-64 flex flex-col">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E2DB] rounded-md text-sm focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E]"
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto border border-[#E5E2DB] rounded-md">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : searchResults?.content && searchResults.content.length > 0 ? (
                  <ul className="divide-y divide-[#E5E2DB]">
                    {searchResults.content.map((problem) => (
                      <li
                        key={problem.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-2 ${selectedProblem?.id === problem.id ? 'border-[#35634E] bg-green-50/50' : 'border-transparent'}`}
                        onClick={() => setSelectedProblem(problem)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{problem.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              {problem.contestId}{problem.problemIndex}
                            </div>
                          </div>
                          {problem.rating && <RatingLabel rating={problem.rating} />}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : debouncedSearch.length >= 2 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No problems found</div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">Type at least 2 characters to search</div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-auto">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E2DB] rounded-md text-sm focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E]"
                  placeholder="https://codeforces.com/contest/.../problem/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              {url && !isCfUrl(url) && (
                <div className="text-xs text-red-500">Please enter a valid Codeforces problem URL</div>
              )}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="w-full border border-[#E5E2DB] rounded-md p-2 text-sm focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E]"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {errorMsg && (
            <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-[#35634E] rounded-md hover:bg-[#2c5241] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleSubmit}
              disabled={!isValid || isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to queue'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
