import { useState, useCallback, useEffect } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ExerciseContentRenderer } from '@shared/components/mechanics/ExerciseContentRenderer';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getExercise } from '@/services/api/educationalAPI';
import type { PendingExercise } from '../../types';
import type { Exercise } from '@shared/types/educational.types';

interface ContentPreviewModalProps {
  isOpen: boolean;
  exercise: PendingExercise | null;
  onClose: () => void;
  onApprove: (exerciseId: string) => void;
  onReject: () => void;
}

export function ContentPreviewModal({
  isOpen,
  exercise,
  onClose,
  onApprove,
  onReject,
}: ContentPreviewModalProps) {
  const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchExerciseDetails = useCallback(async (exerciseId: string) => {
    setLoadingDetails(true);
    setDetailsError(null);
    setExerciseDetails(null);
    try {
      const details = await getExercise(exerciseId);
      setExerciseDetails(details);
    } catch (err) {
      console.error('Failed to fetch exercise details:', err);
      setDetailsError(
        err instanceof Error ? err.message : 'Error al cargar detalles del ejercicio',
      );
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && exercise) {
      fetchExerciseDetails(exercise.id);
    }
    if (!isOpen) {
      setExerciseDetails(null);
      setDetailsError(null);
    }
  }, [isOpen, exercise, fetchExerciseDetails]);

  const handleClose = useCallback(() => {
    onClose();
    setExerciseDetails(null);
    setDetailsError(null);
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Vista Previa - ${exercise?.title}`}
    >
      {exercise && (
        <div className="space-y-4">
          <div className="rounded-lg bg-detective-bg-secondary p-4">
            <p className="mb-2 text-sm text-gray-400">Tipo de Ejercicio</p>
            <p className="font-medium text-detective-text">{exercise.type}</p>
          </div>
          <div className="rounded-lg bg-detective-bg-secondary p-4">
            <p className="mb-2 text-sm text-gray-400">Autor</p>
            <p className="text-detective-text">{exercise.authorName}</p>
          </div>
          {exerciseDetails?.description && (
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-gray-400">Descripcion</p>
              <p className="text-detective-text">{exerciseDetails.description}</p>
            </div>
          )}
          <div className="rounded-lg bg-detective-bg-secondary p-4">
            <p className="mb-2 text-sm text-gray-400">Contenido del Ejercicio</p>
            {loadingDetails ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-detective-orange" />
                <span className="text-detective-text-secondary">Cargando vista previa...</span>
              </div>
            ) : detailsError ? (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{detailsError}</span>
              </div>
            ) : exerciseDetails?.content ? (
              <ExerciseContentRenderer
                exerciseType={exerciseDetails.type}
                answerData={exerciseDetails.content as Record<string, unknown>}
                correctAnswer={exerciseDetails.rubric}
                showComparison={false}
              />
            ) : (
              <div className="flex items-center gap-2 text-detective-text-secondary">
                <AlertCircle className="h-4 w-4" />
                <span>Vista previa no disponible - contenido no encontrado</span>
              </div>
            )}
          </div>
          {exerciseDetails?.instructions && (
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-gray-400">Instrucciones</p>
              <p className="text-detective-text text-sm">{exerciseDetails.instructions}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <DetectiveButton
              variant="primary"
              onClick={() => {
                onApprove(exercise.id);
                handleClose();
              }}
              disabled={loadingDetails}
            >
              <CheckCircle className="h-5 w-5" />
              Aprobar
            </DetectiveButton>
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setExerciseDetails(null);
                setDetailsError(null);
                onReject();
              }}
              disabled={loadingDetails}
            >
              <XCircle className="h-5 w-5" />
              Rechazar
            </DetectiveButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
