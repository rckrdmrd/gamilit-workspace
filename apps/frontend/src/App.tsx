import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthContext';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyProgressPage } from '@/pages/MyProgressPage';
import { ModuleDetailsPage } from '@/pages/ModuleDetailsPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';

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
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

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

          {/* TODO: Exercise Player (placeholder route) */}
          <Route
            path="/exercises/:exerciseId/player"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Exercise Player</h1>
                    <p className="text-xl text-gray-600 mb-6">Coming Soon</p>
                    <a
                      href="/progress"
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Back to Progress
                    </a>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* TODO: Add more routes */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} /> */}
          {/* <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} /> */}
          {/* <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}
          {/* <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> */}

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page not found</p>
                  <a
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
