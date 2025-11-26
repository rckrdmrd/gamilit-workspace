/**
 * TrueFalseActivity Component
 *
 * ISSUE: #4.2 (P0) - True/False Exercise Mechanic
 * FECHA: 2025-11-04
 * SPRINT: Sprint 1
 * ESPECIFICACIÓN: US-ACT-002
 *
 * Ejercicio de Verdadero/Falso con 2 opciones
 *
 * Features:
 * - 2 opciones (Verdadero/Falso)
 * - Validación inmediata
 * - Explicación de respuesta correcta
 * - Integración con gamificación (XP, ML Coins)
 * - Animaciones de éxito/error
 * - Timer opcional
 */

import React, { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseFeedback } from './ExerciseFeedback';
import { useExerciseSubmission } from '../hooks/useExerciseSubmission';
import { useExerciseTimer } from '../hooks/useExerciseTimer';
import type {
  ExerciseComponentProps,
  ExerciseFeedback as FeedbackType,
} from '../types/exercise.types';

type TrueFalseAnswer = 'true' | 'false';

export const TrueFalseActivity: React.FC<ExerciseComponentProps> = ({
  exercise,
  userId,
  onComplete,
  onCancel,
  showTimer = true,
}) => {
  // State
  const [selectedAnswer, setSelectedAnswer] = useState<TrueFalseAnswer | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);

  // Hooks
  const { submitExercise, isSubmitting, result } = useExerciseSubmission({
    onSuccess: (result) => {
      const feedbackData: FeedbackType = {
        type: result.is_correct ? 'success' : 'error',
        title: result.is_correct ? '¡Correcto! 🎉' : 'Incorrecto 😔',
        message: result.feedback,
        xpEarned: result.xp_earned,
        mlCoinsEarned: result.ml_coins_earned,
        showConfetti: result.is_correct,
      };
      setFeedback(feedbackData);

      if (result.is_correct) {
        setTimeout(() => {
          onComplete(result);
        }, 3000);
      }
    },
    onError: () => {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Hubo un problema al enviar tu respuesta. Intenta de nuevo.',
      });
    },
  });

  const timer = useExerciseTimer({
    timeLimitSeconds: exercise.time_limit_seconds,
    onTimeExpired: () => {
      if (!result) {
        setFeedback({
          type: 'warning',
          title: 'Tiempo agotado ⏰',
          message: 'Se ha acabado el tiempo para este ejercicio.',
        });
      }
    },
    autoStart: true,
  });

  // Handle answer selection
  const handleAnswerSelect = (answer: TrueFalseAnswer) => {
    if (result || isSubmitting) return;
    setSelectedAnswer(answer);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting || result) return;

    const timeSpent = timer.stop();

    await submitExercise({
      exercise_id: exercise.id,
      user_id: userId,
      answer: selectedAnswer,
      time_spent_seconds: timeSpent,
      hints_used: [],
      attempt_number: attemptNumber,
    });

    setAttemptNumber((prev) => prev + 1);
  };

  // Get correct answer
  const correctAnswer = (exercise.content.correct_answer || 'true') as string;

  // Get button style
  const getButtonStyle = (answer: TrueFalseAnswer, isTrue: boolean) => {
    const isSelected = selectedAnswer === answer;
    const isCorrectAnswer = correctAnswer === answer;

    if (!result) {
      // Before submission
      if (isSelected) {
        return isTrue
          ? 'bg-green-500 border-green-600 text-white ring-4 ring-green-200 scale-105'
          : 'bg-red-500 border-red-600 text-white ring-4 ring-red-200 scale-105';
      }
      return isTrue
        ? 'bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400'
        : 'bg-white border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400';
    }

    // After submission
    if (result.is_correct && isSelected) {
      return isTrue
        ? 'bg-green-500 border-green-600 text-white ring-4 ring-green-200'
        : 'bg-red-500 border-red-600 text-white ring-4 ring-red-200';
    }

    if (!result.is_correct && isSelected) {
      return 'bg-gray-500 border-gray-600 text-white opacity-60';
    }

    if (isCorrectAnswer) {
      return isTrue
        ? 'bg-green-100 border-green-500 text-green-800 ring-2 ring-green-300'
        : 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-300';
    }

    return 'bg-white border-gray-300 text-gray-500 opacity-50';
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <ExerciseHeader
        exercise={exercise}
        attemptNumber={attemptNumber}
        formattedTime={
          showTimer
            ? exercise.time_limit_seconds
              ? timer.formattedRemaining || '00:00'
              : timer.formattedElapsed
            : undefined
        }
        showTimer={showTimer}
        isTimeExpired={timer.isTimeExpired}
      />

      {/* Question */}
      <div className="mb-6 rounded-xl border-2 border-gray-200 bg-white p-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {exercise.content.question}
        </h2>

        {/* Media (if present) */}
        {exercise.content.media_url && exercise.content.media_type === 'image' && (
          <div className="mb-8 flex justify-center">
            <img
              src={exercise.content.media_url}
              alt="Exercise media"
              className="h-auto max-w-full rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* True/False buttons */}
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6">
          {/* TRUE button */}
          <button
            onClick={() => handleAnswerSelect('true')}
            disabled={result !== null || isSubmitting || timer.isTimeExpired}
            className={`
              border-3 flex transform flex-col items-center
              justify-center rounded-2xl p-8 transition-all
              duration-300
              hover:scale-105 disabled:cursor-not-allowed
              ${getButtonStyle('true', true)}
            `}
          >
            <div className="mb-4 h-16 w-16 rounded-full bg-current opacity-20" />
            <Check className="mb-3 h-12 w-12" strokeWidth={3} />
            <span className="text-2xl font-bold">VERDADERO</span>
            {result && correctAnswer === 'true' && (
              <span className="mt-2 text-sm font-semibold">✓ Respuesta correcta</span>
            )}
          </button>

          {/* FALSE button */}
          <button
            onClick={() => handleAnswerSelect('false')}
            disabled={result !== null || isSubmitting || timer.isTimeExpired}
            className={`
              border-3 flex transform flex-col items-center
              justify-center rounded-2xl p-8 transition-all
              duration-300
              hover:scale-105 disabled:cursor-not-allowed
              ${getButtonStyle('false', false)}
            `}
          >
            <div className="mb-4 h-16 w-16 rounded-full bg-current opacity-20" />
            <X className="mb-3 h-12 w-12" strokeWidth={3} />
            <span className="text-2xl font-bold">FALSO</span>
            {result && correctAnswer === 'false' && (
              <span className="mt-2 text-sm font-semibold">✓ Respuesta correcta</span>
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Selecciona tu respuesta y presiona "Enviar respuesta"
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-6">
          <ExerciseFeedback
            feedback={feedback}
            explanation={result?.explanation || exercise.content.explanation}
            onClose={result?.is_correct ? () => onComplete(result) : () => setFeedback(null)}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && !result && (
          <button
            onClick={onCancel}
            className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || isSubmitting || result !== null || timer.isTimeExpired}
          className={`
            flex items-center rounded-lg px-8 py-3
            text-lg font-semibold transition-all
            ${
              selectedAnswer && !isSubmitting && !result && !timer.isTimeExpired
                ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }
          `}
        >
          {isSubmitting ? (
            'Enviando...'
          ) : result ? (
            'Enviado'
          ) : (
            <>
              Enviar respuesta
              <ChevronRight className="ml-1 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
