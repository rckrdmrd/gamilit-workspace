import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { EngagementMetricsChart } from './EngagementMetricsChart';
import { useAnalytics } from '../../hooks/useAnalytics';

interface LearningAnalyticsDashboardProps {
  classroomId: string;
}

export function LearningAnalyticsDashboard({ classroomId }: LearningAnalyticsDashboardProps) {
  const { analytics, engagement, loading, error, refresh } = useAnalytics(
    { classroom_id: classroomId },
    { classroom_id: classroomId },
  );
  const learningAnalytics = analytics;
  const engagementMetrics = engagement;

  if (loading) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <p className="text-detective-text-secondary">Cargando analíticas...</p>
        </div>
      </DetectiveCard>
    );
  }

  if (error || !learningAnalytics || !engagementMetrics) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center">
          <p className="text-red-500">Error: {error?.message || 'An error occurred'}</p>
          <DetectiveButton onClick={refresh} variant="secondary" className="mt-4">
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-2xl font-bold text-detective-text">Analíticas de Aprendizaje</h2>
            <p className="text-detective-text-secondary">
              Métricas avanzadas de rendimiento educativo
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <DetectiveCard hoverable={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-detective-orange" />
              <span className="text-sm text-detective-text-secondary">Engagement Rate</span>
            </div>
            <p className="text-3xl font-bold text-detective-text">
              {learningAnalytics.engagement_rate.toFixed(0)}%
            </p>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-detective-gold" />
              <span className="text-sm text-detective-text-secondary">Completion Rate</span>
            </div>
            <p className="text-3xl font-bold text-detective-text">
              {learningAnalytics.completion_rate.toFixed(0)}%
            </p>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="text-detective-accent h-5 w-5" />
              <span className="text-sm text-detective-text-secondary">Time on Task</span>
            </div>
            <p className="text-3xl font-bold text-detective-text">
              {Math.floor((learningAnalytics?.average_time_on_task || 0) / 60)}m
            </p>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm text-detective-text-secondary">Success Rate 1st Try</span>
            </div>
            <p className="text-3xl font-bold text-detective-text">
              {(learningAnalytics?.first_attempt_success_rate || 0).toFixed(0)}%
            </p>
          </div>
        </DetectiveCard>
      </div>

      {/* Most Used Exercises */}
      <DetectiveCard>
        <h3 className="mb-4 text-lg font-bold text-detective-text">Ejercicios Más Utilizados</h3>
        <div className="space-y-3">
          {(learningAnalytics?.most_used_exercises || []).map((exercise: { exercise_name: string; usage_count: number }, index: number) => {
            const maxUsage = Math.max(
              ...(learningAnalytics?.most_used_exercises || []).map((e: { usage_count: number }) => e.usage_count),
              1,
            );
            const percentage = (exercise.usage_count / maxUsage) * 100;

            return (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-detective-text">
                    {exercise.exercise_name}
                  </span>
                  <span className="text-sm font-bold text-detective-text">
                    {exercise.usage_count} veces
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-detective-bg-secondary">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-detective-orange to-detective-gold transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DetectiveCard>

      {/* Activity Heatmap */}
      <DetectiveCard>
        <h3 className="mb-4 text-lg font-bold text-detective-text">Mapa de Calor de Actividad</h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="mb-2 grid grid-cols-8 gap-2">
              <div className="text-xs text-detective-text-secondary"></div>
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-semibold text-detective-text-secondary"
                >
                  {day}
                </div>
              ))}
            </div>
            {[0, 6, 12, 18].map((hour) => (
              <div key={hour} className="mb-2 grid grid-cols-8 gap-2">
                <div className="pr-2 text-right text-xs text-detective-text-secondary">
                  {hour}:00
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const activity = (learningAnalytics?.activity_heatmap || []).find(
                    (a) => a.day === day && a.hour === hour,
                  );
                  const count = activity?.activity_count || 0;
                  const maxCount = Math.max(
                    ...(learningAnalytics?.activity_heatmap || []).map((a) => a.activity_count),
                    1,
                  );
                  const intensity = count / maxCount;

                  return (
                    <div
                      key={day}
                      className="aspect-square rounded"
                      style={{
                        backgroundColor:
                          intensity > 0.7
                            ? '#FF8C42'
                            : intensity > 0.4
                              ? '#FFD700'
                              : intensity > 0.1
                                ? '#4ECDC4'
                                : '#2A2A2A',
                        opacity: intensity > 0 ? 0.3 + intensity * 0.7 : 0.3,
                      }}
                      title={`${day} ${hour}:00 - ${count} actividades`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-detective-text-secondary">
          <span>Menos</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded"
                style={{ backgroundColor: '#FF8C42', opacity }}
              />
            ))}
          </div>
          <span>Más</span>
        </div>
      </DetectiveCard>

      {/* Engagement Metrics */}
      <EngagementMetricsChart metrics={engagementMetrics} />
    </div>
  );
}
