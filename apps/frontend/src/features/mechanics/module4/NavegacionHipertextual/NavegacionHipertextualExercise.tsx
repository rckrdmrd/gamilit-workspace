import { useState, useEffect } from 'react';
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

export const NavegacionHipertextualExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  exercise,
}: ExerciseProps) => {
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
  const [reflections, setReflections] = useState({ summary: '', alternative_route: '', most_important: '' });

  const {
    submitAsync,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '');

  const currentNode = exercise?.nodes?.find((n: HypertextNode) => n.id === currentNodeId);

  // Progress tracking
  // FIX: Send answers in DTO format (path, information_found) for ExercisePage.tsx submit button
  useEffect(() => {
    if (!exercise || !exercise.nodes || exercise.nodes.length === 0) return;
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
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
        score: 0,
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
  };

  // Handle submit
  // FIX: Transform data to match NavegacionHipertextualAnswerDto expected by backend
  const handleSubmit = async () => {
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

    try {
      // Submit in DTO format
      const response = await submitAsync({
        // Primary format expected by NavegacionHipertextualAnswerDto
        path: visitedNodes,
        information_found,
        summary: reflections.summary.trim(),
        reflection_questions: {
          alternative_route: reflections.alternative_route.trim(),
          most_important: reflections.most_important.trim(),
        },

        // Metadata for backwards compatibility and context
        metadata: {
          documentsVisited: uniqueVisited,
          timePerDocument,
          targetReached: visitedNodes.includes(exercise?.targetNodeId || ''),
          totalNodesExplored: uniqueVisited.length,
          totalNodesAvailable: exercise?.nodes?.length || 0,
        },
      });
      setIsSubmitted(true);
      const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Check for manual review (MUST include 'submitted')
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Navegación Enviada',
          message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        return;
      }

      // Normal graded flow
      setFeedback({
        type: 'success',
        title: '¡Navegación Completada!',
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
                <p className="text-xl sm:text-2xl font-bold text-detective-text">
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

          {/* Reflection Section - visible after reaching target */}
          {visitedNodes.includes(exercise.targetNodeId) && (
            <DetectiveCard variant="default" padding="lg">
              <h3 className="mb-4 text-detective-lg font-bold text-detective-text">
                Preguntas de Reflexión
              </h3>
              <p className="mb-4 text-detective-sm text-detective-text-secondary">
                Ahora que has completado la navegación, responde las siguientes preguntas:
              </p>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                    1. Resume lo que aprendiste durante la navegación (min. 150 caracteres)
                  </label>
                  <textarea
                    value={reflections.summary}
                    onChange={(e) => setReflections(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Durante mi navegación aprendí que..."
                    className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="mt-1 flex justify-between">
                    <p className={`text-detective-sm ${reflections.summary.trim().length >= 150 ? 'text-detective-success' : 'text-detective-danger'}`}>
                      {reflections.summary.trim().length < 150
                        ? `Faltan ${150 - reflections.summary.trim().length} caracteres`
                        : '✓ Completo'}
                    </p>
                    <p className="text-detective-sm text-detective-text-secondary">{reflections.summary.length}/1000</p>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                    2. ¿Qué ruta alternativa habrías tomado y por qué? (min. 80 caracteres)
                  </label>
                  <textarea
                    value={reflections.alternative_route}
                    onChange={(e) => setReflections(prev => ({ ...prev, alternative_route: e.target.value }))}
                    placeholder="Si pudiera navegar de nuevo, tomaría una ruta diferente..."
                    className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="mt-1 flex justify-between">
                    <p className={`text-detective-sm ${reflections.alternative_route.trim().length >= 80 ? 'text-detective-success' : 'text-detective-danger'}`}>
                      {reflections.alternative_route.trim().length < 80
                        ? `Faltan ${80 - reflections.alternative_route.trim().length} caracteres`
                        : '✓ Completo'}
                    </p>
                    <p className="text-detective-sm text-detective-text-secondary">{reflections.alternative_route.length}/500</p>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-detective-sm font-semibold text-detective-blue">
                    3. ¿Cuál fue la información más importante que encontraste? (min. 80 caracteres)
                  </label>
                  <textarea
                    value={reflections.most_important}
                    onChange={(e) => setReflections(prev => ({ ...prev, most_important: e.target.value }))}
                    placeholder="La información más importante fue..."
                    className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="mt-1 flex justify-between">
                    <p className={`text-detective-sm ${reflections.most_important.trim().length >= 80 ? 'text-detective-success' : 'text-detective-danger'}`}>
                      {reflections.most_important.trim().length < 80
                        ? `Faltan ${80 - reflections.most_important.trim().length} caracteres`
                        : '✓ Completo'}
                    </p>
                    <p className="text-detective-sm text-detective-text-secondary">{reflections.most_important.length}/500</p>
                  </div>
                </div>
              </div>
            </DetectiveCard>
          )}

          {/* Submit Button */}
          <DetectiveCard variant="default" padding="md">
            <DetectiveButton
              variant="primary"
              onClick={handleSubmit}
              disabled={
                !visitedNodes.includes(exercise.targetNodeId) ||
                reflections.summary.trim().length < 150 ||
                reflections.alternative_route.trim().length < 80 ||
                reflections.most_important.trim().length < 80 ||
                isSubmitting ||
                isSubmitted
              }
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
            if (feedback.pendingReview) {
              onExit?.();
              return;
            }
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
              onComplete(0, timeSpent);
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
