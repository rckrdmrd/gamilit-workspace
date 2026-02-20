/**
 * Loading Components Barrel Export
 *
 * Canonical location for ALL loading/skeleton components.
 *
 * @module shared/components/loading
 */

// Skeleton primitives and composites
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStats,
  SkeletonList,
  SkeletonTable,
  SkeletonAchievement,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonAvatarProps,
  type SkeletonCardProps,
  type SkeletonStatsProps,
  type SkeletonListProps,
  type SkeletonTableProps,
  type SkeletonAchievementProps,
} from './SkeletonCard';

// Spinner
export { LoadingSpinner } from './LoadingSpinner';

// Overlay
export { LoadingOverlay, type LoadingOverlayProps } from './LoadingOverlay';
