/**
 * useExerciseComodines Hook
 *
 * Manages real comodines (power-ups) during exercise execution.
 * Replaces the mock-data PowerUpBar with actual backend API integration.
 *
 * Consumes:
 * - getComodinInventory() from comodinesAPI.ts
 * - useComodin() from comodinesAPI.ts
 *
 * @version 1.0.0
 * @since Phase 2 - Exercise System Restructuring
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getComodinInventory,
  useComodin as apiUseComodin,
  type ComodinType,
  type ComodinInventory,
} from '@/features/gamification/economy/api/comodinesAPI';
import type { ExerciseComodinesContext } from '../types/exercise-mechanic.types';

// ============================================================================
// TYPES
// ============================================================================

interface ComodinUsageLog {
  type: ComodinType;
  timestamp: number;
  exerciseId: string;
}

interface ComodinUsageLimits {
  pistas: { max: 3; used: number };
  vision_lectora: { max: 1; used: number };
  segunda_oportunidad: { max: 1; used: number };
}

export interface UseExerciseComodinesReturn {
  /** User's comodin inventory (from backend) */
  inventory: ComodinInventory | null;
  /** Use a specific comodin */
  useComodin: (type: ComodinType) => Promise<boolean>;
  /** Check if a comodin can be used (stock + limits) */
  canUse: (type: ComodinType) => boolean;
  /** Log of comodines used in this attempt */
  usageLog: ComodinUsageLog[];
  /** Context object to pass to mechanic components */
  comodinesContext: ExerciseComodinesContext;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Usage limits for this attempt */
  usageLimits: ComodinUsageLimits;
  /** Get list of used comodin types for submission */
  getUsedComodinTypes: () => string[];
}

// ============================================================================
// HOOK
// ============================================================================

export function useExerciseComodines(
  exerciseId: string | undefined,
  userId: string | undefined,
  allowedComodines?: ComodinType[] | null,
): UseExerciseComodinesReturn {
  const [inventory, setInventory] = useState<ComodinInventory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track usage within this exercise attempt
  const [usageLimits, setUsageLimits] = useState<ComodinUsageLimits>({
    pistas: { max: 3, used: 0 },
    vision_lectora: { max: 1, used: 0 },
    segunda_oportunidad: { max: 1, used: 0 },
  });

  const usageLogRef = useRef<ComodinUsageLog[]>([]);

  // Derived comodines context for mechanic components
  const [comodinesContext, setComodinesContext] = useState<ExerciseComodinesContext>({
    hintsRevealed: 0,
    visionActive: false,
    hasSecondChance: false,
    timeExtension: 0,
    multiplierActive: false,
  });

  // Fetch inventory on mount
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const inv = await getComodinInventory(userId);
        if (!cancelled) {
          setInventory(inv);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useExerciseComodines] Failed to fetch inventory:', err);
          setError('No se pudo cargar el inventario de comodines');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /**
   * Check if a comodin can be used.
   */
  const canUse = useCallback(
    (type: ComodinType): boolean => {
      // Check if type is allowed for this exercise
      if (allowedComodines && !allowedComodines.includes(type)) {
        return false;
      }

      // Check usage limit for this attempt
      const limit = usageLimits[type];
      if (limit.used >= limit.max) {
        return false;
      }

      // Check inventory stock
      if (!inventory) return false;
      const item = inventory[type];
      if (!item || item.available <= 0) {
        return false;
      }

      return true;
    },
    [allowedComodines, usageLimits, inventory],
  );

  /**
   * Use a comodin. Calls the backend API and updates local state.
   */
  const useComodin = useCallback(
    async (type: ComodinType): Promise<boolean> => {
      if (!canUse(type) || !userId || !exerciseId) {
        return false;
      }

      setError(null);

      try {
        // Call backend API
        const result = await apiUseComodin({
          user_id: userId,
          comodin_type: type,
          quantity: 1,
          exercise_id: exerciseId,
          context: `Exercise ${exerciseId}`,
        });

        if (!result.success) {
          setError('No se pudo usar el comodín');
          return false;
        }

        // Update local inventory
        setInventory((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [type]: {
              ...prev[type],
              available: result.remaining_quantity,
              used_total: prev[type].used_total + 1,
            },
          };
        });

        // Update usage limits
        setUsageLimits((prev) => ({
          ...prev,
          [type]: { ...prev[type], used: prev[type].used + 1 },
        }));

        // Log usage
        usageLogRef.current.push({
          type,
          timestamp: Date.now(),
          exerciseId,
        });

        // Update comodines context based on type
        setComodinesContext((prev) => {
          switch (type) {
            case 'pistas':
              return { ...prev, hintsRevealed: prev.hintsRevealed + 1 };
            case 'vision_lectora':
              return { ...prev, visionActive: true };
            case 'segunda_oportunidad':
              return { ...prev, hasSecondChance: true };
            default:
              return prev;
          }
        });

        return true;
      } catch (err) {
        console.error('[useExerciseComodines] API error:', err);
        setError('Error al usar comodín. Intenta nuevamente.');
        return false;
      }
    },
    [canUse, userId, exerciseId],
  );

  /**
   * Get list of used comodin type strings for submission payload.
   */
  const getUsedComodinTypes = useCallback((): string[] => {
    return usageLogRef.current.map((log) => log.type);
  }, []);

  return {
    inventory,
    useComodin,
    canUse,
    usageLog: usageLogRef.current,
    comodinesContext,
    isLoading,
    error,
    usageLimits,
    getUsedComodinTypes,
  };
}
