---
titulo: "Flujo de Registro, Login e Inicializacion de Usuario"
tipo: referencia
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Flujo de Registro, Login e Inicializacion de Usuario

**Version:** 1.1.0
**Fecha:** 2026-02-16
**Estado:** Documentado (implementacion existente)

---

## Resumen

Cuando un estudiante se registra en GAMILIT, el sistema ejecuta automaticamente una cadena de inicializacion que asigna al usuario a los defaults del sistema (tenant, institucion, aula, maestro) y crea sus registros de gamificacion. Este flujo es transparente para el usuario y no requiere intervencion manual.

---

## Directivas y Procedimientos

### Directivas

1. **Fuente de verdad**: Inventarios SSOT → Requerimientos → Arquitectura → Codigo.
2. **Trazabilidad minima**: Requerimiento → Datos (DDL/RLS/Triggers) → Backend (Controller/Service/DTO) → Frontend (Page/Form/Store) → UX (Layout/Componentes).
3. **Granularidad**: Nivel pantalla/accion; no linea por linea salvo puntos criticos.
4. **Ejecucion sin subagentes**: Levantamiento y validacion realizados en una sola ejecucion.
5. **Consistencia de roles**: Roles y rutas deben coincidir entre Auth, RBAC y Router.

### Procedimiento de levantamiento

1. Identificar paginas y rutas del flujo.
2. Mapear endpoints y contratos (DTOs).
3. Mapear tablas, triggers y politicas RLS.
4. Mapear componentes, hooks y stores.
5. Validar coherencia y registrar gaps.

---

## Plan de Ejecucion por Fases

1. **Fase 0**: Definir formato de mapa, directivas y criterios de coherencia.
2. **Fase 1**: Pilotar flujo Registro/Login (este documento).
3. **Fase 2**: Expandir a flujos core (Onboarding, Ejercicios, Progreso).
4. **Fase 3**: Expandir a flujos administrativos (Admin, Teacher, Parent).
5. **Fase 4**: Validar coherencia full-stack y registrar brechas.
6. **Fase 5**: Consolidar mapas y actualizar inventarios SSOT.

---

## Requisito del Sistema

> Debe existir: 1 institucion default, 1 salon default, 1 maestro default, 1 clase default.
> Todos los alumnos se registran a esos defaults; el admin redistribuye despues.

### Objetos Default del Sistema

| Objeto | Nombre | Codigo/ID | Seed |
|--------|--------|-----------|------|
| Tenant | GAMILIT Platform | `is_default: true` | `seeds/dev/auth_management/01-tenants.sql` |
| Institucion | GAMILIT - Institucion General | `GAMILIT-DEFAULT` | `seeds/dev/social_features/00-schools-default.sql` |
| Aula | GAMILIT - Aula General | `DEFAULT` (capacity: 999) | `seeds/dev/social_features/02-classrooms.sql` |
| Maestro | teacher@gamilit.com | UUID asignado en seed | `seeds/dev/social_features/02-classrooms.sql` |

---

## Flujo End-to-End: Registro

```
FRONTEND                        BACKEND                         DATABASE
=========                       =========                       =========

RegisterPage                    AuthController
  └─ RegisterForm                 POST /auth/register
       └─ authAPI.register()  ──→   AuthService.register()
            (fullName split          │
             → first_name,           ├─ 1. INSERT auth.users
               last_name)           ├─ 2. INSERT auth_management.profiles
                                     │      (role: STUDENT)
                                     │
                                     │   ══ TRIGGERS FIRE ══
                                     │
                                     │   trg_set_default_tenant (BEFORE INSERT)
                                     │     └─ Asigna tenant_id default
                                     │
                                     │   trg_initialize_user_stats (AFTER INSERT)
                                     │     ├─ INSERT gamification_system.user_stats
                                     │     ├─ INSERT gamification_system.comodines_inventory
                                     │     ├─ INSERT gamification_system.user_ranks
                                     │     └─ INSERT progress_tracking.module_progress (x5)
                                     │
                                     │   trg_assign_default_classroom (AFTER INSERT)
                                     │     └─ INSERT social_features.classroom_members
                                     │         (aula DEFAULT + maestro default)
                                     │
                                     ├─ 3. Verify user_stats created (P0-003 check)
                                     └─ 4. Return JWT tokens
```

---

## Flujo End-to-End: Login

```
FRONTEND                        BACKEND                         DATABASE
=========                       =========                       =========

LoginPage                       AuthController
  └─ LoginForm                   POST /auth/login
       └─ AuthContext.login() ─→  SecurityService.checkRateLimit()
           └─ authAPI.login()      AuthService.login()
                                     ├─ 1. SELECT auth.users by email
                                     ├─ 2. bcrypt.compare(password)
                                     ├─ 3. INSERT auth_management.auth_attempts
                                     ├─ 4. SELECT auth_management.profiles
                                     ├─ 5. INSERT auth_management.user_sessions
                                     ├─ 6. UPDATE auth.users.last_sign_in_at
                                     └─ 7. Return JWT tokens

LoginForm → roleRedirect(getRoleBasedRedirect):
  - super_admin → /admin/dashboard
  - admin_teacher → /teacher/dashboard
  - student → /dashboard
```

---

## Variantes de Login

### Portal Padres (EXT-011)
Login independiente en `/parent/login` con rutas propias y flujo separado del login general.
Endpoints backend: `POST /parent-portal/auth/register` y `POST /parent-portal/auth/login`.

---

## Componentes de Inicializacion (5)

### 1. set_default_tenant() — BEFORE INSERT
**Trigger:** `trg_set_default_tenant` on `auth_management.profiles`
**DDL:** `schemas/gamilit/functions/06-set_default_tenant.sql`
**Funcion:** Si `tenant_id IS NULL`, asigna el tenant con `is_default = true`.

### 2. initialize_user_stats() — AFTER INSERT
**Trigger:** `trg_initialize_user_stats` on `auth_management.profiles`
**DDL:** `schemas/gamilit/functions/10-initialize_user_stats.sql`
**Funcion:** Crea registros iniciales de gamificacion:
- `gamification_system.user_stats` (XP=0, ML Coins=0)
- `gamification_system.comodines_inventory` (3 pistas, 2 visiones, 1 segunda oportunidad)
- `gamification_system.user_ranks` (rango: Ajaw, nivel 1)

### 3. initialize_module_progress_for_users() — AFTER INSERT
**Trigger:** Parte de `trg_initialize_user_stats`
**DDL:** `schemas/gamilit/functions/12-initialize_module_progress.sql`
**Funcion:** Crea 5 registros de `progress_tracking.module_progress` (1 por modulo educativo).

### 4. initialize_user_missions() — AFTER INSERT
**Trigger:** Parte de la cadena de inicializacion
**DDL:** `schemas/gamilit/functions/17-initialize_user_missions.sql`
**Funcion:** Asigna misiones diarias iniciales al usuario.

### 5. assign_default_classroom() — AFTER INSERT
**Trigger:** `trg_assign_default_classroom` on `auth_management.profiles`
**DDL:** `schemas/gamilit/functions/15-assign_default_classroom.sql`
**Funcion:** Asigna al estudiante al aula default (code: `DEFAULT`) del tenant:
- Busca la escuela default del tenant (`GAMILIT-DEFAULT`)
- Busca el aula default de esa escuela (`DEFAULT`)
- Inserta en `social_features.classroom_members`
- Si falla, registra en `audit_logging.pending_user_initialization` para reintento

### Retry Helper
**DDL:** `schemas/gamilit/functions/19-retry_helper_functions.sql`
**Funcion:** `gamilit.assign_default_classroom_for_user(UUID)` permite reintentar la asignacion manualmente para usuarios cuyo trigger fallo.

---

## Manejo de Errores

La inicializacion usa un patron de **no-bloqueo con registro para reintento**:

1. Si un trigger falla, la excepcion es capturada (no bloquea la creacion del perfil)
2. El error se registra en `audit_logging.pending_user_initialization`
3. Un proceso puede reintentar las inicializaciones pendientes via helpers en `19-retry_helper_functions.sql`

---

## Flujo de Redistribucion por Admin

Despues del registro automatico, el administrador puede redistribuir estudiantes:

1. **Portal Admin** → Gestion de Aulas → Ver estudiantes en aula default
2. Seleccionar estudiantes → Reasignar a otra aula
3. Backend: `ClassroomService.reassignStudents()`
4. DDL: UPDATE `social_features.classroom_members` (classroom_id)

---

## Layouts de Portales (Pagina Principal)

### Estudiante
- **Ruta inicial:** `/dashboard`
- **Layout:** `GamifiedHeader` superior, contenido en grid con widgets.
- **Componentes principales:** `EnhancedStatsGrid`, `MissionsPanel`, `ModulesSection`, `RecentActivityPanel`, `RankProgressWidget`, `QuickActionsWidget`.

### Maestro
- **Ruta inicial:** `/teacher/dashboard`
- **Layout:** `TeacherLayout` con `GamifiedHeader` + `GamilitSidebar` + area principal.
- **Navegacion:** sidebar con secciones docentes (aulas, asignaciones, progreso, reportes).

### Administrador
- **Ruta inicial:** `/admin/dashboard`
- **Layout:** `AdminLayout` con `GamifiedHeader` + `GamilitSidebar` + area principal.
- **Navegacion:** sidebar con secciones admin (usuarios, contenido, reportes, settings).

### Padres
- **Ruta inicial:** `/parent/dashboard`
- **Layout:** header propio del portal padres (sin sidebar global).

---

## Trazabilidad

| Capa | Archivo | Lineas Clave |
|------|---------|-------------|
| Frontend Form | `apps/frontend/src/features/auth/components/RegisterForm.tsx` | Zod validation + submit |
| Frontend API | `apps/frontend/src/features/auth/api/authAPI.ts` | L169-205: register() |
| Frontend Page | `apps/frontend/src/pages/auth/RegisterPage.tsx` | Layout + branding |
| Backend Controller | `apps/backend/src/modules/auth/controllers/auth.controller.ts` | L66-90: POST /auth/register |
| Backend Service | `apps/backend/src/modules/auth/services/auth.service.ts` | L96-219: register() |
| Backend DTO | `apps/backend/src/modules/auth/dto/register-user.dto.ts` | RegisterUserDto |
| DDL Trigger | `apps/database/ddl/schemas/auth_management/triggers/08-trg_assign_default_classroom.sql` | Trigger definition |
| DDL Function | `apps/database/ddl/schemas/gamilit/functions/15-assign_default_classroom.sql` | 139 lines |
| Seed Tenant | `apps/database/seeds/dev/auth_management/01-tenants.sql` | Default tenant |
| Seed School | `apps/database/seeds/dev/social_features/00-schools-default.sql` | Default institution |
| Seed Classroom | `apps/database/seeds/dev/social_features/02-classrooms.sql` | Default classroom + teacher |

| Capa | Archivo | Lineas Clave |
|------|---------|-------------|
| Frontend Form | `apps/frontend/src/features/auth/components/LoginForm.tsx` | login + roleRedirect |
| Frontend Context | `apps/frontend/src/app/providers/AuthContext.tsx` | login/register sync |
| Frontend Store | `apps/frontend/src/features/auth/store/authStore.ts` | login/register state |
| Frontend Redirect | `apps/frontend/src/shared/utils/roleRedirect.ts` | role → ruta |
| Router | `apps/frontend/src/App.tsx` | rutas /dashboard, /teacher, /admin |
| Backend Controller | `apps/backend/src/modules/auth/controllers/auth.controller.ts` | POST /auth/login |
| Backend Service | `apps/backend/src/modules/auth/services/auth.service.ts` | login() |
| DDL Users | `apps/database/ddl/schemas/auth/tables/01-users.sql` | auth.users |
| DDL Profiles | `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql` | auth_management.profiles |
| DDL Sessions | `apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql` | auth_management.user_sessions |
| DDL Attempts | `apps/database/ddl/schemas/auth_management/tables/02-auth_attempts.sql` | auth_management.auth_attempts |

| Capa | Archivo | Lineas Clave |
|------|---------|-------------|
| Frontend Page | `apps/frontend/src/apps/parent/pages/ParentLoginPage.tsx` | login + redirect |
| Frontend Page | `apps/frontend/src/apps/parent/pages/ParentRegisterPage.tsx` | registro padres |
| Backend Controller | `apps/backend/src/modules/parents/controllers/parent-auth.controller.ts` | /parent-portal/auth |

---

## Referencias

- **RF-INIT-001:** `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/requirements/RF-INIT-001-inicializacion-automatica-usuario.md`
- **Schema Reference:** `docs/20-architecture/schema-reference/20-gamilit-utility.md`
- **COHERENCE-ENTITIES-DDL:** `docs/20-architecture/COHERENCE-ENTITIES-DDL.md`
- **Centro de flujos UX/UI:** `docs/30-ux-ui/flujos/README.md`
- **Flujo Auth normalizado:** `docs/30-ux-ui/flujos/auth/FLUJO-REGISTRO-LOGIN.md`
