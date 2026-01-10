-- =====================================================
-- Archivo: 00-batch_updated_at_triggers.sql
-- Schema: auth_management
-- Descripcion: Triggers de actualizacion automatica de updated_at
-- Funcion: gamilit.update_updated_at_column()
-- Fecha de consolidacion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 1)
-- =====================================================

-- =====================================================
-- TRIGGERS DE ACTUALIZACION DE TIMESTAMP
-- =====================================================

-- Tabla: auth_management.memberships
DROP TRIGGER IF EXISTS trg_memberships_updated_at ON auth_management.memberships CASCADE;
CREATE TRIGGER trg_memberships_updated_at
    BEFORE UPDATE ON auth_management.memberships
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_memberships_updated_at ON auth_management.memberships
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: auth_management.profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON auth_management.profiles CASCADE;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_profiles_updated_at ON auth_management.profiles
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: auth_management.tenants
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON auth_management.tenants CASCADE;
CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON auth_management.tenants
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_tenants_updated_at ON auth_management.tenants
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: auth_management.user_roles
DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON auth_management.user_roles CASCADE;
CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON auth_management.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_user_roles_updated_at ON auth_management.user_roles
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- Tabla: auth_management.roles (agregado 2026-01-07 - consolidacion duplicados)
DROP TRIGGER IF EXISTS trg_roles_updated_at ON auth_management.roles CASCADE;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON auth_management.roles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_roles_updated_at ON auth_management.roles
    IS 'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- FIN DE TRIGGERS CONSOLIDADOS
-- Total: 5 triggers
-- =====================================================
