/**
 * AuditLogTable - Paginated table displaying audit log entries.
 *
 * Renders table headers, row animations, status badges,
 * a detail-view button per row, and pagination controls.
 *
 * @see US-AE-011 - Visor de Audit Logs
 */

import { motion } from 'framer-motion';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
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
}) => {
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
        <div className="py-16 text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h3 className="mb-2 text-lg font-semibold text-detective-text">
            No se encontraron logs
          </h3>
          <p className="text-gray-400">
            {activeFiltersCount > 0
              ? 'Intenta ajustar los filtros para ver mas resultados'
              : 'Aun no hay registros de auditoria'}
          </p>
        </div>
      )}

      {/* Table */}
      {logs.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Fecha/Hora
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Detalles
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {formatTableDate(log.attemptedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.email}</td>
                    <td className="px-4 py-3">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Exitoso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                          <XCircle className="h-3 w-3" />
                          Fallido
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-400">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-400">
                      {log.failureReason ? (
                        <span
                          className="block truncate text-red-400"
                          title={log.failureReason}
                        >
                          {log.failureReason}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onViewDetail(log)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-bg hover:text-blue-400"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 md:flex-row">
            <div className="text-sm text-gray-400">
              Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de{' '}
              {total} registros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 transition-colors hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-300">
                Pagina {page} de {totalPages || 1}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 transition-colors hover:bg-detective-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </DetectiveCard>
  );
};
