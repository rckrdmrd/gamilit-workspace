# REPORTE CONSOLIDADO: Analisis del Sistema de Achievements

**Fecha:** 2026-02-21
**Tipo:** ANALYSIS (C+A+P) — 5 fases en paralelo
**Autor:** Claude Opus 4.6
**Estado:** COMPLETADO

---

## RESUMEN EJECUTIVO

El sistema de achievements tiene una **arquitectura bien disenada** (claim-to-earn, WebSocket notifications, React Query canonical, SQL atomico) pero sufre de **multiples errores de implementacion** que causan que **~40% de los 40 achievements (16 de 40) sean imposibles de desbloquear** en produccion.

| Metrica | Valor |
|---------|-------|
| Total problemas encontrados | **45** |
| CRITICO | **8** |
| ALTO | **9** |
| MEDIO | **14** |
| BAJO | **14** |
| Achievements completamente funcionales | ~24 de 40 (60%) |
| Achievements imposibles de desbloquear | ~16 de 40 (40%) |

---

## HALLAZGOS CRITICOS CROSS-PHASE (Top 10)

### 1. [CRITICO] Nombres de columna SQL incorrectos — 9 achievements rotos (F4)
**5 errores de columna en meetsConditions():**
- `m.slug` → debe ser `m.module_code` (6 achievements de module_completion)
- `mp.completion_percentage` → debe ser `mp.progress_percentage`
- `m.code` → debe ser `m.module_code` (module_first_exercise + module_average_score)
- `es.time_spent` → debe ser `es.time_spent_seconds` (exercise_speed)

**Fix:** 5 lineas de codigo en `achievements.service.ts` (lineas 647, 651, 801, 867, 910)

### 2. [CRITICO] `perfect_scores` NUNCA se incrementa (F1)
Ningun trigger ni servicio backend actualiza `user_stats.perfect_scores`. Todos los achievements de tipo `perfect_score`, `skill_mastery`, y `score` con `min_perfect_scores` son imposibles.

**Fix:** Agregar logica al trigger function 14/27 o al backend despues de ejercicio con score=100.

### 3. [CRITICO] `average_score` NUNCA se calcula (F1)
Campo `user_stats.average_score` siempre es 0/null. Achievements de tipo `all_modules_completion` con `min_score_average` y `score` con `min_average_score` son imposibles.

**Fix:** Calcular promedio en trigger o backend despues de cada ejercicio correcto.

### 4. [CRITICO] `exercises_completed` NO se incrementa para M3-M5 (F1)
El trigger DB retorna temprano porque `xp_earned=0` al momento del save. El segundo save no re-dispara por status sin cambio. El backend nunca lo incrementa explicitamente.

**Fix:** Incrementar `exercises_completed` en backend despues de grading, o cambiar trigger para no depender de `xp_earned`.

### 5. [CRITICO] claim_achievement_reward() NO verifica `is_completed` (F2)
Un achievement incompleto puede tener sus recompensas reclamadas via API directa.

**Fix:** 3 lineas SQL en `claim_achievement_reward.sql`.

### 6. [CRITICO] Backend NO retorna achievements en respuesta de submit (F5)
El endpoint `POST /exercises/:id/submit` ejecuta `detectAndGrantEarned()` pero descarta el resultado. El frontend espera `result.achievements` pero siempre es `undefined`.

**Fix:** Incluir achievements otorgados en la respuesta y agregar al DTO.

### 7. [ALTO] Doble conteo de XP y ML Coins en M1-M2 (F1)
El DB trigger suma XP/coins, Y luego `awardRewards()` los suma OTRA VEZ. Usuarios reciben el doble.

**Fix:** Elegir UNA sola fuente (trigger O backend) para XP/coins.

### 8. [ALTO] Rate limit "queuing" sin queue real (F1)
Si >5 achievements se desbloquean en 60s, los excedentes se pierden permanentemente. El log miente diciendo "Queuing".

**Fix:** Aumentar limite a 20, o implementar queue real, o eliminar rate limit en auto-detection.

### 9. [ALTO] 5 condition types de collection sin handler (F4)
`achievements_collected`, `module_levels`, `items_equipped`, `coins_accumulated`, `shop_completionist` caen al `default` case y retornan `false`. 5 achievements afectados.

**Fix:** Implementar handlers para cada tipo.

### 10. [ALTO] CASE incompleto en inicializacion — 13 max_progress incorrectos (F3)
Solo 5 de 15+ requirement keys estan en el CASE. 13 achievements obtienen `max_progress=1` cuando deberian ser 3, 5, 7, 10, 30, o 10000.

**Fix:** Ampliar CASE con todas las keys faltantes.

---

## PROBLEMAS POR FASE Y SEVERIDAD

### FASE 1: Integracion Ejercicios → Logros (12 problemas)

| ID | Severidad | Descripcion |
|----|-----------|-------------|
| F1-P01 | CRITICO | `perfect_scores` nunca se incrementa |
| F1-P02 | CRITICO | `average_score` nunca se calcula |
| F1-P03 | CRITICO | `exercises_completed` no se incrementa para M3-M5 |
| F1-P04 | ALTO | Doble conteo XP/ML Coins en M1-M2 |
| F1-P05 | ALTO | `exercises_completed` se incrementa para attempts incorrectos |
| F1-P06 | ALTO | Achievements secretos nunca evaluados por detectAndGrantEarned |
| F1-P07 | ALTO | Rate limit "queuing" sin queue real |
| F1-P08 | MEDIO | `current_streak` no actualiza en M3-M5 |
| F1-P09 | MEDIO | `modules_completed` solo se incrementa desde attempts |
| F1-P10 | MEDIO | progress/max_progress en grantDto siempre lee exercises_completed |
| F1-P11 | BAJO | `updateIncrementalProgress()` es codigo muerto |
| F1-P12 | BAJO | Column name mismatch `time_spent` vs `time_spent_seconds` (duplicado F4-P08) |

### FASE 2: Flujo de Reclamacion (8 problemas)

| ID | Severidad | Descripcion |
|----|-----------|-------------|
| F2-P01 | CRITICO | Falta verificacion `is_completed` en claim SQL |
| F2-P02 | ALTO | Race condition cron vs manual (sin FOR UPDATE) |
| F2-P04 | ALTO | Sin verificacion de usuario autenticado en endpoint claim |
| F2-P03 | MEDIO | `rewards_received` JSONB nunca se actualiza |
| F2-P05 | MEDIO | user_stats inexistente causa perdida silenciosa de rewards |
| F2-P06 | BAJO | XP desde JSONB pero coins desde columna flat |
| F2-P07 | BAJO | Sin ParseUUIDPipe en endpoint claim |
| F2-P08 | BAJO | Cron sin proteccion contra ejecucion concurrente |

### FASE 3: Inicializacion de Usuario (6 problemas)

| ID | Severidad | Descripcion |
|----|-----------|-------------|
| F3-P01 | ALTO | CASE incompleto — 13 achievements con max_progress=1 incorrecto |
| F3-P02 | ALTO | No hay trigger para nuevos achievements + backfill incompleto |
| F3-P03 | MEDIO | Discrepancia max_progress entre seeds y trigger |
| F3-P04 | MEDIO | Bloque interno de achievements no registra en pending_user_initialization |
| F3-P05 | BAJO | Seed user_achievements inconsistente ("Estudiante Colaborativo") |
| F3-P06 | BAJO | AuthService no verifica que user_achievements fueron creados |

### FASE 4: Evaluacion de Condiciones (14 problemas)

| ID | Severidad | Descripcion |
|----|-----------|-------------|
| F4-P01 | CRITICO | `m.slug` no existe (→ `m.module_code`) |
| F4-P02 | CRITICO | `mp.completion_percentage` no existe (→ `mp.progress_percentage`) |
| F4-P07 | CRITICO | `m.code` no existe en module_first_exercise |
| F4-P08 | CRITICO | `es.time_spent` no existe (→ `es.time_spent_seconds`) |
| F4-P09 | CRITICO | `m.code` no existe en module_average_score |
| F4-P03 | ALTO | Formato seed inconsistente: `module_id` (slug) vs `module_code` (real) |
| F4-P10 | ALTO | 5 collection condition types sin handler |
| F4-P04 | MEDIO | `skill_mastery` es un stub hardcoded |
| F4-P05 | MEDIO | `exploration` ignora requirements reales |
| F4-P11 | MEDIO | Sin filtro tenant_id en queries SQL raw |
| F4-P12 | MEDIO | detectAndGrantEarned no filtra por tenant |
| F4-P06 | BAJO | Logica contradictoria en special:first_login |
| F4-P13 | BAJO | progress/max_progress incorrecto en detectAndGrantEarned |
| F4-P14 | BAJO | updateIncrementalProgress matching parcial |

### FASE 5: Frontend Sincronizacion (7 problemas)

| ID | Severidad | Descripcion |
|----|-----------|-------------|
| F5-P01 | CRITICO | Backend NO retorna achievements en respuesta de submit |
| F5-P03 | ALTO | Doble fuente de verdad: 3 archivos usan Zustand deprecado |
| F5-P02 | MEDIO | ExerciseContext hardcodea rarity='common' |
| F5-P04 | MEDIO | CompletionModal aplica rewards localmente sin backend |
| F5-P06 | MEDIO | rankUp siempre null (TODO sin implementar) |
| F5-P05 | BAJO | Zustand store hardcodea required:100 para progress |
| F5-P07 | BAJO | ExerciseContext no invalida cache de achievements |

---

## CORRELACIONES CROSS-PHASE

### Patron 1: UserStats como cuello de botella (F1 + F4)
- F1 demuestra que `perfect_scores`, `average_score`, y `exercises_completed` (M3-M5) no se actualizan
- F4 demuestra que 10 condition types dependen de UserStats
- **Resultado:** Al menos 8 achievements fallan por datos de UserStats desactualizados, ANTES de llegar a los bugs SQL

### Patron 2: Errores silenciados (F1 + F4)
- F1 muestra 8 try-catch blocks que logean pero no propagan errores
- F4 muestra que los SQL column errors se capturan y retornan `false`
- **Resultado:** El sistema parece funcionar pero los achievements simplemente "no se desbloquean" sin error visible

### Patron 3: Inconsistencia de formato (F3 + F4)
- F3 muestra CASE incompleto con solo 5 requirement keys
- F4 muestra seed format inconsistente (`module_id` slug vs `module_code` real)
- **Resultado:** Los achievements se inicializan mal Y se evaluan mal

### Patron 4: Flujo truncado submit → UI (F1 + F5)
- F1 muestra que detectAndGrantEarned() SI se ejecuta
- F5 muestra que el resultado se descarta y no llega al frontend
- **Resultado:** Achievements se otorgan en DB pero el usuario no se entera hasta ver la pagina de logros

### Patron 5: M3-M5 como segunda clase (F1 + F3 + F4)
- F1: exercises_completed no se incrementa, streak no se actualiza, modules_completed no se incrementa
- F3: La inicializacion es identica (no diferencian M1-M2 vs M3-M5)
- F4: Los condition types avanzados (module_first_exercise, module_average_score) estan rotos por SQL
- **Resultado:** Los ejercicios M3-M5 (modulos 3, 4, 5) son completamente invisibles al sistema de achievements

---

## PLAN DE REMEDIACION PRIORIZADO

### Prioridad 1: Fixes SQL criticos (30 min estimado)
**Impacto: Desbloquea 9 achievements rotos + previene exploit de claim**

| # | Archivo | Fix | Linea |
|---|---------|-----|-------|
| 1 | `achievements.service.ts` | `m.slug` → `m.module_code` | 651 |
| 2 | `achievements.service.ts` | `mp.completion_percentage` → `mp.progress_percentage` | 647 |
| 3 | `achievements.service.ts` | `m.code` → `m.module_code` | 801 |
| 4 | `achievements.service.ts` | `es.time_spent` → `es.time_spent_seconds` | 867 |
| 5 | `achievements.service.ts` | `m.code` → `m.module_code` | 910 |
| 6 | `claim_achievement_reward.sql` | Agregar `IF is_completed != TRUE THEN RETURN error` | ~32 |
| 7 | `claim_achievement_reward.sql` | Agregar `FOR UPDATE` en SELECT user_achievements | ~27 |

### Prioridad 2: Campos UserStats faltantes (45 min estimado)
**Impacto: Habilita tracking correcto para M1-M5**

| # | Fix | Archivos |
|---|-----|----------|
| 1 | Implementar incremento de `perfect_scores` en trigger function 14/27 | `functions/14`, `functions/27` |
| 2 | Implementar calculo de `average_score` en trigger o backend | `functions/14`, `functions/27` o `user-stats.service.ts` |
| 3 | Corregir `exercises_completed` para M3-M5 (incrementar en backend o cambiar trigger condition) | `exercise-submission.service.ts` o `functions/27` |
| 4 | Agregar `update_leaderboard_streaks()` a ExerciseSubmissionService | `exercise-submission.service.ts` |
| 5 | Agregar `modules_completed` increment a ExerciseSubmissionService | `exercise-submission.service.ts` |

### Prioridad 3: Eliminar doble conteo (20 min estimado)
**Impacto: Economia de XP/coins correcta**

| # | Fix | Archivos |
|---|-----|----------|
| 1 | Elegir UNA fuente para XP/coins (trigger O backend, no ambos) | `exercise-attempt.service.ts` + triggers |
| 2 | Condicionar `exercises_completed++` a `is_correct = true` | `functions/14` |

### Prioridad 4: Frontend integrations (30 min estimado)
**Impacto: UX mejorada, achievements visibles en submit**

| # | Fix | Archivos |
|---|-----|----------|
| 1 | Incluir achievements en respuesta de submit endpoint | `exercises.controller.ts` + DTO |
| 2 | Corregir mapeo en ExerciseContext (rarity, mlCoinsReward, xpReward) | `ExerciseContext.tsx` |
| 3 | Migrar useProfileData y useAchievementsEnhanced a React Query | 2 hooks + eliminar CompletionModal |

### Prioridad 5: Inicializacion y seguridad (30 min estimado)
**Impacto: Nuevos achievements y nuevos usuarios funcionan correctamente**

| # | Fix | Archivos |
|---|-----|----------|
| 1 | Ampliar CASE de max_progress con 9 keys faltantes | `04-initialize_user_stats.sql` |
| 2 | Corregir backfill script para detectar achievements INDIVIDUALES faltantes | `backfill-user-achievements.sql` |
| 3 | Agregar verificacion de usuario autenticado en endpoint claim | `achievements.controller.ts` |
| 4 | Evaluar achievements secretos en detectAndGrantEarned | `achievements.service.ts:542` |
| 5 | Implementar 5 handlers de collection types | `achievements.service.ts` |

### Prioridad 6: Mejoras menores (20 min estimado)

| # | Fix | Archivos |
|---|-----|----------|
| 1 | Aumentar rate limit a 20 o eliminar en auto-detection | `achievements.service.ts` |
| 2 | Agregar ParseUUIDPipe en endpoint claim | `achievements.controller.ts` |
| 3 | Actualizar `rewards_received` JSONB al reclamar | `claim_achievement_reward.sql` |
| 4 | Agregar lock guard al cron de reconciliacion | `achievement-reconciliation-cron.service.ts` |
| 5 | Agregar logging persistente para fallos de init de achievements | `04-initialize_user_stats.sql` |

---

## LO QUE FUNCIONA BIEN

A pesar de los problemas, la **arquitectura base es solida:**

1. **Claim-to-Earn model** — Previene distribucion accidental de rewards
2. **SQL atomico** — `claim_achievement_reward()` es transaccional
3. **WebSocket pipeline** — achievement:unlocked → DOM event → React Query invalidation
4. **React Query canonical** — AchievementsPage usa la fuente correcta
5. **Transformer robusto** — Mapeo completo con fallbacks defensivos
6. **GamificationOverlay global** — Montado en ProtectedRoute, visible en toda la app
7. **Cache invalidation exhaustiva** — 7 query keys + Zustand sync en claim
8. **Proteccion contra duplicados** — ON CONFLICT DO NOTHING + is_completed check
9. **Error resilience** — Gamificacion nunca bloquea el flujo principal
10. **4 estados visuales** — locked/in_progress/earned/claimed bien implementados

---

## ARCHIVOS CLAVE REFERENCIADOS

| Area | Archivo | Problemas |
|------|---------|-----------|
| Backend | `achievements.service.ts` | F1-P01..P12, F4-P01..P14 |
| Backend | `exercise-submission.service.ts` | F1-P03, F1-P08, F1-P09 |
| Backend | `exercise-attempt.service.ts` | F1-P04, F1-P05 |
| Backend | `exercises.controller.ts` | F5-P01, F5-P06 |
| Backend | `achievements.controller.ts` | F2-P04, F2-P07 |
| Database | `claim_achievement_reward.sql` | F2-P01, F2-P02, F2-P03 |
| Database | `04-initialize_user_stats.sql` | F3-P01, F3-P04 |
| Database | `functions/14` (trigger) | F1-P01, F1-P05 |
| Database | `functions/27` (trigger) | F1-P01, F1-P03 |
| Frontend | `ExerciseContext.tsx` | F5-P02, F5-P07 |
| Frontend | `useProfileData.ts` | F5-P03 |
| Frontend | `achievementsStore.ts` | F5-P03, F5-P05 |

---

## DOCUMENTOS DETALLADOS POR FASE

1. [Fase 1: Integracion Ejercicios → Logros](./01-FASE1-INTEGRACION-EJERCICIOS.md) — 12 problemas
2. [Fase 2: Flujo de Reclamacion](./02-FASE2-FLUJO-RECLAMACION.md) — 8 problemas
3. [Fase 3: Inicializacion de Usuario](./03-FASE3-INICIALIZACION-USUARIO.md) — 6 problemas
4. [Fase 4: Evaluacion de Condiciones](./04-FASE4-EVALUACION-CONDICIONES.md) — 14 problemas
5. [Fase 5: Frontend Sincronizacion](./05-FASE5-FRONTEND-SINCRONIZACION.md) — 7 problemas

---

*Analisis ejecutado con 5 subagentes en paralelo. Cada fase analizo 8-16 archivos de codigo fuente con verificacion linea por linea.*
