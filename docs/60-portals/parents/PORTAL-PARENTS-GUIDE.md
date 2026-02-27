# Guia del Portal de Padres

**Version:** 2.0.0
**Fecha:** 2026-02-21
**Estado:** Activo
**Aplica a:** `apps/frontend/src/apps/parent/` + `apps/frontend/src/features/parent/` + `apps/backend/src/modules/parents/`
**Epics:** EXT-010 (Parent Notifications) + EXT-011 (Parent Portal)

---

## 1. Vision General

### 1.1 Proposito

El Portal de Padres es la interfaz dedicada a tutores, padres de familia y responsables legales de estudiantes en la plataforma GAMILIT. Su objetivo es proporcionar visibilidad completa sobre el progreso academico de los hijos vinculados, permitiendo a los padres acompanar el proceso educativo sin intervenir directamente en las actividades del estudiante.

### 1.2 Funcionalidades Principales

- **Autenticacion independiente:** Registro, login y gestion de cuenta propios (separados del sistema principal de auth)
- **Vinculacion padre-estudiante:** Vinculacion mediante codigo unico del estudiante, con soporte para multiples hijos
- **Dashboard de progreso:** Vista consolidada de XP, racha, ejercicios completados y tareas pendientes por hijo
- **Detalle de progreso por hijo:** Estadisticas detalladas, actividades recientes, tareas proximas y reportes semanales
- **Reportes semanales:** Generacion manual y automatica (cron) de reportes de progreso con posibilidad de descarga PDF
- **Notificaciones:** Alertas por bajo rendimiento, logros desbloqueados, inactividad y asignaciones pendientes
- **Notificaciones por email:** Templates HTML para reportes semanales, alertas de logros y alertas de bajo rendimiento

### 1.3 Usuarios Objetivo

| Rol | Relacion | Acceso |
|-----|----------|--------|
| Padre (`father`) | Padre biologico | Dashboard, progreso, notificaciones, reportes |
| Madre (`mother`) | Madre biologica | Dashboard, progreso, notificaciones, reportes |
| Tutor Legal (`guardian`) | Tutor asignado | Dashboard, progreso, notificaciones, reportes |
| Abuelo/a (`grandparent`) | Familiar | Dashboard, progreso, notificaciones, reportes |
| Otro (`other`) | Otro responsable | Dashboard, progreso, notificaciones, reportes |

> Nota: Todos los tipos de relacion tienen los mismos permisos funcionales. El tipo de relacion es informativo y se registra en `parent_student_links`.

---

## 2. Arquitectura

### 2.1 Estructura de Carpetas

#### Frontend

```
apps/frontend/src/
  apps/parent/
    pages/
      index.ts                    # Barrel export de paginas
      ParentLoginPage.tsx         # Pagina de login
      ParentRegisterPage.tsx      # Pagina de registro
      ParentDashboardPage.tsx     # Dashboard principal
      ChildProgressPage.tsx       # Detalle de progreso por hijo
      StudentLinkingPage.tsx      # Gestion de vinculacion de hijos
      StudentActivitiesPage.tsx   # Vista de actividades del estudiante
      ReportsPage.tsx             # Historial y generacion de reportes

  features/parent/
    index.ts                      # Barrel export del feature
    ChildProgressCard.tsx         # Card de progreso por hijo (componente reutilizable)
    WeeklyReportView.tsx          # Vista de reportes semanales
    api/
      parentAPI.ts                # Cliente API (18 funciones)
    store/
      parentStore.ts              # Zustand store con persistencia
    types/
      parent.types.ts             # Tipos TypeScript (6 enums, 12 interfaces)
```

#### Backend

```
apps/backend/src/modules/parents/
  parents.module.ts               # Modulo NestJS
  index.ts                        # Barrel export
  controllers/
    index.ts
    parent-auth.controller.ts     # Endpoints publicos de auth (5 endpoints)
    parent-portal.controller.ts   # Endpoints protegidos del portal (11 endpoints)
  services/
    index.ts
    parent-auth.service.ts        # Registro, login, vinculacion, tokens
    parent-dashboard.service.ts   # Dashboard, progreso, actividades, notificaciones
    parent-alert.service.ts       # Alertas en tiempo real (bajo rendimiento, logros, inactividad)
    parent-preferences.service.ts # Preferencias de notificacion y reportes
    weekly-report.service.ts      # Generacion de reportes semanales
    weekly-report-cron.service.ts # Cron job (domingos 8:00 AM UTC)
    report-content-aggregator.service.ts # Agregacion de datos para reportes
  dto/
    index.ts
    parent-login.dto.ts           # DTO de login
    parent-register.dto.ts        # DTO de registro
    link-student.dto.ts           # DTOs de vinculacion (LinkStudentDto, VerifyLinkDto)
    parent-response.dto.ts        # DTOs de respuesta (8 clases)
  enums/
    parent-account.enums.ts       # RelationshipType, NotificationFrequency, ReportFormat
    parent-student-link.enums.ts  # ParentRelationshipType, LinkStatus
  guards/
    index.ts
    parent-auth.guard.ts          # Guard JWT para rutas protegidas
  decorators/
    index.ts
    parent-account.decorator.ts   # @ParentAccountParam, @ParentProfileId, @ParentAccountId
  templates/
    index.ts
    weekly-report.template.ts     # Template HTML de reporte semanal
    achievement-alert.template.ts # Template HTML de alerta de logro
    low-performance-alert.template.ts # Template HTML de bajo rendimiento
```

### 2.2 Dependencias del Modulo Backend

El `ParentsModule` importa:

| Modulo | Proposito |
|--------|-----------|
| `MailModule` | Envio de emails (reportes semanales, alertas) |
| `JwtModule` | Autenticacion JWT independiente para padres |
| `TypeOrmModule` (datasource: `auth`) | Entidades: `ParentAccount`, `ParentStudentLink`, `ParentNotification`, `Profile`, `User` |

Datasources adicionales inyectados en servicios:
- `gamification` (en `ParentDashboardService`) -- para estadisticas de XP y logros
- `progress` (en `ParentDashboardService`) -- para datos de ejercicios y modulos
- `educational` (en `ParentDashboardService`) -- para asignaciones y contenido

### 2.3 Conteo de Archivos

| Capa | Componentes | Servicios | Endpoints | DTOs |
|------|-------------|-----------|-----------|------|
| Frontend | 7 (.tsx) | - | - | - |
| Frontend (store) | - | 1 store | - | - |
| Frontend (API) | - | 1 (18 funciones) | - | 12 interfaces |
| Backend | - | 7 services | 16 endpoints | 11 DTOs |

---

## 3. Paginas del Portal

### 3.1 ParentLoginPage

**Ruta:** `/parent/login`
**Acceso:** Publico (sin autenticacion)
**Archivo:** `apps/frontend/src/apps/parent/pages/ParentLoginPage.tsx`

Pagina de inicio de sesion con estilo orientado a familias (gradiente indigo-purple). Incluye:

- Formulario de email y contrasena
- Toggle de visibilidad de contrasena
- Enlace a recuperacion de contrasena (`/parent/forgot-password`)
- Enlace a registro (`/parent/register`)
- Enlace al portal de estudiantes (`/login`)
- Manejo de errores con feedback visual
- Usa `useParentStore().login()` para autenticacion

### 3.2 ParentRegisterPage

**Ruta:** `/parent/register`
**Acceso:** Publico (sin autenticacion)
**Archivo:** `apps/frontend/src/apps/parent/pages/ParentRegisterPage.tsx`

Formulario de registro con los siguientes campos:

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| Nombre | `text` | Si | No vacio |
| Apellido | `text` | Si | No vacio |
| Email | `email` | Si | Formato email valido |
| Telefono | `tel` | No | Libre |
| Relacion con estudiante | `select` | Si | Enum: father, mother, guardian, grandparent, other |
| Contrasena | `password` | Si | Min 8 chars, mayuscula + minuscula + numero |
| Confirmar contrasena | `password` | Si | Debe coincidir |
| Aceptar terminos | `checkbox` | Si | Debe estar marcado |

La validacion se ejecuta en frontend antes de enviar al backend. Usa `useParentStore().register()`.

### 3.3 ParentDashboardPage

**Ruta:** `/parent/dashboard`
**Acceso:** Protegido (`ProtectedRoute` con rol `parent`)
**Archivo:** `apps/frontend/src/apps/parent/pages/ParentDashboardPage.tsx`

Dashboard principal que muestra toda la informacion consolidada del padre:

**Header fijo:**
- Nombre del padre (`account.displayName`)
- Enlace a notificaciones con badge de no leidas
- Enlace a configuracion
- Boton de logout

**Seccion "Mis Hijos":**
- Grid de `ChildProgressCard` (1-3 columnas segun pantalla) por cada estudiante vinculado
- Boton "Vincular Hijo" que abre `LinkStudentModal`
- Estado vacio con CTA para vincular primer hijo

**Estadisticas Agregadas** (visible solo si hay hijos vinculados):
- XP Esta Semana (suma de todos los hijos)
- Ejercicios completados
- Racha promedio
- Tareas pendientes

**Dos columnas inferiores:**
- **Actividad Reciente:** Ultimas 5 actividades de todos los hijos (ejercicios completados, logros desbloqueados) con XP ganado
- **Tareas Proximas:** Ultimas 5 asignaciones pendientes con fecha de entrega y estado (Pendiente / En Progreso / Atrasada)

**LinkStudentModal** (componente inline):
- Campo de codigo de estudiante (formato `STU-ABC123`, auto-uppercase)
- Selector de tipo de relacion
- Usa `useParentStore().linkStudent()`

### 3.4 ChildProgressPage

**Ruta:** `/parent/child/:studentId`
**Acceso:** Protegido (`ProtectedRoute` con rol `parent`)
**Archivo:** `apps/frontend/src/apps/parent/pages/ChildProgressPage.tsx`

Vista detallada del progreso de un hijo especifico, con tres tabs:

**Tab "Resumen" (overview):**
- Estadisticas principales: XP Total, Racha Actual, Modulos (completados/totales), Precision promedio
- Resumen semanal: XP ganados, ejercicios completados, logros nuevos
- Lista de tareas pendientes con fecha y estado

**Tab "Actividades" (activities):**
- Timeline de actividades recientes (hasta 20)
- Cada actividad muestra: tipo (ejercicio, logro, nivel), titulo, descripcion, fecha, XP ganado
- Iconos por tipo: TrendingUp (ejercicio), Award (logro), Star (nivel)

**Tab "Reportes" (reports):**
- Componente `WeeklyReportView` con historial de reportes semanales
- Boton para generar reporte manual
- Visualizacion de reporte seleccionado con 6 metricas: XP ganados, ejercicios, precision, tiempo, logros, racha
- Posibilidad de descargar PDF si `downloadUrl` disponible

**Datos cargados:**
- `loadStudentProgress(studentId)` via store
- `parentAPI.getStudentActivities(studentId, 20)` directo
- `parentAPI.getStudentAssignments(studentId, 10)` directo
- `parentAPI.getWeeklyReports(10)` directo

---

## 4. Flujo de Autenticacion

### 4.1 Sistema Independiente

El portal de padres utiliza un sistema de autenticacion **independiente** del sistema principal de GAMILIT. Las diferencias clave:

| Aspecto | Auth Principal | Auth Padres |
|---------|---------------|-------------|
| Guard | `JwtAuthGuard` | `ParentAuthGuard` |
| Entidad | `User` + `Profile` | `ParentAccount` + `Profile` + `User` |
| Token claim | `{ sub, email, role }` | `{ sub, email, parentAccountId, type: 'parent' }` |
| Almacenamiento FE | `localStorage` keys auth | `localStorage` keys `parent-*` |
| Zustand store | `authStore` | `parentStore` (persistido con `parent-storage`) |

### 4.2 Flujo de Registro

```
1. Parent llena formulario en ParentRegisterPage
2. Frontend valida campos (client-side)
3. POST /parent-portal/auth/register con ParentRegisterDto
4. Backend:
   a. Verifica email no existe en ParentAccount
   b. Crea User en auth.users con rol 'parent'
   c. Crea Profile en auth_management.profiles
   d. Crea ParentAccount en auth_management.parent_accounts
   e. Hash de contrasena con bcrypt (12 rounds)
   f. Genera JWT (accessToken + refreshToken)
   g. Retorna ParentAuthResponseDto (tokens + account)
5. Frontend almacena tokens en localStorage
6. Redirect a /parent/dashboard
```

### 4.3 Flujo de Login

```
1. Parent ingresa email + contrasena en ParentLoginPage
2. POST /parent-portal/auth/login con ParentLoginDto
3. Backend:
   a. Busca ParentAccount por email
   b. Verifica contrasena con bcrypt
   c. Verifica cuenta activa (isActive: true)
   d. Genera JWT con payload { sub: profileId, email, parentAccountId, type: 'parent' }
   e. Retorna ParentAuthResponseDto
4. Frontend almacena tokens y estado en parentStore
5. Redirect a /parent/dashboard
```

### 4.4 Guard de Autenticacion (ParentAuthGuard)

El `ParentAuthGuard` (`apps/backend/src/modules/parents/guards/parent-auth.guard.ts`) protege todas las rutas del `ParentPortalController`:

1. Extrae Bearer token del header `Authorization`
2. Verifica JWT con `JwtService.verifyAsync()`
3. Valida que `payload.type === 'parent'`
4. Busca `ParentAccount` activa por `payload.parentAccountId`
5. Busca `Profile` por `payload.sub`
6. Adjunta `parentAccount`, `profile` y `parentJwt` al request

### 4.5 Decoradores de Parametro

| Decorador | Retorna | Uso |
|-----------|---------|-----|
| `@ParentAccountParam()` | `ParentAccount` (entidad completa) | Cuando se necesita toda la cuenta |
| `@ParentProfileId()` | `string` (profile ID) | Para queries cross-datasource |
| `@ParentAccountId()` | `string` (parent account ID) | Uso general en controladores |

### 4.6 Refresh de Token

```
POST /parent-portal/auth/refresh
Body: { refreshToken: string }
Retorna: ParentAuthTokensDto (nuevo access + refresh token)
```

El store maneja esto via `refreshSession()` y hace logout automatico si el refresh falla.

### 4.7 Logout

El logout en frontend (`useParentStore().logout()`) ejecuta:
1. Elimina `parent-access-token` de localStorage
2. Elimina `parent-refresh-token` de localStorage
3. Elimina `parent-storage` (Zustand persist) de localStorage
4. Reset completo del estado del store

---

## 5. Integracion API

### 5.1 Endpoints de Autenticacion (Publicos)

Base: `/parent-portal/auth`

| Metodo | Ruta | Descripcion | Request Body | Response |
|--------|------|-------------|--------------|----------|
| `POST` | `/register` | Registro de cuenta padre | `ParentRegisterDto` | `ParentAuthResponseDto` |
| `POST` | `/login` | Login | `ParentLoginDto` | `ParentAuthResponseDto` |
| `POST` | `/refresh` | Refrescar token | `{ refreshToken }` | `ParentAuthTokensDto` |
| `POST` | `/forgot-password` | Solicitar reset de contrasena | `{ email }` | `{ message }` |
| `POST` | `/verify-email` | Verificar email | `{ token }` | `{ message }` |

### 5.2 Endpoints del Portal (Protegidos con ParentAuthGuard)

Base: `/parent-portal`

| Metodo | Ruta | Descripcion | Response |
|--------|------|-------------|----------|
| `GET` | `/dashboard` | Dashboard completo | `ParentDashboardDto` |
| `GET` | `/students` | Hijos vinculados | `LinkedStudentDto[]` |
| `POST` | `/students/link` | Vincular hijo | `ParentStudentLink` |
| `POST` | `/students/verify` | Verificar vinculacion | `ParentStudentLink` |
| `GET` | `/students/:studentId/progress` | Progreso detallado de hijo | `StudentProgressSummaryDto` |
| `GET` | `/students/:studentId/activities` | Actividades recientes de hijo | `RecentActivityDto[]` |
| `GET` | `/students/:studentId/assignments` | Asignaciones de hijo | `UpcomingAssignmentDto[]` |
| `GET` | `/reports/weekly` | Historial de reportes semanales | `ReportHistoryItem[]` |
| `POST` | `/reports/weekly/:studentId` | Generar reporte semanal | `WeeklyReport` |
| `GET` | `/notifications` | Notificaciones del padre | `ParentNotification[]` |
| `PATCH` | `/notifications/:notificationId/read` | Marcar notificacion como leida | `{ success }` |
| `GET` | `/notifications/unread-count` | Cantidad de no leidas | `{ count }` |

**Total: 17 endpoints** (5 auth + 12 portal)

### 5.3 Query Parameters Soportados

| Endpoint | Parametro | Tipo | Default | Descripcion |
|----------|-----------|------|---------|-------------|
| `/students/:id/activities` | `limit` | `number` | 20 | Cantidad maxima de actividades |
| `/students/:id/assignments` | `limit` | `number` | 10 | Cantidad maxima de asignaciones |
| `/reports/weekly` | `limit` | `number` | 20 | Cantidad maxima de reportes |
| `/notifications` | `studentId` | `string` | - | Filtrar por hijo especifico |
| `/notifications` | `status` | `string` | - | Filtrar por estado (pending/sent/read/failed) |
| `/notifications` | `limit` | `number` | - | Limite de resultados |
| `/notifications` | `offset` | `number` | - | Paginacion offset |

### 5.4 Funciones del Cliente API Frontend

Archivo: `apps/frontend/src/features/parent/api/parentAPI.ts`

El objeto `parentAPI` exporta 18 funciones organizadas en 5 categorias:

**Auth (5):**
- `register(data)` -- Registro de cuenta
- `login(credentials)` -- Login
- `refreshToken(token)` -- Refresh de JWT
- `requestPasswordReset(email)` -- Solicitar reset
- `verifyEmail(token)` -- Verificar email

**Dashboard (4):**
- `getDashboard()` -- Dashboard completo
- `getLinkedStudents()` -- Lista de hijos vinculados
- `linkStudent(data)` -- Vincular nuevo hijo
- `verifyStudentLink(data)` -- Verificar vinculo

**Progress (3):**
- `getStudentProgress(studentId)` -- Progreso detallado
- `getStudentActivities(studentId, limit?)` -- Actividades recientes
- `getStudentAssignments(studentId, limit?)` -- Asignaciones

**Reports (2):**
- `getWeeklyReports(limit?)` -- Historial de reportes
- `generateWeeklyReport(studentId)` -- Generar reporte manual

**Notifications (3):**
- `getNotifications(params?)` -- Lista de notificaciones
- `markNotificationRead(notificationId)` -- Marcar como leida
- `getUnreadNotificationCount()` -- Conteo de no leidas

---

## 6. Gestion de Estado

### 6.1 ParentStore (Zustand)

**Archivo:** `apps/frontend/src/features/parent/store/parentStore.ts`
**Persistencia:** `localStorage` con key `parent-storage` (solo persiste: `account`, `tokens`, `isAuthenticated`)

#### Estado

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `account` | `ParentAccount \| null` | Cuenta del padre autenticado |
| `tokens` | `ParentAuthTokens \| null` | JWT access + refresh tokens |
| `isAuthenticated` | `boolean` | Estado de autenticacion |
| `isLoading` | `boolean` | Indicador de carga |
| `error` | `string \| null` | Ultimo error |
| `students` | `LinkedStudent[]` | Hijos vinculados |
| `progressSummaries` | `StudentProgressSummary[]` | Resumen de progreso por hijo |
| `recentActivities` | `RecentActivity[]` | Actividades recientes de todos los hijos |
| `upcomingAssignments` | `UpcomingAssignment[]` | Asignaciones proximas |
| `unreadNotifications` | `number` | Conteo de notificaciones no leidas |
| `notifications` | `ParentNotification[]` | Lista de notificaciones |
| `weeklyReports` | `WeeklyReport[]` | Reportes semanales |
| `selectedStudentId` | `string \| null` | Hijo seleccionado actualmente |

#### Acciones

| Accion | Descripcion |
|--------|-------------|
| `login(credentials)` | Autenticar y almacenar tokens |
| `register(data)` | Registrar cuenta y almacenar tokens |
| `logout()` | Limpiar tokens y resetear estado |
| `refreshSession()` | Refrescar JWT usando refresh token |
| `loadDashboard()` | Cargar datos completos del dashboard |
| `loadStudentProgress(studentId)` | Cargar progreso detallado de un hijo |
| `linkStudent(data)` | Vincular un nuevo hijo |
| `verifyLink(data)` | Verificar vinculo pendiente |
| `loadNotifications()` | Cargar notificaciones y conteo de no leidas |
| `markNotificationRead(id)` | Marcar notificacion como leida (optimistic update) |
| `selectStudent(id)` | Seleccionar hijo activo |
| `clearError()` | Limpiar error actual |

#### Selectores Exportados

| Selector | Retorna |
|----------|---------|
| `selectParentAccount` | `ParentAccount \| null` |
| `selectIsAuthenticated` | `boolean` |
| `selectStudents` | `LinkedStudent[]` |
| `selectSelectedStudent` | `LinkedStudent \| null` |
| `selectSelectedStudentProgress` | `StudentProgressSummary \| null` |
| `selectUnreadCount` | `number` |

### 6.2 Patron de Estado

El portal de padres usa exclusivamente **Zustand** para gestion de estado (no usa React Query). Esto difiere de los portales de estudiante y maestro que combinan React Query para server state + Zustand para client state. El `parentStore` maneja tanto server state como client state en un solo store con persistencia parcial.

---

## 7. Vinculacion Padre-Estudiante

### 7.1 Flujo Completo

```
1. Padre hace click en "Vincular Hijo" en dashboard
2. Abre LinkStudentModal:
   - Ingresa codigo del estudiante (formato STU-ABC123)
   - Selecciona tipo de relacion (padre, madre, tutor, abuelo, otro)
3. POST /parent-portal/students/link
   Body: { studentCode, relationshipType }
4. Backend:
   a. Busca estudiante por codigo en profiles
   b. Verifica que no exista link duplicado
   c. Crea ParentStudentLink con status 'pending'
   d. (Opcional) Envia notificacion al estudiante para aprobacion
5. POST /parent-portal/students/verify
   Body: { linkId, verificationCode }
6. Backend:
   a. Verifica codigo y linkId
   b. Cambia status a 'active'
   c. Habilita permisos: canViewProgress, canViewGrades, canReceiveNotifications, canContactTeachers
7. Hijo aparece en dashboard del padre
```

### 7.2 Estados del Vinculo (LinkStatus)

| Estado | Descripcion |
|--------|-------------|
| `pending` | Vinculo creado, pendiente de verificacion |
| `active` | Vinculo verificado y activo |
| `suspended` | Vinculo temporalmente suspendido |
| `revoked` | Vinculo revocado permanentemente |

### 7.3 Permisos por Vinculo

Cada `ParentStudentLink` define permisos granulares:

| Permiso | Descripcion |
|---------|-------------|
| `canViewProgress` | Ver progreso academico del hijo |
| `canViewGrades` | Ver calificaciones del hijo |
| `canReceiveNotifications` | Recibir notificaciones sobre el hijo |
| `canContactTeachers` | Comunicarse con maestros del hijo |

### 7.4 Tipos de Relacion

Backend define dos enums de relacion (ligera discrepancia entre `parent-account.enums.ts` y `parent-student-link.enums.ts`):

**En ParentAccount (`RelationshipType`):**
`mother`, `father`, `guardian`, `tutor`, `other`

**En ParentStudentLink (`ParentRelationshipType`):**
`mother`, `father`, `guardian`, `tutor`, `stepparent`, `grandparent`, `other`

**En Frontend (`RelationshipType`):**
`father`, `mother`, `guardian`, `grandparent`, `other`

---

## 8. Notificaciones

### 8.1 Tipos de Alerta (ParentAlertService)

El servicio `ParentAlertService` gestiona alertas en tiempo real para los padres:

| Tipo | Trigger | Prioridad |
|------|---------|-----------|
| `low_performance` | Score por debajo del threshold configurado | high |
| `achievement` | Hijo desbloquea un logro | low |
| `streak_loss` | Hijo pierde racha superior al threshold | medium |
| `inactivity` | Hijo sin actividad por N dias | medium |
| `rank_promotion` | Hijo sube de rango maya | low |
| `assignment_due` | Asignacion proxima a vencer | medium |

### 8.2 Configuracion de Alertas

Interfaz `AlertConfig`:
- `lowPerformanceThreshold` -- Score minimo antes de generar alerta (ej: 50%)
- `inactivityDays` -- Dias sin actividad antes de alertar (ej: 3 dias)
- `streakLossThreshold` -- Racha minima para alertar su perdida (ej: 5 dias)

### 8.3 Canales de Notificacion

| Canal | Implementacion | Estado |
|-------|---------------|--------|
| In-app | `ParentNotification` entity + API endpoints | Implementado |
| Email | `MailService` + templates HTML | Implementado |
| Push | - | No implementado |
| SMS | - | No implementado |

### 8.4 Templates de Email

Tres templates HTML para emails enviados a padres:

**1. Reporte Semanal** (`weekly-report.template.ts`):
- Nombre y nivel del estudiante
- Rango semanal: XP, ejercicios, precision, tiempo de lectura
- Racha actual
- Logros desbloqueados
- Areas de mejora y recomendaciones
- Links al dashboard y opcion de desuscribirse

**2. Alerta de Logro** (`achievement-alert.template.ts`):
- Nombre del padre y estudiante
- Nombre y descripcion del logro
- Recompensas (XP + ML Coins)
- Nivel y rango actual
- Total de logros alcanzados

**3. Alerta de Bajo Rendimiento** (`low-performance-alert.template.ts`):
- Nombre del padre y estudiante
- Tipo de ejercicio y score obtenido vs threshold
- Historial de scores recientes
- Score promedio
- Acciones sugeridas

### 8.5 Frecuencia de Notificaciones

El padre puede configurar su frecuencia preferida (`NotificationFrequency`):

| Frecuencia | Descripcion |
|------------|-------------|
| `realtime` | Cada evento genera notificacion inmediata |
| `daily` | Resumen diario |
| `weekly` | Solo reportes semanales |
| `monthly` | Resumen mensual |
| `on_demand` | Solo cuando el padre solicita |

### 8.6 Formato de Reportes

El padre puede elegir formato de reporte (`ReportFormat`):

| Formato | Descripcion |
|---------|-------------|
| `email` | Solo por correo electronico |
| `in_app` | Solo en la aplicacion |
| `both` | Ambos canales |

### 8.7 Cron de Reportes Semanales

El servicio `WeeklyReportCronService` ejecuta automaticamente cada domingo a las 8:00 AM UTC:

1. Busca todos los `ParentAccount` con `isActive: true`
2. Para cada padre con hijos vinculados activos:
   a. Genera reporte semanal por cada hijo
   b. Envia email si la preferencia lo indica
   c. Crea notificacion in-app
3. Registra estadisticas de ejecucion: total padres, reportes generados, emails enviados, errores, duracion

---

## 9. Navegacion y Rutas

### 9.1 Rutas del Portal

Definidas en `apps/frontend/src/App.tsx`, envueltas en `ErrorBoundary` con `portal="Parent"`:

| Ruta | Componente | Proteccion | Descripcion |
|------|-----------|------------|-------------|
| `/parent/login` | `ParentLoginPage` | Publica | Login de padre |
| `/parent/register` | `ParentRegisterPage` | Publica | Registro de padre |
| `/parent/dashboard` | `ParentDashboardPage` | `ProtectedRoute(parent)` | Dashboard principal |
| `/parent/child/:studentId` | `ChildProgressPage` | `ProtectedRoute(parent)` | Progreso de hijo |
| `/parent/linking` | `StudentLinkingPage` | `ProtectedRoute(parent)` | Gestion de vinculacion de hijos |
| `/parent/activities` | `StudentActivitiesPage` | `ProtectedRoute(parent)` | Vista de actividades del estudiante |
| `/parent/reports` | `ReportsPage` | `ProtectedRoute(parent)` | Historial y generacion de reportes |

### 9.2 Navegacion Interna

El portal de padres NO usa Sidebar compartido. Cada pagina tiene su propio header con navegacion:

**Desde ParentDashboardPage:**
- `/parent/notifications` (enlace en header, sin pagina implementada aun)
- `/parent/settings` (enlace en header, sin pagina implementada aun)
- `/parent/child/:studentId` (click en tarjeta de hijo)
- `/parent/activity` (enlace "Ver todo" en actividades, sin pagina implementada aun)
- `/parent/assignments` (enlace "Ver todo" en tareas, sin pagina implementada aun)

**Desde ChildProgressPage:**
- Boton "Volver" navega a `/parent/dashboard`

### 9.3 Carga Lazy

Todas las paginas del portal de padres se cargan con `React.lazy()`:

```typescript
const ParentLoginPage = lazy(() => import('@/apps/parent/pages/ParentLoginPage'));
const ParentRegisterPage = lazy(() => import('@/apps/parent/pages/ParentRegisterPage'));
const ParentDashboardPage = lazy(() => import('@/apps/parent/pages/ParentDashboardPage'));
const ChildProgressPage = lazy(() => import('@/apps/parent/pages/ChildProgressPage'));
const StudentLinkingPage = lazy(() => import('@/apps/parent/pages/StudentLinkingPage'));
const StudentActivitiesPage = lazy(() => import('@/apps/parent/pages/StudentActivitiesPage'));
const ReportsPage = lazy(() => import('@/apps/parent/pages/ReportsPage'));
```

---

## 10. Componentes Reutilizables

### 10.1 ChildProgressCard

**Archivo:** `apps/frontend/src/features/parent/ChildProgressCard.tsx`

Card que muestra resumen de progreso de un hijo. Usado en el grid del dashboard.

**Props:**
- `student: LinkedStudent` -- Datos del estudiante vinculado
- `progress?: StudentProgressSummary` -- Resumen de progreso (puede ser undefined mientras carga)
- `onViewProgress: () => void` -- Callback al hacer click en "Ver Detalles"

**Muestra:**
- Avatar (imagen o iniciales)
- Nombre, nivel y rango maya
- Barra de progreso de XP semanal (meta: 500 XP/semana)
- Grid de 3 stats: Ejercicios completados, dias de racha, precision
- Hasta 3 logros recientes como badges
- Boton "Ver Detalles" al fondo

### 10.2 WeeklyReportView

**Archivo:** `apps/frontend/src/features/parent/WeeklyReportView.tsx`

Componente de dos paneles para visualizar reportes semanales. Usado en el tab "Reportes" de ChildProgressPage.

**Props:**
- `studentId: string` -- ID del estudiante
- `reports: WeeklyReport[]` -- Lista de reportes existentes

**Panel izquierdo (1/3):**
- Lista clickeable de reportes con estado (completado/generando/fallido)
- Rango de fechas de cada reporte

**Panel derecho (2/3):**
- Detalle del reporte seleccionado con 6 metricas en grid
- Boton de descarga PDF (si `downloadUrl` disponible)
- Estado de generacion con spinner
- Estado de error con boton de reintento

**Acciones:**
- Boton "Generar Reporte" llama a `parentAPI.generateWeeklyReport(studentId)`

---

## 11. Tipos y DTOs

### 11.1 Enums del Frontend

Definidos en `apps/frontend/src/features/parent/types/parent.types.ts`:

| Enum | Valores |
|------|---------|
| `RelationshipType` | `father`, `mother`, `guardian`, `grandparent`, `other` |
| `NotificationFrequency` | `daily`, `weekly`, `biweekly`, `monthly` |
| `ReportFormat` | `email`, `pdf`, `both` |
| `LinkStatus` | `pending`, `active`, `suspended`, `revoked` |
| `ActivityType` | `exercise_completed`, `achievement_unlocked`, `level_up`, `rank_promotion`, `module_completed`, `assignment_submitted`, `streak_milestone` |
| `AssignmentStatus` | `pending`, `in_progress`, `submitted`, `overdue` |

### 11.2 DTOs de Respuesta Backend

Definidos en `apps/backend/src/modules/parents/dto/parent-response.dto.ts`:

| DTO | Campos Principales |
|-----|-------------------|
| `ParentAuthTokensDto` | accessToken, refreshToken, expiresIn |
| `ParentAccountResponseDto` | id, profileId, displayName, email, avatarUrl, relationshipType, notificationFrequency, preferredReportFormat, isVerified, isActive |
| `ParentAuthResponseDto` | tokens (ParentAuthTokensDto), account (ParentAccountResponseDto) |
| `LinkedStudentDto` | studentId, linkId, displayName, avatarUrl, relationshipType, linkStatus, canView*, linkedAt |
| `StudentProgressSummaryDto` | studentId, displayName, currentLevel, currentRank, totalXp, xpThisWeek, currentStreak, exercisesCompletedThisWeek, averageAccuracyThisWeek, modulesInProgress, modulesCompleted, recentAchievements |
| `RecentActivityDto` | id, studentId, studentName, activityType, title, description, xpEarned, timestamp |
| `UpcomingAssignmentDto` | id, studentId, studentName, title, description, dueDate, status, teacherName, className |
| `ParentDashboardDto` | students, progressSummaries, recentActivities, upcomingAssignments, unreadNotifications, unreadMessages |

---

## 12. Validaciones y Seguridad

### 12.1 Validaciones de Acceso

1. **Solo padres autenticados** pueden acceder a rutas protegidas (validado por `ParentAuthGuard` en backend y `ProtectedRoute` con rol `parent` en frontend)
2. **Solo vinculos activos** permiten consultar progreso -- el backend filtra por `LinkStatus.ACTIVE` en todas las queries de progreso
3. **Scope de estudiante:** Cada endpoint de progreso/actividades/asignaciones verifica que el `studentId` solicitado pertenece a un vinculo activo del padre autenticado
4. **UUID validation:** Los parametros `studentId` y `notificationId` se validan con `ParseUUIDPipe` en backend

### 12.2 Seguridad de Tokens

- JWT secret compartido con el sistema principal (via `ConfigService`)
- Token payload incluye `type: 'parent'` para distinguir de tokens regulares
- Hash de contrasena con bcrypt (12 rounds)
- Refresh token permite renovar sesion sin re-login

### 12.3 Proteccion de Rutas Frontend

Las rutas del portal de padres se protegen con `ProtectedRoute` que verifica:
- Token valido en parentStore
- Rol `parent` en el token decodificado

---

## 13. Tablas de Base de Datos Relacionadas

| Schema | Tabla | Descripcion |
|--------|-------|-------------|
| `auth_management` | `parent_accounts` | Cuentas de padre (email, password_hash, preferencias) |
| `auth_management` | `parent_student_links` | Vinculos padre-estudiante (con permisos granulares) |
| `auth_management` | `parent_notifications` | Notificaciones in-app para padres |
| `auth_management` | `profiles` | Perfiles de usuario (compartido con sistema principal) |
| `auth` | `users` | Usuarios del sistema (compartido) |

---

## 14. Flujos End-to-End Asociados

| ID | Flujo | Archivo |
|----|-------|---------|
| `FL-PRN-01` | Vinculacion padre-estudiante | `docs/30-ux-ui/flujos/parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md` |
| `FL-PRN-02` | Seguimiento de progreso | `docs/30-ux-ui/flujos/parents/FLUJO-SEGUIMIENTO-PROGRESO.md` |
| `FL-PRN-03` | Notificaciones padres | `docs/30-ux-ui/flujos/parents/FLUJO-NOTIFICACIONES-PADRES.md` |
| `FL-PRN-04` | Login padres | `docs/30-ux-ui/flujos/parents/FLUJO-LOGIN-PADRES.md` |
| `FL-PRN-05` | Registro padres | `docs/30-ux-ui/flujos/parents/FLUJO-REGISTRO-PADRES.md` |
| `FL-PRN-06` | Dashboard padres | `docs/30-ux-ui/flujos/parents/FLUJO-DASHBOARD-PADRES.md` |
| `FL-PRN-07` | Progreso de hijo | `docs/30-ux-ui/flujos/parents/FLUJO-PROGRESO-HIJO.md` |

---

## 15. Gaps y Pendientes

Funcionalidades referenciadas en el codigo frontend. Las 3 paginas pendientes ya estan implementadas (StudentLinkingPage, StudentActivitiesPage, ReportsPage):

| Referencia | Ubicacion | Estado |
|------------|-----------|--------|
| `/parent/linking` | StudentLinkingPage | Implementado |
| `/parent/activities` | StudentActivitiesPage | Implementado |
| `/parent/reports` | ReportsPage | Implementado |
| `/parent/notifications` | Link en header de ParentDashboardPage | Sin ruta ni pagina |
| `/parent/settings` | Link en header de ParentDashboardPage | Sin ruta ni pagina |
| `/parent/forgot-password` | Link en ParentLoginPage | Sin ruta ni pagina |
| Push notifications | Templates solo para email | No implementado |
| SMS notifications | Mencionado en CLAUDE.md | No implementado |

Discrepancias menores entre frontend y backend en enums de `RelationshipType`:
- Frontend incluye `grandparent` pero no `tutor`
- Backend `ParentAccount.RelationshipType` incluye `tutor` pero no `grandparent`
- Backend `ParentStudentLink.ParentRelationshipType` incluye `tutor`, `stepparent` y `grandparent`

---

## 16. Referencias

- `docs/30-ux-ui/flujos/README.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md`
- `apps/backend/src/modules/parents/parents.module.ts`
- `apps/frontend/src/features/parent/index.ts`
- `apps/frontend/src/App.tsx` (rutas del portal)
