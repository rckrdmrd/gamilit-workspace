import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import TeacherDashboard from './TeacherDashboard';

/**
 * TeacherDashboardPage - Wrapper que combina TeacherLayout con TeacherDashboard
 *
 * Este componente envuelve el TeacherDashboard existente con el nuevo TeacherLayout
 * que incluye el sidebar de navegación.
 */
export default function TeacherDashboardPage() {
  const { user, logout } = useAuth();

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
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

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institución'}
      onLogout={handleLogout}
    >
      <TeacherDashboard />
    </TeacherLayout>
  );
}
