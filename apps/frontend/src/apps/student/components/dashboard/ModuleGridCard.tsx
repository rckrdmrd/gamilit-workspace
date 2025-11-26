import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Star } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { Module } from '@shared/types';

interface ModuleGridCardProps {
  module: Module;
  onClick?: () => void;
  index?: number;
}

export function ModuleGridCard({ module, onClick, index = 0 }: ModuleGridCardProps) {
  const progress = module.progress ?? 0;
  const isCompleted = progress === 100;
  const isInProgress = progress > 0 && progress < 100;
  const isLocked = module.is_locked || false; // Support for locked modules
  const isClickable = !isLocked && onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={isClickable ? { y: -4, scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      className="relative"
    >
      <DetectiveCard
        onClick={isClickable ? onClick : undefined}
        className={`flex h-full min-h-[44px] touch-manipulation flex-col ${
          isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${isLocked ? 'opacity-60 grayscale' : ''} border-2 ${
          isCompleted
            ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
            : isLocked
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-200'
        }`}
      >
        {/* Lock overlay for locked modules - Fidelity to base projects */}
        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-full bg-gray-600 p-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Módulo Bloqueado</p>
            </div>
          </div>
        )}

        {/* Completion badge - Aligned with base projects */}
        {isCompleted && (
          <div className="absolute -right-3 -top-3 z-20 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 shadow-lg shadow-yellow-300/50">
            <Star className="h-5 w-5 fill-white text-white" />
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className={`rounded-lg p-3 ${
                isCompleted
                  ? 'bg-detective-success/10'
                  : isInProgress
                    ? 'bg-detective-orange/10'
                    : 'bg-detective-bg-secondary'
              }`}
              whileHover={!isLocked ? { rotate: 360 } : undefined}
              transition={{ duration: 0.5 }}
            >
              <BookOpen
                className={`h-12 w-12 ${
                  isCompleted
                    ? 'text-detective-success'
                    : isInProgress
                      ? 'text-detective-orange'
                      : 'text-detective-text-secondary'
                }`}
              />
            </motion.div>

            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <CheckCircle className="h-5 w-5 text-detective-success" />
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded bg-detective-bg-secondary px-2 py-1 text-xs font-semibold text-detective-text">
            <Clock className="h-3 w-3" />
            <span>
              {module.completed_exercises}/{module.exercises_count}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4 flex-1">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-detective-text">
            {module.title}
          </h3>
          <p className="line-clamp-2 text-sm text-detective-text-secondary">{module.description}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-detective-text">Progreso</span>
            <span className="text-xs font-bold text-detective-orange">{progress}%</span>
          </div>

          <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-detective-success to-detective-success'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-detective-bg-secondary pt-3">
          <div className="flex items-center gap-1 text-xs text-detective-text-secondary">
            <Star className="h-3 w-3 fill-detective-gold text-detective-gold" />
            <span>{Math.round((progress / 100) * 50)} pts</span>
          </div>

          {isInProgress && (
            <span className="rounded bg-detective-orange/10 px-2 py-1 text-xs font-medium text-detective-orange">
              En progreso
            </span>
          )}

          {isCompleted && (
            <span className="rounded bg-detective-success/10 px-2 py-1 text-xs font-medium text-detective-success">
              Completado
            </span>
          )}

          {!isInProgress && !isCompleted && (
            <span className="rounded bg-detective-bg-secondary px-2 py-1 text-xs font-medium text-detective-text-secondary">
              Sin iniciar
            </span>
          )}
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
