/**
 * AssignmentCard - Enhanced card component for displaying assignments
 *
 * Features:
 * - Status badges (active, closed, expired)
 * - Quick action buttons
 * - Visual stats (submissions, pending reviews)
 * - Click to view details
 *
 * @module apps/teacher/components/assignments/AssignmentCard
 */

import { Calendar, Users, Target, Clock, Eye, Bell, Edit2, Trash2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { Assignment } from '../../types';

interface AssignmentCardProps {
  assignment: Assignment;
  onViewSubmissions: (assignment: Assignment) => void;
  onSendReminder?: (assignmentId: string) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
}

export function AssignmentCard({
  assignment,
  onViewSubmissions,
  onSendReminder,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
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

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'practice':
        return 'bg-blue-500/20 text-blue-500';
      case 'quiz':
        return 'bg-purple-500/20 text-purple-500';
      case 'exam':
        return 'bg-red-500/20 text-red-500';
      case 'homework':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'practice':
        return 'Práctica';
      case 'quiz':
        return 'Quiz';
      case 'exam':
        return 'Examen';
      case 'homework':
        return 'Tarea';
      default:
        return type || 'N/A';
    }
  };

  const dueDate = assignment.dueDate || assignment.end_date;
  const isDueSoon = dueDate && new Date(dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <DetectiveCard hoverable={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-bold text-detective-text line-clamp-2" title={assignment.title}>{assignment.title}</h3>
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${getTypeColor(assignment.type)}`}
              >
                {getTypeLabel(assignment.type)}
              </span>
            </div>
            <p className="text-sm text-detective-text-secondary">
              {assignment.classroomName || 'Sin aula asignada'}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(assignment.status)}`}
          >
            {getStatusText(assignment.status)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-detective-orange" />
              <p className="text-xs text-detective-text-secondary">Fecha Límite</p>
            </div>
            <p
              className={`text-sm font-semibold ${isDueSoon ? 'text-yellow-500' : 'text-detective-text'}`}
            >
              {dueDate ? new Date(dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
            </p>
          </div>

          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-detective-gold" />
              <p className="text-xs text-detective-text-secondary">Entregas</p>
            </div>
            <p className="text-sm font-semibold text-detective-text">
              {assignment.totalSubmissions || 0} / {assignment.assigned_to?.length || 0}
            </p>
          </div>

          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <Target className="text-detective-accent h-4 w-4" />
              <p className="text-xs text-detective-text-secondary">Ejercicios</p>
            </div>
            <p className="text-sm font-semibold text-detective-text">
              {assignment.exercise_ids?.length || 0}
            </p>
          </div>

          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <div className="mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-detective-text-secondary">Pendientes</p>
            </div>
            <p
              className={`text-sm font-semibold ${(assignment.pendingReviews || 0) > 0 ? 'text-yellow-500' : 'text-green-500'}`}
            >
              {assignment.pendingReviews || 0}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center gap-3 text-xs text-detective-text-secondary">
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
          {assignment.max_attempts && (
            <span className="rounded bg-detective-bg-secondary px-2 py-1">
              {assignment.max_attempts} intentos
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-detective-border flex items-center gap-2 border-t pt-2">
          <DetectiveButton
            variant="primary"
            size="sm"
            onClick={() => onViewSubmissions(assignment)}
            className="flex-1"
          >
            <Eye className="h-4 w-4" />
            Ver Entregas
          </DetectiveButton>

          {onSendReminder && assignment.status === 'active' && (
            <DetectiveButton
              variant="secondary"
              size="sm"
              onClick={() => onSendReminder(assignment.id)}
              title="Enviar recordatorio a estudiantes"
              aria-label="Enviar recordatorio a estudiantes"
            >
              <Bell className="h-4 w-4" />
            </DetectiveButton>
          )}

          {onEdit && (
            <DetectiveButton
              variant="secondary"
              size="sm"
              onClick={() => onEdit(assignment)}
              title="Editar asignación"
              aria-label="Editar asignación"
            >
              <Edit2 className="h-4 w-4" />
            </DetectiveButton>
          )}

          {onDelete && (
            <DetectiveButton
              variant="danger"
              size="sm"
              onClick={() => onDelete(assignment)}
              title="Eliminar asignación"
              aria-label="Eliminar asignación"
            >
              <Trash2 className="h-4 w-4" />
            </DetectiveButton>
          )}
        </div>
      </div>
    </DetectiveCard>
  );
}
