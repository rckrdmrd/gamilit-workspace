/**
 * MetricsTab Component
 *
 * Displays real-time system metrics including memory, CPU, processes, and system info.
 *
 * Features:
 * - Real-time metrics display with auto-refresh
 * - Color-coded health indicators (green/yellow/red)
 * - Memory and heap usage progress bars
 * - CPU load average visualization
 * - System information panel
 * - Process statistics
 * - Manual refresh and auto-refresh toggle
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { Server, Cpu, HardDrive, Activity, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import type { ExtendedSystemMetrics } from '@/services/api/adminTypes';

interface MetricsTabProps {
  metrics: ExtendedSystemMetrics | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * Format seconds to human-readable duration
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Get color based on percentage threshold
 */
function getHealthColor(percent: number): string {
  if (percent < 70) return 'text-green-500';
  if (percent < 85) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Get background color for progress bar
 */
function getProgressColor(percent: number): string {
  if (percent < 70) return 'bg-green-500';
  if (percent < 85) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Metrics Tab Component
 */
export const MetricsTab: React.FC<MetricsTabProps> = ({ metrics, isLoading, onRefresh }) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh().then(() => {
        setLastUpdated(new Date());
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // Manual refresh
  const handleRefresh = async () => {
    await onRefresh();
    setLastUpdated(new Date());
  };

  if (!metrics) {
    return (
      <EmptyState
        icon={Server}
        title="No hay datos de metricas disponibles"
        description="Haz clic en el boton para cargar las metricas del sistema"
        action={{ label: 'Cargar Metricas', onClick: handleRefresh }}
      />
    );
  }

  const memoryPercent = metrics.memory.usage_percent;
  const heapPercent = (metrics.memory.heap_used_mb / metrics.memory.heap_total_mb) * 100;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            Auto-refresh (5s)
          </label>

          <DetectiveButton
            onClick={handleRefresh}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </DetectiveButton>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Memory Usage */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <HardDrive className="h-4 w-4" />
                Uso de Memoria
              </div>
              <div className={`text-3xl font-bold ${getHealthColor(memoryPercent)}`}>
                {memoryPercent.toFixed(1)}%
              </div>
            </div>
            <AlertCircle className={`h-5 w-5 ${getHealthColor(memoryPercent)}`} />
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(memoryPercent)}`}
                style={{ width: `${Math.min(memoryPercent, 100)}%` }}
              />
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Usada:</span>
                <span className="font-mono">{metrics.memory.used_mb.toFixed(0)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono">{metrics.memory.total_mb.toFixed(0)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Libre:</span>
                <span className="font-mono">{metrics.memory.free_mb.toFixed(0)} MB</span>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* CPU Load */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <Cpu className="h-4 w-4" />
                Carga de CPU
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {metrics.cpu.load_average[0].toFixed(2)}
              </div>
            </div>
            <Cpu className="h-5 w-5 text-blue-400" />
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>1 min:</span>
              <span className="font-mono">{metrics.cpu.load_average[0].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>5 min:</span>
              <span className="font-mono">{metrics.cpu.load_average[1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>15 min:</span>
              <span className="font-mono">{metrics.cpu.load_average[2].toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cores:</span>
              <span className="font-mono">{metrics.cpu.cores}</span>
            </div>
          </div>
        </DetectiveCard>

        {/* Heap Usage */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <Activity className="h-4 w-4" />
                Uso de Heap
              </div>
              <div className={`text-3xl font-bold ${getHealthColor(heapPercent)}`}>
                {heapPercent.toFixed(1)}%
              </div>
            </div>
            <Activity className={`h-5 w-5 ${getHealthColor(heapPercent)}`} />
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(heapPercent)}`}
                style={{ width: `${Math.min(heapPercent, 100)}%` }}
              />
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Usado:</span>
                <span className="font-mono">{metrics.memory.heap_used_mb.toFixed(0)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono">{metrics.memory.heap_total_mb.toFixed(0)} MB</span>
              </div>
            </div>
          </div>
        </DetectiveCard>

        {/* Process Uptime */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <Server className="h-4 w-4" />
                Tiempo Activo (Proceso)
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {formatUptime(metrics.process.uptime_seconds)}
              </div>
            </div>
            <Server className="h-5 w-5 text-purple-400" />
          </div>

          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>PID:</span>
              <span className="font-mono">{metrics.process.pid}</span>
            </div>
          </div>
        </DetectiveCard>

        {/* Active Handles */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <Activity className="h-4 w-4" />
                Handles Activos
              </div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(metrics.process.active_handles)}
              </div>
            </div>
            <Activity className="h-5 w-5 text-green-400" />
          </div>

          <div className="text-xs text-gray-400">
            <p>Conexiones y recursos activos</p>
          </div>
        </DetectiveCard>

        {/* Active Requests */}
        <DetectiveCard className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
                <Activity className="h-4 w-4" />
                Requests Activos
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {formatNumber(metrics.process.active_requests)}
              </div>
            </div>
            <Activity className="h-5 w-5 text-yellow-400" />
          </div>

          <div className="text-xs text-gray-400">
            <p>Peticiones en curso</p>
          </div>
        </DetectiveCard>
      </div>

      {/* System Information */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
          <Server className="h-5 w-5" />
          Información del Sistema
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-1 text-sm text-gray-400">Plataforma</div>
            <div className="font-mono text-detective-text">{metrics.system.platform}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-400">Arquitectura</div>
            <div className="font-mono text-detective-text">{metrics.system.arch}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-400">Node Version</div>
            <div className="font-mono text-detective-text">{metrics.system.node_version}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-400">Hostname</div>
            <div className="font-mono text-detective-text">{metrics.system.hostname}</div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-400">System Uptime</div>
            <div className="font-mono text-detective-text">
              {formatUptime(metrics.system.uptime_seconds)}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-400">Timestamp</div>
            <div className="font-mono text-xs text-detective-text">
              {new Date(metrics.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
};

export default MetricsTab;
