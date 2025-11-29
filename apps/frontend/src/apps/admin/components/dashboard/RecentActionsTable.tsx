/**
 * RecentActionsTable Component
 *
 * Table displaying recent admin actions with sorting, filtering, and pagination.
 * Shows audit log of administrative activities.
 *
 * Features:
 * - Sortable columns
 * - Pagination
 * - Search/filter by action type
 * - Action type badges
 * - Success/error indicators
 * - Details modal
 * - Export to CSV
 * - Real-time updates
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';
import type { AdminAction } from '../../types';

interface RecentActionsTableProps {
  actions: AdminAction[];
  loading?: boolean;
  onRefresh?: () => void;
}

type SortField = 'timestamp' | 'adminName' | 'action' | 'targetType';
type SortOrder = 'asc' | 'desc';

export const RecentActionsTable: React.FC<RecentActionsTableProps> = ({
  actions,
  loading = false,
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const itemsPerPage = 10;

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredAndSortedActions = useMemo(() => {
    let filtered = [...actions];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.adminName.toLowerCase().includes(search) ||
          action.action.toLowerCase().includes(search) ||
          action.targetType.toLowerCase().includes(search),
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((action) => action.actionType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [actions, searchTerm, filterType, sortField, sortOrder]);

  // Pagination
  const paginatedActions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedActions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedActions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedActions.length / itemsPerPage);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (action: AdminAction) => {
    setSelectedAction(action);
    setShowDetailsModal(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Admin',
      'Action',
      'Target Type',
      'Target ID',
      'Status',
      'Details',
    ];
    const rows = filteredAndSortedActions.map((action) => [
      action.timestamp ? new Date(action.timestamp).toLocaleString('es-ES') : 'N/A',
      action.adminName,
      action.action,
      action.targetType,
      action.targetId,
      action.success ? 'Success' : 'Failed',
      action.details,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-actions-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getActionTypeBadge = (actionType: string) => {
    const badgeColors: Record<string, string> = {
      create: 'bg-green-500/20 text-green-500 border-green-500/30',
      update: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      delete: 'bg-red-500/20 text-red-500 border-red-500/30',
      approve: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      reject: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      suspend: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      restore: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
    };

    const color = badgeColors[actionType] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';

    return (
      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${color}`}>
        {actionType.toUpperCase()}
      </span>
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-500" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-detective-orange" />
    ) : (
      <ChevronDown className="h-4 w-4 text-detective-orange" />
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DetectiveCard>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-detective-subtitle">Recent Admin Actions</h3>
        <button
          onClick={handleExportCSV}
          className="hover:bg-detective-bg-tertiary flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-4 py-2 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="text-detective-small">Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text placeholder-gray-500 focus:border-detective-orange focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-8 text-detective-text focus:border-detective-orange focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="suspend">Suspend</option>
            <option value="restore">Restore</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th
                className="cursor-pointer px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary"
                onClick={() => handleSort('timestamp')}
              >
                <div className="text-detective-small flex items-center gap-2 text-gray-400">
                  <span>Timestamp</span>
                  {getSortIcon('timestamp')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary"
                onClick={() => handleSort('adminName')}
              >
                <div className="text-detective-small flex items-center gap-2 text-gray-400">
                  <span>Admin</span>
                  {getSortIcon('adminName')}
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary"
                onClick={() => handleSort('action')}
              >
                <div className="text-detective-small flex items-center gap-2 text-gray-400">
                  <span>Action</span>
                  {getSortIcon('action')}
                </div>
              </th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Type</th>
              <th
                className="cursor-pointer px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary"
                onClick={() => handleSort('targetType')}
              >
                <div className="text-detective-small flex items-center gap-2 text-gray-400">
                  <span>Target</span>
                  {getSortIcon('targetType')}
                </div>
              </th>
              <th className="text-detective-small px-4 py-3 text-center text-gray-400">Status</th>
              <th className="text-detective-small px-4 py-3 text-center text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Filter className="h-5 w-5" />
                      </motion.div>
                      <span>Loading actions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedActions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No admin actions found
                  </td>
                </tr>
              ) : (
                paginatedActions.map((action, index) => (
                  <motion.tr
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                  >
                    <td className="text-detective-small px-4 py-3">
                      {action.timestamp
                        ? new Date(action.timestamp).toLocaleString('es-ES')
                        : 'N/A'}
                    </td>
                    <td className="text-detective-small px-4 py-3">{action.adminName}</td>
                    <td className="text-detective-small px-4 py-3">{action.action}</td>
                    <td className="px-4 py-3">{getActionTypeBadge(action.actionType)}</td>
                    <td className="text-detective-small px-4 py-3">
                      <div>
                        <div className="font-semibold">{action.targetType}</div>
                        {action.targetName && (
                          <div className="text-xs text-gray-500">{action.targetName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {action.success ? (
                        <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="mx-auto h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetails(action)}
                        className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-detective-orange" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="text-detective-small text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedActions.length)} of{' '}
            {filteredAndSortedActions.length} actions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="hover:bg-detective-bg-tertiary rounded-lg bg-detective-bg-secondary px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-10 w-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-detective-orange text-white'
                        : 'hover:bg-detective-bg-tertiary bg-detective-bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="hover:bg-detective-bg-tertiary rounded-lg bg-detective-bg-secondary px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        {selectedAction && (
          <div className="p-6">
            <h3 className="text-detective-subtitle mb-4">Action Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-detective-small text-gray-400">Timestamp:</span>
                <p className="text-detective-base">
                  {selectedAction.timestamp
                    ? new Date(selectedAction.timestamp).toLocaleString('es-ES')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Admin:</span>
                <p className="text-detective-base">{selectedAction.adminName}</p>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Action:</span>
                <p className="text-detective-base">{selectedAction.action}</p>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Type:</span>
                <div className="mt-1">{getActionTypeBadge(selectedAction.actionType)}</div>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Target:</span>
                <p className="text-detective-base">
                  {selectedAction.targetType} (ID: {selectedAction.targetId})
                </p>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Status:</span>
                <p
                  className={`text-detective-base ${selectedAction.success ? 'text-green-500' : 'text-red-500'}`}
                >
                  {selectedAction.success ? 'Success' : 'Failed'}
                </p>
              </div>
              <div>
                <span className="text-detective-small text-gray-400">Details:</span>
                <p className="mt-1 rounded-lg bg-detective-bg-secondary p-3 text-detective-base">
                  {selectedAction.details}
                </p>
              </div>
              {selectedAction.ipAddress && (
                <div>
                  <span className="text-detective-small text-gray-400">IP Address:</span>
                  <p className="text-detective-base">{selectedAction.ipAddress}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DetectiveCard>
  );
};
