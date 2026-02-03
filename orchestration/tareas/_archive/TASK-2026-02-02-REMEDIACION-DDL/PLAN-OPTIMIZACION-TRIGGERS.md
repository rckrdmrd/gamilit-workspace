# PLAN-OPTIMIZACION-TRIGGERS.md
# Optimización de Cascade Triggers en exercise_submissions

**Tarea:** TASK-2026-02-02-REMEDIACION-DDL
**Fase:** P2-B
**Prioridad:** P2
**Esfuerzo Estimado:** 16 horas (2-3 sprints)
**Fecha:** 2026-02-02

---

## 1. PROBLEMA IDENTIFICADO

### 1.1 Cascade Actual

Cuando se califica un ejercicio (`UPDATE exercise_submissions SET status='graded'`):

```
UPDATE exercise_submissions (status='graded', is_correct=true)
│
├─ TRIGGER 1: exercise_submissions_updated_at [BEFORE] ───────── <1ms
│
├─ TRIGGER 2: trg_update_missions_on_submission [AFTER] ──────── 15-30ms
│   └─ Busca misiones 'complete_exercises', actualiza progreso
│
├─ TRIGGER 3: trg_update_module_progress_on_submission [AFTER] ─ 40-70ms ⚠️
│   └─ UNION de attempts+submissions, calcula progress_percentage
│       └─ trg_module_progress_updated_at [CASCADE] ─────────── <1ms
│
├─ TRIGGER 4: trg_update_user_stats_on_submission [AFTER] ────── 20-35ms
│   └─ UPSERT user_stats (exercises_completed, total_xp, ml_coins)
│       ├─ TRIGGER 4A: trg_recalculate_level [CASCADE] ──────── 5-10ms
│       └─ TRIGGER 4B: trg_update_missions_on_earn_xp [CASCADE] 15-25ms ⚠️
│
└─ TRIGGER 5: trg_sync_average_score [AFTER] ─────────────────── 20-35ms ⚠️
    └─ Agrega scores, actualiza average_score
        └─ trg_module_progress_updated_at [CASCADE] ─────────── <1ms

TOTAL: 150-220ms por submission calificada
```

### 1.2 Hotspots Identificados

| Trigger | Duración | Problema |
|---------|----------|----------|
| trg_update_module_progress | 40-70ms | UNION join costoso |
| trg_sync_average_score | 20-35ms | Agregación duplicada |
| trg_update_missions_on_earn_xp | 15-25ms | Ejecuta en cascade |

### 1.3 Impacto en Producción

- **10 submissions/seg:** ~1.5-2.2s latencia acumulada
- **100 submissions/seg (pico):** BD se convierte en bottleneck
- **Lock contention:** user_stats bloqueado 35-60ms por submission

---

## 2. OPTIMIZACIONES PROPUESTAS

### 2.1 Consolidar Triggers 3 y 5 (P0)

**Problema:** Ambos triggers calculan datos sobre module_progress ejecutando queries similares.

**Solución:** Función unificada `update_module_progress_complete()`

```sql
CREATE OR REPLACE FUNCTION progress_tracking.update_module_progress_complete()
RETURNS TRIGGER AS $$
DECLARE
    v_module_id UUID;
    v_total_exercises INTEGER;
    v_completed_exercises INTEGER;
    v_graded_exercises INTEGER;
    v_avg_score NUMERIC;
    v_progress_pct NUMERIC;
    v_graded_pct NUMERIC;
    v_total_xp INTEGER;
    v_total_coins INTEGER;
BEGIN
    -- Solo ejecutar si submission está graded/reviewed con score >= 60
    IF NEW.status NOT IN ('graded', 'reviewed') OR NEW.score < 60 THEN
        RETURN NEW;
    END IF;

    -- Obtener module_id del ejercicio
    SELECT module_id INTO v_module_id
    FROM educational_content.exercises
    WHERE id = NEW.exercise_id;

    -- Calcular TODAS las métricas en una sola query
    SELECT
        COUNT(DISTINCT e.id) AS total_exercises,
        COUNT(DISTINCT CASE WHEN
            EXISTS (SELECT 1 FROM progress_tracking.exercise_attempts ea
                    WHERE ea.exercise_id = e.id AND ea.user_id = NEW.user_id AND ea.is_correct)
            OR EXISTS (SELECT 1 FROM progress_tracking.exercise_submissions es
                       WHERE es.exercise_id = e.id AND es.user_id = NEW.user_id
                       AND es.status IN ('graded','reviewed') AND es.score >= 60)
            THEN e.id END) AS completed_exercises,
        COUNT(DISTINCT CASE WHEN
            EXISTS (SELECT 1 FROM progress_tracking.exercise_submissions es
                    WHERE es.exercise_id = e.id AND es.user_id = NEW.user_id
                    AND es.status IN ('graded','reviewed'))
            THEN e.id END) AS graded_exercises,
        COALESCE(AVG(
            (SELECT MAX(es2.score) FROM progress_tracking.exercise_submissions es2
             WHERE es2.exercise_id = e.id AND es2.user_id = NEW.user_id
             AND es2.status IN ('graded','reviewed'))
        ), 0) AS avg_score
    INTO v_total_exercises, v_completed_exercises, v_graded_exercises, v_avg_score
    FROM educational_content.exercises e
    WHERE e.module_id = v_module_id AND e.is_active = true;

    -- Calcular porcentajes
    v_progress_pct := CASE WHEN v_total_exercises > 0
        THEN (v_completed_exercises::NUMERIC / v_total_exercises * 100)
        ELSE 0 END;
    v_graded_pct := CASE WHEN v_total_exercises > 0
        THEN (v_graded_exercises::NUMERIC / v_total_exercises * 100)
        ELSE 0 END;

    -- Calcular XP y coins totales
    SELECT COALESCE(SUM(xp_earned), 0), COALESCE(SUM(coins_earned), 0)
    INTO v_total_xp, v_total_coins
    FROM progress_tracking.exercise_submissions
    WHERE user_id = NEW.user_id
    AND exercise_id IN (SELECT id FROM educational_content.exercises WHERE module_id = v_module_id)
    AND status IN ('graded', 'reviewed');

    -- UPSERT module_progress (una sola operación)
    INSERT INTO progress_tracking.module_progress (
        user_id, module_id, started_at, completed_exercises, graded_exercises,
        progress_percentage, graded_progress_percentage, average_score,
        total_xp_earned, total_ml_coins_earned, status, updated_at
    ) VALUES (
        NEW.user_id, v_module_id, gamilit.now_mexico(),
        v_completed_exercises, v_graded_exercises,
        v_progress_pct, v_graded_pct, v_avg_score,
        v_total_xp, v_total_coins,
        CASE WHEN v_progress_pct >= 100 THEN 'completed' ELSE 'in_progress' END,
        gamilit.now_mexico()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        completed_exercises = EXCLUDED.completed_exercises,
        graded_exercises = EXCLUDED.graded_exercises,
        progress_percentage = EXCLUDED.progress_percentage,
        graded_progress_percentage = EXCLUDED.graded_progress_percentage,
        average_score = EXCLUDED.average_score,
        total_xp_earned = EXCLUDED.total_xp_earned,
        total_ml_coins_earned = EXCLUDED.total_ml_coins_earned,
        status = EXCLUDED.status,
        completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100
                            AND progress_tracking.module_progress.completed_at IS NULL
                       THEN gamilit.now_mexico()
                       ELSE progress_tracking.module_progress.completed_at END,
        updated_at = gamilit.now_mexico();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Ahorro estimado:** 30-50ms (elimina query duplicada)

### 2.2 Consolidar Triggers 4A y 4B en user_stats (P1)

**Problema:** Cuando user_stats se actualiza, dispara 2 triggers secuenciales.

**Solución:** Función unificada `process_xp_update()`

```sql
CREATE OR REPLACE FUNCTION gamification_system.process_xp_update()
RETURNS TRIGGER AS $$
DECLARE
    v_new_level INTEGER;
    v_xp_gained INTEGER;
BEGIN
    -- Solo ejecutar si total_xp cambió
    IF NEW.total_xp IS NOT DISTINCT FROM OLD.total_xp THEN
        RETURN NEW;
    END IF;

    -- 1. Recalcular nivel (antes de UPDATE)
    v_new_level := gamification_system.calculate_level_from_xp(NEW.total_xp);
    IF v_new_level != NEW.level THEN
        NEW.level := v_new_level;
    END IF;

    -- 2. Actualizar misiones de XP (después de calcular)
    v_xp_gained := NEW.total_xp - COALESCE(OLD.total_xp, 0);
    IF v_xp_gained > 0 THEN
        PERFORM gamilit.update_mission_progress(NEW.user_id, 'earn_xp', v_xp_gained);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplaza ambos triggers con uno solo
DROP TRIGGER IF EXISTS trg_recalculate_level_on_xp_change ON gamification_system.user_stats;
DROP TRIGGER IF EXISTS trg_update_missions_on_earn_xp ON gamification_system.user_stats;

CREATE TRIGGER trg_process_xp_update
    BEFORE UPDATE ON gamification_system.user_stats
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION gamification_system.process_xp_update();
```

**Ahorro estimado:** 15-25ms (elimina segundo trigger y UPDATE adicional)

### 2.3 Agregar Row Lock para Concurrencia (P1)

**Problema:** Multiple submissions simultáneas pueden causar lost updates.

```sql
-- En update_user_stats_on_submission_graded()
-- Agregar al inicio:
PERFORM 1 FROM gamification_system.user_stats
WHERE user_id = NEW.user_id
FOR UPDATE NOWAIT;  -- Falla rápido si está bloqueado
```

### 2.4 Índices Adicionales (P2)

```sql
-- Acelerar lookup de ejercicios por módulo
CREATE INDEX idx_exercises_module_active
ON educational_content.exercises(module_id)
WHERE is_active = true;

-- Acelerar búsqueda de submissions por usuario/ejercicio
CREATE INDEX idx_submissions_user_exercise_status
ON progress_tracking.exercise_submissions(user_id, exercise_id, status);

-- Acelerar búsqueda de attempts correctos
CREATE INDEX idx_attempts_user_correct
ON progress_tracking.exercise_attempts(user_id, exercise_id)
WHERE is_correct = true;
```

---

## 3. DIAGRAMA ANTES/DESPUÉS

### 3.1 Antes (5 triggers + 2 cascade = 7 ejecuciones)

```
exercise_submissions UPDATE
├─ trg_updated_at ────────────────── <1ms
├─ trg_missions_on_submission ────── 15-30ms
├─ trg_module_progress ───────────── 40-70ms
│   └─ cascade: trg_updated_at ──── <1ms
├─ trg_user_stats ────────────────── 20-35ms
│   ├─ cascade: trg_level ────────── 5-10ms
│   └─ cascade: trg_missions_xp ─── 15-25ms
└─ trg_sync_average ──────────────── 20-35ms
    └─ cascade: trg_updated_at ──── <1ms

TOTAL: 150-220ms
```

### 3.2 Después (3 triggers + 0 cascade = 3 ejecuciones)

```
exercise_submissions UPDATE
├─ trg_updated_at ────────────────── <1ms
├─ trg_missions_on_submission ────── 15-30ms (sin cambio)
├─ trg_module_progress_complete ──── 50-80ms (consolidado)
│   └─ (calcula progress + average_score en una query)
└─ trg_user_stats_complete ───────── 30-45ms (consolidado)
    └─ (actualiza XP + nivel + misiones en una función)

TOTAL: 95-155ms (30-40% reducción)
```

---

## 4. PLAN DE IMPLEMENTACIÓN

### 4.1 Sprint 1: Preparación

| Tarea | Esfuerzo | Riesgo |
|-------|----------|--------|
| Crear función update_module_progress_complete | 2h | Bajo |
| Crear función process_xp_update | 1h | Bajo |
| Escribir tests unitarios | 2h | Bajo |
| Testing en dev | 2h | Medio |

### 4.2 Sprint 2: Implementación

| Tarea | Esfuerzo | Riesgo |
|-------|----------|--------|
| Crear índices adicionales | 30min | Bajo |
| Deploy funciones consolidadas | 1h | Medio |
| Reemplazar triggers | 1h | Alto |
| Validación de datos | 2h | Medio |

### 4.3 Sprint 3: Monitoreo

| Tarea | Esfuerzo | Riesgo |
|-------|----------|--------|
| Monitoreo de performance | 4h | Bajo |
| Ajustes finos | 2h | Bajo |
| Documentación | 1h | Bajo |

---

## 5. TESTING REQUERIDO

### 5.1 Tests Unitarios

```sql
-- Test 1: Verificar progress_percentage después de grading
-- Test 2: Verificar average_score actualizado
-- Test 3: Verificar nivel recalculado
-- Test 4: Verificar misiones actualizadas
-- Test 5: Verificar concurrencia (2 submissions simultáneas)
```

### 5.2 Tests de Carga

```bash
# Simular 100 submissions concurrentes
pgbench -c 10 -j 2 -T 60 -f grade_submission.sql gamilit_platform
```

### 5.3 Criterios de Éxito

| Métrica | Actual | Objetivo | Crítico |
|---------|--------|----------|---------|
| Latencia p50 | 180ms | <120ms | <150ms |
| Latencia p99 | 300ms | <200ms | <250ms |
| Lock wait | 50ms | <20ms | <30ms |
| Throughput | 10/s | 50/s | 30/s |

---

## 6. ROLLBACK PLAN

Si hay problemas después del deploy:

```sql
-- 1. Restaurar triggers originales
DROP TRIGGER IF EXISTS trg_module_progress_complete ON exercise_submissions;
DROP TRIGGER IF EXISTS trg_user_stats_complete ON exercise_submissions;
DROP TRIGGER IF EXISTS trg_process_xp_update ON user_stats;

-- 2. Recrear triggers originales desde archivos DDL
\i schemas/progress_tracking/triggers/27-trg_update_module_progress_on_submission.sql
\i schemas/progress_tracking/triggers/33-trg_sync_average_score_on_submission.sql
\i schemas/progress_tracking/triggers/31-trg_update_user_stats_on_submission.sql
\i schemas/gamification_system/triggers/21-trg_recalculate_level_on_xp_change.sql
\i schemas/gamification_system/triggers/27-trg_update_missions_on_earn_xp.sql
```

---

## 7. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Función consolidada tiene bug | Media | Alta | Tests exhaustivos |
| Performance peor | Baja | Alta | Benchmark antes/después |
| Lock contention aumenta | Baja | Media | NOWAIT + retry logic |
| Datos inconsistentes | Baja | Alta | Validación post-deploy |

---

## 8. PRÓXIMOS PASOS

1. [ ] Aprobar diseño de funciones consolidadas
2. [ ] Implementar update_module_progress_complete
3. [ ] Implementar process_xp_update
4. [ ] Escribir y ejecutar tests
5. [ ] Crear índices en staging
6. [ ] Benchmark antes/después
7. [ ] Deploy a staging (1 semana)
8. [ ] Deploy a producción
9. [ ] Monitoreo 1 semana

---

*Generado por: TASK-2026-02-02-REMEDIACION-DDL*
*Fase: P2-B - Plan Optimización Triggers*
*Fecha: 2026-02-02*
