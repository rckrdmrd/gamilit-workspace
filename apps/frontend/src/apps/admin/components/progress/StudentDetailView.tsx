/**
 * StudentDetailView Component
 *
 * Displays comprehensive student progress including module progress and recent submissions.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { User, Award, TrendingUp, Flame, BookOpen, CheckCircle, Target } from 'lucide-react';
import type { StudentProgress } from '@/services/api/adminTypes';

interface StudentDetailViewProps {
  studentProgress: StudentProgress | null;
  isLoading: boolean;
}

export const StudentDetailView = ({
  studentProgress,
  isLoading,
}: StudentDetailViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <DetectiveCard key={i} className="animate-pulse">
            <div className="h-48 rounded bg-detective-bg-secondary/50" />
          </DetectiveCard>
        ))}
      </div>
    );
  }

  if (!studentProgress) {
    return (
      <DetectiveCard>
        <p className="py-8 text-center text-detective-text-secondary">
          Selecciona un estudiante para ver su progreso
        </p>
      </DetectiveCard>
    );
  }

  const { user_info, modules_progress, recent_submissions } = studentProgress;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: { text: 'No iniciado', color: 'bg-gray-500/20 text-gray-500' },
      in_progress: { text: 'En progreso', color: 'bg-blue-500/20 text-blue-500' },
      completed: { text: 'Completado', color: 'bg-green-500/20 text-green-500' },
      reviewed: { text: 'Revisado', color: 'bg-purple-500/20 text-purple-500' },
      mastered: { text: 'Dominado', color: 'bg-detective-orange/20 text-detective-orange' },
    };
    return badges[status as keyof typeof badges] || badges.not_started;
  };

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <DetectiveCard>
        <div className="flex items-start gap-6">
          <div className="rounded-full bg-detective-orange/20 p-4">
            <User className="h-12 w-12 text-detective-orange" />
          </div>
          <div className="flex-1">
            <h2 className="mb-1 text-2xl font-bold text-detective-text">
              {user_info.display_name}
            </h2>
            <p className="mb-4 text-detective-text-secondary">{user_info.email}</p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Nivel</p>
                <p className="text-xl font-bold text-detective-text">{user_info.level}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">XP Total</p>
                <p className="text-xl font-bold text-detective-text">
                  {user_info.total_xp.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">ML Coins</p>
                <p className="text-xl font-bold text-detective-text">
                  {user_info.ml_coins.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Racha</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-detective-orange" />
                  <p className="text-xl font-bold text-detective-text">{user_info.streak_days}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DetectiveCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-detective-text-secondary">Ejercicios</p>
              <p className="text-lg font-bold text-detective-text">
                {user_info.exercises_completed}
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-detective-text-secondary">Módulos</p>
              <p className="text-lg font-bold text-detective-text">{user_info.modules_completed}</p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-detective-text-secondary">Logros</p>
              <p className="text-lg font-bold text-detective-text">
                {user_info.achievements_earned}
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-detective-orange/10 p-2">
              <TrendingUp className="h-5 w-5 text-detective-orange" />
            </div>
            <div>
              <p className="text-sm text-detective-text-secondary">Racha Máx</p>
              <p className="text-lg font-bold text-detective-text">{user_info.max_streak}</p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Modules Progress */}
      <DetectiveCard>
        <h3 className="mb-4 text-lg font-semibold text-detective-text">Progreso por Módulo</h3>
        <div className="space-y-3">
          {modules_progress.length === 0 ? (
            <p className="py-4 text-center text-detective-text-secondary">
              No hay módulos iniciados
            </p>
          ) : (
            modules_progress.map((module) => {
              const statusBadge = getStatusBadge(module.status);
              return (
                <div
                  key={module.id}
                  className="rounded-lg bg-detective-bg-secondary/30 p-4 transition-colors hover:bg-detective-bg-secondary/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-detective-text">
                        {module.module_title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-detective-text-secondary">
                        <span>
                          {module.completed_exercises} / {module.total_exercises} ejercicios
                        </span>
                        {module.average_score !== null && (
                          <span>Puntaje: {module.average_score.toFixed(1)}%</span>
                        )}
                        <span>{module.total_xp_earned} XP</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-detective-bg">
                      <div
                        className="h-full bg-detective-orange transition-all"
                        style={{ width: `${module.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-detective-text">
                      {module.progress_percentage.toFixed(0)}%
                    </span>
                  </div>

                  {module.last_accessed_at && (
                    <p className="mt-2 text-xs text-detective-text-secondary">
                      Último acceso: {formatDate(module.last_accessed_at)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DetectiveCard>

      {/* Recent Submissions */}
      <DetectiveCard>
        <h3 className="mb-4 text-lg font-semibold text-detective-text">Envíos Recientes</h3>
        <div className="space-y-2">
          {recent_submissions.length === 0 ? (
            <p className="py-4 text-center text-detective-text-secondary">
              No hay envíos recientes
            </p>
          ) : (
            recent_submissions.slice(0, 10).map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-lg bg-detective-bg-secondary/30 p-3 transition-colors hover:bg-detective-bg-secondary/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-detective-text">{submission.exercise_title}</p>
                    {submission.is_correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Target className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-detective-text-secondary">
                    {submission.exercise_type} • Intento {submission.attempt_number}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-detective-text">
                    {submission.score} / {submission.max_score}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {formatDate(submission.submitted_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DetectiveCard>
    </div>
  );
};
