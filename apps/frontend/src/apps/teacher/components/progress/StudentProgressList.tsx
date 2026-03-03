import { useState, useMemo, useCallback } from 'react';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import type { StudentMonitoring } from '../../types';

interface StudentProgressListProps {
  students: StudentMonitoring[];
  onStudentClick?: (student: StudentMonitoring) => void;
}

type SortField = 'name' | 'progress' | 'score' | 'lastActivity' | 'exercises';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getProgressBadge = (progress: number) => {
  if (progress < 30) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-red-500 bg-red-500/10 px-3 py-1">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-xs font-semibold text-red-500">En Riesgo</span>
      </div>
    );
  } else if (progress < 70) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-yellow-500 bg-yellow-500/10 px-3 py-1">
        <span className="text-xs font-semibold text-yellow-500">En Progreso</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-2 rounded-full border border-green-500 bg-green-500/10 px-3 py-1">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-xs font-semibold text-green-500">Buen Progreso</span>
      </div>
    );
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * Calcula el tiempo transcurrido desde la ultima actividad
 * FIX-2026-01-25: Validacion para valores null/undefined/invalidos
 */
const getTimeSinceLastActivity = (lastActivity: string | null | undefined): string => {
  if (!lastActivity) {
    return 'Sin actividad';
  }

  const last = new Date(lastActivity);

  if (isNaN(last.getTime())) {
    return 'Fecha invalida';
  }

  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) {
    return 'Hace un momento';
  }

  if (diffMins < 1) {
    return 'Hace un momento';
  } else if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `Hace ${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  } else {
    const days = Math.floor(diffMins / 1440);
    return `Hace ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StudentProgressList - Tabla de progreso de estudiantes con ordenamiento
 *
 * Caracteristicas:
 * - Ordenamiento por multiples campos (nombre, progreso, score, ultima actividad)
 * - Indicadores visuales de estudiantes en riesgo (progreso < 30%)
 * - Badges de estado de progreso
 * - Click en estudiante para ver detalles
 */
export function StudentProgressList({ students, onStudentClick }: StudentProgressListProps) {
  const [sortField, setSortField] = useState<SortField>('progress');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Ordenar estudiantes
  const sortedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress_percentage;
          bValue = b.progress_percentage;
          break;
        case 'score':
          aValue = a.score_average;
          bValue = b.score_average;
          break;
        case 'lastActivity':
          // FIX-2026-01-25: Validacion para last_activity null/undefined
          aValue = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          bValue = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          break;
        case 'exercises':
          aValue = a.exercises_completed;
          bValue = b.exercises_completed;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [students, sortField, sortDirection]);

  const handleSort = useCallback(
    (columnKey: string) => {
      const field = columnKey as SortField;
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField],
  );

  // Contar estudiantes en riesgo
  const atRiskCount = students.filter((s) => s.progress_percentage < 30).length;

  const columns = useMemo<Column<StudentMonitoring>[]>(
    () => [
      {
        key: 'name',
        label: 'Estudiante',
        sortable: true,
        render: (row) => (
          <div>
            <p className="font-semibold text-detective-text">{row.full_name}</p>
            <p className="text-xs text-detective-text-secondary">{row.email}</p>
            {row.current_module && (
              <p className="mt-1 text-xs text-detective-orange truncate" title={row.current_module}>
                Modulo: {row.current_module}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'progress',
        label: 'Progreso',
        sortable: true,
        render: (row) => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-detective-bg">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    row.progress_percentage < 30
                      ? 'bg-red-500'
                      : row.progress_percentage < 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${row.progress_percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-detective-text">
                {row.progress_percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'score',
        label: 'Score Promedio',
        sortable: true,
        render: (row) => (
          <p className={`text-xl font-bold ${getScoreColor(row.score_average)}`}>
            {row.score_average.toFixed(0)}%
          </p>
        ),
      },
      {
        key: 'exercises',
        label: 'Ejercicios',
        sortable: true,
        render: (row) => (
          <div>
            <p className="font-semibold text-detective-text">
              {row.exercises_completed}/{row.exercises_total}
            </p>
            <p className="text-xs text-detective-text-secondary">
              {row.exercises_total > 0
                ? ((row.exercises_completed / row.exercises_total) * 100).toFixed(0)
                : 0}
              % completados
            </p>
          </div>
        ),
      },
      {
        key: 'lastActivity',
        label: 'Ultima Actividad',
        sortable: true,
        render: (row) => (
          <p className="text-sm text-detective-text-secondary">
            {getTimeSinceLastActivity(row.last_activity)}
          </p>
        ),
      },
      {
        key: 'status',
        label: 'Estado',
        render: (row) => getProgressBadge(row.progress_percentage),
      },
    ],
    [],
  );

  if (students.length === 0) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
          <p className="text-detective-text-secondary">No hay estudiantes en esta clase</p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-detective-orange" />
          <div>
            <h3 className="text-xl font-bold text-detective-text">
              Progreso Individual de Estudiantes
            </h3>
            <p className="text-sm text-detective-text-secondary">
              {students.length} estudiante(s) • {atRiskCount} en riesgo
            </p>
          </div>
        </div>
      </div>

      {/* Alert for At-Risk Students */}
      {atRiskCount > 0 && (
        <DetectiveCard hoverable={false}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold text-detective-text">
                Estudiantes que Requieren Atencion
              </h4>
              <p className="text-detective-text-secondary">
                {atRiskCount} estudiante(s) tienen menos del 30% de progreso. Considera intervenir
                para apoyarlos y evitar rezago academico.
              </p>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Table */}
      <DetectiveCard hoverable={false}>
        <DataTable<StudentMonitoring>
          data={sortedStudents}
          columns={columns}
          onRowClick={onStudentClick}
          variant="detective"
          sortColumn={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          rowKey={(row) => row.id || row.full_name}
          emptyMessage="No hay estudiantes en esta clase"
          striped={false}
          hoverable
        />
      </DetectiveCard>

      {/* Summary Footer */}
      <DetectiveCard hoverable={false}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-detective-text">{students.length}</p>
            <p className="text-sm text-detective-text-secondary">Total Estudiantes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {students.filter((s) => s.progress_percentage >= 70).length}
            </p>
            <p className="text-sm text-detective-text-secondary">Buen Progreso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {
                students.filter((s) => s.progress_percentage >= 30 && s.progress_percentage < 70)
                  .length
              }
            </p>
            <p className="text-sm text-detective-text-secondary">En Progreso</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{atRiskCount}</p>
            <p className="text-sm text-detective-text-secondary">En Riesgo</p>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
}
