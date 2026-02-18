/**
 * AuditLogFilters - Filter panel for the audit logs page.
 *
 * Provides date range pickers, status filter, email/IP search,
 * and a collapsible filter area with active filter count badge.
 *
 * @see US-AE-011 - Visor de Audit Logs
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Filter, Search, Calendar, X } from 'lucide-react';
import type { AuditLogFilters as AuditLogFiltersType } from '@/services/api/adminTypes';

interface AuditLogFiltersProps {
  filters: AuditLogFiltersType;
  pageSize: number;
  onFilterChange: (key: keyof AuditLogFiltersType, value: unknown) => void;
  onClearFilters: () => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearch: () => void;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  pageSize,
  onFilterChange,
  onClearFilters,
  searchText,
  onSearchTextChange,
  onSearch,
}) => {
  const [showFilters, setShowFilters] = useState(true);

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  return (
    <DetectiveCard>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-detective-text">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o IP..."
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="w-full rounded-lg bg-detective-bg py-2.5 pl-10 pr-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchText && (
                <button
                  onClick={() => {
                    onSearchTextChange('');
                    onFilterChange('email', undefined);
                    onFilterChange('ipAddress', undefined);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Estado</label>
              <select
                value={
                  filters.success === undefined ? 'all' : filters.success ? 'success' : 'failed'
                }
                onChange={(e) => {
                  const value = e.target.value;
                  onFilterChange(
                    'success',
                    value === 'all' ? undefined : value === 'success',
                  );
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="success">Exitosos</option>
                <option value="failed">Fallidos</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Calendar className="h-4 w-4" />
                Desde
              </label>
              <input
                type="date"
                value={filters.startDate?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? `${e.target.value}T00:00:00Z` : undefined;
                  onFilterChange('startDate', value);
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Calendar className="h-4 w-4" />
                Hasta
              </label>
              <input
                type="date"
                value={filters.endDate?.split('T')[0] || ''}
                onChange={(e) => {
                  const value = e.target.value ? `${e.target.value}T23:59:59Z` : undefined;
                  onFilterChange('endDate', value);
                }}
                className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Page Size */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Items por pagina
              </label>
              <select
                value={pageSize}
                onChange={() => {
                  // This would need the hook to support changing pageSize
                  // For now, it's display-only
                }}
                disabled
                className="w-full rounded-lg bg-detective-bg px-3 py-2.5 text-gray-300 opacity-50 focus:outline-none"
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </DetectiveCard>
  );
};
