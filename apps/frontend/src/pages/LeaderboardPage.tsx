/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, AlertCircle, Crown } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { GamifiedHeader } from '@/shared/components/layout/GamifiedHeader';
import { LeaderboardTable } from '@/shared/components/LeaderboardTable';
import { LeaderboardTabs } from '@/shared/components/LeaderboardTabs';
import { gamificationApi } from '@/lib/api/gamification.api';
import { formatXP, formatRank } from '@/shared/utils/format.util';
import { cn } from '@shared/utils';
import type { LeaderboardType, LeaderboardResponse } from '@/shared/types/leaderboard.types';
import { MayaRank } from '@/shared/constants/ranks.constants';

/**
 * Get rank label - Updated to use official Maya Ranks
 * @see ET-GAM-003-rangos-maya.md
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
 * Get rank color - Updated to use official Maya Ranks
 */
const getRankColor = (rank: MayaRank): string => {
  const colors: Record<MayaRank, string> = {
    [MayaRank.AJAW]: 'text-brown-600 bg-brown-100',
    [MayaRank.NACOM]: 'text-bronze-600 bg-bronze-100',
    [MayaRank.AH_KIN]: 'text-silver-600 bg-silver-100',
    [MayaRank.HALACH_UINIC]: 'text-yellow-600 bg-yellow-100',
    [MayaRank.KUKULKAN]: 'text-purple-600 bg-purple-100',
  };
  return colors[rank] || 'text-gray-600 bg-gray-100';
};

/**
 * LeaderboardPage Component
 *
 * Main leaderboard page with tabs for different leaderboard types.
 *
 * Features:
 * - Tab navigation: Global, School, Classroom
 * - Current user rank card at top
 * - Leaderboard table with all entries
 * - Refresh button to reload data
 * - Loading states
 * - Error handling with retry
 * - Empty states
 * - Responsive layout
 * - Highlight current user in table
 * - Auto-fetch on tab change
 *
 * TODO (Future Features):
 * - Time period filters (This Week, This Month, Today)
 * - Pagination or infinite scroll for large leaderboards
 * - Load more button
 * - Classroom/school selection if user is in multiple
 */
export const LeaderboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Limit for entries
  const LIMIT = 100;

  /**
   * Get user's school ID from user profile
   * TODO: When useUserClassroom hook is created, use it instead
   */
  const userSchoolId = (user as any)?.schoolId || null;

  /**
   * Get user's classroom ID from user profile
   * TODO: When useUserClassroom hook is created, use it instead
   */
  const userClassroomId = (user as any)?.classroomId || null;

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboard = async (tab: LeaderboardType, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      let data: LeaderboardResponse;

      switch (tab) {
        case 'global':
          data = await gamificationApi.getGlobalLeaderboard(LIMIT);
          break;
        case 'school':
          if (!userSchoolId) {
            throw new Error('No school ID available');
          }
          data = await gamificationApi.getSchoolLeaderboard(userSchoolId, LIMIT);
          break;
        case 'classroom':
          if (!userClassroomId) {
            throw new Error('No classroom ID available');
          }
          data = await gamificationApi.getClassroomLeaderboard(userClassroomId, LIMIT);
          break;
        default:
          throw new Error(`Unknown leaderboard type: ${tab}`);
      }

      setLeaderboardData(data);
    } catch (err: unknown) {
      console.error('Failed to load leaderboard:', err);
      setError(err.message || 'Error al cargar la clasificación. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Load leaderboard on mount and tab change
   */
  useEffect(() => {
    fetchLeaderboard(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: LeaderboardType) => {
    setActiveTab(tab);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchLeaderboard(activeTab, true);
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    fetchLeaderboard(activeTab);
  };

  /**
   * Get current user entry from leaderboard
   */
  const currentUserEntry =
    leaderboardData?.currentUserEntry ||
    leaderboardData?.entries.find((entry) => entry.userId === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader user={user ?? undefined} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center text-3xl font-bold text-gray-900">
                <Trophy className="mr-3 h-8 w-8 text-yellow-600" />
                Clasificación
              </h1>
              <p className="mt-2 text-gray-600">
                Compite con otros estudiantes y sube en la clasificación.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'rounded-lg border border-gray-300 bg-white px-4 py-2',
                'transition-colors hover:bg-gray-50',
                'flex items-center space-x-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Current User Rank Card */}
        {!isLoading && currentUserEntry && (
          <div className="mb-6 rounded-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-purple-50 p-6">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Crown className="mr-2 h-5 w-5 text-orange-600" />
              Tu Posición
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Rank */}
              <div className="rounded-lg bg-white p-4">
                <p className="mb-1 text-sm text-gray-600">Rango</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatRank(currentUserEntry.rank)}
                </p>
              </div>

              {/* Total XP */}
              <div className="rounded-lg bg-white p-4">
                <p className="mb-1 text-sm text-gray-600">XP Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatXP(currentUserEntry.totalXP)}
                </p>
              </div>

              {/* Level */}
              <div className="rounded-lg bg-white p-4">
                <p className="mb-1 text-sm text-gray-600">Nivel</p>
                <p className="text-2xl font-bold text-blue-600">{currentUserEntry.level}</p>
              </div>

              {/* Maya Rank */}
              <div className="rounded-lg bg-white p-4">
                <p className="mb-1 text-sm text-gray-600">Rango Maya</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                    getRankColor(currentUserEntry.currentRank),
                  )}
                >
                  <Crown className="mr-1 h-4 w-4" />
                  {getRankLabel(currentUserEntry.currentRank)}
                </span>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">
                {currentUserEntry.rank === 1 && '🎉 ¡Eres el número 1! ¡Sigue así!'}
                {currentUserEntry.rank === 2 && '🥈 ¡Casi llegas al primer lugar! ¡No te rindas!'}
                {currentUserEntry.rank === 3 && '🥉 ¡Excelente trabajo! ¡Sigue subiendo!'}
                {currentUserEntry.rank > 3 &&
                  currentUserEntry.rank <= 10 &&
                  '🔥 ¡Estás en el top 10! ¡Sigue adelante!'}
                {currentUserEntry.rank > 10 &&
                  '💪 ¡Sigue aprendiendo para subir en la clasificación!'}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <LeaderboardTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={{
              global: leaderboardData?.type === 'global' ? leaderboardData.totalEntries : undefined,
              school: leaderboardData?.type === 'school' ? leaderboardData.totalEntries : undefined,
              classroom:
                leaderboardData?.type === 'classroom' ? leaderboardData.totalEntries : undefined,
            }}
          />
        </div>

        {/* Tab Panel Info (optional) */}
        {!isLoading && leaderboardData && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {leaderboardData.entries.length} de {leaderboardData.totalEntries} usuarios
            {leaderboardData.lastUpdated && (
              <span className="ml-2">
                • Actualizado: {new Date(leaderboardData.lastUpdated).toLocaleString('es-MX')}
              </span>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <LeaderboardTable
          entries={leaderboardData?.entries || []}
          currentUserId={user?.id}
          isLoading={isLoading}
        />

        {/* Load More Button (TODO: Future feature) */}
        {!isLoading &&
          leaderboardData &&
          leaderboardData.entries.length < leaderboardData.totalEntries && (
            <div className="mt-6 text-center">
              <button
                className="rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700"
                onClick={() => {
                  // TODO: Implement pagination or load more
                  console.log('Load more clicked');
                }}
              >
                Cargar Más
              </button>
            </div>
          )}

        {/* Time Period Filter Placeholder (TODO: Future feature) */}
        {/*
      <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Filtros de Tiempo - Próximamente
        </h3>
        <p className="text-gray-600">
          Pronto podrás ver clasificaciones por semana, mes o día.
        </p>
      </div>
      */}
      </div>
    </div>
  );
};

export default LeaderboardPage;
