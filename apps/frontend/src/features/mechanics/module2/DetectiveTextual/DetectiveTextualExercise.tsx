/**
 * Detective Textual Exercise - Multiple Choice Inference Exercise
 * Module 2.1: Textual Inference
 *
 * FIX 2024-11-29: Ahora carga datos desde el API en lugar de usar mock data
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, CheckCircle2, Circle, Book } from 'lucide-react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import type {
  DetectiveTextualExercise as DetectiveTextualExerciseData,
  InferenceQuestion,
  DetectiveTextualExerciseProps,
  DetectiveTextualState,
} from './detectiveTextualTypes';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockExercise } from './detectiveTextualMockData';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

/**
 * Question Card Component
 */
interface QuestionCardProps {
  question: InferenceQuestion;
  questionNumber: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

const QuestionCard = ({
  question,
  questionNumber,
  selectedOption,
  onSelectOption,
  showFeedback = false,
  isCorrect = false,
}: QuestionCardProps) => {
  return (
    <div className="rounded-lg border border-detective-blue/20 bg-white p-3 sm:p-6 shadow-md">
      {/* Question Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-detective-blue font-semibold text-white">
          {questionNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-detective-text">{question.question}</h3>
          {question.inference_type && (
            <span className="mt-1 inline-block rounded-full bg-detective-orange/10 px-3 py-1 text-xs text-detective-orange">
              {question.inference_type.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectAnswer = showFeedback && index === question.correctAnswer;
          const isWrongSelection = showFeedback && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => !showFeedback && onSelectOption(index)}
              disabled={showFeedback}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${isCorrectAnswer
                ? 'border-detective-success bg-detective-success/10'
                : isWrongSelection
                  ? 'border-detective-danger bg-detective-danger/10'
                  : isSelected
                    ? 'border-detective-blue bg-detective-blue/5'
                    : 'border-detective-border bg-white hover:border-detective-blue/50 hover:bg-gray-50'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle2
                      className={`h-5 w-5 ${isCorrectAnswer
                        ? 'text-detective-success'
                        : isWrongSelection
                          ? 'text-detective-danger'
                          : 'text-detective-blue'
                        }`}
                    />
                  ) : (
                    <Circle className="h-5 w-5 text-detective-text-secondary" />
                  )}
                </div>
                <span
                  className={`flex-1 ${isCorrectAnswer ? 'font-semibold text-green-900' : 'text-detective-text'}`}
                >
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after feedback) */}
      {showFeedback && (
        <div
          className={`mt-4 rounded-lg p-4 ${isCorrect
            ? 'border-l-4 border-detective-success bg-detective-success/10'
            : 'border-l-4 border-blue-500 bg-blue-50'
            }`}
        >
          <p className="mb-1 text-sm font-semibold text-detective-text">Explicación:</p>
          <p className="text-sm text-detective-text">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Main Detective Textual Exercise Component
 */
export const DetectiveTextualExercise = ({
  exerciseId: propExerciseId,
  exercise: exerciseFromPage,
  onComplete,
  onProgressUpdate,
  initialData,
  actionsRef,
  comodinesContext,
}: DetectiveTextualExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);

  /**
   * FIX 2024-11-29: Transform exercise data from API to component format
   * Priority:
   * 1. exerciseFromPage.content (from adapter)
   * 2. exerciseFromPage.mechanicData.content (raw API response)
   * 3. mockExercise (fallback for development/testing)
   */
  const exerciseData = useMemo<DetectiveTextualExerciseData>(() => {
    // Try to get content from adapted exercise or mechanicData
    const content = exerciseFromPage?.content || exerciseFromPage?.mechanicData?.content;

    if (content?.passage && content?.questions && content.questions.length > 0) {
      // Map difficulty from backend format to component format
      const difficultyMap: Record<string, 'easy' | 'medium' | 'hard'> = {
        beginner: 'easy',
        intermediate: 'medium',
        advanced: 'hard',
        proficient: 'hard',
        // Handle raw database values
        easy: 'easy',
        medium: 'medium',
        hard: 'hard',
      };

      return {
        id: exerciseFromPage?.id || propExerciseId || 'detective-textual',
        title: exerciseFromPage?.title || 'Detective Textual',
        description: exerciseFromPage?.description || '',
        passage: content.passage,
        questions: content.questions,
        difficulty:
          difficultyMap[exerciseFromPage?.difficulty?.toLowerCase() || 'medium'] || 'medium',
      };
    }

    // Fallback to mock data (for development or when API fails)
    console.warn('[DetectiveTextual] ⚠️ Using mock data - API data not available');
    return mockExercise;
  }, [exerciseFromPage, propExerciseId]);

  // Get actual exerciseId from props or exercise data
  const exerciseId = propExerciseId || exerciseFromPage?.id || exerciseData.id;
  const { submitAsync } = useExerciseSubmission(exerciseId);


  const [answers, setAnswers] = useState<Record<string, number>>(initialData?.answers || {});
  const [hintsUsed] = useState(initialData?.hintsUsed || 0);
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score] = useState(initialData?.score || 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    correctAnswers: Record<string, boolean>;
  } | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Progress update callback - FE-055: Send both progress AND answers
  useEffect(() => {
    if (onProgressUpdate) {
      const answeredCount = Object.keys(answers).length;

      // Format answers for backend: { questions: { "q1": "1", "q2": "0", ... } }
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([questionId, optionIndex]) => {
        formattedAnswers[questionId] = String(optionIndex);
      });

      // FE-055: Use new format that includes answers for ExercisePage to capture
      onProgressUpdate({
        progress: {
          currentStep: answeredCount,
          totalSteps: exerciseData.questions.length,
          score,
          hintsUsed,
          timeSpent,
        },
        answers: { questions: formattedAnswers },
      });
    }
  }, [answers, score, hintsUsed, timeSpent, exerciseData.questions.length, onProgressUpdate]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitSolution = async () => {
    // Validate all questions answered
    const allAnswered = exerciseData.questions.every((q) => q.id in answers);

    if (!allAnswered) {
      setFeedback({
        type: 'error',
        title: 'Respuestas Incompletas',
        message: 'Por favor, responde todas las preguntas antes de enviar.',
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
      // Format answers for backend: { questions: { "q1": "1", "q2": "0", ... } }
      const formattedAnswers = Object.entries(answers).reduce(
        (acc, [questionId, optionIndex]) => {
          acc[questionId] = String(optionIndex);
          return acc;
        },
        {} as Record<string, string>,
      );

      // Submit to backend API
      const response = await submitAsync({ questions: formattedAnswers });

      // Calculate which answers were correct (if backend provides this info)
      const correctAnswers: Record<string, boolean> = {};
      exerciseData.questions.forEach((q) => {
        correctAnswers[q.id] = answers[q.id] === q.correctAnswer;
      });
      setSubmissionResult({ correctAnswers });

      // Second chance: if score < 70 and comodin active, allow retry
      if (response.score < 70 && comodinesContext?.hasSecondChance && !secondChanceUsed) {
        setSecondChanceUsed(true);
        setSubmissionResult(null);
        setFeedback({
          type: 'info' as FeedbackData['type'],
          title: '¡Segunda Oportunidad!',
          message: 'Tu puntuación fue baja, pero tienes una segunda oportunidad. Revisa tus respuestas e intenta de nuevo.',
          score: response.score,
        });
        setShowFeedback(true);
        return;
      }

      // Show backend response
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto! 🎉'
          : response.score >= 70
            ? '¡Buen trabajo! 👍'
            : 'Intenta de nuevo 💪',
        message:
          response.feedback?.overall ||
          `Has respondido correctamente ${response.correctAnswersCount} de ${response.totalQuestions} preguntas.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [DetectiveTextual] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setAnswers({});
    setTimeSpent(0);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setShowFeedback(false);
    setSubmissionResult(null);
  }, []);

  // Get current state for parent component
  const getState = useCallback((): DetectiveTextualState => {
    return {
      answers,
      hintsUsed,
      timeSpent,
      score,
      currentQuestionIndex,
    };
  }, [answers, hintsUsed, timeSpent, score, currentQuestionIndex]);

  // Submit ref for actionsRef (avoids stale closure in useEffect)
  const handleSubmitSolutionRef = useRef(handleSubmitSolution);
  handleSubmitSolutionRef.current = handleSubmitSolution;

  // Populate actionsRef for parent component control
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        getState,
        reset: handleReset,
        validate: handleSubmitSolution,
        selectAnswer: handleSelectOption,
        handleCheck: () => handleSubmitSolutionRef.current(),
      };
    }

    return () => {
      if (actionsRef) {
        actionsRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef, getState, handleReset]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exerciseData.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <>
      {/* Main Exercise Content */}
      <UnifiedExerciseLayout
        title={exerciseData.title}
        description={exerciseData.description}
        icon={<Search className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Progreso: {answeredCount}/{totalQuestions}
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
        {/* Reading Passage */}
        <div className="rounded-lg border-2 border-detective-blue/20 bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-6 mb-6">
          <div className="mb-3 flex items-center gap-2 text-detective-blue">
            <Book className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Pasaje de Lectura</h3>
          </div>
          <div className="exercise-passage">
            <p className="text-base leading-relaxed text-detective-text">{exerciseData.passage}</p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-detective-text">
            <Search className="h-5 w-5 text-detective-blue" />
            Preguntas de Inferencia
          </h3>
          <div className="space-y-4">
            {exerciseData.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                selectedOption={answers[question.id] ?? null}
                onSelectOption={(optionIndex) => handleSelectOption(question.id, optionIndex)}
                showFeedback={submissionResult !== null}
                isCorrect={submissionResult?.correctAnswers[question.id] ?? false}
              />
            ))}
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
            if (feedback.type === 'success' && onComplete) {
              onComplete(feedback.score ?? 0, timeSpent);
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

export default DetectiveTextualExercise;
