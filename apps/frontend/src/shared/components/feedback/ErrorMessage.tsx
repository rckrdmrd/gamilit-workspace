import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ title = 'Error', message, onRetry, className }: ErrorMessageProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-detective-text">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-detective-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-orange/90"
        >
          <RefreshCw className="h-4 w-4" />
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
