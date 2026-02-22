/**
 * OverviewTab Component
 *
 * Analytics overview tab showing:
 * - Statistics cards (total users, engagement, avg XP, avg exercises)
 * - User segments pie chart
 * - Activity timeline (last 30 days)
 * - Top users table
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */
import { useMemo, type ElementType } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, Activity, Award, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import type { AnalyticsOverview, DailyActivity, TopUser } from '@/services/api/adminTypes';

// Chart colors
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

interface OverviewTabProps {
  overview: AnalyticsOverview | null;
  activityTimeline: DailyActivity[];
  topUsers: TopUser[];
}

/**
 * StatCard Component
 */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: ElementType;
  color: string;
}) {
  return (
    <DetectiveCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-detective-text-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold text-detective-text">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </DetectiveCard>
  );
}

/** Column definitions for Top Users table */
const topUserColumns: Column<TopUser & { rank: number }>[] = [
  { key: 'rank', label: '#' },
  {
    key: 'display_name',
    label: 'Usuario',
    render: (row) => <span className="font-medium">{row.display_name}</span>,
  },
  {
    key: 'email',
    label: 'Email',
    render: (row) => <span className="text-sm text-detective-text-secondary">{row.email}</span>,
  },
  {
    key: 'total_xp',
    label: 'XP',
    render: (row) => row.total_xp.toLocaleString('es-ES'),
  },
  { key: 'exercises_completed', label: 'Ejercicios' },
  {
    key: 'current_rank',
    label: 'Rango',
    render: (row) => (
      <span className="rounded-full bg-detective-orange/20 px-3 py-1 text-sm text-detective-orange">
        {row.current_rank}
      </span>
    ),
  },
];

/**
 * OverviewTab Component
 */
export function OverviewTab({ overview, activityTimeline, topUsers }: OverviewTabProps) {
  // Prepare pie chart data for user segments
  const segmentData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: 'Inactivos', value: overview.inactive_users },
      { name: 'Principiantes', value: overview.beginner_users },
      { name: 'Intermedios', value: overview.intermediate_users },
      { name: 'Avanzados', value: overview.advanced_users },
    ].filter((item) => item.value > 0);
  }, [overview]);

  // Prepare timeline data
  const timelineData = useMemo(() => {
    return activityTimeline.map((day) => ({
      date: new Date(day.activity_date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      usuarios: day.unique_users,
      actividades: day.total_activities,
    }));
  }, [activityTimeline]);

  // Format number with thousands separator
  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES');
  };

  if (!overview) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No hay datos disponibles"
        description="Los datos de analisis apareceran cuando haya actividad en el sistema"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Usuarios"
          value={formatNumber(overview.total_users)}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Usuarios Activos"
          value={formatNumber(overview.active_users)}
          icon={Activity}
          color="bg-green-500"
        />
        <StatCard
          title="XP Promedio"
          value={formatNumber(Math.round(overview.avg_xp))}
          icon={Award}
          color="bg-detective-orange"
        />
        <StatCard
          title="Ejercicios Promedio"
          value={formatNumber(Math.round(overview.avg_exercises_completed))}
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Segments Pie Chart */}
        <DetectiveCard className="p-6">
          <h3 className="mb-4 text-xl font-bold text-detective-text">Distribución por Segmento</h3>
          {segmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={PieChartIcon}
              title="No hay datos de segmentos"
              className="h-[300px]"
            />
          )}
        </DetectiveCard>

        {/* Additional Stats */}
        <DetectiveCard className="p-6">
          <h3 className="mb-4 text-xl font-bold text-detective-text">Estadísticas Adicionales</h3>
          <div className="space-y-4">
            <div className="border-detective-border flex items-center justify-between border-b py-3">
              <span className="text-detective-text-secondary">Total Estudiantes</span>
              <span className="text-xl font-bold text-detective-text">
                {formatNumber(overview.total_students)}
              </span>
            </div>
            <div className="border-detective-border flex items-center justify-between border-b py-3">
              <span className="text-detective-text-secondary">Total Profesores</span>
              <span className="text-xl font-bold text-detective-text">
                {formatNumber(overview.total_teachers)}
              </span>
            </div>
            <div className="border-detective-border flex items-center justify-between border-b py-3">
              <span className="text-detective-text-secondary">Engagement Promedio</span>
              <span className="text-xl font-bold text-detective-text">
                {overview.avg_engagement_score.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-detective-text-secondary">Usuarios Inactivos</span>
              <span className="text-xl font-bold text-red-500">
                {formatNumber(overview.inactive_users)}
              </span>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Activity Timeline */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">
          Actividad de los Últimos 30 Días
        </h3>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="usuarios"
                stroke="#4ECDC4"
                strokeWidth={2}
                name="Usuarios Únicos"
              />
              <Line
                type="monotone"
                dataKey="actividades"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="Total Actividades"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={Activity}
            title="No hay datos de actividad"
            className="h-[300px]"
          />
        )}
      </DetectiveCard>

      {/* Top Users Table */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Top 10 Usuarios</h3>
        {topUsers.length > 0 ? (
          <DataTable<TopUser & { rank: number }>
            data={topUsers.map((u, i) => ({ ...u, rank: i + 1 }))}
            columns={topUserColumns}
            striped={false}
            emptyMessage="No hay datos de usuarios"
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No hay datos de usuarios"
          />
        )}
      </DetectiveCard>
    </div>
  );
}
