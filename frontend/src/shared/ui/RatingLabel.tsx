interface RatingLabelProps {
  rating: number | null | undefined;
}

export function RatingLabel({ rating }: RatingLabelProps) {
  if (rating === null || rating === undefined) {
    return <span className="font-mono text-sm text-gray-400">—</span>;
  }

  let colorClass = 'text-gray-500'; // Default (< 1200)
  
  if (rating >= 2400) {
    colorClass = 'text-red-600';
  } else if (rating >= 2100) {
    colorClass = 'text-orange-500';
  } else if (rating >= 1900) {
    colorClass = 'text-purple-600';
  } else if (rating >= 1600) {
    colorClass = 'text-blue-600';
  } else if (rating >= 1400) {
    colorClass = 'text-cyan-600';
  } else if (rating >= 1200) {
    colorClass = 'text-green-600';
  }

  return (
    <span className={`font-mono text-sm font-medium ${colorClass}`}>
      {rating}
    </span>
  );
}
