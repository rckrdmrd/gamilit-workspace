-- =====================================================
-- RLS Policies: manual_reviews
-- Schema: progress_tracking
-- Autor: TASK-2026-01-18-011 (FIX-DB-005)
-- Fecha: 2026-01-18
-- Actualizado: 2026-01-18 (Corrección de dependencias)
-- =====================================================
--
-- PROPOSITO:
-- Implementar Row-Level Security para la tabla manual_reviews
-- que contiene evaluaciones docentes de ejercicios con revision manual.
--
-- ROLES Y ACCESO:
-- - Reviewer (teacher asignado): CRUD completo sobre sus propias reviews
-- - Teacher (de classroom): Lectura de reviews de estudiantes de su classroom
-- - Admin: Lectura de todas las reviews del tenant
-- - Super Admin: Acceso total cross-tenant
--
-- NOTA IMPORTANTE:
-- manual_reviews NO tiene tenant_id directamente.
-- El tenant se deriva via exercise_submissions -> user -> profile -> tenant_id
--
-- CORRECCION 2026-01-18:
-- - Cambiado auth.uid() -> gamilit.get_current_user_id() (patron del proyecto)
-- - Corregido join: exercise_submissions -> exercises -> module_progress
-- - Cambiado classroom_members.role -> teacher_classrooms.role (tabla correcta)

-- Habilitar RLS en manual_reviews (si no esta habilitado)
ALTER TABLE progress_tracking.manual_reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY: Reviewer puede gestionar sus propias reviews
-- =====================================================
DROP POLICY IF EXISTS reviewer_manage_own_reviews ON progress_tracking.manual_reviews;

CREATE POLICY reviewer_manage_own_reviews ON progress_tracking.manual_reviews
  FOR ALL
  TO authenticated
  USING (
    reviewer_id = gamilit.get_current_user_id()
  )
  WITH CHECK (
    reviewer_id = gamilit.get_current_user_id()
  );

COMMENT ON POLICY reviewer_manage_own_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a reviewers gestionar (CRUD) sus propias reviews asignadas.';

-- =====================================================
-- POLICY: Teacher puede ver reviews de su classroom
-- =====================================================
-- NOTA: El path correcto es:
-- manual_reviews.submission_id -> exercise_submissions.exercise_id
-- -> exercises.module_id -> module_progress.classroom_id
-- -> teacher_classrooms.teacher_id
DROP POLICY IF EXISTS teacher_view_classroom_reviews ON progress_tracking.manual_reviews;

CREATE POLICY teacher_view_classroom_reviews ON progress_tracking.manual_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM progress_tracking.exercise_submissions es
      JOIN educational_content.exercises ex ON es.exercise_id = ex.id
      JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id AND ex.module_id = mp.module_id
      JOIN social_features.teacher_classrooms tc ON tc.classroom_id = mp.classroom_id
      WHERE es.id = progress_tracking.manual_reviews.submission_id
        AND tc.teacher_id = gamilit.get_current_user_id()
        AND tc.role IN ('owner', 'teacher', 'assistant')
    )
  );

COMMENT ON POLICY teacher_view_classroom_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a teachers ver reviews de estudiantes de sus classrooms.';

-- =====================================================
-- POLICY: Admin puede ver todas las reviews del tenant
-- =====================================================
DROP POLICY IF EXISTS admin_view_tenant_reviews ON progress_tracking.manual_reviews;

CREATE POLICY admin_view_tenant_reviews ON progress_tracking.manual_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM progress_tracking.exercise_submissions es
      JOIN auth_management.profiles p ON es.user_id = p.id
      JOIN auth_management.profiles admin_profile ON admin_profile.id = gamilit.get_current_user_id()
      WHERE es.id = progress_tracking.manual_reviews.submission_id
        AND p.tenant_id = admin_profile.tenant_id
        AND admin_profile.role IN ('admin_teacher', 'super_admin')
    )
  );

COMMENT ON POLICY admin_view_tenant_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a admins ver todas las reviews de su tenant.';

-- =====================================================
-- POLICY: Super Admin puede gestionar todas las reviews
-- =====================================================
DROP POLICY IF EXISTS super_admin_full_access_reviews ON progress_tracking.manual_reviews;

CREATE POLICY super_admin_full_access_reviews ON progress_tracking.manual_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth_management.profiles p
      WHERE p.id = gamilit.get_current_user_id()
        AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth_management.profiles p
      WHERE p.id = gamilit.get_current_user_id()
        AND p.role = 'super_admin'
    )
  );

COMMENT ON POLICY super_admin_full_access_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a super_admin gestionar (CRUD) todas las reviews del sistema.';
