import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Save, Download, Send, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { InteractiveCard } from './InteractiveCard';
import { DataVisualization } from './DataVisualization';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';
import { InfografiaInteractivaData, InfoCard } from './infografiaInteractivaTypes';
import {
  calculateScore,
  saveProgress,
  FeedbackData,
} from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

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
}

interface ExerciseState {
  cards: InfoCard[];
  droppedCards: Record<string, string>; // zoneId -> cardId
}

const getDefaultExercise = (exerciseId: string, difficulty: string): InfografiaInteractivaData => ({
  id: exerciseId,
  title: 'Infografía Interactiva',
  description: 'Explora la infografía interactiva revelando cada elemento',
  difficulty: difficulty as any,
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

export const InfografiaInteractivaExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium',
  exercise,
}) => {
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
    submit,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '', {
    onSuccess: (result) => {
      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Verificar si está pendiente de revisión manual
      if (result.status === 'pending_review' || result.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Infografía Enviada',
          message: 'Tu trabajo ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
          pendingReview: true,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Infografía Completada!',
        message: 'Tu trabajo ha sido evaluado correctamente.',
        score: result.score,
        xpEarned: result.rewards?.xp || 0,
        mlCoinsEarned: result.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(result.score, timeSpent);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: err?.message || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    },
  });

  const actionsRef = useRef<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>({});

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
      setTimeout(() => setFeedback(null), 2000);
    } else {
      // Incorrect placement
      setFeedback({
        type: 'error',
        title: 'Intenta de nuevo',
        message: 'Este elemento no corresponde a esa posición.',
        showConfetti: false,
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState: ExerciseState = { cards, droppedCards };
      saveProgress(exerciseId, currentState);
    }, 30000);

    return () => clearInterval(interval);
  }, [cards, droppedCards, exerciseId]);

  // Update progress

  useEffect(() => {
    const progress = calculateProgress();
    const revealedCount = cards.filter((c) => c.revealed).length;

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    onProgressUpdate?.({
      progress: {
        currentStep: useDragDrop ? Object.keys(droppedCards).length : revealedCount,
        totalSteps: cards.length,
        score: Math.round(progress),
        hintsUsed: 0,
        timeSpent: elapsed,
      },
      answers: {
        elementsExplored: cards.filter((c) => c.revealed).map((c) => c.id),
        droppedCards,
        interactions: cards.reduce((acc, card) => ({
          ...acc,
          [card.id]: card.revealed,
        }), {}),
      },
    });

    // Auto-complete when all cards are revealed or dropped correctly
    const allRevealed = useDragDrop
      ? Object.keys(droppedCards).length === cards.length
      : cards.every((c) => c.revealed);
    if (allRevealed && !showFeedback) {
      setTimeout(() => handleCheck(), 1000);
    }
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

  // Handle check/verification
  const handleCheck = async () => {
    const revealedCount = cards.filter((c) => c.revealed).length;

    if (revealedCount < cards.length) {
      setFeedback({
        type: 'error',
        title: 'Exploración Incompleta',
        message: `Has explorado ${revealedCount} de ${cards.length} elementos. Explora todos para completar.`,
        showConfetti: false,
      });
      setShowFeedback(true);
      return;
    }

    const score = calculateScore(cards.length, cards.length);

    setFeedback({
      type: 'success',
      title: '¡Infografía Completada!',
      message: `Has explorado todos los ${cards.length} elementos de la infografía. ¡Excelente trabajo!`,
      score,
      showConfetti: true,
    });
    setShowFeedback(true);
  };

  // Handle reset
  const handleReset = () => {
    setCards(currentExercise.cards);
    setFeedback(null);
    setShowFeedback(false);
  };

  // Handle save
  const handleSave = () => {
    const currentState: ExerciseState = { cards, droppedCards };
    saveProgress(exerciseId, currentState);

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
  const handleSubmit = () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    const revealedCount = cards.filter(c => c.revealed).length;
    const completionPercentage = (revealedCount / cards.length) * 100;

    submit({
      interactedElements: cards.filter(c => c.revealed).map(c => c.id),
      answers: cards.reduce((acc, card) => ({
        ...acc,
        [card.id]: card.revealed
      }), {}),
      completionPercentage,
    });
  };

  // Attach actions to ref

  useEffect(() => {
    actionsRef.current = {
      handleReset,
      handleCheck,
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
  }, [actionsRef]);

  // Get available cards (not yet dropped)
  const availableCards = cards.filter(card => !Object.values(droppedCards).includes(card.id));
  const activeCard = cards.find(card => card.id === activeId);

  return (
    <>
      <DetectiveCard variant="default" padding="lg" className="mb-6">
        {/* Header */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-800 to-orange-500 p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            <h2 className="text-detective-2xl font-bold">
              {currentExercise.title}
            </h2>
          </div>
          <p className="mb-4 opacity-90">{currentExercise.description}</p>
          <div className="flex flex-wrap gap-3">
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
          </div>
        </div>

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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
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
