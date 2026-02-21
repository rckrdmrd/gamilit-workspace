import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { sendDebateMessage } from './debateDigitalAPI';
import { debateTopic } from './debateDigitalMockData';
import type { DebateMessage, DebateDigitalAnswers } from './debateDigitalTypes';
import { calculateTimeBonus } from '@/shared/utils/scoring';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: Record<string, unknown>) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

interface ExerciseState {
  messages: DebateMessage[];
  currentScore: number;
  totalMessages: number;
}

export const DebateDigitalExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exerciseId);

  const [messages, setMessages] = useState<DebateMessage[]>(initialData?.messages || []);
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
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
  const [userPosition, setUserPosition] = useState<'a_favor' | 'en_contra' | 'neutral'>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add initial AI message if starting fresh
    if (messages.length === 0) {
      const aiIntro: DebateMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: 'Hola, soy tu oponente en este debate. Defenderé la posición de que la fama benefició la investigación de Marie Curie, dándole acceso a financiación y colaboraciones internacionales. ¿Cuál es tu argumento inicial?',
        timestamp: new Date(),
      };
      setMessages([aiIntro]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentScore]);

  // Update progress with answers
  useEffect(() => {
    const userMessages = messages.filter((m) => m.sender === 'user');
    const targetMessages = 5; // Minimum messages for completion
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep: userMessages.length,
          totalSteps: targetMessages,
          score: 0,
          hintsUsed: 0,
          timeSpent: elapsed,
        },
        answers: {
          position: userPosition,
          arguments: userMessages.map((m) => m.text),
          messageCount: userMessages.length,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, userPosition]);

  const saveProgress = () => {
    const state: ExerciseState = {
      messages,
      currentScore,
      totalMessages: messages.length,
    };
    saveProgressUtil(exerciseId, state);
  };

  const handleSend = async () => {
    if (!input.trim() || aiTyping) return;

    const userMsg: DebateMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAiTyping(true);

    // Calculate score based on message quality
    const messageScore = Math.min(20, input.trim().split(' ').length); // Word count bonus
    setCurrentScore((prev) => prev + messageScore);

    try {
      const response = await sendDebateMessage(input, 'scientificSharing');
      const aiMsg: DebateMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: response.message,
        timestamp: new Date(),
        argumentStrength: response.argumentScore,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (_error) {
      // Error handled silently
    } finally {
      setAiTyping(false);
    }
  };

  const handleComplete = async () => {
    // ✅ FIX COR-010: Validar que se seleccionó una posición antes de completar
    if (userPosition === 'neutral') {
      return; // El mensaje de advertencia ya se muestra en UI
    }

    // Validate minimum participation
    const userMessages = messages.filter((m) => m.sender === 'user');
    if (userMessages.length < 3) {
      setShowFeedback(true);
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
      // userPosition is now tracked via state (CORRECCION-005)
      const answers: DebateDigitalAnswers = {
        position: userPosition,
        response: userMessages.map((m) => m.text).join('\n\n'), // Concatenate all user messages
        arguments: userMessages.map((m) => m.text),
        messageCount: userMessages.length,
      };

      // Submit to backend
      const response = await submitAsync(answers as unknown as Record<string, unknown>);

      // CORRECCION-001: Verificar si requiere revision manual del maestro
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setIsPendingReview(true);
        setBackendScore(null); // No mostrar score aun
        setBackendFeedback(MANUAL_REVIEW_PENDING_SHORT_MESSAGE);
        setBackendRewards(null); // No mostrar rewards prematuramente

        // Sync pero sin mostrar rewards
        await syncAndInvalidate();

        setShowFeedback(true);
        return;
      }

      // Flujo normal: ejercicio auto-calificado
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      // Store backend response for feedback modal
      setBackendScore(response.score);
      setBackendFeedback(response.feedback?.overall || null);
      setBackendRewards({ xp: rewards.xp, mlCoins: rewards.mlCoins });
      setIsPendingReview(false);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

      // Show feedback with backend response
      setShowFeedback(true);

      // Call onComplete callback with score and time
      if (onComplete && response.score >= 70) {
        const finalTimeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        onComplete(response.score, finalTimeSpent);
      }
    } catch (error) {
      // Reset backend data on error
      setBackendScore(null);
      setBackendFeedback(null);
      setBackendRewards(null);
      // Still show feedback modal with local score calculation
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinalScore = () => {
    const userMessages = messages.filter((m) => m.sender === 'user').length;
    const baseScore = currentScore;
    const participationBonus = Math.min(30, userMessages * 5);
    const timeBonus = calculateTimeBonus(startTime, new Date(), 20, 120);
    return Math.min(100, baseScore + participationBonus + timeBonus);
  };

  const handleReset = () => {
    const aiIntro: DebateMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: 'Hola, soy tu oponente en este debate. Defenderé la posición de que la fama benefició la investigación de Marie Curie, dándole acceso a financiación y colaboraciones internacionales. ¿Cuál es tu argumento inicial?',
      timestamp: new Date(),
    };
    setMessages([aiIntro]);
    setInput('');
    setCurrentScore(0);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  const userMessageCount = messages.filter((m) => m.sender === 'user').length;

  return (
    <>
      <UnifiedExerciseLayout
        title="Debate Digital"
        description={debateTopic.title}
        icon={<MessageCircle className="h-6 w-6" />}
        gradientClassName="from-detective-blue to-detective-orange"
        headerChildren={
          <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm mt-3">
            <p className="font-medium text-white/95">{debateTopic.question}</p>
          </div>
        }
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* CORRECCION-005: Seleccion de posicion del usuario */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-detective-lg bg-detective-bg p-4 border border-detective-border-light"
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
              <DetectiveButton
                variant={userPosition === 'neutral' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setUserPosition('neutral')}
              >
                Neutral
              </DetectiveButton>
            </div>
            {userPosition === 'neutral' && (
              <p className="text-detective-xs text-detective-text-secondary mt-2">
                Selecciona una posicion antes de comenzar el debate.
              </p>
            )}
          </motion.div>

          {/* Chat Container */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white">
            <div className="flex flex-col" style={{ height: '600px' }}>
              {/* Messages Area */}
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${msg.sender === 'user'
                            ? 'bg-detective-orange text-white'
                            : 'bg-detective-bg-secondary text-detective-text'
                          }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          {msg.sender === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                          <span className="text-detective-xs font-semibold">
                            {msg.sender === 'user' ? 'Tú' : 'IA Oponente'}
                          </span>
                        </div>
                        <p className="text-detective-sm">{msg.text}</p>
                        {msg.argumentStrength && (
                          <div className="mt-2 text-detective-xs opacity-75">
                            Fuerza del argumento: {Math.round(msg.argumentStrength * 100)}%
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {aiTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-lg bg-detective-bg-secondary p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-detective-sm">IA está escribiendo...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe tu argumento..."
                    className="flex-1 rounded-detective-lg border border-detective-border-medium px-4 py-3 focus:outline-none focus:ring-2 focus:ring-detective-orange"
                    disabled={aiTyping}
                  />
                  <DetectiveButton
                    variant="primary"
                    onClick={handleSend}
                    disabled={!input.trim() || aiTyping}
                    icon={<Send className="h-5 w-5" />}
                  >
                    Enviar
                  </DetectiveButton>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={userMessageCount < 3 || isSubmitting || userPosition === 'neutral'}
            >
              {isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
            </DetectiveButton>
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        feedback={{
          type: isPendingReview
            ? 'info'
            : backendScore !== null
              ? backendScore >= 90
                ? 'success'
                : backendScore >= 70
                  ? 'partial'
                  : 'error'
              : userMessageCount >= 5
                ? 'success'
                : 'partial',
          title: isPendingReview
            ? 'Ejercicio Enviado'
            : backendScore !== null
              ? backendScore >= 90
                ? '¡Excelente Debate!'
                : backendScore >= 70
                  ? 'Buen Debate'
                  : 'Sigue Practicando'
              : userMessageCount >= 5
                ? '¡Excelente Debate!'
                : 'Buen Debate',
          message:
            backendFeedback ||
            `Has participado con ${userMessageCount} argumento(s) obteniendo ${currentScore} puntos.`,
          score: isPendingReview ? undefined : (backendScore !== null ? backendScore : calculateFinalScore()),
          showConfetti: isPendingReview ? false : (backendScore !== null ? backendScore >= 90 : userMessageCount >= 5),
          // Agregar rewards si están disponibles (no mostrar en pending review)
          xpEarned: isPendingReview ? 0 : (backendRewards?.xp || 0),
          mlCoinsEarned: isPendingReview ? 0 : (backendRewards?.mlCoins || 0),
          pendingReview: isPendingReview,
        }}
        onClose={() => {
          setShowFeedback(false);
          // Note: onComplete is already called in handleComplete when backend response is successful
          if (backendScore === null && userMessageCount >= 3 && !isPendingReview) {
            // Fallback: call onComplete with local score if backend submission failed
            onComplete?.(calculateFinalScore(), timeSpent);
          }
        }}
        onRetry={isPendingReview ? undefined : handleReset}
      />
    </>
  );
};

export default DebateDigitalExercise;
