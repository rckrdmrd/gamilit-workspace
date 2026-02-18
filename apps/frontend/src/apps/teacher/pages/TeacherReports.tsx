import { useState, useEffect } from 'react';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { RecentReportsTable, formatDate } from '../components/reports/RecentReportsTable';
import type { RecentReport } from '../components/reports/RecentReportsTable';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import toast from 'react-hot-toast';
import {
  FileText,
  Calendar,
  TrendingUp,
  Users,
  RefreshCw,
  Lock,
  Info,
} from 'lucide-react';
import type { ReportType, ReportFormat } from '../types';
import { apiClient } from '@services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

interface ReportStats {
  totalReportsGenerated: number;
  lastGeneratedDate: string;
  mostUsedFormat: ReportFormat;
  averageStudentsPerReport: number;
}

// API response interfaces (snake_case from backend)
interface ApiReportMetadata {
  id: string;
  report_name: string;
  report_type: string;
  report_format: string;
  student_count: number;
  period_start: string | null;
  period_end: string | null;
  generated_at: string;
  file_size_bytes?: number; // TASK-2026-01-18-015 Sprint 4.1: File size from backend
}

/**
 * TASK-2026-01-18-015 Sprint 4.1: Format file size in human-readable format
 */
const formatFileSize = (bytes?: number): string => {
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

interface ApiReportStats {
  total_reports_generated: number;
  last_generated_date: string | null;
  most_used_format: string | null;
  avg_students_per_report: number;
}

// Transform API response to frontend format
const transformReportMetadata = (data: ApiReportMetadata): RecentReport => {
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

/**
 * TeacherReportsPage - Página de reportes y estadísticas
 *
 * Permite generar reportes personalizados con diferentes plantillas,
 * configurar rangos de fechas, seleccionar estudiantes y exportar
 * en múltiples formatos (PDF, Excel, CSV).
 */
export default function TeacherReportsPage() {
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; full_name: string }>>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
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

      // Cargar aulas usando API configurada
      const classroomsResponse = await apiClient.get(API_ENDPOINTS.teacher.classrooms);

      if (classroomsResponse.data) {
        const classroomsData = classroomsResponse.data;
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
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classroomId: string) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.teacher.classroomStudents(classroomId),
      );

      if (response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback con datos mock - indicar al usuario
      setIsUsingMockData(true);
      setStudents([
        { id: '1', full_name: 'Ana García Pérez' },
        { id: '2', full_name: 'Carlos Rodríguez López' },
        { id: '3', full_name: 'María Fernández Sánchez' },
        { id: '4', full_name: 'Juan Martínez González' },
        { id: '5', full_name: 'Laura Torres Ruiz' },
      ]);
    }
  };

  const loadRecentReports = async () => {
    try {
      const response = await apiClient.get<ApiReportMetadata[]>(
        API_ENDPOINTS.teacher.reports.recent,
      );
      // Transform snake_case API response to camelCase frontend format
      const transformedReports = response.data.map(transformReportMetadata);
      setRecentReports(transformedReports);
    } catch (error) {
      console.error('Error loading recent reports:', error);
      // Fallback con datos mock - indicar al usuario
      setIsUsingMockData(true);
      setRecentReports([
        {
          id: '1',
          name: 'Reporte de Progreso Mensual - Octubre 2024',
          type: 'progress',
          format: 'pdf',
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          studentCount: 25,
          period: '01 Oct - 31 Oct 2024',
          size: '2.4 MB',
        },
        {
          id: '2',
          name: 'Evaluación Final - Grupo A',
          type: 'evaluation',
          format: 'excel',
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          studentCount: 30,
          period: '01 Sep - 30 Sep 2024',
          size: '1.8 MB',
        },
        {
          id: '3',
          name: 'Reporte de Intervención - Estudiantes en Riesgo',
          type: 'intervention',
          format: 'pdf',
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          studentCount: 8,
          period: '15 Oct - 22 Oct 2024',
          size: '890 KB',
        },
      ]);
    }
  };

  const loadReportStats = async () => {
    try {
      const response = await apiClient.get<ApiReportStats>(API_ENDPOINTS.teacher.reports.stats);
      // Transform snake_case API response to camelCase frontend format
      const transformedStats = transformReportStats(response.data);
      setReportStats(transformedStats);
    } catch (error) {
      console.error('Error loading report stats:', error);
      // Fallback con datos mock - indicar al usuario
      setIsUsingMockData(true);
      setReportStats({
        totalReportsGenerated: 47,
        lastGeneratedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mostUsedFormat: 'pdf',
        averageStudentsPerReport: 22,
      });
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.teacher.reports.download(reportId), {
        responseType: 'blob',
      });

      const blob = response.data;
      const report = recentReports.find((r) => r.id === reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name || 'report'}.${report?.format || 'pdf'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el reporte. Por favor, intenta nuevamente.');
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
      await apiClient.delete(API_ENDPOINTS.teacher.reports.delete(deleteConfirm.reportId));

      // Remove from local state
      setRecentReports((prev) => prev.filter((r) => r.id !== deleteConfirm.reportId));

      // Refresh stats
      await loadReportStats();

      toast.success('Reporte eliminado correctamente.');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte. Por favor, intenta nuevamente.');
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" />
          <p className="text-detective-text-secondary">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Mock Data Warning Banner */}
        {isUsingMockData && (
          <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Datos de Demostración</p>
                <p className="text-sm text-yellow-700">
                  No se pudo conectar al servidor. Mostrando datos de ejemplo que no reflejan información real.
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
        </div>

        {/* Stats Cards */}
        {reportStats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DetectiveCard>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-detective-orange bg-opacity-10 p-3">
                  <FileText className="h-6 w-6 text-detective-orange" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Total Generados</p>
                  <p className="text-2xl font-bold text-detective-text">
                    {reportStats.totalReportsGenerated}
                  </p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500 bg-opacity-10 p-3">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Último Reporte</p>
                  <p className="text-lg font-bold text-detective-text">
                    {formatDate(reportStats.lastGeneratedDate)}
                  </p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard>
              <div className="flex items-center gap-3">
                <div className="bg-detective-accent rounded-lg bg-opacity-10 p-3">
                  <TrendingUp className="text-detective-accent h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Formato Preferido</p>
                  <p className="text-lg font-bold uppercase text-detective-text">
                    {reportStats.mostUsedFormat}
                  </p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-detective-gold bg-opacity-10 p-3">
                  <Users className="h-6 w-6 text-detective-gold" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Promedio Estudiantes</p>
                  <p className="text-2xl font-bold text-detective-text">
                    {reportStats.averageStudentsPerReport}
                  </p>
                </div>
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Classroom Selector */}
        <DetectiveCard>
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6 text-detective-orange" />
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-detective-text">
                Selecciona un Aula
              </label>
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="w-full rounded-lg border border-detective-orange bg-detective-bg-secondary px-4 py-2 text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
              >
                {classrooms.length === 0 ? (
                  <option value="">No hay aulas disponibles</option>
                ) : (
                  classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </DetectiveCard>

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
        <DetectiveCard className="border-detective-orange bg-detective-orange bg-opacity-5">
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
          <DetectiveCard className="border-blue-500 bg-blue-500 bg-opacity-5">
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
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600">
                  <Info className="h-4 w-4" />
                  <span className="font-semibold">Nota:</span>
                  <span>Las predicciones actuales se basan en heurísticas simples</span>
                </div>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard className="border-purple-500 bg-purple-500 bg-opacity-5">
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
  );
}
