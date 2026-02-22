/**
 * AssignmentDetailPage - Student Assignment Detail View
 *
 * Displays assignment details, exercises list, and submission status.
 * Created as part of P0-008 gap fix.
 *
 * Route: /assignments/:id
 *
 * @created 2025-12-28
 */

import { useEffect, useState, type ComponentType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ClipboardList,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  BookOpen,
} from 'lucide-react';
import { LoadingSpinner } from '@shared/components/loading';

// API
import { studentAssignmentsAPI, type StudentAssignmentDetail } from '@/services/api/studentAssignmentsAPI';

// Hooks
import { useApiError } from '@shared/hooks';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  assigned: {
    label: 'Pendiente',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: ClipboardList,
  },
  in_progress: {
    label: 'En Progreso',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  submitted: {
    label: 'Enviada',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: CheckCircle,
  },
  graded: {
    label: 'Calificada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: GraduationCap,
  },
  late: {
    label: 'Retrasada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
  },
};

// ============================================================================
// EXERCISE CARD COMPONENT
// ============================================================================

interface ExerciseCardProps {
  exercise: StudentAssignmentDetail['exercises'][0];
  onStart: () => void;
  isGraded: boolean;
}

function ExerciseCard({ exercise, onStart, isGraded }: ExerciseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Ejercicio {exercise.orderIndex + 1}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{exercise.pointsOverride || 10} pts</span>
            {exercise.isRequired && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                Obligatorio
              </span>
            )}
          </div>
        </div>
      </div>

      {!isGraded && (
        <button
          onClick={onStart}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Play className="h-4 w-4" />
          Iniciar
        </button>
      )}
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<StudentAssignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error, handleError, clearError } = useApiError();

  // Fetch assignment detail
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;

      setIsLoading(true);
      clearError();

      try {
        const data = await studentAssignmentsAPI.getAssignmentDetail(id);
        setAssignment(data);
      } catch (err) {
        handleError(err, 'No se pudo cargar la tarea');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  // Handle exercise start
  const handleExerciseStart = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
  };

  // Status config
  const status = assignment ? statusConfig[assignment.status] || statusConfig.assigned : null;
  const StatusIcon = status?.icon || ClipboardList;

  // Due date
  const dueDate = assignment?.assignment.dueDate
    ? new Date(assignment.assignment.dueDate)
    : null;
  const isOverdue = dueDate && dueDate < new Date() && assignment?.status !== 'graded';

  return (
    <StudentPageShell>
      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/assignments')}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a Tareas</span>
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/assignments')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        )}

        {/* Assignment Detail */}
        {!isLoading && assignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Assignment Header Card */}
            <div className="overflow-hidden rounded-xl bg-white shadow-md">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="mb-2 inline-block rounded bg-white/20 px-2 py-1 text-xs capitalize">
                      {assignment.assignment.assignmentType}
                    </span>
                    <h1 className="text-2xl font-bold">{assignment.assignment.title}</h1>
                  </div>
                  {status && (
                    <div
                      className={`flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ${status.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Description */}
                {assignment.assignment.description && (
                  <p className="mb-4 text-gray-600">{assignment.assignment.description}</p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4">
                  {/* Due Date */}
                  <div
                    className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}
                  >
                    <Clock className="h-5 w-5" />
                    <span>
                      {dueDate
                        ? `Fecha límite: ${dueDate.toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}`
                        : 'Sin fecha límite'}
                    </span>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-2 text-gray-500">
                    <GraduationCap className="h-5 w-5" />
                    <span>{assignment.assignment.totalPoints} puntos</span>
                  </div>

                  {/* Score if graded */}
                  {assignment.status === 'graded' && assignment.score !== null && (
                    <div className="flex items-center gap-2 font-medium text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Calificación: {assignment.score}/{assignment.assignment.totalPoints}
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {assignment.feedback && (
                  <div className="mt-4 rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 font-medium text-blue-900">Retroalimentación del profesor</h3>
                    <p className="text-blue-800">{assignment.feedback}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exercises List */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Ejercicios ({assignment.exercises.length})
              </h2>

              {assignment.exercises.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  Esta tarea no tiene ejercicios asignados.
                </p>
              ) : (
                <div className="space-y-3">
                  {assignment.exercises
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onStart={() => handleExerciseStart(exercise.exerciseId)}
                        isGraded={assignment.status === 'graded'}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Submission Info */}
            {assignment.submission && (
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado de Entrega</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Estado:</span>{' '}
                    <span className="font-medium capitalize">{assignment.submission.status}</span>
                  </p>
                  {assignment.submission.submittedAt && (
                    <p>
                      <span className="text-gray-500">Enviado:</span>{' '}
                      {new Date(assignment.submission.submittedAt).toLocaleString('es-MX')}
                    </p>
                  )}
                  {assignment.submission.gradedAt && (
                    <p>
                      <span className="text-gray-500">Calificado:</span>{' '}
                      {new Date(assignment.submission.gradedAt).toLocaleString('es-MX')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </StudentPageShell>
  );
}
