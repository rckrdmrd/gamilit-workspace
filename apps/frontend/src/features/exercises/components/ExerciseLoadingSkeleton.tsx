/**
 * ExerciseLoadingSkeleton
 *
 * Full-page loading state for exercise page.
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useExerciseContext } from '../context/ExerciseContext';

export const ExerciseLoadingSkeleton = () => {
  const { user, gamificationData, logout } = useExerciseContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => { await logout(); }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-12 w-12 text-detective-orange" />
            </motion.div>
          </div>
          <p className="mt-4 text-center font-semibold text-detective-text">
            Cargando ejercicio...
          </p>
        </DetectiveCard>
      </div>
    </div>
  );
};
