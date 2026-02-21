/**
 * CompletionActions Component
 *
 * Action buttons for the CompletionModal:
 * - "Volver al Modulo" (always shown)
 * - "Reintentar" (shown on failure)
 * - "Siguiente Ejercicio" (shown when onNextExercise provided)
 *
 * @see CompletionModal.tsx (parent orchestrator)
 */

import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

interface CompletionActionsProps {
  success: boolean;
  onBackToModule: () => void;
  onRetry: () => void;
  onNextExercise?: () => void;
}

export function CompletionActions({
  success,
  onBackToModule,
  onRetry,
  onNextExercise,
}: CompletionActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="flex flex-col gap-3 pt-4 sm:flex-row"
    >
      <DetectiveButton
        variant="secondary"
        onClick={onBackToModule}
        icon={<ArrowLeft className="h-4 w-4" />}
        className="flex-1"
      >
        Volver al Módulo
      </DetectiveButton>
      {!success && (
        <DetectiveButton
          variant="blue"
          onClick={onRetry}
          icon={<RotateCcw className="h-4 w-4" />}
          className="flex-1"
        >
          Reintentar
        </DetectiveButton>
      )}
      {onNextExercise && (
        <DetectiveButton
          variant="primary"
          onClick={onNextExercise}
          icon={<ChevronRight className="h-4 w-4" />}
          className="flex-1"
        >
          Siguiente Ejercicio
        </DetectiveButton>
      )}
    </motion.div>
  );
}
