/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
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
import { StudentStatusCard } from './StudentStatusCard';
import { StudentDetailModal } from './StudentDetailModal';
import { RefreshControl } from './RefreshControl';
import { StudentPagination } from './StudentPagination';
import { useStudentMonitoring } from '../../hooks/useStudentMonitoring';
import { useToast } from '@shared/components/base/Toast';
import type { StudentFilter, StudentMonitoring } from '../../types';

interface StudentMonitoringPanelProps {
  classroomId: string;
}

export function StudentMonitoringPanel({ classroomId }: StudentMonitoringPanelProps) {
  const [filters, setFilters] = useState<StudentFilter>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitoring | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'name' | 'score' | 'completion' | 'activity'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const previousStudentsRef = useRef<StudentMonitoring[]>([]);
  const { showToast } = useToast();

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
      const now = new Date();
      const lastActivity = new Date(student.last_activity);
      const diffMins = Math.floor((now.getTime() - lastActivity.getTime()) / 60000);

      if (diffMins < 1 && student.status === 'active') {
        const prevLastActivity = new Date(prevStudent.last_activity);
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

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status as any)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status as any];

      return {
        ...prev,
        status: newStatuses.length > 0 ? newStatuses : undefined,
      };
    });
  };

  // Calculate performance level based on score
  const calculatePerformanceLevel = (student: StudentMonitoring): 'high' | 'medium' | 'low' => {
    const score = student.score_average || 0;
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  // Handle performance filter
  const handlePerformanceFilter = (level: 'high' | 'medium' | 'low') => {
    setFilters((prev) => {
      const currentLevels = (prev as any).performanceLevel || [];
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter((l: string) => l !== level)
        : [...currentLevels, level];

      return {
        ...prev,
        performanceLevel: newLevels.length > 0 ? newLevels : undefined,
      } as StudentFilter;
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
    const performanceLevels = (filters as any).performanceLevel;
    if (performanceLevels && performanceLevels.length > 0) {
      filtered = filtered.filter((student) => {
        const level = calculatePerformanceLevel(student);
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

  // Calculate counts based on improved status logic
  const getStudentStatus = (student: StudentMonitoring) => {
    const now = new Date();
    const last = new Date(student.last_activity);
    const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);

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
  const highPerformanceCount = students.filter(
    (s) => calculatePerformanceLevel(s) === 'high',
  ).length;
  const mediumPerformanceCount = students.filter(
    (s) => calculatePerformanceLevel(s) === 'medium',
  ).length;
  const lowPerformanceCount = students.filter((s) => calculatePerformanceLevel(s) === 'low').length;

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
            <h2 className="text-2xl font-bold text-detective-text">Monitoreo de Estudiantes</h2>
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
      <div className="grid grid-cols-3 gap-4">
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
                variant={
                  (filters as any).performanceLevel?.includes('high') ? 'primary' : 'secondary'
                }
                onClick={() => handlePerformanceFilter('high')}
                size="sm"
              >
                Alto
              </DetectiveButton>
              <DetectiveButton
                variant={
                  (filters as any).performanceLevel?.includes('medium') ? 'primary' : 'secondary'
                }
                onClick={() => handlePerformanceFilter('medium')}
                size="sm"
              >
                Medio
              </DetectiveButton>
              <DetectiveButton
                variant={
                  (filters as any).performanceLevel?.includes('low') ? 'primary' : 'secondary'
                }
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
        /* Table View */
        <DetectiveCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-400 hover:text-detective-orange"
                    onClick={() => handleSort('name')}
                  >
                    Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Estado
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-400 hover:text-detective-orange"
                    onClick={() => handleSort('score')}
                  >
                    Puntuacion {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-400 hover:text-detective-orange"
                    onClick={() => handleSort('completion')}
                  >
                    Completitud{' '}
                    {sortField === 'completion' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Rendimiento
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-400 hover:text-detective-orange"
                    onClick={() => handleSort('activity')}
                  >
                    Ultima Actividad{' '}
                    {sortField === 'activity' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer border-b border-gray-800 hover:bg-detective-bg-secondary"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-detective-text">{student.full_name}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                          getStudentStatus(student) === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : getStudentStatus(student) === 'in_exercise'
                              ? 'bg-blue-500/20 text-blue-500'
                              : getStudentStatus(student) === 'inactive'
                                ? 'bg-gray-500/20 text-gray-400'
                                : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {getStudentStatus(student) === 'active' && 'Activo'}
                        {getStudentStatus(student) === 'in_exercise' && 'En ejercicio'}
                        {getStudentStatus(student) === 'inactive' && 'Inactivo'}
                        {getStudentStatus(student) === 'offline' && 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold ${
                          (student.score_average || 0) >= 80
                            ? 'text-green-500'
                            : (student.score_average || 0) >= 60
                              ? 'text-yellow-500'
                              : 'text-red-500'
                        }`}
                      >
                        {(student.score_average || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-700">
                          <div
                            className={`h-2 rounded-full ${
                              (student.progress_percentage || 0) >= 70
                                ? 'bg-green-500'
                                : (student.progress_percentage || 0) >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${student.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {(student.progress_percentage || 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          calculatePerformanceLevel(student) === 'high'
                            ? 'bg-green-500/20 text-green-500'
                            : calculatePerformanceLevel(student) === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {calculatePerformanceLevel(student) === 'high' && 'Alto'}
                        {calculatePerformanceLevel(student) === 'medium' && 'Medio'}
                        {calculatePerformanceLevel(student) === 'low' && 'Bajo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-detective-text-secondary">
                      {student.last_activity
                        ? new Date(student.last_activity).toLocaleDateString('es-ES')
                        : 'Sin actividad'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetectiveCard>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedStudents.map((student) => (
            <StudentStatusCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
            />
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
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
