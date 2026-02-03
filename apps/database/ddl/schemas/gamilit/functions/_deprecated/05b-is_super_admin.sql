-- ============================================================================
-- DEPRECATED: 2026-02-03
-- RAZON: Es un alias puro que solo llama a is_admin(), crea confusion semantica
-- TAREA: TASK-CONSOLIDAR-FUNCIONES-SQL-GAMILIT
-- REEMPLAZO: Usar gamilit.is_admin() directamente
-- ============================================================================
-- NOTA: Este archivo fue movido a _deprecated/ y NO sera incluido en el script
-- de creacion de la base de datos. Mantener solo como referencia historica.
-- ============================================================================

-- Nombre: is_super_admin
-- Descripcion: Alias de is_admin() - Verifica si el usuario actual tiene rol de super administrador
-- Schema: gamilit
-- Tipo: FUNCTION
-- Dependencias: gamilit.is_admin()
-- Uso: Politicas RLS para control de acceso administrativo (alias para compatibilidad)

CREATE OR REPLACE FUNCTION gamilit.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Alias de is_admin() para compatibilidad con RLS policies existentes
    RETURN gamilit.is_admin();
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION gamilit.is_super_admin() IS
    'DEPRECATED: Alias de is_admin() para compatibilidad. '
    'Retorna TRUE si el usuario actual es administrador (admin_teacher o super_admin). '
    'Utilizada por politicas RLS para control de acceso administrativo.';

-- Permisos
GRANT EXECUTE ON FUNCTION gamilit.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION gamilit.is_super_admin() TO gamilit_user;
