import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherClasses from './TeacherClasses';

/**
 * TeacherClassesPage - Wrapper para la gestión de clases
 *
 * Este componente envuelve el TeacherClasses existente con el TeacherLayout
 * que incluye el sidebar de navegación y header gamificado.
 */
export default function TeacherClassesPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={gamificationData}
      organizationName={user?.organization?.name || 'Mi Institución'}
      onLogout={handleLogout}
    >
      <TeacherClasses />
    </TeacherLayout>
  );
}
