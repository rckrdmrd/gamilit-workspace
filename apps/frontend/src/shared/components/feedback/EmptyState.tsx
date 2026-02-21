import { Inbox } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div role="status" className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="mb-4 rounded-full bg-detective-bg-secondary p-4">
        <Icon className="h-8 w-8 text-detective-text-secondary" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-detective-text">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-detective-text-secondary">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-orange/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
