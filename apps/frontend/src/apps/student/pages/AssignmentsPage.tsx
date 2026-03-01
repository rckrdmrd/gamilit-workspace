/**
 * AssignmentsPage - Student Assignments Hub
 *
 * Displays student's assigned tasks, grades, and submission status.
 * Created as part of P1-002 gap fix.
 *
 * Route: /student/assignments
 *
 * @created 2025-11-29
 */

import { useEffect, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';

// Store
import { useStudentAssignmentsStore } from '@/features/assignments/store/studentAssignmentsStore';
import type { StudentAssignment, AssignmentFilters } from '@/services/api/studentAssignmentsAPI';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  assigned: {
    label: 'Pendiente',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: ClipboardList,
  },
  in_progress: {
    label: 'En Progreso',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  submitted: {
    label: 'Enviada',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: CheckCircle,
  },
  graded: {
    label: 'Calificada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: GraduationCap,
  },
  late: {
    label: 'Retrasada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
  },
};

// ============================================================================
// ASSIGNMENT CARD COMPONENT
// ============================================================================

interface AssignmentCardProps {
  assignment: StudentAssignment;
  onClick: () => void;
}

function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const status = statusConfig[assignment.status] || statusConfig.assigned;
  const StatusIcon = status.icon;

  const dueDate = assignment.assignment.dueDate ? new Date(assignment.assignment.dueDate) : null;

  const isOverdue = dueDate && dueDate < new Date() && assignment.status !== 'graded';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="line-clamp-2 font-semibold text-gray-900" title={assignment.assignment.title}>
              {assignment.assignment.title}
            </h3>
            <span className="text-xs capitalize text-gray-500">
              {assignment.assignment.assignmentType}
            </span>
          </div>
          <div
            className={`${status.bgColor} ${status.color} flex items-center gap-1 rounded-full px-2 py-1`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
        </div>

        {/* Description */}
        {assignment.assignment.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600" title={assignment.assignment.description}>
            {assignment.assignment.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          {/* Due date */}
          <div
            className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}
          >
            <Clock className="h-4 w-4" />
            <span>
              {dueDate
                ? dueDate.toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Sin fecha límite'}
            </span>
          </div>

          {/* Score */}
          {assignment.status === 'graded' && assignment.score !== null && (
            <div className="flex items-center gap-1 font-medium text-green-600">
              <GraduationCap className="h-4 w-4" />
              <span>
                {assignment.score}/{assignment.assignment.totalPoints}
              </span>
            </div>
          )}

          {/* Points */}
          {assignment.status !== 'graded' && (
            <div className="text-gray-500">{assignment.assignment.totalPoints} pts</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// GRADES SUMMARY COMPONENT
// ============================================================================

function GradesSummaryCard() {
  const { gradesSummary, isLoadingGrades, fetchGradesSummary } = useStudentAssignmentsStore();

  useEffect(() => {
    fetchGradesSummary();
  }, [fetchGradesSummary]);

  if (isLoadingGrades) {
    return (
      <div className="animate-pulse rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white" aria-live="polite">
        <span className="sr-only">Cargando resumen de calificaciones...</span>
        <div className="mb-4 h-6 w-1/2 rounded bg-white/20"></div>
        <div className="h-10 w-1/3 rounded bg-white/20"></div>
      </div>
    );
  }

  if (!gradesSummary) return null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="h-6 w-6" />
        Resumen de Calificaciones
      </h2>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{gradesSummary.averageScore}%</div>
          <div className="text-sm text-white/80">Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{gradesSummary.completed}</div>
          <div className="text-sm text-white/80">Completadas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{gradesSummary.pending}</div>
          <div className="text-sm text-white/80">Pendientes</div>
        </div>
      </div>

      {gradesSummary.grades.length > 0 && (
        <div className="border-t border-white/20 pt-4">
          <h3 className="mb-2 text-sm font-medium">Últimas calificaciones</h3>
          <div className="space-y-2">
            {gradesSummary.grades.slice(0, 3).map((grade, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="flex-1 truncate">{grade.assignmentTitle}</span>
                <span className="ml-2 font-medium">
                  {grade.score}/{grade.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FILTER TABS COMPONENT
// ============================================================================

interface FilterTabsProps {
  currentFilter: string | undefined;
  onFilterChange: (filter: AssignmentFilters) => void;
}

function FilterTabs({ currentFilter, onFilterChange }: FilterTabsProps) {
  const filters: Array<{ key: string | undefined; label: string }> = [
    { key: undefined, label: 'Todas' },
    { key: 'assigned', label: 'Pendientes' },
    { key: 'in_progress', label: 'En Progreso' },
    { key: 'submitted', label: 'Enviadas' },
    { key: 'graded', label: 'Calificadas' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2" role="group" aria-label="Filtrar tareas por estado">
      <Filter className="h-5 w-5 flex-shrink-0 text-detective-text-secondary" aria-hidden="true" />
      {filters.map((filter) => (
        <button
          key={filter.key || 'all'}
          onClick={() => onFilterChange({ status: filter.key as AssignmentFilters['status'] })}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors
            ${
              currentFilter === filter.key
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg'
            }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AssignmentsPage() {
  const navigate = useNavigate();

  const { assignments, isLoading, error, filters, fetchAssignments, setFilters } =
    useStudentAssignmentsStore();

  // Fetch assignments on mount
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Handle assignment click
  const handleAssignmentClick = (assignment: StudentAssignment) => {
    // Navigate to assignment detail page
    navigate(`/assignments/${assignment.id}`);
  };

  return (
    <StudentPageShell>
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Grades Summary */}
        <div className="mb-6">
          <GradesSummaryCard />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs currentFilter={filters.status} onFilterChange={setFilters} />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            <span className="sr-only">Cargando tareas asignadas...</span>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-5">
                <div className="mb-3 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
                <div className="h-3 w-full rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && assignments.length === 0 && (
          <div className="py-12 text-center" aria-live="polite">
            <ClipboardList className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No tienes tareas asignadas</h3>
            <p className="text-gray-500">
              {filters.status
                ? 'No hay tareas con este estado. Prueba cambiando el filtro.'
                : 'Tu profesor aún no te ha asignado tareas.'}
            </p>
          </div>
        )}

        {/* Assignments Grid */}
        {!isLoading && assignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="region"
            aria-label="Lista de tareas asignadas"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </motion.div>
        )}
      </main>
    </StudentPageShell>
  );
}
