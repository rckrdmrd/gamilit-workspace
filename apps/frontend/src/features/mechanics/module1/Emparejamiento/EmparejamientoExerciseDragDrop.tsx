import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExerciseContainer } from '@shared/components/mechanics/ExerciseContainer';
import { ScoreDisplay } from '@shared/components/mechanics/ScoreDisplay';
import { TimerWidget } from '@shared/components/mechanics/TimerWidget';
import { ProgressTracker } from '@shared/components/mechanics/ProgressTracker';
import { HintSystem } from '@shared/components/mechanics/HintSystem';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { MatchingDragDrop, MatchingPair } from './MatchingDragDrop';
import { calculateScore, saveProgress } from '@shared/components/mechanics/mechanicsTypes';
import { Check, RotateCcw } from 'lucide-react';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

export interface EmparejamientoDragDropData {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  maxPoints: number;
  passingScore: number;
  estimatedTime: number;
  // Backend returns hints as string[]
  hints: string[];
  pairs: MatchingPair[];
  groupALabel?: string;
  groupBLabel?: string;
}

export interface EmparejamientoDragDropProps {
  exercise: EmparejamientoDragDropData;
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
}

export const EmparejamientoExerciseDragDrop: React.FC<EmparejamientoDragDropProps> = ({
  exercise,
  onComplete,
  onProgressUpdate: _onProgressUpdate,
}) => {
  const [connections, setConnections] = useState<Map<string, string>>(new Map());
  const [_hintsUsed, setHintsUsed] = useState(0);
  const [_availableCoins, setAvailableCoins] = useState(100);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [checkClicked, setCheckClicked] = useState(false);

  const handleConnect = (itemAId: string, itemBId: string) => {
    const newConnections = new Map(connections);
    newConnections.set(itemBId, itemAId);
    setConnections(newConnections);

    // Auto-save progress
    saveProgress(exercise.id, { connections: Array.from(newConnections.entries()) });
  };

  const handleDisconnect = (itemBId: string) => {
    const newConnections = new Map(connections);
    newConnections.delete(itemBId);
    setConnections(newConnections);
  };

  const handleUseHint = (hint: { id: string; text: string; cost: number }) => {
    setHintsUsed((prev) => prev + 1);
    setAvailableCoins((prev) => prev - hint.cost);
    alert(`Pista: ${hint.text}`);
  };

  const handleCheck = () => {
    setCheckClicked(true);
    const allConnected = connections.size === exercise.pairs.length;

    if (!allConnected) {
      setFeedback({
        type: 'error',
        title: 'Emparejamiento Incompleto',
        message: `Has emparejado ${connections.size} de ${exercise.pairs.length} elementos. Completa todas las parejas para verificar.`,
      });
      setShowFeedback(true);
      return;
    }

    // Check correctness
    let correctCount = 0;
    for (const [itemBId, itemAId] of connections.entries()) {
      const pair = exercise.pairs.find((p) => p.id === itemBId);
      if (pair && pair.itemA === itemAId) {
        correctCount++;
      }
    }

    const score = calculateScore(correctCount, exercise.pairs.length);
    setCurrentScore(score);

    const isSuccess = correctCount === exercise.pairs.length;

    setFeedback({
      type: isSuccess ? 'success' : 'error',
      title: isSuccess ? '¡Emparejamiento Completado!' : 'Revisa tus Parejas',
      message: isSuccess
        ? '¡Excelente trabajo! Has emparejado todos los elementos correctamente.'
        : `Has emparejado ${correctCount} de ${exercise.pairs.length} elementos correctamente. Revisa los marcados en rojo.`,
      score: isSuccess ? score : undefined,
      showConfetti: isSuccess,
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setConnections(new Map());
    setCheckClicked(false);
  };

  return (
    <ExerciseContainer exercise={exercise as any}>
      {/* Header Controls */}
      <DetectiveCard variant="default" padding="md" className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TimerWidget startTime={Date.now()} isPaused={false} showSeconds={true} />
            <ProgressTracker currentStep={connections.size} totalSteps={exercise.pairs.length} />
          </div>
          <div className="flex items-center gap-3">
            <HintSystem
              hints={exercise.hints}
              onHintUsed={(hintIndex) => {
                if (exercise.hints[hintIndex]) {
                  handleUseHint({
                    id: `hint-${hintIndex}`,
                    text: exercise.hints[hintIndex],
                    cost: 10,
                  });
                }
              }}
            />
            <DetectiveButton
              variant="blue"
              onClick={handleReset}
              icon={<RotateCcw className="h-5 w-5" />}
            >
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="gold"
              onClick={handleCheck}
              icon={<Check className="h-5 w-5" />}
            >
              Verificar
            </DetectiveButton>
          </div>
        </div>
        {currentScore > 0 && (
          <div className="mt-4">
            <ScoreDisplay score={currentScore} maxScore={100} />
          </div>
        )}
      </DetectiveCard>

      {/* Matching Drag & Drop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <MatchingDragDrop
          pairs={exercise.pairs}
          connections={connections}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          showFeedback={checkClicked}
          groupALabel={exercise.groupALabel}
          groupBLabel={exercise.groupBLabel}
        />
      </motion.div>

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
            setCheckClicked(false);
          }}
        />
      )}
    </ExerciseContainer>
  );
};

export default EmparejamientoExerciseDragDrop;
