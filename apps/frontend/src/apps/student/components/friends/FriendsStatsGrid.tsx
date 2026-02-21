/**
 * FriendsStatsGrid - Stats overview cards for the friends page.
 *
 * Thin wrapper around the shared StatsCardGrid component.
 *
 * @module apps/student/components/friends/FriendsStatsGrid
 */

import { Users, Activity, Clock, Sparkles } from 'lucide-react';
import { StatsCardGrid } from '@shared/components/base/StatsCardGrid';
import type { StatItem } from '@shared/components/base/StatsCardGrid';

interface FriendsStatsGridProps {
  totalFriends: number;
  onlineCount: number;
  pendingRequestsCount: number;
  recommendationsCount: number;
  loading?: boolean;
}

export function FriendsStatsGrid({
  totalFriends,
  onlineCount,
  pendingRequestsCount,
  recommendationsCount,
  loading,
}: FriendsStatsGridProps) {
  const stats: StatItem[] = [
    { label: 'Total Friends', value: totalFriends, icon: Users, iconBg: 'bg-detective-blue/20', iconColor: 'text-detective-blue' },
    { label: 'Online Now', value: onlineCount, icon: Activity, iconBg: 'bg-green-500/20', iconColor: 'text-green-600' },
    { label: 'Pending Requests', value: pendingRequestsCount, icon: Clock, iconBg: 'bg-detective-orange/20', iconColor: 'text-detective-orange' },
    { label: 'Recommendations', value: recommendationsCount, icon: Sparkles, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-600' },
  ];

  return <StatsCardGrid items={stats} columns={4} loading={loading} />;
}
