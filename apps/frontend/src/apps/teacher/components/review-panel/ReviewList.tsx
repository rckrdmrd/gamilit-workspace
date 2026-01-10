import React from 'react';
import { Clock, User, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
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
export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading,
  error,
  onSelectReview,
  onRefresh,
}) => {
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
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Pendiente
          </span>
        );
      case 'in_progress':
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            En Progreso
          </span>
        );
      case 'completed':
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Completada
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
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
      <div className="rounded-detective bg-white p-12 text-center shadow-card">
        <ClipboardList className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          No hay revisiones pendientes
        </h3>
        <p className="mt-2 text-gray-600">
          Excelente trabajo! Todas las revisiones están al día.
        </p>
        <button
          onClick={onRefresh}
          className="mt-6 flex items-center gap-2 mx-auto rounded-detective bg-detective-orange px-6 py-2 text-white hover:bg-detective-orange/90"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
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

      {/* Reviews Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => onSelectReview(review)}
            className="group cursor-pointer rounded-detective border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-detective-orange"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-detective-orange">
                  {review.exercise?.title || 'Ejercicio sin título'}
                </h3>
                <p className="text-sm text-gray-600">
                  Módulo: {review.exercise?.moduleId || 'N/A'}
                </p>
              </div>
              {getStatusBadge(review.status)}
            </div>

            {/* Student Info */}
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              <span>{review.student?.name || 'Estudiante desconocido'}</span>
            </div>

            {/* Exercise Info */}
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-700">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>{review.exercise?.title || 'Sin título'}</span>
            </div>

            {/* Date - FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Usar fecha de envío del submission */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Enviado {formatDate(review.submission?.submitted_at || review.submission?.submittedAt || review.createdAt)}</span>
            </div>

            {/* Progress Indicator */}
            {review.status === 'in_progress' && review.evaluations && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progreso</span>
                  <span>
                    {review.evaluations.length} / {review.rubric.length} criterios
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${(review.evaluations.length / review.rubric.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Dummy import to satisfy the component (remove if not needed)
const ClipboardList = Clock;

export default ReviewList;
