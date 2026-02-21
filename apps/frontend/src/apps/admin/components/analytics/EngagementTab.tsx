/**
 * EngagementTab Component
 *
 * Analytics engagement tab showing:
 * - Engagement metrics by segment
 * - Bar chart showing stats per segment
 * - Activity metrics table
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, Activity, Flame, BarChart3 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import type { EngagementAnalytics, EngagementBySegment } from '@/services/api/adminTypes';

interface EngagementTabProps {
  engagement: EngagementAnalytics | null;
}

/** Column definitions for Engagement Segment table */
const engagementColumns: Column<EngagementBySegment>[] = [
  {
    key: 'user_segment',
    label: 'Segmento',
    render: (row) => <span className="font-medium">{row.user_segment}</span>,
  },
  {
    key: 'users_count',
    label: 'Usuarios',
    render: (row) => row.users_count.toLocaleString('es-ES'),
  },
  {
    key: 'avg_engagement_score',
    label: 'Engagement',
    render: (row) => (
      <span
        className={`rounded-full px-3 py-1 text-sm ${
          row.avg_engagement_score >= 70
            ? 'bg-green-500/20 text-green-400'
            : row.avg_engagement_score >= 40
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
        }`}
      >
        {row.avg_engagement_score.toFixed(1)}%
      </span>
    ),
  },
  {
    key: 'avg_exercises_completed',
    label: 'Ejercicios Prom.',
    render: (row) => row.avg_exercises_completed.toFixed(1),
  },
  {
    key: 'avg_streak',
    label: 'Racha Prom.',
    render: (row) => row.avg_streak.toFixed(1),
  },
  {
    key: 'active_last_7d',
    label: 'Activos 7d',
    render: (row) => row.active_last_7d.toLocaleString('es-ES'),
  },
  {
    key: 'active_last_30d',
    label: 'Activos 30d',
    render: (row) => row.active_last_30d.toLocaleString('es-ES'),
  },
];

/**
 * EngagementTab Component
 */
export function EngagementTab({ engagement }: EngagementTabProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!engagement) return [];
    return engagement.by_segment.map((segment) => ({
      segment: segment.user_segment,
      usuarios: segment.users_count,
      engagement: segment.avg_engagement_score,
      ejercicios: segment.avg_exercises_completed,
      racha: segment.avg_streak,
    }));
  }, [engagement]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!engagement) return null;
    return engagement.by_segment.reduce(
      (acc, segment) => ({
        users: acc.users + segment.users_count,
        active7d: acc.active7d + segment.active_last_7d,
        active30d: acc.active30d + segment.active_last_30d,
      }),
      { users: 0, active7d: 0, active30d: 0 },
    );
  }, [engagement]);

  if (!engagement) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No hay datos de engagement disponibles"
        description="Los datos de engagement apareceran cuando haya actividad en el sistema"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Total Usuarios</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {totals.users.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-blue-500 p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Activos (7 días)</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {totals.active7d.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-green-500 p-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Activos (30 días)</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {totals.active30d.toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-detective-orange p-3">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>
        </div>
      )}

      {/* Engagement Bar Chart */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Engagement por Segmento</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="segment" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="engagement" fill="#4ECDC4" name="Score de Engagement" />
              <Bar dataKey="ejercicios" fill="#FF6B6B" name="Ejercicios Promedio" />
              <Bar dataKey="racha" fill="#FFA07A" name="Racha Promedio" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={Activity}
            title="No hay datos de engagement"
            className="h-[350px]"
          />
        )}
      </DetectiveCard>

      {/* Detailed Table */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Desglose por Segmento</h3>
        <DataTable<EngagementBySegment>
          data={engagement.by_segment}
          columns={engagementColumns}
          striped={false}
          emptyMessage="No hay datos de engagement por segmento"
        />
      </DetectiveCard>
    </div>
  );
}
