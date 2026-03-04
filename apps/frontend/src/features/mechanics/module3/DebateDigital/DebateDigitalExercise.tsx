import { useState, useEffect, useRef, type MutableRefObject } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { debateTopic } from './debateDigitalMockData';
import type { DebateDigitalAnswers } from './debateDigitalTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

interface EssaySections {
  thesis: string;
  arguments_for: string;
  counterarguments: string;
  conclusion: string;
}

interface AdaptedDebateData {
  debateTitle?: string;
  question?: string;
  context?: string;
}

interface ExerciseProps {
  exerciseId: string;
  exercise?: AdaptedDebateData;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: Record<string, unknown>) => void;
  initialData?: ExerciseState;
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

interface ExerciseState {
  essaySections: EssaySections;
  userPosition: 'a_favor' | 'en_contra' | null;
}

const SECTION_CONFIG = [
  {
    key: 'thesis' as const,
    label: 'Tesis',
    placeholder: 'Define tu posicion principal sobre el tema del debate...',
    minChars: 50,
    maxChars: 500,
    rows: 3,
    description: 'Define tu posicion principal',
  },
  {
    key: 'arguments_for' as const,
    label: 'Argumentos a Favor',
    placeholder: 'Presenta al menos 2 argumentos que respalden tu posicion. Cada argumento debe estar bien fundamentado...',
    minChars: 100,
    maxChars: 1000,
    rows: 5,
    description: 'Presenta al menos 2 argumentos que respalden tu posicion',
  },
  {
    key: 'counterarguments' as const,
    label: 'Contraargumentos',
    placeholder: 'Que diria alguien en contra de tu posicion? Anticipa las objeciones y responde a ellas...',
    minChars: 80,
    maxChars: 800,
    rows: 4,
    description: 'Que diria alguien en contra de tu posicion?',
  },
  {
    key: 'conclusion' as const,
    label: 'Conclusion',
    placeholder: 'Sintetiza tu posicion final integrando tus argumentos y los contraargumentos que consideraste...',
    minChars: 80,
    maxChars: 800,
    rows: 4,
    description: 'Sintesis final de tu posicion',
  },
];

export const DebateDigitalExercise = ({
  exerciseId,
  exercise: adaptedExercise,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
}: ExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exerciseId);

  // Use adapted data from exercise prop, fallback to mock
  const currentTopic = {
    title: adaptedExercise?.debateTitle || debateTopic.title,
    question: adaptedExercise?.question || debateTopic.question,
    context: adaptedExercise?.context || debateTopic.context,
  };

  const [essaySections, setEssaySections] = useState<EssaySections>(
    initialData?.essaySections || {
      thesis: '',
      arguments_for: '',
      counterarguments: '',
      conclusion: '',
    },
  );
  const [userPosition, setUserPosition] = useState<'a_favor' | 'en_contra' | null>(
    initialData?.userPosition || null,
  );
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendScore, setBackendScore] = useState<number | null>(null);
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);
  const [backendRewards, setBackendRewards] = useState<{ xp: number; mlCoins: number } | null>(
    null,
  );
  const [isPendingReview, setIsPendingReview] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSaveStatus('saving');
      try {
        saveProgress();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (_error) {
        setSaveStatus('error');
      }
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essaySections, userPosition]);

  // Update progress with answers
  useEffect(() => {
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    const completedSections = SECTION_CONFIG.filter(
      (sec) => essaySections[sec.key].trim().length >= sec.minChars,
    ).length;

    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep: (userPosition ? 1 : 0) + completedSections,
          totalSteps: 5, // position + 4 sections
          score: 0,
          hintsUsed: 0,
          timeSpent: elapsed,
        },
        answers: {
          position: userPosition,
          sections: essaySections,
          completedSections,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essaySections, userPosition]);

  const saveProgress = () => {
    const state: ExerciseState = {
      essaySections,
      userPosition,
    };
    saveProgressUtil(exerciseId, state);
  };

  const allSectionsMeetMinimum = SECTION_CONFIG.every(
    (sec) => essaySections[sec.key].trim().length >= sec.minChars,
  );

  const canSubmit = userPosition !== null && allSectionsMeetMinimum;

  const handleSectionChange = (key: keyof EssaySections, value: string) => {
    setEssaySections((prev) => ({ ...prev, [key]: value }));
  };

  const handleComplete = async () => {
    if (!userPosition) {
      return;
    }

    if (!allSectionsMeetMinimum) {
      return;
    }

    // Validate user authentication
    if (!user?.id) {
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare answers in the format expected by backend
      const answers: DebateDigitalAnswers = {
        position: userPosition,
        response: `TESIS:\n${essaySections.thesis}\n\nARGUMENTOS A FAVOR:\n${essaySections.arguments_for}\n\nCONTRAARGUMENTOS:\n${essaySections.counterarguments}\n\nCONCLUSION:\n${essaySections.conclusion}`,
        arguments: [
          essaySections.thesis,
          essaySections.arguments_for,
          essaySections.counterarguments,
          essaySections.conclusion,
        ],
        messageCount: 4,
      };

      // Submit to backend
      const response = await submitAsync(answers as unknown as Record<string, unknown>);

      // Verificar si requiere revision manual del maestro
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setIsPendingReview(true);
        setBackendScore(null);
        setBackendFeedback(MANUAL_REVIEW_PENDING_SHORT_MESSAGE);
        setBackendRewards(null);

        await syncAndInvalidate();

        setShowFeedback(true);
        return;
      }

      // Flujo normal: ejercicio auto-calificado
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      setBackendScore(response.score);
      setBackendFeedback(response.feedback?.overall || null);
      setBackendRewards({ xp: rewards.xp, mlCoins: rewards.mlCoins });
      setIsPendingReview(false);

      await syncAndInvalidate();

      setShowFeedback(true);

      if (onComplete && response.score >= 70) {
        const finalTimeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        onComplete(response.score, finalTimeSpent);
      }
    } catch (_error) {
      setHasSubmitError(true);
      setBackendScore(null);
      setBackendFeedback(null);
      setBackendRewards(null);
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEssaySections({
      thesis: '',
      arguments_for: '',
      counterarguments: '',
      conclusion: '',
    });
    setUserPosition(null);
    setShowFeedback(false);
    setBackendScore(null);
    setBackendFeedback(null);
    setBackendRewards(null);
    setIsPendingReview(false);
    setHasSubmitError(false);
  };

  // Use ref to always have the latest handleComplete (avoids stale closure)
  const handleCompleteRef = useRef(handleComplete);
  handleCompleteRef.current = handleComplete;

  // Attach actions ref — delegates to ref to avoid stale closure
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: () => handleCompleteRef.current(),
      };
    }
  }, [actionsRef, handleReset]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <UnifiedExerciseLayout
        title="Debate Digital"
        description={currentTopic.title}
        icon={<FileText className="h-6 w-6" />}
        gradientClassName="from-detective-blue to-detective-orange"
        headerActions={
          <div className="text-sm">
            {saveStatus === 'saving' && <span className="text-white/90">Guardando...</span>}
            {saveStatus === 'saved' && <span className="text-green-200">Guardado</span>}
            {saveStatus === 'error' && <span className="text-red-200">Error al guardar</span>}
          </div>
        }
        headerChildren={
          <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm mt-3">
            <p className="font-medium text-white/95">{currentTopic.question}</p>
          </div>
        }
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Context */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-detective-lg bg-blue-50 p-3 sm:p-4 border border-detective-border-light"
          >
            <p className="text-detective-sm text-detective-text-secondary">
              {currentTopic.context}
            </p>
          </motion.div>

          {/* Position Selector */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-detective-lg bg-detective-bg p-2 sm:p-4 border border-detective-border-light"
          >
            <p className="text-detective-sm font-medium text-detective-text mb-3">
              Selecciona tu posicion en el debate:
            </p>
            <div className="flex gap-2 flex-wrap">
              <DetectiveButton
                variant={userPosition === 'a_favor' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setUserPosition('a_favor')}
              >
                A Favor
              </DetectiveButton>
              <DetectiveButton
                variant={userPosition === 'en_contra' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setUserPosition('en_contra')}
              >
                En Contra
              </DetectiveButton>
            </div>
            {userPosition === null && (
              <p className="text-detective-xs text-detective-text-secondary mt-2">
                Selecciona una posicion antes de escribir tu ensayo.
              </p>
            )}
          </motion.div>

          {/* Essay Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-detective-lg border-2 border-detective-blue bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6"
          >
            <h2 className="mb-4 flex items-center gap-2 text-detective-2xl font-bold text-detective-blue">
              <FileText className="h-6 w-6" />
              Ensayo Argumentativo
            </h2>
            <p className="mb-6 text-detective-base text-detective-text-secondary">
              Desarrolla tu ensayo completando las 4 secciones. Cada seccion tiene un mínimo de caracteres requerido.
            </p>

            <div className="space-y-6">
              {SECTION_CONFIG.map((section, idx) => {
                const value = essaySections[section.key];
                const charCount = value.trim().length;
                const meetsMinimum = charCount >= section.minChars;

                return (
                  <motion.div
                    key={section.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <label className="mb-1 block text-detective-base font-semibold text-detective-blue">
                      {idx + 1}. {section.label}
                    </label>
                    <p className="mb-2 text-detective-xs text-detective-text-secondary">
                      {section.description}
                    </p>
                    <textarea
                      value={value}
                      onChange={(e) => handleSectionChange(section.key, e.target.value)}
                      placeholder={section.placeholder}
                      className="w-full resize-none rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={section.rows}
                      maxLength={section.maxChars}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${meetsMinimum ? 'text-detective-success' : 'text-detective-danger'}`}
                      >
                        {charCount < section.minChars
                          ? `Faltan ${section.minChars - charCount} caracteres (min. ${section.minChars})`
                          : 'Completo'}
                      </p>
                      <p className="text-detective-sm text-detective-text-secondary">
                        {value.length}/{section.maxChars}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset} disabled={isSubmitting}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Completar Ejercicio'
              )}
            </DetectiveButton>
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        feedback={{
          type: hasSubmitError
            ? 'error'
            : isPendingReview
              ? 'info'
              : backendScore !== null
                ? backendScore >= 90
                  ? 'success'
                  : backendScore >= 70
                    ? 'partial'
                    : 'error'
                : 'info',
          title: hasSubmitError
            ? 'Error de Envío'
            : isPendingReview
              ? 'Ejercicio Enviado'
              : backendScore !== null
                ? backendScore >= 90
                  ? 'Excelente Ensayo!'
                  : backendScore >= 70
                    ? 'Buen Ensayo'
                    : 'Sigue Practicando'
                : 'Ensayo Enviado',
          message: hasSubmitError
            ? 'Hubo un problema al enviar tu ensayo. Por favor intenta de nuevo.'
            : backendFeedback ||
              'Tu ensayo argumentativo ha sido enviado para revision.',
          score: hasSubmitError ? undefined : isPendingReview ? undefined : (backendScore !== null ? backendScore : undefined),
          showConfetti: hasSubmitError ? false : isPendingReview ? false : (backendScore !== null ? backendScore >= 90 : false),
          xpEarned: hasSubmitError ? 0 : isPendingReview ? 0 : (backendRewards?.xp || 0),
          mlCoinsEarned: hasSubmitError ? 0 : isPendingReview ? 0 : (backendRewards?.mlCoins || 0),
          pendingReview: isPendingReview,
        }}
        onClose={() => {
          if (isPendingReview) {
            onExit?.();
            return;
          }
          setShowFeedback(false);
          if (!hasSubmitError && backendScore !== null && backendScore >= 70 && !isPendingReview) {
            onComplete?.(backendScore, timeSpent);
          }
        }}
        onRetry={hasSubmitError || !isPendingReview ? handleReset : undefined}
      />
    </>
  );
};

export default DebateDigitalExercise;
