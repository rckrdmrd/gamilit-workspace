/**
 * ExerciseHistory Component
 *
 * ISSUE: #5.1 (P0) - Exercise History & Feedback
 * FECHA: 2025-11-04
 * SPRINT: Sprint 3
 *
 * Muestra el historial de intentos de un ejercicio
 *
 * Features:
 * - Lista de todos los intentos
 * - Detalles por intento: fecha, score, tiempo
 * - Respuesta dada y respuesta correcta
 * - XP y ML Coins ganados
 * - Timeline visual
 * - Filtros por resultado
 */

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Coins,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExerciseHistoryProps {
  exerciseId: string;
  userId: string;
  maxAttempts?: number;
  showAnswers?: boolean;
}

interface AttemptWithDetails {
  id: string;
  user_id: string;
  exercise_id: string;
  attempt_number: number;
  answer: string;
  is_correct: boolean;
  xp_earned: number;
  ml_coins_earned: number;
  time_spent_seconds: number;
  submitted_at: Date;
  answer_given?: string | string[];
  correct_answer?: string | string[];
  expanded?: boolean;
  score_percentage?: number;
}

export const ExerciseHistory = ({
  exerciseId,
  userId,
  showAnswers = true,
}: ExerciseHistoryProps) => {
  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedAttempts, setExpandedAttempts] = useState<Set<string>>(new Set());

  // Fetch attempts
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const data = await progressApi.getExerciseAttempts(userId, exerciseId);

        // Mock data for demonstration
        const mockAttempts: AttemptWithDetails[] = [
          {
            id: '1',
            user_id: userId,
            exercise_id: exerciseId,
            attempt_number: 3,
            answer: 'option-c',
            is_correct: true,
            score_percentage: 100,
            xp_earned: 50,
            ml_coins_earned: 10,
            time_spent_seconds: 45,
            submitted_at: new Date('2025-11-04T10:30:00'),
            answer_given: 'C',
            correct_answer: 'C',
          },
          {
            id: '2',
            user_id: userId,
            exercise_id: exerciseId,
            attempt_number: 2,
            answer: 'option-b',
            is_correct: false,
            score_percentage: 0,
            xp_earned: 0,
            ml_coins_earned: 0,
            time_spent_seconds: 30,
            submitted_at: new Date('2025-11-04T10:25:00'),
            answer_given: 'B',
            correct_answer: 'C',
          },
          {
            id: '3',
            user_id: userId,
            exercise_id: exerciseId,
            attempt_number: 1,
            answer: 'option-a',
            is_correct: false,
            score_percentage: 0,
            xp_earned: 0,
            ml_coins_earned: 0,
            time_spent_seconds: 60,
            submitted_at: new Date('2025-11-04T10:20:00'),
            answer_given: 'A',
            correct_answer: 'C',
          },
        ];

        setAttempts(mockAttempts);
      } catch (error) {
        console.error('Failed to fetch attempts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [exerciseId, userId]);

  // Filter attempts
  const filteredAttempts = attempts.filter((attempt) => {
    if (filter === 'all') return true;
    if (filter === 'correct') return attempt.is_correct;
    if (filter === 'incorrect') return !attempt.is_correct;
    return true;
  });

  // Toggle attempt details
  const toggleExpanded = (attemptId: string) => {
    setExpandedAttempts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attemptId)) {
        newSet.delete(attemptId);
      } else {
        newSet.add(attemptId);
      }
      return newSet;
    });
  };

  // Calculate statistics
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.is_correct).length;
  const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const bestScore = Math.max(...attempts.map((a) => a.score_percentage ?? 0), 0);
  const totalXP = attempts.reduce((sum, a) => sum + a.xp_earned, 0);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
        <p className="mt-3 text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Sin intentos aún</h3>
        <p className="text-gray-600">Este ejercicio no tiene intentos registrados todavía.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="mb-2 text-xl font-bold text-gray-900">Historial de Intentos</h3>
        <p className="text-sm text-gray-600">{totalAttempts} intento(s) registrado(s)</p>
      </div>

      {/* Statistics */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalAttempts}</div>
            <div className="mt-1 text-xs text-gray-600">Total Intentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <div className="mt-1 text-xs text-gray-600">Tasa de éxito</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{bestScore}%</div>
            <div className="mt-1 text-xs text-gray-600">Mejor puntuación</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalXP}</div>
            <div className="mt-1 text-xs text-gray-600">XP Total ganado</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-3">
        <span className="text-sm font-semibold text-gray-600">Filtrar:</span>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos ({attempts.length})
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'correct'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Correctos ({correctAttempts})
        </button>
        <button
          onClick={() => setFilter('incorrect')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            filter === 'incorrect'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Incorrectos ({totalAttempts - correctAttempts})
        </button>
      </div>

      {/* Timeline */}
      <div className="max-h-[500px] overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {filteredAttempts.map((attempt, index) => {
            const isExpanded = expandedAttempts.has(attempt.id);
            const isLatest = index === 0;

            return (
              <div
                key={attempt.id}
                className={`
                  relative rounded-lg border-2 transition-all
                  ${
                    attempt.is_correct ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                  }
                  ${isLatest ? 'ring-2 ring-purple-400' : ''}
                `}
              >
                {/* Main info */}
                <button onClick={() => toggleExpanded(attempt.id)} className="w-full p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <div
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-full
                          ${attempt.is_correct ? 'bg-green-600' : 'bg-red-600'}
                        `}
                      >
                        {attempt.is_correct ? (
                          <Check className="h-6 w-6 text-white" />
                        ) : (
                          <X className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Attempt info */}
                      <div>
                        <div className="font-semibold text-gray-900">
                          Intento #{attempt.attempt_number}
                          {isLatest && (
                            <span className="ml-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs text-white">
                              Más reciente
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(attempt.submitted_at)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTime(attempt.time_spent_seconds ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score and rewards */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {attempt.score_percentage}%
                        </div>
                        {attempt.is_correct && (
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="flex items-center font-semibold text-purple-600">
                              <Zap className="mr-0.5 h-3 w-3" />+{attempt.xp_earned}
                            </span>
                            <span className="flex items-center font-semibold text-yellow-600">
                              <Coins className="mr-0.5 h-3 w-3" />+{attempt.ml_coins_earned}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Expand icon */}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && showAnswers && (
                  <div className="border-t border-gray-200 bg-white px-4 pb-4">
                    <div className="space-y-3 pt-4">
                      {/* Answer given */}
                      <div>
                        <div className="mb-1 text-xs font-semibold text-gray-700">
                          Respuesta dada:
                        </div>
                        <div
                          className={`
                            rounded-lg border-2 p-3 font-medium
                            ${
                              attempt.is_correct
                                ? 'border-green-300 bg-green-50 text-green-900'
                                : 'border-red-300 bg-red-50 text-red-900'
                            }
                          `}
                        >
                          {Array.isArray(attempt.answer_given)
                            ? attempt.answer_given.join(', ')
                            : attempt.answer_given}
                        </div>
                      </div>

                      {/* Correct answer (if incorrect) */}
                      {!attempt.is_correct && attempt.correct_answer && (
                        <div>
                          <div className="mb-1 text-xs font-semibold text-gray-700">
                            Respuesta correcta:
                          </div>
                          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-3 font-medium text-green-900">
                            {Array.isArray(attempt.correct_answer)
                              ? attempt.correct_answer.join(', ')
                              : attempt.correct_answer}
                          </div>
                        </div>
                      )}

                      {/* Additional stats */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="rounded-lg bg-gray-50 p-2">
                          <div className="text-xs text-gray-600">Tiempo empleado</div>
                          <div className="font-semibold text-gray-900">
                            {formatTime(attempt.time_spent_seconds ?? 0)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <div className="text-xs text-gray-600">Puntuación</div>
                          <div className="font-semibold text-gray-900">
                            {attempt.score_percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {filteredAttempts.length === 0 && filter !== 'all' && (
        <div className="border-t border-gray-200 px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            No hay intentos que coincidan con el filtro seleccionado.
          </p>
        </div>
      )}
    </div>
  );
};
