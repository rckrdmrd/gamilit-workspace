import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useInterventionAlerts } from '../../hooks/useInterventionAlerts';
import {
  InterventionAlertSeverity,
  InterventionAlertStatus,
  InterventionAlertType,
  StudentInterventionAlert,
} from '@/services/api/teacher/interventionAlertsApi';
import toast from 'react-hot-toast';

interface InterventionAlertsPanelProps {
  classroomId?: string;
}

export function InterventionAlertsPanel({ classroomId }: InterventionAlertsPanelProps) {
  const {
    alerts,
    total,
    loading,
    error,
    filters,
    pagination,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    updateFilters,
    nextPage,
    prevPage,
    refresh,
  } = useInterventionAlerts(classroomId ? { classroom_id: classroomId } : {});

  const [selectedAlert, setSelectedAlert] = useState<StudentInterventionAlert | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const getSeverityColor = (severity: InterventionAlertSeverity): string => {
    switch (severity) {
      case InterventionAlertSeverity.CRITICAL:
        return 'text-red-600 bg-red-100';
      case InterventionAlertSeverity.HIGH:
        return 'text-orange-600 bg-orange-100';
      case InterventionAlertSeverity.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case InterventionAlertSeverity.LOW:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: InterventionAlertSeverity) => {
    switch (severity) {
      case InterventionAlertSeverity.CRITICAL:
        return <XCircle className="h-5 w-5" />;
      case InterventionAlertSeverity.HIGH:
        return <AlertTriangle className="h-5 w-5" />;
      case InterventionAlertSeverity.MEDIUM:
        return <AlertCircle className="h-5 w-5" />;
      case InterventionAlertSeverity.LOW:
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: InterventionAlertType): string => {
    const labels: Record<InterventionAlertType, string> = {
      [InterventionAlertType.NO_ACTIVITY]: 'Sin Actividad',
      [InterventionAlertType.LOW_SCORE]: 'Bajo Rendimiento',
      [InterventionAlertType.DECLINING_TREND]: 'Tendencia Decreciente',
      [InterventionAlertType.REPEATED_FAILURES]: 'Fallos Repetidos',
      [InterventionAlertType.EXCESSIVE_TIME]: 'Tiempo Excesivo',
      [InterventionAlertType.LOW_ENGAGEMENT]: 'Bajo Engagement',
    };
    return labels[type] || type;
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success('Alerta reconocida exitosamente', {
        duration: 3000,
        icon: '✅',
      });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      toast.error('Error al reconocer la alerta. Por favor intenta nuevamente.', {
        duration: 4000,
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      await resolveAlert(selectedAlert.id, resolutionNotes);
      setShowResolveModal(false);
      setResolutionNotes('');
      setSelectedAlert(null);
      toast.success('Alerta resuelta exitosamente', {
        duration: 3000,
        icon: '✅',
      });
    } catch (err) {
      console.error('Error resolving alert:', err);
      toast.error('Error al resolver la alerta. Por favor intenta nuevamente.', {
        duration: 4000,
      });
    }
  };

  const handleDismiss = async (alertId: string) => {
    if (confirm('¿Estás seguro de que quieres descartar esta alerta?')) {
      try {
        await dismissAlert(alertId);
        toast.success('Alerta descartada exitosamente', {
          duration: 3000,
          icon: '🗑️',
        });
      } catch (err) {
        console.error('Error dismissing alert:', err);
        toast.error('Error al descartar la alerta. Por favor intenta nuevamente.', {
          duration: 4000,
        });
      }
    }
  };

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <span className="ml-3">Cargando alertas...</span>
        </div>
      </DetectiveCard>
    );
  }

  if (error) {
    return (
      <DetectiveCard>
        <div className="p-4 text-red-600">
          <p>Error al cargar alertas: {error.message}</p>
          <DetectiveButton onClick={refresh} className="mt-2">
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <DetectiveCard>
        <div className="flex items-center gap-4 p-4">
          <Filter className="h-5 w-5 text-detective-orange" />
          <select
            value={filters.severity || ''}
            onChange={(e) =>
              updateFilters({
                severity: (e.target.value as InterventionAlertSeverity) || undefined,
              })
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Todas las severidades</option>
            <option value={InterventionAlertSeverity.CRITICAL}>Crítica</option>
            <option value={InterventionAlertSeverity.HIGH}>Alta</option>
            <option value={InterventionAlertSeverity.MEDIUM}>Media</option>
            <option value={InterventionAlertSeverity.LOW}>Baja</option>
          </select>

          <select
            value={filters.alert_type || ''}
            onChange={(e) =>
              updateFilters({ alert_type: (e.target.value as InterventionAlertType) || undefined })
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Todos los tipos</option>
            <option value={InterventionAlertType.NO_ACTIVITY}>Sin Actividad</option>
            <option value={InterventionAlertType.LOW_SCORE}>Bajo Rendimiento</option>
            <option value={InterventionAlertType.DECLINING_TREND}>Tendencia Decreciente</option>
            <option value={InterventionAlertType.REPEATED_FAILURES}>Fallos Repetidos</option>
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) =>
              updateFilters({ status: (e.target.value as InterventionAlertStatus) || undefined })
            }
            className="rounded border px-3 py-2"
          >
            <option value="">Todos los estados</option>
            <option value={InterventionAlertStatus.ACTIVE}>Activas</option>
            <option value={InterventionAlertStatus.ACKNOWLEDGED}>Reconocidas</option>
            <option value={InterventionAlertStatus.RESOLVED}>Resueltas</option>
          </select>

          <DetectiveButton onClick={refresh} size="sm">
            Actualizar
          </DetectiveButton>
        </div>
      </DetectiveCard>

      {/* Lista de alertas */}
      {alerts.length === 0 ? (
        <DetectiveCard>
          <div className="py-8 text-center text-gray-500">
            <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
            <p>No hay alertas pendientes</p>
          </div>
        </DetectiveCard>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <DetectiveCard key={alert.id}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${getSeverityColor(
                          alert.severity,
                        )}`}
                      >
                        {getSeverityIcon(alert.severity)}
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getAlertTypeLabel(alert.alert_type)}
                      </span>
                    </div>

                    <h3 className="mb-1 text-lg font-bold">{alert.title}</h3>
                    <p className="mb-2 text-gray-600">{alert.description}</p>

                    <div className="text-sm text-gray-500">
                      <p>
                        <strong>Estudiante:</strong> {alert.student_name}
                      </p>
                      {alert.classroom_name && (
                        <p>
                          <strong>Clase:</strong> {alert.classroom_name}
                        </p>
                      )}
                      <p>
                        <strong>Generada:</strong> {new Date(alert.generated_at).toLocaleString()}
                      </p>
                      {alert.metrics && (
                        <div className="mt-2">
                          <strong>Métricas:</strong>
                          <pre className="mt-1 rounded bg-gray-100 p-2 text-xs">
                            {JSON.stringify(alert.metrics, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {alert.status === InterventionAlertStatus.ACTIVE && (
                      <>
                        <DetectiveButton size="sm" onClick={() => handleAcknowledge(alert.id)}>
                          Reconocer
                        </DetectiveButton>
                        <DetectiveButton
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowResolveModal(true);
                          }}
                        >
                          Resolver
                        </DetectiveButton>
                      </>
                    )}
                    {alert.status === InterventionAlertStatus.ACKNOWLEDGED && (
                      <DetectiveButton
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowResolveModal(true);
                        }}
                      >
                        Resolver
                      </DetectiveButton>
                    )}
                    <DetectiveButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      Descartar
                    </DetectiveButton>
                  </div>
                </div>

                {alert.status === InterventionAlertStatus.RESOLVED && alert.resolution_notes && (
                  <div className="mt-3 rounded bg-green-50 p-3">
                    <p className="text-sm text-green-800">
                      <strong>Resolución:</strong> {alert.resolution_notes}
                    </p>
                    <p className="mt-1 text-xs text-green-600">
                      Resuelto el {new Date(alert.resolved_at!).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </DetectiveCard>
          ))}
        </div>
      )}

      {/* Paginación */}
      {total > pagination.limit && (
        <DetectiveCard>
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-600">
              Mostrando {pagination.offset + 1} -{' '}
              {Math.min(pagination.offset + pagination.limit, total)} de {total}
            </p>
            <div className="flex gap-2">
              <DetectiveButton size="sm" onClick={prevPage} disabled={pagination.offset === 0}>
                Anterior
              </DetectiveButton>
              <DetectiveButton
                size="sm"
                onClick={nextPage}
                disabled={pagination.offset + pagination.limit >= total}
              >
                Siguiente
              </DetectiveButton>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Modal de Resolución */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <DetectiveCard className="w-full max-w-md">
            <div className="p-6">
              <h3 className="mb-4 text-xl font-bold">Resolver Alerta</h3>
              <p className="mb-4 text-gray-600">{selectedAlert.title}</p>
              <textarea
                className="mb-4 w-full rounded border p-3"
                rows={4}
                placeholder="Describe las acciones tomadas para resolver esta alerta..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <DetectiveButton
                  variant="outline"
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolutionNotes('');
                    setSelectedAlert(null);
                  }}
                >
                  Cancelar
                </DetectiveButton>
                <DetectiveButton onClick={handleResolve} disabled={!resolutionNotes.trim()}>
                  Resolver
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>
        </div>
      )}
    </div>
  );
}
