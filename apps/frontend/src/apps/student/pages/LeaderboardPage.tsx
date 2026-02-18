import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';

// Leaderboard Components
import { LeaderboardTabs } from '@/features/gamification/social/components/Leaderboards/LeaderboardTabs';
import { SeasonSelector } from '@/features/gamification/social/components/Leaderboards/SeasonSelector';
import { LeaderboardLayout } from '@/features/gamification/social/components/Leaderboards/LeaderboardLayout';
import { UserPositionCard } from '../components/leaderboard/UserPositionCard';
import { LeaderboardStatsGrid } from '../components/leaderboard/LeaderboardStatsGrid';
import { CategoryBreakdownPanel } from '../components/leaderboard/CategoryBreakdownPanel';
import { FriendsMiniLeaderboard } from '../components/leaderboard/FriendsMiniLeaderboard';
import { LeaderboardTipsPanel } from '../components/leaderboard/LeaderboardTipsPanel';

// Layout
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';

// Hooks
import { useLeaderboards } from '@/features/gamification/social/hooks/useLeaderboards';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useUserClassroom } from '../hooks/useUserClassroom';
import { useDashboardData } from '../hooks/useDashboardData';

// Utils
import { cn } from '@shared/utils/cn';

export default function LeaderboardPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);
  const { classroomId: userClassroomId } = useUserClassroom(user?.id);
  const { progress, achievements } = useDashboardData();

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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const userEntryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLeaderboardType('global');
  }, [setLeaderboardType]);

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

  const handleTypeChange = (type: typeof selectedType) => {
    if (type === 'classroom' && !userClassroomId) return;
    setLeaderboardType(type, type === 'classroom' ? userClassroomId || undefined : undefined);
  };

  const userEntry = getUserEntry();
  const userPosition = getUserPosition();
  const pointsToNext =
    userEntry && userEntry.rank > 1
      ? currentLeaderboard.entries[userEntry.rank - 2]?.score - userEntry.score
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={logout}
      />

      {/* Filters Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-10 bg-white shadow-md"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 p-2">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-detective-text md:text-3xl">
                  Tabla de Clasificacion
                </h1>
                <p className="text-sm text-detective-text-secondary">
                  Ultima actualizacion:{' '}
                  {new Date(currentLeaderboard.lastUpdated).toLocaleTimeString()}
                </p>
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

          <div className="mb-4">
            <LeaderboardTabs
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              hasClassroom={!!userClassroomId}
            />
          </div>

          <SeasonSelector selectedPeriod={selectedPeriod} onPeriodChange={setTimePeriod} />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <main className="space-y-6 lg:col-span-3">
            {userEntry && (
              <UserPositionCard userEntry={userEntry} pointsToNext={pointsToNext} />
            )}

            <LeaderboardStatsGrid
              totalParticipants={currentLeaderboard.totalParticipants}
              userPosition={userPosition}
              userEntry={userEntry}
            />

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

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-detective-orange" />
                  <span className="ml-3 text-gray-600">Cargando clasificacion...</span>
                </div>
              )}

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

              {!loading && !leaderboardError && (
                <LeaderboardLayout
                  entries={currentLeaderboard.entries}
                  showTopThree={true}
                  highlightUser={true}
                />
              )}

              {userEntry && <div ref={userEntryRef} className="absolute -top-20" />}
            </motion.div>
          </main>

          {/* Side Panel */}
          <aside className="hidden space-y-6 lg:block">
            <CategoryBreakdownPanel progress={progress} achievements={achievements} />
            <FriendsMiniLeaderboard entries={currentLeaderboard.entries} />
            <LeaderboardTipsPanel />
          </aside>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}
