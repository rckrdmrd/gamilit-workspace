/**
 * useExercisePowerUps Hook
 *
 * Manages power-ups during exercise execution
 * Handles activation, effects, and backend synchronization
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePowerUps } from '@/features/gamification/social/hooks/usePowerUps';
import { apiClient } from '@/services/api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface PowerUpEffects {
  hintsRevealed: number;
  timeExtension: number;
  hasSecondChance: boolean;
  visionActive: boolean;
  multiplierActive: boolean;
}

interface UsePowerUpOptions {
  exerciseId: string;
  userId?: string;
  onHintReveal?: (hintCount: number) => void;
  onTimeExtension?: (seconds: number) => void;
  onSecondChance?: () => void;
  onVisionActivate?: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export const useExercisePowerUps = (options: UsePowerUpOptions) => {
  const { exerciseId, userId, onHintReveal, onTimeExtension, onSecondChance, onVisionActivate } =
    options;

  // Power-ups store
  const { powerUps, applyPowerUp, getActivePowerUps, getAvailablePowerUps } = usePowerUps();

  // Local state for effects
  const [effects, setEffects] = useState<PowerUpEffects>({
    hintsRevealed: 0,
    timeExtension: 0,
    hasSecondChance: false,
    visionActive: false,
    multiplierActive: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track used power-ups for submission
  const usedPowerUpsRef = useRef<string[]>([]);

  // Get active power-ups with updated remaining time
  const activePowerUps = getActivePowerUps();
  const availablePowerUps = getAvailablePowerUps();

  /**
   * Activate a power-up
   */
  const activatePowerUp = useCallback(
    async (powerUpId: string) => {
      const powerUp = powerUps.find((p) => p.id === powerUpId);
      if (!powerUp) {
        setError('Power-up no encontrado');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Apply power-up locally first (optimistic update)
        const success = applyPowerUp(powerUpId);

        if (!success) {
          throw new Error('No se pudo activar el power-up. Verifica que tengas suficientes.');
        }

        // Map frontend power-up to backend comodin type
        const comodinTypeMap: Record<string, string> = {
          'powerup-001': 'pistas', // Pistas Mejoradas
          'powerup-002': 'vision_lectora', // Visión Lectora
          'powerup-003': 'segunda_oportunidad', // Segunda Oportunidad
          'powerup-004': 'pistas', // Extensión de Tiempo (use pistas as fallback)
        };

        const comodinType = comodinTypeMap[powerUpId];

        // Sync with backend if we have userId and mapped type
        if (userId && comodinType) {
          try {
            await apiClient.post('/gamification/comodines/use', {
              user_id: userId,
              comodin_type: comodinType,
              quantity: 1,
              exercise_id: exerciseId,
              context: `Used ${powerUp.name} during exercise`,
            });
          } catch (apiError) {
            console.warn('Failed to sync power-up usage with backend:', apiError);
            // Continue with local-only usage (graceful degradation)
          }
        }

        // Track usage for submission
        usedPowerUpsRef.current.push(powerUpId);

        // Apply effects based on power-up type
        switch (powerUp.effect.type) {
          case 'hint':
            setEffects((prev) => ({
              ...prev,
              hintsRevealed: prev.hintsRevealed + powerUp.effect.value,
            }));
            onHintReveal?.(powerUp.effect.value);
            break;

          case 'time':
            setEffects((prev) => ({
              ...prev,
              timeExtension: prev.timeExtension + powerUp.effect.value * 60, // Convert minutes to seconds
            }));
            onTimeExtension?.(powerUp.effect.value * 60);
            break;

          case 'retry':
            setEffects((prev) => ({
              ...prev,
              hasSecondChance: true,
            }));
            onSecondChance?.();
            break;

          case 'vision':
            setEffects((prev) => ({
              ...prev,
              visionActive: true,
            }));
            onVisionActivate?.();
            break;

          case 'multiplier':
            setEffects((prev) => ({
              ...prev,
              multiplierActive: true,
            }));
            break;

          default:
            console.warn('Unknown power-up effect type:', powerUp.effect.type);
        }

        setIsLoading(false);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al activar power-up';
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [
      powerUps,
      applyPowerUp,
      userId,
      exerciseId,
      onHintReveal,
      onTimeExtension,
      onSecondChance,
      onVisionActivate,
    ],
  );

  /**
   * Get used power-ups list for submission
   */
  const getUsedPowerUps = useCallback(() => {
    return usedPowerUpsRef.current;
  }, []);

  /**
   * Reset effects (for new exercise)
   */
  const resetEffects = useCallback(() => {
    setEffects({
      hintsRevealed: 0,
      timeExtension: 0,
      hasSecondChance: false,
      visionActive: false,
      multiplierActive: false,
    });
    usedPowerUpsRef.current = [];
    setError(null);
  }, []);

  /**
   * Check if specific power-up type is active
   */
  const isPowerUpActive = useCallback(
    (effectType: string): boolean => {
      return activePowerUps.some((p) => p.effect.type === effectType);
    },
    [activePowerUps],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset on unmount
      resetEffects();
    };
  }, [resetEffects]);

  return {
    // Power-ups
    availablePowerUps,
    activePowerUps,
    allPowerUps: powerUps,

    // Actions
    activatePowerUp,
    resetEffects,
    getUsedPowerUps,
    isPowerUpActive,

    // Effects
    effects,

    // State
    isLoading,
    error,

    // Utilities
    hasAvailablePowerUps: availablePowerUps.length > 0,
    hasActivePowerUps: activePowerUps.length > 0,
  };
};
