# Optimizaciones Sugeridas - Base de Datos GAMILIT

**Fecha:** 2025-11-23
**Agente:** Database-Agent
**Alcance:** Optimizaciones de performance y mantenibilidad
**Versión:** 1.0
**Priorización:** P0 (Crítica) → P3 (Baja)

---

## 📋 ÍNDICE

1. [Optimizaciones P0 - Críticas (Pre-Deploy)](#1-optimizaciones-p0---críticas-pre-deploy)
2. [Optimizaciones P1 - Altas (Post-MVP)](#2-optimizaciones-p1---altas-post-mvp)
3. [Optimizaciones P2 - Medias (Mantenimiento)](#3-optimizaciones-p2---medias-mantenimiento)
4. [Optimizaciones P3 - Bajas (Mejoras Futuras)](#4-optimizaciones-p3---bajas-mejoras-futuras)
5. [Scripts SQL de Implementación](#5-scripts-sql-de-implementación)

---

## 1. OPTIMIZACIONES P0 - CRÍTICAS (Pre-Deploy)

### OPT-P0-001: Sincronizar Seeds Prod con Dev v2.1

**Problema:**
Seeds de módulos en producción están desactualizados (v2.0) mientras que dev está en v2.1 con módulos 4-5 en status `backlog`.

**Impacto:**
- 🔴 **ALTO** - Módulos 4-5 aparecerán como disponibles en prod cuando deberían mostrar "En Construcción".
- Inconsistencia entre frontend (UnderConstructionExercise.tsx) y backend.

**Solución:**

```bash
# Paso 1: Backup de seed prod actual
cp apps/database/seeds/prod/educational_content/01-modules.sql \
   apps/database/seeds/prod/educational_content/01-modules.sql.backup.v2.0

# Paso 2: Copiar versión actualizada dev → prod
cp apps/database/seeds/dev/educational_content/01-modules.sql \
   apps/database/seeds/prod/educational_content/01-modules.sql

# Paso 3: Validar en staging
psql -U gamilit_user -d gamilit_staging \
  -f apps/database/seeds/prod/educational_content/01-modules.sql

# Paso 4: Verificar que módulos 4-5 tienen status='backlog'
psql -U gamilit_user -d gamilit_staging -c \
  "SELECT module_code, status, is_published FROM educational_content.modules WHERE module_code IN ('MOD-04-DIGITAL', 'MOD-05-PRODUCCION');"
```

**Resultado Esperado:**
```
 module_code      | status  | is_published
------------------+---------+--------------
 MOD-04-DIGITAL   | backlog | f
 MOD-05-PRODUCCION| backlog | f
```

**Estimación:** 5 minutos
**Prioridad:** P0 - Debe ejecutarse HOY antes de deploy

---

### OPT-P0-002: Validar Integridad Referencial (Detectar Huérfanos)

**Problema:**
No hay validación automatizada de que todos los registros relacionados existen (no hay huérfanos).

**Impacto:**
- 🟡 **MEDIO** - Posibles errores en runtime si ejercicios sin módulo, user_stats sin usuario, etc.

**Solución:**

```sql
-- Script: apps/database/scripts/validate_referential_integrity.sql

SET search_path TO educational_content, gamification_system, progress_tracking, auth, public;

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- 1. Ejercicios sin módulo
    SELECT COUNT(*) INTO orphan_count
    FROM educational_content.exercises e
    WHERE NOT EXISTS (SELECT 1 FROM educational_content.modules m WHERE m.id = e.module_id);

    IF orphan_count > 0 THEN
        RAISE WARNING '❌ INTEGRIDAD: % ejercicios sin módulo padre', orphan_count;
    ELSE
        RAISE NOTICE '✅ INTEGRIDAD: Todos los ejercicios tienen módulo padre';
    END IF;

    -- 2. User stats sin usuario
    SELECT COUNT(*) INTO orphan_count
    FROM gamification_system.user_stats us
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = us.user_id);

    IF orphan_count > 0 THEN
        RAISE WARNING '❌ INTEGRIDAD: % user_stats sin usuario', orphan_count;
    ELSE
        RAISE NOTICE '✅ INTEGRIDAD: Todos los user_stats tienen usuario válido';
    END IF;

    -- 3. Module progress sin módulo
    SELECT COUNT(*) INTO orphan_count
    FROM progress_tracking.module_progress mp
    WHERE NOT EXISTS (SELECT 1 FROM educational_content.modules m WHERE m.id = mp.module_id);

    IF orphan_count > 0 THEN
        RAISE WARNING '❌ INTEGRIDAD: % module_progress sin módulo', orphan_count;
    ELSE
        RAISE NOTICE '✅ INTEGRIDAD: Todos los module_progress tienen módulo válido';
    END IF;

    -- 4. Exercise attempts sin ejercicio
    SELECT COUNT(*) INTO orphan_count
    FROM progress_tracking.exercise_attempts ea
    WHERE NOT EXISTS (SELECT 1 FROM educational_content.exercises e WHERE e.id = ea.exercise_id);

    IF orphan_count > 0 THEN
        RAISE WARNING '❌ INTEGRIDAD: % exercise_attempts sin ejercicio', orphan_count;
    ELSE
        RAISE NOTICE '✅ INTEGRIDAD: Todos los exercise_attempts tienen ejercicio válido';
    END IF;

    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ VALIDACIÓN DE INTEGRIDAD COMPLETADA';
    RAISE NOTICE '==========================================';
END $$;
```

**Ejecución:**
```bash
psql -U gamilit_user -d gamilit_staging \
  -f apps/database/scripts/validate_referential_integrity.sql
```

**Estimación:** 15 minutos (escribir + ejecutar)
**Prioridad:** P0 - Ejecutar HOY antes de deploy

---

## 2. OPTIMIZACIONES P1 - ALTAS (Post-MVP)

### OPT-P1-001: Implementar Tests de RLS Policies

**Problema:**
241 políticas RLS implementadas sin test coverage automatizado. Riesgo de fuga de datos.

**Impacto:**
- 🔴 **ALTO** - Seguridad multi-tenant en riesgo. Estudiante podría ver datos de otros usuarios.

**Solución:**

Crear suite de tests PL/pgSQL en `apps/database/tests/rls-policies/`:

```sql
-- File: apps/database/tests/rls-policies/test_progress_tracking_rls.sql

SET search_path TO progress_tracking, auth, gamilit, public;

-- =====================================================
-- TEST SUITE: RLS Policies - progress_tracking schema
-- =====================================================

DO $$
DECLARE
    test_user_1 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
    test_user_2 UUID := 'b1ffcd00-ad1c-5fg9-cc7e-7cc0ce491b22'::uuid;
    result_count INTEGER;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TEST: RLS Policies - module_progress';
    RAISE NOTICE '==========================================';

    -- TEST 1: Student puede ver solo su propio progreso
    RAISE NOTICE 'TEST 1: Student ve solo su progreso...';

    -- Simular usuario test_user_1
    PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_1::text)::text, true);

    SELECT COUNT(*) INTO result_count
    FROM progress_tracking.module_progress
    WHERE user_id = test_user_1;

    IF result_count > 0 THEN
        RAISE NOTICE '✅ TEST 1 PASSED: Student ve su progreso (% registros)', result_count;
    ELSE
        RAISE WARNING '❌ TEST 1 FAILED: Student no ve su progreso';
    END IF;

    -- TEST 2: Student NO puede ver progreso de otros
    RAISE NOTICE 'TEST 2: Student NO ve progreso de otros...';

    SELECT COUNT(*) INTO result_count
    FROM progress_tracking.module_progress
    WHERE user_id = test_user_2;  -- Intentar ver progreso de otro usuario

    IF result_count = 0 THEN
        RAISE NOTICE '✅ TEST 2 PASSED: Student NO ve progreso de otros';
    ELSE
        RAISE WARNING '❌ TEST 2 FAILED: Student puede ver progreso de otros (% registros)', result_count;
    END IF;

    -- TEST 3: Admin puede ver progreso de su tenant
    RAISE NOTICE 'TEST 3: Admin ve todo su tenant...';

    -- Simular admin
    PERFORM set_config('request.jwt.claims', json_build_object(
        'sub', test_user_1::text,
        'role', 'admin_teacher'
    )::text, true);

    SELECT COUNT(*) INTO result_count
    FROM progress_tracking.module_progress
    WHERE tenant_id = (SELECT tenant_id FROM auth_management.profiles WHERE id = test_user_1);

    IF result_count >= 1 THEN
        RAISE NOTICE '✅ TEST 3 PASSED: Admin ve progreso de su tenant (% registros)', result_count;
    ELSE
        RAISE WARNING '❌ TEST 3 FAILED: Admin no ve progreso de su tenant';
    END IF;

    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ TEST SUITE COMPLETADO';
    RAISE NOTICE '==========================================';
END $$;
```

**Tests Adicionales Requeridos:**
1. `test_gamification_rls.sql` - 8 policies de gamification_system
2. `test_social_features_rls.sql` - 8 policies de social_features
3. `test_educational_content_rls.sql` - 2 policies de educational_content

**Ejecución en CI/CD:**
```yaml
# .github/workflows/database-tests.yml
name: Database RLS Tests
on: [push, pull_request]
jobs:
  test-rls:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - name: Run RLS tests
        run: |
          psql -U postgres -d gamilit_test \
            -f apps/database/tests/rls-policies/test_progress_tracking_rls.sql
          psql -U postgres -d gamilit_test \
            -f apps/database/tests/rls-policies/test_gamification_rls.sql
```

**Estimación:** 16-20 horas (40 policies críticas)
**Prioridad:** P1 - Implementar en Semana 1 post-MVP

---

### OPT-P1-002: Optimizar Función `calculate_module_progress()`

**Problema:**
Función `calculate_module_progress()` hace múltiples queries sin índices optimizados.

**Impacto:**
- 🟡 **MEDIO** - Latencia de 200-500ms al calcular progreso (objetivo: <100ms).

**Solución:**

```sql
-- File: apps/database/ddl/schemas/progress_tracking/functions/01-calculate_module_progress_v2.sql

CREATE OR REPLACE FUNCTION progress_tracking.calculate_module_progress(
    p_user_id UUID,
    p_module_id UUID
)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
STABLE  -- Permite caching si inputs no cambian
AS $$
DECLARE
    total_exercises INTEGER;
    completed_exercises INTEGER;
    progress_percentage NUMERIC(5,2);
BEGIN
    -- Query optimizado con índices existentes
    WITH exercise_stats AS (
        SELECT
            COUNT(*) FILTER (WHERE e.is_active = true) AS total,
            COUNT(*) FILTER (
                WHERE ea.is_correct = true
                  AND ea.submitted_at IS NOT NULL
            ) AS completed
        FROM educational_content.exercises e
        LEFT JOIN progress_tracking.exercise_attempts ea
            ON ea.exercise_id = e.id
           AND ea.user_id = p_user_id
        WHERE e.module_id = p_module_id
          AND e.is_active = true
    )
    SELECT
        COALESCE(es.total, 0),
        COALESCE(es.completed, 0)
    INTO total_exercises, completed_exercises
    FROM exercise_stats es;

    -- Calcular porcentaje
    IF total_exercises = 0 THEN
        RETURN 0.00;
    END IF;

    progress_percentage := ROUND(
        (completed_exercises::NUMERIC / total_exercises::NUMERIC) * 100,
        2
    );

    RETURN progress_percentage;
END;
$$;

COMMENT ON FUNCTION progress_tracking.calculate_module_progress(UUID, UUID)
IS 'Calcula porcentaje de completitud de un módulo para un usuario (v2 optimizada).
Parámetros:
  - p_user_id: UUID del usuario
  - p_module_id: UUID del módulo
Retorna:
  - NUMERIC(5,2): Porcentaje 0.00-100.00
Performance:
  - v1: ~300ms (múltiples queries)
  - v2: ~50ms (single CTE query)
Índices requeridos:
  - idx_exercises_module_id_active
  - idx_exercise_attempts_user_exercise
Ejemplo:
  SELECT calculate_module_progress(''a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'', ''m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'');
Versión: 2.0 (2025-11-23)';

-- Índices adicionales requeridos
CREATE INDEX IF NOT EXISTS idx_exercises_module_id_active
ON educational_content.exercises (module_id, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_exercise_correct
ON progress_tracking.exercise_attempts (user_id, exercise_id, is_correct)
WHERE is_correct = true;
```

**Tests de Performance:**
```sql
-- Benchmark v1 vs v2
EXPLAIN ANALYZE
SELECT progress_tracking.calculate_module_progress(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
);
```

**Estimación:** 4-6 horas (optimizar + tests)
**Prioridad:** P1 - Implementar en Semana 2 post-MVP

---

## 3. OPTIMIZACIONES P2 - MEDIAS (Mantenimiento)

### OPT-P2-001: Documentar 28 Funciones Sin Comentarios

**Problema:**
28 funciones (29%) sin `COMMENT ON FUNCTION`.

**Impacto:**
- 🟢 **BAJO** - No afecta funcionalidad pero dificulta mantenimiento.

**Solución:**

```sql
-- File: apps/database/migrations/2025-11-24_add-function-comments.sql

-- =====================================================
-- SCRIPT: Agregar comentarios a funciones sin documentación
-- =====================================================

-- Gamification System (10 funciones)
COMMENT ON FUNCTION gamification_system.calculate_user_rank(user_id UUID)
IS 'Calcula el rango Maya actual del usuario basado en su XP total.
Consulta tabla maya_ranks y retorna el rango correspondiente.
Performance: <10ms (query indexado).
Usado por: Sistema de recompensas v2.3.0.
Versión: 2.0 (2025-11-16)';

COMMENT ON FUNCTION gamification_system.update_user_rank(user_id UUID)
IS 'Actualiza el rango del usuario en user_stats y user_ranks.
Llama a calculate_user_rank() y persiste resultado.
Dispara trigger de achievement si hay promoción de rango.
Performance: <50ms.
Versión: 2.0 (2025-11-16)';

COMMENT ON FUNCTION gamification_system.award_xp(user_id UUID, xp_amount INTEGER)
IS 'Otorga XP al usuario y actualiza user_stats.
Aplica multiplicador de rango automáticamente.
Valida que xp_amount > 0.
Retorna: XP total actualizado.
Performance: <20ms.
Versión: 2.3.0 (2025-11-18)';

COMMENT ON FUNCTION gamification_system.award_ml_coins(user_id UUID, ml_coins INTEGER)
IS 'Otorga ML Coins al usuario y registra transacción.
Inserta en ml_coins_transactions para auditoría.
Valida que ml_coins > 0.
Retorna: Balance actualizado de ML Coins.
Performance: <30ms.
Versión: 2.3.0 (2025-11-18)';

-- ... (24 comentarios más para otras funciones)

-- Educational Content (8 funciones)
COMMENT ON FUNCTION educational_content.validate_crucigrama(
    user_answer JSONB,
    correct_answer JSONB,
    validation_config JSONB
)
IS 'Valida respuesta de ejercicio tipo crucigrama.
Compara user_answer con correct_answer palabra por palabra.
Ignora mayúsculas/minúsculas si config.case_sensitive = false.
Retorna:
  - JSONB: {is_correct: boolean, score: integer, feedback: text, errors: array}
Performance: <100ms (incluso con 50+ palabras).
Validado en producción con 15 ejercicios.
Versión: 2.0 (2025-11-17)';

-- ... (7 comentarios más)

-- Progress Tracking (5 funciones)
-- ... comentarios adicionales

-- Social Features (3 funciones)
-- ... comentarios adicionales

-- Auth Management (2 funciones)
-- ... comentarios adicionales
```

**Ejecución:**
```bash
psql -U gamilit_user -d gamilit_prod \
  -f apps/database/migrations/2025-11-24_add-function-comments.sql
```

**Estimación:** 4-6 horas (escribir 28 comentarios técnicos)
**Prioridad:** P2 - Implementar en Semana 3-4 post-MVP

---

### OPT-P2-002: Crear Materialized Views para Dashboard Admin

**Problema:**
Queries de dashboard admin (analytics) ejecutan JOINs costosos en cada request.

**Impacto:**
- 🟡 **MEDIO** - Dashboard lento (>2s) con 1000+ usuarios.

**Solución:**

```sql
-- File: apps/database/ddl/schemas/admin_dashboard/views/mv_user_stats_summary.sql

CREATE MATERIALIZED VIEW IF NOT EXISTS admin_dashboard.mv_user_stats_summary AS
SELECT
    u.id AS user_id,
    u.email,
    p.full_name,
    p.tenant_id,
    us.xp_total,
    us.ml_coins_balance,
    us.current_streak,
    us.longest_streak,
    ur.current_rank,
    COUNT(DISTINCT mp.module_id) AS modules_completed,
    COUNT(DISTINCT ea.exercise_id) AS exercises_completed,
    AVG(ea.score) AS avg_score,
    MAX(ea.submitted_at) AS last_activity_at
FROM auth.users u
INNER JOIN auth_management.profiles p ON p.id = u.id
LEFT JOIN gamification_system.user_stats us ON us.user_id = u.id
LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = u.id AND ur.is_current = true
LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = u.id AND mp.completion_percentage = 100
LEFT JOIN progress_tracking.exercise_attempts ea ON ea.user_id = u.id AND ea.is_correct = true
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, p.full_name, p.tenant_id, us.xp_total, us.ml_coins_balance, us.current_streak, us.longest_streak, ur.current_rank;

-- Índices en materialized view
CREATE UNIQUE INDEX mv_user_stats_summary_user_id_idx ON admin_dashboard.mv_user_stats_summary (user_id);
CREATE INDEX mv_user_stats_summary_tenant_id_idx ON admin_dashboard.mv_user_stats_summary (tenant_id);
CREATE INDEX mv_user_stats_summary_xp_idx ON admin_dashboard.mv_user_stats_summary (xp_total DESC);

COMMENT ON MATERIALIZED VIEW admin_dashboard.mv_user_stats_summary
IS 'Resumen precalculado de estadísticas de usuarios para dashboard admin.
Incluye: XP, ML Coins, rango, módulos completados, ejercicios, score promedio.
REFRESH: Cada 5 minutos vía cron job.
Performance: Query instantáneo (<10ms) vs 2-5s en vistas normales.
Creado: 2025-11-23';

-- Función para refresh automático
CREATE OR REPLACE FUNCTION admin_dashboard.refresh_user_stats_summary()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard.mv_user_stats_summary;
    RAISE NOTICE 'Materialized view mv_user_stats_summary refreshed at %', now();
END;
$$;

-- Trigger para refresh periódico (vía pg_cron o job externo)
-- SELECT cron.schedule('refresh-user-stats', '*/5 * * * *', 'SELECT admin_dashboard.refresh_user_stats_summary()');
```

**Views Adicionales Recomendadas:**
1. `mv_module_completion_rates` - Tasas de completitud por módulo
2. `mv_classroom_analytics` - Analytics de grupos
3. `mv_gamification_overview` - Resumen de gamificación

**Estimación:** 6-8 horas (4 materialized views)
**Prioridad:** P2 - Implementar cuando dashboard admin tenga >500 usuarios

---

## 4. OPTIMIZACIONES P3 - BAJAS (Mejoras Futuras)

### OPT-P3-001: Analizar y Eliminar Índices No Utilizados

**Problema:**
639 índices creados, posiblemente algunos con `idx_scan = 0` (nunca utilizados).

**Impacto:**
- 🟢 **BAJO** - Consumo innecesario de disco + lentitud en INSERT/UPDATE.

**Solución:**

```sql
-- File: apps/database/scripts/analyze_unused_indexes.sql

-- =====================================================
-- SCRIPT: Analizar índices no utilizados
-- =====================================================
-- Ejecutar en staging después de 1 semana de uso real

SELECT
    schemaname || '.' || tablename AS table_name,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS num_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    CASE
        WHEN idx_scan = 0 THEN '🔴 NUNCA USADO'
        WHEN idx_scan < 10 THEN '🟡 POCO USADO'
        ELSE '✅ USADO'
    END AS status
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'public')
ORDER BY pg_relation_size(indexrelid) DESC, idx_scan ASC;

-- Resumen de índices por estado
SELECT
    CASE
        WHEN idx_scan = 0 THEN '🔴 Nunca usado'
        WHEN idx_scan < 10 THEN '🟡 Poco usado'
        WHEN idx_scan < 100 THEN '🟢 Moderadamente usado'
        ELSE '✅ Muy usado'
    END AS categoria,
    COUNT(*) AS num_indices,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) AS total_size
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'public')
GROUP BY categoria
ORDER BY num_indices DESC;
```

**Proceso de Eliminación:**
1. Ejecutar script en staging después de 1 semana.
2. Identificar índices con `idx_scan = 0` y tamaño > 10MB.
3. Validar con equipo backend que no se usan en queries críticos.
4. Crear migración para eliminar índices candidatos.
5. Monitorear performance post-eliminación.

**Script de Eliminación (Ejemplo):**
```sql
-- File: apps/database/migrations/2025-12-01_remove-unused-indexes.sql

-- ⚠️ CUIDADO: Validar en staging antes de producción

-- Índice 1: idx_modules_prerequisites_gin (0 scans, 25 MB)
-- Razón: prerequisites[] nunca usado en queries WHERE
DROP INDEX IF EXISTS educational_content.idx_modules_prerequisites_gin;

-- Índice 2: idx_exercises_config_gin (0 scans, 18 MB)
-- Razón: config JSONB raramente usado en WHERE, solo en SELECT
DROP INDEX IF EXISTS educational_content.idx_exercises_config_gin;

-- ... (otros índices candidatos)
```

**Estimación:** 8-12 horas (análisis + validación + migración)
**Prioridad:** P3 - Implementar en Mes 2-3 post-MVP

---

### OPT-P3-002: Implementar Partitioning en Tablas de Auditoría

**Problema:**
Tabla `audit_logging.audit_logs` crecerá indefinidamente (>10M registros en 1 año).

**Impacto:**
- 🟢 **BAJO** - Queries lentos después de 6-12 meses de uso.

**Solución:**

```sql
-- File: apps/database/migrations/2025-12-15_partition-audit-logs.sql

-- =====================================================
-- PARTITIONING: audit_logging.audit_logs por mes
-- =====================================================

-- Paso 1: Crear tabla particionada nueva
CREATE TABLE audit_logging.audit_logs_partitioned (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    action audit_logging.audit_action NOT NULL,
    resource_type text,
    resource_id uuid,
    changes jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT gamilit.now_mexico(),
    CONSTRAINT audit_logs_partitioned_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Paso 2: Crear particiones por mes (ejemplo: 2025-11 a 2026-01)
CREATE TABLE audit_logging.audit_logs_2025_11 PARTITION OF audit_logging.audit_logs_partitioned
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE audit_logging.audit_logs_2025_12 PARTITION OF audit_logging.audit_logs_partitioned
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE audit_logging.audit_logs_2026_01 PARTITION OF audit_logging.audit_logs_partitioned
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Paso 3: Migrar datos existentes (si aplica)
INSERT INTO audit_logging.audit_logs_partitioned
SELECT * FROM audit_logging.audit_logs;

-- Paso 4: Renombrar tablas
ALTER TABLE audit_logging.audit_logs RENAME TO audit_logs_old;
ALTER TABLE audit_logging.audit_logs_partitioned RENAME TO audit_logs;

-- Paso 5: Script automático para crear particiones futuras
CREATE OR REPLACE FUNCTION audit_logging.create_monthly_partitions()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end_date DATE := start_date + INTERVAL '1 month';
    partition_name TEXT := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS audit_logging.%I PARTITION OF audit_logging.audit_logs FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        start_date,
        end_date
    );
    RAISE NOTICE 'Partición % creada para rango [%, %)', partition_name, start_date, end_date;
END;
$$;

-- Ejecutar mensualmente vía cron
-- SELECT cron.schedule('create-audit-partitions', '0 0 1 * *', 'SELECT audit_logging.create_monthly_partitions()');
```

**Beneficios:**
- ✅ Queries 10-100x más rápidos en logs históricos.
- ✅ Eliminación fácil de particiones antiguas (DROP TABLE vs DELETE).
- ✅ Mantenimiento simplificado (VACUUM por partición).

**Estimación:** 6-8 horas (implementar + tests)
**Prioridad:** P3 - Implementar cuando audit_logs > 1M registros

---

## 5. SCRIPTS SQL DE IMPLEMENTACIÓN

### Script Completo: Optimizaciones P0 (Pre-Deploy)

```bash
#!/bin/bash
# File: scripts/apply_p0_optimizations.sh

set -e

echo "==========================================";
echo "APLICANDO OPTIMIZACIONES P0 (Pre-Deploy)";
echo "==========================================";

# OPT-P0-001: Sincronizar seeds prod
echo "✅ OPT-P0-001: Sincronizando seeds prod...";
cp apps/database/seeds/dev/educational_content/01-modules.sql \
   apps/database/seeds/prod/educational_content/01-modules.sql
echo "✓ Seeds sincronizados";

# OPT-P0-002: Validar integridad referencial
echo "✅ OPT-P0-002: Validando integridad referencial...";
psql -U gamilit_user -d gamilit_staging \
  -f apps/database/scripts/validate_referential_integrity.sql
echo "✓ Integridad validada";

echo "==========================================";
echo "✅ OPTIMIZACIONES P0 COMPLETADAS";
echo "==========================================";
```

**Ejecución:**
```bash
chmod +x scripts/apply_p0_optimizations.sh
./scripts/apply_p0_optimizations.sh
```

---

## 📋 RESUMEN DE PRIORIDADES

| Prioridad | Optimizaciones | Total Estimación | Deadline |
|-----------|----------------|------------------|----------|
| **P0** (Crítica) | 2 | ~20 minutos | HOY (Pre-Deploy) |
| **P1** (Alta) | 2 | ~20-26 horas | Semana 1-2 post-MVP |
| **P2** (Media) | 2 | ~10-14 horas | Semana 3-4 post-MVP |
| **P3** (Baja) | 2 | ~14-20 horas | Mes 2-3 post-MVP |

**Total Estimado:** ~44-60 horas de optimización post-MVP.

---

**Última actualización:** 2025-11-23
**Versión:** 1.0
**Generado por:** Database-Agent
**Propósito:** Guía de optimizaciones priorizadas para base de datos

---

**FIN DEL DOCUMENTO**
