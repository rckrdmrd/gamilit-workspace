import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, Filter, ArrowLeft } from 'lucide-react';
import { manualReviewApi, ManualReview } from '@/shared/api/manualReviewApi';
import { ReviewList } from './ReviewList';
import { ReviewDetail } from './ReviewDetail';
import {
  MANUAL_REVIEW_MODULES,
  MANUAL_REVIEW_EXERCISES,
  getExercisesByModule,
} from '../../constants/manualReviewExercises';

/**
 * Review Panel Page
 *
 * Main page for teachers to review student submissions from modules 3, 4 and 5.
 * Shows pending reviews and allows teachers to evaluate them.
 */
export const ReviewPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ManualReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ManualReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    exerciseId: '',
    moduleId: '',
    searchQuery: '',
  });

  /**
   * Load pending reviews
   */
  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: any = {};
      if (filters.exerciseId) filterParams.exerciseId = filters.exerciseId;
      if (filters.moduleId) filterParams.moduleId = filters.moduleId;

      const data = await manualReviewApi.getPendingReviews(filterParams);
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar revisiones');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load reviews on mount and filter changes
   */
  useEffect(() => {
    loadReviews();
  }, [filters.exerciseId, filters.moduleId]);

  /**
   * Select a review for detailed view
   */
  const handleSelectReview = async (review: ManualReview) => {
    try {
      // Load full review details
      const fullReview = await manualReviewApi.getReviewById(review.id);
      setSelectedReview(fullReview);
    } catch (err) {
      console.error('Error loading review details:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar detalles de revisión');
    }
  };

  /**
   * Close review detail view
   */
  const handleCloseReview = () => {
    setSelectedReview(null);
    // Reload reviews to get updated statuses
    loadReviews();
  };

  /**
   * Filter reviews by search query
   */
  const filteredReviews = reviews.filter((review) => {
    if (!filters.searchQuery) return true;

    const query = filters.searchQuery.toLowerCase();
    return (
      review.student?.name.toLowerCase().includes(query) ||
      review.exercise?.title.toLowerCase().includes(query) ||
      review.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="mb-4 flex items-center gap-2 text-detective-orange hover:text-detective-orange/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-detective-orange" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Revisión</h1>
                <p className="text-gray-600">
                  {selectedReview
                    ? 'Revisando envío de estudiante'
                    : `${filteredReviews.length} ${filteredReviews.length === 1 ? 'revisión pendiente' : 'revisiones pendientes'}`}
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

                {/* Module Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filters.moduleId}
                    onChange={(e) => setFilters({ ...filters, moduleId: e.target.value, exerciseId: '' })}
                    className="w-full rounded-detective border border-gray-300 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  >
                    <option value="">Todos los módulos</option>
                    {MANUAL_REVIEW_MODULES.map((module) => (
                      <option key={module.id} value={module.id}>
                        Módulo {module.number} - {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exercise Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filters.exerciseId}
                    onChange={(e) => setFilters({ ...filters, exerciseId: e.target.value })}
                    className="w-full rounded-detective border border-gray-300 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  >
                    <option value="">Todos los ejercicios</option>
                    {getExercisesByModule(filters.moduleId).map((exercise) => (
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
              error={error}
              onSelectReview={handleSelectReview}
              onRefresh={loadReviews}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewPanelPage;
