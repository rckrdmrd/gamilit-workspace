/**
 * GamificationTab Component
 *
 * Analytics gamification tab showing:
 * - XP distribution chart
 * - Ranks distribution chart
 * - Levels distribution chart
 * - Summary statistics
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import type { GamificationAnalytics } from '@/services/api/adminTypes';

interface GamificationTabProps {
  gamification: GamificationAnalytics | null;
}

/** Row type for the ranks detail table (transformed from RankDistribution) */
interface RankRow {
  rango: string;
  usuarios: number;
  xp_promedio: number;
  ejercicios_promedio: number;
}

/** Column definitions for Ranks Details table */
const rankColumns: Column<RankRow>[] = [
  {
    key: 'rango',
    label: 'Rango',
    render: (row) => (
      <span className="rounded-full bg-detective-orange/20 px-3 py-1 text-sm font-medium text-detective-orange">
        {row.rango}
      </span>
    ),
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    render: (row) => row.usuarios.toLocaleString('es-ES'),
  },
  {
    key: 'xp_promedio',
    label: 'XP Promedio',
    render: (row) => row.xp_promedio.toLocaleString('es-ES'),
  },
  { key: 'ejercicios_promedio', label: 'Ejercicios Promedio' },
];

/**
 * GamificationTab Component
 */
export function GamificationTab({ gamification }: GamificationTabProps) {
  // Prepare XP distribution data
  const xpData = useMemo(() => {
    if (!gamification) return [];
    return gamification.xp_distribution.map((item) => ({
      range: item.xp_range,
      usuarios: item.users_count,
    }));
  }, [gamification]);

  // Prepare ranks distribution data
  const ranksData = useMemo(() => {
    if (!gamification) return [];
    return gamification.ranks_distribution.map((item) => ({
      rango: item.current_rank,
      usuarios: item.users_count,
      xp_promedio: Math.round(item.avg_xp),
      ejercicios_promedio: Math.round(item.avg_exercises),
    }));
  }, [gamification]);

  // Prepare levels distribution data
  const levelsData = useMemo(() => {
    if (!gamification) return [];
    return gamification.levels_distribution
      .sort((a, b) => a.current_level - b.current_level)
      .map((item) => ({
        nivel: `Nivel ${item.current_level}`,
        usuarios: item.users_count,
      }));
  }, [gamification]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!gamification) return null;
    return {
      totalUsers: gamification.xp_distribution.reduce((sum, item) => sum + item.users_count, 0),
      totalXP: gamification.ranks_distribution.reduce(
        (sum, item) => sum + item.avg_xp * item.users_count,
        0,
      ),
      totalRanks: gamification.ranks_distribution.length,
      totalLevels: gamification.levels_distribution.length,
    };
  }, [gamification]);

  if (!gamification) {
    return (
      <EmptyState
        icon={Award}
        title="No hay datos de gamificacion disponibles"
        description="Los datos de gamificacion apareceran cuando haya actividad en el sistema"
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
                <p className="text-sm text-detective-text-secondary">Total XP Acumulado</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">
                  {Math.round(totals.totalXP).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="rounded-lg bg-detective-orange p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Rangos Activos</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">{totals.totalRanks}</p>
              </div>
              <div className="rounded-lg bg-purple-500 p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Niveles Alcanzados</p>
                <p className="mt-2 text-3xl font-bold text-detective-text">{totals.totalLevels}</p>
              </div>
              <div className="rounded-lg bg-blue-500 p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </DetectiveCard>
        </div>
      )}

      {/* XP Distribution Chart */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Distribución de XP</h3>
        {xpData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={xpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="usuarios" fill="#4ECDC4" name="Usuarios" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No hay datos de distribucion de XP"
            className="h-[300px]"
          />
        )}
      </DetectiveCard>

      {/* Ranks Distribution Chart */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Distribución por Rangos</h3>
        {ranksData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ranksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="rango" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="usuarios" fill="#FF6B6B" name="Usuarios" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={Star}
            title="No hay datos de distribucion de rangos"
            className="h-[300px]"
          />
        )}
      </DetectiveCard>

      {/* Ranks Details Table */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Detalles de Rangos</h3>
        <DataTable<RankRow>
          data={ranksData}
          columns={rankColumns}
          striped={false}
          emptyMessage="No hay datos de rangos"
        />
      </DetectiveCard>

      {/* Levels Distribution Chart */}
      <DetectiveCard className="p-6">
        <h3 className="mb-4 text-xl font-bold text-detective-text">Distribución por Niveles</h3>
        {levelsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nivel" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="usuarios" fill="#45B7D1" name="Usuarios" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No hay datos de distribucion de niveles"
            className="h-[300px]"
          />
        )}
      </DetectiveCard>
    </div>
  );
}
