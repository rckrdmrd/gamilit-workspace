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
   * Separate hidden achievements
   */
  const { visibleAchievements, hiddenAchievements } = useMemo(() => {
    const visible: typeof filteredAchievements = [];
    const hidden: typeof filteredAchievements = [];

    filteredAchievements.forEach((item) => {
      const isLocked = !item.userAchievement || item.userAchievement.status === 'locked';
      if (item.achievement.isHidden && isLocked) {
        hidden.push(item);
      } else {
        visible.push(item);
      }
    });

    return { visibleAchievements: visible, hiddenAchievements: hidden };
  }, [filteredAchievements]);

  /**
   * Calculate summary if not provided by API
   */
  const displaySummary = useMemo(() => {
    // If we have a summary from API, ensure it has recentlyEarned array
    if (summary) {
      return {
        ...summary,
        recentlyEarned: summary.recentlyEarned ?? [],
      };
    }

    const total = allAchievements.length;
    const earned = userAchievements.filter(
      (ua) => ua.status === 'earned' || ua.status === 'claimed',
    ).length;
    const claimed = userAchievements.filter((ua) => ua.status === 'claimed').length;
    const inProgress = userAchievements.filter((ua) => ua.status === 'in_progress').length;
    const locked = total - earned;
    const completionPercentage = total > 0 ? (earned / total) * 100 : 0;
    const recentlyEarned = userAchievements
      .filter((ua) => ua.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, 3);

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

        {/* Latest Earned (mini showcase) */}
        {!isLoading && displaySummary.recentlyEarned.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Recientemente Ganados</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {displaySummary.recentlyEarned.map((userAch) => {
                const achievement = allAchievements.find((a) => a.id === userAch.achievementId);
                if (!achievement) return null;
                return (
                  <AchievementCard
                    key={userAch.id}
                    achievement={achievement}
                    userAchievement={userAch}
                    onClick={() => handleAchievementClick(achievement, userAch)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <AchievementFilter currentFilter={filter} onFilterChange={setFilter} />
        </div>

        {/* Achievements Grid */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Todos los Logros ({visibleAchievements.length})
          </h2>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-orange-600" />
              <span className="ml-3 text-gray-600">Cargando logros...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && visibleAchievements.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No se encontraron logros</h3>
              <p className="text-gray-600">Intenta ajustar tus filtros para ver más logros.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && visibleAchievements.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleAchievements.map((item) => (
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
