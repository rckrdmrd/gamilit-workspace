/**
 * ExerciseLoader
 *
 * Dynamically loads the mechanic component from the registry.
 * Passes standardized ExerciseMechanicProps via the compat wrapper.
 *
 * @version 1.0.0
 * @since Phase 3 - Exercise System Restructuring
 */
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useExerciseContext } from '../context/ExerciseContext';

const LoadingFallback = () => (
  <DetectiveCard hoverable={false}>
    <div className="flex items-center justify-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="h-6 w-6 text-detective-orange" />
      </motion.div>
    </div>
    <p className="mt-2 text-center text-sm text-detective-text-secondary">
      Cargando mecánica...
    </p>
  </DetectiveCard>
);

export const ExerciseLoader = () => {
  const {
    MechanicComponent,
    adaptedExercise,
    exercise,
    handleComplete,
    handleProgressUpdate,
    mechanicActionsRef,
    comodinesContext,
    navigateBack,
  } = useExerciseContext();

  if (!MechanicComponent) {
    return (
      <DetectiveCard hoverable={false}>
        <div className="py-8 text-center">
          <p className="font-semibold text-red-600">
            No se encontró la mecánica para este tipo de ejercicio.
          </p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MechanicComponent
            exercise={adaptedExercise || exercise}
            exerciseId={exercise?.id}
            onComplete={handleComplete}
            onProgressUpdate={handleProgressUpdate}
            actionsRef={mechanicActionsRef}
            comodinesContext={comodinesContext}
            onExit={navigateBack}
          />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};
