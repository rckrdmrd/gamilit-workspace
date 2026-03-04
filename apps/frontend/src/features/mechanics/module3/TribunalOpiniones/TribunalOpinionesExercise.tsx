import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronRight, ChevronLeft } from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';
import type {
  TribunalOpinionesExerciseProps,
  StatementEvaluation,
  StatementClassification,
  StatementVerdict,
  TribunalOpinionesAnswers,
} from './tribunalOpinionesTypes';
import { CLASSIFICATION_OPTIONS, VERDICT_OPTIONS } from './tribunalOpinionesTypes';

export const TribunalOpinionesExercise = ({
  exercise,
  onComplete,
  onExit,
  onProgressUpdate,
  actionsRef,
}: TribunalOpinionesExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<Map<string, StatementEvaluation>>(new Map());
  const [currentClassification, setCurrentClassification] =
    useState<StatementClassification | null>(null);
  const [currentVerdict, setCurrentVerdict] = useState<StatementVerdict | null>(null);
  const [currentJustification, setCurrentJustification] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);

  const statements = exercise.content?.statements || [];
  const currentStatement = statements[currentIndex];
  const totalStatements = statements.length;

  // Load existing evaluation when navigating
  useEffect(() => {
    if (currentStatement) {
      // CORR-010 FIX: Use fallback ID
      const stmtId = currentStatement.id || `stmt-${currentIndex + 1}`;
      const existing = evaluations.get(stmtId);
      if (existing) {
        setCurrentClassification(existing.classification);
        setCurrentVerdict(existing.verdict);
        setCurrentJustification(existing.justification || '');
      } else {
        setCurrentClassification(null);
        setCurrentVerdict(null);
        setCurrentJustification('');
      }
    }
  }, [currentIndex, currentStatement, evaluations]);

  // Progress updates
  // CORR-010 FIX v4 2026-01-07: Include current evaluation + sanitize all statementIds
  // This ensures ExercisePage.handleSubmit() has all evaluations with valid IDs
  useEffect(() => {
    if (onProgressUpdate) {
      // Get all saved evaluations
      const savedEvaluations = Array.from(evaluations.values());

      // CORR-010 FIX: Include current (unsaved) evaluation if complete
      const allEvaluations = [...savedEvaluations];
      if (currentStatement && currentClassification && currentVerdict) {
        const currentStmtId = currentStatement.id || `stmt-${currentIndex + 1}`;
        // Check if current evaluation is already saved
        const alreadySaved = savedEvaluations.some(ev => ev.statementId === currentStmtId);
        if (!alreadySaved) {
          allEvaluations.push({
            statementId: currentStmtId,
            classification: currentClassification,
            verdict: currentVerdict,
            justification: currentJustification.trim() || undefined,
          });
        }
      }

      // CORR-010 FIX v4: Sanitize - ensure ALL evaluations have valid statementId
      const sanitizedEvaluations = allEvaluations.map((ev, idx) => {
        if (!ev.statementId || ev.statementId.trim() === '') {
          const fallbackId = `stmt-${idx + 1}`;
          return { ...ev, statementId: fallbackId };
        }
        return ev;
      });

      const evaluatedCount = sanitizedEvaluations.length;
      const answers: TribunalOpinionesAnswers = {
        evaluations: sanitizedEvaluations,
      };

      onProgressUpdate({
        progress: {
          currentStep: evaluatedCount,
          totalSteps: totalStatements,
          score: 0,
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers,
      });
    }
  }, [
    evaluations,
    totalStatements,
    hintsUsed,
    onProgressUpdate,
    startTime,
    // CORR-010: Added dependencies for current evaluation
    currentStatement,
    currentClassification,
    currentVerdict,
    currentJustification,
    currentIndex,
  ]);

  // Save current evaluation
  const saveCurrentEvaluation = useCallback(() => {
    if (currentStatement && currentClassification && currentVerdict) {
      // CORR-010 FIX: Use fallback ID if statement.id is missing
      const stmtId = currentStatement.id || `stmt-${currentIndex + 1}`;

      const evaluation: StatementEvaluation = {
        statementId: stmtId,
        classification: currentClassification,
        verdict: currentVerdict,
        justification: currentJustification.trim() || undefined,
      };
      setEvaluations((prev) => new Map(prev).set(stmtId, evaluation));
      return true;
    }
    return false;
  }, [currentStatement, currentClassification, currentVerdict, currentJustification, currentIndex]);

  // Navigation
  const handleNext = useCallback(() => {
    saveCurrentEvaluation();
    if (currentIndex < totalStatements - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalStatements, saveCurrentEvaluation]);

  const handlePrevious = useCallback(() => {
    saveCurrentEvaluation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, saveCurrentEvaluation]);

  // Submit handler
  const handleCheck = useCallback(async () => {
    // Save current evaluation first
    saveCurrentEvaluation();

    // Create updated evaluations map with current evaluation
    const currentEvaluations = new Map(evaluations);
    if (currentStatement && currentClassification && currentVerdict) {
      // CORR-010 FIX: Use fallback ID like saveCurrentEvaluation does
      const stmtId = currentStatement.id || `stmt-${currentIndex + 1}`;
      currentEvaluations.set(stmtId, {
        statementId: stmtId,
        classification: currentClassification,
        verdict: currentVerdict,
        justification: currentJustification.trim() || undefined,
      });
    }

    // Validate all statements are evaluated
    if (currentEvaluations.size < totalStatements) {
      setFeedback({
        type: 'error',
        title: 'Evaluación Incompleta',
        message: `Has evaluado ${currentEvaluations.size} de ${totalStatements} afirmaciones. Por favor evalúa todas antes de enviar.`,
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
      // CORR-010 FIX v4 2026-01-07: Sanitize and validate all evaluations before sending
      const evaluationsArray = Array.from(currentEvaluations.values());

      // Sanitize: Regenerate missing statementIds using index fallback
      const sanitizedEvaluations = evaluationsArray.map((ev, idx) => {
        if (!ev.statementId || ev.statementId.trim() === '') {
          const fallbackId = `stmt-${idx + 1}`;
          return { ...ev, statementId: fallbackId };
        }
        return ev;
      });

      // Final validation after sanitization
      const stillInvalid = sanitizedEvaluations.filter(
        (ev) => !ev.statementId || ev.statementId.trim() === ''
      );

      if (stillInvalid.length > 0) {
        setFeedback({
          type: 'error',
          title: 'Error de Validación',
          message: `${stillInvalid.length} evaluaciones tienen IDs inválidos. Por favor, vuelve a navegar por las afirmaciones.`,
        });
        setShowFeedback(true);
        return;
      }

      const answers: TribunalOpinionesAnswers = {
        evaluations: sanitizedEvaluations,
      };

      const response = await submitAsync(answers as unknown as Record<string, unknown>);

      // ✅ FIX M3-M5 2026-01-07: Verificar si está pendiente de revisión manual
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Enviado para Revisión',
          message: response.message || MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        await syncAndInvalidate();
        return;
      }

      // Flujo normal cuando ya está evaluado (ejercicios auto-evaluables)
      // Extraer rewards de la respuesta
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Excelente Juicio Crítico!'
          : response.score >= 70
            ? '¡Buen Análisis!'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has clasificado correctamente ${response.correctAnswersCount} de ${response.totalQuestions} afirmaciones.`,
        score: response.score,
        showConfetti: response.isPerfect,
        // Agregar rewards
        xpEarned: rewards.xp || 0,
        mlCoinsEarned: rewards.mlCoins || 0,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    evaluations,
    currentStatement,
    currentClassification,
    currentVerdict,
    currentJustification,
    currentIndex, // CORR-010 FIX: Added for fallback ID
    totalStatements,
    user,
    exercise.id,
    saveCurrentEvaluation,
    syncAndInvalidate,
  ]);

  // Reset handler
  const handleReset = useCallback(() => {
    setEvaluations(new Map());
    setCurrentIndex(0);
    setCurrentClassification(null);
    setCurrentVerdict(null);
    setCurrentJustification('');
    setFeedback(null);
    setShowFeedback(false);
  }, []);

  // Expose actions to parent (standard names: handleReset, handleCheck)
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [
    actionsRef,
    evaluations,
    currentIndex,
    startTime,
    hintsUsed,
    totalStatements,
    handleReset,
    handleCheck,
  ]);

  if (!currentStatement) {
    return (
      <DetectiveCard variant="default" padding="lg">
        <div className="py-8 text-center">
          <p className="text-detective-text-secondary">No hay afirmaciones para evaluar.</p>
        </div>
      </DetectiveCard>
    );
  }

  const isCurrentComplete = currentClassification && currentVerdict;
  // CORR-010 FIX: Use fallback ID for current statement
  const currentStmtId = currentStatement?.id || `stmt-${currentIndex + 1}`;
  const evaluatedCount =
    evaluations.size + (isCurrentComplete && !evaluations.has(currentStmtId) ? 1 : 0);

  return (
    <>
      <UnifiedExerciseLayout
        title="Tribunal de Opiniones"
        description="Clasifica cada afirmación y evalúa si está bien fundamentada"
        icon={<Scale className="h-8 w-8" />}
        headerChildren={
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
            <span className="rounded-full bg-white/20 px-3 py-1">
              Afirmación {currentIndex + 1} de {totalStatements}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1">{evaluatedCount} evaluadas</span>
          </div>
        }
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Current Statement */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStmtId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border-2 border-detective-border bg-detective-bg p-3 sm:p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-detective-text">Afirmación:</h3>
              <p className="text-xl leading-relaxed text-detective-text">"{currentStatement.text}"</p>
              {currentStatement.source && (
                <p className="mt-2 text-sm italic text-detective-text-secondary">
                  Fuente: {currentStatement.source}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step 1: Classification */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-detective-text">
              Paso 1: ¿Qué tipo de afirmación es?
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {CLASSIFICATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentClassification(option.value)}
                  className={`rounded-xl border-2 p-2 sm:p-4 text-left transition-all ${
                    currentClassification === option.value
                      ? `${option.color} ring-2 ring-current ring-offset-2`
                      : 'border-detective-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-bold">{option.label}</span>
                  </div>
                  <p className="text-sm opacity-80">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Verdict */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-detective-text">
              Paso 2: ¿Está bien fundamentada?
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {VERDICT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentVerdict(option.value)}
                  className={`rounded-xl border-2 p-2 sm:p-4 text-left transition-all ${
                    currentVerdict === option.value
                      ? `${option.color} ring-2 ring-current ring-offset-2`
                      : 'border-detective-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-bold">{option.label}</span>
                  </div>
                  <p className="text-sm opacity-80">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Justification (Optional) */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-detective-text">
              Paso 3: Justifica tu decisión (opcional)
            </h3>
            <textarea
              value={currentJustification}
              onChange={(e) => setCurrentJustification(e.target.value)}
              placeholder="Explica en 2-3 líneas por qué clasificaste así esta afirmación..."
              className="w-full resize-none rounded-xl border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
              rows={3}
              maxLength={300}
            />
            <p className="text-right text-sm text-detective-text-secondary">
              {currentJustification.length}/300 caracteres
            </p>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center justify-between border-t border-detective-border pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-4 py-2 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < totalStatements - 1 && (
                <button
                  onClick={handleNext}
                  disabled={!isCurrentComplete || isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-detective-blue px-6 py-2 text-white transition-all hover:bg-detective-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pt-4">
            {statements.map((stmt, idx) => {
              // CORR-010 FIX: Use fallback ID for each statement
              const stmtId = stmt.id || `stmt-${idx + 1}`;
              const isEvaluated =
                evaluations.has(stmtId) || (idx === currentIndex && isCurrentComplete);
              return (
                <button
                  key={stmtId}
                  onClick={() => {
                    saveCurrentEvaluation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-3 w-3 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'scale-125 bg-detective-blue'
                      : isEvaluated
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                  title={`Afirmación ${idx + 1}${isEvaluated ? ' (evaluada)' : ''}`}
                />
              );
            })}
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            if (feedback.pendingReview) {
              onExit?.();
              return;
            }
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default TribunalOpinionesExercise;
