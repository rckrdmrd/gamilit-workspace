/**
 * RetentionTab Component
 *
 * Analytics retention tab showing:
 * - Cohort retention table with percentages
 * - Key retention metrics
 * - Retention visualization
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import type { RetentionAnalytics, CohortRetention } from '@/services/api/adminTypes';

interface RetentionTabProps {
  retention: RetentionAnalytics | null;
}

/** Column definitions for Cohort Retention table */
const cohortColumns: Column<CohortRetention>[] = [
  {
    key: 'cohort_month',
    label: 'Mes de Cohorte',
    render: (row) => <span className="font-medium">{row.cohort_month}</span>,
  },
  {
    key: 'cohort_size',
    label: 'Tamaño del Cohorte',
    render: (row) => row.cohort_size.toLocaleString('es-ES'),
  },
  {
    key: 'retained_users',
    label: 'Usuarios Retenidos',
    render: (row) => row.retained_users.toLocaleString('es-ES'),
  },
  {
    key: 'retention_rate',
    label: 'Tasa de Retención',
    render: (row) => {
      const retentionRate = row.retention_rate * 100;
      return (
        <div className="flex items-center gap-2">
          <div className="bg-detective-bg-tertiary h-2 flex-1 rounded-full">
            <div
              className={`h-2 rounded-full ${
                retentionRate >= 70
                  ? 'bg-green-500'
                  : retentionRate >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${retentionRate}%` }}
            />
          </div>
          <span
            className={`text-sm font-semibold ${
              retentionRate >= 70
                ? 'text-green-400'
                : retentionRate >= 40
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {retentionRate.toFixed(1)}%
          </span>
        </div>
      );
    },
  },
];

/**
 * RetentionTab Component
 */
export function RetentionTab({ retention }: RetentionTabProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!retention) return [];
    return retention.cohorts.map((cohort) => ({
      mes: cohort.cohort_month,
      tasa_retencion: cohort.retention_rate * 100, // Convert to percentage
      usuarios_retenidos: cohort.retained_users,
    }));
  }, [retention]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!retention || retention.cohorts.length === 0) return null;

    const avgRetention =
      retention.cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / retention.cohorts.length;

    const totalUsers = retention.cohorts.reduce((sum, c) => sum + c.cohort_size, 0);
    const totalRetained = retention.cohorts.reduce((sum, c) => sum + c.retained_users, 0);

    // Find best and worst retention
    const sortedByRetention = [...retention.cohorts].sort(
      (a, b) => b.retention_rate - a.retention_rate,
    );
    const bestCohort = sortedByRetention[0];
    const worstCohort = sortedByRetention[sortedByRetention.length - 1];

    return {
      avgRetention: avgRetention * 100,
      totalUsers,
      totalRetained,
      bestCohort,
      worstCohort,
    };
  }, [retention]);

  if (!retention) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No hay datos de retencion disponibles"
        description="Los datos de retencion apareceran cuando haya suficientes cohortes"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Retención Promedio</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {metrics.avgRetention.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-blue-500 p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Total Usuarios</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {metrics.totalUsers.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-green-500 p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Usuarios Retenidos</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {metrics.totalRetained.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-detective-orange p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>
        </div>
      )}

      {/* Retention Trend Chart */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Tendencia de Retención</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tasa_retencion"
                stroke="#4ECDC4"
                strokeWidth={2}
                name="Tasa de Retención (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No hay datos de tendencia"
            className="h-[300px]"
          />
        )}
      </DetectiveCard>

      {/* Best and Worst Cohorts */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DetectiveCard className="border-2 border-green-500/30 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-detective-text">Mejor Cohorte</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Mes</span>
                <span className="font-medium text-detective-text">
                  {metrics.bestCohort.cohort_month}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Tasa de Retención</span>
                <span className="text-2xl font-bold text-green-400">
                  {(metrics.bestCohort.retention_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Tamaño del Cohorte</span>
                <span className="font-medium text-detective-text">
                  {metrics.bestCohort.cohort_size.toLocaleString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Usuarios Retenidos</span>
                <span className="font-medium text-detective-text">
                  {metrics.bestCohort.retained_users.toLocaleString('es-ES')}
                </span>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="border-2 border-red-500/30 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-detective-text">Cohorte con Menor Retención</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Mes</span>
                <span className="font-medium text-detective-text">
                  {metrics.worstCohort.cohort_month}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Tasa de Retención</span>
                <span className="text-2xl font-bold text-red-400">
                  {(metrics.worstCohort.retention_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Tamaño del Cohorte</span>
                <span className="font-medium text-detective-text">
                  {metrics.worstCohort.cohort_size.toLocaleString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-detective-text-secondary">Usuarios Retenidos</span>
                <span className="font-medium text-detective-text">
                  {metrics.worstCohort.retained_users.toLocaleString('es-ES')}
                </span>
              </div>
            </div>
          </DetectiveCard>
        </div>
      )}

      {/* Cohort Table */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Análisis de Cohortes</h3>
        <DataTable<CohortRetention>
          data={retention.cohorts}
          columns={cohortColumns}
          striped={false}
          emptyMessage="No hay datos de cohortes"
        />
      </DetectiveCard>
    </div>
  );
}
