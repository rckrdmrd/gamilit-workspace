/**
 * SkeletonCard Component
 *
 * Reusable skeleton loader for card-based loading states
 * Provides consistent loading experience across the application
 *
 * @module shared/components/loading
 */

import React from 'react';

export interface SkeletonCardProps {
  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;

  /**
   * Card height variant
   * @default 'medium'
   */
  variant?: 'small' | 'medium' | 'large';

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonCard component for loading states
 *
 * @example
 * ```tsx
 * <SkeletonCard count={3} variant="medium" />
 * ```
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'medium',
  className = '',
}) => {
  const heights = {
    small: 'h-24',
    medium: 'h-40',
    large: 'h-64',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`
            rounded-lg
            bg-detective-bg-secondary
            p-6
            ${heights[variant]}
            animate-pulse
            ${className}
          `}
        >
          {/* Header skeleton */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="bg-detective-border h-4 w-3/4 rounded"></div>
              <div className="bg-detective-border h-3 w-1/2 rounded"></div>
            </div>
            <div className="bg-detective-border h-10 w-10 rounded-full"></div>
          </div>

          {/* Content skeleton */}
          {variant !== 'small' && (
            <div className="mt-6 space-y-2">
              <div className="bg-detective-border h-3 w-full rounded"></div>
              <div className="bg-detective-border h-3 w-5/6 rounded"></div>
              {variant === 'large' && (
                <>
                  <div className="bg-detective-border h-3 w-4/6 rounded"></div>
                  <div className="bg-detective-border h-3 w-3/6 rounded"></div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

/**
 * SkeletonStats component for stat card loading states
 */
export const SkeletonStats: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg bg-detective-bg-secondary p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="bg-detective-border h-3 w-20 rounded"></div>
              <div className="bg-detective-border h-8 w-16 rounded"></div>
              <div className="bg-detective-border h-2 w-24 rounded"></div>
            </div>
            <div className="bg-detective-border h-10 w-10 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * SkeletonList component for list loading states
 */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg bg-detective-bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="bg-detective-border h-10 w-10 flex-shrink-0 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-detective-border h-3 w-3/4 rounded"></div>
              <div className="bg-detective-border h-2 w-1/2 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonTable component for table loading states
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="animate-pulse rounded-lg bg-detective-bg-secondary p-4">
      {/* Header */}
      <div className="border-detective-border mb-4 flex gap-4 border-b pb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={`header-${index}`} className="bg-detective-border h-4 flex-1 rounded"></div>
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="bg-detective-border h-3 flex-1 rounded"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
