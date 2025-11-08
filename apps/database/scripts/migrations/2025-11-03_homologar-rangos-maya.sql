-- =====================================================================================
-- Migration: Homologación de Rangos Maya Legacy → Correctos
-- Fecha: 2025-11-03
-- Autor: VALIDATOR V2.0
-- Descripción: Migra rangos Maya de valores legacy a valores correctos oficiales
-- =====================================================================================

-- =====================================================================================
-- CONTEXTO
-- =====================================================================================
--
-- ANTES (Legacy - Incorrecto):
--   nacom, batab, holcatte, guerrero, mercenario (lowercase)
--
-- DESPUÉS (Correcto - V1.0):
--   Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan (Title Case)
--
-- TABLAS AFECTADAS:
--   - gamification_system.user_ranks (current_rank, previous_rank)
--   - gamification_system.user_stats (current_rank si existe)
--
-- REFERENCIAS:
--   - Validación: /docs-analysis/.../VALIDACION-VPS-POSTGRESQL.md
--   - ADR-004: Gamification System Design
--   - Docs: /docs/02-especificaciones-tecnicas/apis/gamificacion-api/01-RANGOS-MAYA.md
--
-- =====================================================================================

-- =====================================================================================
-- PASO 1: Verificar si enum maya_rank existe
-- =====================================================================================

DO $$
BEGIN
    -- Si el enum no existe, crearlo
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maya_rank') THEN
        RAISE NOTICE 'Creando enum maya_rank...';

        CREATE TYPE maya_rank AS ENUM (
            'Ajaw',           -- Nivel 1: Señor, líder supremo
            'Nacom',          -- Nivel 2: Capitán de guerra
            'Ah K''in',       -- Nivel 3: Sacerdote del sol
            'Halach Uinic',   -- Nivel 4: Hombre verdadero
            'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada
        );

        COMMENT ON TYPE maya_rank IS
            'Rangos del sistema de gamificación Maya (V1.0 - 2025-11-03). '
            'Progresión: Ajaw (inicial) → K''uk''ulkan (máximo).';

        RAISE NOTICE 'Enum maya_rank creado exitosamente';
    ELSE
        RAISE NOTICE 'Enum maya_rank ya existe, continuando...';
    END IF;
END $$;

-- =====================================================================================
-- PASO 2: Verificar si hay datos legacy en user_ranks
-- =====================================================================================

DO $$
DECLARE
    legacy_count INTEGER;
BEGIN
    -- Contar registros con valores legacy (case insensitive)
    SELECT COUNT(*) INTO legacy_count
    FROM gamification_system.user_ranks
    WHERE LOWER(current_rank::TEXT) IN ('nacom', 'batab', 'holcatte', 'guerrero', 'mercenario');

    IF legacy_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros con valores legacy que requieren migración', legacy_count;
    ELSE
        RAISE NOTICE 'No se encontraron valores legacy, tabla limpia o vacía';
    END IF;
END $$;

-- =====================================================================================
-- PASO 3: Migración de Datos (SOLO si existen valores legacy)
-- =====================================================================================

-- Nota: Este paso requiere que la columna current_rank sea TEXT temporalmente
-- Si es de tipo enum maya_rank antiguo, necesitaremos un enfoque diferente

DO $$
DECLARE
    column_type TEXT;
    needs_migration BOOLEAN := FALSE;
BEGIN
    -- Verificar tipo de columna current_rank
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_schema = 'gamification_system'
      AND table_name = 'user_ranks'
      AND column_name = 'current_rank';

    RAISE NOTICE 'Tipo actual de current_rank: %', column_type;

    -- Si la columna ya es USER-DEFINED (enum maya_rank correcto), skip migración
    IF column_type = 'USER-DEFINED' THEN
        RAISE NOTICE 'Columna ya es tipo enum, verificando valores...';

        -- Verificar si hay valores correctos
        IF EXISTS (
            SELECT 1 FROM gamification_system.user_ranks
            WHERE current_rank::TEXT IN ('Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan')
        ) THEN
            RAISE NOTICE 'Valores correctos encontrados, migración ya completada';
        ELSE
            RAISE NOTICE 'ADVERTENCIA: Columna es enum pero valores no coinciden';
            needs_migration := TRUE;
        END IF;
    ELSE
        -- Si es TEXT, proceder con migración
        needs_migration := TRUE;
    END IF;

    -- Ejecutar migración si es necesario
    IF needs_migration THEN
        RAISE NOTICE 'Iniciando migración de datos...';

        -- Estrategia: Agregar columna temporal, migrar, swap
        -- Paso 3.1: Agregar columna temporal con nuevo enum
        ALTER TABLE gamification_system.user_ranks
        ADD COLUMN IF NOT EXISTS current_rank_new maya_rank;

        ALTER TABLE gamification_system.user_ranks
        ADD COLUMN IF NOT EXISTS previous_rank_new maya_rank;

        -- Paso 3.2: Migrar current_rank con mapeo legacy → correcto
        UPDATE gamification_system.user_ranks
        SET current_rank_new = CASE LOWER(current_rank::TEXT)
            WHEN 'mercenario' THEN 'Ajaw'::maya_rank           -- Nivel más bajo legacy → inicial correcto
            WHEN 'guerrero' THEN 'Nacom'::maya_rank            -- Segundo nivel legacy → segundo correcto
            WHEN 'holcatte' THEN 'Ah K''in'::maya_rank         -- Tercer nivel legacy → tercero correcto
            WHEN 'batab' THEN 'Halach Uinic'::maya_rank        -- Cuarto nivel legacy → cuarto correcto
            WHEN 'nacom' THEN 'K''uk''ulkan'::maya_rank        -- Nivel más alto legacy → máximo correcto
            -- Si ya tiene valores correctos (migration re-run)
            WHEN 'ajaw' THEN 'Ajaw'::maya_rank
            WHEN 'nacom' THEN 'Nacom'::maya_rank
            WHEN 'ah k''in' THEN 'Ah K''in'::maya_rank
            WHEN 'halach uinic' THEN 'Halach Uinic'::maya_rank
            WHEN 'k''uk''ulkan' THEN 'K''uk''ulkan'::maya_rank
            ELSE 'Ajaw'::maya_rank  -- Default seguro
        END
        WHERE current_rank_new IS NULL;

        -- Paso 3.3: Migrar previous_rank
        UPDATE gamification_system.user_ranks
        SET previous_rank_new = CASE LOWER(previous_rank::TEXT)
            WHEN 'mercenario' THEN 'Ajaw'::maya_rank
            WHEN 'guerrero' THEN 'Nacom'::maya_rank
            WHEN 'holcatte' THEN 'Ah K''in'::maya_rank
            WHEN 'batab' THEN 'Halach Uinic'::maya_rank
            WHEN 'nacom' THEN 'K''uk''ulkan'::maya_rank
            WHEN 'ajaw' THEN 'Ajaw'::maya_rank
            WHEN 'nacom' THEN 'Nacom'::maya_rank
            WHEN 'ah k''in' THEN 'Ah K''in'::maya_rank
            WHEN 'halach uinic' THEN 'Halach Uinic'::maya_rank
            WHEN 'k''uk''ulkan' THEN 'K''uk''ulkan'::maya_rank
            ELSE NULL
        END
        WHERE previous_rank IS NOT NULL AND previous_rank_new IS NULL;

        -- Paso 3.4: Drop columnas antiguas y rename nuevas
        ALTER TABLE gamification_system.user_ranks DROP COLUMN IF EXISTS current_rank;
        ALTER TABLE gamification_system.user_ranks DROP COLUMN IF EXISTS previous_rank;

        ALTER TABLE gamification_system.user_ranks RENAME COLUMN current_rank_new TO current_rank;
        ALTER TABLE gamification_system.user_ranks RENAME COLUMN previous_rank_new TO previous_rank;

        -- Paso 3.5: Reestablecer default
        ALTER TABLE gamification_system.user_ranks
        ALTER COLUMN current_rank SET DEFAULT 'Ajaw'::maya_rank;

        -- Paso 3.6: Reestablecer NOT NULL constraint
        ALTER TABLE gamification_system.user_ranks
        ALTER COLUMN current_rank SET NOT NULL;

        RAISE NOTICE 'Migración de datos completada exitosamente';
    END IF;
END $$;

-- =====================================================================================
-- PASO 4: Actualizar comentarios de tabla
-- =====================================================================================

COMMENT ON TABLE gamification_system.user_ranks IS
    'Progresión de rangos maya: Ajaw → Nacom → Ah K''in → Halach Uinic → K''uk''ulkan';

COMMENT ON COLUMN gamification_system.user_ranks.current_rank IS
    'Rango maya actual del usuario (Ajaw es inicial, K''uk''ulkan es máximo)';

COMMENT ON COLUMN gamification_system.user_ranks.previous_rank IS
    'Rango maya anterior del usuario (para historial de progresión)';

-- =====================================================================================
-- PASO 5: Verificación post-migración
-- =====================================================================================

DO $$
DECLARE
    total_records INTEGER;
    correct_values INTEGER;
    legacy_values INTEGER;
BEGIN
    -- Contar total de registros
    SELECT COUNT(*) INTO total_records
    FROM gamification_system.user_ranks;

    -- Contar valores correctos
    SELECT COUNT(*) INTO correct_values
    FROM gamification_system.user_ranks
    WHERE current_rank::TEXT IN ('Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan');

    -- Contar valores legacy restantes
    SELECT COUNT(*) INTO legacy_values
    FROM gamification_system.user_ranks
    WHERE LOWER(current_rank::TEXT) IN ('nacom', 'batab', 'holcatte', 'guerrero', 'mercenario')
      AND current_rank::TEXT NOT IN ('Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan');

    RAISE NOTICE '====================================';
    RAISE NOTICE 'VERIFICACIÓN POST-MIGRACIÓN';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Total de registros: %', total_records;
    RAISE NOTICE 'Registros con valores correctos: %', correct_values;
    RAISE NOTICE 'Registros con valores legacy: %', legacy_values;

    IF total_records > 0 AND correct_values = total_records THEN
        RAISE NOTICE '✅ MIGRACIÓN EXITOSA: Todos los registros tienen valores correctos';
    ELSIF total_records = 0 THEN
        RAISE NOTICE '✅ TABLA VACÍA: No hay datos para migrar';
    ELSIF legacy_values > 0 THEN
        RAISE WARNING '⚠️ ADVERTENCIA: Aún hay % registros con valores legacy', legacy_values;
    ELSE
        RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
    END IF;
END $$;

-- =====================================================================================
-- PASO 6: Índices y constraints (si aplica)
-- =====================================================================================

-- Verificar que los índices existentes sigan funcionando
-- (Los índices en enums son automáticos en PostgreSQL)

-- =====================================================================================
-- FIN DE MIGRACIÓN
-- =====================================================================================

-- Nota: Este script es idempotente y puede ejecutarse múltiples veces sin efecto adverso
-- Si la migración ya se completó, detectará valores correctos y saltará los pasos necesarios
