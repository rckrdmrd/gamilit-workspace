import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/features/gamification/social/types/leaderboardsTypes';

interface UserPositionCardProps {
  userEntry: LeaderboardEntry;
  pointsToNext: number;
}

export function UserPositionCard({ userEntry, pointsToNext }: UserPositionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={userEntry.avatar}
              alt={userEntry.username}
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userEntry.username)}&background=8b5cf6&color=fff`;
              }}
            />
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <span className="text-sm font-bold text-purple-600">#{userEntry.rank}</span>
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-2xl font-bold">Tu Posicion</h2>
            <p className="text-lg opacity-90">{userEntry.username}</p>
            <p className="text-sm opacity-80">{userEntry.rankBadge}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="mb-1 text-4xl font-bold">
            {userEntry.score.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">puntos totales</div>
          {pointsToNext > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm"
            >
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4" />
                <span>{pointsToNext} pts al siguiente</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {pointsToNext > 0 && (
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((userEntry.score / (userEntry.score + pointsToNext)) * 100, 100)}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-3 rounded-full bg-white"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
