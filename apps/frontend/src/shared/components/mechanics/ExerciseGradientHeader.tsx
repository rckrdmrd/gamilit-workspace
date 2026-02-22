import type { ReactNode } from 'react';
import { cn } from '@shared/utils/cn';

interface ExerciseGradientHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  gradientClassName?: string;
}

export const ExerciseGradientHeader = ({
  title,
  description,
  icon,
  actions,
  children,
  className,
  titleClassName,
  descriptionClassName,
  gradientClassName,
}: ExerciseGradientHeaderProps) => {
  return (
    <header
      role="banner"
      className={cn(
        'rounded-xl bg-gradient-to-r p-3 sm:p-6 text-white shadow-lg',
        gradientClassName ?? 'from-indigo-600 to-orange-500',
        className,
      )}
    >
      <div className={cn('flex items-start justify-between gap-2 sm:gap-4', description || actions || children ? 'mb-6' : '')}>
        <div className="flex items-center gap-3">
          {icon && <div aria-hidden="true" className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/20 p-2 backdrop-blur-sm">{icon}</div>}
          <div>
            <h2 className={cn('text-xl sm:text-2xl font-bold text-white', titleClassName)}>{title}</h2>
            {description && <p className={cn('mt-1 text-white/95', descriptionClassName)}>{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </header>
  );
};

export default ExerciseGradientHeader;
