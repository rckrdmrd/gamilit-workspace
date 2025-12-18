/**
 * RankUpModal Component
 *
 * Celebration modal for rank-ups with confetti and animations.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
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
const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
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
        y: window.innerHeight,
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
export const RankUpModal: React.FC<RankUpModalProps> = ({ isOpen, onClose }) => {
  const { closeRankUpModal } = useProgression();
  const { currentRank, previousRank, prestigeLevel } = useRank();

  // Generate confetti particles
  const confettiCount = 50;
  const confettiParticles = Array.from({ length: confettiCount }, (_, i) => i);

  // Auto-close after 5 seconds (optional)
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            {/* Confetti */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiParticles.map((i) => (
                <ConfettiParticle key={i} delay={i * 0.02} />
              ))}
            </div>

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Header with gradient background */}
              <div
                className={cn(
                  'relative px-8 pb-8 pt-12 text-white',
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-2 text-center text-3xl font-bold"
                >
                  ¡Felicitaciones!
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
              <div className="space-y-6 px-8 py-6">
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
                        <span className="mt-0.5 text-amber-500">✓</span>
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
                  ¡Continuar!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
