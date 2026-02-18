/**
 * UsersSearchFilters - Search bar, role/status dropdowns, refresh, and create button
 *
 * Encapsulates the entire filter/search toolbar for the users page,
 * including the UserAdvancedFilters sub-component.
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { UserAdvancedFilters } from './UserAdvancedFilters';
import type { UserManagementFilters } from '../../types';
import { Search, Filter, UserPlus, Shield, RefreshCw } from 'lucide-react';

interface UsersSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: UserManagementFilters;
  onFiltersChange: (filters: Partial<UserManagementFilters>) => void;
  onRefresh: () => void;
  onCreateUser: () => void;
  loading: boolean;
  organizations: { id: string; name: string }[];
  isLoadingOrganizations: boolean;
}

export function UsersSearchFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onRefresh,
  onCreateUser,
  loading,
  organizations,
  isLoadingOrganizations,
}: UsersSearchFiltersProps) {
  return (
    <DetectiveCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-detective-text">Busqueda y Filtros</h3>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.role?.[0] || 'all'}
              onChange={(e) =>
                onFiltersChange({ ...filters, role: e.target.value === 'all' ? undefined : [e.target.value] })
              }
              className="rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            >
              <option value="all">Todos los roles</option>
              <option value="student">Estudiantes</option>
              <option value="admin_teacher">Profesores</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <select
              value={filters.status?.[0] || 'all'}
              onChange={(e) =>
                onFiltersChange({ ...filters, status: e.target.value === 'all' ? undefined : [e.target.value] })
              }
              className="rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <DetectiveButton variant="secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </DetectiveButton>

          <DetectiveButton variant="primary" onClick={onCreateUser}>
            <UserPlus className="h-5 w-5" /> Nuevo Usuario
          </DetectiveButton>
        </div>

        <UserAdvancedFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          organizations={organizations}
          isLoadingOrganizations={isLoadingOrganizations}
        />
      </div>
    </DetectiveCard>
  );
}
