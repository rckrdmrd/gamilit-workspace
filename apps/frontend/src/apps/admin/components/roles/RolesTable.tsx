/**
 * RolesTable Component
 *
 * Displays a table of roles with user counts and actions
 *
 * Features:
 * - Display roles in a clean table format
 * - Show user count per role
 * - System role badges
 * - Select action for editing
 * - Responsive design
 *
 * Created: 2025-12-05 - US-ADMIN-P2-001
 */

import React from 'react';
import type { Role } from '@/services/api/adminTypes';
import { Button } from '@shared/components/Button';

interface RolesTableProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  loading?: boolean;
}

export function RolesTable({
  roles,
  selectedRoleId,
  onSelectRole,
  loading = false,
}: RolesTableProps): React.ReactElement {

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">No hay roles disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.roleId;

        return (
          <button
            key={role.roleId}
            onClick={() => onSelectRole(role.roleId)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Role Name */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {role.roleName || 'Sin nombre'}
                  </h3>

                  {/* System Badge */}
                  {role.isSystem && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      Sistema
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-2">
                  {role.description || 'Sin descripción'}
                </p>

                {/* User Count */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>
                    {role.userCount ?? 0} usuario{role.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="ml-3 flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default RolesTable;
