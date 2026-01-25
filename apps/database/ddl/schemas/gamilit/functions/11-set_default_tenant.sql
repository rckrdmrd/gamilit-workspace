-- =====================================================
-- Function: gamilit.set_default_tenant
-- Description: Asigna automáticamente el tenant y school principal de GAMILIT a nuevos perfiles
-- Parameters: None (trigger function)
-- Returns: trigger
-- Created: 2025-11-19
-- Updated: 2026-01-25 - FIX-SCHOOL-ID: Agregada asignación automática de school_id
-- Issue: Usuarios registrados se asignaban a tenants personales en lugar del tenant principal
--        y no se les asignaba school_id (quedaba NULL)
-- Solution: Trigger BEFORE INSERT que fuerza el uso del tenant y school principal
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.set_default_tenant()
RETURNS TRIGGER AS $$
DECLARE
    v_main_tenant_id UUID;
    v_default_school_id UUID;
    v_tenant_count INTEGER;
BEGIN
    -- Paso 1: Intentar obtener el tenant principal de GAMILIT por slug
    -- FIX-2026-01-08: Corregido slug de 'gamilit-prod' a 'gamilit-platform'
    SELECT id INTO v_main_tenant_id
    FROM auth_management.tenants
    WHERE slug = 'gamilit-platform'
      AND is_active = true
    LIMIT 1;

    -- Paso 2: Si no existe, buscar por nombre
    IF v_main_tenant_id IS NULL THEN
        SELECT id INTO v_main_tenant_id
        FROM auth_management.tenants
        WHERE name = 'GAMILIT Platform'
          AND is_active = true
        LIMIT 1;
    END IF;

    -- Paso 3: Fallback - usar el primer tenant activo (por fecha de creación)
    IF v_main_tenant_id IS NULL THEN
        SELECT id INTO v_main_tenant_id
        FROM auth_management.tenants
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    -- Paso 4: Validar que existe al menos un tenant
    IF v_main_tenant_id IS NULL THEN
        -- Contar todos los tenants (activos e inactivos)
        SELECT COUNT(*) INTO v_tenant_count
        FROM auth_management.tenants;

        IF v_tenant_count = 0 THEN
            RAISE EXCEPTION 'CRITICAL ERROR: No existe ningún tenant en el sistema. Debe crear el tenant principal antes de registrar usuarios.';
        ELSE
            RAISE EXCEPTION 'CRITICAL ERROR: No hay tenants activos en el sistema (Total tenants: %). Active al menos un tenant.', v_tenant_count;
        END IF;
    END IF;

    -- Paso 5: Asignar el tenant principal al nuevo perfil
    NEW.tenant_id := v_main_tenant_id;

    -- Paso 6: Asignar la escuela default si no se especificó
    -- FIX-2026-01-25: Nuevos usuarios deben pertenecer a la institución default
    IF NEW.school_id IS NULL THEN
        -- Buscar por flag is_default en settings
        SELECT id INTO v_default_school_id
        FROM social_features.schools
        WHERE settings->>'is_default' = 'true'
          AND is_active = true
        LIMIT 1;

        -- Fallback: buscar por código conocido
        IF v_default_school_id IS NULL THEN
            SELECT id INTO v_default_school_id
            FROM social_features.schools
            WHERE code = 'GAMILIT-DEFAULT'
              AND is_active = true
            LIMIT 1;
        END IF;

        -- Asignar si se encontró
        IF v_default_school_id IS NOT NULL THEN
            NEW.school_id := v_default_school_id;
        END IF;
    END IF;

    -- Log informativo (visible en logs de PostgreSQL)
    RAISE NOTICE 'Usuario % asignado al tenant % (id: %) y school % (id: %)',
        NEW.email,
        (SELECT name FROM auth_management.tenants WHERE id = v_main_tenant_id),
        v_main_tenant_id,
        COALESCE((SELECT name FROM social_features.schools WHERE id = NEW.school_id), 'N/A'),
        COALESCE(NEW.school_id::text, 'NULL');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION gamilit.set_default_tenant() IS
    'Trigger function que asigna automaticamente el tenant y school principal de GAMILIT a nuevos perfiles. Implementa logica de fallback para garantizar que siempre exista un tenant valido. Prioridad tenant: 1) gamilit-platform, 2) GAMILIT Platform, 3) Primer tenant activo. Prioridad school: 1) settings.is_default=true, 2) code=GAMILIT-DEFAULT. Creado: 2025-11-19. Actualizado: 2026-01-25 con asignacion de school_id.';
