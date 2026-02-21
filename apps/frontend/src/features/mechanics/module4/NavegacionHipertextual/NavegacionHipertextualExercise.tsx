import React, { useState, useEffect } from 'react';
import { BookOpen, Navigation, CheckCircle, Send, Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { HypertextDocument } from './HypertextDocument';
import { NavigationBreadcrumbs } from './NavigationBreadcrumbs';
import type { ExerciseProps, HypertextNode } from './navegacionHipertextualTypes';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

export const NavegacionHipertextualExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // State management
  const [currentNodeId, setCurrentNodeId] = useState(
    initialData?.currentNodeId || exercise?.startNodeId || '',
  );
  const [visitedNodes, setVisitedNodes] = useState<string[]>(
    initialData?.visitedNodes || [exercise?.startNodeId || ''],
  );
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timePerDocument, setTimePerDocument] = useState<Record<string, number>>({});
  const [nodeStartTime, setNodeStartTime] = useState<Date>(new Date());

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
            title: 'Navegación Enviada',
            message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Navegación Completada!',
        message: 'Tu trabajo ha sido evaluado correctamente.',
        score: result.score,
        xpEarned: result.rewards?.xp || 0,
        mlCoinsEarned: result.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(result.score, timeSpent);
    },
    onError: (err: unknown) => {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: (err instanceof Error ? err.message : null) || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    },
  });

  const currentNode = exercise?.nodes?.find((n: HypertextNode) => n.id === currentNodeId);

  // Calculate score
  const calculateScore = () => {
    if (!exercise || !exercise.nodes || exercise.nodes.length === 0) return 0;
    const uniqueVisited = new Set(visitedNodes).size;
    const totalNodes = exercise.nodes.length;
    const targetReached = visitedNodes.includes(exercise.targetNodeId);
    const explorationScore = (uniqueVisited / totalNodes) * 60;
    const targetScore = targetReached ? 40 : 0;
    return Math.round(explorationScore + targetScore);
  };

  // Progress tracking
  // FIX: Send answers in DTO format (path, information_found) for ExercisePage.tsx submit button
  useEffect(() => {
    if (!exercise || !exercise.nodes || exercise.nodes.length === 0) return;
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const score = calculateScore();
    const uniqueVisited = new Set(visitedNodes).size;

    // Build information_found in DTO format
    const information_found: Record<string, unknown> = {};
    const uniqueVisitedIds = Array.from(new Set(visitedNodes));
    uniqueVisitedIds.forEach((nodeId) => {
      const node = exercise?.nodes?.find((n: { id: string }) => n.id === nodeId);
      if (node) {
        information_found[nodeId] = {
          title: node.title || nodeId,
          timeSpent: timePerDocument[nodeId] || 0,
          visited: true,
          contentPreview: node.content?.substring(0, 100) || 'Contenido explorado',
        };
      }
    });

    onProgressUpdate?.({
      progress: {
        currentStep: uniqueVisited,
        totalSteps: exercise.nodes.length,
        score,
        hintsUsed: 0,
        timeSpent,
      },
      answers: {
        // Primary format: DTO expected by backend
        path: visitedNodes,
        information_found,

        // Secondary format for backwards compatibility
        visitedNodes,
        currentNodeId,
        targetReached: visitedNodes.includes(exercise.targetNodeId || ''),

        // Metadata
        metadata: {
          navigationPath: visitedNodes,
          timePerDocument,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedNodes, currentNodeId, exercise, timePerDocument]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState = {
        currentNodeId,
        visitedNodes,
      };
      saveProgressUtil(exerciseId || 'nav-ex', currentState);
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentNodeId, visitedNodes, exerciseId]);

  // Handle link navigation
  const handleLinkClick = (targetId: string) => {
    // Track time spent on previous node
    const timeOnNode = Math.floor((new Date().getTime() - nodeStartTime.getTime()) / 1000);
    setTimePerDocument((prev) => ({
      ...prev,
      [currentNodeId]: (prev[currentNodeId] || 0) + timeOnNode,
    }));

    setCurrentNodeId(targetId);
    setVisitedNodes((prev) => [...prev, targetId]);
    setNodeStartTime(new Date());

    if (targetId === exercise?.targetNodeId) {
      // Target reached, show success after delay
      setTimeout(() => {
        handleCheck();
      }, 500);
    }
  };

  // Handle submit
  // FIX: Transform data to match NavegacionHipertextualAnswerDto expected by backend
  const handleSubmit = () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    // Build information_found object with data collected from each visited node
    const information_found: Record<string, unknown> = {};
    const uniqueVisited = Array.from(new Set(visitedNodes));

    uniqueVisited.forEach((nodeId) => {
      const node = exercise?.nodes?.find((n: HypertextNode) => n.id === nodeId);
      if (node) {
        information_found[nodeId] = {
          title: node.title || nodeId,
          timeSpent: timePerDocument[nodeId] || 0,
          visited: true,
          // Include any content summary if available
          contentPreview: node.content?.substring(0, 100) || 'Contenido explorado',
        };
      }
    });

    // Submit in DTO format
    submit({
      // Primary format expected by NavegacionHipertextualAnswerDto
      path: visitedNodes,
      information_found,

      // Metadata for backwards compatibility and context
      metadata: {
        documentsVisited: uniqueVisited,
        timePerDocument,
        targetReached: visitedNodes.includes(exercise?.targetNodeId || ''),
        totalNodesExplored: uniqueVisited.length,
        totalNodesAvailable: exercise?.nodes?.length || 0,
      },
    });
  };

  // Check/Verify handler
  const handleCheck = () => {
    if (!exercise || !exercise.nodes || exercise.nodes.length === 0) return;

    const score = calculateScore();
    const uniqueVisited = new Set(visitedNodes).size;
    const targetReached = visitedNodes.includes(exercise.targetNodeId || '');

    if (!targetReached) {
      setFeedback({
        type: 'info',
        title: 'Objetivo no alcanzado',
        message: `Has visitado ${uniqueVisited} de ${exercise.nodes.length} nodos. Continúa navegando hasta encontrar el objetivo.`,
      });
      setShowFeedback(true);
      return;
    }

    setFeedback({
      type: 'success',
      title: '¡Objetivo Alcanzado!',
      message: `¡Excelente navegación! Has explorado el hipertexto y encontrado el destino.`,
      score: score,
      showConfetti: true,
    });
    setShowFeedback(true);
  };

  if (!exercise || !exercise.nodes || exercise.nodes.length === 0) {
    return (
      <DetectiveCard variant="default" padding="lg">
        <p className="text-detective-text">
          {!exercise ? 'Cargando ejercicio...' : 'No hay contenido de navegación disponible para este ejercicio.'}
        </p>
      </DetectiveCard>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title="Navegación Hipertextual"
        description="Explora el hipertexto navegando entre nodos hasta encontrar el objetivo."
        icon={<BookOpen className="h-8 w-8" />}
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <DetectiveCard variant="default" padding="md">
            <div className="mb-2 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-detective-orange" />
              <h3 className="font-bold text-detective-text">Ruta de Navegación</h3>
            </div>
            <NavigationBreadcrumbs visitedNodes={visitedNodes} nodes={exercise.nodes} />
          </DetectiveCard>

          {/* Document */}
          <DetectiveCard variant="default" padding="lg">
            {currentNode && <HypertextDocument node={currentNode} onLinkClick={handleLinkClick} />}
          </DetectiveCard>

          {/* Progress Info */}
          <DetectiveCard variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-detective-text-secondary">Nodos visitados</p>
                <p className="text-2xl font-bold text-detective-text">
                  {new Set(visitedNodes).size} / {exercise.nodes.length}
                </p>
              </div>
              {visitedNodes.includes(exercise.targetNodeId) && (
                <div className="flex items-center gap-2 text-detective-success">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium">Objetivo alcanzado</span>
                </div>
              )}
            </div>
          </DetectiveCard>

          {/* Submit Button */}
          <DetectiveCard variant="default" padding="md">
            <DetectiveButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!visitedNodes.includes(exercise.targetNodeId) || isSubmitting || isSubmitted}
              className="w-full"
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
          </DetectiveCard>
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
            if (feedback.type === 'success' && onComplete) {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete(calculateScore(), timeSpent);
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
          }}
        />
      )}
    </>
  );
};

export default NavegacionHipertextualExercise;
