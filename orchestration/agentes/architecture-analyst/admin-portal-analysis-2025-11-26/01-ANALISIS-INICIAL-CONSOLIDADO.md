# ANÁLISIS INICIAL CONSOLIDADO - PORTAL ADMIN

**Fecha:** 2025-11-26
**Analista:** Architecture-Analyst
**Tarea:** Diagnóstico de carga de datos en páginas del portal Admin
**Estado:** FASE 1 - ANÁLISIS

---

## RESUMEN EJECUTIVO

### Problema Reportado
- Las páginas del portal admin no muestran datos
- Los hooks no se ejecutan al cargar
- No hay carga inicial de datos ni funcionalidad de búsqueda

### Hallazgo Principal
Tras análisis de código, **la mayoría de hooks y páginas SÍ tienen configurada la carga inicial correctamente** mediante `useEffect`. El problema probablemente está en:
1. Backend no implementado o retornando errores
2. Errores de autenticación/autorización
3. Transformación incorrecta de datos
4. Endpoints no conectados

---

## INVENTARIO DE PÁGINAS DEL PORTAL ADMIN

### Páginas Identificadas (14 total)

| # | Página | Ruta | Hook Principal | useEffect Inicial | Estado |
|---|--------|------|----------------|-------------------|--------|
| 1 | AdminDashboardPage | /admin/dashboard | useAdminDashboard | ✅ línea 63 | MVP Completado |
| 2 | AdminUsersPage | /admin/users | useUserManagement | ✅ línea 78 | MVP Completado |
| 3 | AdminInstitutionsPage | /admin/institutions | useOrganizations | ✅ (en hook) | MVP Completado |
| 4 | AdminRolesPage | /admin/roles | useRoles | ✅ (en hook) | MVP Integrado |
| 5 | AdminContentPage | /admin/content | useContentManagement | ✅ (en hook) | MVP Completado |
| 6 | AdminGamificationPage | /admin/gamification | useGamificationConfig | ⚠️ React Query | MVP Completado |
| 7 | AdminMonitoringPage | /admin/monitoring | useMonitoring | ✅ (en hook) | Completo |
| 8 | AdminReportsPage | /admin/reports | useReports | ✅ (en hook) | MVP (memoria) |
| 9 | AdminSettingsPage | /admin/settings | useSettings/useSystemConfig | ⚠️ SHOW_CONTENT=false | Under Construction |
| 10 | AdminAlertsPage | /admin/alerts | useAlerts | ✅ (en hook) | Integrado |
| 11 | AdminAnalyticsPage | /admin/analytics | useAnalytics | ✅ (en hook) | MVP Completado |
| 12 | AdminProgressPage | /admin/progress | useProgress | ✅ línea 84 | MVP Completado |
| 13 | AdminAdvancedPage | /admin/advanced | - | ⚠️ SHOW_CONTENT=false | Under Construction |
| 14 | AdminClassroomTeacherPage | /admin/classroom-teachers | useClassroomTeacher | ⚠️ React Query | MVP Completado |

### Páginas con Flag SHOW_CONTENT=false
- **AdminSettingsPage** - Muestra "Under Construction"
- **AdminAdvancedPage** - Muestra "Under Construction"

---

## INVENTARIO DE HOOKS DEL PORTAL ADMIN

### Hooks con Carga Inicial Automática (useEffect)

| Hook | Archivo | useEffect | Función de Carga |
|------|---------|-----------|------------------|
| useAdminDashboard | useAdminDashboard.ts | ✅ línea 388 | refreshAll() |
| useAlerts | useAlerts.ts | ✅ líneas 253, 258 | fetchAlerts(), fetchStats() |
| useAnalytics | useAnalytics.ts | ✅ línea 204 | fetchAll() |
| useAuditLogs | useAuditLogs.ts | ⚠️ línea 116 | condicional a autoFetch |
| useContentManagement | useContentManagement.ts | ✅ múltiples | fetchPendingExercises(), fetchMedia(), etc. |
| useMonitoring | useMonitoring.ts | ✅ implícito | fetchAll() |
| useOrganizations | useOrganizations.ts | ✅ línea 462 | fetchOrganizations() |
| useProgress | useProgress.ts | ⚠️ No tiene | Requiere llamada explícita |
| useReports | useReports.ts | ✅ línea 206 | fetchReports() |
| useRoles | useRoles.ts | ✅ línea 167 | refetch() |
| useSystemMetrics | useSystemMetrics.ts | ✅ línea 58 | fetchMetrics() |
| useSystemMonitoring | useSystemMonitoring.ts | ✅ líneas 237, 253 | init(), startMonitoring() |
| useUserManagement | useUserManagement.ts | ❌ No tiene | Requiere llamada desde página |

### Hooks con React Query (Carga Automática)

| Hook | Patrón | Queries |
|------|--------|---------|
| useGamificationConfig | React Query | useParameters, useMayaRanks, useStats |
| useClassroomTeacher | React Query | useClassroomTeachers, useTeacherClassrooms |

---

## ANÁLISIS DE ENDPOINTS API

### Frontend → Backend (95+ endpoints identificados)

**Estructura de archivos API:**
```
apps/frontend/src/services/api/
├── adminAPI.ts                    # 1,725 líneas - Archivo principal
├── adminTypes.ts                  # Tipos TypeScript
├── admin/
│   ├── achievementsApi.ts         # Logros
│   ├── classroomTeacherApi.ts     # Asignaciones
│   └── gamificationConfigApi.ts   # Configuración gamificación
└── schemas/
    └── adminSchemas.ts            # Validación
```

**Endpoints por Módulo:**

| Módulo | GET | POST | PUT/PATCH | DELETE | Total |
|--------|-----|------|-----------|--------|-------|
| Dashboard | 5 | 0 | 0 | 0 | 5 |
| Organizations | 2 | 1 | 2 | 1 | 6 |
| Users | 2 | 5 | 1 | 1 | 9 |
| Roles | 3 | 0 | 1 | 0 | 4 |
| Content | 4 | 2 | 0 | 1 | 7 |
| Gamification | 8 | 3 | 2 | 0 | 13 |
| Monitoring | 5 | 0 | 0 | 0 | 5 |
| Reports | 2 | 2 | 0 | 1 | 5 |
| Alerts | 3 | 1 | 3 | 0 | 7 |
| Analytics | 6 | 0 | 0 | 0 | 6 |
| Progress | 5 | 0 | 0 | 0 | 5 |
| System | 8 | 5 | 2 | 0 | 15 |

---

## ANÁLISIS DE BACKEND

### Controladores Identificados (17 total)

```
apps/backend/src/modules/admin/controllers/
├── admin-dashboard.controller.ts      # 11 endpoints
├── admin-users.controller.ts          # 13 endpoints
├── admin-organizations.controller.ts  # 9 endpoints
├── admin-content.controller.ts        # 10 endpoints
├── admin-gamification-config.controller.ts # 9 endpoints
├── admin-progress.controller.ts       # 7 endpoints
├── admin-alerts.controller.ts         # 7 endpoints
├── admin-analytics.controller.ts      # 7 endpoints
├── admin-reports.controller.ts        # 4 endpoints
├── admin-interventions.controller.ts  # 5 endpoints
├── admin-monitoring.controller.ts     # 5 endpoints
├── admin-system.controller.ts         # 13 endpoints
├── admin-roles.controller.ts          # 4 endpoints
├── admin-bulk-operations.controller.ts # 6 endpoints
├── classroom-assignments.controller.ts # 7 endpoints
└── classroom-teachers-rest.controller.ts # 9 endpoints
```

**Total:** 108 endpoints en backend

---

## ANÁLISIS DE BASE DE DATOS

### Esquema admin_dashboard

**Vistas Materializadas:**
- `system_overview_mv` - Resumen ejecutivo del sistema
- `user_analytics_mv` - Analytics por usuario
- `classroom_summary_mv` - Resumen de aulas

**Vistas Regulares:**
- `user_stats_summary` - Estadísticas de usuarios
- `organization_stats_summary` - Estadísticas de organizaciones
- `classroom_overview` - Vista de aulas
- `moderation_queue` - Cola de moderación
- `recent_admin_actions` - Acciones administrativas
- `recent_activity` - Actividad reciente
- `assignment_submission_stats` - Estadísticas de entregas

**Tablas:**
- `bulk_operations` - Operaciones masivas

### Tablas Fuente Principales
- `auth_management.tenants` - Organizaciones
- `auth_management.profiles` - Perfiles de usuario
- `auth_management.user_roles` - Roles
- `social_features.classrooms` - Aulas
- `social_features.classroom_members` - Miembros
- `gamification_system.user_stats` - Estadísticas gamificación
- `audit_logging.audit_logs` - Logs de auditoría

---

## HALLAZGOS ESPECÍFICOS POR PÁGINA

### 1. AdminDashboardPage
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`

**Carga Inicial:** ✅ Configurada correctamente
```typescript
useEffect(() => {
  refreshAll();
}, [refreshAll]);
```

**APIs Utilizadas:**
- `adminAPI.getSystemHealth()`
- `adminAPI.getSystemMetrics()`
- `adminAPI.getRecentActions()`
- `adminAPI.getAlerts()`
- `adminAPI.getUserActivity()`

**Posibles Problemas:**
- Transformación de datos snake_case → camelCase
- Campos faltantes en respuesta del backend

---

### 2. AdminUsersPage
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`

**Carga Inicial:** ✅ Configurada correctamente
```typescript
useEffect(() => {
  fetchUsers();
}, [fetchUsers]);
```

**APIs Utilizadas:**
- `adminAPI.getUsers()`
- `adminAPI.suspendUser()`
- `adminAPI.updateUser()`
- `adminAPI.deleteUser()`

**Posibles Problemas:**
- Mapeo de campos: `user.name` → `full_name`
- El hook NO tiene useEffect interno (depende de la página)

---

### 3. AdminInstitutionsPage
**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

**Carga Inicial:** ✅ En el hook (useOrganizations línea 462)

**APIs Utilizadas:**
- `adminAPI.getOrganizations()`
- `adminAPI.createOrganization()`
- `adminAPI.updateOrganization()`
- `adminAPI.deleteOrganization()`
- `adminAPI.updateOrganizationFeatures()`

**Posibles Problemas:**
- Mapeo de campos: `tier` → `plan`, `users` → `userCount`
- Validación de features array (BUG-ADMIN-007)

---

### 4. AdminRolesPage
**Carga Inicial:** ✅ En el hook (useRoles línea 167)

**APIs Utilizadas:**
- `adminAPI.getRoles()`
- `adminAPI.getRolePermissions()`
- `adminAPI.updateRolePermissions()`
- `adminAPI.getAvailablePermissions()`

---

### 5-14. Otras Páginas
Ver análisis detallado en reportes individuales (pendiente de generar).

---

## CONCLUSIONES PRELIMINARES

### Código Frontend
✅ La mayoría de hooks tienen `useEffect` para carga inicial
✅ Las páginas llaman a los hooks correctamente
⚠️ Algunas dependencias en `useCallback` pueden causar problemas
⚠️ Mapeo de campos entre API y tipos locales puede tener inconsistencias

### Posibles Causas del Problema
1. **Backend no retorna datos** - Verificar endpoints del backend
2. **Errores de autenticación** - Token JWT inválido o expirado
3. **Errores silenciados** - Catch blocks que no muestran error al usuario
4. **Transformación incorrecta** - Datos llegan pero no se mapean bien
5. **RLS (Row Level Security)** - Políticas de DB bloqueando acceso

---

## PRÓXIMOS PASOS

### FASE 2: ANÁLISIS DETALLADO POR PÁGINA
Para cada página con problemas:
1. Verificar endpoint del backend funciona (curl/Postman)
2. Revisar logs de errores en consola del navegador
3. Verificar transformación de datos
4. Validar permisos y autenticación

### FASE 3: PLANEACIÓN DE CORRECCIONES
Crear plan de implementación con:
- Tareas específicas por página
- Agentes a orquestar (DB, Backend, Frontend)
- Orden de ejecución

### FASE 4: EJECUCIÓN
Orquestar agentes especializados para implementar correcciones.

---

## ARCHIVOS RELACIONADOS

- `apps/frontend/src/apps/admin/pages/` - 14 páginas
- `apps/frontend/src/apps/admin/hooks/` - 19 hooks
- `apps/frontend/src/services/api/adminAPI.ts` - API central
- `apps/backend/src/modules/admin/` - Módulo backend
- `apps/database/ddl/schemas/admin_dashboard/` - Schema DB

---

**Próximo Entregable:** Reporte detallado por página con análisis de flujo completo DB→Types→API→Backend→Frontend
