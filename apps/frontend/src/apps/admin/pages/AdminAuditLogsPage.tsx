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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AdminPageShell } from '../components/shared/AdminPageShell';
import { LogDetailModal, AuditLogFilters, AuditLogStats, AuditLogTable } from '../components/audit';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { downloadCSV } from '@shared/utils/downloadCSV';
import { Download, RefreshCw, Shield, X } from 'lucide-react';
import type { AuditLogFilters as AuditLogFiltersType, AuditLogEntry } from '@/services/api/adminTypes';

const CSV_HEADERS: Record<string, string> = {
  id: 'ID',
  attemptedAt: 'Timestamp',
  email: 'Email',
  status: 'Status',
  ipAddress: 'IP Address',
  userAgent: 'User Agent',
  userId: 'User ID',
  failureReason: 'Failure Reason',
};

export default function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFiltersType>({
    success: undefined,
    startDate: undefined,
    endDate: undefined,
    email: undefined,
    ipAddress: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    logs, total, page, totalPages, pageSize,
    isLoading, error, refetch,
    setFilters: updateFilters, setPage,
  } = useAuditLogs({ filters, page: currentPage, pageSize: 20, autoFetch: true });

  const handleFilterChange = useCallback((key: keyof AuditLogFiltersType, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
    setCurrentPage(1);
  }, [filters, updateFilters]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    if (searchText.includes('@')) {
      handleFilterChange('email', searchText.trim());
    } else if (/^\d{1,3}\./.test(searchText)) {
      handleFilterChange('ipAddress', searchText.trim());
    } else {
      handleFilterChange('email', searchText.trim());
    }
  }, [searchText, handleFilterChange]);

  const handleClearFilters = useCallback(() => {
    const cleared: AuditLogFiltersType = {
      success: undefined, startDate: undefined, endDate: undefined,
      email: undefined, ipAddress: undefined,
    };
    setFilters(cleared);
    updateFilters(cleared);
    setSearchText('');
    setCurrentPage(1);
  }, [updateFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
  }, [setPage]);

  const handleExportCSV = useCallback(() => {
    if (logs.length === 0) {
      setToast({ type: 'error', message: 'No hay logs para exportar' });
      return;
    }
    try {
      const csvData = logs.map((log) => ({
        ...log,
        status: log.success ? 'Success' : 'Failed',
      }));
      downloadCSV(csvData, CSV_HEADERS, 'audit-logs');
      setToast({ type: 'success', message: 'CSV exportado exitosamente' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ type: 'error', message: 'Error al exportar CSV' });
    }
  }, [logs]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const activeFiltersCount = useMemo(
    () => Object.values(filters).filter((v) => v !== undefined && v !== '').length,
    [filters],
  );

  const successCount = useMemo(() => logs.filter((l) => l.success).length, [logs]);
  const failedCount = useMemo(() => logs.filter((l) => !l.success).length, [logs]);

  return (
    <AdminPageShell>
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
          <div className="flex gap-3">
            <DetectiveButton variant="secondary" onClick={handleExportCSV} disabled={logs.length === 0 || isLoading}>
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

        <AuditLogFilters
          filters={filters}
          pageSize={pageSize}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSearch={handleSearch}
        />

        <AuditLogStats total={total} successCount={successCount} failedCount={failedCount} />

        <AuditLogTable
          logs={logs}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          isLoading={isLoading}
          error={error}
          activeFiltersCount={activeFiltersCount}
          onPageChange={handlePageChange}
          onViewDetail={setSelectedLog}
        />

        {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </div>
    </AdminPageShell>
  );
}
