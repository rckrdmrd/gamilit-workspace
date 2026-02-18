import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/features/gamification/social/types/leaderboardsTypes';

interface FriendsMiniLeaderboardProps {
  entries: LeaderboardEntry[];
}

export function FriendsMiniLeaderboard({ entries }: FriendsMiniLeaderboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
        <Users className="h-5 w-5 text-detective-orange" />
        Amigos Cercanos
      </h3>
      <div className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-detective-bg"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-detective-orange text-sm font-bold text-white">
              {entry.rank}
            </div>
            <img
              src={entry.avatar}
              alt={entry.username}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=f97316&color=fff`;
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-detective-text">
                {entry.username}
              </p>
              <p className="text-xs text-detective-text-secondary">
                {entry.score.toLocaleString()} pts
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
