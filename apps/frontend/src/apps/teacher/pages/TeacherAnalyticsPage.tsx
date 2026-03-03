import { useState, useEffect, useMemo } from 'react';
import { safeFormatNumber } from '@shared/utils/format.util';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { TabBar, type TabDefinition } from '@shared/components/base/TabBar';
import { FormField } from '@shared/components/common/FormField';
import { DataTable, type Column } from '@shared/components/common/DataTable';
import { useApiError } from '@shared/hooks';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { LoadingSpinner } from '@shared/components/loading';
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
import type { StudentPerformance } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { TeacherPageShell } from '../components/shared/TeacherPageShell';

type AnalyticsTab = 'overview' | 'performance' | 'engagement';

const ANALYTICS_TABS: TabDefinition<AnalyticsTab>[] = [
  { id: 'overview', label: 'Vista General', icon: BarChart3 },
  { id: 'performance', label: 'Rendimiento', icon: TrendingUp },
  { id: 'engagement', label: 'Engagement', icon: Users },
];

// ============================================================================
// SUB-COMPONENTS — DataTable wrappers for inline tables
// ============================================================================

interface FeatureUsageRow {
  feature_name: string;
  usage_count: number;
  unique_users?: number;
}

const FEATURE_USAGE_COLUMNS: Column<FeatureUsageRow>[] = [
  {
    key: 'feature_name',
    label: 'Funcionalidad',
    render: (row) => <span className="font-medium text-detective-text">{row.feature_name}</span>,
  },
  {
    key: 'usage_count',
    label: 'Usos Totales',
    render: (row) => <span className="text-detective-text">{row.usage_count.toLocaleString()}</span>,
  },
  {
    key: 'unique_users',
    label: 'Usuarios Unicos',
    render: (row) => <span className="text-detective-text">{row.unique_users ?? 0}</span>,
  },
];

function FeatureUsageTable({ data }: { data: FeatureUsageRow[] }) {
  return (
    <DataTable<FeatureUsageRow>
      data={data}
      columns={FEATURE_USAGE_COLUMNS}
      variant="detective"
      rowKey={(row) => row.feature_name}
      emptyMessage="No hay datos de uso de funcionalidades disponibles"
      striped={false}
      hoverable
    />
  );
}

const PERFORMANCE_COLUMNS: Column<StudentPerformance>[] = [
  {
    key: 'student_name',
    label: 'Estudiante',
    render: (row) => <span className="font-medium text-detective-text">{row.student_name}</span>,
  },
  {
    key: 'average_score',
    label: 'Puntuacion Promedio',
    render: (row) => (
      <span
        className={`font-bold ${
          row.average_score >= 80
            ? 'text-green-500'
            : row.average_score >= 60
              ? 'text-yellow-500'
              : 'text-red-500'
        }`}
      >
        {safeFormatNumber(row.average_score, 1, '%')}
      </span>
    ),
  },
  {
    key: 'completion_rate',
    label: 'Completitud',
    render: (row) => (
      <span className="text-detective-text">
        {safeFormatNumber(row.completion_rate, 0, '%', '0%')}
      </span>
    ),
  },
  {
    key: 'last_active',
    label: 'Ultima Actividad',
    render: (row) => (
      <span className="text-detective-text">
        {row.last_active ? new Date(row.last_active).toLocaleDateString('es-ES') : 'N/A'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    render: (row) => (
      <span
        className={`rounded px-2 py-1 text-xs font-medium ${
          row.average_score >= 80
            ? 'bg-green-500/20 text-green-500'
            : row.average_score >= 60
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'bg-red-500/20 text-red-500'
        }`}
      >
        {row.average_score >= 80 ? 'Excelente' : row.average_score >= 60 ? 'Regular' : 'Bajo'}
      </span>
    ),
  },
];

function PerformanceTable({ data }: { data: StudentPerformance[] }) {
  return (
    <DataTable<StudentPerformance>
      data={data}
      columns={PERFORMANCE_COLUMNS}
      variant="detective"
      rowKey={(row) => row.student_id || row.student_name}
      emptyMessage="No hay datos de estudiantes disponibles"
      striped={false}
      hoverable
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TeacherAnalyticsPage() {
  const { handleError } = useApiError();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

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
          color: '#1f2937', // detective-text
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280', // detective-text-secondary
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.15)', // detective-text-secondary with opacity
        },
      },
      y: {
        ticks: {
          color: '#6b7280', // detective-text-secondary
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.15)', // detective-text-secondary with opacity
        },
      },
    },
  };

  const exportToCSV = async () => {
    if (!selectedClassroomId) {
      toast('Por favor selecciona una clase primero', { icon: '\u26A0\uFE0F' });
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
        toast('El reporte está siendo generado. Por favor intenta nuevamente en unos momentos.', { icon: '\u2139\uFE0F' });
      }
    } catch (err: unknown) {
      handleError(err, 'Error al generar el reporte');
    }
  };

  return (
      <TeacherPageShell>
      <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
        <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-detective-text">Analíticas</h1>
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
            <div className="flex items-start gap-4" role="alert">
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
          <div className="flex flex-col items-center justify-center py-20" aria-live="polite">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-detective-text-secondary">Cargando analíticas...</p>
          </div>
        )}

        {/* Tab Switcher */}
        {!loading && (
          <TabBar<AnalyticsTab>
            tabs={ANALYTICS_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="detective-pills"
            className="mb-6"
          />
        )}

        {/* Content */}
        {!loading && activeTab === 'overview' && analytics && (
          <div className="space-y-6" role="region" aria-label="Vista general de analiticas">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-detective-text-secondary">Puntuación Promedio</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                      {safeFormatNumber(analytics?.average_score, 1, '%')}
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
                    <p className="text-sm text-detective-text-secondary">Tasa de Completitud</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                      {safeFormatNumber(analytics?.completion_rate, 1, '%')}
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
                    <p className="text-sm text-detective-text-secondary">Tasa de Engagement</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                      {safeFormatNumber(analytics?.engagement_rate, 1, '%')}
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
              <PerformanceTable
                data={
                  analytics?.student_performance?.filter(
                    (s) =>
                      s &&
                      typeof s.student_name === 'string' &&
                      typeof s.average_score === 'number',
                  ) ?? []
                }
              />
            </DetectiveCard>
          </div>
        )}

        {!loading && activeTab === 'engagement' && engagement && (
          <div className="space-y-6" role="region" aria-label="Metricas de engagement">
            {/* Main Engagement Metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-3">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-detective-text-secondary">Usuarios Activos Diarios</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">{engagement.dau}</p>
                  </div>
                </div>
              </DetectiveCard>

              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-detective-text-secondary">Usuarios Activos Semanales</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">{engagement.wau}</p>
                  </div>
                </div>
              </DetectiveCard>

              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/20 p-3">
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-detective-text-secondary">Duración Promedio (min)</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                      {safeFormatNumber(engagement?.session_duration_avg, 0, '', '0')}
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
                    <p className="text-sm text-detective-text-secondary">Sesiones por Usuario</p>
                    <p className="text-2xl sm:text-3xl font-bold text-detective-text">
                      {safeFormatNumber(engagement?.sessions_per_user, 1, '', '0.0')}
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
                    <p className="text-sm text-detective-text-secondary">Cambio en DAU</p>
                    <p
                      className={`text-2xl font-bold ${
                        (engagement?.comparison_previous_period?.dau_change ?? 0) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {(engagement?.comparison_previous_period?.dau_change ?? 0) >= 0 ? '+' : ''}
                      {safeFormatNumber(
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
                    <p className="text-sm text-detective-text-secondary">Cambio en WAU</p>
                    <p
                      className={`text-2xl font-bold ${
                        (engagement?.comparison_previous_period?.wau_change ?? 0) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {(engagement?.comparison_previous_period?.wau_change ?? 0) >= 0 ? '+' : ''}
                      {safeFormatNumber(
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
                    <p className="text-sm text-detective-text-secondary">Cambio en Engagement</p>
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
                      {safeFormatNumber(
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
                <FeatureUsageTable
                  data={engagement.feature_usage.filter(
                    (f) =>
                      f &&
                      typeof f.feature_name === 'string' &&
                      typeof f.usage_count === 'number',
                  )}
                />
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
      </TeacherPageShell>
  );
}
