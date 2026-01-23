import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';

/**
 * Higher-Order Component that wraps a component with TeacherLayout
 *
 * This HOC eliminates the need for separate *Page.tsx wrapper files by:
 * - Automatically injecting useAuth() for user and logout
 * - Automatically injecting useUserGamification() for gamification data
 * - Wrapping the component with TeacherLayout with all required props
 *
 * @example
 * // Usage with lazy loading in App.tsx:
 * const TeacherDashboard = lazy(() =>
 *   import('./pages/TeacherDashboard').then(m => ({
 *     default: withTeacherLayout(m.default)
 *   }))
 * );
 *
 * @param WrappedComponent - The component to wrap with TeacherLayout
 * @returns A new component wrapped with TeacherLayout and auth/gamification data
 */
export function withTeacherLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
  const WithTeacherLayoutComponent: React.FC<P> = (props) => {
    const { user, logout } = useAuth();
    const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

    // Fallback gamification data while loading or if data not available
    const displayGamificationData = gamificationData || {
      userId: user?.id || '',
      level: gamificationLoading ? 0 : 1,
      totalXP: 0,
      mlCoins: 0,
      rank: gamificationLoading ? 'Cargando...' : 'Novato',
      rankColor: '#9E9E9E',
      progressToNextLevel: 0,
      xpToNextLevel: 100,
      achievements: [],
      totalAchievements: 0,
    };

    const handleLogout = () => {
      logout();
      window.location.href = '/login';
    };

    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName={user?.organization?.name || 'Mi Institucion'}
        onLogout={handleLogout}
      >
        <WrappedComponent {...props} />
      </TeacherLayout>
    );
  };

  // Set display name for better debugging
  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithTeacherLayoutComponent.displayName = `withTeacherLayout(${wrappedComponentName})`;

  return WithTeacherLayoutComponent;
}

export default withTeacherLayout;
