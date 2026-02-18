# ANALISIS-ERROR1-RANKS.md

**Tarea:** TASK-2026-02-17-ANALISIS-INTEGRACION-CAPAS
**Error:** GET /api/v1/gamification/ranks/users/{userId}/rank-progress → 500
**Constraint violada:** `user_ranks_user_id_fkey`
**Fecha:** 2026-02-17
**Autor:** Claude Code (ANALYSIS mode)

---

## CAUSA RAIZ

**El error NO es un problema de ID incorrecto (auth.users.id vs profiles.id).**

La causa raiz es una **doble anomalia en la tabla DDL**: la tabla `gamification_system.user_ranks` tiene una restriccion `UNIQUE (user_id)` que la hace de hecho una tabla 1-a-1 (un registro por usuario), pero el metodo `initializeDefaultRank` en `ranks.service.ts` intenta hacer un `INSERT` de un nuevo registro para el mismo `user_id` cuando ya existe uno, colisionando con esa restriccion UNIQUE — o alternativamente, el registro aun no existe porque los triggers de inicializacion fallaron, y el `INSERT` corre con un `user_id` que no tiene entrada en `auth_management.profiles`.

Hay dos sub-causas posibles dependiendo del escenario:

### Sub-causa A — UNIQUE constraint colision (escenario mas probable)

El DDL define:
```sql
-- apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql, linea 46
CONSTRAINT user_ranks_user_id_key UNIQUE (user_id)
```

Pero `initializeDefaultRank` (ranks.service.ts, linea 178-193) hace `this.userRankRepo.create({user_id: userId, ...})` seguido de `this.userRankRepo.save(newRank)`. Si ya existe un registro (aunque `is_current = false`), ese INSERT viola la restriccion UNIQUE en `user_id`, no la FK. El error de PostgreSQL en ese caso apareceria como:

```
duplicate key value violates unique constraint "user_ranks_user_id_key"
```

Sin embargo el mensaje del error reportado dice `violates foreign key constraint "user_ranks_user_id_fkey"`, lo que apunta a la sub-causa B.

### Sub-causa B — FK violation: userId correcto en JWT pero sin registro en profiles (escenario confirmado por el mensaje)

El FK constraint es:
```sql
-- apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql, lineas 82-84
ALTER TABLE ONLY gamification_system.user_ranks
    ADD CONSTRAINT user_ranks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;
```

El backend espera que `user_id` sea `auth_management.profiles.id`. El JWT contiene `sub = profile.id` (confirmado en jwt.strategy.ts, linea 82: `id: profile.id`). El frontend manda `useAuthStore.getState().user?.id` como `userId` en la URL. La pregunta es: que contiene `user.id` en el frontend?

**Resultado del analisis de la cadena de login:**

1. `auth.service.ts` linea 279: `const payload = { sub: profile.id, email: user.email, role: profile.role };`
2. `jwt.strategy.ts` linea 82: `return { id: profile.id, sub: profile.id, user_id: user.id, ... }`
3. `auth.service.ts` metodo `toUserResponse` (linea 793-800): retorna `{ ...userWithoutPassword, ...profileFields, ...dateFields }` — donde `userWithoutPassword` se spreade desde el objeto `user` (auth.users entity), por lo tanto `id = user.id` (auth.users.id).

**AQUI ESTA EL BUG:**

`toUserResponse` hace spread del objeto `user` (auth.users) primero. El campo `id` que llega al frontend en `response.user.id` es **`auth.users.id`**, NO `profile.id`. Sin embargo la FK `user_ranks_user_id_fkey` referencia `auth_management.profiles(id)`.

En el registro normal de usuarios nuevos, el codigo en auth.service.ts linea 149 hace:
```typescript
const profile = this.profileRepository.create({
  id: user.id,    // profiles.id = auth.users.id (mismo UUID por diseno)
  user_id: user.id,
  ...
});
```

Esto significa que para usuarios **creados despues de ese fix** (registrados a traves del flujo correcto), `profile.id === user.id`, y la FK no falla. **Para usuarios creados antes de ese fix, o usuarios creados directamente via seeds donde `profile.id != user.id`**, la FK si falla porque `user.id` no existe en `auth_management.profiles(id)`.

**Linea exacta donde ocurre el INSERT fallido:**

```
apps/backend/src/modules/gamification/services/ranks.service.ts:193
  const savedRank = await this.userRankRepo.save(newRank);
```

Llamado desde `initializeDefaultRank` (linea 160), que es llamado desde `getCurrentRank` (linea 148), que es llamado desde `calculateRankProgress` (linea 218), que es llamado por el endpoint `GET /gamification/ranks/users/:userId/rank-progress` en `ranks.controller.ts` linea 153.

---

## FLUJO COMPLETO

```
[Frontend - ExercisePage.tsx:513]
  await syncAndInvalidate()
    ↓
[useInvalidateDashboard.ts:67-70]
  await Promise.all([fetchUserProgress(), fetchBalance()])
    ↓
[ranksStore.ts:582]
  const userId = useAuthStore.getState().user?.id
  // userId = auth.users.id (spread de toUserResponse)
    ↓
[ranksStore.ts:587]
  await apiClient.get(API_ENDPOINTS.gamification.userRankProgress(userId))
  // GET /api/v1/gamification/ranks/users/{auth.users.id}/rank-progress
    ↓
[ranks.controller.ts:150-153]
  async getUserRankProgress(@Param('userId') userId: string)
    return this.ranksService.calculateRankProgress(userId)
    ↓
[ranks.service.ts:217-218]
  async calculateRankProgress(userId: string)
    const currentRank = await this.getCurrentRank(userId)
    ↓
[ranks.service.ts:134-148]
  async getCurrentRank(userId: string)
    // findOne donde user_id = auth.users.id
    // Si no existe registro en user_ranks para ese user_id...
    return this.initializeDefaultRank(userId)
    ↓
[ranks.service.ts:178-193]
  const newRank = this.userRankRepo.create({ user_id: userId, ... })
  const savedRank = await this.userRankRepo.save(newRank)
  // INSERT INTO gamification_system.user_ranks (user_id, ...) VALUES (auth.users.id, ...)
  // FK check: auth.users.id NOT IN auth_management.profiles(id)
  // → QueryFailedError: FK constraint user_ranks_user_id_fkey violated
```

**Diagrama de identidades:**

| Capa | Campo | Valor |
|------|-------|-------|
| JWT payload.sub | profile.id | correcto (profiles.id) |
| req.user.id (JwtStrategy) | profile.id | correcto |
| toUserResponse() spreads | user (auth.users entity) | BUG: id = auth.users.id |
| frontend user.id (authStore) | auth.users.id | incorrecto para gamification |
| ranksStore userId | auth.users.id | incorrecto |
| user_ranks_user_id_fkey | profiles(id) | espera profiles.id |

**Nota sobre la condicion de usuarios nuevos:** Para usuarios creados correctamente (perfil.id = user.id), el bug no se manifiesta en la FK — se manifestaria solo en la restriccion UNIQUE si intentara crear un segundo registro. Para usuarios con `profile.id != user.id` (seeds o usuarios creados antes del fix), el error es la FK violation.

---

## SOLUCION PROPUESTA

### Solucion 1 — Fix en toUserResponse (RECOMENDADA, minimo cambio)

En `apps/backend/src/modules/auth/services/auth.service.ts`, metodo `toUserResponse` (linea 759-800):

**CAMBIO:** Sobreescribir `id` con `profile.id` al final del spread, de modo que el frontend reciba `profile.id` como `user.id`:

```typescript
// ANTES (linea 793-800):
return {
  ...userWithoutPassword,   // id = user.id (auth.users.id) -- INCORRECTO
  emailVerified,
  isActive,
  ...profileFields,
  ...dateFields,
  equipped_items: equippedItems || {},
} as UserResponseDto;

// DESPUES:
return {
  ...userWithoutPassword,
  id: profile?.id ?? user.id,  // DB-125: usar profile.id para consistencia con FKs
  emailVerified,
  isActive,
  ...profileFields,
  ...dateFields,
  equipped_items: equippedItems || {},
} as UserResponseDto;
```

Este cambio es seguro porque:
1. El JWT ya emite `sub = profile.id` (db-125 ya implementado)
2. JwtStrategy.validate ya retorna `id = profile.id` en req.user
3. Para usuarios creados post-fix, `profile.id === user.id` (sin cambio observable)
4. Para usuarios legacy (seeds), `profile.id` puede diferir de `user.id` — el fix los corrige

### Solucion 2 — Fix en ranksStore (alternativa frontend)

En `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts`, linea 582:

El frontend deberia obtener el `profileId` desde el token JWT decodificado (campo `sub`) en lugar de `user.id`. Sin embargo esto requiere decodificar el JWT en el cliente, lo que es un patron menos limpio. La solucion 1 es preferible.

### Solucion 3 — Fix en el endpoint (alternativa backend)

Cambiar el endpoint `GET /gamification/ranks/users/:userId/rank-progress` para ignorar el `userId` del path y usar `req.user.id` (profile.id del JWT). Esto ya ocurre en el endpoint `GET /gamification/ranks/current` pero no en `rank-progress`. Sin embargo esto cambiaria la firma del endpoint y podria afectar otros consumidores admin.

### Solucion complementaria — Anomalia UNIQUE en DDL

La restriccion `CONSTRAINT user_ranks_user_id_key UNIQUE (user_id)` en el DDL contradice el comentario del schema que dice que es una tabla de "historial" con multiples registros por usuario. Los metodos `promoteToNextRank` (linea 295-363) y el comentario en `initializeDefaultRank` asumen multiples registros.

Esta restriccion UNIQUE hace imposible la logica de historial de rangos. Se debe evaluar si:
- (a) Eliminar la restriccion UNIQUE y permitir historial real (alineado con la logica existente), o
- (b) Cambiar la logica del servicio para que haya exactamente un registro por usuario con el rango actual

Esta es una decision de diseno separada, pero debe resolverse para que `promoteToNextRank` no falle igualmente.

---

## IMPACTO

### Criticidad: ALTA

| Componente | Impacto |
|------------|---------|
| Flujo post-ejercicio | Bloqueado: syncAndInvalidate falla, usuario ve error aunque ejercicio se guardo |
| Dashboard refresh | No se actualiza XP/rango despues de completar ejercicios |
| Rango inicial | Usuarios sin rango no pueden obtener rango inicial via auto-initialize |
| Historial de rangos | Restriccion UNIQUE impide multiples registros (diseno contradictorio) |

### Usuarios afectados

- Usuarios creados via seeds con `profile.id != user.id`: FK violation directa en cada llamada a rank-progress
- Usuarios creados via API post-fix pero sin triggers ejecutados (user_ranks vacio): FK violation al intentar INSERT con auth.users.id

### Archivos a modificar para la correccion minima

1. **`apps/backend/src/modules/auth/services/auth.service.ts`** — linea ~793: sobreescribir `id` con `profile.id` en `toUserResponse`
2. **`apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql`** — linea 46: evaluar si eliminar `CONSTRAINT user_ranks_user_id_key UNIQUE (user_id)` (requiere decision de diseno)

### Archivos inspeccionados (sin modificacion requerida)

| Archivo | Estado |
|---------|--------|
| `apps/backend/src/modules/gamification/services/ranks.service.ts` | Logica correcta, recibe userId incorrecto del frontend |
| `apps/backend/src/modules/gamification/controllers/ranks.controller.ts` | Correcto, expone el endpoint esperado |
| `apps/backend/src/modules/gamification/entities/user-rank.entity.ts` | Sin @ManyToOne, user_id es Column plano — correcto para cross-datasource |
| `apps/backend/src/modules/auth/strategies/jwt.strategy.ts` | Correcto: retorna profile.id como id |
| `apps/frontend/src/features/gamification/ranks/store/ranksStore.ts` | Lee user.id del authStore — incorrecto si toUserResponse no lo corrige |
| `apps/frontend/src/shared/hooks/useInvalidateDashboard.ts` | Correcto: llama fetchUserProgress() sin manejar el userId directamente |
| `apps/frontend/src/apps/student/pages/ExercisePage.tsx` | Correcto: llama syncAndInvalidate() post-submit |
| `apps/frontend/src/config/api.config.ts` | Endpoint userRankProgress correctamente definido |

### Nota sobre el comentario incorrecto en user-rank.entity.ts

El comentario en linea 43 dice `ID del usuario (FK → auth.users)` pero la FK real apunta a `auth_management.profiles(id)`. Este comentario debe corregirse para evitar confusion futura.

---

*Generado por: Claude Code (ANALYSIS mode) | Fecha: 2026-02-17*
