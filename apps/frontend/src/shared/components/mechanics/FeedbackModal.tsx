import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Trophy, Sparkles, Clock } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackData } from './mechanicsTypes';

export interface FeedbackModalProps {
  isOpen: boolean;
  feedback: FeedbackData;
  onClose: () => void;
  onRetry?: () => void;
  onNext?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  feedback,
  onClose,
  onRetry,
  onNext
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && feedback.showConfetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, feedback.showConfetti]);

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
    <AnimatePresence>
      {isOpen && (
        <FocusTrap>
          <div>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Confetti Effect */}
            {showConfetti && (
              <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: '50vw',
                      y: '50vh',
                      scale: 0
                    }}
                    animate={{
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: 2,
                      ease: 'easeOut'
                    }}
                    className="absolute w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* Modal */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
              aria-describedby="feedback-message"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
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
                    className={`text-2xl font-bold mb-2 ${getColor()}`}
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

                {/* Score Display - Simplified without breakdown */}
                {(feedback.score || feedback.xpEarned || feedback.mlCoinsEarned) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {feedback.score !== undefined && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-blue-600 font-semibold">Score</div>
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
                )}

                {/* Seccion de Pendiente de Validacion - M3-M5 Feature */}
                {feedback.pendingReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Tu progreso ha sido actualizado
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Tus respuestas han sido enviadas al profesor para su evaluacion. Las recompensas seran asignadas una vez que el profesor complete la evaluacion.
                        </p>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Nota:</strong> Las recompensas (XP, ML Coins) se asignaran
                            cuando tu maestro complete la evaluacion.
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
                      📊 Detalles por ronda:
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {feedback.details.map((detail: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                                ✓ Palabras clave encontradas ({detail.keywordsFound.length}/{detail.keywordsExpected?.length || 0}):
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
                                className={`h-2 rounded-full transition-all ${
                                  (detail.score / detail.maxScore) >= 0.8 ? 'bg-green-500' :
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
          </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
