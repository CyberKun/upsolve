interface StatusBadgeProps {
  status: 'PENDING' | 'ATTEMPTED' | 'SOLVED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    PENDING: 'bg-secondary-bg text-secondary-text',
    ATTEMPTED: 'bg-warning-light text-warning',
    SOLVED: 'bg-accent-light text-accent',
  };

  const labels = {
    PENDING: 'Pending',
    ATTEMPTED: 'Attempted',
    SOLVED: 'Solved',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
