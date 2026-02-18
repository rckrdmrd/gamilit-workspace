import { Users, Activity, Clock, Sparkles } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface FriendsStatsGridProps {
  totalFriends: number;
  onlineCount: number;
  pendingRequestsCount: number;
  recommendationsCount: number;
}

export function FriendsStatsGrid({
  totalFriends,
  onlineCount,
  pendingRequestsCount,
  recommendationsCount,
}: FriendsStatsGridProps) {
  const stats = [
    { label: 'Total Friends', value: totalFriends, icon: Users, color: 'bg-detective-blue/20', iconColor: 'text-detective-blue' },
    { label: 'Online Now', value: onlineCount, icon: Activity, color: 'bg-green-500/20', iconColor: 'text-green-600' },
    { label: 'Pending Requests', value: pendingRequestsCount, icon: Clock, color: 'bg-detective-orange/20', iconColor: 'text-detective-orange' },
    { label: 'Recommendations', value: recommendationsCount, icon: Sparkles, color: 'bg-purple-500/20', iconColor: 'text-purple-600' },
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
