import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 w-full h-full min-h-[300px]">
      {icon && (
        <div className="text-[#9CA3AF] mb-4 [&>svg]:w-10 [&>svg]:h-10">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[#242824]">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-md text-center mt-2">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
