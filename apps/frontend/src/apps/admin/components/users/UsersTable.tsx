/**
 * UsersTable - User data table with selection, actions, and pagination
 *
 * Renders the full users table including:
 * - Select-all / individual checkboxes
 * - User data columns (name, email, role, status, org, last login)
 * - Per-row action buttons (edit, suspend/unsuspend, delete)
 * - Pagination controls
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
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
  return (
    <DetectiveCard>
      {loading && users.length === 0 ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <p className="mt-4 text-detective-text-secondary">Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="w-12 px-4 py-3 text-left">
                    <button
                      onClick={() => (allUsersSelected ? onDeselectAll() : onSelectAll())}
                      className="text-detective-text-secondary hover:text-detective-orange transition-colors"
                      title={allUsersSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    >
                      {allUsersSelected ? (
                        <CheckSquare className="h-5 w-5 text-detective-orange" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Institucion
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Ultimo acceso
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-detective-text-secondary">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr
                    key={usr.id}
                    className={`border-b border-gray-700 transition-colors hover:bg-detective-bg-secondary ${
                      selectedUsers.includes(usr.id) ? 'bg-detective-orange/10' : ''
                    }`}
                  >
                    <td className="w-12 px-4 py-3">
                      <button
                        onClick={() => onToggleSelection(usr.id)}
                        className="text-detective-text-secondary hover:text-detective-orange transition-colors"
                        title={selectedUsers.includes(usr.id) ? 'Deseleccionar' : 'Seleccionar'}
                      >
                        {selectedUsers.includes(usr.id) ? (
                          <CheckSquare className="h-5 w-5 text-detective-orange" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-detective-text">
                      {usr.full_name}
                    </td>
                    <td className="flex items-center gap-2 px-4 py-3 text-sm text-detective-text-secondary">
                      <Mail className="h-4 w-4" />
                      {usr.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <RoleBadge role={usr.role} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={usr.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary">
                      {usr.organizationName || usr.organizationId || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary">
                      {formatLastLogin(usr.lastLogin)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded p-1 text-blue-400 hover:bg-detective-bg hover:text-blue-300"
                          onClick={() => onEdit(usr)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {usr.status === 'active' ? (
                          <button
                            className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-300"
                            onClick={() => onSuspend(usr.id, usr.full_name)}
                            title="Suspender"
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            className="rounded p-1 text-green-400 hover:bg-detective-bg hover:text-green-300"
                            onClick={() => onUnsuspend(usr.id, usr.full_name)}
                            title="Reactivar"
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="rounded p-1 text-red-400 hover:bg-detective-bg hover:text-red-300"
                          onClick={() => onDelete(usr.id, usr.full_name)}
                          title="Eliminar"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && !loading && (
              <div className="py-8 text-center text-detective-text-secondary">
                No se encontraron usuarios que coincidan con los filtros
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
              <div className="text-sm text-detective-text-secondary">
                Pagina {currentPage} de {totalPages} ({totalUsers} usuarios totales)
              </div>
              <div className="flex gap-2">
                <DetectiveButton
                  variant="secondary"
                  onClick={onPrevPage}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </DetectiveButton>
                <DetectiveButton
                  variant="secondary"
                  onClick={onNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                </DetectiveButton>
              </div>
            </div>
          )}
        </>
      )}
    </DetectiveCard>
  );
}
