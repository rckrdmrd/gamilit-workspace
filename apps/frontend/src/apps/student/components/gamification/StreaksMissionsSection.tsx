/**
 * StreaksMissionsSection Component
 *
 * Displays user's current streak, longest streak, and daily missions with progress
 */

import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Check, Clock, Coins, Zap, Gift, Calendar } from 'lucide-react';
import type { StreakData, Mission } from '../../types/gamificationTypes';

// Local helper functions for this component's specific Mission type
const getMissionProgressLocal = (mission: Mission) => {
  return {
    current: mission.progress ?? 0,
    target: mission.required ?? 0,
  };
};

const getMissionRewardsLocal = (mission: Mission) => {
  return {
    xp: mission.reward?.xp ?? 0,
    mlCoins: mission.reward?.coins ?? 0,
  };
};

interface StreaksMissionsSectionProps {
  streaks: StreakData;
  missions: Mission[];
}

export function StreaksMissionsSection({ streaks, missions }: StreaksMissionsSectionProps) {
  const handleClaimReward = (missionId: string) => {
    console.log('Claiming reward for mission:', missionId);
    // TODO: Implement claim reward API call
  };

  const getMissionProgress = (mission: Mission) => {
    return Math.min((mission.progress / mission.required) * 100, 100);
  };

  const getMissionIcon = (type: Mission['type']) => {
    switch (type) {
      case 'daily':
        return Calendar;
      case 'weekly':
        return Trophy;
      case 'special':
        return Gift;
      default:
        return Target;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Flame className="h-7 w-7 text-orange-600" />
          Rachas y Misiones
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Streaks Section */}
        <div className="space-y-4">
          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-detective-text">
                <Flame className="h-5 w-5 text-orange-600" />
                Racha Actual
              </h3>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
              >
                <Flame className="h-8 w-8 text-orange-600" fill="currentColor" />
              </motion.div>
            </div>

            <div className="mb-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
                className="inline-flex items-baseline gap-2"
              >
                <span className="text-6xl font-bold text-orange-600">{streaks.currentStreak}</span>
                <span className="text-2xl font-semibold text-orange-500">días</span>
              </motion.div>
            </div>

            <p className="mb-4 text-center text-detective-text-secondary">
              ¡Sigue así! Completa al menos un ejercicio hoy para mantener tu racha.
            </p>

            {/* Streak Visualization */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const isActive = index < streaks.currentStreak;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`flex aspect-square items-center justify-center rounded-lg ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isActive ? (
                      <Flame className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-orange-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-detective-text-secondary">Última actividad:</span>
                <span className="font-semibold text-detective-text">
                  {new Date(streaks.lastActivityDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Longest Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-detective-text">
                  <Trophy className="h-5 w-5 text-detective-gold" />
                  Mejor Racha
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-detective-gold">
                    {streaks.longestStreak}
                  </span>
                  <span className="text-lg font-semibold text-detective-text-secondary">días</span>
                </div>
              </div>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
              >
                <Trophy className="h-16 w-16 text-detective-gold" />
              </motion.div>
            </div>

            {streaks.currentStreak === streaks.longestStreak && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <p className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                  <Gift className="h-4 w-4" />
                  ¡Récord personal! Sigue así para superar tu mejor marca.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Daily Missions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-detective-text">
              <Target className="h-5 w-5 text-detective-orange" />
              Misiones Diarias
            </h3>
            <div className="flex items-center gap-1 text-xs text-detective-text-secondary">
              <Clock className="h-4 w-4" />
              <span>
                Renueva en{' '}
                {new Date(missions[0]?.expiresAt || new Date()).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {missions.slice(0, 3).map((mission, index) => {
              const Icon = getMissionIcon(mission.type);
              const progress = getMissionProgress(mission);
              const isCompleted = mission.completed;
              const isClaimed = mission.claimed;

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    isCompleted && !isClaimed
                      ? 'border-green-300 bg-green-50 shadow-md'
                      : isClaimed
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        isCompleted
                          ? 'bg-green-500'
                          : 'bg-gradient-to-br from-detective-orange to-detective-gold'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className="h-5 w-5 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-detective-text">{mission.title}</h4>
                      <p className="mb-2 text-sm text-detective-text-secondary">
                        {mission.description}
                      </p>

                      {/* Progress Bar */}
                      {!isClaimed &&
                        (() => {
                          const { current, target } = getMissionProgressLocal(mission);
                          return (
                            <>
                              <div className="mb-2 flex items-center justify-between text-xs text-detective-text-secondary">
                                <span>Progreso</span>
                                <span className="font-semibold">
                                  {current}/{target}
                                </span>
                              </div>
                              <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200">
                                <motion.div
                                  className={`h-full ${
                                    isCompleted
                                      ? 'bg-green-500'
                                      : 'bg-gradient-to-r from-detective-orange to-detective-gold'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                              </div>
                            </>
                          );
                        })()}

                      {/* Rewards */}
                      {(() => {
                        const { xp, mlCoins } = getMissionRewardsLocal(mission);
                        return (
                          <div className="mb-3 flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Coins className="h-4 w-4 text-detective-gold" />
                              <span className="font-semibold text-detective-text">
                                +{mlCoins} ML
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Zap className="h-4 w-4 text-detective-orange" />
                              <span className="font-semibold text-detective-text">+{xp} XP</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Claim Button */}
                      {isCompleted && !isClaimed && (
                        <motion.button
                          onClick={() => handleClaimReward(mission.id)}
                          disabled={true}
                          title="Próximamente"
                          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-500 opacity-60 shadow-sm transition-all"
                        >
                          <Gift className="h-4 w-4" />
                          Reclamar Recompensa
                          <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs">
                            Próximamente
                          </span>
                        </motion.button>
                      )}

                      {isClaimed && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Check className="h-4 w-4" />
                          <span>Recompensa reclamada</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {missions.length === 0 && (
            <div className="py-8 text-center text-detective-text-secondary">
              <Target className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No hay misiones disponibles en este momento</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
