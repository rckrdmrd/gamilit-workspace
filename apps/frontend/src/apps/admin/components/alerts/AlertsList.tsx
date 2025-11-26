/**
 * AlertsList Component
 *
 * Displays a list of alert cards with:
 * - Loading state
 * - Empty state
 * - Pagination controls
 *
 * @component
 */

import React from 'react';
import { AlertCard } from './AlertCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle } from 'lucide-react';
import type { SystemAlert } from '@/services/api/adminTypes';

interface AlertsListProps {
  alerts: SystemAlert[];
  isLoading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onAlertClick: (alert: SystemAlert) => void;
  onAcknowledge: (alert: SystemAlert) => void;
  onResolve: (alert: SystemAlert) => void;
  onSuppress: (alert: SystemAlert) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  isLoading,
  pagination,
  onAlertClick,
  onAcknowledge,
  onResolve,
  onSuppress,
  onNextPage,
  onPrevPage,
}) => {
  // Loading State
  if (isLoading && alerts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-700 bg-detective-bg-secondary p-6"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded bg-gray-700"></div>
                <div className="h-6 w-24 rounded bg-gray-700"></div>
              </div>
              <div className="h-6 w-3/4 rounded bg-gray-700"></div>
              <div className="h-4 w-full rounded bg-gray-700"></div>
              <div className="h-4 w-2/3 rounded bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!isLoading && alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-gray-500" />
        <h3 className="mb-2 text-xl font-bold text-detective-text">No se encontraron alertas</h3>
        <p className="text-detective-text-secondary">
          No hay alertas que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onViewDetails={onAlertClick}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
            onSuppress={onSuppress}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="text-sm text-detective-text-secondary">
            Página {pagination.page} de {pagination.totalPages} ({pagination.totalItems} alertas
            totales)
          </div>
          <div className="flex gap-2">
            <DetectiveButton
              variant="secondary"
              onClick={onPrevPage}
              disabled={pagination.page === 1 || isLoading}
            >
              Anterior
            </DetectiveButton>
            <DetectiveButton
              variant="secondary"
              onClick={onNextPage}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              Siguiente
            </DetectiveButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
