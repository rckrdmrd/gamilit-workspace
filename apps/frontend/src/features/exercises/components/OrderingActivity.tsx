/**
 * OrderingActivity Component
 *
 * ISSUE: #4.5 (P0) - Ordering Exercise Mechanic
 * FECHA: 2025-11-04
 * SPRINT: Sprint 2
 * ESPECIFICACIÓN: US-ACT-005
 *
 * Ejercicio de ordenar elementos en secuencia correcta
 *
 * Features:
 * - Ordenar elementos arrastrando
 * - Botones para mover arriba/abajo
 * - Indicadores de posición (1, 2, 3...)
 * - Validación de orden correcto
 * - Shuffle inicial opcional
 * - Animaciones al reordenar
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Shuffle,
  GripVertical,
  Check,
  X,
} from 'lucide-react';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseFeedback } from './ExerciseFeedback';
import { useExerciseSubmission } from '../hooks/useExerciseSubmission';
import { useExerciseTimer } from '../hooks/useExerciseTimer';
import type {
  ExerciseComponentProps,
  ExerciseFeedback as FeedbackType,
} from '../types/exercise.types';

interface OrderableItem {
  id: string;
  content: string;
  correctPosition: number; // 0-indexed
  imageUrl?: string;
}

export const OrderingActivity: React.FC<ExerciseComponentProps> = ({
  exercise,
  userId,
  onComplete,
  onCancel,
  showTimer = true,
}) => {
  // Parse items from exercise content
  const originalItems: OrderableItem[] = React.useMemo(() => {
    try {
      // Expected format: content.options with order in label field
      if (exercise.content.options) {
        return exercise.content.options.map((opt, index) => ({
          id: opt.id,
          content: opt.text,
          correctPosition: parseInt(opt.label) || index, // label contains correct position
          imageUrl: undefined,
        }));
      }
    } catch (e) {
      console.error('Failed to parse ordering items:', e);
    }
    return [];
  }, [exercise.content.options]);

  // Fisher-Yates shuffle
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // State
  const [items, setItems] = useState<OrderableItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [validationState, setValidationState] = useState<Map<string, boolean>>(new Map());

  // Initialize with shuffled items
  useEffect(() => {
    setItems(shuffleArray(originalItems));
  }, [originalItems]);

  // Hooks
  const { submitExercise, isSubmitting, result } = useExerciseSubmission({
    onSuccess: (result) => {
      const feedbackData: FeedbackType = {
        type: result.is_correct ? 'success' : 'error',
        title: result.is_correct ? '¡Orden perfecto! 🎉' : 'Orden incorrecto 😔',
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

  // Move item up/down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (result) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    setValidationState(new Map());
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
    setValidationState(new Map());
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Shuffle items again
  const handleShuffle = () => {
    if (result) return;
    setItems(shuffleArray(items));
    setValidationState(new Map());
  };

  // Validate order
  const validateOrder = (): boolean => {
    const newValidation = new Map<string, boolean>();
    let allCorrect = true;

    items.forEach((item, currentIndex) => {
      const isCorrect = currentIndex === item.correctPosition;
      newValidation.set(item.id, isCorrect);
      if (!isCorrect) allCorrect = false;
    });

    setValidationState(newValidation);
    return allCorrect;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitting || result) return;

    const timeSpent = timer.stop();

    // Build answer as ordered array of item IDs
    const orderedIds = items.map((item) => item.id);

    await submitExercise({
      exercise_id: exercise.id,
      user_id: userId,
      answer: JSON.stringify(orderedIds),
      time_spent_seconds: timeSpent,
      hints_used: [],
      attempt_number: attemptNumber,
    });

    validateOrder();
    setAttemptNumber((prev) => prev + 1);
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

      {/* Main content */}
      <div className="mb-6 rounded-xl border-2 border-gray-200 bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{exercise.content.question}</h2>
          <button
            onClick={handleShuffle}
            disabled={result !== null}
            className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" />
            Mezclar
          </button>
        </div>

        {/* Instructions */}
        <p className="mb-6 text-gray-600">
          Ordena los siguientes elementos en la secuencia correcta. Puedes arrastrarlos o usar los
          botones de flechas.
        </p>

        {/* Ordered list */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const isValidated = validationState.has(item.id);
            const isCorrect = validationState.get(item.id);

            return (
              <div
                key={item.id}
                draggable={!result}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative flex items-center gap-4 rounded-lg border-2 p-4
                  transition-all duration-200
                  ${
                    !isValidated
                      ? 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-md'
                      : isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                  }
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${result ? 'cursor-default' : 'cursor-move'}
                `}
              >
                {/* Position number */}
                <div
                  className={`
                    flex h-10 w-10 flex-shrink-0 items-center justify-center
                    rounded-full text-lg font-bold
                    ${
                      !isValidated
                        ? 'bg-purple-100 text-purple-700'
                        : isCorrect
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                    }
                  `}
                >
                  {index + 1}
                </div>

                {/* Drag handle */}
                {!result && <GripVertical className="h-5 w-5 flex-shrink-0 text-gray-400" />}

                {/* Content */}
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">{item.content}</p>
                </div>

                {/* Validation icon */}
                {isValidated && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="h-6 w-6 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">
                          Posición correcta: {item.correctPosition + 1}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Move buttons */}
                {!result && (
                  <div className="flex flex-shrink-0 flex-col gap-1">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="rounded p-1 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Helper text */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Puedes arrastrar los elementos para reordenarlos rápidamente, o
            usar las flechas ↑↓ para moverlos uno por uno.
          </p>
        </div>
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
          disabled={isSubmitting || result !== null || timer.isTimeExpired}
          className={`
            flex items-center rounded-lg px-8 py-3
            text-lg font-semibold transition-all
            ${
              !isSubmitting && !result && !timer.isTimeExpired
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
              Verificar orden
              <ChevronRight className="ml-1 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
