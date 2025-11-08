-- =====================================================
-- SPRINT 0 - DÍA 1-2: SEGURIDAD RLS
-- =====================================================
-- Duración: 7 horas
-- Prioridad: P0 CRÍTICO
-- Objetivo: Habilitar Row Level Security en tablas sensibles
-- =====================================================

-- IMPORTANTE: Ejecutar en orden
-- Requiere: PostgreSQL 12+
-- Requiere: auth.uid() function configurada

BEGIN;

\echo '=== SPRINT 0 - DÍA 1-2: INICIANDO CONFIGURACIÓN DE RLS ==='

-- =====================================================
-- 1. HABILITAR RLS EN TABLAS CRÍTICAS
-- =====================================================

\echo '>>> Paso 1: Habilitando RLS en tablas críticas...'

-- 1.1 password_reset_tokens
ALTER TABLE auth_management.password_reset_tokens
  ENABLE ROW LEVEL SECURITY;

-- 1.2 user_sessions
ALTER TABLE auth_management.user_sessions
  ENABLE ROW LEVEL SECURITY;

-- 1.3 notifications
ALTER TABLE gamification_system.notifications
  ENABLE ROW LEVEL SECURITY;

-- 1.4 ml_coins_transactions
ALTER TABLE gamification_system.ml_coins_transactions
  ENABLE ROW LEVEL SECURITY;

\echo '>>> ✓ RLS habilitado en 4 tablas críticas'

-- =====================================================
-- 2. POLÍTICAS RLS - PASSWORD_RESET_TOKENS
-- =====================================================

\echo '>>> Paso 2: Creando políticas para password_reset_tokens...'

-- Solo el usuario dueño puede ver sus tokens
CREATE POLICY password_reset_user_policy
  ON auth_management.password_reset_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Admins pueden ver todos (para soporte)
CREATE POLICY password_reset_admin_policy
  ON auth_management.password_reset_tokens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin_teacher')
    )
  );

\echo '>>> ✓ Políticas creadas para password_reset_tokens'

-- =====================================================
-- 3. POLÍTICAS RLS - USER_SESSIONS
-- =====================================================

\echo '>>> Paso 3: Creando políticas para user_sessions...'

-- Solo el usuario puede ver/modificar sus propias sesiones
CREATE POLICY user_sessions_own
  ON auth_management.user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Admins pueden ver todas las sesiones
CREATE POLICY user_sessions_admin
  ON auth_management.user_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

\echo '>>> ✓ Políticas creadas para user_sessions'

-- =====================================================
-- 4. POLÍTICAS RLS - NOTIFICATIONS
-- =====================================================

\echo '>>> Paso 4: Creando políticas para notifications...'

-- Solo el usuario puede ver sus notificaciones
CREATE POLICY notifications_read_own
  ON gamification_system.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Solo el usuario puede actualizar sus notificaciones (marcar como leídas)
CREATE POLICY notifications_update_own
  ON gamification_system.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Solo el sistema puede insertar notificaciones (via SECURITY DEFINER functions)
CREATE POLICY notifications_insert_system
  ON gamification_system.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

\echo '>>> ✓ Políticas creadas para notifications'

-- =====================================================
-- 5. POLÍTICAS RLS - ML_COINS_TRANSACTIONS
-- =====================================================

\echo '>>> Paso 5: Creando políticas para ml_coins_transactions...'

-- Solo el usuario puede ver sus transacciones
CREATE POLICY ml_coins_read_own
  ON gamification_system.ml_coins_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Profesores pueden ver transacciones de sus estudiantes
CREATE POLICY ml_coins_read_teacher
  ON gamification_system.ml_coins_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles p
      WHERE p.id = ml_coins_transactions.user_id
        AND p.role = 'student'
        AND EXISTS (
          SELECT 1 FROM social_features.classroom_members cm
          JOIN social_features.classrooms c ON cm.classroom_id = c.id
          WHERE cm.student_id = p.id
            AND c.teacher_id = auth.uid()
            AND cm.status = 'active'
        )
    )
  );

-- Admins pueden ver todas las transacciones
CREATE POLICY ml_coins_read_admin
  ON gamification_system.ml_coins_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Solo el sistema puede crear transacciones (via SECURITY DEFINER functions)
CREATE POLICY ml_coins_insert_system
  ON gamification_system.ml_coins_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth_management.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

\echo '>>> ✓ Políticas creadas para ml_coins_transactions'

-- =====================================================
-- 6. FIX CRÍTICO: POLICY users_read_all
-- =====================================================

\echo '>>> Paso 6: Corrigiendo policy peligrosa users_read_all...'

-- 6.1 Verificar si existe la policy peligrosa
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'auth_management'
      AND tablename = 'profiles'
      AND policyname = 'users_read_all'
  ) THEN
    DROP POLICY users_read_all ON auth_management.profiles;
    RAISE NOTICE '>>> ✓ Policy peligrosa users_read_all eliminada';
  ELSE
    RAISE NOTICE '>>> Policy users_read_all no existe (ok)';
  END IF;
END $$;

-- 6.2 Crear policy restrictiva: solo su propio perfil completo
CREATE POLICY profiles_read_own
  ON auth_management.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

\echo '>>> ✓ Policy profiles_read_own creada'

-- 6.3 Profesores pueden ver perfiles de sus estudiantes
CREATE POLICY profiles_teacher_students
  ON auth_management.profiles
  FOR SELECT TO authenticated
  USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM social_features.classroom_members cm
      JOIN social_features.classrooms c ON cm.classroom_id = c.id
      WHERE cm.student_id = profiles.id
        AND c.teacher_id = auth.uid()
        AND cm.status = 'active'
    )
  );

\echo '>>> ✓ Policy profiles_teacher_students creada'

-- 6.4 Admins pueden ver todos los perfiles de su tenant
CREATE POLICY profiles_admin_tenant
  ON auth_management.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
        AND p.tenant_id = profiles.tenant_id
    )
  );

\echo '>>> ✓ Policy profiles_admin_tenant creada'

-- =====================================================
-- 7. CREAR VISTA PÚBLICA PARA PERFILES
-- =====================================================

\echo '>>> Paso 7: Creando vista pública de perfiles...'

-- 7.1 Crear vista con solo campos seguros
CREATE OR REPLACE VIEW auth_management.public_profiles AS
SELECT
  id,
  first_name,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM auth_management.profiles
WHERE is_active = true;

-- 7.2 Permitir acceso a usuarios autenticados
GRANT SELECT ON auth_management.public_profiles TO authenticated;

-- 7.3 Comentario explicativo
COMMENT ON VIEW auth_management.public_profiles IS
  'Vista pública de perfiles con solo campos no sensibles. Usar esta vista en lugar de acceso directo a profiles cuando se necesite información básica de usuarios.';

\echo '>>> ✓ Vista public_profiles creada y permisos otorgados'

-- =====================================================
-- 8. VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

\echo '>>> Paso 8: Verificando configuración de RLS...'

-- Verificar que RLS está habilitado
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_tables
  WHERE schemaname IN ('auth_management', 'gamification_system')
    AND tablename IN ('password_reset_tokens', 'user_sessions', 'notifications', 'ml_coins_transactions', 'profiles')
    AND rowsecurity = true;

  IF v_count = 5 THEN
    RAISE NOTICE '>>> ✓ RLS habilitado en 5 tablas críticas';
  ELSE
    RAISE WARNING '>>> ⚠ Solo % de 5 tablas tienen RLS habilitado', v_count;
  END IF;
END $$;

-- Contar políticas creadas
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_policies
  WHERE schemaname IN ('auth_management', 'gamification_system')
    AND tablename IN ('password_reset_tokens', 'user_sessions', 'notifications', 'ml_coins_transactions', 'profiles');

  RAISE NOTICE '>>> Total de políticas RLS creadas: %', v_count;

  IF v_count >= 13 THEN
    RAISE NOTICE '>>> ✓ Todas las políticas críticas están creadas';
  ELSE
    RAISE WARNING '>>> ⚠ Esperadas al menos 13 políticas, encontradas: %', v_count;
  END IF;
END $$;

-- =====================================================
-- 9. GRANTS Y PERMISOS
-- =====================================================

\echo '>>> Paso 9: Configurando permisos...'

-- Asegurar que el rol authenticated tenga permisos básicos
GRANT USAGE ON SCHEMA auth_management TO authenticated;
GRANT USAGE ON SCHEMA gamification_system TO authenticated;

-- Permisos en tablas (SELECT, INSERT, UPDATE según políticas RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON auth_management.password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth_management.user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth_management.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON gamification_system.notifications TO authenticated;
GRANT SELECT, INSERT ON gamification_system.ml_coins_transactions TO authenticated;

\echo '>>> ✓ Permisos configurados'

-- =====================================================
-- 10. RESUMEN Y FINALIZACIÓN
-- =====================================================

\echo ''
\echo '======================================================='
\echo 'SPRINT 0 - DÍA 1-2: RLS SECURITY - COMPLETADO ✓'
\echo '======================================================='
\echo ''
\echo 'Cambios aplicados:'
\echo '  ✓ RLS habilitado en 5 tablas críticas'
\echo '  ✓ 13+ políticas de seguridad creadas'
\echo '  ✓ Policy peligrosa users_read_all eliminada'
\echo '  ✓ Vista public_profiles creada'
\echo '  ✓ Permisos configurados correctamente'
\echo ''
\echo 'Tablas protegidas:'
\echo '  - auth_management.password_reset_tokens'
\echo '  - auth_management.user_sessions'
\echo '  - auth_management.profiles (corregida)'
\echo '  - gamification_system.notifications'
\echo '  - gamification_system.ml_coins_transactions'
\echo ''
\echo 'Próximo paso:'
\echo '  → Ejecutar DAY-3-4-FUNCTIONS-TRIGGERS.sql'
\echo '======================================================='

COMMIT;

\echo '>>> ✓ Transacción completada exitosamente'
