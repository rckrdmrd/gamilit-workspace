import { useState, useEffect, type MutableRefObject } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { CrucigramaGrid } from './CrucigramaGrid';
import { CrucigramaClue } from './CrucigramaClue';
import { CrucigramaData, CrucigramaCell } from './crucigramaTypes';
import { saveProgress } from '@shared/components/mechanics/mechanicsTypes';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export interface CrucigramaExerciseProps {
  exercise: CrucigramaData;
  onComplete?: () => void;
  onSubmit?: (answers: Record<string, unknown>) => Promise<void>;
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

export const CrucigramaExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}: CrucigramaExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [grid, setGrid] = useState<CrucigramaCell[][]>(
    exercise.grid.map((row) => row.map((cell) => ({ ...cell, userInput: cell.userInput || '' }))),
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [hintsUsed] = useState(0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // FE-059: Calculate clue length from grid instead of using answer field
  const getClueLength = (clue: (typeof exercise.clues)[0]): number => {
    // Guard against empty grid
    if (!grid || grid.length === 0 || !grid[0]) return 0;

    let length = 0;
    if (clue.direction === 'horizontal') {
      for (let i = 0; i < grid[0].length; i++) {
        const row = grid[clue.startRow];
        if (!row) break;
        const cell = row[clue.startCol + i];
        if (!cell || cell.isBlack) break;
        length++;
      }
    } else {
      for (let i = 0; i < grid.length; i++) {
        const row = grid[clue.startRow + i];
        if (!row) break;
        const cell = row[clue.startCol];
        if (!cell || cell.isBlack) break;
        length++;
      }
    }
    return length;
  };

  // FE-059: Check if clue has user input (NOT if it's correct)
  const hasClueInput = (clueId: string): boolean => {
    const clue = exercise.clues.find((c) => c.id === clueId);
    if (!clue) return false;

    const length = getClueLength(clue);
    if (length === 0) return false;

    let userAnswer = '';

    if (clue.direction === 'horizontal') {
      for (let i = 0; i < length; i++) {
        const row = grid[clue.startRow];
        const cell = row?.[clue.startCol + i];
        userAnswer += cell?.userInput || '';
      }
    } else {
      for (let i = 0; i < length; i++) {
        const row = grid[clue.startRow + i];
        const cell = row?.[clue.startCol];
        userAnswer += cell?.userInput || '';
      }
    }

    return userAnswer.trim().length === length;
  };

  // FE-055: Update completed clues and notify with answers
  useEffect(() => {
    // FE-059: Track clues with user input (not correctness)
    const newCompleted = new Set<string>();
    exercise.clues.forEach((clue) => {
      if (hasClueInput(clue.id)) {
        newCompleted.add(clue.id);
      }
    });
    setCompletedClues(newCompleted);

    // Auto-save progress
    saveProgress(exercise.id, { grid, completedClues: Array.from(newCompleted) });

    // FE-055: Notify parent component with progress AND user answers
    if (onProgressUpdate) {
      // Prepare user answers: clue-id: user's answer
      const userAnswers: Record<string, string> = {};
      exercise.clues.forEach((clue) => {
        const length = getClueLength(clue);
        let answer = '';

        if (clue.direction === 'horizontal') {
          for (let i = 0; i < length; i++) {
            const cell = grid[clue.startRow]?.[clue.startCol + i];
            answer += cell?.userInput || '';
          }
        } else {
          for (let i = 0; i < length; i++) {
            const cell = grid[clue.startRow + i]?.[clue.startCol];
            answer += cell?.userInput || '';
          }
        }
        if (answer) {
          userAnswers[clue.id] = answer;
        }
      });

      onProgressUpdate({
        progress: {
          currentStep: newCompleted.size,
          totalSteps: exercise.clues.length,
          score: Math.floor((newCompleted.size / exercise.clues.length) * 100),
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { clues: userAnswers },
      });

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, hintsUsed, exercise.clues, exercise.id, onProgressUpdate, startTime]);

  const handleCellInput = (row: number, col: number, value: string) => {
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].userInput = value.toUpperCase();
    setGrid(newGrid);
  };

  const handleCheck = async () => {
    const isComplete = completedClues.size === exercise.clues.length;

    if (!isComplete) {
      setFeedback({
        type: 'error',
        title: 'Crucigrama Incompleto',
        message: `Has completado ${completedClues.size} de ${exercise.clues.length} palabras. ¡Sigue intentando!`,
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

    try {
      // Prepare answers in backend DTO format: { clues: { c1: "WORD1", c2: "WORD2" } }
      const answersObj: Record<string, string> = {};
      exercise.clues.forEach((clue) => {
        const length = getClueLength(clue);
        let answer = '';

        if (clue.direction === 'horizontal') {
          for (let i = 0; i < length; i++) {
            const cell = grid[clue.startRow]?.[clue.startCol + i];
            answer += cell?.userInput || '';
          }
        } else {
          for (let i = 0; i < length; i++) {
            const cell = grid[clue.startRow + i]?.[clue.startCol];
            answer += cell?.userInput || '';
          }
        }

        if (answer) {
          answersObj[clue.id] = answer;
        }
      });

      // Submit to backend API
      const response = await submitAsync({ clues: answersObj });

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
            `Has obtenido ${response.correctAnswersCount} de ${response.totalQuestions} respuestas correctas.`,
          score: response.score,
          xpEarned: response.rewards?.xp || 0,
          mlCoinsEarned: response.rewards?.mlCoins || 0,
          showConfetti: response.isPerfect,
        });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [Crucigrama] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  };

  const handleReset = () => {
    setGrid(exercise.grid.map((row) => row.map((cell) => ({ ...cell, userInput: '' }))));
    setCompletedClues(new Set());
    setSelectedCell(null);
  };

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  const progress = exercise.clues.length > 0
    ? (completedClues.size / exercise.clues.length) * 100
    : 0;

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Crucigrama'}
        description="Completa el crucigrama escribiendo las respuestas en las celdas. Haz clic en una celda para seleccionarla y escribe la letra correspondiente."
        icon={<Grid3X3 className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Progreso: {completedClues.size}/{exercise.clues.length}
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
        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Grid */}
          <div className="flex justify-center lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CrucigramaGrid
                grid={grid}
                selectedCell={selectedCell}
                onCellClick={(row, col) => setSelectedCell({ row, col })}
                onCellInput={handleCellInput}
              />
            </motion.div>
          </div>

          {/* Clues - Unified Display */}
          <div>
            <CrucigramaClue clues={exercise.clues} completedClues={completedClues} direction="all" />
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

export default CrucigramaExercise;
