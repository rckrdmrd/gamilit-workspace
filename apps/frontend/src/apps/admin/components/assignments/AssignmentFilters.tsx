/**
 * AssignmentFilters Component
 *
 * Filter panel for assignments with support for:
 * - Classroom selection
 * - Teacher selection
 * - Student selection
 * - Status filter
 * - Date range filter
 *
 * Created: 2025-11-29 - US-AE-009
 */

import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import type { AssignmentFilters } from '../../hooks/useAdminAssignments';

interface AssignmentFiltersProps {
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
  onClear: () => void;
}

export function AssignmentFiltersComponent({
  filters,
  onFiltersChange,
  onClear,
}: AssignmentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // HIGH-003 FIX: Validar rango de fechas
  const validateDateRange = (dateFrom: string | undefined, dateTo: string | undefined): boolean => {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      if (from > to) {
        setDateError('La fecha "desde" no puede ser mayor que la fecha "hasta"');
        return false;
      }
    }
    setDateError(null);
    return true;
  };

  const handleFilterChange = (key: keyof AssignmentFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };

    // HIGH-003 FIX: Validar fechas al cambiar
    if (key === 'date_from' || key === 'date_to') {
      validateDateRange(
        key === 'date_from' ? value : filters.date_from,
        key === 'date_to' ? value : filters.date_to
      );
    }

    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '',
  );

  return (
    <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-detective-text hover:text-detective-orange"
        >
          <Filter className="h-5 w-5" />
          <span className="font-semibold">Filtros</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-detective-orange px-2 py-0.5 text-xs text-white">
              Activos
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-detective-text-secondary hover:text-red-400"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Classroom Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              Classroom
            </label>
            <input
              type="text"
              placeholder="ID del classroom..."
              value={filters.classroom_id || ''}
              onChange={(e) => handleFilterChange('classroom_id', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              Profesor
            </label>
            <input
              type="text"
              placeholder="ID del profesor..."
              value={filters.teacher_id || ''}
              onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
          </div>

          {/* Student Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              Estudiante
            </label>
            <input
              type="text"
              placeholder="ID del estudiante..."
              value={filters.student_id || ''}
              onChange={(e) => handleFilterChange('student_id', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              Estado
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activa</option>
              <option value="closed">Cerrada</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              <Calendar className="mr-1 inline h-4 w-4" />
              Fecha desde
            </label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg px-3 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
              <Calendar className="mr-1 inline h-4 w-4" />
              Fecha hasta
            </label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className={`w-full rounded-lg border bg-detective-bg px-3 py-2 text-detective-text focus:outline-none focus:ring-2 ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-detective-orange'
              }`}
            />
          </div>

          {/* HIGH-003 FIX: Mostrar error de validación de fechas */}
          {dateError && (
            <div className="col-span-full">
              <p className="text-sm text-red-400">{dateError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
