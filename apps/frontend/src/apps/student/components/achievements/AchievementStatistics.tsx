/**
 * AchievementStatistics Component
 * Statistics panel with charts, recent unlocks, and motivational content
 * ~180 lines
 */



import { motion } from 'framer-motion';
import { TrendingUp, Clock, Award, Target, Sparkles, Trophy, Flame, Star } from 'lucide-react';
import type { AchievementStatisticsData as AchievementStats } from './types';

interface AchievementStatisticsProps {
  statistics: AchievementStats;
}

export const AchievementStatistics = ({ statistics }: AchievementStatisticsProps) => {
  // Category icons
  const categoryIcons = {
    progress: TrendingUp,
    mastery: Award,
    social: Trophy,
    hidden: Star,
  };

  // Category colors
  const categoryColors = {
    progress: 'from-blue-500 to-blue-600',
    mastery: 'from-orange-500 to-orange-600',
    social: 'from-green-500 to-green-600',
    hidden: 'from-purple-500 to-purple-600',
  };

  // Rarity colors
  const rarityColors = {
    common: 'text-gray-600',
    rare: 'text-green-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Section Title */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="mb-2 flex items-center justify-center gap-3 text-3xl font-bold text-detective-text">
            <Target className="h-8 w-8 text-detective-orange" />
            Estadísticas de Logros
          </h2>
          <p className="text-detective-text-secondary">Tu progreso en números</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Completion Rate Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
              <TrendingUp className="h-6 w-6 text-detective-orange" />
              Tasa de Completación
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-6xl font-bold text-detective-orange">
                  {statistics.completionRate.toFixed(0)}%
                </div>
                <p className="text-detective-text-secondary">
                  {statistics.unlocked} de {statistics.total} logros
                </p>
                <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statistics.completionRate}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-detective-orange to-detective-gold"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Unlocks Timeline */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
              <Clock className="h-6 w-6 text-detective-orange" />
              Recientes Desbloqueados
            </h3>
            {statistics.recentUnlocks.length > 0 ? (
              <div className="space-y-3">
                {statistics.recentUnlocks.slice(0, 3).map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 rounded-xl bg-detective-bg p-3 transition-colors hover:bg-detective-bg-secondary"
                  >
                    <Trophy className="h-8 w-8 text-detective-gold" />
                    <div className="flex-1">
                      <div className="font-semibold text-detective-text">{achievement.title}</div>
                      <div className="text-sm text-detective-text-secondary">
                        {achievement.unlockedAt &&
                          new Date(achievement.unlockedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-detective-text-secondary">
                Aún no has desbloqueado ningún logro
              </div>
            )}
          </motion.div>

          {/* Rarity Breakdown */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
              <Sparkles className="h-6 w-6 text-detective-orange" />
              Por Rareza
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.byRarity).map(([rarity, count]) => (
                <div key={rarity}>
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`font-semibold capitalize ${rarityColors[rarity as keyof typeof rarityColors]}`}
                    >
                      {rarity === 'common'
                        ? 'Común'
                        : rarity === 'rare'
                          ? 'Rara'
                          : rarity === 'epic'
                            ? 'Épica'
                            : 'Legendaria'}
                    </span>
                    <span className="text-detective-text-secondary">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: statistics.total > 0 ? `${(count / statistics.total) * 100}%` : '0%',
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        rarity === 'legendary'
                          ? 'bg-gradient-to-r from-yellow-400 to-detective-gold'
                          : rarity === 'epic'
                            ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                            : rarity === 'rare'
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : 'bg-gradient-to-r from-gray-400 to-gray-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
              <Award className="h-6 w-6 text-detective-orange" />
              Por Categoría
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statistics.byCategory).map(([category, count]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                const gradient = categoryColors[category as keyof typeof categoryColors];

                return (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-xl bg-gradient-to-br p-4 ${gradient} text-white`}
                  >
                    <Icon className="mb-2 h-8 w-8" />
                    <div className="text-3xl font-bold">{count}</div>
                    <div className="text-sm capitalize opacity-90">
                      {category === 'progress'
                        ? 'Progreso'
                        : category === 'mastery'
                          ? 'Maestría'
                          : category === 'social'
                            ? 'Social'
                            : 'Ocultos'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-gradient-to-r from-detective-orange to-detective-gold p-8 text-center text-white shadow-2xl"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="mb-4 inline-block"
          >
            <Flame className="h-16 w-16" />
          </motion.div>
          <h3 className="mb-2 text-3xl font-bold">¡Sigue Así!</h3>
          <p className="mb-4 text-xl opacity-90">
            {statistics.locked > 0
              ? `Tienes ${statistics.locked} logros más esperándote`
              : '¡Has desbloqueado todos los logros disponibles!'}
          </p>
          {statistics.locked > 0 && (
            <p className="text-lg opacity-80">
              Completa más ejercicios y desafíos para desbloquearlos todos 💪
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
