/**
 * ResolveAlertModal Component
 *
 * Modal for resolving an alert with required resolution note (minimum 10 characters).
 *
 * @component
 */

import React, { useState } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { SystemAlert } from '@/services/api/adminTypes';

interface ResolveAlertModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}

export const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNoteValid = note.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNoteValid) {
      setError('La nota de resolución debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(note.trim());
      setNote('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al resolver la alerta');
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
      title="Resolver Alerta"
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

            {/* Resolution Note Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
                Nota de Resolucion <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError(null);
                }}
                placeholder="Describe como se resolvio la alerta (minimo 10 caracteres)..."
                rows={5}
                className={`w-full resize-none rounded-lg border bg-detective-bg px-4 py-2 text-detective-text placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-detective-orange'
                }`}
                disabled={isSubmitting}
                required
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-detective-text-secondary">
                  Minimo 10 caracteres requeridos
                </p>
                <p
                  className={`text-xs font-medium ${
                    isNoteValid ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {note.trim().length}/10
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="rounded-lg border border-green-500/50 bg-green-500/20 p-3 text-sm text-green-400">
              Al resolver esta alerta, cambiaras su estado a "Resuelto", indicando que el problema
              ha sido solucionado. Esta accion quedara registrada en el sistema.
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
              <DetectiveButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </DetectiveButton>
              <DetectiveButton
                variant="primary"
                type="submit"
                disabled={isSubmitting || !isNoteValid}
              >
                {isSubmitting ? 'Resolviendo...' : 'Resolver Alerta'}
              </DetectiveButton>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ResolveAlertModal;
