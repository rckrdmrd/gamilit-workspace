/**
 * AdminAlertsPage - Sistema de Gestión de Alertas
 *
 * Página completa para administrar alertas del sistema incluyendo:
 * - Estadísticas de alertas
 * - Filtros avanzados
 * - Lista de alertas con acciones
 * - Modales de gestión (acknowledge, resolve, suppress)
 * - Modal de detalles
 *
 * Integrado con backend completo (7 endpoints REST funcionales)
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 * @component
 */

import { useState, useCallback } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AdminPageShell } from '../components/shared';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';

// Components
import { AlertsStats } from '../components/alerts/AlertsStats';
import { AlertFilters } from '../components/alerts/AlertFilters';
import { AlertsList } from '../components/alerts/AlertsList';
import { AlertDetailsModal } from '../components/alerts/AlertDetailsModal';
import { AcknowledgeAlertModal } from '../components/alerts/AcknowledgeAlertModal';
import { ResolveAlertModal } from '../components/alerts/ResolveAlertModal';

// Icons
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useApiError } from '@shared/hooks';

// Types
import type { SystemAlert } from '@/services/api/adminTypes';

/**
 * AdminAlertsPage Component
 */
export default function AdminAlertsPage() {
  const { handleError } = useApiError();
  const {
    alerts,
    stats,
    isLoading,
    isLoadingStats,
    error,
    filters,
    setFilters,
    pagination,
    refreshAlerts,
    acknowledgeAlert,
    resolveAlert,
    suppressAlert,
    nextPage,
    prevPage,
  } = useAlerts();

  // Modal state
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [modalsState, setModalsState] = useState({
    details: false,
    acknowledge: false,
    resolve: false,
  });

  // ConfirmDialog state for suppress action
  const [showSuppressConfirm, setShowSuppressConfirm] = useState(false);
  const [pendingSuppressAlert, setPendingSuppressAlert] = useState<SystemAlert | null>(null);

  const handleAlertClick = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setModalsState({ details: true, acknowledge: false, resolve: false });
  };

  const handleAcknowledge = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setModalsState({ details: false, acknowledge: true, resolve: false });
  };

  const handleResolve = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setModalsState({ details: false, acknowledge: false, resolve: true });
  };

  const handleSuppress = useCallback((alert: SystemAlert) => {
    setPendingSuppressAlert(alert);
    setShowSuppressConfirm(true);
  }, []);

  const handleSuppressConfirm = useCallback(async () => {
    if (!pendingSuppressAlert) return;
    setShowSuppressConfirm(false);
    try {
      await suppressAlert(pendingSuppressAlert.id);
    } catch (err) {
      handleError(err as Parameters<typeof handleError>[0], 'Error al suprimir alerta');
    } finally {
      setPendingSuppressAlert(null);
    }
  }, [pendingSuppressAlert, suppressAlert, handleError]);

  const handleAcknowledgeConfirm = async (note?: string) => {
    if (selectedAlert) {
      await acknowledgeAlert(selectedAlert.id, note);
    }
  };

  const handleResolveConfirm = async (note: string) => {
    if (selectedAlert) {
      await resolveAlert(selectedAlert.id, note);
    }
  };

  const closeModals = () => {
    setModalsState({ details: false, acknowledge: false, resolve: false });
    setSelectedAlert(null);
  };

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-detective-orange" />
              <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Alertas del Sistema</h1>
            </div>
            <p className="text-detective-text-secondary">
              Monitorea y gestiona alertas críticas del sistema en tiempo real
            </p>
          </div>

          <DetectiveButton variant="primary" onClick={refreshAlerts} disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </DetectiveButton>
        </div>

        {/* Statistics Cards */}
        <div role="region" aria-label="Estadisticas de alertas">
          <AlertsStats stats={stats} isLoading={isLoadingStats} />
        </div>

        {/* Filters */}
        <AlertFilters
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={refreshAlerts}
          isLoading={isLoading}
        />

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500" role="alert">
            <p className="font-semibold">Error al cargar alertas:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Alerts List */}
        <div role="region" aria-label="Lista de alertas" aria-live="polite">
        <AlertsList
          alerts={alerts}
          isLoading={isLoading}
          pagination={pagination}
          onAlertClick={handleAlertClick}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
          onSuppress={handleSuppress}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
        </div>

        {/* Modals */}
        <AlertDetailsModal
          alert={selectedAlert}
          isOpen={modalsState.details}
          onClose={closeModals}
        />

        <AcknowledgeAlertModal
          alert={selectedAlert}
          isOpen={modalsState.acknowledge}
          onClose={closeModals}
          onConfirm={handleAcknowledgeConfirm}
        />

        <ResolveAlertModal
          alert={selectedAlert}
          isOpen={modalsState.resolve}
          onClose={closeModals}
          onConfirm={handleResolveConfirm}
        />

        <ConfirmDialog
          isOpen={showSuppressConfirm}
          onClose={() => {
            setShowSuppressConfirm(false);
            setPendingSuppressAlert(null);
          }}
          onConfirm={handleSuppressConfirm}
          title="Suprimir alerta"
          message={
            pendingSuppressAlert
              ? `¿Estás seguro de que deseas suprimir la alerta "${pendingSuppressAlert.title}"? Esto marcará la alerta como no relevante.`
              : ''
          }
          confirmText="Suprimir"
          variant="warning"
        />
      </div>
    </AdminPageShell>
  );
}
