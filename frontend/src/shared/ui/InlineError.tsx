import { AlertCircle } from 'lucide-react';

interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-1.5 text-sm text-error mt-1">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
}
