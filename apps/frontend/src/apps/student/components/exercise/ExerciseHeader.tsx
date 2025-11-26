/**
 * ExerciseHeader Component
 * Header section with back button, title, difficulty, rewards, and stats
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ArrowLeft, Star, Coins, Target, Timer, TrendingUp } from 'lucide-react';

interface ExerciseHeaderProps {
  moduleId: string;
  exerciseTitle: string;
  exerciseDescription: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  xpReward: number;
  mlCoinsReward: number;
  timeLimit?: number;
  currentAttempt: number;
  maxAttempts: number;
  timeElapsed: number;
  score?: number;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  moduleId,
  exerciseTitle,
  exerciseDescription,
  difficulty,
  xpReward,
  mlCoinsReward,
  timeLimit,
  currentAttempt,
  maxAttempts,
  timeElapsed,
  score,
}) => {
  const navigate = useNavigate();

  const getDifficultyConfig = (diff: 'facil' | 'medio' | 'dificil' | 'experto') => {
    const configs = {
      facil: {
        label: 'Fácil',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: '⭐',
      },
      medio: {
        label: 'Medio',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: '⭐⭐',
      },
      dificil: {
        label: 'Difícil',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: '⭐⭐⭐',
      },
      experto: {
        label: 'Experto',
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: '⭐⭐⭐⭐',
      },
    };
    return configs[diff];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyConfig = getDifficultyConfig(difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-b-4 border-detective-orange bg-white shadow-md dark:bg-gray-800"
    >
      <div className="detective-container py-6">
        {/* Back Button */}
        <div className="mb-4">
          <DetectiveButton
            variant="blue"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(`/modules/${moduleId}`)}
          >
            Volver al Módulo
          </DetectiveButton>
        </div>

        {/* Main Header Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Title and Description */}
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-start gap-3">
              <Target className="mt-1 h-8 w-8 flex-shrink-0 text-detective-orange" />
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-detective-text lg:text-3xl">
                    {exerciseTitle}
                  </h1>
                  <span
                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${difficultyConfig.color}`}
                  >
                    {difficultyConfig.icon} {difficultyConfig.label}
                  </span>
                </div>
                <p className="leading-relaxed text-detective-text-secondary">
                  {exerciseDescription}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-detective-orange" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-detective-text">
                    Intento {currentAttempt} de {maxAttempts}
                  </span>
                  <span className="text-xs text-detective-text-secondary">
                    {Math.round((currentAttempt / maxAttempts) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentAttempt / maxAttempts) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-detective-orange to-detective-gold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-1 lg:grid-cols-1">
            {/* XP Reward */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-detective bg-gradient-to-br from-detective-orange to-orange-600 p-4 text-white shadow-lg"
            >
              <div className="mb-1 flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  Recompensa XP
                </span>
              </div>
              <p className="text-3xl font-bold">{xpReward}</p>
              <p className="mt-1 text-xs opacity-75">Puntos de experiencia</p>
            </motion.div>

            {/* ML Coins Reward */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-detective bg-gradient-to-br from-detective-gold to-yellow-600 p-4 text-white shadow-lg"
            >
              <div className="mb-1 flex items-center gap-2">
                <Coins className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  ML Coins
                </span>
              </div>
              <p className="text-3xl font-bold">{mlCoinsReward}</p>
              <p className="mt-1 text-xs opacity-75">Monedas de recompensa</p>
            </motion.div>

            {/* Timer */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-detective bg-gradient-to-br from-detective-blue to-blue-600 p-4 text-white shadow-lg"
            >
              <div className="mb-1 flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  {timeLimit ? 'Tiempo Límite' : 'Tiempo Transcurrido'}
                </span>
              </div>
              <p className="text-3xl font-bold">{formatTime(timeElapsed)}</p>
              {timeLimit && (
                <p className="mt-1 text-xs opacity-75">Límite: {formatTime(timeLimit)}</p>
              )}
            </motion.div>

            {/* Score (if available) */}
            {score !== undefined && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-detective bg-gradient-to-br from-green-500 to-green-700 p-4 text-white shadow-lg"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                    Puntuación
                  </span>
                </div>
                <p className="text-3xl font-bold">{score}</p>
                <p className="mt-1 text-xs opacity-75">Puntos actuales</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
