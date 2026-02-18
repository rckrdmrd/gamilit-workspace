import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/app/providers/AuthContext';
import { BrandingProvider } from '@/app/providers/BrandingProvider';
import { ProtectedRoute, UnauthorizedPage } from '@/shared/components/ProtectedRoute';

// =====================================================
// PUBLIC PAGES (Static imports - critical path)
// =====================================================
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import PasswordResetPage from '@/apps/student/pages/PasswordResetPage';
import EmailVerificationPage from '@/apps/student/pages/EmailVerificationPage';
import NotFoundPage from '@/apps/student/pages/NotFoundPage';

// =====================================================
// LOADING FALLBACK COMPONENT
// =====================================================
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  </div>
);

// =====================================================
// STUDENT PORTAL PAGES (Lazy loaded)
// =====================================================
const DashboardComplete = lazy(() => import('@/apps/student/pages/DashboardComplete'));
const MyProgressPage = lazy(() => import('@/pages/MyProgressPage').then(m => ({ default: m.MyProgressPage })));
const ModuleDetailsPage = lazy(() => import('@/pages/ModuleDetailsPage').then(m => ({ default: m.ModuleDetailsPage })));
const AchievementsPage = lazy(() => import('@/apps/student/pages/AchievementsPage'));
const LeaderboardPage = lazy(() => import('@/apps/student/pages/LeaderboardPage'));
const SettingsPage = lazy(() => import('@/apps/student/pages/SettingsPage'));
const MissionsPage = lazy(() => import('@/apps/student/pages/MissionsPage'));
const ExercisePage = lazy(() => import('@/apps/student/pages/ExercisePage'));
const FriendsPage = lazy(() => import('@/apps/student/pages/FriendsPage'));
const ShopPage = lazy(() => import('@/apps/student/pages/ShopPage'));
const InventoryPage = lazy(() => import('@/apps/student/pages/InventoryPage'));
const GuildsPage = lazy(() => import('@/apps/student/pages/GuildsPage'));
const ModuleDetailPage = lazy(() => import('@/apps/student/pages/ModuleDetailPage'));
const EnhancedProfilePage = lazy(() => import('@/apps/student/pages/EnhancedProfilePage'));
const NotificationPreferencesPage = lazy(() => import('@/apps/student/pages/NotificationPreferencesPage').then(m => ({ default: m.NotificationPreferencesPage })));
const DeviceManagementSection = lazy(() => import('@/apps/student/pages/DeviceManagementSection').then(m => ({ default: m.DeviceManagementSection })));
const NotificationsPage = lazy(() => import('@/apps/student/pages/NotificationsPage'));
const AssignmentsPage = lazy(() => import('@/apps/student/pages/AssignmentsPage'));
const AssignmentDetailPage = lazy(() => import('@/apps/student/pages/AssignmentDetailPage'));
const LearningPage = lazy(() => import('@/apps/student/pages/LearningPage'));

// =====================================================
// TEACHER PORTAL PAGES (Lazy loaded with HOC)
// =====================================================
import { withTeacherLayout } from '@/apps/teacher/components/withTeacherLayout';

// Pages using withTeacherLayout HOC (consolidated from *Page.tsx wrappers)
const TeacherDashboardPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherDashboard').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherAnalyticsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherAnalytics').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherAssignmentsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherAssignments').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherClassesPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherClasses').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherGamificationPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherGamification').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherStudentsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherStudents').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);

// Pages using withTeacherLayout HOC (migrated from separate wrapper files)
const TeacherAlertsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherAlerts').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
// TeacherCommunication — removed from navigation (Obs #18), code preserved
// TeacherContent — removed from navigation (Obs #5), code preserved
const TeacherMonitoringPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherMonitoring').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherProgressPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherProgress').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherReportsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherReports').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherExerciseResponsesPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherExerciseResponses').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
const TeacherSettingsPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherSettings').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);
// TeacherNotifications — removed from navigation (Obs #19), code preserved
// TeacherNotificationPreferences — removed from navigation (Obs #19), code preserved
const TeacherAlertConfigPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherAlertConfig').then(m => ({
    default: withTeacherLayout(m.default)
  }))
); // US-PM-007
const ReviewPanelPage = lazy(() =>
  import('@/apps/teacher/pages/TeacherReviewPanel').then(m => ({
    default: withTeacherLayout(m.default)
  }))
);

// =====================================================
// ADMIN PORTAL PAGES (Lazy loaded)
// =====================================================
const AdminDashboardPage = lazy(() => import('@/apps/admin/pages/AdminDashboardPage'));
const AdminInstitutionsPage = lazy(() => import('@/apps/admin/pages/AdminInstitutionsPage'));
const AdminUsersPage = lazy(() => import('@/apps/admin/pages/AdminUsersPage'));
const AdminRolesPage = lazy(() => import('@/apps/admin/pages/AdminRolesPage'));
const AdminContentPage = lazy(() => import('@/apps/admin/pages/AdminContentPage'));
const AdminGamificationPage = lazy(() => import('@/apps/admin/pages/AdminGamificationPage'));
const AdminMonitoringPage = lazy(() => import('@/apps/admin/pages/AdminMonitoringPage'));
const AdminAdvancedPage = lazy(() => import('@/apps/admin/pages/AdminAdvancedPage'));
const AdminReportsPage = lazy(() => import('@/apps/admin/pages/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('@/apps/admin/pages/AdminSettingsPage'));
const AdminNotificationsPage = lazy(() => import('@/apps/admin/pages/AdminNotificationsPage'));
const AdminNotificationPreferencesPage = lazy(() => import('@/apps/admin/pages/AdminNotificationPreferencesPage'));
const AdminAlertsPage = lazy(() => import('@/apps/admin/pages/AdminAlertsPage'));
const AdminAnalyticsPage = lazy(() => import('@/apps/admin/pages/AdminAnalyticsPage'));
const AdminProgressPage = lazy(() => import('@/apps/admin/pages/AdminProgressPage'));
const AdminClassroomTeacherPage = lazy(() => import('@/apps/admin/pages/AdminClassroomTeacherPage'));
const AdminAssignmentsPage = lazy(() => import('@/apps/admin/pages/AdminAssignmentsPage'));
const AdminAuditLogsPage = lazy(() => import('@/apps/admin/pages/AdminAuditLogsPage'));
const AdminBrandingPage = lazy(() => import('@/features/admin/branding/BrandingSettingsPage'));
const AdminLtiPage = lazy(() => import('@/features/admin/lti/AdminLtiPage'));
const AdminExerciseCreatePage = lazy(() => import('@/apps/admin/pages/AdminExerciseCreatePage'));

// =====================================================
// PARENT PORTAL PAGES (Lazy loaded) - EXT-011
// =====================================================
const ParentLoginPage = lazy(() => import('@/apps/parent/pages/ParentLoginPage'));
const ParentRegisterPage = lazy(() => import('@/apps/parent/pages/ParentRegisterPage'));
const ParentDashboardPage = lazy(() => import('@/apps/parent/pages/ParentDashboardPage'));
const ChildProgressPage = lazy(() => import('@/apps/parent/pages/ChildProgressPage'));

/**
 * App Component
 * Main application component with routing and authentication
 *
 * Routes:
 * - / : Redirects to /dashboard
 * - /dashboard : Protected dashboard page
 * - /progress : User progress page
 * - /progress/modules/:moduleId : Module details page
 * - /achievements : Achievements page with filtering and claiming
 * - /leaderboard : Leaderboard page with global/school/classroom tabs
 *
 * TODO: Add more routes:
 * - /register : Registration page
 * - /exercises/:exerciseId/player : Exercise player page
 * - /missions : Missions page
 * - /learning : Learning page
 * - /profile : User profile page
 * - /settings : Settings page
 */
function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* ===== STUDENT PORTAL ===== */}
              {/* Dashboard (protected) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardComplete />
                  </ProtectedRoute>
                }
              />

              {/* Learning Hub */}
              <Route
                path="/learning"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <LearningPage />
                  </ProtectedRoute>
                }
              />

              {/* ===== TEACHER PORTAL ===== */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/alerts"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              {/* /teacher/communication — removed from navigation (Obs #18) */}

              <Route
                path="/teacher/gamification"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherGamificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/monitoring"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/progress"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/responses"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherExerciseResponsesPage />
                  </ProtectedRoute>
                }
              />
              {/* DEPRECADO (2026-01-25): /teacher/resources eliminado
              La funcionalidad de recursos multimedia se integró en TeacherContentPage.
              Redirect mantenido por compatibilidad con URLs existentes. */}
              <Route
                path="/teacher/resources"
                element={<Navigate to="/teacher/dashboard" replace />}
              />
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherClassesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherSettingsPage />
                  </ProtectedRoute>
                }
              />
              {/* /teacher/notifications — removed from navigation (Obs #19) */}
              {/* /teacher/settings/notifications — removed from navigation (Obs #19) */}
              {/* US-PM-007: Alert Configuration Page */}
              <Route
                path="/teacher/settings/alerts"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <TeacherAlertConfigPage />
                  </ProtectedRoute>
                }
              />
              {/* Manual Review Panel for Modules 4 & 5 */}
              <Route
                path="/teacher/reviews"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
                    <ReviewPanelPage />
                  </ProtectedRoute>
                }
              />

              {/* ===== ADMIN PORTAL ===== */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/institutions"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminInstitutionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminRolesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminContentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gamification"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminGamificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/monitoring"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/advanced"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminAdvancedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/notifications"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminNotificationPreferencesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/alerts"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/progress"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classroom-teachers"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminClassroomTeacherPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminAuditLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/branding"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminBrandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/integrations/lti"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLtiPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Exercise Management */}
              <Route
                path="/admin/exercises/create"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminExerciseCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exercises/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminExerciseCreatePage />
                  </ProtectedRoute>
                }
              />

              {/* ===== PARENT PORTAL (EXT-011) ===== */}
              {/* Public routes for parent portal */}
              <Route path="/parent/login" element={<ParentLoginPage />} />
              <Route path="/parent/register" element={<ParentRegisterPage />} />

              {/* Protected parent portal routes */}
              <Route
                path="/parent/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/child/:studentId"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ChildProgressPage />
                  </ProtectedRoute>
                }
              />

              {/* Progress Pages (protected) */}
              <Route
                path="/progress"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress/modules/:moduleId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ModuleDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Achievements Page (protected) */}
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AchievementsPage />
                  </ProtectedRoute>
                }
              />

              {/* Leaderboard Page (protected) */}
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <LeaderboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Exercise Player */}
              <Route
                path="/exercises/:exerciseId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ExercisePage />
                  </ProtectedRoute>
                }
              />

              {/* Missions Page */}
              <Route
                path="/missions"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MissionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Student Assignments Page (P1-002) */}
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AssignmentDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Module Detail Page */}
              <Route
                path="/modules/:moduleId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ModuleDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Profile Pages */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <EnhancedProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Settings Page */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Notifications Center */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Notification Settings */}
              <Route
                path="/settings/notifications"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <NotificationPreferencesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings/devices"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DeviceManagementSection />
                  </ProtectedRoute>
                }
              />

              {/* Social Features */}
              <Route
                path="/friends"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <FriendsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/guilds"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <GuildsPage />
                  </ProtectedRoute>
                }
              />

              {/* Shop & Inventory */}
              <Route
                path="/shop"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ShopPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Unauthorized Page */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* 404 - Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
