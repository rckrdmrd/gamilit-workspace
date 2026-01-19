import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { ManualReview } from '@/shared/api/manualReviewApi';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useManualReviews, useManualReviewDetail } from '../hooks/useManualReviews';
import { ReviewList, ReviewDetail } from '../components/review-panel';
// TASK-2026-01-18-009: Consume from API instead of hardcoded constants
import { useManualReviewConfig, filterExercisesByModule } from '../hooks/useManualReviewConfig';

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
export const TeacherReviewPanelPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Local state for filters and selection
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    exerciseId: '',
    moduleId: '',
    searchQuery: '',
  });

  // TASK-2026-01-18-009: Fetch config from API (replaces hardcoded MANUAL_REVIEW_MODULES, MANUAL_REVIEW_EXERCISES)
  const { data: reviewConfig } = useManualReviewConfig();
  const modules = reviewConfig?.modules || [];
  const allExercises = reviewConfig?.exercises || [];

  // Use React Query hook for pending reviews
  const {
    data: reviews = [],
    isLoading: loading,
    error,
    refetch: loadReviews,
  } = useManualReviews({
    exerciseId: filters.exerciseId || undefined,
    moduleId: filters.moduleId || undefined,
  });

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
        review.student?.name.toLowerCase().includes(query) ||
        review.exercise?.title.toLowerCase().includes(query) ||
        review.id.toLowerCase().includes(query),
    );
  }, [reviews, filters.searchQuery]);

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institucion'}
      onLogout={handleLogout}
    >
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
                    : `${filteredReviews.length} ${filteredReviews.length === 1 ? 'revision pendiente' : 'revisiones pendientes'}`}
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
    </TeacherLayout>
  );
};

// Backward compatibility export
export const ReviewPanelPage = TeacherReviewPanelPage;

export default TeacherReviewPanelPage;
