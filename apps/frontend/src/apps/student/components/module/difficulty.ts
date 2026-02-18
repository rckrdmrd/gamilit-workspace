/**
 * Difficulty Level Utilities
 *
 * Consolidated CEFR difficulty mappings used by ModuleDetailPage
 * and ExerciseCard components.
 *
 * @module apps/student/components/module/difficulty
 */

/** CEFR-standard difficulty labels */
export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante (A1)',
  elementary: 'Elemental (A2)',
  pre_intermediate: 'Pre-Intermedio (B1)',
  intermediate: 'Intermedio (B2)',
  upper_intermediate: 'Intermedio Alto (C1)',
  advanced: 'Avanzado (C2)',
  proficient: 'Competente (C2+)',
  native: 'Nativo',
  // Legacy Spanish mapping (backward compatibility)
  facil: 'Facil',
  medio: 'Medio',
  dificil: 'Dificil',
  experto: 'Experto',
};

/** Short labels (no CEFR code) for stat cards */
export const DIFFICULTY_SHORT_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  elementary: 'Elemental',
  pre_intermediate: 'Pre-Intermedio',
  intermediate: 'Intermedio',
  upper_intermediate: 'Intermedio Alto',
  advanced: 'Avanzado',
  proficient: 'Competente',
  native: 'Nativo',
};

/** Text colors for difficulty badges */
export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-green-600',
  elementary: 'text-green-600',
  pre_intermediate: 'text-yellow-600',
  intermediate: 'text-yellow-600',
  upper_intermediate: 'text-orange-600',
  advanced: 'text-red-600',
  proficient: 'text-purple-600',
  native: 'text-purple-600',
};

/** Background colors for difficulty badges */
export const DIFFICULTY_BG_COLORS: Record<string, string> = {
  beginner: 'bg-green-100',
  elementary: 'bg-green-100',
  pre_intermediate: 'bg-yellow-100',
  intermediate: 'bg-yellow-100',
  upper_intermediate: 'bg-orange-100',
  advanced: 'bg-red-100',
  proficient: 'bg-purple-100',
  native: 'bg-purple-100',
};

/**
 * Get the CSS classes for a difficulty badge (border + gradient bg + text color).
 */
export function getDifficultyBadgeClasses(level: string): string {
  if (level === 'beginner' || level === 'elementary')
    return 'border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700';
  if (level === 'pre_intermediate' || level === 'intermediate')
    return 'border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700';
  if (level === 'upper_intermediate' || level === 'advanced')
    return 'border-red-300 bg-gradient-to-r from-red-100 to-rose-100 text-red-700';
  return 'border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700';
}
