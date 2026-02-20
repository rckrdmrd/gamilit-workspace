import { useState, useEffect } from 'react';
import { safeFormatNumber } from '@shared/utils/format.util';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { SkeletonStats, SkeletonCard } from '@shared/components/loading';
import { EmptyState } from '@shared/components/feedback';
import { useApiError } from '@shared/hooks';
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  BarChart3,
  FileText,
  MessageSquare,
  Share2,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';

// Import components
import { StudentMonitoringPanel } from '../components/monitoring/StudentMonitoringPanel';
import { AssignmentCreator } from '../components/assignments/AssignmentCreator';
import { ClassProgressDashboard } from '../components/progress/ClassProgressDashboard';
import { InterventionAlertsPanel } from '../components/alerts/InterventionAlertsPanel';
import { LearningAnalyticsDashboard } from '../components/analytics/LearningAnalyticsDashboard';
import { PerformanceInsightsPanel } from '../components/analytics/PerformanceInsightsPanel';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { ParentCommunicationHub } from '../components/collaboration/ParentCommunicationHub';
import { ResourceSharingPanel } from '../components/collaboration/ResourceSharingPanel';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { useClassrooms } from '../hooks/useClassrooms';
import { classroomsApi, assignmentsApi } from '@services/api/teacher';
import type { UpcomingAssignment } from '@services/api/teacher/assignmentsApi';
import type { StudentMonitoring } from '../types';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

type TabType =
  | 'overview'
  | 'monitoring'
  | 'assignments'
  | 'progress'
  | 'alerts'
  | 'analytics'
  | 'insights'
  | 'reports'
  | 'communication'
  | 'resources';


export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [allStudents, setAllStudents] = useState<StudentMonitoring[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingAssignment[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const handleError = useApiError();

  // Fetch real classrooms from backend
  const { classrooms, loading: classroomsLoading } = useClassrooms();

  // Set first classroom as default when classrooms load
  useEffect(() => {
    if (classrooms && classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classrooms]);

  // Use real data from backend via useTeacherDashboard hook
  const { stats, activities, alerts, loading, error, refresh } = useTeacherDashboard();

  useEffect(() => {
    let isMounted = true;

    const fetchAllStudents = async () => {
      if (!classrooms || classrooms.length === 0) {
        if (isMounted) {
          setAllStudents([]);
        }
        return;
      }

      try {
        const studentsPromises = classrooms.map((classroom) =>
          classroomsApi.getClassroomStudents(classroom.id),
        );
        const studentsArrays = await Promise.all(studentsPromises);
        const students = studentsArrays.flatMap((response) => response.data);

        if (isMounted) {
          setAllStudents(students);
        }
      } catch (err) {
        handleError(err as Parameters<typeof handleError>[0], 'Error al cargar estudiantes');
        if (isMounted) {
          setAllStudents([]);
        }
      }
    };

    fetchAllStudents();

    return () => {
      isMounted = false;
    };
  }, [classrooms]);

  // BAJO-008: Fetch upcoming assignments with deadlines
  useEffect(() => {
    let isMounted = true;

    const fetchUpcomingDeadlines = async () => {
      setUpcomingLoading(true);
      try {
        const upcoming = await assignmentsApi.getUpcomingAssignments(7);
        if (isMounted) {
          setUpcomingDeadlines(upcoming);
        }
      } catch (err) {
        handleError(err as Parameters<typeof handleError>[0], 'Error al cargar fechas limite');
        if (isMounted) {
          setUpcomingDeadlines([]);
        }
      } finally {
        if (isMounted) {
          setUpcomingLoading(false);
        }
      }
    };

    fetchUpcomingDeadlines();

    return () => {
      isMounted = false;
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: Target },
    { id: 'monitoring', label: 'Monitoreo', icon: Users },
    { id: 'assignments', label: 'Asignaciones', icon: Calendar },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Award },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'communication', label: 'Comunicación', icon: MessageSquare },
    { id: 'resources', label: 'Recursos', icon: Share2 },
  ];

  return (
    <TeacherPageShell>
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <main className="detective-container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-detective-text">
                Dashboard del Profesor
              </h1>
              <p className="text-detective-text-secondary">
                Gestiona tu aula, monitorea estudiantes y genera analíticas avanzadas
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Classroom Selector */}
              {!classroomsLoading && classrooms && classrooms.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="border-detective-border cursor-pointer appearance-none rounded-lg border bg-detective-bg-secondary px-4 py-2 pr-10 text-detective-text focus:border-detective-orange focus:outline-none"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name || `Clase ${classroom.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-detective-text-secondary" />
                </div>
              )}
              {!loading && !error && (
                <DetectiveButton
                  onClick={refresh}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </DetectiveButton>
              )}
            </div>
          </div>
        </div>

        {/* Empty Classrooms State — H-02 FIX */}
        {!classroomsLoading && (!classrooms || classrooms.length === 0) && (
          <DetectiveCard>
            <EmptyState
              icon={AlertCircle}
              title="No hay aulas asignadas"
              description="No tienes aulas asignadas actualmente. Contacta al administrador para que te asigne un aula, o crea una nueva desde el panel de administracion."
            />
          </DetectiveCard>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <SkeletonStats count={4} />
            </div>
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SkeletonCard variant="large" />
              <SkeletonCard variant="large" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <DetectiveCard variant="danger">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-detective-text">
                  Error al cargar datos
                </h3>
                <p className="mb-4 text-detective-text-secondary">
                  No se pudieron cargar los datos del dashboard. Por favor, intenta nuevamente.
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

        {/* Main Content - only show when data is loaded */}
        {!loading && !error && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex min-w-max gap-2 pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-detective-orange text-white shadow-lg'
                          : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-detective-text-secondary">Estudiantes</p>
                        <p className="text-3xl font-bold text-detective-text">
                          {stats?.active_students ?? 0}/{stats?.total_students ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-detective-text-secondary">Activos hoy</p>
                      </div>
                      <Users className="h-10 w-10 text-detective-orange" />
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-detective-text-secondary">Score Promedio</p>
                        <p className="text-3xl font-bold text-detective-gold">
                          {safeFormatNumber(stats?.average_score, 1, '%', 'N/A')}
                        </p>
                        <p className="mt-1 text-xs text-green-500">
                          {/* Engagement calculated from active/total students */}
                          {stats?.total_students && stats.total_students > 0
                            ? `${Math.round((stats.active_students / stats.total_students) * 100)}% engagement`
                            : 'N/A'}
                        </p>
                      </div>
                      <Award className="h-10 w-10 text-detective-gold" />
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-detective-text-secondary">
                          Tasa de Completitud
                        </p>
                        <p className="text-3xl font-bold text-detective-text">
                          {safeFormatNumber(stats?.average_completion, 0, '%', '0%')}
                        </p>
                        <p className="mt-1 text-xs text-detective-text-secondary">De ejercicios</p>
                      </div>
                      <Target className="text-detective-accent h-10 w-10" />
                    </div>
                  </DetectiveCard>

                  <DetectiveCard hoverable={false}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-sm text-detective-text-secondary">
                          Pendientes de Revisión
                        </p>
                        <p className="text-3xl font-bold text-red-500">
                          {alerts?.length ?? stats?.total_submissions_pending ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-detective-text-secondary">
                          {stats?.students_at_risk ? `${stats.students_at_risk} en riesgo` : 'Requieren atención'}
                        </p>
                      </div>
                      <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                  </DetectiveCard>
                </div>

                {/* Quick Actions */}
                <DetectiveCard>
                  <h3 className="mb-4 text-xl font-bold text-detective-text">Acciones Rápidas</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <DetectiveButton onClick={() => setActiveTab('monitoring')} variant="secondary">
                      <Users className="h-5 w-5" />
                      Ver Estudiantes
                    </DetectiveButton>
                    <DetectiveButton
                      onClick={() => setActiveTab('assignments')}
                      variant="secondary"
                    >
                      <Calendar className="h-5 w-5" />
                      Nueva Asignación
                    </DetectiveButton>
                    <DetectiveButton onClick={() => setActiveTab('alerts')} variant="secondary">
                      <AlertTriangle className="h-5 w-5" />
                      Ver Alertas
                    </DetectiveButton>
                    <DetectiveButton onClick={() => setActiveTab('reports')} variant="secondary">
                      <FileText className="h-5 w-5" />
                      Generar Reporte
                    </DetectiveButton>
                  </div>
                </DetectiveCard>

                {/* Recent Activity Preview */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <DetectiveCard>
                    <h3 className="mb-4 text-lg font-bold text-detective-text">
                      Actividad Reciente
                    </h3>
                    {activities && activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities
                          .filter((activity) => activity && activity.id && activity.timestamp)
                          .slice(0, 5)
                          .map((activity) => {
                            // Determine icon based on activity type
                            // Activity types: 'submission' | 'assignment_created' | 'student_joined' | 'achievement_unlocked'
                            const getIcon = () => {
                              if (activity.type === 'submission')
                                return <FileText className="mt-1 h-5 w-5 text-green-500" />;
                              if (activity.type === 'achievement_unlocked')
                                return <Award className="mt-1 h-5 w-5 text-detective-gold" />;
                              if (activity.type === 'assignment_created')
                                return <Calendar className="mt-1 h-5 w-5 text-blue-500" />;
                              if (activity.type === 'student_joined')
                                return <Users className="text-detective-accent mt-1 h-5 w-5" />;
                              return <Calendar className="text-detective-accent mt-1 h-5 w-5" />;
                            };

                            // Safely format timestamp
                            const formatTimestamp = (timestamp: string) => {
                              try {
                                return new Date(timestamp).toLocaleString('es-ES', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });
                              } catch (_e) {
                                return timestamp; // Fallback to raw value if parsing fails
                              }
                            };

                            return (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3 rounded-lg bg-detective-bg-secondary p-3"
                              >
                                {getIcon()}
                                <div className="flex-1">
                                  <p className="text-sm text-detective-text">
                                    {activity.description}
                                  </p>
                                  <p className="text-xs text-detective-text-secondary">
                                    {formatTimestamp(activity.timestamp)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No hay actividad reciente"
                        className="py-8"
                      />
                    )}
                  </DetectiveCard>

                  <DetectiveCard>
                    <h3 className="mb-4 text-lg font-bold text-detective-text">
                      Próximas Fechas Límite
                    </h3>
                    {upcomingLoading ? (
                      <div className="space-y-3">
                        <SkeletonCard variant="small" />
                        <SkeletonCard variant="small" />
                      </div>
                    ) : upcomingDeadlines.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingDeadlines.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-start gap-3 rounded-lg bg-detective-bg-secondary p-3"
                          >
                            <Calendar className="mt-1 h-5 w-5 text-detective-orange" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-detective-text">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-detective-text-secondary">
                                {assignment.daysRemaining === 0
                                  ? 'Vence hoy'
                                  : assignment.daysRemaining === 1
                                    ? 'Vence mañana'
                                    : `Vence en ${assignment.daysRemaining} días`}
                              </p>
                              <p className="text-xs text-detective-text-secondary">
                                {assignment.submittedCount}/{assignment.totalStudents} estudiantes
                                completaron
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No hay fechas limite proximas"
                        className="py-8"
                      />
                    )}
                  </DetectiveCard>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && selectedClassroomId && (
              <StudentMonitoringPanel classroomId={selectedClassroomId} />
            )}

            {activeTab === 'assignments' && selectedClassroomId && (
              <AssignmentCreator classroomId={selectedClassroomId} />
            )}

            {activeTab === 'progress' && selectedClassroomId && (
              <ClassProgressDashboard classroomId={selectedClassroomId} />
            )}

            {activeTab === 'alerts' && selectedClassroomId && (
              <InterventionAlertsPanel classroomId={selectedClassroomId} />
            )}

            {activeTab === 'analytics' && selectedClassroomId && (
              <LearningAnalyticsDashboard classroomId={selectedClassroomId} />
            )}

            {activeTab === 'insights' && selectedClassroomId && (
              <PerformanceInsightsPanel classroomId={selectedClassroomId} students={allStudents} />
            )}

            {activeTab === 'reports' && selectedClassroomId && (
              <ReportGenerator classroomId={selectedClassroomId} students={allStudents} />
            )}

            {activeTab === 'communication' && selectedClassroomId && (
              <ParentCommunicationHub classroomId={selectedClassroomId} students={allStudents} />
            )}

            {/* No Classroom Selected State */}
            {!selectedClassroomId && activeTab !== 'overview' && activeTab !== 'resources' && (
              <DetectiveCard>
                <EmptyState
                  icon={Users}
                  title="Selecciona una Clase"
                  description="Por favor, selecciona una clase del menu superior para ver esta seccion"
                />
              </DetectiveCard>
            )}

            {activeTab === 'resources' && <ResourceSharingPanel />}
          </>
        )}
      </main>
    </div>
    </TeacherPageShell>
  );
}
