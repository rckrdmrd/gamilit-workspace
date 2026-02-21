import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { VerdaderoFalsoStatement, VerdaderoFalsoExerciseProps } from './verdaderoFalsoTypes';
import { saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { CheckCircle, XCircle, ToggleLeft } from 'lucide-react';
// CORRECCION-004: Migrar a progressAPI (API unificada)
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const VerdaderoFalsoExercise: React.FC<VerdaderoFalsoExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth(); // Get authenticated user
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [statements, setStatements] = useState<VerdaderoFalsoStatement[]>(
    exercise.statements.map((stmt) => ({ ...stmt, userAnswer: null })),
  );
  const [hintsUsed] = useState(0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showResults, setShowResults] = useState(false);

  const answeredCount = statements.filter((s) => s.userAnswer !== null).length;

  // FE-059: Removed local validation - correctAnswer field no longer available
  // Validation is now done server-side via backend API
  // const correctCount = ... REMOVED

  // FE-055: Notify parent with progress AND user answers
  useEffect(() => {
    // Auto-save progress
    saveProgress(exercise.id, { statements, hintsUsed });

    // Notify parent component of progress WITH user answers
    if (onProgressUpdate) {
      // Prepare user answers in backend format (statement-id: boolean)
      const userAnswers: Record<string, boolean> = {};
      statements.forEach((stmt) => {
        if (stmt.userAnswer !== null && stmt.userAnswer !== undefined) {
          // BE-FE-064: Ensure ID is string
          userAnswers[String(stmt.id)] = stmt.userAnswer;
        }
      });

      // Send both progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: answeredCount,
          totalSteps: statements.length,
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { statements: userAnswers }, // BE-FE-064: Wrap in 'statements' key to match DTO
      });

    }
  }, [statements, hintsUsed, onProgressUpdate, answeredCount, startTime, exercise.id]);

  const handleAnswer = (statementId: string, answer: boolean) => {
    if (showResults) return; // No cambiar respuestas después de verificar

    setStatements((prev) =>
      prev.map((stmt) => (stmt.id === statementId ? { ...stmt, userAnswer: answer } : stmt)),
    );
  };

  const handleCheck = async () => {
    const allAnswered = statements.every((s) => s.userAnswer !== null);

    if (!allAnswered) {
      setFeedback({
        type: 'error',
        title: 'Ejercicio Incompleto',
        message: `Has respondido ${answeredCount} de ${statements.length} preguntas. Responde todas antes de verificar.`,
      });
      setShowFeedback(true);
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'Debes estar autenticado para enviar el ejercicio.',
      });
      setShowFeedback(true);
      return;
    }

    setShowResults(true);

    try {
      // Prepare answers in backend DTO format: { statements: { "1": true, "2": false } }
      const statementsAnswers: Record<string, boolean> = {};
      statements.forEach((s) => {
        if (s.userAnswer !== null && s.userAnswer !== undefined) {
          // BE-FE-064: Ensure ID is string (DB stores as number, need to convert)
          statementsAnswers[String(s.id)] = s.userAnswer;
        }
      });

      // FE-044 FIX: Wrap in 'statements' key to match backend DTO
      const answersObj = { statements: statementsAnswers };

      // CORRECCION-004: Submit to progressAPI (API unificada)
      const response = await submitAsync(answersObj);

      // CORRECCION-004: Usar correctAnswersCount (progressAPI) y agregar rewards
      const correctCount = response.correctAnswersCount ?? 0;
      const rewards = response.rewards || { mlCoins: 0, xp: 0 };

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Intenta de nuevo',
        message:
          response.feedback?.overall ||
          `Has obtenido ${correctCount} de ${response.totalQuestions} respuestas correctas.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [VerdaderoFalso] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  };

  const handleReset = () => {
    setStatements(exercise.statements.map((stmt) => ({ ...stmt, userAnswer: null })));
    setShowResults(false);
    setFeedback(null);
    setShowFeedback(false);
  };

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef]);

  const progress = statements.length > 0 ? (answeredCount / statements.length) * 100 : 0;

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Verdadero o Falso'}
        description={exercise.contextText || 'Determina si cada enunciado es verdadero o falso.'}
        icon={<ToggleLeft className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Progreso: {answeredCount}/{statements.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/50">
              <div
                className="h-full rounded-full bg-detective-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        }
      >
        {/* Statements */}
        <div className="space-y-4">
          <AnimatePresence>
            {statements.map((statement, index) => {
              // FE-059: Removed local validation - correctAnswer field no longer available
              // Visual feedback disabled until backend integration
              const isCorrect = false; // Will be determined by backend
              const showResult = false; // Disabled for now

              return (
                <motion.div
                  key={statement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DetectiveCard
                    variant={showResult ? (isCorrect ? 'success' : 'danger') : 'default'}
                    padding="md"
                    className="transition-all duration-300"
                  >
                    <div className="space-y-4">
                      {/* Statement */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {index + 1}
                        </div>
                        <p className="flex-1 pt-1 text-lg text-detective-text">{statement.statement}</p>
                      </div>

                      {/* Answer Buttons */}
                      <div className="ml-11 flex gap-4">
                        <button
                          onClick={() => handleAnswer(statement.id, true)}
                          disabled={showResults}
                          className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                            statement.userAnswer === true
                              ? showResults
                                ? 'bg-green-500/20 border-2 border-green-500 text-detective-text shadow-md'
                                : 'scale-105 bg-green-500 text-white shadow-lg'
                              : 'bg-detective-bg-secondary text-detective-text hover:bg-green-100 hover:text-green-700'
                          } ${showResults ? 'cursor-not-allowed opacity-100' : 'cursor-pointer'} flex items-center justify-center gap-2`}
                        >
                          <CheckCircle className="h-5 w-5" />
                          Verdadero
                        </button>
                        <button
                          onClick={() => handleAnswer(statement.id, false)}
                          disabled={showResults}
                          className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
                            statement.userAnswer === false
                              ? showResults
                                ? 'bg-red-500/20 border-2 border-red-500 text-detective-text shadow-md'
                                : 'scale-105 bg-red-500 text-white shadow-lg'
                              : 'bg-detective-bg-secondary text-detective-text hover:bg-red-100 hover:text-red-700'
                          } ${showResults ? 'cursor-not-allowed opacity-100' : 'cursor-pointer'} flex items-center justify-center gap-2`}
                        >
                          <XCircle className="h-5 w-5" />
                          Falso
                        </button>
                      </div>

                      {/* Explanation (shown after verification) */}
                      {showResult && statement.explanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="ml-11 mt-4 rounded-lg border-l-4 border-blue-500 bg-white/50 p-4"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 text-2xl">{isCorrect ? '✅' : '❌'}</div>
                            <p className="text-detective-text">{statement.explanation}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </DetectiveCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
              onComplete?.();
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}
    </>
  );
};

export default VerdaderoFalsoExercise;
