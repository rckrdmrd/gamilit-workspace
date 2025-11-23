// ========================================
// CORRECCIÓN C1.2.1: Crear MayaRankBasicEnum
// ========================================

/**
 * ENUM para sistema básico de rangos Maya
 * Corresponde a: public.maya_rank en PostgreSQL
 *
 * Valores en DB (lowercase):
 * - NACOM: Rango inicial (pero valor DB = 'nacom')
 * - BATAB: Rango intermedio (pero valor DB = 'batab')
 * - HOLCATTE: Rango avanzado (pero valor DB = 'holcatte')
 * - GUERRERO: Rango experto (pero valor DB = 'guerrero')
 * - MERCENARIO: Rango maestro (pero valor DB = 'mercenario')
 *
 * Este es el mismo que RangoMayaEnum pero con nomenclatura consistente
 *
 * @deprecated Usar RangoMayaEnum en su lugar
 * @see RangoMayaEnum
 */
export enum MayaRankBasicEnum {
  NACOM = 'NACOM',
  BATAB = 'BATAB',
  HOLCATTE = 'HOLCATTE',
  GUERRERO = 'GUERRERO',
  MERCENARIO = 'MERCENARIO'
}

/**
 * NOTA IMPORTANTE:
 *
 * Los valores en este ENUM están en MAYÚSCULAS pero en la DB están en minúsculas
 * Esto causa discrepancia.
 *
 * CORRECCIÓN NECESARIA: Cambiar valores a lowercase:
 *
 * export enum MayaRankBasicEnum {
 *   NACOM = 'nacom',
 *   BATAB = 'batab',
 *   HOLCATTE = 'holcatte',
 *   GUERRERO = 'guerrero',
 *   MERCENARIO = 'mercenario'
 * }
 *
 * O mejor aún, usar directamente RangoMayaEnum que ya tiene los valores correctos
 */
