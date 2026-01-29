/**
 * LiveLeaderboard Component
 *
 * Complete leaderboard with real-time updates and 4 leaderboard types:
 * - XP: Total experience points ranking (API: getXPLeaderboard)
 * - Completion: Completion percentage ranking (API: getGlobalLeaderboard fallback)
 * - Streak: Consecutive days streak ranking (API: getStreaksLeaderboard)
 * - Detective: Overall detective ranking (API: getGlobalLeaderboard)
 *
 * Features:
 * - Header with type selector tabs
 * - UserRankCard showing current user position (highlighted)
 * - Table with 15-20 entries per page
 * - Rank position with special icons for top 3 (Crown, Medal, Trophy)
 * - Avatar, username, score, streak display
 * - Animated entry with stagger effect
 * - Real-time auto-refresh every 30 seconds
 * - Responsive design
 * - Empty states and loading states
 * - Mock data fallback when API fails or returns empty
 *
 * @example
 * <LiveLeaderboard userId="user-123" initialType="xp" />
 *
 * @updated CORR-006 (2026-01-08): Now integrated with real backend APIs.
 *          Uses mock data as fallback when API fails or returns empty.
 *          Shows visual indicator when in mock/demo mode.
 *
 * API Integration:
 *   - 'xp' -> socialAPI.getXPLeaderboard()
 *   - 'streak' -> socialAPI.getStreaksLeaderboard()
 *   - 'detective' -> socialAPI.getGlobalLeaderboard()
 *   - 'completion' -> socialAPI.getGlobalLeaderboard() (fallback)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Medal,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Flame,
  Target,
  Zap,
  Award,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';

// Import real APIs - CORR-006: Integration with backend
import {
  getXPLeaderboard,
  getStreaksLeaderboard,
  getGlobalLeaderboard,
} from '../social/api/socialAPI';
import { useAuthStore } from '@/features/auth/store/authStore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LeaderboardTypeVariant = 'xp' | 'completion' | 'streak' | 'detective';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  rankBadge: string;
  score: number;
  xp: number;
  completionPercentage: number;
  streak: number;
  mlCoins: number;
  change: number;
  changeType: 'up' | 'down' | 'same' | 'new';
  isCurrentUser: boolean;
}

export interface LiveLeaderboardProps {
  userId: string;
  initialType?: LeaderboardTypeVariant;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  itemsPerPage?: number;
  onUserClick?: (userId: string) => void;
  className?: string;
}

interface TabConfig {
  type: LeaderboardTypeVariant;
  label: string;
  icon: React.ElementType;
  description: string;
  sortKey: keyof LeaderboardEntry;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const TABS: TabConfig[] = [
  {
    type: 'xp',
    label: 'XP Total',
    icon: Zap,
    description: 'Clasificación por experiencia acumulada',
    sortKey: 'xp',
  },
  {
    type: 'completion',
    label: 'Completado',
    icon: BarChart3,
    description: 'Clasificación por porcentaje completado',
    sortKey: 'completionPercentage',
  },
  {
    type: 'streak',
    label: 'Racha',
    icon: Flame,
    description: 'Clasificación por días consecutivos',
    sortKey: 'streak',
  },
  {
    type: 'detective',
    label: 'Detective',
    icon: Target,
    description: 'Ranking general de detectives',
    sortKey: 'score',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getRankIcon = (rank: number): React.ElementType | null => {
  if (rank === 1) return Crown;
  if (rank === 2) return Medal;
  if (rank === 3) return Trophy;
  return null;
};

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'from-yellow-400 to-yellow-600';
  if (rank === 2) return 'from-gray-300 to-gray-500';
  if (rank === 3) return 'from-orange-400 to-orange-600';
  return 'from-detective-blue to-detective-orange';
};

const getScoreForType = (entry: LeaderboardEntry, type: LeaderboardTypeVariant): number => {
  switch (type) {
    case 'xp':
      return entry.xp;
    case 'completion':
      return entry.completionPercentage;
    case 'streak':
      return entry.streak;
    case 'detective':
    default:
      return entry.score;
  }
};

const formatScoreForType = (score: number, type: LeaderboardTypeVariant): string => {
  switch (type) {
    case 'xp':
      return `${score.toLocaleString()} XP`;
    case 'completion':
      return `${score.toFixed(1)}%`;
    case 'streak':
      return `${score} días`;
    case 'detective':
    default:
      return score.toLocaleString();
  }
};

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================
// @warning CORR-006: This function generates FAKE data for demo/storybook purposes.
// For production, integrate with real APIs from socialAPI.ts:
// - getXPLeaderboard(), getStreaksLeaderboard(), getGlobalLeaderboard()

const generateMockLeaderboardData = (
  currentUserId: string,
  type: LeaderboardTypeVariant,
): LeaderboardEntry[] => {
  const firstNames = [
    'Ana',
    'Carlos',
    'María',
    'Luis',
    'Sofia',
    'Diego',
    'Valentina',
    'Miguel',
    'Isabella',
    'Javier',
    'Camila',
    'Pablo',
    'Lucía',
    'Andrés',
    'Elena',
    'Fernando',
    'Daniela',
    'Ricardo',
    'Gabriela',
    'Sebastián',
  ];
  const lastNames = [
    'García',
    'Rodríguez',
    'Martínez',
    'López',
    'González',
    'Pérez',
    'Sánchez',
    'Ramírez',
    'Torres',
    'Flores',
    'Rivera',
    'Gómez',
    'Díaz',
    'Cruz',
    'Morales',
    'Jiménez',
    'Hernández',
    'Vargas',
    'Castro',
    'Ruiz',
  ];
  const ranks = ['Nacom', 'Ajaw', "Ah K'in", 'Halach Uinic', "K'uk'ulkan"];

  const entries: LeaderboardEntry[] = [];
  const totalEntries = 20;
  const userRank = Math.floor(Math.random() * 15) + 5; // User ranks between 5-20

  for (let i = 0; i < totalEntries; i++) {
    const rank = i + 1;
    const isCurrentUser = rank === userRank;

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = isCurrentUser ? 'Tú' : `${firstName} ${lastName}`;

    // Generate scores based on rank and type
    let xp, completionPercentage, streak, score;

    switch (type) {
      case 'xp':
        xp = 15000 - rank * 200 + Math.floor(Math.random() * 100);
        score = xp;
        completionPercentage = 60 + Math.random() * 30;
        streak = Math.floor(Math.random() * 30) + 1;
        break;
      case 'completion':
        completionPercentage = 100 - rank * 2 + Math.random() * 2;
        score = Math.floor(completionPercentage * 100);
        xp = Math.floor(Math.random() * 10000) + 5000;
        streak = Math.floor(Math.random() * 30) + 1;
        break;
      case 'streak':
        streak = 50 - rank + Math.floor(Math.random() * 3);
        score = streak * 100;
        xp = Math.floor(Math.random() * 10000) + 5000;
        completionPercentage = 60 + Math.random() * 30;
        break;
      case 'detective':
      default:
        score = 10000 - rank * 150 + Math.floor(Math.random() * 100);
        xp = score * 1.5;
        completionPercentage = 60 + Math.random() * 30;
        streak = Math.floor(Math.random() * 30) + 1;
        break;
    }

    const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
    let changeType: 'up' | 'down' | 'same' | 'new';

    if (rank <= 3 && Math.random() > 0.7) {
      changeType = 'new';
    } else if (change > 0) {
      changeType = 'up';
    } else if (change < 0) {
      changeType = 'down';
    } else {
      changeType = 'same';
    }

    entries.push({
      rank,
      userId: isCurrentUser ? currentUserId : `user-${rank}`,
      username,
      avatar: `/avatars/avatar-${rank % 10}.png`,
      rankBadge: ranks[Math.floor((rank - 1) / 4) % ranks.length],
      score,
      xp,
      completionPercentage,
      streak,
      mlCoins: Math.floor(score * 0.5),
      change,
      changeType,
      isCurrentUser,
    });
  }

  return entries;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * TypeSelector - Tab selector for leaderboard types
 */
interface TypeSelectorProps {
  selectedType: LeaderboardTypeVariant;
  onTypeChange: (type: LeaderboardTypeVariant) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="scrollbar-thin scrollbar-thumb-detective-orange scrollbar-track-gray-200 flex gap-2 overflow-x-auto pb-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedType === tab.type;

        return (
          <motion.button
            key={tab.type}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTypeChange(tab.type)}
            className={cn(
              'group relative flex min-w-fit items-center gap-2 whitespace-nowrap rounded-lg px-5 py-3 font-semibold transition-all',
              isActive
                ? 'bg-gradient-to-r from-detective-orange to-pink-500 text-white shadow-lg shadow-orange-500/50'
                : 'bg-white text-detective-text shadow-md hover:bg-detective-bg hover:shadow-lg',
            )}
          >
            <motion.div
              animate={
                isActive
                  ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-white' : 'text-detective-orange',
                )}
              />
            </motion.div>

            <span>{tab.label}</span>

            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg border-2 border-white/50"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

/**
 * UserRankCard - Highlighted card showing user's current position
 */
interface UserRankCardProps {
  userEntry: LeaderboardEntry;
  type: LeaderboardTypeVariant;
}

const UserRankCard: React.FC<UserRankCardProps> = ({ userEntry, type }) => {
  const gradient = getRankColor(userEntry.rank);
  const Icon = getRankIcon(userEntry.rank) || Award;
  const score = getScoreForType(userEntry, type);
  const formattedScore = formatScoreForType(score, type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl shadow-2xl"
    >
      {/* Gradient Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-r', gradient)} />

      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '20px 20px'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between">
          {/* Left Side: User Info */}
          <div className="flex items-center gap-4">
            {/* Rank Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="rounded-full bg-white/20 p-3 backdrop-blur-sm"
            >
              <Icon className="h-8 w-8" />
            </motion.div>

            {/* Avatar */}
            <div className="relative">
              <motion.img
                src={userEntry.avatar}
                alt={userEntry.username}
                className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userEntry.username)}&background=8b5cf6&color=fff`;
                }}
                whileHover={{ scale: 1.05 }}
              />

              {/* Rank Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg"
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    userEntry.rank <= 3 ? 'text-yellow-500' : 'text-purple-600',
                  )}
                >
                  #{userEntry.rank}
                </span>
              </motion.div>
            </div>

            {/* User Details */}
            <div>
              <h3 className="mb-1 text-xl font-bold">Tu Posición</h3>
              <p className="text-sm opacity-90">{userEntry.rankBadge}</p>
            </div>
          </div>

          {/* Right Side: Score */}
          <div className="text-right">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
              className="mb-1 text-4xl font-bold"
            >
              {formattedScore}
            </motion.div>

            {/* Rank Change */}
            {userEntry.change !== 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  'flex items-center justify-end gap-1 rounded-full px-3 py-1 text-sm font-semibold',
                  userEntry.changeType === 'up' ? 'bg-green-500/20' : 'bg-red-500/20',
                )}
              >
                {userEntry.changeType === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {userEntry.changeType === 'up' ? '+' : '-'}
                  {Math.abs(userEntry.change)}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg bg-white/10 p-3 text-center backdrop-blur-sm"
          >
            <div className="mb-1 text-xl font-bold">{userEntry.xp.toLocaleString()}</div>
            <div className="text-xs opacity-75">XP</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg bg-white/10 p-3 text-center backdrop-blur-sm"
          >
            <div className="mb-1 text-xl font-bold">
              {userEntry.completionPercentage.toFixed(0)}%
            </div>
            <div className="text-xs opacity-75">Completado</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg bg-white/10 p-3 text-center backdrop-blur-sm"
          >
            <div className="mb-1 flex items-center justify-center gap-1 text-xl font-bold">
              <Flame className="h-5 w-5" />
              {userEntry.streak}
            </div>
            <div className="text-xs opacity-75">Racha</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * LeaderboardEntryRow - Single row in the leaderboard table
 */
interface LeaderboardEntryRowProps {
  entry: LeaderboardEntry;
  type: LeaderboardTypeVariant;
  index: number;
  onUserClick?: (userId: string) => void;
}

const LeaderboardEntryRow: React.FC<LeaderboardEntryRowProps> = ({
  entry,
  type,
  index,
  onUserClick,
}) => {
  const RankIcon = getRankIcon(entry.rank);
  const isTopThree = entry.rank <= 3;
  const score = getScoreForType(entry, type);
  const formattedScore = formatScoreForType(score, type);
  const rankColor = getRankColor(entry.rank);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => onUserClick?.(entry.userId)}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all',
        entry.isCurrentUser
          ? 'border-2 border-detective-orange bg-detective-orange bg-opacity-10 shadow-lg'
          : 'bg-white hover:scale-[1.01] hover:shadow-md',
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-bold text-white',
          isTopThree ? `bg-gradient-to-br ${rankColor}` : 'bg-detective-blue',
        )}
      >
        {isTopThree && RankIcon ? (
          <RankIcon className="h-7 w-7" />
        ) : (
          <span className="text-lg">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <motion.img
        src={entry.avatar}
        alt={entry.username}
        className="h-12 w-12 shrink-0 rounded-full border-2 border-gray-200 object-cover"
        whileHover={{ scale: 1.1 }}
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=f97316&color=fff`;
        }}
      />

      {/* User Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'truncate font-semibold',
              entry.isCurrentUser ? 'text-detective-orange' : 'text-detective-text',
            )}
          >
            {entry.username}
          </p>
          {entry.isCurrentUser && (
            <span className="shrink-0 rounded-full bg-detective-orange px-2 py-0.5 text-xs text-white">
              Tú
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-detective-text-secondary">{entry.rankBadge}</p>
          {type === 'streak' && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold">{entry.streak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'text-lg font-bold',
            entry.isCurrentUser ? 'text-detective-orange' : 'text-detective-text',
          )}
        >
          {formattedScore}
        </p>

        {/* Change Indicator */}
        <div className="mt-1 flex items-center justify-end gap-1">
          {entry.changeType === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {entry.changeType === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {entry.changeType === 'same' && <Minus className="h-4 w-4 text-gray-400" />}
          {entry.changeType === 'new' && <Sparkles className="h-4 w-4 text-detective-gold" />}
          <span
            className={cn(
              'text-sm font-medium',
              entry.changeType === 'up'
                ? 'text-green-500'
                : entry.changeType === 'down'
                  ? 'text-red-500'
                  : 'text-gray-400',
            )}
          >
            {Math.abs(entry.change) > 0 ? Math.abs(entry.change) : '-'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  userId,
  initialType = 'detective',
  autoRefresh = true,
  refreshInterval = 30000,
  itemsPerPage = 20,
  onUserClick,
  className,
}) => {
  const [selectedType, setSelectedType] = useState<LeaderboardTypeVariant>(initialType);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // CORR-006: State for tracking API vs Mock mode
  const [useMockData, setUseMockData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Get current user ID from auth store for isCurrentUser marking
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Fetch leaderboard data - CORR-006: Now uses real APIs with mock fallback
  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      let apiData: Record<string, unknown>[] = [];

      // Call appropriate API based on selectedType
      switch (selectedType) {
        case 'xp':
          apiData = await getXPLeaderboard(20);
          break;
        case 'streak':
          apiData = await getStreaksLeaderboard(20);
          break;
        case 'detective':
        case 'completion': // Use global as fallback for completion
          apiData = await getGlobalLeaderboard(20);
          break;
        default:
          apiData = await getGlobalLeaderboard(20);
      }

      // Transform API response to LeaderboardEntry format
      if (apiData && apiData.length > 0) {
        const transformedData: LeaderboardEntry[] = apiData.map((entry: Record<string, unknown>, index: number) => {
          const entryUserId = (entry.userId as string) || (entry.user_id as string) || `user-${index}`;
          return {
            rank: (entry.rank as number) || index + 1,
            userId: entryUserId,
            username: (entry.username as string) || (entry.display_name as string) || (entry.full_name as string) || 'Usuario',
            avatar: (entry.avatar as string) || (entry.avatar_url as string) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent((entry.username as string) || 'U')}&background=f97316&color=fff`,
            rankBadge: (entry.currentRank as string) || (entry.current_rank as string) || (entry.maya_rank as string) || 'Ajaw',
            score: (entry.totalXP as number) || (entry.total_xp as number) || (entry.score as number) || 0,
            xp: (entry.totalXP as number) || (entry.total_xp as number) || 0,
            completionPercentage: (entry.completion_percentage as number) || 0,
            streak: (entry.current_streak as number) || (entry.streak as number) || 0,
            mlCoins: (entry.ml_coins as number) || 0,
            change: 0,
            changeType: 'same' as const,
            isCurrentUser: currentUserId ? entryUserId === currentUserId : entryUserId === userId,
          };
        });

        setEntries(transformedData);
        setUseMockData(false);
      } else {
        // Fallback to mock data if API returns empty
        console.warn('[LiveLeaderboard] API returned empty data, using mock');
        const mockData = generateMockLeaderboardData(userId, selectedType);
        setEntries(mockData);
        setUseMockData(true);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('[LiveLeaderboard] API error, falling back to mock:', error);
      setApiError(error instanceof Error ? error.message : 'Error de conexión');

      // Fallback to mock data on error
      const mockData = generateMockLeaderboardData(userId, selectedType);
      setEntries(mockData);
      setUseMockData(true);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, selectedType, currentUserId]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Auto-refresh
  useEffect(() => {
    fetchLeaderboardData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLeaderboardData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchLeaderboardData, autoRefresh, refreshInterval]);

  // Handle type change
  const handleTypeChange = (type: LeaderboardTypeVariant) => {
    setSelectedType(type);
  };

  // Get user entry
  const userEntry = entries.find((e) => e.isCurrentUser);

  // Get visible entries (limit to itemsPerPage)
  const visibleEntries = entries.slice(0, itemsPerPage);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-detective-text">Tabla de Clasificación</h2>
          <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
            <Clock className="h-4 w-4" />
            <span>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-detective-orange-dark disabled:opacity-50"
        >
          <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
          <span>Actualizar</span>
        </motion.button>
      </div>

      {/* CORR-006: Mock Data Warning Banner */}
      {useMockData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm"
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <span className="font-medium text-amber-800">Modo Demo</span>
            <span className="text-amber-700">
              {apiError
                ? ` — ${apiError}. Mostrando datos de demostración.`
                : ' — La API no retornó datos. Mostrando datos de demostración.'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Type Selector */}
      <TypeSelector selectedType={selectedType} onTypeChange={handleTypeChange} />

      {/* Loading State */}
      {loading && entries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-detective-orange border-t-transparent"
          />
          <p className="text-detective-text-secondary">Cargando clasificación...</p>
        </div>
      ) : (
        <>
          {/* User Rank Card */}
          {userEntry && <UserRankCard userEntry={userEntry} type={selectedType} />}

          {/* Leaderboard Table */}
          <div className="rounded-xl bg-detective-bg p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-detective-text">
                <Users className="h-6 w-6 text-detective-orange" />
                Top {itemsPerPage}
              </h3>
              <div className="text-sm text-detective-text-secondary">
                {entries.length} participantes
              </div>
            </div>

            {/* Entries */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleEntries.map((entry, index) => (
                  <LeaderboardEntryRow
                    key={entry.userId}
                    entry={entry}
                    type={selectedType}
                    index={index}
                    onUserClick={onUserClick}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {entries.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <Trophy className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
                <h3 className="mb-2 text-xl font-bold text-detective-text">
                  No hay datos disponibles
                </h3>
                <p className="text-detective-text-secondary">
                  Aún no hay clasificaciones para este período
                </p>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-detective-text-secondary"
      >
        <p>
          Las clasificaciones se actualizan automáticamente cada {refreshInterval / 1000} segundos
        </p>
      </motion.div>
    </div>
  );
};

export default LiveLeaderboard;
