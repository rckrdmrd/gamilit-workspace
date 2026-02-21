/**
 * MechanicCompatWrapper
 *
 * Adapts the new standardized ExerciseMechanicProps to the legacy prop
 * signatures used by the existing 30 mechanic components.
 *
 * This allows all mechanics to work without modification from day 1.
 * As mechanics are migrated to use ExerciseMechanicProps directly,
 * they no longer need this wrapper.
 *
 * Legacy prop patterns observed:
 *
 * Pattern A (M1-M2): { exercise, onComplete, onProgressUpdate, actionsRef }
 * Pattern B (M3-M5): { exerciseId, onComplete, onProgressUpdate, actionsRef, initialData, difficulty }
 *
 * Both patterns are supported by passing through all props.
 *
 * @version 1.0.0
 * @since Phase 5 - Exercise System Restructuring
 */
import React from 'react';
import type { ExerciseMechanicProps } from '../types/exercise-mechanic.types';

interface MechanicCompatWrapperProps extends ExerciseMechanicProps {
  Component: React.ComponentType<Record<string, unknown>>;
  onExit?: () => void;
}

/**
 * Wraps a legacy mechanic component to receive standardized props.
 * Passes through all props that the legacy component expects.
 */
export const MechanicCompatWrapper: React.FC<MechanicCompatWrapperProps> = ({
  Component,
  exercise,
  exerciseId,
  onComplete,
  onProgressUpdate,
  actionsRef,
  initialData,
  comodinesContext: _comodinesContext,
  onExit,
}) => {
  return (
    <Component
      exercise={exercise}
      exerciseId={exerciseId}
      onComplete={onComplete}
      onProgressUpdate={onProgressUpdate}
      actionsRef={actionsRef}
      initialData={initialData}
      onExit={onExit}
    />
  );
};
