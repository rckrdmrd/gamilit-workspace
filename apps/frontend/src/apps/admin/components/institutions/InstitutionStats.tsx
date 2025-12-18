import React from 'react';
import {
  Users,
  UserCheck,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
  Activity,
  Target,
} from 'lucide-react';

export interface InstitutionStatsData {
  totalUsers: number;
  activeUsers: number;
  totalExercises?: number;
  completedExercises?: number;
  averageProgress?: number;
  totalXP?: number;
  storageUsed?: number;
  storageLimit?: number;
  lastActivity?: string;
}

interface InstitutionStatsProps {
  stats: InstitutionStatsData | null;
  loading?: boolean;
}

/**
 * InstitutionStats - Componente de estadísticas de institución
 *
 * Muestra:
 * - Total de usuarios y usuarios activos
 * - Ejercicios totales y completados
 * - Progreso promedio
 * - XP total acumulado
 * - Uso de almacenamiento
 * - Última actividad
 *
 * @component
 */
export const InstitutionStats: React.FC<InstitutionStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-700 bg-detective-bg-secondary p-4"
          >
            <div className="mb-2 h-4 w-24 rounded bg-gray-700"></div>
            <div className="h-8 w-16 rounded bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-6 text-center">
        <p className="text-detective-text-secondary">
          No hay estadísticas disponibles
        </p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Usuarios',
      value: stats.totalUsers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: UserCheck,
      label: 'Usuarios Activos',
      value: stats.activeUsers,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      percentage: stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0,
    },
    {
      icon: BookOpen,
      label: 'Ejercicios Totales',
      value: stats.totalExercises ?? 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Target,
      label: 'Ejercicios Completados',
      value: stats.completedExercises ?? 0,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      percentage:
        stats.totalExercises && stats.totalExercises > 0
          ? ((stats.completedExercises ?? 0) / stats.totalExercises) * 100
          : 0,
    },
    {
      icon: TrendingUp,
      label: 'Progreso Promedio',
      value: `${Math.round(stats.averageProgress ?? 0)}%`,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      isPercentage: true,
    },
    {
      icon: Trophy,
      label: 'XP Total',
      value: stats.totalXP?.toLocaleString() ?? '0',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/20',
    },
    {
      icon: Activity,
      label: 'Almacenamiento',
      value: stats.storageUsed
        ? `${(stats.storageUsed / 1024).toFixed(1)} GB`
        : '0 GB',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/20',
      subValue: stats.storageLimit
        ? `de ${(stats.storageLimit / 1024).toFixed(0)} GB`
        : undefined,
    },
    {
      icon: Calendar,
      label: 'Última Actividad',
      value: stats.lastActivity
        ? new Date(stats.lastActivity).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          })
        : 'N/A',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      isDate: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4 transition-all hover:border-gray-600 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-detective-text-secondary">
                {card.label}
              </span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-detective-text">{card.value}</p>
              {card.subValue && (
                <p className="mt-1 text-xs text-detective-text-secondary">{card.subValue}</p>
              )}
              {card.percentage !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className={`h-full transition-all ${card.bgColor}`}
                      style={{ width: `${Math.min(card.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-detective-text-secondary">
                    {card.percentage.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
