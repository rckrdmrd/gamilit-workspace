import { useState, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Save, Download, Send, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { InteractiveCard } from './InteractiveCard';
import { DataVisualization } from './DataVisualization';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';
import { InfografiaInteractivaData, InfoCard } from './infografiaInteractivaTypes';
import {
  saveProgress,
  FeedbackData,
  type DifficultyLevel,
} from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

interface ProgressData {
  progress: {
    currentStep: number;
    totalSteps: number;
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  answers: Record<string, unknown>;
}

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ProgressData) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  exercise?: InfografiaInteractivaData;
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>;
}

interface ExerciseState {
  cards: InfoCard[];
  droppedCards: Record<string, string>; // zoneId -> cardId
}

const getDefaultExercise = (exerciseId: string, difficulty: string): InfografiaInteractivaData => ({
  id: exerciseId,
  title: 'Infografía Interactiva',
  description: 'Explora la infografía interactiva revelando cada elemento',
  difficulty: difficulty as DifficultyLevel,
  estimatedTime: 420,
  topic: 'Textos digitales interactivos',
  hints: [],
  cards: [
    {
      id: 'card-1',
      title: 'Descubrimientos de Marie Curie',
      content: 'Descubrió el polonio y el radio, revolucionando la física y la química.',
      position: { x: 20, y: 30 },
      icon: 'atom',
      revealed: false,
    },
    {
      id: 'card-2',
      title: 'Premios Nobel',
      content: 'Primera persona en ganar dos Premios Nobel en diferentes disciplinas científicas.',
      position: { x: 50, y: 30 },
      icon: 'award',
      revealed: false,
    },
    {
      id: 'card-3',
      title: 'Legado Científico',
      content: 'Sus investigaciones sentaron las bases de la radiología y la oncología moderna.',
      position: { x: 80, y: 30 },
      icon: 'microscope',
      revealed: false,
    },
    {
      id: 'card-4',
      title: 'Pionera en Ciencia',
      content:
        'Superó barreras de género para convertirse en una de las científicas más influyentes.',
      position: { x: 35, y: 70 },
      icon: 'star',
      revealed: false,
    },
    {
      id: 'card-5',
      title: 'Impacto Mundial',
      content: 'Su trabajo ha salvado millones de vidas a través de aplicaciones médicas.',
      position: { x: 65, y: 70 },
      icon: 'heart',
      revealed: false,
    },
  ],
  backgroundImage: undefined,
});

export const InfografiaInteractivaExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium',
  exercise,
  actionsRef,
}: ExerciseProps) => {
  const defaultExercise = getDefaultExercise(exerciseId, difficulty);
  const currentExercise = exercise || defaultExercise;
  const [cards, setCards] = useState<InfoCard[]>(initialData?.cards || currentExercise.cards);
  const [droppedCards, setDroppedCards] = useState<Record<string, string>>(initialData?.droppedCards || {});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useDragDrop, setUseDragDrop] = useState(true); // Toggle between modes
  const [analysisAnswers, setAnalysisAnswers] = useState({ relationship: '', surprising: '', summary: '' });

  // Drag and Drop sensors with support for touch devices
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold before drag starts (better for touch)
        tolerance: 5,
      },
    })
  );

  const {
    submitAsync,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '');

  const localActionsRef = useRef<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>({});
  const resolvedActionsRef = actionsRef || localActionsRef;

  // Calculate progress
  const calculateProgress = () => {
    if (useDragDrop) {
      return (Object.keys(droppedCards).length / cards.length) * 100;
    }
    const revealedCount = cards.filter((c) => c.revealed).length;
    return (revealedCount / cards.length) * 100;
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedCardId = active.id as string;
    const dropZoneId = over.id as string;

    // Check if the card is being dropped in its correct zone
    const isCorrectDrop = draggedCardId === dropZoneId;

    if (isCorrectDrop) {
      // Correct placement
      setDroppedCards(prev => ({
        ...prev,
        [dropZoneId]: draggedCardId,
      }));
      setCards(prev =>
        prev.map(card =>
          card.id === draggedCardId
            ? { ...card, revealed: true }
            : card
        )
      );

      // Show success feedback with animation
      setFeedback({
        type: 'success',
        title: '¡Correcto!',
        message: 'Has colocado el elemento en el lugar correcto.',
        showConfetti: false,
      });
      setShowFeedback(true);
      setTimeout(() => { setFeedback(null); setShowFeedback(false); }, 2000);
    } else {
      // Incorrect placement
      setFeedback({
        type: 'error',
        title: 'Intenta de nuevo',
        message: 'Este elemento no corresponde a esa posición.',
        showConfetti: false,
      });
      setShowFeedback(true);
      setTimeout(() => { setFeedback(null); setShowFeedback(false); }, 2000);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(exerciseId, { data: { cards, droppedCards } });
    }, 30000);

    return () => clearInterval(interval);
  }, [cards, droppedCards, exerciseId]);

  // Update progress
  useEffect(() => {
    const progress = calculateProgress();
    const revealedCount = cards.filter((c) => c.revealed).length;

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    // FIX: Send answers in DTO format (sections_explored, answers) for ExercisePage.tsx submit button
    const sections_explored = cards.filter((c) => c.revealed).map((c) => c.id);
    const answersData = cards.reduce((acc, card) => ({
      ...acc,
      [card.id]: card.revealed ? 'explored' : 'not_explored',
    }), {} as Record<string, string>);

    onProgressUpdate?.({
      progress: {
        currentStep: useDragDrop ? Object.keys(droppedCards).length : revealedCount,
        totalSteps: cards.length,
        score: Math.round(progress),
        hintsUsed: 0,
        timeSpent: elapsed,
      },
      answers: {
        // Primary format: DTO expected by backend
        sections_explored,
        answers: answersData,

        // Secondary format for backwards compatibility
        elementsExplored: sections_explored,
        droppedCards,

        // Metadata
        metadata: {
          interactions: cards.reduce((acc, card) => ({
            ...acc,
            [card.id]: card.revealed,
          }), {}),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, droppedCards, useDragDrop, onProgressUpdate, startTime]);

  // Handle card click
  const handleCardClick = (cardId: string) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, revealed: !c.revealed } : c)));
  };

  // Handle reveal all
  const handleRevealAll = () => {
    setCards((prev) => prev.map((c) => ({ ...c, revealed: true })));
  };

  // Handle reset
  const handleReset = () => {
    setCards(currentExercise.cards);
    setDroppedCards({});
    setAnalysisAnswers({ relationship: '', surprising: '', summary: '' });
    setFeedback(null);
    setShowFeedback(false);
  };

  // Handle save
  const handleSave = () => {
    saveProgress(exerciseId, { data: { cards, droppedCards } });

    setFeedback({
      type: 'info',
      title: 'Progreso Guardado',
      message: 'Tu exploración ha sido guardada correctamente.',
      showConfetti: false,
    });
    setShowFeedback(true);
  };

  // Handle export
  const handleExport = () => {
    const exportData = {
      title: currentExercise.title,
      cards: cards.map((c) => ({
        title: c.title,
        content: c.content,
        revealed: c.revealed,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infografia-${exerciseId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'info',
      title: 'Exportación Exitosa',
      message: 'La infografía se ha exportado correctamente.',
      showConfetti: false,
    });
    setShowFeedback(true);
  };

  // Handle submit
  // FIX: Transform data to match InfografiaInteractivaAnswerDto expected by backend
  const handleSubmit = async () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    const revealedCards = cards.filter((c) => c.revealed);
    const completionPercentage = (revealedCards.length / cards.length) * 100;

    // Build answers object with card details
    const dtoAnswers: Record<string, unknown> = {};
    revealedCards.forEach((card) => {
      dtoAnswers[card.id] = {
        title: card.title,
        content: card.content,
        revealed: true,
        position: card.position,
      };
    });

    try {
      const response = await submitAsync({
        // Primary format expected by InfografiaInteractivaAnswerDto
        answers: dtoAnswers,
        sections_explored: revealedCards.map((c) => c.id),
        analysis_questions: {
          relationship: analysisAnswers.relationship.trim(),
          surprising: analysisAnswers.surprising.trim(),
          summary: analysisAnswers.summary.trim(),
        },
        synthesis: `${analysisAnswers.relationship.trim()} ${analysisAnswers.surprising.trim()} ${analysisAnswers.summary.trim()}`,

        // Metadata for backwards compatibility
        metadata: {
          interactedElements: revealedCards.map((c) => c.id),
          useDragDrop,
          droppedCards,
          completionPercentage,
          totalCards: cards.length,
          revealedCards: revealedCards.length,
        },
      });
      setIsSubmitted(true);
      const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Check for manual review (MUST include 'submitted')
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Infografía Enviada',
          message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        onComplete?.(0, elapsedTime);
        return;
      }

      // Normal graded flow
      setFeedback({
        type: 'success',
        title: '¡Infografía Completada!',
        message: 'Tu trabajo ha sido evaluado correctamente.',
        score: response.score,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(response.score, elapsedTime);
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: (err instanceof Error ? err.message : null) || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    }
  };

  // Attach actions to ref
  useEffect(() => {
    resolvedActionsRef.current = {
      handleReset,
      specificActions: [
        {
          label: 'Guardar',
          icon: <Save className="h-4 w-4" />,
          onClick: handleSave,
          variant: 'blue',
        },
        {
          label: 'Exportar',
          icon: <Download className="h-4 w-4" />,
          onClick: handleExport,
          variant: 'gold',
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedActionsRef, cards, droppedCards]);

  // Get available cards (not yet dropped)
  const availableCards = cards.filter(card => !Object.values(droppedCards).includes(card.id));
  const activeCard = cards.find(card => card.id === activeId);

  return (
    <>
      <UnifiedExerciseLayout
        title={currentExercise.title}
        description={currentExercise.description}
        icon={<BarChart3 className="h-8 w-8" />}
        headerActions={
          <>
            <DetectiveButton
              variant={useDragDrop ? 'gold' : 'secondary'}
              icon={<Sparkles />}
              onClick={() => setUseDragDrop(!useDragDrop)}
            >
              {useDragDrop ? 'Modo Drag & Drop' : 'Modo Click'}
            </DetectiveButton>
            {!useDragDrop && (
              <DetectiveButton variant="gold" icon={<Eye />} onClick={handleRevealAll}>
                Revelar Todos
              </DetectiveButton>
            )}
          </>
        }
        cardPadding="lg"
      >
        {/* Data Visualization */}
        {!useDragDrop && (
          <div className="mb-6">
            <DataVisualization cards={cards} onCardClick={handleCardClick} />
          </div>
        )}

        {/* Drag and Drop Mode */}
        {useDragDrop ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="mb-6">
              <h2 className="mb-4 text-detective-lg font-bold text-detective-text">
                Zonas de Colocación
              </h2>
              <p className="mb-4 text-detective-sm text-detective-text-secondary">
                Arrastra cada concepto a su zona correspondiente
              </p>
              <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <DroppableZone
                      id={card.id}
                      title={card.title}
                      position={card.position}
                      isCorrect={droppedCards[card.id] === card.id}
                      isOccupied={!!droppedCards[card.id]}
                      droppedCard={cards.find(c => c.id === droppedCards[card.id])}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-4 text-detective-lg font-bold text-detective-text">
                Elementos Disponibles ({availableCards.length})
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableCards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <DraggableCard
                      id={card.id}
                      title={card.title}
                      content={card.content}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeCard ? (
                <DraggableCard
                  id={activeCard.id}
                  title={activeCard.title}
                  content={activeCard.content}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Click Mode - Interactive Cards Grid */
          <div className="mb-6">
            <h2 className="mb-4 text-detective-lg font-bold text-detective-text">
              Elementos de la Infografía
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <InteractiveCard card={card} onClick={() => handleCardClick(card.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Section - visible after all cards explored */}
        {cards.every(c => c.revealed) && (
          <div className="mb-6 rounded-detective-lg border-2 border-detective-blue bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6">
            <h2 className="mb-4 text-detective-2xl font-bold text-detective-blue">
              Preguntas de Análisis
            </h2>
            <p className="mb-6 text-detective-sm text-detective-text-secondary">
              Ahora que has explorado toda la infografía, responde estas preguntas:
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                  1. ¿Qué relación existe entre los descubrimientos y el legado de Marie Curie? (min. 80 caracteres)
                </label>
                <textarea
                  value={analysisAnswers.relationship}
                  onChange={(e) => setAnalysisAnswers(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="Los descubrimientos de Marie Curie están relacionados con..."
                  className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                  rows={3}
                  maxLength={500}
                />
                <div className="mt-1 flex justify-between">
                  <p className={`text-detective-sm ${analysisAnswers.relationship.trim().length >= 80 ? 'text-detective-success' : 'text-detective-danger'}`}>
                    {analysisAnswers.relationship.trim().length < 80
                      ? `Faltan ${80 - analysisAnswers.relationship.trim().length} caracteres`
                      : '✓ Completo'}
                  </p>
                  <p className="text-detective-sm text-detective-text-secondary">{analysisAnswers.relationship.length}/500</p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                  2. ¿Cuál es el dato más sorprendente de la infografía? ¿Por qué? (min. 80 caracteres)
                </label>
                <textarea
                  value={analysisAnswers.surprising}
                  onChange={(e) => setAnalysisAnswers(prev => ({ ...prev, surprising: e.target.value }))}
                  placeholder="El dato más sorprendente fue..."
                  className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                  rows={3}
                  maxLength={500}
                />
                <div className="mt-1 flex justify-between">
                  <p className={`text-detective-sm ${analysisAnswers.surprising.trim().length >= 80 ? 'text-detective-success' : 'text-detective-danger'}`}>
                    {analysisAnswers.surprising.trim().length < 80
                      ? `Faltan ${80 - analysisAnswers.surprising.trim().length} caracteres`
                      : '✓ Completo'}
                  </p>
                  <p className="text-detective-sm text-detective-text-secondary">{analysisAnswers.surprising.length}/500</p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                  3. Resume la información de la infografía en 3 oraciones (min. 100 caracteres)
                </label>
                <textarea
                  value={analysisAnswers.summary}
                  onChange={(e) => setAnalysisAnswers(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="La infografía presenta..."
                  className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                  rows={3}
                  maxLength={500}
                />
                <div className="mt-1 flex justify-between">
                  <p className={`text-detective-sm ${analysisAnswers.summary.trim().length >= 100 ? 'text-detective-success' : 'text-detective-danger'}`}>
                    {analysisAnswers.summary.trim().length < 100
                      ? `Faltan ${100 - analysisAnswers.summary.trim().length} caracteres`
                      : '✓ Completo'}
                  </p>
                  <p className="text-detective-sm text-detective-text-secondary">{analysisAnswers.summary.length}/500</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <DetectiveButton variant="secondary" onClick={onExit}>
            Salir
          </DetectiveButton>
          <DetectiveButton variant="blue" icon={<Save />} onClick={handleSave}>
            Guardar Progreso
          </DetectiveButton>
          <DetectiveButton variant="gold" icon={<Download />} onClick={handleExport}>
            Exportar
          </DetectiveButton>
          <DetectiveButton
            variant="primary"
            onClick={handleSubmit}
            disabled={
              (useDragDrop
                ? Object.keys(droppedCards).length < cards.length
                : !cards.every(c => c.revealed)) ||
              analysisAnswers.relationship.trim().length < 80 ||
              analysisAnswers.surprising.trim().length < 80 ||
              analysisAnswers.summary.trim().length < 100 ||
              isSubmitting ||
              isSubmitted
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Enviado
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar Respuestas
              </>
            )}
          </DetectiveButton>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={{
            ...feedback,
            xpEarned: feedback.xpEarned || 0,
            mlCoinsEarned: feedback.mlCoinsEarned || 0,
          }}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && feedback.score) {
              onComplete?.(feedback.score, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default InfografiaInteractivaExercise;
