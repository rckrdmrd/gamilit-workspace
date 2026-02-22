/**
 * GamificationHero Component
 *
 * Hero section displaying user's current rank, XP progress, ML Coins balance, and stats
 * Features animations and gradient backgrounds following detective theme
 */

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Coins, Zap, TrendingUp, Award, Star } from 'lucide-react';
import { MAYA_RANKS as MAYA_RANKS_SSOT, type MayaRank } from '@/shared/constants/ranks.constants';
import type { RankData } from '../../hooks/useDashboardData';

interface GamificationHeroProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
  };
  rankData: RankData;
  mlCoins: number;
  currentXP: number;
  nextRankXP: number;
}

/** Local gradient mapping per rank (Tailwind classes, not in SSOT) */
const RANK_GRADIENT_MAP: Record<string, string> = {
  '#8B4513': 'from-gray-600 to-gray-800',
  '#CD7F32': 'from-blue-600 to-blue-800',
  '#C0C0C0': 'from-purple-600 to-purple-800',
  '#FFD700': 'from-orange-600 to-red-700',
  '#9B59B6': 'from-yellow-500 to-orange-600',
};

function getRankDisplay(rankName: string) {
  const ssot = MAYA_RANKS_SSOT[rankName as MayaRank];
  if (!ssot) {
    return { name: rankName, icon: '🌱', color: 'from-gray-600 to-gray-800', level: 1 };
  }
  return {
    name: `${ssot.name} - ${ssot.description.split(' - ')[1] || ssot.description}`,
    icon: ssot.icon,
    color: RANK_GRADIENT_MAP[ssot.color] || 'from-gray-600 to-gray-800',
    level: ssot.level,
  };
}

export function GamificationHero({
  rankData,
  mlCoins,
  currentXP,
  nextRankXP,
}: GamificationHeroProps) {
  const rankInfo = getRankDisplay(rankData.currentRank);
  const progressPercent = (currentXP / nextRankXP) * 100;
  const xpRemaining = nextRankXP - currentXP;

  // Animated counters
  const coinsSpring = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  const xpSpring = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    coinsSpring.set(mlCoins);
    xpSpring.set(currentXP);
  }, [mlCoins, currentXP, coinsSpring, xpSpring]);

  const displayCoins = useTransform(coinsSpring, (value) => Math.round(value).toLocaleString());

  const displayXP = useTransform(xpSpring, (value) => Math.round(value).toLocaleString());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: 'linear',
          }}
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          {/* Left: Rank Badge */}
          <div className="flex flex-col items-center text-center lg:w-1/4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 },
              }}
              className="relative mb-4"
            >
              <div
                className={`h-32 w-32 rounded-full bg-gradient-to-br ${rankInfo.color} flex items-center justify-center border-4 border-white/30 text-6xl shadow-2xl`}
              >
                {rankInfo.icon}
              </div>

              {/* Floating particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-yellow-400"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: [0, Math.random() * 40 - 20],
                    y: [0, Math.random() * 40 - 20],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + i,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 text-3xl font-bold text-white"
            >
              {rankInfo.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/80"
            >
              Nivel {rankInfo.level} • {rankData.currentRank}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="font-bold text-white">{rankData.multiplier}x Multiplicador</span>
            </motion.div>
          </div>

          {/* Center: XP Progress */}
          <div className="w-full flex-1 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-2 text-lg font-semibold text-white/90">
                Tu Progreso de un Vistazo
              </h3>

              {/* XP Progress Bar */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/80">Progreso al siguiente rango</span>
                  <span className="text-lg font-bold text-white">
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                <div className="relative h-8 overflow-hidden rounded-full border border-white/20 bg-black/30 backdrop-blur-sm">
                  <motion.div
                    className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 pr-4"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 20,
                      delay: 0.5,
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                    >
                      <Star className="h-5 w-5 text-white" fill="white" />
                    </motion.div>

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'linear',
                        repeatDelay: 1,
                      }}
                    />
                  </motion.div>

                  {/* XP text inside bar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      <motion.span>{displayXP}</motion.span> / {nextRankXP.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-sm text-white/70">
                  {xpRemaining.toLocaleString()} XP restantes para subir de rango
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-xs text-white/80">Nivel</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{rankInfo.level}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    <span className="text-xs text-white/80">XP Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    <motion.span>{displayXP}</motion.span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-300" />
                    <span className="text-xs text-white/80">Multiplicador</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{rankData.multiplier}x</p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right: ML Coins */}
          <div className="w-full lg:w-1/4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border-4 border-white/30 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                >
                  <Coins className="h-12 w-12 text-white drop-shadow-lg" />
                </motion.div>
              </div>

              <h3 className="mb-2 text-center text-sm font-semibold text-white/90">
                Saldo ML Coins
              </h3>

              <motion.div
                className="text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  delay: 0.6,
                }}
              >
                <motion.p className="mb-1 text-5xl font-bold text-white drop-shadow-lg">
                  <motion.span>{displayCoins}</motion.span>
                </motion.p>
                <p className="text-lg font-semibold text-white/80">ML</p>
              </motion.div>

              {/* Floating coin animation */}
              <div className="relative mt-4 h-8">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 -translate-x-1/2 transform"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                      y: [-30, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.3,
                      ease: 'easeOut',
                    }}
                  >
                    <Coins className="h-6 w-6 text-white" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
}
