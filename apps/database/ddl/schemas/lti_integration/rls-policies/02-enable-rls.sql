-- =====================================================
-- Enable RLS for lti_integration schema
-- Description: Habilita Row Level Security en tablas de integracion LTI
-- Schema: lti_integration
-- Epic: EXT-007
-- Gap Reference: GAP-SYS-001 (CRITICAL - Security)
-- Created: 2026-02-03
-- =====================================================
--
-- IMPORTANTE: Las politicas estan definidas en 01-rls-policies.sql
-- Este archivo SOLO habilita RLS en las tablas.
--
-- Sin RLS habilitado, las politicas NO se aplican y cualquier
-- usuario puede acceder a todos los datos de integracion LTI.
-- =====================================================

-- =====================================================
-- TABLE: lti_integration.lti_consumers
-- Description: Configuracion de plataformas LMS (credenciales sensibles)
-- Risk: CRITICO - Credenciales OAuth y endpoints expuestos
-- =====================================================
ALTER TABLE lti_integration.lti_consumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lti_integration.lti_consumers FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: lti_integration.lti_sessions
-- Description: Sesiones activas de usuarios desde LMS externos
-- Risk: ALTO - Informacion de sesiones y tokens expuesta
-- Note: RLS ya habilitado en 07-enable-rls.sql, pero FORCE no aplicado
-- =====================================================
ALTER TABLE lti_integration.lti_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lti_integration.lti_sessions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: lti_integration.lti_grade_passbacks
-- Description: Registro de calificaciones enviadas a LMS
-- Risk: ALTO - Calificaciones de estudiantes expuestas
-- Note: RLS ya habilitado en 07-enable-rls.sql, pero FORCE no aplicado
-- =====================================================
ALTER TABLE lti_integration.lti_grade_passbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lti_integration.lti_grade_passbacks FORCE ROW LEVEL SECURITY;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tablas con RLS habilitado: 3
-- - lti_consumers (CRITICO) - Credenciales OAuth/OIDC
-- - lti_sessions (ALTO) - Sesiones de usuarios
-- - lti_grade_passback (ALTO) - Calificaciones
--
-- FORCE ROW LEVEL SECURITY:
-- - Aplicado a todas las tablas para que RLS aplique incluso
--   al propietario de la tabla (defense in depth)
--
-- Gap Reference: GAP-SYS-001 (CRITICAL - Security) - RESOLVED
-- =====================================================

-- Verificacion (ejecutar despues)
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'lti_integration';
