import { useState, useEffect, type MutableRefObject } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Trophy,
} from 'lucide-react';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { fetchSources } from './analisisFuentesAPI';
import type { Source, AnalisisFuentesAnswers } from './analisisFuentesTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

interface AdaptedAnalisisFuentesData {
  sources?: Source[];
  description?: string;
}

interface ExerciseProps {
  exerciseId: string;
  exercise?: AdaptedAnalisisFuentesData;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: Record<string, unknown>) => void;
  initialData?: ExerciseState;
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

interface ExerciseState {
  currentScore: number;
}

export const AnalisisFuentesExercise = ({
  exerciseId,
  exercise: adaptedExercise,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
}: ExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exerciseId);

  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRanking, setCurrentRanking] = useState<string[]>([]);
  const [justification, setJustification] = useState('');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    // Use adapted data from exercise prop if available
    if (adaptedExercise?.sources && adaptedExercise.sources.length > 0) {
      setSources(adaptedExercise.sources);
      setCurrentRanking(adaptedExercise.sources.map((s: Source) => s.id));
      setLoading(false);
    } else {
      loadSources();
    }
  }, [exerciseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScore]);

  // FE-055 & FE-059: Update progress with user answers
  useEffect(() => {
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    if (onProgressUpdate) {
      const totalSteps = sources.length;
      const completedTasks = currentRanking.length > 0 ? 1 : 0;

      onProgressUpdate({
        progress: {
          currentStep: completedTasks,
          totalSteps,
          score: 0,
          hintsUsed: 0,
          timeSpent: elapsed,
        },
        answers: { ranking: currentRanking, justification },
      });
    }
  }, [sources.length, onProgressUpdate, startTime, currentRanking, justification]);

  const loadSources = async () => {
    try {
      const data = await fetchSources(exerciseId);
      setSources(data);
      // Initialize ranking with all source IDs in default order
      setCurrentRanking(data.map((s: { id: string }) => s.id));
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      currentScore,
    };
    // Save using shared utility
    saveProgressUtil(exerciseId, state);
  };

  const moveSourceUp = (sourceId: string) => {
    const index = currentRanking.indexOf(sourceId);
    if (index > 0) {
      const newRanking = [...currentRanking];
      [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
      setCurrentRanking(newRanking);
    }
  };

  const moveSourceDown = (sourceId: string) => {
    const index = currentRanking.indexOf(sourceId);
    if (index < currentRanking.length - 1) {
      const newRanking = [...currentRanking];
      [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
      setCurrentRanking(newRanking);
    }
  };

  const handleComplete = async () => {
    // Validate user is authenticated
    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'Debes estar autenticado para enviar el ejercicio.',
      });
      setShowFeedback(true);
      return;
    }

    // Validate ranking is complete
    if (currentRanking.length !== sources.length) {
      setFeedback({
        type: 'error',
        title: 'Ranking Incompleto',
        message: 'Debes ordenar todas las fuentes antes de enviar.',
      });
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // CORR-010 FIX v4 2026-01-07: Sanitize ranking IDs before sending
      // Ensure all source IDs in ranking are valid (non-empty strings)
      const sanitizedRanking = currentRanking.map((sourceId, idx) => {
        if (!sourceId || sourceId.trim() === '') {
          const fallbackId = `src-${idx + 1}`;
          return fallbackId;
        }
        return sourceId;
      });

      // Validate after sanitization
      const invalidIds = sanitizedRanking.filter((id) => !id || id.trim() === '');
      if (invalidIds.length > 0) {
        setFeedback({
          type: 'error',
          title: 'Error de Validación',
          message: 'Algunos IDs de fuentes son inválidos. Intenta reiniciar el ejercicio.',
        });
        setShowFeedback(true);
        setIsSubmitting(false);
        return;
      }

      const answers: AnalisisFuentesAnswers = {
        ranking: sanitizedRanking,
        justification: justification.trim(),
      };

      const response = await submitAsync(answers as unknown as Record<string, unknown>);

      // CORR-AF-001 2026-01-07: Manejar ejercicios con revisión manual
      // Este ejercicio tiene requires_manual_grading=TRUE en BD
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Análisis Enviado',
          message:
            MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        // FIX M3-M5 2026-01-08: Invalidar cache para actualizar barra de progreso
        await syncAndInvalidate();
        onComplete?.(0, timeSpent);
        return;
      }

      // Extraer rewards de la respuesta (solo si no requiere revisión manual)
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      // Create feedback based on response
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Excelente Análisis!'
          : response.score >= 70
            ? '¡Buen Trabajo!'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has obtenido ${response.score} puntos en el ranking de fuentes.`,
        score: response.score,
        showConfetti: response.isPerfect,
        // Agregar rewards
        xpEarned: rewards.xp || 0,
        mlCoinsEarned: rewards.mlCoins || 0,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (_error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentScore(0);
    setCurrentRanking(sources.map((s) => s.id));
    setJustification('');
    setShowFeedback(false);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  if (loading) {
    return (
      <div className="from-detective-orange-50 to-detective-blue-50 flex h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-detective-lg text-detective-text-secondary">Cargando fuentes...</div>
      </div>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title="Análisis de Fuentes"
        description={adaptedExercise?.description || 'Evalúa la credibilidad de las fuentes presentadas'}
        icon={<FileSearch className="h-8 w-8" />}
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Available Sources */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6">
            <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
              Fuentes Disponibles
            </h3>
            <div className="space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="shadow-detective-sm rounded-lg border-2 border-transparent bg-white p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-detective-base font-semibold">{source.title}</h4>
                    <ExternalLink className="h-4 w-4 text-detective-orange" />
                  </div>
                  <p className="mb-2 text-detective-xs text-detective-text-secondary">
                    {source.url}
                  </p>
                  <p className="text-detective-sm text-detective-text">{source.excerpt}</p>
                  <span className="mt-2 inline-block rounded bg-detective-bg px-2 py-1 text-detective-xs">
                    {source.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Justification Section */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6">
            <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
              Justificación del Ranking
            </h3>
            <p className="mb-4 text-detective-sm text-detective-text-secondary">
              Explica por qué ordenaste las fuentes de esta manera. ¿Qué criterios usaste para determinar la credibilidad de cada fuente? (mínimo 100 caracteres)
            </p>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ordené las fuentes de esta manera porque..."
              className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
              rows={5}
              maxLength={1000}
            />
            <div className="mt-1 flex justify-between">
              <p className={`text-detective-sm ${justification.trim().length >= 100 ? 'text-detective-success' : 'text-detective-danger'}`}>
                {justification.trim().length < 100
                  ? `Faltan ${100 - justification.trim().length} caracteres`
                  : '✓ Completo'}
              </p>
              <p className="text-detective-sm text-detective-text-secondary">{justification.length}/1000</p>
            </div>
          </div>

          {/* Ranking Section */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-detective-gold" />
              <h3 className="text-detective-lg font-semibold text-detective-blue">
                Ordena las Fuentes por Credibilidad
              </h3>
            </div>
            <p className="mb-4 text-detective-sm text-detective-text-secondary">
              Ordena las fuentes de más creíble (arriba) a menos creíble (abajo). Este ranking se
              enviará al completar el ejercicio.
            </p>
            <div className="space-y-3">
              {currentRanking.map((sourceId, index) => {
                const source = sources.find((s) => s.id === sourceId);
                if (!source) return null;
                return (
                  <motion.div
                    key={sourceId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-lg border border-detective-border bg-detective-bg p-4"
                  >
                    <div className="flex min-w-[60px] sm:min-w-[80px] items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-detective-orange">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-detective-base font-semibold">{source.title}</h4>
                      <p className="text-detective-xs text-detective-text-secondary">
                        {source.url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveSourceUp(sourceId)}
                        disabled={index === 0}
                        className="hover:bg-detective-blue-dark rounded-lg bg-detective-blue p-2 text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover arriba (más creíble)"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveSourceDown(sourceId)}
                        disabled={index === currentRanking.length - 1}
                        className="rounded-lg bg-detective-orange p-2 text-white transition-all hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover abajo (menos creíble)"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={isSubmitting || justification.trim().length < 100}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
            </DetectiveButton>
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' || (feedback.score && feedback.score >= 70)) {
              onComplete?.(feedback.score || 0, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default AnalisisFuentesExercise;
