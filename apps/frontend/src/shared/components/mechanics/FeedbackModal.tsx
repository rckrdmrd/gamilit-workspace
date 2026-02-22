import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Trophy, Sparkles, Clock } from 'lucide-react';
import Confetti from 'react-confetti';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import {
  CompletionScoreDisplay,
  CompletionRewards,
  CompletionStats,
  RankUpNotification,
  StreakMilestone,
  AchievementsList,
} from '@/apps/student/components/exercise/CompletionModalSections';
import { MANUAL_REVIEW_PENDING_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';
import { FeedbackData } from './mechanicsTypes';

export interface FeedbackModalProps {
  isOpen: boolean;
  feedback: FeedbackData;
  onClose: () => void;
  onRetry?: () => void;
  onNext?: () => void;
}

export const FeedbackModal = ({
  isOpen,
  feedback,
  onClose,
  onRetry,
  onNext
}: FeedbackModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);

  useEffect(() => {
    if (isOpen && feedback.showConfetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, feedback.showConfetti]);

  // Animate XP and Coins counters for rich feedback
  useEffect(() => {
    if (isOpen && feedback.type === 'success' && !feedback.pendingReview) {
      const targetXP = feedback.xpEarned || 0;
      const targetCoins = feedback.mlCoinsEarned || 0;
      const steps = 30;
      const interval = 50;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedXP(Math.round(targetXP * eased));
        setAnimatedCoins(Math.round(targetCoins * eased));
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
    setAnimatedXP(0);
    setAnimatedCoins(0);
  }, [isOpen, feedback]);

  const getIcon = () => {
    switch (feedback.type) {
      case 'success':
        return <CheckCircle2 className="w-16 h-16 text-green-500" aria-hidden="true" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" aria-hidden="true" />;
      case 'partial':
        return <Info className="w-16 h-16 text-yellow-500" aria-hidden="true" />;
      case 'info':
        return <Info className="w-16 h-16 text-blue-500" aria-hidden="true" />;
    }
  };

  const getColor = () => {
    switch (feedback.type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'partial':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      size="lg"
      showCloseButton={false}
      overlayClassName="bg-black/65 backdrop-blur-[2px]"
      className="overflow-visible"
      contentClassName="custom"
      ariaLabelledBy="feedback-title"
      ariaDescribedBy="feedback-message"
    >
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
            <Confetti
              width={typeof window !== 'undefined' ? window.innerWidth : 1024}
              height={typeof window !== 'undefined' ? window.innerHeight : 768}
              recycle={false}
              numberOfPieces={150}
              gravity={0.3}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Modal Content */}
      <DetectiveCard variant="gold" padding="lg">
        <div className="text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="flex justify-center mb-4"
          >
            {getIcon()}
          </motion.div>

          {/* Title */}
          <motion.h2
            id="feedback-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-xl sm:text-2xl font-bold mb-2 ${getColor()}`}
          >
            {feedback.title}
          </motion.h2>

          {/* Message */}
          <motion.p
            id="feedback-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-detective-text mb-6 whitespace-pre-line"
          >
            {feedback.message}
          </motion.p>

          {/* Rich completion for auto-evaluated successful exercises */}
          {feedback.type === 'success' && !feedback.pendingReview && feedback.maxScore ? (
            <div className="space-y-4 mb-6">
              <CompletionScoreDisplay score={feedback.score ?? 0} maxScore={feedback.maxScore} success={true} />
              <CompletionRewards animatedXP={animatedXP} animatedCoins={animatedCoins} />
              {(feedback.timeSpent != null || feedback.hintsUsed != null) && (
                <CompletionStats timeSpent={feedback.timeSpent ?? 0} hintsUsed={feedback.hintsUsed ?? 0} />
              )}
              {feedback.rankUp && <RankUpNotification rankUp={feedback.rankUp} />}
              {feedback.streakInfo?.milestone && <StreakMilestone streakInfo={feedback.streakInfo} />}
              {feedback.achievements && feedback.achievements.length > 0 && (
                <AchievementsList achievements={feedback.achievements.map(a => ({
                  name: a.name, description: a.description, icon: a.icon,
                  rarity: a.rarity, mlCoinsReward: a.mlCoinsReward ?? 0, xpReward: a.xpReward ?? 0,
                }))} />
              )}
            </div>
          ) : !feedback.pendingReview && (feedback.score != null || feedback.xpEarned != null || feedback.mlCoinsEarned != null) ? (
            /* Simple grid for non-rich feedback (no maxScore) or non-success */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {feedback.score !== undefined && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 font-semibold">Puntos</div>
                    <div className="text-lg font-bold text-blue-800">
                      {feedback.score}
                    </div>
                  </div>
                )}
                {feedback.xpEarned !== undefined && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-semibold">XP</div>
                    <div className="text-lg font-bold text-green-800">
                      +{feedback.xpEarned}
                    </div>
                  </div>
                )}
                {feedback.mlCoinsEarned !== undefined && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 font-semibold">ML Coins</div>
                    <div className="text-lg font-bold text-purple-800">
                      +{feedback.mlCoinsEarned}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}

          {/* Seccion de Pendiente de Validacion - M3-M5 Feature */}
          {feedback.pendingReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-2 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
            >
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Ejercicio completado — Pendiente de evaluación
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    {MANUAL_REVIEW_PENDING_MESSAGE}
                  </p>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Nota:</strong> Las recompensas (XP, ML Coins) se asignarán
                      cuando tu maestro complete la evaluación. No necesitas volver a realizar este ejercicio.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback detallado por fragmento */}
          {feedback.details && Array.isArray(feedback.details) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 text-left"
            >
              <h4 className="font-semibold text-lg mb-3 text-detective-primary">
                Detalles por ronda:
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {feedback.details.map((detail: { categoryUsed?: string; score: number; maxScore: number; feedback: string; keywordsFound?: string[]; keywordsExpected?: string[] }, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200">
                    {/* Header con puntuación */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-medium">Fragmento {idx + 1}</span>
                        {detail.categoryUsed && (
                          <span className="ml-2 text-sm text-gray-600">
                            ({detail.categoryUsed})
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {detail.score}/{detail.maxScore} pts
                      </span>
                    </div>

                    {/* Feedback pedagógico */}
                    <p className="text-sm text-gray-700 mb-3">{detail.feedback}</p>

                    {/* Keywords encontradas */}
                    {detail.keywordsFound && detail.keywordsFound.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-green-700 mb-1">
                          Palabras clave encontradas ({detail.keywordsFound.length}/{detail.keywordsExpected?.length || 0}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detail.keywordsFound.map((keyword: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indicador visual de progreso */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${(detail.score / detail.maxScore) >= 0.8 ? 'bg-green-500' :
                              (detail.score / detail.maxScore) >= 0.5 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                          style={{ width: `${Math.min((detail.score / detail.maxScore) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            {feedback.type === 'success' && onNext && (
              <DetectiveButton
                variant="gold"
                size="lg"
                onClick={onNext}
                icon={<Sparkles className="w-5 h-5" />}
                className="flex-1"
                aria-label="Ir al siguiente ejercicio"
              >
                Siguiente
              </DetectiveButton>
            )}

            {feedback.type === 'error' && onRetry && (
              <DetectiveButton
                variant="primary"
                size="lg"
                onClick={onRetry}
                icon={<Trophy className="w-5 h-5" />}
                className="flex-1"
                aria-label="Reintentar ejercicio"
              >
                Reintentar
              </DetectiveButton>
            )}

            <DetectiveButton
              variant={feedback.type === 'success' ? 'blue' : 'primary'}
              size="lg"
              onClick={onClose}
              className="flex-1"
              aria-label="Cerrar modal de retroalimentación"
            >
              Cerrar
            </DetectiveButton>
          </motion.div>
        </div>
      </DetectiveCard>
    </Modal>
  );
};

export default FeedbackModal;
