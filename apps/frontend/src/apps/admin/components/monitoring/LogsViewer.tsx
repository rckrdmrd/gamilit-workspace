/**
 * LogsViewer Component
 *
 * Displays audit logs (authentication attempts) with filtering and pagination.
 * Integrates with AdminMonitoringPage.
 *
 * Features:
 * - Table view with all log columns
 * - Filters: Date Range, Status (success/failed)
 * - Pagination
 * - Loading states
 * - Error handling
 * - Export to CSV (optional)
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable } from '@shared/components/common/DataTable';
import type { Column } from '@shared/components/common/DataTable';
import { Pagination } from '@shared/components/Pagination';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import type { AuditLogFilters } from '@/services/api/adminTypes';

/**
 * LogsViewer Component
 */
export const LogsViewer = () => {
  // State for filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    success: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof AuditLogFilters, value: AuditLogFilters[keyof AuditLogFilters]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
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
   * Column definitions for the audit logs table
   */
  const logColumns: Column<(typeof logs)[number]>[] = useMemo(
    () => [
      {
        key: 'attemptedAt',
        label: 'Timestamp',
        render: (log) => (
          <span className="text-gray-300">{formatDate(log.attemptedAt)}</span>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        render: (log) => <span className="text-gray-300">{log.email}</span>,
      },
      {
        key: 'success',
        label: 'Status',
        render: (log) =>
          log.success ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
              <CheckCircle className="h-3 w-3" />
              Success
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
              <XCircle className="h-3 w-3" />
              Failed
            </span>
          ),
      },
      {
        key: 'ipAddress',
        label: 'IP Address',
        render: (log) => (
          <span className="text-gray-400">{log.ipAddress || 'N/A'}</span>
        ),
      },
      {
        key: 'failureReason',
        label: 'Details',
        render: (log) =>
          log.failureReason ? (
            <details className="cursor-pointer">
              <summary className="text-blue-400 hover:text-blue-300">View reason</summary>
              <p className="mt-2 text-xs text-gray-500">{log.failureReason}</p>
            </details>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
    ],
    [],
  );

  /**
   * Export logs to CSV
   */
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Email', 'Status', 'IP Address', 'User Agent', 'Failure Reason'];
    const csvRows = [
      headers.join(','),
      ...logs.map((log) =>
        [
          log.attemptedAt,
          log.email,
          log.success ? 'Success' : 'Failed',
          log.ipAddress || '',
          log.userAgent || '',
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
    link.download = `audit-logs-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DetectiveCard>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-bold text-detective-text">Audit Logs</h3>
          <span className="text-sm text-gray-400">({total} total entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              showFilters
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-detective-bg-tertiary bg-detective-bg-secondary text-gray-400'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="hover:bg-detective-bg-tertiary flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="hover:bg-detective-bg-tertiary flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 rounded-lg bg-detective-bg-secondary p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
              <select
                value={
                  filters.success === undefined ? 'all' : filters.success ? 'success' : 'failed'
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('success', value === 'all' ? undefined : value === 'success');
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Start Date</label>
              <input
                type="date"
                value={filters.startDate?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? `${e.target.value}T00:00:00Z` : undefined;
                  handleFilterChange('startDate', value);
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">End Date</label>
              <input
                type="date"
                value={filters.endDate?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? `${e.target.value}T23:59:59Z` : undefined;
                  handleFilterChange('endDate', value);
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && logs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-400">Loading audit logs...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No audit logs found"
          description="No hay registros de auditoria que mostrar"
        />
      )}

      {/* Table */}
      {logs.length > 0 && (
        <>
          <DataTable
            data={logs}
            columns={logColumns}
            variant="detective"
            striped={false}
            rowKey={(log) => log.id}
            emptyMessage="No audit logs found"
          />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            pageSize={pageSize}
            loading={isLoading}
            variant="simple"
            itemLabel="entries"
            className="mt-6 border-gray-800 pt-6"
          />
        </>
      )}
    </DetectiveCard>
  );
};
