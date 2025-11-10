import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthContext';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
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

          {/* Dashboard (protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
