# Guía de Desarrollo - Portal Admin

**Fecha de creación:** 2025-11-29
**Versión:** 2.0.0
**Estado:** VIGENTE
**Aplica a:** apps/frontend/src/apps/admin/ + apps/backend/src/modules/admin/

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
│   └── AdminExerciseCreatePage.tsx     # Constructor de ejercicios
├── components/                 # Componentes organizados por dominio (30+)
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
│   │   ├── StepBasicInfo.tsx           # Paso 1: info básica
│   │   ├── ExercisePreview.tsx         # Preview de ejercicio
│   │   └── type-configs/              # Config por tipo (barrel)
│   ├── reports/                # Generación de reportes
│   ├── classroom-teacher/      # Asignación de aulas
│   ├── settings/               # Configuración
│   │   └── ProfileSettings.tsx
│   └── alerts/                 # Sistema de alertas
├── hooks/                      # Custom hooks (12 hooks)
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
├── controllers/                # 17 controllers
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

## 4. Patrones de Diseño

### 4.1 Frontend Patterns

#### 4.1.1 Page + Hook Pattern

Cada página tiene un hook correspondiente que encapsula la lógica:

```typescript
// Pattern: Page con Hook dedicado

// AdminUsersPage.tsx
export default function AdminUsersPage() {
  const {
    users,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
  } = useUserManagement();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <AdminLayout>
      <UserFilters filters={filters} onChange={setFilters} />
      <UserStats stats={stats} />
      <UserTable
        users={users}
        onEdit={updateUser}
        onDelete={deleteUser}
        onSuspend={suspendUser}
      />
    </AdminLayout>
  );
}

// useUserManagement.ts
export function useUserManagement() {
  const [filters, setFilters] = useState<UserFilters>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminAPI.listUsers(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => adminAPI.getUserStats(),
  });

  const { mutate: createUser } = useMutation({
    mutationFn: adminAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  // ... más mutations

  return {
    users,
    stats,
    loading: isLoading,
    filters,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
  };
}
```

#### 4.1.1b AdminPageShell Pattern (Sprint 0+1+2)

Todas las páginas admin usan `AdminPageShell` como wrapper estándar, eliminando boilerplate repetitivo:

```typescript
// Pattern: AdminPageShell (reemplaza AdminLayout + useAuth + gamification boilerplate)

// ANTES (Sprint 0 — cada página repetía ~15-35 líneas):
export default function AdminSomePage() {
  const { user } = useAuth();
  const { data: gamData } = useUserGamification(user?.id);
  const displayData = gamData ? formatGamification(gamData) : null;
  const handleLogout = () => { /* logout logic */ };

  return (
    <AdminLayout
      user={user}
      gamificationData={displayData}
      onLogout={handleLogout}
    >
      {/* page content */}
    </AdminLayout>
  );
}

// DESPUÉS (Sprint 2 — todas las páginas usan AdminPageShell):
export default function AdminSomePage() {
  return (
    <AdminPageShell title="Some Page" subtitle="Description">
      {/* page content only */}
    </AdminPageShell>
  );
}
```

#### 4.1.1c AdminTabBar Pattern (Sprint 0+1+2)

Tabs con variantes `underline` y `cards`, accesible (ARIA):

```typescript
// Pattern: AdminTabBar con variantes

<AdminTabBar
  tabs={[
    { id: 'overview', label: 'Vista General' },
    { id: 'details', label: 'Detalles' },
    { id: 'settings', label: 'Configuración' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline" // o "cards"
/>
```

#### 4.1.2 Auto-Refresh Pattern

Para datos que requieren actualización frecuente:

```typescript
// Pattern: Auto-refresh con control manual

export function useAdminDashboard(customIntervals?: RefreshIntervals) {
  const [isPaused, setIsPaused] = useState(false);

  // Fetch functions
  const fetchHealth = useCallback(async () => {
    const data = await adminAPI.getSystemHealth();
    setHealth(data);
  }, []);

  // Auto-refresh intervals
  useEffect(() => {
    if (isPaused) return;

    const healthInterval = setInterval(fetchHealth, 10000);
    const metricsInterval = setInterval(fetchMetrics, 30000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, [isPaused, fetchHealth, fetchMetrics]);

  return {
    health,
    metrics,
    pauseRefresh: () => setIsPaused(true),
    resumeRefresh: () => setIsPaused(false),
    isPaused,
  };
}
```

#### 4.1.3 Bulk Operations Pattern

Para operaciones masivas con feedback de progreso:

```typescript
// Pattern: Bulk operations con progress tracking

export function useBulkOperations() {
  const [operation, setOperation] = useState<BulkOperation | null>(null);

  const { mutate: bulkSuspend } = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await adminAPI.bulkSuspendUsers({
        user_ids: userIds,
        reason: 'Admin bulk suspend',
      });

      // Poll operation status
      return pollOperationStatus(result.operation_id);
    },
    onSuccess: (operation) => {
      setOperation(operation);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  // Poll para status updates
  const pollOperationStatus = async (operationId: string) => {
    let status = await adminAPI.getBulkOperationStatus(operationId);

    while (status.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await adminAPI.getBulkOperationStatus(operationId);
    }

    return status;
  };

  return {
    bulkSuspend,
    bulkDelete,
    bulkUpdateRole,
    operation,
  };
}
```

#### 4.1.4 Modal Pattern

Modales para operaciones complejas:

```typescript
// Pattern: Modal con confirmación

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (userId: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === user.username;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2>Confirmar eliminación</h2>
        <p>Para eliminar al usuario {user.username}, escribe su nombre:</p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Nombre de usuario"
        />

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(user.id)}
            disabled={!canDelete}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### 4.2 Backend Patterns

#### 4.2.1 Guard-Based Authorization

```typescript
// Pattern: AdminGuard para proteger rutas

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)  // Requiere autenticación + rol admin
@ApiTags('Admin')
export class AdminUsersController {

  @Get('users')
  async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
    return this.adminUsersService.listUsers(query);
  }
}
```

#### 4.2.2 AdminGuard Implementation

```typescript
// guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Verificar rol admin o super_admin
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    if (!isAdmin) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}
```

#### 4.2.3 Service Layer with Pagination

```typescript
// Pattern: Service con paginación y filtros

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
  ) {}

  async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
    const { page = 1, limit = 20, role, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = query;

    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Aplicar filtros
    if (role) {
      qb.andWhere('role.name = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR profile.first_name ILIKE :search OR profile.last_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    qb.orderBy(`user.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

#### 4.2.4 Bulk Operations Pattern

```typescript
// Pattern: Operaciones masivas con tracking

@Injectable()
export class BulkOperationsService {
  constructor(
    @InjectRepository(BulkOperation, 'auth')
    private bulkOpRepo: Repository<BulkOperation>,
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
  ) {}

  async bulkSuspendUsers(dto: BulkSuspendUsersDto): Promise<BulkOperationStatusDto> {
    // Crear registro de operación
    const operation = this.bulkOpRepo.create({
      operation_type: 'suspend_users',
      target_count: dto.user_ids.length,
      status: 'in_progress',
      initiated_by: dto.admin_id,
    });
    await this.bulkOpRepo.save(operation);

    // Ejecutar operación en background
    this.executeBulkSuspend(operation.id, dto).catch(err => {
      this.logger.error(`Bulk suspend failed: ${err.message}`);
    });

    return {
      operation_id: operation.id,
      status: 'in_progress',
      total: dto.user_ids.length,
      completed: 0,
      failed: 0,
    };
  }

  private async executeBulkSuspend(operationId: string, dto: BulkSuspendUsersDto): Promise<void> {
    const operation = await this.bulkOpRepo.findOne({ where: { id: operationId } });
    let completed = 0;
    let failed = 0;

    for (const userId of dto.user_ids) {
      try {
        await this.userRepo.update(userId, { status: 'suspended' });
        completed++;
      } catch (error) {
        failed++;
      }

      // Actualizar progreso
      operation.completed_count = completed;
      operation.failed_count = failed;
      await this.bulkOpRepo.save(operation);
    }

    // Marcar como completado
    operation.status = 'completed';
    operation.completed_at = new Date();
    await this.bulkOpRepo.save(operation);
  }
}
```

#### 4.2.5 Audit Logging Pattern

```typescript
// Pattern: Audit logging automático

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private auditLogService: AuditLogService,
  ) {}

  async updateUser(userId: string, dto: UpdateUserDto, adminId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Guardar estado anterior para audit
    const previousState = { ...user };

    // Actualizar
    Object.assign(user, dto);
    await this.userRepo.save(user);

    // Log de auditoría
    await this.auditLogService.log({
      event_type: 'user_updated',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      changes: {
        before: previousState,
        after: user,
      },
      metadata: {
        updated_fields: Object.keys(dto),
      },
    });

    return user;
  }
}
```

---

## 5. Rutas y Navegación

### 5.1 Rutas Frontend

```typescript
// Estructura de rutas del portal admin
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },

      // Gestión
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'institutions', element: <AdminInstitutionsPage /> },
      { path: 'roles', element: <AdminRolesPage /> },

      // Contenido
      { path: 'content', element: <AdminContentPage /> },
      { path: 'classroom-teacher', element: <AdminClassroomTeacherPage /> },

      // Configuración
      { path: 'gamification', element: <AdminGamificationPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'advanced', element: <AdminAdvancedPage /> },

      // Monitoreo
      { path: 'monitoring', element: <AdminMonitoringPage /> },
      { path: 'alerts', element: <AdminAlertsPage /> },

      // Analytics
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'progress', element: <AdminProgressPage /> },
    ],
  },
];
```

### 5.2 Navegación Lateral

```typescript
// Sidebar navigation items
const navigationItems = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard />,
    path: '/admin/dashboard',
  },
  {
    label: 'Gestión',
    icon: <Users />,
    children: [
      { label: 'Usuarios', path: '/admin/users' },
      { label: 'Instituciones', path: '/admin/institutions' },
      { label: 'Roles', path: '/admin/roles' },
    ],
  },
  {
    label: 'Contenido',
    icon: <BookOpen />,
    children: [
      { label: 'Moderación', path: '/admin/content' },
      { label: 'Asignación Aulas', path: '/admin/classroom-teacher' },
    ],
  },
  {
    label: 'Configuración',
    icon: <Settings />,
    children: [
      { label: 'Gamificación', path: '/admin/gamification' },
      { label: 'Sistema', path: '/admin/settings' },
      { label: 'Avanzado', path: '/admin/advanced' },
    ],
  },
  {
    label: 'Monitoreo',
    icon: <Activity />,
    children: [
      { label: 'Sistema', path: '/admin/monitoring' },
      { label: 'Alertas', path: '/admin/alerts' },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChart />,
    children: [
      { label: 'Estadísticas', path: '/admin/analytics' },
      { label: 'Reportes', path: '/admin/reports' },
      { label: 'Progreso', path: '/admin/progress' },
    ],
  },
];
```

---

## 6. APIs del Portal Admin

### 6.1 Tabla Resumen de Endpoints

| Categoría | Método | Endpoint | Descripción | Guard |
|-----------|--------|----------|-------------|-------|
| **Dashboard** | GET | `/admin/dashboard` | Dashboard completo | AdminGuard |
| | GET | `/admin/dashboard/stats` | Estadísticas | AdminGuard |
| | GET | `/admin/dashboard/recent-activity` | Actividad reciente | AdminGuard |
| | GET | `/admin/dashboard/actions/recent` | Acciones de admins | AdminGuard |
| | GET | `/admin/dashboard/alerts` | Alertas | AdminGuard |
| **Users** | GET | `/admin/users` | Lista de usuarios | AdminGuard |
| | GET | `/admin/users/stats` | Estadísticas usuarios | AdminGuard |
| | GET | `/admin/users/:id` | Detalles usuario | AdminGuard |
| | PUT | `/admin/users/:id` | Actualizar usuario | AdminGuard |
| | DELETE | `/admin/users/:id` | Eliminar usuario | AdminGuard |
| | POST | `/admin/users/:id/suspend` | Suspender usuario | AdminGuard |
| | POST | `/admin/users/:id/activate` | Activar usuario | AdminGuard |
| | POST | `/admin/users/bulk/suspend` | Suspender múltiples | AdminGuard |
| | POST | `/admin/users/bulk/delete` | Eliminar múltiples | AdminGuard |
| **Organizations** | GET | `/admin/organizations` | Lista organizaciones | AdminGuard |
| | POST | `/admin/organizations` | Crear organización | AdminGuard |
| | GET | `/admin/organizations/:id` | Detalles organización | AdminGuard |
| | PUT | `/admin/organizations/:id` | Actualizar organización | AdminGuard |
| | PATCH | `/admin/organizations/:id/subscription` | Actualizar suscripción | AdminGuard |
| **Roles** | GET | `/admin/roles` | Lista de roles | AdminGuard |
| | GET | `/admin/roles/:id/permissions` | Permisos del rol | AdminGuard |
| | PATCH | `/admin/roles/:id/permissions` | Actualizar permisos | AdminGuard |
| **Content** | GET | `/admin/content` | Lista contenido | AdminGuard |
| | GET | `/admin/content/pending` | Pendiente moderación | AdminGuard |
| | POST | `/admin/content/:id/approve` | Aprobar contenido | AdminGuard |
| | POST | `/admin/content/:id/reject` | Rechazar contenido | AdminGuard |
| **Gamification** | GET | `/admin/gamification/settings` | Config gamificación | AdminGuard |
| | PATCH | `/admin/gamification/settings` | Actualizar config | AdminGuard |
| | GET | `/admin/gamification/parameters` | Parámetros | AdminGuard |
| | PATCH | `/admin/gamification/parameters/:id` | Actualizar parámetro | AdminGuard |
| **System** | GET | `/admin/system/config` | Config sistema | AdminGuard |
| | PATCH | `/admin/system/config` | Actualizar config | AdminGuard |
| | GET | `/admin/system/health` | Salud del sistema | AdminGuard |
| | POST | `/admin/system/maintenance/toggle` | Toggle mantenimiento | AdminGuard |
| **Monitoring** | GET | `/admin/monitoring/health` | Health check | AdminGuard |
| | GET | `/admin/monitoring/metrics` | Métricas actuales | AdminGuard |
| | GET | `/admin/monitoring/errors/recent` | Errores recientes | AdminGuard |
| **Alerts** | GET | `/admin/alerts` | Lista alertas | AdminGuard |
| | POST | `/admin/alerts` | Crear alerta | AdminGuard |
| | PATCH | `/admin/alerts/:id/acknowledge` | Acknowledge | AdminGuard |
| | PATCH | `/admin/alerts/:id/resolve` | Resolver | AdminGuard |
| **Analytics** | GET | `/admin/analytics/overview` | Overview | AdminGuard |
| | GET | `/admin/analytics/engagement` | Engagement | AdminGuard |
| | GET | `/admin/analytics/retention` | Retention | AdminGuard |
| | POST | `/admin/analytics/export` | Exportar datos | AdminGuard |
| **Reports** | GET | `/admin/reports` | Lista reportes | AdminGuard |
| | POST | `/admin/reports/generate` | Generar reporte | AdminGuard |
| **Progress** | GET | `/admin/progress/overview` | Overview progreso | AdminGuard |
| | GET | `/admin/progress/students` | Progreso estudiantes | AdminGuard |
| | GET | `/admin/progress/export` | Exportar progreso | AdminGuard |
| **Classroom** | GET | `/admin/classroom-assignments` | Lista asignaciones | AdminGuard |
| | POST | `/admin/classroom-assignments/assign` | Asignar | AdminGuard |
| | POST | `/admin/classroom-assignments/bulk-assign` | Bulk assign | AdminGuard |
| **Logs** | GET | `/admin/logs` | Audit logs | AdminGuard |

### 6.2 Frontend API Services

Las API services del admin portal están en `apps/frontend/src/services/api/`:

```
services/api/
├── adminAPI.ts                     # Main admin API (dashboard, users, organizations, roles, system, monitoring, alerts, analytics, reports, progress, content, bulk operations)
├── apiClient.ts                    # Axios client configurado
└── profileAPI.ts                   # Profile management (shared)
```

**Nota:** A diferencia del diagrama original que mostraba 14 archivos separados (`adminUsersAPI.ts`, `adminOrganizationsAPI.ts`, etc.), el admin portal usa un **único archivo `adminAPI.ts`** que exporta todas las funciones organizadas por dominio. Esto simplifica imports y mantiene coherencia con el patrón monolítico del frontend.

Los hooks en `apps/admin/hooks/` consumen directamente las funciones de `adminAPI.ts`:

```typescript
// Ejemplo: useAdminDashboard.ts
import { adminAPI } from '@/services/api/adminAPI';

export function useAdminDashboard() {
  // Consume adminAPI.getDashboard(), adminAPI.getSystemHealth(), etc.
}
```

---

## 7. Estado y Stores

### 7.1 Zustand Stores (Opcional)

El portal admin usa principalmente React Query para state management, pero puede usar Zustand para estado global:

```typescript
// stores/adminStore.ts
interface AdminState {
  // Global admin state
  selectedOrganization: Organization | null;
  maintenanceMode: boolean;

  // Actions
  setSelectedOrganization: (org: Organization | null) => void;
  setMaintenanceMode: (mode: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedOrganization: null,
  maintenanceMode: false,

  setSelectedOrganization: (org) => set({ selectedOrganization: org }),
  setMaintenanceMode: (mode) => set({ maintenanceMode: mode }),
}));
```

### 7.2 React Query Cache

```typescript
// Configuración de React Query para admin
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Query keys structure
const adminQueryKeys = {
  all: ['admin'] as const,

  dashboard: () => [...adminQueryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...adminQueryKeys.dashboard(), 'stats'] as const,

  users: () => [...adminQueryKeys.all, 'users'] as const,
  usersList: (filters: UserFilters) => [...adminQueryKeys.users(), 'list', filters] as const,
  usersStats: () => [...adminQueryKeys.users(), 'stats'] as const,

  organizations: () => [...adminQueryKeys.all, 'organizations'] as const,
  organizationsList: () => [...adminQueryKeys.organizations(), 'list'] as const,

  monitoring: () => [...adminQueryKeys.all, 'monitoring'] as const,
  monitoringHealth: () => [...adminQueryKeys.monitoring(), 'health'] as const,
  monitoringMetrics: () => [...adminQueryKeys.monitoring(), 'metrics'] as const,
};
```

---

## 8. Seguridad

### 8.1 Autorización

1. **JwtAuthGuard:** Verifica token JWT válido
2. **AdminGuard:** Verifica rol admin/super_admin

### 8.2 Reglas de Acceso

```yaml
Admin puede:
  - Ver todos los usuarios del sistema
  - Crear/editar/eliminar usuarios
  - Suspender/reactivar usuarios
  - Gestionar organizaciones
  - Moderar contenido
  - Configurar gamificación
  - Ver audit logs completos
  - Ejecutar bulk operations
  - Configurar sistema
  - Ver todas las métricas

Admin NO puede:
  - Modificar datos de super_admin (solo super_admin puede)
  - Eliminar su propia cuenta
  - Desactivar modo mantenimiento si no lo activó
```

### 8.3 Audit Logging

Todas las acciones de admin se registran:

```typescript
// Eventos auditados
const AUDIT_EVENTS = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_SUSPENDED: 'user_suspended',
  ORG_CREATED: 'organization_created',
  ORG_UPDATED: 'organization_updated',
  CONTENT_APPROVED: 'content_approved',
  CONTENT_REJECTED: 'content_rejected',
  CONFIG_UPDATED: 'config_updated',
  MAINTENANCE_TOGGLED: 'maintenance_toggled',
  BULK_OPERATION: 'bulk_operation',
};
```

### 8.4 Rate Limiting

Endpoints de admin tienen rate limiting más permisivo:

```typescript
// Rate limits por rol
const RATE_LIMITS = {
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 1000,         // 1000 requests
  },
  default: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};
```

---

## 9. Flujos Principales

### 9.1 Flujo: Crear Usuario

```
1. Admin navega a /admin/users
2. Click en "Nuevo Usuario"
3. Modal de creación se abre
4. Admin completa form:
   - Username
   - Email
   - Password
   - Role
   - Profile info
5. Submit → POST /admin/users
6. Backend valida datos
7. Backend crea usuario en DB
8. Backend registra audit log
9. Backend retorna usuario creado
10. Frontend actualiza lista (invalidate query)
11. Modal se cierra
12. Toast de éxito
```

### 9.2 Flujo: Suspender Usuario

```
1. Admin ve lista de usuarios
2. Selecciona usuario problemático
3. Click "Suspender"
4. Modal de confirmación:
   - Razón (requerido)
   - Duración (opcional)
5. Confirm → POST /admin/users/:id/suspend
6. Backend suspende usuario
7. Backend registra audit log
8. Backend envía notificación al usuario
9. Frontend actualiza UI
10. Toast de confirmación
```

### 9.3 Flujo: Aprobar Contenido

```
1. Admin navega a /admin/content
2. Ve lista de contenido pendiente
3. Click en item para ver detalles
4. Revisa contenido:
   - Preview del ejercicio
   - Metadata
   - Author
5. Decisión:
   a) Aprobar → POST /admin/content/:id/approve
      - Contenido pasa a published
      - Creator recibe notificación
   b) Rechazar → POST /admin/content/:id/reject
      - Modal para razón
      - Contenido pasa a rejected
      - Creator recibe notificación con feedback
6. Frontend actualiza cola de moderación
```

### 9.4 Flujo: Configurar Gamificación

```
1. Admin navega a /admin/gamification
2. Ve config actual de parámetros
3. Modifica valores:
   - ML Coins por ejercicio
   - XP por logro
   - Costos de comodines
4. Click "Preview Impact"
   → POST /admin/gamification/preview-impact
   - Backend simula impacto en usuarios
   - Muestra estadísticas proyectadas
5. Admin revisa preview
6. Confirm → PATCH /admin/gamification/settings
7. Backend actualiza config
8. Backend registra audit log
9. Config nueva aplica a partir de ahora
10. Toast de éxito con resumen de cambios
```

### 9.5 Flujo: Operación Masiva (Bulk Suspend)

```
1. Admin selecciona múltiples usuarios (checkboxes)
2. Click "Suspender seleccionados"
3. Modal de confirmación:
   - Lista de usuarios
   - Razón global
   - Duración
4. Confirm → POST /admin/users/bulk/suspend
5. Backend:
   - Crea BulkOperation record
   - Retorna operation_id inmediatamente
   - Ejecuta suspensión en background
6. Frontend:
   - Muestra progress modal
   - Poll GET /admin/users/bulk/:operationId cada 2s
7. Backend actualiza progreso:
   - completed_count incrementa
   - failed_count si hay errores
8. Al completar:
   - Frontend muestra resumen
   - Invalidate users query
   - Cierra modal después de 3s
```

### 9.6 Flujo: Modo Mantenimiento

```
1. Admin navega a /admin/settings
2. Toggle "Maintenance Mode"
3. Modal de confirmación:
   - Mensaje personalizado para usuarios
   - Duración estimada
4. Confirm → POST /admin/system/maintenance/toggle
5. Backend:
   - Actualiza system_settings
   - Broadcast WebSocket a todos los usuarios
6. Frontend (todos los portales):
   - Reciben notificación
   - Muestran banner de mantenimiento
   - Bloquean acciones críticas
7. Admin puede seguir usando el portal
8. Para desactivar:
   - Admin toggle OFF
   - Backend notifica a todos
   - Sistema vuelve a normal
```

---

## 10. Testing

### 10.1 Tests Unitarios Backend

```typescript
// admin-users.controller.spec.ts
describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: AdminUsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        { provide: AdminUsersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(AdminUsersController);
    service = module.get(AdminUsersService);
  });

  it('should list users with pagination', async () => {
    const query: ListUsersDto = { page: 1, limit: 20 };
    mockService.listUsers.mockResolvedValue(mockPaginatedUsers);

    const result = await controller.listUsers(query);

    expect(result.data).toHaveLength(20);
    expect(result.meta.total).toBe(100);
    expect(mockService.listUsers).toHaveBeenCalledWith(query);
  });

  it('should suspend user', async () => {
    const userId = 'user-123';
    const dto: SuspendUserDto = { reason: 'Violation', duration_days: 7 };

    await controller.suspendUser(userId, dto);

    expect(mockService.suspendUser).toHaveBeenCalledWith(userId, dto);
  });
});
```

### 10.2 Tests Frontend

```typescript
// useUserManagement.test.ts
describe('useUserManagement', () => {
  it('should fetch users list', async () => {
    const { result } = renderHook(() => useUserManagement(), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toBeDefined();
    expect(result.current.users.length).toBeGreaterThan(0);
  });

  it('should suspend user', async () => {
    const { result } = renderHook(() => useUserManagement(), {
      wrapper: QueryClientProvider,
    });

    await act(async () => {
      await result.current.suspendUser('user-123', {
        reason: 'Test suspension',
      });
    });

    await waitFor(() => {
      expect(mockAPI.suspendUser).toHaveBeenCalled();
    });
  });
});
```

### 10.3 E2E Tests

```typescript
// admin-users.e2e.spec.ts
describe('Admin Users Management (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/admin/users (GET) - should require admin role', () => {
    return request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  it('/admin/users (GET) - should return users for admin', () => {
    return request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.meta).toBeDefined();
      });
  });
});
```

---

## 11. Buenas Prácticas

### 11.1 Frontend

```typescript
// DO: Hooks específicos por funcionalidad
export function useUserManagement() { ... }
export function useOrganizations() { ... }
export function useBulkOperations() { ... }

// DON'T: Un hook gigante
export function useAdmin() { ... } // Evitar

// DO: Query keys jerárquicas y descriptivas
const queryKey = ['admin', 'users', 'list', { role: 'teacher', page: 1 }];

// DO: Invalidar queries relacionadas
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
  },
});

// DO: Error boundaries para secciones críticas
<ErrorBoundary fallback={<ErrorDisplay />}>
  <AdminUsersPage />
</ErrorBoundary>
```

### 11.2 Backend

```typescript
// DO: DTOs con validación completa
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password!: string;
}

// DO: Logging completo en servicios admin
@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  async suspendUser(userId: string, dto: SuspendUserDto): Promise<void> {
    this.logger.log(`Suspending user ${userId}: ${dto.reason}`);

    try {
      await this.userRepo.update(userId, { status: 'suspended' });
      await this.auditLogService.log({ ... });
    } catch (error) {
      this.logger.error(`Failed to suspend user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to suspend user');
    }
  }
}

// DO: Transacciones para operaciones críticas
async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
  return this.dataSource.transaction(async (manager) => {
    const org = await manager.save(Organization, dto);
    await manager.save(Tenant, { organization_id: org.id });
    await manager.save(FeatureFlag, { tenant_id: tenant.id });
    return org;
  });
}
```

---

## 12. Troubleshooting

### 12.1 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| 403 Forbidden | AdminGuard rechaza | Verificar rol del usuario (admin/super_admin) |
| Bulk operation timeout | Operación muy larga | Usar background jobs, no esperar respuesta |
| Dashboard lento | Queries N+1 | Usar eager loading en TypeORM |
| Métricas desactualizadas | Cache | Invalidar cache manualmente o reducir TTL |
| Audit logs faltantes | Error en middleware | Verificar AuditLogInterceptor está aplicado |

### 12.2 Debugging

```typescript
// Habilitar logs verbose en development
if (process.env.NODE_ENV === 'development') {
  // Frontend
  apiClient.interceptors.request.use((config) => {
    console.log(`[Admin API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  // Backend
  @Injectable()
  export class AdminUsersService {
    async listUsers(query: ListUsersDto) {
      this.logger.debug(`ListUsers called with:`, query);
      const result = await this.userRepo.find(...);
      this.logger.debug(`Returned ${result.length} users`);
      return result;
    }
  }
}
```

---

## 13. Checklist de Desarrollo

### 13.1 Nueva Funcionalidad Admin

- [ ] Definir tipos en `admin/types/index.ts`
- [ ] Crear DTOs en backend `admin/dto/`
- [ ] Implementar service en `admin/services/`
- [ ] Crear/modificar controller
- [ ] Aplicar AdminGuard a endpoints
- [ ] Agregar audit logging
- [ ] Crear API service en frontend
- [ ] Implementar hook en `admin/hooks/`
- [ ] Crear componentes necesarios
- [ ] Integrar en página correspondiente
- [ ] Agregar tests unitarios
- [ ] Documentar en Swagger
- [ ] Actualizar esta guía

### 13.2 Code Review Admin

- [ ] AdminGuard aplicado correctamente
- [ ] Validación de DTOs completa
- [ ] Error handling implementado
- [ ] Audit logging presente
- [ ] Logs apropiados en services
- [ ] Types alineados frontend/backend
- [ ] Query keys descriptivas
- [ ] Invalidación de cache correcta
- [ ] Permisos verificados
- [ ] Tests passing

---

## 14. Referencias

### Documentos Complementarios

| Documento | Descripción |
|-----------|-------------|
| [PORTAL-TEACHER-GUIDE.md](../teacher/PORTAL-TEACHER-GUIDE.md) | Guía del portal Teacher (estructura similar) |
| [COMPONENT-PATTERNS.md](../../50-guides/frontend/impl/COMPONENT-PATTERNS.md) | Patrones de componentes |
| [HOOK-PATTERNS.md](../../50-guides/frontend/impl/HOOK-PATTERNS.md) | Patrones de hooks |
| [DTO-CONVENTIONS.md](../../50-guides/backend/impl/DTO-CONVENTIONS.md) | Convenciones de DTOs |
| [ESTRUCTURA-MODULOS.md](../../50-guides/backend/impl/ESTRUCTURA-MODULOS.md) | Estructura de módulos |
| [40-api/README.md](../../40-api/README.md) | Estándares de rutas API |

### ADRs Relevantes

- ADR-001: Separación de portales (student/teacher/admin)
- ADR-002: Uso de AdminGuard para autorización
- ADR-003: Bulk operations con background jobs
- ADR-004: Audit logging obligatorio para acciones admin

---

## 15. Ejemplos de Código Completos

### 15.1 Page Pattern — AdminPageShell (canonical)

```typescript
// Pattern canónico para páginas admin (Sprint 0+1+2)
// Todas las 19 páginas siguen esta estructura

import AdminPageShell from '../components/shared/AdminPageShell';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { DashboardStatsGrid } from '../components/dashboard/DashboardStatsGrid';
import { SystemHealthCard } from '../components/dashboard/SystemHealthCard';
import { AlertsNotificationsCard } from '../components/dashboard/AlertsNotificationsCard';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';

export default function AdminDashboardPage() {
  const {
    stats,
    health,
    alerts,
    recentActions,
    loading,
    handleRefresh,
  } = useAdminDashboard();

  return (
    <AdminPageShell
      title="Dashboard"
      subtitle="Vista general del sistema"
      actions={
        <button onClick={handleRefresh} className="...">
          Actualizar
        </button>
      }
    >
      <DashboardStatsGrid stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard health={health} loading={loading} />
        <AlertsNotificationsCard
          alerts={alerts}
          recentActions={recentActions}
          loading={loading}
        />
      </div>

      <DashboardQuickActions />
    </AdminPageShell>
  );
}
```

**Beneficios del patrón AdminPageShell:**
- Elimina 15-35 líneas de boilerplate por página (useAuth, gamification, logout)
- Header consistente con título, subtítulo y acciones
- Integración automática con AdminLayout
- 19/19 páginas migradas (100% adopción)

### 15.2 Service Backend Completo - AdminUsersService

```typescript
// services/admin-users.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/auth/entities/user.entity';
import { AuditLogService } from '@modules/audit/audit-log.service';
import {
  ListUsersDto,
  UpdateUserDto,
  SuspendUserDto,
  PaginatedUsersDto,
  UserStatsDto,
} from '../dto/users';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(User, 'auth')
    private userRepo: Repository<User>,
    private auditLogService: AuditLogService,
  ) {}

  async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = query;

    this.logger.debug(`Listing users: page=${page}, limit=${limit}, role=${role}, status=${status}`);

    const qb = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Filtros
    if (role) {
      qb.andWhere('role.name = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR profile.first_name ILIKE :search OR profile.last_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    qb.orderBy(`user.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    this.logger.debug(`Found ${total} users, returning page ${page}`);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['profile', 'roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    adminId: string
  ): Promise<User> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} updating user ${userId}`);

    // Guardar estado anterior
    const previousState = { ...user };

    // Actualizar
    Object.assign(user, dto);
    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_updated',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      changes: {
        before: previousState,
        after: user,
      },
      metadata: {
        updated_fields: Object.keys(dto),
      },
    });

    return user;
  }

  async deleteUser(userId: string, adminId: string): Promise<void> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} deleting user ${userId}`);

    // Soft delete
    user.deleted_at = new Date();
    user.status = 'deleted';
    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_deleted',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
    });
  }

  async suspendUser(
    userId: string,
    dto: SuspendUserDto,
    adminId: string
  ): Promise<void> {
    const user = await this.getUserDetails(userId);

    this.logger.log(`Admin ${adminId} suspending user ${userId}: ${dto.reason}`);

    user.status = 'suspended';
    user.suspended_at = new Date();
    user.suspension_reason = dto.reason;

    if (dto.duration_days) {
      const until = new Date();
      until.setDate(until.getDate() + dto.duration_days);
      user.suspended_until = until;
    }

    await this.userRepo.save(user);

    // Audit log
    await this.auditLogService.log({
      event_type: 'user_suspended',
      actor_id: adminId,
      target_id: userId,
      target_type: 'user',
      metadata: {
        reason: dto.reason,
        duration_days: dto.duration_days,
      },
    });
  }

  async getUserStats(): Promise<UserStatsDto> {
    const total = await this.userRepo.count();
    const active = await this.userRepo.count({ where: { status: 'active' } });
    const suspended = await this.userRepo.count({ where: { status: 'suspended' } });

    // Roles breakdown
    const roleBreakdown = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'userRoles')
      .leftJoin('userRoles.role', 'role')
      .select('role.name', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('role.name')
      .getRawMany();

    return {
      total_users: total,
      active_users: active,
      suspended_users: suspended,
      inactive_users: total - active - suspended,
      role_breakdown: roleBreakdown,
    };
  }
}
```

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | 2026-02-18 | Actualización mayor: Sprint 0+1+2 Admin Portal Refactor. Sección 2.1 reestructurada (14→19 pages, +30 componentes, +12 hooks, nueva estructura shared/notifications/). Sección 4.1 +AdminPageShell y AdminTabBar patterns. Sección 6.2 corregida (API monolítica real vs paths fantasma). Sección 15.1 actualizada con patrón canónico AdminPageShell. |
| 1.0.0 | 2025-11-29 | Creación inicial completa |

---

**Fin del documento - PORTAL-ADMIN-GUIDE.md**
