/**
 * UserManagementTable Component
 *
 * Comprehensive user management table with CRUD operations.
 * Displays user list with filtering, searching, and bulk actions.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Trash2, Key } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useUserManagement } from '../../hooks/useUserManagement';
import { getDetectiveRoleName, getDetectiveRoleBadge } from '@shared/utils/detectiveRoles';

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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Email</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Detective</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">
                Rango Detective
              </th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">
                Departamento
              </th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Status</th>
              <th className="text-detective-small px-4 py-3 text-left text-gray-400">Last Login</th>
              <th className="text-detective-small px-4 py-3 text-center text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  🔍 No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                >
                  <td className="text-detective-small px-4 py-3">{user.email}</td>
                  <td className="text-detective-small px-4 py-3">
                    <span>🕵️ {user.full_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-500">
                      {getDetectiveRoleBadge(user.role)} {getDetectiveRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.department || 'Sin asignar'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {user.status === 'active' ? '✅' : '❌'} {user.status}
                    </span>
                  </td>
                  <td className="text-detective-small px-4 py-3 text-gray-400">
                    {(() => {
                      if (!user.lastLogin || user.lastLogin === '') return 'Nunca';
                      const date = new Date(user.lastLogin);
                      return isNaN(date.getTime()) ? 'Nunca' : date.toLocaleDateString('es-ES');
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          user.status === 'active' ? suspendUser(user.id) : unsuspendUser(user.id)
                        }
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
                        onClick={() => resetPassword(user.id)}
                        className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                        title="Reset password"
                      >
                        <Key className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="hover:bg-detective-bg-tertiary rounded-lg p-2 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DetectiveCard>
  );
};
