import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/app/providers/AuthContext';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import DashboardComplete from '@/apps/student/pages/DashboardComplete';
import { MyProgressPage } from '@/pages/MyProgressPage';
import { ModuleDetailsPage } from '@/pages/ModuleDetailsPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import PasswordResetPage from '@/apps/student/pages/PasswordResetPage';
import EmailVerificationPage from '@/apps/student/pages/EmailVerificationPage';
import SettingsPage from '@/apps/student/pages/SettingsPage';
import MissionsPage from '@/apps/student/pages/MissionsPage';
import ExercisePage from '@/apps/student/pages/ExercisePage';
import NotFoundPage from '@/apps/student/pages/NotFoundPage';
import FriendsPage from '@/apps/student/pages/FriendsPage';
import ShopPage from '@/apps/student/pages/ShopPage';
import InventoryPage from '@/apps/student/pages/InventoryPage';
import GuildsPage from '@/apps/student/pages/GuildsPage';
import ModuleDetailPage from '@/apps/student/pages/ModuleDetailPage';
import EnhancedProfilePage from '@/apps/student/pages/EnhancedProfilePage';
import { NotificationPreferencesPage } from '@/apps/student/pages/NotificationPreferencesPage';
import { DeviceManagementSection } from '@/apps/student/pages/DeviceManagementSection';
import NotificationsPage from '@/apps/student/pages/NotificationsPage';
import AssignmentsPage from '@/apps/student/pages/AssignmentsPage';

// Teacher Portal Pages
import TeacherDashboardPage from '@/apps/teacher/pages/TeacherDashboardPage';
import TeacherAlertsPage from '@/apps/teacher/pages/TeacherAlertsPage';
import TeacherAnalyticsPage from '@/apps/teacher/pages/TeacherAnalyticsPage';
import TeacherAssignmentsPage from '@/apps/teacher/pages/TeacherAssignmentsPage';
import TeacherCommunicationPage from '@/apps/teacher/pages/TeacherCommunicationPage';
import TeacherContentPage from '@/apps/teacher/pages/TeacherContentPage';
import TeacherGamificationPage from '@/apps/teacher/pages/TeacherGamificationPage';
import TeacherMonitoringPage from '@/apps/teacher/pages/TeacherMonitoringPage';
import TeacherProgressPage from '@/apps/teacher/pages/TeacherProgressPage';
import TeacherReportsPage from '@/apps/teacher/pages/TeacherReportsPage';
// FASE 6A: TeacherResourcesPage removido - ruta redirigida a dashboard
// import TeacherResourcesPage from '@/apps/teacher/pages/TeacherResourcesPage';
import TeacherClassesPage from '@/apps/teacher/pages/TeacherClassesPage';
import TeacherStudentsPage from '@/apps/teacher/pages/TeacherStudentsPage';
import TeacherExerciseResponsesPage from '@/apps/teacher/pages/TeacherExerciseResponsesPage';
import TeacherSettingsPage from '@/apps/teacher/pages/TeacherSettingsPage';
import { ReviewPanelPage } from '@/apps/teacher/pages/ReviewPanel';

// Admin Portal Pages
import AdminDashboardPage from '@/apps/admin/pages/AdminDashboardPage';
import AdminInstitutionsPage from '@/apps/admin/pages/AdminInstitutionsPage';
import AdminUsersPage from '@/apps/admin/pages/AdminUsersPage';
import AdminRolesPage from '@/apps/admin/pages/AdminRolesPage';
import AdminContentPage from '@/apps/admin/pages/AdminContentPage';
import AdminGamificationPage from '@/apps/admin/pages/AdminGamificationPage';
import AdminMonitoringPage from '@/apps/admin/pages/AdminMonitoringPage';
import AdminAdvancedPage from '@/apps/admin/pages/AdminAdvancedPage';
import AdminReportsPage from '@/apps/admin/pages/AdminReportsPage';
import AdminSettingsPage from '@/apps/admin/pages/AdminSettingsPage';
import AdminAlertsPage from '@/apps/admin/pages/AdminAlertsPage';
import AdminAnalyticsPage from '@/apps/admin/pages/AdminAnalyticsPage';
import AdminProgressPage from '@/apps/admin/pages/AdminProgressPage';
import AdminClassroomTeacherPage from '@/apps/admin/pages/AdminClassroomTeacherPage';
import AdminAssignmentsPage from '@/apps/admin/pages/AdminAssignmentsPage';

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
              <ProtectedRoute>
                <DashboardComplete />
              </ProtectedRoute>
            }
          />

          {/* ===== TEACHER PORTAL ===== */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/alerts"
            element={
              <ProtectedRoute>
                <TeacherAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <ProtectedRoute>
                <TeacherAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute>
                <TeacherAssignmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/communication"
            element={
              <ProtectedRoute>
                <TeacherCommunicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/content"
            element={
              <ProtectedRoute>
                <TeacherContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/gamification"
            element={
              <ProtectedRoute>
                <TeacherGamificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/monitoring"
            element={
              <ProtectedRoute>
                <TeacherMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/progress"
            element={
              <ProtectedRoute>
                <TeacherProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute>
                <TeacherReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/responses"
            element={
              <ProtectedRoute>
                <TeacherExerciseResponsesPage />
              </ProtectedRoute>
            }
          />
          {/* FASE 6A: /teacher/resources redirige a dashboard (placeholder sin funcionalidad) */}
          <Route
            path="/teacher/resources"
            element={<Navigate to="/teacher/dashboard" replace />}
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute>
                <TeacherClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute>
                <TeacherStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute>
                <TeacherSettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Manual Review Panel for Modules 4 & 5 */}
          <Route
            path="/teacher/reviews"
            element={
              <ProtectedRoute>
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

          {/* Progress Pages (protected) */}
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <MyProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress/modules/:moduleId"
            element={
              <ProtectedRoute>
                <ModuleDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Achievements Page (protected) */}
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />

          {/* Leaderboard Page (protected) */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          {/* Exercise Player */}
          <Route
            path="/exercises/:exerciseId"
            element={
              <ProtectedRoute>
                <ExercisePage />
              </ProtectedRoute>
            }
          />

          {/* Missions Page */}
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <MissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Student Assignments Page (P1-002) */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <AssignmentsPage />
              </ProtectedRoute>
            }
          />

          {/* Module Detail Page */}
          <Route
            path="/modules/:moduleId"
            element={
              <ProtectedRoute>
                <ModuleDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <EnhancedProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Settings Page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Notifications Center */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Notification Settings */}
          <Route
            path="/settings/notifications"
            element={
              <ProtectedRoute>
                <NotificationPreferencesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/devices"
            element={
              <ProtectedRoute>
                <DeviceManagementSection />
              </ProtectedRoute>
            }
          />

          {/* Social Features */}
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guilds"
            element={
              <ProtectedRoute>
                <GuildsPage />
              </ProtectedRoute>
            }
          />

          {/* Shop & Inventory */}
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <ShopPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
