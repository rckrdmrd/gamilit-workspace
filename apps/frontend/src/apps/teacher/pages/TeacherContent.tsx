import { TeacherPageShell } from '../components/shared/TeacherPageShell';
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
  // ============================================================================
  // FEATURE FLAG CHECK - Under Construction
  // ============================================================================

  if (SHOW_UNDER_CONSTRUCTION) {
    return (
      <TeacherPageShell>
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
      </TeacherPageShell>
    );
  }

  // ============================================================================
  // MAIN RENDER - Funcionalidad completa (cuando SHOW_UNDER_CONSTRUCTION = false)
  // ============================================================================

  return (
    <TeacherPageShell>
      <TeacherContentManagement />
    </TeacherPageShell>
  );
}
