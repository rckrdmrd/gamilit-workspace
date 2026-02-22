/**
 * OrganizationsTable Component
 *
 * Table for managing organizations with search, filtering, and actions.
 * Uses the shared DataTable with detective variant for admin dark theme.
 */

import { useState } from 'react';
import { Search, Building, Eye, Edit, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import type { StatusType } from '@shared/components/base/StatusBadge';
import { useOrganizations } from '../../hooks/useOrganizations';
import type { Organization } from '../../types';

export const OrganizationsTable = () => {
  const { organizations, loading } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-500/20 text-gray-500',
      basic: 'bg-amber-500/20 text-amber-500',
      professional: 'bg-blue-500/20 text-blue-500',
      enterprise: 'bg-purple-500/20 text-purple-500',
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  const getPlanEmoji = (plan: string) => {
    const emojis = {
      free: '\uD83D\uDD0D',
      basic: '\uD83E\uDD49',
      professional: '\u2B50',
      enterprise: '\uD83C\uDFC6',
    };
    return emojis[plan as keyof typeof emojis] || '\uD83D\uDD0D';
  };

  const renderStatusBadge = (status: string) => {
    const validStatuses: StatusType[] = ['active', 'inactive', 'suspended'];
    const statusType = validStatuses.includes(status as StatusType)
      ? (status as StatusType)
      : 'inactive';
    return <StatusBadge status={statusType} size="sm" showIcon={false} />;
  };

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns: Column<Organization>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (org) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="font-semibold">{org.name}</span>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (org) => (
        <span
          className={`rounded-md px-2 py-1 text-xs capitalize ${getPlanBadge(org.plan)}`}
        >
          {getPlanEmoji(org.plan)} {org.plan}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (org) => renderStatusBadge(org.status),
    },
    {
      key: 'userCount',
      label: 'Users',
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (org) => (
        <span className="text-gray-400">
          {org.createdAt ? new Date(org.createdAt).toLocaleDateString('es-ES') : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (org) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            to={`/admin/organizations/${org.id}`}
            className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4 text-blue-500" />
          </Link>
          <Link
            to={`/admin/organizations/${org.id}/edit`}
            className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
            title="Edit organization"
          >
            <Edit className="h-4 w-4 text-green-500" />
          </Link>
          {org.status !== 'suspended' && (
            <button
              className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
              title="Suspend organization"
            >
              <XCircle className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DetectiveCard>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-detective-subtitle">Organizations</h3>
          <p className="text-detective-small text-gray-400">{organizations.length} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text"
          />
        </div>
      </div>

      <DataTable<Organization>
        data={filteredOrgs}
        columns={columns}
        variant="detective"
        loading={loading}
        emptyMessage="No organizations found"
        striped={false}
        rowKey={(row) => row.id}
      />
    </DetectiveCard>
  );
};
