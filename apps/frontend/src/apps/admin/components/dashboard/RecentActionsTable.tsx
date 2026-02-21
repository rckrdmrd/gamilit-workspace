/**
 * RecentActionsTable Component
 *
 * Table displaying recent admin actions with sorting, filtering, and pagination.
 * Shows audit log of administrative activities.
 *
 * Features:
 * - Sortable columns (via shared DataTable)
 * - Pagination
 * - Search/filter by action type
 * - Action type badges
 * - Success/error indicators
 * - Details modal
 * - Export to CSV
 */
import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { Pagination } from '@shared/components/Pagination';
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
      let aValue: string | number = a[sortField] as string;
      let bValue: string | number = b[sortField] as string;

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

  const handleSort = (field: string) => {
    const typedField = field as SortField;
    if (sortField === typedField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(typedField);
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

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns: Column<AdminAction>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (action) =>
        action.timestamp
          ? new Date(action.timestamp).toLocaleString('es-ES')
          : 'N/A',
    },
    {
      key: 'adminName',
      label: 'Admin',
      sortable: true,
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
    },
    {
      key: 'actionType',
      label: 'Type',
      render: (action) => getActionTypeBadge(action.actionType),
    },
    {
      key: 'targetType',
      label: 'Target',
      sortable: true,
      render: (action) => (
        <div>
          <div className="font-semibold">{action.targetType}</div>
          {action.targetName && (
            <div className="text-xs text-gray-500">{action.targetName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'success',
      label: 'Status',
      align: 'center' as const,
      render: (action) =>
        action.success ? (
          <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="mx-auto h-5 w-5 text-red-500" />
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (action) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(action);
          }}
          className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
          title="View details"
        >
          <Eye className="h-4 w-4 text-detective-orange" />
        </button>
      ),
    },
  ];

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
      <DataTable<AdminAction>
        data={paginatedActions}
        columns={columns}
        variant="detective"
        loading={loading}
        emptyMessage="No admin actions found"
        sortColumn={sortField}
        sortDirection={sortOrder}
        onSort={handleSort}
        striped={false}
        rowKey={(row) => row.id}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAndSortedActions.length}
          pageSize={itemsPerPage}
          variant="full"
          itemLabel="actions"
          className="mt-6"
        />
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
