/**
 * LeaderboardPage - Complete Leaderboard Page for GLIT Platform
 *
 * Features:
 * - Multiple leaderboard types (Global, School, Grade, Friends)
 * - Time period selection (Daily, Weekly, Monthly, All-Time)
 * - Top 3 podium display
 * - Current user position highlight
 * - Real-time updates via WebSocket
 * - Responsive design with side panels
 * - Smooth animations
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Target,
  Users,
  Award,
  Zap,
  RefreshCw,
  ArrowUp,
  Sparkles,
  BarChart3,
} from 'lucide-react';

// Leaderboard Components
import { LeaderboardTabs } from '@/features/gamification/social/components/Leaderboards/LeaderboardTabs';
import { SeasonSelector } from '@/features/gamification/social/components/Leaderboards/SeasonSelector';
import { LeaderboardLayout } from '@/features/gamification/social/components/Leaderboards/LeaderboardLayout';

// Hooks & Types
import { useLeaderboards } from '@/features/gamification/social/hooks/useLeaderboards';
import { useLeaderboardWebSocket } from '@/features/gamification/social/hooks/useLeaderboardWebSocket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserClassroom } from '../hooks/useUserClassroom';

// Utils
import { cn } from '@shared/utils/cn';

export default function LeaderboardPage() {
  // Auth Store
  const { user } = useAuthStore();

  // Get user's primary classroom (type-safe approach)
  const { classroomId: userClassroomId } = useUserClassroom(user?.id);

  // Store & Hooks
  const {
    currentLeaderboard,
    selectedType,
    selectedPeriod,
    setLeaderboardType,
    setTimePeriod,
    refreshLeaderboard,
    getUserEntry,
    getUserPosition,
  } = useLeaderboards();

  // WebSocket connection for real-time updates
  const { isConnected: isWebSocketConnected } = useLeaderboardWebSocket();

  // Local State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showRealtimeIndicator, setShowRealtimeIndicator] = useState(false);
  const userEntryRef = useRef<HTMLDivElement>(null);

  // Show real-time indicator briefly when leaderboard updates
  useEffect(() => {
    if (isWebSocketConnected) {
      setShowRealtimeIndicator(true);
      const timer = setTimeout(() => setShowRealtimeIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentLeaderboard.lastUpdated, isWebSocketConnected]);

  // Auto-scroll to current user on load
  useEffect(() => {
    if (autoScrollEnabled && userEntryRef.current) {
      setTimeout(() => {
        userEntryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [currentLeaderboard, autoScrollEnabled]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshLeaderboard(selectedType === 'classroom' ? userClassroomId || undefined : undefined);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Handle leaderboard type change with classroom support
  const handleTypeChange = (type: typeof selectedType) => {
    if (type === 'classroom' && userClassroomId) {
      setLeaderboardType(type, userClassroomId);
    } else if (type === 'classroom' && !userClassroomId) {
      // Don't switch to classroom if user has no classroom
      console.warn('Cannot switch to classroom leaderboard: user has no classroom');
    } else {
      setLeaderboardType(type);
    }
  };

  const userEntry = getUserEntry();
  const userPosition = getUserPosition();

  // Calculate points to next position
  const pointsToNext =
    userEntry && userEntry.rank > 1
      ? currentLeaderboard.entries[userEntry.rank - 2]?.score - userEntry.score
      : 0;

  // Category breakdown stats (mock data - replace with real API)
  const categoryStats = [
    { category: 'Ejercicios', value: 45, color: 'bg-blue-500' },
    { category: 'Logros', value: 30, color: 'bg-purple-500' },
    { category: 'Bonos', value: 15, color: 'bg-green-500' },
    { category: 'Social', value: 10, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header con Filtros - Sticky */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white shadow-md dark:bg-gray-800"
      >
        <div className="container mx-auto px-4 py-4">
          {/* Title and Refresh */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 p-2">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-detective-text md:text-3xl">
                  Tabla de Clasificacion
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-detective-text-secondary">
                    Ultima actualizacion:{' '}
                    {new Date(currentLeaderboard.lastUpdated).toLocaleTimeString()}
                  </p>
                  {isWebSocketConnected && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">En vivo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time update indicator */}
            {showRealtimeIndicator && isWebSocketConnected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 dark:bg-green-900/30"
              >
                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Actualizado en tiempo real
                </span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 text-white transition-colors hover:bg-detective-orange-dark disabled:opacity-50"
            >
              <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
              <span className="hidden md:inline">Actualizar</span>
            </motion.button>
          </div>

          {/* Leaderboard Type Tabs */}
          <div className="mb-4">
            <LeaderboardTabs
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              hasClassroom={!!userClassroomId}
            />
          </div>

          {/* Time Period Selector */}
          <SeasonSelector selectedPeriod={selectedPeriod} onPeriodChange={setTimePeriod} />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Leaderboard - 3 columns on desktop */}
          <main className="space-y-6 lg:col-span-3">
            {/* Current User Position Card */}
            {userEntry && (
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

                {/* Progress bar to next position */}
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
            )}

            {/* Leaderboard Stats */}
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
                  {currentLeaderboard.totalParticipants.toLocaleString()}
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
                <div className="text-2xl font-bold text-detective-text">
                  {userPosition
                    ? Math.round((1 - userPosition / currentLeaderboard.totalParticipants) * 100)
                    : 0}
                  %
                </div>
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

            {/* Leaderboard Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-detective-text">
                  <Trophy className="h-6 w-6 text-detective-gold" />
                  Clasificacion{' '}
                  {selectedType === 'global'
                    ? 'Global'
                    : selectedType === 'school'
                      ? 'Escuela'
                      : selectedType === 'grade'
                        ? 'Grado'
                        : selectedType === 'classroom'
                          ? 'Mi Aula'
                          : 'Amigos'}
                </h2>
                <button
                  onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-sm font-semibold transition-colors',
                    autoScrollEnabled
                      ? 'bg-detective-orange text-white'
                      : 'bg-gray-200 text-gray-600',
                  )}
                >
                  Auto-scroll
                </button>
              </div>

              <LeaderboardLayout
                entries={currentLeaderboard.entries}
                showTopThree={true}
                highlightUser={true}
              />

              {/* User entry ref for scrolling */}
              {userEntry && <div ref={userEntryRef} className="absolute -top-20" />}
            </motion.div>
          </main>

          {/* Side Panel - Desktop only */}
          <aside className="hidden space-y-6 lg:block">
            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
                <BarChart3 className="h-5 w-5 text-detective-orange" />
                Desglose de Puntos
              </h3>
              <div className="space-y-4">
                {categoryStats.map((stat, index) => (
                  <motion.div
                    key={stat.category}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-detective-text">{stat.category}</span>
                      <span className="text-detective-text-secondary">{stat.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className={cn(stat.color, 'h-2 rounded-full')}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Friends Mini Leaderboard */}
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
                {currentLeaderboard.entries.slice(0, 5).map((entry, index) => (
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

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-bold text-detective-text">Tips para Subir</h3>
              </div>
              <ul className="space-y-2 text-sm text-detective-text-secondary">
                <li className="flex items-start gap-2">
                  <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Completa ejercicios diariamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Desbloquea logros para bonus</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Mantén rachas activas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                  <span>Participa en desafios sociales</span>
                </li>
              </ul>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
