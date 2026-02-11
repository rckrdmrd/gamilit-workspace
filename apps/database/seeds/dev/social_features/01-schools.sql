-- =====================================================
-- Seed: social_features.schools (DEV)
-- Description: NO demo schools - Solo escuela default
-- Environment: DEVELOPMENT
-- Dependencies: auth_management.tenants
-- Order: 01
-- Created: 2025-01-11
-- Updated: 2025-12-15 - Removidas escuelas demo
-- Version: 3.0
-- =====================================================
--
-- NOTA: Este archivo está intencionalmente vacío de INSERTs.
--
-- DECISIÓN DE DISEÑO:
-- - Solo existe la escuela default "Sistema - Por Asignar" (GAMILIT-DEFAULT)
-- - Creada en 00-schools-default.sql
-- - Todas las escuelas adicionales serán creadas por el admin desde la UI
--
-- ESCUELAS DEMO REMOVIDAS (v3.0):
-- - Secundaria Federal No. 15 "Marie Curie" - REMOVIDA
-- - Secundaria Técnica No. 42 - REMOVIDA
-- - Colegio Científico "Albert Einstein" - REMOVIDA
--
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- Verification Query - Solo escuela default
-- =====================================================

DO $$
DECLARE
    school_count INTEGER;
    default_school_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO school_count
    FROM social_features.schools;

    SELECT EXISTS(
        SELECT 1 FROM social_features.schools
        WHERE code = 'GAMILIT-DEFAULT' AND is_active = true
    ) INTO default_school_exists;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE ESCUELAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total escuelas: %', school_count;
    RAISE NOTICE 'Escuela default existe: %', default_school_exists;
    RAISE NOTICE '========================================';

    IF default_school_exists THEN
        RAISE NOTICE '✓ Escuela default (GAMILIT-DEFAULT) configurada correctamente';
        RAISE NOTICE '  Las demás escuelas serán creadas por el admin desde la UI';
    ELSE
        RAISE WARNING '⚠ Escuela default NO encontrada. Ejecutar 00-schools-default.sql primero';
    END IF;
END $$;
