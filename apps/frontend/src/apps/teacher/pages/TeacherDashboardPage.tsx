import { useState, lazy, Suspense } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { TabBar, type TabDefinition } from '@shared/components/base/TabBar';
import { SkeletonStats, SkeletonCard } from '@shared/components/loading';
import { EmptyState } from '@shared/components/feedback';
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
} from 'lucide-react';

// Sub-components
import { DashboardStatsSection } from '../components/dashboard/DashboardStatsSection';
import { DashboardClassroomsList } from '../components/dashboard/DashboardClassroomsList';
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

// Hooks
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { useClassrooms } from '../hooks/useClassrooms';
import { useDashboardData } from '../hooks/useDashboardData';

// Tab panel components (lazy-loaded for code splitting)
const StudentMonitoringPanel = lazy(() =>
  import('../components/monitoring/StudentMonitoringPanel').then(m => ({ default: m.StudentMonitoringPanel }))
);
const AssignmentCreator = lazy(() =>
  import('../components/assignments/AssignmentCreator').then(m => ({ default: m.AssignmentCreator }))
);
const ClassProgressDashboard = lazy(() =>
  import('../components/progress/ClassProgressDashboard').then(m => ({ default: m.ClassProgressDashboard }))
);
const InterventionAlertsPanel = lazy(() =>
  import('../components/alerts/InterventionAlertsPanel').then(m => ({ default: m.InterventionAlertsPanel }))
);
const LearningAnalyticsDashboard = lazy(() =>
  import('../components/analytics/LearningAnalyticsDashboard').then(m => ({ default: m.LearningAnalyticsDashboard }))
);
const PerformanceInsightsPanel = lazy(() =>
  import('../components/analytics/PerformanceInsightsPanel').then(m => ({ default: m.PerformanceInsightsPanel }))
);
const ReportGenerator = lazy(() =>
  import('../components/reports/ReportGenerator').then(m => ({ default: m.ReportGenerator }))
);
const ParentCommunicationHub = lazy(() =>
  import('../components/collaboration/ParentCommunicationHub').then(m => ({ default: m.ParentCommunicationHub }))
);
const ResourceSharingPanel = lazy(() =>
  import('../components/collaboration/ResourceSharingPanel').then(m => ({ default: m.ResourceSharingPanel }))
);

const TabLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />
  </div>
);

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

const DASHBOARD_TABS: TabDefinition<TabType>[] = [
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

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { classrooms, loading: classroomsLoading } = useClassrooms();
  const { stats, activities, alerts, loading, error, refresh } = useTeacherDashboard();
  const {
    allStudents,
    upcomingDeadlines,
    upcomingLoading,
    selectedClassroomId,
    setSelectedClassroomId,
  } = useDashboardData(classrooms);

  return (
    <TeacherPageShell>
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <main className="detective-container py-8">
        <DashboardClassroomsList
          classrooms={classrooms}
          classroomsLoading={classroomsLoading}
          selectedClassroomId={selectedClassroomId}
          onClassroomChange={setSelectedClassroomId}
          loading={loading}
          error={error}
          onRefresh={refresh}
        />

        {loading && (
          <div className="space-y-6" aria-live="polite" aria-label="Cargando datos del dashboard">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <SkeletonStats count={4} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SkeletonCard variant="large" />
              <SkeletonCard variant="large" />
            </div>
          </div>
        )}

        {error && !loading && (
          <DetectiveCard variant="danger">
            <div className="flex items-start gap-4" role="alert">
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

        {!loading && !error && (
          <>
            <div className="mb-8 overflow-x-auto">
              <TabBar<TabType>
                tabs={DASHBOARD_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="detective-pills"
                className="min-w-max pb-2"
              />
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6" role="region" aria-label="Vista general del dashboard">
                <DashboardStatsSection stats={stats} alerts={alerts} onTabChange={setActiveTab} />
                <DashboardRecentActivity
                  activities={activities}
                  upcomingDeadlines={upcomingDeadlines}
                  upcomingLoading={upcomingLoading}
                />
              </div>
            )}

            {activeTab === 'monitoring' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <StudentMonitoringPanel classroomId={selectedClassroomId} />
              </Suspense>
            )}
            {activeTab === 'assignments' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <AssignmentCreator classroomId={selectedClassroomId} />
              </Suspense>
            )}
            {activeTab === 'progress' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <ClassProgressDashboard classroomId={selectedClassroomId} />
              </Suspense>
            )}
            {activeTab === 'alerts' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <InterventionAlertsPanel classroomId={selectedClassroomId} />
              </Suspense>
            )}
            {activeTab === 'analytics' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <LearningAnalyticsDashboard classroomId={selectedClassroomId} />
              </Suspense>
            )}
            {activeTab === 'insights' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <PerformanceInsightsPanel classroomId={selectedClassroomId} students={allStudents} />
              </Suspense>
            )}
            {activeTab === 'reports' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <ReportGenerator classroomId={selectedClassroomId} students={allStudents} />
              </Suspense>
            )}
            {activeTab === 'communication' && selectedClassroomId && (
              <Suspense fallback={<TabLoadingFallback />}>
                <ParentCommunicationHub classroomId={selectedClassroomId} students={allStudents} />
              </Suspense>
            )}

            {!selectedClassroomId && activeTab !== 'overview' && activeTab !== 'resources' && (
              <DetectiveCard>
                <EmptyState
                  icon={Users}
                  title="Selecciona una Clase"
                  description="Por favor, selecciona una clase del menu superior para ver esta seccion"
                />
              </DetectiveCard>
            )}

            {activeTab === 'resources' && (
              <Suspense fallback={<TabLoadingFallback />}>
                <ResourceSharingPanel />
              </Suspense>
            )}
          </>
        )}
      </main>
    </div>
    </TeacherPageShell>
  );
}
