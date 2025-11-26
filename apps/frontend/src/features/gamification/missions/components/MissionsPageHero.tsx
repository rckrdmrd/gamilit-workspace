/**
 * MissionsPageHero Component
 *
 * Hero section for the Missions page with:
 * - Gradient background with animated elements
 * - Page title and subtitle
 * - 4 stats cards (completed today, weekly progress, rewards, streak)
 * - Maya-themed decorative elements
 *
 * ~180 lines
 */

import { motion } from 'framer-motion';
import { Target, TrendingUp, Coins, Flame, Zap } from 'lucide-react';
import type { MissionStats } from '../types/missionsTypes';

interface MissionsPageHeroProps {
  stats: MissionStats;
}

export function MissionsPageHero({ stats }: MissionsPageHeroProps) {
  const todayProgress =
    stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;

  const weekProgress =
    stats.weekTotal > 0 ? Math.round((stats.weekCompleted / stats.weekTotal) * 100) : 0;

  const statsCards = [
    {
      icon: Target,
      label: 'Completadas Hoy',
      value: `${stats.todayCompleted}/${stats.todayTotal}`,
      subtext: `${todayProgress}% completado`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: TrendingUp,
      label: 'Progreso Semanal',
      value: `${stats.weekCompleted}/${stats.weekTotal}`,
      subtext: `${weekProgress}% completado`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Coins,
      label: 'Recompensas Totales',
      value: stats.totalMLCoinsEarned.toLocaleString(),
      subtext: `${stats.totalXPEarned.toLocaleString()} XP ganado`,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: Flame,
      label: 'Racha Actual',
      value: `${stats.currentStreak} días`,
      subtext: `Récord: ${stats.longestStreak} días`,
      color: 'from-red-500 to-orange-500',
      bgColor: 'from-red-50 to-orange-50',
      borderColor: 'border-red-200',
    },
  ];

  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-12 text-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 3 === 0 ? <Target className="h-8 w-8" /> : <Zap className="h-7 w-7" />}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-3 flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
            <Target className="h-10 w-10 md:h-12 md:w-12" />
            Misiones Diarias y Semanales
          </h1>
          <p className="text-xl opacity-90 md:text-2xl">
            Completa misiones para ganar recompensas increíbles
          </p>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statsCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cn(
                  'rounded-xl bg-white/95 p-6 shadow-lg backdrop-blur-sm',
                  'border-2',
                  card.borderColor,
                  'transition-all duration-300',
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'mb-4 h-14 w-14 rounded-xl',
                    'bg-gradient-to-br',
                    card.color,
                    'flex items-center justify-center',
                    'shadow-md',
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Label */}
                <div className="mb-1 text-sm font-semibold text-gray-600">{card.label}</div>

                {/* Value */}
                <div className="mb-2 text-3xl font-bold text-gray-800">{card.value}</div>

                {/* Subtext */}
                <div className="text-xs text-gray-500">{card.subtext}</div>

                {/* Progress Bar (for completed stats) */}
                {(index === 0 || index === 1) && (
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${index === 0 ? todayProgress : weekProgress}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn('h-full bg-gradient-to-r', card.color, 'rounded-full')}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent" />
    </motion.section>
  );
}
