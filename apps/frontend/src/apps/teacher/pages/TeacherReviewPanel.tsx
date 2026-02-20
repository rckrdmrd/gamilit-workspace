import React, { useState, useMemo } from 'react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';
import { ClipboardList, Search, Filter, Clock, CheckCircle, List, AlertCircle } from 'lucide-react';
import { ManualReview, ReviewStatus } from '@/shared/api/manualReviewApi';
// TASK-2026-01-18-012: Usar useMyReviews con soporte de status
import { useMyReviews, useManualReviewDetail } from '../hooks/useManualReviews';
import { ReviewList, ReviewDetail } from '../components/review-panel';
// TASK-2026-01-18-009: Consume from API instead of hardcoded constants
import { useManualReviewConfig, filterExercisesByModule } from '../hooks/useManualReviewConfig';

// TASK-2026-01-18-012: Tipo para filtro de status
type StatusFilter = ReviewStatus | 'all';

/**
 * TASK-2026-01-18-013: StatusTab Component para mejor separación visual
 * Muestra tabs con contadores y colores distintivos
 */
interface StatusTabProps {
  status: StatusFilter;
  label: string;
  count: number;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  variant: 'pending' | 'in_progress' | 'completed' | 'all';
}

const StatusTab: React.FC<StatusTabProps> = ({
  label,
  count,
  icon,
  isActive,
  onClick,
  variant,
}) => {
  const baseClasses = 'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 border-2';

  const variantClasses = {
    pending: isActive
      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25'
      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300',
    in_progress: isActive
      ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
      : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300',
    completed: isActive
      ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25'
      : 'bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300',
    all: isActive
      ? 'bg-gray-700 text-white border-gray-700 shadow-lg shadow-gray-700/25'
      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300',
  };

  const badgeClasses = {
    pending: isActive ? 'bg-amber-600' : 'bg-amber-100 text-amber-800',
    in_progress: isActive ? 'bg-blue-600' : 'bg-blue-100 text-blue-800',
    completed: isActive ? 'bg-green-600' : 'bg-green-100 text-green-800',
    all: isActive ? 'bg-gray-600' : 'bg-gray-100 text-gray-800',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${badgeClasses[variant]} ${isActive ? 'text-white' : ''}`}>
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * Teacher Review Panel Page
 *
 * Main page for teachers to review student submissions from modules 3, 4 and 5.
 * Shows pending reviews and allows teachers to evaluate them.
 *
 * Refactored to use React Query via useManualReviews hook for:
 * - Automatic caching and background refetching
 * - Better loading and error states
 * - Optimistic updates
 *
 * Moved from ReviewPanel/ subdirectory to pages root (ISS-FE-001)
 */
export default function TeacherReviewPanelPage() {
  // Local state for filters and selection
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  // TASK-2026-01-18-012: Agregar statusFilter para filtrar por estado
  const [filters, setFilters] = useState({
    exerciseId: '',
    moduleId: '',
    searchQuery: '',
    statusFilter: 'pending' as StatusFilter, // Default: mostrar pendientes
  });

  // TASK-2026-01-18-009: Fetch config from API (replaces hardcoded MANUAL_REVIEW_MODULES, MANUAL_REVIEW_EXERCISES)
  const { data: reviewConfig } = useManualReviewConfig();
  const modules = reviewConfig?.modules || [];
  const allExercises = reviewConfig?.exercises || [];

  // TASK-2026-01-18-012: Usar useMyReviews con soporte de status filter
  const {
    data: reviews = [],
    isLoading: loading,
    error,
    refetch: loadReviews,
  } = useMyReviews({
    status: filters.statusFilter,
    exerciseId: filters.exerciseId || undefined,
    moduleId: filters.moduleId || undefined,
  });

  // TASK-2026-01-18-013: Obtener contadores para cada estado (para tabs mejorados)
  const { data: pendingReviews = [] } = useMyReviews({ status: 'pending' });
  const { data: inProgressReviews = [] } = useMyReviews({ status: 'in_progress' });
  const { data: completedReviews = [] } = useMyReviews({ status: 'completed' });

  // Contadores de reviews por estado
  const reviewCounts = useMemo(() => ({
    pending: pendingReviews.length,
    in_progress: inProgressReviews.length,
    completed: completedReviews.length,
    all: pendingReviews.length + inProgressReviews.length + completedReviews.length,
  }), [pendingReviews.length, inProgressReviews.length, completedReviews.length]);

  // Use React Query hook for selected review details
  const { data: selectedReview } = useManualReviewDetail(selectedReviewId);

  // TASK-2026-01-18-009: Filter exercises by module using API data
  const filteredExercises = useMemo(() => {
    return filterExercisesByModule(allExercises, filters.moduleId);
  }, [allExercises, filters.moduleId]);

  /**
   * Select a review for detailed view
   */
  const handleSelectReview = (review: ManualReview) => {
    setSelectedReviewId(review.id);
  };

  /**
   * Close review detail view
   */
  const handleCloseReview = () => {
    setSelectedReviewId(null);
    // React Query will automatically refetch when needed
    loadReviews();
  };

  /**
   * Filter reviews by search query (client-side filtering)
   */
  const filteredReviews = useMemo(() => {
    if (!filters.searchQuery) return reviews;

    const query = filters.searchQuery.toLowerCase();
    return reviews.filter(
      (review) =>
        review.student?.name?.toLowerCase()?.includes(query) ||
        review.exercise?.title?.toLowerCase()?.includes(query) ||
        review.id.toLowerCase().includes(query),
    );
  }, [reviews, filters.searchQuery]);

  return (
    <TeacherPageShell>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-detective-orange" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Revision</h1>
                <p className="text-gray-600">
                  {selectedReview
                    ? 'Revisando envio de estudiante'
                    : `${filteredReviews.length} ${
                        filters.statusFilter === 'pending'
                          ? filteredReviews.length === 1 ? 'revision pendiente' : 'revisiones pendientes'
                          : filters.statusFilter === 'completed'
                          ? filteredReviews.length === 1 ? 'revision completada' : 'revisiones completadas'
                          : filteredReviews.length === 1 ? 'revision' : 'revisiones'
                      }`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Show either list or detail view */}
        {selectedReview ? (
          <ReviewDetail review={selectedReview} onClose={handleCloseReview} />
        ) : (
          <>
            {/* TASK-2026-01-18-013: Status Tabs Mejorados con contadores */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                <StatusTab
                  status="pending"
                  label="Pendientes"
                  count={reviewCounts.pending}
                  icon={<Clock className="h-4 w-4" />}
                  isActive={filters.statusFilter === 'pending'}
                  onClick={() => setFilters({ ...filters, statusFilter: 'pending' })}
                  variant="pending"
                />
                <StatusTab
                  status="in_progress"
                  label="En Progreso"
                  count={reviewCounts.in_progress}
                  icon={<AlertCircle className="h-4 w-4" />}
                  isActive={filters.statusFilter === 'in_progress'}
                  onClick={() => setFilters({ ...filters, statusFilter: 'in_progress' })}
                  variant="in_progress"
                />
                <StatusTab
                  status="completed"
                  label="Completadas"
                  count={reviewCounts.completed}
                  icon={<CheckCircle className="h-4 w-4" />}
                  isActive={filters.statusFilter === 'completed'}
                  onClick={() => setFilters({ ...filters, statusFilter: 'completed' })}
                  variant="completed"
                />
                <StatusTab
                  status="all"
                  label="Todas"
                  count={reviewCounts.all}
                  icon={<List className="h-4 w-4" />}
                  isActive={filters.statusFilter === 'all'}
                  onClick={() => setFilters({ ...filters, statusFilter: 'all' })}
                  variant="all"
                />
              </div>

              {/* Indicador de pendientes urgentes */}
              {reviewCounts.pending > 0 && filters.statusFilter !== 'pending' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Tienes {reviewCounts.pending} {reviewCounts.pending === 1 ? 'revision pendiente' : 'revisiones pendientes'}</span>
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="mb-6 rounded-detective bg-white p-4 shadow-card">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por estudiante, ejercicio o ID..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    className="w-full rounded-detective border border-gray-300 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  />
                </div>

                {/* Module Filter - TASK-2026-01-18-009: Now from API */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filters.moduleId}
                    onChange={(e) =>
                      setFilters({ ...filters, moduleId: e.target.value, exerciseId: '' })
                    }
                    className="w-full rounded-detective border border-gray-300 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  >
                    <option value="">Todos los modulos</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        Modulo {module.number} - {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exercise Filter - TASK-2026-01-18-009: Now from API */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filters.exerciseId}
                    onChange={(e) => setFilters({ ...filters, exerciseId: e.target.value })}
                    className="w-full rounded-detective border border-gray-300 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  >
                    <option value="">Todos los ejercicios</option>
                    {filteredExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.title} (M{exercise.moduleNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <ReviewList
              reviews={filteredReviews}
              loading={loading}
              error={error ? error.message : null}
              onSelectReview={handleSelectReview}
              onRefresh={() => loadReviews()}
            />
          </>
        )}
      </div>
    </TeacherPageShell>
  );
}
