

import { Clock, User, AlertCircle, RefreshCw, CheckCircle, PlayCircle } from 'lucide-react';
import { ManualReview } from '@/shared/api/manualReviewApi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * ReviewList Props
 */
export interface ReviewListProps {
  reviews: ManualReview[];
  loading: boolean;
  error: string | null;
  onSelectReview: (review: ManualReview) => void;
  onRefresh: () => void;
}

/**
 * ReviewList Component
 *
 * Displays a list of pending reviews for teachers.
 */
export const ReviewList = ({
  reviews,
  loading,
  error,
  onSelectReview,
  onRefresh,
}: ReviewListProps) => {
  /**
   * Format date for display
   */
  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  /**
   * TASK-2026-01-18-013: Get status badge mejorado con iconos y colores distintivos
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-inset ring-blue-200">
            <PlayCircle className="h-3 w-3" />
            En Progreso
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-inset ring-green-200">
            <CheckCircle className="h-3 w-3" />
            Completada
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-200">
            <AlertCircle className="h-3 w-3" />
            Devuelta
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 ring-1 ring-inset ring-gray-200">
            {status}
          </span>
        );
    }
  };

  /**
   * TASK-2026-01-18-013: Get card border color based on status
   */
  const getCardBorderClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-4 border-l-amber-400 hover:border-l-amber-500';
      case 'in_progress':
        return 'border-l-4 border-l-blue-400 hover:border-l-blue-500';
      case 'completed':
        return 'border-l-4 border-l-green-400 hover:border-l-green-500';
      case 'returned':
        return 'border-l-4 border-l-red-400 hover:border-l-red-500';
      default:
        return 'border-l-4 border-l-gray-300 hover:border-l-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="rounded-detective bg-white p-12 text-center shadow-card">
        <RefreshCw className="mx-auto h-12 w-12 animate-spin text-detective-orange" />
        <p className="mt-4 text-gray-600">Cargando revisiones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-detective bg-red-50 p-6 shadow-card">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar revisiones</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="mt-4 rounded-detective bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-gray-200">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          No hay revisiones en esta categoria
        </h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          No se encontraron revisiones con los filtros seleccionados.
          Prueba cambiando los filtros o actualiza la lista.
        </p>
        <button
          onClick={onRefresh}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-2.5 text-white font-medium hover:bg-detective-orange/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-detective border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* TASK-2026-01-18-013: Reviews Grid con mejor visualización de estados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => onSelectReview(review)}
            className={`group cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-lg border border-gray-200 ${getCardBorderClass(review.status)}`}
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-detective-orange truncate">
                  {review.exercise?.title || 'Ejercicio sin título'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Módulo {review.exercise?.moduleId?.slice(-1) || '?'}
                </p>
              </div>
              {getStatusBadge(review.status)}
            </div>

            {/* Student Info con avatar placeholder */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-detective-orange/20 to-detective-orange/40 text-detective-orange">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">
                  {review.student?.name || 'Estudiante desconocido'}
                </p>
                {review.student?.email && (
                  <p className="text-xs text-gray-500 truncate">
                    {review.student.email}
                  </p>
                )}
              </div>
            </div>

            {/* Fecha de envío con formato mejorado */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Enviado {formatDate(review.submission?.submitted_at || review.submission?.submittedAt || review.createdAt)}</span>
            </div>

            {/* Puntaje (solo para completadas) */}
            {review.status === 'completed' && review.totalScore !== undefined && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Calificación</span>
                  <span className={`text-lg font-bold ${
                    review.totalScore >= 80 ? 'text-green-600' :
                    review.totalScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {review.totalScore}/100
                  </span>
                </div>
              </div>
            )}

            {/* Progress Indicator para in_progress */}
            {/* FIX AUDIT-TASK-008: Verificar rubric antes de acceder a .length */}
            {review.status === 'in_progress' && review.evaluations && review.rubric && review.rubric.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                  <span>Progreso de evaluación</span>
                  <span className="font-medium">
                    {review.evaluations.length} / {review.rubric.length} criterios
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                    style={{
                      width: `${(review.evaluations.length / review.rubric.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Indicador de acción requerida para pendientes */}
            {review.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Requiere tu revisión</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
