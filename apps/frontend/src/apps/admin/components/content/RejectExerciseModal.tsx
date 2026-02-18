import { useState, useCallback } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import type { PendingExercise } from '../../types';

interface RejectExerciseModalProps {
  isOpen: boolean;
  exercise: PendingExercise | null;
  onClose: () => void;
  onReject: (exerciseId: string, reason: string) => Promise<void>;
}

export function RejectExerciseModal({
  isOpen,
  exercise,
  onClose,
  onReject,
}: RejectExerciseModalProps) {
  const [rejectReason, setRejectReason] = useState('');

  const handleClose = useCallback(() => {
    onClose();
    setRejectReason('');
  }, [onClose]);

  useModalBehavior(isOpen, handleClose);

  const handleReject = useCallback(async () => {
    if (!exercise) return;
    try {
      await onReject(exercise.id, rejectReason);
      handleClose();
    } catch (err) {
      console.error('Failed to reject exercise:', err);
    }
  }, [exercise, rejectReason, onReject, handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rechazar Ejercicio"
    >
      <div className="space-y-4">
        <p className="text-detective-text">
          ¿Por que estas rechazando &quot;{exercise?.title}&quot;?
        </p>
        <FormField
          label="Razon de Rechazo"
          name="reason"
          type="textarea"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Explica por que se rechaza este ejercicio..."
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <DetectiveButton
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </DetectiveButton>
          <DetectiveButton
            variant="primary"
            onClick={handleReject}
            disabled={!rejectReason}
          >
            Rechazar Ejercicio
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
}
