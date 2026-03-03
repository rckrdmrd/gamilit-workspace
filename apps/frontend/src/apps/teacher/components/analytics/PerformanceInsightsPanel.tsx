import { useState } from 'react';
import { User, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { SkeletonCard } from '@shared/components/loading';
import { useStudentInsights } from '../../hooks/useAnalytics';

interface PerformanceInsightsPanelProps {
  classroomId: string;
  students: Array<{ id: string; full_name: string }>;
}

export function PerformanceInsightsPanel({ students }: PerformanceInsightsPanelProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { insights, loading, error, refresh } = useStudentInsights(selectedStudentId);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-500 bg-red-500';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500';
      default:
        return 'text-green-500 bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <DetectiveCard>
        <div className="flex items-center gap-4">
          <User className="h-6 w-6 text-detective-orange" />
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-detective-text">
              Seleccionar Estudiante
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="border-detective-border w-full rounded-lg border bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
            >
              <option value="">Seleccionar estudiante...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </DetectiveCard>

      {/* Loading State */}
      {selectedStudentId && loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SkeletonCard count={4} variant="small" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SkeletonCard variant="medium" />
            <SkeletonCard variant="medium" />
          </div>
        </div>
      )}

      {/* Error State */}
      {selectedStudentId && error && !loading && (
        <DetectiveCard>
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-bold text-detective-text">Error al cargar insights</h3>
            <p className="mb-4 text-detective-text-secondary">
              No se pudieron cargar los insights del estudiante. Por favor, intenta nuevamente.
            </p>
            <DetectiveButton onClick={refresh} variant="primary">
              Reintentar
            </DetectiveButton>
          </div>
        </DetectiveCard>
      )}

      {/* Insights Display */}
      {selectedStudentId && insights && !loading && !error && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DetectiveCard hoverable={false}>
              <p className="mb-1 text-sm text-detective-text-secondary">Score General</p>
              <p className="text-3xl font-bold text-detective-text">
                {insights.overall_score.toFixed(0)}%
              </p>
            </DetectiveCard>
            <DetectiveCard hoverable={false}>
              <p className="mb-1 text-sm text-detective-text-secondary">Módulos</p>
              <p className="text-3xl font-bold text-detective-text">
                {insights.modules_completed}/{insights.modules_total}
              </p>
            </DetectiveCard>
            <DetectiveCard hoverable={false}>
              <p className="mb-1 text-sm text-detective-text-secondary">Percentil Score</p>
              <p className="text-3xl font-bold text-detective-gold">
                {insights.comparison_to_class.score_percentile.toFixed(0)}%
              </p>
            </DetectiveCard>
            <DetectiveCard hoverable={false}>
              <p className="mb-1 text-sm text-detective-text-secondary">Riesgo</p>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${getRiskColor(insights.risk_level).split(' ')[1]}`}
                />
                <p
                  className={`text-2xl font-bold ${getRiskColor(insights.risk_level).split(' ')[0]}`}
                >
                  {insights.risk_level.toUpperCase()}
                </p>
              </div>
            </DetectiveCard>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DetectiveCard>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Fortalezas
              </h3>
              <ul className="space-y-2">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-detective-text">
                    <span className="text-green-500">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </DetectiveCard>

            <DetectiveCard>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Áreas de Mejora
              </h3>
              <ul className="space-y-2">
                {insights.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-detective-text">
                    <span className="text-red-500">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </DetectiveCard>
          </div>

          {/* Predictions */}
          <DetectiveCard>
            <h3 className="mb-4 text-lg font-bold text-detective-text">Predicciones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <p className="mb-2 text-sm text-detective-text-secondary">
                  Probabilidad de Completar
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {(insights.predictions.completion_probability * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-detective-bg-secondary p-4">
                <p className="mb-2 text-sm text-detective-text-secondary">Riesgo de Abandono</p>
                <p className="text-2xl font-bold text-red-500">
                  {(insights.predictions.dropout_risk * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </DetectiveCard>

          {/* Recommendations */}
          <DetectiveCard>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <Lightbulb className="h-5 w-5 text-detective-gold" />
              Recomendaciones
            </h3>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-detective-bg-secondary p-3"
                >
                  <span className="mt-1 text-detective-gold">💡</span>
                  <span className="text-detective-text">{rec}</span>
                </li>
              ))}
            </ul>
          </DetectiveCard>
        </>
      )}

      {/* Empty State - No Student Selected */}
      {!selectedStudentId && (
        <DetectiveCard>
          <div className="py-12 text-center">
            <User className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary opacity-50" />
            <h3 className="mb-2 text-lg font-bold text-detective-text">Selecciona un Estudiante</h3>
            <p className="text-detective-text-secondary">
              Elige un estudiante del selector para ver insights detallados de su rendimiento
            </p>
          </div>
        </DetectiveCard>
      )}

      {/* Empty State - No Students Available */}
      {students.length === 0 && (
        <DetectiveCard>
          <div className="py-12 text-center">
            <User className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary opacity-50" />
            <h3 className="mb-2 text-lg font-bold text-detective-text">No hay estudiantes</h3>
            <p className="text-detective-text-secondary">
              No se encontraron estudiantes en esta clase
            </p>
          </div>
        </DetectiveCard>
      )}
    </div>
  );
}
