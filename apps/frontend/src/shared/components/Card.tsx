import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  className?: string;
  children: ReactNode;
}

export const Card = ({
  header,
  footer,
  variant = 'default',
  className,
  children
}: CardProps) => {
  const variantStyles = {
    default: 'bg-white rounded-lg',
    bordered: 'bg-white rounded-lg border border-gray-200',
    elevated: 'bg-white rounded-lg shadow-lg',
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};
