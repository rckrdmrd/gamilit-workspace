import { Calendar, Users, Target, Clock, MoreVertical } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { Assignment } from '../../types';

interface AssignmentListProps {
  assignments: Assignment[];
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignmentId: string) => void;
}

export function AssignmentList({ assignments, onEdit, onDelete }: AssignmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'expired':
        return 'Expirada';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  };

  if (assignments.length === 0) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <Target className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
          <p className="text-detective-text-secondary">No hay asignaciones creadas</p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <DetectiveCard key={assignment.id} hoverable={false}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-bold text-detective-text">{assignment.title}</h3>
                  <p className="text-sm text-detective-text-secondary">{assignment.module_name}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(
                    assignment.status,
                  )}`}
                >
                  {getStatusText(assignment.status)}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-detective-orange" />
                  <div>
                    <p className="text-xs text-detective-text-secondary">Fecha límite</p>
                    <p className="text-sm font-semibold text-detective-text">
                      {new Date(assignment.end_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-detective-gold" />
                  <div>
                    <p className="text-xs text-detective-text-secondary">Estudiantes</p>
                    <p className="text-sm font-semibold text-detective-text">
                      {assignment.assigned_to.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Target className="text-detective-accent h-4 w-4" />
                  <div>
                    <p className="text-xs text-detective-text-secondary">Ejercicios</p>
                    <p className="text-sm font-semibold text-detective-text">
                      {assignment.exercise_ids.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-detective-orange" />
                  <div>
                    <p className="text-xs text-detective-text-secondary">Intentos</p>
                    <p className="text-sm font-semibold text-detective-text">
                      {assignment.max_attempts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-detective-text-secondary">
                <span>Creada: {new Date(assignment.created_at).toLocaleDateString('es-ES')}</span>
                {assignment.allow_powerups && (
                  <span className="rounded bg-detective-bg-secondary px-2 py-1">
                    Power-ups permitidos
                  </span>
                )}
                {assignment.custom_points && (
                  <span className="rounded bg-detective-bg-secondary px-2 py-1">
                    {assignment.custom_points} puntos
                  </span>
                )}
              </div>
            </div>

            {(onEdit || onDelete) && (
              <div className="ml-4">
                <button className="rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary">
                  <MoreVertical className="h-5 w-5 text-detective-text-secondary" />
                </button>
              </div>
            )}
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
}
