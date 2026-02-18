import { motion } from 'framer-motion';
import { Users, Target, TrendingUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/features/gamification/social/types/leaderboardsTypes';
import { cn } from '@shared/utils/cn';

interface LeaderboardStatsGridProps {
  totalParticipants: number;
  userPosition: number | null;
  userEntry: LeaderboardEntry | undefined;
}

export function LeaderboardStatsGrid({ totalParticipants, userPosition, userEntry }: LeaderboardStatsGridProps) {
  const percentile = userPosition
    ? Math.round((1 - userPosition / totalParticipants) * 100)
    : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg bg-white p-4 shadow-md"
      >
        <div className="mb-2 flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-detective-text-secondary">Participantes</span>
        </div>
        <div className="text-2xl font-bold text-detective-text">
          {totalParticipants.toLocaleString()}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg bg-white p-4 shadow-md"
      >
        <div className="mb-2 flex items-center gap-3">
          <Target className="h-5 w-5 text-purple-500" />
          <span className="text-sm text-detective-text-secondary">Tu Percentil</span>
        </div>
        <div className="text-2xl font-bold text-detective-text">{percentile}%</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg bg-white p-4 shadow-md"
      >
        <div className="mb-2 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm text-detective-text-secondary">Cambio</span>
        </div>
        <div
          className={cn(
            'text-2xl font-bold',
            userEntry?.changeType === 'up'
              ? 'text-green-500'
              : userEntry?.changeType === 'down'
                ? 'text-red-500'
                : 'text-gray-500',
          )}
        >
          {userEntry?.changeType === 'up' && '+'}
          {userEntry?.changeType === 'down' && '-'}
          {userEntry?.change || 0}
        </div>
      </motion.div>
    </div>
  );
}
