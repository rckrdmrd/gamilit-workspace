import { useState, useEffect } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import toast from 'react-hot-toast';
import { X, AlertTriangle, Users, Settings } from 'lucide-react';
import type { Parameter } from '@/services/api/schemas/adminSchemas';

interface RestoreDefaultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: Parameter[];
  totalUsers?: number;
  onConfirm: () => Promise<void>;
}

/**
 * RestoreDefaultsDialog - Critical confirmation dialog for restoring all defaults
 *
 * Features:
 * - Warning about irreversible action
 * - Shows list of settings to be restored
 * - Requires typing "RESTAURAR" to confirm
 * - Displays total users affected
 */
export function RestoreDefaultsDialog({
  isOpen,
  onClose,
  parameters,
  totalUsers = 0,
  onConfirm,
}: RestoreDefaultsDialogProps) {
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if confirmation text is correct (case-sensitive)
  const isConfirmed = confirmationText === 'RESTAURAR';

  /**
   * Handle restore action
   */
  const handleRestore = async () => {
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error restoring defaults:', error);
      toast.error('Error al restaurar valores por defecto. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get sample parameters to show (first 6)
  const sampleParameters = parameters.slice(0, 6);
  const remainingCount = Math.max(0, parameters.length - 6);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg" className="bg-transparent shadow-none p-0">
      <div className="-mx-6 -my-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DetectiveCard padding="lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 id="dialog-title" className="text-xl sm:text-2xl font-bold text-red-400">
                Restaurar Valores por Defecto
              </h2>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary"
              aria-label="Cerrar diálogo"
            >
              <X className="h-5 w-5 text-detective-text-secondary" />
            </button>
          </div>

          {/* Critical Warning */}
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-900/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="mb-2 text-lg font-bold text-red-400">ADVERTENCIA CRÍTICA</p>
                <div className="space-y-2 text-sm text-red-300">
                  <p>Esta acción NO se puede deshacer.</p>
                  <p>
                    Todos los parámetros de gamificación serán restaurados a sus valores originales
                    del sistema.
                  </p>
                  <p>Se perderán todas las personalizaciones que haya realizado hasta la fecha.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings to be Restored */}
          <div className="mb-6 rounded-lg bg-detective-bg-secondary p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-detective-orange" />
              <h3 className="text-lg font-bold text-detective-text">
                Settings que serán restaurados
              </h3>
            </div>
            <div className="space-y-2">
              {sampleParameters.map((param) => (
                <div
                  key={param.id}
                  className="flex items-center justify-between rounded bg-detective-bg p-2 text-sm"
                >
                  <span className="flex-1 truncate font-mono text-detective-text-secondary">
                    • {param.key}
                  </span>
                  <span className="ml-2 text-detective-text">
                    {param.value} → {param.defaultValue}
                  </span>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="py-2 text-center text-sm text-detective-text-secondary">
                  ... y {remainingCount} parámetros más
                </p>
              )}
            </div>
            <div className="border-detective-border mt-3 border-t pt-3">
              <p className="text-sm text-detective-text">
                Total de parámetros:{' '}
                <span className="font-bold text-detective-orange">{parameters.length}</span>
              </p>
            </div>
          </div>

          {/* Users Impact */}
          <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-900/20 p-4">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 flex-shrink-0 text-yellow-400" />
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-yellow-400">Impacto en Usuarios</p>
                <p className="text-sm text-yellow-300">
                  Usuarios afectados:{' '}
                  <span className="font-bold">TODOS ({totalUsers.toLocaleString()} usuarios)</span>
                </p>
                <p className="mt-1 text-sm text-yellow-300">
                  Rangos que pueden cambiar: <span className="font-bold">TODOS</span>
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6 rounded-lg border-2 border-detective-orange bg-detective-bg-secondary p-4">
            <p className="mb-3 text-sm font-semibold text-detective-text">Confirmación Requerida</p>
            <p className="mb-3 text-sm text-detective-text-secondary">
              Para confirmar esta acción crítica, por favor escriba exactamente:{' '}
              <span className="font-bold text-detective-orange">RESTAURAR</span>
            </p>
            <input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Escriba RESTAURAR"
              className="border-detective-border w-full rounded-lg border-2 bg-detective-bg px-4 py-3 text-center text-lg font-bold text-detective-text focus:border-detective-orange focus:outline-none"
              autoComplete="off"
              aria-describedby="confirmation-hint"
            />
            <p
              id="confirmation-hint"
              className="mt-2 text-center text-xs text-detective-text-secondary"
            >
              Distingue entre mayúsculas y minúsculas
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <DetectiveButton variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="danger"
              onClick={handleRestore}
              disabled={!isConfirmed || isSubmitting}
              loading={isSubmitting}
            >
              {isConfirmed ? '⚠ Restaurar Todo' : 'Restaurar Todo (deshabilitado)'}
            </DetectiveButton>
          </div>

          {/* Additional Warning */}
          {!isConfirmed && (
            <div className="mt-4 text-center">
              <p className="text-xs text-detective-text-secondary">
                El botón de restauración se habilitará cuando escriba "RESTAURAR" correctamente
              </p>
            </div>
          )}
        </DetectiveCard>
      </div>
    </Modal>
  );
}
