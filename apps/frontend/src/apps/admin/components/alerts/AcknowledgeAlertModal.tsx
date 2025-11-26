/**
 * AcknowledgeAlertModal Component
 *
 * Modal for acknowledging an alert with optional note.
 *
 * @component
 */

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { SystemAlert } from '@/services/api/adminTypes';

interface AcknowledgeAlertModalProps {
  alert: SystemAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => Promise<void>;
}

export const AcknowledgeAlertModal: React.FC<AcknowledgeAlertModalProps> = ({
  alert,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(note.trim() || undefined);
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al reconocer la alerta');
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
            <Check className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-detective-text">Reconocer Alerta</h2>
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
              Al reconocer esta alerta, cambiarás su estado a "Reconocido", indicando que estás al
              tanto y trabajando en ella.
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-700 p-6">
            <DetectiveButton variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Reconociendo...' : 'Reconocer Alerta'}
            </DetectiveButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcknowledgeAlertModal;
