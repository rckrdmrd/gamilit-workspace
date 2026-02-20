/**
 * Skeleton Loading Components
 *
 * Canonical loading skeleton primitives and composites for the GAMILIT platform.
 * All components use detective-theme classes for visual consistency.
 *
 * Exports:
 * - Skeleton (base primitive)
 * - SkeletonText (multi-line text placeholder)
 * - SkeletonAvatar (circular avatar placeholder)
 * - SkeletonCard (card with header and body)
 * - SkeletonStats (stat card placeholder)
 * - SkeletonList (list items placeholder)
 * - SkeletonTable (table rows/columns placeholder)
 * - SkeletonAchievement (achievement card placeholder)
 *
 * @module shared/components/loading
 */

import { cn } from '@shared/utils/cn';

// ---------------------------------------------------------------------------
// Skeleton (base primitive)
// ---------------------------------------------------------------------------

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Base Skeleton primitive — a single animated placeholder block.
 *
 * @example
 * ```tsx
 * <Skeleton width="w-32" height="h-8" rounded="lg" />
 * ```
 */
export function Skeleton({
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
}: SkeletonProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={cn(
        'animate-pulse bg-detective-bg-secondary',
        width,
        height,
        roundedClass,
        className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonText
// ---------------------------------------------------------------------------

export interface SkeletonTextProps {
  /** Number of text lines @default 3 */
  lines?: number;
  className?: string;
}

/**
 * Multi-line text placeholder built on the base Skeleton.
 *
 * @example
 * ```tsx
 * <SkeletonText lines={4} />
 * ```
 */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonAvatar
// ---------------------------------------------------------------------------

export interface SkeletonAvatarProps {
  /** Avatar diameter in pixels @default 40 */
  size?: number;
  className?: string;
}

/**
 * Circular avatar placeholder.
 *
 * @example
 * ```tsx
 * <SkeletonAvatar size={64} />
 * ```
 */
export function SkeletonAvatar({ size = 40, className }: SkeletonAvatarProps) {
  return (
    <div
      className={cn('animate-pulse rounded-full bg-detective-bg-secondary', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard
// ---------------------------------------------------------------------------

export interface SkeletonCardProps {
  /** Number of skeleton items to render @default 1 */
  count?: number;
  /** Card height variant @default 'medium' */
  variant?: 'small' | 'medium' | 'large';
  /** Show avatar in header @default false */
  showAvatar?: boolean;
  /** Number of body text lines (used when variant renders text) @default 3 */
  lines?: number;
  className?: string;
}

/**
 * Card-shaped loading skeleton with header and optional body text.
 *
 * @example
 * ```tsx
 * <SkeletonCard count={3} variant="medium" />
 * ```
 */
export function SkeletonCard({
  count = 1,
  variant = 'medium',
  showAvatar = false,
  lines = 3,
  className = '',
}: SkeletonCardProps) {
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
          className={cn(
            'animate-pulse rounded-lg bg-detective-bg-secondary p-6',
            heights[variant],
            className,
          )}
        >
          {/* Header skeleton */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {showAvatar && <SkeletonAvatar size={48} />}
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 rounded bg-detective-border"></div>
                <div className="h-3 w-1/2 rounded bg-detective-border"></div>
              </div>
            </div>
            {!showAvatar && (
              <div className="h-10 w-10 rounded-full bg-detective-border"></div>
            )}
          </div>

          {/* Content skeleton */}
          {variant !== 'small' && (
            <div className="mt-6 space-y-2">
              {Array.from({ length: Math.min(lines, variant === 'large' ? 4 : 2) }).map(
                (_, lineIdx) => (
                  <div
                    key={lineIdx}
                    className={cn(
                      'h-3 rounded bg-detective-border',
                      lineIdx === 0 ? 'w-full' : `w-${6 - lineIdx}/6`,
                    )}
                  ></div>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// SkeletonStats
// ---------------------------------------------------------------------------

export interface SkeletonStatsProps {
  /** Number of stat cards to render @default 4 */
  count?: number;
  className?: string;
}

/**
 * Stat-card loading skeleton.
 *
 * @example
 * ```tsx
 * <SkeletonStats count={4} />
 * ```
 */
export function SkeletonStats({ count = 4, className }: SkeletonStatsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('animate-pulse rounded-lg bg-detective-bg-secondary p-6', className)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 rounded bg-detective-border"></div>
              <div className="h-8 w-16 rounded bg-detective-border"></div>
              <div className="h-2 w-24 rounded bg-detective-border"></div>
            </div>
            <div className="h-10 w-10 rounded-full bg-detective-border"></div>
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// SkeletonList
// ---------------------------------------------------------------------------

export interface SkeletonListProps {
  /** Number of list rows @default 5 */
  count?: number;
  className?: string;
}

/**
 * List-item loading skeleton.
 *
 * @example
 * ```tsx
 * <SkeletonList count={5} />
 * ```
 */
export function SkeletonList({ count = 5, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg bg-detective-bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-detective-border"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-detective-border"></div>
              <div className="h-2 w-1/2 rounded bg-detective-border"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonTable
// ---------------------------------------------------------------------------

export interface SkeletonTableProps {
  /** Number of table rows @default 5 */
  rows?: number;
  /** Number of columns @default 4 */
  columns?: number;
  className?: string;
}

/**
 * Table loading skeleton with header row and data rows.
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={10} columns={5} />
 * ```
 */
export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-detective-bg-secondary p-4', className)}>
      {/* Header */}
      <div className="mb-4 flex gap-4 border-b border-detective-border pb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={`header-${index}`} className="h-4 flex-1 rounded bg-detective-border"></div>
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-3 flex-1 rounded bg-detective-border"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonAchievement
// ---------------------------------------------------------------------------

export interface SkeletonAchievementProps {
  className?: string;
}

/**
 * Achievement-card loading skeleton with icon, title, description, and progress bar.
 *
 * @example
 * ```tsx
 * <SkeletonAchievement />
 * ```
 */
export function SkeletonAchievement({ className }: SkeletonAchievementProps) {
  return (
    <div
      className={cn('animate-pulse space-y-3 rounded-lg bg-detective-bg-secondary p-4', className)}
    >
      {/* Icon */}
      <div className="flex justify-center">
        <Skeleton width="w-16" height="h-16" rounded="full" />
      </div>

      {/* Title */}
      <Skeleton width="w-3/4" height="h-5" className="mx-auto" />

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Progress bar */}
      <div className="space-y-1">
        <Skeleton width="w-full" height="h-2" rounded="full" />
        <div className="flex justify-between">
          <Skeleton width="w-12" height="h-3" />
          <Skeleton width="w-12" height="h-3" />
        </div>
      </div>
    </div>
  );
}
