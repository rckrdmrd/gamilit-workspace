/**
 * PowerUpModal - Confirmation dialog for activating a power-up.
 *
 * Shows effect details, duration, remaining quantity, and warning.
 *
 * @module apps/student/components/inventory/PowerUpModal
 */

import { Modal } from '@shared/components/common/Modal';
import type { PowerUp } from '@/features/gamification/social/types/powerUpsTypes';

interface PowerUpModalProps {
  powerUp: PowerUp | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isActivating: boolean;
}

export function PowerUpModal({
  powerUp,
  isOpen,
  onClose,
  onConfirm,
  isActivating,
}: PowerUpModalProps) {
  if (!powerUp) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Use Power-up">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg bg-detective-bg p-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-detective-orange to-detective-gold text-3xl">
            {powerUp.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-detective-text">{powerUp.name}</h3>
            <p className="text-sm text-detective-text-secondary">{powerUp.description}</p>
          </div>
        </div>

        {/* Effect Details */}
        <div className="space-y-2 rounded-lg bg-detective-bg p-4">
          <div className="flex items-center justify-between">
            <span className="text-detective-text">Effect:</span>
            <span className="font-bold text-detective-text">
              {powerUp.effect.description}
            </span>
          </div>
          {powerUp.duration && (
            <div className="flex items-center justify-between">
              <span className="text-detective-text">Duration:</span>
              <span className="font-bold text-detective-text">
                {powerUp.duration / 60} hours
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-detective-text">Remaining:</span>
            <span className="font-bold text-detective-text">{powerUp.quantity}x</span>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          This power-up will be activated immediately and cannot be paused or stopped.
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isActivating}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-detective-text transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isActivating}
            className="flex-1 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isActivating ? 'Activating...' : 'Activate'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
