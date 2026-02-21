import React from 'react';
import { cn } from '@shared/utils/cn';

interface ExerciseGradientHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  gradientClassName?: string;
}

export const ExerciseGradientHeader: React.FC<ExerciseGradientHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  children,
  className,
  titleClassName,
  descriptionClassName,
  gradientClassName,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-r p-6 text-white shadow-lg',
        gradientClassName ?? 'from-indigo-600 to-orange-500',
        className,
      )}
    >
      <div className={cn('flex items-start justify-between gap-4', description || actions || children ? 'mb-6' : '')}>
        <div className="flex items-center gap-3">
          {icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 p-2 backdrop-blur-sm">{icon}</div>}
          <div>
            <h2 className={cn('text-2xl font-bold text-white', titleClassName)}>{title}</h2>
            {description && <p className={cn('mt-1 text-white/95', descriptionClassName)}>{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export default ExerciseGradientHeader;
