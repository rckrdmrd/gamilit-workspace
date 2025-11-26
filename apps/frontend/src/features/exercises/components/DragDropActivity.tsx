/**
 * DragDropActivity Component
 *
 * ISSUE: #4.4 (P0) - Drag & Drop Exercise Mechanic
 * FECHA: 2025-11-04
 * SPRINT: Sprint 2
 * ESPECIFICACIÓN: US-ACT-004
 *
 * Ejercicio de arrastrar y soltar elementos
 *
 * Features:
 * - HTML5 Drag & Drop API
 * - Múltiples zonas de drop
 * - Validación de posiciones correctas
 * - Feedback visual durante drag
 * - Banco de elementos draggables
 * - Snap to grid opcional
 * - Undo/Reset functionality
 */

import React, { useState } from 'react';
import { ChevronRight, RotateCcw, GripVertical, Check, X } from 'lucide-react';
import { ExerciseHeader } from './ExerciseHeader';
import { ExerciseFeedback } from './ExerciseFeedback';
import { useExerciseSubmission } from '../hooks/useExerciseSubmission';
import { useExerciseTimer } from '../hooks/useExerciseTimer';
import type {
  ExerciseComponentProps,
  ExerciseFeedback as FeedbackType,
} from '../types/exercise.types';

interface DraggableItem {
  id: string;
  content: string;
  imageUrl?: string;
  correctDropZoneId: string;
}

interface DropZone {
  id: string;
  label: string;
  acceptsMultiple?: boolean;
  description?: string;
}

interface DragDropAnswer {
  dropZoneId: string;
  itemIds: string[];
}

export const DragDropActivity: React.FC<ExerciseComponentProps> = ({
  exercise,
  userId,
  onComplete,
  onCancel,
  showTimer = true,
}) => {
  // Parse drag-drop data from exercise content
  const items: DraggableItem[] = React.useMemo(() => {
    try {
      // Expected format: content.options contains draggable items
      if (exercise.content.options) {
        return exercise.content.options.map((opt) => ({
          id: opt.id,
          content: opt.text,
          correctDropZoneId: opt.label, // Using label field for correct zone ID
          imageUrl: undefined,
        }));
      }
    } catch (e) {
      console.error('Failed to parse drag-drop items:', e);
    }
    return [];
  }, [exercise.content.options]);

  const dropZones: DropZone[] = React.useMemo(() => {
    try {
      // Parse from exercise description or use default
      // Format: "Zone1|Zone2|Zone3"
      const zones = exercise.description?.split('|') || ['Zona 1', 'Zona 2'];
      return zones.map((label, index) => ({
        id: `zone-${index}`,
        label: label.trim(),
        acceptsMultiple: true,
      }));
    } catch (e) {
      console.error('Failed to parse drop zones:', e);
    }
    return [
      { id: 'zone-0', label: 'Zona 1', acceptsMultiple: true },
      { id: 'zone-1', label: 'Zona 2', acceptsMultiple: true },
    ];
  }, [exercise.description]);

  // State
  const [droppedItems, setDroppedItems] = useState<Map<string, string[]>>(
    new Map(dropZones.map((zone) => [zone.id, []])),
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [validationState, setValidationState] = useState<Map<string, boolean>>(new Map());

  // Hooks
  const { submitExercise, isSubmitting, result } = useExerciseSubmission({
    onSuccess: (result) => {
      const feedbackData: FeedbackType = {
        type: result.is_correct ? 'success' : result.score_percentage >= 50 ? 'warning' : 'error',
        title: result.is_correct
          ? '¡Perfecto! 🎉'
          : result.score_percentage >= 50
            ? 'Parcialmente correcto 😊'
            : 'Incorrecto 😔',
        message: result.feedback,
        xpEarned: result.xp_earned,
        mlCoinsEarned: result.ml_coins_earned,
        showConfetti: result.is_correct,
      };
      setFeedback(feedbackData);

      if (result.is_correct || result.score_percentage >= 70) {
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

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, itemId: string, fromZoneId?: string) => {
    setDraggedItem(itemId);
    setDraggedFrom(fromZoneId || 'bank');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault();

    if (!draggedItem || result) return;

    setDroppedItems((prev) => {
      const newMap = new Map(prev);

      // Remove from previous location
      if (draggedFrom && draggedFrom !== 'bank') {
        const prevItems = newMap.get(draggedFrom) || [];
        newMap.set(
          draggedFrom,
          prevItems.filter((id) => id !== draggedItem),
        );
      }

      // Add to new location
      const currentItems = newMap.get(dropZoneId) || [];
      if (!currentItems.includes(draggedItem)) {
        newMap.set(dropZoneId, [...currentItems, draggedItem]);
      }

      return newMap;
    });

    setDraggedItem(null);
    setDraggedFrom(null);

    // Clear validation when items move
    setValidationState(new Map());
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFrom(null);
  };

  // Reset to initial state
  const handleReset = () => {
    setDroppedItems(new Map(dropZones.map((zone) => [zone.id, []])));
    setValidationState(new Map());
    setFeedback(null);
  };

  // Remove item from zone (return to bank)
  const handleRemoveFromZone = (zoneId: string, itemId: string) => {
    if (result) return;

    setDroppedItems((prev) => {
      const newMap = new Map(prev);
      const items = newMap.get(zoneId) || [];
      newMap.set(
        zoneId,
        items.filter((id) => id !== itemId),
      );
      return newMap;
    });

    setValidationState(new Map());
  };

  // Check if item is in bank
  const isInBank = (itemId: string): boolean => {
    return !Array.from(droppedItems.values()).some((items) => items.includes(itemId));
  };

  // Get items in bank
  const bankItems = items.filter((item) => isInBank(item.id));

  // Validate answer
  const validateAnswer = (): boolean => {
    const newValidation = new Map<string, boolean>();
    let allCorrect = true;

    items.forEach((item) => {
      // Find which zone contains this item
      let foundZone: string | null = null;
      droppedItems.forEach((items, zoneId) => {
        if (items.includes(item.id)) {
          foundZone = zoneId;
        }
      });

      // Check if it's in the correct zone
      const isCorrect = foundZone === item.correctDropZoneId;
      newValidation.set(item.id, isCorrect);

      if (!isCorrect) allCorrect = false;
    });

    setValidationState(newValidation);
    return allCorrect;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitting || result) return;

    // Check if all items are placed
    const allPlaced = items.every((item) => !isInBank(item.id));
    if (!allPlaced) {
      setFeedback({
        type: 'warning',
        title: 'Elementos sin colocar',
        message: 'Por favor, coloca todos los elementos en las zonas antes de enviar.',
      });
      return;
    }

    const timeSpent = timer.stop();

    // Build answer as array of {dropZoneId, itemIds}
    const answers: DragDropAnswer[] = Array.from(droppedItems.entries()).map(
      ([zoneId, itemIds]) => ({
        dropZoneId: zoneId,
        itemIds,
      }),
    );

    await submitExercise({
      exercise_id: exercise.id,
      user_id: userId,
      answer: JSON.stringify(answers),
      time_spent_seconds: timeSpent,
      hints_used: [],
      attempt_number: attemptNumber,
    });

    validateAnswer();
    setAttemptNumber((prev) => prev + 1);
  };

  // Calculate completion
  const placedCount = items.filter((item) => !isInBank(item.id)).length;
  const completionPercentage =
    items.length > 0 ? Math.round((placedCount / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl p-6">
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
      <div className="mb-6 rounded-xl border-2 border-gray-200 bg-white p-6">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{exercise.content.question}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {placedCount}/{items.length} colocados ({completionPercentage}%)
              </span>
              <button
                onClick={handleReset}
                disabled={result !== null}
                className="flex items-center gap-1 rounded-lg border-2 border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Drop Zones */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Zonas de colocación:</h3>
            {dropZones.map((zone) => {
              const zoneItems = droppedItems.get(zone.id) || [];
              return (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  className={`
                    min-h-[120px] rounded-lg border-2 border-dashed p-4
                    transition-all
                    ${
                      draggedItem && draggedFrom !== zone.id
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-300 bg-gray-50'
                    }
                  `}
                >
                  <h4 className="mb-3 font-semibold text-gray-900">{zone.label}</h4>
                  {zone.description && (
                    <p className="mb-3 text-sm text-gray-600">{zone.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {zoneItems.map((itemId) => {
                      const item = items.find((i) => i.id === itemId);
                      if (!item) return null;

                      const isValidated = validationState.has(item.id);
                      const isCorrect = validationState.get(item.id);

                      return (
                        <div
                          key={item.id}
                          draggable={!result}
                          onDragStart={(e) => handleDragStart(e, item.id, zone.id)}
                          onDragEnd={handleDragEnd}
                          className={`
                            group relative cursor-move rounded-lg border-2 px-4 py-2
                            transition-all
                            ${
                              !isValidated
                                ? 'border-purple-300 bg-white hover:border-purple-400 hover:shadow-md'
                                : isCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                            }
                            ${draggedItem === item.id ? 'opacity-50' : ''}
                            ${result ? 'cursor-default' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            {!result && <GripVertical className="h-4 w-4 text-gray-400" />}
                            <span className="font-medium text-gray-900">{item.content}</span>
                            {isValidated && (
                              <span className="ml-1">
                                {isCorrect ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                              </span>
                            )}
                          </div>

                          {!result && (
                            <button
                              onClick={() => handleRemoveFromZone(zone.id, item.id)}
                              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {zoneItems.length === 0 && (
                      <p className="text-sm italic text-gray-400">Arrastra elementos aquí</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Item Bank */}
          <div className="lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Banco de elementos:</h3>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'bank')}
              className={`
                min-h-[200px] rounded-lg border-2 border-dashed p-4
                ${
                  draggedItem && draggedFrom !== 'bank'
                    ? 'border-gray-400 bg-gray-100'
                    : 'border-gray-300 bg-gray-50'
                }
              `}
            >
              <div className="space-y-2">
                {bankItems.map((item) => (
                  <div
                    key={item.id}
                    draggable={!result}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      cursor-move rounded-lg border-2 border-gray-300 bg-white px-4
                      py-2 transition-all hover:border-purple-400
                      hover:shadow-md
                      ${draggedItem === item.id ? 'opacity-50' : ''}
                      ${result ? 'cursor-default opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.content}</span>
                    </div>
                  </div>
                ))}

                {bankItems.length === 0 && (
                  <p className="py-8 text-center text-sm italic text-gray-400">
                    {result ? 'Todos los elementos colocados' : 'Todos los elementos están en uso'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Arrastra los elementos desde el banco hacia las zonas
                correctas. Puedes moverlos entre zonas si te equivocas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-6">
          <ExerciseFeedback
            feedback={feedback}
            explanation={result?.explanation || exercise.content.explanation}
            onClose={
              result?.is_correct || (result && result.score_percentage >= 70)
                ? () => onComplete(result)
                : () => setFeedback(null)
            }
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
          disabled={
            isSubmitting || result !== null || timer.isTimeExpired || completionPercentage < 100
          }
          className={`
            flex items-center rounded-lg px-8 py-3
            text-lg font-semibold transition-all
            ${
              completionPercentage === 100 && !isSubmitting && !result && !timer.isTimeExpired
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
