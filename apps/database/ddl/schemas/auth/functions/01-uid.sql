-- =====================================================
-- Function: auth.uid
-- Description: Retorna el UUID del usuario autenticado actual
-- Parameters: None
-- Returns: uuid
-- Created: 2026-02-14
-- =====================================================
--
-- NOTA: Esta funcion es un wrapper de compatibilidad.
-- El proyecto gamilit usa current_setting('app.current_user_id') como mecanismo
-- de sesion (establecido por el backend via SET SESSION/SET LOCAL).
-- Muchas politicas RLS referencian auth.uid() (convencion Supabase).
-- Esta funcion delega a gamilit.get_current_user_id() para unificar el patron.
--
-- DEPENDENCIAS:
-- - gamilit.get_current_user_id() debe existir
-- - El backend debe ejecutar SET SESSION app.current_user_id = '<uuid>' antes de queries
--
-- =====================================================

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT gamilit.get_current_user_id();
$$;

COMMENT ON FUNCTION auth.uid() IS
    'Wrapper de compatibilidad: retorna el UUID del usuario autenticado actual. '
    'Delega a gamilit.get_current_user_id() que lee current_setting(app.current_user_id). '
    'Requerida por ~190 referencias en politicas RLS (convencion Supabase).';

-- Permisos
GRANT EXECUTE ON FUNCTION auth.uid() TO gamilit_user;

-- =====================================================
-- CHANGELOG
-- =====================================================
-- 2026-02-14: Creacion inicial (TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP)
--             Implementada para desbloquear ~60 politicas RLS + ~24 triggers
--             que referencian auth.uid()
-- =====================================================
