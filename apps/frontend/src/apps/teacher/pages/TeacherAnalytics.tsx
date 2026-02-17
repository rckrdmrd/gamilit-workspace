import { useState, useEffect, useMemo } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FormField } from '@shared/components/common/FormField';
import { ToastContainer, useToast } from '@shared/components/base/Toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useClassrooms } from '../hooks/useClassrooms';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Safely format a number to fixed decimals
 * @param value - Value to format
 * @param decimals - Number of decimal places
 * @param suffix - Optional suffix (e.g., '%')
 * @param fallback - Fallback value if invalid
 */
const safeFormat = (
  value: number | undefined | null,
  decimals: number = 1,
  suffix: string = '',
  fallback: string = 'N/A',
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(decimals)}${suffix}`;
};

export default function TeacherAnalytics() {
  const { toasts, showToast } = useToast();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement'>('overview');
  const [dateRange, setDateRange] = useState({ start: '2025-10-01', end: '2025-10-16' });

  // Use custom hooks
  const { classrooms, loading: classroomsLoading } = useClassrooms();

  // Memoize queries to prevent unnecessary re-renders and API calls
  const analyticsQuery = useMemo(
    () =>
      selectedClassroomId
        ? {
            classroom_id: selectedClassroomId,
            start_date: dateRange.start,
            end_date: dateRange.end,
          }
        : undefined,
    [selectedClassroomId, dateRange.start, dateRange.end],
  );

  const engagementQuery = useMemo(
    () =>
      selectedClassroomId
        ? {
            classroom_id: selectedClassroomId,
            start_date: dateRange.start,
            end_date: dateRange.end,
            period: 'daily' as const,
          }
        : undefined,
    [selectedClassroomId, dateRange.start, dateRange.end],
  );

  const {
    analytics,
    engagement,
    loading: analyticsLoading,
    error: analyticsError,
    generateReport,
    refresh,
  } = useAnalytics(analyticsQuery, engagementQuery);

  // Auto-select first classroom when loaded
  useEffect(() => {
    if (!selectedClassroomId && classrooms.length > 0) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  // Combined loading and error states
  const loading = classroomsLoading || analyticsLoading;
  const error = analyticsError;

  // Validar y filtrar module_stats antes de construir charts
  const moduleScoresChart = {
    labels:
      analytics?.module_stats
        ?.filter((m) => m && typeof m.module_name === 'string')
        .map((m) => m.module_name) || [],
    datasets: [
      {
        label: 'Promedio de Puntuación',
        data:
          analytics?.module_stats
            ?.filter((m) => m && typeof m.average_score === 'number')
            .map((m) => m.average_score) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
      },
    ],
  };

  const completionRateChart = {
    labels:
      analytics?.module_stats
        ?.filter((m) => m && typeof m.module_name === 'string')
        .map((m) => m.module_name) || [],
    datasets: [
      {
        label: 'Tasa de Completitud (%)',
        data:
          analytics?.module_stats
            ?.filter((m) => m && typeof m.completion_rate === 'number')
            .map((m) => m.completion_rate) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  const exportToCSV = async () => {
    if (!selectedClassroomId) {
      showToast({
        type: 'warning',
        title: 'Atención',
        message: 'Por favor selecciona una clase primero',
      });
      return;
    }

    try {
      const report = await generateReport({
        type: 'custom',
        title: `Analytics Report - ${selectedClassroomId}`,
        classroom_id: selectedClassroomId,
        start_date: dateRange.start,
        end_date: dateRange.end,
        format: 'csv',
        include_charts: true,
        include_recommendations: true,
      });

      if (report.status === 'completed' && report.file_url) {
        // Open download link in new tab
        window.open(report.file_url, '_blank');
      } else {
        showToast({
          type: 'info',
          title: 'En proceso',
          message: 'El reporte está siendo generado. Por favor intenta nuevamente en unos momentos.',
        });
      }
    } catch (err: unknown) {
      console.error('[TeacherAnalytics] Error exporting CSV:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Error al generar el reporte. Por favor intenta nuevamente.',
      });
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-detective-text">Analíticas</h1>
          <p className="text-detective-text-secondary">
            Visualiza el rendimiento y engagement de tus estudiantes
          </p>
        </div>

        {/* Filters */}
        <DetectiveCard className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              label="Clase"
              name="classroom"
              type="select"
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              options={classrooms.map((c) => ({ value: c.id, label: c.name }))}
            />
            <FormField
              label="Fecha Inicio"
              name="startDate"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <FormField
              label="Fecha Fin"
              name="endDate"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <DetectiveButton
              variant="primary"
              onClick={exportToCSV}
              disabled={!selectedClassroomId}
            >
              <Download className="h-4 w-4" />
              Exportar a CSV
            </DetectiveButton>
            {!loading && selectedClassroomId && (
              <DetectiveButton variant="secondary" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </DetectiveButton>
            )}
          </div>
        </DetectiveCard>

        {/* Error Message */}
        {error && (
          <DetectiveCard variant="danger" className="mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-detective-text">
                  Error al cargar analíticas
                </h3>
                <p className="mb-4 text-detective-text-secondary">
                  No se pudieron cargar los datos de analíticas. Por favor, intenta nuevamente.
                </p>
                <p className="mb-4 rounded bg-red-950 p-2 font-mono text-sm text-red-400">
                  {error.message}
                </p>
                <DetectiveButton onClick={refresh} variant="primary">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </DetectiveButton>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">Cargando analíticas...</p>
          </div>
        )}

        {/* Tab Switcher */}
        {!loading && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <BarChart3 className="mr-2 inline h-5 w-5" />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                activeTab === 'performance'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <TrendingUp className="mr-2 inline h-5 w-5" />
              Rendimiento
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                activeTab === 'engagement'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <Users className="mr-2 inline h-5 w-5" />
              Engagement
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Puntuación Promedio</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {safeFormat(analytics?.average_score, 1, '%')}
                    </p>
                  </div>
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tasa de Completitud</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {safeFormat(analytics?.completion_rate, 1, '%')}
                    </p>
                  </div>
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/20 p-3">
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tasa de Engagement</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {safeFormat(analytics?.engagement_rate, 1, '%')}
                    </p>
                  </div>
                </div>
              </DetectiveCard>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DetectiveCard>
                <h3 className="mb-4 text-lg font-bold text-detective-text">
                  Puntuación Promedio por Módulo
                </h3>
                <div className="h-80">
                  <Bar data={moduleScoresChart} options={chartOptions} />
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <h3 className="mb-4 text-lg font-bold text-detective-text">
                  Tasa de Completitud por Módulo
                </h3>
                <div className="h-80">
                  <Bar data={completionRateChart} options={chartOptions} />
                </div>
              </DetectiveCard>
            </div>
          </div>
        )}

        {!loading && activeTab === 'performance' && analytics && (
          <div className="space-y-6">
            <DetectiveCard>
              <h3 className="mb-4 text-lg font-bold text-detective-text">
                Rendimiento por Estudiante
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Estudiante
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Puntuación Promedio
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Completitud
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Última Actividad
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.student_performance
                      ?.filter(
                        (student) =>
                          student &&
                          typeof student.student_name === 'string' &&
                          typeof student.average_score === 'number',
                      )
                      .map((student) => (
                        <tr
                          key={student.student_id || student.student_name}
                          className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                        >
                          <td className="px-4 py-3 font-medium text-detective-text">
                            {student.student_name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold ${
                                student.average_score >= 80
                                  ? 'text-green-500'
                                  : student.average_score >= 60
                                    ? 'text-yellow-500'
                                    : 'text-red-500'
                              }`}
                            >
                              {safeFormat(student.average_score, 1, '%')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-detective-text">
                            {safeFormat(student.completion_rate, 0, '%', '0%')}
                          </td>
                          <td className="px-4 py-3 text-detective-text">
                            {student.last_active
                              ? new Date(student.last_active).toLocaleDateString('es-ES')
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${
                                student.average_score >= 80
                                  ? 'bg-green-500/20 text-green-500'
                                  : student.average_score >= 60
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : 'bg-red-500/20 text-red-500'
                              }`}
                            >
                              {student.average_score >= 80
                                ? 'Excelente'
                                : student.average_score >= 60
                                  ? 'Regular'
                                  : 'Bajo'}
                            </span>
                          </td>
                        </tr>
                      ))}

                    {/* Empty state si no hay estudiantes */}
                    {(!analytics?.student_performance ||
                      analytics.student_performance.length === 0) && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-detective-text-secondary"
                        >
                          No hay datos de estudiantes disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DetectiveCard>
          </div>
        )}

        {!loading && activeTab === 'engagement' && engagement && (
          <div className="space-y-6">
            {/* Main Engagement Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Usuarios Activos Diarios</p>
                    <p className="text-3xl font-bold text-detective-text">{engagement.dau}</p>
                  </div>
                </div>
              </DetectiveCard>

              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Usuarios Activos Semanales</p>
                    <p className="text-3xl font-bold text-detective-text">{engagement.wau}</p>
                  </div>
                </div>
              </DetectiveCard>

              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/20 p-3">
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duración Promedio (min)</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {safeFormat(engagement?.session_duration_avg, 0, '', '0')}
                    </p>
                  </div>
                </div>
              </DetectiveCard>

              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sesiones por Usuario</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {safeFormat(engagement?.sessions_per_user, 1, '', '0.0')}
                    </p>
                  </div>
                </div>
              </DetectiveCard>
            </div>

            {/* Comparison with Previous Period */}
            <DetectiveCard>
              <h3 className="mb-4 text-lg font-bold text-detective-text">
                Comparación con Período Anterior
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  {(engagement?.comparison_previous_period?.dau_change ?? 0) >= 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Cambio en DAU</p>
                    <p
                      className={`text-2xl font-bold ${
                        (engagement?.comparison_previous_period?.dau_change ?? 0) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {(engagement?.comparison_previous_period?.dau_change ?? 0) >= 0 ? '+' : ''}
                      {safeFormat(
                        engagement?.comparison_previous_period?.dau_change,
                        1,
                        '%',
                        '0.0%',
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(engagement?.comparison_previous_period?.wau_change ?? 0) >= 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Cambio en WAU</p>
                    <p
                      className={`text-2xl font-bold ${
                        (engagement?.comparison_previous_period?.wau_change ?? 0) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {(engagement?.comparison_previous_period?.wau_change ?? 0) >= 0 ? '+' : ''}
                      {safeFormat(
                        engagement?.comparison_previous_period?.wau_change,
                        1,
                        '%',
                        '0.0%',
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(engagement?.comparison_previous_period?.engagement_change ?? 0) >= 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Cambio en Engagement</p>
                    <p
                      className={`text-2xl font-bold ${
                        (engagement?.comparison_previous_period?.engagement_change ?? 0) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {(engagement?.comparison_previous_period?.engagement_change ?? 0) >= 0
                        ? '+'
                        : ''}
                      {safeFormat(
                        engagement?.comparison_previous_period?.engagement_change,
                        1,
                        '%',
                        '0.0%',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </DetectiveCard>

            {/* Feature Usage */}
            {engagement?.feature_usage && engagement.feature_usage.length > 0 && (
              <DetectiveCard>
                <h3 className="mb-4 text-lg font-bold text-detective-text">
                  Uso de Funcionalidades
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                          Funcionalidad
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                          Usos Totales
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                          Usuarios Únicos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {engagement.feature_usage
                        .filter(
                          (feature) =>
                            feature &&
                            typeof feature.feature_name === 'string' &&
                            typeof feature.usage_count === 'number',
                        )
                        .map((feature, index) => (
                          <tr
                            key={feature.feature_name || index}
                            className="border-b border-gray-800 transition-colors hover:bg-detective-bg-secondary"
                          >
                            <td className="px-4 py-3 font-medium text-detective-text">
                              {feature.feature_name}
                            </td>
                            <td className="px-4 py-3 text-detective-text">
                              {feature.usage_count.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-detective-text">
                              {feature.unique_users ?? 0}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </DetectiveCard>
            )}

            {/* Empty state para feature usage */}
            {(!engagement?.feature_usage || engagement.feature_usage.length === 0) && (
              <DetectiveCard>
                <div className="py-6 text-center text-detective-text-secondary">
                  No hay datos de uso de características disponibles
                </div>
              </DetectiveCard>
            )}
          </div>
        )}

        {/* Empty State for Engagement Tab */}
        {!loading && activeTab === 'engagement' && !engagement && (
          <DetectiveCard>
            <div className="py-12 text-center">
              <Activity className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
              <h3 className="mb-2 text-lg font-semibold text-detective-text">
                No hay datos de engagement disponibles
              </h3>
              <p className="text-detective-text-secondary">
                Selecciona una clase y un rango de fechas para ver las métricas de engagement
              </p>
            </div>
          </DetectiveCard>
          )}
        </main>
      </div>
    </>
  );
}
