/**
 * ProfileRankHistoryTab - Rank timeline and next rank progress.
 *
 * NOTE: Rank history data is currently mock. Will be replaced with API data.
 *
 * @module apps/student/components/profile/ProfileRankHistoryTab
 */

import { motion } from 'framer-motion';
import { TrendingUp, Star, Info } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import type { RankType } from '@shared/components/base/RankBadge';
import type { RankHistoryEntry } from './types';

// Mock rank history (TODO: replace with real API data)
const MOCK_RANK_HISTORY: RankHistoryEntry[] = [
  { rank: 'nacom', achievedAt: new Date('2025-01-15'), xpRequired: 0 },
  { rank: 'batab', achievedAt: new Date('2025-01-22'), xpRequired: 500 },
  { rank: 'chilam', achievedAt: new Date('2025-02-05'), xpRequired: 1000 },
];

interface ProfileRankHistoryTabProps {
  currentXP: number;
  nextRank: string;
  xpToNextLevel: number;
}

export function ProfileRankHistoryTab({
  currentXP,
  nextRank,
  xpToNextLevel,
}: ProfileRankHistoryTabProps) {
  return (
    <DetectiveCard>
      <div className="relative">
        {/* Demo Data Badge */}
        <div className="absolute right-2 top-2 z-10">
          <span className="inline-flex items-center gap-1 rounded border border-yellow-500/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-700">
            <Info className="h-3 w-3" />
            Datos de demostracion
          </span>
        </div>

        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-detective-text">
          <TrendingUp className="h-6 w-6 text-detective-orange" />
          Historial de Ascensos de Rango
        </h3>

        {/* Rank History Timeline */}
        <div className="space-y-6">
          {MOCK_RANK_HISTORY.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center gap-4"
            >
              {index < MOCK_RANK_HISTORY.length - 1 && (
                <div className="absolute left-8 top-16 h-12 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
              )}
              <div className="relative z-10">
                <RankBadge rank={entry.rank as RankType} showIcon />
              </div>
              <div className="flex-1 rounded-lg bg-detective-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold capitalize text-detective-text">{entry.rank}</h4>
                    <p className="text-sm text-detective-text-secondary">
                      Alcanzado el{' '}
                      {entry.achievedAt.toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-detective-orange">
                      {entry.xpRequired} XP
                    </p>
                    <p className="text-sm text-detective-text-secondary">Requerido</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Rank Progress */}
        <div className="mt-8 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-6">
          <h4 className="mb-4 flex items-center gap-2 font-bold text-detective-text">
            <Star className="h-5 w-5 text-detective-orange" />
            Proximo Rango
          </h4>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">
              Progreso hacia {nextRank}
            </span>
            <span className="text-sm font-semibold">
              {currentXP} / {xpToNextLevel} XP
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentXP / xpToNextLevel) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </div>
    </DetectiveCard>
  );
}
