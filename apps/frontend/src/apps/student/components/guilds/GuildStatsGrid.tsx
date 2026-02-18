import { Shield, Users, Target, Trophy } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface GuildStatsGridProps {
  totalGuilds: number;
  recruitingCount: number;
  activeChallengesCount: number;
  guildLevel: number;
}

export function GuildStatsGrid({
  totalGuilds,
  recruitingCount,
  activeChallengesCount,
  guildLevel,
}: GuildStatsGridProps) {
  const stats = [
    { label: 'Total Guilds', value: totalGuilds, icon: Shield, color: 'bg-purple-500/20', iconColor: 'text-purple-600' },
    { label: 'Recruiting', value: recruitingCount, icon: Users, color: 'bg-blue-500/20', iconColor: 'text-blue-600' },
    { label: 'Active Challenges', value: activeChallengesCount, icon: Target, color: 'bg-detective-orange/20', iconColor: 'text-detective-orange' },
    { label: 'Guild Level', value: guildLevel, icon: Trophy, color: 'bg-detective-gold/20', iconColor: 'text-detective-gold' },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <DetectiveCard key={stat.label} hoverable={false}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
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
