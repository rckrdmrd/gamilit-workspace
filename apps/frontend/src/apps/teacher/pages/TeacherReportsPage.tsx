import { useState, useEffect } from 'react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { RecentReportsTable } from '../components/reports/RecentReportsTable';
import type { RecentReport } from '../components/reports/RecentReportsTable';
import { ScheduledReportsTab } from '../components/reports/ScheduledReportsTab';
import { SharedReportsTab } from '../components/reports/SharedReportsTab';
import { ReportsStatsCards } from '../components/reports/ReportsStatsCards';
import { ReportsFilterBar } from '../components/reports/ReportsFilterBar';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { TabBar, type TabDefinition } from '@shared/components/base/TabBar';
import { useApiError } from '@shared/hooks';
import toast from 'react-hot-toast';
import {
  FileText,
  TrendingUp,
  RefreshCw,
  Lock,
  Info,
  Clock,
  Share2,
} from 'lucide-react';
import type { ReportType, ReportFormat } from '../types';
import { reportsApi, type TeacherReport, type ReportStats as ApiReportStats } from '@services/api/teacher/reportsApi';
import { classroomsApi } from '@services/api/teacher/classroomsApi';

interface ReportStats {
  totalReportsGenerated: number;
  lastGeneratedDate: string;
  mostUsedFormat: ReportFormat;
  averageStudentsPerReport: number;
}

/**
 * TASK-2026-01-18-015 Sprint 4.1: Format file size in human-readable format
 */
const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes === 0) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Transform API response (TeacherReport from reportsApi) to frontend format
const transformReportMetadata = (data: TeacherReport): RecentReport => {
  // Format period from dates
  let period = '';
  if (data.period_start && data.period_end) {
    const startDate = new Date(data.period_start);
    const endDate = new Date(data.period_end);
    period = `${startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  return {
    id: data.id,
    name: data.report_name,
    type: data.report_type as ReportType,
    format: data.report_format as ReportFormat,
    generatedAt: data.generated_at,
    studentCount: data.student_count,
    period: period || 'Sin período definido',
    size: formatFileSize(data.file_size_bytes), // TASK-2026-01-18-015 Sprint 4.1
  };
};

const transformReportStats = (data: ApiReportStats): ReportStats => ({
  totalReportsGenerated: data.total_reports_generated,
  lastGeneratedDate: data.last_generated_date || new Date().toISOString(),
  mostUsedFormat: (data.most_used_format || 'pdf') as ReportFormat,
  averageStudentsPerReport: data.avg_students_per_report,
});

// ============================================================================
// TAB DEFINITIONS
// ============================================================================

type ReportsTab = 'generator' | 'scheduled' | 'shared';

const reportsTabs: TabDefinition<ReportsTab>[] = [
  { id: 'generator', label: 'Generador', icon: <FileText className="h-4 w-4" /> },
  { id: 'scheduled', label: 'Programados', icon: <Clock className="h-4 w-4" /> },
  { id: 'shared', label: 'Compartidos', icon: <Share2 className="h-4 w-4" /> },
];

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * TeacherReportsPage - Página de reportes y estadísticas
 *
 * Permite generar reportes personalizados con diferentes plantillas,
 * configurar rangos de fechas, seleccionar estudiantes y exportar
 * en múltiples formatos (PDF, Excel, CSV).
 *
 * Includes three tabs:
 * - Generador: Generate and view recent reports (original functionality)
 * - Programados: Create and manage scheduled/recurring reports
 * - Compartidos: Share reports with other teachers
 */
export default function TeacherReportsPage() {
  const { handleError } = useApiError();
  const [activeTab, setActiveTab] = useState<ReportsTab>('generator');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; full_name: string }>>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // TASK-2026-01-18-015 Sprint 4.2: Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; reportId: string | null; reportName: string }>({
    show: false,
    reportId: null,
    reportName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar aulas y datos iniciales
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar estudiantes cuando se selecciona un aula
  useEffect(() => {
    if (selectedClassroom) {
      loadStudents(selectedClassroom);
    }
  }, [selectedClassroom]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setHasError(false);

      // Cargar aulas usando classroomsApi service layer
      const classroomsResponse = await classroomsApi.getClassrooms();

      if (classroomsResponse.data) {
        const classroomsData = classroomsResponse.data.map((c) => ({ id: c.id, name: c.name }));
        setClassrooms(classroomsData);
        if (classroomsData.length > 0) {
          setSelectedClassroom(classroomsData[0].id);
        }
      }

      // Cargar reportes recientes
      await loadRecentReports();

      // Cargar estadísticas
      await loadReportStats();
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al cargar los datos iniciales');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classroomId: string) => {
    try {
      const response = await classroomsApi.getClassroomStudents(classroomId);

      if (response.data) {
        setStudents(response.data.map((s) => ({ id: s.id, full_name: s.full_name })));
      }
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al cargar la lista de estudiantes');
      setHasError(true);
      setStudents([]);
    }
  };

  const loadRecentReports = async () => {
    try {
      const reports = await reportsApi.getRecentReports();
      // Transform snake_case API response to camelCase frontend format
      const transformedReports = reports.map(transformReportMetadata);
      setRecentReports(transformedReports);
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al cargar los reportes recientes');
      setHasError(true);
      setRecentReports([]);
    }
  };

  const loadReportStats = async () => {
    try {
      const stats = await reportsApi.getReportStats();
      // Transform snake_case API response to camelCase frontend format
      const transformedStats = transformReportStats(stats);
      setReportStats(transformedStats);
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al cargar las estadisticas de reportes');
      setHasError(true);
      setReportStats(null);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const { blob } = await reportsApi.downloadReport(reportId);

      const report = recentReports.find((r) => r.id === reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name || 'report'}.${report?.format || 'pdf'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al descargar el reporte');
    }
  };

  // TASK-2026-01-18-015 Sprint 4.2: Delete report with confirmation
  const handleDeleteClick = (report: RecentReport) => {
    setDeleteConfirm({ show: true, reportId: report.id, reportName: report.name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.reportId) return;

    setIsDeleting(true);
    try {
      await reportsApi.deleteReport(deleteConfirm.reportId);

      // Remove from local state
      setRecentReports((prev) => prev.filter((r) => r.id !== deleteConfirm.reportId));

      // Refresh stats
      await loadReportStats();

      toast.success('Reporte eliminado correctamente.');
    } catch (error) {
      handleError(error as Parameters<typeof handleError>[0], 'Error al eliminar el reporte');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ show: false, reportId: null, reportName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, reportId: null, reportName: '' });
  };

  const filteredReports = recentReports.filter(
    (report) => filterType === 'all' || report.type === filterType,
  );

  if (loading) {
    return (
      <TeacherPageShell>
        <div className="flex min-h-screen items-center justify-center" aria-live="polite">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" aria-hidden="true" />
            <p className="text-detective-text-secondary">Cargando datos...</p>
          </div>
        </div>
      </TeacherPageShell>
    );
  }

  return (
    <TeacherPageShell>
    <div className="space-y-6 p-6">
      {/* Error Banner */}
        {hasError && (
          <div className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4" role="alert">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-semibold text-detective-text">Error de Conexión</p>
                <p className="text-sm text-detective-text-secondary">
                  No se pudieron cargar algunos datos del servidor. Verifica tu conexión e intenta nuevamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-detective-text">Reportes y Estadísticas</h1>
            <p className="text-detective-text-secondary">
              Genera reportes personalizados y analiza el desempeño de tus estudiantes
            </p>
          </div>
          {activeTab === 'generator' && (
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                loadRecentReports();
                loadReportStats();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </DetectiveButton>
          )}
        </div>

        {/* Tab Bar */}
        <TabBar<ReportsTab>
          tabs={reportsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab: Generador (existing content) */}
        {activeTab === 'generator' && (
          <div className="space-y-6" role="region" aria-label="Generador de reportes">

        {/* Stats Cards */}
        {reportStats && (
          <ReportsStatsCards
            totalReportsGenerated={reportStats.totalReportsGenerated}
            lastGeneratedDate={reportStats.lastGeneratedDate}
            mostUsedFormat={reportStats.mostUsedFormat}
            averageStudentsPerReport={reportStats.averageStudentsPerReport}
          />
        )}

        {/* Classroom Selector */}
        <ReportsFilterBar
          selectedClassroom={selectedClassroom}
          onClassroomChange={setSelectedClassroom}
          classrooms={classrooms}
        />

        {/* Report Generator */}
        {selectedClassroom && students.length > 0 && (
          <ReportGenerator classroomId={selectedClassroom} students={students} />
        )}

        {/* Recent Reports Section */}
        <RecentReportsTable
          reports={filteredReports}
          filterType={filterType}
          onFilterChange={setFilterType}
          onDownload={downloadReport}
          onDelete={handleDeleteClick}
          deleteConfirm={deleteConfirm}
          isDeleting={isDeleting}
          onConfirmDelete={confirmDelete}
          onCancelDelete={cancelDelete}
        />

        {/* Info Section */}
        <DetectiveCard className="border-detective-orange bg-detective-orange/5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-detective-orange p-3 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-detective-text">Tipos de Reportes Disponibles</h3>
              <ul className="space-y-2 text-sm text-detective-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-detective-orange">•</span>
                  <div>
                    <strong className="text-detective-text">Reporte de Progreso:</strong> Análisis
                    completo del progreso de estudiantes, incluyendo completitud por módulo, scores
                    promedio y tendencias.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-detective-orange">•</span>
                  <div>
                    <strong className="text-detective-text">Reporte de Evaluación:</strong>{' '}
                    Evaluación integral del rendimiento con scores finales, logros alcanzados y
                    recomendaciones.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-detective-orange">•</span>
                  <div>
                    <strong className="text-detective-text">Reporte de Intervención:</strong>{' '}
                    Identifica estudiantes que requieren atención especial, con alertas y acciones
                    de seguimiento.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-detective-orange">•</span>
                  <div>
                    <strong className="text-detective-text">Reporte Personalizado:</strong> Crea
                    reportes con métricas específicas según tus necesidades.
                  </div>
                </li>
              </ul>
              <p className="mt-4 text-sm text-detective-text-secondary">
                <strong className="text-detective-text">Formatos de exportación:</strong> PDF
                (lectura y presentación), Excel (análisis y manipulación de datos), CSV (integración
                con otras herramientas).
              </p>
            </div>
          </div>
        </DetectiveCard>

        {/* ML Analysis Info Card */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetectiveCard className="border-blue-500/30 bg-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500 p-3 text-white">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 font-bold text-detective-text">Análisis de Riesgo Incluido</h3>
                <p className="mb-3 text-sm text-detective-text-secondary">
                  Los reportes generados incluyen análisis de riesgo basado en datos históricos y
                  métricas de rendimiento. Estos cálculos ayudan a identificar estudiantes que
                  podrían necesitar intervención.
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-detective-text-secondary">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-detective-text">Nota:</span>
                  <span>Las predicciones actuales se basan en heurísticas simples</span>
                </div>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="border-purple-500/30 bg-purple-500/5">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-500 p-3 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-bold text-detective-text">
                  Análisis Predictivo Avanzado
                  <span className="rounded bg-purple-500 px-2 py-1 text-xs font-bold text-white">
                    PRÓXIMAMENTE
                  </span>
                </h3>
                <p className="text-sm text-detective-text-secondary">
                  Próximamente estará disponible análisis predictivo avanzado con Machine Learning,
                  incluyendo modelos de predicción de abandono, recomendaciones personalizadas
                  basadas en IA, y análisis de patrones de aprendizaje.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-detective-text-secondary">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">▸</span>
                    Modelos de ML entrenados con datos históricos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">▸</span>
                    Predicciones de rendimiento futuro
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">▸</span>
                    Recomendaciones de intervención automatizadas
                  </li>
                </ul>
              </div>
            </div>
          </DetectiveCard>
        </div>
          </div>
        )}

        {/* Tab: Programados (scheduled reports) */}
        {activeTab === 'scheduled' && (
          <ScheduledReportsTab classrooms={classrooms} />
        )}

        {/* Tab: Compartidos (shared reports) */}
        {activeTab === 'shared' && (
          <SharedReportsTab recentReports={recentReports} />
        )}
      </div>
    </TeacherPageShell>
  );
}
