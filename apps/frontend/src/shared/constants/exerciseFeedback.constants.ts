/**
 * Exercise Feedback Constants
 *
 * Constantes compartidas para mensajes de feedback en ejercicios.
 * Garantiza consistencia en todos los ejercicios M3-M5.
 *
 * @see useExerciseSubmission - Hook que usa estas constantes
 * @see FeedbackModal - Componente que muestra estos mensajes
 */

/**
 * Mensajes para ejercicios pendientes de revisión manual
 */
export const PENDING_REVIEW_FEEDBACK = {
  /** Tipo de feedback para pending_review */
  type: 'info' as const,

  /** Mensaje base que se muestra mientras espera revisión */
  message: 'Tu trabajo ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',

  /** Mensaje alternativo más corto */
  messageShort: 'Enviado para revisión del maestro.',
} as const;

/**
 * Títulos por tipo de ejercicio para estado pending_review
 */
export const PENDING_REVIEW_TITLES: Record<string, string> = {
  // M3 Exercises
  'debate-digital': 'Debate Enviado',
  'podcast-argumentativo': 'Podcast Enviado',

  // M4 Exercises
  'verificador-fake-news': 'Verificación Enviada',
  'analisis-memes': 'Análisis Enviado',
  'infografia-interactiva': 'Infografía Enviada',
  'quiz-tiktok': 'Quiz Enviado',
  'navegacion-hipertextual': 'Navegación Enviada',

  // M5 Exercises
  'comic-digital': 'Cómic Enviado',
  'video-carta': 'Video Carta Enviada',
  'diario-multimedia': 'Diario Enviado',

  // Default
  default: 'Ejercicio Enviado',
} as const;

/**
 * Mensajes para ejercicios completados (ya evaluados)
 */
export const COMPLETED_FEEDBACK = {
  /** Tipo de feedback para completed */
  type: 'success' as const,

  /** Mensaje base cuando el ejercicio ya fue evaluado */
  message: 'Tu trabajo ha sido evaluado correctamente.',
} as const;

/**
 * Títulos por tipo de ejercicio para estado completado
 */
export const COMPLETED_TITLES: Record<string, string> = {
  // M3 Exercises
  'debate-digital': '¡Debate Completado!',
  'podcast-argumentativo': '¡Podcast Completado!',

  // M4 Exercises
  'verificador-fake-news': '¡Verificación Completada!',
  'analisis-memes': '¡Análisis Completado!',
  'infografia-interactiva': '¡Infografía Completada!',
  'quiz-tiktok': '¡Quiz Completado!',
  'navegacion-hipertextual': '¡Navegación Completada!',

  // M5 Exercises
  'comic-digital': '¡Cómic Completado!',
  'video-carta': '¡Video Carta Completada!',
  'diario-multimedia': '¡Diario Completado!',

  // Default
  default: '¡Ejercicio Completado!',
} as const;

/**
 * Mensajes de error genéricos
 */
export const ERROR_FEEDBACK = {
  /** Tipo de feedback para error */
  type: 'error' as const,

  /** Título para errores de envío */
  title: 'Error al Enviar',

  /** Mensaje genérico de error */
  message: 'Hubo un problema al enviar tu trabajo. Intenta de nuevo.',
} as const;

/**
 * Helper para obtener el título de pending_review según tipo de ejercicio
 */
export function getPendingReviewTitle(exerciseType: string): string {
  return PENDING_REVIEW_TITLES[exerciseType] || PENDING_REVIEW_TITLES.default;
}

/**
 * Helper para obtener el título de completado según tipo de ejercicio
 */
export function getCompletedTitle(exerciseType: string): string {
  return COMPLETED_TITLES[exerciseType] || COMPLETED_TITLES.default;
}
