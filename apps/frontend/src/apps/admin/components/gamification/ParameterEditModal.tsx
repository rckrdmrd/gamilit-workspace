import { useState, useEffect } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import type { Parameter } from '@/services/api/schemas/adminSchemas';

interface ParameterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: Parameter | null;
  onSuccess?: () => void;
  onUpdate: (key: string, value: number, reason?: string) => Promise<void>;
  onReset: (key: string) => Promise<void>;
}

/**
 * ParameterEditModal - Modal for editing individual gamification parameters
 *
 * Features:
 * - Input validation based on parameter dataType, minValue, maxValue
 * - Shows current vs new value comparison
 * - Reset to default functionality
 * - Disabled save button if no changes
 */
export function ParameterEditModal({
  isOpen,
  onClose,
  parameter,
  onSuccess,
  onUpdate,
  onReset,
}: ParameterEditModalProps) {
  const [newValue, setNewValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Initialize new value when parameter changes
  useEffect(() => {
    if (parameter) {
      setNewValue(parameter.value.toString());
      setReason('');
      setErrors([]);
    }
  }, [parameter]);

  if (!isOpen || !parameter) return null;

  // Parse new value as number
  const parsedValue = parseFloat(newValue);
  const hasChanges = !isNaN(parsedValue) && parsedValue !== parameter.value;

  /**
   * Validate input value
   */
  const validate = (): boolean => {
    const validationErrors: string[] = [];

    // Check if value is a valid number
    if (isNaN(parsedValue)) {
      validationErrors.push('El valor debe ser un número válido');
      setErrors(validationErrors);
      return false;
    }

    // Validate min/max range
    if (parameter.minValue !== null && parsedValue < parameter.minValue) {
      validationErrors.push(`El valor debe ser mayor o igual a ${parameter.minValue}`);
    }

    if (parameter.maxValue !== null && parsedValue > parameter.maxValue) {
      validationErrors.push(`El valor debe ser menor o igual a ${parameter.maxValue}`);
    }

    // Validate integer type
    if (parameter.dataType === 'integer' && !Number.isInteger(parsedValue)) {
      validationErrors.push('El valor debe ser un número entero');
    }

    // Validate percentage (0-100)
    if (parameter.dataType === 'percentage' && (parsedValue < 0 || parsedValue > 100)) {
      validationErrors.push('El porcentaje debe estar entre 0 y 100');
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
      await onUpdate(parameter.key, parsedValue, reason || undefined);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating parameter:', error);
      setErrors(['Error al actualizar el parámetro. Por favor, intente nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Execute the reset after confirmation
   */
  const executeReset = async () => {
    setIsSubmitting(true);
    try {
      await onReset(parameter.key);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error resetting parameter:', error);
      setErrors(['Error al restaurar el parámetro. Por favor, intente nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle reset to default - shows confirmation dialog
   */
  const handleReset = () => {
    setPendingAction(() => executeReset);
    setShowConfirm(true);
  };

  /**
   * Get input suffix based on data type
   */
  const getInputSuffix = () => {
    switch (parameter.dataType) {
      case 'percentage':
        return '%';
      default:
        return '';
    }
  };

  /**
   * Get formatted range text
   */
  const getRangeText = () => {
    const parts: string[] = [];
    if (parameter.minValue !== null) {
      parts.push(`Min: ${parameter.minValue}`);
    }
    if (parameter.maxValue !== null) {
      parts.push(`Max: ${parameter.maxValue}`);
    }
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg" className="bg-transparent shadow-none p-0">
      <div className="-mx-6 -my-4">
        <DetectiveCard padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 id="modal-title" className="text-2xl font-bold text-detective-text">
              Editar Parámetro
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5 text-detective-text-secondary" />
            </button>
          </div>

          {/* Parameter Info */}
          <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Key</p>
                <p className="font-mono text-sm text-detective-text">{parameter.key}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-detective-text-secondary">Categoría</p>
                <p className="text-sm capitalize text-detective-text">{parameter.category}</p>
              </div>
            </div>
            {parameter.description && (
              <div className="mt-3">
                <p className="mb-1 text-sm text-detective-text-secondary">Descripción</p>
                <p className="text-sm text-detective-text">{parameter.description}</p>
              </div>
            )}
          </div>

          {/* Current Value */}
          <div className="mb-4">
            <p className="mb-2 text-sm text-detective-text-secondary">Valor Actual</p>
            <div className="rounded-lg bg-detective-bg p-3">
              <p className="text-2xl font-bold text-detective-gold">
                {parameter.value}
                {getInputSuffix()}
              </p>
            </div>
          </div>

          {/* New Value Input */}
          <div className="mb-4">
            <label htmlFor="new-value" className="mb-2 block text-sm text-detective-text-secondary">
              Nuevo Valor
            </label>
            <div className="flex items-center gap-2">
              <input
                id="new-value"
                type="number"
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  setErrors([]);
                }}
                step={parameter.dataType === 'integer' ? '1' : '0.01'}
                className="border-detective-border flex-1 rounded-lg border-2 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                aria-describedby="range-hint error-messages"
              />
              {getInputSuffix() && (
                <span className="text-detective-text-secondary">{getInputSuffix()}</span>
              )}
            </div>
            {getRangeText() && (
              <p id="range-hint" className="mt-1 text-xs text-detective-text-secondary">
                {getRangeText()}
              </p>
            )}
          </div>

          {/* Default Value */}
          <div className="mb-4">
            <p className="text-sm text-detective-text-secondary">
              Valor por Defecto:{' '}
              <span className="font-bold text-detective-text">{parameter.defaultValue}</span>
            </p>
          </div>

          {/* Reason (Optional) */}
          <div className="mb-6">
            <label htmlFor="reason" className="mb-2 block text-sm text-detective-text-secondary">
              Motivo del cambio (opcional)
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Ajuste basado en análisis de métricas"
              className="border-detective-border w-full rounded-lg border-2 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div
              id="error-messages"
              className="mb-4 rounded-lg border border-red-500 bg-red-900/20 p-3"
            >
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
          <div className="flex items-center justify-between gap-4">
            <DetectiveButton
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Restaurar Default
            </DetectiveButton>

            <div className="flex items-center gap-2">
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
        title="Restaurar valor por defecto"
        message="¿Está seguro de restaurar este parámetro a su valor por defecto?"
        confirmText="Restaurar"
        variant="warning"
      />
    </Modal>
  );
}
