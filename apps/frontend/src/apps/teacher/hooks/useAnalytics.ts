import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/apiClient';
import type {
  LearningAnalytics,
  StudentPerformanceInsight,
  EngagementMetrics,
  AnalyticsFilter,
} from '../types';

export function useAnalytics(classroomId: string, filters?: AnalyticsFilter) {
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (filters?.start_date) params.start_date = filters.start_date;
        if (filters?.end_date) params.end_date = filters.end_date;
        if (filters?.module_id) params.module_id = filters.module_id;
        if (filters?.group_id) params.group_id = filters.group_id;

        // Fetch learning analytics
        const learningResponse = await apiClient.get(
          `/analytics/learning/${classroomId}`,
          { params }
        );
        const learningData = learningResponse.data.data;

        // Fetch engagement metrics
        const engagementResponse = await apiClient.get(
          `/analytics/classroom/${classroomId}/engagement`,
          { params }
        );
        const engagementData = engagementResponse.data.data;

        setLearningAnalytics(learningData);
        setEngagementMetrics(engagementData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (classroomId) {
      fetchAnalytics();
    }
  }, [classroomId, filters]);

  const refresh = async () => {
    if (!classroomId) return;

    try {
      setLoading(true);
      const learningResponse = await apiClient.get(`/analytics/learning/${classroomId}`);
      const engagementResponse = await apiClient.get(
        `/analytics/classroom/${classroomId}/engagement`
      );

      const learningData = learningResponse.data.data;
      const engagementData = engagementResponse.data.data;

      setLearningAnalytics(learningData);
      setEngagementMetrics(engagementData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    learningAnalytics,
    engagementMetrics,
    loading,
    error,
    refresh,
  };
}

export function useStudentInsights(studentId: string) {
  const [insights, setInsights] = useState<StudentPerformanceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/analytics/${studentId}`);
        const { data } = response.data;
        setInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching student insights:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchInsights();
    }
  }, [studentId]);

  return {
    insights,
    loading,
    error,
  };
}
