import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-detective-bg p-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-detective-text-secondary hover:text-detective-text"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={cn('mb-4 rounded-full p-3', styles.icon)}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-detective-text">{title}</h3>
          <p className="mb-6 text-sm text-detective-text-secondary">{message}</p>
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-detective-border px-4 py-2 text-sm font-medium text-detective-text transition-colors hover:bg-detective-bg-secondary"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                styles.button,
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
