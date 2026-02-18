/**
 * ExerciseLayout
 *
 * Main layout component for the exercise page.
 * Replaces the render section of the monolithic ExercisePage (lines 798-1057).
 *
 * Composition:
 * - GamifiedHeader
 * - ExercisePageHeader
 * - ExerciseGuide
 * - Grid: ExerciseLoader (3/4) + ExerciseSidebar (1/4)
 * - FeedbackModal
 *
 * @version 1.0.0
 * @since Phase 3 - Exercise System Restructuring
 */

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { ExercisePageHeader } from '@/apps/student/components/exercise/ExercisePageHeader';
import { ExerciseGuide } from '@/features/exercises/components/ExerciseGuide';
import { useExerciseContext } from '../context/ExerciseContext';
import { ExerciseLoadingSkeleton } from './ExerciseLoadingSkeleton';
import { ExerciseErrorState } from './ExerciseErrorState';
import { ExerciseCompletedState } from './ExerciseCompletedState';
import { ExerciseLoader } from './ExerciseLoader';
import { ExerciseSidebar } from './ExerciseSidebar';

export const ExerciseLayout: React.FC = () => {
  const {
    user,
    gamificationData,
    logout,
    exercise,
    MechanicComponent,
    isLoading,
    pedagogicalGuide,
    autoSaveStatus,
    lastSavedAt,
    hasUnsavedChanges,
    feedback,
    showFeedback,
    setShowFeedback,
    navigateBack,
  } = useExerciseContext();

  // === Loading state ===
  if (isLoading) {
    return <ExerciseLoadingSkeleton />;
  }

  // === Error state ===
  if (!exercise || !MechanicComponent) {
    return <ExerciseErrorState />;
  }

  // === Completed state ===
  if (exercise.completed) {
    return <ExerciseCompletedState />;
  }

  // === Main render ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => { await logout(); }}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Exercise Header */}
        <ExercisePageHeader
          exercise={exercise}
          autoSaveStatus={autoSaveStatus}
          lastSavedAt={lastSavedAt}
          hasUnsavedChanges={hasUnsavedChanges}
          className="mb-6"
        />

        {/* Pedagogical Guide */}
        {exercise.mechanicData && (
          <ExerciseGuide
            objective={pedagogicalGuide.objective}
            how_to_solve={pedagogicalGuide.how_to_solve}
            recommended_strategy={pedagogicalGuide.recommended_strategy}
            pedagogical_notes={pedagogicalGuide.pedagogical_notes}
            defaultExpanded={false}
            className="mb-6"
          />
        )}

        {/* Main Grid Layout */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Exercise Area (3/4) */}
          <div className="lg:col-span-3">
            <ExerciseLoader />
          </div>

          {/* Sidebar (1/4) */}
          <div className="lg:col-span-1">
            <ExerciseSidebar />
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedback && showFeedback && (
          <FeedbackModal
            isOpen={showFeedback}
            feedback={feedback}
            onClose={() => {
              setShowFeedback(false);
              if (feedback.type === 'success') {
                navigateBack();
              }
            }}
            onRetry={() => {
              setShowFeedback(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
