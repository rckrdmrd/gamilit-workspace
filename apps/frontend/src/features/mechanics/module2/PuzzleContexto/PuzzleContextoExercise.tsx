import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Puzzle, Check, GripVertical } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { fetchPuzzleExercise, validateAssembly } from './puzzleContextoAPI';
import type { PuzzleExercise, ContextPiece } from './puzzleContextoTypes';
import { calculateScore, saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockPuzzle } from './puzzleContextoMockData';

const categoryColors = {
  historical: 'bg-blue-100 border-blue-400',
  scientific: 'bg-green-100 border-green-400',
  personal: 'bg-purple-100 border-purple-400',
  social: 'bg-orange-100 border-orange-400',
};

interface ExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: number) => void;
  initialData?: Partial<ExerciseState>;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExerciseState {
  pieces: ContextPiece[];
  timeSpent: number;
  score: number;
  hintsUsed: number;
}

export const PuzzleContextoExercise: React.FC<ExerciseProps> = ({
  moduleId,
  lessonId,
  exerciseId,
  userId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium',
}) => {
  const [puzzle, setPuzzle] = useState<PuzzleExercise | null>(null);
  const [pieces, setPieces] = useState<ContextPiece[]>(initialData?.pieces || []);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hintsUsed, setHintsUsed] = useState(initialData?.hintsUsed || 0);

  // Track actions reference for parent component
  const actionsRef = useRef({
    handleReset: () => handleReset(),
    handleCheck: () => handleValidate(),
  });

  useEffect(() => {
    if (!puzzle) {
      setPuzzle(mockPuzzle);
      setPieces(mockPuzzle.pieces);
      setLoading(false);
    }
  }, [exerciseId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveProgress(puzzle?.id || '', {
        pieces,
        timeSpent,
        score,
        hintsUsed,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [pieces, timeSpent, score, hintsUsed, puzzle]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate && puzzle) {
      const correctOrder = puzzle.correctOrder || [];
      const correctCount = pieces.filter((piece, index) => {
        return correctOrder[index] === piece.id;
      }).length;
      onProgressUpdate({
        currentStep: correctCount,
        totalSteps: pieces.length,
        score: score,
        hintsUsed: hintsUsed,
        timeSpent: timeSpent,
      });
    }
  }, [pieces.length, puzzle?.correctOrder, score, hintsUsed, timeSpent, onProgressUpdate]);

  const loadPuzzle = async () => {
    try {
      const data = await fetchPuzzleExercise('puzzle-1');
      setPuzzle(data);
      setPieces(data.pieces);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    const assembled = pieces.map((p) => ({ id: p.id, content: p.content }));
    const res = await validateAssembly(assembled);
    setResult(res);

    // Calculate standardized score
    const attempt = {
      exerciseId: puzzle?.id || '',
      startTime,
      endTime: new Date(),
      answers: { pieces: assembled },
      correctAnswers: res.correctCount || 0,
      totalQuestions: pieces.length,
      hintsUsed,
      difficulty: puzzle?.difficulty || 'medio'
    };

    const calculatedScore = await calculateScore(attempt);
    setScore(calculatedScore.totalScore);

    setFeedback({
      type: res.isCorrect ? 'success' : 'partial',
      title: res.isCorrect ? '¡Perfecto!' : 'Buen intento',
      message: res.feedback,
      score: calculatedScore,
      showConfetti: res.isCorrect
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    if (puzzle) {
      setPieces([...puzzle.pieces]);
      setResult(null);
      setScore(0);
      setFeedback(null);
      setShowFeedback(false);
    }
  };

  if (loading || !puzzle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-detective-blue text-detective-xl">Cargando puzzle...</div>
      </div>
    );
  }

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-detective-blue to-detective-orange rounded-detective p-6 text-white shadow-detective-lg">
            <div className="flex items-center gap-3 mb-2">
              <Puzzle className="w-8 h-8" />
              <h1 className="text-detective-3xl font-bold">{puzzle.title}</h1>
            </div>
            <p className="text-detective-lg opacity-90">{puzzle.description}</p>
          </div>

          {/* Main Content */}
          <div className="mt-6">
            <h3 className="text-detective-lg font-semibold text-detective-blue mb-4">
              Arrastra para Ordenar el Contexto
            </h3>
            <Reorder.Group axis="y" values={pieces} onReorder={setPieces} className="space-y-3">
              {pieces.map((piece, idx) => (
                <Reorder.Item key={piece.id} value={piece}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-move flex items-start gap-3 ${categoryColors[piece.category]}`}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-detective-xs font-bold uppercase px-2 py-1 bg-white rounded">
                          {piece.category}
                        </span>
                        <span className="text-detective-xs text-gray-600">Posición: {idx + 1}</span>
                      </div>
                      <p className="text-detective-sm">{piece.content}</p>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            {onExit && (
              <DetectiveButton
                variant="secondary"
                size="lg"
                onClick={onExit}
              >
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton
              variant="gold"
              size="lg"
              onClick={handleValidate}
              icon={<Check className="w-5 h-5" />}
            >
              Validar Orden
            </DetectiveButton>
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
              onComplete(score, timeSpent);
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

export default PuzzleContextoExercise;
