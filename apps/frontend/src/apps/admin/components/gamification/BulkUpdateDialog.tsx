import { useState, useEffect } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Parameter } from '@/services/api/schemas/adminSchemas';

interface BulkUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: Parameter[];
  onSuccess?: () => void;
  onBulkUpdate: (updates: Array<{ key: string; value: number }>, reason?: string) => Promise<void>;
}

type UpdateType = 'multiplier' | 'fixed';
type Category = 'points' | 'coins' | 'levels' | 'ranks' | 'penalties' | 'bonuses';

/**
 * BulkUpdateDialog - Dialog for bulk updating multiple parameters
 *
 * Features:
 * - Select multiple parameters to update
 * - Apply multiplier or fixed value
 * - Filter by category
 * - Preview changes before applying
 * - Confirmation warning
 */
export function BulkUpdateDialog({
  isOpen,
  onClose,
  parameters,
  onSuccess,
  onBulkUpdate,
}: BulkUpdateDialogProps) {
  const [updateType, setUpdateType] = useState<UpdateType>('multiplier');
  const [category, setCategory] = useState<Category>('points');
  const [multiplier, setMultiplier] = useState<string>('1.2');
  const [fixedValue, setFixedValue] = useState<string>('10');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUpdateType('multiplier');
      setCategory('points');
      setMultiplier('1.2');
      setFixedValue('10');
      setReason('');
      setErrors([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter parameters by category
  const filteredParams = parameters.filter((p) => p.category === category && p.isActive);

  // Calculate new values based on update type
  const getNewValue = (param: Parameter): number => {
    if (updateType === 'multiplier') {
      const mult = parseFloat(multiplier);
      return isNaN(mult) ? param.value : param.value * mult;
    } else {
      const fixed = parseFloat(fixedValue);
      return isNaN(fixed) ? param.value : fixed;
    }
  };

  // Generate preview of changes
  const previewChanges = filteredParams.map((param) => ({
    param,
    oldValue: param.value,
    newValue: getNewValue(param),
  }));

  const affectedCount = filteredParams.length;

  /**
   * Validate inputs
   */
  const validate = (): boolean => {
    const validationErrors: string[] = [];

    if (affectedCount === 0) {
      validationErrors.push('No hay parámetros activos en la categoría seleccionada');
    }

    if (updateType === 'multiplier') {
      const mult = parseFloat(multiplier);
      if (isNaN(mult) || mult <= 0) {
        validationErrors.push('El multiplicador debe ser un número positivo');
      }
    } else {
      const fixed = parseFloat(fixedValue);
      if (isNaN(fixed)) {
        validationErrors.push('El valor fijo debe ser un número válido');
      }
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  /**
   * Execute the bulk update after confirmation
   */
  const executeBulkUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updates = previewChanges.map((change) => ({
        key: change.param.key,
        value: change.newValue,
      }));

      await onBulkUpdate(updates, reason || undefined);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error applying bulk update:', error);
      setErrors(['Error al aplicar actualización masiva. Por favor, intente nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle apply - validates and shows confirmation dialog
   */
  const handleApply = () => {
    if (!validate()) return;

    setPendingAction(() => executeBulkUpdate);
    setShowConfirm(true);
  };

  /**
   * Get percentage change for multiplier
   */
  const getPercentageChange = (): string => {
    const mult = parseFloat(multiplier);
    if (isNaN(mult)) return '0';
    const change = (mult - 1) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="xl" className="bg-transparent shadow-none p-0 max-w-4xl">
      <div className="-mx-6 -my-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DetectiveCard padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 id="dialog-title" className="text-2xl font-bold text-detective-text">
              Actualización Masiva de Parámetros
            </h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
              aria-label="Cerrar diálogo"
            >
              <X className="h-5 w-5 text-detective-text-secondary" />
            </button>
          </div>

          {/* Configuration */}
          <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
            <h3 className="mb-4 text-lg font-bold text-detective-text">
              Configuración de Actualización
            </h3>

            {/* Update Type */}
            <div className="mb-4">
              <p className="mb-2 text-sm text-detective-text-secondary">Tipo de actualización</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="updateType"
                    value="multiplier"
                    checked={updateType === 'multiplier'}
                    onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                    className="h-4 w-4 text-detective-orange"
                  />
                  <span className="text-detective-text">Multiplicador</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="updateType"
                    value="fixed"
                    checked={updateType === 'fixed'}
                    onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                    className="h-4 w-4 text-detective-orange"
                  />
                  <span className="text-detective-text">Valor fijo</span>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label
                htmlFor="category"
                className="mb-2 block text-sm text-detective-text-secondary"
              >
                Categoría a actualizar
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              >
                <option value="points">XP (points)</option>
                <option value="coins">ML Coins (coins)</option>
                <option value="levels">Niveles (levels)</option>
                <option value="ranks">Rangos (ranks)</option>
                <option value="penalties">Penalizaciones (penalties)</option>
                <option value="bonuses">Bonificaciones (bonuses)</option>
              </select>
            </div>

            {/* Value Input */}
            {updateType === 'multiplier' ? (
              <div>
                <label
                  htmlFor="multiplier"
                  className="mb-2 block text-sm text-detective-text-secondary"
                >
                  Multiplicador
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="multiplier"
                    type="number"
                    value={multiplier}
                    onChange={(e) => {
                      setMultiplier(e.target.value);
                      setErrors([]);
                    }}
                    step="0.1"
                    min="0"
                    className="border-detective-border flex-1 rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                  />
                  <span className="text-detective-text-secondary">x</span>
                  <span className="rounded-lg bg-detective-bg px-3 py-2 font-semibold text-detective-gold">
                    {getPercentageChange()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  Ej: 1.2 = aumentar 20%, 0.8 = reducir 20%
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="fixedValue"
                  className="mb-2 block text-sm text-detective-text-secondary"
                >
                  Valor fijo
                </label>
                <input
                  id="fixedValue"
                  type="number"
                  value={fixedValue}
                  onChange={(e) => {
                    setFixedValue(e.target.value);
                    setErrors([]);
                  }}
                  step="1"
                  className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                />
                <p className="mt-1 text-xs text-detective-text-secondary">
                  Se aplicará este valor a todos los parámetros seleccionados
                </p>
              </div>
            )}
          </div>

          {/* Affected Parameters Count */}
          <div className="mb-4 rounded-lg border border-blue-500 bg-blue-900/20 p-3">
            <p className="text-sm text-blue-300">
              Parámetros afectados: <span className="font-bold">{affectedCount}</span>
            </p>
          </div>

          {/* Preview of Changes */}
          <div className="mb-4 max-h-64 overflow-y-auto rounded-lg bg-detective-bg-secondary p-4">
            <h3 className="mb-3 text-sm font-bold text-detective-text">Preview de cambios</h3>
            {previewChanges.length > 0 ? (
              <div className="space-y-2">
                {previewChanges.slice(0, 10).map((change) => (
                  <div
                    key={change.param.id}
                    className="flex items-center justify-between rounded bg-detective-bg p-2"
                  >
                    <span className="flex-1 truncate font-mono text-sm text-detective-text">
                      {change.param.key}
                    </span>
                    <span className="mx-2 text-sm text-detective-text-secondary">→</span>
                    <span className="text-sm text-detective-text">
                      <span className="text-detective-text-secondary">{change.oldValue}</span>
                      {' → '}
                      <span className="font-semibold text-detective-gold">
                        {change.newValue.toFixed(2)}
                      </span>
                    </span>
                  </div>
                ))}
                {previewChanges.length > 10 && (
                  <p className="mt-2 text-center text-xs text-detective-text-secondary">
                    ... y {previewChanges.length - 10} más
                  </p>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-detective-text-secondary">
                No hay parámetros activos en esta categoría
              </p>
            )}
          </div>

          {/* Reason (Optional) */}
          <div className="mb-4">
            <label htmlFor="reason" className="mb-2 block text-sm text-detective-text-secondary">
              Motivo de la actualización (opcional)
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Ajuste general de economía según análisis Q4 2024"
              className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
            />
          </div>

          {/* Warning */}
          <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-900/20 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Advertencia</p>
                <p className="mt-1 text-xs text-yellow-300">
                  Esta acción actualizará {affectedCount} parámetros simultáneamente. Los cambios
                  serán permanentes y afectarán inmediatamente la economía del sistema.
                </p>
              </div>
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
              onClick={handleApply}
              disabled={affectedCount === 0 || isSubmitting || errors.length > 0}
              loading={isSubmitting}
            >
              Aplicar Actualización Masiva
            </DetectiveButton>
          </div>
        </DetectiveCard>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          pendingAction?.();
          setShowConfirm(false);
        }}
        title="Confirmar actualización masiva"
        message={`¿Está seguro de actualizar ${affectedCount} parámetros? Esta acción será permanente.`}
        confirmText="Aplicar"
        variant="warning"
      />
    </Modal>
  );
}
