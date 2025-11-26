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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import type { AuditLogFilters } from '@/services/api/adminTypes';

/**
 * LogsViewer Component
 */
export const LogsViewer: React.FC = () => {
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
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
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
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <p className="text-gray-400">No audit logs found</p>
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
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Details
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
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{log.ipAddress || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {log.failureReason ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-400 hover:text-blue-300">
                            View reason
                          </summary>
                          <p className="mt-2 text-xs text-gray-500">{log.failureReason}</p>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-6">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="hover:bg-detective-bg-tertiary flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="hover:bg-detective-bg-tertiary flex items-center gap-1 rounded-lg bg-detective-bg-secondary px-3 py-2 text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </DetectiveCard>
  );
};
