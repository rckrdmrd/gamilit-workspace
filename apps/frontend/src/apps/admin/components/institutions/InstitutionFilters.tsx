import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

interface InstitutionFiltersProps {
  onFilter: (filters: FilterValues) => void;
  onReset?: () => void;
}

export interface FilterValues {
  search: string;
  status: string[];
  plan: string[];
}

/**
 * InstitutionFilters - Componente de filtros para instituciones
 *
 * Funcionalidades:
 * - Búsqueda por nombre de institución
 * - Filtro por estado (activo/inactivo/suspendido)
 * - Filtro por plan (free/basic/professional/enterprise)
 * - Reset de filtros
 *
 * @component
 */
export const InstitutionFilters: React.FC<InstitutionFiltersProps> = ({ onFilter, onReset }) => {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: [],
    plan: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'suspended', label: 'Suspendido' },
  ];

  const planOptions = [
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic' },
    { value: 'professional', label: 'Professional' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handlePlanToggle = (plan: string) => {
    const newPlan = filters.plan.includes(plan)
      ? filters.plan.filter((p) => p !== plan)
      : [...filters.plan, plan];
    const newFilters = { ...filters, plan: newPlan };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', status: [], plan: [] };
    setFilters(resetFilters);
    onFilter(resetFilters);
    setShowAdvancedFilters(false);
    if (onReset) onReset();
  };

  const hasActiveFilters =
    filters.search.length > 0 || filters.status.length > 0 || filters.plan.length > 0;

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-detective-bg-secondary p-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de institución..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-600 bg-detective-bg py-2.5 pl-10 pr-4 text-detective-text placeholder-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
          />
        </div>
        <DetectiveButton
          variant={showAdvancedFilters ? 'primary' : 'secondary'}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="h-5 w-5" />
          Filtros
        </DetectiveButton>
        {hasActiveFilters && (
          <DetectiveButton variant="secondary" onClick={handleReset}>
            <X className="h-5 w-5" />
            Limpiar
          </DetectiveButton>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-4 border-t border-gray-700 pt-4">
          {/* Status Filters */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">Estado</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusToggle(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filters.status.includes(option.value)
                      ? 'bg-detective-orange text-white'
                      : 'border border-gray-600 bg-detective-bg text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Filters */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">Plan</label>
            <div className="flex flex-wrap gap-2">
              {planOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePlanToggle(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filters.plan.includes(option.value)
                      ? 'bg-detective-orange text-white'
                      : 'border border-gray-600 bg-detective-bg text-detective-text hover:bg-detective-bg-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="rounded-lg bg-detective-bg p-3">
              <p className="text-xs font-medium text-gray-400">Filtros activos:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.status.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-500"
                  >
                    Estado: {statusOptions.find((s) => s.value === status)?.label}
                  </span>
                ))}
                {filters.plan.map((plan) => (
                  <span
                    key={plan}
                    className="inline-flex items-center gap-1 rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-500"
                  >
                    Plan: {planOptions.find((p) => p.value === plan)?.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
