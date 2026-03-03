import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getPerformanceLevelFromScore } from '@shared/utils/format.util';
import {
  Search,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutGrid,
  List,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { InputDetective } from '@shared/components/base/InputDetective';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { StudentStatusCard } from './StudentStatusCard';
import { StudentDetailModal } from './StudentDetailModal';
import { SuspendStudentModal } from './SuspendStudentModal';
import { StudentActionsMenu } from './StudentActionsMenu';
import { RefreshControl } from './RefreshControl';
import { StudentPagination } from './StudentPagination';
import { useStudentMonitoring } from '../../hooks/useStudentMonitoring';
import { useStudentBlocking } from '../../hooks/useStudentBlocking';
import { useToast } from '@shared/components/base/Toast';
import type { StudentFilter, StudentMonitoring, StudentStatus } from '../../types';

interface StudentMonitoringPanelProps {
  classroomId: string;
}

// ============================================================================
// MonitoringTable — extracted sub-component using shared DataTable
// ============================================================================

interface MonitoringTableProps {
  students: StudentMonitoring[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'name' | 'score' | 'completion' | 'activity') => void;
  onRowClick: (student: StudentMonitoring) => void;
  getStudentStatus: (student: StudentMonitoring) => string;
  isStudentBlocked: (studentId: string) => boolean;
  onViewDetails: (student: StudentMonitoring) => void;
  onSuspend: (student: StudentMonitoring) => void;
  onUnblock: (student: StudentMonitoring) => void;
}

function MonitoringTable({
  students,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  getStudentStatus,
  isStudentBlocked,
  onViewDetails,
  onSuspend,
  onUnblock,
}: MonitoringTableProps) {
  const handleSort = useCallback(
    (columnKey: string) => {
      onSort(columnKey as 'name' | 'score' | 'completion' | 'activity');
    },
    [onSort],
  );

  const columns = useMemo<Column<StudentMonitoring>[]>(
    () => [
      {
        key: 'name',
        label: 'Nombre',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-detective-text">{row.full_name}</p>
              <p className="text-xs text-gray-400">{row.email}</p>
            </div>
            {isStudentBlocked(row.id) && (
              <span className="rounded bg-red-500/90 px-2 py-0.5 text-xs font-medium text-white">
                Bloqueado
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'studentStatus',
        label: 'Estado',
        render: (row) => {
          const status = getStudentStatus(row);
          const statusStyles: Record<string, string> = {
            active: 'bg-green-500/20 text-green-500',
            in_exercise: 'bg-blue-500/20 text-blue-500',
            inactive: 'bg-gray-500/20 text-gray-400',
            offline: 'bg-red-500/20 text-red-500',
          };
          const statusLabels: Record<string, string> = {
            active: 'Activo',
            in_exercise: 'En ejercicio',
            inactive: 'Inactivo',
            offline: 'Offline',
          };
          return (
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusStyles[status] || ''}`}
            >
              {statusLabels[status] || status}
            </span>
          );
        },
      },
      {
        key: 'score',
        label: 'Puntuacion',
        sortable: true,
        render: (row) => (
          <span
            className={`font-bold ${
              (row.score_average || 0) >= 80
                ? 'text-green-500'
                : (row.score_average || 0) >= 60
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }`}
          >
            {(row.score_average || 0).toFixed(1)}%
          </span>
        ),
      },
      {
        key: 'completion',
        label: 'Completitud',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-gray-700">
              <div
                className={`h-2 rounded-full ${
                  (row.progress_percentage || 0) >= 70
                    ? 'bg-green-500'
                    : (row.progress_percentage || 0) >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${row.progress_percentage || 0}%` }}
              />
            </div>
            <span className="text-sm">{(row.progress_percentage || 0).toFixed(0)}%</span>
          </div>
        ),
      },
      {
        key: 'performance',
        label: 'Rendimiento',
        render: (row) => {
          const level = getPerformanceLevelFromScore(row.score_average || 0);
          const levelStyles: Record<string, string> = {
            high: 'bg-green-500/20 text-green-500',
            medium: 'bg-yellow-500/20 text-yellow-500',
            low: 'bg-red-500/20 text-red-500',
          };
          const levelLabels: Record<string, string> = {
            high: 'Alto',
            medium: 'Medio',
            low: 'Bajo',
          };
          return (
            <span className={`rounded px-2 py-1 text-xs font-medium ${levelStyles[level] || ''}`}>
              {levelLabels[level] || level}
            </span>
          );
        },
      },
      {
        key: 'activity',
        label: 'Ultima Actividad',
        sortable: true,
        render: (row) => (
          <span className="text-detective-text-secondary">
            {row.last_activity
              ? new Date(row.last_activity).toLocaleDateString('es-ES')
              : 'Sin actividad'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Acciones',
        align: 'right' as const,
        render: (row) => (
          <div onClick={(e) => e.stopPropagation()}>
            <StudentActionsMenu
              student={row}
              isBlocked={isStudentBlocked(row.id)}
              onViewDetails={() => onViewDetails(row)}
              onSuspend={() => onSuspend(row)}
              onUnblock={() => onUnblock(row)}
              onViewAlerts={() => window.open(`/teacher/alerts?student_id=${row.id}`, '_blank')}
            />
          </div>
        ),
      },
    ],
    [getStudentStatus, isStudentBlocked, onViewDetails, onSuspend, onUnblock],
  );

  return (
    <DataTable<StudentMonitoring>
      data={students}
      columns={columns}
      onRowClick={onRowClick}
      variant="detective"
      sortColumn={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      rowKey={(row) => row.id}
      emptyMessage="No se encontraron estudiantes"
      striped={false}
      hoverable
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StudentMonitoringPanel({ classroomId }: StudentMonitoringPanelProps) {
  const [filters, setFilters] = useState<StudentFilter>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitoring | null>(null);
  const [studentToSuspend, setStudentToSuspend] = useState<StudentMonitoring | null>(null);
  const [blockedStudents, setBlockedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'name' | 'score' | 'completion' | 'activity'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const previousStudentsRef = useRef<StudentMonitoring[]>([]);
  const { showToast } = useToast();
  const { unblockStudent } = useStudentBlocking();

  // CORR-2025-12-18: Agregado soporte de paginacion server-side
  const {
    students,
    loading,
    error,
    page,
    limit,
    pagination,
    setPage,
    setPageLimit,
    refreshInterval,
    setRefreshInterval,
    refresh,
    lastUpdate,
  } = useStudentMonitoring(classroomId, filters);

  // Detect student events and show notifications
  useEffect(() => {
    if (!previousStudentsRef.current.length || !students.length) {
      previousStudentsRef.current = students;
      return;
    }

    const previous = previousStudentsRef.current;
    const current = students;

    // Check for newly active students
    current.forEach((student) => {
      const prevStudent = previous.find((s) => s.id === student.id);
      if (!prevStudent) return;

      // Student just became active
      // FIX-2026-01-25: Validación para last_activity null/undefined
      if (!student.last_activity || !prevStudent.last_activity) {
        return; // Skip event detection if no activity data
      }

      const now = new Date();
      const lastActivity = new Date(student.last_activity);
      const prevLastActivity = new Date(prevStudent.last_activity);

      // Validar que las fechas sean válidas
      if (isNaN(lastActivity.getTime()) || isNaN(prevLastActivity.getTime())) {
        return;
      }

      const diffMins = Math.floor((now.getTime() - lastActivity.getTime()) / 60000);

      if (diffMins < 1 && student.status === 'active') {
        const prevDiffMins = Math.floor((now.getTime() - prevLastActivity.getTime()) / 60000);

        if (prevDiffMins > 5) {
          showToast({
            type: 'info',
            title: 'Estudiante conectado',
            message: `${student.full_name} acaba de iniciar sesión`,
            duration: 4000,
          });
        }
      }

      // Student completed an exercise
      if (student.exercises_completed > prevStudent.exercises_completed) {
        showToast({
          type: 'success',
          title: 'Ejercicio completado',
          message: `${student.full_name} completó un ejercicio`,
          duration: 4000,
        });
      }
    });

    previousStudentsRef.current = students;
  }, [students, showToast]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: StudentStatus) => {
    setFilters((prev) => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];

      return {
        ...prev,
        status: newStatuses.length > 0 ? newStatuses : undefined,
      };
    });
  };

  // Handle performance filter
  const handlePerformanceFilter = (level: 'high' | 'medium' | 'low') => {
    setFilters((prev) => {
      const currentLevels = prev.performanceLevel || [];
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter((l: string) => l !== level)
        : [...currentLevels, level];

      return {
        ...prev,
        performanceLevel: newLevels.length > 0 ? newLevels : undefined,
      };
    });
  };

  // Handle sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting and performance filtering to students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Filter by performance level if specified
    const performanceLevels = filters.performanceLevel;
    if (performanceLevels && performanceLevels.length > 0) {
      filtered = filtered.filter((student) => {
        const level = getPerformanceLevelFromScore(student.score_average || 0);
        return performanceLevels.includes(level);
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'score':
          aValue = a.score_average || 0;
          bValue = b.score_average || 0;
          break;
        case 'completion':
          aValue = a.progress_percentage || 0;
          bValue = b.progress_percentage || 0;
          break;
        case 'activity':
          aValue = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          bValue = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, filters, sortField, sortDirection]);

  /**
   * Calculate student status based on last activity time
   * FIX-2026-01-25: Añadida validación para last_activity null/undefined/inválido
   */
  const getStudentStatus = (student: StudentMonitoring) => {
    // Validar que last_activity exista
    if (!student.last_activity) {
      return 'offline'; // Sin actividad = considerado offline
    }

    const now = new Date();
    const last = new Date(student.last_activity);

    // Validar que la fecha sea válida
    if (isNaN(last.getTime())) {
      return 'offline';
    }

    const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);

    // Manejar fechas futuras
    if (diffMins < 0) return 'active';

    if (diffMins < 5) return 'active';
    if (student.current_exercise && diffMins < 30) return 'in_exercise';
    if (diffMins >= 30) return 'offline';
    return 'inactive';
  };

  const activeCount = students.filter((s) => getStudentStatus(s) === 'active').length;
  const inExerciseCount = students.filter((s) => getStudentStatus(s) === 'in_exercise').length;
  const inactiveCount = students.filter((s) => getStudentStatus(s) === 'inactive').length;
  const offlineCount = students.filter((s) => getStudentStatus(s) === 'offline').length;

  // Performance stats
  const highPerformanceCount = students.filter((s) => getPerformanceLevelFromScore(s.score_average || 0) === 'high').length;
  const mediumPerformanceCount = students.filter((s) => getPerformanceLevelFromScore(s.score_average || 0) === 'medium').length;
  const lowPerformanceCount = students.filter((s) => getPerformanceLevelFromScore(s.score_average || 0) === 'low').length;

  // US-PM-006: Handlers for student blocking
  const handleSuspendSuccess = () => {
    if (studentToSuspend) {
      setBlockedStudents((prev) => new Set([...prev, studentToSuspend.id]));
    }
    refresh();
  };

  const handleUnblock = async (student: StudentMonitoring) => {
    try {
      await unblockStudent(classroomId, student.id);
      setBlockedStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(student.id);
        return newSet;
      });
      refresh();
    } catch {
      // Error handled by hook with toast
    }
  };

  const isStudentBlocked = (studentId: string) => blockedStudents.has(studentId);

  if (error) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center">
          <p className="text-red-500">Error: {error.message}</p>
          <DetectiveButton onClick={refresh} variant="secondary" className="mt-4">
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with RefreshControl and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-detective-text">Monitoreo de Estudiantes</h2>
            <p className="text-detective-text-secondary">Vista en tiempo real del aula</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex gap-1">
            <DetectiveButton
              variant={viewMode === 'cards' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('cards')}
              size="sm"
            >
              <LayoutGrid className="h-4 w-4" />
            </DetectiveButton>
            <DetectiveButton
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('table')}
              size="sm"
            >
              <List className="h-4 w-4" />
            </DetectiveButton>
          </div>
          <RefreshControl
            interval={refreshInterval}
            onIntervalChange={setRefreshInterval}
            onRefresh={refresh}
            loading={loading}
            lastUpdate={lastUpdate}
          />
        </div>
      </div>

      {/* Stats Overview with improved categorization */}
      {/* CORR-2025-12-18: Usar pagination.total para mostrar el total real */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-detective-text">
                {pagination?.total ?? students.length}
              </p>
              <p className="text-sm text-detective-text-secondary">Total</p>
            </div>
            <Users className="h-8 w-8 text-detective-orange" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Activos
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-500">{inExerciseCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                En ejercicio
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-500">{inactiveCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-500" />
                Inactivos
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Offline
              </p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-500">{highPerformanceCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <TrendingUp className="h-3 w-3" />
                Alto Rendimiento
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-500">{mediumPerformanceCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <Minus className="h-3 w-3" />
                Rendimiento Medio
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-500">{lowPerformanceCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <TrendingDown className="h-3 w-3" />
                Bajo Rendimiento
              </p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Search and Filters */}
      <DetectiveCard>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                <InputDetective
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status Filters */}
              <DetectiveButton
                variant={filters.status?.includes('active') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('active')}
                size="sm"
              >
                Activos
              </DetectiveButton>
              <DetectiveButton
                variant={filters.status?.includes('inactive') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('inactive')}
                size="sm"
              >
                Inactivos
              </DetectiveButton>
              <DetectiveButton
                variant={filters.status?.includes('offline') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('offline')}
                size="sm"
              >
                Offline
              </DetectiveButton>

              {/* Separator */}
              <div className="mx-2 h-8 w-px bg-gray-700" />

              {/* Performance Filters */}
              <DetectiveButton
                variant={filters.performanceLevel?.includes('high') ? 'primary' : 'secondary'}
                onClick={() => handlePerformanceFilter('high')}
                size="sm"
              >
                Alto
              </DetectiveButton>
              <DetectiveButton
                variant={filters.performanceLevel?.includes('medium') ? 'primary' : 'secondary'}
                onClick={() => handlePerformanceFilter('medium')}
                size="sm"
              >
                Medio
              </DetectiveButton>
              <DetectiveButton
                variant={filters.performanceLevel?.includes('low') ? 'primary' : 'secondary'}
                onClick={() => handlePerformanceFilter('low')}
                size="sm"
              >
                Bajo
              </DetectiveButton>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Students Grid/Table */}
      {loading && !students.length ? (
        <div className="py-12 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-detective-orange" />
          <p className="text-detective-text-secondary">Cargando estudiantes...</p>
        </div>
      ) : filteredAndSortedStudents.length === 0 ? (
        <DetectiveCard>
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
            <p className="text-detective-text-secondary">No se encontraron estudiantes</p>
          </div>
        </DetectiveCard>
      ) : viewMode === 'table' ? (
        /* Table View — powered by shared DataTable */
        <DetectiveCard>
          <MonitoringTable
            students={filteredAndSortedStudents}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={setSelectedStudent}
            getStudentStatus={getStudentStatus}
            isStudentBlocked={isStudentBlocked}
            onViewDetails={setSelectedStudent}
            onSuspend={setStudentToSuspend}
            onUnblock={handleUnblock}
          />
        </DetectiveCard>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedStudents.map((student) => (
            <div key={student.id} className="relative">
              <StudentStatusCard
                student={student}
                onClick={() => setSelectedStudent(student)}
              />
              {/* Blocked badge */}
              {isStudentBlocked(student.id) && (
                <div className="absolute left-3 top-3 rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white">
                  Bloqueado
                </div>
              )}
              {/* Actions menu */}
              <div className="absolute right-3 top-3">
                <StudentActionsMenu
                  student={student}
                  isBlocked={isStudentBlocked(student.id)}
                  onViewDetails={() => setSelectedStudent(student)}
                  onSuspend={() => setStudentToSuspend(student)}
                  onUnblock={() => handleUnblock(student)}
                  onViewAlerts={() => window.open(`/teacher/alerts?student_id=${student.id}`, '_blank')}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CORR-2025-12-18: Componente de paginacion server-side */}
      {pagination && (
        <DetectiveCard>
          <StudentPagination
            page={page}
            limit={limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            loading={loading}
            onPageChange={setPage}
            onLimitChange={setPageLimit}
          />
        </DetectiveCard>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          classroomId={classroomId}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* US-PM-006: Suspend Student Modal */}
      {studentToSuspend && (
        <SuspendStudentModal
          student={studentToSuspend}
          classroomId={classroomId}
          onClose={() => setStudentToSuspend(null)}
          onSuccess={handleSuspendSuccess}
        />
      )}
    </div>
  );
}
