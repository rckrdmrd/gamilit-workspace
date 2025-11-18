import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { SopaLetrasGrid } from './SopaLetrasGrid';
import { WordList } from './WordList';
import { SopaLetrasData, WordPosition } from './sopaLetrasTypes';
import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

export interface SopaLetrasExerciseProps {
  exercise: SopaLetrasData;
  onComplete?: () => void;
  onProgressUpdate?: (progress: any) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const SopaLetrasExercise: React.FC<SopaLetrasExerciseProps> = ({ exercise, onComplete, onProgressUpdate, actionsRef }) => {
  // Inicializar palabras combinando words + wordsPositions
  const initialWords: WordPosition[] = React.useMemo(() => {
    const wordsList = exercise.content.words || [];
    const positions = exercise.content.wordsPositions || [];

    const result = wordsList.map((item: string | any) => {
      // Handle both string[] and object[] formats
      const word = typeof item === 'string' ? item : (item?.word || item);
      const wordStr = String(word).toUpperCase();

      const position = positions.find((p: any) => {
        const posWord = String(p.word || '').toUpperCase();
        return posWord === wordStr;
      });

      return {
        word: wordStr,
        startRow: position?.startRow ?? -1,
        startCol: position?.startCol ?? -1,
        direction: position?.direction ?? 'horizontal',
        found: false,
      };
    });

    console.log('🎮 [SopaLetras] Palabras inicializadas:', result);
    return result;
  }, [exercise.content.words, exercise.content.wordsPositions]);

  const [words, setWords] = useState<WordPosition[]>(initialWords);
  const [selectedCells, setSelectedCells] = useState<{row:number,col:number}[]>([]);
  const [foundCells, setFoundCells] = useState<{row:number,col:number}[]>([]); // Celdas de palabras encontradas
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);

  // FE-055: Notify parent of progress updates WITH user answers
  React.useEffect(() => {
    if (onProgressUpdate) {
      const foundWords = words.filter(w => w.found).length;

      // Prepare user answers in format expected by backend
      const userAnswers = {
        foundWords: words.filter(w => w.found).map(w => w.word),
        wordsPositions: words.filter(w => w.found).map(w => ({
          word: w.word,
          startRow: w.startRow,
          startCol: w.startCol,
          direction: w.direction,
          found: w.found
        }))
      };

      // Send both progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: foundWords,
          totalSteps: words.length,
          score: Math.floor((foundWords / words.length) * 100),
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: userAnswers
      });

      console.log('📊 [SopaLetras] Progress update sent:', {
        foundWords: userAnswers.foundWords.length,
        totalWords: words.length
      });
    }
  }, [words, hintsUsed, onProgressUpdate, startTime]);

  // Función para validar si las celdas seleccionadas forman una palabra válida
  const validateSelection = React.useCallback((cells: {row:number,col:number}[]) => {
    if (cells.length === 0) return;

    // Extraer la palabra formada por las celdas seleccionadas
    const selectedWord = cells
      .map(cell => exercise.content.grid[cell.row]?.[cell.col])
      .filter(Boolean)
      .join('')
      .toUpperCase();

    if (!selectedWord) return;

    console.log('🔍 [SopaLetras] Validando palabra:', selectedWord);

    // Usar la forma funcional de setState para evitar problemas de closure
    setWords(prevWords => {
      // Buscar si coincide con alguna palabra conocida
      const matchedWordIndex = prevWords.findIndex(w => {
        const wordStr = String(w.word).toUpperCase();
        const isMatch = wordStr === selectedWord || wordStr === selectedWord.split('').reverse().join('');
        if (isMatch) {
          console.log('✅ [SopaLetras] Coincidencia encontrada:', wordStr, 'found:', w.found);
        }
        return isMatch;
      });

      if (matchedWordIndex >= 0 && !prevWords[matchedWordIndex].found) {
        console.log('🎯 [SopaLetras] Marcando palabra como encontrada:', prevWords[matchedWordIndex].word);

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
            else if (deltaRow === 0 && deltaCol < 0) wordToUpdate.direction = 'horizontal-reverse';
            else if (deltaCol === 0 && deltaRow > 0) wordToUpdate.direction = 'vertical';
            else if (deltaCol === 0 && deltaRow < 0) wordToUpdate.direction = 'vertical-reverse';
            else if (deltaRow > 0 && deltaCol > 0) wordToUpdate.direction = 'diagonal';
            else if (deltaRow > 0 && deltaCol < 0) wordToUpdate.direction = 'diagonal-reverse';
          }
        }

        updatedWords[matchedWordIndex] = wordToUpdate;

        // Agregar las celdas de esta palabra a foundCells para mantenerlas resaltadas
        console.log(`➕ [SopaLetras] Agregando ${cells.length} celdas a foundCells para palabra: ${wordToUpdate.word}`);
        setFoundCells(prev => {
          const newFoundCells = [...prev, ...cells];
          console.log(`📊 [SopaLetras] Total foundCells ahora: ${newFoundCells.length}`);
          return newFoundCells;
        });

        // Limpiar selección después de un breve delay para feedback visual
        setTimeout(() => setSelectedCells([]), 300);

        return updatedWords;
      } else if (matchedWordIndex >= 0) {
        console.log('⚠️ [SopaLetras] Palabra ya encontrada previamente');
        // Limpiar selección si la palabra ya fue encontrada
        setTimeout(() => setSelectedCells([]), 200);
      } else {
        console.log('❌ [SopaLetras] No se encontró coincidencia');
      }

      return prevWords;
    });
  }, [exercise.content.grid]);

  // Limpiar selección con tecla Escape o validar con Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('⌨️ [SopaLetras] ESC presionado - Limpiando selección');
        setSelectedCells([]);
      } else if (e.key === 'Enter' && selectedCells.length > 0) {
        console.log('⌨️ [SopaLetras] ENTER presionado - Validando selección');
        validateSelection(selectedCells);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCells, validateSelection]);

  const handleCellSelect = React.useCallback((row: number, col: number) => {
    console.log(`🖱️ [SopaLetras] Click en celda (${row}, ${col})`);

    // En sopa de letras, las celdas pueden ser reutilizadas cuando las palabras se cruzan
    // Solo verificamos que no esté ya seleccionada en la selección actual
    setSelectedCells(currentSelectedCells => {
      // Verificar si la celda ya está seleccionada en esta selección (evitar duplicados)
      const isAlreadySelected = currentSelectedCells.some(cell => cell.row === row && cell.col === col);

      if (isAlreadySelected) {
        console.log('⚠️ [SopaLetras] Celda ya seleccionada en la selección actual, ignorando');
        return currentSelectedCells;
      }

      const newSelection = [...currentSelectedCells, {row, col}];

      // Verificar si esta celda pertenece a una palabra ya encontrada
      const isInFoundWord = foundCells.some(cell => cell.row === row && cell.col === col);
      if (isInFoundWord) {
        console.log(`💡 [SopaLetras] Celda está en palabra encontrada pero permitimos reutilización para cruces`);
      }

      console.log(`📝 [SopaLetras] Selección actual: ${newSelection.length} celdas`);

      return newSelection;
    });
  }, [foundCells]);

  const handleCheck = React.useCallback(() => {
    console.log('📋 [SopaLetras] handleCheck iniciado');

    // Validar selección actual antes de verificar
    setSelectedCells(currentCells => {
      if (currentCells.length > 0) {
        console.log('🔄 [SopaLetras] Validando selección pendiente:', currentCells.length, 'celdas');
        validateSelection(currentCells);
      }
      return currentCells;
    });

    // Usar setTimeout para asegurar que el estado se actualice antes de calcular
    setTimeout(() => {
      setWords(currentWords => {
        const foundWords = currentWords.filter(w => w.found).length;
        const isComplete = foundWords === currentWords.length;
        const score = calculateScore(foundWords, exercise.content.words.length);

        console.log('📊 [SopaLetras] Estado final:', {
          foundWords,
          totalWords: currentWords.length,
          isComplete,
          score,
          words: currentWords.map(w => ({ word: w.word, found: w.found }))
        });

        setFeedback({
          type: isComplete ? 'success' : 'error',
          title: isComplete ? '¡Completado!' : 'Faltan palabras',
          message: isComplete ? '¡Encontraste todas las palabras!' : `Encontraste ${foundWords} de ${currentWords.length} palabras.`,
          score: isComplete ? score : undefined,
          showConfetti: isComplete
        });
        setShowFeedback(true);

        return currentWords;
      });
    }, 100);
  }, [validateSelection, exercise.content.words.length]);

  const handleReset = React.useCallback(() => {
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
        handleCheck
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SopaLetrasGrid
              grid={exercise.content.grid}
              selectedCells={selectedCells}
              foundCells={foundCells}
              onCellSelect={handleCellSelect}
            />
          </div>
          <div>
            <WordList words={words} />
          </div>
        </div>
      </DetectiveCard>

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
