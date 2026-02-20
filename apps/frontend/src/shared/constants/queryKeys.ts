/**
 * Query Key Factories y Constantes para React Query
 *
 * Centraliza los tiempos de stale y utilidades de cache
 * para uso consistente en todos los hooks de React Query.
 *
 * @see docs/40-standards/STANDARD-API.md
 */

export const STALE_TIMES = {
  /** Configuracion, branding, metadata */
  STATIC: 10 * 60 * 1000,
  /** Modulos, templates, logros */
  SEMI_STATIC: 5 * 60 * 1000,
  /** Progreso, estadisticas, leaderboard */
  DYNAMIC: 60 * 1000,
  /** Notificaciones, mensajes, datos en vivo */
  REALTIME: 30 * 1000,
} as const;
