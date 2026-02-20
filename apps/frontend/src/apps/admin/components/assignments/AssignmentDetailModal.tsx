/**
 * AssignmentDetailModal Component
 *
 * Modal that shows detailed information about an assignment including:
 * - Basic info (title, description, classroom, teacher)
 * - Student submissions with status and grades
 * - Grade distribution
 * - Engagement metrics
 *
 * Created: 2025-11-29 - US-AE-009
 */

import { Users, Calendar, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { useAssignmentDetail } from '../../hooks/useAdminAssignments';
import type { AdminAssignment } from '../../hooks/useAdminAssignments';

interface AssignmentDetailModalProps {
  assignment: AdminAssignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentDetailModal({ assignment, isOpen, onClose }: AssignmentDetailModalProps) {
  const { data: detail, isLoading } = useAssignmentDetail(assignment?.id || null);

  const getSubmissionStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: typeof CheckCircle }
    > = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      submitted: { label: 'Entregada', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      graded: { label: 'Calificada', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      late: { label: 'Tarde', className: 'bg-red-100 text-red-700', icon: AlertCircle },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-700',
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Modal
      isOpen={isOpen && !!assignment}
      onClose={onClose}
      title={assignment?.title || ''}
      size="full"
      className="max-w-5xl"
    >
      {assignment && (
        <div>
          {/* Assignment metadata */}
          <div className="mb-4">
            <p className="text-sm text-detective-text-secondary">{assignment.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-detective-text-secondary">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{assignment.classroom_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Profesor: {assignment.teacher_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Vence: {formatDate(assignment.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
              <p className="mt-4 text-detective-text-secondary">Cargando detalles...</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <div className="text-sm text-detective-text-secondary">Total Estudiantes</div>
                  <div className="mt-1 text-2xl font-bold text-detective-text">
                    {assignment.total_students}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <div className="text-sm text-detective-text-secondary">Entregas</div>
                  <div className="mt-1 text-2xl font-bold text-blue-500">
                    {assignment.submissions_count}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <div className="text-sm text-detective-text-secondary">Calificadas</div>
                  <div className="mt-1 text-2xl font-bold text-green-500">
                    {assignment.graded_count}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <div className="text-sm text-detective-text-secondary">Promedio</div>
                  <div className="mt-1 text-2xl font-bold text-detective-text">
                    {assignment.average_grade !== null
                      ? assignment.average_grade.toFixed(1)
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              {detail.engagement_metrics && (
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <h3 className="mb-3 text-lg font-semibold text-detective-text">
                    Métricas de Engagement
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-detective-text-secondary">Iniciados</div>
                      <div className="text-xl font-bold text-detective-text">
                        {detail.engagement_metrics.started_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-detective-text-secondary">Completados</div>
                      <div className="text-xl font-bold text-detective-text">
                        {detail.engagement_metrics.completed_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-detective-text-secondary">Tiempo Promedio</div>
                      <div className="text-xl font-bold text-detective-text">
                        {formatTimeSpent(detail.engagement_metrics.average_time_spent)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grade Distribution */}
              {detail.grade_distribution && (
                <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                  <h3 className="mb-3 text-lg font-semibold text-detective-text">
                    Distribución de Calificaciones
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm text-detective-text-secondary">
                        Excelente (90-100)
                      </div>
                      <div className="text-xl font-bold text-green-500">
                        {detail.grade_distribution.excellent}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-detective-text-secondary">Bueno (75-89)</div>
                      <div className="text-xl font-bold text-blue-500">
                        {detail.grade_distribution.good}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-detective-text-secondary">Regular (60-74)</div>
                      <div className="text-xl font-bold text-yellow-500">
                        {detail.grade_distribution.average}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-detective-text-secondary">
                        Necesita Mejora (&lt;60)
                      </div>
                      <div className="text-xl font-bold text-red-500">
                        {detail.grade_distribution.needs_improvement}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submissions Table */}
              <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
                <h3 className="mb-3 text-lg font-semibold text-detective-text">
                  Entregas de Estudiantes ({detail.submissions.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">
                          Estudiante
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">
                          Estado
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">
                          Fecha de Entrega
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">
                          Calificación
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-detective-text-secondary">
                          Calificado Por
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.submissions.map((submission) => (
                        <tr key={submission.student_id} className="border-b border-gray-700">
                          <td className="px-4 py-2 text-sm text-detective-text">
                            {submission.student_name}
                          </td>
                          <td className="px-4 py-2">
                            {getSubmissionStatusBadge(submission.status)}
                          </td>
                          <td className="px-4 py-2 text-sm text-detective-text-secondary">
                            {submission.submitted_at
                              ? formatDate(submission.submitted_at)
                              : 'No entregada'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {submission.grade !== null ? (
                              <span className="font-medium text-detective-text">
                                {submission.grade}
                              </span>
                            ) : (
                              <span className="text-detective-text-secondary">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-detective-text-secondary">
                            {submission.graded_by || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-detective-text-secondary">
              No se pudieron cargar los detalles
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
