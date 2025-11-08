import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { TimelineEvent } from './TimelineEvent';
import { TimelineData, TimelineEvent as TimelineEventType } from './timelineTypes';
import { calculateScore } from '@shared/components/mechanics/mechanicsTypes';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { Shuffle } from 'lucide-react';

export interface TimelineExerciseProps {
  exercise: TimelineData;
  onComplete?: () => void;
  onProgressUpdate?: (progress: any) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>;
}

export const TimelineExercise: React.FC<TimelineExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef
}) => {
  const [events, setEvents] = useState<TimelineEventType[]>([...exercise.events].sort(() => Math.random() - 0.5));
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [availableCoins, setAvailableCoins] = useState(100);

  // Calculate correct order by sorting events by year (matches backend logic)
  const correctOrder = React.useMemo(() => {
    return [...exercise.events]
      .sort((a, b) => a.year - b.year)
      .map(event => event.id);
  }, [exercise.events]);

  // Notify parent of progress updates
  React.useEffect(() => {
    if (onProgressUpdate) {
      const userOrder = events.map(e => e.id);
      const correctCount = userOrder.filter((id, idx) => id === correctOrder[idx]).length;
      onProgressUpdate({
        currentStep: correctCount,
        totalSteps: exercise.events.length,
        score: Math.floor((correctCount / exercise.events.length) * 100),
        hintsUsed,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, hintsUsed]);

  const handleCheck = async () => {
    const userOrder = events.map(e => e.id);
    const correct = userOrder.join(',') === correctOrder.join(',');
    const correctCount = userOrder.filter((id, idx) => id === correctOrder[idx]).length;

    const attempt = {
      exerciseId: exercise.id,
      startTime,
      endTime: new Date(),
      answers: { order: userOrder },
      correctAnswers: correctCount,
      totalQuestions: exercise.events.length,
      hintsUsed,
      difficulty: exercise.difficulty
    };

    const score = await calculateScore(attempt);

    setFeedback({
      type: correct ? 'success' : 'error',
      title: correct ? '¡Línea de Tiempo Correcta!' : 'Orden Incorrecto',
      message: correct
        ? '¡Excelente! Has ordenado todos los eventos correctamente.'
        : `${correctCount} de ${exercise.events.length} eventos están en la posición correcta.`,
      score: correct ? score : undefined,
      showConfetti: correct
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setEvents([...exercise.events].sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShowFeedback(false);
  };

  const handleShuffle = () => {
    setEvents([...events].sort(() => Math.random() - 0.5));
  };

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
        specificActions: [
          {
            label: 'Mezclar',
            icon: React.createElement(Shuffle, { className: 'w-4 h-4' }),
            onClick: handleShuffle,
            variant: 'blue' as const
          }
        ]
      };
    }
  }, [actionsRef, handleReset, handleCheck, handleShuffle]);

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <h3 className="text-lg font-bold mb-4">Arrastra los eventos para ordenarlos cronológicamente</h3>
        <Reorder.Group axis="y" values={events} onReorder={setEvents} className="space-y-3">
          {events.map((event, index) => (
            <Reorder.Item key={event.id} value={event}>
              <TimelineEvent event={event} index={index} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
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

export default TimelineExercise;
