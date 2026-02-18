/**
 * AchievementsPage Component
 *
 * Complete achievements page with filtering, sorting, and claim functionality.
 *
 * Features:
 * - Achievement summary stats (total, earned, completion %)
 * - Achievement filtering by category, status, search
 * - Sorting by name, progress, date, rarity
 * - Achievement grid with responsive layout
 * - Modal for achievement details and claiming rewards
 * - Hidden achievements section
 * - Loading/error states
 */

import { useState } from 'react';
import { Trophy, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { GamifiedHeader } from '@/shared/components/layout/GamifiedHeader';
import { AchievementCard } from '@/shared/components/AchievementCard';
import { AchievementFilter } from '@/shared/components/AchievementFilter';
import { AchievementModal } from '@/shared/components/AchievementModal';
import {
  useAchievements,
  useAchievementFilters,
} from '@/features/gamification/achievements/hooks/useAchievements';
import type {
  Achievement,
  UserAchievement,
  AchievementFilter as AchievementFilterType,
} from '@/shared/types/achievement.types';

export default function AchievementsPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  // Data from React Query hooks
  const {
    combinedAchievements,
    displaySummary,
    isLoading,
    error,
    retry,
    claimRewards,
  } = useAchievements();

  // Filter state
  const [filter, setFilter] = useState<AchievementFilterType>({
    category: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
  });

  // Filtered & segregated achievements
  const { earnedAchievements, pendingAchievements, hiddenAchievements } =
    useAchievementFilters(combinedAchievements, filter);

  // Modal state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedUserAchievement, setSelectedUserAchievement] = useState<
    UserAchievement | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAchievementClick = (achievement: Achievement, userAchievement?: UserAchievement) => {
    setSelectedAchievement(achievement);
    setSelectedUserAchievement(userAchievement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
    setSelectedUserAchievement(undefined);
  };

  const handleClaimRewards = async (achievementId: string) => {
    await claimRewards(achievementId);
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader user={user || undefined} gamificationData={gamificationData} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            <Trophy className="mr-3 h-8 w-8 text-yellow-600" />
            Logros
          </h1>
          <p className="mt-2 text-gray-600">
            Desbloquea logros completando desafios y alcanzando metas. Reclama tus recompensas!
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
                onClick={retry}
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

        {/* Earned Achievements Section */}
        {!isLoading && earnedAchievements.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Logros Obtenidos ({earnedAchievements.length})
              </h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {Math.round(displaySummary.completionPercentage)}% completado
              </span>
            </div>
            <p className="mb-4 text-gray-600">
              Estos son los logros que has desbloqueado.
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

        {/* Pending Achievements Section */}
        {!isLoading && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Logros Pendientes ({pendingAchievements.length})
              </h2>
              {displaySummary.inProgress > 0 && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {displaySummary.inProgress} en progreso
                </span>
              )}
            </div>
            <p className="mb-4 text-gray-600">
              Completa desafios y alcanza metas para desbloquear estos logros.
            </p>

            {/* Filters */}
            <div className="mb-6">
              <AchievementFilter currentFilter={filter} onFilterChange={setFilter} />
            </div>

            {/* Empty State - All completed */}
            {pendingAchievements.length === 0 && earnedAchievements.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold text-green-800">
                  Has completado todos los logros visibles
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
                <p className="text-gray-600">Intenta ajustar tus filtros para ver mas logros.</p>
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
              Estos logros estan ocultos hasta que los desbloquees.
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
}
