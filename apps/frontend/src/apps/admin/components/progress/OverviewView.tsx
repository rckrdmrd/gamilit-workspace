/**
 * OverviewView Component
 *
 * Displays system-wide progress statistics with cards and charts.
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import React from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Users, FileCheck, Target, Clock, TrendingUp, BookOpen } from 'lucide-react';
import type { ProgressOverview } from '@/services/api/adminTypes';

interface OverviewViewProps {
  overview: ProgressOverview | null;
  isLoading: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ overview, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <DetectiveCard key={i} className="animate-pulse">
            <div className="h-24 rounded bg-detective-bg-secondary/50" />
          </DetectiveCard>
        ))}
      </div>
    );
  }

  if (!overview) {
    return (
      <DetectiveCard>
        <p className="py-8 text-center text-detective-text-secondary">No hay datos disponibles</p>
      </DetectiveCard>
    );
  }

  const completionRate =
    overview.total_submissions > 0
      ? ((overview.correct_submissions / overview.total_submissions) * 100).toFixed(1)
      : '0';

  const stats = [
    {
      title: 'Usuarios Totales',
      value: overview.total_users.toLocaleString(),
      subtitle: `${overview.active_users} activos`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Envíos Totales',
      value: overview.total_submissions.toLocaleString(),
      subtitle: `${overview.correct_submissions} correctos`,
      icon: FileCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Promedio de Puntaje',
      value: `${overview.avg_score.toFixed(1)}%`,
      subtitle: `${completionRate}% tasa de éxito`,
      icon: Target,
      color: 'text-detective-orange',
      bgColor: 'bg-detective-orange/10',
    },
    {
      title: 'Módulos Completados',
      value: overview.completed_modules.toLocaleString(),
      subtitle: `${overview.in_progress_modules} en progreso`,
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Progreso Promedio',
      value: `${overview.avg_progress_percent.toFixed(1)}%`,
      subtitle: 'Completitud general',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Tiempo Total',
      value: `${overview.total_time_spent_hours.toFixed(0)} hrs`,
      subtitle: 'Tiempo invertido',
      icon: Clock,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <DetectiveCard
              key={index}
              hoverable
              className="transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm text-detective-text-secondary">{stat.title}</p>
                  <p className="mb-1 text-2xl font-bold text-detective-text">{stat.value}</p>
                  <p className="text-xs text-detective-text-secondary">{stat.subtitle}</p>
                </div>
              </div>
            </DetectiveCard>
          );
        })}
      </div>

      {/* Summary Card */}
      <DetectiveCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-detective-text">Resumen del Sistema</h3>
            <p className="text-detective-text-secondary">
              Estadísticas generales de progreso académico en la plataforma
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-detective-orange">
              {overview.avg_progress_percent.toFixed(0)}%
            </p>
            <p className="text-sm text-detective-text-secondary">Progreso General</p>
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
};
