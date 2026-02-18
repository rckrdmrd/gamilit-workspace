# Reporte Consolidado — Errores Runtime Post-Submit y Settings

**Fecha:** 2026-02-17
**Analisis por:** 3 subagentes Claude Sonnet en paralelo
**Errores reportados:** 4 | **Errores adicionales descubiertos:** 2 | **Total:** 6

---

## Resumen Ejecutivo

Se identifico un **patron sistemico**: el JWT `sub` contiene `profile.id` (de `auth_management.profiles`), pero multiples servicios del backend asumen que reciben `auth.users.id`. Esto causa FK violations, 401s y 404s.

Adicionalmente, el DDL CHECK constraint de `ml_coins_transactions` esta incompleto (faltan valores `'mission'` y `'rank_promotion'`), y el flujo de submit para ejercicios de modulos 3-5 (revision manual) tiene un bug de frontend por response shape inconsistente.

---

## Errores Detallados

### E1 — user_ranks FK Violation (500) — CRITICO

| Campo | Valor |
|-------|-------|
| **Endpoint** | `GET /api/v1/gamification/ranks/users/{userId}/rank-progress` |
| **Error** | `QueryFailedError: insert or update on table "user_ranks" violates foreign key constraint "user_ranks_user_id_fkey"` |
| **Trigger** | Post-submit de cualquier ejercicio mod 1-2 |

**Causa raiz:**
- `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql:82-84` — FK referencia `auth_management.profiles(id)`
- `apps/backend/src/modules/auth/services/auth.service.ts:~793` — `toUserResponse()` hace spread de `userWithoutPassword` que pone `auth.users.id` como `id`
- Frontend usa `authStore.user.id` (= `auth.users.id`) para llamar rank-progress
- Backend `ranks.service.ts:193` intenta INSERT con ese ID → FK violation porque NO existe en `profiles`

**Flujo:**
```
ExercisePage:513 → syncAndInvalidate() → ranksStore:582 fetchUserProgress(auth.users.id)
→ ranks.controller:153 → ranks.service:218 getCurrentRank(userId)
→ no row → initializeDefaultRank(userId) → INSERT user_ranks(user_id=auth.users.id)
→ FK CHECK fails: auth.users.id NOT IN auth_management.profiles(id) → 500
```

**Fix:** `auth.service.ts` `toUserResponse()`: `id: profile?.id ?? user.id`

**Impacto:** TODOS los endpoints de gamificacion que usan userId del token

---

### E2 — ml_coins_transactions CHECK Violation (500) — CRITICO

| Campo | Valor |
|-------|-------|
| **Endpoint** | `POST /api/v1/gamification/missions/{id}/claim` |
| **Error** | `QueryFailedError: new row for relation "ml_coins_transactions" violates check constraint "ml_coins_transactions_reference_type_check"` |

**Causa raiz:**
- `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql:32` — CHECK permite: `exercise`, `module`, `achievement`, `powerup`, `admin`, `streak`, `rank`
- `apps/backend/src/modules/gamification/services/missions.service.ts:590,696` — Inserta `reference_type: 'mission'` (NO esta en CHECK)

**Fix DDL:** Agregar `'mission'` al CHECK constraint:
```sql
ALTER TABLE gamification_system.ml_coins_transactions
  DROP CONSTRAINT ml_coins_transactions_reference_type_check;
ALTER TABLE gamification_system.ml_coins_transactions
  ADD CONSTRAINT ml_coins_transactions_reference_type_check
  CHECK (reference_type IN ('exercise','module','achievement','powerup','admin','streak','rank','mission','rank_promotion'));
```

---

### E3 — User Preferences 401 Unauthorized — MEDIO

| Campo | Valor |
|-------|-------|
| **Endpoint** | `GET /api/v1/users/preferences` |
| **Error** | `UnauthorizedException('Perfil no encontrado')` |

**Causa raiz:**
- `apps/backend/src/modules/auth/services/auth.service.ts:562-571` — `getUserPreferences(userId)` busca `{ where: { user_id: userId } }`
- `userId` = `profile.id` (del JWT), pero `user_id` column contiene `auth.users.id` → no match → 401

**Fix:** Cambiar `{ user_id: userId }` → `{ id: userId }` en:
- `getUserPreferences()`
- `updateUserPreferences()`
- `uploadAvatar()`

**Impacto:** Afecta SettingsPage de TODOS los portales

---

### E4 — Email Verification 404 Not Found — MEDIO

| Campo | Valor |
|-------|-------|
| **Endpoint** | `GET /api/v1/auth/verify-email/status` |
| **Error** | `NotFoundException('Usuario no encontrado')` |

**Causa raiz:**
- `apps/backend/src/modules/auth/services/email-verification.service.ts:184-197` — `checkVerificationStatus(userId)` busca en `auth.users` por `{ id: userId }`
- `userId` = `profile.id`, pero `auth.users.id` es diferente → no match → 404

**Fix:** Resolver `profile.id` → `user_id` primero, luego buscar en `auth.users`:
```typescript
const profile = await this.profileRepo.findOne({ where: { id: userId } });
const user = await this.userRepo.findOne({ where: { id: profile.user_id } });
```

**Impacto:** Afecta `sendVerification`, `resendVerification`, `checkVerificationStatus`

---

### E5 — rank_promotion CHECK Violation (500) — NUEVO, CRITICO

| Campo | Valor |
|-------|-------|
| **Endpoint** | Interno — `claimRewards()` en exercise-submission.service.ts |
| **Error** | CHECK constraint violation en ml_coins_transactions |

**Causa raiz:**
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts:~1138` — Al ascender de rango, inserta `referenceType: 'rank_promotion'`
- DDL CHECK no incluye `'rank_promotion'`

**Fix:** Cambiar `'rank_promotion'` → `'rank'` en el codigo, O agregar `'rank_promotion'` al DDL CHECK (ya incluido en fix de E2)

---

### E6 — M3-M5 Frontend TypeError — NUEVO, MEDIO

| Campo | Valor |
|-------|-------|
| **Contexto** | Submit de ejercicios modulos 3-5 (revision manual) |
| **Error** | `TypeError: Cannot read properties of undefined (reading 'xp')` |

**Causa raiz:**
- Backend retorna `{ requiresManualReview: true, message: '...' }` SIN objeto `rewards`
- Frontend `ExercisePage.tsx:516` hace `result.rewards.xp` y `result.rewards.mlCoins` → TypeError

**Fix Frontend:** Agregar null check:
```typescript
const xp = result.rewards?.xp ?? 0;
const mlCoins = result.rewards?.mlCoins ?? 0;
```

---

## Mapa de Ejercicios por Modulo

| Modulo | Tipo Eval | Ejercicios | Total |
|--------|-----------|------------|-------|
| M1 — Comprension Literal | Auto | Crucigrama, Timeline, SopaLetras, MapaConceptual, Emparejamiento, VerdaderoFalso, CompletarEspacios | 7 |
| M2 — Comprension Inferencial | Auto | DetectiveTextual, LecturaInferencial, ConstruccionHipotesis, PrediccionNarrativa, PuzzleContexto, RuedaInferencias | 6 |
| M3 — Comprension Critica | Manual | AnalisisFuentes, DebateDigital, MatrizPerspectivas, PodcastArgumentativo, TribunalOpiniones | 5 |
| M4 — Alfabetizacion Digital | Manual | VerificadorFakeNews, QuizTikTok, NavegacionHipertextual, AnalisisMemes, InfografiaInteractiva | 5 |
| M5 — Produccion Creativa | Manual | DiarioMultimedia, ComicDigital, VideoCarta | 3 |
| **Total** | | | **26** |

**Nota:** La documentacion dice 30 mecanicas. Los 4 adicionales pueden estar en subdirectorios compartidos o ser variantes.

---

## Flujo Post-Submit

```
ExercisePage.handleSubmit()
  → POST /educational/exercises/{id}/submit
  → Backend: exercise-submission.service.ts
      ├── M1-M2 (auto): validate_and_audit() → claimRewards() → XP + coins + rank + missions
      └── M3-M5 (manual): skip grading → notify teacher → return requiresManualReview
  → Frontend: syncAndInvalidate()
      ├── ranksStore.fetchUserProgress()  → GET /gamification/ranks/users/{id}/rank-progress  [E1]
      ├── fetchBalance/stats              → GET /gamification/users/{id}/stats
      └── React Query invalidate: dashboard, userModules, userGamification
```

---

## Endpoints Post-Submit con Riesgo

| Endpoint | Riesgo | Error |
|----------|--------|-------|
| `/gamification/ranks/users/{id}/rank-progress` | **CRITICO** | E1 — FK user_id mismatch |
| `/gamification/missions/{id}/claim` | **CRITICO** | E2 — CHECK 'mission' missing |
| `claimRewards()` interno (rank bonus) | **CRITICO** | E5 — CHECK 'rank_promotion' missing |
| `/users/preferences` | **MEDIO** | E3 — user_id vs profile.id lookup |
| `/auth/verify-email/status` | **MEDIO** | E4 — user lookup by profile.id |
| ExercisePage M3-M5 response handling | **MEDIO** | E6 — missing rewards object |

---

## Patron Sistemico: profile.id vs auth.users.id

**Raiz del problema:** El JWT contiene `sub: profile.id` (correcto segun el diseno). Pero multiples servicios del modulo `auth` no fueron actualizados y siguen asumiendo que `userId` = `auth.users.id`.

**Servicios afectados (confirmados):**
1. `auth.service.ts` — `toUserResponse()`, `getUserPreferences()`, `updateUserPreferences()`, `uploadAvatar()`
2. `email-verification.service.ts` — `checkVerificationStatus()`, `sendVerification()`, `resendVerification()`
3. `ranks.service.ts` — `calculateRankProgress()`, `initializeDefaultRank()`

**Recomendacion:** Auditoria completa de TODOS los metodos en auth module que reciben `userId` para verificar si buscan por `user_id` (auth.users.id) o `id` (profile.id).

---

## Prioridad de Fixes

| Prioridad | Error | Esfuerzo | Impacto |
|-----------|-------|----------|---------|
| P0 | E1 — toUserResponse id override | 1 linea | Desbloquea TODA la gamificacion |
| P0 | E2+E5 — DDL CHECK + code fix | DDL ALTER + 1 linea | Desbloquea mission claim + rank bonus |
| P1 | E3 — preferences lookup | 3 metodos | Settings funcional en todos los portales |
| P1 | E4 — email verification lookup | 3 metodos | Email verification funcional |
| P2 | E6 — M3-M5 rewards null check | 2 lineas | Ejercicios modulos 3-5 sin crash |
