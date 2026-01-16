/**
 * AchievementsPreview Component
 *
 * Preview of recent achievements with filtering and link to full page
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Lock, CheckCircle, ArrowRight, Sparkles, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AchievementData } from '../../hooks/useDashboardData';

interface AchievementsPreviewProps {
  achievements: AchievementData[];
}

type FilterType = 'all' | 'recent' | 'rare' | 'legendary';

const rarityColors = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    badge: 'bg-gray-400',
    text: 'text-gray-700',
    glow: 'shadow-sm',
  },
  rare: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-500',
    text: 'text-blue-700',
    glow: 'shadow-md shadow-blue-200',
  },
  epic: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500',
    text: 'text-orange-700',
    glow: 'shadow-lg shadow-orange-200',
  },
  legendary: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    badge: 'bg-detective-gold',
    text: 'text-yellow-800',
    glow: 'shadow-xl shadow-yellow-300',
  },
};

export function AchievementsPreview({ achievements }: AchievementsPreviewProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAchievements = achievements
    .filter((achievement) => {
      if (filter === 'all') return true;
      if (filter === 'recent') return achievement.unlocked && achievement.unlockedAt;
      if (filter === 'rare') return achievement.rarity === 'rare';
      if (filter === 'legendary') return achievement.rarity === 'legendary';
      return true;
    })
    .slice(0, 6);

  const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Todos', icon: <Trophy className="h-4 w-4" /> },
    { id: 'recent', label: 'Recientes', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'rare', label: 'Raros', icon: <Award className="h-4 w-4" /> },
    { id: 'legendary', label: 'Legendarios', icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Trophy className="h-7 w-7 text-detective-gold" />
          Logros Recientes
        </h2>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-detective-orange text-white shadow-md'
                  : 'border border-gray-200 bg-white text-detective-text-secondary hover:border-detective-orange'
              }`}
            >
              {f.icon}
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((achievement, index) => {
          const isLocked = !achievement.unlocked;
          const rarity = rarityColors[achievement.rarity];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                rarity.bg
              } ${rarity.border} ${rarity.glow} ${isLocked ? 'opacity-60 grayscale' : ''}`}
            >
              {/* Rarity Badge */}
              <div className="absolute right-3 top-3 z-10">
                <span
                  className={`${rarity.badge} rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm`}
                >
                  {achievement.rarity}
                </span>
              </div>

              {/* Unlocked Check */}
              {achievement.unlocked && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 + index * 0.1 }}
                  className="absolute left-3 top-3 z-10"
                >
                  <CheckCircle className="h-6 w-6 text-green-500" fill="white" />
                </motion.div>
              )}

              {/* Achievement Icon */}
              <div className="mb-3 mt-2 flex justify-center">
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-md ${
                    isLocked
                      ? 'bg-gray-300'
                      : 'bg-gradient-to-br from-orange-500 to-orange-600'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="h-8 w-8 text-gray-500" />
                  ) : (
                    <span>{achievement.icon}</span>
                  )}

                  {/* Shimmer effect for unlocked */}
                  {achievement.unlocked && achievement.rarity === 'legendary' && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        background: [
                          'radial-gradient(circle at 0% 50%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                          'radial-gradient(circle at 100% 50%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                          'radial-gradient(circle at 0% 50%, rgba(255,255,255,0.8) 0%, transparent 50%)',
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className={`mb-2 text-center font-bold ${rarity.text} text-base`}>
                {achievement.name}
              </h3>

              {/* Description */}
              <p className="mb-3 min-h-[40px] text-center text-sm text-detective-text-secondary">
                {achievement.description}
              </p>

              {/* Progress Bar (for locked achievements) */}
              {!achievement.unlocked &&
                achievement.progress !== undefined &&
                achievement.required !== undefined && (
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-detective-text-secondary">
                      <span>Progreso</span>
                      <span className="font-semibold">
                        {achievement.progress}/{achievement.required}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-detective-orange to-detective-gold"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(achievement.progress / achievement.required) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      />
                    </div>
                  </div>
                )}

              {/* Unlock Date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="mb-3 text-center text-xs text-detective-text-secondary">
                  Desbloqueado:{' '}
                  {new Date(achievement.unlockedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              )}

              {/* Rewards - FIX: CORR-ACH-003 - Mostrar valores reales o 0 si no hay datos */}
              <div className="flex items-center justify-around border-t border-gray-200 pt-3">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-detective-gold" />
                  <span className="text-sm font-semibold text-detective-text">
                    +{achievement.mlCoinsReward ?? achievement.rewards?.ml_coins ?? 0} ML
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-detective-orange" />
                  <span className="text-sm font-semibold text-detective-text">
                    +{achievement.xpReward ?? achievement.rewards?.xp ?? 0} XP
                  </span>
                </div>
              </div>

              {/* Locked overlay effect */}
              {isLocked && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <Lock className="h-12 w-12 text-gray-400 opacity-20" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-detective-orange to-detective-gold px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Trophy className="h-5 w-5" />
          Ver Todos los Logros
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
