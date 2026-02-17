/**
 * ResolveAlertModal Component
 *
 * Modal for resolving an alert with required resolution note (minimum 10 characters).
 *
 * @component
 */

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
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

  if (!isOpen || !alert) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-detective-bg-secondary">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-detective-text">Resolver Alerta</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 transition-colors hover:bg-detective-bg disabled:opacity-50"
          >
            <X className="h-6 w-6 text-detective-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            {/* Alert Title */}
            <div className="rounded-lg border border-gray-700 bg-detective-bg p-4">
              <p className="mb-1 text-sm text-detective-text-secondary">Alerta:</p>
              <p className="font-semibold text-detective-text">{alert.title}</p>
            </div>

            {/* Resolution Note Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text-secondary">
                Nota de Resolución <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError(null);
                }}
                placeholder="Describe cómo se resolvió la alerta (mínimo 10 caracteres)..."
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
                  Mínimo 10 caracteres requeridos
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
              Al resolver esta alerta, cambiarás su estado a "Resuelto", indicando que el problema
              ha sido solucionado. Esta acción quedará registrada en el sistema.
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-700 p-6">
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
        </form>
      </div>
    </div>
  );
};

export default ResolveAlertModal;
