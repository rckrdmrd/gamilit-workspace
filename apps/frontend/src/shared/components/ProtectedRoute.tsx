import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useWebSocket } from '@/features/notifications/hooks/useWebSocket';
import { GamificationOverlay } from '@/features/gamification/components/GamificationOverlay';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Wrapper component that protects routes from unauthorized access
 *
 * Features:
 * - Blocks access for unauthenticated users
 * - Supports role-based access control (RBAC)
 * - Shows loading state while checking authentication
 * - Preserves intended destination for post-login redirect
 * - Redirects to login or unauthorized page as needed
 *
 * @param children - The protected content to render
 * @param allowedRoles - Optional array of roles that can access this route
 * @param redirectTo - Custom redirect path for unauthenticated users (default: '/login')
 *
 * @example
 * Basic protection (requires authentication):
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * @example
 * Role-based protection:
 * ```tsx
 * <Route path="/admin" element={
 *   <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * @example
 * With custom redirect:
 * ```tsx
 * <Route path="/premium" element={
 *   <ProtectedRoute redirectTo="/subscribe">
 *     <PremiumContent />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  // Using Zustand store directly for HMR resilience (no Provider dependency)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  // Initialize WebSocket for real-time notifications
  // The hook internally checks for auth token and user before connecting
  useWebSocket();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Preserve the intended destination in state for post-login redirect
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access control if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user?.role || '');

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role (if specified)
  return (
    <>
      <GamificationOverlay />
      {children}
    </>
  );
};

/**
 * Unauthorized Page Component
 * Default page shown when user doesn't have required permissions
 *
 * @example
 * Add to your routes:
 * ```tsx
 * <Route path="/unauthorized" element={<UnauthorizedPage />} />
 * ```
 */
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md px-4 text-center">
        <div className="mb-4 text-6xl">403</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>
        <div className="space-x-4">
          <a
            href="/"
            className="inline-block rounded-md bg-orange-600 px-6 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Go to Home
          </a>
          <a
            href="/dashboard"
            className="inline-block rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
