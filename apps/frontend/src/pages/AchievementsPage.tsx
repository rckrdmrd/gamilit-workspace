import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { GamifiedHeader } from '@/shared/components/layout/GamifiedHeader';
import { AchievementCard } from '@/shared/components/AchievementCard';
import { AchievementFilter } from '@/shared/components/AchievementFilter';
import { AchievementModal } from '@/shared/components/AchievementModal';
import { gamificationApi } from '@/lib/api/gamification.api';
import type {
  Achievement,
  UserAchievement,
  AchievementFilter as AchievementFilterType,
  AchievementSummary,
} from '@/shared/types/achievement.types';

/**
 * AchievementsPage Component
 *
 * Complete achievements page with filtering, sorting, and claim functionality.
 *
 * Features:
 * - Achievement summary stats (total, earned, completion %)
 * - Latest earned achievements showcase
 * - Achievement filtering by category, status, search
 * - Sorting by name, progress, date, rarity
 * - Achievement grid with responsive layout
 * - Modal for achievement details and claiming rewards
 * - Hidden achievements section
 * - Loading states with skeletons
 * - Error handling with retry
 * - Real-time filter/sort (client-side)
 */
export const AchievementsPage: React.FC = () => {
  const { user, logout: _logout } = useAuth();

  // Gamification data for header
  const { gamificationData } = useUserGamification(user?.id);

  // State for data
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [summary, setSummary] = useState<AchievementSummary | null>(null);

  // Loading and error states
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<AchievementFilterType>({
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
  });

  // Modal state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedUserAchievement, setSelectedUserAchievement] = useState<
    UserAchievement | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Fetch all achievements
   */
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoadingAchievements(true);
        setError(null);
        console.log('[ACHIEVEMENTS-PAGE] Loading all achievements...');
        const data = await gamificationApi.getAllAchievements();
        console.log('[ACHIEVEMENTS-PAGE] Loaded achievements:', data?.length || 0);
        setAllAchievements(data);
      } catch (err) {
        console.error('[ACHIEVEMENTS-PAGE] Failed to load achievements:', err);
        setError('Error al cargar logros. Por favor, intenta de nuevo.');
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    loadAchievements();
  }, []);

  /**
   * Fetch user achievements and summary
   */
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        console.log('[ACHIEVEMENTS-PAGE] No user.id, skipping user achievements load');
        return;
      }

      try {
        setIsLoadingUserData(true);
        console.log('[ACHIEVEMENTS-PAGE] Loading user data for userId:', user.id);
        const [userAchData, summaryData] = await Promise.all([
          gamificationApi.getUserAchievements(user.id),
          gamificationApi.getAchievementSummary(user.id).catch(() => null), // Optional endpoint
        ]);

        console.log('[ACHIEVEMENTS-PAGE] Loaded user achievements:', userAchData?.length || 0);
        console.log('[ACHIEVEMENTS-PAGE] Summary:', summaryData);
        setUserAchievements(userAchData);
        if (summaryData) {
          setSummary(summaryData);
        }
      } catch (err) {
        console.error('[ACHIEVEMENTS-PAGE] Failed to load user achievements:', err);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  /**
   * Combine achievements with user progress
   */
  const combinedAchievements = useMemo(() => {
    console.log('[ACHIEVEMENTS-PAGE] Computing combinedAchievements...');
    console.log('[ACHIEVEMENTS-PAGE] allAchievements count:', allAchievements.length);
    console.log('[ACHIEVEMENTS-PAGE] userAchievements count:', userAchievements.length);

    const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
    console.log('[ACHIEVEMENTS-PAGE] userAchMap keys:', Array.from(userAchMap.keys()));

    const result = allAchievements.map((achievement) => ({
      achievement,
      userAchievement: userAchMap.get(achievement.id),
    }));

    const withProgress = result.filter(r => r.userAchievement).length;
    console.log('[ACHIEVEMENTS-PAGE] Combined result:', result.length, 'with progress:', withProgress);

    return result;
  }, [allAchievements, userAchievements]);

  /**
   * Filter and sort achievements
   */
  const filteredAchievements = useMemo(() => {
    let filtered = combinedAchievements;

    // Filter by category
    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter((item) => item.achievement.category === filter.category);
    }

    // Filter by status
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter((item) => {
        const status = item.userAchievement?.status || 'locked';
        return status === filter.status;
      });
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.achievement.name.toLowerCase().includes(query) ||
          item.achievement.description.toLowerCase().includes(query),
      );
    }

    // Sort
    if (filter.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let compareResult = 0;

        switch (filter.sortBy) {
          case 'name':
            compareResult = a.achievement.name.localeCompare(b.achievement.name);
            break;
          case 'progress':
            compareResult = (a.userAchievement?.progress || 0) - (b.userAchievement?.progress || 0);
            break;
          case 'earnedDate': {
            const dateA = a.userAchievement?.earnedAt
              ? new Date(a.userAchievement.earnedAt).getTime()
              : 0;
            const dateB = b.userAchievement?.earnedAt
              ? new Date(b.userAchievement.earnedAt).getTime()
              : 0;
            compareResult = dateA - dateB;
            break;
          }
          case 'rarity': {
            const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
            const rarityA = rarityOrder[a.achievement.rarity || 'common'] || 0;
            const rarityB = rarityOrder[b.achievement.rarity || 'common'] || 0;
            compareResult = rarityA - rarityB;
            break;
          }
        }

        return filter.sortOrder === 'asc' ? compareResult : -compareResult;
      });
    }

    return filtered;
  }, [combinedAchievements, filter]);

  /**
   * Separate achievements into earned, pending, and hidden
   * FIX: CORR-ACH-UI-002 - Segregación de logros obtenidos vs pendientes
   */
  const { earnedAchievements, pendingAchievements, hiddenAchievements } = useMemo(() => {
    const earned: typeof filteredAchievements = [];
    const pending: typeof filteredAchievements = [];
    const hidden: typeof filteredAchievements = [];

    filteredAchievements.forEach((item) => {
      const status = item.userAchievement?.status || 'locked';
      const isLocked = status === 'locked';
      const isEarned = status === 'earned' || status === 'claimed';

      // Hidden achievements that are locked go to hidden section
      if (item.achievement.isHidden && isLocked) {
        hidden.push(item);
      }
      // Earned/claimed achievements go to earned section
      else if (isEarned) {
        earned.push(item);
      }
      // Everything else (locked, in_progress) goes to pending
      else {
        pending.push(item);
      }
    });

    // Sort earned by most recent first
    earned.sort((a, b) => {
      const dateA = a.userAchievement?.earnedAt ? new Date(a.userAchievement.earnedAt).getTime() : 0;
      const dateB = b.userAchievement?.earnedAt ? new Date(b.userAchievement.earnedAt).getTime() : 0;
      return dateB - dateA;
    });

    return { earnedAchievements: earned, pendingAchievements: pending, hiddenAchievements: hidden };
  }, [filteredAchievements]);

  /**
   * Calculate summary if not provided by API
   * FIX: CORR-ACH-UI-001 - Corregido cálculo de locked para excluir in_progress
   * FIX: CORR-ACH-UI-003 - Mapear campos del API (snake_case) a frontend (camelCase)
   */
  const displaySummary = useMemo(() => {
    // If we have a summary from API, transform to expected format
    // API returns: { total_available, completed, completion_percentage, unclaimed_rewards }
    // UI expects: { total, earned, claimed, inProgress, locked, completionPercentage, recentlyEarned }
    if (summary) {
      console.log('[ACHIEVEMENTS-PAGE] Using summary from API:', summary);
      const apiSummary = summary as unknown as {
        total_available?: number;
        completed?: number;
        completion_percentage?: number;
        unclaimed_rewards?: number;
        // También puede venir en formato frontend
        total?: number;
        earned?: number;
      };

      const total = apiSummary.total_available ?? apiSummary.total ?? allAchievements.length;
      const earned = apiSummary.completed ?? apiSummary.earned ?? 0;
      // unclaimed_rewards indica logros completados pero no reclamados
      const unclaimedCount = apiSummary.unclaimed_rewards ?? 0;
      const claimed = earned - unclaimedCount;

      // Calcular in_progress desde userAchievements
      const inProgress = userAchievements.filter((ua) => ua.status === 'in_progress').length;
      const locked = total - earned - inProgress;

      return {
        total,
        earned,
        claimed,
        inProgress,
        locked,
        completionPercentage: apiSummary.completion_percentage ?? (total > 0 ? (earned / total) * 100 : 0),
        recentlyEarned: (summary as AchievementSummary).recentlyEarned ?? [],
      };
    }

    const total = allAchievements.length;

    // DEBUG: Log status distribution
    const statusCounts = userAchievements.reduce((acc, ua) => {
      acc[ua.status] = (acc[ua.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[ACHIEVEMENTS-PAGE] userAchievements status distribution:', statusCounts);
    console.log('[ACHIEVEMENTS-PAGE] Sample userAchievements:', userAchievements.slice(0, 3).map(ua => ({
      id: ua.id,
      achievementId: ua.achievementId,
      status: ua.status,
      progress: ua.progress,
    })));

    const earned = userAchievements.filter(
      (ua) => ua.status === 'earned' || ua.status === 'claimed',
    ).length;
    const claimed = userAchievements.filter((ua) => ua.status === 'claimed').length;
    const inProgress = userAchievements.filter((ua) => ua.status === 'in_progress').length;
    // FIX: CORR-ACH-UI-001 - locked debe excluir tanto earned como inProgress
    const locked = total - earned - inProgress;
    const completionPercentage = total > 0 ? (earned / total) * 100 : 0;
    const recentlyEarned = userAchievements
      .filter((ua) => ua.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, 3);

    console.log('[ACHIEVEMENTS-PAGE] Calculated stats:', { total, earned, claimed, inProgress, locked, completionPercentage });

    return {
      total,
      earned,
      claimed,
      inProgress,
      locked,
      completionPercentage,
      recentlyEarned,
    };
  }, [summary, allAchievements, userAchievements]);

  /**
   * Open achievement modal
   */
  const handleAchievementClick = (achievement: Achievement, userAchievement?: UserAchievement) => {
    setSelectedAchievement(achievement);
    setSelectedUserAchievement(userAchievement);
    setIsModalOpen(true);
  };

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
    setSelectedUserAchievement(undefined);
  };

  /**
   * Claim achievement rewards
   */
  const handleClaimRewards = async (achievementId: string) => {
    if (!user?.id) return;

    try {
      const updatedAchievement = await gamificationApi.claimAchievement(user.id, achievementId);

      // Update local state
      setUserAchievements((prev) =>
        prev.map((ua) => (ua.achievementId === achievementId ? updatedAchievement : ua)),
      );

      // Close modal
      handleCloseModal();

      // Optional: Show success message
      // TODO: Add toast notification
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw error; // Let modal handle the error
    }
  };

  /**
   * Retry loading
   */
  const handleRetry = () => {
    window.location.reload();
  };

  const isLoading = isLoadingAchievements || isLoadingUserData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader user={user || undefined} gamificationData={gamificationData} onLogout={_logout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            <Trophy className="mr-3 h-8 w-8 text-yellow-600" />
            Logros
          </h1>
          <p className="mt-2 text-gray-600">
            Desbloquea logros completando desafíos y alcanzando metas. ¡Reclama tus recompensas!
          </p>
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

        {/* Summary Stats */}
        {!isLoading && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{displaySummary.total}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Ganados</p>
              <p className="text-3xl font-bold text-green-600">{displaySummary.earned}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Completado</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(displaySummary.completionPercentage)}%
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-3xl font-bold text-blue-600">{displaySummary.inProgress}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Bloqueados</p>
              <p className="text-3xl font-bold text-gray-400">{displaySummary.locked}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-orange-600" />
            <span className="ml-3 text-gray-600">Cargando logros...</span>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION: Logros Obtenidos (Earned/Claimed) */}
        {/* ============================================ */}
        {!isLoading && earnedAchievements.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-bold text-gray-900">
                <span className="mr-2 text-green-500">✅</span>
                Logros Obtenidos ({earnedAchievements.length})
              </h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {Math.round(displaySummary.completionPercentage)}% completado
              </span>
            </div>
            <p className="mb-4 text-gray-600">
              ¡Felicidades! Estos son los logros que has desbloqueado.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {earnedAchievements.map((item) => (
                <AchievementCard
                  key={item.achievement.id}
                  achievement={item.achievement}
                  userAchievement={item.userAchievement}
                  onClick={() => handleAchievementClick(item.achievement, item.userAchievement)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION: Logros Pendientes (Locked/In Progress) */}
        {/* ============================================ */}
        {!isLoading && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-bold text-gray-900">
                <span className="mr-2 text-orange-500">🎯</span>
                Logros Pendientes ({pendingAchievements.length})
              </h2>
              {displaySummary.inProgress > 0 && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {displaySummary.inProgress} en progreso
                </span>
              )}
            </div>
            <p className="mb-4 text-gray-600">
              Completa desafíos y alcanza metas para desbloquear estos logros.
            </p>

            {/* Filters for pending section */}
            <div className="mb-6">
              <AchievementFilter currentFilter={filter} onFilterChange={setFilter} />
            </div>

            {/* Empty State */}
            {pendingAchievements.length === 0 && earnedAchievements.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold text-green-800">
                  ¡Increíble! Has completado todos los logros visibles
                </h3>
                <p className="text-green-600">
                  Sigue explorando para descubrir logros ocultos.
                </p>
              </div>
            )}

            {/* Empty State - No achievements at all */}
            {pendingAchievements.length === 0 && earnedAchievements.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No se encontraron logros</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros para ver más logros.</p>
              </div>
            )}

            {/* Pending Grid */}
            {pendingAchievements.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pendingAchievements.map((item) => (
                  <AchievementCard
                    key={item.achievement.id}
                    achievement={item.achievement}
                    userAchievement={item.userAchievement}
                    onClick={() => handleAchievementClick(item.achievement, item.userAchievement)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hidden Achievements Section */}
        {!isLoading && hiddenAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Logros Ocultos ({hiddenAchievements.length})
            </h2>
            <p className="mb-4 text-gray-600">
              Estos logros están ocultos hasta que los desbloquees. ¡Sigue explorando!
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hiddenAchievements.map((item) => (
                <AchievementCard
                  key={item.achievement.id}
                  achievement={item.achievement}
                  userAchievement={item.userAchievement}
                  onClick={() => handleAchievementClick(item.achievement, item.userAchievement)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Achievement Modal */}
        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            userAchievement={selectedUserAchievement}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onClaimRewards={handleClaimRewards}
          />
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-16" />
    </div>
  );
};

export default AchievementsPage;
