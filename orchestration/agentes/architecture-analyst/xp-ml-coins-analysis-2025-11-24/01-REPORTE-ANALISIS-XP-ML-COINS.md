# Reporte de Análisis: XP y ML Coins en Ejercicios Módulos 1 y 2

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Versión:** 1.0
**Estado:** FASE 1 COMPLETADA - Análisis

---

## 📋 RESUMEN EJECUTIVO

### Problema Reportado
Se identificó que el ejercicio 5 del módulo 2 (Rueda de Inferencias) no otorgaba XP ni ML coins. Se sospecha que otros ejercicios pueden tener el mismo problema.

### Hallazgos Principales

| Categoría | Hallazgo | Severidad |
|-----------|----------|-----------|
| ⚠️ **CRÍTICO** | Discrepancia de 500 XP entre attempts y user_stats | P0 |
| ⚠️ **CRÍTICO** | Intento con score=100 pero xp_earned=0 | P0 |
| ✅ **OK** | Ejercicios 1-4 de módulo 1 funcionan correctamente | - |
| ✅ **OK** | Ejercicios 1-4 de módulo 2 funcionan correctamente | - |
| ❌ **BUG** | Rueda de Inferencias (M2-E5): 3 de 5 intentos con score=0 | P0 |
| ❌ **BUG** | Rueda de Inferencias: 1 intento con score=100 pero 0 rewards | P0 |

---

## 🔍 ANÁLISIS DETALLADO

### 1. Arquitectura de Gamificación

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE XP/ML COINS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend                    Backend                    Database     │
│  ────────                    ───────                    ────────     │
│                                                                      │
│  [Enviar]  ──────────────►  ExerciseAttemptService                  │
│                                    │                                 │
│                                    ▼                                 │
│                             validate_and_audit() ◄── SQL Function   │
│                                    │                                 │
│                                    ▼                                 │
│                             calculateXpReward()                      │
│                             calculateCoinsReward()                   │
│                                    │                                 │
│                                    ▼                                 │
│                             INSERT exercise_attempts                 │
│                                    │                                 │
│                                    ▼                                 │
│                       TRIGGER: trg_update_user_stats_on_exercise    │
│                                    │                                 │
│                                    ▼                                 │
│                       FUNCTION: update_user_stats_on_exercise_complete│
│                                    │                                 │
│                                    ▼                                 │
│                             UPDATE user_stats                        │
│                             (total_xp, ml_coins)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Ejercicios Identificados

#### Módulo 1: Comprensión Literal
| # | Ejercicio | Tipo | XP | ML Coins | Estado |
|---|-----------|------|-----|----------|--------|
| 1.1 | Crucigrama Científico | crucigrama | 100 | 20 | ✅ OK |
| 1.2 | Línea de Tiempo | linea_tiempo | 100 | 20 | ✅ OK |
| 1.3 | Completar Espacios | completar_espacios | 100 | 20 | ✅ OK |
| 1.4 | Verdadero o Falso | verdadero_falso | 100 | 20 | ✅ OK |
| 1.5 | Sopa de Letras (BONUS) | sopa_letras | 100 | 20 | ✅ OK |

#### Módulo 2: Comprensión Inferencial
| # | Ejercicio | Tipo | XP | ML Coins | Estado |
|---|-----------|------|-----|----------|--------|
| 2.1 | Detective Textual | detective_textual | 100 | 20 | ✅ OK |
| 2.2 | Causa-Efecto | construccion_hipotesis | 100 | 20 | ✅ OK |
| 2.3 | Predicción Narrativa | prediccion_narrativa | 100 | 20 | ✅ OK |
| 2.4 | Puzzle de Contexto | puzzle_contexto | 100 | 20 | ✅ OK |
| 2.5 | Rueda de Inferencias | rueda_inferencias | 100 | 20 | ⚠️ **BUG** |

### 3. Análisis de Intentos (exercise_attempts)

#### Resumen por Ejercicio
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Ejercicio                        │ Mod │ Attempts │ Con Score │ Con XP │ Avg   │
├──────────────────────────────────┼─────┼──────────┼───────────┼────────┼───────┤
│ Crucigrama Científico            │  1  │    1     │     1     │   1    │ 100.0 │
│ Línea de Tiempo                  │  1  │    1     │     1     │   1    │ 100.0 │
│ Completar Espacios               │  1  │    1     │     1     │   1    │ 100.0 │
│ Verdadero o Falso                │  1  │    1     │     1     │   1    │ 100.0 │
│ Sopa de Letras                   │  1  │    1     │     1     │   1    │ 100.0 │
│ Detective Textual                │  2  │    1     │     1     │   1    │ 100.0 │
│ Causa-Efecto                     │  2  │    1     │     1     │   1    │ 100.0 │
│ Predicción Narrativa             │  2  │    1     │     1     │   1    │ 100.0 │
│ Puzzle de Contexto               │  2  │    1     │     1     │   1    │ 100.0 │
│ Rueda de Inferencias             │  2  │    5     │     2     │   1    │ 32.8  │ ⚠️
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Detalle de Rueda de Inferencias (Usuario afectado)
| Intento | Score | is_correct | xp_earned | ml_coins | Diagnóstico |
|---------|-------|------------|-----------|----------|-------------|
| #1 | 0 | false | 0 | 0 | ❌ Bug: validateRuedaInferencias retornó 0 |
| #2 | **100** | **true** | **0** | **0** | ⚠️ **BUG CRÍTICO**: Score 100 pero 0 rewards |
| #3 | 64 | true | 100 | 20 | ✅ OK (posiblemente después de fix) |
| #4 | 0 | false | 0 | 0 | ❌ Bug: validateRuedaInferencias retornó 0 |
| #5 | 0 | false | 0 | 0 | ❌ Bug: validateRuedaInferencias retornó 0 |

### 4. Discrepancia de XP

```
┌─────────────────────────────────────────────────────────────────┐
│ USUARIO: 85a2d456-a07d-4be9-b9ce-4a46b183a2a0                   │
├─────────────────────────────────────────────────────────────────┤
│ XP en exercise_attempts:  1000 (suma de xp_earned)              │
│ XP en user_stats:          500 (total_xp almacenado)            │
│ ─────────────────────────────────────────────────────────────   │
│ DIFERENCIA:                500 XP PERDIDOS                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔬 CAUSA RAÍZ

### Bug Original en validateRuedaInferencias

**Ubicación:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Problema:** La variable `categoryExpectation` era declarada como `const` y cuando no se encontraba la categoría, el fallback no se asignaba correctamente.

```typescript
// ❌ CÓDIGO BUGGY (antes)
const categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];

if (!categoryExpectation) {
  const fallbackExpectation = fragment.categoryExpectations?.['cat-literal'];
  if (!fallbackExpectation) {
    continue;
  }
  // ❌ fallbackExpectation NUNCA se asigna a categoryExpectation
}

// ✅ CÓDIGO CORREGIDO (después)
let categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];

if (!categoryExpectation) {
  categoryExpectation = fragment.categoryExpectations?.['cat-literal'];
  if (!categoryExpectation) {
    continue;
  }
}
```

### Por qué el intento #2 tiene score=100 pero xp_earned=0

Hay DOS flujos posibles:
1. **ExerciseAttemptService.submitAttempt()** - Calcula rewards internamente
2. **ExerciseSubmissionService.autoGrade()** - Usa validateRuedaInferencias

El intento #2 probablemente:
- Fue validado con score=100 por SQL validate_and_audit()
- Pero el cálculo de rewards NO se ejecutó correctamente
- O se usó el flujo de submissions que tenía el bug

---

## 📋 PLAN DE VERIFICACIÓN

### Fase 1: Verificación Manual de Cada Ejercicio

Para cada ejercicio, ejecutar prueba completa:

```sql
-- Query de verificación por ejercicio
SELECT
    e.title,
    e.exercise_type,
    COUNT(ea.id) as intentos,
    COUNT(CASE WHEN ea.score > 0 THEN 1 END) as con_score,
    COUNT(CASE WHEN ea.xp_earned > 0 THEN 1 END) as con_xp,
    COUNT(CASE WHEN ea.ml_coins_earned > 0 THEN 1 END) as con_coins,
    ROUND(AVG(ea.score), 1) as avg_score,
    SUM(ea.xp_earned) as total_xp,
    SUM(ea.ml_coins_earned) as total_coins
FROM educational_content.exercises e
LEFT JOIN progress_tracking.exercise_attempts ea ON e.id = ea.exercise_id
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.order_index IN (1, 2)
GROUP BY e.id, e.title, e.exercise_type, e.order_index, m.order_index
ORDER BY m.order_index, e.order_index;
```

### Fase 2: Corrección de Datos Históricos

1. **Identificar intentos afectados:**
```sql
-- Intentos con score > 0 pero xp_earned = 0
SELECT * FROM progress_tracking.exercise_attempts
WHERE score > 0 AND (xp_earned = 0 OR xp_earned IS NULL)
  AND is_correct = true;
```

2. **Recalcular XP para afectados:**
```sql
-- Actualizar xp_earned para intentos afectados
UPDATE progress_tracking.exercise_attempts
SET
    xp_earned = score - (hints_used * 10),
    ml_coins_earned = FLOOR(score / 10) - (array_length(comodines_used, 1) * 2)
WHERE score > 0
  AND (xp_earned = 0 OR xp_earned IS NULL)
  AND is_correct = true;
```

3. **Recalcular user_stats:**
```sql
-- Recalcular total_xp desde attempts
UPDATE gamification_system.user_stats us
SET
    total_xp = (
        SELECT COALESCE(SUM(xp_earned), 0)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id AND ea.is_correct = true
    ),
    ml_coins = 100 + (
        SELECT COALESCE(SUM(ml_coins_earned), 0)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id AND ea.is_correct = true
    )
WHERE us.user_id IN (
    SELECT DISTINCT user_id FROM progress_tracking.exercise_attempts
    WHERE score > 0 AND (xp_earned = 0 OR xp_earned IS NULL) AND is_correct = true
);
```

### Fase 3: Validación Post-Corrección

```sql
-- Verificar que no hay discrepancias
SELECT
    ea.user_id,
    SUM(ea.xp_earned) as xp_from_attempts,
    us.total_xp as stored_xp,
    SUM(ea.xp_earned) - COALESCE(us.total_xp, 0) as diferencia
FROM progress_tracking.exercise_attempts ea
LEFT JOIN gamification_system.user_stats us ON ea.user_id = us.user_id
WHERE ea.is_correct = true
GROUP BY ea.user_id, us.total_xp
HAVING SUM(ea.xp_earned) != COALESCE(us.total_xp, 0);
```

---

## 🎯 ACCIONES RECOMENDADAS

### Inmediatas (P0)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 1 | Verificar que fix de validateRuedaInferencias está deployado | Backend-Agent | ⏳ |
| 2 | Corregir datos históricos de intentos afectados | Database-Agent | ⏳ |
| 3 | Recalcular user_stats para usuarios afectados | Database-Agent | ⏳ |
| 4 | Validar que no hay discrepancias después de corrección | Database-Agent | ⏳ |

### Corto Plazo (P1)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 5 | Agregar logging más detallado en awardRewards | Backend-Agent | ⏳ |
| 6 | Crear test E2E para flujo completo XP/coins | Backend-Agent | ⏳ |
| 7 | Agregar alertas de monitoreo para discrepancias | Backend-Agent | ⏳ |

### Prevención (P2)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 8 | Implementar reconciliación periódica de XP | Database-Agent | ⏳ |
| 9 | Agregar constraint CHECK en exercise_attempts | Database-Agent | ⏳ |
| 10 | Documentar flujo completo de gamificación | Architecture-Analyst | ⏳ |

---

## 📊 MÉTRICAS DE IMPACTO

- **Usuarios afectados:** 1 confirmado (posiblemente más)
- **XP perdidos:** 500 XP mínimo
- **ML coins perdidos:** ~20-40 coins estimado
- **Ejercicios afectados:** 1 (Rueda de Inferencias)
- **Intentos afectados:** 3-4 de 5 (60-80%)

---

## 📎 REFERENCIAS

### Documentación
- `orchestration/agentes/architecture-analyst/rueda-inferencias-bugs-2025-11-23/`
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

### Archivos Clave
```
apps/
├── backend/src/modules/progress/services/
│   ├── exercise-attempt.service.ts (flujo de attempts)
│   └── exercise-submission.service.ts (flujo de submissions + validateRuedaInferencias)
├── database/ddl/schemas/
│   ├── progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql
│   └── gamilit/functions/14-update_user_stats_on_exercise_complete.sql
└── frontend/src/features/mechanics/module2/
    └── RuedaInferencias/RuedaInferenciasExercise.tsx
```

---

**Generado por:** Architecture-Analyst
**Próximo paso:** Orquestar agentes para corrección de datos
