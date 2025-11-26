import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { StudentMonitoring } from '../../types';

interface StudentProgressListProps {
  students: StudentMonitoring[];
  onStudentClick?: (student: StudentMonitoring) => void;
}

type SortField = 'name' | 'progress' | 'score' | 'lastActivity' | 'exercises';
type SortDirection = 'asc' | 'desc';

/**
 * StudentProgressList - Tabla de progreso de estudiantes con ordenamiento
 *
 * Características:
 * - Ordenamiento por múltiples campos (nombre, progreso, score, última actividad)
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
      let aValue: any;
      let bValue: any;

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
          aValue = new Date(a.last_activity).getTime();
          bValue = new Date(b.last_activity).getTime();
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-detective-text-secondary" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-detective-orange" />
    ) : (
      <ArrowDown className="h-4 w-4 text-detective-orange" />
    );
  };

  const getProgressBadge = (progress: number) => {
    if (progress < 30) {
      return (
        <div className="flex items-center gap-2 rounded-full border border-red-500 bg-red-500 bg-opacity-10 px-3 py-1">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold text-red-500">En Riesgo</span>
        </div>
      );
    } else if (progress < 70) {
      return (
        <div className="flex items-center gap-2 rounded-full border border-yellow-500 bg-yellow-500 bg-opacity-10 px-3 py-1">
          <span className="text-xs font-semibold text-yellow-500">En Progreso</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 rounded-full border border-green-500 bg-green-500 bg-opacity-10 px-3 py-1">
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

  const getTimeSinceLastActivity = (lastActivity: string) => {
    const now = new Date();
    const last = new Date(lastActivity);
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffMins < 1440) {
      return `Hace ${Math.floor(diffMins / 60)} hrs`;
    } else {
      return `Hace ${Math.floor(diffMins / 1440)} días`;
    }
  };

  // Contar estudiantes en riesgo
  const atRiskCount = students.filter((s) => s.progress_percentage < 30).length;

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
            <div className="rounded-lg bg-red-500 bg-opacity-10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold text-detective-text">
                ⚠️ Estudiantes que Requieren Atención
              </h4>
              <p className="text-detective-text-secondary">
                {atRiskCount} estudiante(s) tienen menos del 30% de progreso. Considera intervenir
                para apoyarlos y evitar rezago académico.
              </p>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Table */}
      <DetectiveCard hoverable={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-detective-border border-b">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-sm font-semibold text-detective-text transition-colors hover:text-detective-orange"
                  >
                    Estudiante
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('progress')}
                    className="flex items-center gap-2 text-sm font-semibold text-detective-text transition-colors hover:text-detective-orange"
                  >
                    Progreso
                    {renderSortIcon('progress')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('score')}
                    className="flex items-center gap-2 text-sm font-semibold text-detective-text transition-colors hover:text-detective-orange"
                  >
                    Score Promedio
                    {renderSortIcon('score')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('exercises')}
                    className="flex items-center gap-2 text-sm font-semibold text-detective-text transition-colors hover:text-detective-orange"
                  >
                    Ejercicios
                    {renderSortIcon('exercises')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('lastActivity')}
                    className="flex items-center gap-2 text-sm font-semibold text-detective-text transition-colors hover:text-detective-orange"
                  >
                    Última Actividad
                    {renderSortIcon('lastActivity')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-semibold text-detective-text">Estado</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => onStudentClick?.(student)}
                  className="border-detective-border cursor-pointer border-b transition-colors hover:bg-detective-bg-secondary"
                >
                  {/* Nombre */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-detective-text">{student.full_name}</p>
                      <p className="text-xs text-detective-text-secondary">{student.email}</p>
                      {student.current_module && (
                        <p className="mt-1 text-xs text-detective-orange">
                          Módulo: {student.current_module.substring(0, 25)}...
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Progreso */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-detective-bg">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              student.progress_percentage < 30
                                ? 'bg-red-500'
                                : student.progress_percentage < 70
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${student.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-detective-text">
                          {student.progress_percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-4">
                    <p className={`text-xl font-bold ${getScoreColor(student.score_average)}`}>
                      {student.score_average.toFixed(0)}%
                    </p>
                  </td>

                  {/* Ejercicios */}
                  <td className="px-4 py-4">
                    <p className="font-semibold text-detective-text">
                      {student.exercises_completed}/{student.exercises_total}
                    </p>
                    <p className="text-xs text-detective-text-secondary">
                      {student.exercises_total > 0
                        ? ((student.exercises_completed / student.exercises_total) * 100).toFixed(0)
                        : 0}
                      % completados
                    </p>
                  </td>

                  {/* Última Actividad */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-detective-text-secondary">
                      {getTimeSinceLastActivity(student.last_activity)}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-4">{getProgressBadge(student.progress_percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
