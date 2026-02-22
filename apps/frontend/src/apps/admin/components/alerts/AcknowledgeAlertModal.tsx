/**
 * AcknowledgeAlertModal Component
 *
 * Modal for acknowledging an alert with optional note.
 *
 * @component
 */

import { useState, type FormEvent } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { SystemAlert } from '@/services/api/adminTypes';

interface AcknowledgeAlertModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => Promise<void>;
}

export const AcknowledgeAlertModal = ({
  alert,
  isOpen,
  onClose,
  onConfirm,
}: AcknowledgeAlertModalProps) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(note.trim() || undefined);
      setNote('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al reconocer la alerta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNote('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen && !!alert}
      onClose={handleClose}
      title="Reconocer Alerta"
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      {alert && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Alert Title */}
            <div className="rounded-lg border border-gray-700 bg-detective-bg p-4">
              <p className="mb-1 text-sm text-detective-text-secondary">Alerta:</p>
              <p className="font-semibold text-detective-text">{alert.title}</p>
            </div>

            {/* Note Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
                Nota (Opcional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Agrega una nota sobre el reconocimiento de esta alerta..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-600 bg-detective-bg px-4 py-2 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-detective-orange"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-detective-text-secondary">
                La nota es opcional pero recomendada para documentar el progreso.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg border border-blue-500/50 bg-blue-500/20 p-3 text-sm text-blue-400">
              Al reconocer esta alerta, cambiaras su estado a "Reconocido", indicando que estas al
              tanto y trabajando en ella.
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
              <DetectiveButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </DetectiveButton>
              <DetectiveButton variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Reconociendo...' : 'Reconocer Alerta'}
              </DetectiveButton>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AcknowledgeAlertModal;
