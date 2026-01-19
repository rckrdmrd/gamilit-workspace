import React, { useState, useCallback } from 'react';
import { X, Save, Send, User, BookOpen, Calendar, FileText, Image as ImageIcon, Video, Music, Award, Coins, TrendingUp, CheckCircle } from 'lucide-react';
import { ManualReview, RubricEvaluation, ReviewRewards, manualReviewApi } from '@/shared/api/manualReviewApi';
import { RubricEvaluator } from '@/shared/components/mechanics/RubricEvaluator';
import { ExerciseContentRenderer } from '@/shared/components/mechanics/ExerciseContentRenderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
export const ReviewDetail: React.FC<ReviewDetailProps> = ({ review, onClose }) => {
  const [evaluations, setEvaluations] = useState<RubricEvaluation[]>(review.evaluations || []);
  const [generalFeedback, setGeneralFeedback] = useState(review.generalFeedback || '');
  const [_totalScore, setTotalScore] = useState(review.totalScore || 0);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // FIX GAP-CRIT-001: Estado para mostrar recompensas asignadas
  const [assignedRewards, setAssignedRewards] = useState<ReviewRewards | null>(null);

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
   * Complete and submit review
   * FIX GAP-CRIT-001: Now captures and displays rewards assigned to student
   * TASK-2026-01-18-010: Guardar evaluación ANTES de completar (backend no acepta body en complete)
   */
  const handleCompleteReview = async () => {
    if (!isValid) {
      setError('Por favor completa todos los criterios de la rúbrica antes de calificar');
      return;
    }

    if (!window.confirm(
      `¿Confirmas la calificación de ${_totalScore}/100 puntos?\n\n` +
      'El estudiante será notificado y recibirá las recompensas correspondientes (XP y ML Coins).'
    )) {
      return;
    }

    try {
      setCompleting(true);
      setError(null);
      setSuccess(null);

      // TASK-2026-01-18-010: PASO 1 - Guardar evaluación primero
      // El endpoint /complete no acepta body, así que debemos guardar antes
      const { rubricScores, detailedFeedback } = transformEvaluationsToBackend(evaluations);

      await manualReviewApi.updateReview(review.id, {
        rubricScores,
        totalScore: _totalScore,
        generalFeedback,
        detailedFeedback: Object.keys(detailedFeedback).length > 0 ? detailedFeedback : undefined,
        status: 'in_progress', // Se marcará como 'completed' en el siguiente paso
      });

      // TASK-2026-01-18-010: PASO 2 - Completar review y distribuir recompensas
      // Este endpoint marca como completed, califica submission y distribuye gamificación
      const response = await manualReviewApi.completeReview(review.id);

      // Mostrar recompensas asignadas al estudiante
      if (response.rewards) {
        setAssignedRewards(response.rewards);
        setSuccess(`¡Calificación completada! (${_totalScore}/100)\nRecompensas asignadas al estudiante.`);
      } else {
        setSuccess(`Calificación completada: ${_totalScore}/100 puntos`);
      }

      // Cerrar después de mostrar los rewards por más tiempo
      setTimeout(() => {
        onClose();
      }, response.rewards ? 5000 : 2500);
    } catch (err) {
      console.error('Error completing review:', err);
      setError(err instanceof Error ? err.message : 'Error al completar la calificación');
    } finally {
      setCompleting(false);
    }
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

      {success && (
        <div className="rounded-detective bg-green-50 border border-green-200 p-4">
          <p className="text-green-800">{success}</p>

          {/* FIX GAP-CRIT-001: Mostrar recompensas asignadas al estudiante */}
          {assignedRewards && (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
              <h4 className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
                <Award className="h-5 w-5 text-amber-600" />
                Recompensas asignadas al estudiante
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">XP Ganado</p>
                    <p className="text-lg font-bold text-blue-700">+{assignedRewards.xp_earned}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                  <Coins className="h-6 w-6 text-amber-600" />
                  <div>
                    <p className="text-xs text-gray-500">ML Coins</p>
                    <p className="text-lg font-bold text-amber-700">+{assignedRewards.ml_coins_earned}</p>
                  </div>
                </div>
              </div>

              {/* Promoción de rango */}
              {assignedRewards.rankUp && (
                <div className="mt-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">
                        ¡Ascenso de rango!
                      </p>
                      <p className="text-xs text-purple-700">
                        {assignedRewards.rankUp.previousRank} → {assignedRewards.rankUp.newRank}
                        {assignedRewards.rankUp.bonusMLCoins > 0 && (
                          <span className="ml-2 text-amber-600">
                            (+{assignedRewards.rankUp.bonusMLCoins} ML Coins bonus)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
          rubric={review.rubric}
          initialEvaluations={review.evaluations}
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
          <button
            onClick={handleCompleteReview}
            disabled={!isValid || completing}
            className="flex items-center gap-2 rounded-detective bg-gradient-to-r from-green-600 to-green-700 px-6 py-2 text-white hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            title={!isValid ? 'Completa todos los criterios de la rúbrica primero' : 'Calificar y enviar al estudiante'}
          >
            <CheckCircle className="h-4 w-4" />
            {completing ? 'Calificando...' : 'Calificar Respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
