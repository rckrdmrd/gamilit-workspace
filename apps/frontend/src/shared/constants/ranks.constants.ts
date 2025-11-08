/**
 * Maya Ranks Constants - SSOT (Single Source of Truth)
 *
 * SINCRONIZADO CON:
 * - Backend: /apps/backend/src/modules/gamification/entities/user-rank.entity.ts
 * - Database: /apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql
 *
 * ISSUE: #3 (P0) - Sincronización Rangos Maya
 * FECHA: 2025-11-04
 * SPRINT: Sprint 0 - Día 1
 */

export enum MayaRank {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = "Ah K'in",
  HALACH_UINIC = 'Halach Uinic',
  KUKKULKAN = "K'uk'ulkan"
}

export interface RankConfig {
  id: MayaRank;
  name: string;
  level: number;
  mlCoinsRequired: number;
  multiplier: number;
  description: string;
  color: string;
  icon: string;
}

/**
 * Configuración completa de rangos Maya
 * Basado en US-GAM-001 (Sistema de Rangos Maya)
 */
export const MAYA_RANKS: Record<MayaRank, RankConfig> = {
  [MayaRank.AJAW]: {
    id: MayaRank.AJAW,
    name: 'Ajaw',
    level: 1,
    mlCoinsRequired: 0,
    multiplier: 1.0,
    description: 'Detective Novato - Inicio del camino maya',
    color: '#8B4513',
    icon: '🌱'
  },
  [MayaRank.NACOM]: {
    id: MayaRank.NACOM,
    name: 'Nacom',
    level: 2,
    mlCoinsRequired: 200,
    multiplier: 1.25,
    description: 'Guerrero - Primeros pasos consolidados',
    color: '#CD7F32',
    icon: '⚔️'
  },
  [MayaRank.AH_KIN]: {
    id: MayaRank.AH_KIN,
    name: "Ah K'in",
    level: 3,
    mlCoinsRequired: 500,
    multiplier: 1.5,
    description: 'Sacerdote del Sol - Iluminando el conocimiento',
    color: '#C0C0C0',
    icon: '☀️'
  },
  [MayaRank.HALACH_UINIC]: {
    id: MayaRank.HALACH_UINIC,
    name: 'Halach Uinic',
    level: 4,
    mlCoinsRequired: 1000,
    multiplier: 1.75,
    description: 'Gran Señor - Maestría avanzada',
    color: '#FFD700',
    icon: '👑'
  },
  [MayaRank.KUKKULKAN]: {
    id: MayaRank.KUKKULKAN,
    name: "K'uk'ulkan",
    level: 5,
    mlCoinsRequired: 2000,
    multiplier: 2.0,
    description: 'Serpiente Emplumada - Maestro supremo',
    color: '#9B59B6',
    icon: '🐉'
  }
};

/**
 * Array ordenado de rangos (nivel 1 → 5)
 */
export const MAYA_RANKS_ORDERED: RankConfig[] = [
  MAYA_RANKS[MayaRank.AJAW],
  MAYA_RANKS[MayaRank.NACOM],
  MAYA_RANKS[MayaRank.AH_KIN],
  MAYA_RANKS[MayaRank.HALACH_UINIC],
  MAYA_RANKS[MayaRank.KUKKULKAN]
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
  const currentIndex = MAYA_RANKS_ORDERED.findIndex(r => r.id === currentRank);
  if (currentIndex === -1 || currentIndex === MAYA_RANKS_ORDERED.length - 1) {
    return null; // Ya está en el rango máximo
  }
  return MAYA_RANKS_ORDERED[currentIndex + 1];
};

/**
 * Calcular progreso al siguiente rango (0-100%)
 */
export const calculateRankProgress = (
  currentRank: MayaRank,
  currentMLCoins: number
): number => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 100; // Máximo rango alcanzado

  const currentRankConfig = getRankById(currentRank);
  const coinsForCurrentRank = currentRankConfig.mlCoinsRequired;
  const coinsForNextRank = nextRank.mlCoinsRequired;
  const coinsInCurrentRank = currentMLCoins - coinsForCurrentRank;
  const coinsNeededForNextRank = coinsForNextRank - coinsForCurrentRank;

  const progress = (coinsInCurrentRank / coinsNeededForNextRank) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Obtener rango basado en ML Coins totales
 */
export const getRankByMLCoins = (mlCoins: number): RankConfig => {
  for (let i = MAYA_RANKS_ORDERED.length - 1; i >= 0; i--) {
    if (mlCoins >= MAYA_RANKS_ORDERED[i].mlCoinsRequired) {
      return MAYA_RANKS_ORDERED[i];
    }
  }
  return MAYA_RANKS_ORDERED[0]; // Ajaw por defecto
};
