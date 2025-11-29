/**
 * AchievementFilters Component
 * Advanced filtering system with search, category, rarity, status, and sort
 * ~250 lines
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Trophy,
  Users,
  Star,
  Filter,
  X,
  ChevronDown,
  SortAsc,
  Lock,
} from 'lucide-react';
import type { AchievementFiltersState, CategoryConfig, RarityConfig } from './types';
import type {
  AchievementCategory,
  AchievementRarity,
} from '@/features/gamification/social/types/achievementsTypes';

interface AchievementFiltersProps {
  filters: AchievementFiltersState;
  onFilterChange: (filters: Partial<AchievementFiltersState>) => void;
  onClearFilters: () => void;
  resultsCount: number;
}

// Category configurations
const categories: CategoryConfig[] = [
  {
    value: 'all',
    label: 'Todos',
    icon: 'trophy',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    value: 'progress',
    label: 'Educacional',
    icon: 'book-open',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    value: 'mastery',
    label: 'Gamificación',
    icon: 'trophy',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    value: 'social',
    label: 'Social',
    icon: 'users',
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  {
    value: 'hidden',
    label: 'Especial',
    icon: 'star',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
];

// Rarity configurations
const rarities: RarityConfig[] = [
  {
    value: 'all',
    label: 'Todas',
    color: 'text-gray-600',
    borderColor: 'border-gray-300',
    glowColor: 'shadow-gray-200',
    gradient: 'from-gray-400 to-gray-500',
  },
  {
    value: 'common',
    label: 'Común',
    color: 'text-gray-600',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-300',
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    value: 'rare',
    label: 'Rara',
    color: 'text-green-600',
    borderColor: 'border-green-400',
    glowColor: 'shadow-green-300',
    gradient: 'from-green-500 to-green-600',
  },
  {
    value: 'epic',
    label: 'Épica',
    color: 'text-purple-600',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-purple-300',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    value: 'legendary',
    label: 'Legendaria',
    color: 'text-yellow-600',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-300',
    gradient: 'from-yellow-500 to-detective-gold',
  },
];

// Icon mapping
const iconComponents = {
  'book-open': BookOpen,
  trophy: Trophy,
  users: Users,
  star: Star,
};

export const AchievementFilters: React.FC<AchievementFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  resultsCount,
}) => {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.rarity !== 'all' ||
    filters.status !== 'all' ||
    filters.searchQuery.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value });
  };

  const handleCategoryChange = (category: AchievementCategory | 'all') => {
    onFilterChange({ category });
  };

  const handleRarityChange = (rarity: AchievementRarity | 'all') => {
    onFilterChange({ rarity });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: e.target.value as 'all' | 'unlocked' | 'locked' | 'in_progress' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sortBy: e.target.value as 'recent' | 'alphabetical' | 'rarity' | 'progress' });
  };

  return (
    <section className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Mobile Filter Toggle */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex w-full items-center justify-between rounded-lg bg-detective-bg px-4 py-3 transition-colors hover:bg-detective-bg-secondary"
          >
            <span className="flex items-center gap-2 font-semibold text-detective-text">
              <Filter className="h-5 w-5" />
              Filtros {hasActiveFilters && `(${resultsCount} resultados)`}
            </span>
            <motion.div
              animate={{ rotate: showMobileFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </button>
        </div>

        {/* Filters Content */}
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: showMobileFilters || window.innerWidth >= 1024 ? 'auto' : 0,
              opacity: showMobileFilters || window.innerWidth >= 1024 ? 1 : 0,
            }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 overflow-hidden lg:!h-auto lg:!opacity-100"
          >
            {/* Search Bar */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-detective-text">
                Buscar Logros
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-detective-text transition-colors focus:border-detective-orange focus:outline-none"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => onFilterChange({ searchQuery: '' })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-detective-text-secondary hover:text-detective-text"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-detective-text">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = iconComponents[cat.icon as keyof typeof iconComponents];
                  const isActive = filters.category === cat.value;

                  return (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                          : 'bg-detective-bg text-detective-text hover:bg-detective-bg-secondary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Rarity Filters */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-detective-text">Rareza</label>
              <div className="flex flex-wrap gap-2">
                {rarities.map((rarity) => {
                  const isActive = filters.rarity === rarity.value;

                  return (
                    <motion.button
                      key={rarity.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRarityChange(rarity.value)}
                      className={`rounded-xl border-2 px-4 py-2 font-semibold transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${rarity.gradient} text-white ${rarity.glowColor} shadow-lg`
                          : `${rarity.borderColor} ${rarity.color} bg-white hover:${rarity.glowColor}`
                      }`}
                    >
                      {rarity.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Status and Sort */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Estado
                </label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={handleStatusChange}
                    className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-10 pr-4 text-detective-text transition-colors focus:border-detective-orange focus:outline-none"
                  >
                    <option value="all">Todos los logros</option>
                    <option value="unlocked">Solo desbloqueados</option>
                    <option value="locked">Solo bloqueados</option>
                    <option value="in_progress">En progreso</option>
                  </select>
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-detective-text">
                  Ordenar por
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={handleSortChange}
                    className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-10 pr-4 text-detective-text transition-colors focus:border-detective-orange focus:outline-none"
                  >
                    <option value="recent">Recién desbloqueados</option>
                    <option value="alphabetical">Alfabético</option>
                    <option value="rarity">Rareza (mayor primero)</option>
                    <option value="progress">Progreso (más cerca)</option>
                  </select>
                  <SortAsc className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                </div>
              </div>
            </div>

            {/* Active Filters and Clear */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between border-t border-gray-200 pt-4"
              >
                <span className="text-sm text-detective-text-secondary">
                  {resultsCount} resultado{resultsCount !== 1 ? 's' : ''} encontrado
                  {resultsCount !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={onClearFilters}
                  className="flex items-center gap-2 px-4 py-2 font-semibold text-detective-orange transition-colors hover:text-detective-orange-dark"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
};
