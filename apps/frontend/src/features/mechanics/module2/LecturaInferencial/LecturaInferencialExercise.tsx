import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import type { LecturaInferencialExerciseProps, QuestionAnswer } from './lecturaInferencialTypes';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const LecturaInferencialExercise: React.FC<LecturaInferencialExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [validated, setValidated] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();

  const questions = exercise.content.questions;

  // FE-055 & FE-059: Notify parent of progress updates WITH user answers
  useEffect(() => {
    if (onProgressUpdate) {
      const answeredCount = Object.keys(selectedAnswers).length;

      // Prepare user answers in backend DTO format
      const userAnswers: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
        userAnswers[questionId] = String(optionIndex); // Convert index to string
      });

      onProgressUpdate({
        progress: {
          currentStep: answeredCount,
          totalSteps: questions.length,
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed: 0,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { questions: userAnswers }, // FE-066: Wrap in 'questions' key to match DTO
      });

      console.log('📊 [LecturaInferencial] Progress update sent:', {
        answered: answeredCount,
        totalQuestions: questions.length,
        answersFormat: Object.keys(userAnswers).length > 0 ? 'valid' : 'empty',
      });
    }
  }, [selectedAnswers, validated, startTime, onProgressUpdate, questions.length]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (!validated) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: optionIndex,
      }));
    }
  };

  const handleCheck = useCallback(async () => {
    if (isSubmitting) return;

    if (validated) {
      // Already validated, show results again
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const totalQuestions = questions.length;
      const finalScore = calculateScore(correctAnswers, totalQuestions);
      const percentage = (correctAnswers / totalQuestions) * 100;

      setFeedback({
        type: percentage >= 70 ? 'success' : percentage >= 50 ? 'partial' : 'error',
        title:
          percentage >= 70
            ? '¡Excelente trabajo!'
            : percentage >= 50
              ? 'Buen intento'
              : 'Necesitas practicar más',
        message: `Respondiste correctamente ${correctAnswers} de ${totalQuestions} preguntas (${Math.round(percentage)}%).`,
        score: finalScore,
        showConfetti: percentage >= 70,
      });
      setShowFeedback(true);
      return;
    }

    // Check if all questions are answered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      setFeedback({
        type: 'error',
        title: 'Faltan preguntas por responder',
        message: `Has respondido ${answeredCount} de ${questions.length} preguntas. Por favor responde todas las preguntas antes de verificar.`,
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

    setIsSubmitting(true);

    try {
      // Prepare answers in backend DTO format
      const userAnswers: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
        userAnswers[questionId] = String(optionIndex);
      });

      // Submit to backend API
      const response = await submitExercise(exercise.id, user.id, { questions: userAnswers });

      // Validate all answers using backend response
      const validatedAnswers: QuestionAnswer[] = questions.map((q) => {
        const selectedOption = selectedAnswers[q.id];
        const isCorrect = selectedOption === q.correctAnswer;
        return {
          questionId: q.id,
          selectedOption,
          isCorrect,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        };
      });

      setAnswers(validatedAnswers);
      setValidated(true);

      // Show backend response with rewards
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Intenta de nuevo',
        message:
          response.feedback?.overall ||
          `Has respondido correctamente ${response.correctAnswersCount} de ${response.totalQuestions} preguntas (${Math.round(response.score)}%). Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

      console.log('✅ [LecturaInferencial] Submission successful:', {
        attemptId: response.attemptId,
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('❌ [LecturaInferencial] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedAnswers,
    validated,
    answers,
    questions,
    startTime,
    user,
    exercise.id,
    isSubmitting,
    syncAndInvalidate,
  ]);

  const handleReset = useCallback(() => {
    setSelectedAnswers({});
    setValidated(false);
    setAnswers([]);
    setShowFeedback(false);
    setFeedback(null);
  }, []);

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  const getInferenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      causa_efecto: 'Causa y Efecto',
      contexto_situacional: 'Contexto Situacional',
      motivacion: 'Motivación',
      prediccion: 'Predicción',
      conclusion: 'Conclusión',
      interpretacion: 'Interpretación',
    };
    return labels[type] || type;
  };

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div
            className="rounded-detective p-6 shadow-detective-lg"
            style={{
              background: 'linear-gradient(to right, #1e3a8a, #f97316)',
              color: 'white',
            }}
          >
            <div className="mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-white" />
              <h1 className="text-detective-3xl font-bold text-white">{exercise.title}</h1>
            </div>
            <p className="text-detective-base text-white" style={{ opacity: 0.9 }}>
              Lee el pasaje cuidadosamente y responde las preguntas de inferencia
            </p>
          </div>

          {/* Reading Passage */}
          <div className="rounded-detective border-2 border-amber-200 bg-amber-50 p-6">
            <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
              Pasaje de Lectura
            </h3>
            <p className="whitespace-pre-line text-detective-base leading-relaxed text-detective-text">
              {exercise.content.passage}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-detective-sm text-detective-text-secondary">
              Preguntas respondidas: {Object.keys(selectedAnswers).length} de {questions.length}
            </div>
            {validated && (
              <div className="text-detective-sm font-bold text-detective-blue">
                Correctas: {answers.filter((a) => a.isCorrect).length} / {questions.length}
              </div>
            )}
          </div>

          {/* All Questions */}
          <div className="space-y-6">
            {questions.map((question, qIdx) => {
              const selectedOption = selectedAnswers[question.id];
              const answer = answers.find((a) => a.questionId === question.id);

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qIdx * 0.1 }}
                  className="rounded-detective border-2 border-detective-border-light bg-white p-6"
                >
                  {/* Question Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-detective-sm font-bold text-detective-orange">
                          Pregunta {qIdx + 1}
                        </span>
                        <span className="rounded-lg bg-purple-100 px-3 py-1 text-detective-xs font-bold text-purple-800">
                          {getInferenceTypeLabel(question.inference_type)}
                        </span>
                      </div>
                      <h3 className="text-detective-base font-semibold text-detective-blue">
                        {question.question}
                      </h3>
                    </div>
                  </div>

                  {/* Options in 2-column grid */}
                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {question.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === question.correctAnswer;
                      const showCorrectness = validated;

                      let optionClasses =
                        'p-4 rounded-lg border-2 cursor-pointer transition-all text-left';

                      if (showCorrectness) {
                        if (isCorrect) {
                          optionClasses += ' bg-green-50 border-green-500 text-green-900';
                        } else if (isSelected && !isCorrect) {
                          optionClasses += ' bg-red-50 border-red-500 text-red-900';
                        } else {
                          optionClasses += ' bg-gray-50 border-gray-300 text-gray-600';
                        }
                      } else {
                        if (isSelected) {
                          optionClasses +=
                            ' bg-detective-orange border-detective-orange text-white';
                        } else {
                          optionClasses +=
                            ' bg-white border-gray-300 text-detective-text hover:border-detective-orange';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          whileHover={!validated ? { scale: 1.02 } : {}}
                          whileTap={!validated ? { scale: 0.98 } : {}}
                          onClick={() => handleSelectOption(question.id, idx)}
                          disabled={validated}
                          className={optionClasses}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                                showCorrectness && isCorrect
                                  ? 'border-green-500 bg-green-500'
                                  : showCorrectness && isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : isSelected
                                      ? 'border-white bg-white'
                                      : 'border-current'
                              }`}
                            >
                              {showCorrectness && isCorrect && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                              {showCorrectness && isSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-white" />
                              )}
                              {!showCorrectness && isSelected && (
                                <div className="h-3 w-3 rounded-full bg-detective-orange" />
                              )}
                            </div>
                            <span className="text-detective-sm">{option}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation (shown after validation) */}
                  {validated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border-2 p-4 ${
                        answer?.isCorrect
                          ? 'border-green-300 bg-green-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <p className="mb-2 text-detective-sm font-medium">
                        {answer?.isCorrect ? '✓ Explicación:' : '📘 Explicación:'}
                      </p>
                      <p className="text-detective-sm text-detective-text">
                        {question.explanation}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete(feedback.score || 0, timeSpent);
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

export default LecturaInferencialExercise;
