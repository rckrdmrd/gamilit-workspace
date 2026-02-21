import { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import { Modal } from '@shared/components/common/Modal';
import { useApiError } from '@shared/hooks';
import { useSharedReports } from '../../hooks/useSharedReports';
import type { RecentReport } from './RecentReportsTable';
import type { SharePermission } from '@services/api/teacher/sharedReportsApi';
import toast from 'react-hot-toast';
import {
  Calendar,
  RefreshCw,
  Info,
  Clock,
  X,
  Share2,
  Eye,
  Download,
  Shield,
  UserCheck,
  Send,
} from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

export interface SharedReportsTabProps {
  recentReports: RecentReport[];
}

export function SharedReportsTab({ recentReports }: SharedReportsTabProps) {
  const { handleError } = useApiError();
  const {
    sharedByMe,
    sharedWithMe,
    loading,
    loadingByMe,
    loadingWithMe,
    error,
    shareReport,
    isSharing,
    markViewed,
    revokeShare,
    isRevoking,
    updatePermission,
    isUpdatingPermission,
    refresh,
  } = useSharedReports();

  const [showShareForm, setShowShareForm] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<{
    show: boolean;
    id: string | null;
    name: string;
  }>({ show: false, id: null, name: '' });

  // Share form state
  const [shareFormData, setShareFormData] = useState({
    reportId: '',
    sharedWithId: '',
    permission: 'view' as SharePermission,
    message: '',
    expiresInDays: 0, // 0 means no expiration
  });

  const resetShareForm = () => {
    setShareFormData({
      reportId: '',
      sharedWithId: '',
      permission: 'view',
      message: '',
      expiresInDays: 0,
    });
    setShowShareForm(false);
  };

  const handleShare = async () => {
    if (!shareFormData.reportId) {
      toast.error('Selecciona un reporte para compartir.');
      return;
    }
    if (!shareFormData.sharedWithId.trim()) {
      toast.error('Ingresa el ID del maestro destinatario.');
      return;
    }

    try {
      await shareReport({
        reportId: shareFormData.reportId,
        sharedWithId: shareFormData.sharedWithId.trim(),
        permission: shareFormData.permission,
        message: shareFormData.message.trim() || undefined,
        expiresInDays: shareFormData.expiresInDays > 0 ? shareFormData.expiresInDays : undefined,
      });
      toast.success('Reporte compartido correctamente.');
      resetShareForm();
    } catch (err) {
      handleError(
        err as Parameters<typeof handleError>[0],
        'Error al compartir el reporte',
      );
    }
  };

  const handleRevokeClick = (shareId: string, reportName: string) => {
    setRevokeConfirm({ show: true, id: shareId, name: reportName });
  };

  const confirmRevoke = async () => {
    if (!revokeConfirm.id) return;
    try {
      await revokeShare(revokeConfirm.id);
      toast.success('Acceso revocado correctamente.');
    } catch (err) {
      handleError(
        err as Parameters<typeof handleError>[0],
        'Error al revocar el acceso',
      );
    } finally {
      setRevokeConfirm({ show: false, id: null, name: '' });
    }
  };

  const handleTogglePermission = async (shareId: string, currentPermission: string) => {
    const newPermission: SharePermission = currentPermission === 'view' ? 'download' : 'view';
    try {
      await updatePermission(shareId, newPermission);
      toast.success(
        newPermission === 'download'
          ? 'Permiso actualizado a descarga.'
          : 'Permiso actualizado a solo lectura.',
      );
    } catch (err) {
      handleError(
        err as Parameters<typeof handleError>[0],
        'Error al actualizar el permiso',
      );
    }
  };

  const handleMarkViewed = async (shareId: string) => {
    try {
      await markViewed(shareId);
    } catch (err) {
      // Silent fail for marking as viewed
      console.error('[SharedReportsTab] Error marking as viewed:', err);
    }
  };

  const formatSharedDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatExpiresAt = (dateStr: string | null): string => {
    if (!dateStr) return 'Sin expiración';
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return 'Expirado';
    return `Expira: ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
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
          <p>Error al cargar reportes compartidos. Intenta nuevamente.</p>
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
          <h2 className="text-xl font-bold text-detective-text">Reportes Compartidos</h2>
          <p className="text-sm text-detective-text-secondary">
            Comparte reportes con otros maestros y accede a los que han compartido contigo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DetectiveButton
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={isSharing || isRevoking}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </DetectiveButton>
          <DetectiveButton onClick={() => setShowShareForm(true)} disabled={showShareForm}>
            <Share2 className="h-4 w-4" />
            Compartir Reporte
          </DetectiveButton>
        </div>
      </div>

      {/* Share form modal */}
      <Modal
        isOpen={showShareForm}
        onClose={resetShareForm}
        title="Compartir Reporte"
        size="lg"
      >
        <div className="space-y-4">
          {/* Select report */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-detective-text">
              Reporte a Compartir *
            </label>
            <select
              value={shareFormData.reportId}
              onChange={(e) =>
                setShareFormData((prev) => ({ ...prev, reportId: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
            >
              <option value="">Selecciona un reporte...</option>
              {recentReports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name} ({report.format.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher ID input */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-detective-text">
              ID del Maestro Destinatario *
            </label>
            <input
              type="text"
              value={shareFormData.sharedWithId}
              onChange={(e) =>
                setShareFormData((prev) => ({ ...prev, sharedWithId: e.target.value }))
              }
              placeholder="UUID del perfil del maestro"
              className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
            />
            <p className="mt-1 text-xs text-detective-text-secondary">
              Ingresa el identificador del maestro con quien deseas compartir.
            </p>
          </div>

          {/* Permission */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-detective-text">
              Nivel de Permiso
            </label>
            <select
              value={shareFormData.permission}
              onChange={(e) =>
                setShareFormData((prev) => ({
                  ...prev,
                  permission: e.target.value as SharePermission,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
            >
              <option value="view">Solo lectura</option>
              <option value="download">Lectura y descarga</option>
            </select>
          </div>

          {/* Expiration */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-detective-text">
              Expiración (días)
            </label>
            <select
              value={shareFormData.expiresInDays}
              onChange={(e) =>
                setShareFormData((prev) => ({
                  ...prev,
                  expiresInDays: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
            >
              <option value="0">Sin expiración</option>
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-detective-text">
              Mensaje (opcional)
            </label>
            <textarea
              value={shareFormData.message}
              onChange={(e) =>
                setShareFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Ej: Revisa el progreso del grupo 3-A..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-detective-bg-secondary px-3 py-2 text-sm text-detective-text focus:border-detective-orange focus:outline-none focus:ring-1 focus:ring-detective-orange"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <DetectiveButton variant="secondary" onClick={resetShareForm}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton onClick={handleShare} disabled={isSharing} loading={isSharing}>
              <Send className="h-4 w-4" />
              Compartir
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION: Compartidos por mí                                        */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-detective-text">
          <Share2 className="h-5 w-5 text-detective-orange" />
          Compartidos por mí
        </h3>

        {loadingByMe ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-detective-orange" />
          </div>
        ) : sharedByMe.length === 0 ? (
          <DetectiveCard>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Share2 className="mb-3 h-10 w-10 text-detective-text-secondary opacity-40" />
              <p className="font-semibold text-detective-text">
                No has compartido ningún reporte
              </p>
              <p className="mt-1 text-sm text-detective-text-secondary">
                Usa el botón "Compartir Reporte" para enviar un reporte a otro maestro.
              </p>
            </div>
          </DetectiveCard>
        ) : (
          <div className="space-y-3">
            {sharedByMe.map((share) => (
              <DetectiveCard key={share.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-detective-text">{share.report_name}</h4>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {share.report_format.toUpperCase()}
                      </span>
                      {share.permission === 'download' ? (
                        <StatusBadge status="active" label="Descarga" size="sm" />
                      ) : (
                        <StatusBadge status="reviewed" label="Lectura" size="sm" />
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-detective-text-secondary">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" />
                        Compartido con: {share.shared_with_id.slice(0, 8)}...
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatSharedDate(share.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {share.access_count} {share.access_count === 1 ? 'acceso' : 'accesos'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatExpiresAt(share.expires_at)}
                      </span>
                      {share.message && (
                        <span
                          className="flex items-center gap-1 truncate"
                          title={share.message}
                        >
                          <Info className="h-3.5 w-3.5" />
                          "{share.message}"
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DetectiveButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTogglePermission(share.id, share.permission)}
                      disabled={isUpdatingPermission}
                      title={
                        share.permission === 'view'
                          ? 'Cambiar a descarga'
                          : 'Cambiar a solo lectura'
                      }
                    >
                      <Shield className="h-4 w-4" />
                      {share.permission === 'view' ? 'Dar Descarga' : 'Solo Lectura'}
                    </DetectiveButton>
                    <DetectiveButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRevokeClick(share.id, share.report_name)}
                      disabled={isRevoking}
                      title="Revocar acceso"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Revocar
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION: Compartidos conmigo                                       */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-detective-text">
          <UserCheck className="h-5 w-5 text-green-600" />
          Compartidos conmigo
        </h3>

        {loadingWithMe ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-detective-orange" />
          </div>
        ) : sharedWithMe.length === 0 ? (
          <DetectiveCard>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserCheck className="mb-3 h-10 w-10 text-detective-text-secondary opacity-40" />
              <p className="font-semibold text-detective-text">
                Ningún maestro ha compartido reportes contigo
              </p>
              <p className="mt-1 text-sm text-detective-text-secondary">
                Cuando un colega comparta un reporte contigo, aparecerá aquí.
              </p>
            </div>
          </DetectiveCard>
        ) : (
          <div className="space-y-3">
            {sharedWithMe.map((share) => (
              <DetectiveCard
                key={share.id}
                className={share.is_expired ? 'opacity-60' : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-detective-text">{share.report_name}</h4>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {share.report_format.toUpperCase()}
                      </span>
                      {share.is_expired ? (
                        <StatusBadge status="expired" label="Expirado" size="sm" />
                      ) : share.can_download ? (
                        <StatusBadge status="active" label="Descarga" size="sm" />
                      ) : (
                        <StatusBadge status="reviewed" label="Lectura" size="sm" />
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-detective-text-secondary">
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3.5 w-3.5" />
                        De: {share.shared_by_id.slice(0, 8)}...
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatSharedDate(share.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatExpiresAt(share.expires_at)}
                      </span>
                      {share.message && (
                        <span
                          className="flex items-center gap-1 truncate"
                          title={share.message}
                        >
                          <Info className="h-3.5 w-3.5" />
                          "{share.message}"
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!share.is_expired && (
                      <DetectiveButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkViewed(share.id)}
                        title="Marcar como visto"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </DetectiveButton>
                    )}
                    {share.can_download && !share.is_expired && (
                      <DetectiveButton
                        variant="primary"
                        size="sm"
                        title="Descargar reporte"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </DetectiveButton>
                    )}
                  </div>
                </div>
              </DetectiveCard>
            ))}
          </div>
        )}
      </div>

      {/* Revoke confirmation modal */}
      <Modal isOpen={revokeConfirm.show} onClose={() => setRevokeConfirm({ show: false, id: null, name: '' })} showCloseButton={false} size="sm" className="bg-transparent shadow-none p-0">
        <div className="-mx-6 -my-4">
          <DetectiveCard className="max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-detective-text">Confirmar Revocación</h3>
              <p className="text-sm text-detective-text-secondary">
                ¿Estás seguro de que deseas revocar el acceso al reporte{' '}
                <strong className="text-detective-text">"{revokeConfirm.name}"</strong>?
                El maestro ya no podrá acceder a este reporte.
              </p>
              <div className="flex justify-end gap-2">
                <DetectiveButton
                  variant="secondary"
                  onClick={() => setRevokeConfirm({ show: false, id: null, name: '' })}
                >
                  Cancelar
                </DetectiveButton>
                <DetectiveButton
                  onClick={confirmRevoke}
                  disabled={isRevoking}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRevoking ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Revocando...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Revocar Acceso
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
