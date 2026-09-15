import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  headingLevel?: 1 | 2;
}

export function PageHeader({ title, subtitle, actions, headingLevel = 1 }: PageHeaderProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <Heading className="text-3xl font-medium tracking-tight text-primary-text">{title}</Heading>
        {subtitle && <p className="text-sm text-secondary-text mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
