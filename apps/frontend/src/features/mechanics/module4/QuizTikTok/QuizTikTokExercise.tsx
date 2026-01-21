import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Menu, X, Save, Award, Send, Loader2, CheckCircle } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { TimerWidget } from '@shared/components/mechanics/TimerWidget';
import { ProgressTracker } from '@shared/components/mechanics/ProgressTracker';
import { ScoreDisplay } from '@shared/components/mechanics/ScoreDisplay';
import { TikTokCard } from './TikTokCard';
import { QuizTikTokData } from './quizTikTokTypes';
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
  exercise?: QuizTikTokData;
}

interface ExerciseState {
  currentIndex: number;
  answers: number[];
  questionTimes: number[]; // Time taken for each question in seconds
  questionScores: number[]; // Score for each question (with time penalty)
}

const getDefaultExercise = (exerciseId: string, difficulty: string): QuizTikTokData => ({
  id: exerciseId,
  title: 'Quiz TikTok',
  description: 'Responde las preguntas en formato TikTok',
  difficulty: difficulty as any,
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

export const QuizTikTokExercise: React.FC<ExerciseProps> = ({
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
  const [currentIndex, setCurrentIndex] = useState(initialData?.currentIndex || 0);
  const [answers, setAnswers] = useState<number[]>(initialData?.answers || []);
  const [questionTimes, setQuestionTimes] = useState<number[]>(initialData?.questionTimes || []);
  const [questionScores, setQuestionScores] = useState<number[]>(initialData?.questionScores || []);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  const [currentScore, setCurrentScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const TIME_LIMIT_PER_QUESTION = 30; // 30 seconds per question

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
            title: 'Quiz Enviado',
            message: 'Tu trabajo ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
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
        title: '¡Quiz Completado!',
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

  // Calculate score with time penalty
  const calculateScoreWithTimePenalty = (baseScore: number, timeElapsed: number, totalTime: number) => {
    const timePenalty = (timeElapsed / totalTime) * 0.5; // Maximum 50% penalty
    return Math.max(50, Math.round(baseScore * (1 - timePenalty))); // Minimum 50 points
  };

  // Calculate progress
  const calculateProgress = () => {
    return (answers.length / currentExercise.questions.length) * 100;
  };

  // Calculate current score (with time penalties)
  const calculateCurrentScore = () => {
    if (questionScores.length === 0) return 0;
    const totalScore = questionScores.reduce((sum, score) => sum + score, 0);
    return Math.floor(totalScore / currentExercise.questions.length);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState: ExerciseState = { currentIndex, answers, questionTimes, questionScores };
      saveProgress(exerciseId, currentState);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentIndex, answers, questionTimes, questionScores, exerciseId]);

  // Reset question timer when changing questions
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentIndex]);

  // Update progress

  useEffect(() => {
    const progress = calculateProgress();
    const score = calculateCurrentScore();
    setCurrentScore(score);

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    onProgressUpdate?.({
      progress: {
        currentStep: answers.length,
        totalSteps: currentExercise.questions.length,
        score,
        hintsUsed: 0,
        timeSpent: elapsed,
      },
      answers: {
        selectedAnswers: answers,
        questionScores,
        questionTimes,
        currentQuestion: currentIndex,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, onProgressUpdate, startTime, currentIndex, questionScores, questionTimes]);

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
    // Calculate time taken for this question
    const timeElapsed = (new Date().getTime() - questionStartTime.getTime()) / 1000;

    // Determine if answer is correct
    const isCorrect = optionIndex === currentExercise.questions[currentIndex].correctAnswer;
    const baseScore = isCorrect ? 100 : 0;

    // Calculate score with time penalty (only if correct)
    const scoreWithPenalty = isCorrect
      ? calculateScoreWithTimePenalty(baseScore, timeElapsed, TIME_LIMIT_PER_QUESTION)
      : 0;

    // Update state
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    const newQuestionTimes = [...questionTimes];
    newQuestionTimes[currentIndex] = timeElapsed;
    setQuestionTimes(newQuestionTimes);

    const newQuestionScores = [...questionScores];
    newQuestionScores[currentIndex] = scoreWithPenalty;
    setQuestionScores(newQuestionScores);

    // Show feedback with time penalty info
    if (isCorrect) {
      const timePenalty = 100 - scoreWithPenalty;
      setFeedback({
        type: 'success',
        title: '¡Correcto!',
        message: timePenalty > 0
          ? `+${scoreWithPenalty} puntos (-${timePenalty} por tiempo)`
          : `+${scoreWithPenalty} puntos`,
        showConfetti: false,
      });
    } else {
      setFeedback({
        type: 'error',
        title: 'Incorrecto',
        message: 'Intenta con la siguiente pregunta.',
        showConfetti: false,
      });
    }

    // Auto-advance to next question after a delay
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < currentExercise.questions.length - 1) {
        handleSwipe('down');
      } else {
        // Last question answered, trigger check
        handleCheck(newAnswers, newQuestionScores);
      }
    }, 1500);
  };

  // Handle time up for a question
  const handleTimeUp = () => {
    // Auto-select a random wrong answer or skip
    const correctAnswer = currentExercise.questions[currentIndex].correctAnswer;
    let randomWrongAnswer = 0;
    do {
      randomWrongAnswer = Math.floor(Math.random() * currentExercise.questions[currentIndex].options.length);
    } while (randomWrongAnswer === correctAnswer);

    handleAnswer(randomWrongAnswer);
  };

  // Handle check/verification
  const handleCheck = async (finalAnswers: number[] = answers, finalScores: number[] = questionScores) => {
    const correct = finalAnswers.filter(
      (ans, idx) => ans === currentExercise.questions[idx].correctAnswer,
    ).length;

    if (finalAnswers.length < currentExercise.questions.length) {
      setFeedback({
        type: 'error',
        title: 'Quiz Incompleto',
        message: `Has respondido ${finalAnswers.length} de ${currentExercise.questions.length} preguntas.`,
        showConfetti: false,
      });
      setShowFeedback(true);
      return;
    }

    // Calculate average score with time penalties
    const totalScore = finalScores.reduce((sum, score) => sum + score, 0);
    const avgScore = Math.floor(totalScore / currentExercise.questions.length);

    // Calculate total time penalty
    const totalTimePenalty = finalScores.reduce((sum, score, idx) => {
      const isCorrect = finalAnswers[idx] === currentExercise.questions[idx].correctAnswer;
      return sum + (isCorrect ? (100 - score) : 0);
    }, 0);

    setFeedback({
      type:
        correct === currentExercise.questions.length
          ? 'success'
          : correct >= currentExercise.questions.length / 2
            ? 'partial'
            : 'error',
      title:
        correct === currentExercise.questions.length
          ? '¡Perfect!'
          : correct >= currentExercise.questions.length / 2
            ? 'Buen intento'
            : 'Sigue practicando',
      message: `Respondiste correctamente ${correct} de ${currentExercise.questions.length} preguntas.\nPuntuación: ${avgScore}/100 (${totalTimePenalty > 0 ? `-${Math.round(totalTimePenalty / correct)} pts por tiempo` : 'sin penalización'})`,
      score: correct >= currentExercise.questions.length / 2 ? avgScore : undefined,
      showConfetti: correct === currentExercise.questions.length && avgScore >= 90,
    });
    setShowFeedback(true);
  };

  // Handle reset
  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setQuestionTimes([]);
    setQuestionScores([]);
    setQuestionStartTime(new Date());
    setFeedback(null);
    setShowFeedback(false);
  };

  // Handle save
  const handleSave = () => {
    const currentState: ExerciseState = { currentIndex, answers, questionTimes, questionScores };
    saveProgress(exerciseId, currentState);

    setFeedback({
      type: 'info',
      title: 'Progreso Guardado',
      message: 'Tu progreso ha sido guardado correctamente.',
      showConfetti: false,
    });
    setShowFeedback(true);
  };

  // Track visited questions (nodes) for swipe history
  const [visitedNodes] = useState<number[]>([]);

  // Handle submit
  const handleSubmit = () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    const swipeHistory = visitedNodes || [];
    const score = calculateCurrentScore();

    submit({
      answers,
      swipeHistory,
      score,
    });
  };

  // Attach actions to ref

  useEffect(() => {
    actionsRef.current = {
      handleReset,
      handleCheck: () => handleCheck(answers),
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
  }, [actionsRef]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Main TikTok-style vertical content */}
      <div className="relative mx-auto h-screen w-full max-w-md bg-black">
        <AnimatePresence mode="wait">
          <TikTokCard
            key={currentIndex}
            question={currentExercise.questions[currentIndex]}
            onAnswer={handleAnswer}
            selectedAnswer={answers[currentIndex]}
            timeLimit={TIME_LIMIT_PER_QUESTION}
            onTimeUp={handleTimeUp}
          />
        </AnimatePresence>

        {/* Navigation Controls - Bottom */}
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <DetectiveButton
              variant="secondary"
              onClick={() => handleSwipe('up')}
              disabled={currentIndex === 0}
              icon={<ChevronUp />}
              className="border-white/30 bg-white/20 text-white backdrop-blur-md"
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
              className="border-white/30 bg-white/20 text-white backdrop-blur-md"
            >
              Siguiente
            </DetectiveButton>
          </motion.div>
        </div>

        {/* Progress Indicator - Bottom */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-3 text-center text-sm font-medium text-white">
          <span className="rounded-full bg-black/50 px-4 py-2 backdrop-blur-md">
            Pregunta {currentIndex + 1} / {currentExercise.questions.length}
          </span>
          <span className="rounded-full bg-detective-orange/80 px-4 py-2 backdrop-blur-md">
            {answers.length} respondidas
          </span>
        </div>

        {/* Sidebar Toggle Button - Top Right */}
        <div className="absolute right-4 top-4 z-30">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <DetectiveButton
              variant="gold"
              onClick={() => setShowSidebar(!showSidebar)}
              icon={showSidebar ? <X /> : <Menu />}
              className="border-white/30 bg-white/20 text-white backdrop-blur-md"
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
              className="border-white/30 bg-white/20 text-white backdrop-blur-md"
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
            className="absolute right-0 top-0 z-40 h-full w-80 overflow-y-auto bg-gradient-to-br from-orange-50 to-blue-50 shadow-lg"
          >
            <div className="space-y-4 p-6">
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
                <TimerWidget startTime={Date.now()} isPaused={false} showSeconds={true} />
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

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ScoreDisplay score={currentScore} maxScore={100} />
              </motion.div>

              {/* Question Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DetectiveCard variant="default" padding="md">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-detective-text">
                    <Award className="h-5 w-5 text-detective-orange" />
                    Estado de Preguntas
                  </h3>
                  <div className="space-y-2">
                    {currentExercise.questions.map((_, idx) => {
                      const isAnswered = answers[idx] !== undefined;
                      const score = questionScores[idx] || 0;
                      const time = questionTimes[idx] || 0;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between rounded-detective p-2 transition-colors ${
                            idx === currentIndex
                              ? 'bg-detective-orange text-white'
                              : isAnswered
                                ? score > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className="flex-1">
                            <span className="font-medium">Pregunta {idx + 1}</span>
                            {isAnswered && (
                              <div className="text-xs mt-1">
                                <div>{score} pts ({time.toFixed(1)}s)</div>
                              </div>
                            )}
                          </div>
                          <span className="text-xs">
                            {idx === currentIndex
                              ? 'Actual'
                              : isAnswered
                                ? score > 0 ? '✓' : '✗'
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
                transition={{ delay: 0.5 }}
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
                      disabled={answers.length < currentExercise.questions.length || isSubmitting || isSubmitted}
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
                transition={{ delay: 0.6 }}
              >
                <DetectiveCard variant="default" padding="md">
                  <h3 className="mb-3 font-bold text-detective-text">Instrucciones</h3>
                  <div className="space-y-2 text-detective-sm text-detective-text-secondary">
                    <p>• Selecciona una respuesta para cada pregunta</p>
                    <p>• Usa los botones para navegar entre preguntas</p>
                    <p>• Responde todas las preguntas para verificar</p>
                    <p>• ¡Responde rápido para obtener más puntos!</p>
                    <p>• Tiempo límite: {TIME_LIMIT_PER_QUESTION}s por pregunta</p>
                    <p>• Penalización máxima: 50% por tiempo</p>
                  </div>
                </DetectiveCard>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
};

export default QuizTikTokExercise;
