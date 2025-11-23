-- ============================================================================
-- SCRIPT: Fix Function Volatility (P1 - CRÍTICO)
-- Fecha: 2025-11-08
-- Descripción: Corrige la volatilidad de gamilit.now_mexico() de IMMUTABLE
--              a STABLE
-- ============================================================================
--
-- PROBLEMA:
--   La función gamilit.now_mexico() está marcada como IMMUTABLE pero usa NOW(),
--   lo cual es incorrecto.
--
-- EXPLICACIÓN DE VOLATILIDADES:
--   - IMMUTABLE: Siempre retorna el mismo resultado para los mismos argumentos
--                (ej: funciones matemáticas puras)
--   - STABLE:    Retorna el mismo resultado dentro de la misma transacción
--                (ej: NOW(), CURRENT_TIMESTAMP)
--   - VOLATILE:  Puede retornar diferentes resultados en llamadas sucesivas
--                (ej: random(), nextval())
--
-- POR QUÉ ES INCORRECTO:
--   NOW() es STABLE (no IMMUTABLE) porque:
--   - Dentro de una transacción: siempre retorna el mismo timestamp
--   - Entre transacciones: retorna timestamps diferentes
--
-- CONSECUENCIAS DE MARCAR INCORRECTAMENTE:
--   - Resultados incorrectos en índices
--   - Cache de valores que deberían cambiar
--   - Comportamiento impredecible en queries
--   - Violaciones de integridad temporal
--
-- IMPACTO:
--   🟠 CRÍTICO - Puede causar bugs sutiles y difíciles de detectar
--
-- REFERENCIA:
--   https://www.postgresql.org/docs/current/xfunc-volatility.html
--
-- USO:
--   psql "$DATABASE_URL" -f apps/database/scripts/fix-function-volatility.sql
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- VERIFICACIÓN PRE-CORRECCIÓN
-- ============================================================================

DO $$
DECLARE
    v_current_volatility CHAR(1);
    v_volatility_name TEXT;
BEGIN
    SELECT provolatile INTO v_current_volatility
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'gamilit'
      AND p.proname = 'now_mexico';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Function gamilit.now_mexico() not found';
    END IF;

    v_volatility_name := CASE v_current_volatility
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END;

    RAISE NOTICE 'Current volatility: % (%)', v_volatility_name, v_current_volatility;

    IF v_current_volatility = 'i' THEN
        RAISE NOTICE '❌ Incorrectly marked as IMMUTABLE - will fix';
    ELSIF v_current_volatility = 's' THEN
        RAISE NOTICE '✅ Already correct (STABLE) - no changes needed';
    ELSE
        RAISE WARNING '⚠️  Marked as VOLATILE - should be STABLE';
    END IF;
END $$;

-- ============================================================================
-- CORREGIR FUNCIÓN: gamilit.now_mexico()
-- ============================================================================

CREATE OR REPLACE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
STABLE  -- ✅ CORRECTO: STABLE porque usa NOW()
SECURITY DEFINER
SET search_path = gamilit, public
AS $$
BEGIN
    -- NOW() es STABLE: retorna el mismo valor dentro de una transacción
    -- pero cambia entre transacciones
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';
END;
$$;

COMMENT ON FUNCTION gamilit.now_mexico() IS
    'Retorna el timestamp actual en zona horaria de México (America/Mexico_City) (v1.1 - 2025-11-08). '
    'STABLE: Retorna el mismo valor dentro de una transacción pero cambia entre transacciones. '
    'CORREGIDO: Anteriormente marcada incorrectamente como IMMUTABLE.';

RAISE NOTICE '✅ Fixed: gamilit.now_mexico() volatility changed to STABLE';

-- ============================================================================
-- VERIFICAR OTRAS FUNCIONES CON VOLATILIDAD POTENCIALMENTE INCORRECTA
-- ============================================================================

RAISE NOTICE 'Checking other functions for incorrect volatility...';

DO $$
DECLARE
    v_suspicious_count INTEGER;
BEGIN
    -- Buscar funciones marcadas como IMMUTABLE que usan NOW(), CURRENT_TIMESTAMP, etc.
    -- (esta es una verificación simplificada basada en el nombre de la función)

    SELECT COUNT(*) INTO v_suspicious_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND p.provolatile = 'i'  -- IMMUTABLE
      AND (
          p.prosrc LIKE '%NOW()%'
          OR p.prosrc LIKE '%CURRENT_TIMESTAMP%'
          OR p.prosrc LIKE '%CURRENT_TIME%'
          OR p.prosrc LIKE '%CURRENT_DATE%'
          OR p.prosrc LIKE '%LOCALTIMESTAMP%'
      );

    IF v_suspicious_count > 0 THEN
        RAISE WARNING '⚠️  Found % other function(s) marked as IMMUTABLE but using time functions', v_suspicious_count;
        RAISE WARNING 'Run the following query to see them:';
        RAISE WARNING 'SELECT n.nspname || ''.'' || p.proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname NOT IN (''pg_catalog'', ''information_schema'') AND p.provolatile = ''i'' AND (p.prosrc LIKE ''%%NOW()%%'' OR p.prosrc LIKE ''%%CURRENT_TIMESTAMP%%'');';
    ELSE
        RAISE NOTICE '✅ No other suspicious IMMUTABLE functions found';
    END IF;
END $$;

-- ============================================================================
-- VERIFICAR FUNCIONES QUE LLAMAN A now_mexico()
-- ============================================================================

RAISE NOTICE 'Checking functions that call now_mexico()...';

DO $$
DECLARE
    v_caller_count INTEGER;
BEGIN
    -- Buscar funciones que llaman a now_mexico()
    SELECT COUNT(*) INTO v_caller_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND p.prosrc LIKE '%now_mexico()%';

    IF v_caller_count > 0 THEN
        RAISE NOTICE 'Found % function(s) that call now_mexico()', v_caller_count;
        RAISE NOTICE 'These should be marked as STABLE or VOLATILE (not IMMUTABLE)';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- ACTUALIZAR ARCHIVO DDL
-- ============================================================================
--
-- ACCIÓN MANUAL REQUERIDA: Actualizar el archivo DDL:
--
-- apps/database/ddl/schemas/gamilit/functions/01-now_mexico.sql
--
-- Cambiar línea 8:
--   De:  IMMUTABLE
--   A:   STABLE
--
-- Cambiar línea 9 (agregar):
--   SET search_path = gamilit, public
--
-- Actualizar comentario (línea 13):
--   Agregar nota sobre la corrección de volatilidad
--
-- ============================================================================

-- ============================================================================
-- VALIDACIÓN POST-CORRECCIÓN
-- ============================================================================

DO $$
DECLARE
    v_new_volatility CHAR(1);
    v_volatility_name TEXT;
BEGIN
    SELECT provolatile INTO v_new_volatility
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'gamilit'
      AND p.proname = 'now_mexico';

    v_volatility_name := CASE v_new_volatility
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END;

    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Function Volatility Fix Summary';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Function: gamilit.now_mexico()';
    RAISE NOTICE 'New volatility: % (%)', v_volatility_name, v_new_volatility;

    IF v_new_volatility = 's' THEN
        RAISE NOTICE '✅ Function volatility is now correct (STABLE)';
    ELSE
        RAISE EXCEPTION '❌ Function volatility is still incorrect: %', v_volatility_name;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Update DDL file gamilit/functions/01-now_mexico.sql';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- TESTING (OPCIONAL)
-- ============================================================================
--
-- Verificar comportamiento STABLE:
--
-- BEGIN;
-- SELECT gamilit.now_mexico() AS time_1;
-- SELECT pg_sleep(2);
-- SELECT gamilit.now_mexico() AS time_2;
-- -- time_1 y time_2 deberían ser iguales (dentro de la misma transacción)
-- COMMIT;
--
-- BEGIN;
-- SELECT gamilit.now_mexico() AS time_3;
-- COMMIT;
-- -- time_3 debería ser diferente a time_1 y time_2 (transacción diferente)
--
-- ============================================================================
