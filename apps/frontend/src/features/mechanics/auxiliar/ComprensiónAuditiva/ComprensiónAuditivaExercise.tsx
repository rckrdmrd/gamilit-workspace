import { useState, useEffect, useCallback } from 'react';
import { Headphones, CheckCircle, XCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { ComprensiónAuditivaExerciseProps, AudioQuestion } from './comprensionAuditivaTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const ComprensiónAuditivaExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}: ComprensiónAuditivaExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');


  const [currentTime, setCurrentTime] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // Fallback questions if exercise doesn't have them
  const questions: AudioQuestion[] = exercise.questions || [
    {
      id: '1',
      time: 10,
      question: '¿Dónde nació Marie Curie?',
      options: ['Francia', 'Polonia', 'Rusia', 'Alemania'],
      correctAnswer: 1,
    },
    {
      id: '2',
      time: 30,
      question: '¿Qué elemento descubrió Marie Curie?',
      options: ['Uranio', 'Polonio', 'Hierro', 'Oro'],
      correctAnswer: 1,
    },
    {
      id: '3',
      time: 50,
      question: '¿Cuántos Premios Nobel ganó Marie Curie?',
      options: ['Uno', 'Dos', 'Tres', 'Ninguno'],
      correctAnswer: 1,
    },
  ];

  // Progress update effect
  useEffect(() => {
    if (onProgressUpdate) {
      const answeredCount = Object.keys(answers).length;
      onProgressUpdate({
        progress: {
          currentStep: answeredCount,
          totalSteps: questions.length,
          score: 0, // Score calculated by backend
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { responses: answers },
      });

    }
  }, [answers, hintsUsed, onProgressUpdate, questions.length, startTime]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleCheck = useCallback(async () => {
    if (showResults || isSubmitting) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setFeedback({
        type: 'error',
        title: 'Preguntas Sin Responder',
        message: `Por favor, responde todas las preguntas antes de verificar. Faltan ${questions.length - answeredCount} preguntas.`,
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
      const response = await submitAsync({ responses: answers });

      setShowResults(true);

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Sigue practicando',
        message:
          response.feedback?.overall ||
          `Has respondido correctamente ${response.correctAnswersCount} de ${response.totalQuestions} preguntas (${Math.round(response.score)}%). Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      await syncAndInvalidate();

    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, showResults, isSubmitting, user, exercise.id, questions.length, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setCurrentTime(0);
    setShowResults(false);
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

  const audioUrl = exercise.audioUrl || 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABkYXRhAAAAAA==';

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Comprensión Auditiva'}
        description={exercise.instructions || 'Escucha el audio y responde las preguntas.'}
        icon={<Headphones className="h-8 w-8" />}
        headerChildren={
          <div className="rounded-detective bg-detective-bg-secondary p-6">
            <audio
              controls
              className="mb-4 w-full"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            >
              <source src={audioUrl} type="audio/wav" />
              Tu navegador no soporta el elemento de audio.
            </audio>
            {!exercise.audioUrl && (
              <p className="text-center text-sm text-detective-text-secondary">
                Nota: Este es un audio de demostración.
              </p>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {questions.map((question, index) => (
            <DetectiveCard
              key={question.id}
              variant="default"
              padding="lg"
              className={`transition-opacity ${currentTime < question.time ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-detective-blue font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="mb-3 font-medium text-detective-text">{question.question}</p>
                  {currentTime < question.time && (
                    <p className="mb-3 text-sm text-detective-text-secondary">
                      ⏱ Esta pregunta se desbloqueará en {question.time}s del audio
                    </p>
                  )}
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswer(question.id, optIndex)}
                        disabled={currentTime < question.time || showResults}
                        className={`w-full rounded-detective border-2 px-4 py-3 text-left transition-all ${
                          answers[question.id] === optIndex
                            ? 'border-detective-orange bg-detective-orange text-white'
                            : 'border-detective-border bg-white hover:border-detective-orange disabled:cursor-not-allowed disabled:hover:border-gray-300'
                        } disabled:opacity-50`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </button>
                    ))}
                  </div>

                  {showResults && answers[question.id] !== undefined && (
                    <div
                      className={`mt-3 rounded-detective border-2 p-3 ${
                        answers[question.id] === question.correctAnswer
                          ? 'border-detective-success/20 bg-detective-success/10'
                          : 'border-detective-danger/20 bg-detective-danger/10'
                      }`}
                    >
                      {answers[question.id] === question.correctAnswer ? (
                        <div className="flex items-center gap-2 text-detective-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">¡Correcto!</span>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-1 flex items-center gap-2 text-detective-danger">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Incorrecto</span>
                          </div>
                          <p className="text-sm text-detective-danger">
                            La respuesta correcta es: {question.options[question.correctAnswer]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      </UnifiedExerciseLayout>

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              onComplete();
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

export default ComprensiónAuditivaExercise;
