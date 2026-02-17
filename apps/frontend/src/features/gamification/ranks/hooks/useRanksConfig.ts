/**
 * useRanksConfig Hook
 *
 * Hook para obtener la configuracion de rangos del backend.
 * P0-004: Reemplaza la dependencia de mockData con datos del API.
 *
 * Uso:
 * ```typescript
 * const { ranksConfig, isLoading, error, getRankById, getNextRank, getPreviousRank } = useRanksConfig();
 * ```
 *
 * Creado: 2025-12-14
 * Ver: orchestration/reportes/TECH-LEADER-VALIDATION-REPORT-2025-12-14.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRanksConfig, type RankMetadata } from '../api/ranksAPI';
import type { RankDefinition } from '../types/ranksTypes';
import { MayaRank } from '../types/ranksTypes';

/**
 * Estado del hook
 */
interface UseRanksConfigReturn {
  // Datos
  ranksConfig: RankMetadata[];
  ranksMap: Record<string, RankMetadata>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // Funciones de utilidad (reemplazan mockData)
  getRankById: (rankId: string) => RankDefinition;
  getNextRank: (currentRankId: string) => RankDefinition | null;
  getPreviousRank: (currentRankId: string) => RankDefinition | null;
  getRankThresholds: (rankId: string) => { min: number; max: number };

  // Recarga
  refresh: () => Promise<void>;
}

/**
 * Cache global para evitar multiples llamadas al API
 */
let globalRanksConfig: RankMetadata[] | null = null;
let globalRanksPromise: Promise<RankMetadata[]> | null = null;

/**
 * Rank definition por defecto (fallback)
 */
const DEFAULT_RANK: RankDefinition = {
  id: MayaRank.AJAW,
  name: MayaRank.AJAW,
  nameSpanish: 'Señor',
  description: 'Inicio del camino del conocimiento',
  mlCoinsRequired: 0,
  multiplier: 1.0,
  colorFrom: 'from-amber-400',
  colorTo: 'to-yellow-500',
  gradient: 'from-amber-400 to-yellow-500',
  icon: 'ajaw',
  benefits: [],
  order: 0,
};

/**
 * Convierte RankMetadata del API a RankDefinition del frontend
 */
function metadataToDefinition(metadata: RankMetadata, _index: number): RankDefinition {
  const colorFromMap: Record<string, string> = {
    'Ajaw': 'from-amber-400',
    'Nacom': 'from-green-400',
    "Ah K'in": 'from-blue-400',
    'Halach Uinic': 'from-purple-400',
    "K'uk'ulkan": 'from-red-400',
  };

  const colorToMap: Record<string, string> = {
    'Ajaw': 'to-yellow-500',
    'Nacom': 'to-emerald-500',
    "Ah K'in": 'to-cyan-500',
    'Halach Uinic': 'to-violet-500',
    "K'uk'ulkan": 'to-orange-500',
  };

  const gradientMap: Record<string, string> = {
    'Ajaw': 'from-amber-400 to-yellow-500',
    'Nacom': 'from-green-400 to-emerald-500',
    "Ah K'in": 'from-blue-400 to-cyan-500',
    'Halach Uinic': 'from-purple-400 to-violet-500',
    "K'uk'ulkan": 'from-red-400 to-orange-500',
  };

  // Mapeo de iconos por rango
  const iconMap: Record<string, string> = {
    'Ajaw': 'ajaw',
    'Nacom': 'nacom',
    "Ah K'in": 'ahkin',
    'Halach Uinic': 'halachuinic',
    "K'uk'ulkan": 'kukulkan',
  };

  // Mapeo de nombres en español
  const spanishNameMap: Record<string, string> = {
    'Ajaw': 'Señor',
    'Nacom': 'Capitán de Guerra',
    "Ah K'in": 'Sacerdote del Sol',
    'Halach Uinic': 'Hombre Verdadero',
    "K'uk'ulkan": 'Serpiente Emplumada',
  };

  // Beneficios por rango
  const benefitsMap: Record<string, string[]> = {
    'Ajaw': ['Acceso a ejercicios básicos', 'Tutorial interactivo'],
    'Nacom': ['Ejercicios intermedios', 'Pistas nivel 1', 'Multiplicador 1.1x'],
    "Ah K'in": ['Ejercicios avanzados', 'Pistas nivel 2', 'Multiplicador 1.25x', 'Misiones especiales'],
    'Halach Uinic': ['Ejercicios expertos', 'Pistas nivel 3', 'Multiplicador 1.5x', 'Acceso a torneos'],
    "K'uk'ulkan": ['Todos los ejercicios', 'Pistas ilimitadas', 'Multiplicador 2x', 'Sistema de prestigio', 'Badge exclusivo'],
  };

  // Multiplicador por rango
  const multiplierMap: Record<string, number> = {
    'Ajaw': 1.0,
    'Nacom': 1.1,
    "Ah K'in": 1.25,
    'Halach Uinic': 1.5,
    "K'uk'ulkan": 2.0,
  };

  return {
    id: metadata.rank as MayaRank,
    name: metadata.name,
    nameSpanish: spanishNameMap[metadata.rank] || metadata.description,
    description: metadata.description,
    mlCoinsRequired: metadata.ml_coins_bonus,
    multiplier: multiplierMap[metadata.rank] || 1.0,
    colorFrom: colorFromMap[metadata.rank] || 'from-gray-400',
    colorTo: colorToMap[metadata.rank] || 'to-gray-500',
    gradient: gradientMap[metadata.rank] || 'from-gray-400 to-gray-500',
    icon: iconMap[metadata.rank] || 'default',
    benefits: benefitsMap[metadata.rank] || [],
    order: metadata.order,
  };
}

/**
 * Hook para obtener y cachear la configuracion de rangos
 */
export function useRanksConfig(): UseRanksConfigReturn {
  const [ranksConfig, setRanksConfig] = useState<RankMetadata[]>(globalRanksConfig || []);
  const [isLoading, setIsLoading] = useState(!globalRanksConfig);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga la configuracion de rangos
   */
  const loadConfig = useCallback(async () => {
    // Si ya tenemos datos en cache global, usarlos
    if (globalRanksConfig) {
      setRanksConfig(globalRanksConfig);
      setIsLoading(false);
      return;
    }

    // Si ya hay una peticion en curso, esperarla
    if (globalRanksPromise) {
      try {
        const data = await globalRanksPromise;
        setRanksConfig(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading ranks config');
        setIsLoading(false);
      }
      return;
    }

    // Iniciar nueva peticion
    setIsLoading(true);
    setError(null);

    globalRanksPromise = getRanksConfig();

    try {
      const data = await globalRanksPromise;
      globalRanksConfig = data;
      setRanksConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading ranks config');
      // Usar fallback en caso de error
      const fallbackConfig: RankMetadata[] = [
        { rank: 'Ajaw', name: 'Ajaw', description: 'Señor', xp_min: 0, xp_max: 499, ml_coins_bonus: 0, order: 1 },
        { rank: 'Nacom', name: 'Nacom', description: 'Capitán de Guerra', xp_min: 500, xp_max: 999, ml_coins_bonus: 100, order: 2 },
        { rank: "Ah K'in", name: "Ah K'in", description: 'Sacerdote del Sol', xp_min: 1000, xp_max: 1499, ml_coins_bonus: 250, order: 3 },
        { rank: 'Halach Uinic', name: 'Halach Uinic', description: 'Hombre Verdadero', xp_min: 1500, xp_max: 1899, ml_coins_bonus: 500, order: 4 },
        { rank: "K'uk'ulkan", name: "K'uk'ulkan", description: 'Serpiente Emplumada', xp_min: 1900, xp_max: -1, ml_coins_bonus: 1000, order: 5 },
      ];
      globalRanksConfig = fallbackConfig;
      setRanksConfig(fallbackConfig);
    } finally {
      setIsLoading(false);
      globalRanksPromise = null;
    }
  }, []);

  // Cargar configuracion al montar
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * Mapa de rangos por ID para acceso rapido
   */
  const ranksMap = useMemo(() => {
    const map: Record<string, RankMetadata> = {};
    ranksConfig.forEach((rank) => {
      map[rank.rank] = rank;
    });
    return map;
  }, [ranksConfig]);

  /**
   * Obtiene un rango por ID
   */
  const getRankById = useCallback(
    (rankId: string): RankDefinition => {
      const metadata = ranksMap[rankId];
      if (!metadata) {
        console.warn(`Rank not found: ${rankId}, using default`);
        return DEFAULT_RANK;
      }
      const index = ranksConfig.findIndex((r) => r.rank === rankId);
      return metadataToDefinition(metadata, index);
    },
    [ranksMap, ranksConfig]
  );

  /**
   * Obtiene el siguiente rango
   */
  const getNextRank = useCallback(
    (currentRankId: string): RankDefinition | null => {
      const currentIndex = ranksConfig.findIndex((r) => r.rank === currentRankId);
      if (currentIndex === -1 || currentIndex >= ranksConfig.length - 1) {
        return null;
      }
      const nextMetadata = ranksConfig[currentIndex + 1];
      return metadataToDefinition(nextMetadata, currentIndex + 1);
    },
    [ranksConfig]
  );

  /**
   * Obtiene el rango anterior
   */
  const getPreviousRank = useCallback(
    (currentRankId: string): RankDefinition | null => {
      const currentIndex = ranksConfig.findIndex((r) => r.rank === currentRankId);
      if (currentIndex <= 0) {
        return null;
      }
      const prevMetadata = ranksConfig[currentIndex - 1];
      return metadataToDefinition(prevMetadata, currentIndex - 1);
    },
    [ranksConfig]
  );

  /**
   * Obtiene los umbrales de XP para un rango
   */
  const getRankThresholds = useCallback(
    (rankId: string): { min: number; max: number } => {
      const metadata = ranksMap[rankId];
      if (!metadata) {
        return { min: 0, max: 500 };
      }
      return {
        min: metadata.xp_min,
        max: metadata.xp_max === -1 ? Infinity : metadata.xp_max,
      };
    },
    [ranksMap]
  );

  /**
   * Recarga la configuracion desde el API
   */
  const refresh = useCallback(async () => {
    globalRanksConfig = null;
    globalRanksPromise = null;
    await loadConfig();
  }, [loadConfig]);

  return {
    ranksConfig,
    ranksMap,
    isLoaded: !isLoading && ranksConfig.length > 0,
    isLoading,
    error,
    getRankById,
    getNextRank,
    getPreviousRank,
    getRankThresholds,
    refresh,
  };
}

/**
 * Export por defecto
 */
export default useRanksConfig;
