/**
 * StatsTab - Renders the gamification statistics overview
 *
 * Displays four metric cards (total parameters, active parameters,
 * total ranks, active ranks) and a category breakdown grid showing
 * parameter counts per category.
 *
 * @module apps/admin/components/gamification/StatsTab
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Settings, Award, Star, TrendingUp } from 'lucide-react';
import type { GamificationStats, GamificationParameter } from '@/types/admin/gamification.types';

const PARAMETER_CATEGORIES = ['points', 'coins', 'levels', 'ranks', 'penalties', 'bonuses'] as const;

interface StatsTabProps {
  stats: GamificationStats | null;
  parameters: GamificationParameter[];
  isLoading: boolean;
}

export function StatsTab({ stats, parameters, isLoading }: StatsTabProps) {
  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Settings className="mx-auto mb-2 h-12 w-12 text-orange-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Total Parametros</p>
            <p className="text-2xl font-bold text-orange-400">
              {stats?.totalParameters || 0}
            </p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Award className="mx-auto mb-2 h-12 w-12 text-purple-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Parametros Activos</p>
            <p className="text-2xl font-bold text-purple-400">
              {stats?.activeParameters || 0}
            </p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Star className="mx-auto mb-2 h-12 w-12 text-blue-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Total Rangos Maya</p>
            <p className="text-2xl font-bold text-blue-400">{stats?.totalRanks || 0}</p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <TrendingUp className="mx-auto mb-2 h-12 w-12 text-green-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Rangos Activos</p>
            <p className="text-2xl font-bold text-green-400">{stats?.activeRanks || 0}</p>
          </div>
        </DetectiveCard>
      </div>

      {/* Category Breakdown */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">
          Parametros por Categoria
        </h2>
        {parameters.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {PARAMETER_CATEGORIES.map((category) => {
              const count = parameters.filter((p) => p.category === category).length;
              return (
                <div
                  key={category}
                  className="rounded-lg bg-detective-bg-secondary p-4 text-center"
                >
                  <p className="mb-1 text-sm capitalize text-detective-text-secondary">
                    {category}
                  </p>
                  <p className="text-2xl font-bold text-detective-text">{count}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-detective-text-secondary">
            <p className="text-lg">No hay datos de parametros disponibles</p>
            <p className="mt-2 text-sm">
              {isLoading
                ? 'Cargando...'
                : 'Los datos apareceran aqui cuando esten disponibles'}
            </p>
          </div>
        )}
      </DetectiveCard>
    </div>
  );
}
