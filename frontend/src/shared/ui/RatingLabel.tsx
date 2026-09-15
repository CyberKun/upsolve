interface RatingLabelProps {
  rating: number | null | undefined;
}

export function RatingLabel({ rating }: RatingLabelProps) {
  if (rating === null || rating === undefined) {
    return <span className="font-mono text-sm text-secondary-text">—</span>;
  }

  let colorClass = 'text-secondary-text'; // Default (< 1200)
  
  if (rating >= 2400) {
    colorClass = 'text-error';
  } else if (rating >= 2100) {
    colorClass = 'text-warning';
  } else if (rating >= 1900) {
    colorClass = 'text-highlight';
  } else if (rating >= 1600) {
    colorClass = 'text-info';
  } else if (rating >= 1400) {
    colorClass = 'text-info';
  } else if (rating >= 1200) {
    colorClass = 'text-success';
  }

  return (
    <span className={`font-mono text-sm font-medium ${colorClass}`}>
      {rating}
    </span>
  );
}
