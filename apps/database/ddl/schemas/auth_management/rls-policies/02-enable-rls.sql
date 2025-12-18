-- =====================================================
-- Enable RLS for auth_management schema
-- Description: Habilita Row Level Security en tablas críticas
-- Created: 2025-12-14
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- =====================================================
--
-- IMPORTANTE: Las políticas están definidas en 01-policies.sql
-- Este archivo SOLO habilita RLS en las tablas.
--
-- Sin RLS habilitado, las políticas NO se aplican y cualquier
-- usuario puede acceder a todos los datos.
-- =====================================================

-- =====================================================
-- TABLE: auth_management.profiles
-- Description: Perfiles de usuario (109 FKs dependen de esta tabla)
-- Risk: CRÍTICO - Datos personales expuestos
-- =====================================================
ALTER TABLE auth_management.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.user_sessions
-- Description: Sesiones activas de usuario
-- Risk: ALTO - Información de sesiones expuesta
-- =====================================================
ALTER TABLE auth_management.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.user_sessions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.email_verification_tokens
-- Description: Tokens de verificación de email
-- Risk: ALTO - Tokens sensibles expuestos
-- =====================================================
ALTER TABLE auth_management.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.email_verification_tokens FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.password_reset_tokens
-- Description: Tokens de reset de contraseña
-- Risk: CRÍTICO - Tokens de reset expuestos
-- =====================================================
ALTER TABLE auth_management.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.password_reset_tokens FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.user_preferences
-- Description: Preferencias de usuario
-- Risk: MEDIO - Preferencias personales expuestas
-- =====================================================
ALTER TABLE auth_management.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.user_preferences FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.memberships
-- Description: Membresías de usuario en tenants
-- Risk: MEDIO - Información de membresía expuesta
-- =====================================================
ALTER TABLE auth_management.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.memberships FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.user_suspensions
-- Description: Suspensiones de usuario
-- Risk: ALTO - Información de suspensiones expuesta
-- =====================================================
ALTER TABLE auth_management.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.user_suspensions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.security_events
-- Description: Eventos de seguridad
-- Risk: ALTO - Log de eventos de seguridad expuesto
-- =====================================================
ALTER TABLE auth_management.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.security_events FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.tenants
-- Description: Información de tenants
-- Risk: MEDIO - Datos de organización expuestos
-- =====================================================
ALTER TABLE auth_management.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.tenants FORCE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: auth_management.user_roles (si existe tabla física)
-- NOTE: Verificar si user_roles existe como tabla o es derivada
-- =====================================================
-- ALTER TABLE auth_management.user_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE auth_management.user_roles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tablas con RLS habilitado: 9
-- - profiles (CRÍTICO)
-- - user_sessions (ALTO)
-- - email_verification_tokens (ALTO)
-- - password_reset_tokens (CRÍTICO)
-- - user_preferences (MEDIO)
-- - memberships (MEDIO)
-- - user_suspensions (ALTO)
-- - security_events (ALTO)
-- - tenants (MEDIO)
--
-- Tablas sin RLS (por diseño):
-- - auth_attempts (sistema-only, SECURITY DEFINER)
-- - roles (catálogo estático)
-- - auth_providers (catálogo estático)
-- =====================================================

-- Verificación (ejecutar después)
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'auth_management';
