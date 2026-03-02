/**
 * SuspendStudentModal Component
 *
 * Modal for blocking/suspending a student from a classroom.
 * Allows teachers to specify block type (full/partial) and reason.
 *
 * @module SuspendStudentModal
 * @since US-PM-006
 */

import { useState } from 'react';
import { X, AlertTriangle, Ban, ShieldOff } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { StudentMonitoring } from '../../types';
import { useStudentBlocking, BlockType, BlockStudentDto } from '../../hooks/useStudentBlocking';

// ============================================================================
// TYPES
// ============================================================================

interface SuspendStudentModalProps {
  /** Student to suspend */
  student: StudentMonitoring;
  /** Classroom ID */
  classroomId: string;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when student is successfully blocked */
  onSuccess?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal for suspending/blocking a student
 *
 * Features:
 * - Student info display
 * - Block type selection (full/partial)
 * - Required reason field
 * - Loading state during operation
 * - Success callback for list refresh
 *
 * @example
 * ```tsx
 * <SuspendStudentModal
 *   student={selectedStudent}
 *   classroomId="classroom-123"
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => refreshStudents()}
 * />
 * ```
 */
export function SuspendStudentModal({
  student,
  classroomId,
  onClose,
  onSuccess,
}: SuspendStudentModalProps) {
  const [blockType, setBlockType] = useState<BlockType>(BlockType.FULL);
  const [reason, setReason] = useState('');
  const { blockStudent, loading } = useStudentBlocking();

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    const data: BlockStudentDto = {
      reason: reason.trim(),
      block_type: blockType,
    };

    try {
      await blockStudent(classroomId, student.id, data);
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the hook with toast
    }
  };

  const isValid = reason.trim().length > 0;

  return (
    <Modal isOpen={true} onClose={onClose} showCloseButton={false} size="sm" className="border-2 border-detective-orange bg-detective-bg p-0">
      <div className="-mx-6 -my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-detective-orange p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/20 p-2">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-detective-text">Suspender Estudiante</h2>
              <p className="text-sm text-detective-text-secondary">{student.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 transition-colors hover:bg-detective-bg-secondary disabled:opacity-50"
          >
            <X className="h-5 w-5 text-detective-text" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
            <p className="text-sm text-yellow-200">
              Esta accion restringira el acceso del estudiante al aula. Asegurate de que es la
              decision correcta.
            </p>
          </div>

          {/* Student Info */}
          <div className="rounded-lg bg-detective-bg-secondary p-3">
            <p className="text-sm text-detective-text-secondary">Estudiante</p>
            <p className="font-medium text-detective-text">{student.full_name}</p>
            <p className="text-sm text-detective-text-secondary">{student.email}</p>
          </div>

          {/* Block Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-detective-text">
              Tipo de Suspension
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBlockType(BlockType.FULL)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  blockType === BlockType.FULL
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-gray-700 bg-detective-bg-secondary text-detective-text-secondary hover:border-gray-600'
                } disabled:opacity-50`}
              >
                <Ban className="h-4 w-4" />
                <span className="text-sm font-medium">Completo</span>
              </button>
              <button
                type="button"
                onClick={() => setBlockType(BlockType.PARTIAL)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  blockType === BlockType.PARTIAL
                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                    : 'border-gray-700 bg-detective-bg-secondary text-detective-text-secondary hover:border-gray-600'
                } disabled:opacity-50`}
              >
                <ShieldOff className="h-4 w-4" />
                <span className="text-sm font-medium">Parcial</span>
              </button>
            </div>
            <p className="text-xs text-detective-text-secondary">
              {blockType === BlockType.FULL
                ? 'El estudiante perdera acceso completo al aula.'
                : 'El estudiante tendra acceso limitado a modulos especificos.'}
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-detective-text">
              Razon de la Suspension <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo de la suspension..."
              disabled={loading}
              className="w-full resize-none rounded-lg border border-gray-700 bg-detective-bg px-4 py-2 text-detective-text placeholder-gray-500 focus:border-detective-orange focus:outline-none disabled:opacity-50"
              rows={3}
            />
            <p className="text-xs text-detective-text-secondary">
              Este motivo sera registrado y podra ser consultado posteriormente.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-700 p-4">
          <DetectiveButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </DetectiveButton>
          <DetectiveButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Suspendiendo...' : 'Suspender Estudiante'}
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
}
