import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import TeacherAssignments from './TeacherAssignments';

/**
 * TeacherAssignmentsPage - Wrapper para la gestión de asignaciones
 *
 * Este componente envuelve el TeacherAssignments existente con el TeacherLayout
 * que incluye el sidebar de navegación y header gamificado.
 */
export default function TeacherAssignmentsPage() {
  const { user, logout } = useAuth();

  // Use useUserGamification hook for real-time gamification data
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
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
      <TeacherAssignments />
    </TeacherLayout>
  );
}
