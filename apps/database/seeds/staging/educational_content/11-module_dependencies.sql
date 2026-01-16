-- =====================================================
-- Seed: educational_content.module_dependencies
-- Description: Dependencias entre módulos educativos
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- Created: 2025-12-14
-- =====================================================
--
-- Este seed define las dependencias/prerrequisitos entre módulos.
-- La progresión del estudiante se valida usando estas dependencias.
--
-- Estructura de módulos GAMILIT:
-- - MOD-01-LITERAL: Comprensión Literal (sin prerrequisitos)
-- - MOD-02-INFERENCIAL: Comprensión Inferencial (requiere MOD-01)
-- - MOD-03-CRITICA: Comprensión Crítica (requiere MOD-02)
-- - MOD-04-DIGITAL: Lectura Digital (requiere MOD-01, recomendado MOD-02)
-- - MOD-05-PRODUCCION: Producción Lectora (requiere MOD-03)
--
-- Tipos de dependencia:
-- - required: Debe completarse antes (bloqueante)
-- - recommended: Se recomienda completar antes
-- - optional: Complementario, no bloqueante
-- =====================================================

DO $$
DECLARE
    v_mod1_id UUID;
    v_mod2_id UUID;
    v_mod3_id UUID;
    v_mod4_id UUID;
    v_mod5_id UUID;
BEGIN
    -- Obtener IDs de módulos por su código
    SELECT id INTO v_mod1_id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL';
    SELECT id INTO v_mod2_id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL';
    SELECT id INTO v_mod3_id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA';
    SELECT id INTO v_mod4_id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL';
    SELECT id INTO v_mod5_id FROM educational_content.modules WHERE module_code = 'MOD-05-PRODUCCION';

    -- Verificar que todos los módulos existen
    IF v_mod1_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-01-LITERAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF v_mod2_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-02-INFERENCIAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF v_mod3_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-03-CRITICA no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF v_mod4_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-04-DIGITAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF v_mod5_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-05-PRODUCCION no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    RAISE NOTICE 'Todos los módulos encontrados. Creando dependencias...';

    -- =====================================================
    -- DEPENDENCIA 1: MOD-02 requiere MOD-01 (100%)
    -- Comprensión Inferencial requiere Comprensión Literal
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000001'::uuid,
        v_mod2_id,
        v_mod1_id,
        'required',
        80  -- 80% del módulo 1 debe completarse
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-02 → MOD-01 (required, 80%%)';

    -- =====================================================
    -- DEPENDENCIA 2: MOD-03 requiere MOD-02 (100%)
    -- Comprensión Crítica requiere Comprensión Inferencial
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000002'::uuid,
        v_mod3_id,
        v_mod2_id,
        'required',
        80  -- 80% del módulo 2 debe completarse
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-03 → MOD-02 (required, 80%%)';

    -- =====================================================
    -- DEPENDENCIA 3: MOD-04 requiere MOD-01 (50%)
    -- Lectura Digital requiere base de Comprensión Literal
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000003'::uuid,
        v_mod4_id,
        v_mod1_id,
        'required',
        50  -- 50% del módulo 1 (más flexible para ruta paralela)
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-04 → MOD-01 (required, 50%%)';

    -- =====================================================
    -- DEPENDENCIA 4: MOD-04 recomienda MOD-02
    -- Se beneficia de habilidades inferenciales pero no es bloqueante
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000004'::uuid,
        v_mod4_id,
        v_mod2_id,
        'recommended',
        60  -- 60% recomendado pero no obligatorio
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-04 → MOD-02 (recommended, 60%%)';

    -- =====================================================
    -- DEPENDENCIA 5: MOD-05 requiere MOD-03 (100%)
    -- Producción Lectora requiere maestría en Comprensión Crítica
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000005'::uuid,
        v_mod5_id,
        v_mod3_id,
        'required',
        80  -- 80% del módulo 3 (alto requisito para producción)
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-05 → MOD-03 (required, 80%%)';

    -- =====================================================
    -- DEPENDENCIA 6: MOD-05 recomienda MOD-04
    -- Habilidades digitales complementan la producción
    -- =====================================================
    INSERT INTO educational_content.module_dependencies (
        id,
        module_id,
        prerequisite_module_id,
        dependency_type,
        minimum_completion_percentage
    ) VALUES (
        '30000001-0000-0000-0000-000000000006'::uuid,
        v_mod5_id,
        v_mod4_id,
        'recommended',
        50  -- 50% recomendado para producción digital
    )
    ON CONFLICT (module_id, prerequisite_module_id) DO UPDATE SET
        dependency_type = EXCLUDED.dependency_type,
        minimum_completion_percentage = EXCLUDED.minimum_completion_percentage;

    RAISE NOTICE '✅ MOD-05 → MOD-04 (recommended, 50%%)';

    -- =====================================================
    -- VERIFICACIÓN
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== DEPENDENCIAS DE MÓDULOS CREADAS ===';
    RAISE NOTICE 'Total dependencias: %', (SELECT COUNT(*) FROM educational_content.module_dependencies);
    RAISE NOTICE 'Required: %', (SELECT COUNT(*) FROM educational_content.module_dependencies WHERE dependency_type = 'required');
    RAISE NOTICE 'Recommended: %', (SELECT COUNT(*) FROM educational_content.module_dependencies WHERE dependency_type = 'recommended');

END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM educational_content.module_dependencies;

    IF v_count < 5 THEN
        RAISE WARNING '⚠️ Se esperaban al menos 5 dependencias de módulos';
    ELSE
        RAISE NOTICE '✅ Seed de module_dependencies completado exitosamente';
    END IF;
END $$;

-- =====================================================
-- MAPA DE DEPENDENCIAS (COMENTARIO)
-- =====================================================
/*
    RUTA DE PROGRESIÓN GAMILIT:

    ┌─────────────────┐
    │  MOD-01-LITERAL │  ← Punto de entrada (sin prerrequisitos)
    │  (Comprensión   │
    │   Literal)      │
    └────────┬────────┘
             │
             │ required (80%)
             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │ MOD-02-INFEREN. │          │ MOD-04-DIGITAL  │
    │ (Comprensión    │          │ (Lectura        │ ← Ruta paralela (50% MOD-01)
    │  Inferencial)   │ ········>│  Digital)       │   recommended MOD-02
    └────────┬────────┘          └────────┬────────┘
             │                            │
             │ required (80%)             │ recommended (50%)
             ▼                            │
    ┌─────────────────┐                   │
    │ MOD-03-CRITICA  │                   │
    │ (Comprensión    │                   │
    │  Crítica)       │                   │
    └────────┬────────┘                   │
             │                            │
             │ required (80%)             │
             ▼                            │
    ┌─────────────────┐◀──────────────────┘
    │ MOD-05-PRODUC.  │
    │ (Producción     │  ← Requiere MOD-03, recomienda MOD-04
    │  Lectora)       │
    └─────────────────┘
*/
