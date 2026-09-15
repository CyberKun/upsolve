import React from 'react';
import { Link } from 'react-router';
import type { QueueItemResponse } from '@/shared/api/types';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface QueueTableProps {
  items: QueueItemResponse[];
  onSort?: (column: string) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({ items, onSort }) => {
  if (items.length === 0) return null;

  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-primary-bg">
      <table className="w-full text-sm text-left">
        <thead className="bg-secondary-bg text-secondary-text border-b border-border">
          <tr>
            <th className="px-4 py-3 font-medium"><button type="button" onClick={() => onSort?.('problem')}> Problem</button></th>
            <th className="px-4 py-3 font-medium"><button type="button" onClick={() => onSort?.('rating')}> Rating</button></th>
            <th className="px-4 py-3 font-medium"><button type="button" onClick={() => onSort?.('status')}> Status</button></th>
            <th className="px-4 py-3 font-medium"><button type="button" onClick={() => onSort?.('priority')}> Priority</button></th>
            <th className="px-4 py-3 font-medium"><button type="button" onClick={() => onSort?.('updatedAt')}> Last Activity</button></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-hover transition-colors duration-150">
              <td className="px-4 py-3">
                <Link to={`/queue/${item.id}`} className="flex flex-col group">
                  <span className="font-mono text-xs text-secondary-text group-hover:text-accent">{item.problem.contestId}{item.problem.problemIndex}</span>
                  <span className="font-medium text-primary-text group-hover:text-accent truncate max-w-[250px]">{item.problem.name}</span>
                </Link>
              </td>
              <td className="px-4 py-3"><RatingLabel rating={item.problem.rating} /></td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3">
                <span className={`font-medium ${item.priority === 'HIGH' ? 'text-error' : item.priority === 'MEDIUM' ? 'text-warning' : 'text-secondary-text'}`}>
                  {item.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-secondary-text">
                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
