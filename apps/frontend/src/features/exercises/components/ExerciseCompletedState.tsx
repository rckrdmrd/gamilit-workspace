/**
 * ExerciseCompletedState
 *
 * Shown when the exercise is already completed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useExerciseContext } from '../context/ExerciseContext';

export const ExerciseCompletedState: React.FC = () => {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg text-center"
        >
          <DetectiveCard hoverable={false}>
            <div className="py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Ejercicio Completado</h2>
              <p className="mb-6 text-gray-600">
                Ya completaste este ejercicio. Puedes continuar con los demás ejercicios del módulo.
              </p>
              <DetectiveButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={navigateBack}
              >
                Volver al Módulo
              </DetectiveButton>
            </div>
          </DetectiveCard>
        </motion.div>
      </div>
    </div>
  );
};
