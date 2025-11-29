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
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';
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
import { Users, Activity, Award, TrendingUp } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
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
  icon: any;
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
      <div className="py-12 text-center">
        <p className="text-detective-text-secondary">No hay datos disponibles</p>
      </div>
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
                  label={(entry: any) =>
                    `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`
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
            <div className="flex h-[300px] items-center justify-center text-detective-text-secondary">
              No hay datos de segmentos
            </div>
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
          <div className="flex h-[300px] items-center justify-center text-detective-text-secondary">
            No hay datos de actividad
          </div>
        )}
      </DetectiveCard>

      {/* Top Users Table */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Top 10 Usuarios</h3>
        {topUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-detective-border border-b">
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    XP
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    Ejercicios
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-detective-text-secondary">
                    Rango
                  </th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, index) => (
                  <tr
                    key={user.user_id}
                    className="border-detective-border border-b transition-colors hover:bg-detective-bg-secondary"
                  >
                    <td className="px-4 py-3 text-detective-text">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-detective-text">
                      {user.display_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-detective-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-detective-text">{formatNumber(user.total_xp)}</td>
                    <td className="px-4 py-3 text-detective-text">{user.exercises_completed}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-detective-orange/20 px-3 py-1 text-sm text-detective-orange">
                        {user.current_rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-detective-text-secondary">
            No hay datos de usuarios
          </div>
        )}
      </DetectiveCard>
    </div>
  );
}
