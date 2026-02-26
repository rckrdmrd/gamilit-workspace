/**
 * ExerciseSidebar Component
 * Collapsible sidebar with power-ups, hints, progress, and stats
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useMediaQuery } from '@shared/hooks/useResponsiveLayout';
import { usePowerUps } from '@/features/gamification/social/hooks/usePowerUps';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Coins,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import type { ExerciseAttempt } from '@/apps/student/hooks/useExerciseState';

interface ExerciseSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  availableCoins: number;
  currentScore: number;
  timeElapsed: number;
  hintsUsed: number;
  attempts: ExerciseAttempt[];
  bestScore: number;
  onOpenHints: () => void;
  onUsePowerUp: (powerUpId: string) => void;
  className?: string;
}

export const ExerciseSidebar = ({
  isOpen,
  onToggle,
  availableCoins,
  currentScore,
  timeElapsed,
  hintsUsed,
  attempts,
  bestScore,
  onOpenHints,
  onUsePowerUp,
  className = '',
}: ExerciseSidebarProps) => {
  const { getAvailablePowerUps, getActivePowerUps, applyPowerUp } = usePowerUps();
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [activeTab, setActiveTab] = useState<'powerups' | 'hints' | 'progress' | 'stats'>(
    'powerups',
  );

  const availablePowerUps = getAvailablePowerUps();
  const activePowerUps = getActivePowerUps();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUsePowerUp = (powerUpId: string) => {
    applyPowerUp(powerUpId);
    onUsePowerUp(powerUpId);
  };

  const tabs = [
    { id: 'powerups', label: 'Power-ups', icon: Zap },
    { id: 'hints', label: 'Pistas', icon: Lightbulb },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <>
      {/* Toggle Button - Mobile */}
      <motion.button
        onClick={onToggle}
        className="fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-l-detective bg-detective-orange p-3 text-white shadow-lg lg:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || isLargeScreen) && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed right-0 top-0 z-30 h-screen w-[min(320px,calc(100vw-2rem))] sm:w-80
              overflow-y-auto bg-white shadow-2xl dark:bg-gray-800
              lg:sticky lg:h-auto lg:w-full lg:shadow-none
              ${className}
            `}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-detective-orange to-detective-gold p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Panel Lateral</h2>
                <button
                  onClick={onToggle}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20 lg:hidden"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* ML Coins Display */}
              <div className="flex items-center gap-2 rounded-detective bg-white/20 px-4 py-2">
                <Coins className="h-5 w-5 text-white" />
                <span className="font-bold text-white">{availableCoins} ML Coins</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-2 dark:bg-gray-900">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as 'powerups' | 'hints' | 'progress' | 'stats')
                    }
                    className={`
                      rounded-detective p-3 text-xs font-semibold transition-all
                      ${
                        activeTab === tab.id
                          ? 'bg-detective-orange text-white shadow-lg'
                          : 'bg-white text-detective-text-secondary hover:bg-gray-50 dark:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="mx-auto mb-1 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="space-y-4 p-4">
              {/* Power-ups Tab */}
              {activeTab === 'powerups' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-detective-text">
                    Power-ups Disponibles
                  </h3>

                  {/* Active Power-ups */}
                  {activePowerUps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-detective-text-secondary">ACTIVOS</p>
                      {activePowerUps.map((powerUp) => (
                        <div
                          key={powerUp.powerUpId}
                          className="rounded-detective border-2 border-green-500 bg-green-50 p-3 dark:bg-green-900/20"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-detective-text">
                              {powerUp.name}
                            </span>
                          </div>
                          <p className="text-xs text-detective-text-secondary">
                            {Math.floor(powerUp.remainingTime / 60)}m {powerUp.remainingTime % 60}s
                            restantes
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Available Power-ups */}
                  {availablePowerUps.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-detective-text-secondary">
                          DISPONIBLES
                        </p>
                        {availablePowerUps.length > 2 && (
                          <p className="text-xs text-detective-text-secondary">
                            {availablePowerUps.length} items
                          </p>
                        )}
                      </div>
                      <div
                        className="space-y-2 overflow-y-auto overscroll-contain pr-2 max-h-[40vh] sm:max-h-[260px]"
                      >
                        {availablePowerUps.map((powerUp) => (
                          <motion.div
                            key={powerUp.id}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-detective border-2 border-detective-orange bg-white p-3 dark:bg-gray-900"
                          >
                            <div className="mb-2 flex items-start gap-2">
                              <Zap className="h-5 w-5 flex-shrink-0 text-detective-orange" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-detective-text">
                                  {powerUp.name}
                                </p>
                                <p className="text-xs text-detective-text-secondary">
                                  {powerUp.description}
                                </p>
                              </div>
                            </div>
                            <DetectiveButton
                              variant="primary"
                              onClick={() => handleUsePowerUp(powerUp.id)}
                              className="w-full"
                              disabled={powerUp.status !== 'available'}
                            >
                              Usar Power-up
                            </DetectiveButton>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm italic text-detective-text-secondary">
                      No tienes power-ups disponibles
                    </p>
                  )}
                </motion.div>
              )}

              {/* Hints Tab */}
              {activeTab === 'hints' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-detective-text">
                    Sistema de Pistas
                  </h3>

                  <DetectiveCard variant="gold" padding="md">
                    <div className="space-y-3 text-center">
                      <Lightbulb className="mx-auto h-12 w-12 text-detective-gold" />
                      <p className="text-sm text-detective-text">
                        ¿Necesitas ayuda? Usa pistas para avanzar en el ejercicio
                      </p>
                      <DetectiveButton
                        variant="gold"
                        onClick={onOpenHints}
                        icon={<Lightbulb className="h-4 w-4" />}
                        className="w-full"
                      >
                        Ver Pistas
                      </DetectiveButton>
                      <p className="text-xs text-detective-text-secondary">
                        Pistas usadas: {hintsUsed}
                      </p>
                    </div>
                  </DetectiveCard>
                </motion.div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-detective-text">
                    Intentos Anteriores
                  </h3>

                  {attempts.length > 0 ? (
                    <div className="space-y-2">
                      {attempts.map((attempt, index) => (
                        <DetectiveCard key={attempt.id} variant="default" padding="sm">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-detective-text-secondary">
                              Intento {index + 1}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${
                                attempt.completed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {attempt.completed ? 'Completado' : 'Incompleto'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-detective-text-secondary">Puntuación</p>
                              <p className="font-bold text-detective-text">{attempt.score}</p>
                            </div>
                            <div>
                              <p className="text-detective-text-secondary">Tiempo</p>
                              <p className="font-bold text-detective-text">
                                {formatTime(attempt.time_spent)}
                              </p>
                            </div>
                          </div>
                        </DetectiveCard>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm italic text-detective-text-secondary">
                      Aún no hay intentos registrados
                    </p>
                  )}
                </motion.div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-detective-text">
                    Estadísticas
                  </h3>

                  <div className="space-y-3">
                    {/* Current Score */}
                    <DetectiveCard variant="default" padding="md">
                      <div className="flex items-center gap-3">
                        <Target className="h-8 w-8 text-detective-orange" />
                        <div>
                          <p className="text-xs text-detective-text-secondary">Puntuación Actual</p>
                          <p className="text-2xl font-bold text-detective-text">{currentScore}</p>
                        </div>
                      </div>
                    </DetectiveCard>

                    {/* Best Score */}
                    <DetectiveCard variant="gold" padding="md">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-detective-gold" />
                        <div>
                          <p className="text-xs text-detective-text-secondary">Mejor Puntuación</p>
                          <p className="text-2xl font-bold text-detective-text">{bestScore}</p>
                        </div>
                      </div>
                    </DetectiveCard>

                    {/* Time */}
                    <DetectiveCard variant="default" padding="md">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-detective-blue" />
                        <div>
                          <p className="text-xs text-detective-text-secondary">Tiempo</p>
                          <p className="text-2xl font-bold text-detective-text">
                            {formatTime(timeElapsed)}
                          </p>
                        </div>
                      </div>
                    </DetectiveCard>

                    {/* Hints Used */}
                    <DetectiveCard variant="default" padding="md">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-8 w-8 text-detective-gold" />
                        <div>
                          <p className="text-xs text-detective-text-secondary">Pistas Usadas</p>
                          <p className="text-2xl font-bold text-detective-text">{hintsUsed}</p>
                        </div>
                      </div>
                    </DetectiveCard>

                    {/* Total Attempts */}
                    <DetectiveCard variant="default" padding="md">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-detective-orange" />
                        <div>
                          <p className="text-xs text-detective-text-secondary">Total Intentos</p>
                          <p className="text-2xl font-bold text-detective-text">
                            {attempts.length}
                          </p>
                        </div>
                      </div>
                    </DetectiveCard>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};
