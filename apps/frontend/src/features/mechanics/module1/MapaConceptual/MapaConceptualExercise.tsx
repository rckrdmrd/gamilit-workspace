import React, { useState, useEffect, useCallback } from 'react';
import { ExerciseContainer } from '@shared/components/mechanics/ExerciseContainer';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ConceptNode } from './ConceptNode';
import { ConnectionLine } from './ConnectionLine';
import { MapaConceptualData } from './mapaConceptualTypes';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';

export interface MapaConceptualExerciseProps {
  exercise: MapaConceptualData;
  onComplete?: () => void;
  onProgressUpdate?: (data: {
    progress: {
      currentStep: number;
      totalSteps: number;
      score: number;
      hintsUsed: number;
      timeSpent: number;
    };
    answers: Record<string, unknown>;
  }) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const MapaConceptualExercise: React.FC<MapaConceptualExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();

  const [connections, setConnections] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [validated, setValidated] = useState(false);

  // Ensure nodes array exists with fallback
  const nodes = exercise?.nodes || [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const correctConnections = exercise?.correctConnections || [];

  // FE-055: Notify parent of progress updates WITH user answers
  useEffect(() => {
    if (onProgressUpdate) {
      // Send both progress metadata AND user answers
      onProgressUpdate({
        progress: {
          currentStep: connections.length,
          totalSteps: correctConnections.length,
          score: 0, // FE-059: Score calculated by backend only
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { connections },
      });

      console.log('📊 [MapaConceptual] Progress update sent:', {
        connectionsCount: connections.length,
        totalExpected: correctConnections.length,
      });
    }
  }, [connections, hintsUsed, onProgressUpdate, correctConnections, startTime]);

  const handleNodeClick = (nodeId: string) => {
    if (validated) return; // No changes after validation
    if (!selectedNode) {
      setSelectedNode(nodeId);
    } else if (selectedNode !== nodeId) {
      const connId = `${selectedNode}-${nodeId}`;
      setConnections((prev) => [...prev, connId]);
      setSelectedNode(null);
    }
  };

  const handleCheck = useCallback(async () => {
    if (validated || isSubmitting) return;

    // Check if there are any connections
    if (connections.length === 0) {
      setFeedback({
        type: 'error',
        title: 'Sin Conexiones',
        message: 'Por favor, crea al menos una conexión entre los conceptos antes de verificar.',
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

    try {
      // Submit to backend API
      const response = await submitExercise(exercise.id, user.id, { connections });

      setValidated(true);

      // Show backend response with rewards
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Intenta de nuevo',
        message:
          response.feedback?.overall ||
          `Has obtenido ${response.correctAnswersCount} de ${response.totalQuestions} conexiones correctas (${Math.round(response.score)}%). Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await fetchUserProgress();
      await fetchBalance();

      console.log('✅ [MapaConceptual] Submission successful:', {
        attemptId: response.attemptId,
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('❌ [MapaConceptual] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [connections, validated, isSubmitting, user, exercise.id, fetchUserProgress, fetchBalance]);

  const handleReset = useCallback(() => {
    setConnections([]);
    setSelectedNode(null);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, []);

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

  // If no nodes, show message
  if (nodes.length === 0) {
    return (
      <ExerciseContainer exercise={exercise}>
        <DetectiveCard variant="default" padding="lg">
          <p className="text-center text-detective-text-secondary">
            Este ejercicio aún no tiene contenido disponible. Por favor, contacta a tu profesor.
          </p>
        </DetectiveCard>
      </ExerciseContainer>
    );
  }

  return (
    <ExerciseContainer exercise={exercise}>
      <DetectiveCard variant="default" padding="lg">
        <div className="relative h-[600px] w-full rounded-lg bg-gray-50">
          <svg className="absolute inset-0 h-full w-full">
            {connections.map((conn, i) => {
              const [fromId, toId] = conn.split('-');
              const from = nodes.find((n) => n.id === fromId);
              const to = nodes.find((n) => n.id === toId);
              return from && to ? <ConnectionLine key={i} from={from} to={to} /> : null;
            })}
          </svg>
          {nodes.map((node) => (
            <ConceptNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={() => handleNodeClick(node.id)}
            />
          ))}
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              onComplete();
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}
    </ExerciseContainer>
  );
};

export default MapaConceptualExercise;
