/**
 * RanksTab - Renders the Maya Ranks configuration grid
 *
 * Displays sorted rank cards with color-coded labels, XP ranges,
 * and multiplier metadata. Clicking a rank opens the edit modal.
 *
 * @module apps/admin/components/gamification/RanksTab
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Star, Settings, Edit } from 'lucide-react';
import type { MayaRankConfig } from '@/services/api/schemas/adminSchemas';

interface RanksTabProps {
  ranks: MayaRankConfig[];
  onEditRank: (rank: MayaRankConfig) => void;
  isLoading: boolean;
}

export function RanksTab({ ranks, onEditRank, isLoading }: RanksTabProps) {
  return (
    <div className="space-y-4">
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-detective-text">
            Rangos Maya ({ranks.length})
          </h2>
          <DetectiveButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (ranks.length > 0) {
                onEditRank(ranks[0]);
              }
            }}
          >
            <Settings className="h-4 w-4" />
            Configurar
          </DetectiveButton>
        </div>

        <div className="space-y-3">
          {ranks.length > 0 ? (
            ranks
              .sort((a, b) => a.level - b.level)
              .map((rank) => (
                <div
                  key={rank.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-detective-bg-secondary p-4 transition-colors hover:bg-detective-bg-secondary/80"
                  onClick={() => onEditRank(rank)}
                >
                  <div className="flex items-center gap-4">
                    <Star className="h-8 w-8" style={{ color: rank.color || '#6B7280' }} />
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: rank.color || '#6B7280' }}
                      >
                        {rank.name}
                      </h3>
                      <p className="text-sm text-detective-text-secondary">
                        {(rank.minXp ?? 0).toLocaleString()} -{' '}
                        {rank.maxXp ? rank.maxXp.toLocaleString() : '\u221E'} XP
                      </p>
                      <p className="mt-1 text-xs text-detective-text-secondary">
                        Nivel {rank.level ?? 0} • Mult. XP: {rank.multiplierXp ?? 1}x •
                        Mult. Coins: {rank.multiplierMlCoins ?? 1}x
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {rank.isActive ? (
                        <span className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-400">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded bg-gray-900/30 px-2 py-1 text-xs text-gray-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <Edit className="h-4 w-4 text-detective-orange" />
                  </div>
                </div>
              ))
          ) : (
            <div className="py-8 text-center text-detective-text-secondary">
              <p className="text-lg">No hay rangos Maya configurados</p>
              <p className="mt-2 text-sm">
                {isLoading ? 'Cargando...' : 'Contacta al administrador del sistema'}
              </p>
            </div>
          )}
        </div>
      </DetectiveCard>
    </div>
  );
}
