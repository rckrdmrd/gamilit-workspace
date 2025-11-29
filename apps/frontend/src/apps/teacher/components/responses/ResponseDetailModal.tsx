/**
 * ResponseDetailModal Component
 *
 * Displays detailed information about a student's exercise attempt including:
 * - Student info
 * - Exercise info
 * - Submitted answer
 * - Correct answer
 * - Visual comparison
 * - Metrics (score, time, hints, comodines)
 * - Rewards (XP, ML Coins)
 *
 * @component
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Zap,
  Award,
  Coins,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { useAttemptDetail } from '@apps/teacher/hooks/useExerciseResponses';

// ============================================================================
// TYPES
// ============================================================================

interface ResponseDetailModalProps {
  attemptId: string | null;
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-detective-orange/10 text-detective-orange">
          {icon}
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const MetricBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}> = ({ icon, label, value, color = 'bg-blue-50 text-blue-700 border-blue-200' }) => {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${color}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
};

const AnswerComparison: React.FC<{
  studentAnswer: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
}> = ({ studentAnswer, correctAnswer }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Respuesta del Estudiante */}
      <div className="rounded-xl border-2 border-orange-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-gray-800">Respuesta del Estudiante</h4>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
            {JSON.stringify(studentAnswer, null, 2)}
          </pre>
        </div>
      </div>

      {/* Respuesta Correcta */}
      <div className="rounded-xl border-2 border-green-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-bold text-gray-800">Respuesta Correcta</h4>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
            {JSON.stringify(correctAnswer, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" />
      <p className="font-medium text-gray-600">Cargando detalles...</p>
    </div>
  );
};

const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-800">Error al cargar</h3>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  attemptId,
  open,
  onClose,
}) => {
  const { data: attempt, isLoading, error } = useAttemptDetail(attemptId, open);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative my-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="to-detective-yellow flex items-center justify-between bg-gradient-to-r from-detective-orange px-6 py-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                <FileText className="h-6 w-6" />
                Detalle de Respuesta
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
              {isLoading && <LoadingState />}

              {error && <ErrorState message={error.message} />}

              {attempt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Student & Exercise Info */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={<User className="h-5 w-5" />}
                      title="Información del Estudiante"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                          {attempt.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{attempt.student_name}</p>
                          <p className="text-sm text-gray-500">Intento #{attempt.attempt_number}</p>
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard
                      icon={<BookOpen className="h-5 w-5" />}
                      title="Información del Ejercicio"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{attempt.exercise_title}</p>
                        <p className="mt-1 text-sm text-gray-600">Módulo: {attempt.module_name}</p>
                        <p className="text-sm text-gray-600">
                          Tipo: <span className="font-medium">{attempt.exercise_type}</span>
                        </p>
                      </div>
                    </InfoCard>
                  </div>

                  {/* Result Badge */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex items-center gap-3 rounded-2xl border-2 px-6 py-4 ${
                        attempt.is_correct
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      {attempt.is_correct ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resultado</p>
                        <p
                          className={`text-2xl font-bold ${
                            attempt.is_correct ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {attempt.is_correct ? 'Correcto' : 'Incorrecto'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <MetricBadge
                      icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                      label="Puntaje"
                      value={`${attempt.score}/${attempt.max_score}`}
                      color="bg-blue-50 text-blue-700 border-blue-200"
                    />
                    <MetricBadge
                      icon={<Clock className="h-5 w-5 text-purple-600" />}
                      label="Tiempo"
                      value={formatTime(attempt.time_spent_seconds)}
                      color="bg-purple-50 text-purple-700 border-purple-200"
                    />
                    <MetricBadge
                      icon={<Lightbulb className="h-5 w-5 text-orange-600" />}
                      label="Pistas"
                      value={attempt.hints_used}
                      color="bg-orange-50 text-orange-700 border-orange-200"
                    />
                    <MetricBadge
                      icon={<Zap className="h-5 w-5 text-yellow-600" />}
                      label="Comodines"
                      value={attempt.comodines_used.length}
                      color="bg-yellow-50 text-yellow-700 border-yellow-200"
                    />
                  </div>

                  {/* Rewards */}
                  <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
                      <Award className="h-5 w-5 text-purple-600" />
                      Recompensas Obtenidas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">XP Ganado</p>
                          <p className="text-lg font-bold text-purple-700">
                            {attempt.xp_earned} XP
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                          <Coins className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">ML Coins</p>
                          <p className="text-lg font-bold text-yellow-700">
                            {attempt.ml_coins_earned} 🪙
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer Comparison */}
                  <div>
                    <h3 className="mb-3 text-lg font-bold text-gray-800">
                      Comparación de Respuestas
                    </h3>
                    <AnswerComparison
                      studentAnswer={attempt.submitted_answers}
                      correctAnswer={attempt.correct_answer}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Fecha de envío:</span>{' '}
                      {formatDate(attempt.submitted_at)}
                    </p>
                    {attempt.comodines_used.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Comodines usados:</span>{' '}
                        {attempt.comodines_used.join(', ')}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
