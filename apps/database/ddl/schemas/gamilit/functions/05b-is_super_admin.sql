-- =====================================================
-- Function: gamilit.is_super_admin
-- Description: Verifica si el usuario actual tiene rol de super_admin
-- Schema: gamilit
-- Tipo: FUNCTION
-- Dependencias: gamilit.get_current_user_id(), auth_management.profiles
-- Uso: Politicas RLS para control de acceso super-administrativo
-- Created: 2026-02-14
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Verifica si el usuario actual tiene rol de super_admin
    RETURN EXISTS (
        SELECT 1
        FROM auth_management.profiles
        WHERE id = gamilit.get_current_user_id()
        AND role = 'super_admin'
        AND status = 'active'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.is_super_admin() IS
    'Retorna TRUE si el usuario actual es super_admin. '
    'A diferencia de is_admin() que incluye admin_teacher y super_admin, '
    'esta funcion solo permite super_admin. '
    'Usada en operaciones destructivas (DELETE), asignacion/revocacion de roles, '
    'y acceso a configuracion critica del sistema. '
    'Verifica status=active para prevenir acceso de usuarios suspendidos.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.is_super_admin() TO gamilit_user;

-- =====================================================
-- NOTAS DE IMPLEMENTACION
-- =====================================================
--
-- SEGURIDAD:
-- - Usa SECURITY DEFINER para ejecutar con permisos del creador
-- - Verifica status='active' para prevenir acceso de usuarios suspendidos
-- - Manejo de excepciones retorna FALSE por defecto (fail-safe)
-- - Solo permite rol 'super_admin' (mas restrictivo que is_admin)
--
-- PERFORMANCE:
-- - Marcada como STABLE para cacheo durante transaccion
-- - Usa EXISTS para early exit (mas eficiente que COUNT o SELECT)
-- - Indice recomendado en auth_management.profiles(id, role, status)
--
-- DEPENDENCIAS:
-- - gamilit.get_current_user_id() debe existir
-- - Tabla auth_management.profiles debe existir
-- - Rol valido: 'super_admin' (enum auth_management.gamilit_role)
--
-- USO EN RLS POLICIES:
-- CREATE POLICY admin_delete_only ON some_table
--   FOR DELETE
--   USING (gamilit.is_super_admin());
--
-- DIFERENCIA CON is_admin():
-- - is_admin(): role IN ('admin_teacher', 'super_admin') -> acceso administrativo general
-- - is_super_admin(): role = 'super_admin' -> operaciones criticas/destructivas
--
-- =====================================================
-- TESTING
-- =====================================================
--
-- Test 1: Usuario super_admin
-- SET SESSION app.current_user_id = '<super_admin_uuid>';
-- SELECT gamilit.is_super_admin(); -- Resultado esperado: true
--
-- Test 2: Usuario admin_teacher
-- SET SESSION app.current_user_id = '<admin_teacher_uuid>';
-- SELECT gamilit.is_super_admin(); -- Resultado esperado: false
--
-- Test 3: Usuario student
-- SET SESSION app.current_user_id = '<student_uuid>';
-- SELECT gamilit.is_super_admin(); -- Resultado esperado: false
--
-- Test 4: Sin autenticacion
-- RESET app.current_user_id;
-- SELECT gamilit.is_super_admin(); -- Resultado esperado: false
--
-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2026-02-14: Creacion inicial (TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP)
--             Implementada para desbloquear ~20 politicas RLS
--             que referencian gamilit.is_super_admin()
--             Referenciada en _MAP.md desde 2026-01-14
-- =====================================================
