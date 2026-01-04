/**
 * AchievementsPage - Complete Achievements Page for GLIT Platform
 *
 * Features:
 * - Trophy Room hero section
 * - Filters and search
 * - Achievements grid with animations
 * - Progress tree visualizer
 * - WebSocket integration for real-time updates
 * - Achievement unlock modal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Search,
  Filter,
  Target,
  TrendingUp,
  Award,
  Users,
  EyeOff,
  ArrowUp,
  Sparkles,
  Coins,
  Zap,
} from 'lucide-react';

// Achievements Components
import { AchievementCard } from '@/features/gamification/social/components/Achievements/AchievementCard';
import { AchievementUnlockModal } from '@/features/gamification/social/components/Achievements/AchievementUnlockModal';
import { ProgressTreeVisualizer } from '@/features/gamification/social/components/Achievements/ProgressTreeVisualizer';

// Hooks & Store
import { useAchievements } from '@/features/gamification/social/hooks/useAchievements';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePersistedFilters } from '@/shared/hooks/usePersistedFilters';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { claimAchievementRewards } from '@/features/gamification/social/api/achievementsAPI';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import type {
  Achievement,
  AchievementCategory,
} from '@/features/gamification/social/types/achievementsTypes';
import toast from 'react-hot-toast';

// Utils
import { cn } from '@shared/utils/cn';

type FilterOption = 'all' | 'locked' | 'unlocked';
type SortOption = 'date' | 'rarity' | 'category' | 'name';

interface AchievementFilters {
  category: AchievementCategory | 'all';
  lockedFilter: FilterOption;
  sortBy: SortOption;
}

const DEFAULT_FILTERS: AchievementFilters = {
  category: 'all',
  lockedFilter: 'all',
  sortBy: 'date',
};

const FILTERS_VERSION = '1.0.0';

const categories: {
  value: AchievementCategory | 'all';
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { value: 'all', label: 'Todos', icon: Trophy, color: 'from-purple-500 to-pink-500' },
  { value: 'progress', label: 'Progreso', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { value: 'mastery', label: 'Maestria', icon: Award, color: 'from-orange-500 to-red-500' },
  { value: 'social', label: 'Social', icon: Users, color: 'from-green-500 to-emerald-500' },
  { value: 'hidden', label: 'Ocultos', icon: EyeOff, color: 'from-gray-500 to-slate-500' },
];

export default function AchievementsPage() {
  // Auth State
  const { user } = useAuthStore();

  // Store & Hooks
  const {
    achievements,
    unlockedAchievements,
    recentUnlocks,
    stats,
    isLoading,
    error,
    dismissNotification,
    fetchAchievements,
  } = useAchievements({ userId: user?.id, autoFetch: true });

  // Persisted Filters
  const { filters, updateFilter } = usePersistedFilters<AchievementFilters>({
    storageKey: 'achievements-filters',
    defaultFilters: DEFAULT_FILTERS,
    version: FILTERS_VERSION,
    debug: false,
  });

  // Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [claimingAchievementId, setClaimingAchievementId] = useState<string | null>(null);
  const [localAchievements, setLocalAchievements] = useState<Achievement[]>([]);

  // Economy store for balance refresh
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);

  // Dashboard invalidation hook - FIX: Invalidate cache after claiming achievements
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Sync achievements to local state for claim status updates
  useEffect(() => {
    setLocalAchievements(achievements);
  }, [achievements]);

  // WebSocket Integration for real-time updates is handled globally via App.tsx
  // The useAchievements hook will automatically update when new achievements are unlocked

  // Auto-show unlock modal for recent unlocks
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const latestUnlock = recentUnlocks[0];
      setSelectedAchievement(latestUnlock.achievement);
      setShowUnlockModal(true);
    }
  }, [recentUnlocks]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search logic handled in filtered achievements
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle claim rewards
  const handleClaimRewards = async (achievementId: string) => {
    if (!user?.id || claimingAchievementId) return;

    try {
      setClaimingAchievementId(achievementId);

      const result = await claimAchievementRewards(user.id, achievementId);

      if (result.success) {
        // Update local state to mark as claimed
        setLocalAchievements((prev) =>
          prev.map((a) =>
            a.id === achievementId ? { ...a, rewardsClaimed: true } : a
          )
        );

        // FIX: Invalidate dashboard cache to update coins, XP, and achievements
        await syncAndInvalidate();

        // Find the achievement for the toast message
        const achievement = localAchievements.find((a) => a.id === achievementId);
        const rewardText = achievement
          ? `+${achievement.mlCoinsReward} ML Coins, +${achievement.xpReward} XP`
          : 'Recompensas';

        toast.success(`${rewardText} reclamadas!`, {
          icon: '🎁',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Error al reclamar recompensas. Intenta de nuevo.');
    } finally {
      setClaimingAchievementId(null);
    }
  };

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = localAchievements;

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((a) => a.category === filters.category);
    }

    // Locked/Unlocked filter
    if (filters.lockedFilter === 'locked') {
      filtered = filtered.filter((a) => !a.isUnlocked);
    } else if (filters.lockedFilter === 'unlocked') {
      filtered = filtered.filter((a) => a.isUnlocked);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query),
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (filters.sortBy) {
      case 'date':
        sorted.sort((a, b) => {
          if (!a.unlockedAt) return 1;
          if (!b.unlockedAt) return -1;
          return b.unlockedAt.getTime() - a.unlockedAt.getTime();
        });
        break;
      case 'rarity': {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        sorted.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      }
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return sorted;
  }, [achievements, filters.category, filters.lockedFilter, filters.sortBy, searchQuery]);

  // Featured achievement (most recent legendary/epic unlock)
  const featuredAchievement = useMemo(() => {
    return unlockedAchievements
      .filter((a) => a.rarity === 'legendary' || a.rarity === 'epic')
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return b.unlockedAt.getTime() - a.unlockedAt.getTime();
      })[0];
  }, [unlockedAchievements]);

  const completionPercentage =
    stats.totalAchievements > 0
      ? Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)
      : 0;

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowUnlockModal(true);
  };

  const handleCloseModal = () => {
    setShowUnlockModal(false);
    if (recentUnlocks.length > 0) {
      dismissNotification(recentUnlocks[0].achievement.id);
    }
  };

  // Note: Filter persistence is now handled by usePersistedFilters hook
  // Old localStorage key 'achievements_filters' is deprecated in favor of 'achievements-filters'
  // with versioning support. Old data will be ignored on next filter change.

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900">
      {/* Hero Section - Trophy Room */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-12 text-white"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
                x: Math.random() * 100,
                y: Math.random() * 100,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Stats */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="mb-4 flex items-center gap-3 text-4xl font-bold md:text-5xl">
                  <Trophy className="h-12 w-12" />
                  Sala de Trofeos
                </h1>
                <p className="mb-6 text-xl opacity-90">Tu coleccion de logros y conquistas</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
              >
                <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{stats.unlockedAchievements}</div>
                  <div className="text-sm opacity-80">Desbloqueados</div>
                </div>
                <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{completionPercentage}%</div>
                  <div className="text-sm opacity-80">Completado</div>
                </div>
                <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    {stats.totalMlCoinsEarned}
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="text-sm opacity-80">ML Ganados</div>
                </div>
                <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    {stats.totalXpEarned}
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="text-sm opacity-80">XP Ganado</div>
                </div>
              </motion.div>
            </div>

            {/* Featured Achievement */}
            {featuredAchievement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-xs rounded-xl bg-white/20 p-6 backdrop-blur-md"
              >
                <div className="mb-2 text-sm opacity-90">Logro Destacado</div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{featuredAchievement.title}</h3>
                    <p className="text-sm opacity-80">{featuredAchievement.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Filters & Search */}
      <section className="container mx-auto px-4 py-6">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          {/* Mobile Filter Toggle */}
          <div className="mb-4 md:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex w-full items-center justify-between rounded-lg bg-detective-bg px-4 py-3"
            >
              <span className="flex items-center gap-2 font-semibold text-detective-text">
                <Filter className="h-5 w-5" />
                Filtros
              </span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUp className="h-5 w-5" />
              </motion.div>
            </button>
          </div>

          {/* Filters */}
          <div className={cn('space-y-4', !showFilters && 'hidden md:block')}>
            {/* Category Filters */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-detective-text-secondary">
                Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = filters.category === cat.value;

                  return (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateFilter('category', cat.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all',
                        isActive
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                          : 'bg-detective-bg text-detective-text hover:bg-detective-bg-secondary',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Search and Additional Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar logros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
                />
              </div>

              {/* Locked/Unlocked Filter */}
              <select
                value={filters.lockedFilter}
                onChange={(e) => updateFilter('lockedFilter', e.target.value as FilterOption)}
                className="rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-detective-orange focus:outline-none"
              >
                <option value="all">Todos los logros</option>
                <option value="unlocked">Solo desbloqueados</option>
                <option value="locked">Solo bloqueados</option>
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-detective-orange focus:outline-none"
              >
                <option value="date">Ordenar por fecha</option>
                <option value="rarity">Ordenar por rareza</option>
                <option value="category">Ordenar por categoria</option>
                <option value="name">Ordenar por nombre</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-detective-text">
            Logros ({filteredAchievements.length})
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Trophy className="h-16 w-16 text-detective-orange" />
            </motion.div>
            <p className="mt-4 text-detective-text-secondary">Cargando logros...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg bg-red-50 py-16 text-center">
            <div className="mb-4 text-red-500">
              <Award className="mx-auto h-16 w-16" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-red-700">Error al cargar logros</h3>
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => user?.id && fetchAchievements(user.id)}
              className="rounded-lg bg-detective-orange px-6 py-2 text-white transition-colors hover:bg-detective-orange-dark"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Achievements Grid */}
        {!isLoading && !error && filteredAchievements.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementCard
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                  onClaimRewards={handleClaimRewards}
                  isClaiming={claimingAchievementId === achievement.id}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : !isLoading && !error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Search className="mx-auto mb-4 h-24 w-24 text-gray-300" />
            <h3 className="mb-2 text-2xl font-bold text-detective-text">
              No se encontraron logros
            </h3>
            <p className="text-detective-text-secondary">Intenta ajustar tus filtros de busqueda</p>
          </motion.div>
        ) : null}
      </section>

      {/* Progress Tree */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Target className="h-6 w-6 text-detective-orange" />
          Arbol de Progreso
        </h2>
        <ProgressTreeVisualizer />
      </section>

      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && selectedAchievement && (
          <AchievementUnlockModal
            achievement={selectedAchievement}
            onClose={handleCloseModal}
            showConfetti={
              selectedAchievement.rarity === 'legendary' || selectedAchievement.rarity === 'epic'
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
