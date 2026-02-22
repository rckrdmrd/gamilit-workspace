/**
 * ExerciseSidebar
 *
 * Right sidebar for exercise page. Composes:
 * - ConsumablesPanel (real comodines)
 * - PowerUpBar (legacy, shown if available)
 * - ActionsPanel
 * - ScoreDisplay, TimerWidget, ProgressTracker, ML Coins
 *
 * @version 1.0.0
 * @since Phase 3 - Exercise System Restructuring
 */

import { Star } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ScoreDisplay } from '@shared/components/mechanics/ScoreDisplay';
import { TimerWidget } from '@shared/components/mechanics/TimerWidget';
import { ProgressTracker } from '@shared/components/mechanics/ProgressTracker';
import { PowerUpBar } from '@/apps/student/components/PowerUpBar';
import { useExerciseContext } from '../context/ExerciseContext';
import { ConsumablesPanel } from './ConsumablesPanel';
import { ActionsPanel } from './ActionsPanel';

export const ExerciseSidebar = () => {
  const {
    exercise,
    progress,
    availableCoins,
    powerUps,
    comodines,
  } = useExerciseContext();

  return (
    <div className="space-y-4">
      {/* Comodines Panel (real API) */}
      {comodines.inventory && <ConsumablesPanel />}

      {/* Legacy Power-ups Bar (shown if available and no real comodines) */}
      {!comodines.inventory && (
        <PowerUpBar
          availablePowerUps={powerUps.availablePowerUps}
          activePowerUps={powerUps.activePowerUps}
          onActivatePowerUp={powerUps.activatePowerUp}
          disabled={powerUps.isLoading}
        />
      )}

      {/* Power-up error */}
      {powerUps.error && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs text-red-700">
          {powerUps.error}
        </div>
      )}

      {/* Actions */}
      <ActionsPanel />

      {/* Score Display */}
      <DetectiveCard hoverable={false}>
        <h3 className="mb-3 text-sm font-bold text-detective-text">Puntuación</h3>
        <ScoreDisplay score={progress.score} maxScore={exercise?.points || 100} />
      </DetectiveCard>

      {/* Timer */}
      <DetectiveCard hoverable={false}>
        <h3 className="mb-3 text-sm font-bold text-detective-text">Tiempo</h3>
        <TimerWidget startTime={Date.now()} isPaused={false} showSeconds={true} />
      </DetectiveCard>

      {/* Progress Tracker */}
      <DetectiveCard hoverable={false}>
        <h3 className="mb-3 text-sm font-bold text-detective-text">Progreso</h3>
        <ProgressTracker
          currentStep={progress.currentStep}
          totalSteps={progress.totalSteps}
        />
        <p className="mt-2 text-center text-sm text-detective-text-secondary">
          {progress.currentStep} de {progress.totalSteps}
        </p>
      </DetectiveCard>

      {/* ML Coins Display */}
      <DetectiveCard hoverable={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-detective-gold" />
            <span className="text-sm font-bold text-detective-text">ML Coins</span>
          </div>
          <span className="text-xl font-bold text-detective-gold">{availableCoins}</span>
        </div>
      </DetectiveCard>
    </div>
  );
};
