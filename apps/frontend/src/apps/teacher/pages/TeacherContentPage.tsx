import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import TeacherContentManagement from './TeacherContentManagement';
import { UnderConstruction } from '@shared/components/UnderConstruction';
import { FEATURE_FLAGS } from '@/config/api.config';

// ============================================================================
// FEATURE FLAG - ISS-FE-003: Usar flag centralizado
// ============================================================================
const SHOW_UNDER_CONSTRUCTION = FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION;

/**
 * TeacherContentPage - Página de gestión de contenido educativo
 *
 * ESTADO: HABILITADO (2025-12-18)
 * Funcionalidad completa disponible.
 */
export default function TeacherContentPage() {
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

  // ============================================================================
  // FEATURE FLAG CHECK - Under Construction
  // ============================================================================

  if (SHOW_UNDER_CONSTRUCTION) {
    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName={user?.organization?.name || 'Mi Institución'}
        onLogout={handleLogout}
      >
        <UnderConstruction
          title="Gestión de Contenido"
          description="El módulo de gestión de contenido está en desarrollo. Pronto podrás crear y administrar ejercicios personalizados para tus estudiantes."
          upcomingFeatures={[
            'Creación de ejercicios personalizados',
            'Edición y duplicación de contenido',
            'Biblioteca de plantillas',
            'Organización por módulos y temas',
            'Vista previa de ejercicios',
            'Publicación y programación',
          ]}
        />
      </TeacherLayout>
    );
  }

  // ============================================================================
  // MAIN RENDER - Funcionalidad completa (cuando SHOW_UNDER_CONSTRUCTION = false)
  // ============================================================================

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institución'}
      onLogout={handleLogout}
    >
      <TeacherContentManagement />
    </TeacherLayout>
  );
}
