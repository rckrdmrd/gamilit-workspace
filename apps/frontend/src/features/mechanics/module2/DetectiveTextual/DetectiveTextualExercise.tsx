import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { EvidenceBoard } from './EvidenceBoard';
import { MagnifyingGlass } from './MagnifyingGlass';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import {
  fetchInvestigation,
  validateConnection,
  requestAIHint,
  submitSolution,
} from './detectiveTextualAPI';
import type {
  Investigation,
  DetectiveProgress,
  Evidence,
  EvidenceConnection,
  DetectiveTextualExerciseProps,
  DetectiveTextualState,
} from './detectiveTextualTypes';
import { calculateScore, saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockInvestigation } from './detectiveTextualMockData';

export const DetectiveTextualExercise: React.FC<DetectiveTextualExerciseProps> = ({
  moduleId,
  lessonId,
  exerciseId,
  userId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium',
  actionsRef,
}) => {
  // Load exercise data based on exerciseId
  const [investigation, setInvestigation] = useState<Investigation | null>(mockInvestigation);
  const [progress, setProgress] = useState<DetectiveProgress>({
    investigationId: exerciseId,
    discoveredEvidence: initialData?.discoveredEvidence || ['evidence-1'],
    connections: initialData?.connections || [],
    hypotheses: initialData?.hypotheses || [],
    hintsUsed: initialData?.hintsUsed || 0,
    timeSpent: initialData?.timeSpent || 0,
    score: initialData?.score || 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [availableCoins, setAvailableCoins] = useState(100);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // Load investigation data on mount if needed
  useEffect(() => {
    if (!investigation) {
      setInvestigation(mockInvestigation);
      setProgress((prev) => ({ ...prev, investigationId: exerciseId }));
    }
  }, [exerciseId]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveProgress(investigation?.id || '', {
        discoveredEvidence: progress.discoveredEvidence,
        connections: progress.connections,
        hypotheses: progress.hypotheses,
        hintsUsed: progress.hintsUsed,
        timeSpent: progress.timeSpent,
        score: progress.score,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [progress, investigation]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate && investigation) {
      const progressPercentage = (progress.discoveredEvidence.length / investigation.availableEvidence.length) * 100;
      onProgressUpdate({
        currentStep: progress.discoveredEvidence.length,
        totalSteps: investigation.availableEvidence.length,
        score: progress.score,
        hintsUsed: progress.hintsUsed,
        timeSpent: progress.timeSpent,
      });
    }
  }, [progress.discoveredEvidence.length, progress.score, progress.hintsUsed, progress.timeSpent, investigation, onProgressUpdate]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const handleDiscoverEvidence = (evidenceId: string) => {
    if (!progress.discoveredEvidence.includes(evidenceId)) {
      setProgress({
        ...progress,
        discoveredEvidence: [...progress.discoveredEvidence, evidenceId],
      });
      setAvailableCoins((prev) => prev + 5);
    }
  };

  const handleCreateConnection = async (
    fromId: string,
    toId: string,
    relationship: string
  ) => {
    try {
      const validation = await validateConnection(fromId, toId, relationship);

      const newConnection: EvidenceConnection = {
        id: `conn-${Date.now()}`,
        fromEvidenceId: fromId,
        toEvidenceId: toId,
        relationship,
        userCreated: true,
        isCorrect: validation.isCorrect,
      };

      setProgress({
        ...progress,
        connections: [...progress.connections, newConnection],
        score: progress.score + validation.score,
      });

      if (validation.isCorrect) {
        setAvailableCoins((prev) => prev + 15);
      }
    } catch (error) {
      console.error('Error validating connection:', error);
    }
  };

  const handleRemoveConnection = (connectionId: string) => {
    setProgress({
      ...progress,
      connections: progress.connections.filter((c) => c.id !== connectionId),
    });
  };

  const handleRequestHint = async () => {
    const hint = await requestAIHint(progress);
    setProgress({ ...progress, hintsUsed: progress.hintsUsed + 1 });
    setAvailableCoins((prev) => prev - 10);
    return hint;
  };

  const handleSubmitSolution = async () => {
    try {
      const result = await submitSolution(progress);

      // Calculate standardized score
      const attempt = {
        exerciseId: investigation?.id || '',
        startTime,
        endTime: new Date(),
        answers: { connections: progress.connections },
        correctAnswers: progress.connections.filter(c => c.isCorrect).length,
        totalQuestions: investigation?.correctConnections.length || 0,
        hintsUsed: progress.hintsUsed,
        difficulty: investigation?.difficulty || 'medio'
      };

      const score = await calculateScore(attempt);

      setFeedback({
        type: result.completed ? 'success' : 'partial',
        title: result.completed ? '¡Caso Resuelto!' : 'Investigación Incompleta',
        message: result.feedback,
        score,
        showConfetti: result.completed
      });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting solution:', error);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al enviar la solución. Intenta de nuevo.',
      });
      setShowFeedback(true);
    }
  };

  const handleReset = useCallback(() => {
    setProgress({
      investigationId: investigation?.id || '',
      discoveredEvidence: ['evidence-1'],
      connections: [],
      hypotheses: [],
      hintsUsed: 0,
      timeSpent: 0,
      score: 0,
    });
    setAvailableCoins(100);
    setFeedback(null);
    setShowFeedback(false);
  }, [investigation?.id]);

  // Get current state for parent component
  const getState = useCallback((): DetectiveTextualState => {
    return {
      discoveredEvidence: progress.discoveredEvidence,
      connections: progress.connections,
      hypotheses: progress.hypotheses,
      hintsUsed: progress.hintsUsed,
      timeSpent: progress.timeSpent,
      score: progress.score,
    };
  }, [progress]);

  // Populate actionsRef for parent component control
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        getState,
        reset: handleReset,
        validate: handleSubmitSolution,
        discoverEvidence: handleDiscoverEvidence,
        createConnection: handleCreateConnection,
      };
    }

    return () => {
      if (actionsRef) {
        actionsRef.current = undefined;
      }
    };
  }, [actionsRef, getState, handleReset, handleSubmitSolution, handleDiscoverEvidence, handleCreateConnection]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-detective-blue text-detective-xl">Cargando investigación...</div>
      </div>
    );
  }

  if (!investigation) {
    return <div>Error cargando investigación</div>;
  }

  return (
    <>
      {/* Main Exercise Content */}
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Exercise Description */}
          <div className="bg-gradient-to-r from-detective-blue to-detective-orange rounded-detective p-6 text-white shadow-detective-lg">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-8 h-8" />
              <h2 className="text-detective-2xl font-bold">{investigation.title}</h2>
            </div>
            <p className="text-detective-base opacity-90 mb-4">{investigation.description}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Misterio a resolver:</p>
              <p className="text-detective-base">{investigation.mystery}</p>
            </div>
          </div>

          {/* Evidence Board */}
          <EvidenceBoard
            evidence={investigation.availableEvidence}
            connections={progress.connections}
            onCreateConnection={handleCreateConnection}
            onRemoveConnection={handleRemoveConnection}
          />

          {/* Magnifying Glass Tool */}
          {selectedEvidence && (
            <MagnifyingGlass text={selectedEvidence.content} />
          )}
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
              onComplete(progress.score, progress.timeSpent);
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

export default DetectiveTextualExercise;
