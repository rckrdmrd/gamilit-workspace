# FASE 4: Evaluacion de Condiciones (meetsConditions) - Analisis Completo

**Fecha:** 2026-02-21
**Archivo principal:** `apps/backend/src/modules/gamification/services/achievements.service.ts` (lineas 602-958)
**Metodo:** `meetsConditions(userId, userStats, conditions)`

---

## 1. TABLA DE TODOS LOS CONDITION TYPES

### 1.1 Condition Types en meetsConditions() (Backend - 16 tipos)

| # | Tipo | Que evalua | Fuente de datos | SQL raw? | Verificado | Problemas |
|---|------|-----------|-----------------|----------|------------|-----------|
| 1 | `exercise_completion` | N ejercicios completados | `userStats.exercises_completed` | No | OK | Ninguno |
| 2 | `streak` | Racha de N dias consecutivos | `userStats.current_streak` | No | OK | Ninguno |
| 3 | `module_completion` | Completar modulo al X% | `progress_tracking.module_progress` + `educational_content.modules` | Si | **FALLA** | 3 errores SQL criticos (ver P-001, P-002, P-003) |
| 4 | `all_modules_completion` | Completar todos los modulos con score promedio | `userStats.modules_completed` + `userStats.average_score` | No | OK | Ninguno |
| 5 | `perfect_score` | N puntuaciones perfectas | `userStats.perfect_scores` | No | OK | Ninguno |
| 6 | `skill_mastery` | Dominar un skill con score minimo | Hardcoded a `perfect_scores >= 10` | No | **STUB** | No implementado (ver P-004) |
| 7 | `exploration` | Explorar modulos/niveles | `userStats.modules_completed` o `exercises_completed >= 5` | No | **INCORRECTA** | No evalua requirements reales (ver P-005) |
| 8 | `social` | Actividades sociales | `social_features.classroom_members` + `social_features.friendships` | Si | OK | SQL correcto |
| 9 | `special` | Primer login | `userStats.last_activity_at` | No | OK | Logica contradictoria pero funcional (ver P-006) |
| 10 | `module_first_exercise` | Primer ejercicio en modulo | `progress_tracking.exercise_submissions` + `educational_content.exercises` + `educational_content.modules` | Si | **FALLA** | Columna `m.code` no existe (ver P-007) |
| 11 | `exercise_score` | Score maximo en tipo de ejercicio | `progress_tracking.exercise_submissions` + `educational_content.exercises` | Si | OK | SQL correcto |
| 12 | `exercise_repetition` | N completaciones con score minimo | `progress_tracking.exercise_submissions` + `educational_content.exercises` | Si | OK | SQL correcto |
| 13 | `exercise_speed` | Completar rapido con score minimo | `progress_tracking.exercise_submissions` + `educational_content.exercises` | Si | **FALLA** | Columna `es.time_spent` no existe (ver P-008) |
| 14 | `content_analysis` | N analisis con score minimo | `progress_tracking.exercise_submissions` + `educational_content.exercises` | Si | OK | SQL correcto (alias de exercise_repetition) |
| 15 | `module_average_score` | Score promedio en modulo | `progress_tracking.exercise_submissions` + `educational_content.exercises` + `educational_content.modules` | Si | **FALLA** | Columna `m.code` no existe (ver P-009) |
| 16 | `progress` (legacy) | Ejercicios + modulos completados | `userStats` | No | OK | Legacy, funcional |
| 17 | `level` (legacy) | Nivel minimo | `userStats.level` | No | OK | Legacy, funcional |
| 18 | `score` (legacy) | Score promedio + perfect scores | `userStats.average_score` + `userStats.perfect_scores` | No | OK | Legacy, funcional |
| 19 | `rank` (legacy) | Rango maya alcanzado | `userStats.current_rank` | No | OK | Funcional con helper `userReachedRank()` |
| 20 | `ml_coins` (legacy) | ML coins acumuladas | `userStats.ml_coins_earned_total` | No | OK | Legacy, funcional |

### 1.2 Condition Types en Seeds pero NO en meetsConditions() (5 tipos)

Estos tipos existen en `20-achievements-collection.sql` pero no tienen case en meetsConditions():

| # | Tipo en seed | Achievement | Resultado |
|---|-------------|-------------|-----------|
| 1 | `achievements_collected` | Coleccionista de Logros | Cae en `default` -> `return false` + warn log |
| 2 | `module_levels` | Maestro de Niveles | Cae en `default` -> `return false` + warn log |
| 3 | `items_equipped` | Coleccionista de Avatares | Cae en `default` -> `return false` + warn log |
| 4 | `coins_accumulated` | Millonario ML | Cae en `default` -> `return false` + warn log |
| 5 | `shop_completionist` | Cazador de Tesoros | Cae en `default` -> `return false` + warn log |

**Impacto:** 5 de 40 achievements (12.5%) NUNCA se pueden desbloquear via `detectAndGrantEarned()`.

### 1.3 Resumen de Cobertura

| Fuente de Seeds | Total | Cubiertos en meetsConditions | Con bugs | Sin handler |
|----------------|-------|------------------------------|----------|-------------|
| 04-achievements.sql | 20 | 20 | 4 (module_completion x3, exploration x2, special x1, skill_mastery x2) | 0 |
| 14-achievements-m3-m5.sql | 15 | 15 | 5 (module_first_exercise x1, exercise_speed x1, module_completion x3, module_average_score x1) | 0 |
| 20-achievements-collection.sql | 5 | 0 | - | 5 |
| **TOTAL** | **40** | **35** | **~11 afectados** | **5** |

---

## 2. VERIFICACION PUNTO POR PUNTO

### VP-1: Condition types vs formato JSONB en seeds

**Formato seed (todos los seeds):**
```json
{
  "type": "exercise_completion",
  "requirements": {
    "exercises_completed": 10
  }
}
```

**Codigo backend (linea 607-609):**
```typescript
const cond = conditions as unknown as AchievementConditions;
const type = cond.type || 'generic';
const reqs = (cond.requirements || {}) as unknown as Record<string, unknown>;
```

**Resultado:** El parsing de la estructura JSONB es correcto. El backend lee `conditions.type` y `conditions.requirements` que coincide con el formato `jsonb_build_object('type', ..., 'requirements', ...)` de los seeds.

### VP-2: SQL queries dentro de meetsConditions()

**6 queries SQL raw identificadas:**

| Query | Lineas | Tablas | Problemas |
|-------|--------|--------|-----------|
| module_completion | 646-653 | `progress_tracking.module_progress` JOIN `educational_content.modules` | **3 BUGS: `m.slug` no existe, `mp.completion_percentage` no existe, `r.module_id` lee seed con formato slug vs code** |
| social:classrooms | 731-736 | `social_features.classroom_members` | OK |
| social:activities | 748-754 | `social_features.classroom_members` + `social_features.friendships` | OK |
| module_first_exercise | 793-803 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` JOIN `educational_content.modules` | **1 BUG: `m.code` no existe, columna es `m.module_code`** |
| exercise_score | 815-824 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` | OK |
| exercise_repetition | 835-846 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` | OK |
| exercise_speed | 858-869 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` | **1 BUG: `es.time_spent` no existe, columna es `es.time_spent_seconds`** |
| content_analysis | 881-891 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` | OK |
| module_average_score | 903-913 | `progress_tracking.exercise_submissions` JOIN `educational_content.exercises` JOIN `educational_content.modules` | **1 BUG: `m.code` no existe, columna es `m.module_code`** |

### VP-3: Funcion SQL deprecated check_and_grant_achievements()

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql`

**Estado:** Marcada como `@DEPRECATED` en linea 4 (2026-02-18, REC-005).

**Llamada desde backend?** NO. Grep en `apps/backend/src/` no encuentra ninguna llamada a `check_and_grant_achievements`.

**Llamada desde SQL?** SI. La funcion `progress_tracking.grant_mission_completion_rewards()` (archivo `apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql`, linea 77) la llama:
```sql
SELECT COUNT(*) INTO v_achievements_count
FROM gamification_system.check_and_grant_achievements(
    p_user_id, 'MISSIONS_COMPLETED', 1
);
```

**Impacto:** Cuando una mision se completa via DB function, se invoca la funcion deprecated. Dado que esta funcion solo maneja event types UPPERCASE y los seeds usan condition types lowercase, **el resultado siempre es 0 achievements otorgados**. No causa error pero es codigo muerto.

### VP-4: Datos necesarios en tablas para condiciones avanzadas

| Condicion | Tabla requerida | Columna clave | Existe? | Nombre correcto |
|-----------|----------------|---------------|---------|-----------------|
| `module_first_exercise` | `exercise_submissions` | `status = 'graded'` | SI | `status` es text, valor 'graded' valido |
| `module_first_exercise` | `modules` | `code` | **NO** | `module_code` |
| `exercise_score` | `exercise_submissions` | `score` | SI | `score` integer |
| `exercise_speed` | `exercise_submissions` | `time_spent` | **NO** | `time_spent_seconds` |
| `module_completion` | `module_progress` | `completion_percentage` | **NO** | `progress_percentage` |
| `module_completion` | `modules` | `slug` | **NO** | `module_code` |

### VP-5: Condiciones que fallan silenciosamente

**Catch block principal (lineas 953-957):**
```typescript
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  this.logger.error(`[meetsConditions] Error evaluating ${type}: ${errorMsg}`);
  return false;
}
```

**Analisis:** El catch block NO es vacio - registra error con `logger.error`. Pero retorna `false` silenciosamente, lo que significa que **SQL errors en las queries con columnas incorrectas se ocultan como "condicion no cumplida"** en lugar de propagarse como errores.

**Default case (lineas 949-951):**
```typescript
default:
  this.logger.warn(`[meetsConditions] Unrecognized condition type: ${type}`);
  return false;
```

**Analisis:** Registra warning. Los 5 tipos de collection (`achievements_collected`, `module_levels`, `items_equipped`, `coins_accumulated`, `shop_completionist`) caen aqui. Se loguean pero no se otorgan.

### VP-6: Tenant_id/schema en SQL queries

**Hallazgo CRITICO:** NINGUNA de las 9 queries SQL raw filtra por `tenant_id`.

Queries afectadas:
- `module_completion`: No filtra por tenant en `module_progress` ni `modules`
- `module_first_exercise`: No filtra por tenant en `exercise_submissions`, `exercises`, ni `modules`
- `exercise_score`: No filtra por tenant en `exercise_submissions` ni `exercises`
- `exercise_repetition`: No filtra por tenant
- `exercise_speed`: No filtra por tenant
- `content_analysis`: No filtra por tenant
- `module_average_score`: No filtra por tenant
- `social:classrooms`: No filtra por tenant en `classroom_members`
- `social:activities`: No filtra por tenant

**Impacto:** En un entorno multi-tenant, un usuario podria obtener achievements basados en datos de otro tenant. Sin embargo, dado que la aplicacion actualmente opera con un solo tenant principal (`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`), el impacto practico es BAJO en produccion actual pero ALTO para escalabilidad.

**Nota:** Las tablas tienen RLS (Row Level Security) habilitado, lo que mitigaria parcialmente este problema si las queries se ejecutaran con el contexto de usuario correcto. Sin embargo, TypeORM datasource queries (`this.dataSource.query()`) tipicamente se ejecutan con el usuario de la aplicacion (`gamilit_user`), no con el contexto RLS del usuario final.

---

## 3. HALLAZGOS (Lo que funciona correctamente)

### H-001: Parsing de estructura JSONB correcto
- **Archivo:** `achievements.service.ts:607-609`
- **Evidencia:** La estructura `{ type, requirements }` se parsea correctamente desde el JSONB de la tabla `achievements.conditions`. Los 40 seeds usan este formato consistentemente.

### H-002: 10 condition types funcionan correctamente sin SQL
- **Tipos:** `exercise_completion`, `streak`, `all_modules_completion`, `perfect_score`, `progress`, `level`, `score`, `rank`, `ml_coins`, `special`
- **Evidencia:** Estos tipos solo leen de `UserStats` entity, que esta correctamente mapeada via TypeORM. No dependen de SQL raw.

### H-003: 3 condition types con SQL raw funcionan correctamente
- **Tipos:** `exercise_score`, `exercise_repetition`, `content_analysis`
- **Evidencia:** Las queries usan columnas correctas (`es.score`, `e.exercise_type`, `es.status`), schemas correctos (`progress_tracking`, `educational_content`), y parametrizacion segura (`$1`, `$2`, `$3`).

### H-004: Social conditions implementadas correctamente
- **Archivo:** `achievements.service.ts:727-764`
- **Evidencia:** Las 2 sub-condiciones (`classrooms_joined` y `social_activities`) usan schemas y columnas correctas. La query de `friendships` usa `status = 'accepted'` que coincide con el DDL.

### H-005: Error logging no es silencioso
- **Archivo:** `achievements.service.ts:953-957`
- **Evidencia:** Tanto el catch block general como el default case registran informacion de error. No hay catch blocks vacios.

### H-006: Rate limiting implementado
- **Archivo:** `achievements.service.ts:139-168`
- **Evidencia:** `checkRateLimit()` implementa correctamente 5 achievements/minuto por usuario con ventana deslizante.

### H-007: Deprecated SQL function no llamada desde backend
- **Evidencia:** Grep en `apps/backend/src/` confirma 0 llamadas a `check_and_grant_achievements`.

### H-008: updateIncrementalProgress complementa detectAndGrantEarned
- **Archivo:** `achievements.service.ts:415-526`
- **Evidencia:** El metodo `updateIncrementalProgress` actualiza progreso incrementalmente para achievements ya trackeados, mientras `detectAndGrantEarned` detecta y otorga automaticamente. Ambos cubren caminos diferentes de evaluacion.

---

## 4. PROBLEMAS

### P-001: CRITICO - module_completion usa `m.slug` pero la columna es `m.module_code`

**Archivo:** `achievements.service.ts:651`
**Linea SQL:**
```sql
AND m.slug = $2
```
**Columna real en DDL:** `educational_content.modules.module_code` (DDL linea 29)
**No existe columna `slug` en la tabla `modules`.**

**Seeds afectados (04-achievements.sql):**
- `90000003-0000-0000-0000-000000000001` - Comprension Literal Dominada (`module_id: 'modulo-01-comprension-literal'`)
- `90000003-0000-0000-0000-000000000002` - Comprension Inferencial Dominada (`module_id: 'modulo-02-comprension-inferencial'`)
- `90000003-0000-0000-0000-000000000003` - Comprension Critica Dominada (`module_id: 'modulo-03-comprension-critica'`)

**Seeds afectados (14-achievements-m3-m5.sql):**
- `90000003-0001-0000-0000-000000000005` - Comprension Critica Dominada M3 (`module_code: 'MOD-03-CRITICA'`)
- `90000004-0001-0000-0000-000000000005` - Maestro Alfabetizacion Digital (`module_code: 'MOD-04-DIGITAL'`)
- `90000005-0001-0000-0000-000000000004` - Produccion Completa (`module_code: 'MOD-05-PRODUCCION'`)

**Impacto:** La query SQL falla con `column m.slug does not exist`. El catch block captura el error y retorna `false`, haciendo que **6 module_completion achievements NUNCA se puedan desbloquear** via auto-detection.

**Severidad:** CRITICO

### P-002: CRITICO - module_completion usa `mp.completion_percentage` pero la columna es `mp.progress_percentage`

**Archivo:** `achievements.service.ts:647`
**Linea SQL:**
```sql
SELECT mp.completion_percentage
FROM progress_tracking.module_progress mp
```
**Columna real en DDL:** `progress_tracking.module_progress.progress_percentage` (DDL linea 14)
**No existe columna `completion_percentage` en la tabla `module_progress`.**

**Impacto:** Incluso si P-001 se corrigiera, esta query fallaria porque la columna no existe. Doble fallo que asegura que module_completion NUNCA funcione.

**Severidad:** CRITICO

### P-003: ALTO - Inconsistencia de formato entre seeds de 04 y 14 para module_completion

**Archivo:** `achievements.service.ts:643` (interface `ModuleCompletionReqs`)

**04-achievements.sql usa:**
```json
{
  "type": "module_completion",
  "requirements": {
    "module_id": "modulo-01-comprension-literal",
    "completion_percentage": 100
  }
}
```

**14-achievements-m3-m5.sql usa:**
```json
{
  "type": "module_completion",
  "requirements": {
    "module_code": "MOD-03-CRITICA",
    "all_exercises": true
  }
}
```

**Problema:** El handler lee `r.module_id` y `r.completion_percentage` (interface `ModuleCompletionReqs`). Para los seeds M3-M5:
- `r.module_id` es `undefined` (el seed usa `module_code`, no `module_id`)
- `r.completion_percentage` es `undefined` (el seed usa `all_exercises`, no `completion_percentage`)

Ademas, los valores del 04 son slug-like (`modulo-01-comprension-literal`) pero los module_codes reales son `MOD-01-LITERAL`, `MOD-02-INFERENCIAL`, etc. Ningun formato coincide correctamente.

**Severidad:** ALTO

### P-004: MEDIO - skill_mastery es un stub no implementado

**Archivo:** `achievements.service.ts:705-709`
```typescript
case 'skill_mastery': {
  // TODO: Implementar consulta por skill_type cuando esté disponible en metadata
  this.logger.debug(`[skill_mastery] Type not fully implemented, checking perfect_scores`);
  return userStats.perfect_scores >= 10;
}
```

**Seeds afectados:**
- `90000004-0000-0000-0000-000000000002` - Experto en Inferencias (necesita skill_type: 'inferencial', 20 exercises, min_score 90)
- `90000004-0000-0000-0000-000000000003` - Critico Avanzado (necesita skill_type: 'critico', 20 exercises, min_score 90)

**Problema:** El handler ignora completamente los requirements (`skill_type`, `exercises_completed`, `min_score`) y hardcodea `perfect_scores >= 10`. Un usuario con 10 perfect scores de cualquier modulo obtendria ambos achievements incorrectamente.

**Severidad:** MEDIO

### P-005: MEDIO - exploration ignora requirements reales

**Archivo:** `achievements.service.ts:716-719`
```typescript
case 'exploration': {
  const met = userStats.modules_completed > 0 || userStats.exercises_completed >= 5;
  ...
  return met;
}
```

**Seeds afectados:**
- `90000005-0000-0000-0000-000000000001` - Explorador Curioso (necesita `different_modules: 3`, `min_exercises_per_module: 1`)
- `90000005-0000-0000-0000-000000000002` - Aventurero del Conocimiento (necesita `difficulty_levels: [4 niveles]`, `min_exercises_per_level: 2`)

**Problema:** El handler no lee los requirements en absoluto. Un usuario con 5 ejercicios en un solo modulo obtendria "Explorador Curioso" (que deberia requerir 3 modulos diferentes). La condicion es demasiado permisiva.

**Severidad:** MEDIO

### P-006: BAJO - Logica contradictoria en special:first_login

**Archivo:** `achievements.service.ts:773-779`
```typescript
if (r.first_login === true) {
  const met = userStats.exercises_completed === 0 && !userStats.last_activity_at;
  this.logger.debug(`[special:first_login] First login check: ${met}`);
  // Para primer login, lo otorgamos si es usuario nuevo
  return !userStats.last_activity_at;
}
```

**Problema:** La variable `met` se calcula pero se ignora. El return es solo `!userStats.last_activity_at`. Esto otorgaria el achievement a cualquier usuario sin actividad, pero el metodo `detectAndGrantEarned()` solo se llama despues de completar un ejercicio (desde `exercise-submission.service.ts:486`), momento en el cual `last_activity_at` ya podria estar actualizado. El timing determina si funciona o no.

**Severidad:** BAJO

### P-007: CRITICO - module_first_exercise usa `m.code` pero la columna es `m.module_code`

**Archivo:** `achievements.service.ts:801`
**Linea SQL:**
```sql
AND m.code = $2
```
**Columna real en DDL:** `educational_content.modules.module_code` (DDL linea 29)

**Seeds afectados:**
- `90000003-0001-0000-0000-000000000001` - Pensador Critico Emergente (`module_code: 'MOD-03-CRITICA'`)

**Impacto:** La query falla con `column m.code does not exist`. El catch block retorna `false`.

**Severidad:** CRITICO

### P-008: CRITICO - exercise_speed usa `es.time_spent` pero la columna es `es.time_spent_seconds`

**Archivo:** `achievements.service.ts:867`
**Linea SQL:**
```sql
AND es.time_spent <= $4
```
**Columna real en DDL:** `progress_tracking.exercise_submissions.time_spent_seconds` (DDL linea 22)

**Seeds afectados:**
- `90000004-0001-0000-0000-000000000003` - Velocista Digital (max_time_seconds: 30)

**Impacto:** La query falla con `column es.time_spent does not exist`. El catch block retorna `false`.

**Severidad:** CRITICO

### P-009: CRITICO - module_average_score usa `m.code` pero la columna es `m.module_code`

**Archivo:** `achievements.service.ts:910`
**Linea SQL:**
```sql
AND m.code = $2
```
**Columna real en DDL:** `educational_content.modules.module_code` (DDL linea 29)

**Seeds afectados:**
- `90000005-0001-0000-0000-000000000005` - Creador Multimedia Experto (`module_code: 'MOD-05-PRODUCCION'`)

**Impacto:** La query falla con `column m.code does not exist`. El catch block retorna `false`.

**Severidad:** CRITICO

### P-010: ALTO - 5 collection condition types sin handler

**Archivo:** `achievements.service.ts:949-951` (default case)

**Tipos sin handler:**
| Tipo | Achievement | Evaluacion posible |
|------|------------|--------------------|
| `achievements_collected` | Coleccionista de Logros | `userStats.achievements_earned >= 5` |
| `module_levels` | Maestro de Niveles | Query a `module_progress` |
| `items_equipped` | Coleccionista de Avatares | Query a `gamification_system.user_inventory` |
| `coins_accumulated` | Millonario ML | `userStats.ml_coins_earned_total >= 10000` |
| `shop_completionist` | Cazador de Tesoros | Query a `gamification_system.store_purchases` |

**Impacto:** 5 achievements nunca se pueden desbloquear automaticamente.

**Severidad:** ALTO

### P-011: MEDIO - Falta filtro tenant_id en todas las queries SQL raw

**Archivos afectados:** `achievements.service.ts` lineas 645-913 (9 queries)

**Detalle:** Ninguna query filtra por `tenant_id`. En entorno multi-tenant, un usuario de tenant A podria obtener achievements basados en ejercicios completados por tenant B si los user_ids colisionaran o si se reutilizaran profiles entre tenants.

**Mitigacion actual:** Solo 1 tenant en produccion. Pero viola el principio de multi-tenancy del sistema.

**Severidad:** MEDIO (para produccion actual), ALTO (para escalabilidad)

### P-012: MEDIO - detectAndGrantEarned no considera tenant_id al buscar achievements

**Archivo:** `achievements.service.ts:542-543`
```typescript
const allAchievements = await this.findAll();
```
`findAll()` (linea 186-194) filtra solo por `is_active = true` e `is_secret = false`. No filtra por `tenant_id`, lo que significa que achievements de todos los tenants son evaluados para todos los usuarios.

**Severidad:** MEDIO

### P-013: BAJO - progress/max_progress set incorrectamente en detectAndGrantEarned

**Archivo:** `achievements.service.ts:567-569`
```typescript
const conditionsTyped = achievement.conditions as { requirements?: { exercises_completed?: number } };
const reqs = conditionsTyped.requirements || {};
grantDto.progress = reqs.exercises_completed || 100;
grantDto.max_progress = reqs.exercises_completed || 100;
```

**Problema:** Siempre lee `exercises_completed` independientemente del tipo de condicion. Para achievements de tipo `streak` (que usan `consecutive_days`), `social` (que usan `classrooms_joined`), o `module_completion` (que usan `completion_percentage`), el valor siempre sera `100` (el fallback). Esto no afecta la funcionalidad (el achievement se marca como completado), pero los valores de progress/max_progress no reflejan la realidad.

**Severidad:** BAJO

### P-014: BAJO - updateIncrementalProgress tiene matching parcial

**Archivo:** `achievements.service.ts:437-457`

Para `exercise_completion` activity type, el handler tambien verifica `module_first_exercise` y `exercise_score`, pero:
- Para `module_first_exercise` (linea 444-449): Lee `conditions.requirements?.module_id` pero los M3-M5 seeds usan `module_code`. El campo `module_id` sera `undefined`, asi que la condicion `!reqModule || reqModule === activityData.moduleId` sera `true` (porque `!undefined === true`), incrementando progreso para TODOS los module_first_exercise achievements sin importar el modulo. Esto es un falso positivo.

**Severidad:** BAJO (progreso se incrementa indebidamente pero auto-detection verifica condiciones reales)

---

## 5. RECOMENDACIONES

### R-001: CRITICO - Corregir columna `m.slug` -> `m.module_code` en module_completion (P-001)

**Archivo:** `achievements.service.ts:651`
```typescript
// ANTES (INCORRECTO):
AND m.slug = $2

// DESPUES (CORRECTO):
AND m.module_code = $2
```

### R-002: CRITICO - Corregir columna `mp.completion_percentage` -> `mp.progress_percentage` en module_completion (P-002)

**Archivo:** `achievements.service.ts:647`
```typescript
// ANTES (INCORRECTO):
SELECT mp.completion_percentage

// DESPUES (CORRECTO):
SELECT mp.progress_percentage
```

Y en linea 661:
```typescript
// ANTES:
const percentage = parseFloat(result[0].completion_percentage) || 0;

// DESPUES:
const percentage = parseFloat(result[0].progress_percentage) || 0;
```

### R-003: ALTO - Unificar formato de seeds module_completion (P-003)

Los seeds de `04-achievements.sql` usan `module_id` con valores slug-like, mientras los seeds de `14-achievements-m3-m5.sql` usan `module_code` con valores reales de module_code.

**Opcion A (recomendada):** Actualizar `04-achievements.sql` para usar `module_code` con valores reales:
```sql
-- ANTES:
'module_id', 'modulo-01-comprension-literal'
-- DESPUES:
'module_code', 'MOD-01-LITERAL'
```

Y actualizar el handler para leer `r.module_code` en lugar de `r.module_id`. Actualizar interface `ModuleCompletionReqs` para incluir ambos campos, o unificar en `module_code`.

**Opcion B:** Manejar ambos campos en el handler con fallback: `r.module_code || r.module_id`.

### R-004: CRITICO - Corregir `m.code` -> `m.module_code` en 3 queries (P-007, P-009)

**Archivos afectados:**
- `achievements.service.ts:801` (module_first_exercise)
- `achievements.service.ts:910` (module_average_score)

```typescript
// ANTES:
AND m.code = $2

// DESPUES:
AND m.module_code = $2
```

### R-005: CRITICO - Corregir `es.time_spent` -> `es.time_spent_seconds` en exercise_speed (P-008)

**Archivo:** `achievements.service.ts:867`
```typescript
// ANTES:
AND es.time_spent <= $4

// DESPUES:
AND es.time_spent_seconds <= $4
```

### R-006: MEDIO - Implementar skill_mastery correctamente (P-004)

Reemplazar el stub con una query real:
```typescript
case 'skill_mastery': {
  const r = reqs as unknown as { skill_type: string; exercises_completed: number; min_score: number };
  const moduleCodeMap: Record<string, string> = {
    'inferencial': 'MOD-02-INFERENCIAL',
    'critico': 'MOD-03-CRITICA',
    'literal': 'MOD-01-LITERAL',
  };
  const moduleCode = moduleCodeMap[r.skill_type] || r.skill_type;
  const result = await this.dataSource.query(`
    SELECT COUNT(*) as count
    FROM progress_tracking.exercise_submissions es
    JOIN educational_content.exercises e ON es.exercise_id = e.id
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE es.user_id = $1
      AND m.module_code = $2
      AND es.status = 'graded'
      AND es.score >= $3
  `, [userId, moduleCode, r.min_score || 0]);
  const count = parseInt(result[0]?.count || '0');
  return count >= (r.exercises_completed || 1);
}
```

### R-007: MEDIO - Implementar exploration correctamente (P-005)

Reemplazar la evaluacion simplificada con queries que verifiquen los requirements reales:
```typescript
case 'exploration': {
  const r = reqs as Record<string, unknown>;
  if (r.different_modules) {
    const result = await this.dataSource.query(`
      SELECT COUNT(DISTINCT m.id) as module_count
      FROM progress_tracking.exercise_submissions es
      JOIN educational_content.exercises e ON es.exercise_id = e.id
      JOIN educational_content.modules m ON e.module_id = m.id
      WHERE es.user_id = $1 AND es.status = 'graded'
    `, [userId]);
    return parseInt(result[0]?.module_count || '0') >= (r.different_modules as number);
  }
  if (r.difficulty_levels) {
    const result = await this.dataSource.query(`
      SELECT e.difficulty_level, COUNT(*) as count
      FROM progress_tracking.exercise_submissions es
      JOIN educational_content.exercises e ON es.exercise_id = e.id
      WHERE es.user_id = $1 AND es.status = 'graded'
      GROUP BY e.difficulty_level
      HAVING COUNT(*) >= $2
    `, [userId, (r.min_exercises_per_level as number) || 1]);
    const levels = (r.difficulty_levels as string[]) || [];
    return result.length >= levels.length;
  }
  return false;
}
```

### R-008: ALTO - Implementar handlers para 5 collection types (P-010)

Agregar cases para:
```typescript
case 'achievements_collected':
  return userStats.achievements_earned >= ((reqs as Record<string, number>).achievements_unlocked || 0);

case 'coins_accumulated':
  return userStats.ml_coins_earned_total >= ((reqs as Record<string, number>).total_ml_coins_earned || 0);

// module_levels, items_equipped, shop_completionist requieren queries adicionales
```

### R-009: MEDIO - Agregar filtro tenant_id a queries SQL raw (P-011)

Considerar pasar `tenantId` como parametro adicional o filtrarlo en las queries. Ejemplo:
```sql
WHERE es.user_id = $1
  AND m.module_code = $2
  AND es.status = 'graded'
  -- Agregar filtro tenant si aplica:
  AND (m.tenant_id IS NULL OR m.tenant_id = $4)
```

### R-010: BAJO - Eliminar llamada deprecated en grant_mission_completion_rewards (VP-3)

**Archivo:** `apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql:77`
Reemplazar la llamada a `check_and_grant_achievements` con un comentario indicando que la evaluacion se hace via backend, o eliminar la linea y retornar `0` para `achievements_unlocked`.

---

## 6. RESUMEN EJECUTIVO

| Metrica | Valor |
|---------|-------|
| Total condition types en seeds | 20 tipos unicos |
| Implementados en meetsConditions() | 20 (15 primarios + 5 legacy) |
| Funcionando correctamente | 13 |
| Con bugs SQL criticos | 4 (module_completion, module_first_exercise, exercise_speed, module_average_score) |
| Stubs/no implementados | 2 (skill_mastery, exploration) |
| Sin handler (collection) | 5 (achievements_collected, module_levels, items_equipped, coins_accumulated, shop_completionist) |
| Total achievements afectados | ~16 de 40 (40%) |
| Problemas CRITICOS | 5 (P-001, P-002, P-007, P-008, P-009) |
| Problemas ALTOS | 2 (P-003, P-010) |
| Problemas MEDIOS | 4 (P-004, P-005, P-011, P-012) |
| Problemas BAJOS | 3 (P-006, P-013, P-014) |

**Conclusion principal:** Los 5 problemas CRITICOS son todos errores de nombre de columna en queries SQL raw que causan que **al menos 9 achievements de tipo module_completion, module_first_exercise, exercise_speed y module_average_score fallen silenciosamente**. El catch block oculta los errores retornando `false`. Corregir estos 5 errores de columna (slug->module_code, completion_percentage->progress_percentage, code->module_code, time_spent->time_spent_seconds) resolveria el 60% de los problemas inmediatamente.

---

**Archivos analizados:**
- `apps/backend/src/modules/gamification/services/achievements.service.ts` (1131 lineas)
- `apps/backend/src/modules/gamification/services/user-stats.service.ts` (419 lineas)
- `apps/backend/src/modules/gamification/entities/user-stats.entity.ts` (330 lineas)
- `apps/database/seeds/dev/gamification_system/04-achievements.sql` (20 achievements)
- `apps/database/seeds/dev/gamification_system/14-achievements-m3-m5.sql` (15 achievements)
- `apps/database/seeds/dev/gamification_system/20-achievements-collection.sql` (5 achievements)
- `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql`
- `apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
- `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`
- `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`
- `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`
- `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`
- `apps/database/seeds/dev/educational_content/01-modules.sql`
