import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Save, User, BookOpen, Calendar, FileText, Image as ImageIcon, Video, Music, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { ManualReview, RubricEvaluation, ReviewRewards, manualReviewApi } from '@/shared/api/manualReviewApi';
import { RubricEvaluator } from '@/shared/components/mechanics/RubricEvaluator';
import { ExerciseContentRenderer } from '@/shared/components/mechanics/ExerciseContentRenderer';
// FIX TASK-2026-01-18-012: Usar FeedbackModal en lugar de alert/inline messages
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { manualReviewKeys } from '../../hooks/useManualReviews';

/**
 * TASK-2026-01-18-010: Helper para transformar evaluaciones frontend a formato backend
 * Frontend: RubricEvaluation[] = [{ criterionId, score, feedback }]
 * Backend: rubricScores = { criterionId: score }, detailedFeedback = { criterionId: feedback }
 */
const transformEvaluationsToBackend = (evaluations: RubricEvaluation[]) => {
  const rubricScores: Record<string, number> = {};
  const detailedFeedback: Record<string, string> = {};

  evaluations.forEach((evaluation) => {
    rubricScores[evaluation.criterionId] = evaluation.score;
    if (evaluation.feedback) {
      detailedFeedback[evaluation.criterionId] = evaluation.feedback;
    }
  });

  return { rubricScores, detailedFeedback };
};

/**
 * ReviewDetail Props
 */
export interface ReviewDetailProps {
  review: ManualReview;
  onClose: () => void;
}

/**
 * ReviewDetail Component
 *
 * Detailed view for reviewing a student submission.
 * Allows teachers to:
 * - View submission content and media
 * - Evaluate using rubric
 * - Save progress
 * - Complete and submit review
 */
export const ReviewDetail = ({ review, onClose }: ReviewDetailProps) => {
  const [evaluations, setEvaluations] = useState<RubricEvaluation[]>(review.evaluations || []);
  const [generalFeedback, setGeneralFeedback] = useState(review.generalFeedback || '');
  const [_totalScore, setTotalScore] = useState(review.totalScore || 0);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // FIX TASK-2026-01-18-012: Reemplazar success inline con FeedbackModal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  // FIX GAP-CRIT-001: Estado para mostrar recompensas asignadas (usado en FeedbackModal)
  const [_assignedRewards, setAssignedRewards] = useState<ReviewRewards | null>(null);
  // Estado para mensaje de guardado de borrador
  const [success, setSuccess] = useState<string | null>(null);
  // FIX BUG-CACHE-INVALIDATION: Query client para invalidar cache después de completar
  const queryClient = useQueryClient();

  /**
   * Handle evaluation changes
   * FIX TASK-2026-01-18-008: Memoize callback to prevent infinite re-render loop
   */
  const handleEvaluationChange = useCallback((
    newEvaluations: RubricEvaluation[],
    newGeneralFeedback: string,
    newTotalScore: number
  ) => {
    setEvaluations(newEvaluations);
    setGeneralFeedback(newGeneralFeedback);
    setTotalScore(newTotalScore);
  }, []);

  /**
   * Handle validation changes
   * FIX TASK-2026-01-18-008: Memoize callback to prevent infinite re-render loop
   */
  const handleValidationChange = useCallback((valid: boolean, errors: string[]) => {
    setIsValid(valid);
    setValidationErrors(errors);
  }, []);

  /**
   * Save progress (partial review)
   * TASK-2026-01-18-010: Transformar evaluaciones al formato esperado por backend
   */
  const handleSaveProgress = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Transformar evaluaciones al formato backend
      const { rubricScores, detailedFeedback } = transformEvaluationsToBackend(evaluations);

      await manualReviewApi.updateReview(review.id, {
        rubricScores,
        totalScore: _totalScore,
        generalFeedback,
        detailedFeedback: Object.keys(detailedFeedback).length > 0 ? detailedFeedback : undefined,
        status: 'in_progress',
      });

      setSuccess('Evaluación guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving progress:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar evaluación');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Iniciar proceso de completar review - mostrar confirmacion
   * FIX TASK-2026-01-18-012: Usar modal en lugar de window.confirm()
   */
  const handleRequestComplete = () => {
    if (!isValid) {
      setError('Por favor completa todos los criterios de la rúbrica antes de calificar');
      return;
    }
    // Mostrar modal de confirmacion
    setShowConfirmModal(true);
  };

  /**
   * Complete and submit review
   * FIX GAP-CRIT-001: Now captures and displays rewards assigned to student
   * TASK-2026-01-18-010: Guardar evaluación ANTES de completar (backend no acepta body en complete)
   * FIX TASK-2026-01-18-012: Usar FeedbackModal para mostrar resultado
   * FIX TASK-2026-01-18-014: Mejorado manejo de errores y validaciones
   */
  const handleCompleteReview = async () => {
    // Capturar valores ANTES de cerrar el modal para evitar problemas de estado
    const currentEvaluations = [...evaluations];
    const currentTotalScore = _totalScore;
    const currentGeneralFeedback = generalFeedback;

    setShowConfirmModal(false);

    try {
      setCompleting(true);
      setError(null);

      // TASK-2026-01-18-010: PASO 1 - Guardar evaluación primero
      // El endpoint /complete no acepta body, así que debemos guardar antes
      const { rubricScores, detailedFeedback } = transformEvaluationsToBackend(currentEvaluations);

      // FIX TASK-2026-01-18-014: Validación más robusta de datos
      if (!currentEvaluations || currentEvaluations.length === 0) {
        setError('Error: No hay evaluaciones. Por favor evalúa todos los criterios de la rúbrica.');
        setCompleting(false);
        return;
      }

      if (Object.keys(rubricScores).length === 0) {
        setError('Error: No hay puntuaciones de rúbrica para guardar. Por favor evalúa todos los criterios.');
        setCompleting(false);
        return;
      }

      // FIX TASK-2026-01-18-014: Verificar que al menos un criterio tiene score > 0
      const hasAnyScore = currentEvaluations.some(e => e.score > 0);
      if (!hasAnyScore) {
        setError('Error: Todos los criterios tienen puntuación 0. Por favor asigna al menos un puntaje.');
        setCompleting(false);
        return;
      }

      // FIX TASK-FASE1-003: Validar totalScore antes de enviar - no usar fallback silencioso a 0
      if (currentTotalScore === undefined || currentTotalScore === null) {
        setError('Error: La puntuación total no se calculó correctamente. Por favor, evalúa todos los criterios de la rúbrica.');
        setCompleting(false);
        return;
      }

      // Validar que el score sea un número válido entre 0 y 100
      if (typeof currentTotalScore !== 'number' || isNaN(currentTotalScore) || currentTotalScore < 0 || currentTotalScore > 100) {
        setError(`Error: La puntuación total (${currentTotalScore}) no es válida. Debe ser un número entre 0 y 100.`);
        setCompleting(false);
        return;
      }

      const scoreToSend = currentTotalScore;

      try {
        const updateResult = await manualReviewApi.updateReview(review.id, {
          rubricScores,
          totalScore: scoreToSend,
          generalFeedback: currentGeneralFeedback,
          detailedFeedback: Object.keys(detailedFeedback).length > 0 ? detailedFeedback : undefined,
        });

        // FIX TASK-2026-01-18-014: Verificar que el update fue exitoso
        if (!updateResult || !updateResult.id) {
          throw new Error('La respuesta del servidor no contiene los datos esperados');
        }
      } catch (updateError) {
        console.error('[ReviewDetail] updateReview FAILED:', updateError);
        const errorMessage = updateError instanceof Error
          ? updateError.message
          : (typeof updateError === 'object' && updateError !== null && 'response' in updateError)
            ? JSON.stringify((updateError as { response?: { data?: unknown } }).response?.data)
            : 'Error desconocido al guardar';
        setError(`Error al guardar la evaluación: ${errorMessage}`);
        setCompleting(false);
        return;
      }

      // TASK-2026-01-18-010: PASO 2 - Completar review y distribuir recompensas
      // Este endpoint marca como completed, califica submission y distribuye gamificación
      let response;
      try {
        response = await manualReviewApi.completeReview(review.id);

        // FIX BUG-CACHE-INVALIDATION: Invalidar cache de reviews para que la lista se actualice
        // Sin esto, la lista muestra datos cacheados y el review no aparece en "Completadas"
        queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
      } catch (completeError) {
        console.error('[ReviewDetail] completeReview FAILED:', completeError);
        const errorMessage = completeError instanceof Error
          ? completeError.message
          : (typeof completeError === 'object' && completeError !== null && 'response' in completeError)
            ? JSON.stringify((completeError as { response?: { data?: unknown } }).response?.data)
            : 'Error desconocido al completar';
        setError(`Error al completar la calificación: ${errorMessage}`);
        setCompleting(false);
        return;
      }

      // FIX TASK-2026-01-18-012: Mostrar resultado en FeedbackModal
      setAssignedRewards(response.rewards);
      setFeedbackData({
        type: 'success',
        title: 'Revisión Completada',
        message: `Has calificado el ejercicio de ${review.student?.name || 'el estudiante'} con ${scoreToSend}/100 puntos.`,
        score: scoreToSend,
        xpEarned: response.rewards?.xp_earned || 0,
        mlCoinsEarned: response.rewards?.ml_coins_earned || 0,
        showConfetti: true,
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('[ReviewDetail] Unexpected error in handleCompleteReview:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado al completar la calificación');
    } finally {
      setCompleting(false);
    }
  };

  /**
   * Cerrar modal de exito y volver a lista
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  /**
   * Get media icon
   */
  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  /**
   * Format date
   */
  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-detective bg-white p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {review.exercise?.title || 'Revisión de Ejercicio'}
            </h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{review.student?.name || 'Estudiante'}</span>
                {/* FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Fallback para email */}
                {review.student?.email && (
                  <span className="text-gray-400">({review.student.email})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>Módulo: {review.exercise?.moduleId || 'N/A'}</span>
              </div>
              {/* FIX BUG-TEACHER-REVIEWS-002 2026-01-08: Usar fecha de envío del submission */}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Enviado: {formatDate(review.submission?.submitted_at || review.submission?.submittedAt || review.createdAt)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-detective bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Mensaje de exito para guardado de borrador (inline) */}
      {success && (
        <div className="rounded-detective bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Submission Content */}
      <div className="rounded-detective bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Contenido del Envío</h3>

        {/* Submission Answers */}
        {/* FIX TASK-2026-01-18-008: Support both answers and answer_data field names */}
        <div className="mb-6 rounded-detective bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-700">Respuestas del Estudiante</h4>
          <ExerciseContentRenderer
            exerciseType={review.exercise?.type || review.exercise?.exercise_type || 'unknown'}
            answerData={((review.submission as Record<string, unknown>)?.answers || (review.submission as Record<string, unknown>)?.answer_data || {}) as Record<string, unknown>}
          />
        </div>

        {/* Media Attachments */}
        {review.mediaAttachments && review.mediaAttachments.length > 0 && (
          <div>
            <h4 className="mb-3 font-medium text-gray-700">Archivos Adjuntos</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {review.mediaAttachments.map((media) => (
                <div
                  key={media.id}
                  className="rounded-detective border border-gray-200 p-3"
                >
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    {getMediaIcon(media.mimeType)}
                    <span className="truncate text-sm font-medium">{media.filename}</span>
                  </div>

                  {/* Preview */}
                  {media.mimeType.startsWith('image/') && (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="mb-2 h-32 w-full rounded object-cover"
                    />
                  )}
                  {media.mimeType.startsWith('video/') && (
                    <video
                      src={media.url}
                      controls
                      className="mb-2 h-32 w-full rounded"
                    />
                  )}
                  {media.mimeType.startsWith('audio/') && (
                    <audio src={media.url} controls className="mb-2 w-full" />
                  )}

                  {/* Download Link */}
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-detective-orange hover:underline"
                  >
                    Ver/Descargar
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rubric Evaluation */}
      <div className="rounded-detective bg-white p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Evaluación</h3>

        <RubricEvaluator
          rubric={review.rubric ?? []}
          initialEvaluations={review.evaluations ?? []}
          generalFeedback={review.generalFeedback}
          onChange={handleEvaluationChange}
          onValidation={handleValidationChange}
        />
      </div>

      {/* Validation Errors */}
      {!isValid && validationErrors.length > 0 && (
        <div className="rounded-detective bg-yellow-50 border border-yellow-200 p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">
            Completa los siguientes campos:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between rounded-detective bg-white p-6 shadow-card">
        <button
          onClick={onClose}
          className="rounded-detective border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          {/* Mostrar puntaje actual */}
          {_totalScore > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-800">
              <span className="text-sm font-medium">Puntaje:</span>
              <span className="text-lg font-bold">{_totalScore}/100</span>
            </div>
          )}

          {/* TASK-2026-01-18-010: Botón para guardar borrador de evaluación */}
          <button
            onClick={handleSaveProgress}
            disabled={saving || evaluations.length === 0}
            className="flex items-center gap-2 rounded-detective border border-detective-orange bg-white px-6 py-2 text-detective-orange hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Guardar evaluación como borrador para continuar después"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>

          {/* TASK-2026-01-18-010: Botón principal para calificar y enviar */}
          {/* FIX TASK-2026-01-18-012: Usar handleRequestComplete para mostrar confirmacion modal */}
          <button
            onClick={handleRequestComplete}
            disabled={!isValid || completing}
            className="flex items-center gap-2 rounded-detective bg-gradient-to-r from-green-600 to-green-700 px-6 py-2 text-white hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            title={!isValid ? 'Completa todos los criterios de la rúbrica primero' : 'Calificar y enviar al estudiante'}
          >
            <CheckCircle className="h-4 w-4" />
            {completing ? 'Calificando...' : 'Calificar Respuesta'}
          </button>
        </div>
      </div>

      {/* FIX TASK-2026-01-18-012: Modal de Confirmacion */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} showCloseButton={false} size="sm">
        <div className="-mx-6 -my-4 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Calificacion</h3>
          </div>
          <p className="text-gray-600 mb-2">
            Estas a punto de calificar este ejercicio con <strong>{_totalScore}/100 puntos</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            El estudiante sera notificado y recibira las recompensas correspondientes (XP y ML Coins).
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-detective transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCompleteReview}
              disabled={completing}
              className="px-4 py-2 bg-green-600 text-white rounded-detective hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {completing ? 'Calificando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* FIX TASK-2026-01-18-012: FeedbackModal para mostrar exito */}
      {showSuccessModal && feedbackData && (
        <FeedbackModal
          isOpen={showSuccessModal}
          feedback={feedbackData}
          onClose={handleSuccessClose}
          onNext={handleSuccessClose}
        />
      )}
    </div>
  );
};

export default ReviewDetail;
