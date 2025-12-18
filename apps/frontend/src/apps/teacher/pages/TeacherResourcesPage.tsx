import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { UnderConstruction } from '@shared/components/UnderConstruction';

/**
 * TeacherResourcesPage - Página de recursos educativos
 *
 * Funcionalidad de gestión de recursos educativos, materiales didácticos y biblioteca de contenidos.
 * Actualmente en desarrollo.
 */
export default function TeacherResourcesPage() {
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
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <UnderConstruction
        title="Recursos Educativos"
        message="Gestiona y organiza materiales didácticos, documentos, presentaciones y recursos multimedia para tus clases."
        upcomingFeatures={[
          'Biblioteca de recursos educativos',
          'Subir y organizar materiales didácticos',
          'Compartir recursos con estudiantes',
          'Buscar recursos por materia y tema',
          'Favoritos y colecciones personalizadas',
          'Integración con Google Drive',
        ]}
      />
    </TeacherLayout>
  );
}
