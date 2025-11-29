import { useState, useCallback } from 'react';
import type { SubmitExerciseResponse } from '@/features/progress/api/progressTypes';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

interface UseRankUpNotificationReturn {
  // State
  showFeedbackModal: boolean;
  showRankUpModal: boolean;
  feedback: FeedbackData | null;
  rankUpData: SubmitExerciseResponse['rankUp'] | null;

  // Actions
  processSubmitResponse: (response: SubmitExerciseResponse) => FeedbackData;
  handleFeedbackClose: () => void;
  handleRankUpClose: () => void;
  reset: () => void;
}

export function useRankUpNotification(onComplete?: () => void): UseRankUpNotificationReturn {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [rankUpData, setRankUpData] = useState<SubmitExerciseResponse['rankUp'] | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'partial' | 'error'>('error');

  const processSubmitResponse = useCallback((response: SubmitExerciseResponse): FeedbackData => {
    // Determinar tipo de feedback
    const type = response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error';
    setFeedbackType(type);

    const feedbackData: FeedbackData = {
      type,
      title: response.isPerfect
        ? '¡Perfecto!'
        : response.score >= 70
          ? '¡Buen trabajo!'
          : 'Intenta de nuevo',
      message: response.feedback?.overall || `Puntaje: ${response.score}%`,
      score: response.score,
      showConfetti: response.isPerfect,
    };

    setFeedback(feedbackData);
    setShowFeedbackModal(true);

    // Guardar rankUp para mostrar después
    if (response.rankUp) {
      setRankUpData(response.rankUp);
    }

    return feedbackData;
  }, []);

  const handleFeedbackClose = useCallback(() => {
    setShowFeedbackModal(false);

    // Si hay rankUp, mostrar RankUpModal
    if (rankUpData) {
      // Pequeño delay para transición suave
      setTimeout(() => {
        setShowRankUpModal(true);
      }, 300);
    } else if (feedbackType === 'success') {
      onComplete?.();
    }
  }, [rankUpData, feedbackType, onComplete]);

  const handleRankUpClose = useCallback(() => {
    setShowRankUpModal(false);
    setRankUpData(null);

    if (feedbackType === 'success') {
      onComplete?.();
    }
  }, [feedbackType, onComplete]);

  const reset = useCallback(() => {
    setShowFeedbackModal(false);
    setShowRankUpModal(false);
    setFeedback(null);
    setRankUpData(null);
    setFeedbackType('error');
  }, []);

  return {
    showFeedbackModal,
    showRankUpModal,
    feedback,
    rankUpData,
    processSubmitResponse,
    handleFeedbackClose,
    handleRankUpClose,
    reset,
  };
}

export default useRankUpNotification;
