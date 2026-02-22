# FASE 2: Flujo de Reclamacion de Recompensas de Achievements

**Fecha:** 2026-02-21
**Tipo:** ANALYSIS (C+A+P)
**Alcance:** Flujo completo de claim rewards para achievements
**Estado:** COMPLETADO

---

## 1. DIAGRAMA DE FLUJO DEL PROCESO DE CLAIM

```
USUARIO (Frontend)                    BACKEND (NestJS)                     DATABASE (PostgreSQL)
==================                    ================                     =====================

[1] Usuario ve logro con
    status "earned" en
    AchievementsPage
         |
[2] Click en AchievementCard
    -> abre AchievementModal
         |
[3] Click "Reclamar Recompensas"
    (boton solo visible si
     status === 'earned')
         |
[4] claimMutation.mutateAsync()  -->  [5] POST /api/v1/gamification/
    gamificationApi                       users/:userId/achievements/
    .claimAchievement()                   :achievementId/claim
                                          |
                                     [6] AchievementsController
                                         .claimAchievement()
                                          |
                                     [7] AchievementsService
                                         .claimRewards(userId, achId)
                                          |
                                     [8] dataSource.query(            --> [9] claim_achievement_reward(
                                         'SELECT * FROM                       p_user_id, p_achievement_id)
                                          gamification_system.                |
                                          claim_achievement_reward            |-- [9a] SELECT user_achievement
                                          ($1, $2)')                          |    WHERE user_id + achievement_id
                                                                              |    (NO verifica is_completed!)
                                                                              |
                                                                         [9b] IF NOT FOUND -> error
                                                                              |
                                                                         [9c] IF rewards_claimed = TRUE
                                                                              -> error "Ya reclamada"
                                                                              |
                                                                         [9d] SELECT achievement (catalogo)
                                                                              |
                                                                         [9e] UPDATE user_achievements
                                                                              SET rewards_claimed = TRUE
                                                                              |
                                                                         [9f] SELECT ml_coins FROM user_stats
                                                                              WHERE user_id FOR UPDATE (lock)
                                                                              |
                                                                         [9g] UPDATE user_stats
                                                                              SET total_xp += rewards->>'xp'
                                                                                  ml_coins += ml_coins_reward
                                                                              |
                                                                         [9h] INSERT ml_coins_transactions
                                                                              (si ml_coins_reward > 0)
                                                                              |
                                     [10] Parse result              <--  [9i] RETURN success, xp, coins, msg
                                          |
                                     [11] IF !success ->
                                          throw BadRequestException
                                          |
                                     [12] Re-fetch userAchievement
                                          via checkProgress()
                                          |
                                     [13] Return {
                                       userAchievement,
                                       xp_granted,
                                       coins_granted
                                     }
                                          |
[14] onSuccess callback:        <--       |
     invalidateQueries([
       achievements.user,
       achievements.summary,
       shop, inventory,
       balance, userStats
     ])
     + syncAndInvalidate()
         |
[15] Modal se cierra
     handleCloseModal()
         |
[16] Achievement ahora muestra
     status "claimed"


=== FLUJO ALTERNATIVO: CRON RECONCILIATION (cada 5 min) ===

                                     [C1] AchievementReconciliation
                                          CronService
                                          @Cron('*/5 * * * *')
                                          |
                                     [C2] Query: SELECT * FROM
                                          user_achievements
                                          WHERE is_completed = true
                                          AND rewards_claimed = false
                                          |
                                     [C3] For each pending:
                                          achievementsService
                                          .claimRewards(userId, achId)
                                          |
                                     [C4] Misma funcion SQL que
                                          el claim manual del usuario
                                          (claim_achievement_reward)
                                          |
                                     [C5] Log resultados:
                                          claimed / failed / errors
```

---

## 2. PUNTOS DE VERIFICACION

### VP-1: Manejo de edge cases en claim_achievement_reward()

**Archivo:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`

| Edge Case | Manejado? | Evidencia | Veredicto |
|-----------|-----------|-----------|-----------|
| Double-claim | SI | Linea 36: `v_already_claimed := v_user_achievement.rewards_claimed = TRUE` -> retorna `false, 0, 0, 'Recompensa ya fue reclamada'` | CORRECTO |
| Achievement no asignado | SI | Linea 29: `IF NOT FOUND` -> retorna `false, 0, 0, 'Usuario no tiene este logro'` | CORRECTO |
| Achievement no existente (catalogo) | SI | Linea 48: `IF NOT FOUND` -> retorna `false, 0, 0, 'Logro no encontrado'` | CORRECTO |
| **Achievement NO completado** | **NO** | **NO hay verificacion de `is_completed = TRUE`**. Un achievement con `is_completed = false` y `rewards_claimed = false` pasaria todas las validaciones y recibiria recompensas. | **PROBLEMA** |
| user_stats no existe | PARCIAL | Linea 63: `FOR UPDATE` fallaria si no hay row. El `COALESCE(v_current_balance, 0)` en linea 67 maneja NULL pero no la ausencia completa del row. | **PROBLEMA** |
| Concurrent claims (race condition) | PARCIAL | `FOR UPDATE` en linea 63 solo lockea `user_stats`, NO lockea `user_achievements`. Dos requests simultaneos podrian ambos pasar la verificacion de `rewards_claimed = FALSE` antes de que uno haga el UPDATE. | **PROBLEMA** |

### VP-2: Conflicto entre Cron Reconciliation y Claims Manuales

**Archivo:** `apps/backend/src/modules/tasks/services/achievement-reconciliation-cron.service.ts`

**Hallazgo:** El cron (cada 5 min, linea 53) busca `is_completed = true AND rewards_claimed = false` y llama a `achievementsService.claimRewards()` que a su vez invoca la misma funcion SQL `claim_achievement_reward()`.

**Escenario de conflicto:**
1. Cron encuentra achievement pendiente de usuario X
2. Usuario X hace click en "Reclamar" al mismo tiempo
3. Ambos llaman `claim_achievement_reward()` concurrentemente

**Analisis:**
- La funcion SQL NO usa `SELECT ... FOR UPDATE` en la query de `user_achievements` (linea 24-27). Solo usa `FOR UPDATE` en `user_stats` (linea 63).
- **Race condition real:** Ambas ejecuciones pueden leer `rewards_claimed = false`, ambas proceden a UPDATE `rewards_claimed = TRUE`, ambas actualizan `user_stats` con `total_xp` y `ml_coins`, y ambas insertan en `ml_coins_transactions`.
- El `FOR UPDATE` en `user_stats` serializa solo la parte de balance, pero NO impide que los XP se sumen dos veces (uno con lock, otro esperando el lock y luego sumando de nuevo sobre el valor ya incrementado... PERO el segundo lee un v_current_balance stale).

**WAIT** -- Analisis mas detallado:
- El segundo ejecutante: ya ejecuto la linea 56 (UPDATE rewards_claimed = TRUE), y obtiene el `FOR UPDATE` lock despues del primero.
- El segundo lee `ml_coins` ACTUALIZADO (gracias al FOR UPDATE).
- Pero el `UPDATE user_stats SET total_xp = total_xp + ...` en linea 71-76 usa la expresion `total_xp + valor` que se resuelve al momento del UPDATE, no usa una variable stale. Asi que XP se sumaria DOS veces.
- Sin embargo, `rewards_claimed = TRUE` ya fue seteado por la primera transaccion... **PERO** si ambas transacciones leen `rewards_claimed = FALSE` antes de que cualquiera haga commit, ambas proceden.

**Veredicto:** Existe una **race condition real** donde recompensas pueden duplicarse si el cron y el usuario reclaman simultaneamente. La probabilidad es baja (ventana de ~ms) pero no es cero. Severidad: **ALTO**.

**Evidencia:**
- `claim_achievement_reward.sql` lineas 24-27: `SELECT * INTO v_user_achievement FROM gamification_system.user_achievements WHERE user_id = p_user_id AND achievement_id = p_achievement_id;` -- SIN `FOR UPDATE`
- `claim_achievement_reward.sql` linea 63: `SELECT ml_coins INTO v_current_balance FROM gamification_system.user_stats WHERE user_id = p_user_id FOR UPDATE;` -- SOLO lockea user_stats

### VP-3: Invalidacion de Cache Frontend

**Archivo:** `apps/frontend/src/features/gamification/achievements/hooks/useAchievements.ts` (lineas 179-191)

**Caches invalidados en onSuccess:**
1. `achievementKeys.user(userId)` -- achievements del usuario (linea 183)
2. `achievementKeys.summary(userId)` -- resumen del usuario (linea 184)
3. `['shop']` -- tienda (linea 185)
4. `['inventory']` -- inventario (linea 186)
5. `['balance']` -- balance de coins (linea 187)
6. `['userStats']` -- estadisticas del usuario (linea 188)
7. `syncAndInvalidate()` -- invalida dashboard, userModules, userGamification + syncs Zustand stores (ranksStore, economyStore) (linea 189)

**Veredicto:** La invalidacion de cache es **EXCELENTE y exhaustiva**. Cubre todas las areas afectadas por un claim:
- Achievement status (user/summary)
- Balance de coins (balance, shop, inventory)
- Estadisticas globales (userStats, dashboard, userGamification)
- Zustand stores (ranks, economy via syncAndInvalidate)

**Unica observacion menor:** No invalida `achievementKeys.list()` (el catalogo de achievements), pero eso es correcto porque el claim no modifica el catalogo.

### VP-4: Atomicidad de Distribucion de Recompensas (XP + ML Coins)

**Archivo:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`

**Analisis:**
- Todo el cuerpo de la funcion se ejecuta dentro de una transaccion implicita de PostgreSQL (funciones PL/pgSQL son atomicas por defecto).
- Las operaciones son:
  1. UPDATE `user_achievements.rewards_claimed = TRUE` (linea 55-58)
  2. UPDATE `user_stats.total_xp` y `user_stats.ml_coins` (linea 71-76)
  3. INSERT `ml_coins_transactions` (linea 80-94)

**Veredicto:** **CORRECTO.** Si cualquier operacion falla, toda la funcion hace rollback. No es posible que se otorguen XP sin coins ni viceversa. La atomicidad esta garantizada por la naturaleza transaccional de funciones PL/pgSQL.

**Sin embargo:** La atomicidad es solo INTRA-funcion. Si se llama a `claim_achievement_reward()` y luego falla algo en el backend DESPUES (por ejemplo, en `checkProgress()` en linea 1070 del service), la transaccion SQL ya hizo commit. Pero esto no afecta la integridad de recompensas, solo podria causar una respuesta incompleta al frontend (que de todos modos se resolveria en el proximo fetch).

### VP-5: Estructura del campo `rewards` JSONB

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql` (linea 19)
**Default:** `'{"xp": 100, "badge": null, "ml_coins": 50}'::jsonb`

**Archivo Entity:** `apps/backend/src/modules/gamification/entities/achievement.entity.ts` (linea 114)
**Default entity:** `{ xp: 100, badge: null, ml_coins: 50 }`

**Archivo Seeds:** `apps/database/seeds/dev/gamification_system/04-achievements.sql` (linea 77-81)
**Formato seeds:** `jsonb_build_object('xp', 50, 'ml_coins', 10, 'badge', 'first_steps')`

**Consumidor SQL:** `claim_achievement_reward.sql` (linea 73)
```sql
total_xp = total_xp + COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0)
```
- Usa `rewards->>'xp'` con fallback a `points_value` y luego a `0`.
- Para coins usa `v_achievement.ml_coins_reward` (columna flat, linea 67), NO `rewards->>'ml_coins'`.

**Consumidor Frontend:** `achievementTransformer.ts` (lineas 256-258)
```typescript
xp: apiResponse.rewards?.xp ?? apiResponse.points_value ?? 0,
mlCoins: apiResponse.rewards?.ml_coins ?? apiResponse.ml_coins_reward ?? 0,
```
- Usa `rewards.xp` con fallback a `points_value`.
- Usa `rewards.ml_coins` con fallback a `ml_coins_reward`.

**Veredicto:** La estructura es consistente entre todas las capas:
- **Seeds** siempre incluyen `xp`, `ml_coins`, `badge` en el JSONB
- **SQL** usa `rewards->>'xp'` con fallback seguro
- **Frontend** usa `rewards?.xp` con fallback seguro

**Nota:** Hay redundancia entre `rewards.ml_coins` (JSONB) y `ml_coins_reward` (columna flat), y entre `rewards.xp` (JSONB) y `points_value` (columna flat). Ambos son usados con fallback chain correcto. Marcado como `@deprecated` (REC-012) en la entity, pero la funcion SQL aun depende de `ml_coins_reward` para coins.

### VP-6: Que pasa si `rewards` es null/undefined

**Analisis por capa:**

**SQL (claim_achievement_reward.sql):**
- Linea 73: `COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0)`
  - Si `rewards` es NULL: `NULL->>'xp'` retorna NULL, luego COALESCE usa `points_value`, o `0` como ultimo fallback.
  - **SEGURO.**
- Linea 67: `v_new_balance := COALESCE(v_current_balance, 0) + v_achievement.ml_coins_reward;`
  - Usa `ml_coins_reward` (columna flat con DEFAULT 0), no `rewards->>'ml_coins'`.
  - **SEGURO.**
- Linea 98-101: El retorno usa la misma expresion COALESCE.
  - **SEGURO.**

**Backend (achievements.service.ts):**
- Linea 1015-1016 (notifyAchievementUnlocked):
  ```typescript
  xpReward: (achievement.rewards as any)?.xp || achievement.points_value || 0,
  coinsReward: (achievement.rewards as any)?.ml_coins || achievement.ml_coins_reward || 0,
  ```
  - Usa optional chaining `?.` con fallbacks. **SEGURO.**

**Frontend (achievementTransformer.ts):**
- Linea 257-258: `apiResponse.rewards?.xp ?? apiResponse.points_value ?? 0`
  - Usa optional chaining + nullish coalescing. **SEGURO.**

**Veredicto:** Todas las capas manejan `rewards = null` de forma segura con fallback chains. No hay riesgo de crash o NaN.

---

## 3. HALLAZGOS (Lo que funciona correctamente)

### H-01: Modelo Claim-to-Earn bien implementado
El patron de "completar achievement -> reclamar recompensas" esta bien diseado. Los achievements se marcan como completados pero las recompensas NO se distribuyen automaticamente. El usuario debe reclamar explicitamente. Esto proporciona una experiencia UX gamificada y previene distribucion accidental.

### H-02: Funcion SQL atomica para distribucion de recompensas
`claim_achievement_reward()` ejecuta la verificacion, el marking, la distribucion de XP/coins, y el registro de transaccion todo dentro de una sola funcion PL/pgSQL, garantizando atomicidad.

### H-03: Invalidacion de cache frontend exhaustiva
El hook `useAchievements` invalida 7 query keys + `syncAndInvalidate()` despues de un claim exitoso, cubriendo achievements, balance, tienda, inventario, stats del usuario, dashboard, y stores de Zustand.

### H-04: Fallback chains robustos para rewards
Todas las capas (SQL, backend, frontend) implementan fallback chains para manejar tanto el formato JSONB (`rewards.xp`, `rewards.ml_coins`) como las columnas flat legacy (`points_value`, `ml_coins_reward`).

### H-05: Proteccion contra double-claim
La funcion SQL verifica `rewards_claimed = TRUE` antes de proceder, retornando error si ya fue reclamado. El frontend desactiva el boton cuando el status es 'claimed'. El transformer calcula correctamente el status.

### H-06: Registro de transacciones de coins
Cada claim exitoso con `ml_coins_reward > 0` genera un registro en `ml_coins_transactions` con tipo `earned_achievement`, balance before/after, y descripcion.

### H-07: Separacion correcta entre catalogo (Achievement) y progreso (UserAchievement)
El sistema mantiene correctamente separados: el catalogo de logros disponibles (`achievements` table) del progreso del usuario (`user_achievements` table). El frontend los combina correctamente via `combinedAchievements` en el hook.

### H-08: UX completa del flujo de claim
El flujo desde AchievementsPage -> AchievementCard (click) -> AchievementModal (detalles + boton) -> claim -> invalidate -> close modal es completo y bien implementado, con estados de loading, error, y success.

### H-09: Cron reconciliation como safety net
El cron de reconciliacion cada 5 minutos asegura que achievements completados pero no reclamados (por errores, timeouts, o simplemente usuarios que no reclaman) eventualmente tengan sus recompensas distribuidas.

---

## 4. PROBLEMAS

### PROB-01: Falta verificacion de `is_completed` en claim_achievement_reward() [CRITICO]

**Archivo:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql` lineas 24-31
**Descripcion:** La funcion SQL NO verifica que `is_completed = TRUE` antes de distribuir recompensas. Solo verifica que el registro existe y que `rewards_claimed = FALSE`. Esto significa que un achievement en progreso (ej: progress=50%, is_completed=false) podria reclamar recompensas si se hace un POST directo al endpoint.

**Flujo problematico:**
1. Usuario tiene achievement con `is_completed = false, rewards_claimed = false`
2. Hace POST a `/api/v1/gamification/users/:id/achievements/:achId/claim`
3. La funcion SQL pasa todas las validaciones
4. Se distribuyen XP y coins para un achievement no completado

**Impacto:** Permite explotar el sistema para obtener recompensas indebidas via API directa.
**Severidad:** **CRITICO**

**Evidencia:**
```sql
-- Lineas 24-31: Solo verifica existencia, NO is_completed
SELECT * INTO v_user_achievement
FROM gamification_system.user_achievements
WHERE user_id = p_user_id
AND achievement_id = p_achievement_id;

IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Usuario no tiene este logro'::VARCHAR;
    RETURN;
END IF;
```

### PROB-02: Race condition en claim concurrente (Cron vs Manual) [ALTO]

**Archivos:**
- `claim_achievement_reward.sql` lineas 24-27 (sin FOR UPDATE en user_achievements)
- `achievement-reconciliation-cron.service.ts` lineas 53, 92-97

**Descripcion:** La query que lee `user_achievements` NO usa `FOR UPDATE`, permitiendo que dos transacciones concurrentes (cron + usuario) ambas lean `rewards_claimed = false` y ambas procedan a distribuir recompensas.

**Impacto:** Recompensas duplicadas (XP y coins otorgados dos veces para el mismo achievement).
**Severidad:** **ALTO**

**Nota:** La probabilidad es baja porque requiere timing exacto (ventana de milisegundos), pero el cron ejecuta cada 5 minutos procesando TODOS los pendientes, lo que aumenta la ventana de colision.

### PROB-03: rewards_received nunca se actualiza [MEDIO]

**Archivos:**
- `claim_achievement_reward.sql` (no hace UPDATE a `rewards_received`)
- DDL: `04-user_achievements.sql` linea 21: `rewards_received jsonb DEFAULT '{}'::jsonb`

**Descripcion:** La tabla `user_achievements` tiene una columna `rewards_received` tipo JSONB diseada para registrar que recompensas recibio el usuario. Sin embargo, la funcion `claim_achievement_reward()` nunca actualiza este campo. Solo hace `SET rewards_claimed = TRUE`.

**Impacto:** El campo `rewards_received` siempre queda como `'{}'::jsonb` incluso despues de un claim exitoso. Esto dificulta auditorias y reconciliaciones futuras.
**Severidad:** **MEDIO**

### PROB-04: No hay verificacion de que el usuario del path param sea el usuario autenticado [ALTO]

**Archivo:** `apps/backend/src/modules/gamification/controllers/achievements.controller.ts` lineas 536-541

**Descripcion:** El endpoint `POST /users/:userId/achievements/:achievementId/claim` acepta cualquier `userId` como parametro de ruta. Solo requiere `JwtAuthGuard` (autenticacion), pero NO verifica que el `userId` del path sea el mismo que el usuario autenticado. Un usuario autenticado podria reclamar recompensas de otro usuario.

**Flujo problematico:**
1. Usuario A (autenticado) hace POST a `/api/v1/gamification/users/{USER_B_ID}/achievements/{achId}/claim`
2. El backend no verifica que USER_A_ID === USER_B_ID
3. Las recompensas de User B son reclamadas (se suman a las stats de User B)

**Nota:** Mitigacion parcial: RLS policies en la DB restringen SELECT a `user_id = gamilit.get_current_user_id()` (linea 54 de 04-user_achievements.sql), pero la funcion SQL se ejecuta como `gamilit_user` (owner), potencialmente bypasseando RLS. Depende de como esta configurado `SET ROW SECURITY` en la funcion.

**Severidad:** **ALTO**

### PROB-05: Falta row en user_stats causa error silencioso o crash [MEDIO]

**Archivo:** `claim_achievement_reward.sql` lineas 61-64

**Descripcion:** Si el usuario no tiene un row en `user_stats`, la query `SELECT ml_coins INTO v_current_balance FROM gamification_system.user_stats WHERE user_id = p_user_id FOR UPDATE` retorna NULL para `v_current_balance`. El COALESCE en linea 67 maneja esto, pero el UPDATE posterior (linea 71) no haria nada (0 rows updated) porque no existe el row. Las recompensas se pierden silenciosamente.

```sql
-- Linea 71-76: UPDATE no hace nada si el row no existe
UPDATE gamification_system.user_stats
SET
    total_xp = total_xp + COALESCE(...),
    ml_coins = v_new_balance,
    updated_at = NOW()
WHERE user_id = p_user_id;
-- Si 0 rows affected, no hay error pero las recompensas se pierden
```

**Impacto:** El claim se marca como exitoso (rewards_claimed = TRUE) pero XP y coins nunca se otorgan porque no hay row en user_stats.
**Severidad:** **MEDIO**

### PROB-06: XP se calcula desde rewards JSONB pero coins desde columna flat [BAJO]

**Archivo:** `claim_achievement_reward.sql` lineas 67, 73

**Descripcion:** Inconsistencia en la fuente de datos de recompensas:
- **XP:** `COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0)` -- usa JSONB primero, flat como fallback
- **Coins:** `v_achievement.ml_coins_reward` -- usa SOLO la columna flat, ignora `rewards->>'ml_coins'`

Si `ml_coins_reward = 0` pero `rewards = '{"ml_coins": 50}'`, el usuario NO recibiria los 50 coins.

**Impacto:** Si los datos se insertan con rewards JSONB pero sin la columna flat `ml_coins_reward`, no se distribuyen coins.
**Mitigacion:** Los seeds actuales siempre setean AMBOS (JSONB y flat), asi que no es un problema presente, pero es una bomba de tiempo si se agregan achievements via admin UI sin setear `ml_coins_reward`.
**Severidad:** **BAJO**

### PROB-07: El endpoint claim no usa ParseUUIDPipe para validar UUIDs [BAJO]

**Archivo:** `achievements.controller.ts` lineas 536-541

**Descripcion:** El endpoint `claimAchievement` NO usa `ParseUUIDPipe` en los parametros `userId` y `achievementId`, a diferencia de `updateAchievementStatus` (linea 613) que si lo usa. Strings no-UUID pasarian al SQL y generarian un error de Postgres no manejado.

**Severidad:** **BAJO**

### PROB-08: Cron no tiene proteccion contra ejecucion concurrente [BAJO]

**Archivo:** `achievement-reconciliation-cron.service.ts`

**Descripcion:** Si una ejecucion del cron tarda mas de 5 minutos (por muchos achievements pendientes o lentitud de DB), la siguiente ejecucion comenzaria sin esperar, procesando los mismos achievements. Esto exacerba PROB-02.

**Mitigacion actual:** El metodo `isJobRunning()` existe (linea 166) pero NO se usa para bloquear ejecuciones concurrentes.
**Severidad:** **BAJO** (probabilidad muy baja en produccion normal)

---

## 5. RECOMENDACIONES

### REC-01: Agregar verificacion de is_completed en claim_achievement_reward() [CRITICO]

**Archivo:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`

Agregar despues de la verificacion de existencia (linea 29-32):

```sql
-- Despues de IF NOT FOUND...

-- Verificar que el achievement esta completado
IF v_user_achievement.is_completed != TRUE THEN
    RETURN QUERY SELECT false, 0, 0, 'El logro no ha sido completado aun'::VARCHAR;
    RETURN;
END IF;
```

### REC-02: Agregar FOR UPDATE en la lectura de user_achievements [ALTO]

**Archivo:** `claim_achievement_reward.sql` lineas 24-27

Cambiar:
```sql
SELECT * INTO v_user_achievement
FROM gamification_system.user_achievements
WHERE user_id = p_user_id
AND achievement_id = p_achievement_id;
```

A:
```sql
SELECT * INTO v_user_achievement
FROM gamification_system.user_achievements
WHERE user_id = p_user_id
AND achievement_id = p_achievement_id
FOR UPDATE;
```

Esto serializa las operaciones concurrentes sobre el mismo user_achievement, eliminando la race condition.

### REC-03: Actualizar rewards_received al reclamar [MEDIO]

**Archivo:** `claim_achievement_reward.sql`

Agregar despues de `SET rewards_claimed = TRUE` (linea 55-58):

```sql
UPDATE gamification_system.user_achievements
SET rewards_claimed = TRUE,
    rewards_received = jsonb_build_object(
        'xp', COALESCE((v_achievement.rewards->>'xp')::INTEGER, v_achievement.points_value, 0),
        'ml_coins', v_achievement.ml_coins_reward,
        'claimed_at', NOW()
    )
WHERE user_id = p_user_id
AND achievement_id = p_achievement_id;
```

### REC-04: Agregar validacion de usuario autenticado en endpoint claim [ALTO]

**Archivo:** `achievements.controller.ts`

Agregar en `claimAchievement()`:
```typescript
async claimAchievement(
  @Param('userId') userId: string,
  @Param('achievementId') achievementId: string,
  @Request() req,
) {
  // Verificar que el userId del path es el usuario autenticado
  if (req.user.id !== userId && !req.user.isAdmin) {
    throw new ForbiddenException('No puedes reclamar recompensas de otro usuario');
  }
  return this.achievementsService.claimRewards(userId, achievementId);
}
```

### REC-05: Verificar existencia de user_stats antes de distribuir [MEDIO]

**Archivo:** `claim_achievement_reward.sql`

Agregar verificacion despues de `SELECT ... FOR UPDATE`:
```sql
IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Estadisticas de usuario no encontradas'::VARCHAR;
    RETURN;
END IF;
```

### REC-06: Unificar fuente de coins a rewards JSONB [BAJO]

**Archivo:** `claim_achievement_reward.sql` linea 67

Cambiar:
```sql
v_new_balance := COALESCE(v_current_balance, 0) + v_achievement.ml_coins_reward;
```

A:
```sql
v_new_balance := COALESCE(v_current_balance, 0) +
    COALESCE((v_achievement.rewards->>'ml_coins')::INTEGER, v_achievement.ml_coins_reward, 0);
```

Esto alinea coins con la misma logica de fallback que XP.

### REC-07: Agregar ParseUUIDPipe en endpoint claim [BAJO]

**Archivo:** `achievements.controller.ts`

Cambiar:
```typescript
@Param('userId') userId: string,
@Param('achievementId') achievementId: string,
```

A:
```typescript
@Param('userId', ParseUUIDPipe) userId: string,
@Param('achievementId', ParseUUIDPipe) achievementId: string,
```

### REC-08: Agregar lock guard al cron de reconciliacion [BAJO]

**Archivo:** `achievement-reconciliation-cron.service.ts`

Agregar un flag `isRunning` para prevenir ejecucion concurrente:

```typescript
private isReconciling = false;

async reconcilePendingAchievementClaims(): Promise<ReconciliationResult> {
  if (this.isReconciling) {
    this.logger.log('[CRON] Skipping - previous reconciliation still running');
    return { total_pending: 0, successfully_claimed: 0, failed_claims: 0, errors: [] };
  }
  this.isReconciling = true;
  try {
    // ... existing logic
  } finally {
    this.isReconciling = false;
  }
}
```

---

## 6. RESUMEN DE SEVERIDADES

| ID | Problema | Severidad | Esfuerzo Fix |
|----|----------|-----------|--------------|
| PROB-01 | Falta verificacion is_completed en SQL | **CRITICO** | 5 min |
| PROB-02 | Race condition cron vs manual (sin FOR UPDATE) | **ALTO** | 5 min |
| PROB-04 | Sin verificacion de usuario autenticado en endpoint | **ALTO** | 15 min |
| PROB-03 | rewards_received nunca actualizado | MEDIO | 10 min |
| PROB-05 | user_stats inexistente causa perdida silenciosa | MEDIO | 5 min |
| PROB-06 | Inconsistencia fuente XP (JSONB) vs coins (flat) | BAJO | 5 min |
| PROB-07 | Sin ParseUUIDPipe en endpoint claim | BAJO | 2 min |
| PROB-08 | Cron sin proteccion concurrencia | BAJO | 10 min |

**Total problemas:** 8 (1 CRITICO, 2 ALTO, 2 MEDIO, 3 BAJO)
**Esfuerzo estimado total:** ~57 minutos

---

## 7. ARCHIVOS ANALIZADOS

| # | Archivo | Lineas Clave |
|---|---------|--------------|
| 1 | `apps/backend/src/modules/gamification/services/achievements.service.ts` | 1052-1082 (claimRewards) |
| 2 | `apps/backend/src/modules/gamification/controllers/achievements.controller.ts` | 496-541 (endpoint claim) |
| 3 | `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql` | 1-109 (completo) |
| 4 | `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql` | 1-155 (DEPRECATED, referencia) |
| 5 | `apps/backend/src/modules/tasks/services/achievement-reconciliation-cron.service.ts` | 1-206 (completo) |
| 6 | `apps/frontend/src/features/gamification/achievements/hooks/useAchievements.ts` | 179-191 (claimMutation) |
| 7 | `apps/frontend/src/features/gamification/achievements/utils/achievementTransformer.ts` | 143-210 (status, transform) |
| 8 | `apps/frontend/src/shared/components/AchievementModal.tsx` | 84-98, 305-328 (claim UI) |
| 9 | `apps/frontend/src/shared/components/AchievementCard.tsx` | 87-256 (card display) |
| 10 | `apps/frontend/src/apps/student/pages/AchievementsPage.tsx` | 75-78, 258-265 (wiring) |
| 11 | `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql` | 19 (rewards default) |
| 12 | `apps/database/ddl/schemas/gamification_system/tables/04-user_achievements.sql` | 20-21 (rewards_claimed, rewards_received) |
| 13 | `apps/backend/src/modules/gamification/entities/achievement.entity.ts` | 113-122 (rewards field) |
| 14 | `apps/backend/src/modules/gamification/entities/user-achievement.entity.ts` | 90-98 (rewards_claimed, rewards_received) |
| 15 | `apps/frontend/src/services/api/gamification/gamificationAPI.ts` | 173-178 (claimAchievement) |
| 16 | `apps/frontend/src/shared/hooks/useInvalidateDashboard.ts` | 61-101 (syncAndInvalidate) |
| 17 | `apps/database/seeds/dev/gamification_system/04-achievements.sql` | 77-81 (rewards structure) |
| 18 | `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql` | 15 (earned_achievement) |
