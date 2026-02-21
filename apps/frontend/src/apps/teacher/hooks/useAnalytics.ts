/**
 * useAnalytics Hook - Fetch and manage classroom analytics and engagement metrics
 *
 * Migrated to React Query (@tanstack/react-query v5) for automatic caching,
 * deduplication, and background refetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { analyticsApi } from '@services/api/teacher';
import { reportsApi } from '@services/api/teacher/reportsApi';
import type { GenerateReportDto } from '@services/api/teacher/reportsApi';
import type { ClassroomAnalytics, EngagementMetrics } from '@apps/teacher/types';
import type {
  GetAnalyticsQueryDto,
  GetEngagementMetricsDto,
  Report,
} from '@services/api/teacher/analyticsApi';

// ---------------------------------------------------------------------------
// Query Key Factories
// ---------------------------------------------------------------------------

const analyticsKeys = {
  all: ['analytics'] as const,
  classroom: (query?: GetAnalyticsQueryDto) => [...analyticsKeys.all, 'classroom', query] as const,
  engagement: (query?: GetEngagementMetricsDto) => [...analyticsKeys.all, 'engagement', query] as const,
  studentInsights: (studentId: string) => [...analyticsKeys.all, 'student-insights', studentId] as const,
};

// ---------------------------------------------------------------------------
// Interfaces (unchanged — backward compatible)
// ---------------------------------------------------------------------------

/**
 * Student Insights Interface
 * Represents detailed analytics and predictions for an individual student
 */
export interface StudentInsights {
  overall_score: number;
  modules_completed: number;
  modules_total: number;
  comparison_to_class: {
    score_percentile: number;
  };
  risk_level: 'low' | 'medium' | 'high';
  strengths: string[];
  weaknesses: string[];
  predictions: {
    completion_probability: number;
    dropout_risk: number;
  };
  recommendations: string[];
}

export interface UseStudentInsightsReturn {
  insights: StudentInsights | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseAnalyticsReturn {
  analytics: ClassroomAnalytics | null;
  engagement: EngagementMetrics | null;
  loading: boolean;
  error: Error | null;
  generateReport: (config: GenerateReportDto) => Promise<Report>;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// useAnalytics
// ---------------------------------------------------------------------------

export function useAnalytics(
  analyticsQuery?: GetAnalyticsQueryDto,
  engagementQuery?: GetEngagementMetricsDto,
): UseAnalyticsReturn {
  const queryClient = useQueryClient();

  const analyticsResult = useQuery({
    queryKey: analyticsKeys.classroom(analyticsQuery),
    queryFn: () => analyticsApi.getClassroomAnalytics(analyticsQuery),
    enabled: !!analyticsQuery,
    staleTime: 5 * 60 * 1000,
  });

  const engagementResult = useQuery({
    queryKey: analyticsKeys.engagement(engagementQuery),
    queryFn: () => analyticsApi.getEngagementMetrics(engagementQuery),
    enabled: !!engagementQuery,
    staleTime: 5 * 60 * 1000,
  });

  const reportMutation = useMutation({
    mutationFn: (config: GenerateReportDto) => reportsApi.generateReport(config),
  });

  const generateReport = useCallback(
    async (config: GenerateReportDto): Promise<Report> => {
      const result = await reportMutation.mutateAsync(config);
      // Map binary response to Report shape for backward compatibility
      return {
        id: result.metadata.reportId,
        type: config.type,
        title: config.title || 'Report',
        status: 'completed' as const,
        file_url: URL.createObjectURL(result.blob),
        created_at: result.metadata.generatedAt,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
    },
    [reportMutation],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
  }, [queryClient]);

  // Combine loading/error states for backward compatibility
  const loading = analyticsResult.isLoading || engagementResult.isLoading;
  const error = analyticsResult.error ?? engagementResult.error ?? null;

  return {
    analytics: analyticsResult.data ?? null,
    engagement: engagementResult.data ?? null,
    loading,
    error,
    generateReport,
    refresh,
  };
}

// ---------------------------------------------------------------------------
// useStudentInsights
// ---------------------------------------------------------------------------

/**
 * useStudentInsights Hook
 * Fetches detailed insights and predictions for an individual student
 *
 * @param studentId - The ID of the student to analyze
 * @returns Student insights data, loading state, error state, and refresh function
 */
export function useStudentInsights(studentId: string): UseStudentInsightsReturn {
  const queryClient = useQueryClient();

  const insightsResult = useQuery({
    queryKey: analyticsKeys.studentInsights(studentId),
    queryFn: () => analyticsApi.getStudentInsights(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: analyticsKeys.studentInsights(studentId),
    });
  }, [queryClient, studentId]);

  return {
    insights: insightsResult.data ?? null,
    loading: insightsResult.isLoading,
    error: insightsResult.error ?? null,
    refresh,
  };
}
