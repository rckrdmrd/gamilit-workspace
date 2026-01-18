/**
 * ResponsesTable Component
 *
 * Displays a table of student exercise attempts with:
 * - Sortable columns
 * - Server-side pagination
 * - Loading and empty states
 * - Click to view detail
 *
 * @component
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import type { AttemptResponse } from '@services/api/teacher';

// ============================================================================
// TYPES
// ============================================================================

interface ResponsesTableProps {
  data: AttemptResponse[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onViewDetail: (attemptId: string) => void;
  onPageChange: (newPage: number) => void;
  onSortChange?: (sortBy: 'submitted_at' | 'score' | 'time', sortOrder: 'asc' | 'desc') => void;
}

type SortField = 'submitted_at' | 'score' | 'time';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 text-green-700 border-green-300';
  if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-300';
  if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-300';
  return 'bg-red-100 text-red-700 border-red-300';
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TableHeader: React.FC<{
  sortField: SortField | null;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}> = ({ sortField, sortOrder, onSort }) => {
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-bold">Estudiante</th>
        <th className="px-4 py-3 text-left text-sm font-bold">Ejercicio</th>
        <th className="px-4 py-3 text-left text-sm font-bold">Módulo</th>
        <th className="px-4 py-3 text-center text-sm font-bold">Intento</th>
        <th
          className="cursor-pointer px-4 py-3 text-center text-sm font-bold transition-colors hover:bg-white/10"
          onClick={() => onSort('score')}
        >
          <div className="flex items-center justify-center gap-1">
            <span>Score</span>
            <SortIcon field="score" />
          </div>
        </th>
        <th className="px-4 py-3 text-center text-sm font-bold">Correcto</th>
        <th
          className="cursor-pointer px-4 py-3 text-center text-sm font-bold transition-colors hover:bg-white/10"
          onClick={() => onSort('time')}
        >
          <div className="flex items-center justify-center gap-1">
            <span>Tiempo</span>
            <SortIcon field="time" />
          </div>
        </th>
        <th
          className="cursor-pointer px-4 py-3 text-center text-sm font-bold transition-colors hover:bg-white/10"
          onClick={() => onSort('submitted_at')}
        >
          <div className="flex items-center justify-center gap-1">
            <span>Fecha</span>
            <SortIcon field="submitted_at" />
          </div>
        </th>
        <th className="px-4 py-3 text-center text-sm font-bold">Acciones</th>
      </tr>
    </thead>
  );
};

const TableRow: React.FC<{
  attempt: AttemptResponse;
  index: number;
  onView: (id: string) => void;
}> = ({ attempt, index, onView }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="hover:bg-detective-accent/5 border-b border-gray-200 transition-colors"
    >
      {/* Estudiante */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
            {attempt.student_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{attempt.student_name}</p>
          </div>
        </div>
      </td>

      {/* Ejercicio */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{attempt.exercise_title}</p>
      </td>

      {/* Módulo */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-600">{attempt.module_name}</p>
      </td>

      {/* Intento */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
          #{attempt.attempt_number}
        </span>
      </td>

      {/* Score */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${getScoreColor(
            attempt.score,
          )}`}
        >
          {attempt.score}%
        </span>
      </td>

      {/* Correcto */}
      <td className="px-4 py-3 text-center">
        {attempt.is_correct ? (
          <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="mx-auto h-5 w-5 text-red-600" />
        )}
      </td>

      {/* Tiempo */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-gray-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{formatTime(attempt.time_spent_seconds)}</span>
        </div>
      </td>

      {/* Fecha */}
      <td className="px-4 py-3 text-center">
        <p className="text-sm text-gray-600">{formatDate(attempt.submitted_at)}</p>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onView(attempt.id)}
          className="btn-detective inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold"
        >
          <Eye className="h-4 w-4" />
          Ver
        </button>
      </td>
    </motion.tr>
  );
};

const SkeletonRow: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-gray-200">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-48 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-8 w-8 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-6 w-16 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-5 w-5 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-4 w-16 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-4 w-32 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="mx-auto h-8 w-16 rounded-lg bg-gray-200" />
      </td>
    </tr>
  );
};

const EmptyState: React.FC = () => {
  return (
    <tr>
      <td colSpan={9} className="px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-700">No se encontraron respuestas</h3>
          <p className="text-sm text-gray-500">
            No hay intentos de ejercicios que coincidan con los filtros seleccionados
          </p>
        </div>
      </td>
    </tr>
  );
};

const Pagination: React.FC<{
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}> = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{startItem}</span> -{' '}
        <span className="font-semibold">{endItem}</span> de{' '}
        <span className="font-semibold">{total}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'btn-detective'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ResponsesTable: React.FC<ResponsesTableProps> = ({
  data,
  total,
  page,
  limit,
  loading = false,
  onViewDetail,
  onPageChange,
  onSortChange,
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    let newOrder: SortOrder = 'desc';

    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    setSortField(field);
    setSortOrder(newOrder);

    if (onSortChange) {
      onSortChange(field, newOrder);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
          <tbody>
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={`skeleton-${i}`} />)
              : data.length === 0
                ? <EmptyState />
                : data.map((attempt, index) => (
                    <TableRow
                      key={attempt.id}
                      attempt={attempt}
                      index={index}
                      onView={onViewDetail}
                    />
                  ))
            }
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <Pagination page={page} total={total} limit={limit} onPageChange={onPageChange} />
      )}
    </div>
  );
};
