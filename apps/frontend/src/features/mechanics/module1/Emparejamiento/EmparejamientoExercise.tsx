import React, { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { MatchingCard } from './MatchingCard';
import { EmparejamientoExerciseProps } from './emparejamientoTypes';
import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
// P0-02: Added 2025-12-18 - Backend submission for progress persistence
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const EmparejamientoExercise: React.FC<EmparejamientoExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [cards, setCards] = useState(exercise.cards.sort(() => Math.random() - 0.5));
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);

  // P0-02: Added 2025-12-18 - Hooks for backend submission
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();

  // FE-055: Notify parent of progress updates WITH user answers
  React.useEffect(() => {
    if (onProgressUpdate) {
      const matched = cards.filter((c) => c.isMatched).length;
      const totalPairs = cards.length / 2;
      const matchedPairs = matched / 2;

      // Prepare user answers: array of matched pairs
      const matchedCards = cards.filter((c) => c.isMatched);
      const matches: Array<{ leftId: string; rightId: string }> = [];

      // Group matched cards by matchId
      const matchGroups: Record<string, typeof cards> = {};
      matchedCards.forEach((card) => {
        if (!matchGroups[card.matchId]) {
          matchGroups[card.matchId] = [];
        }
        matchGroups[card.matchId].push(card);
      });

      // Create matches array
      Object.values(matchGroups).forEach((group) => {
        if (group.length === 2) {
          const left = group.find((c) => c.type === 'question');
          const right = group.find((c) => c.type === 'answer');
          if (left && right) {
            matches.push({ leftId: left.id, rightId: right.id });
          }
        }
      });

      // Send both progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: matchedPairs,
          totalSteps: totalPairs,
          score: Math.floor((matchedPairs / totalPairs) * 100),
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { matches },
      });

      console.log('📊 [Emparejamiento] Progress update sent:', {
        matchedPairs,
        totalPairs,
      });
    }
  }, [cards, hintsUsed, onProgressUpdate, startTime]);

  const handleCardClick = (cardId: string) => {
    if (!selectedCard) {
      setSelectedCard(cardId);
    } else {
      const card1 = cards.find((c) => c.id === selectedCard);
      const card2 = cards.find((c) => c.id === cardId);
      if (card1 && card2 && card1.matchId === card2.matchId) {
        setCards(
          cards.map((c) =>
            c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c,
          ),
        );
      }
      setSelectedCard(null);
    }
  };

  const handleCheck = async () => {
    const matched = cards.filter((c) => c.isMatched).length;
    const total = cards.length;
    const isComplete = matched === total;
    const score = calculateScore(matched / 2, total / 2);

    // P0-02: Submit to backend when complete
    if (isComplete && user?.id) {
      try {
        // Prepare matched pairs for submission
        const matchedCards = cards.filter((c) => c.isMatched);
        const matchGroups: Record<string, typeof cards> = {};
        matchedCards.forEach((card) => {
          if (!matchGroups[card.matchId]) {
            matchGroups[card.matchId] = [];
          }
          matchGroups[card.matchId].push(card);
        });

        const matches = Object.values(matchGroups).map((group) => {
          const left = group.find((c) => c.type === 'question');
          const right = group.find((c) => c.type === 'answer');
          return { leftId: left?.id, rightId: right?.id, matchId: left?.matchId };
        });

        const response = await submitAsync({ matches });

        // Invalidate dashboard to reflect new progress
        await syncAndInvalidate();

        console.log('✅ [Emparejamiento] Submitted to backend:', response);

        setFeedback({
          type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
          title: response.isPerfect
            ? '¡Perfecto!'
            : response.score >= 70
              ? '¡Buen trabajo!'
              : 'Sigue practicando',
          message: response.isPerfect
            ? '¡Emparejaste todas las tarjetas correctamente!'
            : `Obtuviste ${response.score}% de aciertos.`,
          score: response.score,
          xpEarned: response.rewards?.xp || 0,
          mlCoinsEarned: response.rewards?.mlCoins || 0,
          showConfetti: response.isPerfect,
        });
      } catch (error) {
        console.error('❌ [Emparejamiento] Submit error:', error);
        // Fallback to local feedback on error
        setFeedback({
          type: 'success',
          title: '¡Completado!',
          message: '¡Emparejaste todas las tarjetas correctamente!',
          score,
          showConfetti: true,
        });
      }
    } else {
      // Not complete or no user - show local feedback
      setFeedback({
        type: isComplete ? 'success' : 'error',
        title: isComplete ? '¡Completado!' : 'Faltan parejas',
        message: isComplete
          ? '¡Emparejaste todas las tarjetas correctamente!'
          : `Emparejaste ${matched / 2} de ${total / 2} parejas.`,
        score: isComplete ? score : undefined,
        showConfetti: isComplete,
      });
    }
    setShowFeedback(true);
  };

  const handleReset = () => {
    setCards(
      exercise.cards.map((c) => ({ ...c, isMatched: false })).sort(() => Math.random() - 0.5),
    );
    setSelectedCard(null);
    setFeedback(null);
    setShowFeedback(false);
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

  const matched = cards.filter((c) => c.isMatched).length;
  const totalPairs = cards.length / 2;
  const matchedPairs = matched / 2;
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Emparejamiento'}
        description="Encuentra las parejas haciendo clic en dos tarjetas que coincidan. Las tarjetas emparejadas correctamente permaneceran visibles."
        icon={<Link2 className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Parejas: {matchedPairs}/{totalPairs}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <MatchingCard
              key={card.id}
              card={card}
              isSelected={selectedCard === card.id}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
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

export default EmparejamientoExercise;
