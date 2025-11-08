import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { MatchingCard } from './MatchingCard';
import { EmparejamientoData } from './emparejamientoTypes';
import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

export interface EmparejamientoExerciseProps {
  exercise: EmparejamientoData;
  onComplete?: () => void;
  onProgressUpdate?: (progress: any) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const EmparejamientoExercise: React.FC<EmparejamientoExerciseProps> = ({ exercise, onComplete, onProgressUpdate, actionsRef }) => {
  const [cards, setCards] = useState(exercise.cards.sort(() => Math.random() - 0.5));
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);

  // Notify parent of progress updates
  React.useEffect(() => {
    if (onProgressUpdate) {
      const matched = cards.filter(c => c.isMatched).length;
      const totalPairs = cards.length / 2;
      const matchedPairs = matched / 2;
      onProgressUpdate({
        currentStep: matchedPairs,
        totalSteps: totalPairs,
        score: Math.floor((matchedPairs / totalPairs) * 100),
        hintsUsed,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      });
    }
  }, [cards, hintsUsed]);

  const handleCardClick = (cardId: string) => {
    if (!selectedCard) {
      setSelectedCard(cardId);
    } else {
      const card1 = cards.find(c => c.id === selectedCard);
      const card2 = cards.find(c => c.id === cardId);
      if (card1 && card2 && card1.matchId === card2.matchId) {
        setCards(cards.map(c => c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c));
      }
      setSelectedCard(null);
    }
  };

  const handleCheck = async () => {
    const matched = cards.filter(c => c.isMatched).length;
    const total = cards.length;
    const isComplete = matched === total;
    const score = await calculateScore({
      exerciseId: exercise.id, startTime, endTime: new Date(), answers: { cards }, correctAnswers: matched / 2, totalQuestions: total / 2, hintsUsed: 0, difficulty: exercise.difficulty
    });

    setFeedback({
      type: isComplete ? 'success' : 'error',
      title: isComplete ? '¡Completado!' : 'Faltan parejas',
      message: isComplete ? '¡Emparejaste todas las tarjetas correctamente!' : `Emparejaste ${matched / 2} de ${total / 2} parejas.`,
      score: isComplete ? score : undefined,
      showConfetti: isComplete
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setCards(exercise.cards.map(c => ({ ...c, isMatched: false })).sort(() => Math.random() - 0.5));
    setSelectedCard(null);
    setFeedback(null);
    setShowFeedback(false);
  };

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <MatchingCard key={card.id} card={card} isSelected={selectedCard === card.id} onClick={() => handleCardClick(card.id)} />
          ))}
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

export default EmparejamientoExercise;
