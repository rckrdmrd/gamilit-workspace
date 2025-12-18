import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { ClassProgressDashboard } from '../components/progress/ClassProgressDashboard';
import { useClassrooms } from '../hooks/useClassrooms';
import { useClassroomsStats } from '../hooks/useClassroomsStats';
import { useAnalytics } from '../hooks/useAnalytics';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FormField } from '@shared/components/common/FormField';
import {
  BarChart3,
  RefreshCw,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Users as UsersIcon,
  Download,
  TrendingUp,
} from 'lucide-react';

/**
 * TeacherProgressPage - Página de seguimiento de progreso académico
 *
 * Proporciona una vista integral del progreso de los estudiantes con:
 * - Selector de clase para filtrar datos
 * - Dashboard de progreso con gráficos y métricas
 * - Identificación de estudiantes rezagados
 * - Análisis por módulo
 */
export default function TeacherProgressPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { classrooms, loading, error, refresh } = useClassrooms();
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'engagement'>('progress');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Fetch classroom statistics for aggregate calculations
  const { aggregateStats, loading: statsLoading } = useClassroomsStats(classrooms);

  // Query para analytics (solo cuando tab engagement esta activo y hay clase seleccionada)
  const analyticsQuery = useMemo(
    () =>
      activeTab === 'engagement' && selectedClassroomId !== 'all'
        ? {
            classroom_id: selectedClassroomId,
            start_date: dateRange.start,
            end_date: dateRange.end,
          }
        : undefined,
    [activeTab, selectedClassroomId, dateRange.start, dateRange.end],
  );

  const engagementQuery = useMemo(
    () =>
      activeTab === 'engagement' && selectedClassroomId !== 'all'
        ? {
            classroom_id: selectedClassroomId,
            start_date: dateRange.start,
            end_date: dateRange.end,
            period: 'daily' as const,
          }
        : undefined,
    [activeTab, selectedClassroomId, dateRange.start, dateRange.end],
  );

  // Hook de analytics
  const {
    engagement: engagementData,
    loading: analyticsLoading,
    error: analyticsError,
    generateReport,
    refresh: refreshAnalytics,
  } = useAnalytics(analyticsQuery, engagementQuery);

  // Use useUserGamification hook for real-time gamification data
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  /**
   * Safely format a number to fixed decimals
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

  /**
   * Export analytics to CSV
   */
  const exportToCSV = async () => {
    if (selectedClassroomId === 'all') {
      alert('Por favor selecciona una clase especifica para exportar');
      return;
    }

    try {
      const report = await generateReport({
        type: 'custom',
        title: `Engagement Report - ${selectedClassroomName}`,
        classroom_id: selectedClassroomId,
        start_date: dateRange.start,
        end_date: dateRange.end,
        format: 'csv',
        include_charts: true,
        include_recommendations: true,
      });

      if (report.status === 'completed' && report.file_url) {
        window.open(report.file_url, '_blank');
      } else {
        alert('El reporte esta siendo generado. Por favor intenta nuevamente en unos momentos.');
      }
    } catch (err) {
      console.error('[TeacherProgressPage] Error exporting CSV:', err);
      alert('Error al generar el reporte. Por favor intenta nuevamente.');
    }
  };

  // Obtener el nombre de la clase seleccionada
  const selectedClassroomName = useMemo(() => {
    if (selectedClassroomId === 'all') return 'Todas las clases';
    if (!classrooms || !Array.isArray(classrooms)) return 'Clase no encontrada';
    const classroom = classrooms.find((c) => c.id === selectedClassroomId);
    return classroom?.name || 'Clase no encontrada';
  }, [selectedClassroomId, classrooms]);

  // Estadísticas generales de todas las clases
  // Now calculated from real classroom stats fetched via useClassroomsStats hook
  const overallStats = useMemo(() => {
    // Use aggregateStats from the hook which calculates weighted averages
    return {
      totalStudents: aggregateStats.totalStudents,
      averageScore: aggregateStats.averageScore,
      activeClasses: aggregateStats.activeClasses,
    };
  }, [aggregateStats]);

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-detective-orange bg-opacity-10 p-3">
              <BarChart3 className="h-8 w-8 text-detective-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-detective-text">Progreso Académico</h1>
              <p className="text-detective-text-secondary">
                Monitorea el rendimiento y avance de tus estudiantes
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          {!loading && !error && (
            <DetectiveButton
              variant="secondary"
              onClick={refresh}
              className="self-start md:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </DetectiveButton>
          )}
        </div>

        {/* Loading State */}
        {(loading || (statsLoading && classrooms.length > 0)) && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">
              {loading ? 'Cargando clases...' : 'Calculando estadísticas...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <DetectiveCard variant="danger">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-detective-text">
                  Error al cargar progreso
                </h3>
                <p className="mb-4 text-detective-text-secondary">
                  No se pudieron cargar los datos de progreso. Por favor, intenta nuevamente.
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

        {/* Overall Stats Cards - Solo cuando se ve "Todas las clases" */}
        {selectedClassroomId === 'all' && !loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="mb-2 text-sm text-detective-text-secondary">Total de Estudiantes</p>
                <p className="text-4xl font-bold text-detective-text">
                  {overallStats.totalStudents}
                </p>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="mb-2 text-sm text-detective-text-secondary">Promedio General</p>
                {statsLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-detective-gold" />
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-detective-gold">
                    {overallStats.averageScore.toFixed(1)}%
                  </p>
                )}
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="mb-2 text-sm text-detective-text-secondary">Clases Activas</p>
                <p className="text-detective-accent text-4xl font-bold">
                  {overallStats.activeClasses}
                </p>
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Classroom Selector */}
        {!loading && !error && (
          <DetectiveCard hoverable={false}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-detective-orange" />
                <div>
                  <label className="mb-1 block text-sm font-medium text-detective-text-secondary">
                    Filtrar por Clase
                  </label>
                  <p className="text-xs text-detective-text-secondary">
                    Selecciona una clase específica o visualiza todas
                  </p>
                </div>
              </div>

              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                  className="border-detective-border flex w-full items-center justify-between rounded-lg border-2 bg-detective-bg-secondary px-4 py-3 text-left transition-colors hover:border-detective-orange md:w-80"
                >
                  <span className="truncate font-medium text-detective-text">
                    {selectedClassroomName}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-detective-text-secondary transition-transform ${
                      showClassroomDropdown ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showClassroomDropdown && (
                  <div className="bg-detective-card border-detective-border absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border-2 shadow-detective-lg">
                    {/* All Classes Option */}
                    <button
                      onClick={() => {
                        setSelectedClassroomId('all');
                        setShowClassroomDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary ${
                        selectedClassroomId === 'all'
                          ? 'bg-detective-orange bg-opacity-10 font-semibold text-detective-orange'
                          : 'text-detective-text'
                      }`}
                    >
                      <div>
                        <p className="font-medium">Todas las clases</p>
                        <p className="mt-0.5 text-xs text-detective-text-secondary">
                          Vista general de {classrooms.length} clase(s)
                        </p>
                      </div>
                    </button>

                    {/* Divider */}
                    {classrooms.length > 0 && (
                      <div className="border-detective-border my-1 border-t"></div>
                    )}

                    {/* Individual Classrooms */}
                    {classrooms.map((classroom) => (
                      <button
                        key={classroom.id}
                        onClick={() => {
                          setSelectedClassroomId(classroom.id);
                          setShowClassroomDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary ${
                          selectedClassroomId === classroom.id
                            ? 'bg-detective-orange bg-opacity-10 font-semibold text-detective-orange'
                            : 'text-detective-text'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{classroom.name}</p>
                          <p className="mt-0.5 text-xs text-detective-text-secondary">
                            {classroom.student_count} estudiante(s) • {classroom.grade_level} •{' '}
                            {classroom.subject}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Empty State */}
                    {classrooms.length === 0 && (
                      <div className="px-4 py-6 text-center text-detective-text-secondary">
                        <p className="text-sm">No hay clases disponibles</p>
                        <p className="mt-1 text-xs">Crea una clase para comenzar</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Tab Switcher */}
        {!loading && !error && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('progress')}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                activeTab === 'progress'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <BarChart3 className="mr-2 inline h-5 w-5" />
              Progreso
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                activeTab === 'engagement'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <Activity className="mr-2 inline h-5 w-5" />
              Engagement
            </button>
          </div>
        )}

        {/* Tab Progress Content */}
        {!loading && !error && activeTab === 'progress' && (
          <>
            {selectedClassroomId !== 'all' ? (
              <ClassProgressDashboard classroomId={selectedClassroomId} />
            ) : (
              <DetectiveCard hoverable={false}>
                <div className="py-16 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-detective-orange bg-opacity-10">
                    <BarChart3 className="h-8 w-8 text-detective-orange" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-detective-text">
                    Selecciona una clase
                  </h3>
                  <p className="mx-auto max-w-md text-detective-text-secondary">
                    Para ver el progreso detallado, analisis por modulos y estudiantes rezagados,
                    selecciona una clase especifica del menu desplegable superior.
                  </p>
                  {classrooms.length === 0 && (
                    <DetectiveButton
                      variant="primary"
                      className="mt-6"
                      onClick={() => navigate('/teacher/classes')}
                    >
                      Crear Primera Clase
                    </DetectiveButton>
                  )}
                </div>
              </DetectiveCard>
            )}

            {/* Info Card - Tips para el Teacher */}
            <DetectiveCard hoverable={false}>
              <div className="flex items-start gap-4">
                <div className="bg-detective-accent flex-shrink-0 rounded-lg bg-opacity-10 p-3">
                  <BarChart3 className="text-detective-accent h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-detective-text">
                    Consejos para el Seguimiento de Progreso
                  </h3>
                  <ul className="space-y-2 text-sm text-detective-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-detective-orange">•</span>
                      <span>
                        Revisa las alertas de estudiantes rezagados semanalmente para intervenir a
                        tiempo
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-detective-orange">•</span>
                      <span>
                        Los graficos de progreso por modulo te ayudan a identificar temas que
                        necesitan refuerzo
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-detective-orange">•</span>
                      <span>
                        Exporta reportes en PDF o Excel para compartir con directivos o padres de
                        familia
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 font-bold text-detective-orange">•</span>
                      <span>
                        Compara el rendimiento entre clases para adaptar tus estrategias de
                        ensenanza
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </DetectiveCard>
          </>
        )}

        {/* Tab Engagement Content */}
        {!loading && !error && activeTab === 'engagement' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <DetectiveCard hoverable={false}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <div className="flex items-end gap-2">
                  <DetectiveButton
                    variant="primary"
                    onClick={exportToCSV}
                    disabled={selectedClassroomId === 'all'}
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </DetectiveButton>
                  <DetectiveButton variant="secondary" onClick={refreshAnalytics}>
                    <RefreshCw className="h-4 w-4" />
                  </DetectiveButton>
                </div>
              </div>
            </DetectiveCard>

            {/* Loading state for analytics */}
            {analyticsLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
                <p className="text-detective-text-secondary">Cargando metricas de engagement...</p>
              </div>
            )}

            {/* Error state for analytics */}
            {analyticsError && !analyticsLoading && (
              <DetectiveCard variant="danger">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-detective-text">
                      Error al cargar engagement
                    </h3>
                    <p className="mb-4 text-detective-text-secondary">{analyticsError.message}</p>
                    <DetectiveButton onClick={refreshAnalytics} variant="primary">
                      <RefreshCw className="h-4 w-4" />
                      Reintentar
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            )}

            {/* Select class prompt for engagement */}
            {selectedClassroomId === 'all' && !analyticsLoading && (
              <DetectiveCard hoverable={false}>
                <div className="py-12 text-center">
                  <Activity className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
                  <h3 className="mb-2 text-lg font-semibold text-detective-text">
                    Selecciona una clase
                  </h3>
                  <p className="text-detective-text-secondary">
                    Las metricas de engagement requieren seleccionar una clase especifica
                  </p>
                </div>
              </DetectiveCard>
            )}

            {/* Engagement Metrics - Main Cards */}
            {engagementData && selectedClassroomId !== 'all' && !analyticsLoading && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/20 p-3">
                        <UsersIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-detective-text-secondary">
                          Usuarios Activos Diarios
                        </p>
                        <p className="text-3xl font-bold text-detective-text">
                          {engagementData.dau}
                        </p>
                      </div>
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-500/20 p-3">
                        <Activity className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-detective-text-secondary">
                          Usuarios Activos Semanales
                        </p>
                        <p className="text-3xl font-bold text-detective-text">
                          {engagementData.wau}
                        </p>
                      </div>
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-500/20 p-3">
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-detective-text-secondary">
                          Duracion Promedio (min)
                        </p>
                        <p className="text-3xl font-bold text-detective-text">
                          {safeFormat(engagementData?.session_duration_avg, 0, '', '0')}
                        </p>
                      </div>
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/20 p-3">
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-detective-text-secondary">
                          Sesiones por Usuario
                        </p>
                        <p className="text-3xl font-bold text-detective-text">
                          {safeFormat(engagementData?.sessions_per_user, 1, '', '0.0')}
                        </p>
                      </div>
                    </div>
                  </DetectiveCard>
                </div>

                {/* Comparison with Previous Period */}
                <DetectiveCard hoverable={false}>
                  <h3 className="mb-4 text-lg font-bold text-detective-text">
                    Comparacion con Periodo Anterior
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      {(engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0 ? (
                        <ArrowUp className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowDown className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm text-detective-text-secondary">Cambio en DAU</p>
                        <p
                          className={`text-2xl font-bold ${
                            (engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {(engagementData?.comparison_previous_period?.dau_change ?? 0) >= 0
                            ? '+'
                            : ''}
                          {safeFormat(
                            engagementData?.comparison_previous_period?.dau_change,
                            1,
                            '%',
                            '0.0%',
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {(engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0 ? (
                        <ArrowUp className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowDown className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm text-detective-text-secondary">Cambio en WAU</p>
                        <p
                          className={`text-2xl font-bold ${
                            (engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {(engagementData?.comparison_previous_period?.wau_change ?? 0) >= 0
                            ? '+'
                            : ''}
                          {safeFormat(
                            engagementData?.comparison_previous_period?.wau_change,
                            1,
                            '%',
                            '0.0%',
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {(engagementData?.comparison_previous_period?.engagement_change ?? 0) >= 0 ? (
                        <ArrowUp className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowDown className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm text-detective-text-secondary">
                          Cambio en Engagement
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            (engagementData?.comparison_previous_period?.engagement_change ?? 0) >=
                            0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {(engagementData?.comparison_previous_period?.engagement_change ?? 0) >= 0
                            ? '+'
                            : ''}
                          {safeFormat(
                            engagementData?.comparison_previous_period?.engagement_change,
                            1,
                            '%',
                            '0.0%',
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </DetectiveCard>

                {/* Feature Usage Table */}
                {engagementData?.feature_usage && engagementData.feature_usage.length > 0 && (
                  <DetectiveCard hoverable={false}>
                    <h3 className="mb-4 text-lg font-bold text-detective-text">
                      Uso de Funcionalidades
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-detective-border border-b">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                              Funcionalidad
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                              Usos Totales
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-detective-text-secondary">
                              Usuarios Unicos
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {engagementData.feature_usage
                            .filter(
                              (feature) =>
                                feature &&
                                typeof feature.feature_name === 'string' &&
                                typeof feature.usage_count === 'number',
                            )
                            .map((feature, index) => (
                              <tr
                                key={feature.feature_name || index}
                                className="border-detective-border border-b transition-colors hover:bg-detective-bg-secondary"
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Click Outside Handler for Dropdown */}
      {showClassroomDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowClassroomDropdown(false)} />
      )}
    </TeacherLayout>
  );
}
