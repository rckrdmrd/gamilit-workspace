/**
 * CompletionHeader Component
 *
 * Gradient header section for the CompletionModal showing:
 * - Trophy (success) or Target (failure) icon
 * - User avatar with equipped cosmetics
 * - Title and performance message
 *
 * @see CompletionModal.tsx (parent orchestrator)
 */

import { motion } from 'framer-motion';
import { Trophy, Target } from 'lucide-react';
import { AvatarDisplay } from '@shared/components/AvatarDisplay';

interface CompletionHeaderProps {
  success: boolean;
  performanceMessage: string;
  avatarSrc: string | null;
  frameColor: string | null;
  userName: string | null;
}

export function CompletionHeader({
  success,
  performanceMessage,
  avatarSrc,
  frameColor,
  userName,
}: CompletionHeaderProps) {
  return (
    <div
      className={`rounded-t-detective p-8 ${
        success
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-orange-500 to-red-600'
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 flex items-center justify-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            {success ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <Target className="h-12 w-12 text-white" />
            )}
          </div>
          {userName && (
            <AvatarDisplay
              src={avatarSrc}
              name={userName}
              frameColor={frameColor}
              size="lg"
              className="border-2 border-white/30"
            />
          )}
        </div>
        <h2
          id="completion-modal-title"
          className="mb-2 text-3xl font-bold text-white"
        >
          {success ? '¡Ejercicio Completado!' : 'Ejercicio Enviado'}
        </h2>
        <p className="text-lg text-white/90">{performanceMessage}</p>
      </motion.div>
    </div>
  );
}
