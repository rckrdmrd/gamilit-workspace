/**
 * TeacherExerciseResponsesPage
 *
 * Page for viewing and analyzing student exercise attempts and responses.
 * Provides comprehensive filtering, sorting, and detailed view capabilities.
 *
 * Features:
 * - Paginated table of attempts with server-side filtering
 * - Advanced filters (classroom, student, date range, correctness)
 * - Sortable columns (score, time, date)
 * - Detailed modal view with answer comparison
 * - Real-time stats summary
 *
 * @page
 * @route /teacher/responses
 */

import { useState, type ReactNode } from 'react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ResponsesTable } from '../components/responses/ResponsesTable';
import { ResponseDetailModal } from '../components/responses/ResponseDetailModal';
import { ResponseFilters } from '../components/responses/ResponseFilters';
import { useExerciseResponses } from '../hooks/useExerciseResponses';
import type { GetAttemptsQuery, AttemptResponse } from '@services/api/teacher';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const PageHeader = () => {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Respuestas de Ejercicios</h1>
          <p className="text-gray-600">Analiza las respuestas y desempeño de tus estudiantes</p>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, label, value, color }: {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-xl border border-gray-200 p-6 shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/80">
          {icon}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const StatsGrid = ({ total, data }: { total: number; data: AttemptResponse[] }) => {
  const correctCount = data.filter((attempt) => attempt.is_correct).length;
  const incorrectCount = data.filter((attempt) => !attempt.is_correct).length;
  const avgScore =
    data.length > 0
      ? Math.round(data.reduce((sum, attempt) => sum + attempt.score, 0) / data.length)
      : 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={<FileText className="h-7 w-7 text-blue-600" />}
        label="Total Intentos"
        value={total}
        color="from-blue-50 to-blue-100"
      />
      <StatsCard
        icon={<CheckCircle className="h-7 w-7 text-green-600" />}
        label="Correctas"
        value={correctCount}
        color="from-green-50 to-green-100"
      />
      <StatsCard
        icon={<XCircle className="h-7 w-7 text-red-600" />}
        label="Incorrectas"
        value={incorrectCount}
        color="from-red-50 to-red-100"
      />
      <StatsCard
        icon={<TrendingUp className="h-7 w-7 text-purple-600" />}
        label="Score Promedio"
        value={`${avgScore}%`}
        color="from-purple-50 to-purple-100"
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TeacherExerciseResponsesPage() {
  // Filters and pagination state
  const [filters, setFilters] = useState<GetAttemptsQuery>({
    page: 1,
    limit: 20,
    sort_by: 'submitted_at',
    sort_order: 'desc',
  });

  // Modal state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Fetch data with React Query
  const { data, isLoading, error, refetch } = useExerciseResponses(filters);

  // Handlers
  const handleFilterChange = (newFilters: GetAttemptsQuery) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort_by: 'submitted_at',
      sort_order: 'desc',
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const handleSortChange = (
    sortBy: 'submitted_at' | 'score' | 'time',
    sortOrder: 'asc' | 'desc',
  ) => {
    setFilters({
      ...filters,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  };

  const handleViewDetail = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  const handleCloseModal = () => {
    setSelectedAttemptId(null);
  };

  return (
    <TeacherPageShell>
    <div className="space-y-6">
        {/* Page Header */}
        <PageHeader />

        {/* Stats Grid */}
        {data && <StatsGrid total={data.total} data={data.data} />}

        {/* Filters */}
        <ResponseFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-600" />
            <h3 className="mb-2 text-lg font-bold text-red-800">Error al cargar datos</h3>
            <p className="mb-4 text-sm text-red-600">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Responses Table */}
        {!error && (
          <ResponsesTable
            data={data?.data || []}
            total={data?.total || 0}
            page={filters.page || 1}
            limit={filters.limit || 20}
            loading={isLoading}
            onViewDetail={handleViewDetail}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
          />
        )}

        {/* Detail Modal */}
        <ResponseDetailModal
          attemptId={selectedAttemptId}
          open={!!selectedAttemptId}
          onClose={handleCloseModal}
        />
    </div>
    </TeacherPageShell>
  );
}
