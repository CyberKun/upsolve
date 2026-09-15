interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className = 'w-full', count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`h-4 bg-surface-hover rounded animate-pulse ${className}`} />
      ))}
    </div>
  );
}
