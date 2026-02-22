/**
 * Progress Tracker Component
 * Shows progress through exercise steps
 */

import { Check } from 'lucide-react';

/**
 * Props for ProgressTracker component
 * @property currentStep - Current step number (1-indexed)
 * @property totalSteps - Total number of steps
 * @property stepLabels - Optional labels for each step
 * @property variant - Optional visual variant (e.g., 'tiktok', 'default')
 */
export interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  variant?: string;
}

export const ProgressTracker = ({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressTrackerProps) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label={`Progreso del ejercicio: paso ${currentStep} de ${totalSteps}`}
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2"
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <ol className="flex justify-between items-center list-none p-0 m-0" aria-label="Pasos del ejercicio">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step <= currentStep;
          const isCurrent = step === currentStep;
          const stepLabel = stepLabels?.[i];
          const stateLabel = isCompleted
            ? 'completado'
            : isCurrent
            ? 'actual'
            : 'pendiente';

          return (
            <li key={step} className="flex flex-col items-center">
              <div
                aria-label={`Paso ${step}${stepLabel ? `: ${stepLabel}` : ''} — ${stateLabel}`}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : step}
              </div>
              {stepLabel && (
                <span className="text-xs text-gray-600 mt-1">
                  {stepLabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProgressTracker;
