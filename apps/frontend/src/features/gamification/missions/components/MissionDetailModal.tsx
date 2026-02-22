/**
 * MissionDetailModal Component
 *
 * Modal that shows full mission details:
 * - Full title and description (no truncation)
 * - Objective progress bars
 * - Rewards and timer
 * - Action button (same logic as MissionCard)
 */
import { useState, useEffect, useMemo, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  BookOpen,
  Zap,
  Clock,
  Users,
  Trophy,
  Flame,
  Coins,
  Check,
  Play,
  Gift,
  Star,
  ArrowRight,
  Target,
} from 'lucide-react';
import type { Mission, MissionCategory } from '../types/missionsTypes';
import { Modal } from '@shared/components/common/Modal';
import { cn } from '@shared/utils/cn';
import { getMissionRewards } from '../utils/missionHelpers';

interface MissionDetailModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onStart?: (missionId: string) => void;
  onClaim?: (missionId: string) => void;
  onGoToExercise?: (missionId: string) => void;
}

export function MissionDetailModal({
  mission,
  isOpen,
  onClose,
  onStart,
  onClaim,
  onGoToExercise,
}: MissionDetailModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!mission?.expiresAt) {
      setTimeRemaining('Sin límite');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(mission.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else {
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [mission?.expiresAt]);

  // Handle claim with confetti
  const handleClaim = () => {
    if (!mission) return;
    setShowConfetti(true);
    onClaim?.(mission.id);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Check if this mission has exercise constraints (navigable)
  const hasExerciseConstraints = useMemo(() => {
    if (!mission) return false;
    if (mission.exercise_id) return true;
    if (mission.type !== 'special') return false;
    const firstObj = mission.objectives?.[0];
    return !!(firstObj?.required_exercise_type || firstObj?.required_module);
  }, [mission]);

  const isUrgent = mission?.expiresAt
    ? new Date(mission.expiresAt).getTime() - new Date().getTime() < 3600000
    : false;

  if (!mission) return null;

  const CategoryIcon = getCategoryIcon(mission.category);
  const { xp, mlCoins } = getMissionRewards(mission);

  const typeLabels: Record<string, string> = {
    daily: 'Diaria',
    weekly: 'Semanal',
    special: 'Especial',
  };

  const difficultyLabels: Record<string, string> = {
    easy: 'Fácil',
    medium: 'Normal',
    hard: 'Difícil',
  };

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    not_started: 'Nueva',
    in_progress: 'En Progreso',
    completed: 'Completada',
    claimed: 'Reclamada',
    expired: 'Expirada',
  };

  return (
    <>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="pointer-events-none fixed inset-0 z-[80]">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={300}
              recycle={false}
              colors={['#F59E0B', '#FB923C', '#FBBF24', '#FCD34D']}
            />
          </div>
        )}
      </AnimatePresence>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" animated title={mission.title}>
        <div className="space-y-6">
          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm">
              <CategoryIcon className="h-5 w-5 text-white" />
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {typeLabels[mission.type] || mission.type}
            </span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                difficultyColors[mission.difficulty] || 'bg-gray-100 text-gray-700',
              )}
            >
              {difficultyLabels[mission.difficulty] || mission.difficulty}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {statusLabels[mission.status] || mission.status}
            </span>
          </div>

          {/* Full description */}
          <div>
            <h4 className="mb-1 text-sm font-semibold text-gray-500">Descripción</h4>
            <p className="text-gray-700">{mission.description || 'Sin descripción'}</p>
          </div>

          {/* Objectives with individual progress */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-500">Objetivos</h4>
            <div className="space-y-3">
              {mission.objectives.map((obj, idx) => {
                const objProgress =
                  obj.target > 0 ? Math.min(Math.round((obj.current / obj.target) * 100), 100) : 0;
                return (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {obj.description ||
                          obj.type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                      <span className="font-bold text-gray-800">
                        {obj.current} / {obj.target}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${objProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          objProgress >= 100
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500',
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-500">Recompensas</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">{mlCoins} ML Coins</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{xp} XP</span>
              </div>
              {mission.bonusMultiplier && (
                <div className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">
                    {mission.bonusMultiplier}x
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Clock className={cn('h-5 w-5', isUrgent ? 'text-red-500' : 'text-gray-500')} />
            <span
              className={cn('text-sm font-semibold', isUrgent ? 'text-red-600' : 'text-gray-600')}
            >
              Renueva en: {timeRemaining}
            </span>
          </div>

          {/* Action Button */}
          <div>
            {mission.status === 'not_started' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onStart?.(mission.id);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 py-3 font-semibold text-white shadow-md transition-colors hover:bg-gray-700"
              >
                <Play className="h-5 w-5" />
                Iniciar Misión
              </motion.button>
            )}

            {mission.status === 'in_progress' && hasExerciseConstraints && onGoToExercise ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onGoToExercise(mission.id);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-semibold text-white shadow-md transition-colors hover:from-orange-600 hover:to-amber-600"
              >
                <ArrowRight className="h-5 w-5" />
                Ir al Ejercicio
              </motion.button>
            ) : mission.status === 'in_progress' ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-md">
                <Target className="h-5 w-5" />
                En Progreso
              </div>
            ) : null}

            {mission.status === 'completed' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-3 font-semibold text-white shadow-lg hover:from-green-600 hover:to-emerald-600"
              >
                <Gift className="h-5 w-5" />
                Reclamar Recompensa
              </motion.button>
            )}

            {mission.status === 'claimed' && (
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-400 py-3 font-semibold text-white shadow-md">
                <Check className="h-5 w-5" />
                Completado
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function getCategoryIcon(category: MissionCategory) {
  const icons: Record<string, ElementType> = {
    exercises: BookOpen,
    xp: Zap,
    time: Clock,
    social: Users,
    achievement: Trophy,
    streak: Flame,
  };
  return icons[category] || BookOpen;
}
