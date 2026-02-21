/**
 * InventoryStatsGrid - Stats overview cards for the inventory page.
 *
 * Thin wrapper around the shared StatsCardGrid component.
 *
 * @module apps/student/components/inventory/InventoryStatsGrid
 */

import { Package, Coins, Zap, Check } from 'lucide-react';
import { StatsCardGrid } from '@shared/components/base/StatsCardGrid';
import type { StatItem } from '@shared/components/base/StatsCardGrid';

interface InventoryStatsGridProps {
  totalItems: number;
  totalValue: number;
  powerUpsCount: number;
  activeCount: number;
  loading?: boolean;
}

export function InventoryStatsGrid({
  totalItems,
  totalValue,
  powerUpsCount,
  activeCount,
  loading,
}: InventoryStatsGridProps) {
  const stats: StatItem[] = [
    {
      icon: Package,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-600',
      value: totalItems,
      label: 'Total Items',
    },
    {
      icon: Coins,
      iconBg: 'bg-detective-gold/20',
      iconColor: 'text-detective-gold',
      value: totalValue,
      label: 'Total Value',
    },
    {
      icon: Zap,
      iconBg: 'bg-detective-orange/20',
      iconColor: 'text-detective-orange',
      value: powerUpsCount,
      label: 'Power-ups',
    },
    {
      icon: Check,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-600',
      value: activeCount,
      label: 'Active Now',
    },
  ];

  return <StatsCardGrid items={stats} columns={4} loading={loading} />;
}
