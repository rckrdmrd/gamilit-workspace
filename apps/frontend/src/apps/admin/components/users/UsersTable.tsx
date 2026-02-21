/**
 * UsersTable - User data table with selection, actions, and pagination
 *
 * Renders the full users table including:
 * - Select-all / individual checkboxes
 * - User data columns (name, email, role, status, org, last login)
 * - Per-row action buttons (edit, suspend/unsuspend, delete)
 * - Pagination controls
 *
 * Uses the shared DataTable component with detective variant.
 */

import { useMemo } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable } from '@shared/components/common/DataTable';
import type { Column } from '@shared/components/common/DataTable';
import { Pagination } from '@shared/components/Pagination';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { RoleBadge, StatusBadge } from './UserBadges';
import type { SystemUser } from '../../types';
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Square,
  CheckSquare,
  Users,
} from 'lucide-react';

interface UsersTableProps {
  users: SystemUser[];
  loading: boolean;
  selectedUsers: string[];
  allUsersSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelection: (userId: string) => void;
  onEdit: (user: SystemUser) => void;
  onSuspend: (userId: string, name: string) => void;
  onUnsuspend: (userId: string, name: string) => void;
  onDelete: (userId: string, name: string) => void;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin || lastLogin === '') return 'Nunca';
  const date = new Date(lastLogin);
  return isNaN(date.getTime()) ? 'Nunca' : date.toLocaleDateString('es-ES');
}

export function UsersTable({
  users,
  loading,
  selectedUsers,
  allUsersSelected,
  onSelectAll,
  onDeselectAll,
  onToggleSelection,
  onEdit,
  onSuspend,
  onUnsuspend,
  onDelete,
  currentPage,
  totalPages,
  totalUsers,
  onPrevPage,
  onNextPage,
}: UsersTableProps) {
  /**
   * Column definitions for the users table.
   * The checkbox column is first, followed by data columns and actions.
   */
  const userColumns: Column<SystemUser>[] = useMemo(
    () => [
      {
        key: '_select',
        width: '48px',
        label: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (allUsersSelected) { onDeselectAll(); } else { onSelectAll(); }
            }}
            className="text-detective-text-secondary hover:text-detective-orange transition-colors"
            title={allUsersSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          >
            {allUsersSelected ? (
              <CheckSquare className="h-5 w-5 text-detective-orange" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        ),
        render: (usr) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection(usr.id);
            }}
            className="text-detective-text-secondary hover:text-detective-orange transition-colors"
            title={selectedUsers.includes(usr.id) ? 'Deseleccionar' : 'Seleccionar'}
          >
            {selectedUsers.includes(usr.id) ? (
              <CheckSquare className="h-5 w-5 text-detective-orange" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
        ),
      },
      {
        key: 'full_name',
        label: 'Usuario',
        render: (usr) => (
          <span className="font-medium text-detective-text">{usr.full_name}</span>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        render: (usr) => (
          <span className="flex items-center gap-2 text-detective-text-secondary">
            <Mail className="h-4 w-4" />
            {usr.email}
          </span>
        ),
      },
      {
        key: 'role',
        label: 'Rol',
        render: (usr) => <RoleBadge role={usr.role} />,
      },
      {
        key: 'status',
        label: 'Estado',
        render: (usr) => <StatusBadge status={usr.status} />,
      },
      {
        key: 'organizationName',
        label: 'Institucion',
        render: (usr) => (
          <span className="text-detective-text-secondary">
            {usr.organizationName || usr.organizationId || 'N/A'}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Ultimo acceso',
        render: (usr) => (
          <span className="text-detective-text-secondary">{formatLastLogin(usr.lastLogin)}</span>
        ),
      },
      {
        key: '_actions',
        label: 'Acciones',
        render: (usr) => (
          <div className="flex items-center gap-2">
            <button
              className="rounded p-1 text-detective-orange hover:bg-detective-bg hover:text-detective-orange-dark"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(usr);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </button>
            {usr.status === 'active' ? (
              <button
                className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuspend(usr.id, usr.full_name);
                }}
                title="Suspender"
                disabled={loading}
              >
                <XCircle className="h-4 w-4" />
              </button>
            ) : (
              <button
                className="rounded p-1 text-green-400 hover:bg-detective-bg hover:text-green-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnsuspend(usr.id, usr.full_name);
                }}
                title="Reactivar"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            <button
              className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(usr.id, usr.full_name);
              }}
              title="Eliminar"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [allUsersSelected, selectedUsers, loading, onSelectAll, onDeselectAll, onToggleSelection, onEdit, onSuspend, onUnsuspend, onDelete],
  );

  return (
    <DetectiveCard>
      {loading && users.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <p className="mt-4 text-detective-text-secondary">Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <DataTable
            data={users}
            columns={userColumns}
            variant="detective"
            striped={false}
            rowKey={(usr) => usr.id}
            rowClassName={(usr) =>
              selectedUsers.includes(usr.id) ? 'bg-detective-orange/10' : ''
            }
            emptyMessage="No se encontraron usuarios"
          />

          {users.length === 0 && !loading && (
            <EmptyState
              icon={Users}
              title="No se encontraron usuarios"
              description="No hay usuarios que coincidan con los filtros aplicados"
            />
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                if (page < currentPage) onPrevPage();
                else if (page > currentPage) onNextPage();
              }}
              totalItems={totalUsers}
              loading={loading}
              variant="simple"
              itemLabel="usuarios totales"
              className="mt-4"
            />
          )}
        </>
      )}
    </DetectiveCard>
  );
}
