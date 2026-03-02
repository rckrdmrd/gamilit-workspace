import { useState, useEffect } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { X, AlertTriangle, AlertCircle, Star } from 'lucide-react';
import type { MayaRankConfig } from '@/services/api/schemas/adminSchemas';

interface MayaRankEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: MayaRankConfig | null;
  allRanks: MayaRankConfig[];
  onSuccess?: () => void;
  onUpdate: (id: string, minXp: number, maxXp: number | null) => Promise<void>;
}

/**
 * MayaRankEditModal - Modal for editing Maya rank thresholds
 *
 * Features:
 * - Edit minXp and maxXp thresholds
 * - Validation of ascending order (no overlaps)
 * - Shows previous and next rank for context
 * - Preview of complete hierarchy after change
 * - Warning about affected users
 */
export function MayaRankEditModal({
  isOpen,
  onClose,
  rank,
  allRanks,
  onSuccess,
  onUpdate,
}: MayaRankEditModalProps) {
  const [minXp, setMinXp] = useState<string>('');
  const [maxXp, setMaxXp] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values when rank changes
  useEffect(() => {
    if (rank) {
      setMinXp(rank.minXp.toString());
      setMaxXp(rank.maxXp !== null ? rank.maxXp.toString() : '');
      setErrors([]);
    }
  }, [rank]);

  if (!isOpen || !rank) return null;

  // Sort ranks by level
  const sortedRanks = [...allRanks].sort((a, b) => a.level - b.level);
  const currentIndex = sortedRanks.findIndex((r) => r.id === rank.id);
  const previousRank = currentIndex > 0 ? sortedRanks[currentIndex - 1] : null;
  const nextRank = currentIndex < sortedRanks.length - 1 ? sortedRanks[currentIndex + 1] : null;

  // Parse values
  const parsedMinXp = parseInt(minXp);
  const parsedMaxXp = maxXp.trim() === '' ? null : parseInt(maxXp);

  const hasChanges =
    !isNaN(parsedMinXp) && (parsedMinXp !== rank.minXp || parsedMaxXp !== rank.maxXp);

  /**
   * Validate XP thresholds
   */
  const validate = (): boolean => {
    const validationErrors: string[] = [];

    // Check if minXp is valid
    if (isNaN(parsedMinXp) || parsedMinXp < 0) {
      validationErrors.push('El XP mínimo debe ser un número válido mayor o igual a 0');
    }

    // Check if maxXp is valid (if provided)
    if (maxXp.trim() !== '' && (isNaN(parsedMaxXp!) || parsedMaxXp! < 0)) {
      validationErrors.push('El XP máximo debe ser un número válido mayor o igual a 0');
    }

    // MinXp must be less than maxXp
    if (parsedMaxXp !== null && parsedMinXp >= parsedMaxXp) {
      validationErrors.push('El XP mínimo debe ser menor que el XP máximo');
    }

    // Validate against previous rank (minXp must be > previous maxXp)
    if (previousRank && previousRank.maxXp !== null && parsedMinXp <= previousRank.maxXp) {
      validationErrors.push(
        `El XP mínimo debe ser mayor que el XP máximo del rango anterior (${previousRank.maxXp})`,
      );
    }

    // First rank must start at 0
    if (currentIndex === 0 && parsedMinXp !== 0) {
      validationErrors.push('El primer rango debe comenzar en 0 XP');
    }

    // Validate against next rank (maxXp must be < next minXp)
    if (nextRank && parsedMaxXp !== null && parsedMaxXp >= nextRank.minXp) {
      validationErrors.push(
        `El XP máximo debe ser menor que el XP mínimo del siguiente rango (${nextRank.minXp})`,
      );
    }

    // Last rank should have no maxXp
    if (currentIndex === sortedRanks.length - 1 && parsedMaxXp !== null) {
      validationErrors.push('El último rango no debe tener un XP máximo (debe ser infinito)');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!validate() || !hasChanges) return;

    setIsSubmitting(true);
    try {
      await onUpdate(rank.id, parsedMinXp, parsedMaxXp);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating rank:', error);
      setErrors(['Error al actualizar el rango. Por favor, intente nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Generate preview of hierarchy after change
   */
  const getHierarchyPreview = () => {
    return sortedRanks.map((r) => {
      if (r.id === rank.id) {
        // Show the new values for the current rank
        return {
          ...r,
          minXp: !isNaN(parsedMinXp) ? parsedMinXp : r.minXp,
          maxXp: parsedMaxXp !== undefined ? parsedMaxXp : r.maxXp,
          isEditing: true,
        };
      }
      return { ...r, isEditing: false };
    });
  };

  const hierarchyPreview = getHierarchyPreview();

  /**
   * Format XP range text
   */
  const formatXpRange = (min: number, max: number | null) => {
    return `${min.toLocaleString()} - ${max !== null ? max.toLocaleString() : '∞'} XP`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="xl" className="bg-transparent shadow-none p-0">
      <div className="-mx-6 -my-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DetectiveCard padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6" style={{ color: rank.color }} />
              <h2 id="modal-title" className="text-2xl font-bold text-detective-text">
                Editar Rango Maya: <span style={{ color: rank.color }}>{rank.name}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5 text-detective-text-secondary" />
            </button>
          </div>

          {/* Rank Info */}
          <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Nivel</p>
                <p className="text-lg font-bold text-detective-text">{rank.level}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Mult. XP</p>
                <p className="text-lg font-bold text-detective-text">{rank.multiplierXp}x</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Mult. Coins</p>
                <p className="text-lg font-bold text-detective-text">{rank.multiplierMlCoins}x</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Bonus Coins</p>
                <p className="text-lg font-bold text-detective-text">{rank.bonusMlCoins}</p>
              </div>
            </div>
          </div>

          {/* Context: Previous Rank */}
          {previousRank && (
            <div className="border-detective-border mb-4 rounded-lg border bg-detective-bg p-3">
              <p className="mb-1 text-xs text-detective-text-secondary">⬆ Rango Anterior</p>
              <p className="text-sm font-semibold" style={{ color: previousRank.color }}>
                {previousRank.name} ({formatXpRange(previousRank.minXp, previousRank.maxXp)})
              </p>
            </div>
          )}

          {/* XP Threshold Inputs */}
          <div className="mb-4 rounded-lg bg-detective-bg-secondary p-4">
            <h3 className="mb-4 text-lg font-bold text-detective-text">
              Configuración de Umbrales
            </h3>

            {/* Min XP */}
            <div className="mb-4">
              <label htmlFor="min-xp" className="mb-2 block text-sm text-detective-text-secondary">
                XP Mínimo
              </label>
              <input
                id="min-xp"
                type="number"
                value={minXp}
                onChange={(e) => {
                  setMinXp(e.target.value);
                  setErrors([]);
                }}
                min="0"
                step="1"
                disabled={currentIndex === 0}
                className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-describedby="min-xp-hint"
              />
              <p id="min-xp-hint" className="mt-1 text-xs text-detective-text-secondary">
                {currentIndex === 0
                  ? 'El primer rango siempre empieza en 0'
                  : previousRank
                    ? `Debe ser mayor que ${previousRank.maxXp}`
                    : ''}
              </p>
            </div>

            {/* Max XP */}
            <div>
              <label htmlFor="max-xp" className="mb-2 block text-sm text-detective-text-secondary">
                XP Máximo
              </label>
              <input
                id="max-xp"
                type="number"
                value={maxXp}
                onChange={(e) => {
                  setMaxXp(e.target.value);
                  setErrors([]);
                }}
                min="0"
                step="1"
                placeholder={currentIndex === sortedRanks.length - 1 ? '∞ (sin límite)' : ''}
                disabled={currentIndex === sortedRanks.length - 1}
                className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-describedby="max-xp-hint"
              />
              <p id="max-xp-hint" className="mt-1 text-xs text-detective-text-secondary">
                {currentIndex === sortedRanks.length - 1
                  ? 'El último rango no tiene límite superior'
                  : nextRank
                    ? `Debe ser menor que ${nextRank.minXp}`
                    : ''}
              </p>
            </div>
          </div>

          {/* Context: Next Rank */}
          {nextRank && (
            <div className="border-detective-border mb-4 rounded-lg border bg-detective-bg p-3">
              <p className="mb-1 text-xs text-detective-text-secondary">⬇ Rango Siguiente</p>
              <p className="text-sm font-semibold" style={{ color: nextRank.color }}>
                {nextRank.name} ({formatXpRange(nextRank.minXp, nextRank.maxXp)})
              </p>
            </div>
          )}

          {/* Impact Warning */}
          <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-900/20 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
              <div>
                <p className="mb-1 text-sm font-semibold text-yellow-400">Impacto Estimado</p>
                <p className="text-xs text-yellow-300">
                  Los cambios en los umbrales de rangos pueden afectar la clasificación de usuarios
                  existentes. Los usuarios podrían subir o bajar de rango según los nuevos valores.
                </p>
              </div>
            </div>
          </div>

          {/* Hierarchy Preview */}
          <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
            <h3 className="mb-3 text-sm font-bold text-detective-text">
              Vista Previa de Jerarquía Resultante
            </h3>
            <div className="space-y-2">
              {hierarchyPreview.map((r) => (
                <div
                  key={r.id}
                  className={`rounded p-2 ${
                    r.isEditing
                      ? 'border border-detective-orange bg-detective-orange/20'
                      : 'bg-detective-bg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-detective-text-secondary">{r.level}.</span>
                      <span className="text-sm font-semibold" style={{ color: r.color }}>
                        {r.name}
                      </span>
                    </div>
                    <span className="text-sm text-detective-text-secondary">
                      {formatXpRange(r.minXp, r.maxXp)}
                    </span>
                    {r.isEditing && (
                      <span className="ml-2 text-xs text-detective-orange">⬅ Editando</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-500 bg-red-900/20 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-400">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <DetectiveButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting || errors.length > 0}
              loading={isSubmitting}
            >
              Guardar Cambios
            </DetectiveButton>
          </div>
        </DetectiveCard>
      </div>
    </Modal>
  );
}
