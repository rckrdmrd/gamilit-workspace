import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Filter,
  ChevronDown,
  RefreshCw,
  Lock,
  Info,
} from 'lucide-react';
import type { ReportType, ReportFormat } from '../types';
import axiosInstance from '@services/api/axios.instance';
import { API_ENDPOINTS } from '@/config/api.config';

interface RecentReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  studentCount: number;
  period: string;
  size: string;
}

interface ReportStats {
  totalReportsGenerated: number;
  lastGeneratedDate: string;
  mostUsedFormat: ReportFormat;
  averageStudentsPerReport: number;
}

/**
 * TeacherReportsPage - Página de reportes y estadísticas
 *
 * Permite generar reportes personalizados con diferentes plantillas,
 * configurar rangos de fechas, seleccionar estudiantes y exportar
 * en múltiples formatos (PDF, Excel, CSV).
 */
export default function TeacherReportsPage() {
  const { user, logout } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; full_name: string }>>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || 'mock-teacher-id',
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

  // Cargar aulas y datos iniciales
  useEffect(() => {
    loadInitialData();
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
      const classroomsResponse = await axiosInstance.get(API_ENDPOINTS.teacher.classrooms);

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
      const response = await axiosInstance.get(
        API_ENDPOINTS.teacher.classroomStudents(classroomId),
      );

      if (response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback con datos mock
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
      const response = await axiosInstance.get(API_ENDPOINTS.teacher.reports.recent);
      setRecentReports(response.data);
    } catch (error) {
      console.error('Error loading recent reports:', error);
      // Fallback con datos mock
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
      const response = await axiosInstance.get(API_ENDPOINTS.teacher.reports.stats);
      setReportStats(response.data);
    } catch (error) {
      console.error('Error loading report stats:', error);
      // Fallback con datos mock
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
      const response = await axiosInstance.get(API_ENDPOINTS.teacher.reports.download(reportId), {
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
      alert('Error al descargar el reporte. Por favor, intenta nuevamente.');
    }
  };

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      progress: 'Progreso',
      evaluation: 'Evaluación',
      intervention: 'Intervención',
      custom: 'Personalizado',
    };
    return labels[type];
  };

  const getReportTypeColor = (type: ReportType): string => {
    const colors: Record<ReportType, string> = {
      progress: 'bg-detective-orange text-white',
      evaluation: 'bg-detective-gold text-detective-text',
      intervention: 'bg-red-500 text-white',
      custom: 'bg-detective-accent text-white',
    };
    return colors[type];
  };

  const getFormatIcon = (format: ReportFormat): string => {
    const icons: Record<ReportFormat, string> = {
      pdf: 'PDF',
      excel: 'XLSX',
      csv: 'CSV',
    };
    return icons[format];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const filteredReports = recentReports.filter(
    (report) => filterType === 'all' || report.type === filterType,
  );

  if (loading) {
    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName="GLIT Platform"
        onLogout={handleLogout}
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">Cargando datos...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <div className="space-y-6 p-6">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-detective-orange" />
              <h2 className="text-2xl font-bold text-detective-text">Reportes Recientes</h2>
            </div>
            <DetectiveButton variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filtrar
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </DetectiveButton>
          </div>

          {/* Filters */}
          {showFilters && (
            <DetectiveCard>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-detective-orange text-white'
                      : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
                  }`}
                >
                  Todos
                </button>
                {(['progress', 'evaluation', 'intervention', 'custom'] as ReportType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                        filterType === type
                          ? 'bg-detective-orange text-white'
                          : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
                      }`}
                    >
                      {getReportTypeLabel(type)}
                    </button>
                  ),
                )}
              </div>
            </DetectiveCard>
          )}

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <DetectiveCard>
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary opacity-50" />
                <p className="text-lg text-detective-text-secondary">
                  {filterType === 'all'
                    ? 'No hay reportes generados aún'
                    : `No hay reportes de tipo "${getReportTypeLabel(filterType as ReportType)}"`}
                </p>
                <p className="mt-2 text-sm text-detective-text-secondary">
                  Genera tu primer reporte usando el formulario anterior
                </p>
              </div>
            </DetectiveCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => (
                <DetectiveCard
                  key={report.id}
                  className="transition-colors hover:border-detective-orange"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="rounded-lg bg-detective-bg-secondary p-3">
                        <FileText className="h-6 w-6 text-detective-orange" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-bold text-detective-text">{report.name}</h3>
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${getReportTypeColor(
                              report.type,
                            )}`}
                          >
                            {getReportTypeLabel(report.type)}
                          </span>
                          <span className="rounded bg-detective-bg-secondary px-2 py-1 text-xs font-bold text-detective-text">
                            {getFormatIcon(report.format)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {report.period}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.studentCount} estudiantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(report.generatedAt)}
                          </span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <DetectiveButton variant="primary" onClick={() => downloadReport(report.id)}>
                      <Download className="h-4 w-4" />
                      Descargar
                    </DetectiveButton>
                  </div>
                </DetectiveCard>
              ))}
            </div>
          )}
        </div>

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
    </TeacherLayout>
  );
}
