/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SystemLogsViewer Component
 *
 * System logs viewer with filtering and real-time streaming.
 * Displays log entries with syntax highlighting for JSON data.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import type { SystemLog, LogFilter } from '../../types';

export const SystemLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<LogFilter>({ level: ['error', 'warning', 'critical'] });
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.admin.logs, { params: filter });
      const data = response.data.success ? response.data.data : response.data;
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'error':
        return 'text-orange-500 bg-orange-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const handleExport = () => {
    const logText = logs
      .map(
        (log) => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`,
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DetectiveCard>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-detective-subtitle">System Logs</h3>
        <div className="flex items-center gap-2">
          <label className="text-detective-small flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
          <button
            onClick={handleExport}
            className="hover:bg-detective-bg-tertiary flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-4 py-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Level Filter */}
      <div className="mb-4 flex gap-2">
        {['info', 'warning', 'error', 'critical'].map((level) => (
          <button
            key={level}
            onClick={() => {
              const currentLevels = filter.level || [];
              const newLevels = currentLevels.includes(level as any)
                ? currentLevels.filter((l) => l !== level)
                : [...currentLevels, level as any];
              setFilter({ ...filter, level: newLevels as any });
            }}
            className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
              filter.level?.includes(level as any)
                ? getLevelColor(level)
                : 'bg-detective-bg-secondary text-gray-400'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="custom-scrollbar max-h-[600px] space-y-2 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No logs in selected time range</div>
        ) : (
          logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-lg border-l-4 p-3 ${getLevelColor(log.level)} bg-detective-bg-secondary`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${getLevelColor(log.level)}`}
                  >
                    {log.level}
                  </span>
                  <span className="text-detective-small text-gray-500">{log.source}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('es-ES') : 'N/A'}
                </span>
              </div>
              <p className="text-detective-small text-gray-300">{log.message}</p>
              {log.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-400 hover:text-white">
                    View details
                  </summary>
                  <pre className="mt-2 overflow-x-auto rounded bg-detective-bg p-2 text-xs text-gray-400">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </motion.div>
          ))
        )}
      </div>
    </DetectiveCard>
  );
};
