/**
 * ResponsesTable Component
 *
 * Displays a table of student exercise attempts with:
 * - Sortable columns (via shared DataTable)
 * - Server-side pagination
 * - Loading and empty states
 * - Click to view detail
 *
 * @component
 */

import { useState, useMemo } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { DataTable, type Column, type RowAction, type DataTablePagination } from '@shared/components/common/DataTable';
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

  const handleSort = (columnKey: string) => {
    const field = columnKey as SortField;
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

  const columns = useMemo<Column<AttemptResponse>[]>(
    () => [
      {
        key: 'student_name',
        label: 'Estudiante',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
              {row.student_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{row.student_name}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'exercise_title',
        label: 'Ejercicio',
        render: (row) => (
          <p className="text-sm font-medium text-gray-800">{row.exercise_title}</p>
        ),
      },
      {
        key: 'module_name',
        label: 'Modulo',
        render: (row) => <p className="text-sm text-gray-600">{row.module_name}</p>,
      },
      {
        key: 'attempt_number',
        label: 'Intento',
        align: 'center' as const,
        render: (row) => (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
            #{row.attempt_number}
          </span>
        ),
      },
      {
        key: 'score',
        label: 'Score',
        align: 'center' as const,
        sortable: true,
        render: (row) => (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${getScoreColor(
              row.score,
            )}`}
          >
            {row.score}%
          </span>
        ),
      },
      {
        key: 'is_correct',
        label: 'Correcto',
        align: 'center' as const,
        render: (row) =>
          row.is_correct ? (
            <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="mx-auto h-5 w-5 text-red-600" />
          ),
      },
      {
        key: 'status',
        label: 'Estado',
        align: 'center' as const,
        render: (row) => {
          if (row.requires_manual_review && !row.is_correct) {
            return (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Pendiente
              </span>
            );
          }
          if (row.is_correct) {
            return (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Calificado
              </span>
            );
          }
          return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              Incorrecto
            </span>
          );
        },
      },
      {
        key: 'time',
        label: 'Tiempo',
        align: 'center' as const,
        sortable: true,
        render: (row) => (
          <div className="flex items-center justify-center gap-1 text-gray-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{formatTime(row.time_spent_seconds)}</span>
          </div>
        ),
      },
      {
        key: 'submitted_at',
        label: 'Fecha',
        align: 'center' as const,
        sortable: true,
        render: (row) => (
          <p className="text-sm text-gray-600">{formatDate(row.submitted_at)}</p>
        ),
      },
    ],
    [],
  );

  const rowActions = useMemo<RowAction<AttemptResponse>[]>(
    () => [
      {
        key: 'view',
        label: 'Ver detalle',
        icon: (
          <span className="inline-flex items-center gap-1">
            <Eye size={16} />
            <span className="text-sm font-semibold">Ver</span>
          </span>
        ),
        onClick: (row) => onViewDetail(row.id),
      },
    ],
    [onViewDetail],
  );

  const pagination = useMemo<DataTablePagination>(
    () => ({
      page,
      pageSize: limit,
      total,
      onPageChange,
      itemLabel: 'resultados',
    }),
    [page, limit, total, onPageChange],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <DataTable<AttemptResponse>
        data={data}
        columns={columns}
        loading={loading}
        emptyMessage="No hay intentos de ejercicios que coincidan con los filtros seleccionados"
        sortColumn={sortField ?? undefined}
        sortDirection={sortOrder}
        onSort={handleSort}
        rowKey={(row) => row.id}
        rowActions={rowActions}
        pagination={pagination}
        variant="default"
        striped={false}
        hoverable
      />
    </div>
  );
};
