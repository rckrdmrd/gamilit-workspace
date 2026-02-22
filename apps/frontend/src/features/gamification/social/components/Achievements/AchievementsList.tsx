/**
 * AchievementsList Component
 * Grid display of all achievements with filtering
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Coins,
  EyeOff,
  Grid,
  Search,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementCard } from './AchievementCard';
import type { AchievementCategory } from '../../types/achievementsTypes';

const categories: {
  value: AchievementCategory | 'all';
  label: string;
  IconComponent: LucideIcon;
}[] = [
  { value: 'all', label: 'Todos', IconComponent: Grid },
  { value: 'progress', label: 'Progreso', IconComponent: TrendingUp },
  { value: 'mastery', label: 'Maestría', IconComponent: Award },
  { value: 'social', label: 'Social', IconComponent: Users },
  { value: 'hidden', label: 'Ocultos', IconComponent: EyeOff },
];

export const AchievementsList = () => {
  const { getFilteredAchievements, filterByCategory, stats } = useAchievements();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    filterByCategory(category === 'all' ? null : category);
  };

  const achievements = getFilteredAchievements();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-detective bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-detective-gold" />
            <span className="text-detective-sm text-detective-text-secondary">Total</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-text">
            {stats.unlockedAchievements}/{stats.totalAchievements}
          </p>
        </div>

        <div className="rounded-detective bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Coins className="h-5 w-5 text-detective-gold" />
            <span className="text-detective-sm text-detective-text-secondary">ML Ganados</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-text">
            {stats.totalMlCoinsEarned}
          </p>
        </div>

        <div className="rounded-detective bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-detective-orange" />
            <span className="text-detective-sm text-detective-text-secondary">XP Ganado</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-text">{stats.totalXpEarned}</p>
        </div>

        <div className="rounded-detective bg-white p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-detective-orange" />
            <span className="text-detective-sm text-detective-text-secondary">Completado</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-text">
            {Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}%
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const { IconComponent } = category;
          const isActive = activeFilter === category.value;

          return (
            <motion.button
              key={category.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange(category.value)}
              className={`flex items-center gap-2 rounded-detective px-4 py-2 font-semibold transition-all ${
                isActive
                  ? 'bg-detective-orange text-white shadow-orange'
                  : 'bg-white text-detective-text shadow-card hover:bg-detective-bg'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AchievementCard achievement={achievement} />
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-detective-lg text-detective-text-secondary">
            No se encontraron logros en esta categoría
          </p>
        </div>
      )}
    </div>
  );
};
