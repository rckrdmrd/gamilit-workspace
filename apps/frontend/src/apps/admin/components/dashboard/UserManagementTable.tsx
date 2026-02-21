/**
 * UserManagementTable Component
 *
 * Comprehensive user management table with CRUD operations.
 * Displays user list with filtering, searching, and bulk actions.
 * Uses the shared DataTable with detective variant for admin dark theme.
 */

import React from 'react';
import { Search, UserCheck, UserX, Trash2, Key } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { useUserManagement } from '../../hooks/useUserManagement';
import { getDetectiveRoleName, getDetectiveRoleBadge } from '@shared/utils/detectiveRoles';
import type { SystemUser } from '../../types';

export const UserManagementTable: React.FC = () => {
  const {
    users,
    loading,
    fetchUsers,
    suspendUser,
    unsuspendUser,
    deleteUser,
    resetPassword,
    setFilters,
  } = useUserManagement();

  React.useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns: Column<SystemUser>[] = [
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'full_name',
      label: 'Detective',
      render: (user) => (
        <span>{'\uD83D\uDD75\uFE0F'} {user.full_name}</span>
      ),
    },
    {
      key: 'role',
      label: 'Rango Detective',
      render: (user) => (
        <span className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-500">
          {getDetectiveRoleBadge(user.role)} {getDetectiveRoleName(user.role)}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Departamento',
      render: (user) => (
        <span className="text-gray-600">
          {user.department || 'Sin asignar'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <span
          className={`rounded-md px-2 py-1 text-xs ${
            user.status === 'active'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {user.status === 'active' ? '\u2705' : '\u274C'} {user.status}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user) => {
        if (!user.lastLogin || user.lastLogin === '') return <span className="text-gray-400">Nunca</span>;
        const date = new Date(user.lastLogin);
        return (
          <span className="text-gray-400">
            {isNaN(date.getTime()) ? 'Nunca' : date.toLocaleDateString('es-ES')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (user) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (user.status === 'active') {
                suspendUser(user.id);
              } else {
                unsuspendUser(user.id);
              }
            }}
            className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
            title={user.status === 'active' ? 'Suspend user' : 'Unsuspend user'}
          >
            {user.status === 'active' ? (
              <UserX className="h-4 w-4 text-yellow-500" />
            ) : (
              <UserCheck className="h-4 w-4 text-green-500" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetPassword(user.id);
            }}
            className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
            title="Reset password"
          >
            <Key className="h-4 w-4 text-blue-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteUser(user.id);
            }}
            className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
            title="Delete user"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
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
        <h3 className="text-detective-subtitle">User Management</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              onChange={(e) => setFilters({ search: e.target.value })}
              className="rounded-lg border border-gray-700 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text"
            />
          </div>
        </div>
      </div>

      <DataTable<SystemUser>
        data={users}
        columns={columns}
        variant="detective"
        loading={loading}
        emptyMessage="No users found"
        striped={false}
        rowKey={(row) => row.id}
      />
    </DetectiveCard>
  );
};
