/**
 * Users Types (Legacy)
 *
 * DEPRECADO: Este archivo existe solo para compatibilidad hacia atrás.
 * Usar las definiciones canónicas de user.types.ts directamente.
 *
 * @deprecated Usar imports desde user.types.ts
 * @see user.types.ts para definiciones canónicas
 *
 * Actualizado: 2026-01-07 - Consolidación de tipos duplicados
 */

// Re-export User from auth.types (mantener compatibilidad)
export type { User } from './auth.types';

// Re-export UserRole from canonical source
// NOTA: user.types.ts contiene la definición completa con mapeo a BD
export type { UserRole } from './user.types';

// Re-export other types from canonical source
export type {
  UserGamificationData,
  TableRow,
} from './user.types';

// Re-export UserProfile (viene de profile.types via user.types)
export type { UserProfile } from './user.types';
