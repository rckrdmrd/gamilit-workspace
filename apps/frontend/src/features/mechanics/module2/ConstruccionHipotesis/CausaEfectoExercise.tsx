import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { RankUpModal } from '@/features/gamification/ranks/components/RankUpModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import type { CausaEfectoExerciseProps, CauseMatches } from './causaEfectoTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { DraggableConsequence } from './DraggableConsequence';
import { DroppableCauseZone } from './DroppableCauseZone';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const CausaEfectoExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}: CausaEfectoExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');

  const [matches, setMatches] = useState<CauseMatches>({});
  const [validated, setValidated] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [rankUpData, setRankUpData] = useState<Record<string, unknown> | null>(null);

  const { causes, consequences } = exercise.content;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  // Initialize empty matches for all causes
  useEffect(() => {
    const initialMatches: CauseMatches = {};
    causes.forEach((cause) => {
      initialMatches[cause.id] = [];
    });
    setMatches(initialMatches);
  }, [causes]);

  // FE-055 & FE-059: Notify parent of progress updates with user answers
  useEffect(() => {
    if (onProgressUpdate) {
      const totalMatches = Object.values(matches).reduce((sum, arr) => sum + arr.length, 0);

      // FE-059: Prepare user answers in backend DTO format
      // Backend expects: { causes: { c1: ["cons1", "cons2"] } }
      const userAnswers: Record<string, string[]> = {};
      Object.keys(matches).forEach((causeId) => {
        if (matches[causeId].length > 0) {
          userAnswers[causeId] = matches[causeId];
        }
      });

      // Send BOTH progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: totalMatches,
          totalSteps: consequences.length, // All consequences should be matched
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed: 0,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { causes: userAnswers },
      });

    }
  }, [matches, startTime, onProgressUpdate, consequences.length]);

  // FE-059: Removed calculateCurrentScore() - uses sanitized correctCauseIds field
  // Scoring is now done server-side via backend API

  // @dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    if (validated) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || validated) return;
    const consequenceId = active.id as string;
    const causeId = over.id as string;
    setMatches((prev) => {
      const newMatches = { ...prev };
      Object.keys(newMatches).forEach((cId) => {
        newMatches[cId] = newMatches[cId].filter((id) => id !== consequenceId);
      });
      if (newMatches[causeId] !== undefined) {
        newMatches[causeId] = [...newMatches[causeId], consequenceId];
      }
      return newMatches;
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleRemoveConsequence = (causeId: string, consequenceId: string) => {
    if (validated) return;

    setMatches((prev) => ({
      ...prev,
      [causeId]: prev[causeId].filter((id) => id !== consequenceId),
    }));
  };

  const isConsequenceAssigned = (consequenceId: string): boolean => {
    return Object.values(matches).some((arr) => arr.includes(consequenceId));
  };

  // FE-059: Removed getMatchCounts() - uses sanitized correctCauseIds field
  // Validation is now done server-side via backend API

  const handleCheck = useCallback(async () => {
    const totalMatches = Object.values(matches).reduce((sum, arr) => sum + arr.length, 0);
    const hasMatches = totalMatches > 0;

    if (!hasMatches) {
      setFeedback({
        type: 'error',
        title: 'Ejercicio Incompleto',
        message: 'Debes establecer al menos una relación causa-efecto antes de verificar.',
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

    setIsSubmitting(true);
    setValidated(true);

    try {
      // Prepare answers in backend DTO format: { causes: { c1: ["cons1", "cons2"] } }
      const userAnswers: Record<string, string[]> = {};
      Object.keys(matches).forEach((causeId) => {
        if (matches[causeId].length > 0) {
          userAnswers[causeId] = matches[causeId];
        }
      });

      // Submit to backend API
      const response = await submitAsync({ causes: userAnswers });

      // Check for rank up
      if (response.rankUp) {
        setRankUpData(response.rankUp);
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
          `Has establecido ${response.correctAnswersCount} de ${response.totalQuestions} relaciones correctas.`,
        score: response.score,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      console.error('❌ [CausaEfecto] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [matches, user, exercise.id, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    const initialMatches: CauseMatches = {};
    causes.forEach((cause) => {
      initialMatches[cause.id] = [];
    });
    setMatches(initialMatches);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, [causes]);

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  const activeConsequence = consequences.find((c) => c.id === activeId) ?? null;

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title}
        description="Conecta causas con sus consecuencias logicas"
        icon={<ArrowRight className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4 text-sm">
            Consecuencias asignadas:{' '}
            {Object.values(matches).reduce((sum, arr) => sum + arr.length, 0)} /{' '}
            {consequences.length}
          </div>
        }
      >
        {/* Instructions */}
        <div className="rounded border-l-4 border-amber-400 bg-amber-50 p-2 sm:p-4 mb-6">
          <p className="mb-2 text-detective-sm font-semibold leading-relaxed text-detective-text">
            Como funciona:
          </p>
          <ul className="list-inside list-disc space-y-1 text-detective-sm leading-relaxed text-detective-text">
            <li>
              <strong>Arrastra</strong> las consecuencias desde la columna derecha
            </li>
            <li>
              <strong>Sueltalas</strong> en la causa correspondiente en la columna izquierda
            </li>
            <li>
              Cada causa puede tener <strong>1-3 consecuencias</strong>
            </li>
            <li>Piensa en efectos inmediatos, a largo plazo e impacto en otros</li>
          </ul>
        </div>

        {/* Two-column layout: Causes | Consequences */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT: Causes (drop zones) */}
            <div className="space-y-4">
              <h3 className="mb-4 flex items-center gap-2 text-detective-lg font-bold text-detective-blue">
                <span className="text-xl sm:text-2xl">←</span> CAUSAS (Suelta aqui)
              </h3>
              {causes.map((cause, idx) => (
                <DroppableCauseZone
                  key={cause.id}
                  cause={cause}
                  index={idx}
                  matchedConsequences={(matches[cause.id] || [])
                    .map((cId) => consequences.find((c) => c.id === cId))
                    .filter(Boolean) as { id: string; text: string }[]}
                  validated={validated}
                  onRemove={handleRemoveConsequence}
                />
              ))}
            </div>

            {/* RIGHT: Consequences (draggable) */}
            <div className="space-y-4">
              <h3 className="mb-4 flex items-center gap-2 text-detective-lg font-bold text-detective-orange">
                CONSECUENCIAS (Arrastra) <span className="text-xl sm:text-2xl">→</span>
              </h3>
              <div className="space-y-3">
                {consequences.map((consequence, idx) => {
                  const isAssigned = isConsequenceAssigned(consequence.id);

                  // Si ya esta asignada, no la mostramos en la lista de disponibles
                  if (isAssigned) return null;

                  return (
                    <motion.div
                      key={consequence.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <DraggableConsequence
                        id={consequence.id}
                        text={consequence.text}
                        disabled={validated}
                      />
                    </motion.div>
                  );
                })}

                {/* If all consequences are assigned */}
                {consequences.filter((c) => !isConsequenceAssigned(c.id)).length === 0 && (
                  <div className="py-8 text-center text-detective-sm italic text-detective-text-secondary">
                    Todas las consecuencias han sido asignadas
                  </div>
                )}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeConsequence ? (
              <DraggableConsequence id={activeConsequence.id} text={activeConsequence.text} />
            ) : null}
          </DragOverlay>
        </DndContext>
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
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete?.(feedback.score || 0, timeSpent);
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}

      {/* Rank Up Modal */}
      {showRankUpModal && rankUpData && (
        <RankUpModal
          isOpen={showRankUpModal}
          onClose={() => {
            setShowRankUpModal(false);
            setRankUpData(null);
            if (feedback?.type === 'success') {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete?.(feedback.score || 0, timeSpent);
            }
          }}
        />
      )}
    </>
  );
};

export default CausaEfectoExercise;
