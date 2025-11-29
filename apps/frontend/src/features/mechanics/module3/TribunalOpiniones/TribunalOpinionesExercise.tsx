import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronRight, ChevronLeft } from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import type {
  TribunalOpinionesExerciseProps,
  StatementEvaluation,
  StatementClassification,
  StatementVerdict,
  TribunalOpinionesAnswers,
} from './tribunalOpinionesTypes';
import { CLASSIFICATION_OPTIONS, VERDICT_OPTIONS } from './tribunalOpinionesTypes';

export const TribunalOpinionesExercise: React.FC<TribunalOpinionesExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<Map<string, StatementEvaluation>>(new Map());
  const [currentClassification, setCurrentClassification] =
    useState<StatementClassification | null>(null);
  const [currentVerdict, setCurrentVerdict] = useState<StatementVerdict | null>(null);
  const [currentJustification, setCurrentJustification] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [hintsUsed, setHintsUsed] = useState(0);

  const statements = exercise.content?.statements || [];
  const currentStatement = statements[currentIndex];
  const totalStatements = statements.length;

  // Load existing evaluation when navigating
  useEffect(() => {
    if (currentStatement) {
      const existing = evaluations.get(currentStatement.id);
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
  useEffect(() => {
    if (onProgressUpdate) {
      const evaluatedCount = evaluations.size;
      const answers: TribunalOpinionesAnswers = {
        evaluations: Array.from(evaluations.values()),
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
  }, [evaluations, totalStatements, hintsUsed, onProgressUpdate, startTime]);

  // Save current evaluation
  const saveCurrentEvaluation = useCallback(() => {
    if (currentStatement && currentClassification && currentVerdict) {
      const evaluation: StatementEvaluation = {
        statementId: currentStatement.id,
        classification: currentClassification,
        verdict: currentVerdict,
        justification: currentJustification.trim() || undefined,
      };
      setEvaluations((prev) => new Map(prev).set(currentStatement.id, evaluation));
      return true;
    }
    return false;
  }, [currentStatement, currentClassification, currentVerdict, currentJustification]);

  // Use hint handler (for future hint system)
  const _useHint = useCallback(() => {
    setHintsUsed((prev) => prev + 1);
  }, []);

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
      currentEvaluations.set(currentStatement.id, {
        statementId: currentStatement.id,
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
      const answers: TribunalOpinionesAnswers = {
        evaluations: Array.from(currentEvaluations.values()),
      };

      const response = await submitExercise(exercise.id, user.id, answers);

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
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await fetchUserProgress();
      await fetchBalance();

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [TribunalOpiniones] Submission successful:', {
          score: response.score,
          rewards: response.rewards,
        });
      }
    } catch (error) {
      console.error('[TribunalOpiniones] Submission error:', error);
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
    totalStatements,
    user,
    exercise.id,
    saveCurrentEvaluation,
    fetchUserProgress,
    fetchBalance,
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

  // Expose actions to parent
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        getState: () => ({
          evaluations: Array.from(evaluations.values()),
          currentStatementIndex: currentIndex,
          score: 0,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
          hintsUsed,
          isComplete: evaluations.size === totalStatements,
        }),
        reset: handleReset,
        validate: handleCheck,
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
          <p className="text-gray-500">No hay afirmaciones para evaluar.</p>
        </div>
      </DetectiveCard>
    );
  }

  const isCurrentComplete = currentClassification && currentVerdict;
  const evaluatedCount =
    evaluations.size + (isCurrentComplete && !evaluations.has(currentStatement.id) ? 1 : 0);

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="mb-2 flex items-center gap-3">
              <Scale className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Tribunal de Opiniones</h1>
            </div>
            <p className="text-white/90">
              Clasifica cada afirmación y evalúa si está bien fundamentada
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1">
                Afirmación {currentIndex + 1} de {totalStatements}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1">{evaluatedCount} evaluadas</span>
            </div>
          </div>

          {/* Current Statement */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStatement.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border-2 border-gray-200 bg-gray-50 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Afirmación:</h3>
              <p className="text-xl leading-relaxed text-gray-900">"{currentStatement.text}"</p>
              {currentStatement.source && (
                <p className="mt-2 text-sm italic text-gray-500">
                  Fuente: {currentStatement.source}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step 1: Classification */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Paso 1: ¿Qué tipo de afirmación es?
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {CLASSIFICATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentClassification(option.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    currentClassification === option.value
                      ? `${option.color} ring-2 ring-current ring-offset-2`
                      : 'border-gray-200 bg-white hover:border-gray-300'
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
            <h3 className="text-lg font-semibold text-gray-800">
              Paso 2: ¿Está bien fundamentada?
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {VERDICT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentVerdict(option.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    currentVerdict === option.value
                      ? `${option.color} ring-2 ring-current ring-offset-2`
                      : 'border-gray-200 bg-white hover:border-gray-300'
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
            <h3 className="text-lg font-semibold text-gray-800">
              Paso 3: Justifica tu decisión (opcional)
            </h3>
            <textarea
              value={currentJustification}
              onChange={(e) => setCurrentJustification(e.target.value)}
              placeholder="Explica en 2-3 líneas por qué clasificaste así esta afirmación..."
              className="w-full resize-none rounded-xl border-2 border-gray-200 p-4 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              rows={3}
              maxLength={300}
            />
            <p className="text-right text-sm text-gray-500">
              {currentJustification.length}/300 caracteres
            </p>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < totalStatements - 1 && (
                <button
                  onClick={handleNext}
                  disabled={!isCurrentComplete}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              const isEvaluated =
                evaluations.has(stmt.id) || (idx === currentIndex && isCurrentComplete);
              return (
                <button
                  key={stmt.id}
                  onClick={() => {
                    saveCurrentEvaluation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-3 w-3 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'scale-125 bg-indigo-600'
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
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
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
