import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ModuleProgress } from '../../types';

interface ModuleCompletionCardProps {
  module: ModuleProgress;
  onClick?: () => void;
}

export function ModuleCompletionCard({ module, onClick }: ModuleCompletionCardProps) {
  const completionPercentage = module.completion_percentage;
  const scoreColor =
    module.average_score >= 80
      ? 'text-green-500'
      : module.average_score >= 60
        ? 'text-yellow-500'
        : 'text-red-500';

  return (
    <DetectiveCard onClick={onClick} className="cursor-pointer hover:border-detective-orange">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <BookOpen className="h-6 w-6 text-detective-orange" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-bold text-detective-text">{module.module_name}</h3>
            <p className="text-xs text-detective-text-secondary">ID: {module.module_id}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-detective-text-secondary">Completitud</span>
            <span className="text-sm font-bold text-detective-text">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-detective-bg-secondary">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-detective-orange to-detective-gold transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-detective-gold" />
              <span className="text-xs text-detective-text-secondary">Score Promedio</span>
            </div>
            <p className={`text-xl font-bold ${scoreColor}`}>{module.average_score.toFixed(0)}%</p>
          </div>

          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <Users className="text-detective-accent h-4 w-4" />
              <span className="text-xs text-detective-text-secondary">Estudiantes</span>
            </div>
            <p className="text-xl font-bold text-detective-text">
              {module.students_completed}/{module.students_total}
            </p>
          </div>
        </div>

        {/* Time Stats */}
        <div className="border-detective-border flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-detective-text-secondary" />
            <span className="text-xs text-detective-text-secondary">Tiempo promedio</span>
          </div>
          <span className="text-sm font-semibold text-detective-text">
            {Math.floor(module.average_time_minutes / 60)}h {module.average_time_minutes % 60}m
          </span>
        </div>

        {/* Completion Badge */}
        {completionPercentage === 100 && (
          <div className="rounded-lg border border-green-500 bg-green-500 bg-opacity-10 p-2 text-center">
            <span className="text-sm font-semibold text-green-500">Módulo Completado</span>
          </div>
        )}
      </div>
    </DetectiveCard>
  );
}
