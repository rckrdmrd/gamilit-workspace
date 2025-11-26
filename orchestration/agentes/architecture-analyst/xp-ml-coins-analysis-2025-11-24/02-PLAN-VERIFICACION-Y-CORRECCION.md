# Plan de Verificación y Corrección: XP/ML Coins

**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** FASE 2 - PLANEACIÓN

---

## 📋 CHECKLIST DE VERIFICACIÓN POR EJERCICIO

### Módulo 1: Comprensión Literal

| # | Ejercicio | ID | Test Manual | Test BD | Estado |
|---|-----------|-----|-------------|---------|--------|
| 1.1 | Crucigrama Científico | `4995d362-b8cd-4d0b-95c2-c8ec3b20712f` | ⬜ | ⬜ | Pendiente |
| 1.2 | Línea de Tiempo | `17e89516-1901-4751-863b-fe4d5fd8d6c3` | ⬜ | ⬜ | Pendiente |
| 1.3 | Completar Espacios | `49efbd8b-8a28-4db0-93f9-dc341667a765` | ⬜ | ⬜ | Pendiente |
| 1.4 | Verdadero o Falso | `99b27fc7-afa5-4461-a4c0-4e6bb2483038` | ⬜ | ⬜ | Pendiente |
| 1.5 | Sopa de Letras | `711d5d1d-a2aa-4f5f-b197-818a60c1aba8` | ⬜ | ⬜ | Pendiente |

### Módulo 2: Comprensión Inferencial

| # | Ejercicio | ID | Test Manual | Test BD | Estado |
|---|-----------|-----|-------------|---------|--------|
| 2.1 | Detective Textual | `919adb97-9e53-4628-a03d-61476e00426c` | ⬜ | ⬜ | Pendiente |
| 2.2 | Causa-Efecto | `3e5f6dd1-e5f7-4676-b7f1-dda1d216614a` | ⬜ | ⬜ | Pendiente |
| 2.3 | Predicción Narrativa | `abf7e200-ce20-4b88-9b34-61c0f347c54c` | ⬜ | ⬜ | Pendiente |
| 2.4 | Puzzle de Contexto | `604c6f4f-8e46-404c-898b-6b54a8817564` | ⬜ | ⬜ | Pendiente |
| 2.5 | Rueda de Inferencias | `a866f4c6-4963-440e-907d-56488ecc0ddb` | ⬜ | ⬜ | **PRIORIDAD** |

---

## 🧪 PROTOCOLO DE VERIFICACIÓN MANUAL

### Para cada ejercicio, ejecutar:

#### Paso 1: Preparación
```bash
# Limpiar attempts anteriores del usuario de prueba (opcional)
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -c "
DELETE FROM progress_tracking.exercise_attempts
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
AND exercise_id = '<EXERCISE_ID>';
"
```

#### Paso 2: Registrar estado ANTES
```bash
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT user_id, total_xp, ml_coins, exercises_completed
FROM gamification_system.user_stats
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
"
```

#### Paso 3: Completar ejercicio en frontend
1. Navegar a: `http://localhost:5173/student/module/{module_id}/exercise/{exercise_id}`
2. Completar ejercicio correctamente
3. Verificar UI muestra XP y coins ganados

#### Paso 4: Verificar estado DESPUÉS
```bash
# Verificar attempt creado
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT id, score, is_correct, xp_earned, ml_coins_earned, hints_used
FROM progress_tracking.exercise_attempts
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
AND exercise_id = '<EXERCISE_ID>'
ORDER BY attempt_number DESC LIMIT 1;
"

# Verificar user_stats actualizado
PGPASSWORD='C5hq7253pdVyVKUC' psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT user_id, total_xp, ml_coins, exercises_completed
FROM gamification_system.user_stats
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
"
```

#### Paso 5: Validar incrementos
- XP incrementó: `(nuevo_total_xp - anterior_total_xp) == xp_earned del attempt`
- Coins incrementaron: `(nuevos_coins - anteriores_coins) == ml_coins_earned del attempt`

---

## 🔧 PLAN DE CORRECCIÓN DE DATOS HISTÓRICOS

### Script 1: Identificar intentos afectados

```sql
-- Archivo: scripts/01-identify-affected-attempts.sql

-- Intentos con score > 0 pero sin rewards
SELECT
    ea.id,
    ea.user_id,
    e.title as ejercicio,
    ea.score,
    ea.is_correct,
    ea.xp_earned,
    ea.ml_coins_earned,
    ea.hints_used,
    COALESCE(array_length(ea.comodines_used, 1), 0) as comodines_count
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON e.id = ea.exercise_id
WHERE ea.score > 0
  AND ea.is_correct = true
  AND (ea.xp_earned = 0 OR ea.xp_earned IS NULL)
ORDER BY e.title, ea.id;
```

### Script 2: Corregir XP y Coins en attempts

```sql
-- Archivo: scripts/02-fix-attempt-rewards.sql

-- Transacción para corregir rewards
BEGIN;

-- Crear tabla temporal con valores calculados
CREATE TEMP TABLE affected_attempts AS
SELECT
    ea.id,
    ea.score,
    ea.hints_used,
    COALESCE(array_length(ea.comodines_used, 1), 0) as comodines_count,
    -- XP = score - (hints * 10), mínimo 0
    GREATEST(0, ea.score - (ea.hints_used * 10)) as calculated_xp,
    -- Coins = floor(score/10) - (comodines * 2), mínimo 0
    GREATEST(0, FLOOR(ea.score / 10) - (COALESCE(array_length(ea.comodines_used, 1), 0) * 2)) as calculated_coins
FROM progress_tracking.exercise_attempts ea
WHERE ea.score > 0
  AND ea.is_correct = true
  AND (ea.xp_earned = 0 OR ea.xp_earned IS NULL);

-- Verificar cálculos antes de aplicar
SELECT * FROM affected_attempts;

-- Aplicar correcciones
UPDATE progress_tracking.exercise_attempts ea
SET
    xp_earned = aa.calculated_xp,
    ml_coins_earned = aa.calculated_coins
FROM affected_attempts aa
WHERE ea.id = aa.id;

-- Verificar resultados
SELECT
    ea.id,
    ea.score,
    ea.xp_earned,
    ea.ml_coins_earned
FROM progress_tracking.exercise_attempts ea
WHERE ea.id IN (SELECT id FROM affected_attempts);

COMMIT;
-- Si algo falla: ROLLBACK;
```

### Script 3: Recalcular user_stats

```sql
-- Archivo: scripts/03-recalculate-user-stats.sql

BEGIN;

-- Identificar usuarios afectados
CREATE TEMP TABLE affected_users AS
SELECT DISTINCT user_id FROM affected_attempts;

-- Recalcular total_xp y ml_coins para usuarios afectados
UPDATE gamification_system.user_stats us
SET
    total_xp = (
        SELECT COALESCE(SUM(xp_earned), 0)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id
          AND ea.is_correct = true
    ),
    ml_coins = 100 + (
        SELECT COALESCE(SUM(ml_coins_earned), 0)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id
          AND ea.is_correct = true
    ),
    exercises_completed = (
        SELECT COUNT(DISTINCT exercise_id)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id
          AND ea.is_correct = true
    ),
    updated_at = NOW()
WHERE us.user_id IN (SELECT user_id FROM affected_users);

-- Verificar resultados
SELECT
    us.user_id,
    us.total_xp,
    us.ml_coins,
    us.exercises_completed,
    (SELECT SUM(xp_earned) FROM progress_tracking.exercise_attempts ea
     WHERE ea.user_id = us.user_id AND ea.is_correct = true) as xp_from_attempts
FROM gamification_system.user_stats us
WHERE us.user_id IN (SELECT user_id FROM affected_users);

COMMIT;
```

### Script 4: Validación final

```sql
-- Archivo: scripts/04-validate-consistency.sql

-- Verificar que no hay discrepancias
SELECT
    'DISCREPANCIAS' as tipo,
    ea.user_id,
    SUM(ea.xp_earned) as xp_attempts,
    us.total_xp as xp_stats,
    SUM(ea.xp_earned) - COALESCE(us.total_xp, 0) as diferencia
FROM progress_tracking.exercise_attempts ea
LEFT JOIN gamification_system.user_stats us ON ea.user_id = us.user_id
WHERE ea.is_correct = true
GROUP BY ea.user_id, us.total_xp
HAVING SUM(ea.xp_earned) != COALESCE(us.total_xp, 0);

-- Si no hay filas, todo está correcto
```

---

## 🚀 ORDEN DE EJECUCIÓN

### Fase A: Preparación
1. ⬜ Hacer backup de tablas afectadas
2. ⬜ Revisar intentos afectados con Script 1

### Fase B: Corrección
3. ⬜ Ejecutar Script 2 (corregir attempts)
4. ⬜ Ejecutar Script 3 (recalcular user_stats)

### Fase C: Validación
5. ⬜ Ejecutar Script 4 (validar consistencia)
6. ⬜ Verificar manualmente usuario afectado (85a2d456...)

### Fase D: Verificación de Ejercicios
7. ⬜ Ejecutar protocolo de verificación manual para cada ejercicio
8. ⬜ Documentar resultados en checklist

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Valor Esperado | Valor Actual |
|---------|----------------|--------------|
| Intentos con score>0 y xp=0 | 0 | 1+ |
| Discrepancias XP attempts vs stats | 0 | 500 |
| Usuarios con datos inconsistentes | 0 | 1+ |

---

## 🔗 AGENTES A ORQUESTAR

| Agente | Tarea | Prioridad |
|--------|-------|-----------|
| Database-Agent | Ejecutar scripts de corrección | P0 |
| Backend-Agent | Verificar fix de validateRuedaInferencias | P0 |
| Frontend-Agent | Verificar UI muestra rewards correctamente | P1 |

---

**Estado:** Listo para FASE 3 - EJECUCIÓN
**Próximo paso:** Confirmar con usuario antes de orquestar correcciones
