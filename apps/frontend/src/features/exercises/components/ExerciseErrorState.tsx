/**
 * ExerciseErrorState
 *
 * Error state when exercise fails to load or exercise data is missing.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useExerciseContext } from '../context/ExerciseContext';

export const ExerciseErrorState: React.FC = () => {
  const { user, gamificationData, logout, navigateBack } = useExerciseContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => { await logout(); }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-800"
        >
          <p className="font-semibold">No se pudo cargar el ejercicio</p>
          <DetectiveButton
            variant="blue"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={navigateBack}
            className="mt-4"
          >
            Volver al Dashboard
          </DetectiveButton>
        </motion.div>
      </div>
    </div>
  );
};
