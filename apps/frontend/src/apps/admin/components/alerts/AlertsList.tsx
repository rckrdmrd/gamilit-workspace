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

import { AlertCard } from './AlertCard';
import { Pagination } from '@shared/components/Pagination';
import { EmptyState } from '@shared/components/feedback/EmptyState';
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

export const AlertsList = ({
  alerts,
  isLoading,
  pagination,
  onAlertClick,
  onAcknowledge,
  onResolve,
  onSuppress,
  onNextPage,
  onPrevPage,
}: AlertsListProps) => {
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
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary">
        <EmptyState
          icon={AlertTriangle}
          title="No se encontraron alertas"
          description="No hay alertas que coincidan con los filtros seleccionados."
        />
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
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => {
            if (page < pagination.page) onPrevPage();
            else if (page > pagination.page) onNextPage();
          }}
          totalItems={pagination.totalItems}
          loading={isLoading}
          variant="simple"
          itemLabel="alertas totales"
        />
      )}
    </div>
  );
};

export default AlertsList;
