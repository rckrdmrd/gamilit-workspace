/**
 * StatsCardGrid - Shared stats overview grid component.
 *
 * Renders a responsive CSS grid of stat cards, each with an icon,
 * label, value, and optional subtitle. Supports three visual variants
 * (detective, gradient, minimal) and a loading skeleton state.
 *
 * Created to deduplicate InventoryStatsGrid, FriendsStatsGrid,
 * and GuildStatsGrid which were near-identical clones.
 *
 * @module shared/components/base/StatsCardGrid
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { DetectiveCard } from './DetectiveCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatItem {
  /** Lucide icon component to render */
  icon: LucideIcon;
  /** Short label displayed below the value */
  label: string;
  /** Primary stat value (rendered large) */
  value: string | number;
  /** Optional secondary text below the label */
  subtitle?: string;
  /** Tailwind background class for the icon circle (e.g. 'bg-purple-500/20') */
  iconBg?: string;
  /** Tailwind text-color class for the icon (e.g. 'text-purple-600') */
  iconColor?: string;
}

export interface StatsCardGridProps {
  /** Array of stat items to render */
  items: StatItem[];
  /** Number of columns at md+ breakpoint @default 4 */
  columns?: 1 | 2 | 3 | 4 | 6;
  /** Visual variant @default 'detective' */
  variant?: 'detective' | 'gradient' | 'minimal';
  /** Show loading skeletons instead of real data @default false */
  loading?: boolean;
  /** Additional className applied to the outer grid container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Column mapping
// ---------------------------------------------------------------------------

const columnClasses: Record<NonNullable<StatsCardGridProps['columns']>, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  6: 'md:grid-cols-6',
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function StatSkeleton({ columns = 4 }: { columns?: StatsCardGridProps['columns'] }) {
  return (
    <>
      {Array.from({ length: columns ?? 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-detective-bg-secondary p-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-detective-border" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-16 rounded bg-detective-border" />
              <div className="h-3 w-20 rounded bg-detective-border" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stat card renderers per variant
// ---------------------------------------------------------------------------

function DetectiveStatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <DetectiveCard hoverable={false}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            item.iconBg ?? 'bg-detective-blue/20',
          )}
        >
          <Icon className={cn('h-6 w-6', item.iconColor ?? 'text-detective-blue')} />
        </div>
        <div>
          <p className="text-2xl font-bold text-detective-text">{item.value}</p>
          <p className="text-sm text-detective-text-secondary">{item.label}</p>
          {item.subtitle && (
            <p className="text-xs text-detective-text-secondary/70">{item.subtitle}</p>
          )}
        </div>
      </div>
    </DetectiveCard>
  );
}

function GradientStatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 p-5',
        'bg-gradient-to-br from-detective-bg-secondary to-detective-bg',
        'shadow-sm transition-shadow hover:shadow-md',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            item.iconBg ?? 'bg-detective-blue/20',
          )}
        >
          <Icon className={cn('h-6 w-6', item.iconColor ?? 'text-detective-blue')} />
        </div>
        <div>
          <p className="text-2xl font-bold text-detective-text">{item.value}</p>
          <p className="text-sm text-detective-text-secondary">{item.label}</p>
          {item.subtitle && (
            <p className="text-xs text-detective-text-secondary/70">{item.subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MinimalStatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-3 rounded-lg p-4">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          item.iconBg ?? 'bg-detective-blue/20',
        )}
      >
        <Icon className={cn('h-5 w-5', item.iconColor ?? 'text-detective-blue')} />
      </div>
      <div>
        <p className="text-xl font-semibold text-detective-text">{item.value}</p>
        <p className="text-xs text-detective-text-secondary">{item.label}</p>
        {item.subtitle && (
          <p className="text-xs text-detective-text-secondary/70">{item.subtitle}</p>
        )}
      </div>
    </div>
  );
}

const variantRenderers: Record<
  NonNullable<StatsCardGridProps['variant']>,
  React.ComponentType<{ item: StatItem }>
> = {
  detective: DetectiveStatCard,
  gradient: GradientStatCard,
  minimal: MinimalStatCard,
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StatsCardGrid({
  items,
  columns = 4,
  variant = 'detective',
  loading = false,
  className,
}: StatsCardGridProps) {
  const CardRenderer = variantRenderers[variant];

  return (
    <div
      className={cn(
        'mb-6 grid grid-cols-1 gap-4',
        columnClasses[columns],
        className,
      )}
    >
      {loading ? (
        <StatSkeleton columns={columns} />
      ) : (
        items.map((item) => (
          <CardRenderer key={item.label} item={item} />
        ))
      )}
    </div>
  );
}
