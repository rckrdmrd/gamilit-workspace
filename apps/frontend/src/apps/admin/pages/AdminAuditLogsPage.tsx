/**
 * AdminAuditLogsPage - Dedicated Audit Logs Page
 *
 * Complete page for viewing and managing system audit logs.
 * Features:
 * - Comprehensive filtering (date, status, email, IP)
 * - Paginated table view
 * - Export to CSV functionality
 * - Real-time refresh capability
 * - Log detail view
 *
 * Integrates with backend endpoint: GET /api/admin/audit-logs
 *
 * @author Frontend-Developer Agent
 * @date 2026-01-20
 * @status IMPLEMENTED
 * @see US-AE-011 - Visor de Audit Logs
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { AuditLogFilters, AuditLogEntry } from '@/services/api/adminTypes';

// Icons
import {
  FileText,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Calendar,
  Shield,
  Eye,
  X,
} from 'lucide-react';

/**
 * Log Detail Modal Props
 */
interface LogDetailModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

/**
 * Log Detail Modal Component
 */
const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-xl bg-detective-bg-secondary p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-detective-text">Detalle del Log</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-bg hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg bg-detective-bg p-4">
            <div className="mb-2 text-sm font-medium text-gray-400">Estado</div>
            {log.success ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400">
                <CheckCircle className="h-4 w-4" />
                Autenticacion Exitosa
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400">
                <XCircle className="h-4 w-4" />
                Autenticacion Fallida
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Email</div>
              <div className="text-detective-text">{log.email}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Fecha y Hora</div>
              <div className="text-detective-text">{formatDate(log.attemptedAt)}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Direccion IP</div>
              <div className="text-detective-text">{log.ipAddress || 'No disponible'}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">ID de Usuario</div>
              <div className="font-mono text-sm text-detective-text">{log.userId || 'N/A'}</div>
            </div>
          </div>

          {/* User Agent */}
          <div className="rounded-lg bg-detective-bg p-4">
            <div className="mb-1 text-sm font-medium text-gray-400">User Agent</div>
            <div className="break-words text-sm text-detective-text">
              {log.userAgent || 'No disponible'}
            </div>
          </div>

          {/* Failure Reason (if failed) */}
          {!log.success && log.failureReason && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="mb-1 text-sm font-medium text-red-400">Razon del Fallo</div>
              <div className="text-sm text-red-300">{log.failureReason}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <DetectiveButton variant="secondary" onClick={onClose}>
            Cerrar
          </DetectiveButton>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * AdminAuditLogsPage Component
 */
export default function AdminAuditLogsPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<AuditLogFilters>({
    success: undefined,
    startDate: undefined,
    endDate: undefined,
    email: undefined,
    ipAddress: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  // Fetch logs using custom hook
  const {
    logs,
    total,
    page,
    totalPages,
    pageSize,
    isLoading,
    error,
    refetch,
    setFilters: updateFilters,
    setPage,
  } = useAuditLogs({
    filters,
    page: currentPage,
    pageSize: 20,
    autoFetch: true,
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof AuditLogFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
    setCurrentPage(1);
  };

  /**
   * Apply search filter
   */
  const handleSearch = () => {
    if (searchText.trim()) {
      // Check if it looks like an email or IP
      if (searchText.includes('@')) {
        handleFilterChange('email', searchText.trim());
      } else if (/^\d{1,3}\./.test(searchText)) {
        handleFilterChange('ipAddress', searchText.trim());
      } else {
        handleFilterChange('email', searchText.trim());
      }
    }
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    const clearedFilters: AuditLogFilters = {
      success: undefined,
      startDate: undefined,
      endDate: undefined,
      email: undefined,
      ipAddress: undefined,
    };
    setFilters(clearedFilters);
    updateFilters(clearedFilters);
    setSearchText('');
    setCurrentPage(1);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Export logs to CSV
   */
  const handleExportCSV = () => {
    if (logs.length === 0) {
      setToast({ type: 'error', message: 'No hay logs para exportar' });
      return;
    }

    try {
      const headers = [
        'ID',
        'Timestamp',
        'Email',
        'Status',
        'IP Address',
        'User Agent',
        'User ID',
        'Failure Reason',
      ];
      const csvRows = [
        headers.join(','),
        ...logs.map((log) =>
          [
            log.id,
            log.attemptedAt,
            log.email,
            log.success ? 'Success' : 'Failed',
            log.ipAddress || '',
            log.userAgent || '',
            log.userId || '',
            log.failureReason || '',
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(','),
        ),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setToast({ type: 'success', message: 'CSV exportado exitosamente' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ type: 'error', message: 'Error al exportar CSV' });
    }
  };

  /**
   * Auto-dismiss toast after 5 seconds
   */
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Calculate active filters count
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-detective-text">Audit Logs</h1>
            </div>
            <p className="text-detective-text-secondary">
              Historial de intentos de autenticacion y acciones del sistema
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <DetectiveButton
              variant="secondary"
              onClick={handleExportCSV}
              disabled={logs.length === 0 || isLoading}
            >
              <Download className="h-5 w-5" />
              Exportar CSV
            </DetectiveButton>

            <DetectiveButton variant="primary" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </DetectiveButton>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg border p-4 ${
              toast.type === 'success'
                ? 'border-green-500/50 bg-green-500/20 text-green-400'
                : 'border-red-500/50 bg-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters Panel */}
        <DetectiveCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-detective-text">Filtros</h3>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                  {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por email o IP..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full rounded-lg bg-detective-bg py-2.5 pl-10 pr-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchText && (
                    <button
                      onClick={() => {
                        setSearchText('');
                        handleFilterChange('email', undefined);
                        handleFilterChange('ipAddress', undefined);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Status Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Estado</label>
                  <select
                    value={
                      filters.success === undefined ? 'all' : filters.success ? 'success' : 'failed'
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange(
                        'success',
                        value === 'all' ? undefined : value === 'success',
                      );
                    }}
                    className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="success">Exitosos</option>
                    <option value="failed">Fallidos</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="h-4 w-4" />
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filters.startDate?.split('T')[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value ? `${e.target.value}T00:00:00Z` : undefined;
                      handleFilterChange('startDate', value);
                    }}
                    className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="h-4 w-4" />
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.endDate?.split('T')[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value ? `${e.target.value}T23:59:59Z` : undefined;
                      handleFilterChange('endDate', value);
                    }}
                    className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Page Size */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Items por pagina
                  </label>
                  <select
                    value={pageSize}
                    onChange={() => {
                      // This would need the hook to support changing pageSize
                      // For now, it's display-only
                    }}
                    disabled
                    className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 opacity-50 focus:outline-none"
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </DetectiveCard>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DetectiveCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-detective-text">{total}</div>
                <div className="text-sm text-detective-text-secondary">Total de registros</div>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-detective-text">
                  {logs.filter((l) => l.success).length}
                </div>
                <div className="text-sm text-detective-text-secondary">
                  Exitosos (pagina actual)
                </div>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-detective-text">
                  {logs.filter((l) => !l.success).length}
                </div>
                <div className="text-sm text-detective-text-secondary">
                  Fallidos (pagina actual)
                </div>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Main Content */}
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
                          {formatDate(log.attemptedAt)}
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
                            onClick={() => setSelectedLog(log)}
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
                    onClick={() => handlePageChange(page - 1)}
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
                    onClick={() => handlePageChange(page + 1)}
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

        {/* Log Detail Modal */}
        {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </div>
    </AdminLayout>
  );
}
