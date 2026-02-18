/**
 * InventoryStatsGrid - Stats overview cards for the inventory page.
 *
 * @module apps/student/components/inventory/InventoryStatsGrid
 */

import { Package, Coins, Zap, Check } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface InventoryStatsGridProps {
  totalItems: number;
  totalValue: number;
  powerUpsCount: number;
  activeCount: number;
}

export function InventoryStatsGrid({
  totalItems,
  totalValue,
  powerUpsCount,
  activeCount,
}: InventoryStatsGridProps) {
  const stats = [
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

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <DetectiveCard key={stat.label} hoverable={false}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{stat.value}</p>
                <p className="text-sm text-detective-text-secondary">{stat.label}</p>
              </div>
            </div>
          </DetectiveCard>
        );
      })}
    </div>
  );
}
