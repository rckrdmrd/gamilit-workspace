import { useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';

/**
 * useStudentPageSetup - Centralizes student page boilerplate
 *
 * Encapsulates the repeated pattern across 18+ student pages:
 * - useAuth() for user + logout
 * - useUserGamification() for gamification data
 * - displayGamificationData with fallback defaults
 * - handleLogout with redirect to /login
 *
 * @returns Student page setup props ready for StudentPageShell / GamifiedHeader
 *
 * @example
 * ```tsx
 * export default function StudentSomePage() {
 *   const { user, displayGamificationData, handleLogout } = useStudentPageSetup();
 *   return (
 *     <StudentPageShell>
 *       {content}
 *     </StudentPageShell>
 *   );
 * }
 * ```
 */
export function useStudentPageSetup() {
  const { user, logout } = useAuth();
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

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
