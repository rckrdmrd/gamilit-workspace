/**
 * AchievementsTab Component
 *
 * Tab component for managing achievements in admin panel
 * Features:
 * - List all achievements from database
 * - Filter by category
 * - Toggle active/inactive status
 * - Display rewards (XP + ML Coins)
 * - Show requirements as read-only JSON
 *
 * @module apps/admin/components/gamification/AchievementsTab
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAchievementsApi } from '@/services/api/admin/achievementsApi';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  Award,
  Filter,
  Loader2,
  Trophy,
  Coins,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AchievementCategoryEnum } from '@/shared/constants/enums.constants';
import type { AdminAchievement } from '@/types/admin/achievements.types';
import toast from 'react-hot-toast';

/**
 * Category labels for display
 */
const CATEGORY_LABELS: Record<AchievementCategoryEnum, string> = {
  [AchievementCategoryEnum.PROGRESS]: 'Progreso',
  [AchievementCategoryEnum.STREAK]: 'Racha',
  [AchievementCategoryEnum.COMPLETION]: 'Completación',
  [AchievementCategoryEnum.SOCIAL]: 'Social',
  [AchievementCategoryEnum.SPECIAL]: 'Especial',
  [AchievementCategoryEnum.MASTERY]: 'Maestría',
  [AchievementCategoryEnum.EXPLORATION]: 'Exploración',
};

/**
 * Rarity colors for badges
 */
const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

/**
 * AchievementsTab Component
 */
export function AchievementsTab() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategoryEnum | 'all'>('all');
  const [showInactive, setShowInactive] = useState(true);

  // ========================================
  // QUERIES
  // ========================================

  /**
   * Fetch all achievements
   */
  const {
    data: achievementsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin', 'achievements', selectedCategory, showInactive],
    queryFn: async () => {
      const result = await adminAchievementsApi.listAchievements({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        includeSecret: true, // Admin can see secret achievements
      });
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ========================================
  // MUTATIONS
  // ========================================

  /**
   * Toggle achievement active status
   */
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminAchievementsApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] });
      toast.success('Estado del logro actualizado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar logro');
    },
  });

  // ========================================
  // COMPUTED
  // ========================================

  /**
   * Filter achievements by active status
   */
  const filteredAchievements = useMemo(() => {
    if (!achievementsData?.data) return [];

    let filtered = achievementsData.data;

    // Filter by active status if needed
    if (!showInactive) {
      filtered = filtered.filter((a) => a.is_active);
    }

    return filtered;
  }, [achievementsData?.data, showInactive]);

  /**
   * Category statistics
   */
  const categoryStats = useMemo(() => {
    if (!achievementsData?.data) return {};

    const stats: Record<string, number> = {
      all: achievementsData.data.length,
    };

    Object.values(AchievementCategoryEnum).forEach((cat) => {
      stats[cat] = achievementsData.data.filter((a) => a.category === cat).length;
    });

    return stats;
  }, [achievementsData?.data]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleToggleActive = (achievement: AdminAchievement) => {
    toggleActiveMutation.mutate({
      id: achievement.id,
      isActive: !achievement.is_active,
    });
  };

  // ========================================
  // RENDER: LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" />
          <p className="text-lg text-detective-text">Cargando logros...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER: ERROR
  // ========================================

  if (error) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <p className="mb-2 text-lg font-semibold text-detective-text">Error al cargar logros</p>
          <p className="text-sm text-detective-text-secondary">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </DetectiveCard>
    );
  }

  // ========================================
  // RENDER: MAIN
  // ========================================

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <DetectiveCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-detective-text">
              <Trophy className="h-6 w-6 text-detective-gold" />
              Logros ({filteredAchievements.length})
            </h2>
            <p className="mt-1 text-sm text-detective-text-secondary">
              Gestiona los logros del sistema de gamificación
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DetectiveButton
              variant={showInactive ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            </DetectiveButton>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-detective-text-secondary" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
            }`}
          >
            Todos ({categoryStats.all || 0})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const category = key as AchievementCategoryEnum;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-detective-orange text-white'
                    : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg-secondary/70'
                }`}
              >
                {label} ({categoryStats[category] || 0})
              </button>
            );
          })}
        </div>
      </DetectiveCard>

      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <DetectiveCard>
          <div className="py-12 text-center text-detective-text-secondary">
            <Award className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <p className="mb-2 text-lg font-semibold">No hay logros</p>
            <p className="text-sm">
              {selectedCategory !== 'all'
                ? `No hay logros en la categoría "${CATEGORY_LABELS[selectedCategory]}"`
                : 'No hay logros configurados en el sistema'}
            </p>
          </div>
        </DetectiveCard>
      ) : (
        <div className="space-y-3">
          {filteredAchievements.map((achievement) => (
            <DetectiveCard key={achievement.id} hoverable>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* Achievement Icon & Info */}
                <div className="flex flex-1 items-start gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-bold text-detective-text">{achievement.name}</h3>
                      <span
                        className={`text-xs font-semibold uppercase ${
                          RARITY_COLORS[achievement.rarity] || 'text-gray-400'
                        }`}
                      >
                        {achievement.rarity}
                      </span>
                      {achievement.is_secret && (
                        <span className="rounded bg-purple-900/30 px-2 py-0.5 text-xs text-purple-400">
                          Secreto
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-detective-text-secondary">
                      {achievement.description || 'Sin descripción'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-detective-bg-secondary px-2 py-1">
                        {CATEGORY_LABELS[achievement.category]}
                      </span>
                      {achievement.is_repeatable && (
                        <span className="rounded bg-blue-900/30 px-2 py-1 text-blue-400">
                          Repetible
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex min-w-[120px] flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-semibold text-detective-text">
                      {achievement.rewards.xp} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-detective-gold" />
                    <span className="font-semibold text-detective-text">
                      {achievement.rewards.ml_coins} ML Coins
                    </span>
                  </div>
                </div>

                {/* Requirements (Read-Only) */}
                <div className="max-w-xs flex-1">
                  <p className="mb-1 text-xs font-semibold text-detective-text-secondary">
                    Requisitos:
                  </p>
                  <pre className="max-h-20 overflow-x-auto rounded bg-detective-bg-secondary p-2 text-xs">
                    {JSON.stringify(achievement.conditions, null, 2)}
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex min-w-[100px] flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(achievement)}
                    disabled={toggleActiveMutation.isPending}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      achievement.is_active
                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40'
                        : 'bg-gray-900/30 text-gray-400 hover:bg-gray-900/40'
                    }`}
                  >
                    {achievement.is_active ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Inactivo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      )}

      {/* Info Note */}
      <DetectiveCard>
        <div className="flex items-start gap-3 text-sm text-detective-text-secondary">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div>
            <p className="mb-1 font-semibold text-detective-text">Nota sobre edición de logros:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Los requisitos (conditions) se muestran como JSON de solo lectura</li>
              <li>Puedes activar/desactivar logros para controlar su disponibilidad</li>
              <li>Para editar requisitos, se requiere modificación directa en base de datos</li>
              <li>Los logros secretos están visibles para administradores</li>
            </ul>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
}

export default AchievementsTab;
