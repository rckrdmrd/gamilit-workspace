-- =====================================================
-- RLS Policies: manual_reviews
-- Schema: progress_tracking
-- Autor: TASK-2026-01-18-011 (FIX-DB-005)
-- Fecha: 2026-01-18
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
    reviewer_id = auth.uid()
  )
  WITH CHECK (
    reviewer_id = auth.uid()
  );

COMMENT ON POLICY reviewer_manage_own_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a reviewers gestionar (CRUD) sus propias reviews asignadas.';

-- =====================================================
-- POLICY: Teacher puede ver reviews de su classroom
-- =====================================================
DROP POLICY IF EXISTS teacher_view_classroom_reviews ON progress_tracking.manual_reviews;

CREATE POLICY teacher_view_classroom_reviews ON progress_tracking.manual_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM progress_tracking.exercise_submissions es
      JOIN progress_tracking.module_progress mp ON es.user_id = mp.user_id AND es.module_id = mp.module_id
      JOIN social_features.classroom_members cm ON cm.classroom_id = mp.classroom_id
      WHERE es.id = progress_tracking.manual_reviews.submission_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('teacher', 'admin_teacher')
        AND cm.is_active = true
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
      JOIN auth_management.profiles admin_profile ON admin_profile.id = auth.uid()
      WHERE es.id = progress_tracking.manual_reviews.submission_id
        AND p.tenant_id = admin_profile.tenant_id
        AND admin_profile.role IN ('ADMIN_TEACHER', 'SUPER_ADMIN')
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
      WHERE p.id = auth.uid()
        AND p.role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth_management.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'SUPER_ADMIN'
    )
  );

COMMENT ON POLICY super_admin_full_access_reviews ON progress_tracking.manual_reviews IS
  'FIX-DB-005-2026-01-18: Permite a super_admin gestionar (CRUD) todas las reviews del sistema.';
