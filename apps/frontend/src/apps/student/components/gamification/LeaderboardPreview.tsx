/**
 * LeaderboardPreview Component
 *
 * Preview of user's leaderboard position with top 3 and quick filters.
 *
 * @updated 2026-01-08 - CORR-006: Removed hardcoded mockTop3, now receives topThree as prop
 *                       or fetches from useLeaderboards hook for real data integration.
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Users,
  Globe,
  School,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LeaderboardPosition } from '../../hooks/useGamificationData';
import { useLeaderboards } from '@/features/gamification/social/hooks/useLeaderboards';

/**
 * Top 3 entry structure for the podium display
 */
interface TopThreeEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  rankBadge: string;
}

interface LeaderboardPreviewProps {
  position: LeaderboardPosition | null;
  /** Optional: Pre-fetched top 3 entries. If not provided, will use useLeaderboards hook */
  topThree?: TopThreeEntry[];
}

type LeaderboardFilter = 'global' | 'school' | 'grade' | 'friends';

export function LeaderboardPreview({ position, topThree: propTopThree }: LeaderboardPreviewProps) {
  // Use leaderboards hook for real data if topThree prop is not provided
  const { currentLeaderboard, loading: leaderboardLoading } = useLeaderboards();

  // Derive top 3 from store if not provided as prop
  const topThree = useMemo(() => {
    // If prop is provided, use it
    if (propTopThree && propTopThree.length > 0) {
      return propTopThree;
    }

    // Otherwise, derive from currentLeaderboard entries
    if (currentLeaderboard.entries && currentLeaderboard.entries.length > 0) {
      return currentLeaderboard.entries.slice(0, 3).map((entry) => ({
        rank: entry.rank,
        username: entry.username,
        avatar: entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=f97316&color=fff`,
        score: entry.score,
        rankBadge: entry.rankBadge || 'Ajaw',
      }));
    }

    // Return empty array if no data available
    return [];
  }, [propTopThree, currentLeaderboard.entries]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<LeaderboardFilter>('global');

  const filters: { id: LeaderboardFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
    { id: 'school', label: 'Escuela', icon: <School className="h-4 w-4" /> },
    { id: 'grade', label: 'Grado', icon: <Users className="h-4 w-4" /> },
    { id: 'friends', label: 'Amigos', icon: <UserPlus className="h-4 w-4" /> },
  ];

  if (!position) {
    return (
      <div className="py-12 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-detective-text-secondary" />
        <p className="text-detective-text-secondary">No hay datos de clasificación disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Trophy className="h-7 w-7 text-blue-600" />
          Dónde Te Encuentras
        </h2>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-detective-text-secondary hover:border-blue-600'
              }`}
            >
              {f.icon}
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* User Position Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 p-6 shadow-lg"
      >
        <div className="flex items-center gap-6">
          {/* Position Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
            className="relative"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">#{position.position}</div>
                <div className="text-xs text-white/80">Posición</div>
              </div>
            </div>

            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500 opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
            />
          </motion.div>

          {/* Stats */}
          <div className="flex-1">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-2 text-2xl font-bold text-detective-text"
            >
              {position.entry.username}
            </motion.h3>

            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="mb-1 text-xs text-detective-text-secondary">Puntos</div>
                <div className="text-xl font-bold text-detective-text">
                  {position.entry.score.toLocaleString()}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="mb-1 text-xs text-detective-text-secondary">Top</div>
                <div className="text-xl font-bold text-blue-600">
                  {position.percentile.toFixed(1)}%
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="mb-1 text-xs text-detective-text-secondary">Cambio</div>
                <div className="flex items-center gap-1">
                  {position.entry.changeType === 'up' && (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  )}
                  {position.entry.changeType === 'down' && (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  {position.entry.changeType === 'same' && (
                    <Minus className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={`text-xl font-bold ${
                      position.entry.changeType === 'up'
                        ? 'text-green-600'
                        : position.entry.changeType === 'down'
                          ? 'text-red-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {Math.abs(position.entry.change) > 0 ? Math.abs(position.entry.change) : '-'}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
      >
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-detective-text">
          <Sparkles className="h-5 w-5 text-detective-gold" />
          Top 3 Líderes
          {leaderboardLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-detective-text-secondary" />
          )}
        </h3>

        {/* Empty State */}
        {topThree.length === 0 && !leaderboardLoading && (
          <div className="py-8 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-detective-text-secondary" />
            <p className="text-sm text-detective-text-secondary">
              No hay datos de clasificación disponibles
            </p>
          </div>
        )}

        {/* Loading State */}
        {leaderboardLoading && topThree.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Podium Display - Only show if we have data */}
        {topThree.length >= 3 && (
        <div className="mb-6 flex items-end justify-center gap-4">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col items-center"
          >
            <img
              src={topThree[1].avatar}
              alt={topThree[1].username}
              className="mb-2 h-16 w-16 rounded-full border-4 border-gray-300"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].username)}&background=c0c0c0&color=000`;
              }}
            />
            <div className="flex h-24 w-20 flex-col items-center justify-center rounded-t-lg bg-gradient-to-t from-gray-300 to-gray-400 text-white shadow-lg">
              <Medal className="mb-1 h-8 w-8" />
              <span className="text-2xl font-bold">2</span>
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-detective-text">
              {topThree[1].username.split(' ')[0]}
            </p>
            <p className="text-xs text-detective-text-secondary">
              {topThree[1].score.toLocaleString()}
            </p>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
            >
              <img
                src={topThree[0].avatar}
                alt={topThree[0].username}
                className="mb-2 h-20 w-20 rounded-full border-4 border-yellow-400"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].username)}&background=fbbf24&color=fff`;
                }}
              />
            </motion.div>
            <div className="flex h-32 w-24 flex-col items-center justify-center rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-500 text-white shadow-xl">
              <Trophy className="mb-1 h-10 w-10" />
              <span className="text-3xl font-bold">1</span>
            </div>
            <p className="mt-2 text-center text-sm font-bold text-detective-text">
              {topThree[0].username.split(' ')[0]}
            </p>
            <p className="text-xs text-detective-text-secondary">
              {topThree[0].score.toLocaleString()}
            </p>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col items-center"
          >
            <img
              src={topThree[2].avatar}
              alt={topThree[2].username}
              className="mb-2 h-16 w-16 rounded-full border-4 border-orange-400"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].username)}&background=cd7f32&color=fff`;
              }}
            />
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-t-lg bg-gradient-to-t from-orange-400 to-orange-500 text-white shadow-lg">
              <Award className="mb-1 h-8 w-8" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-detective-text">
              {topThree[2].username.split(' ')[0]}
            </p>
            <p className="text-xs text-detective-text-secondary">
              {topThree[2].score.toLocaleString()}
            </p>
          </motion.div>
        </div>
        )}
      </motion.div>

      {/* View Full Leaderboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Trophy className="h-5 w-5" />
          Ver Clasificación Completa
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
