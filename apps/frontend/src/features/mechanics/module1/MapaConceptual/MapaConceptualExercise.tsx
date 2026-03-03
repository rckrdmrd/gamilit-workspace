import { useState, useEffect, useCallback, useRef, type MutableRefObject } from 'react';
import { GitBranch } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { ConceptNode } from './ConceptNode';
import { ConnectionLine } from './ConnectionLine';
import { MapaConceptualData } from './mapaConceptualTypes';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

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
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const MapaConceptualExercise = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}: MapaConceptualExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');


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
      const response = await submitAsync({ connections });

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
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

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
  }, [connections, validated, isSubmitting, user, exercise.id, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    setConnections([]);
    setSelectedNode(null);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, []);

  // Stable ref to always point to latest handleCheck (avoids stale closure in useEffect)
  const handleCheckRef = useRef(handleCheck);
  handleCheckRef.current = handleCheck;

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: () => handleCheckRef.current(),
      };
    }
  }, [actionsRef, handleReset]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = correctConnections.length > 0
    ? (connections.length / correctConnections.length) * 100
    : 0;

  // If no nodes, show message
  if (nodes.length === 0) {
    return (
      <UnifiedExerciseLayout
        title={exercise.title || 'Mapa Conceptual'}
        description="Este ejercicio aun no tiene contenido disponible."
        icon={<GitBranch className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
      >
        <p className="text-center text-detective-text-secondary">
          Este ejercicio aun no tiene contenido disponible. Por favor, contacta a tu profesor.
        </p>
      </UnifiedExerciseLayout>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Mapa Conceptual'}
        description="Conecta los conceptos relacionados haciendo clic en dos nodos consecutivos. Se creara una linea entre ellos mostrando la relacion."
        icon={<GitBranch className="h-8 w-8" />}
        cardVariant="default"
        cardPadding="lg"
        headerChildren={
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>
                Conexiones: {connections.length}/{correctConnections.length}
              </span>
              <span>{Math.round(Math.min(progress, 100))}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/50">
              <div
                className="h-full rounded-full bg-detective-gold transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        }
      >
        <DetectiveCard variant="default" padding="lg">
          <div className="relative h-[350px] sm:h-[600px] w-full overflow-auto rounded-lg bg-detective-bg">
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
      </UnifiedExerciseLayout>

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
    </>
  );
};

export default MapaConceptualExercise;
