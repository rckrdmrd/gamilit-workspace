/**
 * LeaderboardLayout Component
 * Main layout wrapper for leaderboard display
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from './LeaderboardEntry';
import type { LeaderboardEntry as Entry } from '../../types/leaderboardsTypes';
import type { EquippedItemsBatchMap } from '../../types/inventory.types';
import { CosmeticAvatar } from '@shared/components/CosmeticAvatar';

interface LeaderboardLayoutProps {
  entries: Entry[];
  showTopThree?: boolean;
  highlightUser?: boolean;
  equippedMap?: EquippedItemsBatchMap | null;
}

export const LeaderboardLayout: React.FC<LeaderboardLayoutProps> = ({
  entries,
  showTopThree = true,
  equippedMap,
}) => {
  const topThree = showTopThree ? entries.slice(0, 3) : [];
  const remaining = showTopThree ? entries.slice(3) : entries;

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {showTopThree && topThree.length > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center pt-8"
            >
              <div className="relative mb-4">
                <CosmeticAvatar
                  userId={topThree[1].userId}
                  name={topThree[1].username}
                  fallbackAvatar={topThree[1].avatar}
                  equippedMap={equippedMap}
                  size="lg"
                  className="border-4 border-gray-400"
                />
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-lg font-bold text-white shadow-lg">
                  2
                </div>
              </div>
              <h3 className="w-full truncate px-2 text-center font-bold text-detective-text">
                {topThree[1].username}
              </h3>
              <p className="text-detective-sm text-detective-text-secondary">
                {topThree[1].rankBadge}
              </p>
              <p className="mt-2 text-detective-lg font-bold text-detective-text">
                {topThree[1].score.toLocaleString()}
              </p>
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl"
                  >
                    =Q
                  </motion.div>
                </div>
                <CosmeticAvatar
                  userId={topThree[0].userId}
                  name={topThree[0].username}
                  fallbackAvatar={topThree[0].avatar}
                  equippedMap={equippedMap}
                  size="lg"
                  className="border-4 border-yellow-400 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 flex h-12 w-12 animate-gold-shine items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-xl font-bold text-white shadow-xl">
                  1
                </div>
              </div>
              <h3 className="w-full truncate px-2 text-center text-lg font-bold text-detective-text">
                {topThree[0].username}
              </h3>
              <p className="text-detective-sm text-detective-text-secondary">
                {topThree[0].rankBadge}
              </p>
              <p className="mt-2 text-detective-xl font-bold text-detective-gold">
                {topThree[0].score.toLocaleString()}
              </p>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center pt-12"
            >
              <div className="relative mb-4">
                <CosmeticAvatar
                  userId={topThree[2].userId}
                  name={topThree[2].username}
                  fallbackAvatar={topThree[2].avatar}
                  equippedMap={equippedMap}
                  size="lg"
                  className="border-4 border-orange-400"
                />
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-bold text-white shadow-lg">
                  3
                </div>
              </div>
              <h3 className="w-full truncate px-2 text-center font-bold text-detective-text">
                {topThree[2].username}
              </h3>
              <p className="text-detective-sm text-detective-text-secondary">
                {topThree[2].rankBadge}
              </p>
              <p className="mt-2 text-detective-lg font-bold text-detective-text">
                {topThree[2].score.toLocaleString()}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Remaining Entries */}
      <div className="space-y-2">
        {remaining.map((entry, index) => (
          <LeaderboardEntry key={entry.userId} entry={entry} index={index} equippedMap={equippedMap} />
        ))}
      </div>
    </div>
  );
};
