# ANALISIS-ERRORES234.md

**Tarea:** TASK-2026-02-17-ANALISIS-INTEGRACION-CAPAS
**Fecha:** 2026-02-17
**Agente:** Claude Sonnet 4.6 (claude-code)
**Alcance:** Analisis de causa raiz de errores en runtime — Errores 2, 3 y 4

---

## ERROR 2 — Mission Claim CHECK constraint (500 Internal Server Error)

**Endpoint:** `POST /api/v1/gamification/missions/{id}/claim`
**Error:** `QueryFailedError: new row for relation "ml_coins_transactions" violates check constraint "ml_coins_transactions_reference_type_check"`

### Causa Raiz

**Archivo DDL:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql` — linea 32

El CHECK constraint en la tabla `gamification_system.ml_coins_transactions` define los valores permitidos para `reference_type`:

```sql
CONSTRAINT ml_coins_transactions_reference_type_check CHECK (
  (reference_type = ANY (ARRAY[
    'exercise'::text,
    'module'::text,
    'achievement'::text,
    'powerup'::text,
    'admin'::text,
    'streak'::text,
    'rank'::text
  ]))
)
```

El valor `'mission'` NO esta incluido en este array.

**Archivo backend (path transaccional):** `apps/backend/src/modules/gamification/services/missions.service.ts` — lineas 589-590

En el metodo `claimRewards()` dentro del bloque transaccional, al crear el registro de coins:

```typescript
reference_id: mission.id,
reference_type: 'mission' as any,  // <-- VALOR INVALIDO segun DDL
```

**Archivo backend (path fallback):** `apps/backend/src/modules/gamification/services/missions.service.ts` — linea 696

En el metodo `claimRewardsFallback()`, se llama a `mlCoinsService.addCoins()` con:

```typescript
await this.mlCoinsService.addCoins(
  userId,
  mlCoinsAwarded,
  TransactionTypeEnum.EARNED_BONUS,
  `Mission reward: ${mission.title}`,
  missionId,
  'mission',   // <-- VALOR INVALIDO segun DDL
);
```

**Archivo MLCoinsService:** `apps/backend/src/modules/gamification/services/ml-coins.service.ts` — linea 138

El servicio pasa `referenceType` directamente sin validacion:

```typescript
reference_type: referenceType as any,
```

### Mismatch

| Capa | Valor |
|------|-------|
| DDL CHECK constraint (fuente de verdad) | `'exercise'`, `'module'`, `'achievement'`, `'powerup'`, `'admin'`, `'streak'`, `'rank'` |
| Backend `missions.service.ts` (path tx y fallback) | `'mission'` |

El valor `'mission'` no existe en el array permitido por el CHECK constraint. El INSERT falla con violacion de constraint cada vez que se intenta reclamar una mision con recompensa en ML Coins.

### Solucion Propuesta

**Opcion A (recomendada — menor riesgo):** Agregar `'mission'` al CHECK constraint en el DDL.

```sql
-- apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql
CONSTRAINT ml_coins_transactions_reference_type_check CHECK (
  (reference_type = ANY (ARRAY[
    'exercise'::text,
    'module'::text,
    'achievement'::text,
    'powerup'::text,
    'admin'::text,
    'streak'::text,
    'rank'::text,
    'mission'::text   -- AGREGAR ESTE VALOR
  ]))
)
```

Ademas, aplicar en DB en caliente (sin recrear):

```sql
ALTER TABLE gamification_system.ml_coins_transactions
DROP CONSTRAINT ml_coins_transactions_reference_type_check;

ALTER TABLE gamification_system.ml_coins_transactions
ADD CONSTRAINT ml_coins_transactions_reference_type_check
CHECK (reference_type = ANY (ARRAY[
  'exercise','module','achievement','powerup','admin','streak','rank','mission'
]));
```

**Opcion B (alternativa):** Cambiar el `reference_type` en el backend para mapear misiones a un valor ya permitido (ej: usar `'achievement'` o crear un tipo semanticamente similar). Esta opcion pierde legibilidad y no es recomendada.

**Opcion C (complementaria):** Crear un ENUM en el DDL para `reference_type` en lugar de un CHECK sobre texto libre, lo que previene futuros errores identicos. Requiere migracion mas compleja.

### Impacto

- **Severidad:** CRITICA — bloquea completamente la funcionalidad de reclamacion de misiones (core del sistema de gamificacion)
- **Afectados:** 100% de usuarios que intenten reclamar misiones completadas con recompensa en ML Coins
- **Flujos rotos:** MissionsPanel frontend, dailyMissions, weeklyMissions — toda la economia virtual ligada a misiones
- **Efecto secundario:** El fallback `claimRewardsFallback()` tiene el mismo bug — no hay path alternativo funcional
- **Archivos a modificar:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql` (DDL), mas la aplicacion del ALTER TABLE en la base de datos activa

---

## ERROR 3 — User Preferences 401 Unauthorized

**Endpoint:** `GET /api/v1/users/preferences`
**Error:** HTTP 401 Unauthorized

### Causa Raiz

El endpoint existe correctamente en el backend (`apps/backend/src/modules/auth/controllers/users.controller.ts`, lineas 145-163) y tiene `@UseGuards(JwtAuthGuard)` apropiadamente configurado. El endpoint llama a `authService.getUserPreferences(userId)`.

**El problema esta en la identidad de `userId` que recibe `getUserPreferences`.**

**Archivo JwtStrategy:** `apps/backend/src/modules/auth/strategies/jwt.strategy.ts` — linea 82

El JWT strategy retorna `req.user.id = profile.id` (DB-125):

```typescript
return {
  id: profile.id,           // profile.id (auth_management.profiles.id)
  sub: profile.id,
  user_id: user.id,         // auth.users.id
  ...
};
```

**Archivo UsersController:** `apps/backend/src/modules/auth/controllers/users.controller.ts` — linea 160

El controller extrae `req.user!.id` y lo pasa a `getUserPreferences`:

```typescript
const userId = req.user!.id;  // Esto es profile.id (DB-125)
const preferences = await this.authService.getUserPreferences(userId);
```

**Archivo AuthService:** `apps/backend/src/modules/auth/services/auth.service.ts` — lineas 562-571

`getUserPreferences` busca el profile con `where: { user_id: userId }`:

```typescript
async getUserPreferences(userId: string): Promise<Record<string, unknown>> {
  const profile = await this.profileRepository.findOne({
    where: { user_id: userId },   // BUSCA por user_id
  });

  if (!profile) {
    throw new UnauthorizedException('Perfil no encontrado');  // <-- AQUI FALLA
  }

  return profile.preferences || {};
}
```

**El mismatch:** `userId` recibido es `profile.id` (el `id` de la fila en `auth_management.profiles`), pero la query busca en `profiles.user_id` (que es `auth.users.id`). Son dos UUIDs distintos. La busqueda no encuentra el perfil y lanza `UnauthorizedException('Perfil no encontrado')`, que el cliente recibe como 401.

**Verificacion frontend:**

`apps/frontend/src/shared/hooks/useUserPreferences.ts` — lineas 67-90: El hook llama directamente a `profileAPI.getPreferences()` sin validar estado de autenticacion antes de ejecutar el `useEffect`:

```typescript
useEffect(() => {
  fetchPreferences();  // Se ejecuta al montar — sin guardia de auth
}, []);
```

`apps/frontend/src/services/api/profileAPI.ts` — linea 225: La llamada usa `apiClient.get('/users/preferences')`.

`apps/frontend/src/services/api/apiClient.ts` — linea 45-48: El interceptor agrega el Bearer token desde `localStorage.getItem('auth-token')` correctamente. El token SI se envia, por lo que el 401 NO es por token ausente sino por la logica de busqueda en el backend.

### Solucion Propuesta

**Correccion en `apps/backend/src/modules/auth/services/auth.service.ts`**, metodo `getUserPreferences` (y su par `updateUserPreferences`):

Cambiar la query para buscar por `id` (profile.id) en lugar de `user_id`:

```typescript
async getUserPreferences(userId: string): Promise<Record<string, unknown>> {
  // userId aqui es profile.id (DB-125: JWT sub = profile.id)
  const profile = await this.profileRepository.findOne({
    where: { id: userId },  // CAMBIAR: buscar por id, no por user_id
  });

  if (!profile) {
    throw new UnauthorizedException('Perfil no encontrado');
  }

  return profile.preferences || {};
}
```

Aplicar el mismo cambio a `updateUserPreferences` (linea 578) y `uploadAvatar` (linea 601) que tienen el mismo patron incorrecto.

### Impacto

- **Severidad:** ALTA — todos los usuarios que intentan cargar preferencias reciben 401; el hook `useUserPreferences` es llamado en SettingsPage y potencialmente en otros componentes
- **Afectados:** 100% de usuarios en portal estudiante al acceder a Settings/Preferences
- **Flujos rotos:** `SettingsPage.tsx` (seccion Preferences), cualquier componente que use `useUserPreferences`
- **Nota:** El fallback a `DEFAULT_PREFERENCES` en el hook mitiga el impacto visual (la pagina no crashea), pero las preferencias del usuario nunca se cargan ni guardan correctamente
- **Archivos a modificar:** `apps/backend/src/modules/auth/services/auth.service.ts` (3 metodos con el mismo patron)

---

## ERROR 4 — Email Verification Status 404 "Usuario no encontrado"

**Endpoint:** `GET /api/v1/auth/verify-email/status`
**Error:** 404 "Usuario no encontrado"

### Causa Raiz

El endpoint EXISTE correctamente en el backend (`apps/backend/src/modules/auth/controllers/password.controller.ts`, lineas 249-269). El endpoint usa `@UseGuards(JwtAuthGuard)` y llama a `emailVerificationService.checkVerificationStatus(userId)`.

**El problema esta de nuevo en el mismatch de ID entre lo que el JWT provee y lo que el servicio necesita.**

**Archivo PasswordController:** `apps/backend/src/modules/auth/controllers/password.controller.ts` — linea 267

```typescript
async checkVerificationStatus(@Request() req: AuthRequest): Promise<{ verified: boolean }> {
  const userId = req.user!.id;  // Esto es profile.id (DB-125)
  return this.emailVerificationService.checkVerificationStatus(userId);
}
```

**Archivo EmailVerificationService:** `apps/backend/src/modules/auth/services/email-verification.service.ts` — lineas 184-197

```typescript
async checkVerificationStatus(userId: string): Promise<{ verified: boolean }> {
  const user = await this.userRepository.findOne({
    where: { id: userId },         // Busca en auth.users por id
    select: ['id', 'email_confirmed_at'],
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');  // <-- AQUI FALLA (404)
  }

  return { verified: !!user.email_confirmed_at };
}
```

**El mismatch:** `userId` (= `req.user!.id`) es `profile.id` (UUID de `auth_management.profiles`), pero el servicio busca en `auth.users` con `where: { id: userId }`. El `profile.id` no coincide con ningun `auth.users.id` (son tablas distintas con UUIDs distintos). La busqueda retorna null y lanza `NotFoundException('Usuario no encontrado')`.

**Verificacion frontend:**

`apps/frontend/src/services/api/profileAPI.ts` — lineas 346-354: La funcion `getEmailVerificationStatus` llama a `GET /auth/verify-email/status`. El token se envia correctamente via interceptor.

`apps/frontend/src/apps/student/pages/SettingsPage.tsx` — lineas 385-403: La pagina verifica `localStorage.getItem('auth-token') && user?.id` antes de llamar, por lo que no es un problema de auth ausente. Ademas, el status 401 se silencia intencionalmente en el catch, lo que confirma que llega como 404 (no como 401).

**El mismo patron de bug existe en otros metodos de `EmailVerificationService`:**
- `sendVerification()` — recibe `userId` (profile.id), busca `auth.users` por id
- `resendVerification()` — misma situacion

### Solucion Propuesta

**Correccion en `apps/backend/src/modules/auth/services/email-verification.service.ts`**, metodo `checkVerificationStatus` (y todos los metodos del servicio que buscan en `userRepository` por `id`):

El servicio necesita convertir `profile.id` a `auth.users.id` antes de buscar. Dado que el repositorio inyectado es `User` (auth.users), y el `profile` tiene la FK `user_id` apuntando a `auth.users.id`, hay dos opciones:

**Opcion A (recomendada — consistente con DB-125):** Inyectar `ProfileRepository` en `EmailVerificationService` y hacer el lookup indirecto:

```typescript
// En checkVerificationStatus:
async checkVerificationStatus(profileId: string): Promise<{ verified: boolean }> {
  // profileId es profile.id (DB-125: JWT sub = profile.id)
  // Necesitamos auth.users.id para buscar en userRepository
  const profile = await this.profileRepository.findOne({
    where: { id: profileId },
    select: ['user_id'],
  });

  if (!profile) {
    throw new NotFoundException('Perfil no encontrado');
  }

  const user = await this.userRepository.findOne({
    where: { id: profile.user_id },
    select: ['id', 'email_confirmed_at'],
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return { verified: !!user.email_confirmed_at };
}
```

**Opcion B (alternativa — directa desde profile):** Como el campo `email_confirmed_at` podria estar disponible en la tabla `profiles` (o en la entidad `User` via `user_id`), verificar si `auth_management.profiles` tiene acceso a `email_confirmed_at` y hacer la consulta directamente sin join.

**Opcion C (refactor mayor):** Mover `checkVerificationStatus` para que opere directamente sobre `auth_management.profiles` usando `profile.user_id`, eliminando la dependencia de hacer lookups cruzados. Requiere cambio de diseno mas amplio.

### Impacto

- **Severidad:** MEDIA — la verificacion de status no es critica para funcionalidad core, pero impide que el banner/indicador de "email no verificado" en SettingsPage muestre el estado correcto
- **Afectados:** Todos los usuarios al acceder a la seccion de cuenta en SettingsPage
- **Flujos rotos:** `FL-STU` verificacion de cuenta, el indicador de verificacion en `SettingsPage.tsx`, y tambien `resendVerification` en `PasswordController` cuando el usuario intenta reenviar el email de verificacion
- **Flujos adicionales rotos:** `EmailVerificationPage.tsx` usa `resendVerification` — mismo bug de ID mismatch afecta ese flujo tambien
- **Archivos a modificar:** `apps/backend/src/modules/auth/services/email-verification.service.ts` (3-4 metodos), potencialmente el constructor para inyectar `ProfileRepository`

---

## Resumen Ejecutivo

| Error | Tipo | Severidad | Archivos Raiz | Naturaleza |
|-------|------|-----------|---------------|------------|
| E2 — Mission Claim 500 | CHECK constraint violation | CRITICA | `05-ml_coins_transactions.sql` + `missions.service.ts:589,696` | DDL no incluye `'mission'` en lista de valores permitidos |
| E3 — Preferences 401 | ID mismatch (profile.id vs user_id) | ALTA | `auth.service.ts:562-571` | `getUserPreferences` busca por `user_id` pero recibe `profile.id` (DB-125) |
| E4 — Email Status 404 | ID mismatch (profile.id vs user.id) | MEDIA | `email-verification.service.ts:184-197` | `checkVerificationStatus` busca en `auth.users` por `profile.id` |

**Patron comun (E3 y E4):** El fix DB-125 cambio el JWT `sub` de `auth.users.id` a `profile.id`, pero varios servicios del modulo `auth` no fueron actualizados para reflejar ese cambio. Buscan en repositorios usando el ID recibido con la semantica antigua (`user_id` = `auth.users.id`). Se recomienda una auditoria de todos los metodos de `AuthService` y `EmailVerificationService` que reciben `userId` como parametro para verificar coherencia con DB-125.
