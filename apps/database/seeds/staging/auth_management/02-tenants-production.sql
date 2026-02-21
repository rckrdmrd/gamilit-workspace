-- =====================================================
-- Seed: auth_management.tenants - Cleanup Personal Tenants
-- Description: Elimina tenants personales huerfanos de estudiantes
-- Environment: ALL (dev + prod)
-- Dependencies: auth_management/01-tenants.sql
-- Order: 02
-- Created: 2025-11-19
-- Updated: 2026-02-11 - CORRECCION: Reemplazado INSERT por DELETE
-- Version: 3.0
-- =====================================================
--
-- HISTORIAL DEL PROBLEMA:
-- - v1.0 (2025-11-19): Creaba 13 tenants personales por estudiante
-- - v2.0 (2026-01-08): Profiles corregidos al tenant principal, pero
--   tenants personales NO fueron eliminados
-- - v3.0 (2026-02-11): CORRECCION DEFINITIVA - Elimina tenants personales
--
-- CAUSA RAIZ:
-- Cuando los primeros 13 estudiantes se registraron en produccion,
-- el backend creaba un tenant personal por cada usuario.
-- Esto fue corregido con el trigger trg_set_default_tenant, pero
-- los tenants huerfanos persistian en la BD y aparecian como
-- "instituciones" en el portal admin.
--
-- SOLUCION:
-- 1. Eliminar tenants personales que ya no tienen profiles asociados
-- 2. Reasignar profiles residuales al tenant principal (por seguridad)
-- 3. Todos los usuarios deben estar bajo el tenant GAMILIT Platform
--
-- DECISION DE DISENO (2026-02-11):
-- - Solo debe existir UN tenant: GAMILIT Platform
-- - NO se crean tenants personales para usuarios
-- - El trigger trg_set_default_tenant garantiza esto para nuevos registros
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- PASO 1: Reasignar profiles residuales al tenant principal
-- (por seguridad, en caso de que algun profile apunte a un tenant personal)
-- =====================================================

DO $$
DECLARE
    v_main_tenant_id UUID;
    v_reassigned_count INTEGER;
BEGIN
    -- Obtener el tenant principal
    SELECT id INTO v_main_tenant_id
    FROM auth_management.tenants
    WHERE slug = 'gamilit-platform'
      AND is_active = true
    LIMIT 1;

    IF v_main_tenant_id IS NULL THEN
        RAISE NOTICE 'Tenant principal no encontrado. Saltando reasignacion.';
        RETURN;
    END IF;

    -- Reasignar profiles que apunten a tenants personales
    UPDATE auth_management.profiles
    SET tenant_id = v_main_tenant_id,
        updated_at = NOW()
    WHERE tenant_id IN (
        SELECT id FROM auth_management.tenants
        WHERE metadata->>'personal_tenant' = 'true'
    )
    AND tenant_id != v_main_tenant_id;

    GET DIAGNOSTICS v_reassigned_count = ROW_COUNT;

    IF v_reassigned_count > 0 THEN
        RAISE NOTICE '⚠ Reasignados % profiles al tenant principal', v_reassigned_count;
    ELSE
        RAISE NOTICE '✓ Ningun profile apuntaba a tenants personales';
    END IF;
END $$;

-- =====================================================
-- PASO 2: Eliminar tenants personales huerfanos
-- =====================================================

DO $$
DECLARE
    v_deleted_count INTEGER;
    v_blocked_count INTEGER;
BEGIN
    -- Contar tenants personales que AUN tienen profiles (no deberia haber despues del paso 1)
    SELECT COUNT(*) INTO v_blocked_count
    FROM auth_management.tenants t
    WHERE t.metadata->>'personal_tenant' = 'true'
      AND EXISTS (
          SELECT 1 FROM auth_management.profiles p WHERE p.tenant_id = t.id
      );

    IF v_blocked_count > 0 THEN
        RAISE WARNING '⚠ % tenants personales aun tienen profiles asociados. No se eliminaran.', v_blocked_count;
    END IF;

    -- Eliminar tenants personales sin profiles asociados
    DELETE FROM auth_management.tenants
    WHERE metadata->>'personal_tenant' = 'true'
      AND NOT EXISTS (
          SELECT 1 FROM auth_management.profiles p WHERE p.tenant_id = tenants.id
      );

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'LIMPIEZA DE TENANTS PERSONALES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tenants personales eliminados: %', v_deleted_count;
    RAISE NOTICE 'Tenants personales bloqueados (con profiles): %', v_blocked_count;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PASO 3: Verificacion final
-- =====================================================

DO $$
DECLARE
    v_total_tenants INTEGER;
    v_personal_remaining INTEGER;
    v_main_tenant RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_tenants FROM auth_management.tenants;

    SELECT COUNT(*) INTO v_personal_remaining
    FROM auth_management.tenants
    WHERE metadata->>'personal_tenant' = 'true';

    SELECT id, name, slug INTO v_main_tenant
    FROM auth_management.tenants
    WHERE slug = 'gamilit-platform' AND is_active = true;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACION FINAL DE TENANTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total tenants: %', v_total_tenants;
    RAISE NOTICE 'Tenants personales restantes: %', v_personal_remaining;

    IF v_main_tenant.id IS NOT NULL THEN
        RAISE NOTICE '✓ Tenant principal: % (slug: %)', v_main_tenant.name, v_main_tenant.slug;
    ELSE
        RAISE WARNING '⚠ Tenant principal NO encontrado';
    END IF;

    IF v_personal_remaining = 0 THEN
        RAISE NOTICE '✓ No quedan tenants personales en el sistema';
    ELSE
        RAISE WARNING '⚠ Quedan % tenants personales', v_personal_remaining;
    END IF;

    IF v_total_tenants = 1 AND v_personal_remaining = 0 THEN
        RAISE NOTICE '✅ Estado correcto: Solo existe el tenant principal GAMILIT Platform';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- CHANGELOG
-- =====================================================
-- v3.0 (2026-02-11): CORRECCION DEFINITIVA
--   - Reemplazado INSERT de 13 tenants personales por DELETE
--   - Reasigna profiles residuales al tenant principal
--   - Elimina tenants personales huerfanos
--   - Idempotente: seguro de ejecutar multiples veces
--   - Homologado dev/prod (mismo contenido)
--
-- v1.0 (2025-11-19): Primera version (OBSOLETA)
--   - Creaba 13 tenants personales de estudiantes
--   - Causa del bug: alumnos aparecian como instituciones
-- =====================================================
