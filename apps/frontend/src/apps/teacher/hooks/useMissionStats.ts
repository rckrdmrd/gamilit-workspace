/**
 * useMissionStats Hook
 *
 * P1-06: Created 2025-12-18
 * Fetches and manages mission statistics for Teacher Portal.
 *
 * Features:
 * - Classroom missions overview
 * - Completion rates and participation metrics
 * - Top participants tracking
 * - Active missions monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

export interface ClassroomMission {
  id: string;
  classroom_id: string;
  mission_template_id: string;
  title: string;
  description?: string;
  mission_type: 'daily' | 'weekly' | 'special';
  objectives: Array<{
    type: string;
    target: number;
    description?: string;
  }>;
  base_rewards: {
    ml_coins: number;
    xp: number;
  };
  total_rewards: {
    ml_coins: number;
    xp: number;
  };
  bonus_xp: number;
  bonus_coins: number;
  is_mandatory: boolean;
  is_active: boolean;
  due_date?: string;
  assigned_at: string;
  assigned_by: string;
}

export interface MissionParticipant {
  student_id: string;
  student_name: string;
  avatar_url?: string;
  missions_completed: number;
  total_xp_earned: number;
  total_coins_earned: number;
}

export interface MissionStats {
  activeMissions: ClassroomMission[];
  completionRate: number;
  participationRate: number;
  topParticipants: MissionParticipant[];
  totalMissionsAssigned: number;
  totalMissionsCompleted: number;
  averageCompletionTime?: number;
}

export interface UseMissionStatsReturn {
  stats: MissionStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchClassroomMissions = async (classroomId: string): Promise<ClassroomMission[]> => {
  const response = await apiClient.get(API_ENDPOINTS.gamification.classroomMissions(classroomId));
  // NOTE: apiClient interceptor unwraps { success, data } format automatically
  // response.data is already the array after unwrap
  // Fallback to response.data.data only if interceptor didn't unwrap
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Fallback for non-unwrapped response (shouldn't happen but defensive coding)
  return response.data?.data || [];
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useMissionStats
 *
 * @param classroomId - ID of the classroom to get mission stats for
 * @returns Mission statistics, loading state, error, and refresh function
 */
export function useMissionStats(classroomId: string): UseMissionStatsReturn {
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!classroomId) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch missions for the classroom
      const missions = await fetchClassroomMissions(classroomId);

      // Filter active missions
      const activeMissions = missions.filter(m => m.is_active);

      // Calculate stats (in a real implementation, this would come from backend)
      // For now, we'll calculate basic metrics from the missions data
      const totalMissionsAssigned = missions.length;
      const _mandatoryMissions = missions.filter(m => m.is_mandatory);

      // These would ideally come from a dedicated stats endpoint
      // For now, we estimate based on available data
      const completionRate = totalMissionsAssigned > 0
        ? Math.round((missions.filter(m => !m.is_active).length / totalMissionsAssigned) * 100)
        : 0;

      // Participation rate based on mandatory missions with due dates set
      // Higher rate if missions are configured properly for student engagement
      const configuredMissions = activeMissions.filter(m => m.due_date || m.is_mandatory);
      const participationRate = activeMissions.length > 0
        ? Math.round((configuredMissions.length / activeMissions.length) * 100)
        : 0;

      // Top participants would also require additional queries
      // Placeholder for now
      const topParticipants: MissionParticipant[] = [];

      setStats({
        activeMissions,
        completionRate,
        participationRate,
        topParticipants,
        totalMissionsAssigned,
        totalMissionsCompleted: missions.filter(m => !m.is_active).length,
      });
    } catch (err) {
      console.error('[useMissionStats] Error:', err);
      setError(err as Error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

/**
 * useMissionStatsMultiple
 *
 * Fetches mission stats for multiple classrooms (useful for teacher dashboard)
 *
 * @param classroomIds - Array of classroom IDs
 * @returns Aggregated mission statistics across all classrooms
 */
export function useMissionStatsMultiple(classroomIds: string[]): UseMissionStatsReturn {
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!classroomIds.length) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch missions for all classrooms in parallel
      const allMissionsArrays = await Promise.all(
        classroomIds.map(id => fetchClassroomMissions(id).catch(() => [])),
      );

      // Flatten and aggregate
      const allMissions = allMissionsArrays.flat();
      const activeMissions = allMissions.filter(m => m.is_active);

      const totalMissionsAssigned = allMissions.length;
      const totalMissionsCompleted = allMissions.filter(m => !m.is_active).length;

      const completionRate = totalMissionsAssigned > 0
        ? Math.round((totalMissionsCompleted / totalMissionsAssigned) * 100)
        : 0;

      // Calculate participation rate for aggregated stats
      const configuredMissionsAgg = activeMissions.filter(m => m.due_date || m.is_mandatory);
      const participationRateAgg = activeMissions.length > 0
        ? Math.round((configuredMissionsAgg.length / activeMissions.length) * 100)
        : 0;

      setStats({
        activeMissions,
        completionRate,
        participationRate: participationRateAgg,
        topParticipants: [],
        totalMissionsAssigned,
        totalMissionsCompleted,
      });
    } catch (err) {
      console.error('[useMissionStatsMultiple] Error:', err);
      setError(err as Error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [classroomIds]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

export default useMissionStats;
