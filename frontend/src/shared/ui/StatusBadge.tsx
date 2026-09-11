interface StatusBadgeProps {
  status: 'PENDING' | 'ATTEMPTED' | 'SOLVED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    PENDING: 'bg-gray-100 text-gray-600',
    ATTEMPTED: 'bg-amber-50 text-amber-700',
    SOLVED: 'bg-[#EBF5F0] text-[#35634E]',
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
