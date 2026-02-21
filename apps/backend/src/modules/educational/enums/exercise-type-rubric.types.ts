/**
 * Exercise Type Rubric Types
 *
 * Extracted from exercise-type-rubric.entity.ts to avoid architecture violations
 * (DTOs should not import from entity files).
 */

/**
 * Estructura de criterio de evaluacion
 * FIX TASK-2026-01-18-011: Agregado campo id opcional (definido en seeds de BD)
 */
export interface RubricCriteria {
  id?: string; // ID unico del criterio (definido en seeds, ej: "clasificacion", "veredicto")
  name: string;
  description: string;
  weight: number; // Porcentaje (suma total = 100)
  levels: {
    score: number;
    label: string;
    description: string;
  }[];
}
