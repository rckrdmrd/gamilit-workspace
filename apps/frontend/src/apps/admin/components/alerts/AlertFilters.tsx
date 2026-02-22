/**
 * AlertFilters Component
 *
 * Provides filtering controls for alerts list including:
 * - Severity filter (low, medium, high, critical)
 * - Status filter (open, acknowledged, resolved, suppressed)
 * - Alert type filter
 * - Date range filters
 * - Refresh button
 *
 * @component
 */

import type { ChangeEvent } from 'react';
import { Filter, RefreshCw, Calendar } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type {
  AlertFilters as AlertFiltersType,
  SystemAlertSeverity,
  SystemAlertStatus,
  SystemAlertType,
} from '@/services/api/adminTypes';

interface AlertFiltersProps {
  filters: AlertFiltersType;
  onFiltersChange: (filters: AlertFiltersType) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AlertFilters = ({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: AlertFiltersProps) => {
  const handleSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      severity: value === 'all' ? undefined : (value as SystemAlertSeverity),
      page: 1, // Reset to first page
    });
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as SystemAlertStatus),
      page: 1,
    });
  };

  const handleAlertTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      alert_type: value === 'all' ? undefined : (value as SystemAlertType),
      page: 1,
    });
  };

  const handleDateFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      date_from: e.target.value || undefined,
      page: 1,
    });
  };

  const handleDateToChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      date_to: e.target.value || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
    });
  };

  const hasActiveFilters = !!(
    filters.severity ||
    filters.status ||
    filters.alert_type ||
    filters.date_from ||
    filters.date_to
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-detective-text-secondary" />
          <h3 className="text-lg font-semibold text-detective-text">Filtros</h3>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <DetectiveButton variant="secondary" onClick={handleClearFilters} disabled={isLoading}>
              Limpiar Filtros
            </DetectiveButton>
          )}
          <DetectiveButton variant="secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </DetectiveButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Severity Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
            Severidad
          </label>
          <select
            value={filters.severity || 'all'}
            onChange={handleSeverityChange}
            className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
            Estado
          </label>
          <select
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
          >
            <option value="all">Todos</option>
            <option value="open">Abierto</option>
            <option value="acknowledged">Reconocido</option>
            <option value="resolved">Resuelto</option>
            <option value="suppressed">Suprimido</option>
          </select>
        </div>

        {/* Alert Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
            Tipo de Alerta
          </label>
          <select
            value={filters.alert_type || 'all'}
            onChange={handleAlertTypeChange}
            className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
          >
            <option value="all">Todos</option>
            <option value="performance_degradation">Degradación de Rendimiento</option>
            <option value="high_error_rate">Alta Tasa de Errores</option>
            <option value="security_breach">Brecha de Seguridad</option>
            <option value="resource_limit">Límite de Recursos</option>
            <option value="service_outage">Interrupción de Servicio</option>
            <option value="data_anomaly">Anomalía de Datos</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
            Desde
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={handleDateFromChange}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 pl-10 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
            Hasta
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={handleDateToChange}
              className="w-full rounded-lg border border-gray-600 bg-detective-bg-secondary px-4 py-2 pl-10 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertFilters;
