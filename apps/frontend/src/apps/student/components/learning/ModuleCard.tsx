import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { UserModuleData } from '@/apps/student/hooks/useUserModules';

interface ModuleStyle {
  color: string;
  bgColor: string;
  textColor: string;
}

interface ModuleCardProps {
  module: UserModuleData;
  index: number;
  style: ModuleStyle;
  onModuleClick: (moduleId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export function ModuleCard({ module, index, style, onModuleClick }: ModuleCardProps) {
  const unlocked = module.status !== 'locked' && module.status !== 'backlog';
  const completed = module.progress === 100;

  return (
    <motion.div variants={cardVariants}>
      <DetectiveCard
        hoverable={unlocked}
        className={`relative h-full transition-all duration-200 ${
          !unlocked ? 'opacity-60 grayscale' : ''
        } ${completed ? 'ring-2 ring-green-400' : ''}`}
      >
        <button
          onClick={() => unlocked && onModuleClick(module.id)}
          disabled={!unlocked}
          className="block w-full text-left"
        >
          {/* Module Number Badge */}
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${style.color} text-2xl shadow-md`}
            >
              {unlocked ? (module.icon || '\u{1F4DA}') : <Lock className="h-6 w-6 text-white" />}
            </div>
            <div className="flex items-center gap-2">
              {completed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Completado
                </span>
              )}
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${style.bgColor} ${style.textColor}`}
              >
                M{index + 1}
              </span>
            </div>
          </div>

          {/* Title and Description */}
          <h3 className="mb-2 text-lg font-bold text-detective-text">
            {module.title}
          </h3>
          <p className="mb-4 text-sm text-detective-text-secondary">
            {module.description}
          </p>

          {/* Exercises Count */}
          <div className="mb-4 flex items-center gap-2 text-sm text-detective-text-secondary">
            <BookOpen className="h-4 w-4" />
            <span>
              {module.completedExercises} / {module.totalExercises} ejercicios
            </span>
          </div>

          {/* Progress Bar */}
          {unlocked && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-detective-text-secondary">Progreso</span>
                <span className="font-semibold text-detective-orange">
                  {module.progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${style.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${module.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Locked Message */}
          {!unlocked && index > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 text-xs text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Completa el Modulo {index} para desbloquear</span>
            </div>
          )}

          {/* CTA Arrow */}
          {unlocked && !completed && (
            <div className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-detective-orange">
              Continuar
              <ChevronRight className="h-4 w-4" />
            </div>
          )}

          {/* Stars for completed */}
          {completed && (
            <div className="mt-2 flex items-center justify-center gap-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          )}
        </button>
      </DetectiveCard>
    </motion.div>
  );
}
