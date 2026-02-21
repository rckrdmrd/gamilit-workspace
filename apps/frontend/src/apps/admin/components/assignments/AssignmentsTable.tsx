/**
 * AssignmentsTable Component
 *
 * Displays assignments in a table format with sorting, pagination, and click to detail.
 *
 * Created: 2025-11-29 - US-AE-009
 */

import { useState, useMemo } from 'react';
import { Eye, Calendar, Users, CheckCircle, Clock, FileText } from 'lucide-react';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import type { StatusType } from '@shared/components/base/StatusBadge';
import { DataTable, type Column } from '@/shared/components/common/DataTable';
import type { AdminAssignment } from '../../hooks/useAdminAssignments';

interface AssignmentsTableProps {
  assignments: AdminAssignment[];
  loading?: boolean;
  onRowClick?: (assignment: AdminAssignment) => void;
}

export function AssignmentsTable({ assignments, loading, onRowClick }: AssignmentsTableProps) {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort assignments
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const aValue = a[sortField as keyof AdminAssignment];
      const bValue = b[sortField as keyof AdminAssignment];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [assignments, sortField, sortOrder]);

  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(columnKey);
      setSortOrder('asc');
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    active: 'Activa',
    closed: 'Cerrada',
    draft: 'Borrador',
  };

  const renderStatusBadge = (status: string) => {
    const validStatuses: StatusType[] = ['active', 'closed', 'draft'];
    const statusType = validStatuses.includes(status as StatusType)
      ? (status as StatusType)
      : 'pending';
    return (
      <StatusBadge
        status={statusType}
        label={STATUS_LABELS[status] || status}
        size="sm"
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSubmissionProgress = (submitted: number, total: number) => {
    const percentage = total > 0 ? (submitted / total) * 100 : 0;
    return {
      percentage: percentage.toFixed(0),
      color: percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500',
    };
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
        <p className="mt-4 text-detective-text-secondary">Cargando assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No se encontraron assignments"
        description="No hay asignaciones que coincidan con los criterios de busqueda"
      />
    );
  }

  const columns: Column<AdminAssignment>[] = [
    {
      key: 'title',
      label: 'Assignment',
      sortable: true,
      render: (assignment) => (
        <div>
          <div className="font-medium text-detective-text">{assignment.title}</div>
          {assignment.description && (
            <div className="mt-1 line-clamp-1 text-xs text-detective-text-secondary">
              {assignment.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'classroom_name',
      label: 'Classroom',
      sortable: true,
      render: (assignment) => (
        <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
          <Users className="h-4 w-4" />
          {assignment.classroom_name}
        </div>
      ),
    },
    {
      key: 'teacher_name',
      label: 'Profesor',
      sortable: true,
      render: (assignment) => (
        <span className="text-sm text-detective-text-secondary">
          {assignment.teacher_name}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (assignment) => renderStatusBadge(assignment.status),
    },
    {
      key: 'due_date',
      label: 'Fecha Limite',
      sortable: true,
      render: (assignment) => (
        <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
          <Calendar className="h-4 w-4" />
          {formatDate(assignment.due_date)}
        </div>
      ),
    },
    {
      key: 'submissions_count',
      label: 'Entregas',
      render: (assignment) => {
        const progress = getSubmissionProgress(
          assignment.submissions_count,
          assignment.total_students,
        );
        return (
          <div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-detective-text">
                    {assignment.submissions_count}/{assignment.total_students}
                  </span>
                  <span className="text-detective-text-secondary">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={`h-full transition-all ${progress.color}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            {assignment.late_count > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-orange-500">
                <Clock className="h-3 w-3" />
                {assignment.late_count} tarde
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'average_grade',
      label: 'Promedio',
      render: (assignment) => (
        assignment.average_grade !== null ? (
          <div className="flex items-center gap-2">
            <CheckCircle
              className={`h-4 w-4 ${
                assignment.average_grade >= 75
                  ? 'text-green-500'
                  : assignment.average_grade >= 60
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}
            />
            <span className="font-medium text-detective-text">
              {assignment.average_grade.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="text-detective-text-secondary">N/A</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center',
      render: (assignment) => (
        <button
          className="rounded p-1 text-blue-400 hover:bg-detective-bg hover:text-blue-300"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(assignment);
          }}
          title="Ver detalles"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <DataTable<AdminAssignment>
      data={sortedAssignments}
      columns={columns}
      onRowClick={onRowClick}
      sortColumn={sortField}
      sortDirection={sortOrder}
      onSort={handleSort}
      emptyMessage="No se encontraron assignments"
      hoverable
      striped={false}
    />
  );
}
