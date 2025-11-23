// ========================================
// CORRECCIÓN C1.1.4: Crear RangoMayaEnum
// ========================================

/**
 * ENUM para sistema de rangos Maya básico
 * Corresponde a: public.rango_maya en PostgreSQL
 *
 * Valores en DB:
 * - nacom: Rango inicial
 * - batab: Rango intermedio
 * - holcatte: Rango avanzado
 * - guerrero: Rango experto
 * - mercenario: Rango maestro
 *
 * NOTA: Este es diferente a MayaRankGamificationEnum
 * RangoMayaEnum es el sistema básico en public schema
 * MayaRankGamificationEnum es el sistema avanzado en gamification_system schema
 *
 * @see gamification_system.maya_rank para el sistema avanzado
 */
export enum RangoMayaEnum {
  NACOM = 'nacom',
  BATAB = 'batab',
  HOLCATTE = 'holcatte',
  GUERRERO = 'guerrero',
  MERCENARIO = 'mercenario'
}
