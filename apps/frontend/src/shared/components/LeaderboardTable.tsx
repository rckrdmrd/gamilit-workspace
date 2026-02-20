import React from 'react';
import { Trophy, Crown, Loader } from 'lucide-react';
import { Avatar } from './Avatar';
import { cn } from '@shared/utils/cn';
import { formatXP, formatStreak } from '@/shared/utils/format.util';
import type { LeaderboardEntry } from '@/shared/types/leaderboard.types';
import { MayaRank } from '@/shared/constants/ranks.constants';

/**
 * LeaderboardTable Props
 */
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Get rank color - Updated to use official Maya Ranks
 * @see ET-GAM-003-rangos-maya.md
 */
const getRankColor = (rank: MayaRank): string => {
  const colors: Record<MayaRank, string> = {
    [MayaRank.AJAW]: 'text-brown-600',
    [MayaRank.NACOM]: 'text-bronze-600',
    [MayaRank.AH_KIN]: 'text-silver-600',
    [MayaRank.HALACH_UINIC]: 'text-yellow-600',
    [MayaRank.KUKULKAN]: 'text-purple-600',
  };
  return colors[rank] || 'text-gray-600';
};

/**
 * Get rank label - Updated to use official Maya Ranks
 */
const getRankLabel = (rank: MayaRank): string => {
  const labels: Record<MayaRank, string> = {
    [MayaRank.AJAW]: 'Ajaw',
    [MayaRank.NACOM]: 'Nacom',
    [MayaRank.AH_KIN]: "Ah K'in",
    [MayaRank.HALACH_UINIC]: 'Halach Uinic',
    [MayaRank.KUKULKAN]: "K'uk'ulkan",
  };
  return labels[rank] || String(rank);
};

/**
 * Get rank position badge
 */
const getRankBadge = (rank: number): React.ReactNode => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
};

/**
 * Skeleton Loading Row
 */
const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-b border-gray-200">
    <td className="px-6 py-4">
      <div className="h-8 w-8 rounded bg-gray-200" />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 rounded bg-gray-200" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-12 rounded bg-gray-200" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-24 rounded bg-gray-200" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-16 rounded bg-gray-200" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-12 rounded bg-gray-200" />
    </td>
  </tr>
);

/**
 * Mobile Card View (for responsive)
 */
const MobileCard: React.FC<{ entry: LeaderboardEntry; isCurrentUser: boolean }> = ({
  entry,
  isCurrentUser,
}) => (
  <div
    className={cn(
      'mb-4 rounded-lg border-2 bg-white p-4',
      isCurrentUser ? 'border-orange-500 bg-orange-50' : 'border-gray-200',
      entry.rank <= 3 && 'border-yellow-400 bg-yellow-50',
    )}
  >
    {/* Rank & User */}
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>
        <Avatar src={entry.avatar} alt={entry.username} name={entry.username} />
        <div>
          <p className="font-semibold text-gray-900">
            {entry.username}
            {isCurrentUser && <span className="ml-2 text-xs text-orange-600">(Tú)</span>}
          </p>
          <p className={cn('text-sm font-medium', getRankColor(entry.currentRank))}>
            {getRankLabel(entry.currentRank)}
          </p>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded bg-white p-2">
        <p className="text-xs text-gray-600">XP Total</p>
        <p className="text-sm font-bold text-gray-900">{formatXP(entry.totalXP)}</p>
      </div>
      <div className="rounded bg-white p-2">
        <p className="text-xs text-gray-600">Nivel</p>
        <p className="text-sm font-bold text-gray-900">{entry.level}</p>
      </div>
      <div className="rounded bg-white p-2">
        <p className="text-xs text-gray-600">Racha</p>
        <p className="text-sm font-bold text-orange-600">{formatStreak(entry.streak)}</p>
      </div>
      <div className="rounded bg-white p-2">
        <p className="text-xs text-gray-600">Logros</p>
        <p className="text-sm font-bold text-yellow-600">
          <Trophy className="mr-1 inline h-3 w-3" />
          {entry.achievementCount}
        </p>
      </div>
    </div>
  </div>
);

/**
 * LeaderboardTable Component
 *
 * Displays leaderboard entries in a responsive table/card format.
 *
 * Features:
 * - Rank column with medals for top 3
 * - User column with avatar + username
 * - Total XP (formatted)
 * - Level
 * - Current Maya Rank with icon
 * - Streak (days with fire icon)
 * - Achievement count
 * - Highlight current user row
 * - Top 3 special styling (gold, silver, bronze backgrounds)
 * - Responsive: Table on desktop, cards on mobile
 * - Loading skeleton rows
 * - Sticky header
 * - Empty state
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  isLoading = false,
  className,
}) => {
  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className={cn('overflow-hidden rounded-lg border border-gray-200 bg-white', className)}>
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  XP Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rango
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Racha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Logros
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[...Array(10)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Loading */}
        <div className="p-4 md:hidden">
          <Loader className="mx-auto h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-white p-12 text-center', className)}>
        <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No hay datos de clasificación</h3>
        <p className="text-gray-600">Sé el primero en aparecer en esta tabla de clasificación.</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 bg-white', className)}>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                XP Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rango
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Racha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Logros
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {entries.map((entry) => {
              const isCurrentUser = currentUserId && entry.userId === currentUserId;
              const isTopThree = entry.rank <= 3;

              return (
                <tr
                  key={entry.userId}
                  className={cn(
                    'transition-colors hover:bg-gray-50',
                    isCurrentUser && 'bg-orange-50 hover:bg-orange-100',
                    isTopThree && 'bg-yellow-50 hover:bg-yellow-100',
                  )}
                >
                  {/* Rank */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">{getRankBadge(entry.rank)}</div>
                  </td>

                  {/* User */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar src={entry.avatar} alt={entry.username} name={entry.username} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs font-normal text-orange-600">(Tú)</span>
                          )}
                        </p>
                        {entry.firstName && entry.lastName && (
                          <p className="text-xs text-gray-500">
                            {entry.firstName} {entry.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total XP */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatXP(entry.totalXP)}
                    </span>
                  </td>

                  {/* Level */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm font-semibold text-blue-600">{entry.level}</span>
                  </td>

                  {/* Maya Rank */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        getRankColor(entry.currentRank),
                        'bg-opacity-10',
                      )}
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      {getRankLabel(entry.currentRank)}
                    </span>
                  </td>

                  {/* Streak */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm font-semibold text-orange-600">
                      {formatStreak(entry.streak)}
                    </span>
                  </td>

                  {/* Achievements */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center text-sm font-semibold text-yellow-600">
                      <Trophy className="mr-1 h-4 w-4" />
                      {entry.achievementCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="p-4 md:hidden">
        {entries.map((entry) => {
          const isCurrentUser = !!(currentUserId && entry.userId === currentUserId);
          return <MobileCard key={entry.userId} entry={entry} isCurrentUser={isCurrentUser} />;
        })}
      </div>
    </div>
  );
};

export default LeaderboardTable;
