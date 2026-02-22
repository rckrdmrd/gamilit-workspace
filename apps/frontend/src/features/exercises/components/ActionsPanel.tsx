/**
 * ActionsPanel
 *
 * Standard actions sidebar for all exercise types.
 * Extracted from ExercisePage.tsx lines 892-987.
 *
 * @version 1.0.0
 * @since Phase 3 - Exercise System Restructuring
 */

import {
  ArrowLeft,
  Save,
  Send,
  SkipForward,
  RotateCcw,
  Check,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { HintSystem } from '@shared/components/mechanics/HintSystem';
import { useExerciseContext } from '../context/ExerciseContext';

export const ActionsPanel = () => {
  const {
    navigateBack,
    handleSaveProgress,
    handleSkip,
    handleSubmit,
    hasUnsavedChanges,
    mechanicActionsRef,
    hints,
  } = useExerciseContext();

  return (
    <DetectiveCard hoverable={false}>
      <h3 className="mb-3 text-sm font-bold text-detective-text">Acciones</h3>
      <div className="space-y-2">
        {/* Navigation Actions */}
        <DetectiveButton
          variant="blue"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={navigateBack}
          className="w-full"
        >
          Volver
        </DetectiveButton>

        <DetectiveButton
          variant="secondary"
          icon={<Save className="h-4 w-4" />}
          onClick={handleSaveProgress}
          disabled={!hasUnsavedChanges}
          className="w-full"
        >
          Guardar
        </DetectiveButton>

        <DetectiveButton
          variant="secondary"
          icon={<SkipForward className="h-4 w-4" />}
          onClick={handleSkip}
          className="w-full"
        >
          Omitir
        </DetectiveButton>

        <div className="border-detective-border my-2 border-t"></div>

        {/* Mechanic Actions */}
        <DetectiveButton
          variant="blue"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={() => mechanicActionsRef.current.handleReset?.()}
          className="w-full"
        >
          Reiniciar
        </DetectiveButton>

        <DetectiveButton
          variant="gold"
          icon={<Check className="h-4 w-4" />}
          onClick={() => mechanicActionsRef.current.handleCheck?.()}
          className="w-full"
        >
          Verificar
        </DetectiveButton>

        {/* Submit Button */}
        <DetectiveButton
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          onClick={() => handleSubmit()}
          className="w-full"
        >
          Enviar Respuestas
        </DetectiveButton>

        {/* Specific Mechanic Actions */}
        {mechanicActionsRef.current.specificActions &&
          mechanicActionsRef.current.specificActions.length > 0 && (
            <>
              {mechanicActionsRef.current.specificActions.map((action, index) => (
                <DetectiveButton
                  key={index}
                  variant={action.variant || 'secondary'}
                  icon={action.icon}
                  onClick={action.onClick}
                  className="w-full"
                >
                  {action.label}
                </DetectiveButton>
              ))}
            </>
          )}

        {/* Hints */}
        {hints.length > 0 && (
          <HintSystem
            hints={hints}
            onHintUsed={(_hintIndex) => {
              // Hints cost is now handled via comodines
            }}
          />
        )}
      </div>
    </DetectiveCard>
  );
};
