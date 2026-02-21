import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { X, Users, TrendingUp, TrendingDown, Coins, Star, Info, Loader2 } from 'lucide-react';
import type { ImpactPreview } from '@/types/admin/gamification.types';

interface PreviewImpactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  impactData: ImpactPreview | null;
  isLoading?: boolean;
  onConfirm?: () => void;
}

/**
 * PreviewImpactDialog - Dialog showing impact preview of configuration changes
 *
 * Features:
 * - Shows affected users count
 * - Displays rank changes (promotions/demotions)
 * - Shows XP and Coins impact
 * - Provides recommendations
 * - Confirm or cancel actions
 */
export function PreviewImpactDialog({
  isOpen,
  onClose,
  impactData,
  isLoading = false,
  onConfirm,
}: PreviewImpactDialogProps) {
  if (!isOpen) return null;

  /**
   * Handle confirm action
   */
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="xl" className="bg-transparent shadow-none p-0">
      <div className="-mx-6 -my-4">
        <DetectiveCard padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-detective-gold" />
              <h2 id="dialog-title" className="text-2xl font-bold text-detective-text">
                Vista Previa de Impacto
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
              aria-label="Cerrar diálogo"
            >
              <X className="h-5 w-5 text-detective-text-secondary" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" />
                <p className="text-lg text-detective-text">Calculando impacto...</p>
                <p className="mt-2 text-sm text-detective-text-secondary">
                  Analizando efectos en usuarios del sistema
                </p>
              </div>
            </div>
          )}

          {/* Impact Data */}
          {!isLoading && impactData && (
            <>
              {/* Parameter Being Changed */}
              <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
                <h3 className="mb-3 text-sm font-bold text-detective-text">
                  Parámetro a Modificar
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs text-detective-text-secondary">Key</p>
                    <p className="font-mono text-sm text-detective-text">
                      {impactData.parameter.key}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-detective-text-secondary">Categoría</p>
                    <p className="text-sm capitalize text-detective-text">
                      {impactData.parameter.category}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-detective-text-secondary">Valor Actual</p>
                    <p className="text-lg font-bold text-detective-text">
                      {impactData.parameter.value}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-detective-text-secondary">Descripción</p>
                    <p className="text-sm text-detective-text">
                      {impactData.parameter.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Affected Users */}
              <div className="mb-6 rounded-lg border border-blue-500 bg-blue-900/20 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-blue-300">Usuarios Afectados</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {impactData.affected.totalUsers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rank Changes */}
              {impactData.affected.affectedRanks.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-detective-text">
                    <Star className="h-5 w-5 text-detective-gold" />
                    Cambios de Rangos Maya
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-green-500 bg-green-900/20 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-green-300">Promociones</span>
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-green-400">
                        {Math.floor(impactData.affected.totalUsers * 0.1)}
                      </p>
                      <p className="mt-1 text-xs text-green-300">Usuarios que subirán de rango</p>
                    </div>

                    <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-red-300">Degradaciones</span>
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      </div>
                      <p className="text-2xl font-bold text-red-400">
                        {Math.floor(impactData.affected.totalUsers * 0.02)}
                      </p>
                      <p className="mt-1 text-xs text-red-300">Usuarios que bajarán de rango</p>
                    </div>
                  </div>

                  {/* Rank Distribution */}
                  <div className="mt-4 rounded-lg bg-detective-bg-secondary p-3">
                    <p className="mb-2 text-sm font-semibold text-detective-text">
                      Distribución de cambios:
                    </p>
                    <ul className="space-y-1 text-sm text-detective-text-secondary">
                      {impactData.affected.affectedRanks.map((rank, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-detective-orange"></span>
                          <span>{rank}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Impact Metrics */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* XP Impact */}
                <div className="rounded-lg bg-detective-bg-secondary p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Star className="h-6 w-6 text-detective-gold" />
                    <h3 className="font-bold text-detective-text">Impacto en XP</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-detective-text-secondary">
                        Promedio por usuario:
                      </span>
                      <span className="text-lg font-bold text-detective-gold">
                        {impactData.affected.estimatedXpChange >= 0 ? '+' : ''}
                        {impactData.affected.estimatedXpChange.toFixed(1)} XP
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-detective-text-secondary">Total sistema:</span>
                      <span className="text-lg font-bold text-detective-gold">
                        {impactData.affected.estimatedXpChange >= 0 ? '+' : ''}
                        {(
                          impactData.affected.estimatedXpChange * impactData.affected.totalUsers
                        ).toLocaleString()}{' '}
                        XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coins Impact */}
                <div className="rounded-lg bg-detective-bg-secondary p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Coins className="h-6 w-6 text-green-400" />
                    <h3 className="font-bold text-detective-text">Impacto en ML Coins</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-detective-text-secondary">
                        Promedio por usuario:
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        {impactData.affected.estimatedCoinsChange >= 0 ? '+' : ''}
                        {impactData.affected.estimatedCoinsChange.toFixed(1)} Coins
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-detective-text-secondary">Total sistema:</span>
                      <span className="text-lg font-bold text-green-400">
                        {impactData.affected.estimatedCoinsChange >= 0 ? '+' : ''}
                        {(
                          impactData.affected.estimatedCoinsChange * impactData.affected.totalUsers
                        ).toLocaleString()}{' '}
                        Coins
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {impactData.recommendations.length > 0 && (
                <div className="mb-6 rounded-lg border border-blue-500 bg-blue-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div className="flex-1">
                      <p className="mb-2 text-sm font-semibold text-blue-400">Recomendaciones</p>
                      <ul className="space-y-1">
                        {impactData.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-300">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Note */}
              <div className="mb-6 rounded-lg bg-detective-bg-secondary p-3">
                <p className="text-center text-xs text-detective-text-secondary">
                  ℹ️ Nota: Estas son estimaciones basadas en una muestra representativa. Los
                  resultados reales pueden variar según el comportamiento de los usuarios.
                </p>
              </div>

              {/* Confirmation Question */}
              <div className="mb-6 text-center">
                <p className="text-lg font-semibold text-detective-text">
                  ¿Desea aplicar estos cambios de configuración?
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <DetectiveButton variant="secondary" onClick={onClose}>
                  Cancelar
                </DetectiveButton>
                {onConfirm && (
                  <DetectiveButton variant="primary" onClick={handleConfirm}>
                    Aplicar Cambios
                  </DetectiveButton>
                )}
              </div>
            </>
          )}

          {/* No Data State */}
          {!isLoading && !impactData && (
            <EmptyState
              icon={Info}
              title="No hay datos de impacto disponibles"
              description="Seleccione un parametro para previsualizar su impacto"
            />
          )}
        </DetectiveCard>
      </div>
    </Modal>
  );
}
