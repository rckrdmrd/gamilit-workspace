import { useState } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import { useApiError } from '@shared/hooks';
import { useScheduledReports } from '../../hooks/useScheduledReports';
import type {
  ScheduledReportResponse,
  ScheduledReportFrequency,
  CreateScheduledReportDto,
} from '@services/api/teacher/scheduledReportsApi';
import toast from 'react-hot-toast';
import {
  Calendar,
  TrendingUp,
  RefreshCw,
  Info,
  Clock,
  Pause,
  Play,
  Trash2,
  Plus,
  X,
} from 'lucide-react';

// ============================================================================
// SCHEDULED REPORTS HELPERS
// ============================================================================

const FREQUENCY_LABELS: Record<ScheduledReportFrequency, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

const formatNextRun = (dateStr: string | null): string => {
  if (!dateStr) return 'Pendiente';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatScheduleDetail = (report: ScheduledReportResponse): string => {
  const freq = FREQUENCY_LABELS[report.frequency] || report.frequency;
  if (report.frequency === 'weekly' && report.day_of_week !== null) {
    return `${freq} - ${DAY_OF_WEEK_LABELS[report.day_of_week] || `Día ${report.day_of_week}`}`;
  }
  if (report.frequency === 'monthly' && report.day_of_month !== null) {
    return `${freq} - Día ${report.day_of_month}`;
  }
  return freq;
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface ScheduledReportsTabProps {
  classrooms: Array<{ id: string; name: string }>;
}

export function ScheduledReportsTab({ classrooms }: ScheduledReportsTabProps) {
  const { handleError } = useApiError();
  const {
    scheduledReports,
    loading,
    error,
    createScheduledReport,
    deleteScheduledReport,
    pauseScheduledReport,
    resumeScheduledReport,
    isMutating,
    refresh,
  } = useScheduledReports();

  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null; name: string }>({
    show: false,
    id: null,
    name: '',
  });

  // Form state
  const [formData, setFormData] = useState<{
    reportName: string;
    reportType: string;
    reportFormat: string;
    classroomId: string;
    frequency: ScheduledReportFrequency;
    dayOfWeek: number;
    dayOfMonth: number;
    preferredHour: number;
    notifyEmail: boolean;
    emailRecipients: string;
  }>({
    reportName: '',
    reportType: 'progress',
    reportFormat: 'pdf',
    classroomId: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    preferredHour: 8,
    notifyEmail: false,
    emailRecipients: '',
  });

  const resetForm = () => {
    setFormData({
      reportName: '',
      reportType: 'progress',
      reportFormat: 'pdf',
      classroomId: '',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      preferredHour: 8,
      notifyEmail: false,
      emailRecipients: '',
    });
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!formData.reportName.trim()) {
      toast.error('El nombre del reporte es requerido.');
      return;
    }

    try {
      const dto: CreateScheduledReportDto = {
        reportName: formData.reportName.trim(),
        reportType: formData.reportType,
        reportFormat: formData.reportFormat,
        frequency: formData.frequency,
        preferredHour: formData.preferredHour,
        notifyEmail: formData.notifyEmail,
      };

      if (formData.classroomId) {
        dto.classroomId = formData.classroomId;
      }
      if (formData.frequency === 'weekly') {
        dto.dayOfWeek = formData.dayOfWeek;
      }
      if (formData.frequency === 'monthly') {
        dto.dayOfMonth = formData.dayOfMonth;
      }
      if (formData.notifyEmail && formData.emailRecipients.trim()) {
        dto.emailRecipients = formData.emailRecipients
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);
      }

      await createScheduledReport(dto);
      toast.success('Reporte programado creado correctamente.');
      resetForm();
    } catch (err) {
      handleError(err as Parameters<typeof handleError>[0], 'Error al crear el reporte programado');
    }
  };

  const handlePauseResume = async (report: ScheduledReportResponse) => {
    try {
      if (report.status === 'active') {
        await pauseScheduledReport(report.id);
        toast.success(`"${report.report_name}" pausado.`);
      } else {
        await resumeScheduledReport(report.id);
        toast.success(`"${report.report_name}" reanudado.`);
      }
    } catch (err) {
      handleError(
        err as Parameters<typeof handleError>[0],
        report.status === 'active' ? 'Error al pausar el reporte' : 'Error al reanudar el reporte',
      );
    }
  };

  const handleDeleteClick = (report: ScheduledReportResponse) => {
    setDeleteConfirm({ show: true, id: report.id, name: report.report_name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteScheduledReport(deleteConfirm.id);
      toast.success('Reporte programado eliminado.');
    } catch (err) {
      handleError(err as Parameters<typeof handleError>[0], 'Error al eliminar el reporte programado');
    } finally {
      setDeleteConfirm({ show: false, id: null, name: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-detective-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <DetectiveCard>
        <div className="flex items-center gap-3 text-red-600">
          <Info className="h-5 w-5" />
          <p>Error al cargar reportes programados. Intenta nuevamente.</p>
          <DetectiveButton variant="secondary" size="sm" onClick={refresh}>
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-detective-text">Reportes Programados</h2>
          <p className="text-sm text-detective-text-secondary">
            Configura reportes que se generan automáticamente según una frecuencia definida.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DetectiveButton variant="secondary" size="sm" onClick={refresh} disabled={isMutating}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </DetectiveButton>
          <DetectiveButton onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="h-4 w-4" />
            Nuevo Programado
          </DetectiveButton>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <DetectiveCard className="border-detective-orange">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-detective-text">Nuevo Reporte Programado</h3>
              <button onClick={resetForm} className="text-detective-text-secondary hover:text-detective-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Row 1: Name + Type + Format */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Nombre del Reporte *
                </label>
                <input
                  type="text"
                  value={formData.reportName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reportName: e.target.value }))}
                  placeholder="Ej: Progreso semanal 3er grado"
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Tipo de Reporte
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reportType: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                >
                  <option value="progress">Progreso</option>
                  <option value="evaluation">Evaluación</option>
                  <option value="intervention">Intervención</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Formato
                </label>
                <select
                  value={formData.reportFormat}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reportFormat: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            {/* Row 2: Classroom + Frequency */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Aula (opcional)
                </label>
                <select
                  value={formData.classroomId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, classroomId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                >
                  <option value="">Todas las aulas</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Frecuencia
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: e.target.value as ScheduledReportFrequency,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-detective-text">
                    Día de la Semana
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                  >
                    {Object.entries(DAY_OF_WEEK_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formData.frequency === 'monthly' && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-detective-text">
                    Día del Mes
                  </label>
                  <select
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dayOfMonth: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 3: Hour + Email notification */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-detective-text">
                  Hora Preferida
                </label>
                <select
                  value={formData.preferredHour}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preferredHour: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-detective-text">
                  <input
                    type="checkbox"
                    checked={formData.notifyEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notifyEmail: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-detective-orange focus:ring-detective-orange"
                  />
                  Notificar por correo
                </label>
              </div>
              {formData.notifyEmail && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-detective-text">
                    Destinatarios (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.emailRecipients}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, emailRecipients: e.target.value }))
                    }
                    placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
                    className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
              <DetectiveButton variant="secondary" onClick={resetForm}>
                Cancelar
              </DetectiveButton>
              <DetectiveButton onClick={handleCreate} disabled={isMutating}>
                {isMutating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Crear Reporte Programado
                  </>
                )}
              </DetectiveButton>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* List of scheduled reports */}
      {scheduledReports.length === 0 ? (
        <DetectiveCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-detective-text-secondary opacity-40" />
            <p className="text-lg font-semibold text-detective-text">Sin reportes programados</p>
            <p className="mt-1 text-sm text-detective-text-secondary">
              Crea tu primer reporte programado para recibir informes automáticamente.
            </p>
          </div>
        </DetectiveCard>
      ) : (
        <div className="space-y-3">
          {scheduledReports.map((report) => (
            <DetectiveCard key={report.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-detective-text">{report.report_name}</h3>
                    <StatusBadge
                      status={report.status === 'paused' ? 'suspended' : report.status}
                      label={
                        report.status === 'active'
                          ? 'Activo'
                          : report.status === 'paused'
                            ? 'Pausado'
                            : 'Completado'
                      }
                      size="sm"
                    />
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {report.report_format.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-detective-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatScheduleDetail(report)}
                    </span>
                    {report.preferred_hour !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {report.preferred_hour.toString().padStart(2, '0')}:00
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {report.run_count} ejecuciones
                    </span>
                    {report.next_run_at && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Próxima: {formatNextRun(report.next_run_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status !== 'completed' && (
                    <DetectiveButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePauseResume(report)}
                      disabled={isMutating}
                      title={report.status === 'active' ? 'Pausar' : 'Reanudar'}
                    >
                      {report.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {report.status === 'active' ? 'Pausar' : 'Reanudar'}
                    </DetectiveButton>
                  )}
                  <DetectiveButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteClick(report)}
                    disabled={isMutating}
                    title="Eliminar"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </DetectiveButton>
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal isOpen={deleteConfirm.show} onClose={() => setDeleteConfirm({ show: false, id: null, name: '' })} showCloseButton={false} size="sm" className="bg-transparent shadow-none p-0">
        <div className="-mx-6 -my-4">
          <DetectiveCard className="max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-detective-text">Confirmar Eliminación</h3>
              <p className="text-sm text-detective-text-secondary">
                ¿Estás seguro de que deseas eliminar el reporte programado{' '}
                <strong className="text-detective-text">"{deleteConfirm.name}"</strong>? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <DetectiveButton
                  variant="secondary"
                  onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                >
                  Cancelar
                </DetectiveButton>
                <DetectiveButton
                  onClick={confirmDelete}
                  disabled={isMutating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isMutating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>
        </div>
      </Modal>
    </div>
  );
}
