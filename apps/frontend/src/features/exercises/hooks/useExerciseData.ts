/**
 * useExerciseData Hook
 *
 * Fetches exercise data from the API, loads the mechanic component dynamically,
 * and adapts the data to the mechanic's format using the Exercise Registry.
 *
 * Extracted from ExercisePage.tsx lines 249-361.
 *
 * @version 1.0.0
 * @since Phase 2 - Exercise System Restructuring
 */
import { useState, useEffect, useMemo } from 'react';
import {
  getExercise,
  getExerciseHints,
} from '@/services/api/educationalAPI';
import { getExerciseEntry } from '../registry/exercise-registry';
import { adaptExerciseData } from '@shared/utils/exerciseAdapter';
import { DifficultyLevel } from '@shared/types/educational.types';
import type { ExerciseRegistryEntry } from '../types/exercise-mechanic.types';

// Ensure all registrations are loaded
import '../registry/registrations';

// ============================================================================
// TYPES
// ============================================================================

export interface ExerciseData {
  id: string;
  module_id: string;
  title: string;
  type: string;
  description: string;
  difficulty: DifficultyLevel;
  points: number;
  estimatedTime: number;
  completed: boolean;
  moduleTitle?: string;
  mechanicData?: Record<string, unknown>;
  is_active?: boolean;
}

export interface PedagogicalGuide {
  objective?: string;
  how_to_solve?: string;
  recommended_strategy?: string;
  pedagogical_notes?: string;
}

export interface UseExerciseDataReturn {
  exercise: ExerciseData | null;
  adaptedExercise: Record<string, unknown> | null;
  mechanicEntry: ExerciseRegistryEntry | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MechanicComponent: React.ComponentType<any> | null;
  isLoading: boolean;
  error: string | null;
  hints: string[];
  pedagogicalGuide: PedagogicalGuide;
  isInactive: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useExerciseData(exerciseId: string | undefined): UseExerciseDataReturn {
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MechanicComponent, setMechanicComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchExercise = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const exerciseData = await getExercise(exerciseId);

        if (cancelled) return;

        // Map API response to ExerciseData format
        // Cast to allow access to aliased/dynamic fields from backend
        const exerciseRecord = exerciseData as unknown as Record<string, unknown>;
        const exerciseType =
          exerciseData.type ||
          exerciseData.exercise_type ||
          (exerciseRecord).exerciseType ||
          'crucigrama_cientifico';

        const mappedExercise: ExerciseData = {
          id: exerciseData.id,
          module_id: exerciseData.module_id || exerciseRecord.moduleId as string,
          title: exerciseData.title,
          type: exerciseType,
          description: exerciseData.description || '',
          difficulty: exerciseData.difficulty,
          points: exerciseData.points || exerciseData.max_points || 0,
          estimatedTime:
            exerciseData.estimatedTime ||
            (exerciseData.estimated_time_minutes ? exerciseData.estimated_time_minutes * 60 : 900),
          completed: exerciseData.completed || false,
          moduleTitle: undefined,
          mechanicData: exerciseRecord as Record<string, unknown>,
          is_active: exerciseData.is_active,
        };

        setExercise(mappedExercise);

        // Fetch hints (non-blocking)
        try {
          const exerciseHints = await getExerciseHints(exerciseId);
          if (!cancelled && Array.isArray(exerciseHints)) {
            setHints(
              exerciseHints.map((h: unknown) => {
                if (typeof h === 'string') return h;
                const hint = h as { text?: string };
                return hint.text || String(h);
              }),
            );
          }
        } catch {
          // Hints are optional — continue without them
        }

        // Check if exercise is active
        const isActiveExercise = exerciseData.is_active !== false;

        if (!isActiveExercise) {
          setIsInactive(true);
          // Load UnderConstructionExercise
          const mod = await import('@/features/exercises/components/UnderConstructionExercise');
          if (!cancelled) {
            setMechanicComponent(() => mod.UnderConstructionExercise || mod.default);
          }
        } else {
          setIsInactive(false);
          // Use registry first, fall back to legacy loadMechanic
          const entry = getExerciseEntry(mappedExercise.type);
          if (entry) {
            const mod = await entry.loader();
            if (!cancelled) {
              setMechanicComponent(() => mod.default);
            }
          } else {
            console.warn(`[useExerciseData] No registry entry for type: ${mappedExercise.type}`);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading exercise:', err);

        // Fallback to mock data
        const mockExercise: ExerciseData = {
          id: exerciseId,
          module_id: '',
          title: 'Crucigrama: Primeros Años de Marie Curie',
          type: 'crucigrama_cientifico',
          description: 'Completa el crucigrama sobre los primeros años de la científica Marie Curie',
          difficulty: DifficultyLevel.INTERMEDIATE,
          points: 150,
          estimatedTime: 900,
          completed: false,
          moduleTitle: 'Los Primeros Pasos de Marie Curie',
          mechanicData: {},
        };

        setExercise(mockExercise);
        setError('No se pudo conectar con el servidor. Estás viendo datos de ejemplo.');

        const entry = getExerciseEntry(mockExercise.type);
        if (entry) {
          const mod = await entry.loader();
          if (!cancelled) {
            setMechanicComponent(() => mod.default);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchExercise();

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // Adapt exercise data using registry adapter or legacy adapter
  const adaptedExercise = useMemo(() => {
    if (!exercise) return null;
    const entry = getExerciseEntry(exercise.type);
    if (entry) {
      return entry.adapter(exercise);
    }
    // Fallback to legacy adapter
    return adaptExerciseData(exercise);
  }, [exercise]);

  // Extract pedagogical guide from exercise data
  const pedagogicalGuide = useMemo<PedagogicalGuide>(() => {
    if (!exercise?.mechanicData) return {};
    return {
      objective: exercise.mechanicData.objective as string | undefined,
      how_to_solve: exercise.mechanicData.how_to_solve as string | undefined,
      recommended_strategy: exercise.mechanicData.recommended_strategy as string | undefined,
      pedagogical_notes: exercise.mechanicData.pedagogical_notes as string | undefined,
    };
  }, [exercise]);

  // Get registry entry for the type
  const mechanicEntry = useMemo(() => {
    if (!exercise) return undefined;
    return getExerciseEntry(exercise.type);
  }, [exercise]);

  return {
    exercise,
    adaptedExercise,
    mechanicEntry,
    MechanicComponent,
    isLoading,
    error,
    hints,
    pedagogicalGuide,
    isInactive,
  };
}
