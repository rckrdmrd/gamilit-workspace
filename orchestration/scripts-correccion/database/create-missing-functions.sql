-- ============================================================================
-- SCRIPT: Create Missing Functions (P0 - BLOQUEANTE)
-- Fecha: 2025-11-08
-- Descripción: Crea 2 funciones que son referenciadas pero no existen
-- ============================================================================
--
-- PROBLEMA:
--   Dos funciones son llamadas en el código DDL pero no están definidas:
--   1. gamilit.is_super_admin(user_id UUID)
--   2. gamilit.initialize_user_missions(user_id UUID)
--
-- IMPACTO:
--   🔴 BLOQUEANTE - Los triggers y RLS policies que las llaman fallarán
--
-- USO:
--   psql "$DATABASE_URL" -f apps/database/scripts/create-missing-functions.sql
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- FUNCIÓN 1: gamilit.is_super_admin
-- ============================================================================
--
-- Descripción:
--   Verifica si un usuario tiene el rol 'super_admin' activo
--
-- Parámetros:
--   p_user_id: UUID del usuario en auth.users
--
-- Retorna:
--   TRUE si el usuario es super admin, FALSE en caso contrario
--
-- Usado en:
--   - auth_management/functions/01-check_user_role.sql (línea 12)
--   - auth_management/functions/02-validate_role_assignment.sql (línea 8)
--   - auth_management/rls-policies/profiles-rls.sql (línea 45)
--   - Múltiples RLS policies en otros schemas
--
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = auth_management, gamilit, public
AS $$
DECLARE
    v_is_super_admin BOOLEAN;
BEGIN
    -- Validar que el user_id no sea NULL
    IF p_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verificar si el usuario tiene el rol 'super_admin' activo
    SELECT EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        JOIN auth_management.user_roles ur ON p.id = ur.profile_id
        JOIN auth_management.roles r ON ur.role_id = r.id
        WHERE p.auth_user_id = p_user_id
          AND r.role_name = 'super_admin'
          AND ur.is_active = TRUE
          AND ur.valid_from <= gamilit.now_mexico()
          AND (ur.valid_until IS NULL OR ur.valid_until > gamilit.now_mexico())
    ) INTO v_is_super_admin;

    RETURN v_is_super_admin;
END;
$$;

COMMENT ON FUNCTION gamilit.is_super_admin(UUID) IS
    'Verifica si un usuario tiene el rol super_admin activo (v1.0 - 2025-11-08). '
    'Usado en RLS policies y validaciones de permisos. '
    'SECURITY DEFINER permite verificar roles sin exponer la estructura de auth_management.';

-- ============================================================================
-- FUNCIÓN 2: gamilit.has_role
-- ============================================================================
--
-- Descripción:
--   Verifica si un usuario tiene un rol específico activo (función auxiliar)
--
-- Parámetros:
--   p_user_id: UUID del usuario en auth.users
--   p_role_name: Nombre del rol a verificar
--
-- Retorna:
--   TRUE si el usuario tiene el rol activo, FALSE en caso contrario
--
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.has_role(p_user_id UUID, p_role_name VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = auth_management, gamilit, public
AS $$
DECLARE
    v_has_role BOOLEAN;
BEGIN
    -- Validar parámetros
    IF p_user_id IS NULL OR p_role_name IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verificar si el usuario tiene el rol especificado
    SELECT EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        JOIN auth_management.user_roles ur ON p.id = ur.profile_id
        JOIN auth_management.roles r ON ur.role_id = r.id
        WHERE p.auth_user_id = p_user_id
          AND r.role_name = p_role_name
          AND ur.is_active = TRUE
          AND ur.valid_from <= gamilit.now_mexico()
          AND (ur.valid_until IS NULL OR ur.valid_until > gamilit.now_mexico())
    ) INTO v_has_role;

    RETURN v_has_role;
END;
$$;

COMMENT ON FUNCTION gamilit.has_role(UUID, VARCHAR) IS
    'Verifica si un usuario tiene un rol específico activo (v1.0 - 2025-11-08). '
    'Función auxiliar para RLS policies y validaciones de permisos.';

-- ============================================================================
-- FUNCIÓN 3: gamilit.initialize_user_missions (STUB)
-- ============================================================================
--
-- Descripción:
--   Inicializa las misiones de un nuevo usuario
--
-- Parámetros:
--   p_user_id: UUID del usuario (profile_id)
--
-- Retorna:
--   VOID
--
-- Usado en:
--   - gamilit/functions/04-initialize_user_stats.sql (línea 50)
--
-- NOTA:
--   Esta es una implementación STUB porque la tabla 'missions' no existe
--   en el DDL actual (fue removida como duplicado). Opciones:
--
--   A) Dejar como stub (implementación actual)
--   B) Eliminar la llamada de initialize_user_stats
--   C) Implementar usando exercises en lugar de missions
--
--   Recomendación: Eliminar la llamada (opción B) hasta que se defina
--   la estructura de missions.
--
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.initialize_user_missions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = gamification_system, educational_content, gamilit, public
AS $$
BEGIN
    -- Validar parámetro
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id cannot be NULL';
    END IF;

    -- TODO: Implementar cuando se defina la tabla missions
    -- Por ahora, esta función no hace nada (stub)
    --
    -- Implementación futura podría:
    -- 1. Crear scheduled_missions para el usuario
    -- 2. Asignar misiones iniciales según el nivel
    -- 3. Configurar misiones diarias/semanales

    RAISE NOTICE 'initialize_user_missions called for user % (not implemented - stub)', p_user_id;

    RETURN;
END;
$$;

COMMENT ON FUNCTION gamilit.initialize_user_missions(UUID) IS
    'Inicializa misiones para un nuevo usuario (v1.0 - 2025-11-08 - STUB). '
    'NOTA: Implementación pendiente hasta que se defina la estructura de missions. '
    'Actualmente no realiza ninguna acción.';

-- ============================================================================
-- VALIDACIÓN POST-CREACIÓN
-- ============================================================================

DO $$
DECLARE
    v_function_count INTEGER;
BEGIN
    -- Verificar que las 3 funciones fueron creadas
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'gamilit'
      AND p.proname IN ('is_super_admin', 'has_role', 'initialize_user_missions');

    IF v_function_count = 3 THEN
        RAISE NOTICE '✅ All 3 functions created successfully';
        RAISE NOTICE '   - gamilit.is_super_admin(UUID)';
        RAISE NOTICE '   - gamilit.has_role(UUID, VARCHAR)';
        RAISE NOTICE '   - gamilit.initialize_user_missions(UUID) [STUB]';
    ELSE
        RAISE EXCEPTION '❌ Expected 3 functions, found %', v_function_count;
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- TESTING (OPCIONAL)
-- ============================================================================
--
-- Para probar las funciones después de crear usuarios:
--
-- -- Test is_super_admin (debería retornar FALSE si no hay usuarios)
-- SELECT gamilit.is_super_admin('00000000-0000-0000-0000-000000000000');
--
-- -- Test has_role
-- SELECT gamilit.has_role('00000000-0000-0000-0000-000000000000', 'student');
--
-- -- Test initialize_user_missions (solo imprime NOTICE)
-- SELECT gamilit.initialize_user_missions('00000000-0000-0000-0000-000000000000');
--
-- ============================================================================
