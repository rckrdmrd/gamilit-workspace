/**
 * GuildStatsGrid - Stats overview cards for the guilds page.
 *
 * Thin wrapper around the shared StatsCardGrid component.
 *
 * @module apps/student/components/guilds/GuildStatsGrid
 */

import { Shield, Users, Target, Trophy } from 'lucide-react';
import { StatsCardGrid } from '@shared/components/base/StatsCardGrid';
import type { StatItem } from '@shared/components/base/StatsCardGrid';

interface GuildStatsGridProps {
  totalGuilds: number;
  recruitingCount: number;
  activeChallengesCount: number;
  guildLevel: number;
  loading?: boolean;
}

export function GuildStatsGrid({
  totalGuilds,
  recruitingCount,
  activeChallengesCount,
  guildLevel,
  loading,
}: GuildStatsGridProps) {
  const stats: StatItem[] = [
    { label: 'Total Guilds', value: totalGuilds, icon: Shield, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-600' },
    { label: 'Recruiting', value: recruitingCount, icon: Users, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-600' },
    { label: 'Active Challenges', value: activeChallengesCount, icon: Target, iconBg: 'bg-detective-orange/20', iconColor: 'text-detective-orange' },
    { label: 'Guild Level', value: guildLevel, icon: Trophy, iconBg: 'bg-detective-gold/20', iconColor: 'text-detective-gold' },
  ];

  return <StatsCardGrid items={stats} columns={4} loading={loading} />;
}
