/**
 * ExercisePage
 *
 * Thin shell that wraps ExerciseProvider + ExerciseLayout.
 * All logic has been decomposed into:
 * - features/exercises/context/ExerciseContext.tsx (state management)
 * - features/exercises/components/ExerciseLayout.tsx (UI composition)
 * - features/exercises/hooks/ (data, progress, comodines)
 * - features/exercises/registry/ (mechanic registration)
 *
 * Original monolithic implementation preserved in LegacyExercisePage.tsx.
 *
 * @version 2.0.0
 * @since Exercise System Restructuring
 */

import { useParams, Navigate } from 'react-router-dom';
import { ExerciseProvider } from '@/features/exercises/context/ExerciseContext';
import { ExerciseLayout } from '@/features/exercises/components/ExerciseLayout';

export default function ExercisePage() {
  const { exerciseId } = useParams();

  if (!exerciseId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <ExerciseProvider exerciseId={exerciseId}>
      <ExerciseLayout />
    </ExerciseProvider>
  );
}
