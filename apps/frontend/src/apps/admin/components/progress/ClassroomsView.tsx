/**
 * ClassroomsView Component
 *
 * Displays classroom list with drill-down to students.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import React, { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Users, TrendingUp, Award, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { ClassroomProgress, StudentProgressSummary } from '@/services/api/adminTypes';

interface ClassroomsViewProps {
  classroomProgress: ClassroomProgress | null;
  isLoading: boolean;
  onStudentClick: (studentId: string) => void;
}

export const ClassroomsView: React.FC<ClassroomsViewProps> = ({
  classroomProgress,
  isLoading,
  onStudentClick,
}) => {
  const [sortField, setSortField] = useState<keyof StudentProgressSummary>('display_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showStudents, setShowStudents] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DetectiveCard className="animate-pulse">
          <div className="h-32 rounded bg-detective-bg-secondary/50" />
        </DetectiveCard>
        <DetectiveCard className="animate-pulse">
          <div className="h-64 rounded bg-detective-bg-secondary/50" />
        </DetectiveCard>
      </div>
    );
  }

  if (!classroomProgress) {
    return (
      <DetectiveCard>
        <p className="py-8 text-center text-detective-text-secondary">
          Selecciona un aula para ver el progreso
        </p>
      </DetectiveCard>
    );
  }

  const handleSort = (field: keyof StudentProgressSummary) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = [...classroomProgress.students].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="space-y-6">
      {/* Classroom Info Card */}
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-2xl font-bold text-detective-text">
              {classroomProgress.classroom_name}
            </h2>
            <p className="text-detective-text-secondary">
              Profesor: {classroomProgress.teacher_name}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-detective-text">
                {classroomProgress.total_students}
              </p>
              <p className="text-sm text-detective-text-secondary">
                {classroomProgress.active_students} activos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-detective-orange/10 p-3">
              <TrendingUp className="h-5 w-5 text-detective-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-detective-text">
                {classroomProgress.avg_class_progress_percent.toFixed(1)}%
              </p>
              <p className="text-sm text-detective-text-secondary">Progreso promedio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-detective-text">
                {classroomProgress.students.length}
              </p>
              <p className="text-sm text-detective-text-secondary">Estudiantes</p>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Students Table */}
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-detective-text">Lista de Estudiantes</h3>
          <DetectiveButton
            variant="outline"
            size="sm"
            onClick={() => setShowStudents(!showStudents)}
          >
            {showStudents ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Mostrar
              </>
            )}
          </DetectiveButton>
        </div>

        {showStudents && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-detective-border border-b">
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('display_name')}
                  >
                    Nombre
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('level')}
                  >
                    Nivel
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('total_xp')}
                  >
                    XP
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('avg_module_progress')}
                  >
                    Progreso
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('avg_score')}
                  >
                    Puntaje
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('streak_days')}
                  >
                    Racha
                  </th>
                  <th
                    className="cursor-pointer p-3 text-left text-detective-text-secondary hover:text-detective-text"
                    onClick={() => handleSort('last_activity_at')}
                  >
                    Última Actividad
                  </th>
                  <th className="p-3 text-left text-detective-text-secondary">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => (
                  <tr
                    key={student.user_id}
                    className="border-detective-border border-b transition-colors hover:bg-detective-bg-secondary/30"
                  >
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-detective-text">{student.display_name}</p>
                        <p className="text-xs text-detective-text-secondary">{student.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-detective-text">{student.level}</td>
                    <td className="p-3 text-detective-text">{student.total_xp.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-detective-bg-secondary">
                          <div
                            className="h-full bg-detective-orange"
                            style={{ width: `${student.avg_module_progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-detective-text">
                          {student.avg_module_progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-detective-text">
                      {student.avg_score ? `${student.avg_score.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded bg-detective-orange/20 px-2 py-1 text-xs font-medium text-detective-orange">
                        {student.streak_days} días
                      </span>
                    </td>
                    <td className="p-3 text-sm text-detective-text-secondary">
                      {formatDate(student.last_activity_at)}
                    </td>
                    <td className="p-3">
                      <DetectiveButton
                        variant="outline"
                        size="sm"
                        onClick={() => onStudentClick(student.user_id)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </DetectiveButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetectiveCard>
    </div>
  );
};
