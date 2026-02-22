# FASE 3: Inicializacion de Usuarios y Analisis de Relaciones — Achievements

**Fecha:** 2026-02-21
**Fase:** 3 de N (User Initialization and Relationship Analysis)
**Autor:** Claude Opus 4.6 (analisis automatizado)
**Archivos analizados:** 12 archivos DDL, seeds, backend services, triggers

---

## 1. DIAGRAMA DE FLUJO DE INICIALIZACION

```
+----------------------------+
| Usuario se registra        |
| (AuthService.register())   |
| auth.service.ts:100-224    |
+----------------------------+
              |
              v
+----------------------------+
| 1. Crear auth.users row    |
|    (user = repo.save)      |
|    auth.service.ts:137-145 |
+----------------------------+
              |
              v
+----------------------------+
| 2. Crear profiles row      |
|    (profile.id = user.id)  |
|    auth.service.ts:150-162 |
+----------------------------+
              |
              | AFTER INSERT trigger fires
              v
+----------------------------------------------+
| trg_initialize_user_stats                    |
| ON auth_management.profiles                  |
| (04-trg_initialize_user_stats.sql)           |
|                                              |
| EXECUTES: gamilit.initialize_user_stats()    |
| (04-initialize_user_stats.sql)               |
+----------------------------------------------+
              |
              | IF role IN ('student','admin_teacher','super_admin')
              v
+----------------------------------------------+
| a. INSERT user_stats (100 ML coins welcome)  |
| b. INSERT ml_coins_transactions (audit)      |
| c. INSERT comodines_inventory                |
| d. INSERT user_preferences (defaults)        |
| e. INSERT user_ranks (Ajaw - lowest)         |
| f. INSERT user_achievements  <--- FASE 3     |
|    (for ALL active achievements, progress=0) |
| g. INSERT module_progress (all modules)      |
| h. PERFORM initialize_user_missions()        |
| i. IF admin_teacher: INSERT teacher_reports  |
+----------------------------------------------+
              |
              | Step f detail:
              v
+----------------------------------------------+
| INSERT INTO user_achievements                |
|   (user_id, achievement_id, progress,        |
|    max_progress, is_completed,               |
|    completion_percentage)                     |
| SELECT NEW.id, a.id, 0,                     |
|   CASE                                       |
|     exercises_completed -> int               |
|     streak_days -> int                       |
|     perfect_scores -> int                    |
|     modules_completed -> int                 |
|     count -> int                             |
|     ELSE 1                                   |
|   END,                                       |
|   false, 0.00                                |
| FROM achievements WHERE is_active = true     |
| ON CONFLICT (user_id, achievement_id)        |
|   DO NOTHING                                 |
+----------------------------------------------+
              |
              | Back in AuthService
              v
+----------------------------------------------+
| 3. Verify trigger ran (check user_stats)     |
|    auth.service.ts:167-180                   |
|    If missing: WARN but do NOT block         |
| 4. Log auth attempt                          |
| 5. Generate JWT (sub = profile.id)           |
| 6. Create session                            |
| 7. Return tokens + user response             |
+----------------------------------------------+

--- POST-INIT FLOW (for new achievements added later) ---

+----------------------------------------------+
| NO AUTOMATIC TRIGGER for new achievements    |
| added to gamification_system.achievements    |
|                                              |
| Manual options:                              |
| a. Run backfill-user-achievements.sql        |
|    (apps/database/scripts/)                  |
| b. AchievementReconciliationCronService      |
|    (runs every 5 min, but only handles       |
|     reward claims, NOT missing rows)         |
+----------------------------------------------+
```

---

## 2. PUNTOS DE VERIFICACION

### VP-1: Extraccion de max_progress desde conditions JSONB

**Ubicacion:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql:158-170`

**Logica CASE actual:**
```sql
CASE
  WHEN a.conditions->'requirements'->>'exercises_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'exercises_completed')::int
  WHEN a.conditions->'requirements'->>'streak_days' IS NOT NULL
    THEN (a.conditions->'requirements'->>'streak_days')::int
  WHEN a.conditions->'requirements'->>'perfect_scores' IS NOT NULL
    THEN (a.conditions->'requirements'->>'perfect_scores')::int
  WHEN a.conditions->'requirements'->>'modules_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'modules_completed')::int
  WHEN a.conditions->'requirements'->>'count' IS NOT NULL
    THEN (a.conditions->'requirements'->>'count')::int
  ELSE 1
END
```

**Analisis completo de los 40 achievements activos:**

| # | Achievement | Requirement Key | CASE Branch | max_progress |
|---|------------|----------------|-------------|--------------|
| **04-achievements.sql (20)** | | | | |
| 1 | Primeros Pasos | exercises_completed=1 | Branch 1 | 1 (CORRECTO) |
| 2 | Lector Principiante | exercises_completed=10 | Branch 1 | 10 (CORRECTO) |
| 3 | Lector Experimentado | exercises_completed=50 | Branch 1 | 50 (CORRECTO) |
| 4 | Lector Experto | exercises_completed=100 | Branch 1 | 100 (CORRECTO) |
| 5 | Maestro de la Lectura | exercises_completed=200 | Branch 1 | 200 (CORRECTO) |
| 6 | Racha de 3 Dias | consecutive_days=3 | **ELSE** | **1 (INCORRECTO, deberia ser 3)** |
| 7 | Racha de 7 Dias | consecutive_days=7 | **ELSE** | **1 (INCORRECTO, deberia ser 7)** |
| 8 | Racha de 30 Dias | consecutive_days=30 | **ELSE** | **1 (INCORRECTO, deberia ser 30)** |
| 9 | Comprension Literal Dominada | completion_percentage=100 | **ELSE** | **1 (INCORRECTO)** |
| 10 | Comprension Inferencial Dominada | completion_percentage=100 | **ELSE** | **1 (INCORRECTO)** |
| 11 | Comprension Critica Dominada | completion_percentage=100 | **ELSE** | **1 (INCORRECTO)** |
| 12 | Completista Total | modules_completed=5 | Branch 4 | 5 (CORRECTO) |
| 13 | Perfeccionista | perfect_exercises=10 | **ELSE** | **1 (INCORRECTO, deberia ser 10)** |
| 14 | Experto en Inferencias | exercises_completed=20 | Branch 1 | 20 (CORRECTO) |
| 15 | Critico Avanzado | exercises_completed=20 | Branch 1 | 20 (CORRECTO) |
| 16 | Explorador Curioso | different_modules=3 | **ELSE** | **1 (INCORRECTO, deberia ser 3)** |
| 17 | Aventurero del Conocimiento | difficulty_levels=[array] | **ELSE** | **1 (no cuantificable trivialmente)** |
| 18 | Companero de Aula | classrooms_joined=1 | **ELSE** | 1 (CORRECTO por casualidad) |
| 19 | Estudiante Colaborativo | social_activities=5 | **ELSE** | **1 (INCORRECTO, deberia ser 5)** |
| 20 | Primera Visita | first_login=true | **ELSE** | 1 (CORRECTO, es binario) |
| **14-achievements-m3-m5.sql (15)** | | | | |
| 21 | Pensador Critico Emergente | exercises_completed=1 | Branch 1 | 1 (CORRECTO) |
| 22 | Juez de Opiniones | min_score=90 | **ELSE** | **1 (debatable, score-based)** |
| 23 | Maestro del Debate | min_score=95 | **ELSE** | **1 (debatable, score-based)** |
| 24 | Verificador de Fuentes | min_score=100 | **ELSE** | **1 (debatable, score-based)** |
| 25 | Comprension Critica Dominada (M3) | all_exercises=true | **ELSE** | 1 (CORRECTO, binario) |
| 26 | Detective de la Verdad | times_completed=5 | **ELSE** | **1 (INCORRECTO, deberia ser 5)** |
| 27 | Explorador Digital | times_completed=3 | **ELSE** | **1 (INCORRECTO, deberia ser 3)** |
| 28 | Velocista Digital | max_time_seconds=30 | **ELSE** | **1 (debatable, speed-based)** |
| 29 | Memelogo | analyses_completed=10 | **ELSE** | **1 (INCORRECTO, deberia ser 10)** |
| 30 | Maestro Alfabetizacion Digital | all_exercises=true | **ELSE** | 1 (CORRECTO, binario) |
| 31 | Escritor Creativo | min_score=80 | **ELSE** | **1 (debatable, score-based)** |
| 32 | Artista Narrativo | min_score=80 | **ELSE** | **1 (debatable, score-based)** |
| 33 | Voz del Pasado | min_score=80 | **ELSE** | **1 (debatable, score-based)** |
| 34 | Produccion Completa | all_exercises=true | **ELSE** | 1 (CORRECTO, binario) |
| 35 | Creador Multimedia Experto | min_average_score=90 | **ELSE** | **1 (debatable, score-based)** |
| **20-achievements-collection.sql (5)** | | | | |
| 36 | Coleccionista de Logros | achievements_unlocked=5 | **ELSE** | **1 (INCORRECTO, deberia ser 5)** |
| 37 | Maestro de Niveles | min_level_per_module=3 | **ELSE** | **1 (debatable)** |
| 38 | Coleccionista de Avatares | cosmetic_items_equipped=10 | **ELSE** | **1 (INCORRECTO, deberia ser 10)** |
| 39 | Millonario ML | total_ml_coins_earned=10000 | **ELSE** | **1 (INCORRECTO, deberia ser 10000)** |
| 40 | Cazador de Tesoros | all_shop_items_purchased=true | **ELSE** | 1 (CORRECTO, binario) |

**RESUMEN max_progress:**
- **Correctos:** 18/40 (45%)
- **Incorrectos (max_progress=1 cuando deberia ser mayor):** 13/40 (32.5%)
- **Debatibles (score/speed-based, 1 podria ser aceptable):** 9/40 (22.5%)

**Nota CRITICA sobre `streak_days` vs `consecutive_days`:** El CASE busca `streak_days` pero los seeds usan `consecutive_days`. Esto causa que las 3 rachas SIEMPRE caigan al ELSE 1.

---

### VP-2: Nuevos achievements agregados DESPUES de que usuarios existen

**Hallazgo: NO HAY mecanismo automatico.**

- El trigger `trg_initialize_user_stats` solo se ejecuta en `AFTER INSERT ON auth_management.profiles` (archivo: `auth_management/triggers/04-trg_initialize_user_stats.sql:13`)
- **NO existe** un trigger `AFTER INSERT ON gamification_system.achievements` que cree filas en `user_achievements` para usuarios existentes
- El cron `AchievementReconciliationCronService` (`apps/backend/src/modules/tasks/services/achievement-reconciliation-cron.service.ts:53`) solo maneja **claims pendientes** (is_completed=true AND rewards_claimed=false), NO crea filas faltantes

**Mitigacion existente:** Existe un script manual `apps/database/scripts/backfill-user-achievements.sql` que:
- Encuentra usuarios con `user_stats` pero SIN `user_achievements` (linea 17-20)
- Inserta filas con la misma logica CASE (mismos problemas de max_progress)
- Usa `ON CONFLICT (user_id, achievement_id) DO NOTHING`

**GAP:** El backfill solo detecta usuarios con **CERO** user_achievements. Si un usuario tiene ALGUNAS (de la init) pero faltan las NUEVAS, el backfill NO las detecta (ver WHERE NOT EXISTS en linea 17-20: busca users sin NINGUN achievement).

---

### VP-3: UNIQUE constraint y ON CONFLICT DO NOTHING

**Constraint:** `user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id)` (archivo: `04-user_achievements.sql:32`)

**En trigger:** `ON CONFLICT (user_id, achievement_id) DO NOTHING` (archivo: `04-initialize_user_stats.sql:175`)

**Verificacion:** CORRECTO. El `ON CONFLICT DO NOTHING` es seguro con este constraint:
- Si el trigger se ejecuta multiples veces (retry), no causara duplicados
- Si los seeds insertan user_achievements antes de que el trigger corra, no hay error
- La unica desventaja: si el trigger corre DESPUES de los seeds, los valores del seed (que pueden tener progress > 0) se preservan (no se sobreescriben con 0). Esto es el comportamiento DESEADO.

**Sin embargo:** El backfill script tiene el mismo `ON CONFLICT DO NOTHING` pero su WHERE condition es incorrecta (VP-2), asi que esto es un punto academico.

---

### VP-4: Trigger trg_initialize_user_stats ejecuta correctamente en AFTER INSERT

**Definicion:** `CREATE TRIGGER trg_initialize_user_stats AFTER INSERT ON auth_management.profiles FOR EACH ROW EXECUTE FUNCTION gamilit.initialize_user_stats()` (archivo: `auth_management/triggers/04-trg_initialize_user_stats.sql:13`)

**Verificacion en backend:** AuthService.register() valida que el trigger haya ejecutado correctamente verificando que `user_stats` fue creado (lineas 167-180). Si falta, loguea WARNING pero NO bloquea el registro.

**Proteccion de errores:** El bloque de achievements tiene su propio `BEGIN...EXCEPTION` (lineas 150-180) independiente del bloque principal `EXCEPTION WHEN OTHERS` (lineas 244-290):
```sql
-- Bloque interno (achievements)
BEGIN
  INSERT INTO user_achievements ...
  RAISE NOTICE '...';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '...'; -- NO bloquea
END;

-- Bloque externo (todo lo demas)
EXCEPTION WHEN OTHERS THEN
  -- Log a pending_user_initialization
  RETURN NEW; -- NUNCA bloquea creacion de usuario
```

**Hallazgo:** El bloque interno de achievements (lineas 150-180) protege contra fallos pero NO registra en `pending_user_initialization` como hace el bloque externo. Un fallo en la inicializacion de achievements solo genera un `RAISE WARNING` que se pierde en los logs de PostgreSQL.

---

### VP-5: Achievements con conditions malformados que causan max_progress = NULL

**Analisis:** El CASE expression NUNCA produce NULL porque:
1. Todos los branches hacen `::int` cast explicitamente
2. El `ELSE 1` cubre cualquier caso no contemplado
3. Si un achievement tiene `conditions` = NULL, el JSONB path `->'requirements'->>'key'` retorna NULL para todos los WHEN, y cae al ELSE 1

**PERO:** Hay un riesgo potencial si `conditions->'requirements'->>'key'` devuelve un string no numerico:
- Ejemplo: `"exercises_completed": "muchos"` causaria `::int` cast error
- Esto seria atrapado por el `EXCEPTION WHEN OTHERS` del bloque interno
- El achievement NO se inicializaria para ese usuario pero los demas SI continuan

**Verificacion de seeds:** Todos los 40 achievements en seeds tienen values numericos validos en sus requirement keys. No hay riesgo de NULL en produccion actual.

**Edge case:** `user_achievements.max_progress` tiene DEFAULT 100 en DDL (linea 14 de 04-user_achievements.sql), pero el trigger INSERT explicita el valor, asi que el DEFAULT no aplica.

---

### VP-6: Consistencia entre user_achievements demo seed y logica de inicializacion

**Seed file:** `apps/database/seeds/dev/gamification_system/08-user_achievements.sql`

**Inconsistencias encontradas:**

| Achievement | Trigger max_progress | Seed max_progress | Discrepancia |
|------------|---------------------|-------------------|-------------|
| Lector Principiante (exercises_completed=10) | 10 | 25 (lineas 131, 185, 207, 232, 263) | **SI - seed usa 25, trigger calcularia 10** |
| Lector Experimentado (exercises_completed=50) | 50 | 100 (linea 214) | **SI - seed usa 100, trigger calcularia 50** |
| Racha de 3 Dias (consecutive_days=3) | 1 (ELSE) | 3 (lineas 103, 261) | **SI - seed usa 3, trigger daria 1** |
| Racha de 7 Dias (consecutive_days=7) | 1 (ELSE) | 7 (lineas 210, 292) | **SI - seed usa 7, trigger daria 1** |
| Racha de 30 Dias (consecutive_days=30) | 1 (ELSE) | 30 (lineas 294, 325) | **SI - seed usa 30, trigger daria 1** |
| Companero de Aula (classrooms_joined=1) | 1 (ELSE) | 1 (lineas 296, 327) | No |
| Estudiante Colaborativo (social_activities=5) | 1 (ELSE) | 1 (linea 298) | No (seed incorrecta tambien, deberia ser 5) |
| Primera Visita (first_login=true) | 1 (ELSE) | 1 (multiples) | No |
| Primeros Pasos (exercises_completed=1) | 1 | 1 (multiples) | No |

**Nota critica sobre "Lector Principiante":** El seed dice `exercises_completed=10` en el achievement definition, pero `max_progress=25` en user_achievements. Esto sugiere que el seed fue escrito manualmente con un valor diferente (posiblemente un target mas alto que el umbral minimo), creando una discrepancia con la logica automatica del trigger.

**Ejecucion de seeds vs trigger:** En un init limpio, los seeds se ejecutan DESPUES del DDL y trigger. El orden es:
1. DDL crea tablas + triggers
2. Seeds insertan profiles (trigger fires, crea user_achievements con progress=0)
3. Seeds insertan user_achievements con `ON CONFLICT DO UPDATE` (sobreescriben los del trigger)

Esto significa que en un init limpio, los seeds "ganan" sobre el trigger. Pero para usuarios registrados via API (no seeds), el trigger es el unico que crea las filas, y tendran max_progress incorrecto.

---

## 3. HALLAZGOS (Lo que funciona correctamente)

### H-01: Arquitectura de inicializacion robusta
El trigger `trg_initialize_user_stats` tiene proteccion de errores en multiples niveles:
- Bloque interno con `BEGIN...EXCEPTION` para achievements (no bloquea init de otros componentes)
- Bloque externo con `EXCEPTION WHEN OTHERS` que registra en `pending_user_initialization`
- `RETURN NEW` siempre, nunca bloquea creacion de usuario
**Evidencia:** `04-initialize_user_stats.sql:150-180, 244-290`

### H-02: ON CONFLICT DO NOTHING protege contra duplicados
La constraint `UNIQUE (user_id, achievement_id)` combinada con `ON CONFLICT DO NOTHING` asegura idempotencia. El trigger puede ejecutarse multiples veces sin errores.
**Evidencia:** `04-user_achievements.sql:32`, `04-initialize_user_stats.sql:175`

### H-03: SECURITY DEFINER permite bypass de RLS
El trigger usa `SECURITY DEFINER` para poder insertar en tablas protegidas por RLS durante la inicializacion, cuando el usuario aun no tiene sesion.
**Evidencia:** `04-initialize_user_stats.sql:33`

### H-04: Modelo Claim-to-Earn bien implementado
El trigger `trg_achievement_unlocked` NO otorga rewards directamente (correccion CORR-DUP-001). Solo crea notificacion. Los rewards se otorgan via `claim_achievement_reward()`. Un cron de reconciliacion cada 5 min maneja claims pendientes.
**Evidencia:** `01-trg_achievement_unlocked.sql:37-43`, `claim_achievement_reward.sql:6-104`, `achievement-reconciliation-cron.service.ts:53`

### H-05: Backend verifica inicializacion post-trigger
AuthService.register() verifica que user_stats fue creado por el trigger (linea 167), logueando un WARNING si fallo. Esto permite deteccion proactiva.
**Evidencia:** `auth.service.ts:167-180`

### H-06: Script de backfill existe
Hay un script manual `backfill-user-achievements.sql` para manejar el gap de usuarios existentes sin user_achievements.
**Evidencia:** `apps/database/scripts/backfill-user-achievements.sql`

---

## 4. PROBLEMAS

### P-01: [ALTO] CASE incompleto en max_progress — 13 achievements con valor incorrecto

**Descripcion:** La logica CASE en `initialize_user_stats()` solo maneja 5 requirement keys (`exercises_completed`, `streak_days`, `perfect_scores`, `modules_completed`, `count`), pero los seeds definen 15+ keys diferentes. 13 achievements reciben `max_progress=1` cuando deberian tener valores mayores (3, 5, 7, 10, 30, 10000).

**Impacto:** El progreso en la UI se mostraria como 0/1 en vez de 0/30 (ejemplo: Racha de 30 Dias). Cuando el progreso llega a 1, el achievement se marcaria como "completado" prematuramente si hay logica que compara `progress >= max_progress`.

**Keys faltantes en CASE:**
- `consecutive_days` (3 rachas)
- `perfect_exercises` (Perfeccionista)
- `different_modules` (Explorador Curioso)
- `social_activities` (Estudiante Colaborativo)
- `times_completed` (Detective de la Verdad, Explorador Digital)
- `analyses_completed` (Memelogo)
- `achievements_unlocked` (Coleccionista de Logros)
- `cosmetic_items_equipped` (Coleccionista de Avatares)
- `total_ml_coins_earned` (Millonario ML)

**Evidencia:** `04-initialize_user_stats.sql:158-170` vs `04-achievements.sql` (seeds completos arriba)

**NOTA:** El CASE busca `streak_days` pero los achievements usan `consecutive_days`. No es un typo en el CASE — simplemente son keys diferentes que nunca coinciden.

---

### P-02: [ALTO] No hay trigger para nuevos achievements — backfill incompleto

**Descripcion:** Cuando se agregan nuevos achievements a `gamification_system.achievements` (via seed o admin), NO hay mecanismo automatico para crear filas en `user_achievements` para usuarios existentes.

**El backfill existente tiene un bug logico:** Solo busca usuarios que NO tienen NINGUN user_achievement:
```sql
WHERE NOT EXISTS (
  SELECT 1 FROM gamification_system.user_achievements ua
  WHERE ua.user_id = us.user_id
  LIMIT 1
)
```
Si un usuario tiene 20 user_achievements (de init original) pero se agregan 15 nuevos, el backfill NO los detecta.

**Impacto:** Los 15 achievements de M3-M5 (archivo `14-achievements-m3-m5.sql`) y los 5 de collection (`20-achievements-collection.sql`) NO tendran filas user_achievements para usuarios registrados ANTES de que se ejecuten esos seeds. Esto afecta progreso y UI.

**Evidencia:** `apps/database/scripts/backfill-user-achievements.sql:17-20`

---

### P-03: [MEDIO] Discrepancia de max_progress entre seeds y trigger

**Descripcion:** El seed `08-user_achievements.sql` usa valores de max_progress diferentes a los que el trigger calcularia. Ejemplo: "Lector Principiante" tiene `exercises_completed=10` en su definition, pero el seed pone `max_progress=25`.

**Impacto:** Usuarios creados via seeds tienen barras de progreso con targets diferentes (25 ejercicios) vs usuarios registrados via API (10 ejercicios para el mismo achievement). Esto crea una experiencia inconsistente.

**Evidencia:**
- Seed: `08-user_achievements.sql:131` (max_progress=25 para achievement con exercises_completed=10)
- Trigger: `04-initialize_user_stats.sql:160` (leeria 10 de conditions->requirements->exercises_completed)

---

### P-04: [MEDIO] Bloque interno de achievements no registra en pending_user_initialization

**Descripcion:** Si la inicializacion de achievements falla (bloque BEGIN...EXCEPTION lineas 150-180), solo genera un `RAISE WARNING`. A diferencia del bloque externo (lineas 244-290) que registra en `audit_logging.pending_user_initialization`, el bloque interno no deja rastro persistente del fallo.

**Impacto:** No hay forma de detectar/retry automaticamente si la inicializacion de achievements fallo para un usuario especifico. El WARNING se pierde en los logs de PostgreSQL.

**Evidencia:** `04-initialize_user_stats.sql:178-179` (solo RAISE WARNING, sin INSERT en pending_user_initialization)

---

### P-05: [BAJO] Seed 08-user_achievements tiene inconsistencia en max_progress de "Estudiante Colaborativo"

**Descripcion:** El achievement "Estudiante Colaborativo" requiere `social_activities=5`, pero el seed (linea 298) muestra `progress=1, max_progress=1, is_completed=true` — sugiriendo que se completo con 1 actividad social cuando el requirement dice 5.

**Impacto:** Solo datos demo, no afecta produccion. Pero indica que el seed fue escrito manualmente sin validar contra las conditions del achievement.

**Evidencia:** `08-user_achievements.sql:298` vs `04-achievements.sql:843-847` (social_activities=5)

---

### P-06: [BAJO] Ausencia de verificacion de achievements en AuthService post-trigger

**Descripcion:** AuthService.register() verifica que `user_stats` fue creado (linea 167), pero NO verifica que `user_achievements` fueron creados. Si solo el bloque interno de achievements falla, el backend no lo detecta.

**Impacto:** Un usuario podria tener user_stats pero sin user_achievements, y nadie lo sabria hasta que acceda a la pagina de achievements.

**Evidencia:** `auth.service.ts:167-180` (solo verifica userStatsCreated, no user_achievements)

---

## 5. RECOMENDACIONES

### R-01: Ampliar CASE de max_progress [Resuelve P-01]
**Prioridad:** ALTA
**Esfuerzo:** Bajo (solo DDL)

Agregar branches faltantes al CASE en `initialize_user_stats()`:
```sql
CASE
  -- Existing
  WHEN a.conditions->'requirements'->>'exercises_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'exercises_completed')::int
  -- FIX: streak uses consecutive_days, NOT streak_days
  WHEN a.conditions->'requirements'->>'consecutive_days' IS NOT NULL
    THEN (a.conditions->'requirements'->>'consecutive_days')::int
  WHEN a.conditions->'requirements'->>'streak_days' IS NOT NULL
    THEN (a.conditions->'requirements'->>'streak_days')::int
  WHEN a.conditions->'requirements'->>'perfect_scores' IS NOT NULL
    THEN (a.conditions->'requirements'->>'perfect_scores')::int
  WHEN a.conditions->'requirements'->>'perfect_exercises' IS NOT NULL
    THEN (a.conditions->'requirements'->>'perfect_exercises')::int
  WHEN a.conditions->'requirements'->>'modules_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'modules_completed')::int
  WHEN a.conditions->'requirements'->>'count' IS NOT NULL
    THEN (a.conditions->'requirements'->>'count')::int
  -- New branches for M3-M5 + collection
  WHEN a.conditions->'requirements'->>'times_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'times_completed')::int
  WHEN a.conditions->'requirements'->>'analyses_completed' IS NOT NULL
    THEN (a.conditions->'requirements'->>'analyses_completed')::int
  WHEN a.conditions->'requirements'->>'different_modules' IS NOT NULL
    THEN (a.conditions->'requirements'->>'different_modules')::int
  WHEN a.conditions->'requirements'->>'social_activities' IS NOT NULL
    THEN (a.conditions->'requirements'->>'social_activities')::int
  WHEN a.conditions->'requirements'->>'achievements_unlocked' IS NOT NULL
    THEN (a.conditions->'requirements'->>'achievements_unlocked')::int
  WHEN a.conditions->'requirements'->>'cosmetic_items_equipped' IS NOT NULL
    THEN (a.conditions->'requirements'->>'cosmetic_items_equipped')::int
  WHEN a.conditions->'requirements'->>'total_ml_coins_earned' IS NOT NULL
    THEN (a.conditions->'requirements'->>'total_ml_coins_earned')::int
  ELSE 1
END
```

Tambien actualizar el mismo CASE en `backfill-user-achievements.sql`.

---

### R-02: Crear trigger AFTER INSERT en achievements para backfill automatico [Resuelve P-02]
**Prioridad:** ALTA
**Esfuerzo:** Medio (DDL + testing)

Crear `trg_backfill_user_achievements_on_new_achievement`:
```sql
CREATE OR REPLACE FUNCTION gamification_system.fn_backfill_user_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO gamification_system.user_achievements (
      user_id, achievement_id, progress, max_progress, is_completed, completion_percentage
    )
    SELECT
      us.user_id,
      NEW.id,
      0,
      -- Same CASE logic as initialize_user_stats
      ...,
      false,
      0.00
    FROM gamification_system.user_stats us
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_backfill_user_achievements_on_new_achievement
  AFTER INSERT ON gamification_system.achievements
  FOR EACH ROW
  EXECUTE FUNCTION gamification_system.fn_backfill_user_achievements();
```

---

### R-03: Corregir backfill script para detectar achievements faltantes [Resuelve P-02]
**Prioridad:** ALTA
**Esfuerzo:** Bajo

Cambiar la logica del backfill para detectar PARES faltantes, no solo usuarios sin achievements:
```sql
-- CORRECTO: detecta achievements individuales faltantes
INSERT INTO gamification_system.user_achievements (...)
SELECT us.user_id, a.id, 0, ..., false, 0.00
FROM gamification_system.user_stats us
CROSS JOIN gamification_system.achievements a
WHERE a.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM gamification_system.user_achievements ua
    WHERE ua.user_id = us.user_id AND ua.achievement_id = a.id
  )
ON CONFLICT (user_id, achievement_id) DO NOTHING;
```

---

### R-04: Agregar logging persistente para fallos de achievements init [Resuelve P-04]
**Prioridad:** MEDIA
**Esfuerzo:** Bajo

Agregar INSERT en `pending_user_initialization` dentro del EXCEPTION del bloque interno:
```sql
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '...';
  -- NUEVO: registrar fallo persistentemente
  INSERT INTO audit_logging.pending_user_initialization (
    user_id, profile_id, tenant_id,
    error_message, error_code, trigger_name, function_name,
    status, next_retry_at
  ) VALUES (
    NEW.user_id, NEW.id, NEW.tenant_id,
    'Achievement init failed: ' || SQLERRM, SQLSTATE,
    TG_NAME, 'gamilit.initialize_user_stats',
    'partial_failure', gamilit.now_mexico() + INTERVAL '5 minutes'
  );
END;
```

---

### R-05: Normalizar max_progress en seeds [Resuelve P-03, P-05]
**Prioridad:** MEDIA
**Esfuerzo:** Medio

Revisar y corregir max_progress en `08-user_achievements.sql` para que sea consistente con los values definidos en conditions->requirements de cada achievement. Los seeds deben usar los mismos valores que el trigger calcularia.

---

### R-06: Agregar verificacion de user_achievements en AuthService [Resuelve P-06]
**Prioridad:** BAJA
**Esfuerzo:** Bajo

En `auth.service.ts`, agregar verificacion despues de la existente:
```typescript
// Verificar achievements inicializados
const achievementsCount = await this.userAchievementsRepository.count({
  where: { user_id: profile.id },
});
if (achievementsCount === 0) {
  this.logger.warn(
    `[P0-003] Achievement initialization may have failed for profile ${profile.id}`
  );
}
```

---

## 6. RESUMEN EJECUTIVO

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Trigger de inicializacion | Funcional con gaps | Proteccion de errores robusta, pero CASE incompleto |
| max_progress correcto | 45% | 18/40 achievements con valor correcto |
| Backfill para nuevos achievements | Inexistente (automatico) | Solo script manual con bug logico |
| ON CONFLICT safety | Correcto | Idempotente, no causa errores |
| Consistencia seeds vs trigger | Inconsistente | max_progress difiere entre seeds y trigger |
| Claim-to-earn model | Correcto | Bien implementado con cron de reconciliacion |
| Error recovery | Parcial | Bloque externo registra, bloque interno solo warn |

**Total problemas:** 6 (0 CRITICO, 2 ALTO, 2 MEDIO, 2 BAJO)
**Total recomendaciones:** 6
