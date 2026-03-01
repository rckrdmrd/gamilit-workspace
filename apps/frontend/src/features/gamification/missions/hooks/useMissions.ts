/**
 * useMissions Hook
 *
 * Comprehensive hook for managing missions state and API interactions
 *
 * Features:
 * - Fetch missions by type (daily, weekly, special)
 * - Track active missions
 * - Start and claim missions
 * - Real-time progress updates
 * - Auto-refresh every 60 seconds
 * - Local storage for tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import type {
  Mission,
  MissionStats,
  MissionType,
  MissionActionResult,
  MissionRewardsSummary,
} from '../types/missionsTypes';
import { transformMissions, type MissionFromAPI } from '../utils/missionTransformer';

const API_BASE = '/gamification/missions';
const REFRESH_INTERVAL = 60000; // 60 seconds
const MAX_TRACKED_MISSIONS = 3;

interface UseMissionsResult {
  // Data
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  allMissions: Mission[];
  activeMissions: Mission[]; // Tracked missions

  // Current tab (only 'daily' | 'weekly' — 'special' tab removed from UI)
  currentTab: 'daily' | 'weekly';
  setCurrentTab: (tab: 'daily' | 'weekly') => void;

  // Actions
  startMission: (missionId: string) => Promise<MissionActionResult>;
  claimReward: (missionId: string) => Promise<MissionActionResult>;
  trackMission: (missionId: string) => void;
  untrackMission: (missionId: string) => void;
  isTracked: (missionId: string) => boolean;

  // Stats
  stats: MissionStats;
  rewardsSummary: MissionRewardsSummary;

  // State
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Main useMissions hook
 */
export function useMissions(_userId?: string): UseMissionsResult {
  const queryClient = useQueryClient();
  // State
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats>({
    todayCompleted: 0,
    todayTotal: 0,
    weekCompleted: 0,
    weekTotal: 0,
    totalCompleted: 0,
    totalXPEarned: 0,
    totalMLCoinsEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [currentTab, setCurrentTab] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracked missions (from localStorage)
  const [trackedMissionIds, setTrackedMissionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tracked_missions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save tracked missions to localStorage
  useEffect(() => {
    localStorage.setItem('tracked_missions', JSON.stringify(trackedMissionIds));
  }, [trackedMissionIds]);

  /**
   * Fetch missions from API
   */
  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from real API
      const [dailyRes, weeklyRes, statsRes] = await Promise.all([
        fetchMissionsByType('daily'),
        fetchMissionsByType('weekly'),
        fetchMissionStats(),
      ]);

      setDailyMissions(dailyRes);
      setWeeklyMissions(weeklyRes);
      setStats(statsRes);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError('No se pudieron cargar las misiones. Intenta de nuevo.');

      // Set empty data on error
      setDailyMissions([]);
      setWeeklyMissions([]);
      setStats({
        todayCompleted: 0,
        todayTotal: 0,
        weekCompleted: 0,
        weekTotal: 0,
        totalCompleted: 0,
        totalXPEarned: 0,
        totalMLCoinsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    // ✅ Verificar autenticación ANTES de llamar API
    const userId = useAuthStore.getState().user?.id;

    if (!userId) {
      // Establecer estados vacíos
      setDailyMissions([]);
      setWeeklyMissions([]);
      setStats({
        todayCompleted: 0,
        todayTotal: 0,
        weekCompleted: 0,
        weekTotal: 0,
        totalCompleted: 0,
        totalXPEarned: 0,
        totalMLCoinsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      setLoading(false);
      return;
    }

    // ✅ Solo llamar API si hay usuario autenticado
    fetchMissions();
  }, [fetchMissions]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // ✅ Verificar autenticación antes de auto-refresh
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        fetchMissions();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchMissions]);

  // Sincronización en tiempo real con eventos WebSocket de gamificación.
  useEffect(() => {
    const refreshFromRealtime = () => {
      void fetchMissions();
    };
    window.addEventListener('gamilit:mission:progress', refreshFromRealtime);
    window.addEventListener('gamilit:mission:completed', refreshFromRealtime);
    window.addEventListener('gamilit:balance:updated', refreshFromRealtime);
    return () => {
      window.removeEventListener('gamilit:mission:progress', refreshFromRealtime);
      window.removeEventListener('gamilit:mission:completed', refreshFromRealtime);
      window.removeEventListener('gamilit:balance:updated', refreshFromRealtime);
    };
  }, [fetchMissions]);

  /**
   * Helper: Update mission in state
   */
  const updateMissionInState = useCallback((updatedMission: Mission) => {
    const updateFn = (missions: Mission[]) =>
      missions.map((m) => (m.id === updatedMission.id ? updatedMission : m));

    if (updatedMission.type === 'daily') {
      setDailyMissions(updateFn);
    } else if (updatedMission.type === 'weekly') {
      setWeeklyMissions(updateFn);
    }
    // 'special' type: silent no-op — UI tab removed, backend WebSocket events still accepted
  }, []);

  /**
   * Track a mission
   */
  const trackMission = useCallback((missionId: string) => {
    setTrackedMissionIds((prev) => {
      if (prev.includes(missionId)) return prev;

      // Limit to MAX_TRACKED_MISSIONS
      if (prev.length >= MAX_TRACKED_MISSIONS) {
        return [...prev.slice(1), missionId];
      }

      return [...prev, missionId];
    });
  }, []);

  /**
   * Untrack a mission
   */
  const untrackMission = useCallback((missionId: string) => {
    setTrackedMissionIds((prev) => prev.filter((id) => id !== missionId));
  }, []);

  /**
   * Check if mission is tracked
   */
  const isTracked = useCallback(
    (missionId: string): boolean => {
      return trackedMissionIds.includes(missionId);
    },
    [trackedMissionIds],
  );

  /**
   * Start a mission
   *
   * NOTA: El interceptor de apiClient hace unwrap automático.
   * Después del unwrap, response.data es directamente el objeto Mission.
   */
  const startMission = useCallback(
    async (missionId: string): Promise<MissionActionResult> => {
      try {
        const response = await apiClient.post(`${API_BASE}/${missionId}/start`);
        const data = response.data;

        // Después del unwrap, data es directamente el objeto Mission
        // El backend retorna Mission, envuelto por TransformResponseInterceptor,
        // y luego desenvuelto por el interceptor del frontend
        const updatedMission = data;

        if (updatedMission && updatedMission.id) {
          // Update state with transformed mission
          const transformedMission = transformMissions([updatedMission as MissionFromAPI])[0];
          updateMissionInState(transformedMission);

          // Refresh missions to sync state
          await fetchMissions();

          return {
            success: true,
            message: 'Misión iniciada con éxito',
            mission: transformedMission,
          };
        } else {
          // Fallback: si por alguna razón la estructura es diferente
          console.warn('[startMission] Unexpected response format:', data);
          return {
            success: false,
            message: 'Formato de respuesta inesperado',
          };
        }
      } catch (err) {
        console.error('Error starting mission:', err);
        return {
          success: false,
          message: 'Error al iniciar la misión',
        };
      }
    },
    [fetchMissions, updateMissionInState],
  );

  /**
   * Claim mission reward
   *
   * NOTA: El interceptor de apiClient hace unwrap automático.
   * Después del unwrap, response.data es { mission, rewards, rewards_granted }.
   */
  const claimReward = useCallback(
    async (missionId: string): Promise<MissionActionResult> => {
      try {
        const response = await apiClient.post(`${API_BASE}/${missionId}/claim`);
        const data = response.data;

        // Después del unwrap, data es { mission, rewards, rewards_granted }
        // El backend retorna este objeto, envuelto por TransformResponseInterceptor,
        // y luego desenvuelto por el interceptor del frontend
        const { mission: updatedMission, rewards, rewards_granted } = data;

        if (updatedMission && updatedMission.id) {
          // Transform mission to frontend format
          const transformedMission = transformMissions([updatedMission as MissionFromAPI])[0];
          updateMissionInState(transformedMission);

          // Update stats with rewards (usando snake_case del backend)
          const xpEarned = rewards_granted?.xp_awarded || rewards?.xp || 0;
          const coinsEarned = rewards_granted?.ml_coins_awarded || rewards?.ml_coins || 0;

          setStats((prev) => ({
            ...prev,
            totalXPEarned: prev.totalXPEarned + xpEarned,
            totalMLCoinsEarned: prev.totalMLCoinsEarned + coinsEarned,
          }));

          // Remove from tracked missions
          untrackMission(missionId);

          // Refresh missions
          await fetchMissions();
          queryClient.invalidateQueries({ queryKey: ['shop'] });
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['balance'] });
          queryClient.invalidateQueries({ queryKey: ['userStats'] });

          return {
            success: true,
            message: 'Recompensa reclamada',
            mission: transformedMission,
            rewards: {
              xp: xpEarned,
              mlCoins: coinsEarned,
            },
          };
        } else {
          console.warn('[claimReward] Unexpected response format:', data);
          return {
            success: false,
            message: 'Formato de respuesta inesperado',
          };
        }
      } catch (err) {
        console.error('Error claiming reward:', err);
        return {
          success: false,
          message: 'Error al reclamar la recompensa',
        };
      }
    },
    [fetchMissions, untrackMission, updateMissionInState, queryClient],
  );

  // Computed: All missions
  const allMissions = useMemo(
    () => [...dailyMissions, ...weeklyMissions],
    [dailyMissions, weeklyMissions],
  );

  // Computed: Active (tracked) missions
  const activeMissions = useMemo(
    () => allMissions.filter((m) => trackedMissionIds.includes(m.id)),
    [allMissions, trackedMissionIds],
  );

  // Computed: Rewards summary
  const rewardsSummary = useMemo((): MissionRewardsSummary => {
    const currentMissions = currentTab === 'daily' ? dailyMissions : weeklyMissions;

    const potential = currentMissions
      .filter((m) => m.status !== 'claimed')
      .reduce(
        (acc, m) => ({
          xp: acc.xp + m.xpReward,
          mlCoins: acc.mlCoins + m.mlCoinsReward,
        }),
        { xp: 0, mlCoins: 0 },
      );

    const earned = currentMissions
      .filter((m) => m.status === 'claimed')
      .reduce(
        (acc, m) => ({
          xp: acc.xp + m.xpReward,
          mlCoins: acc.mlCoins + m.mlCoinsReward,
        }),
        { xp: 0, mlCoins: 0 },
      );

    const allDailyComplete = dailyMissions.every((m) => m.status === 'claimed');
    const allWeeklyComplete = weeklyMissions.every((m) => m.status === 'claimed');

    // REC-006: Bonus removed — backend does not implement daily/weekly completion bonus.
    // Previously showed fictional +500/+2000 XP and +100/+500 ML Coins that were never granted.
    // Keeping allDailyComplete/allWeeklyComplete flags for UX indicators only.

    return {
      potential,
      earned,
      bonus: {
        allDailyComplete,
        allWeeklyComplete,
        bonusXP: 0,
        bonusMLCoins: 0,
      },
    };
  }, [dailyMissions, weeklyMissions, currentTab]);

  return {
    // Data
    dailyMissions,
    weeklyMissions,
    allMissions,
    activeMissions,

    // Current tab
    currentTab,
    setCurrentTab,

    // Actions
    startMission,
    claimReward,
    trackMission,
    untrackMission,
    isTracked,

    // Stats
    stats,
    rewardsSummary,

    // State
    loading,
    error,
    refresh: fetchMissions,
  };
}

/**
 * Helper: Fetch missions by type (real API implementation)
 *
 * NOTA: El interceptor de apiClient (líneas 99-108) hace unwrap automático
 * cuando detecta { success, data }. Por lo tanto, response.data ya contiene
 * directamente el array de misiones (no el wrapper { success, data }).
 *
 * Flujo:
 * 1. Backend controller retorna: Mission[]
 * 2. Backend interceptor envuelve: { success: true, data: Mission[], ... }
 * 3. Frontend interceptor desenvuelve: response.data = Mission[]
 */
async function fetchMissionsByType(type: MissionType): Promise<Mission[]> {
  try {
    const response = await apiClient.get(`${API_BASE}/${type}`);

    // Después del unwrap del interceptor, response.data es directamente el array
    if (Array.isArray(response.data)) {
      return transformMissions(response.data as MissionFromAPI[]);
    }

    // Fallback: si por alguna razón el interceptor no hizo unwrap
    // (por ejemplo, si el backend no usó el TransformResponseInterceptor)
    if (response.data?.success && response.data?.data) {
      const data = response.data.data;
      // Podría ser un array directo o un objeto con missions
      if (Array.isArray(data)) {
        return transformMissions(data as MissionFromAPI[]);
      }
      if (data?.missions && Array.isArray(data.missions)) {
        return transformMissions(data.missions as MissionFromAPI[]);
      }
    }

    console.warn(`[fetchMissionsByType] Unexpected response format for ${type}:`, response.data);
    return [];
  } catch (error) {
    console.error(`Error fetching ${type} missions:`, error);
    throw error;
  }
}

/**
 * Helper: Fetch mission stats (real API implementation)
 *
 * NOTA: Usa /stats/me en lugar de /stats/:userId para evitar el error 403
 * causado por desincronizacion entre authStore.user.id y JWT.user.id.
 * El backend extrae el userId directamente del token JWT.
 *
 * El interceptor de apiClient hace unwrap automático, así que response.data
 * ya contiene directamente el objeto de stats (no el wrapper { success, data }).
 */
async function fetchMissionStats(): Promise<MissionStats> {
  try {
    const response = await apiClient.get(`${API_BASE}/stats/me`);

    // Después del unwrap del interceptor, response.data es el objeto de stats
    // Validar que tiene la estructura esperada
    if (response.data && typeof response.data === 'object' && !response.data.success) {
      // Es el objeto de stats directamente (después del unwrap)
      return response.data as MissionStats;
    }

    // Fallback: si el interceptor no hizo unwrap
    if (response.data?.success && response.data?.data) {
      return response.data.data as MissionStats;
    }

    console.warn('[fetchMissionStats] Unexpected response format:', response.data);
    return response.data as MissionStats;
  } catch (error) {
    console.error('Error fetching mission stats:', error);
    throw error;
  }
}
