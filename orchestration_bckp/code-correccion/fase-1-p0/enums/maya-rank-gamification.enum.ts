// ========================================
// CORRECCIÓN C1.2.1: Crear MayaRankGamificationEnum
// ========================================

/**
 * ENUM para sistema avanzado de rangos Maya en gamificación
 * Corresponde a: gamification_system.maya_rank en PostgreSQL
 *
 * Valores en DB (con tildes y caracteres especiales):
 * - Ajaw: Señor/Rey (rango más alto)
 * - Nacom: Jefe militar
 * - Ah K'in: Sacerdote del sol
 * - Halach Uinic: Hombre verdadero/líder
 * - K'uk'ulkan: Serpiente emplumada (deidad)
 *
 * Este sistema es diferente al sistema básico en public.rango_maya
 * Se usa en el módulo de gamificación avanzada
 *
 * @see RangoMayaEnum para el sistema básico
 */
export enum MayaRankGamificationEnum {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = 'Ah K\'in',
  HALACH_UINIC = 'Halach Uinic',
  KUKUKULKAN = 'K\'uk\'ulkan'
}

/**
 * Notas de migración:
 *
 * 1. Reemplazar referencias a MayaRank (sin Enum) con MayaRankGamificationEnum
 * 2. Actualizar DTOs en gamification-system:
 *    - UserRankDto
 *    - AchievementDto
 *    - LeaderboardDto
 *
 * 3. Ejemplo de uso:
 *
 * import { MayaRankGamificationEnum } from '@shared/enums';
 *
 * @IsEnum(MayaRankGamificationEnum)
 * maya_rank: MayaRankGamificationEnum;
 */
