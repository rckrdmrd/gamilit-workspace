/**
 * EconomyTab - Renders the ML Coins economy configuration panel
 *
 * Displays summary stat cards (total, active, coins-category parameters),
 * a list of editable economy parameters, and action buttons for bulk
 * update and restore defaults.
 *
 * @module apps/admin/components/gamification/EconomyTab
 */

import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Settings, Target, Coins, RotateCcw, Edit } from 'lucide-react';
import type { GamificationParameter } from '@/types/admin/gamification.types';

interface EconomyTabProps {
  parameters: GamificationParameter[];
  stats: {
    totalParameters: number;
    activeParameters: number;
  } | null;
  onEditParameter: (param: GamificationParameter) => void;
  onBulkUpdate: () => void;
  onPreviewImpact: () => void;
  onRestoreDefaults: () => void;
  isLoading: boolean;
}

export function EconomyTab({
  parameters,
  stats,
  onEditParameter,
  onBulkUpdate,
  onRestoreDefaults,
  isLoading,
}: EconomyTabProps) {
  const coinsCount = parameters.filter((p) => p.category === 'coins').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Settings className="mx-auto mb-2 h-12 w-12 text-detective-gold" />
            <p className="mb-1 text-sm text-detective-text-secondary">Parametros Totales</p>
            <p className="text-3xl font-bold text-detective-gold">
              {stats?.totalParameters || 0}
            </p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Target className="mx-auto mb-2 h-12 w-12 text-blue-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Parametros Activos</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.activeParameters || 0}
            </p>
          </div>
        </DetectiveCard>
        <DetectiveCard hoverable={false}>
          <div className="text-center">
            <Coins className="mx-auto mb-2 h-12 w-12 text-green-400" />
            <p className="mb-1 text-sm text-detective-text-secondary">Categoria Coins</p>
            <p className="text-3xl font-bold text-green-400">{coinsCount}</p>
          </div>
        </DetectiveCard>
      </div>

      {/* Parameter List */}
      <DetectiveCard>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Parametros de Economia</h2>
        {parameters.length > 0 ? (
          <div className="space-y-3">
            {parameters
              .filter((param) => param.category === 'coins' || param.category === 'bonuses')
              .map((param) => (
                <div
                  key={param.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-detective-bg-secondary p-3 transition-colors hover:bg-detective-bg-secondary/80"
                  onClick={() => onEditParameter(param)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-detective-text">{param.key}</p>
                    {param.description && (
                      <p className="text-xs text-detective-text-secondary">
                        {param.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-detective-gold">
                        {param.value ?? 'N/A'}
                        {param.dataType === 'percentage' ? '%' : ''}
                      </p>
                      {param.defaultValue !== undefined && param.defaultValue !== null && (
                        <p className="text-xs text-detective-text-secondary">
                          Default: {param.defaultValue}
                        </p>
                      )}
                    </div>
                    <Edit className="h-4 w-4 text-detective-orange" />
                  </div>
                </div>
              ))}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <DetectiveButton
                variant="primary"
                onClick={onBulkUpdate}
                className="flex-1"
              >
                <Settings className="mr-2 inline h-4 w-4" />
                Actualizacion Masiva
              </DetectiveButton>
              <DetectiveButton
                variant="outline"
                onClick={onRestoreDefaults}
                className="flex-1"
              >
                <RotateCcw className="mr-2 inline h-4 w-4" />
                Restaurar Defaults
              </DetectiveButton>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-detective-text-secondary">
            <p className="text-lg">No hay parametros de economia configurados</p>
            <p className="mt-2 text-sm">
              {isLoading
                ? 'Cargando...'
                : 'Los parametros de economia apareceran aqui cuando esten disponibles'}
            </p>
          </div>
        )}
      </DetectiveCard>
    </div>
  );
}
