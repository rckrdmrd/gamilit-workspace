/**
 * Exercise Registry
 *
 * Central registry for all exercise mechanics.
 * Allows adding new exercises by registering them here instead of
 * modifying ExercisePage or exerciseAdapter.
 *
 * @version 1.0.0
 * @since Phase 1 - Exercise System Restructuring
 */

import type { ExerciseRegistryEntry, ExerciseMechanicMeta } from '../types/exercise-mechanic.types';

// ============================================================================
// REGISTRY
// ============================================================================

const registry = new Map<string, ExerciseRegistryEntry>();

/**
 * Register an exercise mechanic.
 *
 * @param types - One or more exercise type strings that map to this mechanic.
 *                All types are normalized to lowercase.
 * @param entry - The registry entry (loader, adapter, meta).
 *
 * @example
 * registerExercise(['crucigrama', 'crucigrama_cientifico'], {
 *   loader: () => import('@/features/mechanics/module1/Crucigrama/CrucigramaExercise'),
 *   adapter: adaptToCrucigramaData,
 *   meta: { displayName: 'Crucigrama', module: 1, category: 'literal' },
 * });
 */
export function registerExercise(
  types: string | string[],
  entry: ExerciseRegistryEntry,
): void {
  const typeArray = Array.isArray(types) ? types : [types];
  for (const type of typeArray) {
    const key = type.toLowerCase();
    if (registry.has(key)) {
      console.warn(`[ExerciseRegistry] Overwriting existing registration for type: ${key}`);
    }
    registry.set(key, entry);
  }
}

/**
 * Get the registry entry for a given exercise type.
 * Returns undefined if the type is not registered.
 */
export function getExerciseEntry(type: string): ExerciseRegistryEntry | undefined {
  return registry.get(type.toLowerCase());
}

/**
 * Get all registered exercise types.
 */
export function getAllRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}

/**
 * Get all unique registry entries (deduplicated — multiple types can point to same entry).
 */
export function getAllRegisteredEntries(): Array<{
  types: string[];
  entry: ExerciseRegistryEntry;
}> {
  const seen = new Map<ExerciseRegistryEntry, string[]>();
  for (const [type, entry] of registry) {
    const existing = seen.get(entry);
    if (existing) {
      existing.push(type);
    } else {
      seen.set(entry, [type]);
    }
  }
  return Array.from(seen.entries()).map(([entry, types]) => ({ types, entry }));
}

/**
 * Get metadata for a given exercise type.
 */
export function getExerciseMeta(type: string): ExerciseMechanicMeta | undefined {
  return registry.get(type.toLowerCase())?.meta;
}

/**
 * Check if a type is registered.
 */
export function isExerciseRegistered(type: string): boolean {
  return registry.has(type.toLowerCase());
}
