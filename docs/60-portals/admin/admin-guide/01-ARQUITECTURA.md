---
titulo: "Portal Admin - Arquitectura y Módulos Principales"
tipo: portal
portal: admin
status: activo
last_updated: "2026-02-28"
---

# Portal Admin — Arquitectura y Módulos Principales

**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [Siguiente: Patrones y Estado →](02-PATRONES-ESTADO.md)

---

## 1. Visión General

### 1.1 Propósito

El Portal Admin es la interfaz principal para administradores del sistema GAMILIT. Proporciona herramientas para:

- **Gestión de Usuarios:** Crear, editar, suspender y eliminar usuarios del sistema
- **Gestión de Organizaciones:** Administrar tenants, instituciones y sus suscripciones
- **Configuración del Sistema:** Settings globales, feature flags y mantenimiento
- **Moderación de Contenido:** Aprobar/rechazar contenido creado por teachers
- **Configuración de Gamificación:** Parámetros de ML Coins, rangos Maya, achievements
- **Monitoreo del Sistema:** Salud del sistema, métricas, logs y performance
- **Alertas del Sistema:** Gestión de alertas críticas y de intervención
- **Reportes y Analytics:** Dashboards, estadísticas y exportación de datos
- **Operaciones Masivas:** Bulk operations (suspend, delete, role updates)
- **Gestión de Roles y Permisos:** Configuración de permisos por rol
- **Asignación de Aulas:** Asignar teachers a classrooms

### 1.2 Usuarios Objetivo

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| Admin | Completo | Todas las funcionalidades del portal |
| Super Admin | Completo + System | Incluye configuración crítica del sistema |

---

## 2. Arquitectura

### 2.1 Estructura de Carpetas

#### Frontend (apps/frontend/src/apps/admin/)

```
admin/
├── index.ts                    # Barrel export principal
├── layouts/
│   └── AdminLayout.tsx         # Layout principal con navegación
├── pages/                      # Páginas del portal (19 páginas)
│   ├── AdminDashboardPage.tsx          # Dashboard principal
│   ├── AdminUsersPage.tsx              # Gestión de usuarios
│   ├── AdminInstitutionsPage.tsx       # Gestión de organizaciones
│   ├── AdminRolesPage.tsx              # Roles y permisos
│   ├── AdminContentPage.tsx            # Moderación de contenido
│   ├── AdminGamificationPage.tsx       # Config gamificación
│   ├── AdminSettingsPage.tsx           # Configuración del sistema
│   ├── AdminMonitoringPage.tsx         # Monitoreo del sistema
│   ├── AdminAlertsPage.tsx             # Alertas del sistema
│   ├── AdminAnalyticsPage.tsx          # Analytics y métricas
│   ├── AdminReportsPage.tsx            # Generación de reportes
│   ├── AdminProgressPage.tsx           # Progreso general
│   ├── AdminClassroomTeacherPage.tsx   # Asignación de aulas
│   ├── AdminAdvancedPage.tsx           # Configuración avanzada
│   ├── AdminNotificationsPage.tsx      # Gestión de notificaciones
│   ├── AdminNotificationPreferencesPage.tsx # Preferencias de notif.
│   ├── AdminAuditLogsPage.tsx          # Logs de auditoría
│   ├── AdminAssignmentsPage.tsx        # Gestión de asignaciones
│   └── AdminExerciseCreatePage.tsx     # Constructor de ejercicios (crear + editar via :id/edit)
├── components/                 # Componentes organizados por dominio (124 componentes)
│   ├── shared/                 # Componentes cross-cutting (Sprint 0)
│   │   ├── AdminPageShell.tsx          # Wrapper estándar de página
│   │   └── AdminTabBar.tsx             # Tabs genérico (underline/cards)
│   ├── dashboard/              # Dashboard components (Sprint 2)
│   │   ├── DashboardStatsGrid.tsx      # Grid de estadísticas
│   │   ├── SystemHealthCard.tsx        # Tarjeta salud del sistema
│   │   ├── AlertsNotificationsCard.tsx # Tarjeta alertas recientes
│   │   └── DashboardQuickActions.tsx   # Acciones rápidas
│   ├── users/                  # Gestión de usuarios (Sprint 1)
│   │   ├── UsersSearchFilters.tsx      # Filtros de búsqueda
│   │   ├── UsersStatsGrid.tsx          # Grid de estadísticas
│   │   ├── UsersTable.tsx              # Tabla de usuarios
│   │   └── UserBadges.tsx              # Badges de rol/status
│   ├── audit/                  # Logs de auditoría (Sprint 1)
│   ├── notifications/          # Notificaciones (Sprint 2)
│   │   ├── NotificationHeader.tsx      # Header con acciones
│   │   ├── NotificationFilters.tsx     # Filtros de notificaciones
│   │   └── NotificationItem.tsx        # Item de notificación
│   ├── content/                # Moderación de contenido (Sprint 1+2)
│   │   ├── ContentPreviewModal.tsx     # Preview de contenido
│   │   ├── ContentVersionsTab.tsx      # Versiones de contenido
│   │   ├── MediaLibraryTab.tsx         # Biblioteca de media
│   │   ├── PendingExercisesTab.tsx     # Ejercicios pendientes
│   │   └── RejectExerciseModal.tsx     # Modal de rechazo
│   ├── gamification/           # Configuración gamificación (Sprint 1)
│   │   ├── AchievementsTab.tsx
│   │   ├── RanksTab.tsx
│   │   ├── EconomyTab.tsx
│   │   └── StatsTab.tsx
│   ├── institutions/           # Organizaciones (Sprint 2)
│   │   └── InstitutionFormModals.tsx   # Modales CRUD
│   ├── exercise-builder/       # Constructor de ejercicios (Sprint 2)
│   │   ├── StepBasicInfo.tsx           # Paso 1: info basica + selector dinamico de modulos
│   │   ├── CreateModuleModal.tsx       # Modal crear modulo inline (v1.3.0)
│   │   ├── ExerciseTypeSelector.tsx    # Selector tipo ejercicio (29 tipos, 5 modulos) con tabs dinamicos
│   │   ├── ExercisePreview.tsx         # Preview de ejercicio
│   │   └── type-configs/              # Config por tipo (barrel)
│   ├── reports/                # Generación de reportes
│   ├── classroom-teacher/      # Asignación de aulas
│   ├── settings/               # Configuración
│   │   └── ProfileSettings.tsx
│   └── alerts/                 # Sistema de alertas
├── hooks/                      # Custom hooks (31 hooks)
│   ├── useAdminPageSetup.ts            # Boilerplate centralizado (Sprint 0)
│   ├── useAdminDashboard.ts            # Dashboard data
│   ├── useUserManagement.ts            # CRUD usuarios (legacy)
│   ├── useUserActions.ts               # Acciones de usuario (Sprint 1)
│   ├── useCreateUserFlow.ts            # Flujo creación (Sprint 1)
│   ├── useContentManagement.ts         # Moderación contenido
│   ├── useContentQueries.ts            # Content React Query (Sprint 1)
│   ├── useInstitutionActions.ts        # CRUD instituciones (Sprint 2)
│   ├── useGamificationConfig.ts        # Config gamificación
│   ├── useSystemMonitoring.ts          # Monitoreo avanzado
│   ├── useSystemMetrics.ts             # Métricas del sistema
│   ├── useModalBehavior.ts             # Escape + scroll lock (Sprint 0)
│   └── index.ts
└── types/
    ├── index.ts                # 50+ interfaces/types
    └── exercise-builder.types.ts # Tipos constructor (Sprint 2)
```

#### Backend (apps/backend/src/modules/admin/)

```
admin/
├── admin.module.ts             # Módulo NestJS principal
├── index.ts                    # Barrel exports
├── controllers/                # 21 controllers
│   ├── admin-dashboard.controller.ts       # Dashboard general
│   ├── admin-users.controller.ts           # CRUD usuarios
│   ├── admin-organizations.controller.ts   # CRUD organizaciones
│   ├── admin-roles.controller.ts           # Gestión de roles
│   ├── admin-content.controller.ts         # Moderación contenido
│   ├── admin-gamification-config.controller.ts  # Config gamificación
│   ├── admin-system.controller.ts          # Config sistema
│   ├── admin-monitoring.controller.ts      # Monitoreo
│   ├── admin-alerts.controller.ts          # Alertas sistema
│   ├── admin-interventions.controller.ts   # Alertas intervención
│   ├── admin-analytics.controller.ts       # Analytics
│   ├── admin-reports.controller.ts         # Reportes
│   ├── admin-progress.controller.ts        # Progreso general
│   ├── admin-logs.controller.ts            # Audit logs
│   ├── admin-bulk-operations.controller.ts # Operaciones masivas
│   ├── classroom-assignments.controller.ts # Asignación aulas
│   └── classroom-teachers-rest.controller.ts
├── services/                   # 15 services
│   ├── admin-dashboard.service.ts
│   ├── admin-users.service.ts
│   ├── admin-organizations.service.ts
│   ├── admin-roles.service.ts
│   ├── admin-content.service.ts
│   ├── gamification-config.service.ts
│   ├── admin-system.service.ts
│   ├── admin-monitoring.service.ts
│   ├── admin-alerts.service.ts
│   ├── admin-interventions.service.ts
│   ├── admin-analytics.service.ts
│   ├── admin-reports.service.ts
│   ├── admin-progress.service.ts
│   ├── bulk-operations.service.ts
│   └── classroom-assignments.service.ts
├── dto/                        # Data Transfer Objects (15 categorías)
│   ├── dashboard/              # Dashboard DTOs
│   ├── users/                  # User management DTOs
│   ├── organizations/          # Organization DTOs
│   ├── roles/                  # Role management DTOs
│   ├── content/                # Content moderation DTOs
│   ├── gamification-config/    # Gamification config DTOs
│   ├── system/                 # System config DTOs
│   ├── monitoring/             # Monitoring DTOs
│   ├── alerts/                 # Alerts DTOs
│   ├── interventions/          # Intervention alerts DTOs
│   ├── analytics/              # Analytics DTOs
│   ├── reports/                # Reports DTOs
│   ├── progress/               # Progress tracking DTOs
│   ├── bulk-operations/        # Bulk operations DTOs
│   └── classroom-assignments/  # Classroom assignment DTOs
├── entities/                   # Entidades TypeORM
│   ├── system-setting.entity.ts
│   ├── feature-flag.entity.ts
│   ├── notification-settings.entity.ts
│   ├── bulk-operation.entity.ts
│   ├── system-alert.entity.ts
│   └── index.ts
├── guards/                     # Guards de autorización
│   └── admin.guard.ts
└── __tests__/                  # Tests unitarios
```

### 2.2 Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  Pages ──────► Components ──────► Hooks ──────► API Services    │
│                    │                   │                         │
│                    └───────────────────┼─────► Types             │
└────────────────────────────────────────┼─────────────────────────┘
                                         │
                                    HTTP/REST
                                         │
┌────────────────────────────────────────▼─────────────────────────┐
│                        BACKEND                                    │
├──────────────────────────────────────────────────────────────────┤
│  Controllers ──────► Services ──────► Repositories ──────► DB    │
│       │                  │                                       │
│       └──────────────────┼─────► Guards (AdminGuard)             │
│                          │                                       │
│                          └─────► External Modules                │
│                                  (Auth, Social, Educational,     │
│                                   Gamification, Progress, etc.)  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Flujo de Datos

```
┌──────────────┐
│  AdminPage   │ Renderiza la UI
└──────┬───────┘
       │ Usa
       ▼
┌──────────────┐
│  useAdminXXX │ Hook personalizado que maneja lógica
└──────┬───────┘
       │ Llama
       ▼
┌──────────────┐
│  adminAPI.ts │ Servicio API (axios)
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────────┐
│  AdminController │ Backend NestJS
└──────┬───────────┘
       │ Usa
       ▼
┌──────────────────┐
│  AdminService    │ Lógica de negocio
└──────┬───────────┘
       │ Query
       ▼
┌──────────────────┐
│  TypeORM Repo    │ Acceso a base de datos
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  PostgreSQL DB   │ Múltiples schemas (auth, social, educational, etc.)
└──────────────────┘
```

---

## 3. Módulos Principales

### 3.1 Dashboard Administrativo

**Propósito:** Vista general del estado del sistema y métricas clave.

**Componentes:**
- `AdminDashboardPage.tsx` - Página principal
- `AdminDashboardHero.tsx` - Hero con métricas principales
- `useAdminDashboard.ts` - Hook con auto-refresh

**Funcionalidades:**
- Estadísticas del sistema (usuarios, organizaciones, contenido)
- Salud del sistema (CPU, memoria, uptime)
- Alertas recientes
- Actividad de usuarios
- Acciones recientes de admins

**Endpoints principales:**
```typescript
GET /admin/dashboard              // Dashboard completo
GET /admin/dashboard/stats        // Estadísticas
GET /admin/dashboard/recent-activity
GET /admin/dashboard/user-stats
GET /admin/dashboard/organization-stats
GET /admin/dashboard/actions/recent
GET /admin/dashboard/alerts
GET /admin/dashboard/analytics/user-activity
```

**Ejemplo de uso:**
```typescript
// useAdminDashboard.ts
export function useAdminDashboard() {
  const {
    systemHealth,
    metrics,
    recentActions,
    alerts,
    userActivity,
    loading,
    error,
    refreshAll,
  } = useAdminDashboard();

  return {
    systemHealth,    // CPU, memory, uptime
    metrics,         // Total users, orgs, sessions
    recentActions,   // Últimas acciones de admins
    alerts,          // Alertas del sistema
    userActivity,    // Actividad de usuarios
    loading,
    error,
    refreshAll,
  };
}
```

### 3.2 Gestión de Usuarios

**Propósito:** CRUD completo de usuarios del sistema.

**Componentes:**
- `AdminUsersPage.tsx` - Lista y gestión de usuarios
- Componentes: filtros, tabla, modales de edición

**Funcionalidades:**
- Listar usuarios con filtros (rol, status, búsqueda)
- Crear nuevos usuarios
- Editar información de usuario
- Suspender/reactivar usuarios
- Eliminar usuarios (soft delete)
- Resetear contraseñas
- Ver detalles y estadísticas por usuario
- Operaciones masivas (bulk suspend, bulk delete, bulk role update)

**Endpoints principales:**
```typescript
GET    /admin/users                    // Lista paginada
GET    /admin/users/stats              // Estadísticas
GET    /admin/users/:id                // Detalles
PUT    /admin/users/:id                // Actualizar
DELETE /admin/users/:id                // Eliminar
POST   /admin/users/:id/suspend        // Suspender
POST   /admin/users/:id/activate       // Activar
POST   /admin/users/:id/reset-password // Reset password
POST   /admin/users/bulk/suspend       // Bulk suspend
POST   /admin/users/bulk/delete        // Bulk delete
POST   /admin/users/bulk/role          // Bulk role update
GET    /admin/users/bulk/:operationId  // Status operación
```

**DTOs clave:**
```typescript
// ListUsersDto
interface ListUsersDto {
  page?: number;
  limit?: number;
  role?: string;
  status?: 'active' | 'suspended' | 'inactive';
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// UpdateUserDto
interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
  };
}

// SuspendUserDto
interface SuspendUserDto {
  reason: string;
  duration_days?: number;
}
```

### 3.3 Gestión de Organizaciones

**Propósito:** Administrar tenants e instituciones educativas.

**Componentes:**
- `AdminInstitutionsPage.tsx` - Gestión de organizaciones

**Funcionalidades:**
- Listar organizaciones/tenants
- Crear nueva organización
- Editar información de organización
- Configurar suscripción (plan, features)
- Ver usuarios por organización
- Activar/desactivar features
- Ver estadísticas por organización

**Endpoints principales:**
```typescript
GET    /admin/organizations                 // Lista
POST   /admin/organizations                 // Crear
GET    /admin/organizations/:id             // Detalles
PUT    /admin/organizations/:id             // Actualizar
DELETE /admin/organizations/:id             // Eliminar
GET    /admin/organizations/:id/users       // Usuarios
GET    /admin/organizations/:id/stats       // Estadísticas
PATCH  /admin/organizations/:id/subscription // Actualizar suscripción
PATCH  /admin/organizations/:id/features    // Actualizar features
```

### 3.4 Configuración de Gamificación

**Propósito:** Configurar parámetros del sistema de gamificación.

**Componentes:**
- `AdminGamificationPage.tsx` - Configuración completa

**Funcionalidades:**
- Configurar parámetros de ML Coins (rewards, costs)
- Configurar rangos Maya (thresholds, nombres, colores)
- Configurar achievements (criterios, recompensas)
- Preview de impacto de cambios
- Historial de cambios de configuración

**Endpoints principales:**
```typescript
GET    /admin/gamification/settings          // Settings actuales
PATCH  /admin/gamification/settings          // Actualizar settings
GET    /admin/gamification/parameters        // Lista parámetros
PATCH  /admin/gamification/parameters/:id    // Actualizar parámetro
GET    /admin/gamification/maya-ranks        // Rangos Maya
PATCH  /admin/gamification/maya-ranks/:id    // Actualizar rango
POST   /admin/gamification/preview-impact    // Preview de cambios
```

**Parámetros configurables:**
```typescript
// Rewards
- exercise_completion_xp: number
- exercise_completion_coins: number
- daily_login_coins: number
- assignment_completion_bonus_xp: number

// Costs
- comodin_cost: number
- hint_cost: number
- retry_cost: number

// Maya Ranks
- ajaw_threshold: number
- kinich_threshold: number
- kukulkan_threshold: number
```

### 3.5 Moderación de Contenido

**Propósito:** Aprobar/rechazar contenido creado por teachers.

**Componentes:**
- `AdminContentPage.tsx` - Cola de moderación

**Funcionalidades:**
- Ver cola de contenido pendiente
- Aprobar contenido
- Rechazar contenido (con razón)
- Ver historial de aprobaciones
- Filtrar por tipo (ejercicios, módulos, media)
- Ver versiones de contenido

**Endpoints principales:**
```typescript
GET    /admin/content                    // Lista contenido
GET    /admin/content/pending            // Pendiente moderación
GET    /admin/content/:id                // Detalles
POST   /admin/content/:id/approve        // Aprobar
POST   /admin/content/:id/reject         // Rechazar
GET    /admin/content/:id/versions       // Versiones
POST   /admin/content/:id/versions       // Crear versión
GET    /admin/content/:id/approval-history // Historial
GET    /admin/media                      // Lista media files
```

### 3.6 Alertas del Sistema

**Propósito:** Gestionar alertas críticas y de intervención.

**Componentes:**
- `AdminAlertsPage.tsx` - Gestión de alertas

**Funcionalidades:**
- Ver alertas del sistema (critical, high, medium, low)
- Ver alertas de intervención estudiantil
- Crear alertas manuales
- Resolver/cerrar alertas
- Acknowledge alertas
- Filtrar por tipo, severidad, estado
- Ver estadísticas de alertas

**Endpoints principales:**
```typescript
// System Alerts
GET    /admin/alerts                    // Lista
POST   /admin/alerts                    // Crear
GET    /admin/alerts/stats              // Estadísticas
PATCH  /admin/alerts/:id/acknowledge    // Acknowledge
PATCH  /admin/alerts/:id/resolve        // Resolver

// Intervention Alerts (estudiantes en riesgo)
GET    /admin/interventions             // Lista
GET    /admin/interventions/:id         // Detalles
PATCH  /admin/interventions/:id/acknowledge
PATCH  /admin/interventions/:id/resolve
```

**Tipos de alertas:**
```typescript
// System Alerts
- high_error_rate
- database_connection
- high_memory_usage
- high_cpu_usage
- disk_space_low

// Intervention Alerts
- declining_trend        // Estudiante con tendencia decreciente
- low_engagement         // Baja participación
- failing_exercises      // Fallos repetidos
- no_activity            // Sin actividad reciente
```

### 3.7 Monitoreo del Sistema

**Propósito:** Monitorear salud y performance del sistema.

**Componentes:**
- `AdminMonitoringPage.tsx` - Dashboard de monitoreo

**Funcionalidades:**
- Salud del sistema (health check)
- Métricas en tiempo real (CPU, memoria, uptime)
- Logs de errores recientes
- Tendencias de errores
- Historial de métricas
- Performance de endpoints

**Endpoints principales:**
```typescript
GET /admin/monitoring/health            // Health check
GET /admin/monitoring/metrics           // Métricas actuales
GET /admin/monitoring/metrics/history   // Historial
GET /admin/monitoring/errors/recent     // Errores recientes
GET /admin/monitoring/errors/stats      // Estadísticas errores
GET /admin/monitoring/errors/trends     // Tendencias
```

### 3.8 Analytics y Reportes

**Propósito:** Dashboards analytics y generación de reportes.

**Componentes:**
- `AdminAnalyticsPage.tsx` - Analytics avanzados
- `AdminReportsPage.tsx` - Generación de reportes

**Funcionalidades Analytics:**
- Overview general
- Engagement analytics
- Retention analytics
- Gamification analytics
- Activity timeline
- Top users
- Exportar datos

**Funcionalidades Reportes:**
- Generar reportes en PDF/Excel
- Reportes predefinidos (usuarios, organizaciones, contenido)
- Reportes personalizados
- Programar reportes recurrentes

**Endpoints Analytics:**
```typescript
GET /admin/analytics/overview
GET /admin/analytics/engagement
GET /admin/analytics/retention
GET /admin/analytics/gamification
GET /admin/analytics/activity-timeline
GET /admin/analytics/top-users
POST /admin/analytics/export
```

**Endpoints Reportes:**
```typescript
GET  /admin/reports                    // Lista reportes
POST /admin/reports/generate           // Generar reporte
GET  /admin/reports/:id                // Descargar reporte
GET  /admin/reports/templates          // Templates disponibles
```

### 3.9 Configuración del Sistema

**Propósito:** Configuración global del sistema.

**Componentes:**
- `AdminSettingsPage.tsx` - Settings generales
- `AdminAdvancedPage.tsx` - Configuración avanzada

**Funcionalidades:**
- Configurar system settings (globales)
- Feature flags (habilitar/deshabilitar features)
- Notification settings
- Modo mantenimiento
- Limpiar cache
- Ejecutar tareas de mantenimiento
- Ver audit logs

**Endpoints principales:**
```typescript
GET    /admin/system/config              // Config actual
PATCH  /admin/system/config              // Actualizar config
GET    /admin/system/health              // Salud sistema
POST   /admin/system/maintenance/toggle  // Toggle mantenimiento
POST   /admin/system/maintenance/clear-cache
POST   /admin/system/maintenance/rebuild-indexes
GET    /admin/logs                       // Audit logs
```

### 3.10 Gestión de Roles y Permisos

**Propósito:** Configurar permisos por rol.

**Componentes:**
- `AdminRolesPage.tsx` - Gestión de roles

**Funcionalidades:**
- Listar roles
- Ver permisos por rol
- Actualizar permisos de un rol
- Crear roles personalizados (futuro)

**Endpoints principales:**
```typescript
GET   /admin/roles                  // Lista roles
GET   /admin/roles/:id              // Detalles rol
GET   /admin/roles/:id/permissions  // Permisos del rol
PATCH /admin/roles/:id/permissions  // Actualizar permisos
```

### 3.11 Asignación de Aulas

**Propósito:** Asignar teachers a classrooms.

**Componentes:**
- `AdminClassroomTeacherPage.tsx` - Gestión de asignaciones

**Funcionalidades:**
- Listar todas las asignaciones
- Asignar teacher a classroom
- Reasignar classroom a otro teacher
- Remover asignación
- Bulk assign (múltiples classrooms)
- Ver teachers disponibles
- Ver classrooms sin asignar

**Endpoints principales:**
```typescript
GET    /admin/classroom-assignments           // Lista todas
GET    /admin/classroom-assignments/teachers/:teacherId
GET    /admin/classroom-assignments/classrooms/:classroomId
POST   /admin/classroom-assignments/assign    // Asignar
POST   /admin/classroom-assignments/bulk-assign
PATCH  /admin/classroom-assignments/:id/reassign
DELETE /admin/classroom-assignments/:id       // Remover

// REST endpoints alternativos
GET    /admin/classrooms/:classroomId/teachers
POST   /admin/classrooms/:classroomId/teachers
DELETE /admin/classrooms/:classroomId/teachers/:teacherId
```

### 3.12 Progreso General

**Propósito:** Vista global del progreso de todos los usuarios.

**Componentes:**
- `AdminProgressPage.tsx` - Dashboard de progreso

**Funcionalidades:**
- Overview de progreso global
- Progreso por estudiante
- Progreso por classroom
- Progreso por módulo
- Logros más comunes
- Submissions recientes
- Exportar datos de progreso

**Endpoints principales:**
```typescript
GET /admin/progress/overview
GET /admin/progress/students
GET /admin/progress/classrooms
GET /admin/progress/modules
GET /admin/progress/export
```

---

[← Volver al hub](../PORTAL-ADMIN-GUIDE.md) | [Siguiente: Patrones y Estado →](02-PATRONES-ESTADO.md)
