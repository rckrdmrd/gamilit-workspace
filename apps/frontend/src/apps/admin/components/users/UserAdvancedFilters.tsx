import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Building2, X } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { UserManagementFilters } from '../../types';

export interface UserAdvancedFiltersProps {
  filters: UserManagementFilters;
  onFiltersChange: (filters: Partial<UserManagementFilters>) => void;
  organizations: { id: string; name: string }[];
  isLoadingOrganizations?: boolean;
}

export const UserAdvancedFilters = ({
  filters,
  onFiltersChange,
  organizations,
  isLoadingOrganizations = false,
}: UserAdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active advanced filters
  const activeFilterCount = [
    filters.organizationId,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      organizationId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({
      [field]: value ? new Date(value) : undefined,
    });
  };

  return (
    <div className="rounded-lg border border-detective-orange/20 bg-detective-bg-secondary">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-detective-orange/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-detective-text">Filtros Avanzados</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-detective-orange px-2 py-0.5 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-detective-orange/20 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Organization Filter */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                <Building2 className="h-4 w-4" />
                Organizacion
              </label>
              <select
                value={filters.organizationId || ''}
                onChange={(e) =>
                  onFiltersChange({
                    organizationId: e.target.value || undefined,
                  })
                }
                disabled={isLoadingOrganizations}
                className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-sm text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange disabled:opacity-50"
              >
                <option value="">Todas las organizaciones</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                Registrado desde
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.dateFrom)}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-sm text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                Registrado hasta
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.dateTo)}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-sm text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end">
              <DetectiveButton
                variant="secondary"
                onClick={handleClearFilters}
                className="text-sm"
              >
                <X className="mr-1 h-4 w-4" />
                Limpiar filtros avanzados
              </DetectiveButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

UserAdvancedFilters.displayName = 'UserAdvancedFilters';
