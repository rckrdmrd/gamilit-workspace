import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
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

export const TimelineExercise: React.FC<TimelineExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

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
  React.useEffect(() => {
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

      console.log('📊 [Timeline] Progress update sent:', {
        currentStage,
        totalStages,
        isVerified: showFeedback,
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

      console.log('✅ [Timeline] Submission successful:', {
        attemptId: response.attemptId,
        score: response.score,
        rewards: response.rewards,
      });
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
            variant: 'blue' as const,
          },
        ],
      };
    }
  }, [actionsRef]);

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
            <Reorder.Item key={event.id} value={event}>
              <TimelineEvent event={event} index={index} />
            </Reorder.Item>
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
