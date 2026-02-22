/**
 * AuditLogTable - Paginated table displaying audit log entries.
 *
 * Renders table headers, row animations, status badges,
 * a detail-view button per row, and pagination controls.
 *
 * @see US-AE-011 - Visor de Audit Logs
 */

import { useMemo } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable } from '@shared/components/common/DataTable';
import type { Column } from '@shared/components/common/DataTable';
import { Pagination } from '@shared/components/Pagination';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react';
import type { AuditLogEntry } from '@/services/api/adminTypes';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  activeFiltersCount: number;
  onPageChange: (page: number) => void;
  onViewDetail: (log: AuditLogEntry) => void;
}

/**
 * Format a date string to a compact Spanish locale representation.
 */
function formatTableDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const AuditLogTable = ({
  logs,
  page,
  pageSize,
  total,
  totalPages,
  isLoading,
  error,
  activeFiltersCount,
  onPageChange,
  onViewDetail,
}: AuditLogTableProps) => {
  /** Column definitions for the audit log table */
  const auditColumns: Column<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: 'attemptedAt',
        label: 'Fecha/Hora',
        render: (log) => (
          <span className="text-gray-300">{formatTableDate(log.attemptedAt)}</span>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        render: (log) => <span className="text-gray-300">{log.email}</span>,
      },
      {
        key: 'success',
        label: 'Estado',
        render: (log) =>
          log.success ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
              <CheckCircle className="h-3 w-3" />
              Exitoso
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
              <XCircle className="h-3 w-3" />
              Fallido
            </span>
          ),
      },
      {
        key: 'ipAddress',
        label: 'IP',
        render: (log) => (
          <span className="font-mono text-gray-400">{log.ipAddress || 'N/A'}</span>
        ),
      },
      {
        key: 'failureReason',
        label: 'Detalles',
        render: (log) =>
          log.failureReason ? (
            <span
              className="block max-w-xs truncate text-red-400"
              title={log.failureReason}
            >
              {log.failureReason}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        key: 'actions',
        label: 'Acciones',
        render: (log) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(log);
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-bg hover:text-blue-400"
            title="Ver detalle"
          >
            <Eye className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [onViewDetail],
  );

  return (
    <DetectiveCard>
      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="font-semibold text-red-400">Error al cargar logs:</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && logs.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-400">Cargando audit logs...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && !error && (
        <EmptyState
          icon={FileText}
          title="No se encontraron logs"
          description={
            activeFiltersCount > 0
              ? 'Intenta ajustar los filtros para ver mas resultados'
              : 'Aun no hay registros de auditoria'
          }
        />
      )}

      {/* Table */}
      {logs.length > 0 && (
        <>
          <DataTable
            data={logs}
            columns={auditColumns}
            variant="detective"
            striped={false}
            rowKey={(log) => log.id}
            emptyMessage="No se encontraron logs"
          />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={total}
            pageSize={pageSize}
            variant="simple"
            itemLabel="registros"
            className="mt-6 border-gray-800 pt-6"
          />
        </>
      )}
    </DetectiveCard>
  );
};
