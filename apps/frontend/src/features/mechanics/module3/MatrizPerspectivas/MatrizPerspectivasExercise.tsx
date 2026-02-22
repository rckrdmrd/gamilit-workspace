import { useState, useEffect, type MutableRefObject } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Eye } from 'lucide-react';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';
import { fetchMatrixExercise } from './matrizPerspectivasAPI';
import type {
  MatrixExercise,
  PerspectiveGeneration,
  FeedbackData,
} from './matrizPerspectivasTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { matrizAnswersSchema } from './matrizPerspectivasSchemas';

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: Record<string, unknown>) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

interface ExerciseState {
  perspectives: PerspectiveGeneration[];
  currentScore: number;
}

export const MatrizPerspectivasExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
}: ExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exerciseId);

  const [exercise, setExercise] = useState<MatrixExercise | null>(null);
  const [perspectives, setPerspectives] = useState<PerspectiveGeneration[]>(
    initialData?.perspectives || [],
  );
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Analysis questions answers
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
  });

  useEffect(() => {
    loadExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save progress every 30 seconds with visual feedback

  useEffect(() => {
    const interval = setInterval(async () => {
      setSaveStatus('saving');
      try {
        saveProgress();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (_error) {
        setSaveStatus('error');
      }
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perspectives, currentScore, answers]);

  // Update progress - Granular calculation with answers

  useEffect(() => {
    if (!exercise) return;

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    // Progreso granular basado en múltiples factores
    const answeredQuestions = Object.values(answers).filter((a) => a.trim().length >= 50).length;
    // Steps: 1=exercise loaded, 2=perspectives loaded, 3-5=questions answered
    const currentStep = 1 + (perspectives.length > 0 ? 1 : 0) + answeredQuestions;
    const totalSteps = 5; // loaded + perspectives + 3 questions

    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep,
          totalSteps,
          score: 0,
          hintsUsed: 0,
          timeSpent: elapsed,
        },
        answers: { questions: answers },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, perspectives, answers, onProgressUpdate]);

  const loadExercise = async () => {
    try {
      const data = await fetchMatrixExercise(exerciseId);
      setExercise(data);
      // Load perspectives from mock data (no AI generation)
      const { mockPerspectives } = await import('./matrizPerspectivasMockData');
      setPerspectives(mockPerspectives);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      perspectives,
      currentScore,
    };
    saveProgressUtil(exerciseId, state);
  };

  const handleComplete = async () => {
    // Validar con Zod
    const validation = matrizAnswersSchema.safeParse({ questions: answers });

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join('. ');
      setFeedback({
        type: 'error',
        title: 'Respuestas Incompletas',
        message: errorMsg,
      });
      setShowFeedback(true);
      return;
    }

    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'Debes estar autenticado para enviar el ejercicio.',
      });
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitAsync({
        questions: answers,
      } as unknown as Record<string, unknown>);

      // ✅ FIX M3-M5 2026-01-07: Verificar si está pendiente de revisión manual
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        const pendingFeedback: FeedbackData = {
          type: 'info',
          title: 'Enviado para Revisión',
          message: response.message || MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        };
        setFeedback(pendingFeedback);
        setShowFeedback(true);
        await syncAndInvalidate();

        return;
      }

      // Flujo normal cuando ya está evaluado (ejercicios auto-evaluables)
      // Extraer rewards de la respuesta
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      const finalFeedback: FeedbackData = {
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Análisis Completo Excelente!'
          : response.score >= 70
            ? '¡Buen Análisis de Perspectivas!'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has completado el análisis de ${perspectives.length} perspectivas con una calificación de ${response.score} puntos.`,
        score: response.score,
        showConfetti: response.isPerfect,
        // Agregar rewards
        xpEarned: rewards.xp || 0,
        mlCoinsEarned: rewards.mlCoins || 0,
      };

      setFeedback(finalFeedback);
      setCurrentScore(response.score);
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu análisis. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPerspectives([]);
    setCurrentScore(0);
    setAnswers({ q1: '', q2: '', q3: '' });
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

  if (loading || !exercise) {
    return (
      <div className="from-detective-orange-50 to-detective-blue-50 flex h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-detective-lg text-detective-text-secondary">Cargando ejercicio...</div>
      </div>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title="Matriz de Perspectivas"
        description={exercise.description}
        icon={<Grid3x3 className="h-6 w-6" />}
        gradientClassName="from-detective-blue to-detective-orange"
        headerActions={
          <div className="text-sm">
            {saveStatus === 'saving' && <span className="text-white/90">Guardando...</span>}
            {saveStatus === 'saved' && <span className="text-green-200">✓ Guardado</span>}
            {saveStatus === 'error' && <span className="text-red-200">Error al guardar</span>}
          </div>
        }
        headerChildren={
          <p className="mt-2 text-detective-base opacity-90 font-medium text-blue-50">{exercise.topic}</p>
        }
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Topic Description */}
          <div className="text-center">
            <p className="text-detective-base text-detective-text-secondary">
              Analiza las siguientes perspectivas sobre el tema: <strong>{exercise.topic}</strong>
            </p>
          </div>

          {/* Perspectives Grid */}
          {perspectives.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
                {perspectives.map((persp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <div className="hover:shadow-detective-md rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6 transition-shadow">
                      <div className="mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-detective-orange" />
                        <h3 className="text-detective-lg font-semibold text-detective-blue">
                          {persp.perspective}
                        </h3>
                      </div>

                      {/* Viewpoint */}
                      <div className="mb-4 rounded-lg bg-blue-50 p-3">
                        <p className="text-detective-sm font-medium text-blue-900">
                          {persp.viewpoint}
                        </p>
                      </div>

                      {/* Arguments */}
                      <div className="mb-4">
                        <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                          Argumentos
                        </h4>
                        <ul className="space-y-1">
                          {persp.arguments.map((arg: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-detective-xs">
                              <span className="text-detective-success">+</span>
                              <span>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Counter-arguments */}
                      <div className="mb-4">
                        <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                          Contraargumentos
                        </h4>
                        <ul className="space-y-1">
                          {persp.counterarguments.map((counter: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-detective-xs">
                              <span className="text-detective-danger">−</span>
                              <span>{counter}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Biases */}
                      {persp.biases && persp.biases.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                            Sesgos Posibles
                          </h4>
                          <ul className="space-y-1">
                            {persp.biases.map((bias: string, i: number) => (
                              <li key={i} className="text-detective-xs text-yellow-800">
                                ⚠ {bias}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contextual Factors */}
                      {persp.contextualFactors && persp.contextualFactors.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                            Factores Contextuales
                          </h4>
                          <ul className="space-y-1">
                            {persp.contextualFactors.map((factor: string, i: number) => (
                              <li key={i} className="text-detective-xs text-detective-text-secondary">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Analysis Questions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-detective-lg border-2 border-detective-blue bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6"
              >
                <h2 className="mb-4 flex items-center gap-2 text-detective-2xl font-bold text-detective-blue">
                  <Grid3x3 className="h-6 w-6" />
                  Preguntas de Análisis
                </h2>
                <p className="mb-6 text-detective-base text-detective-text-secondary">
                  Responde las siguientes preguntas basándote en las perspectivas generadas (mínimo
                  50 caracteres por respuesta):
                </p>

                <div className="space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      1. ¿Qué perspectiva fue más injusta con Marie?
                    </label>
                    <textarea
                      value={answers.q1}
                      onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                      placeholder="Analiza y explica cuál perspectiva consideras más injusta y por qué..."
                      className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q1.trim().length >= 50 ? 'text-detective-success' : 'text-detective-danger'}`}
                      >
                        {answers.q1.trim().length < 50
                          ? `Faltan ${50 - answers.q1.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-detective-text-secondary">{answers.q1.length}/500</p>
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      2. ¿Cómo ha evolucionado la percepción de Marie con el tiempo?
                    </label>
                    <textarea
                      value={answers.q2}
                      onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                      placeholder="Describe cómo ha cambiado la forma en que se ve a Marie Curie..."
                      className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q2.trim().length >= 50 ? 'text-detective-success' : 'text-detective-danger'}`}
                      >
                        {answers.q2.trim().length < 50
                          ? `Faltan ${50 - answers.q2.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-detective-text-secondary">{answers.q2.length}/500</p>
                    </div>
                  </div>

                  {/* Question 3 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      3. ¿Qué grupo tuvo la perspectiva más equilibrada?
                    </label>
                    <textarea
                      value={answers.q3}
                      onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
                      placeholder="Identifica cuál grupo presentó la visión más balanceada y fundamenta tu respuesta..."
                      className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q3.trim().length >= 50 ? 'text-detective-success' : 'text-detective-danger'}`}
                      >
                        {answers.q3.trim().length < 50
                          ? `Faltan ${50 - answers.q3.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-detective-text-secondary">{answers.q3.length}/500</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset} disabled={isSubmitting}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={
                perspectives.length === 0 ||
                isSubmitting ||
                !Object.values(answers).every((a) => a.trim().length >= 50)
              }
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
            if (feedback.type === 'success') {
              onComplete?.(feedback.score || currentScore, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default MatrizPerspectivasExercise;
