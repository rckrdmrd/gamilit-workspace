---
titulo: Multi-Tenant Isolation Flow
tipo: arquitectura
ultima_actualizacion: 2026-02-27
---

# FL-SYS-06: Multi-Tenant Isolation Flow

**ID:** FL-SYS-06
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** System (transversal a todos los portales)
**Prioridad:** P0
**ADR:** [ADR-003 - Row-Level Security para Multi-tenancy](../../../90-adr/ADR-003-rls-multitenancy.md)

---

## 1. Resumen

GAMILIT es una plataforma multi-tenant donde cada escuela (institucion educativa) opera como un tenant independiente. El aislamiento de datos entre tenants se garantiza mediante una arquitectura de 5 capas que van desde la solicitud del frontend hasta las politicas RLS de PostgreSQL.

La estrategia central es **Row-Level Security (RLS) de PostgreSQL 15** aplicada a todas las tablas que contienen datos de tenant. El contexto de usuario se propaga desde el JWT hasta la conexion de base de datos mediante variables de sesion de PostgreSQL (`app.current_user_id`, `app.current_tenant_id`), permitiendo que las politicas RLS filtren automaticamente las filas segun el usuario autenticado. Esta garantia opera a nivel de motor de base de datos, independientemente de la logica de aplicacion.

**Estado actual del enforcement:** El interceptor RLS (`RlsInterceptor`) adjunta contexto al objeto `request.rlsContext` pero NO ejecuta `SET LOCAL` en la conexion PostgreSQL de forma automatica en todos los endpoints. Actualmente, solo `TeacherReportsService` implementa `SET LOCAL` manualmente en sus 4 metodos via `set_config()`. El rol `gamilit_user` mantiene `BYPASSRLS` mientras se completa la implementacion del `SET LOCAL` global. Ver seccion "Estado de Implementacion" para prerequisitos pendientes.

---

## 2. Arquitectura de Aislamiento — 5 Capas

```
[CAPA 1] Frontend Request
         └── JWT Bearer Token + X-Tenant-Id header (opcional)
                   |
[CAPA 2] Backend: JWT Strategy + RLS Interceptor
         ├── JwtStrategy.validate() → extrae tenant_id del profile
         ├── req.user.tenant_id poblado desde auth_management.profiles
         └── RlsInterceptor → adjunta req.rlsContext (NO ejecuta SET LOCAL globalmente)
                   |
[CAPA 3] Backend Service Layer (implementacion manual por modulo)
         └── TeacherReportsService → SELECT set_config('app.current_user_id', $1, true)
                   |
[CAPA 4] PostgreSQL Session Variables
         ├── app.current_user_id  (UUID del profile autenticado)
         ├── app.current_tenant_id (UUID del tenant)
         └── app.current_user_role (rol del usuario)
                   |
[CAPA 5] PostgreSQL RLS Policies
         └── USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
             USING (user_id = current_setting('app.current_user_id', true)::uuid)
```

---

## 3. Precondiciones

- Usuario autenticado con JWT valido emitido por el backend GAMILIT.
- `auth_management.profiles.tenant_id` populado al momento de registro del usuario.
- RLS habilitado en todas las tablas tenant-aware (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Variables de sesion PostgreSQL establecidas antes de ejecutar queries (actualmente manual en servicios que lo implementan).

---

## 4. Diagrama de Secuencia ASCII

```
Frontend          Backend (NestJS)          PostgreSQL
   |                    |                       |
   |-- POST /api/v1/... |                       |
   |   Authorization: Bearer <JWT>              |
   |   X-Tenant-Id: <uuid> (opcional)          |
   |                    |                       |
   |            [AuthGuard.canActivate]         |
   |            JwtService.verifyAsync(token)   |
   |                    |                       |
   |            [JwtStrategy.validate]          |
   |            profileRepository.findOne(sub)  |
   |                    |-- SELECT profiles ... -|
   |                    |<-- profile+tenant_id --|
   |            req.user = {                    |
   |              id: profile.id,               |
   |              role: profile.role,           |
   |              tenant_id: profile.tenant_id  |
   |            }                               |
   |                    |                       |
   |            [RlsInterceptor.intercept]      |
   |            req.rlsContext = {userId, ...}  |
   |            (NO ejecuta SET LOCAL global)   |
   |                    |                       |
   |            [Controller → Service]          |
   |                    |                       |
   |   (si servicio implementa SET LOCAL):      |
   |            dataSource.transaction(mgr =>   |
   |              mgr.query(                    |
   |                "SELECT set_config(         |
   |                  'app.current_user_id',    |
   |                  $1, true)",               |
   |                [userId])                   |
   |              )                             |
   |                    |-- set_config() ------>|
   |                    |                       | app.current_user_id = <uuid>
   |                    |                       |
   |            repository.find(...)            |
   |                    |-- SELECT * FROM t ... |
   |                    |                       | [RLS Policy evaluada]
   |                    |                       | USING (user_id =
   |                    |                       |   current_setting(
   |                    |                       |     'app.current_user_id',
   |                    |                       |     true)::uuid)
   |                    |                       | → filtra filas
   |                    |<-- rows filtradas ----|
   |<-- 200 response ---|                       |
```

---

## 5. Capa 1: Frontend Request

**Archivo:** `apps/frontend/src/services/api/apiClient.ts`

El cliente HTTP de Axios configura dos mecanismos de contexto tenant en el interceptor de request:

```typescript
// Request interceptor — apiClient.ts lineas 58-87
apiClient.interceptors.request.use((config) => {
  // 1. JWT token desde localStorage (contiene tenant_id en el payload)
  const token = localStorage.getItem('auth-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. X-Tenant-Id header para multi-tenant support (opcional/adicional)
  const tenantId = localStorage.getItem('tenant-id');
  if (tenantId && config.headers) {
    config.headers['X-Tenant-Id'] = tenantId;
  }
  return config;
});
```

**Como llega tenant_id al frontend:**
- Al hacer login, el backend retorna el JWT que el store persiste en `localStorage['auth-token']`.
- El JWT contiene `tenant_id` en su payload (derivado de `auth_management.profiles.tenant_id`).
- El tenant_id NO se almacena separadamente en `authStore.ts` — vive dentro del JWT.

**Backend CORS:** El header `x-tenant-id` esta explicitamente permitido en la configuracion CORS de `apps/backend/src/main.ts` linea 77:
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
```

---

## 6. Capa 2: Backend — Autenticacion y Resolucion de Tenant

### 6.1 JWT Strategy

**Archivo:** `apps/backend/src/modules/auth/strategies/jwt.strategy.ts`

La estrategia JWT de Passport valida el token y resuelve el tenant_id desde la base de datos:

```typescript
async validate(payload: { sub: string; email: string; role: string; ... }) {
  const { sub: profileId } = payload;

  // DB-125: JWT sub = profile.id (NO auth.users.id)
  const profile = await this.profileRepository.findOne({ where: { id: profileId } });
  const user = await this.userRepository.findOne({ where: { id: profile.user_id } });

  return {
    id: profile.id,           // profile.id para gamification/progress FKs
    sub: profile.id,
    user_id: user.id,         // auth.users.id
    email: user.email,
    role: profile.role,
    tenant_id: profile.tenant_id,  // <-- tenant_id extraido de auth_management.profiles
    is_active: !user.deleted_at,
    email_verified: !!user.email_confirmed_at,
  };
}
```

**Nota DB-125:** El `sub` del JWT es `profile.id` (de `auth_management.profiles`), NO `auth.users.id`. Esta decision garantiza consistencia con las FKs de `gamification_system` y `progress_tracking` que apuntan a `profiles.id`.

### 6.2 Auth Guard

**Archivo:** `apps/backend/src/shared/guards/auth.guard.ts`

Extrae el Bearer token del header `Authorization`, lo verifica con `JwtService.verifyAsync()`, y adjunta el payload decodificado a `request.user`. Rutas marcadas con `@Public()` se omiten.

### 6.3 RLS Interceptor

**Archivo:** `apps/backend/src/shared/interceptors/rls.interceptor.ts`

Registrado como interceptor global. Extrae el contexto del usuario autenticado y lo adjunta a `request.rlsContext`:

```typescript
request.rlsContext = {
  userId,        // profile.id
  userEmail,
  userRole,
  tenantId,      // tenant_id del profile
};
```

**Estado actual:** El interceptor adjunta el contexto al objeto request pero NO ejecuta `SET LOCAL app.current_user_id` en la conexion de PostgreSQL. El comentario en el codigo (linea 98-99) indica que la aplicacion automatica de SET LOCAL esta pendiente para implementacion futura.

### 6.4 Decoradores de Soporte

**Archivo:** `apps/backend/src/shared/decorators/tenant.decorator.ts`

```typescript
// Extrae tenant_id del usuario autenticado en el handler
export const Tenant = createParamDecorator(
  (data, ctx): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || null;
  },
);

// Marca que una ruta requiere tenant asignado
export const RequireTenant = () => Reflect.metadata(REQUIRE_TENANT_KEY, true);
```

**Archivo:** `apps/backend/src/shared/decorators/current-user.decorator.ts`

La interface `RequestUser` define el contrato del payload JWT que incluye `tenantId?: string`.

---

## 7. Capa 3: TypeORM / Service Layer — Establecimiento del Contexto RLS

### 7.1 Patron Implementado (TeacherReportsService)

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-reports.service.ts`

El unico servicio que implementa `SET LOCAL` de forma consistente es `TeacherReportsService`. Usa `set_config()` con consulta parametrizada para prevenir SQL injection:

```typescript
// FIX TASK-2026-01-25 + MED-06 FIX
return this.dataSource.transaction(async (manager) => {
  // set_config(name, value, is_local=true) equivale a SET LOCAL
  // is_local=true = transaction-scoped (se revierte al terminar la transaccion)
  await manager.query(
    `SELECT set_config('app.current_user_id', $1, true)`,
    [teacherId]
  );

  // Query ejecutada con RLS activo para teacherId
  const reports = await manager.find(TeacherReport, { where: { teacherId } });
  return reports;
});
```

**Patron de seguridad (TASK-020):** Antes de usar el UUID en `set_config`, se valida con `isUUID()` para prevenir SQL injection en el valor del parametro.

### 7.2 Estado Global (Pendiente de Implementacion)

La mayoria de los servicios NO implementan `SET LOCAL` manualmente. El rol `gamilit_user` tiene `BYPASSRLS` habilitado (definido en `apps/database/ddl/99-post-ddl-permissions.sql`) para que el sistema funcione mientras se completa la implementacion.

**Prerequisitos para enforcement completo (`NOBYPASSRLS`)** — documentados en `apps/database/scripts/init-database.sh`:
1. `RlsInterceptor` debe ejecutar `SET LOCAL app.current_user_id = '<uuid>'` en la conexion DB de CADA request autenticado.
2. Endpoints publicos (login, register, health) deben tener policies que permitan operaciones sin user context.
3. Todas las tablas con `INSERT...RETURNING*` deben tener SELECT policies que pasen sin user context.
4. Validar con la app corriendo que login, CRUD y admin flujos funcionen con NOBYPASSRLS activo.

---

## 8. Capa 4: Variables de Sesion PostgreSQL

Las politicas RLS leen el contexto del usuario mediante funciones helper definidas en el schema `gamilit`:

### 8.1 Funciones Helper

| Funcion | Archivo | Descripcion |
|---------|---------|-------------|
| `gamilit.get_current_user_id()` | `apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql` | Retorna `current_setting('app.current_user_id', true)::UUID` |
| `auth.uid()` | `apps/database/ddl/schemas/auth/functions/01-uid.sql` | Wrapper de compatibilidad (convencion Supabase), delega a `gamilit.get_current_user_id()`. Referenciada por ~190 politicas RLS. |
| `gamilit.is_admin()` | `apps/database/ddl/schemas/gamilit/functions/05-is_admin.sql` | Retorna TRUE si el usuario tiene rol `admin_teacher` o `super_admin`, verificando `status = 'active'`. Marcada `SECURITY DEFINER` + `STABLE`. |
| `gamilit.is_super_admin()` | `apps/database/ddl/schemas/gamilit/functions/05b-is_super_admin.sql` | Retorna TRUE solo para rol `super_admin`. Usada para operaciones criticas/destructivas. |
| `gamilit.get_current_tenant_id()` | `apps/database/ddl/schemas/gamilit/functions/09-get_current_tenant_id.sql` | Placeholder: retorna NULL. La implementacion completa leeera `current_setting('app.current_tenant_id', true)`. |

### 8.2 Variables de Sesion

| Variable | Tipo | Establecida por | Usada en |
|----------|------|-----------------|----------|
| `app.current_user_id` | UUID | `set_config('app.current_user_id', userId, true)` en servicios | `gamilit.get_current_user_id()`, ~200+ politicas RLS |
| `app.current_tenant_id` | UUID | Pendiente implementacion global | `profiles_read_admin`, `memberships_read_tenant`, `tenants_read_own` |
| `app.current_user_role` | text | Pendiente implementacion global | Referenciado en `RlsInterceptor` como campo de contexto |
| `app.current_user_email` | text | Pendiente implementacion global | Referenciado en `RlsInterceptor` como campo de contexto |

---

## 9. Capa 5: Politicas RLS de PostgreSQL

### 9.1 Patron Estandar de Policy

Definido en ADR-003:

```sql
-- Patron de aislamiento tenant
CREATE POLICY "tenant_isolation" ON schema.table
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Patron de aislamiento por usuario (mas comun en la implementacion actual)
CREATE POLICY "user_isolation" ON schema.table
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Patron de acceso por rol
CREATE POLICY "admin_access" ON schema.table
  FOR ALL
  USING (gamilit.is_admin() OR gamilit.is_super_admin());
```

### 9.2 Patrones de Politica Implementados

Los patrones reales en el codebase son mas ricos que el patron estandar minimo del ADR. Se identificaron 4 patrones principales:

**Patron A: Self-service (acceso propio)**
```sql
-- Ejemplo: auth_management.profiles
CREATE POLICY profiles_read_own ON auth_management.profiles
  FOR SELECT USING (id = current_setting('app.current_user_id', true)::uuid);
```

**Patron B: Role-based (acceso por rol)**
```sql
-- Ejemplo: educational_content.modules
CREATE POLICY modules_manage_admin ON educational_content.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth_management.user_roles ur
      WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
        AND ur.role = 'super_admin'
    )
  );
```

**Patron C: Classroom-scoped (acceso contextual via relacion)**
```sql
-- Ejemplo: progress_tracking.module_progress (teacher access)
CREATE POLICY module_progress_read_teacher ON progress_tracking.module_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_management.user_roles ur
      WHERE ur.user_id = current_setting('app.current_user_id', true)::uuid
        AND ur.role = 'admin_teacher'
    )
    AND user_id IN (
      SELECT cm.student_id FROM social_features.classroom_members cm
      JOIN social_features.classrooms c ON c.id = cm.classroom_id
      WHERE c.teacher_id = current_setting('app.current_user_id', true)::uuid
    )
  );
```

**Patron D: Tenant-scoped (aislamiento por tenant)**
```sql
-- Ejemplo: auth_management.memberships
CREATE POLICY memberships_read_tenant ON auth_management.memberships
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

### 9.3 Habilitacion de RLS por Schema

RLS se habilita con `ENABLE ROW LEVEL SECURITY` y se fuerza con `FORCE ROW LEVEL SECURITY` (necesario para tablas owned by gamilit_user, que por defecto bypasea RLS como owner):

```sql
-- Ejemplo: auth_management
ALTER TABLE auth_management.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_management.profiles FORCE ROW LEVEL SECURITY;
```

---

## 10. Matriz de Cobertura por Schema

| Schema | Tiene rls-policies/ | Archivo enable-rls | Politicas (fuente DDL) | Notas |
|--------|--------------------|--------------------|------------------------|-------|
| `auth_management` | Si | `02-enable-rls.sql` | 23 politicas, 10 tablas | Profiles, sessions, tokens, tenants, roles, suspensions |
| `gamification_system` | Si | `01-enable-rls.sql` | ~30+ politicas, 9 tablas activas | ml_coins, achievements, user_stats, missions, leaderboard |
| `educational_content` | Si | `01-enable-rls.sql` | 10+ politicas, 4 archivos | modules, exercises, teacher_content, resource_sharing |
| `social_features` | Si | `01-enable-rls.sql` | ~60+ politicas, 14 archivos | schools, classrooms, teams, guilds, friendships, challenges |
| `progress_tracking` | Si | `01-enable-rls.sql` | ~20+ politicas, 5 archivos | module_progress, submissions, manual_reviews, certificates |
| `notifications` | Si | (en 01-policies) | ~10+ politicas | notification tables |
| `communication` | Si | (en 01-messages) | Politicas para messages | messages, participants |
| `content_management` | Si | (en 01-policies) | Politicas de moderacion | moderation content |
| `lti_integration` | Si | `02-enable-rls.sql` | Politicas LTI | consumers, sessions |
| `audit_logging` | Si | (en 01-policies) | Audit access policies | system logs |
| `admin_dashboard` | Si | (en 01-policies) | Admin access policies | bulk operations |
| `system_configuration` | Si | (en 01-policies) | Config access policies | platform settings |
| `data_warehouse` | No | No | Sin RLS — tabla read-only analitica | fact_exercise_completions. Sin tenant_id por diseno star-schema |
| `auth` | No (functions only) | No | Sin tables de usuario | Solo funciones helper (auth.uid()) |
| `gamilit` | No (functions only) | No | Sin tables de usuario | Solo funciones helper globales |
| `public` | No | No | Schema placeholder | Sin tablas de usuario |
| `storage` | No | No | Schema placeholder | Sin tablas de usuario |
| `optimization` | No | No | Schema placeholder | Sin tablas de usuario |

**Total DDL source:** 231 politicas de fuente / 471 politicas en runtime (ADR-003).
**Schemas con RLS activo:** 12 de 18 schemas.
**Schemas sin RLS (por diseno):** 6 (data_warehouse, auth, gamilit, public, storage, optimization).

---

## 11. Excepciones Documentadas de RLS

### 11.1 USING(true) — Lectura publica intencional

Las tablas `challenge_participants`, `challenge_results` y `user_ranks` tienen policies con `USING(true)`. Son tablas de lectura publica para leaderboards y competencias cross-tenant. Cualquier usuario autenticado puede leer rankings sin restriccion de tenant — comportamiento correcto para funcionalidades de competencia global.

### 11.2 fact_exercise_completions — data_warehouse sin RLS

Tabla read-only del schema `data_warehouse` con patron star-schema para analytics. No tiene `tenant_id` por diseno (datos agregados). Los 9 indices cubren las distintas dimensiones analiticas. Sin riesgo de fuga de datos al ser tabla de solo lectura sin operaciones de escritura desde la aplicacion.

### 11.3 BYPASSRLS de gamilit_user — Estado actual

El rol `gamilit_user` (rol de aplicacion) tiene `BYPASSRLS = true` configurado en `apps/database/ddl/99-post-ddl-permissions.sql`. Este estado es temporal durante el periodo de implementacion del `SET LOCAL` global. La transicion a `NOBYPASSRLS` esta documentada como prerequisito en `apps/database/scripts/init-database.sh` (funcion `post_seeds_security()`).

### 11.4 SECURITY DEFINER Functions — Bypass controlado

Las funciones `gamilit.is_admin()`, `gamilit.is_super_admin()`, y `gamilit.initialize_user_stats()` usan `SECURITY DEFINER` para ejecutar con permisos del creador. Esto permite bypass de RLS en operaciones especificas controladas (inicializacion de stats, verificacion de roles) sin exponer acceso general.

### 11.5 auth_attempts — Sistema-only

`auth_management.auth_attempts` tiene 0 politicas de usuario. Gestionada exclusivamente por funciones con `SECURITY DEFINER`. Los usuarios no pueden consultar directamente los logs de intentos de autenticacion.

---

## 12. Garantias de Seguridad

| Garantia | Mecanismo | Estado |
|----------|-----------|--------|
| Aislamiento entre tenants | `tenant_id = current_setting('app.current_tenant_id')::uuid` en policies | Parcial — pendiente `SET LOCAL` global |
| Aislamiento entre usuarios | `user_id = current_setting('app.current_user_id', true)::uuid` | Implementado en servicios que usan `set_config()` |
| Acceso teacher a estudiantes | Verificacion via `classroom_members + classrooms.teacher_id` | Implementado en politicas de tipo Patron C |
| Acceso admin a todo el tenant | `gamilit.is_admin() OR gamilit.is_super_admin()` | Implementado |
| Prevencion de SQL injection en set_config | UUID validado con `isUUID()` antes de `set_config()` (TASK-020) | Implementado en TeacherReportsService |
| Fail-safe en funciones helper | `EXCEPTION WHEN OTHERS THEN RETURN FALSE` en `is_admin()`, `is_super_admin()` | Implementado |
| Performance RLS | Funciones marcadas `STABLE` para cacheo dentro de la transaccion | Implementado |
| Overhead medido | < 2% segun ADR-003 | Medido |

---

## 13. Componentes y Artefactos

### Frontend
- **API Client:** `apps/frontend/src/services/api/apiClient.ts` — interceptor que adjunta JWT + X-Tenant-Id
- **Auth Store:** `apps/frontend/src/features/auth/store/authStore.ts` — persiste JWT en localStorage
- **Auth Types:** `apps/frontend/src/features/auth/types/auth.types.ts` — interfaz `RequestUser` con `tenantId?: string`

### Backend
- **JWT Strategy:** `apps/backend/src/modules/auth/strategies/jwt.strategy.ts` — resolucion de tenant_id desde profiles
- **Auth Guard:** `apps/backend/src/shared/guards/auth.guard.ts` — verificacion de JWT
- **RLS Interceptor:** `apps/backend/src/shared/interceptors/rls.interceptor.ts` — adjunta rlsContext al request
- **Tenant Decorator:** `apps/backend/src/shared/decorators/tenant.decorator.ts` — `@Tenant()` extractor y `@RequireTenant()`
- **Current User Decorator:** `apps/backend/src/shared/decorators/current-user.decorator.ts` — `@CurrentUser()` con interface `RequestUser`
- **TeacherReportsService:** `apps/backend/src/modules/teacher/services/teacher-reports.service.ts` — unico servicio con `set_config()` implementado

### Base de Datos — DDL
- **ADR-003:** `docs/90-adr/ADR-003-rls-multitenancy.md`
- **Tenant Entity DDL:** `apps/database/ddl/schemas/auth_management/tables/01-tenants.sql`
- **Helper functions:** `apps/database/ddl/schemas/gamilit/functions/` (02, 05, 05b, 09)
- **auth.uid():** `apps/database/ddl/schemas/auth/functions/01-uid.sql`
- **Enable RLS examples:** `apps/database/ddl/schemas/auth_management/rls-policies/02-enable-rls.sql`, `apps/database/ddl/schemas/gamification_system/rls-policies/01-enable-rls.sql`
- **RLS Policies examples:** `apps/database/ddl/schemas/auth_management/rls-policies/01-policies.sql`, `apps/database/ddl/schemas/educational_content/rls-policies/02-modules-exercises-policies.sql`, `apps/database/ddl/schemas/progress_tracking/rls-policies/02-progress-policies.sql`
- **Permisos post-DDL:** `apps/database/ddl/99-post-ddl-permissions.sql`
- **Init Script:** `apps/database/scripts/init-database.sh` (funcion `post_seeds_security()`)

### Backend — Tenant Entity
- **Tenant Entity:** `apps/backend/src/modules/auth/entities/tenant.entity.ts` — mapea `auth_management.tenants`

---

## 14. Estado de Implementacion

| Componente | Estado | Notas |
|------------|--------|-------|
| RLS policies DDL | Completo | 231 source / 471 runtime policies |
| RLS ENABLE + FORCE en tablas | Completo | 12 schemas cubiertos |
| JWT con tenant_id | Completo | `profile.tenant_id` en payload via JwtStrategy |
| Frontend X-Tenant-Id header | Completo | `apiClient.ts` interceptor |
| RlsInterceptor — attach context | Parcial | Adjunta `req.rlsContext` pero NO ejecuta SET LOCAL global |
| `set_config` en servicios | Parcial | Solo `TeacherReportsService` (4 metodos) |
| `NOBYPASSRLS` para gamilit_user | Pendiente | Requiere implementacion completa de SET LOCAL global |
| `gamilit.get_current_tenant_id()` | Placeholder | Retorna NULL — implementacion pendiente |

---

## 15. Flujo de Implementacion Pendiente (CORR-F2-01b)

Para activar el enforcement completo de RLS (`NOBYPASSRLS`):

1. Extender `RlsInterceptor` para ejecutar `set_config('app.current_user_id', userId, true)` y `set_config('app.current_tenant_id', tenantId, true)` en la conexion TypeORM de CADA request autenticado, usando `DataSource.transaction()`.
2. Implementar `gamilit.get_current_tenant_id()` para leer `current_setting('app.current_tenant_id', true)`.
3. Auditar que los endpoints publicos (login, register, health) tengan policies que permitan INSERT/SELECT sin user context.
4. Verificar que `INSERT...RETURNING *` en todas las tablas tenga SELECT policies permisivas o que el ORM evite `RETURNING *` cuando no hay contexto de usuario.
5. Ejecutar `ALTER ROLE gamilit_user NOBYPASSRLS` post-seeds en `init-database.sh`.
6. Validar con suite de tests de aislamiento cross-tenant.

---

## 16. Relaciones

- **ADR:** [ADR-003 - RLS Multi-tenancy](../../../90-adr/ADR-003-rls-multitenancy.md)
- **ADR:** [ADR-028 - Roles System Hybrid Design](../../../90-adr/ADR-028-roles-system-hybrid-design.md)
- **ADR:** [ADR-033 - Expansion Schemas 8 to 18](../../../90-adr/ADR-033-expansion-schemas-8-to-18.md)
- **Schema Reference:** [01-auth.md](../../../20-architecture/schema-reference/01-auth.md) — tablas auth_management
- **Flujo relacionado:** [FL-AUTH-01 - Registro + Login](../auth/FLUJO-REGISTRO-LOGIN.md) — donde se establece el tenant en el JWT
- **Flujo relacionado:** [FL-ADM-10 - Instituciones y Roles](../admin/FLUJO-INSTITUCIONES-ROLES.md) — gestion de tenants
- **Flujo relacionado:** [FL-SHR-03 - White-label Theming](../shared/FLUJO-WHITE-LABEL-THEMING.md) — configuracion por tenant
