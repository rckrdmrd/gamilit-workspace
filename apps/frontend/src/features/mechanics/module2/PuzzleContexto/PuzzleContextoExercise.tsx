import { useState, useEffect, type ReactNode } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Puzzle, GripVertical, RotateCcw } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { RankUpModal } from '@/features/gamification/ranks/components/RankUpModal';
import type { PuzzleContextoExerciseProps, Fragment } from './puzzleContextoTypes';
import { saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockPuzzleData } from './puzzleContextoMockData';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

interface DraggableFragmentItemProps {
  fragment: Fragment;
  index: number;
  showResults: boolean;
  getFragmentStyle: (fragment: Fragment, index: number) => string;
  getFragmentIcon: (fragment: Fragment, index: number) => ReactNode;
}

const DraggableFragmentItem = ({
  fragment,
  index,
  showResults,
  getFragmentStyle,
  getFragmentIcon,
}: DraggableFragmentItemProps) => {
  const controls = useDragControls();
  return (
    <Reorder.Item key={fragment.id} value={fragment} dragListener={false} dragControls={controls}>
      <motion.div
        whileHover={!showResults ? { scale: 1.02 } : {}}
        whileTap={!showResults ? { scale: 0.98 } : {}}
        className={`flex items-center gap-3 rounded-detective border-2 p-2 sm:p-4 transition-all ${getFragmentStyle(
          fragment,
          index,
        )} ${!showResults ? '' : 'cursor-default'}`}
      >
        {!showResults && (
          <div
            className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-grab touch-none"
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical className="h-5 w-5 text-detective-text-secondary" />
          </div>
        )}
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-detective-orange/20 text-detective-sm font-bold text-detective-orange">
          {fragment.label}
        </span>
        <div className="flex-1">
          <p className="text-detective-base text-detective-text">{fragment.text}</p>
        </div>
        {getFragmentIcon(fragment, index)}
      </motion.div>
    </Reorder.Item>
  );
};

export const PuzzleContextoExercise = ({
  exercise = mockPuzzleData,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
  comodinesContext,
}: PuzzleContextoExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);

  // Shuffle fragments initially
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [fragments, setFragments] = useState<Fragment[]>(
    initialData?.currentOrder
      ? initialData.currentOrder
          .map((id) => exercise.fragments.find((f) => f.id === id)!)
          .filter(Boolean)
      : shuffleArray(exercise.fragments),
  );
  const [showResults, setShowResults] = useState(false);
  const [hintsUsed] = useState(initialData?.hintsUsed || 0);
  const [_startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [rankUpData, setRankUpData] = useState<Record<string, unknown> | null>(null);

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
      saveProgress(exercise.id, {
        currentOrder: fragments.map((f) => f.id),
        isComplete: showResults,
        score,
        timeSpent,
        hintsUsed,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [fragments, showResults, score, timeSpent, hintsUsed, exercise.id]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate) {
      // FE-059: Removed local validation - correctOrder field no longer available
      // Validation is now done server-side via backend API

      // BE-FE-062: Prepare user answers in backend DTO format
      // Backend expects: { questions: {"q1": "option_a", "q2": "option_b"} }
      // Convert fragment positions to string format
      const userAnswers: Record<string, string> = {};
      fragments.forEach((frag, index) => {
        userAnswers[frag.id] = String(index);
      });

      // FE-044 FIX: Use stage-based progress instead of fragment count
      // Stage 1: Ordering fragments (50%)
      // Stage 2: Verified/Completed (100%)
      const currentStage = showResults ? 2 : 1;
      const totalStages = 2;

      onProgressUpdate({
        progress: {
          currentStep: currentStage, // FE-044 FIX: 1=Ordering, 2=Verified
          totalSteps: totalStages, // FE-044 FIX: 2 stages total
          score: showResults ? score : 0,
          hintsUsed,
          timeSpent,
        },
        answers: { questions: userAnswers }, // BE-FE-062: Wrap in questions object
      });
    }
  }, [fragments, showResults, score, hintsUsed, timeSpent, onProgressUpdate]);

  const handleCheck = async () => {
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

    setIsSubmitting(true);

    try {
      // BE-FE-062: Prepare answers in backend DTO format
      // Backend expects: { questions: {"frag1": "0", "frag2": "1", ...} }
      const userAnswers: Record<string, string> = {};
      fragments.forEach((frag, index) => {
        userAnswers[frag.id] = String(index);
      });

      // Submit to backend API
      const response = await submitAsync({ questions: userAnswers });

      if (response.rankUp) {
        setRankUpData(response.rankUp);
      }

      setShowResults(true);
      setScore(response.score);

      // CORRECCION-003: Agregar rewards al feedback
      const rewards = response.rewards || { mlCoins: 0, xp: 0 };

      // Second chance: if score < 70 and comodin active, allow retry
      if (response.score < 70 && comodinesContext?.hasSecondChance && !secondChanceUsed) {
        setSecondChanceUsed(true);
        setShowResults(false);
        setFeedback({
          type: 'info' as FeedbackData['type'],
          title: '¡Segunda Oportunidad!',
          message: 'Tu puntuación fue baja, pero tienes una segunda oportunidad. Reordena los fragmentos e intenta de nuevo.',
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
          `Has ordenado ${response.correctAnswersCount} de ${response.totalQuestions} fragmentos correctamente.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [PuzzleContexto] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFragments(shuffleArray(exercise.fragments));
    setShowResults(false);
    setScore(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  // Expose actions to parent
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        getState: () => ({
          currentOrder: fragments.map((f) => f.id),
          isComplete: showResults,
          score,
          timeSpent,
          hintsUsed,
        }),
        reset: handleReset,
        validate: async () => handleCheck(),
      };
    }
  }, [actionsRef]);

  const getFragmentStyle = (_fragment: Fragment, _index: number) => {
    // FE-059: Removed visual validation - correctOrder field no longer available
    // Visual feedback disabled until backend integration
    return 'border-detective-orange/30 bg-white hover:border-detective-orange hover:shadow-lg';
  };

  const getFragmentIcon = (_fragment: Fragment, _index: number) => {
    // FE-059: Removed visual validation - correctOrder field no longer available
    // Icon feedback disabled until backend integration
    return null;
  };

  // Build the current inference from fragments
  const currentInference = fragments.map((f) => f.text).join(' ');

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title}
        description={exercise.subtitle || exercise.description}
        icon={<Puzzle className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
      >
        {/* Objective */}
        {exercise.description && (
          <div className="rounded-lg border border-detective-border bg-white/95 p-2 sm:p-4 shadow-sm mb-6">
            <p className="text-detective-sm font-medium text-detective-text">Objetivo:</p>
            <p className="text-detective-base text-detective-text">{exercise.description}</p>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <div className="rounded-detective border-l-4 border-detective-blue bg-blue-50 p-2 sm:p-4 mb-6">
            <p className="text-detective-sm leading-relaxed text-detective-text">
              <strong>Instrucciones:</strong> {exercise.instructions}
            </p>
          </div>
        )}

        {/* Fragments to Order */}
        <div className="mb-6">
          <h3 className="mb-3 text-detective-lg font-semibold text-detective-blue">
            Fragmentos Desordenados
          </h3>
          <p className="mb-4 text-detective-sm text-detective-text-secondary">
            Arrastra los fragmentos para ordenarlos correctamente
          </p>

          <Reorder.Group
            axis="y"
            values={fragments}
            onReorder={setFragments}
            className="space-y-3"
          >
            {fragments.map((fragment, index) => (
              <DraggableFragmentItem
                key={fragment.id}
                fragment={fragment}
                index={index}
                showResults={showResults}
                getFragmentStyle={getFragmentStyle}
                getFragmentIcon={getFragmentIcon}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* Current Inference Preview */}
        <div className="mb-6">
          <h3 className="mb-3 text-detective-lg font-semibold text-detective-blue">
            Inferencia Actual
          </h3>
          <div className="rounded-detective border-2 border-purple-200 bg-purple-50 p-3 sm:p-6">
            <p className="text-detective-base italic leading-relaxed text-detective-text">
              "{currentInference}"
            </p>
          </div>
        </div>

        {/* Correct Inference (after validation) */}
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h3 className="mb-3 text-detective-lg font-semibold text-detective-success">
              Inferencia Correcta
            </h3>
            <div className="rounded-detective border-2 border-detective-success/20 bg-detective-success/10 p-3 sm:p-6">
              <p className="text-detective-base font-medium leading-relaxed text-detective-text">
                "{exercise.completeInference}"
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 border-t border-detective-border pt-6">
          {onExit && (
            <DetectiveButton variant="secondary" size="md" onClick={onExit}>
              Salir
            </DetectiveButton>
          )}
          <DetectiveButton
            variant="secondary"
            size="md"
            icon={<RotateCcw className="h-5 w-5" />}
            onClick={handleReset}
          >
            {showResults ? 'Intentar de Nuevo' : 'Mezclar de Nuevo'}
          </DetectiveButton>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (rankUpData) {
              setTimeout(() => setShowRankUpModal(true), 300);
            } else if (feedback?.type === 'success') {
              onComplete?.(score, timeSpent);
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}

      {showRankUpModal && rankUpData && (
        <RankUpModal
          isOpen={showRankUpModal}
          onClose={() => {
            setShowRankUpModal(false);
            setRankUpData(null);
            if (feedback?.type === 'success') {
              onComplete?.(score, timeSpent);
            }
          }}
        />
      )}
    </>
  );
};

export default PuzzleContextoExercise;
