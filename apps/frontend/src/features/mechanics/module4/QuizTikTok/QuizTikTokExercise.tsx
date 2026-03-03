import { useState, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Menu, X, Save, Award, Send, Loader2, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { TimerWidget } from '@shared/components/mechanics/TimerWidget';
import { ProgressTracker } from '@shared/components/mechanics/ProgressTracker';
import { TikTokCard } from './TikTokCard';
import { QuizTikTokData } from './quizTikTokTypes';
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
  exercise?: QuizTikTokData;
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
  currentIndex: number;
  answers: number[];
  justifications: Record<number, string>;
}

const getDefaultExercise = (exerciseId: string, difficulty: string): QuizTikTokData => ({
  id: exerciseId,
  title: 'Quiz TikTok',
  description: 'Responde las preguntas en formato TikTok',
  difficulty: difficulty as DifficultyLevel,
  estimatedTime: 300,
  topic: 'Marie Curie',
  hints: [],
  questions: [
    {
      id: 'q1',
      question: '¿En qué año nació Marie Curie?',
      options: ['1867', '1875', '1880', '1890'],
      correctAnswer: 0,
      backgroundColor: '#1f2937',
    },
    {
      id: 'q2',
      question: '¿Cuántos Premios Nobel ganó Marie Curie?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 1,
      backgroundColor: '#7c3aed',
    },
    {
      id: 'q3',
      question: '¿Qué elementos descubrió Marie Curie?',
      options: ['Uranio y Plutonio', 'Polonio y Radio', 'Helio y Neón', 'Oro y Plata'],
      correctAnswer: 1,
      backgroundColor: '#ea580c',
    },
    {
      id: 'q4',
      question: '¿Cuál fue la primera universidad en admitir a Marie Curie como profesora?',
      options: [
        'Universidad de Oxford',
        'Universidad de Cambridge',
        'Universidad de la Sorbona',
        'Universidad de Berlín',
      ],
      correctAnswer: 2,
      backgroundColor: '#2563eb',
    },
    {
      id: 'q5',
      question: '¿En qué campos ganó sus Premios Nobel?',
      options: [
        'Física y Medicina',
        'Física y Química',
        'Química y Medicina',
        'Física y Literatura',
      ],
      correctAnswer: 1,
      backgroundColor: '#059669',
    },
  ],
});

export const QuizTikTokExercise = ({
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
  const [currentIndex, setCurrentIndex] = useState(initialData?.currentIndex || 0);
  const [answers, setAnswers] = useState<number[]>(initialData?.answers || []);
  const [justifications, setJustifications] = useState<Record<number, string>>(initialData?.justifications || {});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const timerStartRef = useRef(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);

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
    if (currentExercise.questions.length === 0) return 0;
    return (answers.length / currentExercise.questions.length) * 100;
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(exerciseId, { data: { currentIndex, answers, justifications } });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentIndex, answers, justifications, exerciseId]);

  // Track visited nodes when changing questions
  useEffect(() => {
    if (!visitedNodesRef.current.includes(currentIndex)) {
      visitedNodesRef.current.push(currentIndex);
    }
  }, [currentIndex]);

  // Update progress
  useEffect(() => {
    const progress = calculateProgress();

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    onProgressUpdate?.({
      progress: {
        currentStep: answers.length,
        totalSteps: currentExercise.questions.length,
        score: 0,
        hintsUsed: 0,
        timeSpent: elapsed,
      },
      answers: {
        selectedAnswers: answers,
        justifications,
        currentQuestion: currentIndex,
        progressPercent: Math.round(progress),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, justifications, onProgressUpdate, startTime, currentIndex]);

  // Handle swipe navigation
  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < currentExercise.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle answer selection
  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle timeout - auto advance to next question
  const handleTimeout = () => {
    setTimeoutMessage('¡Tiempo agotado!');
    setTimeout(() => {
      setTimeoutMessage(null);
      if (currentIndex < currentExercise.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 1500);
  };

  // Handle reset
  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setJustifications({});
    setFeedback(null);
    setShowFeedback(false);
  };

  // Handle save
  const handleSave = () => {
    saveProgress(exerciseId, { data: { currentIndex, answers, justifications } });

    setFeedback({
      type: 'info',
      title: 'Progreso Guardado',
      message: 'Tu progreso ha sido guardado correctamente.',
      showConfetti: false,
    });
    setShowFeedback(true);
  };

  // Track visited questions (nodes) for swipe history
  const visitedNodesRef = useRef<number[]>([0]);

  // Handle submit
  const handleSubmit = async () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    const swipeHistory = visitedNodesRef.current;

    try {
      const response = await submitAsync({
        answers,
        justifications: currentExercise.questions.map((_, idx) => justifications[idx] || ''),
        swipeHistory,
      });
      setIsSubmitted(true);
      const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Check for manual review (MUST include 'submitted')
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Quiz Enviado',
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
        title: '¡Quiz Completado!',
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
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedActionsRef, answers, justifications]);

  if (currentExercise.questions.length === 0) {
    return (
      <UnifiedExerciseLayout
        title={currentExercise.title}
        description={currentExercise.description}
        icon={<PlayCircle className="h-8 w-8" />}
        cardPadding="lg"
      >
        <div className="flex items-center justify-center rounded-detective bg-detective-bg-secondary p-8 text-center">
          <p className="text-detective-text-secondary">No hay preguntas disponibles para este ejercicio.</p>
        </div>
      </UnifiedExerciseLayout>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title={currentExercise.title}
        description={currentExercise.description}
        icon={<PlayCircle className="h-8 w-8" />}
        headerActions={
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {answers.length} / {currentExercise.questions.length} respondidas
          </span>
        }
        cardPadding="none"
      >
        <div className="relative h-[70vh] w-full overflow-hidden bg-black rounded-b-lg">
          {/* Main TikTok-style vertical content */}
          <div className="relative mx-auto h-full w-full max-w-md bg-black">
            <AnimatePresence mode="wait">
              <TikTokCard
                key={currentIndex}
                question={currentExercise.questions[currentIndex]}
                onAnswer={handleAnswer}
                selectedAnswer={answers[currentIndex]}
                timeLimit={currentExercise.timeLimit || 30}
                onTimeout={handleTimeout}
              />
            </AnimatePresence>

            {/* Timeout Message */}
            {timeoutMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 rounded-xl bg-red-600/90 px-8 py-4 text-white shadow-lg">
                  <Clock className="h-6 w-6" />
                  <span className="text-xl font-bold">{timeoutMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Bottom Controls Container */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-3 p-4 pb-6">
              {/* Justification Input - shown after answering */}
              {answers[currentIndex] !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="rounded-detective bg-white/95 backdrop-blur-md p-3 shadow-lg border border-detective-border">
                    <label className="block text-detective-sm font-semibold text-detective-text mb-1">
                      Justifica tu respuesta (min. 30 caracteres):
                    </label>
                    <textarea
                      value={justifications[currentIndex] || ''}
                      onChange={(e) => setJustifications(prev => ({ ...prev, [currentIndex]: e.target.value }))}
                      placeholder="Explica por qué elegiste esta respuesta..."
                      className="w-full resize-none rounded-detective border border-detective-border p-2 text-sm focus:border-detective-orange focus:ring-1 focus:ring-detective-orange/50"
                      rows={2}
                    />
                    <p className={`mt-1 text-xs ${(justifications[currentIndex] || '').trim().length >= 30 ? 'text-detective-success' : 'text-detective-text-secondary'}`}>
                      {(justifications[currentIndex] || '').trim().length}/30 min
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <DetectiveButton
                    variant="secondary"
                    onClick={() => handleSwipe('up')}
                    disabled={currentIndex === 0}
                    icon={<ChevronUp />}
                    className="border-white/40 bg-white/90 text-detective-text backdrop-blur-md hover:bg-white"
                  >
                    Anterior
                  </DetectiveButton>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <DetectiveButton
                    variant="secondary"
                    onClick={() => handleSwipe('down')}
                    disabled={currentIndex === currentExercise.questions.length - 1}
                    icon={<ChevronDown />}
                    className="border-white/40 bg-white/90 text-detective-text backdrop-blur-md hover:bg-white"
                  >
                    Siguiente
                  </DetectiveButton>
                </motion.div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-3 text-center text-sm font-medium text-white">
                <span className="rounded-full bg-black/50 px-4 py-2 backdrop-blur-md">
                  Pregunta {currentIndex + 1} / {currentExercise.questions.length}
                </span>
                <span className="rounded-full bg-detective-orange/80 px-4 py-2 backdrop-blur-md">
                  {answers.length} respondidas
                </span>
              </div>
            </div>

            {/* Sidebar Toggle Button - Top Right */}
            <div className="absolute right-4 top-4 z-30">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <DetectiveButton
                  variant="gold"
                  onClick={() => setShowSidebar(!showSidebar)}
                  icon={showSidebar ? <X /> : <Menu />}
                  className="border-white/40 bg-white/90 text-detective-text backdrop-blur-md hover:bg-white"
                >
                  {showSidebar ? 'Cerrar' : 'Menú'}
                </DetectiveButton>
              </motion.div>
            </div>

            {/* Exit Button - Top Left */}
            <div className="absolute left-4 top-4 z-30">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <DetectiveButton
                  variant="secondary"
                  onClick={onExit}
                  className="border-white/40 bg-white/90 text-detective-text backdrop-blur-md hover:bg-white"
                >
                  Salir
                </DetectiveButton>
              </motion.div>
            </div>
          </div>

          {/* Floating Sidebar (Bottom Sheet on mobile) */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 z-40 h-full w-full sm:w-80 overflow-y-auto bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg"
              >
                <div className="space-y-4 p-3 sm:p-6">
                  {/* Close Button */}
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-detective-2xl font-bold text-detective-text">
                      Panel de Control
                    </h2>
                    <DetectiveButton
                      variant="secondary"
                      onClick={() => setShowSidebar(false)}
                      icon={<X />}
                    >
                      Cerrar
                    </DetectiveButton>
                  </div>

                  {/* Timer Widget */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <TimerWidget startTime={timerStartRef.current} isPaused={false} showSeconds={true} />
                  </motion.div>

                  {/* Progress Tracker */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ProgressTracker
                      currentStep={calculateProgress()}
                      totalSteps={100}
                      variant="circular"
                    />
                  </motion.div>

                  {/* Question Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <DetectiveCard variant="default" padding="md">
                      <h3 className="mb-3 flex items-center gap-2 font-bold text-detective-text">
                        <Award className="h-5 w-5 text-detective-orange" />
                        Estado de Preguntas
                      </h3>
                      <div className="space-y-2">
                        {currentExercise.questions.map((_, idx) => {
                          const isAnswered = answers[idx] !== undefined;
                          const hasJustification = (justifications[idx] || '').trim().length >= 30;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between rounded-detective p-2 transition-colors ${
                                idx === currentIndex
                                  ? 'bg-detective-orange text-white'
                                  : isAnswered && hasJustification
                                    ? 'bg-detective-success/10 text-detective-success'
                                    : isAnswered
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-detective-bg-secondary text-detective-text-secondary'
                              }`}
                            >
                              <span className="font-medium">Pregunta {idx + 1}</span>
                              <span className="text-xs">
                                {idx === currentIndex
                                  ? 'Actual'
                                  : isAnswered && hasJustification
                                    ? '✓ Completa'
                                    : isAnswered
                                      ? 'Sin justificación'
                                      : 'Pendiente'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </DetectiveCard>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <DetectiveCard variant="default" padding="md">
                      <div className="space-y-3">
                        <DetectiveButton
                          variant="blue"
                          icon={<Save />}
                          onClick={handleSave}
                          className="w-full"
                        >
                          Guardar Progreso
                        </DetectiveButton>
                        <DetectiveButton variant="gold" onClick={handleReset} className="w-full">
                          Reiniciar Quiz
                        </DetectiveButton>
                        <DetectiveButton
                          variant="primary"
                          onClick={handleSubmit}
                          disabled={
                            answers.length < currentExercise.questions.length ||
                            !currentExercise.questions.every((_, idx) => (justifications[idx] || '').trim().length >= 30) ||
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
                      </div>
                    </DetectiveCard>
                  </motion.div>

                  {/* Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <DetectiveCard variant="default" padding="md">
                      <h3 className="mb-3 font-bold text-detective-text">Instrucciones</h3>
                      <div className="space-y-2 text-detective-sm text-detective-text-secondary">
                        <p>Selecciona una respuesta para cada pregunta</p>
                        <p>Justifica cada respuesta (min. 30 caracteres)</p>
                        <p>Usa los botones para navegar entre preguntas</p>
                        <p>Responde y justifica todas las preguntas para enviar</p>
                      </div>
                    </DetectiveCard>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

export default QuizTikTokExercise;
