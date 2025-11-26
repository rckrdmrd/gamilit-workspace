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
import type {
  Achievement,
  AchievementCategory,
} from '@/features/gamification/social/types/achievementsTypes';

// Utils
import { cn } from '@shared/utils/cn';

type FilterOption = 'all' | 'locked' | 'unlocked';
type SortOption = 'date' | 'rarity' | 'category' | 'name';

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

  // Local State
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [lockedFilter, setLockedFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Locked/Unlocked filter
    if (lockedFilter === 'locked') {
      filtered = filtered.filter((a) => !a.isUnlocked);
    } else if (lockedFilter === 'unlocked') {
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
    switch (sortBy) {
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
  }, [achievements, selectedCategory, lockedFilter, searchQuery, sortBy]);

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

  // Save filter preferences to localStorage
  useEffect(() => {
    localStorage.setItem(
      'achievements_filters',
      JSON.stringify({
        category: selectedCategory,
        lockedFilter,
        sortBy,
      }),
    );
  }, [selectedCategory, lockedFilter, sortBy]);

  // Load filter preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('achievements_filters');
    if (saved) {
      try {
        const { category, lockedFilter: lf, sortBy: sb } = JSON.parse(saved);
        if (category) setSelectedCategory(category);
        if (lf) setLockedFilter(lf);
        if (sb) setSortBy(sb);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

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
                  const isActive = selectedCategory === cat.value;

                  return (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.value)}
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
                value={lockedFilter}
                onChange={(e) => setLockedFilter(e.target.value as FilterOption)}
                className="rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-detective-orange focus:outline-none"
              >
                <option value="all">Todos los logros</option>
                <option value="unlocked">Solo desbloqueados</option>
                <option value="locked">Solo bloqueados</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
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
