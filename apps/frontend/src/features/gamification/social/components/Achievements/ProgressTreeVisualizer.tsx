/**
 * ProgressTreeVisualizer Component
 * Tree view of interconnected achievements
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Users, EyeOff, type LucideIcon } from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';

// Icon mapping helper
const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Award,
  Users,
  EyeOff,
};

export const ProgressTreeVisualizer: React.FC = () => {
  const { getAchievementsByCategory } = useAchievements();

  const categories = [
    { name: 'progress', label: 'Progreso', icon: 'TrendingUp', color: 'bg-blue-500' },
    { name: 'mastery', label: 'Maestría', icon: 'Award', color: 'bg-purple-500' },
    { name: 'social', label: 'Social', icon: 'Users', color: 'bg-green-500' },
    { name: 'hidden', label: 'Ocultos', icon: 'EyeOff', color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-detective bg-white p-6 shadow-card">
        <h2 className="mb-6 text-detective-2xl font-bold text-detective-text">Árbol de Progreso</h2>

        <div className="space-y-8">
          {categories.map((category) => {
            const achievements = getAchievementsByCategory(category.name);
            const unlocked = achievements.filter((a) => a.isUnlocked).length;
            const total = achievements.length;
            const percentage = total > 0 ? (unlocked / total) * 100 : 0;
            const Icon = iconMap[category.icon] || Award;

            return (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${category.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-detective-text">{category.label}</h3>
                      <p className="text-detective-sm text-detective-text-secondary">
                        {unlocked} / {total} desbloqueados
                      </p>
                    </div>
                  </div>
                  <span className="text-detective-lg font-bold text-detective-text">
                    {Math.round(percentage)}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-3 rounded-full ${category.color}`}
                  />
                </div>

                <div className="grid grid-cols-8 gap-2 md:grid-cols-12">
                  {achievements.map((achievement, index) => {
                    const AchIcon = iconMap[achievement.icon] || Award;
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        title={achievement.title}
                        className={`flex aspect-square items-center justify-center rounded-lg ${
                          achievement.isUnlocked
                            ? `${category.color} text-white`
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <AchIcon className="h-4 w-4" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
