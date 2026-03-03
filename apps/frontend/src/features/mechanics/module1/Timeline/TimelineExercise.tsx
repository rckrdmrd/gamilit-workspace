import { useState, useEffect, useRef, createElement } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { TimelineEvent } from './TimelineEvent';
import { TimelineEvent as TimelineEventType, TimelineExerciseProps } from './timelineTypes';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { Clock, Shuffle } from 'lucide-react';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

// Re-export TimelineExerciseProps for use by parent components
export type { TimelineExerciseProps };

const DraggableTimelineItem = ({ event, index }: { event: TimelineEventType; index: number }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item value={event} dragListener={false} dragControls={controls}>
      <TimelineEvent event={event} index={index} dragControls={controls} />
    </Reorder.Item>
  );
};

export const TimelineExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
  comodinesContext,
}: TimelineExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);

  const [events, setEvents] = useState<TimelineEventType[]>(
    [...exercise.events].sort(() => Math.random() - 0.5),
  );
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hintsUsed] = useState(0);

  // FE-059: Removed local correctOrder calculation - validation is done server-side
  // Frontend only tracks that user has ordered the events, not if they're correct

  // FE-055: Notify parent of progress updates WITH user answers
  useEffect(() => {
    if (onProgressUpdate) {
      const userOrder = events.map((e) => e.id);

      // FE-044 FIX: Use stage-based progress instead of event count
      // Stage 1: Ordering events (50%)
      // Stage 2: Verified/Completed (100%)
      const currentStage = showFeedback ? 2 : 1;
      const totalStages = 2;

      // FE-059: No local validation - just track that events are ordered
      // Send both progress metadata AND user answers
      // BE-FE-062: Changed eventOrder → events to match backend DTO
      onProgressUpdate({
        progress: {
          currentStep: currentStage, // FE-044 FIX: 1=Ordering, 2=Verified
          totalSteps: totalStages, // FE-044 FIX: 2 stages total
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { events: userOrder },
      });

    }
  }, [events, hintsUsed, showFeedback, onProgressUpdate, startTime]);

  const handleCheck = async () => {
    const userOrder = events.map((e) => e.id);

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
      // Submit to backend API with DTO format: { events: ["e1", "e2", "e3"] }
      const response = await submitAsync({ events: userOrder });

      // Second chance: if score < 70 and comodin active, allow retry
      if (response.score < 70 && comodinesContext?.hasSecondChance && !secondChanceUsed) {
        setSecondChanceUsed(true);
        setFeedback({
          type: 'info' as FeedbackData['type'],
          title: '¡Segunda Oportunidad!',
          message: 'Tu puntuación fue baja, pero tienes una segunda oportunidad. Reordena los eventos e intenta de nuevo.',
          score: response.score,
        });
        setShowFeedback(true);
        return;
      }

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
          `Has ordenado ${response.correctAnswersCount} de ${response.totalQuestions} eventos correctamente.`,
        score: response.score,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [Timeline] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  };

  const handleReset = () => {
    setEvents([...exercise.events].sort(() => Math.random() - 0.5));
    setFeedback(null);
    setShowFeedback(false);
  };

  const handleShuffle = () => {
    setEvents([...events].sort(() => Math.random() - 0.5));
  };

  // Stable refs to always point to latest closures (avoids stale closure in useEffect)
  const handleCheckRef = useRef(handleCheck);
  handleCheckRef.current = handleCheck;
  const handleShuffleRef = useRef(handleShuffle);
  handleShuffleRef.current = handleShuffle;

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: () => handleCheckRef.current(),
        specificActions: [
          {
            label: 'Mezclar',
            icon: createElement(Shuffle, { className: 'w-4 h-4' }),
            onClick: () => handleShuffleRef.current(),
            variant: 'blue' as const,
          },
        ],
      };
    }
  }, [actionsRef, handleReset]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Línea de Tiempo'}
        description="Arrastra los eventos para ordenarlos cronológicamente"
        icon={<Clock className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
      >
        <Reorder.Group axis="y" values={events} onReorder={setEvents} className="space-y-3">
          {events.map((event, index) => (
            <DraggableTimelineItem key={event.id} event={event} index={index} />
          ))}
        </Reorder.Group>
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

export default TimelineExercise;
