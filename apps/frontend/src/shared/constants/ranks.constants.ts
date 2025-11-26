/**
 * Maya Ranks Constants - SSOT (Single Source of Truth)
 *
 * VERSIÓN: 2.0 (2025-11-16)
 *
 * SINCRONIZADO CON:
 * - Backend: /apps/backend/src/modules/gamification/services/ranks.service.ts
 * - Database: /apps/database/seeds/prod/gamification_system/03-maya_ranks.sql
 * - Documento: /docs/00-vision-general/ESPECIFICACION-TECNICA-RANGOS-MAYA-v2.0.md
 *
 * CAMBIOS v2.0:
 * - ✅ Ahora usa XP como fuente de verdad (antes usaba ML Coins incorrectamente)
 * - ✅ Umbrales XP ajustados a contenido disponible (2,500 XP máximo)
 * - ✅ ML Coins como bonus, no como criterio de rango
 * - ✅ Todos los 5 rangos son ahora alcanzables
 */

export enum MayaRank {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = "Ah K'in",
  HALACH_UINIC = 'Halach Uinic',
  KUKULKAN = "K'uk'ulkan",
}

export interface RankConfig {
  id: MayaRank;
  name: string;
  level: number;
  xpMin: number; // ✅ NUEVO: XP mínimo (fuente de verdad)
  xpMax: number | null; // ✅ NUEVO: XP máximo (null = sin límite)
  mlCoinsBonus: number; // ✅ CAMBIADO: De "required" a "bonus"
  xpMultiplier: number; // ✅ CAMBIADO: De "multiplier" genérico a específico XP
  description: string;
  color: string;
  icon: string;
}

/**
 * Configuración completa de rangos Maya v2.0
 * Basado en ESPECIFICACION-TECNICA-RANGOS-MAYA-v2.0.md
 */
export const MAYA_RANKS: Record<MayaRank, RankConfig> = {
  [MayaRank.AJAW]: {
    id: MayaRank.AJAW,
    name: 'Ajaw',
    level: 1,
    xpMin: 0,
    xpMax: 499,
    mlCoinsBonus: 0,
    xpMultiplier: 1.0,
    description: 'Señor - Inicio del camino del conocimiento',
    color: '#8B4513',
    icon: '🌱',
  },
  [MayaRank.NACOM]: {
    id: MayaRank.NACOM,
    name: 'Nacom',
    level: 2,
    xpMin: 500,
    xpMax: 999,
    mlCoinsBonus: 100,
    xpMultiplier: 1.1,
    description: 'Capitán de Guerra - Guerrero en entrenamiento',
    color: '#CD7F32',
    icon: '⚔️',
  },
  [MayaRank.AH_KIN]: {
    id: MayaRank.AH_KIN,
    name: "Ah K'in",
    level: 3,
    xpMin: 1000,
    xpMax: 1499,
    mlCoinsBonus: 250,
    xpMultiplier: 1.15,
    description: 'Sacerdote del Sol - Guía del conocimiento',
    color: '#C0C0C0',
    icon: '☀️',
  },
  [MayaRank.HALACH_UINIC]: {
    id: MayaRank.HALACH_UINIC,
    name: 'Halach Uinic',
    level: 4,
    xpMin: 1500,
    xpMax: 2249,
    mlCoinsBonus: 500,
    xpMultiplier: 1.2,
    description: 'Hombre Verdadero - Líder de la comunidad',
    color: '#FFD700',
    icon: '👑',
  },
  [MayaRank.KUKULKAN]: {
    id: MayaRank.KUKULKAN,
    name: "K'uk'ulkan",
    level: 5,
    xpMin: 2250,
    xpMax: null,
    mlCoinsBonus: 1000,
    xpMultiplier: 1.25,
    description: 'Serpiente Emplumada - Maestro legendario',
    color: '#9B59B6',
    icon: '🐉',
  },
};

/**
 * Array ordenado de rangos (nivel 1 → 5)
 */
export const MAYA_RANKS_ORDERED: RankConfig[] = [
  MAYA_RANKS[MayaRank.AJAW],
  MAYA_RANKS[MayaRank.NACOM],
  MAYA_RANKS[MayaRank.AH_KIN],
  MAYA_RANKS[MayaRank.HALACH_UINIC],
  MAYA_RANKS[MayaRank.KUKULKAN],
];

/**
 * Obtener configuración de rango por ID
 */
export const getRankById = (rankId: MayaRank): RankConfig => {
  return MAYA_RANKS[rankId];
};

/**
 * Obtener siguiente rango
 */
export const getNextRank = (currentRank: MayaRank): RankConfig | null => {
  const currentIndex = MAYA_RANKS_ORDERED.findIndex((r) => r.id === currentRank);
  if (currentIndex === -1 || currentIndex === MAYA_RANKS_ORDERED.length - 1) {
    return null; // Ya está en el rango máximo
  }
  return MAYA_RANKS_ORDERED[currentIndex + 1];
};

/**
 * Calcular progreso al siguiente rango (0-100%)
 * ✅ v2.0: Ahora basado en XP (antes usaba ML Coins incorrectamente)
 */
export const calculateRankProgress = (currentRank: MayaRank, currentXP: number): number => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 100; // Máximo rango alcanzado

  const currentRankConfig = getRankById(currentRank);
  const xpForCurrentRank = currentRankConfig.xpMin;
  const xpForNextRank = nextRank.xpMin;
  const xpInCurrentRank = currentXP - xpForCurrentRank;
  const xpNeededForNextRank = xpForNextRank - xpForCurrentRank;

  const progress = (xpInCurrentRank / xpNeededForNextRank) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Obtener rango basado en XP total
 * ✅ v2.0: Ahora usa XP como fuente de verdad (antes usaba ML Coins)
 */
export const getRankByXP = (xp: number): RankConfig => {
  for (let i = MAYA_RANKS_ORDERED.length - 1; i >= 0; i--) {
    if (xp >= MAYA_RANKS_ORDERED[i].xpMin) {
      return MAYA_RANKS_ORDERED[i];
    }
  }
  return MAYA_RANKS_ORDERED[0]; // Ajaw por defecto
};

/**
 * @deprecated Use getRankByXP instead. ML Coins are now bonuses, not rank criteria.
 * Mantener por compatibilidad temporal, será removida en v3.0
 */
export const getRankByMLCoins = (mlCoins: number): RankConfig => {
  console.warn('[DEPRECATED] getRankByMLCoins: Use getRankByXP instead. ML Coins are now bonuses.');
  // Conversión aproximada para backward compatibility
  // Asumiendo ratio promedio de 20 ML per 100 XP
  const estimatedXP = Math.floor(mlCoins * 5);
  return getRankByXP(estimatedXP);
};
