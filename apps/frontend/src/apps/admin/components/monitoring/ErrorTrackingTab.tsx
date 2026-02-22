/**
 * ErrorTrackingTab Component
 *
 * Displays error monitoring, statistics, trends, and recent error logs.
 *
 * Features:
 * - Error statistics (total, fatal, days with errors)
 * - Time period selector (24h, 48h, 7 days)
 * - Error trends visualization
 * - Recent errors table with details
 * - Expandable error context
 * - Copy to clipboard functionality
 * - Filter by error level
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, XCircle, Eye, Copy, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import type { ErrorStats, RecentError, ErrorTrendDataPoint } from '@/services/api/adminTypes';

interface ErrorTrackingTabProps {
  stats: ErrorStats | null;
  recentErrors: RecentError[];
  trends: ErrorTrendDataPoint[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

type TimePeriod = 24 | 48 | 168; // 24h, 48h, 7 days
type ErrorLevel = 'all' | 'error' | 'fatal';

/**
 * Format timestamp to readable format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

/**
 * Get badge color for error level
 */
function getErrorLevelColor(level: string): string {
  if (level.toLowerCase().includes('fatal')) {
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  }
  if (level.toLowerCase().includes('error')) {
    return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  }
  return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
}

/**
 * Error Tracking Tab Component
 */
export const ErrorTrackingTab = ({
  stats,
  recentErrors,
  trends,
  isLoading,
  onRefresh,
}: ErrorTrackingTabProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(24);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('all');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  // Filter errors by level
  const filteredErrors = recentErrors.filter((error) => {
    if (errorLevel === 'all') return true;
    return error.log_level.toLowerCase().includes(errorLevel);
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Período:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTimePeriod(24)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                timePeriod === 24
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimePeriod(48)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                timePeriod === 48
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              48h
            </button>
            <button
              onClick={() => setTimePeriod(168)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                timePeriod === 168
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              7 días
            </button>
          </div>
        </div>

        <DetectiveButton
          onClick={onRefresh}
          disabled={isLoading}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </DetectiveButton>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Errors */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Total de Errores</div>
                <div className="text-3xl font-bold text-orange-400">{stats.total_errors}</div>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="text-xs text-gray-400">Últimas {stats.time_period_hours}h</div>
          </DetectiveCard>

          {/* Fatal Errors */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Errores Fatales</div>
                <div className="text-3xl font-bold text-red-400">{stats.fatal_errors}</div>
              </div>
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-xs text-gray-400">Requieren atención inmediata</div>
          </DetectiveCard>

          {/* Days with Errors */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Días con Errores</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.days_with_errors}</div>
              </div>
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-xs text-gray-400">En período seleccionado</div>
          </DetectiveCard>

          {/* Last Error */}
          <DetectiveCard className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="mb-1 text-sm text-gray-400">Último Error</div>
                <div className="font-mono text-sm text-purple-400">
                  {stats.last_error_at ? formatTimestamp(stats.last_error_at) : 'N/A'}
                </div>
              </div>
              <AlertCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-xs text-gray-400">Más reciente detectado</div>
          </DetectiveCard>
        </div>
      )}

      {/* Error Trends Chart (Simple Bar Chart) */}
      {trends.length > 0 && (
        <DetectiveCard className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
            <AlertTriangle className="h-5 w-5" />
            Tendencias de Errores
          </h3>

          <div className="space-y-2">
            {trends.slice(0, 12).map((trend, index) => {
              const maxCount = Math.max(...trends.map((t) => t.error_count));
              const widthPercent = maxCount > 0 ? (trend.error_count / maxCount) * 100 : 0;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0 font-mono text-xs text-gray-400">
                    {new Date(trend.time_bucket).toLocaleString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                    })}
                  </div>

                  <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-semibold text-white mix-blend-difference">
                        {trend.error_count} errores
                        {trend.fatal_count > 0 && ` (${trend.fatal_count} fatal)`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DetectiveCard>
      )}

      {/* Recent Errors Table */}
      <DetectiveCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-detective-text">
            <XCircle className="h-5 w-5" />
            Errores Recientes
          </h3>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Nivel:</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
              className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-gray-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="error">Error</option>
              <option value="fatal">Fatal</option>
            </select>
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <AlertCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No hay errores para mostrar</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className="rounded-lg border border-gray-700 p-4 transition-colors hover:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 text-xs font-semibold ${getErrorLevelColor(
                          error.log_level,
                        )}`}
                      >
                        {error.log_level.toUpperCase()}
                      </span>

                      <span className="font-mono text-xs text-gray-500">
                        {formatTimestamp(error.timestamp)}
                      </span>

                      {error.source && (
                        <span className="font-mono text-xs text-gray-500">{error.source}</span>
                      )}
                    </div>

                    <p className="mb-2 break-words font-mono text-sm text-detective-text">
                      {error.message}
                    </p>

                    {error.user_name && (
                      <div className="text-xs text-gray-400">
                        Usuario: {error.user_name} ({error.user_id})
                      </div>
                    )}

                    {error.context && expandedError === error.id && (
                      <div className="mt-3 rounded border border-gray-700 bg-gray-900 p-3">
                        <div className="mb-1 text-xs text-gray-400">Context:</div>
                        <pre className="overflow-x-auto font-mono text-xs text-gray-300">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 gap-2">
                    {error.context && (
                      <button
                        onClick={() =>
                          setExpandedError(expandedError === error.id ? null : error.id)
                        }
                        className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
                        title={expandedError === error.id ? 'Ocultar detalles' : 'Ver detalles'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => copyToClipboard(error.message)}
                      className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
                      title="Copiar mensaje"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DetectiveCard>
    </div>
  );
};

export default ErrorTrackingTab;
