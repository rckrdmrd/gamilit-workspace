/**
 * RankUpModal Component
 *
 * Celebration modal for rank-ups with confetti and animations.
 * Uses shared Modal with animated prop for outer shell (escape, scroll lock, focus trap, ARIA).
 * Custom confetti particles and staggered animations are kept inside.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { Modal } from '@shared/components/common/Modal';
import { RankBadgeAdvanced } from './RankBadgeAdvanced';
import { useProgression } from '../hooks/useProgression';
import { useRank } from '../hooks/useRank';

export interface RankUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Confetti Particle Component
 */
const ConfettiParticle = ({ delay }: { delay: number }) => {
  const colors = ['#60a5fa', '#4ade80', '#fb923c', '#a78bfa', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 50;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute h-2 w-2 rounded-full"
      style={{
        backgroundColor: color,
        left: `${startX}%`,
        top: -20,
      }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: '110vh',
        x: endX - startX,
        opacity: 0,
        rotate: rotation,
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        ease: 'easeIn',
      }}
    />
  );
};

/**
 * RankUpModal Component
 */
export const RankUpModal = ({ isOpen, onClose }: RankUpModalProps) => {
  const { closeRankUpModal } = useProgression();
  const { currentRank, previousRank, prestigeLevel } = useRank();

  // Generate confetti particles
  const confettiCount = 50;
  const confettiParticles = Array.from({ length: confettiCount }, (_, i) => i);

  // Auto-close after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    closeRankUpModal();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      animated
      size="lg"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-sm"
      className="overflow-hidden rounded-2xl shadow-2xl"
      contentClassName="custom"
      ariaLabelledBy="rankup-modal-title"
    >
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {confettiParticles.map((i) => (
          <ConfettiParticle key={i} delay={i * 0.02} />
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full bg-gray-100 p-2 min-w-[44px] min-h-[44px] transition-colors hover:bg-gray-200 touch-manipulation"
        aria-label="Cerrar modal"
      >
        <X className="h-6 w-6 text-gray-600" />
      </button>

      {/* Header with gradient background */}
      <div
        className={cn(
          'relative px-4 pb-6 pt-10 text-white sm:px-8 sm:pb-8 sm:pt-12',
          'bg-gradient-to-br',
          currentRank.gradient,
        )}
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <Trophy className="h-12 w-12" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          id="rankup-modal-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-2 text-center text-2xl font-bold sm:text-3xl"
        >
          Felicitaciones!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/90"
        >
          Has alcanzado un nuevo rango
        </motion.p>
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-8 sm:py-6">
        {/* Rank Progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4"
        >
          {previousRank && (
            <>
              <RankBadgeAdvanced
                rank={previousRank.id}
                prestigeLevel={prestigeLevel}
                animated={false}
              />
              <ChevronRight className="h-6 w-6 text-gray-400" />
            </>
          )}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <RankBadgeAdvanced
              rank={currentRank.id}
              prestigeLevel={prestigeLevel}
              showGlow={true}
            />
          </motion.div>
        </motion.div>

        {/* Rank Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-2 text-center"
        >
          <h3 className="text-2xl font-bold text-detective-text">
            {currentRank.nameSpanish}
          </h3>
          <p className="text-detective-text-secondary">{currentRank.description}</p>
        </motion.div>

        {/* New Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-3 rounded-lg bg-amber-50 p-4"
        >
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles className="h-5 w-5" />
            <h4 className="font-semibold">Beneficios Desbloqueados</h4>
          </div>
          <ul className="space-y-2">
            {currentRank.benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="flex items-start gap-2 text-sm text-detective-text"
              >
                <span className="mt-0.5 text-amber-500">&#10003;</span>
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Multiplier Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-lg font-bold text-white">
            {currentRank.multiplier.toFixed(2)}x Multiplicador
          </div>
        </motion.div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          onClick={handleClose}
          className="w-full rounded-lg bg-detective-blue py-3 font-semibold text-white transition-colors hover:bg-detective-blue/90"
        >
          Continuar!
        </motion.button>
      </div>
    </Modal>
  );
};
