import React from 'react';
import { Link } from 'react-router';
import type { QueueItemResponse } from '@/shared/api/types';
import { RatingLabel } from '@/shared/ui/RatingLabel';
import { StatusBadge } from '@/shared/ui/StatusBadge';

interface QueueMobileListProps {
  items: QueueItemResponse[];
}

export const QueueMobileList: React.FC<QueueMobileListProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="md:hidden space-y-4">
      {items.map((item) => (
        <Link key={item.id} to={`/queue/${item.id}`} className="block bg-primary-bg p-4 rounded-lg border border-border hover:bg-surface-hover transition-colors duration-150">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-mono text-xs text-secondary-text mb-1">{item.problem.contestId}{item.problem.problemIndex}</div>
              <div className="font-medium text-primary-text leading-tight">{item.problem.name}</div>
            </div>
            <RatingLabel rating={item.problem.rating} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <StatusBadge status={item.status} />
            <span className={`text-xs font-medium ${item.priority === 'HIGH' ? 'text-error' : item.priority === 'MEDIUM' ? 'text-warning' : 'text-secondary-text'}`}>
              {item.priority} priority
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
