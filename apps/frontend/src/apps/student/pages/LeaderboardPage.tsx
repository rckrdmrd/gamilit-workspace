/**
 * LeaderboardPage - Complete Leaderboard Page for GLIT Platform
 *
 * Features:
 * - Multiple leaderboard types (Global, School, Grade, Friends)
 * - Time period selection (Daily, Weekly, Monthly, All-Time)
 * - Top 3 podium display
 * - Current user position highlight
 * - Responsive design with side panels
 * - Smooth animations
 * - Auto-refresh polling (30s)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
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
  AlertCircle,
} from 'lucide-react';

// Leaderboard Components
import { LeaderboardTabs } from '@/features/gamification/social/components/Leaderboards/LeaderboardTabs';
import { SeasonSelector } from '@/features/gamification/social/components/Leaderboards/SeasonSelector';
import { LeaderboardLayout } from '@/features/gamification/social/components/Leaderboards/LeaderboardLayout';

// Layout Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';

// Hooks & Types
import { useLeaderboards } from '@/features/gamification/social/hooks/useLeaderboards';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useUserClassroom } from '../hooks/useUserClassroom';
import { useDashboardData } from '../hooks/useDashboardData';

// Utils
import { cn } from '@shared/utils/cn';

export default function LeaderboardPage() {
  // Auth Hook
  const { user, logout } = useAuth();

  // Gamification data for header
  const { gamificationData } = useUserGamification(user?.id);

  // Get user's primary classroom (type-safe approach)
  const { classroomId: userClassroomId } = useUserClassroom(user?.id);

  // Store & Hooks
  // FIX: CORR-005 - Agregado loading y error del hook para mostrar estados de carga
  const {
    currentLeaderboard,
    selectedType,
    selectedPeriod,
    loading,
    error: leaderboardError,
    setLeaderboardType,
    setTimePeriod,
    refreshLeaderboard,
    getUserEntry,
    getUserPosition,
  } = useLeaderboards();

  // Dashboard data for calculating category breakdown
  const { progress, achievements } = useDashboardData();

  // Local State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const userEntryRef = useRef<HTMLDivElement>(null);

  // Auto-fetch leaderboard on component mount
  // FIX: CORR-002 - El store inicia vacio, necesita llamada inicial para cargar datos
  useEffect(() => {
    setLeaderboardType('global');
  }, [setLeaderboardType]);

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

  // Category breakdown stats - calculated from real dashboard data
  const categoryStats = useMemo(() => {
    // Get counts from real data
    const exercisesCompleted = progress?.completedExercises || 0;
    const achievementsEarned = achievements?.filter(a => a.unlocked).length || 0;
    const modulesCompleted = progress?.completedModules || 0;
    const currentStreak = progress?.currentStreak || 0;

    // Calculate weighted contributions (approximate XP contribution)
    // Each exercise gives ~50 XP, each achievement ~100 XP, each module ~200 XP, streaks ~10 XP/day
    const exerciseContribution = exercisesCompleted * 50;
    const achievementContribution = achievementsEarned * 100;
    const moduleContribution = modulesCompleted * 200;
    const streakContribution = currentStreak * 10;

    // Total contribution
    const total = exerciseContribution + achievementContribution + moduleContribution + streakContribution;

    // Calculate percentages (handle zero case)
    if (total === 0) {
      return [
        { category: 'Ejercicios', value: 0, color: 'bg-blue-500' },
        { category: 'Logros', value: 0, color: 'bg-purple-500' },
        { category: 'Módulos', value: 0, color: 'bg-green-500' },
        { category: 'Rachas', value: 0, color: 'bg-orange-500' },
      ];
    }

    return [
      { category: 'Ejercicios', value: Math.round((exerciseContribution / total) * 100), color: 'bg-blue-500' },
      { category: 'Logros', value: Math.round((achievementContribution / total) * 100), color: 'bg-purple-500' },
      { category: 'Módulos', value: Math.round((moduleContribution / total) * 100), color: 'bg-green-500' },
      { category: 'Rachas', value: Math.round((streakContribution / total) * 100), color: 'bg-orange-500' },
    ];
  }, [progress, achievements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Global Header */}
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={logout}
      />

      {/* Filters Section - Sticky below header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-10 bg-white shadow-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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
                </div>
              </div>
            </div>

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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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

              {/* FIX: CORR-005 - Indicador de loading mientras se cargan datos */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-detective-orange" />
                  <span className="ml-3 text-gray-600">Cargando clasificacion...</span>
                </div>
              )}

              {/* Error state */}
              {!loading && leaderboardError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                  <p className="text-gray-600">{leaderboardError}</p>
                  <button
                    onClick={() => refreshLeaderboard()}
                    className="mt-4 rounded-lg bg-detective-orange px-4 py-2 text-white hover:bg-detective-orange/90"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Leaderboard content */}
              {!loading && !leaderboardError && (
                <LeaderboardLayout
                  entries={currentLeaderboard.entries}
                  showTopThree={true}
                  highlightUser={true}
                />
              )}

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

      {/* Bottom Spacing */}
      <div className="h-16" />
    </div>
  );
}
