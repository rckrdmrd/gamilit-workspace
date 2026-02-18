import { useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';

/**
 * useAdminPageSetup - Centralizes admin page boilerplate
 *
 * Encapsulates the repeated pattern across 18+ admin pages:
 * - useAuth() for user + logout
 * - useUserGamification() for gamification data
 * - displayGamificationData with fallback defaults
 * - handleLogout with redirect to /login
 *
 * @returns Admin page setup props ready for AdminLayout
 *
 * @example
 * ```tsx
 * export default function AdminSomePage() {
 *   const { user, displayGamificationData, handleLogout } = useAdminPageSetup();
 *   return (
 *     <AdminLayout user={user || undefined} gamificationData={displayGamificationData}
 *       organizationName="GAMILIT Platform Admin" onLogout={handleLogout}>
 *       {content}
 *     </AdminLayout>
 *   );
 * }
 * ```
 */
export function useAdminPageSetup() {
  const { user, logout } = useAuth();
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return {
    user,
    displayGamificationData,
    handleLogout,
    gamificationLoading,
  };
}
