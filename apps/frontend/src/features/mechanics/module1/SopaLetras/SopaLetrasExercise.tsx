import { useState, useEffect, useMemo, useCallback, type MutableRefObject } from 'react';
import { Check, X, Search } from 'lucide-react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { SopaLetrasGrid } from './SopaLetrasGrid';
import { WordList } from './WordList';
import { SopaLetrasData, WordPosition } from './sopaLetrasTypes';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export interface SopaLetrasExerciseProps {
  exercise: SopaLetrasData;
  onComplete?: () => void;
  onProgressUpdate?: (data: {
    progress: {
      currentStep: number;
      totalSteps: number;
      score: number;
      hintsUsed: number;
      timeSpent: number;
    };
    answers: Record<string, unknown>;
  }) => void;
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const SopaLetrasExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}: SopaLetrasExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [_isSubmitting, _setIsSubmitting] = useState(false);

  // FE-059: Initialize words from words list only (wordsPositions field is sanitized)
  // User will discover positions by selecting cells in the grid
  const initialWords: WordPosition[] = useMemo(() => {
    const wordsList = exercise.content.words || [];

    const result = wordsList.map((item: string | any) => {
      // Handle both string[] and object[] formats
      const word = typeof item === 'string' ? item : item?.word || item;
      const wordStr = String(word).toUpperCase();

      // FE-059: Positions are unknown initially (-1, -1)
      // Will be calculated when user finds the word (lines 127-143)
      return {
        word: wordStr,
        startRow: -1,
        startCol: -1,
        direction: 'horizontal' as const,
        found: false,
      };
    });

    return result;
  }, [exercise.content.words]);

  const [words, setWords] = useState<WordPosition[]>(initialWords);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundCells, setFoundCells] = useState<{ row: number; col: number }[]>([]); // Celdas de palabras encontradas
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);

  // FE-055: Notify parent of progress updates WITH user answers
  useEffect(() => {
    if (onProgressUpdate) {
      const foundWords = words.filter((w) => w.found).length;

      // FE-059: Prepare user answers in backend DTO format
      // Backend validator expects: { words: ["MARIE", "CURIE", "NOBEL"] }
      const userAnswers = {
        words: words.filter((w) => w.found).map((w) => w.word),
      };

      // Send both progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: foundWords,
          totalSteps: words.length,
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: userAnswers,
      });

    }
  }, [words, hintsUsed, onProgressUpdate, startTime]);

  // Función para validar si las celdas seleccionadas forman una palabra válida
  const validateSelection = useCallback(
    (cells: { row: number; col: number }[]) => {
      if (cells.length === 0) return;

      // Extraer la palabra formada por las celdas seleccionadas
      const selectedWord = cells
        .map((cell) => exercise.content.grid[cell.row]?.[cell.col])
        .filter(Boolean)
        .join('')
        .toUpperCase();

      if (!selectedWord) return;

      // Usar la forma funcional de setState para evitar problemas de closure
      setWords((prevWords) => {
        // Buscar si coincide con alguna palabra conocida
        const matchedWordIndex = prevWords.findIndex((w) => {
          const wordStr = String(w.word).toUpperCase();
          const isMatch =
            wordStr === selectedWord || wordStr === selectedWord.split('').reverse().join('');
          return isMatch;
        });

        if (matchedWordIndex >= 0 && !prevWords[matchedWordIndex].found) {
          // Marcar la palabra como encontrada y guardar las posiciones de las celdas
          const updatedWords = [...prevWords];
          const wordToUpdate = { ...updatedWords[matchedWordIndex], found: true };

          // Si no tiene posiciones definidas, calcularlas desde las celdas seleccionadas
          if (wordToUpdate.startRow < 0 || wordToUpdate.startCol < 0) {
            wordToUpdate.startRow = cells[0].row;
            wordToUpdate.startCol = cells[0].col;

            // Detectar dirección basándose en las celdas seleccionadas
            if (cells.length > 1) {
              const deltaRow = cells[1].row - cells[0].row;
              const deltaCol = cells[1].col - cells[0].col;

              if (deltaRow === 0 && deltaCol > 0) wordToUpdate.direction = 'horizontal';
              else if (deltaRow === 0 && deltaCol < 0)
                wordToUpdate.direction = 'horizontal-reverse';
              else if (deltaCol === 0 && deltaRow > 0) wordToUpdate.direction = 'vertical';
              else if (deltaCol === 0 && deltaRow < 0) wordToUpdate.direction = 'vertical-reverse';
              else if (deltaRow > 0 && deltaCol > 0) wordToUpdate.direction = 'diagonal';
              else if (deltaRow > 0 && deltaCol < 0) wordToUpdate.direction = 'diagonal-reverse';
            }
          }

          updatedWords[matchedWordIndex] = wordToUpdate;

          // Agregar las celdas de esta palabra a foundCells para mantenerlas resaltadas
          setFoundCells((prev) => [...prev, ...cells]);

          // Limpiar selección después de un breve delay para feedback visual
          setTimeout(() => setSelectedCells([]), 300);

          return updatedWords;
        } else if (matchedWordIndex >= 0) {
          // Limpiar selección si la palabra ya fue encontrada
          setTimeout(() => setSelectedCells([]), 200);
        }

        return prevWords;
      });
    },
    [exercise.content.grid],
  );

  // Limpiar selección con tecla Escape o validar con Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCells([]);
      } else if (e.key === 'Enter' && selectedCells.length > 0) {
        validateSelection(selectedCells);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, validateSelection]);

  const handleCellSelect = useCallback(
    (row: number, col: number) => {
      // En sopa de letras, las celdas pueden ser reutilizadas cuando las palabras se cruzan
      // Solo verificamos que no esté ya seleccionada en la selección actual
      setSelectedCells((currentSelectedCells) => {
        // Verificar si la celda ya está seleccionada en esta selección (evitar duplicados)
        const isAlreadySelected = currentSelectedCells.some(
          (cell) => cell.row === row && cell.col === col,
        );

        if (isAlreadySelected) {
          return currentSelectedCells;
        }

        const newSelection = [...currentSelectedCells, { row, col }];

        return newSelection;
      });
    },
    [foundCells],
  );

  const handleCheck = useCallback(async () => {
    // Validar selección actual antes de verificar
    setSelectedCells((currentCells) => {
      if (currentCells.length > 0) {
        validateSelection(currentCells);
      }
      return currentCells;
    });

    // Usar setTimeout para asegurar que el estado se actualice antes de calcular
    setTimeout(async () => {
      const currentWords = words;
      const foundWords = currentWords.filter((w) => w.found).length;
      const isComplete = foundWords === currentWords.length;

      if (!isComplete) {
        setFeedback({
          type: 'error',
          title: 'Sopa de Letras Incompleta',
          message: `Has encontrado ${foundWords} de ${currentWords.length} palabras. Encuentra todas antes de verificar.`,
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

      _setIsSubmitting(true);

      try {
        // Prepare answers in backend DTO format: { words: ["MARIE", "CURIE"] }
        const foundWordsList = currentWords.filter((w) => w.found).map((w) => w.word);

        // Submit to backend API
        const response = await submitAsync({ words: foundWordsList });

        // Show backend response
        setFeedback({
          type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
          title: response.isPerfect
            ? '¡Perfecto!'
            : response.score >= 70
              ? '¡Buen trabajo!'
              : 'Intenta de nuevo',
          message:
            response.feedback?.overall ||
            `Has encontrado ${response.correctAnswersCount} de ${response.totalQuestions} palabras correctamente.`,
          score: response.score,
          xpEarned: response.rewards?.xp || 0,
          mlCoinsEarned: response.rewards?.mlCoins || 0,
          showConfetti: response.isPerfect,
        });
        setShowFeedback(true);

        // Sync stores with backend (rewards already calculated and saved by backend)
        await syncAndInvalidate();

        } catch (error) {
        console.error('❌ [SopaLetras] Submission error:', error);
        setFeedback({
          type: 'error',
          title: 'Error al Enviar',
          message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
        });
        setShowFeedback(true);
      } finally {
        _setIsSubmitting(false);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateSelection, words, user, exercise.id]);

  const handleReset = useCallback(() => {
    setWords(initialWords);
    setSelectedCells([]);
    setFoundCells([]); // Limpiar también las celdas encontradas
    setFeedback(null);
    setShowFeedback(false);
  }, [initialWords]);

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  // Handler para validar la selección actual (botón móvil)
  const handleValidateSelection = useCallback(() => {
    if (selectedCells.length > 0) {
      validateSelection(selectedCells);
    }
  }, [selectedCells, validateSelection]);

  // Handler para cancelar la selección actual
  const handleCancelSelection = useCallback(() => {
    setSelectedCells([]);
  }, []);

  // Obtener la palabra formada por las celdas seleccionadas (para mostrar preview)
  const selectedWord = useMemo(() => {
    if (selectedCells.length === 0) return '';
    return selectedCells
      .map((cell) => exercise.content.grid[cell.row]?.[cell.col])
      .filter(Boolean)
      .join('')
      .toUpperCase();
  }, [selectedCells, exercise.content.grid]);

  const foundWordsCount = words.filter((w) => w.found).length;
  const totalWords = words.length;
  const progress = totalWords > 0 ? (foundWordsCount / totalWords) * 100 : 0;

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Sopa de Letras'}
        description="Encuentra las palabras ocultas en la sopa de letras. Toca las letras para formar una palabra."
        icon={<Search className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Palabras: {foundWordsCount}/{totalWords}
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SopaLetrasGrid
              grid={exercise.content.grid}
              selectedCells={selectedCells}
              foundCells={foundCells}
              onCellSelect={handleCellSelect}
            />

            {/* Botones de validar/cancelar para móvil - Aparecen cuando hay selección */}
            {selectedCells.length > 0 && (
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {/* Preview de la palabra seleccionada */}
                <div className="rounded-lg border-2 border-blue-400 bg-blue-100 px-4 py-2 text-center">
                  <span className="text-sm font-medium text-blue-600">Palabra seleccionada:</span>
                  <span className="ml-2 text-lg font-bold text-blue-800">{selectedWord}</span>
                  <span className="ml-2 text-sm text-blue-500">
                    ({selectedCells.length} letras)
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={handleValidateSelection}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-green-700 active:scale-95"
                  >
                    <Check className="h-5 w-5" />
                    Validar Palabra
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    className="flex items-center gap-2 rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-gray-600 active:scale-95"
                  >
                    <X className="h-5 w-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Mensaje de ayuda cuando no hay selección */}
            {selectedCells.length === 0 && (
              <div className="mt-4 text-center text-sm text-detective-text-secondary">
                <p>
                  Toca las letras para formar una palabra, luego presiona{' '}
                  <strong>Validar Palabra</strong>
                </p>
                <p className="mt-1 text-xs">
                  (En PC tambien puedes usar Enter para validar o Escape para cancelar)
                </p>
              </div>
            )}
          </div>
          <div>
            <WordList words={words} />
          </div>
        </div>
      </UnifiedExerciseLayout>

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
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

export default SopaLetrasExercise;
