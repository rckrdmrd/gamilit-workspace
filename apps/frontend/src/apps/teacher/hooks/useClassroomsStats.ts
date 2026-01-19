/**
 * useClassroomsStats Hook
 *
 * Fetches statistics for multiple classrooms and calculates aggregate metrics.
 * Used in TeacherProgressPage to display overall statistics across all classes.
 *
 * TASK-2026-01-19-004: Refactorizado para usar nomenclatura unificada (camelCase)
 *
 * @module apps/teacher/hooks/useClassroomsStats
 */

import { useState, useEffect, useMemo } from 'react';
import { classroomsApi, type ClassroomStatsResponse } from '@services/api/teacher';
import type { Classroom } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Individual classroom statistics (camelCase)
 * TASK-2026-01-19-004: Unificado con ClassroomStatsResponse del API layer
 */
export interface ClassroomStats {
  classroomId: string;
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  completionRate: number;
  engagementRate: number;
  totalExercises: number;
  completedExercises: number;
}

/**
 * Aggregate statistics across all classrooms
 */
export interface AggregateStats {
  totalStudents: number;
  averageScore: number;
  activeClasses: number;
  totalActiveStudents: number;
  overallCompletionRate: number;
  overallEngagementRate: number;
}

/**
 * Return type for useClassroomsStats hook
 */
export interface UseClassroomsStatsReturn {
  stats: Map<string, ClassroomStats>;
  aggregateStats: AggregateStats;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch and manage statistics for multiple classrooms
 *
 * Fetches individual statistics for each classroom and calculates aggregate metrics.
 * The average score is weighted by the number of students in each classroom.
 *
 * @param classrooms - Array of classrooms to fetch stats for
 * @returns {UseClassroomsStatsReturn} Statistics data, loading state, error, and refresh method
 *
 * @example
 * ```tsx
 * const { classrooms } = useClassrooms();
 * const { aggregateStats, loading, error } = useClassroomsStats(classrooms);
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <p>Total Students: {aggregateStats.totalStudents}</p>
 *     <p>Average Score: {aggregateStats.averageScore.toFixed(1)}%</p>
 *     <p>Active Classes: {aggregateStats.activeClasses}</p>
 *   </div>
 * );
 * ```
 */
export function useClassroomsStats(classrooms: Classroom[]): UseClassroomsStatsReturn {
  // ============================================================================
  // STATE
  // ============================================================================

  const [stats, setStats] = useState<Map<string, ClassroomStats>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================================
  // FETCH FUNCTION
  // ============================================================================

  /**
   * Fetch statistics for all classrooms
   * Fetches stats in parallel for optimal performance
   */
  const fetchStats = async () => {
    if (!classrooms || classrooms.length === 0) {
      setStats(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch stats for all classrooms in parallel
      // TASK-2026-01-19-004: API layer now handles snake_case -> camelCase transformation
      const statsPromises = classrooms.map((classroom) =>
        classroomsApi
          .getClassroomStats(classroom.id)
          .then((data: ClassroomStatsResponse) => ({
            id: classroom.id,
            stats: {
              classroomId: data.classroomId,
              totalStudents: data.totalStudents,
              activeStudents: data.activeStudents,
              averageScore: data.averageScore,
              completionRate: data.completionRate,
              engagementRate: data.engagementRate,
              totalExercises: data.totalExercises ?? 0,
              completedExercises: data.completedExercises ?? 0,
            },
          }))
          .catch((err) => {
            console.error(`[useClassroomsStats] Error fetching stats for ${classroom.id}:`, err);
            return null;
          }),
      );

      const results = await Promise.all(statsPromises);

      // Build stats map, filtering out failed requests
      const newStats = new Map<string, ClassroomStats>();
      results.forEach((result) => {
        if (result) {
          newStats.set(result.id, result.stats);
        }
      });

      setStats(newStats);
    } catch (err) {
      console.error('[useClassroomsStats] Error fetching classroom stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch stats when classrooms change
   */
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classrooms]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Calculate aggregate statistics from individual classroom stats
   * Average score is weighted by number of students in each classroom
   */
  const aggregateStats = useMemo<AggregateStats>(() => {
    if (stats.size === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        activeClasses: 0,
        totalActiveStudents: 0,
        overallCompletionRate: 0,
        overallEngagementRate: 0,
      };
    }

    let totalStudents = 0;
    let totalActiveStudents = 0;
    let weightedScoreSum = 0;
    let weightedCompletionSum = 0;
    let weightedEngagementSum = 0;
    let activeClassesCount = 0;

    stats.forEach((classroomStats) => {
      const studentCount = classroomStats.totalStudents;
      totalStudents += studentCount;
      totalActiveStudents += classroomStats.activeStudents;

      // Weight average score by number of students
      weightedScoreSum += classroomStats.averageScore * studentCount;

      // Weight completion and engagement rates
      weightedCompletionSum += classroomStats.completionRate * studentCount;
      weightedEngagementSum += classroomStats.engagementRate * studentCount;

      // Count as active if it has at least one student
      if (studentCount > 0) {
        activeClassesCount++;
      }
    });

    // Calculate weighted averages
    const averageScore = totalStudents > 0 ? weightedScoreSum / totalStudents : 0;
    const overallCompletionRate = totalStudents > 0 ? weightedCompletionSum / totalStudents : 0;
    const overallEngagementRate = totalStudents > 0 ? weightedEngagementSum / totalStudents : 0;

    return {
      totalStudents,
      averageScore,
      activeClasses: activeClassesCount,
      totalActiveStudents,
      overallCompletionRate,
      overallEngagementRate,
    };
  }, [stats]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    stats,
    aggregateStats,
    loading,
    error,
    refresh: fetchStats,
  };
}
